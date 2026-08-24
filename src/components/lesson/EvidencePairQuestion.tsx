import type { LessonChoice } from '../../domain/lesson'
import { deriveAnswerPresentationState } from '../../domain/lesson'
import { AnswerStateMarker } from './AnswerStateMarker'

interface EvidencePairQuestionProps {
  partAPrompt: string
  partAChoices: LessonChoice[]
  partBPrompt: string
  partBChoices: LessonChoice[]
  selectedPartAChoiceId: string
  selectedPartBChoiceId: string
  disabled: boolean
  submitted?: boolean
  partACorrectChoiceId?: string
  partBCorrectChoiceId?: string
  onPartASelect: (choiceId: string) => void
  onPartBSelect: (choiceId: string) => void
}

export function EvidencePairQuestion({
  partAPrompt,
  partAChoices,
  partBPrompt,
  partBChoices,
  selectedPartAChoiceId,
  selectedPartBChoiceId,
  disabled,
  submitted = false,
  partACorrectChoiceId = '',
  partBCorrectChoiceId = '',
  onPartASelect,
  onPartBSelect,
}: EvidencePairQuestionProps) {
  return (
    <section className="question-pair">
      <fieldset className="question-fieldset">
        <legend>Part A</legend>
        <p className="question-prompt">{partAPrompt}</p>
        <div className="choice-grid">
          {partAChoices.map((choice) => {
            const isSelected = selectedPartAChoiceId === choice.id
            const answerState = deriveAnswerPresentationState({
              submitted,
              selected: isSelected,
              correct: choice.id === partACorrectChoiceId,
            })
            return (
              <label
                key={choice.id}
                className={`choice-option ${isSelected ? 'selected' : ''} answer-state-${answerState}`}
                data-answer-state={answerState}
              >
                <input
                  type="radio"
                  name={`part-a`}
                  value={choice.id}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onPartASelect(choice.id)}
                />
                <span className="answer-choice-copy">{choice.text}</span>
                <AnswerStateMarker state={answerState} />
              </label>
            )
          })}
        </div>
      </fieldset>
      <fieldset className="question-fieldset">
        <legend>Part B</legend>
        <p className="question-prompt">{partBPrompt}</p>
        <div className="choice-grid">
          {partBChoices.map((choice) => {
            const isSelected = selectedPartBChoiceId === choice.id
            const answerState = deriveAnswerPresentationState({
              submitted,
              selected: isSelected,
              correct: choice.id === partBCorrectChoiceId,
            })
            return (
              <label
                key={choice.id}
                className={`choice-option ${isSelected ? 'selected' : ''} answer-state-${answerState}`}
                data-answer-state={answerState}
              >
                <input
                  type="radio"
                  name={`part-b`}
                  value={choice.id}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onPartBSelect(choice.id)}
                />
                <span className="answer-choice-copy">{choice.text}</span>
                <AnswerStateMarker state={answerState} />
              </label>
            )
          })}
        </div>
      </fieldset>
    </section>
  )
}
