import type { WordSupportTarget } from '../../domain/content'
import type { WordSupportChunk } from '../../domain/content'
import type { AssistanceKind, AssistanceLevel } from '../../domain/assistance'
import { ChildButton } from '../ChildButton'
import { WordParts } from './WordParts'

interface WordHelpPanelProps {
  target: WordSupportTarget
  level: AssistanceLevel
  speechSupported: boolean
  onRequestLevel: (level: AssistanceLevel, kind: AssistanceKind) => void
  onStop: () => void
  onClose: () => void
  speechActive: boolean
}

const steps: Array<{
  level: AssistanceLevel
  kind: AssistanceKind
  label: string
  requiresSpeech: boolean
}> = [
  { level: 1 as const, kind: 'PATTERN_HIGHLIGHT', label: 'Look at the Pattern', requiresSpeech: false },
  { level: 2 as const, kind: 'SHOW_CHUNKS', label: 'Break It Apart', requiresSpeech: false },
  { level: 3 as const, kind: 'SPEAK_CHUNKS', label: 'Hear the Parts', requiresSpeech: true },
  { level: 4 as const, kind: 'SPEAK_BLEND', label: 'Blend It', requiresSpeech: true },
  { level: 5 as const, kind: 'SPEAK_WORD', label: 'Hear the Word', requiresSpeech: true },
  { level: 6 as const, kind: 'SPEAK_SENTENCE', label: 'Hear the Sentence', requiresSpeech: true },
]

export function WordHelpPanel({
  target,
  level,
  speechSupported,
  onRequestLevel,
  onStop,
  onClose,
  speechActive,
}: WordHelpPanelProps) {
  return (
    <section className="word-help-panel" aria-live="polite">
      <h3 id={`help-title-${target.targetId}`}>Word Help</h3>
      <p>Target word: {target.surfaceWord}</p>
      <p>Current support step: {level}</p>
      <WordParts parts={target.focusParts} />
      <p>
        <span className="sr-only">Word chunks:</span>
        {target.displayChunks.map((chunk: WordSupportChunk, index: number) => (
          <span key={`${chunk.displayText}-${index}`}>{chunk.displayText}{index + 1 < target.displayChunks.length ? ' | ' : ''}</span>
        ))}
      </p>

      <div className="word-help-controls">
        {steps.map((step) => {
          const enabled = step.level <= level + 1
          const speechDisabled = step.requiresSpeech && !speechSupported
          return (
            <ChildButton
              key={step.label}
              type="button"
              className="word-help-control"
              disabled={!enabled || speechDisabled}
              onClick={() => onRequestLevel(step.level, step.kind)}
            >
              {step.label}
            </ChildButton>
          )
        })}
        {speechActive && (
          <ChildButton type="button" className="word-help-control" onClick={onStop}>
            Stop Voice
          </ChildButton>
        )}
        <ChildButton type="button" className="word-help-control" onClick={onClose}>
          Close Word Help
        </ChildButton>
      </div>
      {!speechSupported && (
        <p aria-live="polite">Voice help is not available on this device, but the word clues still work.</p>
      )}
    </section>
  )
}
