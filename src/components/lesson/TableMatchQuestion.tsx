import type { TableMatchSelectionMode } from '../../domain/content'
import type { LessonChoice } from '../../domain/lesson'
import { deriveAnswerPresentationState } from '../../domain/lesson'

interface MatchRow {
  id: string
  prompt: string
  options: LessonChoice[]
  selectedChoiceId: string
  disabledChoiceIds?: string[]
  correctChoiceId?: string
}

interface TableMatchQuestionProps {
  rows: MatchRow[]
  disabled: boolean
  selectionMode?: TableMatchSelectionMode
  submitted?: boolean
  onSelectChoice: (rowId: string, choiceId: string) => void
}

export function TableMatchQuestion({
  rows,
  disabled,
  selectionMode = 'independent',
  submitted = false,
  onSelectChoice,
}: TableMatchQuestionProps) {
  const useEachOnce = selectionMode === 'use_each_once'
  return (
    <section className="table-question" aria-label="table matching question">
      {useEachOnce && (
        <p id="table-match-instructions">
          Each retell piece can be used only once.
        </p>
      )}
      <div className="table-question-headings">
        <div>Item</div>
        <div>Match</div>
      </div>
      {rows.map((row) => {
        const answerState = deriveAnswerPresentationState({
          submitted,
          selected: Boolean(row.selectedChoiceId),
          correct: Boolean(row.correctChoiceId) && row.selectedChoiceId === row.correctChoiceId,
        })
        const correctOption = row.options.find((option) => option.id === row.correctChoiceId)
        return (
        <div
          className={`table-match-row answer-state-${answerState}`}
          data-answer-state={answerState}
          key={row.id}
        >
          <label htmlFor={`match-${row.id}`}>{row.prompt}</label>
          <select
            id={`match-${row.id}`}
            aria-describedby={useEachOnce ? 'table-match-instructions' : undefined}
            value={row.selectedChoiceId}
            onChange={(event) => onSelectChoice(row.id, event.target.value)}
            disabled={disabled}
          >
            <option value="">Pick an option</option>
            {row.options.map((option) => (
              <option
                key={option.id}
                value={option.id}
                disabled={Boolean(row.disabledChoiceIds?.includes(option.id) && option.id !== row.selectedChoiceId)}
              >
                {option.text}
              </option>
            ))}
          </select>
          {submitted && answerState === 'correct' && (
            <p className="table-row-result table-row-result-correct"><span aria-hidden="true">✓</span> Correct match</p>
          )}
          {submitted && answerState === 'incorrect' && (
            <p className="table-row-result table-row-result-incorrect">
              <span aria-hidden="true">×</span> Needs correction. Correct match: {correctOption?.text ?? 'Review this row.'}
            </p>
          )}
        </div>
        )
      })}
    </section>
  )
}
