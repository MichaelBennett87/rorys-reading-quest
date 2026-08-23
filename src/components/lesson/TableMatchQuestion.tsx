import type { TableMatchSelectionMode } from '../../domain/content'
import type { LessonChoice } from '../../domain/lesson'

interface MatchRow {
  id: string
  prompt: string
  options: LessonChoice[]
  selectedChoiceId: string
  disabledChoiceIds?: string[]
}

interface TableMatchQuestionProps {
  rows: MatchRow[]
  disabled: boolean
  selectionMode?: TableMatchSelectionMode
  onSelectChoice: (rowId: string, choiceId: string) => void
}

export function TableMatchQuestion({
  rows,
  disabled,
  selectionMode = 'independent',
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
      {rows.map((row) => (
        <div className="table-match-row" key={row.id}>
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
        </div>
      ))}
    </section>
  )
}
