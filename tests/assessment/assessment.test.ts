import { describe, expect, test } from 'vitest'

import {
  validateAssessmentRecord,
  validateAssessmentRecords,
  type OfficialAssessmentRecord,
} from '../../src/domain/assessment'

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

describe('assessment record model', () => {
  test('valid PM1, PM2, and PM3 records pass validation', () => {
    expect(validateAssessmentRecord(record({ assessmentWindow: 'PM1' }), now).status).toBe('valid')
    expect(validateAssessmentRecord(record({ assessmentWindow: 'PM2' }), now).status).toBe('valid')
    expect(validateAssessmentRecord(record({ assessmentWindow: 'PM3' }), now).status).toBe('valid')
  })

  test('unsupported window, grade, non-integer score, invalid date, and future date fail', () => {
    expect(validateAssessmentRecord(record({ assessmentWindow: 'PMX' as never }), now).errors[0].code).toBe('unsupported_window')
    expect(validateAssessmentRecord(record({ gradeBand: 5 as never }), now).errors[0].code).toBe('unsupported_grade')
    expect(validateAssessmentRecord(record({ scaleScore: 400.5 }), now).errors[0].code).toBe('non_integer_score')
    expect(validateAssessmentRecord(record({ testedOn: '2026-13-40' }), now).errors[0].code).toBe('invalid_date')
    expect(validateAssessmentRecord(record({ testedOn: '2026-08-21' }), now).errors[0].code).toBe('future_date')
  })

  test('achievement level and percentile bounds are enforced', () => {
    expect(validateAssessmentRecord(record({ reportedAchievementLevel: 6 as never }), now).errors[0].code).toBe('invalid_achievement_level')
    expect(validateAssessmentRecord(record({ reportedPercentileRank: 0 }), now).errors[0].code).toBe('invalid_percentile')
  })

  test('duplicate same-date, same-window, same-grade entries are flagged', () => {
    const result = validateAssessmentRecords([
      record({ assessmentId: 'assessment-a' }),
      record({ assessmentId: 'assessment-b' }),
    ], now)
    expect(result.status).toBe('invalid')
    expect(result.errors.some((error) => error.code === 'duplicate_assessment_entry')).toBe(true)
  })

  test('records contain no child surname, student id, or report image fields', () => {
    const assessment = record()
    const serialized = JSON.stringify(assessment).toLowerCase()
    expect(serialized).not.toContain('surname')
    expect(serialized).not.toContain('studentid')
    expect(serialized).not.toContain('reportimage')
    expect('childSurname' in assessment).toBe(false)
    expect('studentId' in assessment).toBe(false)
    expect('reportImage' in assessment).toBe(false)
  })
})
