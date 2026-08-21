import { ChildButton } from '../components/ChildButton'
import type { ProgressionOutcomeViewModel } from '../app/useQuestProgress'

interface ProgressionOutcomeScreenProps {
  outcome: ProgressionOutcomeViewModel
  onStartNext: () => void
  onReturnToMap: () => void
}

const copy: Record<string, { title: string; message: string }> = {
  VERIFY_MASTERY: {
    title: 'Almost There!',
    message: 'You found the clues. One fresh quest will prove this reading power is ready.',
  },
  ADVANCE: {
    title: 'Trail Complete!',
    message: 'You unlocked the next trail.',
  },
  RETRY_SAME_DIFFICULTY: {
    title: 'Training Round',
    message: 'You are close. A new quest will help this skill grow stronger.',
  },
  GUIDED_PRACTICE: {
    title: 'Try a New Route',
    message: 'Let’s practice this reading power in a different way.',
  },
  REMEDIATE_PREREQUISITE: {
    title: 'Power-Up Mission',
    message: 'We found a building block to strengthen before returning to this trail.',
  },
  CHECKPOINT: {
    title: 'Clue Practice',
    message: 'A fresh quest will help you show this reading power on your own.',
  },
  FLUENCY_PRACTICE: {
    title: 'Reading Flight Practice Complete!',
    message: 'You practiced modeled reading, phrase groups, rereading, and self-monitoring. The app did not record or score oral reading.',
  },
  CONTENT_NEEDED: {
    title: 'More Quests Are Being Prepared',
    message: 'You completed the available adventures for this trail. Your progress is safe.',
  },
}

export function ProgressionOutcomeScreen({
  outcome,
  onStartNext,
  onReturnToMap,
}: ProgressionOutcomeScreenProps) {
  const message = copy[outcome.kind] ?? copy.CONTENT_NEEDED
  const nextAvailable = outcome.nextQuest.status === 'available'
  const trailLabel = outcome.currentDifficulty <= 0
    ? 'Building Block Trail'
    : `Trail ${outcome.currentDifficulty}`

  return (
    <section className="screen-shell progression-outcome" aria-labelledby="progression-outcome-title">
      <header className="screen-header">
        <h1 id="progression-outcome-title">{message.title}</h1>
        <p>{message.message}</p>
      </header>
      <section className="card reward-summary" aria-label="Quest rewards earned">
        <p><strong>Stars earned:</strong> {outcome.earnedStars}</p>
        <p><strong>XP earned:</strong> {outcome.earnedXp}</p>
        <p><strong>Current trail:</strong> {trailLabel}</p>
      </section>
      <section className="card">
        <h2>Next Quest</h2>
        <p>{nextAvailable
          ? `Atlas found a fresh ${outcome.nextQuest.purpose} quest.`
          : 'Atlas is preparing more fresh adventures for this trail.'}</p>
      </section>
      <section className="screen-actions">
        {nextAvailable && (
          <ChildButton type="button" className="primary-action" onClick={onStartNext}>
            Start Fresh Quest
          </ChildButton>
        )}
        <ChildButton type="button" onClick={onReturnToMap}>Return to Map</ChildButton>
      </section>
    </section>
  )
}
