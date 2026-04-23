import { useEffect, useState } from 'react'
import type { Exercise } from '../types'

interface Props {
  exercise: Exercise | null
  onClose: () => void
}

export function ExerciseModal({ exercise, onClose }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    setImgLoaded(false)
    if (!exercise) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [exercise, onClose])

  if (!exercise) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
        background: 'var(--tg-theme-bg-color, #fff)',
        borderRadius: '20px 20px 0 0',
        padding: '12px 20px 32px',
        maxHeight: '80vh',
        overflowY: 'auto',
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--tg-theme-hint-color, #ccc)', margin: '0 auto 16px' }} />

        {/* Title */}
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--tg-theme-text-color, #000)' }}>
          {exercise.name}
        </h3>

        {/* Image */}
        {exercise.imageUrl && (
          <div style={{
            borderRadius: 14, overflow: 'hidden',
            background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
            marginBottom: 16, minHeight: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!imgLoaded && (
              <p style={{ color: 'var(--tg-theme-hint-color, #999)', fontSize: 14 }}>Загрузка...</p>
            )}
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              onLoad={() => setImgLoaded(true)}
              style={{
                width: '100%', maxHeight: 300, objectFit: 'contain',
                display: imgLoaded ? 'block' : 'none',
              }}
            />
          </div>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <Chip label={`${exercise.sets} подхода`} />
          <Chip label={`${exercise.repsRange} повт`} />
          {exercise.isWarmup && <Chip label="Разминка" color="#ff9500" />}
          {exercise.isAccessory && <Chip label="Подсобка" color="#5856d6" />}
          {!exercise.isWarmup && !exercise.isAccessory && <Chip label="Основное" color="#34c759" />}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: 'var(--tg-theme-button-color, #2481cc)',
            color: 'var(--tg-theme-button-text-color, #fff)',
            fontWeight: 600, fontSize: 16, cursor: 'pointer',
          }}
        >
          Понятно
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  )
}

function Chip({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      background: color ? `${color}20` : 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
      color: color ?? 'var(--tg-theme-text-color, #000)',
    }}>
      {label}
    </span>
  )
}
