import type { DemoWorld } from '../data/demoWorlds'

interface WorldCardProps {
  world: DemoWorld
  isCurrent?: boolean
  isUpNext?: boolean
}

type JourneyWorldStatus = 'current' | 'complete' | 'up-next' | 'locked' | 'coming-later'

const worldStatusText: Record<JourneyWorldStatus, string> = {
  current: 'You are here',
  complete: 'Complete',
  'up-next': 'Up Next',
  locked: 'Locked',
  'coming-later': 'Coming Later',
}

function resolveJourneyStatus(world: DemoWorld, isCurrent: boolean, isUpNext: boolean): JourneyWorldStatus {
  if (isCurrent) return 'current'
  if (world.currentProgress >= 100) return 'complete'
  if (isUpNext) return 'up-next'
  if (world.status === 'coming-later') return 'coming-later'
  return 'locked'
}

export function WorldCard({ world, isCurrent = false, isUpNext = false }: WorldCardProps) {
  const journeyStatus = resolveJourneyStatus(world, isCurrent, isUpNext)
  const statusText = worldStatusText[journeyStatus]

  return (
    <article
      className={`world-card world-theme-${world.id}`}
      data-world={world.id}
      aria-current={isCurrent ? 'step' : undefined}
      aria-label={`${world.name}: ${statusText}`}
    >
      <div className={`world-card-inner world-${journeyStatus} ${isCurrent ? 'world-card-current' : ''}`}>
        <div className="world-card-header">
          <span className="world-icon" aria-hidden="true">
            {world.iconLabel}
          </span>
          <h3>{world.name}</h3>
          <span className={`status-chip status-${journeyStatus}`}>
            {statusText}
          </span>
        </div>
        <p>{world.description}</p>
        <p className="small-copy">{world.progressionLabel}</p>
        <p className="small-copy">Journey progress: {world.currentProgress}%</p>
      </div>
    </article>
  )
}
