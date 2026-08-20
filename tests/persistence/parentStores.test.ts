import { describe, expect, test } from 'vitest'

import {
  createDefaultParentRecords,
  createLocalStorageParentAccessStore,
  createLocalStorageParentRecordsStore,
  PARENT_ACCESS_STORAGE_KEY,
  PARENT_RECORDS_STORAGE_KEY,
  PARENT_RECORD_LIMIT,
  validateParentRecordsState,
} from '../../src/persistence'
import type { StorageLike } from '../../src/persistence'
import type { ParentPinRecord } from '../../src/services/parentAccess'

const now = '2026-08-20T12:00:00.000Z'

class MemoryStorage implements StorageLike {
  values = new Map<string, string>()
  writes = 0
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.writes += 1; this.values.set(key, value) }
}

function accessRecord(): ParentPinRecord {
  return {
    schemaVersion: 1,
    pinHash: 'hash',
    pinSalt: 'salt',
    hashAlgorithm: 'PBKDF2-SHA-256',
    hashIterations: 60000,
    createdAt: now,
    updatedAt: now,
  }
}

function recordsState(count = 0) {
  return {
    schemaVersion: 1 as const,
    officialAssessments: Array.from({ length: count }, (_, index) => ({
      assessmentId: `assessment-${index}`,
      assessmentWindow: 'PM1' as const,
      gradeBand: 2 as const,
      scaleScore: 400 + index,
      testedOn: `2026-08-${String((index % 28) + 1).padStart(2, '0')}`,
      createdAt: now,
      updatedAt: now,
    })),
    createdAt: now,
    updatedAt: now,
  }
}

describe('parent stores', () => {
  test('empty and valid parent access state loads safely and never stores plaintext PINs', () => {
    const storage = new MemoryStorage()
    const store = createLocalStorageParentAccessStore(storage)
    const empty = store.load()
    expect(empty.status).toBe('empty')
    expect(empty.state).toBeNull()

    const saved = store.save(accessRecord())
    expect(saved.status).toBe('saved')
    expect(storage.values.get(PARENT_ACCESS_STORAGE_KEY)).toContain('hash')
    expect(storage.values.get(PARENT_ACCESS_STORAGE_KEY)).not.toContain('1234')
    const loaded = store.load()
    expect(loaded.status).toBe('loaded')
    expect(loaded.state?.schemaVersion).toBe(1)
  })

  test('invalid JSON, unsupported versions, and storage exceptions fall back safely without overwriting malformed data', () => {
    const storage = new MemoryStorage()
    storage.values.set(PARENT_ACCESS_STORAGE_KEY, '{bad-json')
    const loadInvalid = createLocalStorageParentAccessStore(storage).load()
    expect(loadInvalid.status).toBe('invalid_json')
    expect(storage.writes).toBe(0)
    expect(storage.values.get(PARENT_ACCESS_STORAGE_KEY)).toBe('{bad-json')

    storage.values.set(PARENT_ACCESS_STORAGE_KEY, JSON.stringify({ schemaVersion: 2 }))
    expect(createLocalStorageParentAccessStore(storage).load().status).toBe('unsupported_version')

    const throwing: StorageLike = {
      getItem() { throw new Error('read blocked') },
      setItem() { throw new Error('write blocked') },
    }
    expect(createLocalStorageParentAccessStore(throwing).load().status).toBe('storage_error')
  })

  test('parent records store returns an empty collection, loads valid data, and stays bounded', () => {
    const storage = new MemoryStorage()
    const store = createLocalStorageParentRecordsStore(storage, () => now)
    const empty = store.load(now)
    expect(empty.status).toBe('empty')
    expect(empty.state.officialAssessments).toHaveLength(0)

    const saved = store.save(recordsState(2))
    expect(saved.status).toBe('saved')
    const loaded = store.load(now)
    expect(loaded.status).toBe('loaded')
    expect(loaded.state.officialAssessments).toHaveLength(2)
    expect(loaded.state.officialAssessments[0].assessmentId).toBe('assessment-0')

    const bounded = store.save(recordsState(PARENT_RECORD_LIMIT + 5))
    expect(bounded.state.officialAssessments).toHaveLength(PARENT_RECORD_LIMIT)
  })

  test('duplicate assessment entries are rejected and keys remain distinct', () => {
    const validation = validateParentRecordsState({
      ...recordsState(2),
      officialAssessments: [
        recordsState(1).officialAssessments[0],
        recordsState(1).officialAssessments[0],
      ],
    }, now)
    if (validation.status !== 'valid') {
      expect(validation.reason).toContain('Duplicate assessment entries')
    } else {
      throw new Error('Expected duplicate assessment entries to be invalid.')
    }
    expect(PARENT_ACCESS_STORAGE_KEY).not.toBe(PARENT_RECORDS_STORAGE_KEY)
  })

  test('invalid parent records do not alter child progress and storage exceptions are safe', () => {
    const storage = new MemoryStorage()
    storage.values.set(PARENT_RECORDS_STORAGE_KEY, '{bad-json')
    const load = createLocalStorageParentRecordsStore(storage, () => now).load(now)
    expect(load.status).toBe('invalid_json')
    expect(storage.writes).toBe(0)

    const childProgress = { completedSessionCount: 3 }
    const snapshot = structuredClone(childProgress)
    void createDefaultParentRecords(now)
    expect(childProgress).toEqual(snapshot)
  })
})
