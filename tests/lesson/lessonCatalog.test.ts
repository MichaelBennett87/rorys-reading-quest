import { describe, expect, test } from 'vitest'

import { getLessonById, getLessonCandidates, getLessonCatalogMetadata, getLessonForUnit } from '../../src/domain/lesson'

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
    expect(candidates).toHaveLength(154)
    expect(new Set(candidates.map((candidate) => candidate.activityId)).size).toBe(154)
    expect(candidates.filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-common-prefixes-'))).toHaveLength(7)
    expect(candidates.filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-common-suffixes-'))).toHaveLength(7)
    expect(candidates.filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-silent-letter-combinations-'))).toHaveLength(7)
    expect(candidates.filter((candidate) => candidate.lessonId.startsWith('lesson-compare-castle-compare-keep-'))).toHaveLength(7)
    const compareKeepCheckpoint = candidates.find((candidate) => candidate.lessonId === 'lesson-compare-castle-compare-keep-checkpoint-literary-a')
    expect(compareKeepCheckpoint).toBeDefined()
    expect(compareKeepCheckpoint?.passageQuestionKeys).toHaveLength(14)
    expect(compareKeepCheckpoint?.passageQuestionKeys.every((key) => key.startsWith('ck-lit-prose-4-trail-card::') || key.startsWith('ck-lit-prose-5-map-parade::'))).toBe(true)
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

  test('single-text lessons keep passageIds backward compatible without paired text metadata', () => {
    const result = getLessonById('lesson-word-forge-ou-oi-oy-ow-guided-ou-ow-prereq')
    expect(result.lesson).toBeDefined()
    expect(result.lesson?.passageId).toBe('passage-g2-word-forge-ou-oi-oy-ow-1')
    expect(result.lesson?.passageIds).toEqual(['passage-g2-word-forge-ou-oi-oy-ow-1'])
    expect(result.lesson?.pairedTextSetId).toBeUndefined()
  })

  test('returns errors when lesson is malformed or unavailable', () => {
    const result = getLessonForUnit('non-existent-unit')
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
    expect(getLessonCatalogMetadata('lesson-word-forge-silent-letter-combinations-checkpoint-a')).toEqual(expect.objectContaining({
      lessonId: 'lesson-word-forge-silent-letter-combinations-checkpoint-a',
      packId: 'g2-word-forge-silent-letter-combinations',
      worldId: 'word-forge',
      unitId: 'wg-unit-5',
    }))
    expect(getLessonCatalogMetadata('lesson-compare-castle-compare-keep-checkpoint-literary-a')).toEqual(expect.objectContaining({
      lessonId: 'lesson-compare-castle-compare-keep-checkpoint-literary-a',
      packId: 'g2-compare-castle-compare-keep',
      worldId: 'compare-castle',
      unitId: 'cg-unit-3',
      pairedTextSetId: 'ck-pair-5-map-and-trail',
      passageIds: [
        'ck-lit-prose-4-trail-card',
        'ck-lit-prose-5-map-parade',
      ],
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

  test('the quiet letter quest trail resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-5')
    expect(result.lesson).toBeDefined()
    expect(result.lesson?.lessonId).toBe('lesson-word-forge-silent-letter-combinations-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
    expect(result.lesson?.teachingBlock).toBeUndefined()
  })

  test('the Compare Castle trail resolves to the Compare Keep checkpoint lesson', () => {
    const result = getLessonForUnit('cg-unit-3')
    expect(result.lesson).toBeDefined()
    expect(result.lesson?.lessonId).toBe('lesson-compare-castle-compare-keep-checkpoint-literary-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
    expect(result.lesson?.passageIds).toEqual([
      'ck-lit-prose-4-trail-card',
      'ck-lit-prose-5-map-parade',
    ])
    expect(result.lesson?.pairedTextSetId).toBe('ck-pair-5-map-and-trail')
  })
})
