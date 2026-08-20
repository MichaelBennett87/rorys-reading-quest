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
      const validated = validatePersistedQuestProgress(parsed)
      if (validated.status !== 'valid') {
        return { state: fresh(), status: validated.status, technicalDetail: validated.reason }
      }
      return { state: validated.state, status: 'loaded' }
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
