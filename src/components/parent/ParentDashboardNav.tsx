import type { ParentDashboardView } from '../../screens/parent/parentDashboardView'

interface ParentDashboardNavProps {
  activeView: ParentDashboardView
  onChangeView: (view: ParentDashboardView) => void
}

const views: Array<{ id: ParentDashboardView; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'progress', label: 'Progress' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'word-help', label: 'Word Help' },
  { id: 'assessments', label: 'Assessments' },
]

export function ParentDashboardNav({ activeView, onChangeView }: ParentDashboardNavProps) {
  return (
    <nav className="card parent-dashboard-nav" aria-label="Parent dashboard views">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          className={`parent-dashboard-tab${activeView === view.id ? ' is-active' : ''}`}
          aria-current={activeView === view.id ? 'page' : undefined}
          onClick={() => onChangeView(view.id)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  )
}
