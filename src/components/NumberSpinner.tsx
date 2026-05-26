import { useRef } from 'react'

interface Props {
  value: number | null
  onChange: (value: number | null) => void
  step: number
  min?: number
  disabled?: boolean
  placeholder?: string
  borderColor?: string
  bgColor?: string
  textColor?: string
}

export function NumberSpinner({
  value, onChange, step, min = 0, disabled,
  placeholder, borderColor, bgColor, textColor,
}: Props) {
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function apply(delta: number) {
    const cur = value ?? 0
    const next = Math.round((cur + delta) * 100) / 100
    onChange(Math.max(min, next))
  }

  function startHold(delta: number) {
    apply(delta)
    holdRef.current = setInterval(() => apply(delta), 140)
  }

  function stopHold() {
    if (holdRef.current) {
      clearInterval(holdRef.current)
      holdRef.current = null
    }
  }

  const btnColor = disabled
    ? 'var(--tg-theme-hint-color, #bbb)'
    : textColor ?? 'var(--tg-theme-button-color, #2481cc)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      borderRadius: 10,
      border: `1.5px solid ${borderColor ?? 'var(--tg-theme-secondary-bg-color, #e0e0e0)'}`,
      background: bgColor ?? 'var(--tg-theme-bg-color, #fff)',
      height: 44, overflow: 'hidden',
      opacity: disabled ? 0.6 : 1,
      transition: 'border-color 0.15s, background 0.15s',
    }}>
      <button
        onPointerDown={(e) => { e.preventDefault(); if (!disabled) startHold(-step) }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        disabled={disabled}
        style={{
          width: 38, height: '100%', flexShrink: 0,
          background: 'transparent', border: 'none',
          color: btnColor, fontSize: 22, fontWeight: 400,
          cursor: disabled ? 'default' : 'pointer',
          userSelect: 'none', touchAction: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        −
      </button>

      <input
        type="number"
        inputMode="decimal"
        value={value ?? ''}
        placeholder={placeholder ?? '0'}
        onChange={(e) => {
          const v = e.target.value
          onChange(v === '' ? null : parseFloat(v))
        }}
        disabled={disabled}
        style={{
          flex: 1, minWidth: 0,
          border: 'none', background: 'transparent',
          textAlign: 'center', fontSize: 15, fontWeight: 700,
          color: textColor ?? 'var(--tg-theme-text-color, #000)',
          outline: 'none', padding: 0,
        }}
      />

      <button
        onPointerDown={(e) => { e.preventDefault(); if (!disabled) startHold(step) }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        disabled={disabled}
        style={{
          width: 38, height: '100%', flexShrink: 0,
          background: 'transparent', border: 'none',
          color: btnColor, fontSize: 22, fontWeight: 400,
          cursor: disabled ? 'default' : 'pointer',
          userSelect: 'none', touchAction: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        +
      </button>
    </div>
  )
}
