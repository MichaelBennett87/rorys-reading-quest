import { ChildButton } from './ChildButton'
import { ProgressMeter } from './ProgressMeter'
import type { DemoUnit } from '../data/demoWorlds'

interface UnitCardProps {
  unit: DemoUnit
  onSelect: (unitId: string) => void
}

const unitStatusText: Record<DemoUnit['state'], string> = {
  available: 'Available',
  complete: 'Complete',
  locked: 'Locked',
  review: 'Review',
}

export function UnitCard({ unit, onSelect }: UnitCardProps) {
  const isSelectable = unit.state !== 'locked'

  return (
    <article className={`unit-card unit-state-${unit.state}`} data-unit-state={unit.state}>
      <ChildButton
        type="button"
        className={`unit-card-inner unit-${unit.state}`}
        onClick={() => {
          if (isSelectable) {
            onSelect(unit.id)
          }
        }}
        aria-label={`${unit.title} ${unitStatusText[unit.state]}`}
        disabled={!isSelectable}
      >
        <div className="unit-title-row">
          <h3>{unit.title}</h3>
          <span className={`status-chip status-${unit.state}`}>
            {unitStatusText[unit.state]}
          </span>
        </div>
        <p>{unit.difficultyLabel}</p>
        <p className="unit-practice-focus">{unit.practiceFocus}</p>
        <ProgressMeter label="Stars and progress" value={unit.progressPercent} />
        <div className="unit-meta">
          <span aria-label={`${unit.stars} stars earned`}>{'🌟'.repeat(unit.stars) || 'No stars yet'}</span>
        </div>
      </ChildButton>
    </article>
  )
}
