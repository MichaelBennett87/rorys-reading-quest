import { afterEach, describe, expect, test } from 'vitest'

import { sampleContent } from '../../src/domain/content'
import { getLessonForUnit } from '../../src/domain/lesson'

const snapshotQuestions = JSON.parse(JSON.stringify(sampleContent.questions))

afterEach(() => {
  sampleContent.questions.splice(0, sampleContent.questions.length, ...JSON.parse(JSON.stringify(snapshotQuestions)))
})

describe('getLessonForUnit', () => {
  test('returns complete lesson content for the active Word Forge unit', () => {
    const result = getLessonForUnit('wg-unit-1')
    expect(result.lesson).toBeDefined()
    expect(result.lesson?.questionCount).toBe(10)
    expect(result.lesson?.questions[0]?.questionType).toBe('MULTIPLE_CHOICE')
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
})
