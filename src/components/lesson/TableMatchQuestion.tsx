import type { LessonChoice } from '../../domain/lesson'

interface MatchRow {
  id: string
  prompt: string
  options: LessonChoice[]
  selectedChoiceId: string
}

interface TableMatchQuestionProps {
  rows: MatchRow[]
  disabled: boolean
  onSelectChoice: (rowId: string, choiceId: string) => void
}

export function TableMatchQuestion({
  rows,
  disabled,
  onSelectChoice,
}: TableMatchQuestionProps) {
  return (
    <section className="table-question" aria-label="table matching question">
      <div className="table-question-headings">
        <div>Item</div>
        <div>Match</div>
      </div>
      {rows.map((row) => (
        <div className="table-match-row" key={row.id}>
          <label htmlFor={`match-${row.id}`}>{row.prompt}</label>
          <select
            id={`match-${row.id}`}
            value={row.selectedChoiceId}
            onChange={(event) => onSelectChoice(row.id, event.target.value)}
            disabled={disabled}
          >
            <option value="">Pick an option</option>
            {row.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      ))}
    </section>
  )
}
