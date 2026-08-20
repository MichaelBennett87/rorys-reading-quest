import { describe, expect, test } from 'vitest'

import type { LessonResult } from '../../src/domain/lesson'
import {
  applyLessonResult,
  createInitialSkillProgress,
  type LessonActivityCandidate,
  type SkillProgressState,
} from '../../src/domain/progression'
import { getLessonCandidates } from '../../src/domain/lesson'

const completedAt = '2026-08-20T12:00:00.000Z'
const candidates = getLessonCandidates()
const currentCandidates = candidates.filter((candidate) => candidate.difficulty === 1)
const lowerCandidate = candidates.find((candidate) => candidate.difficulty === 0) as LessonActivityCandidate

function lessonResult(
  candidate: LessonActivityCandidate,
  accuracy: number,
  totalQuestions = 10,
): LessonResult {
  const correct = Math.floor((accuracy / 100) * totalQuestions)
  return {
    lessonId: candidate.lessonId,
    activityId: candidate.activityId,
    skillId: candidate.skillId,
    difficulty: candidate.difficulty,
    totalQuestions,
    correctAnswers: correct,
    firstAttemptCorrect: correct,
    accuracy,
    assistanceUsed: 0,
    questionResults: [],
    completed: true,
  }
}

function apply(progress: SkillProgressState, candidate: LessonActivityCandidate, accuracy: number) {
  return applyLessonResult({
    progress,
    lessonResult: lessonResult(candidate, accuracy),
    availableLessons: candidates,
    completedAt,
  })
}

describe('applyLessonResult', () => {
  test('requires two distinct strong activities and advances exactly one difficulty', () => {
    const initial = createInitialSkillProgress(currentCandidates[0].skillId)
    const first = apply(initial, currentCandidates[0], 90)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(first.decision.decisionState).toBe('VERIFY_MASTERY')
    expect(first.progress.qualifyingIndependentActivityIds).toEqual([currentCandidates[0].activityId])

    const replay = apply(first.progress, currentCandidates[0], 90)
    expect(replay.status).toBe('applied')
    if (replay.status !== 'applied') return
    expect(replay.decision.decisionState).toBe('VERIFY_MASTERY')
    expect(replay.decision.reasonCodes).toContain('duplicate_activity_not_counted')
    expect(replay.progress.qualifyingIndependentActivityIds).toEqual([currentCandidates[0].activityId])

    const second = apply(replay.progress, currentCandidates[1], 90)
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.decision.decisionState).toBe('ADVANCE')
    expect(second.progress.currentDifficulty).toBe(2)
    expect(second.progress.lastMasteredDifficulty).toBe(1)
    expect(second.progress.qualifyingIndependentActivityIds).toEqual([])
    expect(second.progress.nextReviewDate).toBe('2026-08-21T12:00:00.000Z')
  })

  test('partial performance stays at the same difficulty and resets unsuccessful count', () => {
    const initial = {
      ...createInitialSkillProgress(currentCandidates[0].skillId),
      consecutiveUnsuccessfulAtCurrentDifficulty: 1,
    }
    const result = apply(initial, currentCandidates[0], 75)
    expect(result.status).toBe('applied')
    if (result.status !== 'applied') return
    expect(result.decision.decisionState).toBe('RETRY_SAME_DIFFICULTY')
    expect(result.progress.currentDifficulty).toBe(1)
    expect(result.progress.consecutiveUnsuccessfulAtCurrentDifficulty).toBe(0)
  })

  test('first low result gives guided practice and second routes to last mastered difficulty', () => {
    const initial = createInitialSkillProgress(currentCandidates[0].skillId)
    const first = apply(initial, currentCandidates[0], 60)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(first.decision.decisionState).toBe('GUIDED_PRACTICE')
    expect(first.progress.consecutiveUnsuccessfulAtCurrentDifficulty).toBe(1)

    const second = apply(first.progress, currentCandidates[1], 60)
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.decision.decisionState).toBe('REMEDIATE_PREREQUISITE')
    expect(second.progress.currentDifficulty).toBe(0)
    expect(second.progress.remediationContext).toMatchObject({
      originalDifficulty: 1,
      remediationDifficulty: 0,
      reason: 'last_mastered_difficulty',
    })
  })

  test('prefers a playable explicit prerequisite', () => {
    const prerequisite: LessonActivityCandidate = {
      lessonId: 'lesson-prerequisite',
      activityId: 'activity-prerequisite',
      skillId: 'skill-prerequisite',
      difficulty: 0,
      eligiblePurposes: ['remediation'],
      passageQuestionKeys: ['passage-prerequisite::question-prerequisite'],
      contentVersion: 'v1',
    }
    const initial = createInitialSkillProgress(currentCandidates[0].skillId)
    const first = applyLessonResult({
      progress: initial,
      lessonResult: lessonResult(currentCandidates[0], 60),
      availableLessons: [...candidates, prerequisite],
      completedAt,
      relevantPrerequisiteSkillId: prerequisite.skillId,
    })
    if (first.status !== 'applied') return
    const second = applyLessonResult({
      progress: first.progress,
      lessonResult: lessonResult(currentCandidates[1], 60),
      availableLessons: [...candidates, prerequisite],
      completedAt,
      relevantPrerequisiteSkillId: prerequisite.skillId,
    })
    expect(second.status).toBe('applied')
    if (second.status !== 'applied') return
    expect(second.progress.skillId).toBe(prerequisite.skillId)
    expect(second.progress.remediationContext?.reason).toBe('explicit_prerequisite')
  })

  test('returns to the original target after rebuilding without marking it mastered', () => {
    const secondLower: LessonActivityCandidate = {
      ...lowerCandidate,
      lessonId: 'lesson-lower-b',
      activityId: 'activity-lower-b',
      passageQuestionKeys: ['passage-lower-b::question-lower-b'],
    }
    const allCandidates = [...candidates, secondLower]
    const initial = createInitialSkillProgress(currentCandidates[0].skillId)
    const firstLow = applyLessonResult({
      progress: initial,
      lessonResult: lessonResult(currentCandidates[0], 60),
      availableLessons: allCandidates,
      completedAt,
    })
    if (firstLow.status !== 'applied') return
    const secondLow = applyLessonResult({
      progress: firstLow.progress,
      lessonResult: lessonResult(currentCandidates[1], 60),
      availableLessons: allCandidates,
      completedAt,
    })
    if (secondLow.status !== 'applied') return
    const firstRebuild = applyLessonResult({
      progress: secondLow.progress,
      lessonResult: lessonResult(lowerCandidate, 100, 1),
      availableLessons: allCandidates,
      completedAt,
    })
    if (firstRebuild.status !== 'applied') return
    const rebuilt = applyLessonResult({
      progress: firstRebuild.progress,
      lessonResult: lessonResult(secondLower, 100, 1),
      availableLessons: allCandidates,
      completedAt,
    })
    expect(rebuilt.status).toBe('applied')
    if (rebuilt.status !== 'applied') return
    expect(rebuilt.progress.currentDifficulty).toBe(1)
    expect(rebuilt.progress.lastMasteredDifficulty).toBe(0)
    expect(rebuilt.progress.remediationContext).toBeNull()
    expect(rebuilt.progress.consecutiveUnsuccessfulAtCurrentDifficulty).toBe(0)
  })

  test('returns content-needed when no playable prerequisite exists', () => {
    const onlyCurrent = currentCandidates
    const initial = createInitialSkillProgress(currentCandidates[0].skillId)
    const first = applyLessonResult({
      progress: initial,
      lessonResult: lessonResult(currentCandidates[0], 60),
      availableLessons: onlyCurrent,
      completedAt,
    })
    if (first.status !== 'applied') return
    const second = applyLessonResult({
      progress: first.progress,
      lessonResult: lessonResult(currentCandidates[1], 60),
      availableLessons: onlyCurrent,
      completedAt,
    })
    expect(second.status).toBe('applied')
    if (second.status === 'applied') expect(second.nextQuest.status).toBe('content_needed')
  })

  test('does not mutate progression inputs', () => {
    const initial = createInitialSkillProgress(currentCandidates[0].skillId)
    const snapshot = structuredClone(initial)
    apply(initial, currentCandidates[0], 90)
    expect(initial).toEqual(snapshot)
  })
})
