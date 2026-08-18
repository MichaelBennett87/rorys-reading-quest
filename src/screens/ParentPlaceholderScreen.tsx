import { ChildButton } from '../components/ChildButton'

export function ParentPlaceholderScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen-shell">
      <header className="screen-header">
        <h1>Parent Area</h1>
      </header>
      <section className="card">
        <p>Parent dashboard is not implemented yet.</p>
        <p>
          A PIN gate will be added in a later phase before parent analytics are shown.
        </p>
      </section>
      <section className="screen-actions">
        <ChildButton type="button" onClick={onBack}>
          Back to Quest
        </ChildButton>
      </section>
    </div>
  )
}

