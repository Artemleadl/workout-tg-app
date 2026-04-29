import { createClient } from '@supabase/supabase-js'
import type { WorkoutSession, WorkoutSet } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createSession(
  telegramUserId: number,
  workoutNumber: number,
  date: string,
  weekNumber: number | null,
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ telegram_user_id: telegramUserId, workout_number: workoutNumber, date, week_number: weekNumber })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function saveSets(sets: Omit<WorkoutSet, 'id'>[]): Promise<void> {
  if (sets.length === 0) return
  const rows = sets.map((s) => ({
    session_id: s.sessionId,
    exercise_id: s.exerciseId,
    set_number: s.setNumber,
    weight: s.weight,
    reps: s.reps,
    is_warmup: s.isWarmup,
  }))
  const { error } = await supabase.from('workout_sets').insert(rows)
  if (error) throw error
}

export async function getLastSetsForExercise(
  telegramUserId: number,
  exerciseId: string,
): Promise<WorkoutSet[]> {
  const { data: session } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('telegram_user_id', telegramUserId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!session || session.length === 0) return []

  const sessionIds = session.map((s: { id: string }) => s.id)

  const { data, error } = await supabase
    .from('workout_sets')
    .select('*')
    .in('session_id', sessionIds)
    .eq('exercise_id', exerciseId)
    .order('set_number', { ascending: true })
    .limit(10)

  if (error) throw error
  return (data ?? []).map(toWorkoutSet)
}

export async function getProgressData(
  telegramUserId: number,
  exerciseId: string,
): Promise<{ date: string; maxWeight: number; totalVolume: number }[]> {
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, date')
    .eq('telegram_user_id', telegramUserId)
    .order('date', { ascending: true })

  if (!sessions || sessions.length === 0) return []

  const sessionIds = sessions.map((s: { id: string }) => s.id)
  const sessionDateMap = Object.fromEntries(sessions.map((s: { id: string; date: string }) => [s.id, s.date]))

  const { data: sets } = await supabase
    .from('workout_sets')
    .select('session_id, weight, reps')
    .in('session_id', sessionIds)
    .eq('exercise_id', exerciseId)
    .eq('is_warmup', false)
    .not('weight', 'is', null)

  if (!sets || sets.length === 0) return []

  const bySession: Record<string, { weights: number[]; volumes: number[] }> = {}
  for (const s of sets) {
    if (!bySession[s.session_id]) bySession[s.session_id] = { weights: [], volumes: [] }
    if (s.weight != null) {
      bySession[s.session_id].weights.push(s.weight)
      bySession[s.session_id].volumes.push((s.weight ?? 0) * (s.reps ?? 0))
    }
  }

  return Object.entries(bySession).map(([sessionId, d]) => ({
    date: sessionDateMap[sessionId],
    maxWeight: Math.max(...d.weights),
    totalVolume: d.volumes.reduce((a, b) => a + b, 0),
  }))
}

export async function getCompletedWorkoutsForWeek(
  telegramUserId: number,
  weekNumber: number,
): Promise<number[]> {
  const { data } = await supabase
    .from('workout_sessions')
    .select('workout_number')
    .eq('telegram_user_id', telegramUserId)
    .eq('week_number', weekNumber)
  if (!data) return []
  return [...new Set(data.map((r: { workout_number: number }) => r.workout_number))]
}

function toWorkoutSet(row: Record<string, unknown>): WorkoutSet {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    exerciseId: row.exercise_id as string,
    setNumber: row.set_number as number,
    weight: row.weight as number | null,
    reps: row.reps as number | null,
    isWarmup: row.is_warmup as boolean,
  }
}
