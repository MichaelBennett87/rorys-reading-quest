import { memo } from 'react'

import type { PoemStructure, WordSupportTarget } from '../../domain/content'
import { SupportedText } from './SupportedText'

interface PoemCardProps {
  heading: string
  headingId?: string
  poemText: string
  poemStructure: PoemStructure
  evidenceSnippets?: string[]
  wordSupportTargets?: WordSupportTarget[]
  onOpenWordSupport?: (target: WordSupportTarget) => void
  visibleWordSupport?: boolean
}

function PoemCard({
  heading,
  headingId = 'lesson-poem-heading',
  poemText,
  poemStructure,
  evidenceSnippets = [],
  wordSupportTargets = [],
  onOpenWordSupport,
  visibleWordSupport = true,
}: PoemCardProps) {
  const lineTargetsById = new Map<string, WordSupportTarget[]>()
  for (const target of wordSupportTargets) {
    const targets = lineTargetsById.get(target.sentenceId) ?? []
    targets.push(target)
    lineTargetsById.set(target.sentenceId, targets)
  }

  return (
    <section className="card poem-card" aria-labelledby={headingId}>
      <h2 id={headingId}>{heading}</h2>
      <div className="poem-structure" aria-label="Poem text">
        {poemStructure.stanzas.map((stanza, stanzaIndex) => (
          <section
            key={stanza.stanzaId}
            className="poem-stanza"
            aria-label={`Stanza ${stanzaIndex + 1}`}
          >
            {stanza.lineIds.map((lineId) => {
              const line = poemStructure.lines.find((entry) => entry.lineId === lineId)
              if (!line) return null
              return (
                <div key={line.lineId} className="poem-line">
                  <span className="poem-line-number" aria-label={`Line ${line.lineNumber}`}>
                    {line.lineNumber}
                  </span>
                  <p className="poem-line-text">
                    <SupportedText
                      text={line.text}
                      targets={lineTargetsById.get(line.lineId) ?? []}
                      onOpenWordSupport={onOpenWordSupport}
                      visibleWordSupport={visibleWordSupport}
                    />
                  </p>
                </div>
              )
            })}
          </section>
        ))}
      </div>
      {evidenceSnippets.length > 0 && (
        <div>
          <h3>Evidence in this poem</h3>
          <ul>
            {evidenceSnippets.map((snippet) => (
              <li key={snippet} className="evidence-snippet">
                {snippet}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="sr-only">{poemText}</p>
    </section>
  )
}

export { PoemCard }
export const MemoizedPoemCard = memo(PoemCard)
