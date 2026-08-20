import type { LessonResult, LessonResultQuestion, QuestionEvaluationResult } from './lessonTypes'
import type { AssistanceSummary } from '../assistance'

interface BuildLessonResultInput {
  lessonId: string
  activityId: string
  skillId: string
  difficulty: number
  questionEvaluations: QuestionEvaluationResult[]
  assistanceSummary?: AssistanceSummary
}

export function buildLessonResult(input: BuildLessonResultInput): LessonResult {
  const totalQuestions = input.questionEvaluations.length
  const correctAnswers = input.questionEvaluations.reduce((count, result) => {
    return count + (result.isCorrect ? 1 : 0)
  }, 0)

  const questionResults: LessonResultQuestion[] = input.questionEvaluations.map((result) => ({
    questionId: result.questionId,
    isCorrect: result.isCorrect,
    isFirstAttemptCorrect: result.isCorrect,
    submittedAnswer: result.submittedAnswer,
    correctAnswer: result.correctAnswer,
    explanation: result.explanation,
    evidenceReference: result.evidenceReference,
  }))

  const accuracy =
    totalQuestions === 0 ? 0 : Number(((correctAnswers / totalQuestions) * 100).toFixed(2))

  const summary: AssistanceSummary = input.assistanceSummary ?? {
    totalUniqueEvents: 0,
    targetsHelped: 0,
    maximumAssistanceLevel: 0,
    visualHintUsed: false,
    spokenChunkHelpUsed: false,
    spokenWordHelpUsed: false,
    sentenceReadAloudUsed: false,
  }

  return {
    lessonId: input.lessonId,
    activityId: input.activityId,
    skillId: input.skillId,
    difficulty: input.difficulty,
    totalQuestions,
    correctAnswers,
    firstAttemptCorrect: questionResults.filter((question) => question.isFirstAttemptCorrect).length,
    accuracy,
    assistanceUsed: summary.totalUniqueEvents,
    assistanceSummary: summary,
    questionResults,
    completed: true,
  }
}
