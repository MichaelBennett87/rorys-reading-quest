import { ChildButton } from '../components/ChildButton'
import { ChildMessage } from '../components/ChildMessage'
import { ProgressMeter } from '../components/ProgressMeter'
import type { DemoWorld } from '../data/demoWorlds'

interface WorldScreenProps {
  world: DemoWorld
  onBack: () => void
  onOpenUnitSelect: () => void
}

export function WorldScreen({ world, onBack, onOpenUnitSelect }: WorldScreenProps) {
  return (
    <div className={`screen-shell child-experience world-screen world-theme-${world.id}`} data-world={world.id}>
      <header className="screen-header">
        <p className="eyebrow">World adventure</p>
        <h1>{world.name}</h1>
        <p>{world.description}</p>
      </header>

      <section className="card world-status-card">
        <h2>Adventure status</h2>
        <p>Skills trained: {world.skills.join(', ')}</p>
        <ProgressMeter label={`${world.name} progress`} value={world.currentProgress} />
      </section>

      <section className="card world-units-card" aria-labelledby="world-units-heading">
        <h2 id="world-units-heading">Available Units in this world</h2>
        <ul className="world-unit-list">
          {world.units.length === 0 ? (
            <li>No unit previews yet.</li>
          ) : (
            world.units.map((unit) => <li key={unit.id}>{unit.title}</li>)
          )}
        </ul>
      </section>

      <ChildMessage category="ENCOURAGE" />

      <section className="screen-actions">
        <ChildButton type="button" onClick={onBack}>
          Back to Home
        </ChildButton>
        <ChildButton type="button" className="primary-action" onClick={onOpenUnitSelect}>
          Open Unit Map
        </ChildButton>
      </section>
    </div>
  )
}
