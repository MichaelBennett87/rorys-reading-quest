export type AssessmentWindow = 'PM1' | 'PM2' | 'PM3'

export type AssessmentGradeBand = 2 | 3 | 4

export interface OfficialAssessmentRecord {
  assessmentId: string
  assessmentWindow: AssessmentWindow
  gradeBand: AssessmentGradeBand
  scaleScore: number
  testedOn: string
  reportedAchievementLevel?: 1 | 2 | 3 | 4 | 5 | null
  reportedPercentileRank?: number | null
  createdAt: string
  updatedAt: string
}

export type AssessmentValidationErrorCode =
  | 'missing_identifier'
  | 'unsupported_window'
  | 'unsupported_grade'
  | 'non_integer_score'
  | 'score_out_of_range'
  | 'invalid_date'
  | 'future_date'
  | 'invalid_achievement_level'
  | 'invalid_percentile'
  | 'duplicate_assessment_entry'
  | 'duplicate_assessment_identifier'

export interface AssessmentValidationError {
  code: AssessmentValidationErrorCode
  field: string
  message: string
  assessmentId: string
}

export interface AssessmentValidationResult {
  status: 'valid' | 'invalid'
  errors: AssessmentValidationError[]
}
