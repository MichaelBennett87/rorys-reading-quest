import { describe, expect, test } from 'vitest'

import { evaluateCheckpoint } from '../../src/domain/progression/evaluateCheckpoint'

const baseInput = {
  firstAttemptAccuracy: 0.9,
  hintsUsed: 0,
  majorHintsUsed: 0,
  sentenceReadAloudUsed: false,
  consecutiveUnsuccessfulAtCurrentDifficulty: 0,
  priorIndependentSuccessCount: 0,
  currentDifficulty: 2,
  lastMasteredDifficulty: 1,
  relevantPrerequisite: 'g2-word-forge-phoneme-readiness',
  currentLearningState: 'CHECKPOINT' as const,
}

describe('evaluateCheckpoint', () => {
  test('first strong independent checkpoint does not advance before second distinct success', () => {
    const decision = evaluateCheckpoint({
      ...baseInput,
      accuracy: 0.9,
      priorIndependentSuccessCount: 0,
    })

    expect(decision.decisionState).toBe('VERIFY_MASTERY')
    expect(decision.nextDifficulty).toBe(2)
    expect(decision.needsIndependentVerification).toBe(true)
    expect(decision.childSafeMessageKey).toBe('almost_there')
  })

  test('second qualifying independent success advances one step', () => {
    const decision = evaluateCheckpoint({
      ...baseInput,
      accuracy: 0.9,
      priorIndependentSuccessCount: 1,
    })

    expect(decision.decisionState).toBe('ADVANCE')
    expect(decision.nextDifficulty).toBe(3)
    expect(decision.needsIndependentVerification).toBe(false)
    expect(decision.childSafeMessageKey).toBe('trail_complete')
  })

  test('partial result stays on same difficulty', () => {
    const decision = evaluateCheckpoint({
      ...baseInput,
      accuracy: 0.75,
      priorIndependentSuccessCount: 0,
    })

    expect(decision.decisionState).toBe('RETRY_SAME_DIFFICULTY')
    expect(decision.nextDifficulty).toBe(2)
    expect(decision.needsIndependentVerification).toBe(false)
  })

  test('first unsuccessful checkpoint triggers remediation at same difficulty', () => {
    const decision = evaluateCheckpoint({
      ...baseInput,
      accuracy: 0.55,
      consecutiveUnsuccessfulAtCurrentDifficulty: 0,
      priorIndependentSuccessCount: 0,
      hintsUsed: 0,
      majorHintsUsed: 0,
      firstAttemptAccuracy: 0.55,
    })

    expect(decision.decisionState).toBe('GUIDED_PRACTICE')
    expect(decision.remediationRequired).toBe(true)
    expect(decision.nextDifficulty).toBe(2)
    expect(decision.needsIndependentVerification).toBe(false)
  })

  test('second consecutive unsuccessful returns to prerequisite or last mastered', () => {
    const decision = evaluateCheckpoint({
      ...baseInput,
      accuracy: 0.56,
      consecutiveUnsuccessfulAtCurrentDifficulty: 1,
      priorIndependentSuccessCount: 0,
      firstAttemptAccuracy: 0.56,
    })

    expect(decision.decisionState).toBe('REMEDIATE_PREREQUISITE')
    expect(decision.remediationRequired).toBe(true)
    expect(decision.remediationTarget).toBe('g2-word-forge-phoneme-readiness')
    expect(decision.nextDifficulty).toBe(1)
  })

  test('assistance is recorded without failure', () => {
    const decision = evaluateCheckpoint({
      ...baseInput,
      accuracy: 0.89,
      firstAttemptAccuracy: 0.89,
      hintsUsed: 2,
      majorHintsUsed: 1,
      priorIndependentSuccessCount: 0,
    })

    expect(decision.decisionState).toBe('CHECKPOINT')
    expect(decision.remediationRequired).toBe(false)
    expect(decision.nextDifficulty).toBe(2)
    expect(decision.reasonCodes).toContain('assistance_observed')
  })

  test('heavy assistance prevents unsupported independent advancement', () => {
    const decision = evaluateCheckpoint({
      ...baseInput,
      accuracy: 0.96,
      firstAttemptAccuracy: 0.5,
      hintsUsed: 3,
      majorHintsUsed: 3,
      sentenceReadAloudUsed: true,
      priorIndependentSuccessCount: 1,
    })

    expect(decision.decisionState).toBe('CHECKPOINT')
    expect(decision.nextDifficulty).toBe(2)
    expect(decision.needsIndependentVerification).toBe(false)
    expect(decision.childSafeMessageKey).toBe('clue_practice')
  })
})
