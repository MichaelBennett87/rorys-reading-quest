import { describe, expect, it } from 'vitest'

import { sampleContent } from '../../src/domain/content'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

function question(questionId: string) {
  const result = sampleContent.questions.find((entry) => entry.questionIdentifier === questionId)
  expect(result, `Missing ${questionId}`).toBeDefined()
  return result!
}

describe('answer-uniqueness content-audit integration corrections', () => {
  it('keeps every corrected fluency phrase sequence aligned with its passage', () => {
    const pack = getActiveContentPacks().find((entry) => entry.manifest.packId === 'g2-word-forge-fluency-practice-foundations')

    expect(pack).toBeDefined()
    for (const lessonId of [
      'lesson-word-forge-fluency-practice-punctuation-pauses',
      'lesson-word-forge-fluency-practice-questions-and-exclamations',
    ]) {
      const lesson = pack?.lessons.find((entry) => entry.lessonId === lessonId)
      const passage = pack?.passages.find((entry) => entry.passageIdentifier === lesson?.passageIdentifiers[0])
      expect(lesson?.fluencyPracticeBlock?.phraseGroups.map((phrase) => phrase.text).join(' ')).toBe(passage?.passageText)
    }
  })

  it('keeps corrected fluency table choices visibly distinct', () => {
    for (const questionId of [
      'question-word-forge-fluency-practice-phrase-groups-4',
      'question-word-forge-fluency-practice-dialogue-and-character-voice-4',
    ]) {
      const payload = question(questionId).questionContent
      expect(payload?.type).toBe('table_match')
      if (payload?.type === 'table_match') {
        const visibleChoices = payload.rows.flatMap((row) => row.options.map((option) => option.text))
        expect(new Set(visibleChoices).size).toBe(visibleChoices.length)
      }
    }
  })

  it('uses distinct prompts for the two final silent-letter tables', () => {
    const first = question('q-word-forge-silent-letter-combinations-checkpoint-c-6')
    const second = question('q-word-forge-silent-letter-combinations-checkpoint-c-7')

    expect(first.prompt).not.toBe(second.prompt)
    expect(second.prompt).toContain('final review set')
  })
})
