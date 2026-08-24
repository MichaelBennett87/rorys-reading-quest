import type { LessonChoice } from '../../domain/lesson'
import { deriveAnswerPresentationState } from '../../domain/lesson'
import { AnswerStateMarker } from './AnswerStateMarker'

interface HotTextQuestionProps {
  questionPrompt: string
  allowMultiple: boolean
  segments: LessonChoice[]
  selectedSegmentIds: string[]
  disabled: boolean
  submitted?: boolean
  correctSegmentIds?: string[]
  onToggleSegment: (segmentId: string) => void
}

export function HotTextQuestion({
  questionPrompt,
  segments,
  allowMultiple,
  selectedSegmentIds,
  disabled,
  submitted = false,
  correctSegmentIds = [],
  onToggleSegment,
}: HotTextQuestionProps) {
  return (
    <fieldset className="question-fieldset">
      <legend>{questionPrompt}</legend>
      <p className="helper-text">Choose the relevant segment(s).</p>
      <div className="segment-grid">
        {segments.map((segment) => {
          const isChecked = selectedSegmentIds.includes(segment.id)
          const answerState = deriveAnswerPresentationState({
            submitted,
            selected: isChecked,
            correct: correctSegmentIds.includes(segment.id),
          })
          return (
            <label
              key={segment.id}
              className={`segment-option ${isChecked ? 'selected' : ''} answer-state-${answerState}`}
              data-answer-state={answerState}
            >
              <input
                type={allowMultiple ? 'checkbox' : 'radio'}
                name={allowMultiple ? `question-hot-${segment.id}` : 'question-hot-text'}
                checked={isChecked}
                disabled={disabled}
                onChange={() => onToggleSegment(segment.id)}
              />
              <span className="answer-choice-copy">{segment.text}</span>
              <AnswerStateMarker state={answerState} />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
