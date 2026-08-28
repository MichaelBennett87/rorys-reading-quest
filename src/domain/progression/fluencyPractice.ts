import type { FluencyPracticeSummary, LessonResult } from '../lesson'
import { selectNextLessonWithDiagnostics } from './selectNextLesson'
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
  completedAttempts?: readonly CompletedFluencyActivityReference[]
  completedAt: string
  completionDifficulty?: number
}

export interface CompletedFluencyActivityReference {
  lessonId: string
  activityId: string
  skillId: string
  difficulty: number
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

  const exactUnitLessons = currentLesson
    ? input.availableLessons.filter((lesson) => (
        lesson.skillId === currentLesson.skillId
        && lesson.unitId === currentLesson.unitId
        && lesson.difficulty === currentLesson.difficulty
        && lesson.contentVersion === currentLesson.contentVersion
        && lesson.eligiblePurposes.includes('progression')
      ))
    : []
  const chapterCompleted = typeof input.completionDifficulty === 'number'
    && input.completionDifficulty > input.lessonResult.difficulty
    && hasCompletedEveryAuthoredActivity({
      currentLesson,
      exactUnitLessons,
      completedAttempts: input.completedAttempts ?? [],
    })

  if (chapterCompleted) {
    const reasonCodes = [
      'fluency_practice_completed',
      'oral_fluency_not_measured',
      'fluency_practice_chapter_completed',
    ]
    const completedProgress = {
      ...progress,
      currentDifficulty: input.completionDifficulty!,
      lastDecisionReasonCodes: reasonCodes,
    }
    return {
      progress: completedProgress,
      nextQuest: {
        status: 'content_needed',
        purpose: 'progression',
        skillId: input.lessonResult.skillId,
        difficulty: input.completionDifficulty!,
        reason: 'Grade 3 Word Forge practice is complete. Oral fluency was not measured.',
      },
      reasonCodes,
      summary,
      lessonUsage,
    }
  }

  const selection = selectNextLessonWithDiagnostics({
    skillId: input.lessonResult.skillId,
    difficulty: input.lessonResult.difficulty,
    purpose: 'progression',
    availableLessons: input.availableLessons,
    recentActivityUsage: progress.recentActivityUsage,
    preferredUnitId: currentLesson?.unitId,
    preferredContentVersion: currentLesson?.contentVersion,
  })
  const plan = selection.plan

  if (plan.status === 'available') {
    const recycled = selection.selection?.selectionMode === 'recycled'
      || selection.selection?.selectionMode === 'sole_candidate_repeat'
    const reasonCodes = [
      'fluency_practice_completed',
      'oral_fluency_not_measured',
      recycled ? 'recycled_fluency_practice_planned' : 'fresh_fluency_practice_planned',
    ]
    return {
      progress: { ...progress, lastDecisionReasonCodes: reasonCodes },
      nextQuest: plan,
      reasonCodes,
      summary,
      lessonUsage,
    }
  }

  const reasonCodes = [
    'fluency_practice_completed',
    'oral_fluency_not_measured',
    'fluency_practice_content_needed',
  ]
  return {
    progress: { ...progress, lastDecisionReasonCodes: reasonCodes },
    nextQuest: plan,
    reasonCodes,
    summary,
    lessonUsage,
  }
}

function hasCompletedEveryAuthoredActivity(input: {
  currentLesson: LessonActivityCandidate | undefined
  exactUnitLessons: readonly LessonActivityCandidate[]
  completedAttempts: readonly CompletedFluencyActivityReference[]
}): boolean {
  if (!input.currentLesson || input.exactUnitLessons.length === 0) return false

  const requiredActivityIds = new Set(input.exactUnitLessons.map((lesson) => lesson.activityId))
  const completedActivityIds = new Set<string>()

  for (const lesson of input.exactUnitLessons) {
    if (input.completedAttempts.some((attempt) => (
      attempt.lessonId === lesson.lessonId
      && attempt.activityId === lesson.activityId
      && attempt.skillId === lesson.skillId
      && attempt.difficulty === lesson.difficulty
    ))) {
      completedActivityIds.add(lesson.activityId)
    }
  }

  if (requiredActivityIds.has(input.currentLesson.activityId)) {
    completedActivityIds.add(input.currentLesson.activityId)
  }

  return [...requiredActivityIds].every((activityId) => completedActivityIds.has(activityId))
}
