import type { LessonResult } from '../lesson'
import type { SkillProgressState } from './skillProgressTypes'
import type { CheckpointEvaluationInput } from './types'

export interface LessonResultAdapterContext {
  progress: SkillProgressState
  knownSkillIds: readonly string[]
  supportedDifficulties: readonly number[]
  relevantPrerequisite: string | null
}

export type LessonResultAdapterResult =
  | { status: 'accepted'; checkpointInput: CheckpointEvaluationInput }
  | { status: 'declined'; reason: string }

export function lessonResultToCheckpoint(
  lessonResult: LessonResult,
  context: LessonResultAdapterContext,
): LessonResultAdapterResult {
  if (!lessonResult.completed) {
    return { status: 'declined', reason: 'Lesson result is incomplete.' }
  }
  if (!Number.isInteger(lessonResult.totalQuestions) || lessonResult.totalQuestions <= 0) {
    return { status: 'declined', reason: 'Lesson result must contain at least one question.' }
  }
  const numericValues = [
    lessonResult.accuracy,
    lessonResult.correctAnswers,
    lessonResult.firstAttemptCorrect,
    lessonResult.assistanceUsed,
    lessonResult.difficulty,
  ]
  if (numericValues.some((value) => !Number.isFinite(value))) {
    return { status: 'declined', reason: 'Lesson result contains malformed numeric values.' }
  }
  if (
    lessonResult.accuracy < 0 || lessonResult.accuracy > 100
    || lessonResult.correctAnswers < 0 || lessonResult.correctAnswers > lessonResult.totalQuestions
    || lessonResult.firstAttemptCorrect < 0 || lessonResult.firstAttemptCorrect > lessonResult.totalQuestions
    || lessonResult.assistanceUsed < 0
  ) {
    return { status: 'declined', reason: 'Lesson result contains out-of-range values.' }
  }
  if (lessonResult.questionResults.length !== lessonResult.totalQuestions) {
    return { status: 'declined', reason: 'Lesson result question count does not match total questions.' }
  }
  if (!context.knownSkillIds.includes(lessonResult.skillId)) {
    return { status: 'declined', reason: `Unknown skill ID: ${lessonResult.skillId}` }
  }
  if (!context.supportedDifficulties.includes(lessonResult.difficulty)) {
    return { status: 'declined', reason: `Unsupported difficulty: ${lessonResult.difficulty}` }
  }
  if (lessonResult.skillId !== context.progress.skillId || lessonResult.difficulty !== context.progress.currentDifficulty) {
    return { status: 'declined', reason: 'Lesson result does not match the active skill trail.' }
  }
  const hintsUsed = lessonResult.assistanceSummary.visualHintUsed ? 1 : 0
  const majorHintsUsed = (
    lessonResult.assistanceSummary.spokenChunkHelpUsed
    || lessonResult.assistanceSummary.spokenWordHelpUsed
  )
    ? 1
    : 0
  const sentenceReadAloudUsed = lessonResult.assistanceSummary.sentenceReadAloudUsed

  return {
    status: 'accepted',
    checkpointInput: {
      accuracy: lessonResult.accuracy / 100,
      firstAttemptAccuracy: lessonResult.firstAttemptCorrect / lessonResult.totalQuestions,
      hintsUsed,
      majorHintsUsed,
      sentenceReadAloudUsed,
      consecutiveUnsuccessfulAtCurrentDifficulty:
        context.progress.consecutiveUnsuccessfulAtCurrentDifficulty,
      priorIndependentSuccessCount: context.progress.qualifyingIndependentActivityIds.length,
      currentDifficulty: context.progress.currentDifficulty,
      lastMasteredDifficulty: context.progress.lastMasteredDifficulty,
      relevantPrerequisite: context.relevantPrerequisite,
      currentLearningState: context.progress.currentLearningState,
      activityId: lessonResult.activityId,
      priorQualifyingIndependentActivityIds: [
        ...context.progress.qualifyingIndependentActivityIds,
      ],
    },
  }
}
