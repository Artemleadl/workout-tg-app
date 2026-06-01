import type { Background, Frame } from './frame'

interface Preset {
  label: string
  bg: Background
  swatch: string
  emoji?: string
}

const PRESETS: Preset[] = [
  {
    label: 'None',
    bg: { type: 'none' },
    swatch: 'transparent'
  },
  {
    label: 'White',
    bg: { type: 'solid', color: '#ffffff' },
    swatch: '#ffffff'
  },
  {
    label: 'Graphite',
    bg: { type: 'pattern', color: '#2a2a32', emoji: '✦', opacity: 0.12, size: 20, spacing: 36 },
    swatch: '#2a2a32',
    emoji: '✦'
  },
  {
    label: 'Sunset',
    bg: { type: 'pattern', color: '#e75480', emoji: '🌸', opacity: 0.2, size: 26, spacing: 48 },
    swatch: 'linear-gradient(135deg,#ff6a88,#ff99ac)',
    emoji: '🌸'
  },
  {
    label: 'Ocean',
    bg: { type: 'pattern', color: '#2193b0', emoji: '🌊', opacity: 0.18, size: 26, spacing: 48 },
    swatch: 'linear-gradient(135deg,#2193b0,#6dd5ed)',
    emoji: '🌊'
  },
  {
    label: 'Violet',
    bg: { type: 'pattern', color: '#6c3483', emoji: '⭐', opacity: 0.2, size: 24, spacing: 44 },
    swatch: 'linear-gradient(135deg,#7028e4,#e5b2ca)',
    emoji: '⭐'
  },
  {
    label: 'Mint',
    bg: { type: 'pattern', color: '#11998e', emoji: '🌿', opacity: 0.2, size: 24, spacing: 44 },
    swatch: 'linear-gradient(135deg,#11998e,#38ef7d)',
    emoji: '🌿'
  },
  {
    label: 'Money',
    bg: { type: 'pattern', color: '#5b8fc5', emoji: '💰', opacity: 0.18, size: 28, spacing: 52 },
    swatch: '#5b8fc5',
    emoji: '💰'
  },
  {
    label: 'Fire',
    bg: { type: 'pattern', color: '#c0392b', emoji: '🔥', opacity: 0.2, size: 28, spacing: 52 },
    swatch: '#c0392b',
    emoji: '🔥'
  },
  {
    label: 'Diamond',
    bg: { type: 'pattern', color: '#1a5276', emoji: '💎', opacity: 0.2, size: 26, spacing: 50 },
    swatch: '#1a5276',
    emoji: '💎'
  },
  {
    label: 'Space',
    bg: { type: 'pattern', color: '#1e293b', emoji: '🚀', opacity: 0.2, size: 28, spacing: 52 },
    swatch: '#1e293b',
    emoji: '🚀'
  },
  {
    label: 'Ice',
    bg: { type: 'pattern', color: '#1565c0', emoji: '❄️', opacity: 0.2, size: 26, spacing: 48 },
    swatch: '#1565c0',
    emoji: '❄️'
  }
]

function sameBg(a: Background, b: Background): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

interface Props {
  frame: Frame
  setFrame: (f: Frame) => void
}

export function FrameBar({ frame, setFrame }: Props): React.ReactElement {
  return (
    <div className="framebar">
      <div className="toolbar-group">
        <span className="framebar-label">Background</span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={sameBg(frame.background, p.bg) ? 'bg-swatch active' : 'bg-swatch'}
            style={{ background: p.swatch }}
            title={p.label}
            onClick={() => setFrame({ ...frame, background: p.bg })}
          >
            {p.bg.type === 'none' && <span className="bg-none">∅</span>}
            {p.emoji && <span style={{ fontSize: 12, lineHeight: 1 }}>{p.emoji}</span>}
          </button>
        ))}
      </div>

      <div className="toolbar-group slider-group">
        <span className="framebar-label">Padding</span>
        <input
          type="range"
          min={0}
          max={200}
          value={frame.padding}
          onChange={(e) => setFrame({ ...frame, padding: Number(e.target.value) })}
        />
        <span className="slider-value">{frame.padding}</span>
      </div>

      <div className="toolbar-group slider-group">
        <span className="framebar-label">Corner radius</span>
        <input
          type="range"
          min={0}
          max={80}
          value={frame.radius}
          onChange={(e) => setFrame({ ...frame, radius: Number(e.target.value) })}
        />
        <span className="slider-value">{frame.radius}</span>
      </div>
    </div>
  )
}
