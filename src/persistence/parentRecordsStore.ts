import { type OfficialAssessmentRecord, validateAssessmentRecords } from '../domain/assessment'
import { type StorageLike } from './questProgressTypes'

export const PARENT_RECORDS_SCHEMA_VERSION = 1 as const
export const PARENT_RECORDS_STORAGE_KEY = 'rorys-reading-quest.parent-records.v1'
export const PARENT_RECORD_LIMIT = 30

export interface ParentRecordsState {
  schemaVersion: typeof PARENT_RECORDS_SCHEMA_VERSION
  officialAssessments: OfficialAssessmentRecord[]
  createdAt: string
  updatedAt: string
}

export interface ParentRecordsLoadResult {
  state: ParentRecordsState
  status: 'loaded' | 'empty' | 'unavailable' | 'invalid_json' | 'unsupported_version' | 'invalid_state' | 'storage_error'
  technicalDetail?: string
}

export interface ParentRecordsSaveResult {
  state: ParentRecordsState
  status: 'saved' | 'unavailable' | 'storage_error'
  technicalDetail?: string
}

export interface ParentRecordsStore {
  load(now?: string): ParentRecordsLoadResult
  save(state: ParentRecordsState): ParentRecordsSaveResult
}

export function createDefaultParentRecords(now: string): ParentRecordsState {
  return {
    schemaVersion: PARENT_RECORDS_SCHEMA_VERSION,
    officialAssessments: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createLocalStorageParentRecordsStore(storage: StorageLike | null, now: () => string = () => new Date().toISOString()): ParentRecordsStore {
  return {
    load(loadNow = now()): ParentRecordsLoadResult {
      if (!storage) {
        return { state: createDefaultParentRecords(loadNow), status: 'unavailable', technicalDetail: 'Browser storage is unavailable.' }
      }
      let raw: string | null
      try {
        raw = storage.getItem(PARENT_RECORDS_STORAGE_KEY)
      } catch (error) {
        return { state: createDefaultParentRecords(loadNow), status: 'storage_error', technicalDetail: errorMessage(error) }
      }
      if (raw === null) return { state: createDefaultParentRecords(loadNow), status: 'empty' }
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch (error) {
        return { state: createDefaultParentRecords(loadNow), status: 'invalid_json', technicalDetail: errorMessage(error) }
      }
      const validated = validateParentRecordsState(parsed, loadNow)
      if (validated.status !== 'valid') {
        return { state: createDefaultParentRecords(loadNow), status: validated.status, technicalDetail: validated.reason }
      }
      return { state: normalizeParentRecordsForSave(validated.state), status: 'loaded' }
    },
    save(state: ParentRecordsState): ParentRecordsSaveResult {
      const normalized = normalizeParentRecordsForSave(state)
      if (!storage) {
        return { state: normalized, status: 'unavailable', technicalDetail: 'Browser storage is unavailable.' }
      }
      try {
        storage.setItem(PARENT_RECORDS_STORAGE_KEY, JSON.stringify(normalized))
        return { state: normalized, status: 'saved' }
      } catch (error) {
        return { state: normalized, status: 'storage_error', technicalDetail: errorMessage(error) }
      }
    },
  }
}

export function validateParentRecordsState(
  value: unknown,
  now: string,
): { status: 'valid'; state: ParentRecordsState } | { status: 'unsupported_version' | 'invalid_state'; reason: string } {
  if (!isRecord(value)) return { status: 'invalid_state', reason: 'Persisted parent records must be an object.' }
  if (value.schemaVersion !== PARENT_RECORDS_SCHEMA_VERSION) {
    return { status: 'unsupported_version', reason: `Unsupported parent records schema version: ${String(value.schemaVersion)}` }
  }
  if (
    !Array.isArray(value.officialAssessments)
    || typeof value.createdAt !== 'string'
    || typeof value.updatedAt !== 'string'
  ) {
    return { status: 'invalid_state', reason: 'Persisted parent records are missing required fields.' }
  }

  if (value.officialAssessments.length > PARENT_RECORD_LIMIT) {
    return { status: 'invalid_state', reason: `No more than ${PARENT_RECORD_LIMIT} official assessments may be stored.` }
  }

  const assessmentValidation = validateAssessmentRecords(value.officialAssessments as OfficialAssessmentRecord[], now)
  if (assessmentValidation.status !== 'valid') {
    return { status: 'invalid_state', reason: assessmentValidation.errors[0]?.message ?? 'Official assessment records are malformed.' }
  }

  return {
    status: 'valid',
    state: normalizeParentRecordsForSave({
      schemaVersion: PARENT_RECORDS_SCHEMA_VERSION,
      officialAssessments: value.officialAssessments as OfficialAssessmentRecord[],
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    }),
  }
}

export function normalizeParentRecordsForSave(state: ParentRecordsState): ParentRecordsState {
  const uniqueAssessments = new Map<string, OfficialAssessmentRecord>()
  for (const record of state.officialAssessments) {
    uniqueAssessments.set(record.assessmentId, {
      ...record,
      assessmentId: record.assessmentId.trim(),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }
  const sorted = [...uniqueAssessments.values()].sort((left, right) => (
    left.testedOn.localeCompare(right.testedOn)
    || left.assessmentWindow.localeCompare(right.assessmentWindow)
    || left.gradeBand - right.gradeBand
    || left.assessmentId.localeCompare(right.assessmentId)
  ))
  return {
    ...state,
    officialAssessments: sorted.slice(-PARENT_RECORD_LIMIT),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
