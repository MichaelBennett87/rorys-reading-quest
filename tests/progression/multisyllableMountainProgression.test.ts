import { describe, expect, test } from 'vitest'

import type { LessonResult } from '../../src/domain/lesson'
import { getLessonCandidates } from '../../src/domain/lesson'
import { planGlobalQuest } from '../../src/domain/curriculum'
import { applyLessonResult, planUnitQuest, type LessonActivityCandidate, type SkillProgressState } from '../../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../../src/persistence'

const NOW = '2026-08-24T12:00:00.000Z'
const SKILL_ID = 'g3-word-forge-word-analysis'
const UNIT_ID = 'g3-wg-unit-3'
const VERSION = 'g3-wf-multisyllable-mountain-r0.1.0'
const allCandidates = getLessonCandidates()
const mountainCandidates = allCandidates.filter((candidate) => candidate.skillId === SKILL_ID && candidate.unitId === UNIT_ID)
const checkpoints = mountainCandidates.filter((candidate) => candidate.eligiblePurposes.includes('progression'))
const guided = mountainCandidates.filter((candidate) => candidate.difficulty === 3 && candidate.eligiblePurposes.includes('remediation'))
const prerequisites = mountainCandidates.filter((candidate) => candidate.difficulty === 2 && candidate.eligiblePurposes.includes('remediation'))

function trailThreeState(): QuestProgressV1 {
  const initial = createDefaultQuestProgress(NOW)
  return {
    ...initial,
    skillProgress: {
      ...initial.skillProgress,
      'g2-word-forge-word-practice': { ...initial.skillProgress['g2-word-forge-word-practice'], currentDifficulty: 8 },
      [SKILL_ID]: {
        skillId: SKILL_ID,
        currentDifficulty: 3,
        lastMasteredDifficulty: 2,
        currentLearningState: 'ADVANCE',
        qualifyingIndependentActivityIds: [],
        consecutiveUnsuccessfulAtCurrentDifficulty: 0,
        lastCompletedActivityId: null,
        recentActivityUsage: [],
        reviewStep: 0,
        nextReviewDate: null,
        lastDecisionReasonCodes: ['advanced'],
        remediationContext: null,
      },
    },
  }
}

function result(candidate: LessonActivityCandidate, accuracy: number, assisted = false): LessonResult {
  const totalQuestions = candidate.eligiblePurposes.includes('progression') ? 7 : 5
  const correctAnswers = Math.floor((accuracy / 100) * totalQuestions)
  return {
    lessonId: candidate.lessonId,
    activityId: candidate.activityId,
    skillId: candidate.skillId,
    difficulty: candidate.difficulty,
    lessonRole: candidate.eligiblePurposes.includes('progression') ? 'CHECKPOINT' : 'GUIDED_PRACTICE',
    totalQuestions,
    correctAnswers,
    firstAttemptCorrect: correctAnswers,
    accuracy,
    assistanceUsed: assisted ? 1 : 0,
    assistanceSummary: {
      totalUniqueEvents: assisted ? 1 : 0,
      targetsHelped: assisted ? 1 : 0,
      maximumAssistanceLevel: assisted ? 3 : 0,
      visualHintUsed: assisted,
      spokenChunkHelpUsed: assisted,
      spokenWordHelpUsed: false,
      sentenceReadAloudUsed: false,
    },
    questionResults: Array.from({ length: totalQuestions }, (_, index) => ({
      questionId: `${candidate.activityId}-question-${index + 1}`,
      isCorrect: index < correctAnswers,
      isFirstAttemptCorrect: index < correctAnswers,
      submittedAnswer: index < correctAnswers ? 'correct' : 'incorrect',
      correctAnswer: 'correct',
      explanation: '',
      evidenceReference: [],
    })),
    fluencyPracticeSummary: null,
    oralFluencyMeasured: false,
    completed: true,
  }
}

function apply(progress: SkillProgressState, candidate: LessonActivityCandidate, accuracy: number, assisted = false) {
  return applyLessonResult({ progress, lessonResult: result(candidate, accuracy, assisted), availableLessons: allCandidates, completedAt: NOW })
}

describe('Multisyllable Mountain progression and review isolation', () => {
  test('locks Trail 3 before Suffix Shifter completion and opens only at difficulty 3', () => {
    const before = trailThreeState()
    before.skillProgress[SKILL_ID].currentDifficulty = 2
    before.skillProgress[SKILL_ID].lastMasteredDifficulty = 1
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: before, availableLessons: allCandidates })).toMatchObject({
      status: 'locked', reason: 'Complete Suffix Shifter to unlock Multisyllable Mountain.',
    })
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: trailThreeState(), availableLessons: allCandidates })).toMatchObject({
      status: 'available', lesson: { unitId: UNIT_ID, difficulty: 3 },
    })
  })

  test('requires two distinct independent checkpoints and stops at deferred Trail 4', () => {
    const first = apply(trailThreeState().skillProgress[SKILL_ID], checkpoints[0], 100)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(first.decision.decisionState).toBe('VERIFY_MASTERY')
    expect(first.nextQuest).toMatchObject({ status: 'available', purpose: 'verification', lesson: { unitId: UNIT_ID } })

    const replay = apply(first.progress, checkpoints[0], 100)
    expect(replay.status).toBe('applied')
    if (replay.status !== 'applied') return
    expect(replay.decision.reasonCodes).toContain('duplicate_activity_not_counted')
    expect(replay.progress.currentDifficulty).toBe(3)

    const second = apply(replay.progress, checkpoints[1], 100)
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.decision.decisionState).toBe('ADVANCE')
    expect(second.progress).toMatchObject({ currentDifficulty: 4, lastMasteredDifficulty: 3 })
    expect(second.nextQuest).toMatchObject({ status: 'content_needed', skillId: SKILL_ID, difficulty: 4 })
  })

  test('routes partial and repeated low work within Multisyllable Mountain affinity', () => {
    const initial = trailThreeState().skillProgress[SKILL_ID]
    const partial = apply(initial, checkpoints[0], 80)
    expect(partial.status).toBe('applied')
    if (partial.status !== 'applied') return
    expect(partial.decision.decisionState).toBe('RETRY_SAME_DIFFICULTY')

    const firstLow = apply(initial, checkpoints[0], 60)
    expect(firstLow.status).toBe('applied')
    if (firstLow.status !== 'applied') return
    expect(firstLow.nextQuest).toMatchObject({ status: 'available', purpose: 'remediation', lesson: { unitId: UNIT_ID, difficulty: 3 } })
    const secondLow = apply(firstLow.progress, checkpoints[1], 60)
    expect(secondLow.status).toBe('applied')
    if (secondLow.status !== 'applied') return
    expect(secondLow.decision.decisionState).toBe('REMEDIATE_PREREQUISITE')
    expect(secondLow.progress).toMatchObject({
      currentDifficulty: 2,
      remediationContext: { originalSkillId: SKILL_ID, originalDifficulty: 3, remediationDifficulty: 2 },
    })
    expect(secondLow.nextQuest).toMatchObject({ status: 'available', purpose: 'remediation', lesson: { unitId: UNIT_ID, difficulty: 2 } })

    const rebuildOne = apply(secondLow.progress, prerequisites[0], 100)
    expect(rebuildOne.status).toBe('applied')
    if (rebuildOne.status !== 'applied') return
    const rebuildTwo = apply(rebuildOne.progress, prerequisites[1], 100)
    expect(rebuildTwo.status).toBe('applied')
    if (rebuildTwo.status !== 'applied') return
    expect(rebuildTwo.progress).toMatchObject({ currentDifficulty: 3, lastMasteredDifficulty: 2, remediationContext: null })
    expect(rebuildTwo.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 3 } })
  })

  test('keeps assistance out of mastery evidence and all Word Forge review identities distinct', () => {
    const assisted = apply(trailThreeState().skillProgress[SKILL_ID], checkpoints[0], 100, true)
    expect(assisted.status).toBe('applied')
    if (assisted.status !== 'applied') return
    expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
    expect(assisted.decision.reasonCodes).toContain('assistance_observed')

    const identities = [
      buildReviewQueueIdentity({ skillId: 'g2-word-forge-word-practice', difficulty: 8, unitId: 'wg-unit-5', contentVersion: 'g2-wf-silent-letters-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 1, unitId: 'g3-wg-unit-1', contentVersion: 'g3-wf-root-reactor-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 2, unitId: 'g3-wg-unit-2', contentVersion: 'g3-wf-suffix-shifter-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 3, unitId: UNIT_ID, contentVersion: VERSION }),
    ]
    expect(new Set(identities.map((identity) => JSON.stringify(identity))).size).toBe(4)
    expect(sameReviewQueueIdentity(identities[1], identities[2])).toBe(false)
    expect(sameReviewQueueIdentity(identities[2], identities[3])).toBe(false)
  })

  test('keeps Grade 2 due review above Trail 3 ordinary progression', () => {
    const progress = trailThreeState()
    progress.reviewQueue = [{ skillId: 'g2-word-forge-word-practice', difficulty: 1, reviewStep: 1, dueAt: NOW, unitId: 'wg-unit-1', contentVersion: 'g2-wf-oo-ea-r0.1.0' }]
    expect(planGlobalQuest({ progress, availableLessons: allCandidates, now: NOW })).toMatchObject({
      status: 'available', purpose: 'review', skillId: 'g2-word-forge-word-practice', lesson: { gradeBand: 2, unitId: 'wg-unit-1' },
    })
    expect(guided).toHaveLength(2)
    expect(prerequisites).toHaveLength(2)
    expect(checkpoints).toHaveLength(3)
    expect(mountainCandidates.every((candidate) => candidate.contentVersion === VERSION && candidate.gradeBand === 3)).toBe(true)
  })
})
