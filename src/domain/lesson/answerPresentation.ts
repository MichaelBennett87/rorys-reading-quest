export type AnswerPresentationState = 'neutral' | 'selected' | 'correct' | 'incorrect'

interface DeriveAnswerPresentationStateInput {
  submitted: boolean
  selected: boolean
  correct: boolean
}

export function deriveAnswerPresentationState({
  submitted,
  selected,
  correct,
}: DeriveAnswerPresentationStateInput): AnswerPresentationState {
  if (!submitted) return selected ? 'selected' : 'neutral'
  if (correct) return 'correct'
  return selected ? 'incorrect' : 'neutral'
}
