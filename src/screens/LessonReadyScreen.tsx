import { ChildButton } from '../components/ChildButton'
import { ChildMessage } from '../components/ChildMessage'
import type { DemoWorld, DemoUnit } from '../data/demoWorlds'

interface LessonReadyScreenProps {
  world: DemoWorld
  unit: DemoUnit
  lessonPrepared: boolean
  onBack: () => void
  onStartQuest: () => void
}

export function LessonReadyScreen({
  world,
  unit,
  lessonPrepared,
  onBack,
  onStartQuest,
}: LessonReadyScreenProps) {
  return (
    <div className="screen-shell">
      <header className="screen-header">
        <h1>{unit.title}</h1>
        <p>{world.name}</p>
      </header>

      <section className="card">
        <h2>Lesson Preview</h2>
        <p>You will practice {unit.practiceFocus} in this quest.</p>
        <p>Estimated time: 10–15 minutes.</p>
        <p>Potential reward: up to 3 stars.</p>
      </section>

      <ChildMessage category="READY" />

      {lessonPrepared ? (
        <section className="card placeholder-message" aria-live="polite">
          <p>This quest is being prepared.</p>
          <p>The lesson engine arrives in Phase 2.</p>
        </section>
      ) : (
        <ChildButton type="button" className="primary-action" onClick={onStartQuest}>
          Start Quest
        </ChildButton>
      )}

      <section className="screen-actions">
        <ChildButton type="button" onClick={onBack}>
          Back
        </ChildButton>
      </section>
    </div>
  )
}
