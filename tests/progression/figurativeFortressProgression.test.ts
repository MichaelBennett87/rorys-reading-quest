import { describe, expect, test } from 'vitest'

import { planGlobalQuest } from '../../src/domain/curriculum'
import { getLessonCandidates, type LessonResult } from '../../src/domain/lesson'
import { applyLessonResult, createInitialSkillProgress, planUnitQuest, type LessonActivityCandidate, type SkillProgressState } from '../../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../../src/persistence'

const NOW = '2026-08-25T10:00:00.000Z'
const SKILL_ID = 'g3-across-genres-reading'
const UNIT_ID = 'g3-cg-unit-1'
const VERSION = 'g3-cg-figurative-fortress-r0.1.0'
const allCandidates = getLessonCandidates()
const unitCandidates = allCandidates.filter((candidate) => candidate.skillId === SKILL_ID && candidate.unitId === UNIT_ID)
const checkpoints = unitCandidates.filter((candidate) => candidate.eligiblePurposes.includes('progression'))
const guided = unitCandidates.filter((candidate) => candidate.difficulty === 1 && candidate.eligiblePurposes.includes('remediation'))
const powerUps = unitCandidates.filter((candidate) => candidate.difficulty === 0)

function stateAtDifficulty(difficulty: 1 | 2): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  state.skillProgress['g2-across-genres-reading'] = createInitialSkillProgress('g2-across-genres-reading', 4, 3)
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

describe('Figurative Fortress progression', () => {
  test('locks before the Grade 2 prerequisite and unlocks without creating Context Cavern progress', () => {
    const locked = createDefaultQuestProgress(NOW)
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: locked, availableLessons: allCandidates })).toMatchObject({ status: 'locked' })
    expect(locked.skillProgress[SKILL_ID]).toBeUndefined()
    expect(locked.skillProgress['g3-context-cavern-vocabulary']).toBeUndefined()
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: stateAtDifficulty(1), availableLessons: allCandidates })).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, contentVersion: VERSION } })
  })

  test('requires two distinct strong checkpoints and then opens Summary Stronghold', () => {
    const initial = stateAtDifficulty(1).skillProgress[SKILL_ID]
    const first = apply(initial, checkpoints[0], 100)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(first.decision.decisionState).toBe('VERIFY_MASTERY')
    const replay = apply(first.progress, checkpoints[0], 100)
    expect(replay.status).toBe('applied')
    if (replay.status !== 'applied') return
    expect(replay.progress.currentDifficulty).toBe(1)
    expect(replay.decision.reasonCodes).toContain('duplicate_activity_not_counted')
    const second = apply(replay.progress, checkpoints[1], 100)
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.decision.decisionState).toBe('ADVANCE')
    expect(second.progress).toMatchObject({ currentDifficulty: 2, lastMasteredDifficulty: 1 })
    expect(second.nextQuest).toMatchObject({ status: 'available', lesson: { skillId: SKILL_ID, unitId: 'g3-cg-unit-2', difficulty: 2 } })
  })

  test('preserves guidance, unit-affine power-up remediation, rebuilding, and assistance rules', () => {
    const initial = stateAtDifficulty(1).skillProgress[SKILL_ID]
    const partial = apply(initial, checkpoints[0], 80)
    expect(partial.status).toBe('applied')
    if (partial.status !== 'applied') return
    expect(partial.progress.currentDifficulty).toBe(1)
    const lowOne = apply(initial, checkpoints[0], 60)
    expect(lowOne.status).toBe('applied')
    if (lowOne.status !== 'applied') return
    expect(lowOne.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 1 } })
    const lowTwo = apply(lowOne.progress, checkpoints[1], 60)
    expect(lowTwo.status).toBe('applied')
    if (lowTwo.status !== 'applied') return
    expect(lowTwo.progress).toMatchObject({ currentDifficulty: 0, remediationContext: { originalDifficulty: 1, remediationDifficulty: 0 } })
    expect(lowTwo.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 0 } })
    const rebuildOne = apply(lowTwo.progress, powerUps[0], 100)
    expect(rebuildOne.status).toBe('applied')
    if (rebuildOne.status !== 'applied') return
    const rebuildTwo = apply(rebuildOne.progress, powerUps[1], 100)
    expect(rebuildTwo.status).toBe('applied')
    if (rebuildTwo.status !== 'applied') return
    expect(rebuildTwo.progress).toMatchObject({ currentDifficulty: 1, lastMasteredDifficulty: 0, remediationContext: null })
    const assisted = apply(initial, checkpoints[0], 100, true)
    expect(assisted.status).toBe('applied')
    if (assisted.status === 'applied') expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
  })

  test('keeps Grade 2 and Grade 3 Compare Castle reviews separate', () => {
    expect(guided).toHaveLength(2)
    expect(powerUps).toHaveLength(2)
    expect(checkpoints).toHaveLength(3)
    const grade2 = buildReviewQueueIdentity({ skillId: 'g2-across-genres-reading', difficulty: 1, unitId: 'cg-unit-1', contentVersion: 'g2-cg-wordplay-r0.1.0' })
    const grade3 = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 1, unitId: UNIT_ID, contentVersion: VERSION })
    expect(sameReviewQueueIdentity(grade2, grade3)).toBe(false)
  })

  test('enters through ordinary global planning and returns genuine content-needed after completion', () => {
    const state = createDefaultQuestProgress(NOW)
    for (const [skillId, difficulty] of [
      ['g2-word-forge-word-practice', 8], ['g2-story-scouts-prose', 4], ['g2-poetry-planet-poetry', 2],
      ['g2-information-detectives-reading', 5], ['g2-context-cavern-vocabulary', 4], ['g2-across-genres-reading', 4],
      ['g3-word-forge-word-analysis', 5], ['g3-story-scouts-prose', 4], ['g3-poetry-planet-poetry', 2], ['g3-information-detectives-reading', 5],
    ] as const) state.skillProgress[skillId] = createInitialSkillProgress(skillId, difficulty, difficulty - 1)
    expect(planGlobalQuest({ progress: state, availableLessons: allCandidates, now: NOW })).toMatchObject({ status: 'available', purpose: 'progression', lesson: { skillId: SKILL_ID, unitId: UNIT_ID, difficulty: 1 } })
    expect(state.skillProgress['g3-context-cavern-vocabulary']).toBeUndefined()
    state.skillProgress[SKILL_ID] = createInitialSkillProgress(SKILL_ID, 2, 1)
    expect(planGlobalQuest({ progress: state, availableLessons: allCandidates, now: NOW })).toMatchObject({ status: 'available', purpose: 'progression', lesson: { skillId: SKILL_ID, unitId: 'g3-cg-unit-2', difficulty: 2 } })
  })
})
