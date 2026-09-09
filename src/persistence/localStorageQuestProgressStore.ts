import { createDefaultQuestProgress } from './createDefaultQuestProgress'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  type QuestProgressLoadResult,
  type QuestProgressSaveResult,
  type QuestProgressStore,
  type QuestProgressV1,
  type StorageLike,
} from './questProgressTypes'
import {
  normalizeQuestProgressForSave,
  recoverPersistedQuestProgressTransients,
  validatePersistedQuestProgress,
} from './validatePersistedQuestProgress'

const LEGACY_DEMO_CLEANUP_STORAGE_KEY = `${QUEST_PROGRESS_STORAGE_KEY}.legacy-demo-cleanup.v1`
const LEGACY_DEMO_TOTAL_XP = 120
const LEGACY_DEMO_TOTAL_STARS = 8

export function createLocalStorageQuestProgressStore(
  storage: StorageLike | null,
  now: () => string = () => new Date().toISOString(),
): QuestProgressStore {
  const fresh = (): QuestProgressV1 => createDefaultQuestProgress(now())
  let expectedRaw: string | null | undefined
  let lastKnownState: QuestProgressV1 | null = null

  return {
    load(): QuestProgressLoadResult {
      if (!storage) {
        const state = fresh()
        lastKnownState = state
        return { state, status: 'unavailable', technicalDetail: 'Browser storage is unavailable.' }
      }
      let raw: string | null
      try {
        raw = storage.getItem(QUEST_PROGRESS_STORAGE_KEY)
      } catch (error) {
        const state = fresh()
        lastKnownState = state
        return { state, status: 'storage_error', technicalDetail: errorMessage(error) }
      }
      expectedRaw = raw
      const inspected = inspectStoredProgress(raw)
      if (inspected.status === 'empty') {
        const state = fresh()
        lastKnownState = state
        return { state, status: 'empty' }
      }
      if (inspected.status !== 'loaded' && inspected.status !== 'recovered') {
        const state = fresh()
        lastKnownState = state
        return { state, status: inspected.status, technicalDetail: inspected.technicalDetail }
      }

      const cleaned = cleanLegacyDemoSeed(storage, inspected.state, now)
      const state = cleaned.status === 'migrated' ? cleaned.state : inspected.state
      lastKnownState = state
      if (cleaned.status === 'migrated') {
        try {
          expectedRaw = storage.getItem(QUEST_PROGRESS_STORAGE_KEY)
        } catch {
          // The loaded state remains usable; a later save will report the storage failure.
        }
      }
      return {
        state,
        status: inspected.status,
        technicalDetail: inspected.technicalDetail,
      }
    },

    save(state: QuestProgressV1): QuestProgressSaveResult {
      const normalized = normalizeQuestProgressForSave({
        ...state,
        metadata: { ...state.metadata, updatedAt: now() },
      })
      if (!storage) {
        return { state: normalized, status: 'unavailable', technicalDetail: 'Browser storage is unavailable.' }
      }

      let currentRaw: string | null
      try {
        currentRaw = storage.getItem(QUEST_PROGRESS_STORAGE_KEY)
      } catch (error) {
        return {
          state: lastKnownState ?? normalized,
          status: 'storage_error',
          technicalDetail: errorMessage(error),
        }
      }

      if (expectedRaw === undefined) {
        if (currentRaw !== null) {
          const current = inspectStoredProgress(currentRaw)
          if (current.status === 'loaded' || current.status === 'recovered') {
            expectedRaw = currentRaw
            lastKnownState = current.state
            return {
              state: current.state,
              status: 'conflict',
              technicalDetail: 'Saved progress must be loaded before an existing record can be replaced.',
            }
          }
          expectedRaw = currentRaw
          return {
            state: lastKnownState ?? normalized,
            status: 'write_blocked',
            technicalDetail: inspectionTechnicalDetail(current),
          }
        }
        expectedRaw = null
      }

      if (currentRaw !== expectedRaw) {
        const current = inspectStoredProgress(currentRaw)
        expectedRaw = currentRaw
        if (current.status === 'loaded' || current.status === 'recovered') {
          lastKnownState = current.state
          return {
            state: current.state,
            status: 'conflict',
            technicalDetail: 'Newer reading progress was saved by another page.',
          }
        }
        return {
          state: lastKnownState ?? normalized,
          status: 'write_blocked',
          technicalDetail: inspectionTechnicalDetail(current),
        }
      }

      const current = inspectStoredProgress(currentRaw)
      if (current.status !== 'empty' && current.status !== 'loaded' && current.status !== 'recovered') {
        return {
          state: lastKnownState ?? normalized,
          status: 'write_blocked',
          technicalDetail: current.technicalDetail,
        }
      }

      const serialized = JSON.stringify(normalized)
      try {
        storage.setItem(QUEST_PROGRESS_STORAGE_KEY, serialized)
        const readBack = storage.getItem(QUEST_PROGRESS_STORAGE_KEY)
        if (readBack !== serialized) {
          return {
            state: lastKnownState ?? normalized,
            status: 'storage_error',
            technicalDetail: 'Browser storage did not retain the saved reading progress.',
          }
        }
        expectedRaw = serialized
        lastKnownState = normalized
        return { state: normalized, status: 'saved' }
      } catch (error) {
        return {
          state: lastKnownState ?? normalized,
          status: 'storage_error',
          technicalDetail: errorMessage(error),
        }
      }
    },
  }
}

type StoredProgressInspection =
  | { status: 'empty' }
  | { status: 'loaded' | 'recovered'; state: QuestProgressV1; technicalDetail?: string }
  | {
      status: 'invalid_json' | 'unsupported_version' | 'invalid_state'
      technicalDetail: string
    }

function inspectStoredProgress(raw: string | null): StoredProgressInspection {
  if (raw === null) return { status: 'empty' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    return { status: 'invalid_json', technicalDetail: errorMessage(error) }
  }

  let validated
  try {
    validated = validatePersistedQuestProgress(parsed)
  } catch (error) {
    return { status: 'invalid_state', technicalDetail: errorMessage(error) }
  }
  if (validated.status === 'valid') return { status: 'loaded', state: validated.state }
  if (validated.status === 'unsupported_version') {
    return { status: validated.status, technicalDetail: validated.reason }
  }

  const recovered = recoverPersistedQuestProgressTransients(parsed)
  if (recovered.status === 'recovered') {
    return {
      status: 'recovered',
      state: recovered.state,
      technicalDetail: `Recovered durable progress and discarded malformed transient fields: ${recovered.discardedFields.join(', ')}.`,
    }
  }
  return { status: 'invalid_state', technicalDetail: validated.reason }
}

function inspectionTechnicalDetail(inspection: StoredProgressInspection): string {
  return inspection.status === 'empty'
    ? 'Saved progress changed in another page and is no longer available.'
    : inspection.technicalDetail ?? 'Saved progress could not be updated safely.'
}

export function getBrowserLocalStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function cleanLegacyDemoSeed(
  storage: StorageLike,
  state: QuestProgressV1,
  now: () => string,
): { state: QuestProgressV1; status: 'migrated' | 'unchanged' } {
  if (isLegacyDemoSeedCleanupMarked(storage)) {
    return { state, status: 'unchanged' }
  }

  const earnedTotals = calculateEarnedTotals(state)
  const seededXp = state.totalXp - earnedTotals.totalXp
  const seededStars = state.totalStars - earnedTotals.totalStars
  const hasRecordedProgress = state.completedAttempts.length > 0
    || state.completedSessionCount > 0
    || state.reviewQueue.length > 0
    || state.activeLessonSession !== null
    || state.plannedNextQuest !== null
    || state.lastProgressionOutcome !== null

  const seededBaselineDetected = (
    (!hasRecordedProgress && state.totalXp === LEGACY_DEMO_TOTAL_XP && state.totalStars === LEGACY_DEMO_TOTAL_STARS)
    || (hasRecordedProgress && seededXp === LEGACY_DEMO_TOTAL_XP && seededStars === LEGACY_DEMO_TOTAL_STARS)
  )

  if (!seededBaselineDetected) {
    return { state, status: 'unchanged' }
  }

  const cleanedState = normalizeQuestProgressForSave({
    ...state,
    totalXp: Math.max(0, state.totalXp - LEGACY_DEMO_TOTAL_XP),
    totalStars: Math.max(0, state.totalStars - LEGACY_DEMO_TOTAL_STARS),
    metadata: { ...state.metadata, updatedAt: now() },
  })

  try {
    storage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(cleanedState))
    storage.setItem(LEGACY_DEMO_CLEANUP_STORAGE_KEY, JSON.stringify({ cleanedAt: now() }))
  } catch {
    return { state: cleanedState, status: 'migrated' }
  }

  return { state: cleanedState, status: 'migrated' }
}

function calculateEarnedTotals(state: QuestProgressV1): { totalXp: number; totalStars: number } {
  return state.completedAttempts.reduce((totals, attempt) => {
    const earnedXp = attempt.questionResults.length * 10
      + attempt.questionResults.filter((result) => result.isCorrect).length * 5
    const earnedStars = attempt.accuracy >= 90 ? 3 : attempt.accuracy >= 70 ? 2 : 1
    totals.totalXp += earnedXp
    totals.totalStars += earnedStars
    return totals
  }, { totalXp: 0, totalStars: 0 })
}

function isLegacyDemoSeedCleanupMarked(storage: StorageLike): boolean {
  try {
    return storage.getItem(LEGACY_DEMO_CLEANUP_STORAGE_KEY) !== null
  } catch {
    return false
  }
}
