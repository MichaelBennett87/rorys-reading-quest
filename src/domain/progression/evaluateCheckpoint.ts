import type {
  ChildSafeMessageKey,
  CheckpointEvaluationInput,
  ProgressionDecision,
  ProgressionRuleConfig,
  LearningState,
} from './types'

export const defaultProgressionRuleConfig: ProgressionRuleConfig = {
  strongAccuracyThreshold: 0.85,
  partialAccuracyThreshold: 0.7,
  requiredIndependentSuccesses: 2,
  maxMajorHintsForIndependent: 1,
  requireFirstAttemptAccuracyForIndependent: true,
}

function buildDecision(
  decisionState: LearningState,
  nextDifficulty: number,
  remediationRequired: boolean,
  remediationTarget: string | null,
  needsIndependentVerification: boolean,
  reviewActionKind:
    | 'none'
    | 'fresh_practice'
    | 'targeted_remediation'
    | 'remediate_prerequisite'
    | 'retry_same_difficulty',
  parentExplanation: string,
  childSafeMessageKey: ChildSafeMessageKey,
  reasonCodes: string[],
): ProgressionDecision {
  return {
    decisionState,
    nextDifficulty,
    remediationRequired,
    remediationTarget,
    needsIndependentVerification,
    reviewAction: {
      kind: reviewActionKind,
      nextDifficulty,
    },
    parentExplanation,
    childSafeMessageKey,
    reasonCodes,
  }
}

export function evaluateCheckpoint(
  input: CheckpointEvaluationInput,
  config: ProgressionRuleConfig = defaultProgressionRuleConfig,
): ProgressionDecision {
  const strongAccuracy = input.accuracy >= config.strongAccuracyThreshold
  const partialAccuracy =
    input.accuracy >= config.partialAccuracyThreshold &&
    input.accuracy < config.strongAccuracyThreshold
  const heavyAssistance =
    input.hintsUsed > 0 ||
    input.majorHintsUsed > config.maxMajorHintsForIndependent ||
    input.sentenceReadAloudUsed

  const firstAttemptStrongEnough =
    !config.requireFirstAttemptAccuracyForIndependent ||
    input.firstAttemptAccuracy >= config.strongAccuracyThreshold

  const independentEvidence =
    strongAccuracy && !heavyAssistance && firstAttemptStrongEnough

  if (strongAccuracy) {
    if (independentEvidence) {
      const nextIndependentCount = input.priorIndependentSuccessCount + 1

      if (nextIndependentCount >= config.requiredIndependentSuccesses) {
        return buildDecision(
          'ADVANCE',
          input.currentDifficulty + 1,
          false,
          null,
          false,
          'none',
          'Independent checkpoint evidence confirmed. Learner advances one difficulty step.',
          'trail_complete',
          ['independent_evidence', 'distinct_success_count_reached'],
        )
      }

      return buildDecision(
        'VERIFY_MASTERY',
        input.currentDifficulty,
        false,
        null,
        true,
        'retry_same_difficulty',
        'One strong independent checkpoint was completed. Present a new verification checkpoint at this difficulty.',
        'almost_there',
        ['independent_evidence', 'awaiting_second_distinct_success'],
      )
    }

    return buildDecision(
      'CHECKPOINT',
      input.currentDifficulty,
      false,
      null,
      false,
      'retry_same_difficulty',
      'Strong score used assistance. Capture independent evidence before progression.',
      'clue_practice',
      ['assistance_observed', 'independent_evidence_missing'],
    )
  }

  if (partialAccuracy) {
    return buildDecision(
      'RETRY_SAME_DIFFICULTY',
      input.currentDifficulty,
      false,
      null,
      false,
      'fresh_practice',
      'Performance is close. Keep the learner on the same difficulty with a different checkpoint.',
      'training_round',
      ['partial_performance'],
    )
  }

  if (input.consecutiveUnsuccessfulAtCurrentDifficulty >= 1) {
    const remediationTarget =
      input.relevantPrerequisite ??
      `difficulty-${Math.max(0, input.lastMasteredDifficulty)}`
    return buildDecision(
      'REMEDIATE_PREREQUISITE',
      input.lastMasteredDifficulty,
      true,
      remediationTarget,
      false,
      'remediate_prerequisite',
      'A second unsuccessful checkpoint at this level indicates targeted prerequisite rebuilding is needed.',
      'try_new_route',
      ['consecutive_failures', 'return_to_prerequisite'],
    )
  }

  return buildDecision(
    'GUIDED_PRACTICE',
    input.currentDifficulty,
    true,
    null,
    false,
    'targeted_remediation',
    'First unsuccessful checkpoint. Keep the same difficulty and provide targeted mini-practice.',
    'try_new_route',
    ['first_failure', 'targeted_mini_lesson'],
  )
}
