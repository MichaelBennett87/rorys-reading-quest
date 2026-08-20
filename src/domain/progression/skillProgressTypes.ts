import type { LessonPurpose, LessonResult } from '../lesson'
import type { LearningState, ProgressionDecision } from './types'

export interface LessonActivityCandidate {
  lessonId: string
  activityId: string
  skillId: string
  difficulty: number
  worldId: string
  unitId: string
  packId: string
  benchmarkReferences: string[]
  eligiblePurposes: LessonPurpose[]
  passageQuestionKeys: string[]
  contentVersion: string
}

export interface RecentLessonActivityUsage {
  lessonId: string
  activityId: string
  skillId: string
  difficulty: number
  passageQuestionKeys: string[]
  contentVersion: string
  completedAt: string
}

export interface RemediationContext {
  originalSkillId: string
  originalDifficulty: number
  remediationSkillId: string
  remediationDifficulty: number
  reason: 'explicit_prerequisite' | 'last_mastered_difficulty'
}

export interface SkillProgressState {
  skillId: string
  currentDifficulty: number
  lastMasteredDifficulty: number
  currentLearningState: LearningState
  qualifyingIndependentActivityIds: string[]
  consecutiveUnsuccessfulAtCurrentDifficulty: number
  lastCompletedActivityId: string | null
  recentActivityUsage: RecentLessonActivityUsage[]
  reviewStep: number
  nextReviewDate: string | null
  lastDecisionReasonCodes: string[]
  remediationContext: RemediationContext | null
}

export interface AvailableNextQuest {
  status: 'available'
  purpose: LessonPurpose
  lesson: LessonActivityCandidate
}

export interface ContentNeededNextQuest {
  status: 'content_needed'
  purpose: LessonPurpose
  skillId: string
  difficulty: number
  reason: string
}

export type NextQuestPlan = AvailableNextQuest | ContentNeededNextQuest

export interface ApplyLessonResultInput {
  progress: SkillProgressState
  lessonResult: LessonResult
  availableLessons: readonly LessonActivityCandidate[]
  completedAt: string
  relevantPrerequisiteSkillId?: string | null
  isReview?: boolean
}

export interface AppliedLessonProgression {
  status: 'applied'
  progress: SkillProgressState
  decision: ProgressionDecision
  nextQuest: NextQuestPlan
}

export interface DeclinedLessonProgression {
  status: 'declined'
  progress: SkillProgressState
  reason: string
}

export type ApplyLessonResultResult = AppliedLessonProgression | DeclinedLessonProgression

export function createInitialSkillProgress(
  skillId: string,
  currentDifficulty = 1,
  lastMasteredDifficulty = 0,
): SkillProgressState {
  return {
    skillId,
    currentDifficulty,
    lastMasteredDifficulty,
    currentLearningState: 'CHECKPOINT',
    qualifyingIndependentActivityIds: [],
    consecutiveUnsuccessfulAtCurrentDifficulty: 0,
    lastCompletedActivityId: null,
    recentActivityUsage: [],
    reviewStep: 0,
    nextReviewDate: null,
    lastDecisionReasonCodes: [],
    remediationContext: null,
  }
}
