import type { LessonChoice } from '../../domain/lesson'
import { deriveAnswerPresentationState } from '../../domain/lesson'
import { AnswerStateMarker } from './AnswerStateMarker'

interface MultiselectQuestionProps {
  questionId: string
  questionPrompt: string
  choices: LessonChoice[]
  selectedChoiceIds: string[]
  disabled: boolean
  submitted?: boolean
  correctChoiceIds?: string[]
  onToggleChoice: (choiceId: string) => void
}

export function MultiselectQuestion({
  questionId,
  questionPrompt,
  choices,
  selectedChoiceIds,
  disabled,
  submitted = false,
  correctChoiceIds = [],
  onToggleChoice,
}: MultiselectQuestionProps) {
  return (
    <fieldset className="question-fieldset">
      <legend>{questionPrompt}</legend>
      <p className="helper-text">Choose all that are correct.</p>
      <div className="choice-grid">
        {choices.map((choice) => {
          const isChecked = selectedChoiceIds.includes(choice.id)
          const answerState = deriveAnswerPresentationState({
            submitted,
            selected: isChecked,
            correct: correctChoiceIds.includes(choice.id),
          })
          return (
            <label
              key={choice.id}
              className={`choice-option ${isChecked ? 'selected' : ''} answer-state-${answerState}`}
              data-answer-state={answerState}
            >
              <input
                type="checkbox"
                name={`question-${questionId}-${choice.id}`}
                value={choice.id}
                checked={isChecked}
                disabled={disabled}
                onChange={() => onToggleChoice(choice.id)}
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
