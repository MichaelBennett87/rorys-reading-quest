import { describe, expect, it } from 'vitest'

import {
  evaluateAnswer,
  getLessonById,
  lessonCatalog,
  type LessonQuestion,
} from '../../src/domain/lesson'

const PACK_ID = 'g2-word-forge-variable-vowels-oo-ea'

function question(questionId: string): LessonQuestion {
  const found = lessonCatalog
    .filter((entry) => entry.packId === PACK_ID)
    .flatMap((entry) => getLessonById(entry.lessonId).lesson?.questions ?? [])
    .find((candidate) => candidate.questionId === questionId)

  if (!found) throw new Error(`Missing question: ${questionId}`)
  return found
}

function submitHotText(target: LessonQuestion, selectedSegmentId: string) {
  return evaluateAnswer(target, {
    questionType: 'HOT_TEXT',
    payload: { selectedSegmentIds: [selectedSegmentId] },
  })
}

describe('Grade 2 oo/ea semantic answer corrections', () => {
  it('asks for the sentence that names the moon room, not any sentence in its scene', () => {
    const target = question('q-word-forge-oo-ea-guided-a-3')

    expect(target.prompt).toBe('Select the sentence that names the moon room.')
    expect(submitHotText(target, 'moon-room-sentence').isCorrect).toBe(true)
    expect(submitHotText(target, 'spoon-book-sentence').isCorrect).toBe(false)
    expect(submitHotText(target, 'moon-glow-sentence').isCorrect).toBe(false)
  })

  it('keys the cleanup action rather than the team meeting', () => {
    const target = question('q-word-forge-oo-ea-guided-b-3')

    expect(target.prompt).toContain('cleaning up trash')
    expect(target.evidenceReferenceIds).toEqual(['boots-pool-sentence'])
    expect(submitHotText(target, 'boots-pool-sentence').isCorrect).toBe(true)
    expect(submitHotText(target, 'cleanup-sentence').isCorrect).toBe(false)
  })

  it('asks for the sentence that directly names the weather team', () => {
    const target = question('q-word-forge-oo-ea-guided-d-3')

    expect(target.prompt).toBe('Select the sentence that names the weather team.')
    expect(submitHotText(target, 'weather-sentence').isCorrect).toBe(true)
    expect(submitHotText(target, 'bench-sentence').isCorrect).toBe(false)
  })
})
