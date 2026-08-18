import { describe, expect, test } from 'vitest'

import {
  getReviewIntervalForStep,
  nextReviewInterval,
  REVIEW_INTERVAL_DAYS,
} from '../../src/domain/progression/reviewSchedule'

describe('reviewSchedule', () => {
  test('maps each schedule index to configured intervals', () => {
    expect(getReviewIntervalForStep(0)).toBe(REVIEW_INTERVAL_DAYS[0])
    expect(getReviewIntervalForStep(1)).toBe(REVIEW_INTERVAL_DAYS[1])
    expect(getReviewIntervalForStep(2)).toBe(REVIEW_INTERVAL_DAYS[2])
    expect(getReviewIntervalForStep(3)).toBe(REVIEW_INTERVAL_DAYS[3])
    expect(getReviewIntervalForStep(4)).toBe(REVIEW_INTERVAL_DAYS[4])
    expect(getReviewIntervalForStep(99)).toBe(REVIEW_INTERVAL_DAYS[4])
  })

  test('progresses through the configured interval sequence on successful reviews', () => {
    const step0 = nextReviewInterval(0, true)
    expect(step0.nextIntervalDays).toBe(REVIEW_INTERVAL_DAYS[1])

    const step1 = nextReviewInterval(1, true)
    expect(step1.nextIntervalDays).toBe(REVIEW_INTERVAL_DAYS[2])

    const step2 = nextReviewInterval(2, true)
    expect(step2.nextIntervalDays).toBe(REVIEW_INTERVAL_DAYS[3])

    const step3 = nextReviewInterval(3, true)
    expect(step3.nextIntervalDays).toBe(REVIEW_INTERVAL_DAYS[4])

    const step4 = nextReviewInterval(4, true)
    expect(step4.nextIntervalDays).toBe(REVIEW_INTERVAL_DAYS[4])
  })

  test('missed review steps backward one interval', () => {
    const step2Missed = nextReviewInterval(2, false)
    expect(step2Missed.nextIntervalDays).toBe(REVIEW_INTERVAL_DAYS[1])
  })
})
