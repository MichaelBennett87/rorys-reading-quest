interface ParentEmptyStateProps {
  title: string
  message: string
}

export function ParentEmptyState({ title, message }: ParentEmptyStateProps) {
  return (
    <section className="card parent-empty-state" aria-label={title}>
      <h3>{title}</h3>
      <p>{message}</p>
    </section>
  )
}
