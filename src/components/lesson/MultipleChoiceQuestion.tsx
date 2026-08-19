import type { LessonChoice } from '../../domain/lesson'

interface MultipleChoiceQuestionProps {
  questionId: string
  questionPrompt: string
  choices: LessonChoice[]
  selectedChoiceId?: string
  disabled: boolean
  onSelectChoice: (choiceId: string) => void
}

export function MultipleChoiceQuestion({
  questionId,
  questionPrompt,
  choices,
  selectedChoiceId,
  disabled,
  onSelectChoice,
}: MultipleChoiceQuestionProps) {
  return (
    <fieldset className="question-fieldset">
      <legend>{questionPrompt}</legend>
      <div className="choice-grid">
        {choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id
          return (
            <label key={choice.id} className={`choice-option ${isSelected ? 'selected' : ''}`}>
              <input
                type="radio"
                name={`question-${questionId}`}
                value={choice.id}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onSelectChoice(choice.id)}
              />
              <span>{choice.text}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
