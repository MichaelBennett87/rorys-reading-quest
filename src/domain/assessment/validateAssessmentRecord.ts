import type {
  AssessmentGradeBand,
  AssessmentValidationError,
  AssessmentValidationResult,
  AssessmentWindow,
  OfficialAssessmentRecord,
} from './assessmentTypes'

const SUPPORTED_WINDOWS: AssessmentWindow[] = ['PM1', 'PM2', 'PM3']
const SUPPORTED_GRADES: AssessmentGradeBand[] = [2, 3, 4]

export function validateAssessmentRecord(
  record: OfficialAssessmentRecord,
  now: string,
): AssessmentValidationResult {
  const errors = validateSingleAssessmentRecord(record, now)
  return {
    status: errors.length > 0 ? 'invalid' : 'valid',
    errors,
  }
}

export function validateAssessmentRecords(
  records: readonly OfficialAssessmentRecord[],
  now: string,
): AssessmentValidationResult {
  const errors: AssessmentValidationError[] = []
  const assessmentIds = new Set<string>()
  const duplicateKeys = new Set<string>()

  for (const record of records) {
    errors.push(...validateSingleAssessmentRecord(record, now))
    const assessmentId = record.assessmentId?.trim() ?? ''
    if (assessmentId) {
      if (assessmentIds.has(assessmentId)) {
        errors.push({
          code: 'duplicate_assessment_identifier',
          field: 'assessmentId',
          assessmentId,
          message: 'Assessment IDs must be unique.',
        })
      } else {
        assessmentIds.add(assessmentId)
      }
    }
    const duplicateKey = `${record.testedOn}::${record.assessmentWindow}::${record.gradeBand}`
    if (duplicateKeys.has(duplicateKey)) {
      errors.push({
        code: 'duplicate_assessment_entry',
        field: 'testedOn',
        assessmentId: record.assessmentId,
        message: 'Duplicate assessment entries for the same date, window, and grade are not allowed.',
      })
    } else {
      duplicateKeys.add(duplicateKey)
    }
  }

  return {
    status: errors.length > 0 ? 'invalid' : 'valid',
    errors,
  }
}

function validateSingleAssessmentRecord(
  record: OfficialAssessmentRecord,
  now: string,
): AssessmentValidationError[] {
  const errors: AssessmentValidationError[] = []
  const assessmentId = record.assessmentId?.trim() ?? ''

  if (!assessmentId) {
    errors.push({
      code: 'missing_identifier',
      field: 'assessmentId',
      assessmentId: assessmentId,
      message: 'Assessment ID is required.',
    })
  }
  if (!SUPPORTED_WINDOWS.includes(record.assessmentWindow)) {
    errors.push({
      code: 'unsupported_window',
      field: 'assessmentWindow',
      assessmentId,
      message: 'Assessment window must be PM1, PM2, or PM3.',
    })
  }
  if (!SUPPORTED_GRADES.includes(record.gradeBand)) {
    errors.push({
      code: 'unsupported_grade',
      field: 'gradeBand',
      assessmentId,
      message: 'Assessment grade band must be 2, 3, or 4.',
    })
  }
  if (!Number.isInteger(record.scaleScore)) {
    errors.push({
      code: 'non_integer_score',
      field: 'scaleScore',
      assessmentId,
      message: 'Scale score must be an integer.',
    })
  } else if (record.scaleScore < 0 || record.scaleScore > 999) {
    errors.push({
      code: 'score_out_of_range',
      field: 'scaleScore',
      assessmentId,
      message: 'Scale score must be between 0 and 999.',
    })
  }
  if (!isIsoCalendarDate(record.testedOn)) {
    errors.push({
      code: 'invalid_date',
      field: 'testedOn',
      assessmentId,
      message: 'Tested-on date must be a valid ISO calendar date.',
    })
  } else if (new Date(`${record.testedOn}T23:59:59.999Z`).getTime() > new Date(now).getTime()) {
    errors.push({
      code: 'future_date',
      field: 'testedOn',
      assessmentId,
      message: 'Tested-on date cannot be in the future.',
    })
  }
  if (record.reportedAchievementLevel !== null && record.reportedAchievementLevel !== undefined) {
    if (![1, 2, 3, 4, 5].includes(record.reportedAchievementLevel)) {
      errors.push({
        code: 'invalid_achievement_level',
        field: 'reportedAchievementLevel',
        assessmentId,
        message: 'Reported achievement level must be between 1 and 5.',
      })
    }
  }
  if (record.reportedPercentileRank !== null && record.reportedPercentileRank !== undefined) {
    if (!Number.isInteger(record.reportedPercentileRank) || record.reportedPercentileRank < 1 || record.reportedPercentileRank > 99) {
      errors.push({
        code: 'invalid_percentile',
        field: 'reportedPercentileRank',
        assessmentId,
        message: 'Reported percentile rank must be an integer between 1 and 99.',
      })
    }
  }

  return errors
}

function isIsoCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}
