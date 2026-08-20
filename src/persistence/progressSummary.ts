import type { QuestProgressV1 } from './questProgressTypes'

export interface LocalProgressSummary {
  completedSessions: number
  accumulatedXp: number
  accumulatedStars: number
  recentAverageAccuracy: number
  skills: Record<string, {
    currentDifficulty: number
    lastMasteredDifficulty: number
    distinctIndependentEvidenceCount: number
    consecutiveUnsuccessfulCount: number
    activeRemediationTarget: string | null
    lastProgressionDecision: string | null
    nextReviewDate: string | null
  }>
}

export function summarizeLocalProgress(state: QuestProgressV1): LocalProgressSummary {
  const recent = state.completedAttempts.slice(-10)
  const recentAverageAccuracy = recent.length === 0
    ? 0
    : recent.reduce((sum, attempt) => sum + attempt.accuracy, 0) / recent.length
  return {
    completedSessions: state.completedSessionCount,
    accumulatedXp: state.totalXp,
    accumulatedStars: state.totalStars,
    recentAverageAccuracy,
    skills: Object.fromEntries(Object.entries(state.skillProgress).map(([key, progress]) => [key, {
      currentDifficulty: progress.currentDifficulty,
      lastMasteredDifficulty: progress.lastMasteredDifficulty,
      distinctIndependentEvidenceCount: progress.qualifyingIndependentActivityIds.length,
      consecutiveUnsuccessfulCount: progress.consecutiveUnsuccessfulAtCurrentDifficulty,
      activeRemediationTarget: progress.remediationContext
        ? `${progress.remediationContext.remediationSkillId}::${progress.remediationContext.remediationDifficulty}`
        : null,
      lastProgressionDecision: progress.currentLearningState,
      nextReviewDate: progress.nextReviewDate,
    }])),
  }
}
