import { ChildButton } from './ChildButton'
import type { DemoWorld } from '../data/demoWorlds'

interface WorldCardProps {
  world: DemoWorld
  onOpenWorld: (worldId: string) => void
}

const worldStatusText: Record<DemoWorld['status'], string> = {
  available: 'Available',
  locked: 'Locked',
  'coming-later': 'Coming Later',
}

export function WorldCard({ world, onOpenWorld }: WorldCardProps) {
  const isAvailable = world.status === 'available'

  return (
    <article className={`world-card world-theme-${world.id}`} data-world={world.id}>
      <ChildButton
        type="button"
        className={`world-card-inner world-${world.status}`}
        onClick={() => {
          if (isAvailable) {
            onOpenWorld(world.id)
          }
        }}
        aria-label={`${world.name} world - ${worldStatusText[world.status]}`}
        disabled={!isAvailable}
      >
        <div className="world-card-header">
          <span className="world-icon" aria-hidden="true">
            {world.iconLabel}
          </span>
          <h3>{world.name}</h3>
          <span className={`status-chip status-${world.status.replace('-', '-')}`}>
            {worldStatusText[world.status]}
          </span>
        </div>
        <p>{world.description}</p>
        <p className="small-copy">Progress: {world.progressionLabel}</p>
      </ChildButton>
    </article>
  )
}
