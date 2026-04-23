import { useEffect, useState } from 'react'
import { Home } from './pages/Home'
import { Workout } from './pages/Workout'
import { Progress } from './pages/Progress'
import { tg } from './lib/tg'

type Page =
  | { name: 'home' }
  | { name: 'workout'; workoutNumber: 1 | 2 | 3; weekNumber: number }
  | { name: 'progress' }
  | { name: 'done' }

export default function App() {
  const [page, setPage] = useState<Page>({ name: 'home' })

  useEffect(() => {
    tg?.ready()
    tg?.expand()
  }, [])

  if (page.name === 'home') {
    return (
      <Home
        onSelectWorkout={(workoutNumber, weekNumber) =>
          setPage({ name: 'workout', workoutNumber, weekNumber })
        }
        onOpenProgress={() => setPage({ name: 'progress' })}
      />
    )
  }

  if (page.name === 'workout') {
    return (
      <Workout
        workoutNumber={page.workoutNumber}
        weekNumber={page.weekNumber}
        onBack={() => setPage({ name: 'home' })}
        onDone={() => setPage({ name: 'done' })}
      />
    )
  }

  if (page.name === 'progress') {
    return <Progress onBack={() => setPage({ name: 'home' })} />
  }

  if (page.name === 'done') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Тренировка сохранена!</h2>
        <p style={{ fontSize: 15, color: 'var(--tg-theme-hint-color, #999)', marginBottom: 32 }}>
          Отличная работа. Прогресс записан.
        </p>
        <button
          onClick={() => setPage({ name: 'home' })}
          style={{
            padding: '14px 32px', borderRadius: 14, border: 'none',
            background: 'var(--tg-theme-button-color, #2481cc)',
            color: 'var(--tg-theme-button-text-color, #fff)',
            fontWeight: 600, fontSize: 16, cursor: 'pointer',
          }}
        >
          На главную
        </button>
      </div>
    )
  }

  return null
}
