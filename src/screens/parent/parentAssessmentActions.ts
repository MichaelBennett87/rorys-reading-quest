import type { AssessmentFormError, AssessmentFormValues, OfficialAssessmentRecord } from '../../domain/assessment'

export type ParentAssessmentMutationStatus = 'saved' | 'invalid' | 'not_found' | 'storage_error' | 'unavailable'

export interface ParentAssessmentMutationResult {
  status: ParentAssessmentMutationStatus
  message: string
  fieldErrors: AssessmentFormError[]
  records: OfficialAssessmentRecord[]
  record?: OfficialAssessmentRecord
}

export interface ParentAssessmentCreateHandler {
  (values: AssessmentFormValues): ParentAssessmentMutationResult
}

export interface ParentAssessmentUpdateHandler {
  (assessmentId: string, values: AssessmentFormValues): ParentAssessmentMutationResult
}

export interface ParentAssessmentDeleteHandler {
  (assessmentId: string): ParentAssessmentMutationResult
}
