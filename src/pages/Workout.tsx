import { useEffect, useRef, useState } from 'react'
import { WORKOUT_PROGRAM, WEEK_REPS, getTargetReps } from '../data/program'
import { createSession, getExistingSession, getLastSetsForExercise, replaceSets, saveSets } from '../lib/supabase'
import { tg, getTelegramUserId } from '../lib/tg'
import { ExerciseModal } from '../components/ExerciseModal'
import type { Exercise, SetEntry } from '../types'

interface Props {
  workoutNumber: 1 | 2 | 3
  weekNumber: number
  onBack: () => void
  onDone: () => void
}

type ExerciseLogs = Record<string, SetEntry[]>

function makeDefaultSets(exercise: Exercise): SetEntry[] {
  return Array.from({ length: exercise.sets }, (_, i) => ({
    setNumber: i + 1,
    weight: null,
    reps: null,
    isWarmup: exercise.isWarmup ?? false,
  }))
}

function getRepsStatus(reps: number | null, target: [number, number] | null): 'idle' | 'hit' | 'low' | 'high' {
  if (reps == null || target == null) return 'idle'
  if (reps >= target[0] && reps <= target[1]) return 'hit'
  if (reps < target[0]) return 'low'
  return 'high'
}

const STATUS_COLORS = {
  idle:  { border: 'var(--tg-theme-secondary-bg-color, #e0e0e0)', bg: 'var(--tg-theme-bg-color, #fff)' },
  hit:   { border: '#34c759', bg: 'rgba(52,199,89,0.08)' },
  low:   { border: '#ff9500', bg: 'rgba(255,149,0,0.08)' },
  high:  { border: '#ff3b30', bg: 'rgba(255,59,48,0.08)' },
}

export function Workout({ workoutNumber, weekNumber, onBack, onDone }: Props) {
  const day = WORKOUT_PROGRAM.find((d) => d.number === workoutNumber)!
  const userId = getTelegramUserId()
  const weekReps = WEEK_REPS[weekNumber]

  const [logs, setLogs] = useState<ExerciseLogs>(() =>
    Object.fromEntries(day.exercises.map((e) => [e.id, makeDefaultSets(e)])),
  )
  const [doneSets, setDoneSets] = useState<Record<string, boolean[]>>(() =>
    Object.fromEntries(day.exercises.map((e) => [e.id, Array(e.sets).fill(false)])),
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(day.exercises[0]?.id ?? null)
  const [modalExercise, setModalExercise] = useState<Exercise | null>(null)

  const saveRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!userId) return

    // Сначала проверяем: есть ли уже выполненная сессия за эту неделю?
    getExistingSession(userId, workoutNumber, weekNumber)
      .then((existing) => {
        if (existing) {
          // Тренировка уже выполнена — грузим ВСЕ данные и блокируем форму
          setExistingSessionId(existing.sessionId)
          setLogs((prev) => {
            const next = { ...prev }
            for (const exercise of day.exercises) {
              const exerciseSets = existing.sets.filter((s) => s.exerciseId === exercise.id)
              if (exerciseSets.length === 0) continue
              next[exercise.id] = prev[exercise.id].map((s) => {
                const match = exerciseSets.find((p) => p.setNumber === s.setNumber)
                return match ? { ...s, weight: match.weight, reps: match.reps } : s
              })
            }
            return next
          })
          setSaved(true)
          if (tg) {
            tg.MainButton.text = '✓ Тренировка выполнена'
            tg.MainButton.disable()
          }
        } else {
          // Тренировка не выполнена — подгружаем только вес из предыдущей сессии
          for (const exercise of day.exercises) {
            getLastSetsForExercise(userId, exercise.id)
              .then((prevSets) => {
                if (prevSets.length === 0) return
                setLogs((prev) => {
                  const current = prev[exercise.id]
                  const updated = current.map((s) => {
                    const match = prevSets.find((p) => p.setNumber === s.setNumber)
                    if (!match) return s
                    return { ...s, weight: s.weight ?? match.weight }
                  })
                  return { ...prev, [exercise.id]: updated }
                })
              })
              .catch((err) => console.error('prefill error:', exercise.id, err))
          }
        }
      })
      .catch((err) => console.error('existing session error:', err))
  }, [day.exercises, userId, workoutNumber, weekNumber])

  async function doSave() {
    setSaving(true)
    tg?.MainButton.showProgress()
    try {
      const allSets = Object.entries(logs).flatMap(([exerciseId, sets]) =>
        sets
          .filter((s) => s.weight != null || s.reps != null)
          .map((s) => ({
            sessionId: '', // заполним ниже
            exerciseId,
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            isWarmup: s.isWarmup,
          })),
      )

      if (existingSessionId) {
        // Пересохранение: удаляем старые подходы, вставляем новые в ту же сессию
        const setsWithSession = allSets.map((s) => ({ ...s, sessionId: existingSessionId }))
        await replaceSets(existingSessionId, setsWithSession)
      } else {
        // Первое сохранение: создаём новую сессию
        const today = new Date().toISOString().split('T')[0]
        const session = await createSession(userId, workoutNumber, today, weekNumber)
        setExistingSessionId(session.id)
        const setsWithSession = allSets.map((s) => ({ ...s, sessionId: session.id }))
        await saveSets(setsWithSession)
      }

      tg?.HapticFeedback.notificationOccurred('success')
      setSaved(true)
      if (tg) {
        tg.MainButton.text = '✓ Тренировка сохранена'
        tg.MainButton.disable()
      }
      onDone()
    } catch (err) {
      console.error(err)
      tg?.HapticFeedback.notificationOccurred('error')
      alert('Ошибка сохранения. Проверь соединение.')
    } finally {
      setSaving(false)
      tg?.MainButton.hideProgress()
    }
  }

  async function handleSave() {
    if (tg) {
      tg.showConfirm('Сохранить тренировку?', (confirmed: boolean) => {
        if (confirmed) doSave()
      })
    } else {
      if (!window.confirm('Сохранить тренировку?')) return
      await doSave()
    }
  }

  function handleEdit() {
    setSaved(false)
    tg?.HapticFeedback.impactOccurred('medium')
    if (tg) {
      tg.MainButton.text = 'Сохранить тренировку'
      tg.MainButton.enable()
    }
  }

  saveRef.current = handleSave

  useEffect(() => {
    tg?.BackButton.show()
    tg?.BackButton.onClick(onBack)
    if (tg) tg.MainButton.text = 'Сохранить тренировку'
    tg?.MainButton.show()
    const fn = () => saveRef.current()
    tg?.MainButton.onClick(fn)
    return () => {
      tg?.BackButton.hide()
      tg?.BackButton.offClick(onBack)
      tg?.MainButton.hide()
      tg?.MainButton.offClick(fn)
    }
  }, [onBack])

  function toggleDoneSet(exerciseId: string, setIndex: number) {
    tg?.HapticFeedback.impactOccurred('light')
    setDoneSets((prev) => {
      const arr = [...prev[exerciseId]]
      arr[setIndex] = !arr[setIndex]
      return { ...prev, [exerciseId]: arr }
    })
  }

  function updateSet(exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) {
    const num = value === '' ? null : parseFloat(value)
    setLogs((prev) => {
      const sets = [...prev[exerciseId]]
      sets[setIndex] = { ...sets[setIndex], [field]: num }
      return { ...prev, [exerciseId]: sets }
    })
  }

  return (
    <div style={{ padding: '16px', maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{day.title}</h2>
        <p style={{ fontSize: 13, color: 'var(--tg-theme-hint-color, #999)', marginTop: 2 }}>
          Неделя {weekNumber} · {new Date().toLocaleDateString('ru-RU')}
        </p>
      </div>

      {/* Week plan banner */}
      <div style={{
        marginBottom: 20, padding: '10px 14px', borderRadius: 12,
        background: 'rgba(36,129,204,0.1)', border: '1px solid rgba(36,129,204,0.25)',
        display: 'flex', gap: 16,
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #999)', marginBottom: 2 }}>ОСНОВНЫЕ</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--tg-theme-button-color, #2481cc)' }}>
            {weekReps.main[0]}–{weekReps.main[1]} повт
          </p>
        </div>
        <div style={{ width: 1, background: 'rgba(36,129,204,0.2)' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #999)', marginBottom: 2 }}>ПОДСОБКА</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--tg-theme-button-color, #2481cc)' }}>
            {weekReps.accessory[0]}–{weekReps.accessory[1]} повт
          </p>
        </div>
        <div style={{ width: 1, background: 'rgba(36,129,204,0.2)' }} />
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #999)', marginBottom: 2 }}>ЗАПАС</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--tg-theme-button-color, #2481cc)' }}>
            {weekReps.rir}
          </p>
        </div>
      </div>

      {/* Section labels */}
      {['warmup', 'main', 'accessory'].map((section) => {
        const sectionExercises = day.exercises.filter((e) => {
          if (section === 'warmup') return e.isWarmup
          if (section === 'main') return !e.isWarmup && !e.isAccessory
          return e.isAccessory
        })
        if (sectionExercises.length === 0) return null

        const label = section === 'warmup' ? '🔥 Разминка' : section === 'main' ? '💪 Основные' : '🎯 Подсобка'

        return (
          <div key={section} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--tg-theme-hint-color, #999)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
              {label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sectionExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  sets={logs[exercise.id]}
                  doneSets={doneSets[exercise.id]}
                  weekNumber={weekNumber}
                  expanded={expandedId === exercise.id}
                  disabled={saved}
                  onToggle={() => setExpandedId((prev) => (prev === exercise.id ? null : exercise.id))}
                  onUpdate={(i, field, val) => updateSet(exercise.id, i, field, val)}
                  onToggleDone={(i) => toggleDoneSet(exercise.id, i)}
                  onInfo={() => {
                    tg?.HapticFeedback.impactOccurred('light')
                    setModalExercise(exercise)
                  }}
                />
              ))}
            </div>
          </div>
        )
      })}

      <ExerciseModal exercise={modalExercise} onClose={() => setModalExercise(null)} />

      {/* Кнопка редактирования (показывается когда тренировка сохранена) */}
      {saved && (
        <button
          onClick={handleEdit}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 14, marginTop: 12,
            border: '1.5px solid var(--tg-theme-button-color, #2481cc)',
            background: 'transparent',
            color: 'var(--tg-theme-button-color, #2481cc)',
            fontWeight: 600, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          ✏️ Редактировать тренировку
        </button>
      )}

      {!tg && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {!saved && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', padding: 14, borderRadius: 14, border: 'none',
                background: 'var(--tg-theme-button-color, #2481cc)',
                color: '#fff', fontWeight: 600, fontSize: 16,
                cursor: saving ? 'default' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Сохраняю...' : 'Сохранить тренировку'}
            </button>
          )}
          {saved && (
            <div style={{
              padding: 14, borderRadius: 14, background: 'rgba(52,199,89,0.1)',
              border: '1.5px solid #34c759', textAlign: 'center',
              fontWeight: 600, fontSize: 16, color: '#34c759',
            }}>
              ✓ Тренировка сохранена
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface CardProps {
  exercise: Exercise
  sets: SetEntry[]
  doneSets: boolean[]
  weekNumber: number
  expanded: boolean
  disabled: boolean
  onToggle: () => void
  onUpdate: (index: number, field: 'weight' | 'reps', value: string) => void
  onToggleDone: (index: number) => void
  onInfo: () => void
}

function ExerciseCard({ exercise, sets, doneSets, weekNumber, expanded, disabled, onToggle, onUpdate, onToggleDone, onInfo }: CardProps) {
  const target = getTargetReps(weekNumber, exercise.isAccessory ?? false, exercise.isWarmup ?? false)
  const filledSets = sets.filter((s) => !s.isWarmup && (s.weight != null || s.reps != null)).length
  const hitSets = sets.filter((s) => !s.isWarmup && getRepsStatus(s.reps, target) === 'hit').length
  const workingSets = sets.filter((s) => !s.isWarmup).length
  const doneCount = doneSets.filter(Boolean).length
  const allDone = doneSets.length > 0 && doneCount === doneSets.length

  const targetLabel = target ? `${target[0]}–${target[1]}` : exercise.repsRange

  return (
    <div style={{
      borderRadius: 14,
      background: allDone ? 'rgba(52,199,89,0.06)' : 'var(--tg-theme-secondary-bg-color, #f8f8f8)',
      border: allDone ? '1.5px solid #34c759' : '1px solid var(--tg-theme-secondary-bg-color, #e8e8e8)',
      overflow: 'hidden',
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '14px 16px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, marginRight: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--tg-theme-text-color, #000)', flex: 1 }}>
              {exercise.name}
            </p>
            {exercise.imageUrl && (
              <button
                onClick={(e) => { e.stopPropagation(); onInfo() }}
                style={{
                  width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: 'rgba(36,129,204,0.15)', color: 'var(--tg-theme-button-color, #2481cc)',
                  fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ?
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
              background: 'rgba(36,129,204,0.12)', color: 'var(--tg-theme-button-color, #2481cc)',
            }}>
              {exercise.sets} × {targetLabel} повт
            </span>
            {filledSets > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: hitSets === workingSets ? '#34c759' : hitSets > 0 ? '#ff9500' : 'var(--tg-theme-hint-color, #999)',
              }}>
                {hitSets === workingSets ? '✓' : `${hitSets}/${workingSets}`} в цель
              </span>
            )}
            {doneCount > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: allDone ? '#34c759' : 'var(--tg-theme-hint-color, #999)',
              }}>
                {allDone ? '✅ выполнено' : `${doneCount}/${doneSets.length} подх.`}
              </span>
            )}
          </div>
        </div>

        <span style={{ fontSize: 18, color: 'var(--tg-theme-hint-color, #999)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▾
        </span>
      </button>

      {/* Sets */}
      {expanded && (
        <div style={{ padding: '0 16px 14px' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #999)', fontWeight: 600 }}>#</span>
            <span style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #999)', fontWeight: 600 }}>Вес (кг)</span>
            <div>
              <span style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #999)', fontWeight: 600 }}>
                Повторы
              </span>
              {target && (
                <span style={{ fontSize: 11, color: 'var(--tg-theme-button-color, #2481cc)', marginLeft: 4 }}>
                  · цель {target[0]}–{target[1]}
                </span>
              )}
            </div>
          </div>

          {sets.map((set, i) => {
            const status = set.isWarmup ? 'idle' : getRepsStatus(set.reps, target)
            const colors = STATUS_COLORS[status]
            const isDoneSet = doneSets[i] ?? false
            return (
              <div
                key={i}
                style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: 8, marginBottom: 8, alignItems: 'center' }}
              >
                <button
                  onClick={() => !disabled && onToggleDone(i)}
                  disabled={disabled}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: isDoneSet ? '#34c759' : set.isWarmup ? '#aaa' : 'var(--tg-theme-button-color, #2481cc)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                    border: 'none', cursor: disabled ? 'default' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {isDoneSet ? '✓' : set.isWarmup ? 'W' : set.setNumber}
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={set.weight ?? ''}
                  onChange={(e) => onUpdate(i, 'weight', e.target.value)}
                  disabled={disabled}
                  style={{ ...baseInputStyle, opacity: disabled ? 0.6 : 1 }}
                />
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder={target ? `${target[0]}–${target[1]}` : '0'}
                    value={set.reps ?? ''}
                    onChange={(e) => onUpdate(i, 'reps', e.target.value)}
                    disabled={disabled}
                    style={{
                      ...baseInputStyle,
                      border: `1.5px solid ${colors.border}`,
                      background: colors.bg,
                      fontWeight: status !== 'idle' ? 700 : 500,
                      color: status === 'hit' ? '#34c759' : status === 'low' ? '#ff9500' : status === 'high' ? '#ff3b30' : 'var(--tg-theme-text-color, #000)',
                      opacity: disabled ? 0.6 : 1,
                    }}
                  />
                  {status === 'hit' && set.reps != null && (
                    <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>✓</span>
                  )}
                  {status === 'low' && set.reps != null && (
                    <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>↑</span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Legend */}
          {target && (
            <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              <LegendItem color="#34c759" label={`${target[0]}–${target[1]} — в цель`} />
              <LegendItem color="#ff9500" label={`< ${target[0]} — добавь повторы`} />
              <LegendItem color="#ff3b30" label={`> ${target[1]} — снизь вес`} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #999)' }}>{label}</span>
    </div>
  )
}

const baseInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1.5px solid var(--tg-theme-secondary-bg-color, #e0e0e0)',
  background: 'var(--tg-theme-bg-color, #fff)',
  color: 'var(--tg-theme-text-color, #000)',
  fontSize: 15,
  fontWeight: 500,
  outline: 'none',
  textAlign: 'center',
  transition: 'border-color 0.15s, background 0.15s',
}
