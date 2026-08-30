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

const NOW = '2026-08-30T15:00:00.000Z'
const SKILL_ID = 'g3-context-cavern-vocabulary'
const UNIT_ID = 'g3-cc-unit-1'
const VERSION = 'g3-cc-academic-word-r0.1.0'
const allCandidates = getLessonCandidates()
const unitCandidates = allCandidates.filter((candidate) => candidate.skillId === SKILL_ID && candidate.unitId === UNIT_ID)
const checkpoints = unitCandidates.filter((candidate) => candidate.eligiblePurposes.includes('progression'))
const guided = unitCandidates.filter((candidate) => candidate.difficulty === 1 && candidate.eligiblePurposes.includes('remediation'))
const powerUps = unitCandidates.filter((candidate) => candidate.difficulty === 0 && candidate.eligiblePurposes.includes('remediation'))

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

function questStateAtDifficulty(difficulty: 0 | 1) {
  const state = createDefaultQuestProgress(NOW)
  state.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 4, 3)
  state.skillProgress[SKILL_ID] = createInitialSkillProgress(SKILL_ID, difficulty, 0)
  return state
}

describe('Academic Word Workshop Grade 3 progression', () => {
  test('locks below difficulty 1 and opens only the registered Unit 1 content', () => {
    expect(planUnitQuest({
      selectedUnitId: UNIT_ID,
      progress: questStateAtDifficulty(0),
      availableLessons: allCandidates,
    })).toMatchObject({ status: 'locked' })
    expect(planUnitQuest({
      selectedUnitId: UNIT_ID,
      progress: questStateAtDifficulty(1),
      availableLessons: allCandidates,
    })).toMatchObject({
      status: 'available',
      lesson: { skillId: SKILL_ID, unitId: UNIT_ID, difficulty: 1, contentVersion: VERSION },
    })
  })

  test('requires two distinct independent checkpoints and stops at the absent Unit 2 boundary', () => {
    const initial = createInitialSkillProgress(SKILL_ID, 1, 0)
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
    expect(second.nextQuest).toMatchObject({ status: 'content_needed', skillId: SKILL_ID, difficulty: 2 })
  })

  test('keeps partial, guided, remediation, and rebuilding work inside Unit 1', () => {
    const initial = createInitialSkillProgress(SKILL_ID, 1, 0)
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
    expect(lowTwo.progress).toMatchObject({
      currentDifficulty: 0,
      remediationContext: { originalDifficulty: 1, remediationDifficulty: 0 },
    })
    expect(lowTwo.nextQuest).toMatchObject({ status: 'available', lesson: { unitId: UNIT_ID, difficulty: 0 } })

    const rebuildOne = apply(lowTwo.progress, powerUps[0], 100)
    expect(rebuildOne.status).toBe('applied')
    if (rebuildOne.status !== 'applied') return
    const rebuildTwo = apply(rebuildOne.progress, powerUps[1], 100)
    expect(rebuildTwo.status).toBe('applied')
    if (rebuildTwo.status !== 'applied') return
    expect(rebuildTwo.progress).toMatchObject({ currentDifficulty: 1, lastMasteredDifficulty: 0, remediationContext: null })
  })

  test('does not turn assisted selected-response work into independent productive mastery evidence', () => {
    const assisted = apply(createInitialSkillProgress(SKILL_ID, 1, 0), checkpoints[0], 100, true)
    expect(assisted.status).toBe('applied')
    if (assisted.status !== 'applied') return
    expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
    expect(assisted.progress.currentDifficulty).toBe(1)
    expect(assisted.decision.reasonCodes).not.toContain('independent_evidence')
  })

  test('preserves safe recycling and grade/unit/version review isolation', () => {
    expect(checkpoints).toHaveLength(3)
    expect(guided).toHaveLength(2)
    expect(powerUps).toHaveLength(2)
    const diagnostic = selectNextLessonWithDiagnostics({
      skillId: SKILL_ID,
      difficulty: 1,
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
        completedAt: `2026-08-30T14:0${index}:00.000Z`,
      })),
    })
    expect(diagnostic.plan).toMatchObject({ status: 'available', lesson: { skillId: SKILL_ID, unitId: UNIT_ID } })
    expect(diagnostic.selection?.selectionMode).toBe('recycled')

    const grade2 = buildReviewQueueIdentity({
      skillId: 'g2-context-cavern-vocabulary', difficulty: 1, unitId: 'cc-unit-1', contentVersion: 'g2-cc-academic-word-r0.1.0',
    })
    const grade3 = buildReviewQueueIdentity({ skillId: SKILL_ID, difficulty: 1, unitId: UNIT_ID, contentVersion: VERSION })
    expect(sameReviewQueueIdentity(grade2, grade3)).toBe(false)
  })
})
