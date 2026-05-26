import type { CSSProperties } from 'react'

function StarIcon({ size, style }: { size: number; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="white"
      style={style}
      aria-hidden
    >
      <path d="M12 2L13.8 9.2L21 12L13.8 14.8L12 22L10.2 14.8L3 12L10.2 9.2L12 2Z" />
    </svg>
  )
}

interface Props {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}

export function SparkleButton({ onClick, children, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="sparkle-btn"
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 999,
        padding: 3,
        background: 'linear-gradient(135deg, rgba(147,197,253,0.5), rgba(139,92,246,0.5))',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'transform 0.15s',
        animation: 'sparkle-btn-pulse 2.5s ease-in-out infinite',
        marginBottom: 20,
      }}
    >
      {/* Inner gradient layer */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 999,
        background: 'linear-gradient(135deg, #93c5fd, #3b82f6 40%, #8b5cf6)',
        padding: '13px 24px',
        color: '#fff',
        overflow: 'hidden',
      }}>
        {/* Main sparkle left of text */}
        <StarIcon
          size={20}
          style={{ animation: 'sparkle 2s ease-in-out infinite', flexShrink: 0, marginTop: -2 }}
        />

        {/* Decorative sparkles */}
        <StarIcon size={8}  style={{ position: 'absolute', bottom: 7,  left: 14, animation: 'sparkle 2s 1s ease-in-out infinite', transform: 'rotate(12deg)'  }} />
        <StarIcon size={4}  style={{ position: 'absolute', top:  7,  left: 20, animation: 'sparkle 2.5s 1.5s ease-in-out infinite', transform: 'rotate(-12deg)' }} />
        <StarIcon size={6}  style={{ position: 'absolute', top:  12, left: 12, animation: 'sparkle 2.5s 0.5s ease-in-out infinite' }} />

        <span style={{ fontWeight: 700, fontSize: 17 }}>{children}</span>
      </div>
    </button>
  )
}
