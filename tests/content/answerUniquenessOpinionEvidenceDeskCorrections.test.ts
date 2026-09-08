import { describe, expect, test } from 'vitest'

import { grade2InformationDetectivesOpinionEvidenceDeskPack } from '../../src/domain/content/packs/grade2/informationDetectives/opinionEvidenceDesk'

function question(questionId: string) {
  const result = grade2InformationDetectivesOpinionEvidenceDeskPack.questions.find(
    (candidate) => candidate.questionIdentifier === questionId,
  )
  expect(result, questionId).toBeDefined()
  return result!
}

describe('Opinion Evidence Desk answer-uniqueness corrections', () => {
  test('gives every corrected single-select and exact-set item a visible response criterion', () => {
    const prompts = [
      ['lesson-opinion-fact-opinion-topic-q-3', 'measured temperature detail'],
      ['lesson-opinion-find-the-author-opinion-q-3', 'describes visitor confusion'],
      ['lesson-opinion-find-the-author-opinion-q-4', 'problem caused by unclear symbols'],
      ['lesson-opinion-choose-strongest-evidence-q-3', 'same boxes can be used again'],
      ['lesson-opinion-choose-strongest-evidence-q-4', 'each box can be cleaned and used again'],
      ['lesson-opinion-checkpoint-a-q-5', 'compares bird visits'],
      ['lesson-opinion-checkpoint-b-q-4', 'sorting problem before the signs'],
      ['lesson-opinion-checkpoint-b-q-5', 'what changed after the sorting signs'],
      ['lesson-opinion-checkpoint-c-q-4', 'beds need water'],
      ['lesson-opinion-checkpoint-c-q-5', 'problem on hot afternoons'],
    ] as const

    for (const [questionId, expectedText] of prompts) {
      const item = question(questionId)
      expect(item.prompt, questionId).toContain(expectedText)
      expect(item.prompt, questionId).not.toMatch(/\bbest\b|strong clue/i)
    }
  })

  test('distinguishes the ranger report from the already-classified temperature fact', () => {
    const content = question('lesson-opinion-fact-opinion-topic-q-5').questionContent
    expect(content?.type).toBe('table_match')
    if (content?.type !== 'table_match') throw new Error('Expected a table-match question')
    const row = content.rows.find((candidate) => candidate.id === 'shaded-detail-row')
    expect(row?.prompt).toContain('what the ranger said families do')
    expect(row?.correctChoiceId).toBe('shaded-detail-answer')
  })

  test('preserves each exact response set while removing competing interpretations', () => {
    const expectedKeys = [
      ['lesson-opinion-fact-opinion-topic-q-3', ['shaded-detail-1', 'shaded-detail-2']],
      ['lesson-opinion-find-the-author-opinion-q-3', ['trail-detail-1', 'trail-detail-4']],
      ['lesson-opinion-choose-strongest-evidence-q-3', ['container-detail-1', 'container-detail-2']],
      ['lesson-opinion-checkpoint-b-q-4', ['compost-detail-1', 'compost-detail-2']],
      ['lesson-opinion-checkpoint-c-q-4', ['rain-detail-2', 'rain-detail-4']],
    ] as const

    for (const [questionId, keys] of expectedKeys) {
      const content = question(questionId).questionContent
      expect(content?.type, questionId).toBe('multi_select')
      if (content?.type !== 'multi_select') throw new Error(`Expected ${questionId} to be a multiselect`)
      expect(content.correctChoiceIds, questionId).toEqual(keys)
    }
  })

  test('uses the two direct source details for the water-dish opinion', () => {
    const item = question('lesson-opinion-checkpoint-a-q-4')
    const content = item.questionContent
    expect(content?.type).toBe('multi_select')
    if (content?.type !== 'multi_select') throw new Error('Expected a multiselect question')

    expect(content.correctChoiceIds).toEqual(['bird-detail-1', 'bird-detail-2'])
    expect(content.choices).toEqual(expect.arrayContaining([
      { id: 'bird-detail-1', text: 'Birds drank from a small puddle under the tree.' },
      { id: 'bird-detail-2', text: 'The map showed a shady spot under the tree where the dish could sit.' },
    ]))
    expect(item.explanation).toContain('Birds drank water under the tree')
    expect(item.evidenceReferenceIds).toHaveLength(2)
  })
})
