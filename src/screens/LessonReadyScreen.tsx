import { useState } from 'react'

import { ChildButton } from '../components/ChildButton'
import { ChildMessage } from '../components/ChildMessage'
import type { DemoWorld, DemoUnit } from '../data/demoWorlds'

interface LessonReadyScreenProps {
  world: DemoWorld
  unit: DemoUnit
  activeQuest?: {
    lessonTitle: string
    worldName: string
    unitTitle: string
  } | null
  activeQuestConflict?: boolean
  hasLesson: boolean
  previewQuestionCount?: number
  unavailableMessage?: string
  onBack: () => void
  onResumeCurrentQuest: () => void
  onEndCurrentQuestAndChooseThisUnit: () => void
  onStartQuest: () => void
}

export function LessonReadyScreen({
  world,
  unit,
  activeQuest = null,
  activeQuestConflict = false,
  hasLesson,
  previewQuestionCount = 0,
  unavailableMessage,
  onBack,
  onResumeCurrentQuest,
  onEndCurrentQuestAndChooseThisUnit,
  onStartQuest,
}: LessonReadyScreenProps) {
  const activeQuestSignature = activeQuest
    ? `${activeQuest.lessonTitle}|${activeQuest.worldName}|${activeQuest.unitTitle}`
    : 'none'
  const [dismissedGuardSignature, setDismissedGuardSignature] = useState<string | null>(null)
  const [confirmationSignature, setConfirmationSignature] = useState<string | null>(null)
  const showGuard = activeQuestConflict && dismissedGuardSignature !== activeQuestSignature
  const confirmingEnd = confirmationSignature === activeQuestSignature

  return (
    <div className={`screen-shell child-experience mission-ready world-theme-${world.id}`} data-appearance="dark" data-world={world.id}>
      <header className="screen-header">
        <p className="eyebrow">Mission ready</p>
        <h1>{unit.title}</h1>
        <p>{world.name}</p>
      </header>

      {activeQuestConflict && showGuard && activeQuest && (
        <section className="card active-quest-guard" aria-labelledby="active-quest-guard-heading">
          {!confirmingEnd ? (
            <>
              <p className="quest-kicker">Quest in progress</p>
              <h2 id="active-quest-guard-heading">You already have a quest in progress.</h2>
              <p>
                {activeQuest.lessonTitle} is still open in {activeQuest.worldName}: {activeQuest.unitTitle}.
              </p>
              <p>Resume it, or end the unfinished quest before choosing another adventure.</p>
              <div className="screen-actions">
                <ChildButton type="button" className="primary-action" onClick={onResumeCurrentQuest}>
                  Resume Current Quest
                </ChildButton>
                <ChildButton
                  type="button"
                  className="secondary-action"
                  onClick={() => setConfirmationSignature(activeQuestSignature)}
                >
                  End Current Quest and Choose This Unit
                </ChildButton>
                <ChildButton type="button" onClick={() => setDismissedGuardSignature(activeQuestSignature)}>
                  Stay Here
                </ChildButton>
              </div>
            </>
          ) : (
            <>
              <p className="quest-kicker">Confirm ending quest</p>
              <h2>End this unfinished quest?</h2>
              <p>Your completed quests, XP, stars, and progress will stay safe. Answers from this unfinished quest will be discarded.</p>
              <div className="screen-actions">
                <ChildButton
                  type="button"
                  className="primary-action"
                  onClick={() => {
                    setConfirmationSignature(null)
                    setDismissedGuardSignature(activeQuestSignature)
                    onEndCurrentQuestAndChooseThisUnit()
                  }}
                >
                  End Current Quest
                </ChildButton>
                <ChildButton type="button" onClick={() => setConfirmationSignature(null)}>
                  Cancel
                </ChildButton>
              </div>
            </>
          )}
        </section>
      )}

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
