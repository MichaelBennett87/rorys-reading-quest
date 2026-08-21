import type { FluencyPracticeSummary, LessonResult } from '../lesson'
import { selectNextLesson } from './selectNextLesson'
import type {
  LessonActivityCandidate,
  NextQuestPlan,
  SkillProgressState,
  RecentLessonActivityUsage,
} from './skillProgressTypes'

const RECENT_ACTIVITY_LIMIT = 12

export interface FluencyPracticeCompletionInput {
  progress: SkillProgressState
  lessonResult: LessonResult
  availableLessons: readonly LessonActivityCandidate[]
  completedAt: string
}

export interface FluencyPracticeCompletionResult {
  progress: SkillProgressState
  nextQuest: NextQuestPlan
  reasonCodes: string[]
  summary: FluencyPracticeSummary
  lessonUsage: RecentLessonActivityUsage | null
}

export function completeFluencyPractice(input: FluencyPracticeCompletionInput): FluencyPracticeCompletionResult {
  const currentLesson = input.availableLessons.find((lesson) => (
    lesson.lessonId === input.lessonResult.lessonId
    && lesson.activityId === input.lessonResult.activityId
  ))
  const lessonUsage = currentLesson ? {
    lessonId: currentLesson.lessonId,
    activityId: currentLesson.activityId,
    skillId: currentLesson.skillId,
    difficulty: currentLesson.difficulty,
    passageQuestionKeys: [...currentLesson.passageQuestionKeys],
    contentVersion: currentLesson.contentVersion,
    completedAt: input.completedAt,
  } : null
  const summary = input.lessonResult.fluencyPracticeSummary ?? {
    modelReadUsed: false,
    phrasePracticeCompleted: false,
    completedReadCount: 0,
    reflection: null,
    oralReadingMeasured: false,
    timerUsed: false,
    microphoneUsed: false,
  }
  const progress = {
    ...input.progress,
    skillId: input.lessonResult.skillId,
    currentDifficulty: Math.max(input.progress.currentDifficulty, input.lessonResult.difficulty),
    currentLearningState: 'FLUENCY_PRACTICE' as const,
    qualifyingIndependentActivityIds: [...input.progress.qualifyingIndependentActivityIds],
    consecutiveUnsuccessfulAtCurrentDifficulty: input.progress.consecutiveUnsuccessfulAtCurrentDifficulty,
    lastCompletedActivityId: input.lessonResult.activityId,
    recentActivityUsage: lessonUsage
      ? [...input.progress.recentActivityUsage, lessonUsage].slice(-RECENT_ACTIVITY_LIMIT)
      : [...input.progress.recentActivityUsage],
    reviewStep: input.progress.reviewStep,
    nextReviewDate: input.progress.nextReviewDate,
    lastDecisionReasonCodes: ['fluency_practice_completed', 'oral_fluency_not_measured'],
    remediationContext: null,
  }
  const lessonPool = currentLesson
    ? input.availableLessons.filter((lesson) => lesson.unitId === currentLesson.unitId)
    : input.availableLessons.filter((lesson) => lesson.skillId === input.lessonResult.skillId)
  const plan = selectNextLesson({
    skillId: input.lessonResult.skillId,
    difficulty: input.lessonResult.difficulty,
    purpose: 'progression',
    availableLessons: lessonPool,
    recentActivityUsage: progress.recentActivityUsage,
  })

  if (plan.status === 'available') {
    return {
      progress,
      nextQuest: plan,
      reasonCodes: ['fluency_practice_completed', 'oral_fluency_not_measured', 'fresh_fluency_practice_planned'],
      summary,
      lessonUsage,
    }
  }

  return {
    progress,
    nextQuest: {
      status: 'content_needed',
      purpose: 'progression',
      skillId: input.lessonResult.skillId,
      difficulty: input.lessonResult.difficulty,
      reason: 'Fluency Flight has no fresh practice left in this phase.',
    },
    reasonCodes: ['fluency_practice_completed', 'oral_fluency_not_measured', 'fluency_practice_exhausted'],
    summary,
    lessonUsage,
  }
}
