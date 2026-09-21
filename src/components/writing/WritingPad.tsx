import { useCallback, useEffect, useRef, useState } from 'react'
import type { InkStroke } from '../../domain/writingPilot'
import { drawInkStroke } from './writingInkCanvas'

interface WritingPadProps {
  strokes: readonly InkStroke[]
  onChange: (strokes: InkStroke[]) => void
  disabled?: boolean
}

export function WritingPad({ strokes, onChange, disabled = false }: WritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeStrokeRef = useRef<InkStroke | null>(null)
  const touchFallbackActiveRef = useRef(false)
  const startedAtRef = useRef(0)
  const [mode, setMode] = useState<'draw' | 'erase'>('draw')

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ratio = Math.max(1, window.devicePixelRatio || 1)
    const width = Math.max(1, Math.round(rect.width * ratio))
    const height = Math.max(1, Math.round(rect.height * ratio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    const context = canvas.getContext('2d')
    if (!context) return
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, rect.width, rect.height)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#173b3a'
    for (const stroke of strokes) drawInkStroke(context, stroke, rect.width, rect.height)
    if (activeStrokeRef.current) drawInkStroke(context, activeStrokeRef.current, rect.width, rect.height)
  }, [strokes])

  useEffect(() => {
    redraw()
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(redraw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [redraw])

  const pointerPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return inkPoint(event.clientX, event.clientY, event.pressure || (event.pointerType === 'mouse' ? 0.5 : 0.35), rect, startedAtRef.current)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return
    event.preventDefault()
    if (activeStrokeRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    if (mode === 'erase') {
      const point = pointerPoint(event)
      onChange(strokes.filter((stroke) => !stroke.points.some((candidate) => distance(candidate, point) < 0.035)))
      return
    }
    startedAtRef.current = performance.now()
    activeStrokeRef.current = {
      strokeId: createStrokeId(),
      pointerType: normalizePointerType(event.pointerType),
      points: [pointerPoint(event)],
    }
    redraw()
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    event.preventDefault()
    if (mode === 'erase') {
      const point = pointerPoint(event)
      const next = strokes.filter((stroke) => !stroke.points.some((candidate) => distance(candidate, point) < 0.035))
      if (next.length !== strokes.length) onChange(next)
      return
    }
    const active = activeStrokeRef.current
    if (!active) return
    active.points.push(pointerPoint(event))
    redraw()
  }

  const finishStroke = (event: React.PointerEvent<HTMLCanvasElement>, cancelled = false) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    const active = activeStrokeRef.current
    activeStrokeRef.current = null
    if (!cancelled && active?.points.length) onChange([...strokes, active])
    redraw()
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || activeStrokeRef.current || event.touches.length === 0) return
    event.preventDefault()
    const touch = event.touches[0]
    const rect = event.currentTarget.getBoundingClientRect()
    if (mode === 'erase') {
      const point = inkPoint(touch.clientX, touch.clientY, touchPressure(touch), rect, performance.now())
      onChange(strokes.filter((stroke) => !stroke.points.some((candidate) => distance(candidate, point) < 0.035)))
      return
    }
    touchFallbackActiveRef.current = true
    startedAtRef.current = performance.now()
    activeStrokeRef.current = {
      strokeId: createStrokeId(),
      pointerType: 'touch',
      points: [inkPoint(touch.clientX, touch.clientY, touchPressure(touch), rect, startedAtRef.current)],
    }
    redraw()
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchFallbackActiveRef.current || !activeStrokeRef.current || event.touches.length === 0) return
    event.preventDefault()
    const touch = event.touches[0]
    activeStrokeRef.current.points.push(inkPoint(
      touch.clientX,
      touch.clientY,
      touchPressure(touch),
      event.currentTarget.getBoundingClientRect(),
      startedAtRef.current,
    ))
    redraw()
  }

  const finishTouch = (event: React.TouchEvent<HTMLCanvasElement>, cancelled = false) => {
    if (!touchFallbackActiveRef.current) return
    event.preventDefault()
    const active = activeStrokeRef.current
    touchFallbackActiveRef.current = false
    activeStrokeRef.current = null
    if (!cancelled && active?.points.length) onChange([...strokes, active])
    redraw()
  }

  return (
    <div className="writing-pad-frame">
      <div className="writing-pad-tools" aria-label="Writing tools">
        <button type="button" className={mode === 'draw' ? 'is-active' : ''} onClick={() => setMode('draw')} disabled={disabled}>Write</button>
        <button type="button" className={mode === 'erase' ? 'is-active' : ''} onClick={() => setMode('erase')} disabled={disabled}>Eraser</button>
        <button type="button" onClick={() => onChange(strokes.slice(0, -1))} disabled={disabled || strokes.length === 0}>Undo</button>
        <button type="button" onClick={() => onChange([])} disabled={disabled || strokes.length === 0}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        className="writing-pad-canvas"
        aria-label="Lined writing pad. Use a finger, stylus, or mouse to write one sentence."
        role="img"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishStroke(event)}
        onPointerCancel={(event) => finishStroke(event, true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={(event) => finishTouch(event)}
        onTouchCancel={(event) => finishTouch(event, true)}
      />
    </div>
  )
}

export function InkPreview({ strokes, label = 'Saved handwriting' }: { strokes: readonly InkStroke[]; label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 720
    canvas.height = 240
    const context = canvas.getContext('2d')
    if (!context) return
    context.fillStyle = '#fffdf4'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#173b3a'
    context.lineCap = 'round'
    context.lineJoin = 'round'
    for (const stroke of strokes) drawInkStroke(context, stroke, canvas.width, canvas.height)
  }, [strokes])
  return <canvas ref={canvasRef} className="writing-ink-preview" role="img" aria-label={label} />
}

function normalizePointerType(pointerType: string): InkStroke['pointerType'] {
  return pointerType === 'pen' || pointerType === 'touch' || pointerType === 'mouse' ? pointerType : 'unknown'
}

function createStrokeId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `stroke-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function distance(left: { x: number; y: number }, right: { x: number; y: number }) {
  return Math.hypot(left.x - right.x, left.y - right.y)
}

function inkPoint(clientX: number, clientY: number, pressure: number, rect: DOMRect, startedAt: number) {
  return {
    x: clamp((clientX - rect.left) / Math.max(1, rect.width)),
    y: clamp((clientY - rect.top) / Math.max(1, rect.height)),
    pressure: clamp(pressure),
    elapsedMs: Math.max(0, Math.round(performance.now() - startedAt)),
  }
}

function touchPressure(touch: { clientX: number; force?: number }): number {
  const force = touch.force
  return typeof force === 'number' && force > 0 ? force : 0.35
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}
