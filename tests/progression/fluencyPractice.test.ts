import { describe, expect, test } from 'vitest'

import { getLessonCandidates } from '../../src/domain/lesson'
import { completeFluencyPractice } from '../../src/domain/progression/fluencyPractice'
import { createInitialSkillProgress } from '../../src/domain/progression'
import {
  completeFluencyPracticeProgress,
  createDefaultQuestProgress,
  createLocalStorageQuestProgressStore,
  type CompletedLessonAttempt,
  type StorageLike,
} from '../../src/persistence'
import type { LessonResult } from '../../src/domain/lesson'
import { buildReviewQueueIdentity } from '../../src/domain/progression/reviewQueueAffinity'

const completedAt = '2026-08-20T12:00:00.000Z'
const fluencyCandidates = getLessonCandidates().filter((candidate) => candidate.unitId === 'wg-unit-6')
const firstFluencyCandidate = fluencyCandidates[0]
const grade3FluencyCandidates = getLessonCandidates().filter((candidate) => (
  candidate.skillId === 'g3-word-forge-word-analysis'
  && candidate.unitId === 'g3-wg-unit-4'
  && candidate.difficulty === 4
  && candidate.contentVersion === 'g3-wf-fluency-flight-r0.1.0'
))

function buildLessonResult(candidate = firstFluencyCandidate, assisted = false): LessonResult {
  return {
    lessonId: candidate.lessonId,
    activityId: candidate.activityId,
    skillId: candidate.skillId,
    difficulty: candidate.difficulty,
    lessonRole: 'FLUENCY_PRACTICE',
    totalQuestions: 4,
    correctAnswers: 4,
    firstAttemptCorrect: 4,
    accuracy: 100,
    assistanceUsed: assisted ? 1 : 0,
    assistanceSummary: {
      totalUniqueEvents: assisted ? 1 : 0,
      targetsHelped: assisted ? 1 : 0,
      maximumAssistanceLevel: assisted ? 1 : 0,
      visualHintUsed: assisted,
      spokenChunkHelpUsed: false,
      spokenWordHelpUsed: false,
      sentenceReadAloudUsed: false,
    },
    fluencyPracticeSummary: {
      modelReadUsed: true,
      phrasePracticeCompleted: true,
      completedReadCount: 2,
      reflection: 'smooth',
      oralReadingMeasured: false,
      timerUsed: false,
      microphoneUsed: false,
    },
    oralFluencyMeasured: false,
    questionResults: Array.from({ length: 4 }, (_, index) => ({
      questionId: `${candidate.lessonId}-question-${index + 1}`,
      isCorrect: true,
      isFirstAttemptCorrect: true,
      submittedAnswer: 'correct',
      correctAnswer: 'correct',
      explanation: 'Private teaching text is not persisted.',
      evidenceReference: [],
    })),
    completed: true,
  }
}

function completedAttempt(candidate = firstFluencyCandidate, index = 0): CompletedLessonAttempt {
  return {
    attemptId: `fluency-attempt-${candidate.activityId}-${index}`,
    completionId: `fluency-completion-${candidate.activityId}-${index}`,
    lessonId: candidate.lessonId,
    lessonRole: 'FLUENCY_PRACTICE',
    activityId: candidate.activityId,
    skillId: candidate.skillId,
    difficulty: candidate.difficulty,
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
    completedAt,
    progressionDecisionState: 'FLUENCY_PRACTICE',
    reasonCodes: ['fluency_practice_completed', 'oral_fluency_not_measured'],
    nextReviewDate: null,
  }
}

function grade3Progress() {
  const progress = createInitialSkillProgress('g3-word-forge-word-analysis')
  progress.currentDifficulty = 4
  progress.lastMasteredDifficulty = 3
  return progress
}

describe('fluency practice progression', () => {
  test('plans fresh Fluency Flight content before exhaustion', () => {
    const progress = createInitialSkillProgress(firstFluencyCandidate.skillId)
    progress.currentDifficulty = 8
    const result = completeFluencyPractice({
      progress,
      lessonResult: buildLessonResult(),
      availableLessons: fluencyCandidates,
      completedAt,
    })

    expect(result.progress.currentLearningState).toBe('FLUENCY_PRACTICE')
    expect(result.summary).toEqual(expect.objectContaining({
      modelReadUsed: true,
      phrasePracticeCompleted: true,
      completedReadCount: 2,
      reflection: 'smooth',
      oralReadingMeasured: false,
      timerUsed: false,
      microphoneUsed: false,
    }))
    expect(result.reasonCodes).toContain('fresh_fluency_practice_planned')
    expect(result.nextQuest.status).toBe('available')
    if (result.nextQuest.status === 'available') {
      expect(result.nextQuest.lesson.unitId).toBe('wg-unit-6')
    }
  })

  test('recycles Grade 2 fluency practice after every fresh lesson has been used', () => {
    const progress = createInitialSkillProgress(firstFluencyCandidate.skillId)
    progress.currentDifficulty = 8
    progress.recentActivityUsage = fluencyCandidates.map((candidate) => ({
      ...candidate,
      completedAt,
    }))

    const result = completeFluencyPractice({
      progress,
      lessonResult: buildLessonResult(),
      availableLessons: fluencyCandidates,
      completedAt,
    })

    expect(result.nextQuest.status).toBe('available')
    expect(result.reasonCodes).toContain('recycled_fluency_practice_planned')
    expect(result.reasonCodes).not.toContain('fluency_practice_exhausted')
    if (result.nextQuest.status === 'available') {
      expect(result.nextQuest.lesson).toMatchObject({
        skillId: firstFluencyCandidate.skillId,
        unitId: 'wg-unit-6',
        difficulty: firstFluencyCandidate.difficulty,
        contentVersion: firstFluencyCandidate.contentVersion,
      })
      expect(result.nextQuest.lesson.activityId).not.toBe(firstFluencyCandidate.activityId)
    }
  })

  test('allows a sole Grade 2 fluency activity to repeat without claiming exhaustion', () => {
    const progress = createInitialSkillProgress(firstFluencyCandidate.skillId)
    progress.currentDifficulty = firstFluencyCandidate.difficulty
    progress.recentActivityUsage = [{ ...firstFluencyCandidate, completedAt }]

    const result = completeFluencyPractice({
      progress,
      lessonResult: buildLessonResult(),
      availableLessons: [firstFluencyCandidate],
      completedAt,
    })

    expect(result.nextQuest).toMatchObject({
      status: 'available',
      lesson: { activityId: firstFluencyCandidate.activityId },
    })
    expect(result.reasonCodes).toContain('recycled_fluency_practice_planned')
  })

  test('keeps Grade 3 fluency at difficulty 4 while required activities remain incomplete', () => {
    expect(grade3FluencyCandidates).toHaveLength(7)
    const progress = grade3Progress()
    const current = grade3FluencyCandidates[1]
    progress.recentActivityUsage = [{ ...grade3FluencyCandidates[0], completedAt }]

    const result = completeFluencyPractice({
      progress,
      lessonResult: buildLessonResult(current),
      availableLessons: grade3FluencyCandidates,
      completedAttempts: [completedAttempt(grade3FluencyCandidates[0])],
      completedAt,
      completionDifficulty: 5,
    })

    expect(result.progress.currentDifficulty).toBe(4)
    expect(result.nextQuest.status).toBe('available')
    expect(result.reasonCodes).toContain('fresh_fluency_practice_planned')
    if (result.nextQuest.status === 'available') {
      expect([
        grade3FluencyCandidates[0].activityId,
        current.activityId,
      ]).not.toContain(result.nextQuest.lesson.activityId)
    }
  })

  test.each([
    ['empty', []],
    ['truncated', [{ ...grade3FluencyCandidates.at(-1)!, completedAt }]],
  ])('completes Grade 3 from durable attempts when recent usage is %s', (_label, recentActivityUsage) => {
    const current = grade3FluencyCandidates[0]
    const progress = grade3Progress()
    progress.recentActivityUsage = recentActivityUsage

    const result = completeFluencyPractice({
      progress,
      lessonResult: buildLessonResult(current),
      availableLessons: grade3FluencyCandidates,
      completedAttempts: grade3FluencyCandidates.slice(1).map(completedAttempt),
      completedAt,
      completionDifficulty: 5,
    })

    expect(result.progress).toMatchObject({
      currentDifficulty: 5,
      lastMasteredDifficulty: 3,
      currentLearningState: 'FLUENCY_PRACTICE',
    })
    expect(result.reasonCodes).toEqual(expect.arrayContaining([
      'fluency_practice_chapter_completed',
      'oral_fluency_not_measured',
    ]))
    expect(result.nextQuest).toMatchObject({ status: 'content_needed', difficulty: 5 })
    expect(result.reasonCodes).not.toContain('recycled_fluency_practice_planned')
  })

  test('counts duplicate attempts once and does not complete while one authored activity is missing', () => {
    const current = grade3FluencyCandidates[0]
    const completed = grade3FluencyCandidates.slice(1, -1).map(completedAttempt)
    completed.push(completedAttempt(grade3FluencyCandidates[1], 99))

    const result = completeFluencyPractice({
      progress: grade3Progress(),
      lessonResult: buildLessonResult(current),
      availableLessons: grade3FluencyCandidates,
      completedAttempts: completed,
      completedAt,
      completionDifficulty: 5,
    })

    expect(result.progress.currentDifficulty).toBe(4)
    expect(result.nextQuest.status).toBe('available')
    expect(result.reasonCodes).not.toContain('fluency_practice_chapter_completed')
  })

  test.each([
    ['Grade 2 skill', {
      ...grade3FluencyCandidates.at(-1)!,
      lessonId: 'g2-lookalike-fluency-lesson',
      skillId: 'g2-word-forge-word-practice',
    }],
    ['wrong unit', {
      ...grade3FluencyCandidates.at(-1)!,
      lessonId: 'wrong-unit-fluency-lesson',
      unitId: 'g3-wg-unit-3',
    }],
    ['wrong difficulty', {
      ...grade3FluencyCandidates.at(-1)!,
      lessonId: 'wrong-difficulty-fluency-lesson',
      difficulty: 3,
    }],
    ['wrong content version', {
      ...grade3FluencyCandidates.at(-1)!,
      lessonId: 'old-version-fluency-lesson',
      contentVersion: 'g3-wf-fluency-flight-r0.0.9',
    }],
  ])('does not count a %s attempt toward current Grade 3 completion', (_label, mismatchedCandidate) => {
    const current = grade3FluencyCandidates[0]
    const completed = grade3FluencyCandidates.slice(1, -1).map(completedAttempt)
    completed.push(completedAttempt(mismatchedCandidate))

    const result = completeFluencyPractice({
      progress: grade3Progress(),
      lessonResult: buildLessonResult(current),
      availableLessons: [...grade3FluencyCandidates, mismatchedCandidate],
      completedAttempts: completed,
      completedAt,
      completionDifficulty: 5,
    })

    expect(result.progress.currentDifficulty).toBe(4)
    expect(result.reasonCodes).not.toContain('fluency_practice_chapter_completed')
  })

  test('completes Grade 3 when the current assisted activity supplies the final authored activity without claiming oral mastery', () => {
    const current = grade3FluencyCandidates.at(-1)!
    const result = completeFluencyPractice({
      progress: grade3Progress(),
      lessonResult: buildLessonResult(current, true),
      availableLessons: grade3FluencyCandidates,
      completedAttempts: grade3FluencyCandidates.slice(0, -1).map(completedAttempt),
      completedAt,
      completionDifficulty: 5,
    })

    expect(result.progress).toMatchObject({ currentDifficulty: 5, lastMasteredDifficulty: 3 })
    expect(result.summary.oralReadingMeasured).toBe(false)
    expect(result.reasonCodes).toEqual(expect.arrayContaining([
      'fluency_practice_chapter_completed',
      'oral_fluency_not_measured',
    ]))
    expect(result.reasonCodes.some((reason) => /oral.*master/i.test(reason))).toBe(false)
  })

  test('keeps four Grade 3 Word Forge review identities separate from Grade 2', () => {
    const identities = [
      buildReviewQueueIdentity({ skillId: 'g2-word-forge-word-practice', difficulty: 8, unitId: 'wg-unit-6', contentVersion: 'g2-wf-fluency-practice-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-word-forge-word-analysis', difficulty: 1, unitId: 'g3-wg-unit-1', contentVersion: 'g3-wf-root-reactor-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-word-forge-word-analysis', difficulty: 2, unitId: 'g3-wg-unit-2', contentVersion: 'g3-wf-suffix-shifter-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-word-forge-word-analysis', difficulty: 3, unitId: 'g3-wg-unit-3', contentVersion: 'g3-wf-multisyllable-mountain-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-word-forge-word-analysis', difficulty: 4, unitId: 'g3-wg-unit-4', contentVersion: 'g3-wf-fluency-flight-r0.1.0' }),
    ]

    expect(new Set(identities.map((identity) => JSON.stringify(identity))).size).toBe(5)
  })

  test('fluency completion persists once and remains idempotent on duplicate completion ids', () => {
    const baseState = createDefaultQuestProgress(completedAt)
    const progress = createInitialSkillProgress(firstFluencyCandidate.skillId)
    progress.currentDifficulty = 8
    const fluencyProgress = completeFluencyPractice({
      progress,
      lessonResult: buildLessonResult(),
      availableLessons: fluencyCandidates,
      completedAt,
    })

    const first = completeFluencyPracticeProgress({
      state: baseState,
      completionId: 'fluency-completion-a',
      lessonResult: buildLessonResult(),
      fluencyProgress,
      completedAt,
    })

    const second = completeFluencyPracticeProgress({
      state: first.state,
      completionId: 'fluency-completion-a',
      lessonResult: buildLessonResult(),
      fluencyProgress,
      completedAt,
    })

    expect(first.duplicate).toBe(false)
    expect(first.state.completedAttempts).toHaveLength(1)
    expect(first.state.lastProgressionOutcome?.lessonRole).toBe('FLUENCY_PRACTICE')
    expect(second.duplicate).toBe(true)
    expect(second.state.completedAttempts).toHaveLength(1)
    expect(second.state.totalXp).toBe(first.state.totalXp)
    expect(second.state.totalStars).toBe(first.state.totalStars)
  })

  test('persists the Grade 3 completion boundary through schema-version-1 save/load and duplicate completion', () => {
    const current = grade3FluencyCandidates.at(-1)!
    const priorAttempts = grade3FluencyCandidates.slice(0, -1).map(completedAttempt)
    const progress = grade3Progress()
    const baseState = createDefaultQuestProgress(completedAt)
    baseState.skillProgress[progress.skillId] = progress
    baseState.completedAttempts = priorAttempts
    baseState.completedSessionCount = priorAttempts.length
    const fluencyProgress = completeFluencyPractice({
      progress,
      lessonResult: buildLessonResult(current),
      availableLessons: grade3FluencyCandidates,
      completedAttempts: priorAttempts,
      completedAt,
      completionDifficulty: 5,
    })
    const completed = completeFluencyPracticeProgress({
      state: baseState,
      completionId: 'grade-3-terminal-fluency-completion',
      lessonResult: buildLessonResult(current),
      fluencyProgress,
      completedAt,
    })
    const duplicate = completeFluencyPracticeProgress({
      state: completed.state,
      completionId: 'grade-3-terminal-fluency-completion',
      lessonResult: buildLessonResult(current),
      fluencyProgress,
      completedAt,
    })
    const values = new Map<string, string>()
    const storage: StorageLike = {
      getItem(key) { return values.get(key) ?? null },
      setItem(key, value) { values.set(key, value) },
    }
    const store = createLocalStorageQuestProgressStore(storage, () => completedAt)
    expect(store.save(completed.state).status).toBe('saved')
    const loaded = store.load()

    expect(loaded.status).toBe('loaded')
    expect(loaded.state.schemaVersion).toBe(1)
    expect(loaded.state.skillProgress[progress.skillId]).toMatchObject({
      currentDifficulty: 5,
      lastMasteredDifficulty: 3,
      currentLearningState: 'FLUENCY_PRACTICE',
    })
    expect(duplicate.duplicate).toBe(true)
    expect(duplicate.earnedXp).toBe(0)
    expect(duplicate.earnedStars).toBe(0)
    expect(duplicate.state.completedAttempts).toHaveLength(completed.state.completedAttempts.length)
    expect(duplicate.state.totalXp).toBe(completed.state.totalXp)
    expect(duplicate.state.totalStars).toBe(completed.state.totalStars)
  })
})
