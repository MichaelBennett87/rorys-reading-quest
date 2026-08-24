import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { normalizePlannedNextQuest, planGlobalQuest } from '../src/domain/curriculum'
import { getLessonById, getLessonCandidates, type LessonDefinition, type LessonResult } from '../src/domain/lesson'
import { useQuestProgress } from '../src/app/useQuestProgress'
import {
  PARENT_ACCESS_STORAGE_KEY,
  PARENT_RECORDS_STORAGE_KEY,
  QUEST_PROGRESS_STORAGE_KEY,
  completeFluencyPracticeProgress,
  completeQuestProgress,
  createActiveLessonSession,
  createDefaultQuestProgress,
  recoverActiveLessonSession,
  type ActiveLessonSession,
  type CompletedLessonAttempt,
  type QuestProgressV1,
} from '../src/persistence'

const NOW = '2026-08-24T22:00:00.000Z'
const candidates = getLessonCandidates()
const initialState = createDefaultQuestProgress(NOW)
const firstPlan = planGlobalQuest({ progress: initialState, availableLessons: candidates, now: NOW }).nextQuest
if (firstPlan.status !== 'available') throw new Error('Journey invariant fixtures require an available first lesson.')
const firstLesson = getLessonById(firstPlan.lesson.lessonId).lesson!
const secondCandidate = candidates.find((candidate) => (
  candidate.lessonId !== firstLesson.lessonId
  && candidate.skillId === firstLesson.skillId
  && candidate.difficulty === firstLesson.difficulty
  && candidate.eligiblePurposes.includes('progression')
))!
const secondLesson = getLessonById(secondCandidate.lessonId).lesson!

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

function attemptFor(session: ActiveLessonSession): CompletedLessonAttempt {
  return {
    attemptId: session.sessionId,
    completionId: session.sessionId,
    lessonId: session.lessonId,
    lessonRole: session.lessonRole ?? 'GUIDED_PRACTICE',
    activityId: session.activityId,
    skillId: session.skillId,
    difficulty: session.difficulty,
    questionResults: [],
    accuracy: 100,
    assistanceCount: 0,
    assistanceSummary: {
      totalUniqueEvents: 0,
      targetsHelped: 0,
      maximumAssistanceLevel: 0,
      visualHintUsed: false,
      spokenChunkHelpUsed: false,
      spokenWordHelpUsed: false,
      sentenceReadAloudUsed: false,
    },
    fluencyPracticeSummary: null,
    assistanceEvents: [],
    completedAt: NOW,
    progressionDecisionState: 'ADVANCE',
    reasonCodes: ['fixture_completed'],
    nextReviewDate: null,
  }
}

function completedActiveState(lesson: LessonDefinition = firstLesson): QuestProgressV1 {
  const session = createActiveLessonSession(lesson, `completed:${lesson.lessonId}`, NOW)
  return {
    ...createDefaultQuestProgress(NOW),
    totalXp: 145,
    totalStars: 3,
    completedSessionCount: 1,
    completedAttempts: [attemptFor(session)],
    activeLessonSession: session,
    reviewQueue: [{ skillId: lesson.skillId, difficulty: lesson.difficulty, reviewStep: 1, dueAt: NOW }],
  }
}

function resultFor(lesson: LessonDefinition): LessonResult {
  const questionResults = lesson.questions.map((question) => ({
    questionId: question.questionId,
    isCorrect: true,
    isFirstAttemptCorrect: true,
    submittedAnswer: 'fixture-answer',
    correctAnswer: 'fixture-answer',
    explanation: 'Fixture explanation.',
    evidenceReference: [],
  }))
  return {
    lessonId: lesson.lessonId,
    activityId: lesson.activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    lessonRole: lesson.lessonRole,
    totalQuestions: questionResults.length,
    correctAnswers: questionResults.length,
    firstAttemptCorrect: questionResults.length,
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
    questionResults,
    fluencyPracticeSummary: null,
    oralFluencyMeasured: false,
    completed: true,
  }
}

function persistState(state: QuestProgressV1) {
  window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
}

describe('P0 journey state invariants', () => {
  test('10. completed recovery returns explicit technical detail', () => {
    const recovered = recoverActiveLessonSession({ state: completedActiveState(), availableLessons: candidates })
    expect(recovered.status).toBe('discarded_completed')
    expect(recovered.technicalDetail).toContain('already recorded as completed')
  })

  test('11. incompatible recovery preserves completed attempts', () => {
    const state = completedActiveState()
    state.completedAttempts = []
    state.activeLessonSession = { ...state.activeLessonSession!, activityId: 'missing-activity' }
    const recovered = recoverActiveLessonSession({ state, availableLessons: candidates })
    expect(recovered.status).toBe('discarded_incompatible')
    expect(recovered.state.completedAttempts).toEqual([])
  })

  test.each([
    ['missing lesson', { lessonId: 'missing-lesson' }],
    ['activity mismatch', { activityId: 'wrong-activity' }],
    ['content version mismatch', { contentVersion: 'old-version' }],
    ['skill mismatch', { skillId: 'wrong-skill' }],
    ['difficulty mismatch', { difficulty: 99 }],
  ])('12-16. %s is discarded without changing rewards', (_label, change) => {
    const state = createDefaultQuestProgress(NOW)
    state.totalXp = 91
    state.totalStars = 2
    state.activeLessonSession = { ...createActiveLessonSession(firstLesson, 'invalid-session', NOW), ...change }
    const recovered = recoverActiveLessonSession({ state, availableLessons: candidates })
    expect(recovered.status).toBe('discarded_incompatible')
    expect(recovered.state.activeLessonSession).toBeNull()
    expect([recovered.state.totalXp, recovered.state.totalStars]).toEqual([91, 2])
  })

  test('17. duplicate standard completion clears its matching active session', () => {
    const state = completedActiveState()
    const completed = completeQuestProgress({
      state,
      completionId: state.activeLessonSession!.sessionId,
      lessonResult: resultFor(firstLesson),
      progression: null as never,
      completedAt: NOW,
    })
    expect(completed.duplicate).toBe(true)
    expect(completed.state.activeLessonSession).toBeNull()
  })

  test.each([
    ['XP', (state: QuestProgressV1) => state.totalXp, 145],
    ['stars', (state: QuestProgressV1) => state.totalStars, 3],
    ['attempts', (state: QuestProgressV1) => state.completedAttempts.length, 1],
    ['reviews', (state: QuestProgressV1) => state.reviewQueue.length, 1],
  ])('18-21. duplicate completion preserves %s', (_label, select, expected) => {
    const state = completedActiveState()
    const completed = completeQuestProgress({
      state,
      completionId: state.activeLessonSession!.sessionId,
      lessonResult: resultFor(firstLesson),
      progression: null as never,
      completedAt: NOW,
    })
    expect(select(completed.state)).toBe(expected)
    expect([completed.earnedXp, completed.earnedStars]).toEqual([0, 0])
  })

  test('22. duplicate fluency completion also clears its matching active session', () => {
    const state = completedActiveState()
    const completed = completeFluencyPracticeProgress({
      state,
      completionId: state.activeLessonSession!.sessionId,
      lessonResult: resultFor(firstLesson),
      fluencyProgress: null as never,
      completedAt: NOW,
    })
    expect(completed.duplicate).toBe(true)
    expect(completed.state.activeLessonSession).toBeNull()
    expect([completed.earnedXp, completed.earnedStars]).toEqual([0, 0])
  })

  test('23. stored content-needed is always retired before current planning', () => {
    const state = createDefaultQuestProgress(NOW)
    state.plannedNextQuest = {
      status: 'content_needed',
      purpose: 'progression',
      skillId: firstLesson.skillId,
      difficulty: firstLesson.difficulty,
      reason: 'Old phase boundary.',
    }
    const normalized = normalizePlannedNextQuest(state, candidates)
    expect(normalized.changed).toBe(true)
    expect(normalized.state.plannedNextQuest).toBeNull()
  })

  test('24. a current valid available plan remains intact', () => {
    const state = createDefaultQuestProgress(NOW)
    state.plannedNextQuest = firstPlan
    const normalized = normalizePlannedNextQuest(state, candidates)
    expect(normalized.changed).toBe(false)
    expect(normalized.state.plannedNextQuest).toEqual(firstPlan)
  })

  test('25. an unavailable stored lesson plan is retired', () => {
    const state = createDefaultQuestProgress(NOW)
    state.plannedNextQuest = {
      ...firstPlan,
      lesson: { ...firstPlan.lesson, lessonId: 'removed-lesson' },
    }
    const normalized = normalizePlannedNextQuest(state, candidates)
    expect(normalized.changed).toBe(true)
    expect(normalized.state.plannedNextQuest).toBeNull()
  })

  test('26. beginning the same compatible lesson resumes the same session', () => {
    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a new first session.')
    let repeated!: ReturnType<typeof result.current.beginLesson>
    act(() => { repeated = result.current.beginLesson(launch.lesson) })
    expect(repeated.status).toBe('resumed')
    expect(repeated.session.sessionId).toBe(launch.session.sessionId)
  })

  test('27. beginning another lesson reports conflict instead of overwriting', () => {
    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a new first session.')
    let conflicting!: ReturnType<typeof result.current.beginLesson>
    act(() => { conflicting = result.current.beginLesson(secondLesson) })
    expect(conflicting.status).toBe('conflict')
    expect(conflicting.session.sessionId).toBe(launch.session.sessionId)
  })

  test('28. a checkpoint for the current session is saved', () => {
    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a new first session.')
    const checkpoint = { ...launch.session, currentQuestionIndex: 1, updatedAt: '2026-08-24T22:01:00.000Z' }
    let saved!: ReturnType<typeof result.current.saveActiveSession>
    act(() => { saved = result.current.saveActiveSession(checkpoint) })
    expect(saved.status).toBe('saved')
    expect(saved.state.activeLessonSession?.currentQuestionIndex).toBe(1)
  })

  test('29. a checkpoint carrying a completed identity is ignored', () => {
    persistState(completedActiveState())
    const { result } = renderHook(() => useQuestProgress())
    const completedSession = completedActiveState().activeLessonSession!
    let saved!: ReturnType<typeof result.current.saveActiveSession>
    act(() => { saved = result.current.saveActiveSession(completedSession) })
    expect(saved.status).toBe('ignored_completed')
    expect(saved.state.activeLessonSession).toBeNull()
  })

  test('30. a checkpoint is stale when no lesson is active', () => {
    const { result } = renderHook(() => useQuestProgress())
    const checkpoint = createActiveLessonSession(firstLesson, 'late-session', NOW)
    const saved = result.current.saveActiveSession(checkpoint)
    expect(saved.status).toBe('ignored_stale')
    expect(saved.state.activeLessonSession).toBeNull()
  })

  test('31. a checkpoint cannot replace a newer different active session', () => {
    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a new first session.')
    const older = createActiveLessonSession(secondLesson, 'older-session', NOW)
    const saved = result.current.saveActiveSession(older)
    expect(saved.status).toBe('conflict')
    expect(saved.state.activeLessonSession?.sessionId).toBe(launch.session.sessionId)
  })

  test('32. ordinary completion clears the current active session', () => {
    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a new first session.')
    act(() => { result.current.completeLesson(resultFor(launch.lesson), launch.session.sessionId) })
    expect(result.current.progress.activeLessonSession).toBeNull()
  })

  test('33. a late checkpoint after ordinary completion cannot resurrect the session', () => {
    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a new first session.')
    act(() => { result.current.completeLesson(resultFor(launch.lesson), launch.session.sessionId) })
    const late = result.current.saveActiveSession(launch.session)
    expect(late.status).toBe('ignored_completed')
    expect(late.state.activeLessonSession).toBeNull()
  })

  test('34. journey launch accepts no outcome snapshot and plans from current state', () => {
    const { result } = renderHook(() => useQuestProgress())
    expect(result.current.prepareJourneyLaunch).toHaveLength(0)
    const launch = result.current.prepareJourneyLaunch()
    expect(['start', 'resume', 'content_needed']).toContain(launch.status)
  })

  test('35. journey reconciliation leaves the Parent Access record untouched', () => {
    window.localStorage.setItem(PARENT_ACCESS_STORAGE_KEY, '{"protected":"parent-access"}')
    persistState(completedActiveState())
    const { result } = renderHook(() => useQuestProgress())
    act(() => { result.current.prepareJourneyLaunch() })
    expect(window.localStorage.getItem(PARENT_ACCESS_STORAGE_KEY)).toBe('{"protected":"parent-access"}')
  })

  test('36. journey reconciliation leaves Parent Records untouched and keeps schema version 1', () => {
    window.localStorage.setItem(PARENT_RECORDS_STORAGE_KEY, '{"protected":"parent-records"}')
    persistState(completedActiveState())
    const { result } = renderHook(() => useQuestProgress())
    act(() => { result.current.prepareJourneyLaunch() })
    expect(window.localStorage.getItem(PARENT_RECORDS_STORAGE_KEY)).toBe('{"protected":"parent-records"}')
    expect(result.current.progress.schemaVersion).toBe(1)
    expect(QUEST_PROGRESS_STORAGE_KEY).toBe('rorys-reading-quest.progress.v1')
  })

  test('integration: complete, continue, resume, complete, and reject a late checkpoint', () => {
    const { result } = renderHook(() => useQuestProgress())
    const questA = result.current.prepareJourneyLaunch()
    if (questA.status !== 'start') throw new Error('Quest A should start for a fresh learner.')

    let outcomeA!: ReturnType<typeof result.current.completeLesson>
    act(() => { outcomeA = result.current.completeLesson(resultFor(questA.lesson), questA.session.sessionId) })
    expect(result.current.progress.activeLessonSession).toBeNull()
    expect(outcomeA.nextQuest.status).toBe('available')

    let questB!: ReturnType<typeof result.current.prepareJourneyLaunch>
    act(() => { questB = result.current.prepareJourneyLaunch() })
    if (questB.status !== 'start') throw new Error('Quest B should start from the latest planner state.')
    const questBLesson = questB.lesson
    const questBSession = questB.session
    expect(questBSession.sessionId).not.toBe(questA.session.sessionId)
    expect(result.current.progress.activeLessonSession?.sessionId).toBe(questBSession.sessionId)

    let resumedB!: ReturnType<typeof result.current.prepareJourneyLaunch>
    act(() => { resumedB = result.current.prepareJourneyLaunch() })
    expect(resumedB.status).toBe('resume')
    if (resumedB.status !== 'resume') throw new Error('Quest B should resume.')
    expect(resumedB.session.sessionId).toBe(questBSession.sessionId)

    act(() => { result.current.completeLesson(resultFor(questBLesson), questBSession.sessionId) })
    const afterQuestB = result.current.progress
    expect(afterQuestB.activeLessonSession).toBeNull()
    expect(afterQuestB.completedAttempts).toHaveLength(2)
    expect(afterQuestB.completedAttempts.map((attempt) => attempt.completionId)).toEqual([
      questA.session.sessionId,
      questBSession.sessionId,
    ])

    const lateCheckpoint = result.current.saveActiveSession(questBSession)
    expect(lateCheckpoint.status).toBe('ignored_completed')
    expect(lateCheckpoint.state.activeLessonSession).toBeNull()

    const rewardsBeforeDuplicate = {
      xp: result.current.progress.totalXp,
      stars: result.current.progress.totalStars,
      attempts: result.current.progress.completedAttempts.length,
    }
    act(() => { result.current.completeLesson(resultFor(questBLesson), questBSession.sessionId) })
    expect({
      xp: result.current.progress.totalXp,
      stars: result.current.progress.totalStars,
      attempts: result.current.progress.completedAttempts.length,
    }).toEqual(rewardsBeforeDuplicate)

    let next!: ReturnType<typeof result.current.prepareJourneyLaunch>
    act(() => { next = result.current.prepareJourneyLaunch() })
    expect(['start', 'resume']).toContain(next.status)
  })

  test('integration: newly registered content releases a persisted content-needed phase boundary', () => {
    const boundaryState = createDefaultQuestProgress(NOW)
    const noContentPlan = planGlobalQuest({ progress: boundaryState, availableLessons: [], now: NOW }).nextQuest
    expect(noContentPlan.status).toBe('content_needed')
    boundaryState.plannedNextQuest = noContentPlan

    const normalized = normalizePlannedNextQuest(boundaryState, candidates)
    expect(normalized.changed).toBe(true)
    expect(normalized.state.plannedNextQuest).toBeNull()

    const releasedPlan = planGlobalQuest({
      progress: normalized.state,
      availableLessons: candidates,
      now: '2026-08-24T22:05:00.000Z',
    }).nextQuest
    expect(releasedPlan.status).toBe('available')
    if (releasedPlan.status !== 'available') throw new Error('New registry content should be launchable.')
    expect(getLessonById(releasedPlan.lesson.lessonId).lesson).not.toBeNull()
    expect(normalized.state.totalXp).toBe(boundaryState.totalXp)
    expect(normalized.state.totalStars).toBe(boundaryState.totalStars)
    expect(normalized.state.completedAttempts).toEqual(boundaryState.completedAttempts)
  })
})
