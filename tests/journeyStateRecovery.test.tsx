import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { normalizePlannedNextQuest, planGlobalQuest } from '../src/domain/curriculum'
import { getLessonById, getLessonCandidates, type LessonResult } from '../src/domain/lesson'
import { applyLessonResult, createInitialSkillProgress } from '../src/domain/progression'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  completeQuestProgress,
  createActiveLessonSession,
  createDefaultQuestProgress,
  recoverActiveLessonSession,
  type CompletedLessonAttempt,
  type QuestProgressV1,
} from '../src/persistence'

const NOW = '2026-08-24T21:00:00.000Z'
const candidates = getLessonCandidates()
const firstCandidate = candidates.find((candidate) => (
  candidate.skillId === 'g2-word-forge-word-practice'
  && candidate.difficulty === 1
  && candidate.eligiblePurposes.includes('progression')
))!
const nextCandidate = candidates.find((candidate) => (
  candidate.skillId === firstCandidate.skillId
  && candidate.difficulty === firstCandidate.difficulty
  && candidate.lessonId !== firstCandidate.lessonId
  && candidate.eligiblePurposes.includes('progression')
))!
const firstLesson = getLessonById(firstCandidate.lessonId).lesson!
const nextLesson = getLessonById(nextCandidate.lessonId).lesson!

afterEach(() => {
  cleanup()
  window.localStorage.removeItem(QUEST_PROGRESS_STORAGE_KEY)
})

function completedAttempt(completionId: string): CompletedLessonAttempt {
  return {
    attemptId: completionId,
    completionId,
    lessonId: firstCandidate.lessonId,
    lessonRole: 'CHECKPOINT',
    activityId: firstCandidate.activityId,
    skillId: firstCandidate.skillId,
    difficulty: firstCandidate.difficulty,
    questionResults: Array.from({ length: 7 }, (_, index) => ({
      questionId: `reproduction-question-${index + 1}`,
      isCorrect: true,
      isFirstAttemptCorrect: true,
      submittedAnswer: 'correct',
      correctAnswer: 'correct',
      explanation: 'Fixture explanation.',
      evidenceReference: [],
    })),
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
    assistanceEvents: [],
    completedAt: NOW,
    progressionDecisionState: 'VERIFY_MASTERY',
    reasonCodes: ['independent_evidence'],
    nextReviewDate: null,
  }
}

function stateWithCompletedActiveSession(): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  const session = createActiveLessonSession(firstLesson, 'completed-session', NOW)
  state.activeLessonSession = session
  state.completedAttempts = [completedAttempt(session.sessionId)]
  state.completedSessionCount = 1
  state.totalXp = 100
  state.totalStars = 3
  state.plannedNextQuest = { status: 'available', purpose: 'progression', lesson: nextCandidate }
  state.lastProgressionOutcome = {
    completionId: session.sessionId,
    decisionState: 'VERIFY_MASTERY',
    reasonCodes: ['independent_evidence'],
    earnedXp: 100,
    earnedStars: 3,
    completedAt: NOW,
    lessonRole: 'CHECKPOINT',
  }
  return state
}

function resultForFirstLesson(): LessonResult {
  return {
    lessonId: firstCandidate.lessonId,
    activityId: firstCandidate.activityId,
    skillId: firstCandidate.skillId,
    difficulty: firstCandidate.difficulty,
    lessonRole: 'CHECKPOINT',
    totalQuestions: 7,
    correctAnswers: 7,
    firstAttemptCorrect: 7,
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
    questionResults: Array.from({ length: 7 }, (_, index) => ({
      questionId: `completion-question-${index + 1}`,
      isCorrect: true,
      isFirstAttemptCorrect: true,
      submittedAnswer: 'correct',
      correctAnswer: 'correct',
      explanation: 'Fixture explanation.',
      evidenceReference: [],
    })),
    fluencyPracticeSummary: null,
    oralFluencyMeasured: false,
    completed: true,
  }
}

function progressionForFirstLesson() {
  const progression = applyLessonResult({
    progress: createInitialSkillProgress(firstCandidate.skillId, firstCandidate.difficulty, 0),
    lessonResult: resultForFirstLesson(),
    availableLessons: candidates,
    completedAt: NOW,
  })
  if (progression.status !== 'applied') throw new Error(progression.reason)
  return progression
}

describe('P0 journey state recovery reproduction', () => {
  test('Case A: a completed catalog-compatible session is discarded instead of resumed', () => {
    const recovered = recoverActiveLessonSession({
      state: stateWithCompletedActiveSession(),
      availableLessons: candidates,
    })

    expect(recovered.status).toBe('discarded_completed')
    expect(recovered.state.activeLessonSession).toBeNull()
    expect(recovered.state.completedAttempts).toHaveLength(1)
    expect(recovered.state.totalXp).toBe(100)
    expect(recovered.state.totalStars).toBe(3)
  })

  test('Case B: duplicate completion clears a matching stale active session without another reward', () => {
    const initial = stateWithCompletedActiveSession()
    const completed = completeQuestProgress({
      state: initial,
      completionId: initial.activeLessonSession!.sessionId,
      lessonResult: resultForFirstLesson(),
      progression: progressionForFirstLesson(),
      completedAt: NOW,
    })

    expect(completed.duplicate).toBe(true)
    expect(completed.state.activeLessonSession).toBeNull()
    expect(completed.state.completedAttempts).toHaveLength(1)
    expect(completed.state.totalXp).toBe(initial.totalXp)
    expect(completed.state.totalStars).toBe(initial.totalStars)
    expect(completed.earnedXp).toBe(0)
    expect(completed.earnedStars).toBe(0)
  })

  test('Case C: a late checkpoint carrying a completed session identity cannot recover as active', () => {
    const state = stateWithCompletedActiveSession()
    state.activeLessonSession = {
      ...state.activeLessonSession!,
      currentQuestionIndex: 1,
      updatedAt: '2026-08-24T21:00:01.000Z',
    }

    const recovered = recoverActiveLessonSession({ state, availableLessons: candidates })
    expect(recovered.status).toBe('discarded_completed')
    expect(recovered.state.activeLessonSession).toBeNull()
    expect(recovered.state.completedAttempts).toHaveLength(1)
  })

  test('Case D: stored content-needed is cleared for fresh planning when content now exists', () => {
    const state = createDefaultQuestProgress(NOW)
    state.plannedNextQuest = {
      status: 'content_needed',
      purpose: 'progression',
      skillId: firstCandidate.skillId,
      difficulty: firstCandidate.difficulty,
      reason: 'Historical content boundary.',
    }

    const normalized = normalizePlannedNextQuest(state, candidates)
    expect(normalized.changed).toBe(true)
    expect(normalized.state.plannedNextQuest).toBeNull()
    expect(planGlobalQuest({ progress: normalized.state, availableLessons: candidates, now: NOW }).status).toBe('available')
  })

  test('Case E: a valid unfinished session remains resumable ahead of another plan', () => {
    const state = createDefaultQuestProgress(NOW)
    state.activeLessonSession = createActiveLessonSession(firstLesson, 'unfinished-session', NOW)
    state.plannedNextQuest = { status: 'available', purpose: 'progression', lesson: nextCandidate }

    const recovered = recoverActiveLessonSession({ state, availableLessons: candidates })
    const planned = planGlobalQuest({ progress: recovered.state, availableLessons: candidates, now: NOW })
    expect(recovered.status).toBe('resumable')
    expect(planned.source).toBe('active_session')
    expect(planned.lesson?.lessonId).toBe(firstLesson.lessonId)
  })

  test('Case F: an invalid active session is discarded while unrelated progress remains', () => {
    const state = createDefaultQuestProgress(NOW)
    state.totalXp = 45
    state.totalStars = 2
    state.activeLessonSession = {
      ...createActiveLessonSession(firstLesson, 'invalid-session', NOW),
      contentVersion: 'retired-version',
    }

    const recovered = recoverActiveLessonSession({ state, availableLessons: candidates })
    expect(recovered.status).toBe('discarded_incompatible')
    expect(recovered.state.activeLessonSession).toBeNull()
    expect(recovered.state.totalXp).toBe(45)
    expect(recovered.state.totalStars).toBe(2)
  })

  test('Case G: reload discards a completed active session and Start Journey launches the current plan', () => {
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(stateWithCompletedActiveSession()))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))

    expect(screen.getByRole('heading', { name: nextLesson.lessonTitle })).toBeTruthy()
    const stored = JSON.parse(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY)!) as QuestProgressV1
    expect(stored.activeLessonSession?.lessonId).toBe(nextLesson.lessonId)
    expect(stored.completedAttempts).toHaveLength(1)
    expect(stored.totalXp).toBe(100)
    expect(stored.totalStars).toBe(3)
  })

  test('Case H: rapid Start Journey activation creates only one active session', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: 'Start Journey' })
    fireEvent.click(button)
    fireEvent.click(button)

    const stored = JSON.parse(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY)!) as QuestProgressV1
    expect(stored.activeLessonSession).not.toBeNull()
    expect(stored.completedAttempts).toHaveLength(0)
    expect(screen.getAllByRole('heading', { name: firstLesson.lessonTitle })).toHaveLength(1)
  })

  test('Case I: genuine content-needed remains fail-closed without inventing a lesson', () => {
    const state = createDefaultQuestProgress(NOW)
    const plan = planGlobalQuest({ progress: state, availableLessons: [], now: NOW })

    expect(plan.status).toBe('content_needed')
    expect(plan.lesson).toBeNull()
    expect(plan.nextQuest.status).toBe('content_needed')
    expect(state.totalXp).toBe(0)
    expect(state.totalStars).toBe(0)
  })
})
