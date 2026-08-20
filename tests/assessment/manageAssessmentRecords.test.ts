import { describe, expect, test } from 'vitest'

import {
  createAssessmentRecord,
  deleteAssessmentRecord,
  parseAssessmentForm,
  sortAssessmentRecordsForDisplay,
  updateAssessmentRecord,
} from '../../src/domain/assessment'
import type { OfficialAssessmentRecord } from '../../src/domain/assessment'

const now = '2026-08-20T12:00:00.000Z'

function record(overrides: Partial<OfficialAssessmentRecord> = {}): OfficialAssessmentRecord {
  return {
    assessmentId: overrides.assessmentId ?? 'assessment-a',
    assessmentWindow: overrides.assessmentWindow ?? 'PM1',
    gradeBand: overrides.gradeBand ?? 2,
    scaleScore: overrides.scaleScore ?? 400,
    testedOn: overrides.testedOn ?? '2026-08-19',
    reportedAchievementLevel: overrides.reportedAchievementLevel ?? 3,
    reportedPercentileRank: overrides.reportedPercentileRank ?? 54,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  }
}

describe('assessment form parsing and record management', () => {
  test('parses valid values, trims blanks, and rejects malformed integers', () => {
    const valid = parseAssessmentForm({
      assessmentWindow: ' PM2 ',
      gradeBand: ' 3 ',
      scaleScore: ' 415 ',
      testedOn: ' 2026-08-19 ',
      reportedAchievementLevel: '',
      reportedPercentileRank: '',
    }, now)

    expect(valid.status).toBe('valid')
    if (valid.status === 'valid') {
      expect(valid.value).toEqual({
        assessmentWindow: 'PM2',
        gradeBand: 3,
        scaleScore: 415,
        testedOn: '2026-08-19',
        reportedAchievementLevel: null,
        reportedPercentileRank: null,
      })
    }

    const malformed = parseAssessmentForm({
      assessmentWindow: 'PM1',
      gradeBand: '2',
      scaleScore: '1e2',
      testedOn: '2026-08-19',
      reportedAchievementLevel: '',
      reportedPercentileRank: '',
    }, now)
    if (malformed.status !== 'invalid') {
      throw new Error('Expected malformed score to be rejected.')
    }
    expect(malformed.errors[0].code).toBe('invalid_score')
  })

  test('accepts score 0 through 999 and rejects out-of-range values', () => {
    expect(parseAssessmentForm({
      assessmentWindow: 'PM1',
      gradeBand: '2',
      scaleScore: '0',
      testedOn: '2026-08-19',
      reportedAchievementLevel: '',
      reportedPercentileRank: '',
    }, now).status).toBe('valid')

    expect(parseAssessmentForm({
      assessmentWindow: 'PM1',
      gradeBand: '2',
      scaleScore: '999',
      testedOn: '2026-08-19',
      reportedAchievementLevel: '',
      reportedPercentileRank: '',
    }, now).status).toBe('valid')

    const outOfRange = parseAssessmentForm({
      assessmentWindow: 'PM1',
      gradeBand: '2',
      scaleScore: '1000',
      testedOn: '2026-08-19',
      reportedAchievementLevel: '',
      reportedPercentileRank: '',
    }, now)
    if (outOfRange.status !== 'invalid') {
      throw new Error('Expected out-of-range score to be rejected.')
    }
    expect(outOfRange.errors[0].code).toBe('score_out_of_range')
  })

  test('create, update, and delete remain immutable and preserve stable record fields', () => {
    const original = [record({ assessmentId: 'assessment-a' })]
    const parsed = parseAssessmentForm({
      assessmentWindow: 'PM2',
      gradeBand: '3',
      scaleScore: '420',
      testedOn: '2026-08-19',
      reportedAchievementLevel: '2',
      reportedPercentileRank: '50',
    }, now)
    if (parsed.status !== 'valid') {
      throw new Error('Expected assessment form to be valid.')
    }

    const create = createAssessmentRecord({
      records: original,
      parsedForm: parsed.value,
      assessmentId: 'assessment-b',
      now,
    })
    expect(create.status).toBe('saved')
    expect(original).toEqual([record({ assessmentId: 'assessment-a' })])
    expect(create.records).toHaveLength(2)
    expect(create.record).toMatchObject({
      assessmentId: 'assessment-b',
      createdAt: now,
      updatedAt: now,
    })
    expect(JSON.stringify(create.record)).not.toContain('fast')

    const update = updateAssessmentRecord({
      records: create.records,
      assessmentId: 'assessment-b',
      parsedForm: {
        ...parsed.value,
        scaleScore: 421,
      },
      now: '2026-08-21T12:00:00.000Z',
    })
    expect(update.status).toBe('saved')
    expect(update.record).toMatchObject({
      assessmentId: 'assessment-b',
      createdAt: now,
      updatedAt: '2026-08-21T12:00:00.000Z',
      scaleScore: 421,
    })

    const deleteResult = deleteAssessmentRecord({
      records: update.records,
      assessmentId: 'assessment-b',
      now: '2026-08-22T12:00:00.000Z',
    })
    expect(deleteResult.status).toBe('saved')
    expect(deleteResult.records).toHaveLength(1)
    expect(deleteResult.records[0].assessmentId).toBe('assessment-a')
  })

  test('duplicate assessment IDs, duplicate entries, and record limits are rejected', () => {
    const duplicateId = createAssessmentRecord({
      records: [record({ assessmentId: 'assessment-a' })],
      parsedForm: {
        assessmentWindow: 'PM1',
        gradeBand: 2,
        scaleScore: 400,
        testedOn: '2026-08-19',
        reportedAchievementLevel: null,
        reportedPercentileRank: null,
      },
      assessmentId: 'assessment-a',
      now,
    })
    expect(duplicateId.status).toBe('invalid')

    const duplicateEntry = createAssessmentRecord({
      records: [
        record({ assessmentId: 'assessment-a', assessmentWindow: 'PM1', gradeBand: 2, testedOn: '2026-08-19' }),
      ],
      parsedForm: {
        assessmentWindow: 'PM1',
        gradeBand: 2,
        scaleScore: 401,
        testedOn: '2026-08-19',
        reportedAchievementLevel: null,
        reportedPercentileRank: null,
      },
      assessmentId: 'assessment-b',
      now,
    })
    expect(duplicateEntry.status).toBe('invalid')

    const capped = createAssessmentRecord({
      records: Array.from({ length: 30 }, (_, index) => record({ assessmentId: `assessment-${index}` })),
      parsedForm: {
        assessmentWindow: 'PM1',
        gradeBand: 2,
        scaleScore: 401,
        testedOn: '2026-08-19',
        reportedAchievementLevel: null,
        reportedPercentileRank: null,
      },
      assessmentId: 'assessment-31',
      now,
    })
    expect(capped.status).toBe('invalid')
  })

  test('display sorting is newest first with deterministic tie-breakers', () => {
    const sorted = sortAssessmentRecordsForDisplay([
      record({ assessmentId: 'b', testedOn: '2026-08-19', assessmentWindow: 'PM2', gradeBand: 3 }),
      record({ assessmentId: 'a', testedOn: '2026-08-19', assessmentWindow: 'PM3', gradeBand: 4 }),
      record({ assessmentId: 'c', testedOn: '2026-08-19', assessmentWindow: 'PM1', gradeBand: 2 }),
    ])

    expect(sorted.map((entry) => entry.assessmentId)).toEqual(['a', 'b', 'c'])
  })
})

