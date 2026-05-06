import { useEffect, useRef, useState } from 'react'
import { Home } from './pages/Home'
import { Workout } from './pages/Workout'
import { Progress } from './pages/Progress'
import { tg } from './lib/tg'

type Page =
  | { name: 'home' }
  | { name: 'workout'; workoutNumber: 1 | 2 | 3; weekNumber: number }
  | { name: 'progress' }
  | { name: 'done' }

const EMOJIS = ['🏋️', '💪', '🔥', '🏆', '⚡', '🥊', '🎯', '💥', '🏅', '🤸', '🧗', '🦾', '💦', '🎽', '👊']

interface Particle {
  id: number
  emoji: string
  x: number       // % от ширины
  delay: number   // ms
  duration: number // ms
  size: number    // px
  rotation: number
  swing: number   // амплитуда покачивания
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    x: Math.random() * 100,
    delay: Math.random() * 2000,
    duration: 2200 + Math.random() * 1800,
    size: 20 + Math.floor(Math.random() * 24),
    rotation: (Math.random() - 0.5) * 720,
    swing: (Math.random() - 0.5) * 60,
  }))
}

function EmojiRain() {
  const [particles] = useState(() => makeParticles(30))
  const styleRef = useRef<HTMLStyleElement | null>(null)

  useEffect(() => {
    // Инжектим keyframes один раз
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fall {
        0%   { transform: translateY(-60px) rotate(0deg); opacity: 1; }
        80%  { opacity: 1; }
        100% { transform: translateY(110vh) rotate(var(--rot)) translateX(var(--swing)); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    styleRef.current = style
    return () => { style.remove() }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 999,
    }}>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.x}%`,
            fontSize: p.size,
            lineHeight: 1,
            animation: `fall ${p.duration}ms ease-in ${p.delay}ms forwards`,
            // CSS-переменные для keyframes
            ['--rot' as string]: `${p.rotation}deg`,
            ['--swing' as string]: `${p.swing}px`,
            willChange: 'transform',
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}

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
      <>
        <EmojiRain />
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'none' }}>🏆</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Тренировка сохранена!</h2>
          <p style={{ fontSize: 15, color: 'var(--tg-theme-hint-color, #999)', marginBottom: 36 }}>
            Отличная работа. Прогресс записан 💪
          </p>
          <button
            onClick={() => setPage({ name: 'home' })}
            style={{
              padding: '14px 40px', borderRadius: 14, border: 'none',
              background: 'var(--tg-theme-button-color, #2481cc)',
              color: 'var(--tg-theme-button-text-color, #fff)',
              fontWeight: 700, fontSize: 17, cursor: 'pointer',
            }}
          >
            На главную
          </button>
        </div>
      </>
    )
  }

  return null
}
