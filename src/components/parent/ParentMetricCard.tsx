import type { ReactNode } from 'react'

interface ParentMetricCardProps {
  label: string
  value: ReactNode
  note?: string
  children?: ReactNode
}

export function ParentMetricCard({ label, value, note, children }: ParentMetricCardProps) {
  return (
    <article className="parent-metric-card">
      <p className="parent-metric-label">{label}</p>
      <p className="parent-metric-value">{value}</p>
      {note && <p className="parent-metric-note">{note}</p>}
      {children}
    </article>
  )
}
