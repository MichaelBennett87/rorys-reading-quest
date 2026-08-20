import { ChildButton } from '../ChildButton'

interface ParentDashboardHeaderProps {
  title: string
  subtitle: string
  currentTrail?: string | null
  storageNotice?: string | null
  onLock: () => void
  onBackToQuest: () => void
}

export function ParentDashboardHeader({
  title,
  subtitle,
  currentTrail,
  storageNotice,
  onLock,
  onBackToQuest,
}: ParentDashboardHeaderProps) {
  return (
    <header className="card parent-dashboard-header">
      <div className="parent-dashboard-header-copy">
        <h1 id="parent-dashboard-title" tabIndex={-1}>{title}</h1>
        <p>{subtitle}</p>
        {currentTrail && <p className="parent-dashboard-trail">Current trail: {currentTrail}</p>}
      </div>

      <div className="parent-dashboard-header-actions">
        <ChildButton type="button" className="secondary-action parent-dashboard-action" onClick={onLock}>
          Lock Parent Area
        </ChildButton>
        <ChildButton type="button" className="primary-action parent-dashboard-action" onClick={onBackToQuest}>
          Back to Quest
        </ChildButton>
      </div>

      {storageNotice && <p className="storage-notice parent-dashboard-notice" role="status">{storageNotice}</p>}
    </header>
  )
}
