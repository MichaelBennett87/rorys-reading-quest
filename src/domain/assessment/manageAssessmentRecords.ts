import type { AssessmentFormParseResult, ParsedAssessmentForm } from './assessmentFormTypes'
import { validateAssessmentRecords } from './validateAssessmentRecord'
import type { OfficialAssessmentRecord } from './assessmentTypes'

export interface AssessmentMutationResult {
  status: 'saved' | 'invalid' | 'not_found'
  records: OfficialAssessmentRecord[]
  record?: OfficialAssessmentRecord
  message: string
  errors: string[]
}

export interface CreateAssessmentRecordInput {
  records: readonly OfficialAssessmentRecord[]
  parsedForm: ParsedAssessmentForm
  assessmentId: string
  now: string
}

export interface UpdateAssessmentRecordInput {
  records: readonly OfficialAssessmentRecord[]
  assessmentId: string
  parsedForm: ParsedAssessmentForm
  now: string
}

export interface DeleteAssessmentRecordInput {
  records: readonly OfficialAssessmentRecord[]
  assessmentId: string
  now: string
}

export function createAssessmentRecord(input: CreateAssessmentRecordInput): AssessmentMutationResult {
  const trimmedId = input.assessmentId.trim()
  if (!trimmedId) {
    return invalidResult(input.records, 'Assessment ID is required.')
  }
  const candidate: OfficialAssessmentRecord = {
    assessmentId: trimmedId,
    assessmentWindow: input.parsedForm.assessmentWindow,
    gradeBand: input.parsedForm.gradeBand,
    scaleScore: input.parsedForm.scaleScore,
    testedOn: input.parsedForm.testedOn,
    reportedAchievementLevel: input.parsedForm.reportedAchievementLevel,
    reportedPercentileRank: input.parsedForm.reportedPercentileRank,
    createdAt: input.now,
    updatedAt: input.now,
  }
  const nextRecords = [...input.records, candidate]
  if (nextRecords.length > 30) {
    return invalidResult(input.records, 'No more than 30 official assessments may be stored.')
  }
  const validation = validateAssessmentRecords(nextRecords, input.now)
  if (validation.status !== 'valid') {
    return invalidResult(input.records, validation.errors[0]?.message ?? 'Official assessment records are malformed.')
  }
  return {
    status: 'saved',
    records: nextRecords,
    record: candidate,
    message: 'Assessment saved.',
    errors: [],
  }
}

export function updateAssessmentRecord(input: UpdateAssessmentRecordInput): AssessmentMutationResult {
  const index = input.records.findIndex((record) => record.assessmentId === input.assessmentId)
  if (index < 0) {
    return {
      status: 'not_found',
      records: [...input.records],
      message: 'Assessment record was not found.',
      errors: [],
    }
  }
  const original = input.records[index]
  const candidate: OfficialAssessmentRecord = {
    ...original,
    assessmentWindow: input.parsedForm.assessmentWindow,
    gradeBand: input.parsedForm.gradeBand,
    scaleScore: input.parsedForm.scaleScore,
    testedOn: input.parsedForm.testedOn,
    reportedAchievementLevel: input.parsedForm.reportedAchievementLevel,
    reportedPercentileRank: input.parsedForm.reportedPercentileRank,
    updatedAt: input.now,
  }
  const nextRecords = [...input.records.slice(0, index), candidate, ...input.records.slice(index + 1)]
  const validation = validateAssessmentRecords(nextRecords, input.now)
  if (validation.status !== 'valid') {
    return invalidResult(input.records, validation.errors[0]?.message ?? 'Official assessment records are malformed.')
  }
  return {
    status: 'saved',
    records: nextRecords,
    record: candidate,
    message: 'Assessment updated.',
    errors: [],
  }
}

export function deleteAssessmentRecord(input: DeleteAssessmentRecordInput): AssessmentMutationResult {
  const index = input.records.findIndex((record) => record.assessmentId === input.assessmentId)
  if (index < 0) {
    return {
      status: 'not_found',
      records: [...input.records],
      message: 'Assessment record was not found.',
      errors: [],
    }
  }
  const nextRecords = [...input.records.slice(0, index), ...input.records.slice(index + 1)]
  const validation = validateAssessmentRecords(nextRecords, input.now)
  if (validation.status !== 'valid') {
    return invalidResult(input.records, validation.errors[0]?.message ?? 'Official assessment records are malformed.')
  }
  return {
    status: 'saved',
    records: nextRecords,
    record: input.records[index],
    message: 'Assessment deleted.',
    errors: [],
  }
}

export function sortAssessmentRecordsForDisplay(records: readonly OfficialAssessmentRecord[]): OfficialAssessmentRecord[] {
  return [...records].sort((left, right) => (
    right.testedOn.localeCompare(left.testedOn)
    || displayWindowOrder(left.assessmentWindow) - displayWindowOrder(right.assessmentWindow)
    || right.gradeBand - left.gradeBand
    || left.assessmentId.localeCompare(right.assessmentId)
  ))
}

export function isAssessmentFormValid(result: AssessmentFormParseResult): result is { status: 'valid'; value: ParsedAssessmentForm } {
  return result.status === 'valid'
}

function invalidResult(records: readonly OfficialAssessmentRecord[], message: string): AssessmentMutationResult {
  return {
    status: 'invalid',
    records: [...records],
    message,
    errors: [message],
  }
}

function displayWindowOrder(window: OfficialAssessmentRecord['assessmentWindow']): number {
  if (window === 'PM3') return 0
  if (window === 'PM2') return 1
  return 2
}
