import { afterEach, describe, expect, test } from 'vitest'

import { sampleContent } from '../../src/domain/content'
import { getLessonById, getLessonCandidates, getLessonCatalogMetadata, getLessonForUnit } from '../../src/domain/lesson'

const snapshotQuestions = JSON.parse(JSON.stringify(sampleContent.questions))

afterEach(() => {
  sampleContent.questions.splice(0, sampleContent.questions.length, ...JSON.parse(JSON.stringify(snapshotQuestions)))
})

describe('getLessonForUnit', () => {
  test('returns complete lesson content for the active Word Forge unit', () => {
    const result = getLessonForUnit('wg-unit-1')
    expect(result.lesson).toBeDefined()
    expect(result.lesson?.lessonId).toBe('lesson-word-forge-oo-ea-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
    expect(result.lesson?.questions[0]?.questionType).toBe('MULTIPLE_CHOICE')
    expect(new Set(result.lesson?.questions.map((question) => question.difficulty))).toEqual(new Set([1]))
    expect(result.lesson?.teachingBlock).toBeUndefined()
  })

  test('exposes the active trail and bridge lessons while excluding legacy lessons', () => {
    const candidates = getLessonCandidates()
    expect(candidates).toHaveLength(42)
    expect(new Set(candidates.map((candidate) => candidate.activityId)).size).toBe(42)
    expect(candidates.filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-common-prefixes-'))).toHaveLength(7)
    expect(candidates.filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-common-suffixes-'))).toHaveLength(7)
    expect(candidates.map((candidate) => candidate.lessonId)).not.toEqual(expect.arrayContaining([
      'lesson-word-forge-vowel-voyage-a',
      'lesson-word-forge-vowel-voyage-b',
      'lesson-word-forge-vowel-voyage-c',
      'lesson-word-forge-building-block',
    ]))
  })

  test('legacy lessons remain resolvable by id', () => {
    const result = getLessonById('lesson-word-forge-vowel-voyage-a')
    expect(result.lesson?.selectionStatus).toBe('legacy')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
  })

  test('returns errors when lesson is malformed or unavailable', () => {
    sampleContent.questions[0] = {
      ...sampleContent.questions[0],
      questionType: 'two_part',
      questionContent: {
        type: 'hot_text',
        selectableSegments: [],
        correctSegmentIds: [],
      } as never,
    }

    const result = getLessonForUnit('wg-unit-1')
    expect(result.lesson).toBeUndefined()
    expect(result.errors.length).toBeGreaterThan(0)
  })

  test('returns errors for unknown unit', () => {
    const result = getLessonForUnit('non-existent-unit')
    expect(result.lesson).toBeUndefined()
    expect(result.errors).toEqual(['No lesson content assigned to this unit.'])
  })

  test('resolves lesson ownership from catalog metadata', () => {
    expect(getLessonCatalogMetadata('lesson-word-forge-consonant-le-checkpoint-a')).toEqual(expect.objectContaining({
      lessonId: 'lesson-word-forge-consonant-le-checkpoint-a',
      packId: 'g2-word-forge-consonant-le-integrated',
      worldId: 'word-forge',
      unitId: 'wg-unit-2',
    }))
    expect(getLessonCatalogMetadata('lesson-word-forge-common-prefixes-checkpoint-a')).toEqual(expect.objectContaining({
      lessonId: 'lesson-word-forge-common-prefixes-checkpoint-a',
      packId: 'g2-word-forge-common-prefixes',
      worldId: 'word-forge',
      unitId: 'wg-unit-3',
    }))
    expect(getLessonCatalogMetadata('lesson-word-forge-common-suffixes-checkpoint-a')).toEqual(expect.objectContaining({
      lessonId: 'lesson-word-forge-common-suffixes-checkpoint-a',
      packId: 'g2-word-forge-common-suffixes',
      worldId: 'word-forge',
      unitId: 'wg-unit-4',
    }))
    expect(getLessonCatalogMetadata('missing-lesson-id')).toBeNull()
  })

  test('the prefix power trail resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-3')
    expect(result.lesson).toBeDefined()
    expect(result.lesson?.lessonId).toBe('lesson-word-forge-common-prefixes-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
    expect(result.lesson?.teachingBlock).toBeUndefined()
  })
})
