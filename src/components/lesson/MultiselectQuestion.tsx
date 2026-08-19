import type { LessonChoice } from '../../domain/lesson'

interface MultiselectQuestionProps {
  questionId: string
  questionPrompt: string
  choices: LessonChoice[]
  selectedChoiceIds: string[]
  disabled: boolean
  onToggleChoice: (choiceId: string) => void
}

export function MultiselectQuestion({
  questionId,
  questionPrompt,
  choices,
  selectedChoiceIds,
  disabled,
  onToggleChoice,
}: MultiselectQuestionProps) {
  return (
    <fieldset className="question-fieldset">
      <legend>{questionPrompt}</legend>
      <p className="helper-text">Choose all that are correct.</p>
      <div className="choice-grid">
        {choices.map((choice) => {
          const isChecked = selectedChoiceIds.includes(choice.id)
          return (
            <label key={choice.id} className={`choice-option ${isChecked ? 'selected' : ''}`}>
              <input
                type="checkbox"
                name={`question-${questionId}-${choice.id}`}
                value={choice.id}
                checked={isChecked}
                disabled={disabled}
                onChange={() => onToggleChoice(choice.id)}
              />
              <span>{choice.text}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
