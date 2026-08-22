import { memo } from 'react'

import type { WordSupportTarget } from '../../domain/content'
import { SupportedWord } from '../wordSupport'

export interface SupportedTextProps {
  text: string
  targets?: readonly WordSupportTarget[]
  onOpenWordSupport?: (target: WordSupportTarget) => void
  visibleWordSupport?: boolean
  className?: string
}

type TextChunk =
  | {
      kind: 'text'
      value: string
    }
  | {
      kind: 'target'
      value: string
      target: WordSupportTarget
    }

function SupportedText({
  text,
  targets = [],
  onOpenWordSupport,
  visibleWordSupport = true,
  className,
}: SupportedTextProps) {
  const activeTargets: WordSupportTarget[] = onOpenWordSupport ? [...targets] : []
  const chunks: TextChunk[] = activeTargets.length > 0 ? splitTextBySupportTargets(text, activeTargets) : [{ kind: 'text', value: text }]

  return (
    <span className={className}>
      {chunks.map((entry, index) => (
        <span key={`${entry.kind === 'target' ? entry.target.targetId : 'text'}-${index}`}>
          {entry.kind === 'text' || !visibleWordSupport ? (
            entry.value
          ) : (
            <SupportedWord
              label={entry.value}
              targetId={entry.target.targetId}
              onOpen={() => onOpenWordSupport?.(entry.target)}
            />
          )}
        </span>
      ))}
    </span>
  )
}

function splitTextBySupportTargets(passageText: string, targets: WordSupportTarget[]): TextChunk[] {
  const sortedTargets = [...targets]
    .map((target) => ({ ...target, matchIndex: findSupportMatchIndex(target, passageText) }))
    .filter((entry) => entry.matchIndex >= 0)
    .sort((left, right) => left.matchIndex - right.matchIndex)

  const chunks: TextChunk[] = []
  let cursor = 0

  for (const entry of sortedTargets) {
    if (entry.matchIndex < cursor) {
      continue
    }

    const before = passageText.slice(cursor, entry.matchIndex)
    if (before.length > 0) {
      chunks.push({ kind: 'text', value: before })
    }

    chunks.push({ kind: 'target', value: entry.surfaceWord, target: entry })
    cursor = entry.matchIndex + entry.surfaceWord.length
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
  const normalizedTarget = target.surfaceWord.trim().toLowerCase()

  while (true) {
    const match = pattern.exec(passageText)
    if (!match) return -1
    if (passageText.slice(match.index, match.index + match[0].length).toLowerCase() === normalizedTarget) {
      return match.index
    }
    pattern.lastIndex = match.index + Math.max(match[0].length, 1)
  }
}

export { SupportedText }
export const MemoizedSupportedText = memo(SupportedText)
