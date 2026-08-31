import { createDefaultQuestProgress } from './createDefaultQuestProgress'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  type QuestProgressLoadResult,
  type QuestProgressSaveResult,
  type QuestProgressStore,
  type QuestProgressV1,
  type StorageLike,
} from './questProgressTypes'
import { normalizeQuestProgressForSave, validatePersistedQuestProgress } from './validatePersistedQuestProgress'

const LEGACY_DEMO_CLEANUP_STORAGE_KEY = `${QUEST_PROGRESS_STORAGE_KEY}.legacy-demo-cleanup.v1`
const LEGACY_DEMO_TOTAL_XP = 120
const LEGACY_DEMO_TOTAL_STARS = 8

export function createLocalStorageQuestProgressStore(
  storage: StorageLike | null,
  now: () => string = () => new Date().toISOString(),
): QuestProgressStore {
  const fresh = (): QuestProgressV1 => createDefaultQuestProgress(now())

  return {
    load(): QuestProgressLoadResult {
      if (!storage) {
        return { state: fresh(), status: 'unavailable', technicalDetail: 'Browser storage is unavailable.' }
      }
      let raw: string | null
      try {
        raw = storage.getItem(QUEST_PROGRESS_STORAGE_KEY)
      } catch (error) {
        return { state: fresh(), status: 'storage_error', technicalDetail: errorMessage(error) }
      }
      if (raw === null) return { state: fresh(), status: 'empty' }

      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch (error) {
        return { state: fresh(), status: 'invalid_json', technicalDetail: errorMessage(error) }
      }
      let validated
      try {
        validated = validatePersistedQuestProgress(parsed)
      } catch (error) {
        return { state: fresh(), status: 'invalid_state', technicalDetail: errorMessage(error) }
      }
      if (validated.status !== 'valid') {
        return { state: fresh(), status: validated.status, technicalDetail: validated.reason }
      }

      const cleaned = cleanLegacyDemoSeed(storage, validated.state, now)
      return cleaned.status === 'migrated'
        ? { state: cleaned.state, status: 'loaded' }
        : { state: validated.state, status: 'loaded' }
    },

    save(state: QuestProgressV1): QuestProgressSaveResult {
      const normalized = normalizeQuestProgressForSave({
        ...state,
        metadata: { ...state.metadata, updatedAt: now() },
      })
      if (!storage) {
        return { state: normalized, status: 'unavailable', technicalDetail: 'Browser storage is unavailable.' }
      }
      try {
        storage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(normalized))
        return { state: normalized, status: 'saved' }
      } catch (error) {
        return { state: normalized, status: 'storage_error', technicalDetail: errorMessage(error) }
      }
    },
  }
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
