export interface Exercise {
  id: string
  name: string
  sets: number
  repsRange: string
  isWarmup?: boolean
  isAccessory?: boolean
}

export interface WorkoutDay {
  number: 1 | 2 | 3
  title: string
  exercises: Exercise[]
}

export interface SetEntry {
  setNumber: number
  weight: number | null
  reps: number | null
  isWarmup: boolean
}

export interface ExerciseLog {
  exerciseId: string
  sets: SetEntry[]
}

export interface WorkoutSession {
  id: string
  telegramUserId: number
  workoutNumber: number
  date: string
  weekNumber: number | null
  createdAt: string
}

export interface WorkoutSet {
  id: string
  sessionId: string
  exerciseId: string
  setNumber: number
  weight: number | null
  reps: number | null
  isWarmup: boolean
}

export interface LastSetData {
  weight: number | null
  reps: number | null
}
