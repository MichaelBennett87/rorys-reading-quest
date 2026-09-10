import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { useQuestProgress } from '../../src/app/useQuestProgress'
import { getLessonById, getLessonCandidates, type LessonDefinition, type LessonResult } from '../../src/domain/lesson'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  createActiveLessonSession,
  createDefaultQuestProgress,
} from '../../src/persistence'

const STORY_SCOUTS_SKILL = 'g2-story-scouts-prose'

afterEach(() => {
  window.localStorage.removeItem(QUEST_PROGRESS_STORAGE_KEY)
  vi.restoreAllMocks()
})

function perfectResult(lesson: LessonDefinition): LessonResult {
  return {
    lessonId: lesson.lessonId,
    activityId: lesson.activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    lessonRole: lesson.lessonRole,
    totalQuestions: lesson.questions.length,
    correctAnswers: lesson.questions.length,
    firstAttemptCorrect: lesson.questions.length,
    accuracy: 100,
    assistanceUsed: 0,
    assistanceSummary: {
      totalUniqueEvents: 0,
      targetsHelped: 0,
      maximumAssistanceLevel: 0,
      visualHintUsed: false,
      spokenChunkHelpUsed: false,
      spokenWordHelpUsed: false,
      sentenceReadAloudUsed: false,
    },
    questionResults: lesson.questions.map((question) => ({
      questionId: question.questionId,
      isCorrect: true,
      isFirstAttemptCorrect: true,
      submittedAnswer: 'independently-audited-correct-answer',
      correctAnswer: 'independently-audited-correct-answer',
      explanation: 'Focused continuity fixture.',
      evidenceReference: [],
    })),
    fluencyPracticeSummary: null,
    oralFluencyMeasured: false,
    completed: true,
  }
}

describe('P0 persisted learning continuity', () => {
  test('two distinct qualifying successes survive hook restarts and advance Story Scouts', () => {
    const firstVisit = renderHook(() => useQuestProgress())
    const firstLaunch = firstVisit.result.current.prepareJourneyLaunch()
    if (firstLaunch.status !== 'start') throw new Error('Expected the first Story Scouts checkpoint.')
    expect(firstLaunch.lesson.skillId).toBe(STORY_SCOUTS_SKILL)
    expect(firstLaunch.lesson.difficulty).toBe(1)

    act(() => {
      firstVisit.result.current.completeLesson(perfectResult(firstLaunch.lesson), firstLaunch.session.sessionId)
    })
    expect(firstVisit.result.current.progress.skillProgress[STORY_SCOUTS_SKILL]).toMatchObject({
      currentDifficulty: 1,
      currentLearningState: 'VERIFY_MASTERY',
      qualifyingIndependentActivityIds: [firstLaunch.lesson.activityId],
    })
    firstVisit.unmount()

    const secondVisit = renderHook(() => useQuestProgress())
    const verification = secondVisit.result.current.prepareJourneyLaunch()
    if (verification.status !== 'start') throw new Error('Expected a distinct verification checkpoint.')
    expect(verification.session.launchContext?.purpose).toBe('verification')
    expect(verification.lesson.activityId).not.toBe(firstLaunch.lesson.activityId)

    act(() => {
      secondVisit.result.current.completeLesson(perfectResult(verification.lesson), verification.session.sessionId)
    })
    expect(secondVisit.result.current.progress.skillProgress[STORY_SCOUTS_SKILL]).toMatchObject({
      currentDifficulty: 2,
      lastMasteredDifficulty: 1,
      currentLearningState: 'ADVANCE',
      qualifyingIndependentActivityIds: [],
    })
    secondVisit.unmount()

    const thirdVisit = renderHook(() => useQuestProgress())
    const nextLevel = thirdVisit.result.current.prepareJourneyLaunch()
    if (nextLevel.status !== 'start') throw new Error('Expected the earned next Story Scouts level.')
    expect(nextLevel.lesson.skillId).toBe(STORY_SCOUTS_SKILL)
    expect(nextLevel.lesson.difficulty).toBe(2)
    expect(thirdVisit.result.current.progress.completedAttempts).toHaveLength(2)
  })

  test('a failed checkpoint write is reported and does not become authoritative in memory', () => {
    const hook = renderHook(() => useQuestProgress())
    const launch = hook.result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a saved active session.')
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const checkpoint = {
      ...launch.session,
      currentQuestionIndex: 1,
      updatedAt: '2026-09-09T22:00:00.000Z',
    }
    let result!: ReturnType<typeof hook.result.current.saveActiveSession>
    act(() => {
      result = hook.result.current.saveActiveSession(checkpoint)
    })

    expect(result.status).toBe('persistence_failed')
    expect(hook.result.current.storageStatus).toBe('storage_error')
    expect(hook.result.current.progress.activeLessonSession?.currentQuestionIndex).toBe(0)
    setItem.mockRestore()
  })

  test('a failed completion write preserves the active session and earned history', () => {
    const hook = renderHook(() => useQuestProgress())
    const launch = hook.result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a saved active session.')
    const storedBeforeCompletion = window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY)
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    let outcome!: ReturnType<typeof hook.result.current.completeLesson>
    act(() => {
      outcome = hook.result.current.completeLesson(
        perfectResult(launch.lesson),
        launch.session.sessionId,
      )
    })

    expect(outcome.persisted).toBe(false)
    expect(hook.result.current.storageStatus).toBe('storage_error')
    expect(hook.result.current.progress.activeLessonSession?.sessionId).toBe(launch.session.sessionId)
    expect(hook.result.current.progress.completedAttempts).toHaveLength(0)
    expect(hook.result.current.progress.completedSessionCount).toBe(0)
    expect(hook.result.current.progress.totalXp).toBe(0)
    expect(hook.result.current.progress.totalStars).toBe(0)
    expect(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY)).toBe(storedBeforeCompletion)
    setItem.mockRestore()
  })

  test('initial transient recovery adopts newer progress saved by another page', () => {
    const timestamp = '2026-09-09T22:10:00.000Z'
    const candidate = getLessonCandidates()[0]
    const lesson = getLessonById(candidate.lessonId).lesson
    if (!lesson) throw new Error('Expected the continuity fixture lesson to resolve.')
    const stale = createDefaultQuestProgress(timestamp)
    stale.activeLessonSession = {
      ...createActiveLessonSession(
        lesson,
        'stale-session',
        timestamp,
        { purpose: 'progression' },
      ),
      lessonId: 'missing-lesson',
    }
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(stale))
    const newer = {
      ...stale,
      activeLessonSession: null,
      totalXp: 250,
    }
    const originalGetItem = Storage.prototype.getItem
    const originalSetItem = Storage.prototype.setItem
    let progressReads = 0
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key: string) {
      if (key === QUEST_PROGRESS_STORAGE_KEY) {
        progressReads += 1
        if (progressReads === 2) {
          originalSetItem.call(this, key, JSON.stringify(newer))
        }
      }
      return originalGetItem.call(this, key)
    })

    const hook = renderHook(() => useQuestProgress())

    expect(hook.result.current.storageStatus).toBe('conflict')
    expect(hook.result.current.progress.totalXp).toBe(250)
    expect(hook.result.current.progress.activeLessonSession).toBeNull()
    expect(JSON.parse(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY) ?? '{}').totalXp).toBe(250)
    getItem.mockRestore()
  })
})
