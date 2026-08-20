import type {
  AssessmentFormError,
  AssessmentFormParseResult,
  AssessmentFormValues,
} from './assessmentFormTypes'
import type { AssessmentGradeBand, AssessmentWindow } from './assessmentTypes'

const SUPPORTED_WINDOWS: AssessmentWindow[] = ['PM1', 'PM2', 'PM3']

export function parseAssessmentForm(values: AssessmentFormValues, now: string): AssessmentFormParseResult {
  const trimmed = trimAssessmentFormValues(values)
  const errors: AssessmentFormError[] = []

  const assessmentWindow = parseAssessmentWindow(trimmed.assessmentWindow, errors)
  const gradeBand = parseAssessmentGradeBand(trimmed.gradeBand, errors)
  const scaleScore = parseStrictInteger(trimmed.scaleScore, 'scaleScore', errors)
  const testedOn = parseTestedOn(trimmed.testedOn, now, errors)
  const reportedAchievementLevel = parseOptionalLevel(trimmed.reportedAchievementLevel, errors)
  const reportedPercentileRank = parseOptionalPercentile(trimmed.reportedPercentileRank, errors)

  if (assessmentWindow && gradeBand && scaleScore !== null && testedOn && reportedAchievementLevel !== undefined && reportedPercentileRank !== undefined) {
    return {
      status: 'valid',
      value: {
        assessmentWindow,
        gradeBand,
        scaleScore,
        testedOn,
        reportedAchievementLevel,
        reportedPercentileRank,
      },
    }
  }

  return { status: 'invalid', errors }
}

function trimAssessmentFormValues(values: AssessmentFormValues): AssessmentFormValues {
  return {
    assessmentWindow: values.assessmentWindow.trim(),
    gradeBand: values.gradeBand.trim(),
    scaleScore: values.scaleScore.trim(),
    testedOn: values.testedOn.trim(),
    reportedAchievementLevel: values.reportedAchievementLevel.trim(),
    reportedPercentileRank: values.reportedPercentileRank.trim(),
  }
}

function parseAssessmentWindow(value: string, errors: AssessmentFormError[]): AssessmentWindow | null {
  if (!value) {
    errors.push({ field: 'assessmentWindow', code: 'missing_window', message: 'Assessment window is required.' })
    return null
  }
  if (!SUPPORTED_WINDOWS.includes(value as AssessmentWindow)) {
    errors.push({ field: 'assessmentWindow', code: 'unsupported_window', message: 'Assessment window must be PM1, PM2, or PM3.' })
    return null
  }
  return value as AssessmentWindow
}

function parseAssessmentGradeBand(value: string, errors: AssessmentFormError[]): AssessmentGradeBand | null {
  if (!value) {
    errors.push({ field: 'gradeBand', code: 'missing_grade', message: 'Grade is required.' })
    return null
  }
  if (!/^[234]$/.test(value)) {
    errors.push({ field: 'gradeBand', code: 'unsupported_grade', message: 'Grade must be 2, 3, or 4.' })
    return null
  }
  return Number(value) as AssessmentGradeBand
}

function parseStrictInteger(value: string, field: 'scaleScore', errors: AssessmentFormError[]): number | null {
  if (!value) {
    errors.push({ field, code: 'missing_score', message: 'Scale score is required.' })
    return null
  }
  if (!/^(0|[1-9]\d*)$/.test(value)) {
    errors.push({ field, code: 'invalid_score', message: 'Scale score must be a whole number.' })
    return null
  }
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 999) {
    errors.push({ field, code: 'score_out_of_range', message: 'Scale score must be between 0 and 999.' })
    return null
  }
  return parsed
}

function parseTestedOn(value: string, now: string, errors: AssessmentFormError[]): string | null {
  if (!isIsoCalendarDate(value)) {
    errors.push({ field: 'testedOn', code: 'invalid_date', message: 'Tested-on date must be a valid ISO calendar date.' })
    return null
  }
  if (new Date(`${value}T23:59:59.999Z`).getTime() > new Date(now).getTime()) {
    errors.push({ field: 'testedOn', code: 'future_date', message: 'Tested-on date cannot be in the future.' })
    return null
  }
  return value
}

function parseOptionalLevel(value: string, errors: AssessmentFormError[]): 1 | 2 | 3 | 4 | 5 | null | undefined {
  if (!value) return null
  if (!/^[1-5]$/.test(value)) {
    errors.push({ field: 'reportedAchievementLevel', code: 'invalid_achievement_level', message: 'Reported achievement level must be between 1 and 5.' })
    return undefined
  }
  return Number(value) as 1 | 2 | 3 | 4 | 5
}

function parseOptionalPercentile(value: string, errors: AssessmentFormError[]): number | null | undefined {
  if (!value) return null
  if (!/^(?:[1-9]|[1-9]\d)$/.test(value)) {
    errors.push({ field: 'reportedPercentileRank', code: 'invalid_percentile', message: 'Reported percentile rank must be an integer between 1 and 99.' })
    return undefined
  }
  return Number(value)
}

function isIsoCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}
