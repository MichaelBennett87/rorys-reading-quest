import { memo } from 'react'

import type { WordSupportTarget } from '../../domain/content'
import { SupportedText } from './SupportedText'

interface PassageCardProps {
  passageText: string
  heading: string
  evidenceSnippets?: string[]
  wordSupportTargets?: WordSupportTarget[]
  onOpenWordSupport?: (target: WordSupportTarget) => void
  visibleWordSupport?: boolean
}

function PassageCard({
  passageText,
  heading,
  evidenceSnippets = [],
  wordSupportTargets = [],
  onOpenWordSupport,
  visibleWordSupport = true,
}: PassageCardProps) {
  return (
    <section className="card passage-card" aria-labelledby="lesson-passage-heading">
      <h2 id="lesson-passage-heading">{heading}</h2>
      <p className="passage-text">
        <SupportedText
          text={passageText}
          targets={wordSupportTargets}
          onOpenWordSupport={onOpenWordSupport}
          visibleWordSupport={visibleWordSupport}
        />
      </p>
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
