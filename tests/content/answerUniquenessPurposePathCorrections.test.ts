import { describe, expect, test } from 'vitest'

import { grade2InformationDetectivesPurposePathPack } from '../../src/domain/content/packs/grade2/informationDetectives/purposePath'
import { purposePathSentenceIds } from '../../src/domain/content/packs/grade2/informationDetectives/purposePath/ids'

function question(questionId: string) {
  const result = grade2InformationDetectivesPurposePathPack.questions.find(
    (candidate) => candidate.questionIdentifier === questionId,
  )
  expect(result, questionId).toBeDefined()
  return result!
}

describe('Purpose Path answer-uniqueness corrections', () => {
  test('replaces broad relevance prompts with exact source-based criteria', () => {
    const prompts = [
      ['lesson-purpose-what-is-author-trying-to-explain-q-3', 'count flowers or describe pollinator visits'],
      ['lesson-purpose-what-is-author-trying-to-explain-q-4', 'broad idea the author explains'],
      ['lesson-purpose-find-author-goal-q-3', 'quiet resting space'],
      ['lesson-purpose-use-whole-text-purpose-q-3', 'temperature tool'],
      ['lesson-purpose-use-whole-text-purpose-q-4', 'what the class learns'],
      ['lesson-purpose-checkpoint-a-q-3', "animal's body"],
      ['lesson-purpose-checkpoint-a-q-4', 'traveling through the air'],
      ['lesson-purpose-checkpoint-b-q-3', 'materials at the beginning'],
      ['lesson-purpose-checkpoint-b-q-5', 'names the composting process'],
      ['lesson-purpose-checkpoint-c-q-3', 'basic job of the bright trail markers'],
      ['lesson-purpose-checkpoint-c-q-4', 'hazard being marked'],
    ] as const

    for (const [questionId, expectedText] of prompts) {
      const item = question(questionId)
      expect(item.prompt, questionId).toContain(expectedText)
      expect(item.prompt, questionId).not.toMatch(/\bbest\b|most relevant/i)
    }
  })

  test('gives each formerly generic table row one visible classification criterion', () => {
    const rows = [
      ['lesson-purpose-find-author-goal-q-5', 'quiet-other', 'record kept at the front desk'],
      ['lesson-purpose-what-is-author-trying-to-explain-q-5', 'pollinator-other', 'blooms and leaves in the shady row'],
      ['lesson-purpose-use-whole-text-purpose-q-5', 'weather-other', 'what the wind sock shows'],
      ['lesson-purpose-checkpoint-a-q-6', 'seed-other', 'classroom record'],
      ['lesson-purpose-checkpoint-b-q-6', 'compost-other', 'what the teacher can still see'],
      ['lesson-purpose-checkpoint-c-q-6', 'trail-other', 'where the end sign leads'],
    ] as const

    for (const [questionId, rowId, expectedText] of rows) {
      const content = question(questionId).questionContent
      expect(content?.type, questionId).toBe('table_match')
      if (content?.type !== 'table_match') throw new Error(`Expected ${questionId} to be a table match`)
      expect(content.rows.find((row) => row.id === rowId)?.prompt, questionId).toContain(expectedText)
    }
  })

  test('constrains each two-part evidence slot to the keyed example', () => {
    const parts = [
      ['lesson-purpose-checkpoint-a-q-7', 'wind-based example'],
      ['lesson-purpose-checkpoint-b-q-7', 'materials that change'],
      ['lesson-purpose-checkpoint-c-q-7', 'at a path choice'],
    ] as const

    for (const [questionId, expectedText] of parts) {
      const content = question(questionId).questionContent
      expect(content?.type, questionId).toBe('two_part')
      if (content?.type !== 'two_part') throw new Error(`Expected ${questionId} to be a two-part question`)
      expect(content.partBPrompt, questionId).toContain(expectedText)
      expect(content.partBPrompt, questionId).not.toMatch(/\bbest\b|most relevant/i)
    }
  })

  test('keeps keyed evidence aligned with the actual seed, compost, and trail details', () => {
    expect(question('lesson-purpose-checkpoint-a-q-3').evidenceReferenceIds)
      .toContain(purposePathSentenceIds.shadeGardenStudy[3])
    expect(question('lesson-purpose-checkpoint-b-q-3').evidenceReferenceIds)
      .toContain(purposePathSentenceIds.recyclingSortStation[0])
    expect(question('lesson-purpose-checkpoint-c-q-4').evidenceReferenceIds)
      .toContain(purposePathSentenceIds.compostChangeNotes[3])
  })
})
