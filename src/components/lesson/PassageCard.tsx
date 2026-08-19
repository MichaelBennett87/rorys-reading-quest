import { memo } from 'react'

interface PassageCardProps {
  passageText: string
  heading: string
  evidenceSnippets?: string[]
}

function PassageCard({ passageText, heading, evidenceSnippets = [] }: PassageCardProps) {
  return (
    <section className="card passage-card" aria-labelledby="lesson-passage-heading">
      <h2 id="lesson-passage-heading">{heading}</h2>
      <p className="passage-text">{passageText}</p>
      {evidenceSnippets.length > 0 && (
        <div>
          <h3>Evidence in this passage</h3>
          <ul>
            {evidenceSnippets.map((snippet) => (
              <li key={snippet} className="evidence-snippet">
                {snippet}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export { PassageCard }
export const MemoizedPassageCard = memo(PassageCard)
