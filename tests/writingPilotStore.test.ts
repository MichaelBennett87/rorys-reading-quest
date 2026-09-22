import { describe, expect, it } from 'vitest'
import {
  WRITING_PILOT_MAX_POINTS,
  WRITING_PILOT_MAX_STROKES,
  createDefaultWritingPilotState,
  type InkStroke,
} from '../src/domain/writingPilot'
import {
  WRITING_PILOT_STORAGE_KEY,
  createLocalStorageWritingPilotStore,
  normalizeInkStrokes,
} from '../src/persistence'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

describe('writing pilot persistence', () => {
  it('is separate, disabled by default, revisioned, and compare-before-write protected', () => {
    const storage = new MemoryStorage()
    const store = createLocalStorageWritingPilotStore(storage, () => '2026-09-21T12:00:00.000Z')
    const initial = store.load()
    expect(initial.status).toBe('empty')
    expect(initial.state.settings.enabled).toBe(false)
    expect(storage.getItem(WRITING_PILOT_STORAGE_KEY)).toBeNull()

    const first = store.save({ ...initial.state, settings: { ...initial.state.settings, enabled: true } }, 0)
    expect(first.status).toBe('saved')
    expect(first.state.revision).toBe(1)

    const stale = store.save(initial.state, 0)
    expect(stale.status).toBe('conflict')
    expect(stale.state.settings.enabled).toBe(true)
    expect(stale.state.revision).toBe(1)
  })

  it('fails closed for malformed and future-schema records without overwriting bytes', () => {
    const storage = new MemoryStorage()
    storage.setItem(WRITING_PILOT_STORAGE_KEY, '{not-json')
    const invalidBytes = storage.getItem(WRITING_PILOT_STORAGE_KEY)
    const invalid = createLocalStorageWritingPilotStore(storage).load()
    expect(invalid.status).toBe('invalid_json')
    expect(storage.getItem(WRITING_PILOT_STORAGE_KEY)).toBe(invalidBytes)

    storage.setItem(WRITING_PILOT_STORAGE_KEY, JSON.stringify({ ...createDefaultWritingPilotState('2026-09-21T12:00:00.000Z'), schemaVersion: 2 }))
    const futureBytes = storage.getItem(WRITING_PILOT_STORAGE_KEY)
    const future = createLocalStorageWritingPilotStore(storage).load()
    expect(future.status).toBe('unsupported_version')
    expect(storage.getItem(WRITING_PILOT_STORAGE_KEY)).toBe(futureBytes)
  })

  it('normalizes coordinates and enforces bounded ink limits', () => {
    const strokes: InkStroke[] = Array.from({ length: WRITING_PILOT_MAX_STROKES + 5 }, (_, strokeIndex) => ({
      strokeId: `stroke-${strokeIndex}`,
      pointerType: 'pen',
      points: Array.from({ length: 30 }, (_, pointIndex) => ({
        x: pointIndex % 2 ? 2 : -1,
        y: 0.5,
        pressure: 2,
        elapsedMs: pointIndex,
      })),
    }))
    const normalized = normalizeInkStrokes(strokes)
    expect(normalized.length).toBeLessThanOrEqual(WRITING_PILOT_MAX_STROKES)
    expect(normalized.flatMap((stroke) => stroke.points)).toHaveLength(WRITING_PILOT_MAX_POINTS)
    expect(normalized[0].points[0]).toMatchObject({ x: 0, y: 0.5, pressure: 1 })
  })

  it('retains writing records but disables legacy cookie-era external authority', () => {
    const storage = new MemoryStorage()
    const state = createDefaultWritingPilotState('2026-09-21T12:00:00.000Z')
    storage.setItem(WRITING_PILOT_STORAGE_KEY, JSON.stringify({
      ...state,
      settings: {
        ...state.settings,
        enabled: true,
        externalProcessingEnabled: true,
        serviceAuthority: {
          status: 'authorized',
          installationId: 'legacy',
          endpointId: 'legacy-cookie-service',
          retentionControl: 'approved_zero_data_retention',
          approvedAt: '2026-09-20T00:00:00.000Z',
          expiresAt: '2026-10-01T00:00:00.000Z',
          budgetLimitMicros: 100,
          budgetRemainingMicros: 100,
        },
      },
    }))
    const loaded = createLocalStorageWritingPilotStore(storage).load('2026-09-22T00:00:00.000Z')
    expect(loaded.status).toBe('loaded')
    expect(loaded.state.settings.enabled).toBe(true)
    expect(loaded.state.settings.externalProcessingEnabled).toBe(false)
    expect(loaded.state.settings.serviceAuthority).toBeNull()
  })
})
