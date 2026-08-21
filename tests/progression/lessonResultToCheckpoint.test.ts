import { describe, expect, test } from 'vitest'

import type { LessonResult } from '../../src/domain/lesson'
import {
  createInitialSkillProgress,
  lessonResultToCheckpoint,
} from '../../src/domain/progression'

const result: LessonResult = {
  lessonId: 'lesson-a',
  activityId: 'activity-a',
  skillId: 'skill-a',
  difficulty: 1,
  lessonRole: 'GUIDED_PRACTICE',
  totalQuestions: 10,
  correctAnswers: 9,
  firstAttemptCorrect: 8,
  accuracy: 90,
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
  questionResults: Array.from({ length: 10 }, (_, index) => ({
    questionId: `question-${index + 1}`,
    isCorrect: index < 9,
    isFirstAttemptCorrect: index < 8,
    submittedAnswer: 'answer',
    correctAnswer: 'answer',
      explanation: 'Private teaching text is not persisted.',
      evidenceReference: [],
    })),
  fluencyPracticeSummary: null,
  oralFluencyMeasured: false,
  completed: true,
}

const context = {
  progress: createInitialSkillProgress('skill-a'),
  knownSkillIds: ['skill-a'],
  supportedDifficulties: [0, 1],
  relevantPrerequisite: null,
}

describe('lessonResultToCheckpoint', () => {
  test('normalizes percentage accuracy and safely calculates first-attempt accuracy', () => {
    const adapted = lessonResultToCheckpoint(result, context)
    expect(adapted.status).toBe('accepted')
    if (adapted.status === 'accepted') {
      expect(adapted.checkpointInput.accuracy).toBe(0.9)
      expect(adapted.checkpointInput.firstAttemptAccuracy).toBe(0.8)
      expect(adapted.checkpointInput.hintsUsed).toBe(0)
      expect(adapted.checkpointInput.sentenceReadAloudUsed).toBe(false)
    }
  })

  test('declines zero-question, incomplete, malformed, unknown-skill, and unsupported-difficulty results', () => {
    expect(lessonResultToCheckpoint({ ...result, totalQuestions: 0 }, context).status).toBe('declined')
    expect(lessonResultToCheckpoint({ ...result, completed: false }, context).status).toBe('declined')
    expect(lessonResultToCheckpoint({ ...result, accuracy: Number.NaN }, context).status).toBe('declined')
    expect(lessonResultToCheckpoint({ ...result, skillId: 'unknown' }, context).status).toBe('declined')
    expect(lessonResultToCheckpoint({ ...result, difficulty: 9 }, context).status).toBe('declined')
  })
})
