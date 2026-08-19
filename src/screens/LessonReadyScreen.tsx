import { ChildButton } from '../components/ChildButton'
import { ChildMessage } from '../components/ChildMessage'
import type { DemoWorld, DemoUnit } from '../data/demoWorlds'

interface LessonReadyScreenProps {
  world: DemoWorld
  unit: DemoUnit
  hasLesson: boolean
  previewQuestionCount?: number
  unavailableMessage?: string
  onBack: () => void
  onStartQuest: () => void
}

export function LessonReadyScreen({
  world,
  unit,
  hasLesson,
  previewQuestionCount = 0,
  unavailableMessage,
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
        <p>Questions: {previewQuestionCount} in this play session.</p>
        <p>Potential reward: up to 3 stars.</p>
        <p>Atlas message: Today we’re hunting for clues that help build careful reading habits.</p>
      </section>

      <ChildMessage category="READY" />

      {hasLesson ? (
        <ChildButton type="button" className="primary-action" onClick={onStartQuest}>
          Start Quest
        </ChildButton>
      ) : (
        <section className="card placeholder-message" aria-live="polite">
          <p>This quest is not available yet.</p>
          <p>{unavailableMessage || 'No stable lesson content is attached to this unit.'}</p>
        </section>
      )}

      <section className="screen-actions">
        <ChildButton type="button" onClick={onBack}>
          Back
        </ChildButton>
      </section>
    </div>
  )
}
