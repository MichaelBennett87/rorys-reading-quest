import { describe, expect, test } from 'vitest'

import { planGlobalQuest } from '../../src/domain/curriculum'
import { getLessonCandidates, type LessonResult } from '../../src/domain/lesson'
import { applyLessonResult, createInitialSkillProgress, planUnitQuest, type LessonActivityCandidate, type SkillProgressState } from '../../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../../src/persistence'

const NOW = '2026-08-30T13:00:00.000Z'
const SKILL_ID = 'g3-across-genres-reading'
const UNIT_ID = 'g3-cg-unit-3'
const VERSION = 'g3-cg-author-lens-r0.1.0'
const allCandidates = getLessonCandidates()
const unitCandidates = allCandidates.filter((candidate) => candidate.skillId === SKILL_ID && candidate.unitId === UNIT_ID)
const checkpoints = unitCandidates.filter((candidate) => candidate.eligiblePurposes.includes('progression'))
const guided = unitCandidates.filter((candidate) => candidate.difficulty === 3 && candidate.eligiblePurposes.includes('remediation'))
const powerUps = unitCandidates.filter((candidate) => candidate.difficulty === 2 && candidate.eligiblePurposes.includes('remediation'))

function stateAtDifficulty(difficulty: 2 | 3 | 4): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  for (const [skillId, completedDifficulty] of [
    ['g2-word-forge-word-practice', 8], ['g2-story-scouts-prose', 4], ['g2-poetry-planet-poetry', 2],
    ['g2-information-detectives-reading', 5], ['g2-context-cavern-vocabulary', 4], ['g2-across-genres-reading', 4],
    ['g3-word-forge-word-analysis', 5], ['g3-story-scouts-prose', 4], ['g3-poetry-planet-poetry', 2], ['g3-information-detectives-reading', 5], ['g3-context-cavern-vocabulary', 4],
  ] as const) state.skillProgress[skillId] = createInitialSkillProgress(skillId, completedDifficulty, completedDifficulty - 1)
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

describe('Author Lens Tower progression', () => {
  test('locks before Summary Stronghold completion and opens at difficulty 3', () => {
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: stateAtDifficulty(2), availableLessons: allCandidates })).toMatchObject({ status: 'locked' })
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: stateAtDifficulty(3), availableLessons: allCandidates })).toMatchObject({
      status: 'available', lesson: { unitId: UNIT_ID, difficulty: 3, contentVersion: VERSION },
    })
  })

  test('requires two distinct independent checkpoints and completes the track at difficulty 4', () => {
    const initial = stateAtDifficulty(3).skillProgress[SKILL_ID]
    const first = apply(initial, checkpoints[0], 100)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(first.decision.decisionState).toBe('VERIFY_MASTERY')
    const replay = apply(first.progress, checkpoints[0], 100)
    expect(replay.status).toBe('applied')
    if (replay.status !== 'applied') return
    expect(replay.progress.currentDifficulty).toBe(3)
    expect(replay.decision.reasonCodes).toContain('duplicate_activity_not_counted')
    const second = apply(replay.progress, checkpoints[1], 100)
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.decision.decisionState).toBe('ADVANCE')
    expect(second.progress).toMatchObject({ currentDifficulty: 4, lastMasteredDifficulty: 3 })
    expect(second.nextQuest).toMatchObject({ status: 'content_needed' })
  })

  test('keeps partial work, guidance, remediation, and rebuilding inside Unit 3', () => {
    const initial = stateAtDifficulty(3).skillProgress[SKILL_ID]
    const partial = apply(initial, checkpoints[0], 80)
    expect(partial.status).toBe('applied')
    if (partial.status !== 'applied') return
    expect(partial.progress.currentDifficulty).toBe(3)

    const lowOne = apply(initial, checkpoints[0], 60)
    expect(lowOne.status).toBe('applied')
    if (lowOne.status !== 'applied') return
    expect(lowOne.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 3 } })
    const lowTwo = apply(lowOne.progress, checkpoints[1], 60)
    expect(lowTwo.status).toBe('applied')
    if (lowTwo.status !== 'applied') return
    expect(lowTwo.progress).toMatchObject({ currentDifficulty: 2, remediationContext: { originalDifficulty: 3, remediationDifficulty: 2 } })
    expect(lowTwo.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 2 } })
    const rebuildOne = apply(lowTwo.progress, powerUps[0], 100)
    expect(rebuildOne.status).toBe('applied')
    if (rebuildOne.status !== 'applied') return
    const rebuildTwo = apply(rebuildOne.progress, powerUps[1], 100)
    expect(rebuildTwo.status).toBe('applied')
    if (rebuildTwo.status !== 'applied') return
    expect(rebuildTwo.progress).toMatchObject({ currentDifficulty: 3, lastMasteredDifficulty: 2, remediationContext: null })
    const assisted = apply(initial, checkpoints[0], 100, true)
    expect(assisted.status).toBe('applied')
    if (assisted.status === 'applied') expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
  })

  test('keeps Grade 2 and all three Grade 3 Compare Castle reviews isolated', () => {
    expect(guided).toHaveLength(2)
    expect(powerUps).toHaveLength(2)
    expect(checkpoints).toHaveLength(3)
    const grade2 = buildReviewQueueIdentity({ skillId: 'g2-across-genres-reading', difficulty: 3, unitId: 'cg-unit-3', contentVersion: 'g2-cg-compare-r0.1.0' })
    const figurative = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 1, unitId: 'g3-cg-unit-1', contentVersion: 'g3-cg-figurative-fortress-r0.1.0' })
    const summary = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 2, unitId: 'g3-cg-unit-2', contentVersion: 'g3-cg-summary-stronghold-r0.1.0' })
    const authorLens = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 3, unitId: UNIT_ID, contentVersion: VERSION })
    expect([grade2, figurative, summary].every((identity) => !sameReviewQueueIdentity(identity, authorLens))).toBe(true)
  })

  test('is selected by global planning and remains live through the P0-compatible candidate path', () => {
    const atAuthorLens = stateAtDifficulty(3)
    expect(planGlobalQuest({ progress: atAuthorLens, availableLessons: allCandidates, now: NOW })).toMatchObject({
      status: 'available', purpose: 'progression', lesson: { skillId: SKILL_ID, unitId: UNIT_ID, difficulty: 3 },
    })
    expect(planGlobalQuest({ progress: stateAtDifficulty(4), availableLessons: allCandidates, now: NOW })).toMatchObject({ status: 'content_needed' })
  })
})
