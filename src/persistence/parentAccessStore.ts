import type { StorageLike } from './questProgressTypes'
import type { ParentPinRecord } from '../services/parentAccess'

export const PARENT_ACCESS_SCHEMA_VERSION = 1 as const
export const PARENT_ACCESS_STORAGE_KEY = 'rorys-reading-quest.parent-access.v1'

export interface ParentAccessLoadResult {
  state: ParentPinRecord | null
  status: 'loaded' | 'empty' | 'unavailable' | 'invalid_json' | 'unsupported_version' | 'invalid_state' | 'storage_error'
  technicalDetail?: string
}

export interface ParentAccessSaveResult {
  state: ParentPinRecord
  status: 'saved' | 'unavailable' | 'storage_error'
  technicalDetail?: string
}

export interface ParentAccessStore {
  load(): ParentAccessLoadResult
  save(state: ParentPinRecord): ParentAccessSaveResult
}

export function createDefaultParentAccessState(): ParentPinRecord | null {
  return null
}

export function createLocalStorageParentAccessStore(storage: StorageLike | null): ParentAccessStore {
  return {
    load(): ParentAccessLoadResult {
      if (!storage) return { state: null, status: 'unavailable', technicalDetail: 'Browser storage is unavailable.' }
      let raw: string | null
      try {
        raw = storage.getItem(PARENT_ACCESS_STORAGE_KEY)
      } catch (error) {
        return { state: null, status: 'storage_error', technicalDetail: errorMessage(error) }
      }
      if (raw === null) return { state: null, status: 'empty' }
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch (error) {
        return { state: null, status: 'invalid_json', technicalDetail: errorMessage(error) }
      }
      const validated = validateParentAccessRecord(parsed)
      if (!validated.valid) {
        return { state: null, status: validated.reason.status, technicalDetail: validated.reason.message }
      }
      return { state: validated.record, status: 'loaded' }
    },
    save(state: ParentPinRecord): ParentAccessSaveResult {
      if (!storage) return { state, status: 'unavailable', technicalDetail: 'Browser storage is unavailable.' }
      try {
        storage.setItem(PARENT_ACCESS_STORAGE_KEY, JSON.stringify(normalizeParentAccessRecord(state)))
        return { state, status: 'saved' }
      } catch (error) {
        return { state, status: 'storage_error', technicalDetail: errorMessage(error) }
      }
    },
  }
}

export function validateParentAccessRecord(value: unknown): { valid: true; record: ParentPinRecord } | { valid: false; reason: { status: 'unsupported_version' | 'invalid_state'; message: string } } {
  if (!isRecord(value)) return { valid: false, reason: { status: 'invalid_state', message: 'Persisted parent access record must be an object.' } }
  if (value.schemaVersion !== PARENT_ACCESS_SCHEMA_VERSION) {
    return { valid: false, reason: { status: 'unsupported_version', message: `Unsupported parent access schema version: ${String(value.schemaVersion)}` } }
  }
  if (
    typeof value.pinHash !== 'string'
    || typeof value.pinSalt !== 'string'
    || value.hashAlgorithm !== 'PBKDF2-SHA-256'
    || !Number.isInteger(value.hashIterations)
    || typeof value.createdAt !== 'string'
    || typeof value.updatedAt !== 'string'
  ) {
    return { valid: false, reason: { status: 'invalid_state', message: 'Persisted parent access record is malformed.' } }
  }
  return { valid: true, record: normalizeParentAccessRecord(value as unknown as ParentPinRecord) }
}

function normalizeParentAccessRecord(record: ParentPinRecord): ParentPinRecord {
  return {
    ...record,
    pinHash: record.pinHash.trim(),
    pinSalt: record.pinSalt.trim(),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
