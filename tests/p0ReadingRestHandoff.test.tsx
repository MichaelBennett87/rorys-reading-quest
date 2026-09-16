import { act, cleanup, render, renderHook, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { useQuestProgress } from '../src/app/useQuestProgress'
import { curriculumTracks, planGlobalQuest } from '../src/domain/curriculum'
import {
  getLessonById,
  getLessonCandidates,
  type LessonDefinition,
  type LessonResult,
} from '../src/domain/lesson'
import { createInitialSkillProgress } from '../src/domain/progression'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  createActiveLessonSession,
  createDefaultQuestProgress,
  type CompletedLessonAttempt,
  type QuestProgressV1,
} from '../src/persistence'

const NOW = '2026-09-16T18:00:00.000Z'
const STORY_SKILL = 'g2-story-scouts-prose'
const INFORMATION_SKILL = 'g2-information-detectives-reading'
const lessons = getLessonCandidates()

afterEach(() => {
  cleanup()
  window.localStorage.removeItem(QUEST_PROGRESS_STORAGE_KEY)
})

function resolveLesson(predicate: Parameters<typeof lessons.find>[0]): LessonDefinition {
  const candidate = lessons.find(predicate)
  if (!candidate) throw new Error('Expected an authored lesson candidate for the handoff fixture.')
  const lesson = getLessonById(candidate.lessonId).lesson
  if (!lesson) throw new Error(`Expected lesson ${candidate.lessonId} to resolve.`)
  return lesson
}

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
      submittedAnswer: 'audited-correct-answer',
      correctAnswer: 'audited-correct-answer',
      explanation: 'P0 topic-handoff fixture.',
      evidenceReference: [],
    })),
    fluencyPracticeSummary: null,
    oralFluencyMeasured: false,
    completed: true,
  }
}

function completedAttempt(lesson: LessonDefinition): CompletedLessonAttempt {
  return {
    attemptId: `attempt-${lesson.activityId}`,
    completionId: `session-${lesson.activityId}`,
    lessonId: lesson.lessonId,
    lessonRole: lesson.lessonRole,
    activityId: lesson.activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
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
    assistanceEvents: [],
    completedAt: NOW,
    progressionDecisionState: 'VERIFY_MASTERY',
    reasonCodes: ['independent_evidence', 'verification_required'],
    nextReviewDate: null,
  }
}

function store(state: QuestProgressV1) {
  window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
}

function markTrackComplete(state: QuestProgressV1, trackIndex: number) {
  const track = curriculumTracks[trackIndex]
  state.skillProgress[track.skillId] = createInitialSkillProgress(
    track.skillId,
    track.completionDifficulty,
    track.completionDifficulty - 1,
  )
}

describe('P0 false Reading Rest handoffs', () => {
  test('a declined stale completion preserves the authoritative active session for recovery', () => {
    const lesson = resolveLesson((candidate) => (
      candidate.skillId === STORY_SKILL
      && candidate.difficulty === 1
      && candidate.eligiblePurposes.includes('progression')
    ))
    const state = createDefaultQuestProgress(NOW)
    state.skillProgress[STORY_SKILL] = createInitialSkillProgress(STORY_SKILL, 2, 1)
    state.activeLessonSession = createActiveLessonSession(
      lesson,
      'stale-story-session',
      NOW,
      { purpose: 'progression' },
    )
    store(state)

    const journey = renderHook(() => useQuestProgress())
    let outcome!: ReturnType<typeof journey.result.current.completeLesson>
    act(() => {
      outcome = journey.result.current.completeLesson(perfectResult(lesson), 'stale-story-session')
    })

    expect(outcome.persisted).toBe(false)
    expect(outcome.kind).toBe('RECOVERY_NEEDED')
    expect(outcome.recoveryMessage).toMatch(/current work is still available/i)
    expect(journey.result.current.progress.activeLessonSession?.sessionId).toBe('stale-story-session')
    expect(journey.result.current.progress.completedAttempts).toHaveLength(0)
    expect(journey.result.current.progress.plannedNextQuest?.status).not.toBe('content_needed')
  })

  test('keeps verification affinity on its own skill when the latest global attempt belongs elsewhere', () => {
    const storyVerification = lessons.filter((candidate) => (
      candidate.skillId === STORY_SKILL
      && candidate.difficulty === 2
      && candidate.eligiblePurposes.includes('verification')
    ))
    expect(storyVerification.length).toBeGreaterThan(1)
    const informationLesson = resolveLesson((candidate) => (
      candidate.skillId === INFORMATION_SKILL
      && candidate.eligiblePurposes.includes('progression')
    ))
    const state = createDefaultQuestProgress(NOW)
    state.skillProgress[STORY_SKILL] = createInitialSkillProgress(STORY_SKILL, 2, 1)
    state.skillProgress[STORY_SKILL].currentLearningState = 'VERIFY_MASTERY'
    state.skillProgress[STORY_SKILL].qualifyingIndependentActivityIds = [storyVerification[0].activityId]
    state.completedAttempts = [completedAttempt(informationLesson)]

    const plan = planGlobalQuest({ progress: state, availableLessons: lessons, now: NOW })

    expect(plan).toMatchObject({
      status: 'available',
      purpose: 'verification',
      skillId: STORY_SKILL,
      unitId: 'ss-unit-2',
      difficulty: 2,
    })
  })

  test('persists the newly eligible Information Detectives progress at the Story Scouts boundary', () => {
    const perspectiveVerification = lessons.filter((candidate) => (
      candidate.skillId === STORY_SKILL
      && candidate.unitId === 'ss-unit-3'
      && candidate.difficulty === 3
      && candidate.eligiblePurposes.includes('verification')
    ))
    expect(perspectiveVerification.length).toBeGreaterThan(1)
    const lesson = getLessonById(perspectiveVerification[1].lessonId).lesson
    if (!lesson) throw new Error('Expected the final Story Scouts verification lesson.')

    const state = createDefaultQuestProgress(NOW)
    state.skillProgress[STORY_SKILL] = createInitialSkillProgress(STORY_SKILL, 3, 2)
    state.skillProgress[STORY_SKILL].currentLearningState = 'VERIFY_MASTERY'
    state.skillProgress[STORY_SKILL].qualifyingIndependentActivityIds = [perspectiveVerification[0].activityId]
    state.activeLessonSession = createActiveLessonSession(
      lesson,
      'story-track-completion',
      NOW,
      { purpose: 'verification' },
    )
    store(state)

    const journey = renderHook(() => useQuestProgress())
    let outcome!: ReturnType<typeof journey.result.current.completeLesson>
    act(() => {
      outcome = journey.result.current.completeLesson(perfectResult(lesson), 'story-track-completion')
    })

    expect(outcome.persisted).toBe(true)
    expect(outcome.nextQuest).toMatchObject({
      status: 'available',
      lesson: { skillId: INFORMATION_SKILL, unitId: 'id-unit-1', difficulty: 1 },
    })
    expect(journey.result.current.progress.skillProgress[STORY_SKILL].currentDifficulty).toBe(4)
    expect(journey.result.current.progress.skillProgress[INFORMATION_SKILL]).toBeDefined()
    expect(journey.result.current.progress.completedAttempts).toHaveLength(1)
  })

  test('retires a stranded no-content plan and launches the globally eligible next topic', () => {
    const state = createDefaultQuestProgress(NOW)
    state.skillProgress[STORY_SKILL] = createInitialSkillProgress(STORY_SKILL, 4, 3)
    state.plannedNextQuest = {
      status: 'content_needed',
      purpose: 'progression',
      skillId: STORY_SKILL,
      difficulty: 4,
      reason: 'Stored false Reading Rest after Story Scouts completion.',
    }
    store(state)

    const firstVisit = renderHook(() => useQuestProgress())
    let launch!: ReturnType<typeof firstVisit.result.current.prepareJourneyLaunch>
    act(() => {
      launch = firstVisit.result.current.prepareJourneyLaunch()
    })

    expect(launch).toMatchObject({
      status: 'start',
      lesson: { skillId: INFORMATION_SKILL, unitId: 'id-unit-1', difficulty: 1 },
    })
    expect(firstVisit.result.current.progress.plannedNextQuest?.status).not.toBe('content_needed')
    expect(firstVisit.result.current.progress.activeLessonSession?.skillId).toBe(INFORMATION_SKILL)
  })

  test('an open genuine-rest page adopts newer same-origin progress on a storage event', async () => {
    const complete = createDefaultQuestProgress(NOW)
    for (const track of curriculumTracks) {
      complete.skillProgress[track.skillId] = createInitialSkillProgress(
        track.skillId,
        track.completionDifficulty,
        track.completionDifficulty - 1,
      )
    }
    complete.plannedNextQuest = {
      status: 'content_needed',
      purpose: 'progression',
      skillId: 'g3-word-forge-word-analysis',
      difficulty: 5,
      reason: 'All authored curriculum is complete.',
    }
    store(complete)
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Grade 3 Journey Complete!' })).toBeTruthy()

    const newer = createDefaultQuestProgress('2026-09-16T18:05:00.000Z')
    const serialized = JSON.stringify(newer)
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, serialized)
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: QUEST_PROGRESS_STORAGE_KEY,
        newValue: serialized,
      }))
    })

    expect(await screen.findByText(/Question 1 of 6/i)).toBeTruthy()
    expect(screen.queryByText('Reading Rest')).toBeNull()
  })

  test('keeps every registered ordinary difficulty and topic handoff globally launchable', () => {
    for (const [trackIndex, track] of curriculumTracks.entries()) {
      for (let earlier = 0; earlier < trackIndex; earlier += 1) {
        // Each iteration below gets its own state; this loop documents the prerequisite frontier.
        expect(curriculumTracks[earlier].curriculumOrder).toBeLessThan(track.curriculumOrder)
      }

      for (let difficulty = track.initialDifficulty; difficulty < track.completionDifficulty; difficulty += 1) {
        const state = createDefaultQuestProgress(NOW)
        for (let earlier = 0; earlier < trackIndex; earlier += 1) markTrackComplete(state, earlier)
        state.skillProgress[track.skillId] = createInitialSkillProgress(
          track.skillId,
          difficulty,
          Math.max(track.initialLastMasteredDifficulty, difficulty - 1),
        )

        const plan = planGlobalQuest({ progress: state, availableLessons: lessons, now: NOW })
        expect(plan, `${track.trackId} difficulty ${difficulty}`).toMatchObject({
          status: 'available',
          skillId: track.skillId,
          difficulty,
        })
        expect(track.unitIds).toContain(plan.unitId)
      }

      const completed = createDefaultQuestProgress(NOW)
      for (let through = 0; through <= trackIndex; through += 1) markTrackComplete(completed, through)
      const next = planGlobalQuest({ progress: completed, availableLessons: lessons, now: NOW })
      const expectedNext = curriculumTracks[trackIndex + 1]
      if (expectedNext) {
        expect(next, `${track.trackId} topic handoff`).toMatchObject({
          status: 'available',
          skillId: expectedNext.skillId,
        })
      } else {
        expect(next).toMatchObject({ status: 'content_needed', curriculumComplete: true })
      }
    }
  })
})
