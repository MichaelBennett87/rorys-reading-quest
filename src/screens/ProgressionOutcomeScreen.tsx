import { ChildButton } from '../components/ChildButton'
import type { ProgressionOutcomeViewModel } from '../app/useQuestProgress'

interface ProgressionOutcomeScreenProps {
  outcome: ProgressionOutcomeViewModel
  onContinueJourney: () => void
  onBackHome: () => void
}

const copy: Record<string, { title: string; message: string }> = {
  VERIFY_MASTERY: {
    title: 'Almost There!',
    message: 'You found the clues. One more quest will help show this reading power is ready.',
  },
  ADVANCE: {
    title: 'Trail Complete!',
    message: 'You unlocked the next trail.',
  },
  RETRY_SAME_DIFFICULTY: {
    title: 'Training Round',
    message: 'You are close. Another quest will help this skill grow stronger.',
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
    message: 'Your next quest will help you show this reading power on your own.',
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
  onContinueJourney,
  onBackHome,
}: ProgressionOutcomeScreenProps) {
  const message = copy[outcome.kind] ?? copy.CONTENT_NEEDED
  const nextAvailable = outcome.nextQuest.status === 'available'
  const trailLabel = outcome.currentDifficulty <= 0
    ? 'Building Block Trail'
    : `Trail ${outcome.currentDifficulty}`

  return (
    <section className="screen-shell child-experience progression-outcome" data-appearance="dark" aria-labelledby="progression-outcome-title">
      <header className="screen-header">
        <span className="outcome-icon" aria-hidden="true">🏅</span>
        <h1 id="progression-outcome-title">{message.title}</h1>
        <p>{message.message}</p>
      </header>
      <section className="card reward-summary reward-stat-grid" aria-label="Quest rewards earned">
        <p><span aria-hidden="true">⭐</span><strong>{outcome.earnedStars}</strong><span>stars earned</span></p>
        <p><span aria-hidden="true">✨</span><strong>{outcome.earnedXp}</strong><span>XP earned</span></p>
        <p><span aria-hidden="true">🗺️</span><strong>{trailLabel}</strong><span>current trail</span></p>
      </section>
      <section className="card">
        <h2>Next Quest</h2>
        <p>{nextAvailable
          ? `Atlas found your next ${outcome.nextQuest.purpose} quest.`
          : 'Atlas is preparing more adventures for this trail.'}</p>
      </section>
      <section className="screen-actions">
        {nextAvailable ? (
          <ChildButton type="button" className="primary-action" onClick={onContinueJourney}>
            Continue Journey
          </ChildButton>
        ) : (
          <ChildButton type="button" className="primary-action" onClick={onBackHome}>
            Back Home
          </ChildButton>
        )}
      </section>
    </section>
  )
}
