import { describe, expect, test } from 'vitest'

import type { LessonResult } from '../../src/domain/lesson'
import { getLessonCandidates } from '../../src/domain/lesson'
import { applyLessonResult, createInitialSkillProgress } from '../../src/domain/progression'
import {
  completeQuestProgress,
  createDefaultQuestProgress,
  summarizeLocalProgress,
} from '../../src/persistence'

const completedAt = '2026-08-20T12:00:00.000Z'
const candidate = getLessonCandidates().find((lesson) => lesson.difficulty === 1)!
const lessonResult: LessonResult = {
  lessonId: candidate.lessonId,
  activityId: candidate.activityId,
  skillId: candidate.skillId,
  difficulty: candidate.difficulty,
  totalQuestions: 2,
  correctAnswers: 2,
  firstAttemptCorrect: 2,
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
  questionResults: [
    {
      questionId: 'question-a',
      isCorrect: true,
      isFirstAttemptCorrect: true,
      submittedAnswer: 'choice-a',
      correctAnswer: 'choice-a',
      explanation: 'Private teaching text is not persisted.',
      evidenceReference: [],
    },
    {
      questionId: 'question-b',
      isCorrect: true,
      isFirstAttemptCorrect: true,
      submittedAnswer: 'choice-b',
      correctAnswer: 'choice-b',
      explanation: 'Private teaching text is not persisted.',
      evidenceReference: [],
    },
  ],
  completed: true,
}

function progression() {
  const result = applyLessonResult({
    progress: createInitialSkillProgress(candidate.skillId),
    lessonResult,
    availableLessons: getLessonCandidates(),
    completedAt,
  })
  if (result.status !== 'applied') throw new Error(result.reason)
  return result
}

describe('completeQuestProgress', () => {
  test('stores one minimized attempt and awards deterministic rewards once', () => {
    const initial = createDefaultQuestProgress(completedAt)
    const first = completeQuestProgress({
      state: initial,
      completionId: 'session-a',
      lessonResult,
      progression: progression(),
      completedAt,
    })
    expect(first.duplicate).toBe(false)
    expect(first.earnedXp).toBe(30)
    expect(first.earnedStars).toBe(3)
    expect(first.state.completedAttempts).toHaveLength(1)
    expect(first.state.totalXp).toBeGreaterThanOrEqual(initial.totalXp)
    expect(first.state.totalStars).toBeGreaterThanOrEqual(initial.totalStars)

    const repeated = completeQuestProgress({
      state: first.state,
      completionId: 'session-a',
      lessonResult,
      progression: progression(),
      completedAt,
    })
    expect(repeated.duplicate).toBe(true)
    expect(repeated.earnedXp).toBe(0)
    expect(repeated.earnedStars).toBe(0)
    expect(repeated.state.completedAttempts).toHaveLength(1)
    expect(repeated.state.totalXp).toBe(first.state.totalXp)
    expect(repeated.state.totalStars).toBe(first.state.totalStars)
  })

  test('does not persist passage, explanation, correct-answer, submitted-answer, or official FAST fields', () => {
    const completed = completeQuestProgress({
      state: createDefaultQuestProgress(completedAt),
      completionId: 'session-a',
      lessonResult,
      progression: progression(),
      completedAt,
    })
    const serialized = JSON.stringify(completed.state.completedAttempts[0]).toLowerCase()
    expect(serialized).not.toContain('passagetext')
    expect(serialized).not.toContain('explanation')
    expect(serialized).not.toContain('correctanswer')
    expect(serialized).not.toContain('submittedanswer')
    expect(serialized).not.toContain('fastscore')
    expect(serialized).not.toContain('studentid')
  })

  test('builds a telemetry-free local progress summary', () => {
    const completed = completeQuestProgress({
      state: createDefaultQuestProgress(completedAt),
      completionId: 'session-a',
      lessonResult,
      progression: progression(),
      completedAt,
    })
    const summary = summarizeLocalProgress(completed.state)
    expect(summary.completedSessions).toBe(1)
    expect(summary.recentAverageAccuracy).toBe(100)
    expect(summary.skills[candidate.skillId].distinctIndependentEvidenceCount).toBe(1)
  })
})
