import { describe, expect, test } from 'vitest'

import type { LessonResult } from '../../src/domain/lesson'
import { getLessonCandidates } from '../../src/domain/lesson'
import { planGlobalQuest } from '../../src/domain/curriculum'
import {
  applyLessonResult,
  planUnitQuest,
  type LessonActivityCandidate,
  type SkillProgressState,
} from '../../src/domain/progression'
import {
  buildReviewQueueIdentity,
  sameReviewQueueIdentity,
} from '../../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../../src/persistence'

const NOW = '2026-08-24T12:00:00.000Z'
const SKILL_ID = 'g3-word-forge-word-analysis'
const ROOT_UNIT_ID = 'g3-wg-unit-1'
const UNIT_ID = 'g3-wg-unit-2'
const VERSION = 'g3-wf-suffix-shifter-r0.1.0'
const allCandidates = getLessonCandidates()
const suffixCandidates = allCandidates.filter((candidate) => candidate.skillId === SKILL_ID && candidate.unitId === UNIT_ID)
const checkpoints = suffixCandidates.filter((candidate) => candidate.eligiblePurposes.includes('progression'))
const guided = suffixCandidates.filter((candidate) => candidate.difficulty === 2 && candidate.eligiblePurposes.includes('remediation'))
const prerequisites = suffixCandidates.filter((candidate) => candidate.difficulty === 1 && candidate.eligiblePurposes.includes('remediation'))

function trailTwoState(): QuestProgressV1 {
  const initial = createDefaultQuestProgress(NOW)
  return {
    ...initial,
    skillProgress: {
      ...initial.skillProgress,
      'g2-word-forge-word-practice': {
        ...initial.skillProgress['g2-word-forge-word-practice'],
        currentDifficulty: 8,
      },
      [SKILL_ID]: {
        skillId: SKILL_ID,
        currentDifficulty: 2,
        lastMasteredDifficulty: 1,
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
  return applyLessonResult({
    progress,
    lessonResult: result(candidate, accuracy, assisted),
    availableLessons: allCandidates,
    completedAt: NOW,
  })
}

describe('Suffix Shifter progression and review isolation', () => {
  test('locks Trail 2 before Root Reactor completion and opens only at difficulty 2', () => {
    const before = trailTwoState()
    before.skillProgress[SKILL_ID].currentDifficulty = 1
    before.skillProgress[SKILL_ID].lastMasteredDifficulty = 0

    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: before, availableLessons: allCandidates })).toMatchObject({
      status: 'locked',
      unitId: UNIT_ID,
      reason: 'Complete Root Reactor to unlock Suffix Shifter.',
    })
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: trailTwoState(), availableLessons: allCandidates })).toMatchObject({
      status: 'available',
      unitId: UNIT_ID,
      lesson: { difficulty: 2 },
    })
  })

  test('requires two distinct independent checkpoints and stops at deferred Trail 3', () => {
    const initial = trailTwoState().skillProgress[SKILL_ID]
    const first = apply(initial, checkpoints[0], 100)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(first.decision.decisionState).toBe('VERIFY_MASTERY')
    expect(first.nextQuest).toMatchObject({ status: 'available', purpose: 'verification', lesson: { unitId: UNIT_ID } })

    const replay = apply(first.progress, checkpoints[0], 100)
    expect(replay.status).toBe('applied')
    if (replay.status !== 'applied') return
    expect(replay.decision.reasonCodes).toContain('duplicate_activity_not_counted')
    expect(replay.progress.currentDifficulty).toBe(2)

    const second = apply(replay.progress, checkpoints[1], 100)
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.decision.decisionState).toBe('ADVANCE')
    expect(second.progress).toMatchObject({ currentDifficulty: 3, lastMasteredDifficulty: 2 })
    expect(second.nextQuest).toMatchObject({ status: 'content_needed', skillId: SKILL_ID, difficulty: 3 })
  })

  test('routes partial and repeated low work within Suffix Shifter unit affinity', () => {
    const initial = trailTwoState().skillProgress[SKILL_ID]
    const partial = apply(initial, checkpoints[0], 80)
    expect(partial.status).toBe('applied')
    if (partial.status !== 'applied') return
    expect(partial.decision.decisionState).toBe('RETRY_SAME_DIFFICULTY')
    expect(partial.progress.currentDifficulty).toBe(2)

    const firstLow = apply(initial, checkpoints[0], 60)
    expect(firstLow.status).toBe('applied')
    if (firstLow.status !== 'applied') return
    expect(firstLow.decision.decisionState).toBe('GUIDED_PRACTICE')
    expect(firstLow.nextQuest).toMatchObject({ status: 'available', purpose: 'remediation', lesson: { unitId: UNIT_ID, difficulty: 2 } })

    const secondLow = apply(firstLow.progress, checkpoints[1], 60)
    expect(secondLow.status).toBe('applied')
    if (secondLow.status !== 'applied') return
    expect(secondLow.decision.decisionState).toBe('REMEDIATE_PREREQUISITE')
    expect(secondLow.progress).toMatchObject({
      currentDifficulty: 1,
      remediationContext: { originalSkillId: SKILL_ID, originalDifficulty: 2, remediationDifficulty: 1 },
    })
    expect(secondLow.nextQuest).toMatchObject({ status: 'available', purpose: 'remediation', lesson: { unitId: UNIT_ID, difficulty: 1 } })

    const rebuildOne = apply(secondLow.progress, prerequisites[0], 100)
    expect(rebuildOne.status).toBe('applied')
    if (rebuildOne.status !== 'applied') return
    const rebuildTwo = apply(rebuildOne.progress, prerequisites[1], 100)
    expect(rebuildTwo.status).toBe('applied')
    if (rebuildTwo.status !== 'applied') return
    expect(rebuildTwo.progress).toMatchObject({ currentDifficulty: 2, lastMasteredDifficulty: 1, remediationContext: null })
    expect(rebuildTwo.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 2 } })
  })

  test('keeps assistance out of mastery evidence and preserves exact review identities', () => {
    const initial = trailTwoState().skillProgress[SKILL_ID]
    const assisted = apply(initial, checkpoints[0], 100, true)
    expect(assisted.status).toBe('applied')
    if (assisted.status !== 'applied') return
    expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
    expect(assisted.decision.reasonCodes).toContain('assistance_observed')

    const grade2 = buildReviewQueueIdentity({ skillId: 'g2-word-forge-word-practice', difficulty: 8, unitId: 'wg-unit-5', contentVersion: 'g2-wf-silent-letters-r0.1.0' })
    const root = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 1, unitId: ROOT_UNIT_ID, contentVersion: 'g3-wf-root-reactor-r0.1.0' })
    const suffix = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 2, unitId: UNIT_ID, contentVersion: VERSION })
    expect(sameReviewQueueIdentity(root, suffix)).toBe(false)
    expect(sameReviewQueueIdentity(grade2, suffix)).toBe(false)
    expect(new Set([grade2, root, suffix].map((identity) => JSON.stringify(identity))).size).toBe(3)
  })

  test('keeps Grade 2 due review above Suffix Shifter ordinary progression', () => {
    const progress = trailTwoState()
    progress.reviewQueue = [{
      skillId: 'g2-word-forge-word-practice',
      difficulty: 1,
      reviewStep: 1,
      dueAt: NOW,
      unitId: 'wg-unit-1',
      contentVersion: 'g2-wf-oo-ea-r0.1.0',
    }]

    expect(planGlobalQuest({ progress, availableLessons: allCandidates, now: NOW })).toMatchObject({
      status: 'available',
      purpose: 'review',
      skillId: 'g2-word-forge-word-practice',
      lesson: { gradeBand: 2, unitId: 'wg-unit-1' },
    })
    expect(guided).toHaveLength(2)
    expect(prerequisites).toHaveLength(2)
    expect(checkpoints).toHaveLength(3)
    expect(suffixCandidates.every((candidate) => candidate.contentVersion === VERSION && candidate.gradeBand === 3)).toBe(true)
  })
})
