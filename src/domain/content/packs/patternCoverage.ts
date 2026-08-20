import type { ContentPack } from './contentPackTypes'

export const STANDARD_VARIABLE_VOWEL_PATTERNS = ['oo', 'ea', 'ou', 'oi', 'oy', 'ow'] as const
export type StandardVariableVowelPattern = (typeof STANDARD_VARIABLE_VOWEL_PATTERNS)[number]

const STANDARD_PATTERN_SET = new Set<string>(STANDARD_VARIABLE_VOWEL_PATTERNS)

export function normalizeCoverageText(text: string): string {
  return text.toLowerCase().replace(/[^a-z]/g, '')
}

export function collectObservedStandardPatterns(pack: ContentPack): StandardVariableVowelPattern[] {
  const observed = new Set<StandardVariableVowelPattern>()
  const addText = (text: string) => {
    const normalized = normalizeCoverageText(text)
    for (const pattern of STANDARD_VARIABLE_VOWEL_PATTERNS) {
      if (normalized.includes(pattern)) observed.add(pattern)
    }
  }

  for (const passage of pack.passages) {
    for (const target of passage.wordSupportTargets ?? []) {
      addText(target.surfaceWord)
      addText(target.blendSpeechText)
      addText(target.wholeWordSpeechText)
    }
  }

  for (const question of pack.questions) {
    for (const word of question.targetVocabulary) {
      addText(word)
    }
    addText(question.prompt)
  }

  return STANDARD_VARIABLE_VOWEL_PATTERNS.filter((pattern) => observed.has(pattern))
}

export function getClaimedStandardPatterns(pack: ContentPack): StandardVariableVowelPattern[] {
  return pack.manifest.coveredPatterns.filter((pattern): pattern is StandardVariableVowelPattern => STANDARD_PATTERN_SET.has(pattern))
}
