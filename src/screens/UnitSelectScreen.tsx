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
    <div className="screen-shell">
      <header className="screen-header">
        <h1>{world.name}: Unit Selection</h1>
        <p>Choose a unit to continue your trail.</p>
      </header>

      <section className="card" aria-labelledby="unit-list-heading">
        <h2 id="unit-list-heading">Units</h2>
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

