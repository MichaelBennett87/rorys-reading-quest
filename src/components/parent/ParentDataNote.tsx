interface ParentDataNoteProps {
  title: string
  message: string
}

export function ParentDataNote({ title, message }: ParentDataNoteProps) {
  return (
    <aside className="card parent-data-note" aria-label={title}>
      <h3>{title}</h3>
      <p>{message}</p>
    </aside>
  )
}
