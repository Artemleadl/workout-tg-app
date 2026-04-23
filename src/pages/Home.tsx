import { useEffect, useState } from 'react'
import { WORKOUT_PROGRAM, WEEK_SCHEME } from '../data/program'
import { getTelegramUserName } from '../lib/tg'

interface Props {
  onSelectWorkout: (workoutNumber: 1 | 2 | 3, weekNumber: number) => void
  onOpenProgress: () => void
}

export function Home({ onSelectWorkout, onOpenProgress }: Props) {
  const [selectedWeek, setSelectedWeek] = useState(1)
  const name = getTelegramUserName()

  const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    const stored = localStorage.getItem('currentWeek')
    if (stored) setSelectedWeek(Number(stored))
  }, [])

  function handleWeekChange(week: number) {
    setSelectedWeek(week)
    localStorage.setItem('currentWeek', String(week))
  }

  const weekInfo = WEEK_SCHEME.find((w) => w.week === selectedWeek)

  return (
    <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--tg-theme-hint-color, #999)', marginBottom: 4 }}>
          {today}
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Привет, {name} 💪</h1>
      </div>

      {/* Week selector */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--tg-theme-hint-color, #999)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          Текущая неделя
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {WEEK_SCHEME.map((w) => (
            <button
              key={w.week}
              onClick={() => handleWeekChange(w.week)}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                background: selectedWeek === w.week
                  ? 'var(--tg-theme-button-color, #2481cc)'
                  : 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
                color: selectedWeek === w.week
                  ? 'var(--tg-theme-button-text-color, #ffffff)'
                  : 'var(--tg-theme-text-color, #000)',
                transition: 'all 0.15s',
              }}
            >
              {w.week}
            </button>
          ))}
        </div>
        {weekInfo && (
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--tg-theme-hint-color, #999)' }}>
            {weekInfo.mainReps} повт · {weekInfo.mainRPE}
          </p>
        )}
      </div>

      {/* Workout cards */}
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--tg-theme-hint-color, #999)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
        Выбери тренировку
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {WORKOUT_PROGRAM.map((day) => {
          const mainExercises = day.exercises.filter((e) => !e.isWarmup && !e.isAccessory)
          return (
            <button
              key={day.number}
              onClick={() => onSelectWorkout(day.number, selectedWeek)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 14,
                border: '1px solid var(--tg-theme-secondary-bg-color, #e8e8e8)',
                background: 'var(--tg-theme-secondary-bg-color, #f8f8f8)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'opacity 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--tg-theme-button-color, #2481cc)',
                  color: 'var(--tg-theme-button-text-color, #fff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15, marginRight: 10, flexShrink: 0,
                }}>
                  {day.number}
                </span>
                <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--tg-theme-text-color, #000)' }}>
                  {day.title}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--tg-theme-hint-color, #888)', lineHeight: 1.5 }}>
                {mainExercises.map((e) => e.name).join(' · ')}
              </div>
            </button>
          )
        })}
      </div>

      {/* Progress button */}
      <button
        onClick={onOpenProgress}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 14,
          border: 'none',
          background: 'var(--tg-theme-button-color, #2481cc)',
          color: 'var(--tg-theme-button-text-color, #fff)',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        📈 Прогресс
      </button>
    </div>
  )
}
