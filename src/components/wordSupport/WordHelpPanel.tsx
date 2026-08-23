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
  const currentStep = steps.find((step) => step.level === level) ?? steps[0]
  return (
    <section className="word-help-panel" aria-live="polite" aria-labelledby={`help-title-${target.targetId}`}>
      <div className="word-help-panel-header">
        <div>
          <h3 id={`help-title-${target.targetId}`}>Word Help</h3>
          <p className="word-help-stage">
            Help step {Math.max(level, 1)} of {steps.length}: {currentStep.label}
          </p>
        </div>
        <p className="word-help-target-label">Target word</p>
      </div>

      <p className="word-help-target-word">{target.surfaceWord}</p>
      <p className="word-help-clue">
        {currentStep.level === 1 && `Look at ${target.focusParts.find((part) => part.emphasis)?.text ?? target.surfaceWord}. These letters work together.`}
        {currentStep.level === 2 && 'Break the word into chunks so each part is easy to see.'}
        {currentStep.level === 3 && 'Hear each chunk one at a time.'}
        {currentStep.level === 4 && 'Blend the chunks, then say the whole word.'}
        {currentStep.level === 5 && 'Hear the whole word in a natural voice.'}
        {currentStep.level === 6 && 'Hear the sentence that holds the word in context.'}
      </p>

      <WordParts parts={target.focusParts} />

      <div className="word-help-chunk-grid" aria-label={`Chunks for ${target.surfaceWord}`}>
        {target.displayChunks.map((chunk: WordSupportChunk, index: number) => (
          <span key={`${chunk.displayText}-${index}`} className="word-help-chunk">
            {chunk.displayText}
          </span>
        ))}
      </div>

      <div className="word-help-controls">
        {steps.map((step) => {
          const enabled = step.level <= level + 1
          const speechDisabled = step.requiresSpeech && !speechSupported
          const state = step.level < level ? 'complete' : step.level === level ? 'active' : 'locked'
          return (
            <ChildButton
              key={step.label}
              type="button"
              className={`word-help-control word-help-step-${state}`}
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
