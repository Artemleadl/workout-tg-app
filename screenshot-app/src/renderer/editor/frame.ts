// Composes the "beautiful screenshot" frame: a background, padding, rounded
// corners and a drop shadow around the captured image + its annotations.

import { drawAnnotation, type Annotation } from './annotations'

export type Background =
  | { type: 'none' }
  | { type: 'solid'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }
  | { type: 'pattern'; color: string; emoji: string; opacity: number; size: number; spacing: number }

export interface Frame {
  padding: number
  radius: number
  background: Background
}

export const DEFAULT_FRAME: Frame = {
  padding: 0,
  radius: 0,
  background: { type: 'none' }
}

export function frameSize(
  imageW: number,
  imageH: number,
  frame: Frame
): { w: number; h: number; pad: number } {
  const pad = Math.round(frame.padding)
  return { w: imageW + pad * 2, h: imageH + pad * 2, pad }
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

// Seeded LCG RNG — stable pattern across redraws for the same dimensions
function seededRand(seed: number): () => number {
  let s = (seed ^ 0xdeadbeef) >>> 0
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1)
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61)
    return ((s ^ (s >>> 14)) >>> 0) / 0x100000000
  }
}

// Random non-overlapping placement — returns [x, y] pairs
function samplePattern(w: number, h: number, size: number, minDist: number): [number, number][] {
  const rand = seededRand(w * 19 + h * 31)
  const margin = size * 0.6
  const placed: [number, number][] = []
  // Attempt to place up to N candidates; area-based count keeps density consistent
  const candidates = Math.round((w * h) / (minDist * minDist * 1.4))
  for (let i = 0; i < candidates; i++) {
    let ok = false
    for (let t = 0; t < 30; t++) {
      const x = margin + rand() * (w - margin * 2)
      const y = margin + rand() * (h - margin * 2)
      if (placed.every(([px, py]) => Math.hypot(px - x, py - y) >= minDist)) {
        placed.push([x, y])
        ok = true
        break
      }
    }
    if (!ok && placed.length > 2) break // canvas is saturated, stop early
  }
  return placed
}

function paintBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: Background
): void {
  if (bg.type === 'none') return

  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color
    ctx.fillRect(0, 0, w, h)
    return
  }

  if (bg.type === 'gradient') {
    const rad = (bg.angle * Math.PI) / 180
    const cx = w / 2
    const cy = h / 2
    const len = (Math.abs(Math.cos(rad)) * w + Math.abs(Math.sin(rad)) * h) / 2
    const dx = Math.cos(rad) * len
    const dy = Math.sin(rad) * len
    const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy)
    grad.addColorStop(0, bg.from)
    grad.addColorStop(1, bg.to)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    return
  }

  if (bg.type === 'pattern') {
    // 1. Solid base
    ctx.fillStyle = bg.color
    ctx.fillRect(0, 0, w, h)

    // 2. Emoji scatter
    const positions = samplePattern(w, h, bg.size, bg.spacing)
    const rand = seededRand(w * 73856093 ^ h * 19349663)

    ctx.save()
    ctx.globalAlpha = bg.opacity
    ctx.font = `${bg.size}px serif`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    for (const [px, py] of positions) {
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate((rand() - 0.5) * Math.PI * 0.6)
      ctx.fillText(bg.emoji, 0, 0)
      ctx.restore()
    }
    ctx.restore()

    // 3. Radial vignette: transparent at centre → dark at corners
    const cx = w / 2
    const cy = h / 2
    const outerR = Math.sqrt(cx * cx + cy * cy)
    const vignette = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR)
    vignette.addColorStop(0,   'rgba(0,0,0,0)')
    vignette.addColorStop(0.45,'rgba(0,0,0,0)')
    vignette.addColorStop(1,   'rgba(0,0,0,0.52)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, w, h)
  }
}

// Draw the full framed image (no selection handles) into a context whose
// canvas is already sized to frameSize(). Coordinates inside the rounded
// area match the base image's pixel space.
export function composeFrame(
  ctx: CanvasRenderingContext2D,
  base: HTMLImageElement,
  annotations: Annotation[],
  draft: Annotation | null,
  frame: Frame,
  imageW: number,
  imageH: number
): void {
  const { w, h, pad } = frameSize(imageW, imageH, frame)
  ctx.clearRect(0, 0, w, h)
  paintBackground(ctx, w, h, frame.background)

  ctx.save()
  ctx.translate(pad, pad)
  const r = frame.radius

  // Drop shadow only reads well when there is padding to show it against.
  if (pad > 0) {
    ctx.save()
    roundedRectPath(ctx, 0, 0, imageW, imageH, r)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = Math.min(50, pad * 1.1)
    ctx.shadowOffsetY = Math.min(24, pad * 0.5)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.restore()
  }

  ctx.save()
  roundedRectPath(ctx, 0, 0, imageW, imageH, r)
  ctx.clip()
  ctx.drawImage(base, 0, 0)
  for (const a of annotations) drawAnnotation(ctx, a, base)
  if (draft) drawAnnotation(ctx, draft, base)
  ctx.restore()

  ctx.restore()
}
