import type { LessonResult } from '../../domain/lesson'
import { ChildButton } from '../ChildButton'

interface LessonResultsProps {
  result: LessonResult
  onReturn: () => void
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

export function LessonResults({ result, onReturn }: LessonResultsProps) {
  const stars = starCount(result.accuracy)

  return (
    <section className="card lesson-results" aria-labelledby="lesson-complete-heading">
      <h2 id="lesson-complete-heading">Quest Complete</h2>
      <p>Correct answers: {result.correctAnswers} / {result.totalQuestions}</p>
      <p>Accuracy: {Math.round(result.accuracy)}%</p>
      <p>Encouragement: You did thoughtful reading for this full quest.</p>
      <p>Stars earned: {stars}</p>
      <p>{'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 3 - stars))}</p>
      <section className="screen-actions">
        <ChildButton type="button" className="primary-action" onClick={onReturn}>
          Return to Unit
        </ChildButton>
      </section>
    </section>
  )
}
