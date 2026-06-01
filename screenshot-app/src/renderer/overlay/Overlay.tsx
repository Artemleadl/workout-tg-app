import { useCallback, useEffect, useRef, useState } from 'react'
import type { OverlayPayload, WindowRect } from '@shared/types'
import './overlay.css'

interface Point { x: number; y: number }
interface Rect { left: number; top: number; width: number; height: number }

type Handle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se' | 'move'
type Phase = 'idle' | 'drawing' | 'selected' | 'adjusting'

const HANDLE_CURSORS: Record<Handle, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
  w: 'w-resize', e: 'e-resize',
  sw: 'sw-resize', s: 's-resize', se: 'se-resize',
  move: 'move'
}

const HANDLES: Handle[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']

function rectFromPoints(a: Point, b: Point): Rect {
  return {
    left: Math.min(a.x, b.x),
    top: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y)
  }
}

function applyHandleDelta(base: Rect, handle: Handle, dx: number, dy: number): Rect {
  let { left, top, width, height } = base
  if (handle === 'move') return { left: left + dx, top: top + dy, width, height }
  if (handle.includes('w')) { left += dx; width -= dx }
  if (handle.includes('e')) { width += dx }
  if (handle.includes('n')) { top += dy; height -= dy }
  if (handle.includes('s')) { height += dy }
  if (width < 0) { left += width; width = -width }
  if (height < 0) { top += height; height = -height }
  return { left, top, width, height }
}

function findWindowUnder(windows: WindowRect[], x: number, y: number): WindowRect | null {
  // CGWindowList is front-to-back order; first match = topmost window
  return windows.find(w => x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) ?? null
}

export function Overlay(): React.ReactElement {
  const [payload, setPayload] = useState<OverlayPayload | null>(null)
  const [windows, setWindows] = useState<WindowRect[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [rect, setRect] = useState<Rect | null>(null)
  const [hoveredWin, setHoveredWin] = useState<WindowRect | null>(null)

  const phaseRef = useRef<Phase>('idle')
  const rectRef = useRef<Rect | null>(null)
  const windowsRef = useRef<WindowRect[]>([])
  const dragStartRef = useRef<Point | null>(null)
  const dragHandleRef = useRef<Handle | null>(null)
  const rectAtDragRef = useRef<Rect | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  phaseRef.current = phase
  rectRef.current = rect
  windowsRef.current = windows

  useEffect(() => {
    document.body.classList.add('overlay')
    void window.api.requestOverlayData().then((p) => { if (p) setPayload(p) })
    // Pull window list from main (resolves when osascript completes)
    void window.api.getWindowList().then((wins) => {
      console.log('[overlay] received window list:', wins.length, wins.slice(0, 3))
      setWindows(wins)
    })
    return () => document.body.classList.remove('overlay')
  }, [])

  const cancel = (): void => void window.api.overlayCancel()

  const confirm = useCallback((r: Rect): void => {
    const img = imgRef.current
    if (!img || r.width < 4 || r.height < 4) { cancel(); return }
    const ratio = img.naturalWidth / img.clientWidth
    const sw = Math.round(r.width * ratio)
    const sh = Math.round(r.height * ratio)
    const canvas = document.createElement('canvas')
    canvas.width = sw; canvas.height = sh
    const ctx = canvas.getContext('2d')
    if (!ctx) { cancel(); return }
    ctx.drawImage(img, Math.round(r.left * ratio), Math.round(r.top * ratio), sw, sh, 0, 0, sw, sh)
    void window.api.overlaySelect({ imageDataUrl: canvas.toDataURL('image/png'), width: sw, height: sh })
  }, [])

  // Global mouse move / up
  useEffect(() => {
    const onMove = (e: MouseEvent): void => {
      const p = phaseRef.current
      const cur = { x: e.clientX, y: e.clientY }

      if (p === 'idle') {
        // Hover: find window under cursor
        const w = findWindowUnder(windowsRef.current, cur.x, cur.y)
        setHoveredWin(w)
        return
      }

      if (p !== 'drawing' && p !== 'adjusting') return
      const start = dragStartRef.current
      if (!start) return
      const dx = cur.x - start.x
      const dy = cur.y - start.y

      if (p === 'drawing') {
        setRect(rectFromPoints(start, cur))
      } else {
        const base = rectAtDragRef.current
        const handle = dragHandleRef.current
        if (!base || !handle) return
        setRect(applyHandleDelta(base, handle, dx, dy))
      }
    }

    const onUp = (): void => {
      const p = phaseRef.current
      if (p === 'drawing' || p === 'adjusting') setPhase('selected')
      dragStartRef.current = null
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        if (phaseRef.current === 'selected' || phaseRef.current === 'adjusting') {
          setPhase('idle'); setRect(null)
        } else {
          cancel()
        }
      }
      if (e.key === 'Enter' && phaseRef.current === 'selected' && rectRef.current) {
        confirm(rectRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const startDraw = (e: React.MouseEvent): void => {
    setHoveredWin(null)
    const p = { x: e.clientX, y: e.clientY }
    dragStartRef.current = p
    dragHandleRef.current = null
    setPhase('drawing')
    setRect(rectFromPoints(p, p))
  }

  const snapToWindow = (e: React.MouseEvent, w: WindowRect): void => {
    e.stopPropagation()
    setHoveredWin(null)
    setRect({ left: w.x, top: w.y, width: w.w, height: w.h })
    setPhase('selected')
  }

  const startAdjust = (e: React.MouseEvent, handle: Handle): void => {
    e.stopPropagation()
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    dragHandleRef.current = handle
    rectAtDragRef.current = rect
    setPhase('adjusting')
  }

  if (!payload) return <div className="overlay-loading" />

  const isAdjustable = phase === 'selected' || phase === 'adjusting'

  return (
    <div
      className={rect ? 'overlay-root has-selection' : 'overlay-root'}
      onMouseDown={startDraw}
    >
      <img ref={imgRef} className="overlay-image" src={payload.imageDataUrl} draggable={false} />

      {/* Window highlight shown on hover (idle phase only) */}
      {phase === 'idle' && hoveredWin && (
        <div
          className="window-highlight"
          style={{ left: hoveredWin.x, top: hoveredWin.y, width: hoveredWin.w, height: hoveredWin.h }}
          onMouseDown={(e) => snapToWindow(e, hoveredWin)}
        >
          <div className="window-highlight-label">{hoveredWin.name}</div>
        </div>
      )}

      {!rect && !hoveredWin && <div className="overlay-hint">Click a window · drag to select · Esc to cancel</div>}
      {!rect && hoveredWin && <div className="overlay-hint">Click to capture · drag to select region</div>}

      {rect && (
        <div
          className={isAdjustable ? 'overlay-selection adjustable' : 'overlay-selection'}
          style={{
            left: rect.left, top: rect.top,
            width: rect.width, height: rect.height,
            cursor: isAdjustable ? 'move' : 'crosshair'
          }}
          onMouseDown={isAdjustable ? (e) => startAdjust(e, 'move') : undefined}
          onDoubleClick={isAdjustable ? () => confirm(rect) : undefined}
        >
          <div className="overlay-size">
            {Math.round(rect.width)} × {Math.round(rect.height)}
          </div>
          {isAdjustable && (
            <>
              <div className="overlay-confirm-hint">Enter or double-click · drag to resize</div>
              {HANDLES.map((h) => (
                <div
                  key={h}
                  className={`resize-handle resize-${h}`}
                  style={{ cursor: HANDLE_CURSORS[h] }}
                  onMouseDown={(e) => startAdjust(e, h)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
