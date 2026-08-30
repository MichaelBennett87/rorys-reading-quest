import { describe, expect, test } from 'vitest'

import { getLessonCandidates, type LessonResult } from '../../src/domain/lesson'
import {
  applyLessonResult,
  createInitialSkillProgress,
  planUnitQuest,
  selectNextLessonWithDiagnostics,
  type LessonActivityCandidate,
  type SkillProgressState,
} from '../../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress } from '../../src/persistence'

const NOW = '2026-08-30T18:00:00.000Z'
const SKILL_ID = 'g3-context-cavern-vocabulary'
const UNIT_ID = 'g3-cc-unit-2'
const VERSION = 'g3-cc-root-meaning-r0.1.0'
const allCandidates = getLessonCandidates()
const unitCandidates = allCandidates.filter((candidate) => candidate.skillId === SKILL_ID && candidate.unitId === UNIT_ID)
const checkpoints = unitCandidates.filter((candidate) => candidate.eligiblePurposes.includes('progression'))
const guided = unitCandidates.filter((candidate) => candidate.difficulty === 2 && candidate.eligiblePurposes.includes('remediation'))
const powerUps = unitCandidates.filter((candidate) => candidate.difficulty === 1 && candidate.eligiblePurposes.includes('remediation'))

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
      questionId: `${candidate.activityId}-${index}`,
      isCorrect: index < correctAnswers,
      isFirstAttemptCorrect: index < correctAnswers,
      submittedAnswer: '',
      correctAnswer: '',
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

function questStateAtDifficulty(difficulty: 1 | 2) {
  const state = createDefaultQuestProgress(NOW)
  state.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 4, 3)
  state.skillProgress[SKILL_ID] = createInitialSkillProgress(SKILL_ID, difficulty, difficulty - 1)
  return state
}

describe('Root Meaning Vault progression', () => {
  test('stays locked before Unit 1 completion and opens only Unit 2 at difficulty 2', () => {
    expect(planUnitQuest({
      selectedUnitId: UNIT_ID,
      progress: questStateAtDifficulty(1),
      availableLessons: allCandidates,
    })).toMatchObject({ status: 'locked' })
    expect(planUnitQuest({
      selectedUnitId: UNIT_ID,
      progress: questStateAtDifficulty(2),
      availableLessons: allCandidates,
    })).toMatchObject({
      status: 'available',
      lesson: { skillId: SKILL_ID, unitId: UNIT_ID, difficulty: 2, contentVersion: VERSION },
    })
  })

  test('requires two distinct independent checkpoints and stops at the absent Meaning Maze boundary', () => {
    const initial = createInitialSkillProgress(SKILL_ID, 2, 1)
    const first = apply(initial, checkpoints[0], 100)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(first.decision.decisionState).toBe('VERIFY_MASTERY')
    expect(first.progress.currentDifficulty).toBe(2)

    const replay = apply(first.progress, checkpoints[0], 100)
    expect(replay.status).toBe('applied')
    if (replay.status !== 'applied') return
    expect(replay.progress.currentDifficulty).toBe(2)
    expect(replay.decision.reasonCodes).toContain('duplicate_activity_not_counted')

    const second = apply(replay.progress, checkpoints[1], 100)
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.decision.decisionState).toBe('ADVANCE')
    expect(second.progress).toMatchObject({ currentDifficulty: 3, lastMasteredDifficulty: 2 })
    expect(second.nextQuest).toMatchObject({ status: 'content_needed', skillId: SKILL_ID, difficulty: 3 })
  })

  test('keeps partial, guidance, remediation, and rebuilding inside Unit 2', () => {
    const initial = createInitialSkillProgress(SKILL_ID, 2, 1)
    const partial = apply(initial, checkpoints[0], 80)
    expect(partial.status).toBe('applied')
    if (partial.status !== 'applied') return
    expect(partial.progress.currentDifficulty).toBe(2)

    const lowOne = apply(initial, checkpoints[0], 60)
    expect(lowOne.status).toBe('applied')
    if (lowOne.status !== 'applied') return
    expect(lowOne.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 2 } })

    const lowTwo = apply(lowOne.progress, checkpoints[1], 60)
    expect(lowTwo.status).toBe('applied')
    if (lowTwo.status !== 'applied') return
    expect(lowTwo.progress).toMatchObject({
      currentDifficulty: 1,
      remediationContext: { originalDifficulty: 2, remediationDifficulty: 1 },
    })
    expect(lowTwo.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 1 } })

    const rebuildOne = apply(lowTwo.progress, powerUps[0], 100)
    expect(rebuildOne.status).toBe('applied')
    if (rebuildOne.status !== 'applied') return
    const rebuildTwo = apply(rebuildOne.progress, powerUps[1], 100)
    expect(rebuildTwo.status).toBe('applied')
    if (rebuildTwo.status !== 'applied') return
    expect(rebuildTwo.progress).toMatchObject({ currentDifficulty: 2, lastMasteredDifficulty: 1, remediationContext: null })
  })

  test('does not turn assisted work into independent mastery evidence', () => {
    const assisted = apply(createInitialSkillProgress(SKILL_ID, 2, 1), checkpoints[0], 100, true)
    expect(assisted.status).toBe('applied')
    if (assisted.status !== 'applied') return
    expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
    expect(assisted.progress.currentDifficulty).toBe(2)
    expect(assisted.decision.reasonCodes).not.toContain('independent_evidence')
  })

  test('preserves safe recycling and grade, unit, and version review isolation', () => {
    expect(checkpoints).toHaveLength(3)
    expect(guided).toHaveLength(2)
    expect(powerUps).toHaveLength(2)
    const diagnostic = selectNextLessonWithDiagnostics({
      skillId: SKILL_ID,
      difficulty: 2,
      purpose: 'progression',
      preferredUnitId: UNIT_ID,
      preferredContentVersion: VERSION,
      availableLessons: allCandidates,
      recentActivityUsage: checkpoints.map((candidate, index) => ({
        lessonId: candidate.lessonId,
        activityId: candidate.activityId,
        skillId: candidate.skillId,
        difficulty: candidate.difficulty,
        passageQuestionKeys: [...candidate.passageQuestionKeys],
        contentVersion: candidate.contentVersion,
        completedAt: `2026-08-30T17:0${index}:00.000Z`,
      })),
    })
    expect(diagnostic.plan).toMatchObject({ status: 'available', lesson: { skillId: SKILL_ID, unitId: UNIT_ID } })
    expect(diagnostic.selection?.selectionMode).toBe('recycled')

    const unit1 = buildReviewQueueIdentity({
      skillId: SKILL_ID,
      difficulty: 1,
      unitId: 'g3-cc-unit-1',
      contentVersion: 'g3-cc-academic-word-r0.1.0',
    })
    const unit2 = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 2, unitId: UNIT_ID, contentVersion: VERSION })
    const grade2 = buildReviewQueueIdentity({
      skillId: 'g2-context-cavern-vocabulary',
      difficulty: 2,
      unitId: 'cc-unit-2',
      contentVersion: 'g2-cc-morphology-mine-r0.1.0',
    })
    expect(sameReviewQueueIdentity(unit1, unit2)).toBe(false)
    expect(sameReviewQueueIdentity(grade2, unit2)).toBe(false)
  })
})
