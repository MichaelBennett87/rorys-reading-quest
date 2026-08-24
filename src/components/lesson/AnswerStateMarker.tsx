import type { AnswerPresentationState } from '../../domain/lesson'

interface AnswerStateMarkerProps {
  state: AnswerPresentationState
}

export function AnswerStateMarker({ state }: AnswerStateMarkerProps) {
  if (state === 'neutral') return null
  const content = state === 'selected'
    ? { icon: '●', label: 'Selected' }
    : state === 'correct'
      ? { icon: '✓', label: 'Correct answer' }
      : { icon: '×', label: 'Needs correction' }
  return (
    <span className={`answer-state-marker answer-state-marker-${state}`}>
      <span aria-hidden="true">{content.icon}</span>
      <span>{content.label}</span>
    </span>
  )
}
