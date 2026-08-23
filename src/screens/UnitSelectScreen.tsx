import { ChildButton } from '../components/ChildButton'
import { UnitCard } from '../components/UnitCard'
import type { DemoWorld } from '../data/demoWorlds'

interface UnitSelectScreenProps {
  world: DemoWorld
  onBack: () => void
  onSelectUnit: (unitId: string) => void
}

export function UnitSelectScreen({ world, onBack, onSelectUnit }: UnitSelectScreenProps) {
  return (
    <div className={`screen-shell child-experience unit-map-screen world-theme-${world.id}`} data-appearance="dark" data-world={world.id}>
      <header className="screen-header">
        <p className="eyebrow">Follow the glowing trail</p>
        <h1>{world.name}: Unit Selection</h1>
        <p>Choose the next stop on your reading journey.</p>
      </header>

      <section className="card adventure-map" aria-labelledby="unit-list-heading">
        <h2 id="unit-list-heading">Quest Trail</h2>
        <div className="unit-grid">
          {world.units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} onSelect={onSelectUnit} />
          ))}
        </div>
      </section>

      <section className="screen-actions">
        <ChildButton type="button" onClick={onBack}>
          Back
        </ChildButton>
      </section>
    </div>
  )
}
