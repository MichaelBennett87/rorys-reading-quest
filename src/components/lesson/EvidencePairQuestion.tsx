import type { LessonChoice } from '../../domain/lesson'

interface EvidencePairQuestionProps {
  partAPrompt: string
  partAChoices: LessonChoice[]
  partBPrompt: string
  partBChoices: LessonChoice[]
  selectedPartAChoiceId: string
  selectedPartBChoiceId: string
  disabled: boolean
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
            return (
              <label key={choice.id} className={`choice-option ${isSelected ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={`part-a`}
                  value={choice.id}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onPartASelect(choice.id)}
                />
                <span>{choice.text}</span>
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
            return (
              <label key={choice.id} className={`choice-option ${isSelected ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={`part-b`}
                  value={choice.id}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onPartBSelect(choice.id)}
                />
                <span>{choice.text}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </section>
  )
}
