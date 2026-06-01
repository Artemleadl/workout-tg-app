import type { Background, Frame } from './frame'

interface Preset {
  label: string
  bg: Background
  swatch: string       // CSS for the color chip
  emoji?: string       // shown on top of chip for pattern presets
}

const SOLID_PRESETS: Preset[] = [
  { label: 'None', bg: { type: 'none' }, swatch: 'transparent' },
  { label: 'White', bg: { type: 'solid', color: '#ffffff' }, swatch: '#ffffff' },
  { label: 'Graphite', bg: { type: 'solid', color: '#2a2a32' }, swatch: '#2a2a32' },
  {
    label: 'Sunset',
    bg: { type: 'gradient', from: '#ff6a88', to: '#ff99ac', angle: 135 },
    swatch: 'linear-gradient(135deg,#ff6a88,#ff99ac)'
  },
  {
    label: 'Ocean',
    bg: { type: 'gradient', from: '#2193b0', to: '#6dd5ed', angle: 135 },
    swatch: 'linear-gradient(135deg,#2193b0,#6dd5ed)'
  },
  {
    label: 'Violet',
    bg: { type: 'gradient', from: '#7028e4', to: '#e5b2ca', angle: 135 },
    swatch: 'linear-gradient(135deg,#7028e4,#e5b2ca)'
  },
  {
    label: 'Mint',
    bg: { type: 'gradient', from: '#11998e', to: '#38ef7d', angle: 135 },
    swatch: 'linear-gradient(135deg,#11998e,#38ef7d)'
  }
]

const PATTERN_PRESETS: Preset[] = [
  {
    label: 'Money',
    bg: { type: 'pattern', color: '#5b8fc5', emoji: '💰', opacity: 0.18, size: 28, spacing: 52 },
    swatch: '#5b8fc5',
    emoji: '💰'
  },
  {
    label: 'Stars',
    bg: { type: 'pattern', color: '#6c3483', emoji: '⭐', opacity: 0.2, size: 26, spacing: 48 },
    swatch: '#6c3483',
    emoji: '⭐'
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
    label: 'Rocket',
    bg: { type: 'pattern', color: '#1e293b', emoji: '🚀', opacity: 0.2, size: 28, spacing: 52 },
    swatch: '#1e293b',
    emoji: '🚀'
  },
  {
    label: 'Cherry',
    bg: { type: 'pattern', color: '#c2185b', emoji: '🌸', opacity: 0.22, size: 26, spacing: 48 },
    swatch: '#c2185b',
    emoji: '🌸'
  },
  {
    label: 'Ice',
    bg: { type: 'pattern', color: '#1565c0', emoji: '❄️', opacity: 0.2, size: 26, spacing: 48 },
    swatch: '#1565c0',
    emoji: '❄️'
  },
  {
    label: 'Nature',
    bg: { type: 'pattern', color: '#1b5e20', emoji: '🌿', opacity: 0.22, size: 26, spacing: 48 },
    swatch: '#1b5e20',
    emoji: '🌿'
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
      {/* Solid / gradient presets */}
      <div className="toolbar-group">
        <span className="framebar-label">Background</span>
        {SOLID_PRESETS.map((p) => (
          <button
            key={p.label}
            className={sameBg(frame.background, p.bg) ? 'bg-swatch active' : 'bg-swatch'}
            style={{ background: p.swatch }}
            title={p.label}
            onClick={() => setFrame({ ...frame, background: p.bg })}
          >
            {p.bg.type === 'none' && <span className="bg-none">∅</span>}
          </button>
        ))}
      </div>

      {/* Pattern presets */}
      <div className="toolbar-group">
        <span className="framebar-label">Pattern</span>
        {PATTERN_PRESETS.map((p) => (
          <button
            key={p.label}
            className={sameBg(frame.background, p.bg) ? 'bg-swatch active' : 'bg-swatch'}
            style={{ background: p.swatch }}
            title={p.label}
            onClick={() => setFrame({ ...frame, background: p.bg })}
          >
            <span style={{ fontSize: 13, lineHeight: 1 }}>{p.emoji}</span>
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
