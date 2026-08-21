export type LearningState =
  | 'TEACH'
  | 'GUIDED_PRACTICE'
  | 'CHECKPOINT'
  | 'FLUENCY_PRACTICE'
  | 'VERIFY_MASTERY'
  | 'ADVANCE'
  | 'RETRY_SAME_DIFFICULTY'
  | 'REMEDIATE_PREREQUISITE'
  | 'SPACED_REVIEW'
  | 'PARENT_REVIEW'
  | 'MASTERED'

export type ChildSafeMessageKey =
  | 'training_round'
  | 'try_new_route'
  | 'clue_practice'
  | 'almost_there'
  | 'trail_complete'
  | 'smooth_reading_practice'

export type ReviewActionKind =
  | 'none'
  | 'fresh_practice'
  | 'targeted_remediation'
  | 'remediate_prerequisite'
  | 'retry_same_difficulty'

export interface ReviewAction {
  kind: ReviewActionKind
  nextDifficulty?: number
  reviewIntervalDays?: number
}

export interface CheckpointEvaluationInput {
  accuracy: number
  firstAttemptAccuracy: number
  hintsUsed: number
  majorHintsUsed: number
  sentenceReadAloudUsed: boolean
  consecutiveUnsuccessfulAtCurrentDifficulty: number
  priorIndependentSuccessCount: number
  currentDifficulty: number
  lastMasteredDifficulty: number
  relevantPrerequisite: string | null
  currentLearningState: LearningState
  activityId?: string
  priorQualifyingIndependentActivityIds?: readonly string[]
}

export interface ProgressionDecision {
  decisionState: LearningState
  nextDifficulty: number
  remediationRequired: boolean
  remediationTarget: string | null
  needsIndependentVerification: boolean
  reviewAction: ReviewAction
  parentExplanation: string
  childSafeMessageKey: ChildSafeMessageKey
  reasonCodes: string[]
}

export interface ProgressionRuleConfig {
  strongAccuracyThreshold: number
  partialAccuracyThreshold: number
  requiredIndependentSuccesses: number
  maxMajorHintsForIndependent: number
  requireFirstAttemptAccuracyForIndependent: boolean
}

export interface DomainActivityCandidate {
  skillIdentifier: string
  difficulty: number
  passageIdentifier: string
  questionIdentifier: string
  activityIdentifier: string
}

export interface LearningActivitySequenceInput {
  skillIdentifier: string
  difficulty: number
  availableActivities: DomainActivityCandidate[]
  recentActivityUsage: DomainActivityCandidate[]
}

export interface SelectedActivityResult {
  status: 'selected' | 'unavailable'
  activity?: DomainActivityCandidate
  reason: string
  availableCount?: number
  nextDeterministicFallbackActivityIdentifier?: string | null
}

export type LearningActivitySelectionResult = SelectedActivityResult
