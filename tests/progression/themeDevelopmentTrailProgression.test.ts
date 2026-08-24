import { describe, expect, test } from 'vitest'

import { planGlobalQuest } from '../../src/domain/curriculum'
import { getLessonCandidates } from '../../src/domain/lesson'
import type { LessonResult } from '../../src/domain/lesson'
import { applyLessonResult, createInitialSkillProgress, planUnitQuest, type LessonActivityCandidate, type SkillProgressState } from '../../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../../src/persistence'

const NOW = '2026-08-24T12:00:00.000Z'
const SKILL_ID = 'g3-story-scouts-prose'
const UNIT_ID = 'g3-ss-unit-2'
const VERSION = 'g3-ss-theme-development-r0.1.0'
const allCandidates = getLessonCandidates()
const unitCandidates = allCandidates.filter((candidate) => candidate.skillId === SKILL_ID && candidate.unitId === UNIT_ID)
const checkpoints = unitCandidates.filter((candidate) => candidate.eligiblePurposes.includes('progression'))
const guided = unitCandidates.filter((candidate) => candidate.difficulty === 2 && candidate.eligiblePurposes.includes('remediation'))
const powerUps = unitCandidates.filter((candidate) => candidate.difficulty === 1)

function stateAtDifficulty(difficulty: 1 | 2): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  state.skillProgress['g2-story-scouts-prose'] = createInitialSkillProgress('g2-story-scouts-prose', 4, 3)
  state.skillProgress[SKILL_ID] = createInitialSkillProgress(SKILL_ID, difficulty, difficulty - 1)
  return state
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
      questionId: `${candidate.activityId}-result-${index + 1}`,
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

describe('Theme Development Trail progression integration', () => {
  test('locks before Character Arc completion and recovers stale content-needed at difficulty 2', () => {
    const locked = stateAtDifficulty(1)
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: locked, availableLessons: allCandidates })).toMatchObject({
      status: 'locked',
      reason: 'Complete Character Arc Camp to unlock Theme Development Trail.',
    })

    const ready = stateAtDifficulty(2)
    ready.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: SKILL_ID, difficulty: 2, reason: 'Historical content boundary.' }
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: ready, availableLessons: allCandidates })).toMatchObject({
      status: 'available',
      unitId: UNIT_ID,
      lesson: { contentVersion: VERSION },
    })
    expect(planGlobalQuest({ progress: ready, availableLessons: allCandidates, now: NOW })).toMatchObject({ status: 'available' })
  })

  test('requires distinct checkpoint proof, advances to difficulty 3, and stops at deferred content', () => {
    const initial = stateAtDifficulty(2).skillProgress[SKILL_ID]
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

  test('keeps partial work at Trail 2 and routes repeated low work through unit-affine prerequisites', () => {
    const initial = stateAtDifficulty(2).skillProgress[SKILL_ID]
    const partial = apply(initial, checkpoints[0], 80)
    expect(partial.status).toBe('applied')
    if (partial.status !== 'applied') return
    expect(partial.decision.decisionState).toBe('RETRY_SAME_DIFFICULTY')
    expect(partial.progress.currentDifficulty).toBe(2)

    const firstLow = apply(initial, checkpoints[0], 60)
    expect(firstLow.status).toBe('applied')
    if (firstLow.status !== 'applied') return
    expect(firstLow.decision.decisionState).toBe('GUIDED_PRACTICE')
    expect(firstLow.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 2 } })

    const secondLow = apply(firstLow.progress, checkpoints[1], 60)
    expect(secondLow.status).toBe('applied')
    if (secondLow.status !== 'applied') return
    expect(secondLow.decision.decisionState).toBe('REMEDIATE_PREREQUISITE')
    expect(secondLow.progress).toMatchObject({ currentDifficulty: 1, remediationContext: { originalDifficulty: 2, remediationDifficulty: 1 } })
    expect(secondLow.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 1 } })

    const rebuildOne = apply(secondLow.progress, powerUps[0], 100)
    expect(rebuildOne.status).toBe('applied')
    if (rebuildOne.status !== 'applied') return
    const rebuildTwo = apply(rebuildOne.progress, powerUps[1], 100)
    expect(rebuildTwo.status).toBe('applied')
    if (rebuildTwo.status !== 'applied') return
    expect(rebuildTwo.progress).toMatchObject({ currentDifficulty: 2, lastMasteredDifficulty: 1, remediationContext: null })
    expect(rebuildTwo.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 2 } })
  })

  test('keeps assistance out of mastery evidence and keeps both Grade 3 Story units isolated', () => {
    const initial = stateAtDifficulty(2).skillProgress[SKILL_ID]
    const assisted = apply(initial, checkpoints[0], 100, true)
    expect(assisted.status).toBe('applied')
    if (assisted.status !== 'applied') return
    expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
    expect(assisted.decision.reasonCodes).toContain('assistance_observed')
    expect(unitCandidates.every((candidate) => candidate.contentVersion === VERSION && candidate.gradeBand === 3)).toBe(true)
    expect(guided).toHaveLength(2)
    expect(powerUps).toHaveLength(2)
    expect(checkpoints).toHaveLength(3)
    expect(allCandidates.filter((candidate) => candidate.unitId === 'g3-ss-unit-1').every((candidate) => candidate.contentVersion === 'g3-ss-character-arc-r0.1.0')).toBe(true)

    const grade2 = buildReviewQueueIdentity({ skillId: 'g2-story-scouts-prose', difficulty: 2, unitId: 'ss-unit-2', contentVersion: 'g2-ss-theme-trail-r0.1.0' })
    const characterArc = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 1, unitId: 'g3-ss-unit-1', contentVersion: 'g3-ss-character-arc-r0.1.0' })
    const themeTrail = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 2, unitId: UNIT_ID, contentVersion: VERSION })
    expect(sameReviewQueueIdentity(grade2, themeTrail)).toBe(false)
    expect(sameReviewQueueIdentity(characterArc, themeTrail)).toBe(false)
    expect(new Set([grade2, characterArc, themeTrail].map((identity) => JSON.stringify(identity))).size).toBe(3)
  })
})
