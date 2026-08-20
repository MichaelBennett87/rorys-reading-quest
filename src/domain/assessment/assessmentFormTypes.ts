import type { AssessmentGradeBand, AssessmentWindow } from './assessmentTypes'

export interface AssessmentFormValues {
  assessmentWindow: string
  gradeBand: string
  scaleScore: string
  testedOn: string
  reportedAchievementLevel: string
  reportedPercentileRank: string
}

export interface ParsedAssessmentForm {
  assessmentWindow: AssessmentWindow
  gradeBand: AssessmentGradeBand
  scaleScore: number
  testedOn: string
  reportedAchievementLevel: 1 | 2 | 3 | 4 | 5 | null
  reportedPercentileRank: number | null
}

export type AssessmentFormErrorCode =
  | 'missing_window'
  | 'unsupported_window'
  | 'missing_grade'
  | 'unsupported_grade'
  | 'missing_score'
  | 'invalid_score'
  | 'score_out_of_range'
  | 'invalid_date'
  | 'future_date'
  | 'invalid_achievement_level'
  | 'invalid_percentile'

export interface AssessmentFormError {
  field: keyof AssessmentFormValues
  code: AssessmentFormErrorCode
  message: string
}

export interface AssessmentFormParseSuccess {
  status: 'valid'
  value: ParsedAssessmentForm
}

export interface AssessmentFormParseFailure {
  status: 'invalid'
  errors: AssessmentFormError[]
}

export type AssessmentFormParseResult = AssessmentFormParseSuccess | AssessmentFormParseFailure
