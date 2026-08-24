import type { LessonChoice } from '../../domain/lesson'
import { deriveAnswerPresentationState } from '../../domain/lesson'
import { AnswerStateMarker } from './AnswerStateMarker'

interface MultipleChoiceQuestionProps {
  questionId: string
  questionPrompt: string
  choices: LessonChoice[]
  selectedChoiceId?: string
  disabled: boolean
  submitted?: boolean
  correctChoiceIds?: string[]
  onSelectChoice: (choiceId: string) => void
}

export function MultipleChoiceQuestion({
  questionId,
  questionPrompt,
  choices,
  selectedChoiceId,
  disabled,
  submitted = false,
  correctChoiceIds = [],
  onSelectChoice,
}: MultipleChoiceQuestionProps) {
  return (
    <fieldset className="question-fieldset">
      <legend>{questionPrompt}</legend>
      <div className="choice-grid">
        {choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id
          const answerState = deriveAnswerPresentationState({
            submitted,
            selected: isSelected,
            correct: correctChoiceIds.includes(choice.id),
          })
          return (
            <label
              key={choice.id}
              className={`choice-option ${isSelected ? 'selected' : ''} answer-state-${answerState}`}
              data-answer-state={answerState}
            >
              <input
                type="radio"
                name={`question-${questionId}`}
                value={choice.id}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onSelectChoice(choice.id)}
              />
              <span className="answer-choice-copy">{choice.text}</span>
              <AnswerStateMarker state={answerState} />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
