import type { LessonPurpose } from '../lesson'
import { getReviewIntervalForStep } from './reviewSchedule'
import type { ProgressionDecision } from './types'
import type { SkillProgressState } from './skillProgressTypes'

export function addDays(timestamp: string, days: number): string {
  const date = new Date(timestamp)
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
}

export function purposeForDecision(decision: ProgressionDecision): LessonPurpose {
  if (decision.decisionState === 'VERIFY_MASTERY') return 'verification'
  if (decision.decisionState === 'GUIDED_PRACTICE' || decision.decisionState === 'REMEDIATE_PREREQUISITE') {
    return 'remediation'
  }
  return 'progression'
}

export function applyProgressionDecision(
  progress: SkillProgressState,
  decision: ProgressionDecision,
  completedAt: string,
): SkillProgressState {
  const belowThreshold = decision.decisionState === 'GUIDED_PRACTICE'
    || decision.decisionState === 'REMEDIATE_PREREQUISITE'
  const partialOrStrong = decision.decisionState === 'RETRY_SAME_DIFFICULTY'
    || decision.reasonCodes.includes('independent_evidence')
    || decision.reasonCodes.includes('assistance_observed')
  const nextFailures = belowThreshold
    ? progress.consecutiveUnsuccessfulAtCurrentDifficulty + 1
    : partialOrStrong ? 0 : progress.consecutiveUnsuccessfulAtCurrentDifficulty

  if (decision.decisionState === 'ADVANCE') {
    return {
      ...progress,
      currentDifficulty: progress.currentDifficulty + 1,
      lastMasteredDifficulty: progress.currentDifficulty,
      currentLearningState: 'ADVANCE',
      qualifyingIndependentActivityIds: [],
      consecutiveUnsuccessfulAtCurrentDifficulty: 0,
      reviewStep: 0,
      nextReviewDate: addDays(completedAt, getReviewIntervalForStep(0)),
      lastDecisionReasonCodes: [...decision.reasonCodes],
    }
  }

  return {
    ...progress,
    currentLearningState: decision.decisionState,
    consecutiveUnsuccessfulAtCurrentDifficulty: nextFailures,
    lastDecisionReasonCodes: [...decision.reasonCodes],
  }
}
