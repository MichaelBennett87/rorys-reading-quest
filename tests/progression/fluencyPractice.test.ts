import { describe, expect, test } from 'vitest'

import { getLessonCandidates } from '../../src/domain/lesson'
import { completeFluencyPractice } from '../../src/domain/progression/fluencyPractice'
import { createInitialSkillProgress } from '../../src/domain/progression'
import { completeFluencyPracticeProgress, createDefaultQuestProgress } from '../../src/persistence'
import type { LessonResult } from '../../src/domain/lesson'
import { buildReviewQueueIdentity } from '../../src/domain/progression/reviewQueueAffinity'

const completedAt = '2026-08-20T12:00:00.000Z'
const fluencyCandidates = getLessonCandidates().filter((candidate) => candidate.unitId === 'wg-unit-6')
const firstFluencyCandidate = fluencyCandidates[0]

function buildLessonResult(candidate = firstFluencyCandidate): LessonResult {
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

  test('marks fluency practice exhausted after all fresh lessons are used', () => {
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

    expect(result.nextQuest.status).toBe('content_needed')
    expect(result.reasonCodes).toContain('fluency_practice_exhausted')
  })

  test('completes a higher Grade 3 chapter difficulty without claiming oral mastery', () => {
    const grade3Candidates = fluencyCandidates.map((candidate, index) => ({
      ...candidate,
      lessonId: `grade-3-fluency-lesson-${index + 1}`,
      activityId: `grade-3-fluency-activity-${index + 1}`,
      skillId: 'g3-word-forge-word-analysis',
      unitId: 'g3-wg-unit-4',
      difficulty: 4,
      contentVersion: 'g3-wf-fluency-flight-r0.1.0',
    }))
    const progress = createInitialSkillProgress('g3-word-forge-word-analysis')
    progress.currentDifficulty = 4
    progress.lastMasteredDifficulty = 3
    progress.recentActivityUsage = grade3Candidates.map((candidate) => ({ ...candidate, completedAt }))

    const result = completeFluencyPractice({
      progress,
      lessonResult: buildLessonResult(grade3Candidates[0]),
      availableLessons: grade3Candidates,
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
})
