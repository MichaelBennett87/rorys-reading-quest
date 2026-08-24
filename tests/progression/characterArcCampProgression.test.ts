import { describe, expect, test } from 'vitest'

import { normalizeQuestProgressForPlanning, planGlobalQuest } from '../../src/domain/curriculum'
import { getLessonCandidates } from '../../src/domain/lesson'
import type { LessonResult } from '../../src/domain/lesson'
import { applyLessonResult, createInitialSkillProgress, planUnitQuest, type LessonActivityCandidate, type SkillProgressState } from '../../src/domain/progression'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../../src/persistence'

const NOW = '2026-08-24T12:00:00.000Z'
const SKILL_ID = 'g3-story-scouts-prose'
const UNIT_ID = 'g3-ss-unit-1'
const VERSION = 'g3-ss-character-arc-r0.1.0'
const allCandidates = getLessonCandidates()
const unitCandidates = allCandidates.filter((candidate) => candidate.skillId === SKILL_ID && candidate.unitId === UNIT_ID)
const checkpoints = unitCandidates.filter((candidate) => candidate.eligiblePurposes.includes('progression'))
const guided = unitCandidates.filter((candidate) => candidate.difficulty === 1 && candidate.eligiblePurposes.includes('remediation'))
const powerUps = unitCandidates.filter((candidate) => candidate.difficulty === 0)

function readyState(): QuestProgressV1 {
  const initial = createDefaultQuestProgress(NOW)
  return {
    ...initial,
    skillProgress: {
      ...initial.skillProgress,
      'g2-story-scouts-prose': createInitialSkillProgress('g2-story-scouts-prose', 4, 3),
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

describe('Character Arc Camp prerequisite and progression integration', () => {
  test('keeps the unit locked and Grade 3 Story Scouts progress absent before readiness', () => {
    const initial = createDefaultQuestProgress(NOW)
    const normalized = normalizeQuestProgressForPlanning(initial, allCandidates)
    expect(normalized.state.skillProgress[SKILL_ID]).toBeUndefined()
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: initial, availableLessons: allCandidates })).toMatchObject({
      status: 'locked',
      unitId: UNIT_ID,
      reason: 'Complete the Grade 2 Story Scouts chapter to unlock Character Arc Camp.',
    })
  })

  test('initializes only Story Scouts after readiness and preserves stale Grade 2 state', () => {
    const stale: QuestProgressV1 = {
      ...readyState(),
      plannedNextQuest: { status: 'content_needed', purpose: 'progression', skillId: 'g2-story-scouts-prose', difficulty: 4, reason: 'Historical content boundary.' },
    }
    const grade2Before = structuredClone(stale.skillProgress)
    const normalized = normalizeQuestProgressForPlanning(stale, allCandidates)
    expect(normalized.state.skillProgress[SKILL_ID]).toMatchObject({ currentDifficulty: 1, lastMasteredDifficulty: 0 })
    expect(Object.keys(normalized.state.skillProgress).filter((skillId) => skillId.startsWith('g3-')).sort()).toEqual([
      'g3-story-scouts-prose',
    ])
    for (const [skillId, progress] of Object.entries(grade2Before)) expect(normalized.state.skillProgress[skillId]).toEqual(progress)
    expect(planUnitQuest({ selectedUnitId: UNIT_ID, progress: normalized.state, availableLessons: allCandidates })).toMatchObject({ status: 'available', unitId: UNIT_ID })
    expect(planGlobalQuest({ progress: normalized.state, availableLessons: allCandidates, now: NOW })).toMatchObject({ status: 'available' })
  })

  test('requires two distinct strong checkpoints and stops at the deferred next unit', () => {
    const initial = normalizeQuestProgressForPlanning(readyState(), allCandidates).state.skillProgress[SKILL_ID]
    const first = apply(initial, checkpoints[0], 100)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(first.decision.decisionState).toBe('VERIFY_MASTERY')
    expect(first.nextQuest).toMatchObject({ status: 'available', purpose: 'verification', lesson: { skillId: SKILL_ID, unitId: UNIT_ID } })

    const replay = apply(first.progress, checkpoints[0], 100)
    expect(replay.status).toBe('applied')
    if (replay.status !== 'applied') return
    expect(replay.decision.reasonCodes).toContain('duplicate_activity_not_counted')
    expect(replay.progress.currentDifficulty).toBe(1)

    const second = apply(replay.progress, checkpoints[1], 100)
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.decision.decisionState).toBe('ADVANCE')
    expect(second.progress).toMatchObject({ currentDifficulty: 2, lastMasteredDifficulty: 1 })
    expect(second.nextQuest).toMatchObject({ status: 'content_needed', skillId: SKILL_ID, difficulty: 2 })
  })

  test('routes partial and repeated low work only through Character Arc Camp', () => {
    const initial = normalizeQuestProgressForPlanning(readyState(), allCandidates).state.skillProgress[SKILL_ID]
    const partial = apply(initial, checkpoints[0], 80)
    expect(partial.status).toBe('applied')
    if (partial.status !== 'applied') return
    expect(partial.decision.decisionState).toBe('RETRY_SAME_DIFFICULTY')
    expect(partial.progress.currentDifficulty).toBe(1)

    const firstLow = apply(initial, checkpoints[0], 60)
    expect(firstLow.status).toBe('applied')
    if (firstLow.status !== 'applied') return
    expect(firstLow.decision.decisionState).toBe('GUIDED_PRACTICE')
    expect(firstLow.nextQuest).toMatchObject({ status: 'available', purpose: 'remediation', lesson: { skillId: SKILL_ID, difficulty: 1, unitId: UNIT_ID } })

    const secondLow = apply(firstLow.progress, checkpoints[1], 60)
    expect(secondLow.status).toBe('applied')
    if (secondLow.status !== 'applied') return
    expect(secondLow.decision.decisionState).toBe('REMEDIATE_PREREQUISITE')
    expect(secondLow.progress).toMatchObject({ currentDifficulty: 0, remediationContext: { originalSkillId: SKILL_ID, originalDifficulty: 1, remediationDifficulty: 0 } })
    expect(secondLow.nextQuest).toMatchObject({ status: 'available', purpose: 'remediation', lesson: { skillId: SKILL_ID, difficulty: 0, unitId: UNIT_ID } })

    const rebuildOne = apply(secondLow.progress, powerUps[0], 100)
    expect(rebuildOne.status).toBe('applied')
    if (rebuildOne.status !== 'applied') return
    const rebuildTwo = apply(rebuildOne.progress, powerUps[1], 100)
    expect(rebuildTwo.status).toBe('applied')
    if (rebuildTwo.status !== 'applied') return
    expect(rebuildTwo.progress).toMatchObject({ currentDifficulty: 1, lastMasteredDifficulty: 0, remediationContext: null })
    expect(rebuildTwo.nextQuest).toMatchObject({ status: 'available', lesson: { skillId: SKILL_ID, difficulty: 1, unitId: UNIT_ID } })
  })

  test('keeps assistance out of mastery evidence and preserves unit-affine review identity', () => {
    const initial = normalizeQuestProgressForPlanning(readyState(), allCandidates).state.skillProgress[SKILL_ID]
    const assisted = apply(initial, checkpoints[0], 100, true)
    expect(assisted.status).toBe('applied')
    if (assisted.status !== 'applied') return
    expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
    expect(assisted.decision.reasonCodes).toContain('assistance_observed')
    expect(unitCandidates.every((candidate) => candidate.unitId === UNIT_ID && candidate.contentVersion === VERSION && candidate.gradeBand === 3)).toBe(true)
    expect(guided).toHaveLength(2)
    expect(powerUps).toHaveLength(2)
    expect(checkpoints).toHaveLength(3)
  })
})
