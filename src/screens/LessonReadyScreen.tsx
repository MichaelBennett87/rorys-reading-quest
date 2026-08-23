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
    <div className={`screen-shell child-experience mission-ready world-theme-${world.id}`} data-world={world.id}>
      <header className="screen-header">
        <p className="eyebrow">Mission ready</p>
        <h1>{unit.title}</h1>
        <p>{world.name}</p>
      </header>

      <section className="card mission-card">
        <span className="mission-badge" aria-hidden="true">🧭</span>
        <h2>Lesson Preview</h2>
        <p>You will practice {unit.practiceFocus} in this quest.</p>
        <p className="sr-only">Questions: {previewQuestionCount} in this play session.</p>
        <p className="sr-only">Potential reward: up to 3 stars.</p>
        <div className="mission-stats" aria-label="Quest details">
          <p><strong>{previewQuestionCount}</strong><span>questions</span></p>
          <p><strong>3</strong><span>stars available</span></p>
        </div>
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
