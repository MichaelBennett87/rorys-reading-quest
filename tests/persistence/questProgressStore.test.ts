import { describe, expect, test } from 'vitest'

import { getLessonCandidates } from '../../src/domain/lesson'
import {
  COMPLETED_ATTEMPT_LIMIT,
  QUEST_PROGRESS_STORAGE_KEY,
  RECENT_ACTIVITY_LIMIT_PER_TRAIL,
  createDefaultQuestProgress,
  createLocalStorageQuestProgressStore,
  normalizeQuestProgressForSave,
  recoverActiveLessonSession,
  type CompletedLessonAttempt,
  type StorageLike,
} from '../../src/persistence'

const now = '2026-08-20T12:00:00.000Z'

class MemoryStorage implements StorageLike {
  values = new Map<string, string>()
  writes = 0
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.writes += 1; this.values.set(key, value) }
}

const attempt = (index: number): CompletedLessonAttempt => ({
  attemptId: `attempt-${index}`,
  completionId: `completion-${index}`,
  lessonId: 'lesson-a',
  activityId: 'activity-a',
  skillId: 'g2-word-forge-word-practice',
  difficulty: 1,
  questionResults: [{ questionId: 'question-a', isCorrect: true, isFirstAttemptCorrect: true }],
  accuracy: 100,
  assistanceCount: 0,
  completedAt: now,
  progressionDecisionState: 'VERIFY_MASTERY',
  reasonCodes: ['independent_evidence'],
  nextReviewDate: null,
})

describe('local quest progress persistence', () => {
  test('saves and loads version-1 state', () => {
    const storage = new MemoryStorage()
    const store = createLocalStorageQuestProgressStore(storage, () => now)
    const state = createDefaultQuestProgress(now)
    expect(store.save(state).status).toBe('saved')
    const loaded = store.load()
    expect(loaded.status).toBe('loaded')
    expect(loaded.state).toEqual(state)
  })

  test('invalid JSON safely falls back without overwriting stored data', () => {
    const storage = new MemoryStorage()
    storage.values.set(QUEST_PROGRESS_STORAGE_KEY, '{not-json')
    const loaded = createLocalStorageQuestProgressStore(storage, () => now).load()
    expect(loaded.status).toBe('invalid_json')
    expect(loaded.state.schemaVersion).toBe(1)
    expect(storage.writes).toBe(0)
    expect(storage.values.get(QUEST_PROGRESS_STORAGE_KEY)).toBe('{not-json')
  })

  test('unsupported schema and missing fields safely fall back', () => {
    const storage = new MemoryStorage()
    storage.values.set(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify({ schemaVersion: 2 }))
    expect(createLocalStorageQuestProgressStore(storage, () => now).load().status).toBe('unsupported_version')
    storage.values.set(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify({ schemaVersion: 1 }))
    expect(createLocalStorageQuestProgressStore(storage, () => now).load().status).toBe('invalid_state')
  })

  test('storage exceptions and unavailable storage use an in-memory fallback', () => {
    const throwing: StorageLike = {
      getItem() { throw new Error('read blocked') },
      setItem() { throw new Error('write blocked') },
    }
    expect(createLocalStorageQuestProgressStore(throwing, () => now).load().status).toBe('storage_error')
    expect(createLocalStorageQuestProgressStore(throwing, () => now)
      .save(createDefaultQuestProgress(now)).status).toBe('storage_error')
    expect(createLocalStorageQuestProgressStore(null, () => now).load().status).toBe('unavailable')
  })

  test('caps completed history and recent activity usage', () => {
    const state = createDefaultQuestProgress(now)
    state.completedAttempts = Array.from({ length: COMPLETED_ATTEMPT_LIMIT + 10 }, (_, index) => attempt(index))
    const candidate = getLessonCandidates()[0]
    state.recentActivityUsage.trail = Array.from(
      { length: RECENT_ACTIVITY_LIMIT_PER_TRAIL + 5 },
      (_, index) => ({
        ...candidate,
        activityId: `${candidate.activityId}-${index}`,
        completedAt: now,
      }),
    )
    const normalized = normalizeQuestProgressForSave(state)
    expect(normalized.completedAttempts).toHaveLength(COMPLETED_ATTEMPT_LIMIT)
    expect(normalized.recentActivityUsage.trail).toHaveLength(RECENT_ACTIVITY_LIMIT_PER_TRAIL)
  })

  test('active submitted progress survives save and reload', () => {
    const storage = new MemoryStorage()
    const state = createDefaultQuestProgress(now)
    const candidate = getLessonCandidates()[0]
    const questionId = candidate.passageQuestionKeys[0].split('::')[1]
    state.activeLessonSession = {
      sessionId: 'session-a',
      lessonId: candidate.lessonId,
      activityId: candidate.activityId,
      contentVersion: candidate.contentVersion,
      skillId: candidate.skillId,
      difficulty: candidate.difficulty,
      currentQuestionIndex: 1,
      submittedQuestions: [{
        questionId,
        submittedAnswer: 'choice-a',
        isCorrect: true,
        isFirstAttemptCorrect: true,
      }],
      startedAt: now,
      updatedAt: now,
    }
    const store = createLocalStorageQuestProgressStore(storage, () => now)
    store.save(state)
    const loaded = store.load()
    expect(loaded.state.activeLessonSession?.submittedQuestions[0].questionId).toBe(questionId)
  })

  test('incompatible active content is discarded while completed progress survives', () => {
    const state = createDefaultQuestProgress(now)
    state.completedAttempts = [attempt(1)]
    const candidate = getLessonCandidates()[0]
    state.activeLessonSession = {
      sessionId: 'session-a',
      lessonId: candidate.lessonId,
      activityId: candidate.activityId,
      contentVersion: 'old-version',
      skillId: candidate.skillId,
      difficulty: candidate.difficulty,
      currentQuestionIndex: 0,
      submittedQuestions: [],
      startedAt: now,
      updatedAt: now,
    }
    const recovered = recoverActiveLessonSession({ state, availableLessons: getLessonCandidates() })
    expect(recovered.status).toBe('discarded_incompatible')
    expect(recovered.state.activeLessonSession).toBeNull()
    expect(recovered.state.completedAttempts).toHaveLength(1)
  })
})
