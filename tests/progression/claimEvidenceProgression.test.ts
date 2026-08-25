import { describe, expect, test } from 'vitest'

import { planGlobalQuest } from '../../src/domain/curriculum'
import { getLessonCandidates, type LessonResult } from '../../src/domain/lesson'
import { applyLessonResult, createInitialSkillProgress, planUnitQuest, type LessonActivityCandidate, type SkillProgressState } from '../../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../../src/persistence'

const NOW = '2026-08-25T07:00:00.000Z'
const SKILL_ID = 'g3-information-detectives-reading'
const UNIT_ID = 'g3-id-unit-4'
const VERSION = 'g3-id-claim-evidence-r0.1.0'
const allCandidates = getLessonCandidates()
const unitCandidates = allCandidates.filter((candidate) => candidate.skillId === SKILL_ID && candidate.unitId === UNIT_ID)
const checkpoints = unitCandidates.filter((candidate) => candidate.eligiblePurposes.includes('progression'))
const guided = unitCandidates.filter((candidate) => candidate.difficulty === 4 && candidate.eligiblePurposes.includes('remediation'))
const powerUps = unitCandidates.filter((candidate) => candidate.difficulty === 3)

function stateAtDifficulty(difficulty: 3 | 4 | 5): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  state.skillProgress['g2-information-detectives-reading'] = createInitialSkillProgress('g2-information-detectives-reading', 5, 4)
  state.skillProgress[SKILL_ID] = createInitialSkillProgress(SKILL_ID, difficulty, Math.max(0, difficulty - 1))
  return state
}

function result(candidate: LessonActivityCandidate, accuracy: number, assisted = false): LessonResult {
  const totalQuestions = candidate.eligiblePurposes.includes('progression') ? 7 : 5
  const correctAnswers = Math.floor((accuracy / 100) * totalQuestions)
  return {
    lessonId: candidate.lessonId, activityId: candidate.activityId, skillId: candidate.skillId, difficulty: candidate.difficulty,
    lessonRole: candidate.eligiblePurposes.includes('progression') ? 'CHECKPOINT' : 'GUIDED_PRACTICE', totalQuestions, correctAnswers,
    firstAttemptCorrect: correctAnswers, accuracy, assistanceUsed: assisted ? 1 : 0,
    assistanceSummary: { totalUniqueEvents: assisted ? 1 : 0, targetsHelped: assisted ? 1 : 0, maximumAssistanceLevel: assisted ? 3 : 0, visualHintUsed: assisted, spokenChunkHelpUsed: assisted, spokenWordHelpUsed: false, sentenceReadAloudUsed: false },
    questionResults: Array.from({ length: totalQuestions }, (_, index) => ({ questionId: `${candidate.activityId}-${index}`, isCorrect: index < correctAnswers, isFirstAttemptCorrect: index < correctAnswers, submittedAnswer: '', correctAnswer: '', explanation: '', evidenceReference: [] })),
    fluencyPracticeSummary: null, oralFluencyMeasured: false, completed: true,
  }
}

function apply(progress: SkillProgressState, candidate: LessonActivityCandidate, accuracy: number, assisted = false) {
  return applyLessonResult({ progress, lessonResult: result(candidate, accuracy, assisted), availableLessons: allCandidates, completedAt: NOW })
}

describe('Claim and Evidence Court progression', () => {
  test('locks before Purpose Development completion and clears the stale Unit 4 boundary', () => {
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: stateAtDifficulty(3), availableLessons: allCandidates })).toMatchObject({ status: 'locked' })
    const ready = stateAtDifficulty(4)
    ready.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: SKILL_ID, difficulty: 4, reason: 'Historical Unit 4 boundary.' }
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: ready, availableLessons: allCandidates })).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, contentVersion: VERSION } })
  })

  test('requires two distinct strong checkpoints and completes the track at difficulty 5', () => {
    const initial = stateAtDifficulty(4).skillProgress[SKILL_ID]
    const first = apply(initial, checkpoints[0], 100)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(first.decision.decisionState).toBe('VERIFY_MASTERY')
    const replay = apply(first.progress, checkpoints[0], 100)
    expect(replay.status).toBe('applied')
    if (replay.status !== 'applied') return
    expect(replay.progress.currentDifficulty).toBe(4)
    expect(replay.decision.reasonCodes).toContain('duplicate_activity_not_counted')
    const second = apply(replay.progress, checkpoints[1], 100)
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.decision.decisionState).toBe('ADVANCE')
    expect(second.progress).toMatchObject({ currentDifficulty: 5, lastMasteredDifficulty: 4 })
    expect(second.nextQuest).toMatchObject({ status: 'content_needed', skillId: SKILL_ID, difficulty: 5 })
  })

  test('preserves same-level guidance, unit-affine remediation, rebuilding, and assistance rules', () => {
    const initial = stateAtDifficulty(4).skillProgress[SKILL_ID]
    const partial = apply(initial, checkpoints[0], 80)
    expect(partial.status).toBe('applied')
    if (partial.status !== 'applied') return
    expect(partial.progress.currentDifficulty).toBe(4)
    const lowOne = apply(initial, checkpoints[0], 60)
    expect(lowOne.status).toBe('applied')
    if (lowOne.status !== 'applied') return
    expect(lowOne.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 4 } })
    const lowTwo = apply(lowOne.progress, checkpoints[1], 60)
    expect(lowTwo.status).toBe('applied')
    if (lowTwo.status !== 'applied') return
    expect(lowTwo.progress).toMatchObject({ currentDifficulty: 3, remediationContext: { originalDifficulty: 4, remediationDifficulty: 3 } })
    expect(lowTwo.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 3 } })
    const rebuildOne = apply(lowTwo.progress, powerUps[0], 100)
    expect(rebuildOne.status).toBe('applied')
    if (rebuildOne.status !== 'applied') return
    const rebuildTwo = apply(rebuildOne.progress, powerUps[1], 100)
    expect(rebuildTwo.status).toBe('applied')
    if (rebuildTwo.status !== 'applied') return
    expect(rebuildTwo.progress).toMatchObject({ currentDifficulty: 4, lastMasteredDifficulty: 3, remediationContext: null })
    const assisted = apply(initial, checkpoints[0], 100, true)
    expect(assisted.status).toBe('applied')
    if (assisted.status === 'applied') expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
  })

  test('keeps all four Grade 3 informational reviews and Grade 2 review separate', () => {
    expect(guided).toHaveLength(2)
    expect(powerUps).toHaveLength(2)
    expect(checkpoints).toHaveLength(3)
    const identities = [
      buildReviewQueueIdentity({ skillId: 'g2-information-detectives-reading', difficulty: 4, unitId: 'id-unit-4', contentVersion: 'g2-id-opinion-evidence-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 1, unitId: 'g3-id-unit-1', contentVersion: 'g3-id-structure-station-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 2, unitId: 'g3-id-unit-2', contentVersion: 'g3-id-central-idea-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 3, unitId: 'g3-id-unit-3', contentVersion: 'g3-id-purpose-development-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 4, unitId: UNIT_ID, contentVersion: VERSION }),
    ]
    for (let left = 0; left < identities.length; left += 1) {
      for (let right = left + 1; right < identities.length; right += 1) expect(sameReviewQueueIdentity(identities[left], identities[right])).toBe(false)
    }
  })

  test('enters Unit 4 through ordinary one-button planning and fails closed after track completion', () => {
    const state = createDefaultQuestProgress(NOW)
    for (const [skillId, difficulty] of [
      ['g2-word-forge-word-practice', 8], ['g2-story-scouts-prose', 4], ['g2-poetry-planet-poetry', 2],
      ['g2-information-detectives-reading', 5], ['g2-context-cavern-vocabulary', 4], ['g2-across-genres-reading', 4],
      ['g3-word-forge-word-analysis', 5], ['g3-story-scouts-prose', 4], ['g3-poetry-planet-poetry', 2],
    ] as const) state.skillProgress[skillId] = createInitialSkillProgress(skillId, difficulty, difficulty - 1)
    state.skillProgress[SKILL_ID] = createInitialSkillProgress(SKILL_ID, 4, 3)
    expect(planGlobalQuest({ progress: state, availableLessons: allCandidates, now: NOW })).toMatchObject({
      status: 'available', purpose: 'progression', lesson: { skillId: SKILL_ID, unitId: UNIT_ID, difficulty: 4 },
    })
    state.skillProgress[SKILL_ID] = createInitialSkillProgress(SKILL_ID, 5, 4)
    expect(planGlobalQuest({ progress: state, availableLessons: allCandidates, now: NOW })).toMatchObject({ status: 'content_needed' })
  })
})
