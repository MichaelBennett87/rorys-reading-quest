interface AnswerFeedbackProps {
  isCorrect: boolean
  explanation: string
}

export function AnswerFeedback({ isCorrect, explanation }: AnswerFeedbackProps) {
  const result = isCorrect ? 'correct' : 'incorrect'
  const title = isCorrect ? 'Correct! Great clue-finding!' : 'Not quite. Let’s look at the clue.'
  return (
    <section
      className={`answer-feedback answer-feedback-${result} ${result}`}
      data-result={result}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="feedback-title">
        <span className="feedback-result-icon" aria-hidden="true">{isCorrect ? '✓' : '×'}</span>
        {title}
      </p>
      <p>{explanation}</p>
    </section>
  )
}
