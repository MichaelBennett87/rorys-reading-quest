import type { StorageLike } from './questProgressTypes'
import {
  WRITING_PILOT_MAX_POINTS,
  WRITING_PILOT_MAX_STROKES,
  WRITING_PILOT_NOTICE_VERSION,
  WRITING_PILOT_RECORD_LIMIT,
  WRITING_PILOT_SCHEMA_VERSION,
  createDefaultWritingPilotState,
  type InkStroke,
  type WritingFeedback,
  type WritingPilotStateV1,
  type WritingResponseRecord,
} from '../domain/writingPilot'

export const WRITING_PILOT_STORAGE_KEY = 'rorys-reading-quest.writing-pilot.v1'

export type WritingPilotStorageStatus =
  | 'loaded'
  | 'empty'
  | 'saved'
  | 'conflict'
  | 'unavailable'
  | 'invalid_json'
  | 'unsupported_version'
  | 'invalid_state'
  | 'storage_error'

export interface WritingPilotLoadResult {
  state: WritingPilotStateV1
  status: Exclude<WritingPilotStorageStatus, 'saved' | 'conflict'>
  technicalDetail?: string
}

export interface WritingPilotSaveResult {
  state: WritingPilotStateV1
  status: 'saved' | 'conflict' | 'unavailable' | 'invalid_json' | 'unsupported_version' | 'invalid_state' | 'storage_error'
  technicalDetail?: string
}

export interface WritingPilotStore {
  load(now?: string): WritingPilotLoadResult
  save(state: WritingPilotStateV1, expectedRevision: number): WritingPilotSaveResult
}

export function createLocalStorageWritingPilotStore(
  storage: StorageLike | null,
  now: () => string = () => new Date().toISOString(),
): WritingPilotStore {
  const load = (loadNow = now()): WritingPilotLoadResult => {
    if (!storage) {
      return { state: createDefaultWritingPilotState(loadNow), status: 'unavailable', technicalDetail: 'Writing storage is unavailable.' }
    }
    let raw: string | null
    try {
      raw = storage.getItem(WRITING_PILOT_STORAGE_KEY)
    } catch (error) {
      return { state: createDefaultWritingPilotState(loadNow), status: 'storage_error', technicalDetail: errorMessage(error) }
    }
    if (raw === null) return { state: createDefaultWritingPilotState(loadNow), status: 'empty' }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      return { state: createDefaultWritingPilotState(loadNow), status: 'invalid_json', technicalDetail: errorMessage(error) }
    }
    const validated = validateWritingPilotState(parsed)
    if (!validated.valid) {
      return { state: createDefaultWritingPilotState(loadNow), status: validated.status, technicalDetail: validated.reason }
    }
    return { state: pruneWritingPilotState(validated.state, loadNow), status: 'loaded' }
  }

  return {
    load,
    save(state, expectedRevision) {
      if (!storage) return { state, status: 'unavailable', technicalDetail: 'Writing storage is unavailable.' }
      const current = load(now())
      if (!['loaded', 'empty'].includes(current.status)) {
        const status: WritingPilotSaveResult['status'] = current.status === 'loaded' || current.status === 'empty'
          ? 'storage_error'
          : current.status
        return { state: current.state, status, technicalDetail: current.technicalDetail }
      }
      if (current.state.revision !== expectedRevision) {
        return { state: current.state, status: 'conflict', technicalDetail: 'A newer writing record is already saved.' }
      }
      const validation = validateWritingPilotState(state)
      if (!validation.valid) return { state: current.state, status: 'invalid_state', technicalDetail: validation.reason }
      const normalized = pruneWritingPilotState({
        ...validation.state,
        revision: expectedRevision + 1,
        updatedAt: now(),
      }, now())
      const serialized = JSON.stringify(normalized)
      try {
        storage.setItem(WRITING_PILOT_STORAGE_KEY, serialized)
        if (storage.getItem(WRITING_PILOT_STORAGE_KEY) !== serialized) {
          return { state: current.state, status: 'storage_error', technicalDetail: 'Writing storage did not retain the accepted bytes.' }
        }
        return { state: normalized, status: 'saved' }
      } catch (error) {
        return { state: current.state, status: 'storage_error', technicalDetail: errorMessage(error) }
      }
    },
  }
}

export function pruneWritingPilotState(state: WritingPilotStateV1, now: string): WritingPilotStateV1 {
  const cutoff = Date.parse(now)
  const records = state.records
    .filter((record) => !Number.isFinite(cutoff) || Date.parse(record.expiresAt) > cutoff || record.recordId === state.pendingRecordId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .slice(-WRITING_PILOT_RECORD_LIMIT)
  const ids = new Set(records.map((record) => record.recordId))
  return {
    ...state,
    records,
    pendingRecordId: state.pendingRecordId && ids.has(state.pendingRecordId) ? state.pendingRecordId : null,
    offeredActivityIds: [...new Set(state.offeredActivityIds)].slice(-WRITING_PILOT_RECORD_LIMIT * 2),
  }
}

export function normalizeInkStrokes(strokes: readonly InkStroke[]): InkStroke[] {
  const normalized: InkStroke[] = []
  let pointCount = 0
  for (const stroke of strokes.slice(0, WRITING_PILOT_MAX_STROKES)) {
    const points = []
    for (const point of stroke.points) {
      if (pointCount >= WRITING_PILOT_MAX_POINTS) break
      if (![point.x, point.y, point.pressure, point.elapsedMs].every(Number.isFinite)) continue
      points.push({
        x: clamp(point.x, 0, 1),
        y: clamp(point.y, 0, 1),
        pressure: clamp(point.pressure, 0, 1),
        elapsedMs: Math.max(0, Math.round(point.elapsedMs)),
      })
      pointCount += 1
    }
    if (points.length > 0) {
      normalized.push({
        strokeId: stroke.strokeId.trim().slice(0, 100),
        pointerType: ['pen', 'touch', 'mouse'].includes(stroke.pointerType) ? stroke.pointerType : 'unknown',
        points,
      })
    }
  }
  return normalized
}

export function validateWritingPilotState(value: unknown):
  | { valid: true; state: WritingPilotStateV1 }
  | { valid: false; status: 'unsupported_version' | 'invalid_state'; reason: string } {
  if (!isRecord(value)) return invalid('Writing pilot state must be an object.')
  if (value.schemaVersion !== WRITING_PILOT_SCHEMA_VERSION) {
    return { valid: false, status: 'unsupported_version', reason: `Unsupported writing schema version: ${String(value.schemaVersion)}` }
  }
  if (!Number.isSafeInteger(value.revision) || Number(value.revision) < 0) return invalid('Writing revision is invalid.')
  if (!isRecord(value.settings) || typeof value.settings.enabled !== 'boolean' || typeof value.settings.externalProcessingEnabled !== 'boolean') {
    return invalid('Writing settings are malformed.')
  }
  if (value.settings.consent !== null) {
    if (!isRecord(value.settings.consent)
      || value.settings.consent.noticeVersion !== WRITING_PILOT_NOTICE_VERSION
      || typeof value.settings.consent.acceptedAt !== 'string'
      || !Array.isArray(value.settings.consent.disclosures)) return invalid('Writing consent record is malformed.')
  }
  if (!Array.isArray(value.records) || value.records.length > WRITING_PILOT_RECORD_LIMIT) return invalid('Writing records exceed the bounded limit.')
  if (!Array.isArray(value.offeredActivityIds) || !value.offeredActivityIds.every((entry) => typeof entry === 'string')) return invalid('Writing activity history is malformed.')
  if (value.pendingRecordId !== null && typeof value.pendingRecordId !== 'string') return invalid('Pending writing identity is malformed.')
  if (typeof value.createdAt !== 'string' || typeof value.updatedAt !== 'string') return invalid('Writing timestamps are missing.')
  const records = value.records as unknown[]
  if (!records.every(validateRecord)) return invalid('One or more writing records are malformed.')
  const pendingMatches = value.pendingRecordId === null
    || records.some((record) => (record as WritingResponseRecord).recordId === value.pendingRecordId)
  if (!pendingMatches) return invalid('Pending writing record does not exist.')
  return { valid: true, state: value as unknown as WritingPilotStateV1 }
}

function validateRecord(value: unknown): value is WritingResponseRecord {
  if (!isRecord(value)) return false
  const strings = ['recordId', 'submissionId', 'activityId', 'sourcePassageId', 'sourceContentVersion', 'rubricVersion', 'sourceCompletionId', 'typedDraft', 'createdAt', 'updatedAt', 'expiresAt']
  if (!strings.every((field) => typeof value[field] === 'string')) return false
  if (!Number.isSafeInteger(value.inkRevision) || Number(value.inkRevision) < 0) return false
  if (!Array.isArray(value.strokes) || normalizeInkStrokes(value.strokes as InkStroke[]).length !== value.strokes.length) return false
  if (!Array.isArray(value.recognitionUncertainties) || !Array.isArray(value.requests) || !Array.isArray(value.parentReviewEvents)) return false
  if (!isRecord(value.suggestionDispositions)) return false
  if (value.feedback !== null && !validateWritingFeedback(value.feedback)) return false
  return true
}

export function validateWritingFeedback(value: unknown): value is WritingFeedback {
  if (!isRecord(value) || typeof value.understood !== 'string' || !Array.isArray(value.improvements) || value.improvements.length > 2) return false
  if (typeof value.parentReviewRequired !== 'boolean' || (value.uncertaintyReason !== null && typeof value.uncertaintyReason !== 'string')) return false
  for (const key of ['comprehension', 'supportingEvidence', 'spelling', 'grammar', 'capitalizationPunctuation']) {
    const category = value[key]
    if (!isRecord(category) || !['meets', 'developing', 'needs_revision', 'withheld'].includes(String(category.status)) || typeof category.message !== 'string' || !Array.isArray(category.evidenceIds)) return false
  }
  return value.improvements.every((improvement) => isRecord(improvement)
    && typeof improvement.suggestionId === 'string'
    && typeof improvement.category === 'string'
    && (improvement.originalText === null || typeof improvement.originalText === 'string')
    && (improvement.replacementText === null || typeof improvement.replacementText === 'string')
    && typeof improvement.explanation === 'string')
}

function invalid(reason: string) {
  return { valid: false as const, status: 'invalid_state' as const, reason }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
