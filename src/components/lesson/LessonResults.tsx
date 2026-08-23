import type { LessonResult } from '../../domain/lesson'
import { ChildButton } from '../ChildButton'

interface LessonResultsProps {
  result: LessonResult
  onContinue: () => void
}

const starCount = (accuracy: number): number => {
  if (accuracy >= 90) {
    return 3
  }
  if (accuracy >= 70) {
    return 2
  }
  return 1
}

export function LessonResults({ result, onContinue }: LessonResultsProps) {
  const stars = starCount(result.accuracy)

  return (
    <section className="card lesson-results" aria-labelledby="lesson-complete-heading">
      <div className="completion-burst" aria-hidden="true">★</div>
      <h2 id="lesson-complete-heading">Quest Complete</h2>
      <p className="completion-message">You did thoughtful reading for this full quest.</p>
      <div className="completion-stats">
        <p><strong>{result.correctAnswers} / {result.totalQuestions}</strong><span>correct</span></p>
        <p><strong>{Math.round(result.accuracy)}%</strong><span>accuracy</span></p>
      </div>
      <p className="completion-stars" aria-label={`${stars} stars earned`}>
        <span className="sr-only">Stars earned:</span>
        {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 3 - stars))}
      </p>
      <section className="screen-actions">
        <ChildButton type="button" className="primary-action" onClick={onContinue}>
          Continue Quest
        </ChildButton>
      </section>
    </section>
  )
}
