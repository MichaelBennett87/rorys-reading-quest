interface ParentStatusBadgeProps {
  tone: 'info' | 'attention' | 'neutral'
  children: string
}

export function ParentStatusBadge({ tone, children }: ParentStatusBadgeProps) {
  return (
    <span className={`parent-status-badge parent-status-badge-${tone}`}>
      {children}
    </span>
  )
}
