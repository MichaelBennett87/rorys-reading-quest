import type { AssistanceLevel } from '../../domain/assistance'
import type { WordSupportTarget } from '../../domain/content'
import { DEFAULT_CONFIG } from './browserSpeechService'
import type { SpeechService, SpeakStep } from './speechTypes'

export type WordSupportSpeechPlan =
  | { kind: 'sequence'; steps: SpeakStep[] }
  | { kind: 'text'; step: SpeakStep }
  | null

const browserConsonantApproximations: Record<string, string> = {
  b: 'buh',
  c: 'kuh',
  d: 'duh',
  f: 'fff',
  g: 'guh',
  h: 'huh',
  j: 'juh',
  k: 'kuh',
  l: 'lll',
  m: 'mmm',
  n: 'nnn',
  p: 'puh',
  q: 'kwuh',
  r: 'rrr',
  s: 'sss',
  t: 'tuh',
  v: 'vvv',
  w: 'wuh',
  x: 'ks',
  y: 'yuh',
  z: 'zzz',
}

export function buildWordSupportSpeechPlan(
  target: WordSupportTarget,
  level: AssistanceLevel,
): WordSupportSpeechPlan {
  const chunkSteps = target.spokenChunks.map((chunk): SpeakStep => ({
    text: browserConsonantApproximations[chunk.speechText.trim().toLowerCase()] ?? chunk.speechText,
    rate: DEFAULT_CONFIG.chunkSequenceRate,
    pauseAfterMs: 260,
  }))

  if (level === 3) {
    return { kind: 'sequence', steps: chunkSteps }
  }

  if (level === 4) {
    return {
      kind: 'sequence',
      steps: [
        ...chunkSteps.map((step) => ({ ...step, rate: 0.8, pauseAfterMs: 110 })),
        { text: target.blendSpeechText, rate: DEFAULT_CONFIG.blendRate, pauseAfterMs: 120 },
        { text: target.wholeWordSpeechText, rate: DEFAULT_CONFIG.wordRate },
      ],
    }
  }

  if (level === 5) {
    return {
      kind: 'text',
      step: { text: target.wholeWordSpeechText, rate: DEFAULT_CONFIG.wordRate },
    }
  }

  if (level === 6) {
    return {
      kind: 'text',
      step: { text: target.sentenceSpeechText, rate: DEFAULT_CONFIG.sentenceRate },
    }
  }

  return null
}

export function createWordSupportSpeechRequest(
  target: WordSupportTarget,
  level: AssistanceLevel,
  speechService: SpeechService,
): (() => Promise<void>) | null {
  const plan = buildWordSupportSpeechPlan(target, level)
  if (!plan) return null
  if (plan.kind === 'sequence') {
    return () => speechService.speakSequence(plan.steps)
  }
  return () => speechService.speakText(plan.step.text, { rate: plan.step.rate })
}
