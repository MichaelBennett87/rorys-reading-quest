import type { InkStroke } from '../../domain/writingPilot'

export function renderInkToDataUrl(strokes: readonly InkStroke[], width = 1024, height = 480): string | null {
  if (strokes.length === 0 || typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return null
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.strokeStyle = '#111827'
  context.lineCap = 'round'
  context.lineJoin = 'round'
  for (const stroke of strokes) drawInkStroke(context, stroke, width, height)
  return canvas.toDataURL('image/png')
}

export function drawInkStroke(context: CanvasRenderingContext2D, stroke: InkStroke, width: number, height: number) {
  if (stroke.points.length === 0) return
  context.beginPath()
  context.moveTo(stroke.points[0].x * width, stroke.points[0].y * height)
  for (const point of stroke.points.slice(1)) context.lineTo(point.x * width, point.y * height)
  const pressure = stroke.points.reduce((sum, point) => sum + point.pressure, 0) / stroke.points.length
  context.lineWidth = Math.max(2, Math.min(7, 2 + pressure * 4))
  context.stroke()
}
