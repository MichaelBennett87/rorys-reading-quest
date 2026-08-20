import { memo } from 'react'

import type { WordSupportTarget } from '../../domain/content'
import { SupportedWord } from '../wordSupport'

interface PassageTextChunk {
  kind: 'text' | 'target'
  value: string
  target?: WordSupportTarget
}

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
  const targets: WordSupportTarget[] = onOpenWordSupport ? wordSupportTargets : []

  const renderTextChunks = () => {
    if (targets.length === 0) {
      return <span>{passageText}</span>
    }

    const chunks = splitTextBySupportTargets(passageText, targets)
    return (
      <span>
        {chunks.map((entry, index) => (
          <span key={`${entry.target?.targetId ?? 'text'}-${index}`}>
            {entry.kind === 'text' || !visibleWordSupport ? (
              entry.value
            ) : (
              <SupportedWord
                label={entry.value}
                targetId={entry.target?.targetId ?? ''}
                onOpen={() => entry.target && onOpenWordSupport?.(entry.target)}
              />
            )}
          </span>
        ))}
      </span>
    )
  }

  return (
    <section className="card passage-card" aria-labelledby="lesson-passage-heading">
      <h2 id="lesson-passage-heading">{heading}</h2>
      <p className="passage-text">{renderTextChunks()}</p>
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

function splitTextBySupportTargets(passageText: string, targets: WordSupportTarget[]): PassageTextChunk[] {
  const sortedTargets = [...targets]
    .map((target) => ({ ...target, matchIndex: findSupportMatchIndex(target, passageText) }))
    .filter((entry) => entry.matchIndex >= 0)
    .sort((left, right) => left.matchIndex - right.matchIndex)

  const chunks: PassageTextChunk[] = []
  let cursor = 0

  for (const entry of sortedTargets) {
    const matchIndex = entry.matchIndex
    const surface = entry.surfaceWord
    if (matchIndex < cursor) {
      continue
    }
    const before = passageText.slice(cursor, matchIndex)
    if (before.length > 0) {
      chunks.push({ kind: 'text', value: before })
    }
    chunks.push({ kind: 'target', value: surface, target: entry })
    cursor = matchIndex + surface.length
  }
  if (cursor < passageText.length) {
    chunks.push({ kind: 'text', value: passageText.slice(cursor) })
  }
  return chunks
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findSupportMatchIndex(target: WordSupportTarget, passageText: string): number {
  const pattern = new RegExp(`\\b${escapeRegex(target.surfaceWord)}\\b`, 'gi')
  let position = 0
  const normalizedTarget = target.surfaceWord.trim().toLowerCase()

  while (true) {
    const match = pattern.exec(passageText)
    if (!match) return -1
    if (passageText.slice(match.index, match.index + match[0].length).toLowerCase() === normalizedTarget) {
      return match.index
    }
    position = match.index + Math.max(match[0].length, 1)
    pattern.lastIndex = position
  }
}

export { PassageCard }
export const MemoizedPassageCard = memo(PassageCard)
