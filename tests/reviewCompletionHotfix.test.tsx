import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { useQuestProgress } from '../src/app/useQuestProgress'
import { curriculumTracks } from '../src/domain/curriculum'
import {
  getLessonById,
  getLessonCandidates,
  type LessonDefinition,
  type LessonResult,
} from '../src/domain/lesson'
import { createInitialSkillProgress, type LearningState } from '../src/domain/progression'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  createActiveLessonSession,
  createDefaultQuestProgress,
  type ActiveLessonSession,
  type QuestProgressV1,
  type ReviewQueueEntry,
} from '../src/persistence'

const NOW = '2026-08-31T12:00:00.000Z'
const candidates = getLessonCandidates()

interface TestReviewIdentity {
  skillId: string
  difficulty: number
  unitId: string
  contentVersion: string
  dueAt: string
}

interface TestLaunchContext {
  purpose: 'progression' | 'verification' | 'remediation' | 'review'
  reviewIdentity?: TestReviewIdentity
  returnLearningState?: LearningState
}

type SessionWithLaunchContext = ActiveLessonSession & {
  launchContext?: TestLaunchContext
}

const storyMap = findLesson({
  skillId: 'g2-story-scouts-prose',
  unitId: 'ss-unit-1',
  contentVersion: 'g2-ss-plot-elements-r0.1.0',
  activityId: 'activity-story-map-checkpoint-a',
})
const academicWordWorkshop = findLesson({
  skillId: 'g3-context-cavern-vocabulary',
  unitId: 'g3-cc-unit-1',
  contentVersion: 'g3-cc-academic-word-r0.1.0',
  difficulty: 1,
})
const rootMeaningVault = findLesson({
  skillId: 'g3-context-cavern-vocabulary',
  unitId: 'g3-cc-unit-2',
  contentVersion: 'g3-cc-root-meaning-r0.1.0',
  difficulty: 2,
})
const meaningMaze = findLesson({
  skillId: 'g3-context-cavern-vocabulary',
  unitId: 'g3-cc-unit-3',
  contentVersion: 'g3-cc-meaning-maze-r0.1.0',
  difficulty: 3,
})

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(NOW))
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.useRealTimers()
})

describe('P0 unit-affine review completion hotfix', () => {
  test('Case A: a completed Grade 2 historical review records rewards and reschedules only its exact queue entry', () => {
    const state = completedCurriculumState()
    const grade2Review = reviewEntry(storyMap, 1)
    const grade3Review = reviewEntry(meaningMaze, 1)
    state.reviewQueue = [grade2Review, grade3Review]
    const beforeTrack = progressionSnapshot(state, storyMap.skillId)
    const before = counters(state)
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected the due Grade 2 review to start.')
    expect(launch.lesson.lessonTitle).toBe('Story Map Checkpoint: Cleanup, Bridge, and Seedlings')

    let outcome!: ReturnType<typeof result.current.completeLesson>
    act(() => {
      outcome = result.current.completeLesson(resultFor(launch.lesson), launch.session.sessionId)
    })

    expect((launch.session as SessionWithLaunchContext).launchContext).toMatchObject({
      purpose: 'review',
      reviewIdentity: grade2Review,
    })
    expect(counters(result.current.progress)).toEqual({
      attempts: before.attempts + 1,
      sessions: before.sessions + 1,
      xp: before.xp + 105,
      stars: before.stars + 3,
    })
    expect(progressionSnapshot(result.current.progress, storyMap.skillId)).toEqual(beforeTrack)
    expect(result.current.progress.activeLessonSession).toBeNull()
    expect(findQueuedReview(result.current.progress, grade2Review)).toMatchObject({
      reviewStep: 2,
      dueAt: '2026-09-07T12:00:00.000Z',
    })
    expect(findQueuedReview(result.current.progress, grade3Review)).toEqual(grade3Review)
    expect(outcome.kind).toBe('SPACED_REVIEW')
    expect(outcome.nextQuest).toMatchObject({
      status: 'available',
      purpose: 'review',
      lesson: { skillId: meaningMaze.skillId, unitId: meaningMaze.unitId },
    })
  })

  test('Case B: a completed Grade 3 track can complete an earlier-unit historical review', () => {
    const state = completedCurriculumState()
    const review = reviewEntry(academicWordWorkshop, 2)
    const separateSameSkillReview = reviewEntry(rootMeaningVault, 1)
    state.reviewQueue = [review, separateSameSkillReview]
    const beforeTrack = progressionSnapshot(state, academicWordWorkshop.skillId)
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected the earlier-unit Grade 3 review to start.')
    expect(launch.lesson.unitId).toBe(academicWordWorkshop.unitId)
    act(() => {
      result.current.completeLesson(resultFor(launch.lesson), launch.session.sessionId)
    })

    expect(progressionSnapshot(result.current.progress, academicWordWorkshop.skillId)).toEqual(beforeTrack)
    expect(findQueuedReview(result.current.progress, review)).toMatchObject({
      reviewStep: 3,
      dueAt: '2026-09-14T12:00:00.000Z',
    })
    expect(findQueuedReview(result.current.progress, separateSameSkillReview)).toEqual(separateSameSkillReview)
  })

  test('Case C: an incomplete advanced track can review an earlier unit without changing progression', () => {
    const state = completedCurriculumState()
    state.skillProgress[storyMap.skillId] = {
      ...state.skillProgress[storyMap.skillId],
      currentDifficulty: 3,
      lastMasteredDifficulty: 2,
      currentLearningState: 'CHECKPOINT',
      qualifyingIndependentActivityIds: ['existing-independent-proof'],
      consecutiveUnsuccessfulAtCurrentDifficulty: 1,
      lastDecisionReasonCodes: ['existing_reason'],
    }
    const review = reviewEntry(storyMap, 1)
    state.reviewQueue = [review]
    const beforeTrack = progressionSnapshot(state, storyMap.skillId)
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected the historical review to start.')
    act(() => {
      result.current.completeLesson(resultFor(launch.lesson), launch.session.sessionId)
    })

    expect(progressionSnapshot(result.current.progress, storyMap.skillId)).toEqual(beforeTrack)
    expect(result.current.progress.completedAttempts.at(-1)).toMatchObject({
      progressionDecisionState: 'SPACED_REVIEW',
      reasonCodes: expect.arrayContaining(['review_completed', 'track_progress_preserved']),
    })
  })

  test.each([
    ['independent success', 100, false, 3],
    ['assisted success', 100, true, 3],
    ['partial success', 75, false, 3],
    ['unsuccessful review', 60, false, 1],
  ] as const)('Case D: same-difficulty %s preserves the track and updates only review spacing', (_label, accuracy, assisted, expectedStep) => {
    const state = completedCurriculumState()
    state.skillProgress[storyMap.skillId] = {
      ...createInitialSkillProgress(storyMap.skillId, storyMap.difficulty, 0),
      currentLearningState: 'CHECKPOINT',
      qualifyingIndependentActivityIds: ['existing-proof'],
      consecutiveUnsuccessfulAtCurrentDifficulty: 1,
    }
    const review = reviewEntry(storyMap, 2)
    state.reviewQueue = [review]
    const beforeTrack = progressionSnapshot(state, storyMap.skillId)
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected the same-difficulty review to start.')
    act(() => {
      result.current.completeLesson(resultFor(launch.lesson, accuracy, assisted), launch.session.sessionId)
    })

    expect(progressionSnapshot(result.current.progress, storyMap.skillId)).toEqual(beforeTrack)
    expect(findQueuedReview(result.current.progress, review)?.reviewStep).toBe(expectedStep)
  })

  test('Case E: an ordinary historical lesson without review authority remains rejected', () => {
    const state = completedCurriculumState()
    state.skillProgress[storyMap.skillId] = {
      ...state.skillProgress[storyMap.skillId],
      currentDifficulty: 3,
      lastMasteredDifficulty: 2,
      currentLearningState: 'CHECKPOINT',
    }
    state.reviewQueue = []
    const beforeTrack = progressionSnapshot(state, storyMap.skillId)
    const before = counters(state)
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    const begun = result.current.beginLesson(storyMap)
    expect(begun.status).toBe('started')
    let outcome!: ReturnType<typeof result.current.completeLesson>
    act(() => {
      outcome = result.current.completeLesson(resultFor(storyMap), begun.session.sessionId)
    })

    expect(counters(result.current.progress)).toEqual(before)
    expect(progressionSnapshot(result.current.progress, storyMap.skillId)).toEqual(beforeTrack)
    expect(outcome.kind).toBe('CONTENT_NEEDED')
    expect(outcome.nextQuest).toMatchObject({
      status: 'content_needed',
      reason: 'Lesson result does not match the active skill trail.',
    })
  })

  test('preserves authoritative review purpose through checkpoint save and reload', () => {
    const state = completedCurriculumState()
    const review = reviewEntry(storyMap, 1)
    state.reviewQueue = [review]
    persistState(state)

    const first = renderHook(() => useQuestProgress())
    const launch = first.result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a review session to start.')
    const checkpoint = { ...launch.session, currentQuestionIndex: 1, updatedAt: NOW }
    act(() => {
      expect(first.result.current.saveActiveSession(checkpoint).status).toBe('saved')
    })
    first.unmount()

    const reloaded = renderHook(() => useQuestProgress())
    const resumed = reloaded.result.current.prepareJourneyLaunch()
    if (resumed.status !== 'resume') throw new Error('Expected the saved review session to resume.')
    expect(resumed.session.sessionId).toBe(launch.session.sessionId)
    expect((resumed.session as SessionWithLaunchContext).launchContext).toMatchObject({
      purpose: 'review',
      reviewIdentity: review,
    })
    act(() => {
      reloaded.result.current.completeLesson(resultFor(resumed.lesson), resumed.session.sessionId)
    })
    expect(reloaded.result.current.progress.completedAttempts.at(-1)?.completionId).toBe(resumed.session.sessionId)
  })

  test('duplicate review completion is exact-once for attempts, rewards, and queue spacing', () => {
    const state = completedCurriculumState()
    const review = reviewEntry(storyMap, 1)
    state.reviewQueue = [review]
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a review session to start.')
    const lessonResult = resultFor(launch.lesson)
    act(() => {
      result.current.completeLesson(lessonResult, launch.session.sessionId)
    })
    const afterFirst = structuredClone(result.current.progress)
    act(() => {
      result.current.completeLesson(lessonResult, launch.session.sessionId)
    })

    expect(counters(result.current.progress)).toEqual(counters(afterFirst))
    expect(result.current.progress.reviewQueue).toEqual(afterFirst.reviewQueue)
    expect(result.current.progress.completedAttempts.filter((attempt) => (
      attempt.completionId === launch.session.sessionId
    ))).toHaveLength(1)
    expect(result.current.saveActiveSession(launch.session).status).toBe('ignored_completed')
  })

  test.each([
    ['wrong skill', { skillId: meaningMaze.skillId }],
    ['wrong difficulty', { difficulty: 99 }],
    ['wrong unit', { unitId: meaningMaze.unitId }],
    ['wrong content version', { contentVersion: meaningMaze.contentVersion }],
    ['wrong due entry', { dueAt: '2026-08-30T12:00:00.000Z' }],
    ['wrong review step', { reviewStep: 4 }],
  ])('rejects persisted review context with %s', (_label, identityChange) => {
    const state = completedCurriculumState()
    const review = reviewEntry(storyMap, 1)
    state.reviewQueue = [review]
    state.activeLessonSession = withReviewContext(
      createActiveLessonSession(storyMap, `forged:${String(_label)}`, NOW),
      { ...review, ...identityChange },
      state.skillProgress[storyMap.skillId].currentLearningState,
    )
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    expect(result.current.progress.activeLessonSession).toBeNull()
  })

  test('rejects review context when no matching queue entry exists', () => {
    const state = completedCurriculumState()
    const review = reviewEntry(storyMap, 1)
    state.reviewQueue = []
    state.activeLessonSession = withReviewContext(
      createActiveLessonSession(storyMap, 'forged:no-queue', NOW),
      review,
      state.skillProgress[storyMap.skillId].currentLearningState,
    )
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    expect(result.current.progress.activeLessonSession).toBeNull()
  })

  test('rejects cross-grade review context attached to the wrong lesson', () => {
    const state = completedCurriculumState()
    const review = reviewEntry(storyMap, 1)
    state.reviewQueue = [review]
    state.activeLessonSession = withReviewContext(
      createActiveLessonSession(meaningMaze, 'forged:cross-grade-lesson', NOW),
      review,
      state.skillProgress[storyMap.skillId].currentLearningState,
    )
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    expect(result.current.progress.activeLessonSession).toBeNull()
  })

  test('a checkpoint cannot replace the authoritative review identity', () => {
    const state = completedCurriculumState()
    const review = reviewEntry(storyMap, 1)
    state.reviewQueue = [review]
    persistState(state)

    const { result } = renderHook(() => useQuestProgress())
    const launch = result.current.prepareJourneyLaunch()
    if (launch.status !== 'start') throw new Error('Expected a review session to start.')
    const forgedCheckpoint = structuredClone(launch.session) as SessionWithLaunchContext
    if (!forgedCheckpoint.launchContext?.reviewIdentity) throw new Error('Expected persisted review identity.')
    forgedCheckpoint.launchContext.reviewIdentity.unitId = meaningMaze.unitId

    const rejected = result.current.saveActiveSession(forgedCheckpoint)
    expect(rejected.status).toBe('ignored_stale')
    expect(rejected.state.activeLessonSession).toEqual(launch.session)
  })
})

function findLesson(identity: {
  skillId: string
  unitId: string
  contentVersion: string
  difficulty?: number
  activityId?: string
}): LessonDefinition {
  const candidate = candidates.find((entry) => (
    entry.skillId === identity.skillId
    && entry.unitId === identity.unitId
    && entry.contentVersion === identity.contentVersion
    && (identity.difficulty === undefined || entry.difficulty === identity.difficulty)
    && (identity.activityId === undefined || entry.activityId === identity.activityId)
    && entry.eligiblePurposes.includes('review')
  ))
  if (!candidate) throw new Error(`Missing review fixture for ${identity.unitId}.`)
  const lesson = getLessonById(candidate.lessonId).lesson
  if (!lesson) throw new Error(`Missing lesson definition for ${candidate.lessonId}.`)
  return lesson
}

function completedCurriculumState(): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  for (const track of curriculumTracks) {
    const existing = state.skillProgress[track.skillId]
      ?? createInitialSkillProgress(track.skillId, track.initialDifficulty, track.initialLastMasteredDifficulty)
    state.skillProgress[track.skillId] = {
      ...existing,
      currentDifficulty: track.completionDifficulty,
      lastMasteredDifficulty: Math.max(existing.lastMasteredDifficulty, track.completionDifficulty - 1),
      currentLearningState: 'SPACED_REVIEW',
      qualifyingIndependentActivityIds: [],
      consecutiveUnsuccessfulAtCurrentDifficulty: 0,
      remediationContext: null,
    }
  }
  state.plannedNextQuest = null
  state.activeLessonSession = null
  return state
}

function reviewEntry(lesson: LessonDefinition, reviewStep: number): ReviewQueueEntry & TestReviewIdentity {
  return {
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    reviewStep,
    dueAt: NOW,
    unitId: lesson.unitId,
    contentVersion: lesson.contentVersion,
  }
}

function withReviewContext(
  session: ActiveLessonSession,
  reviewIdentity: TestReviewIdentity,
  returnLearningState: LearningState,
): ActiveLessonSession {
  return {
    ...session,
    launchContext: {
      purpose: 'review',
      reviewIdentity,
      returnLearningState,
    },
  } as SessionWithLaunchContext
}

function resultFor(lesson: LessonDefinition, accuracy = 100, assisted = false): LessonResult {
  const totalQuestions = lesson.questions.length
  const correctAnswers = Math.floor((accuracy / 100) * totalQuestions)
  return {
    lessonId: lesson.lessonId,
    activityId: lesson.activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    lessonRole: lesson.lessonRole,
    totalQuestions,
    correctAnswers,
    firstAttemptCorrect: correctAnswers,
    accuracy,
    assistanceUsed: assisted ? 1 : 0,
    assistanceSummary: {
      totalUniqueEvents: assisted ? 1 : 0,
      targetsHelped: assisted ? 1 : 0,
      maximumAssistanceLevel: assisted ? 2 : 0,
      visualHintUsed: assisted,
      spokenChunkHelpUsed: false,
      spokenWordHelpUsed: false,
      sentenceReadAloudUsed: false,
    },
    questionResults: lesson.questions.map((question, index) => ({
      questionId: question.questionId,
      isCorrect: index < correctAnswers,
      isFirstAttemptCorrect: index < correctAnswers,
      submittedAnswer: index < correctAnswers ? 'fixture-correct' : 'fixture-incorrect',
      correctAnswer: 'fixture-correct',
      explanation: 'Fixture explanation.',
      evidenceReference: [],
    })),
    fluencyPracticeSummary: null,
    oralFluencyMeasured: false,
    completed: true,
  }
}

function progressionSnapshot(state: QuestProgressV1, skillId: string) {
  const progress = state.skillProgress[skillId]
  return {
    currentDifficulty: progress.currentDifficulty,
    lastMasteredDifficulty: progress.lastMasteredDifficulty,
    currentLearningState: progress.currentLearningState,
    qualifyingIndependentActivityIds: [...progress.qualifyingIndependentActivityIds],
    consecutiveUnsuccessfulAtCurrentDifficulty: progress.consecutiveUnsuccessfulAtCurrentDifficulty,
    reviewStep: progress.reviewStep,
    nextReviewDate: progress.nextReviewDate,
    lastDecisionReasonCodes: [...progress.lastDecisionReasonCodes],
    remediationContext: progress.remediationContext ? { ...progress.remediationContext } : null,
  }
}

function counters(state: QuestProgressV1) {
  return {
    attempts: state.completedAttempts.length,
    sessions: state.completedSessionCount,
    xp: state.totalXp,
    stars: state.totalStars,
  }
}

function findQueuedReview(state: QuestProgressV1, identity: TestReviewIdentity) {
  return state.reviewQueue.find((entry) => (
    entry.skillId === identity.skillId
    && entry.difficulty === identity.difficulty
    && entry.unitId === identity.unitId
    && entry.contentVersion === identity.contentVersion
  ))
}

function persistState(state: QuestProgressV1) {
  window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
}
