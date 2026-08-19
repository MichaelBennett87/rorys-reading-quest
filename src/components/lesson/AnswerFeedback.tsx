interface AnswerFeedbackProps {
  isCorrect: boolean
  explanation: string
}

export function AnswerFeedback({ isCorrect, explanation }: AnswerFeedbackProps) {
  const title = isCorrect ? 'Great clue-finding!' : 'Not quite. Let’s look at the clue.'
  return (
    <section className="answer-feedback" role="status" aria-live="polite">
      <p className="feedback-title">{title}</p>
      <p>{explanation}</p>
    </section>
  )
}
