import { useMemo } from 'react'

import type { AssistanceKind, AssistanceLevel } from '../../domain/assistance'
import type { WordSupportChunk, WordSupportTarget } from '../../domain/content'
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
  displayStep: 1 | 2 | 3 | 4 | 5
  assistanceLevel: AssistanceLevel
  kind: AssistanceKind
  label: string
  requiresSpeech: boolean
}> = [
  { displayStep: 1, assistanceLevel: 1 as const, kind: 'PATTERN_HIGHLIGHT', label: 'Look at the Pattern', requiresSpeech: false },
  { displayStep: 2, assistanceLevel: 2 as const, kind: 'SHOW_CHUNKS', label: 'Break It Apart', requiresSpeech: false },
  { displayStep: 3, assistanceLevel: 3 as const, kind: 'SPEAK_CHUNKS', label: 'Hear the Parts', requiresSpeech: true },
  { displayStep: 4, assistanceLevel: 5 as const, kind: 'SPEAK_WORD', label: 'Hear the Word', requiresSpeech: true },
  { displayStep: 5, assistanceLevel: 6 as const, kind: 'SPEAK_SENTENCE', label: 'Hear the Sentence', requiresSpeech: true },
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
  const displayLevel = useMemo(() => {
    if (level >= 6) return 5
    if (level >= 4) return 4
    if (level >= 1) return level
    return 1
  }, [level])
  const currentStep = steps.find((step) => step.displayStep === displayLevel) ?? steps[0]
  const maxUnlockedDisplayStep = Math.min(displayLevel + 1, steps.length)
  return (
    <section className="word-help-panel" aria-live="polite" aria-labelledby={`help-title-${target.targetId}`}>
      <div className="word-help-panel-header">
        <div>
          <h3 id={`help-title-${target.targetId}`}>Word Help</h3>
          <p className="word-help-stage">
            Help step {displayLevel} of {steps.length}: {currentStep.label}
          </p>
        </div>
        <p className="word-help-target-label">Target word</p>
      </div>

      <p className="word-help-target-word">{target.surfaceWord}</p>
      <p className="word-help-clue">
        {currentStep.displayStep === 1 && `Look at ${target.focusParts.find((part) => part.emphasis)?.text ?? target.surfaceWord}. These letters work together.`}
        {currentStep.displayStep === 2 && 'Break the word into chunks so each part is easy to see.'}
        {currentStep.displayStep === 3 && 'Hear each chunk one at a time.'}
        {currentStep.displayStep === 4 && 'Hear the whole word in a natural voice.'}
        {currentStep.displayStep === 5 && 'Hear the sentence that holds the word in context.'}
      </p>

      {level === 4 && (
        <p className="word-help-legacy-note">
          Older saved help from a blended-word step is still supported.
        </p>
      )}

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
          const enabled = step.displayStep <= maxUnlockedDisplayStep
          const speechDisabled = step.requiresSpeech && !speechSupported
          const state = step.displayStep < displayLevel ? 'complete' : step.displayStep === displayLevel ? 'active' : 'locked'
          return (
            <ChildButton
              key={step.label}
              type="button"
              className={`word-help-control word-help-step-${state}`}
              disabled={!enabled || speechDisabled}
              onClick={() => onRequestLevel(step.assistanceLevel, step.kind)}
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
