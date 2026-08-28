import { describe, expect, test } from 'vitest'

import { curriculumTracks, planGlobalQuest } from '../../src/domain/curriculum'
import { getLessonById, getLessonCandidates } from '../../src/domain/lesson'
import {
  createInitialSkillProgress,
  selectNextLessonWithDiagnostics,
  type LessonActivityCandidate,
  type RecentLessonActivityUsage,
} from '../../src/domain/progression'
import {
  createDefaultQuestProgress,
  type CompletedLessonAttempt,
  type QuestProgressV1,
} from '../../src/persistence'

const NOW = '2026-08-27T20:15:00.000Z'
const STORY_SKILL_ID = 'g2-story-scouts-prose'
const allLessons = getLessonCandidates()
const storyDifficultyOne = allLessons.filter((lesson) => (
  lesson.skillId === STORY_SKILL_ID && lesson.difficulty === 1
))
const storyProgression = storyDifficultyOne.filter((lesson) => lesson.eligiblePurposes.includes('progression'))
const storyVerification = storyDifficultyOne.filter((lesson) => lesson.eligiblePurposes.includes('verification'))

function usage(
  lesson: LessonActivityCandidate,
  index: number,
  activityId = lesson.activityId,
): RecentLessonActivityUsage {
  return {
    lessonId: lesson.lessonId,
    activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    passageQuestionKeys: [...lesson.passageQuestionKeys],
    contentVersion: lesson.contentVersion,
    completedAt: new Date(Date.parse(NOW) - (20 - index) * 60_000).toISOString(),
  }
}

function completedAttempt(lesson: LessonActivityCandidate, index: number): CompletedLessonAttempt {
  return {
    attemptId: 'story-attempt-' + String(index + 1),
    completionId: 'story-session-' + String(index + 1),
    lessonId: lesson.lessonId,
    lessonRole: getLessonById(lesson.lessonId).lesson?.lessonRole,
    activityId: lesson.activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    questionResults: [],
    accuracy: 50,
    assistanceCount: 0,
    assistanceSummary: {
      totalUniqueEvents: 0,
      targetsHelped: 0,
      maximumAssistanceLevel: 0,
      visualHintUsed: false,
      spokenChunkHelpUsed: false,
      spokenWordHelpUsed: false,
      sentenceReadAloudUsed: false,
    },
    assistanceEvents: [],
    completedAt: new Date(Date.parse(NOW) - (10 - index) * 60_000).toISOString(),
    progressionDecisionState: 'GUIDED_PRACTICE',
    reasonCodes: ['first_failure', 'targeted_mini_lesson'],
    nextReviewDate: null,
  }
}

function exhaustedStoryState(storedContentNeeded: boolean): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  const wordForge = curriculumTracks.find((track) => track.skillId === 'g2-word-forge-word-practice')!
  state.skillProgress[wordForge.skillId].currentDifficulty = wordForge.completionDifficulty
  state.skillProgress[wordForge.skillId].lastMasteredDifficulty = wordForge.completionDifficulty - 1
  state.skillProgress[STORY_SKILL_ID] = createInitialSkillProgress(STORY_SKILL_ID, 1, 0)
  const recentUsage = storyProgression.map((lesson, index) => usage(lesson, index))
  state.skillProgress[STORY_SKILL_ID].recentActivityUsage = recentUsage
  state.recentActivityUsage[STORY_SKILL_ID + '::1'] = recentUsage
  state.completedAttempts = storyDifficultyOne.slice(0, 4).map(completedAttempt)
  state.completedSessionCount = 4
  state.totalXp = 400
  state.totalStars = 10
  state.plannedNextQuest = storedContentNeeded
    ? {
        status: 'content_needed',
        purpose: 'progression',
        skillId: STORY_SKILL_ID,
        difficulty: 1,
        reason: 'Stored deployed Story Scouts boundary.',
      }
    : null
  return state
}

describe('P0 planner liveness hotfix', () => {
  test('reproduced screenshot state now recycles Story Scouts with or without stored content-needed', () => {
    expect(storyProgression).toHaveLength(3)

    for (const storedContentNeeded of [false, true]) {
      const state = exhaustedStoryState(storedContentNeeded)
      const before = {
        xp: state.totalXp,
        stars: state.totalStars,
        attempts: state.completedAttempts.length,
      }
      const plan = planGlobalQuest({ progress: state, availableLessons: allLessons, now: NOW })

      expect(plan).toMatchObject({
        status: 'available',
        purpose: 'progression',
        skillId: STORY_SKILL_ID,
        difficulty: 1,
        source: 'global_planned_quest',
      })
      expect(storyProgression.map((lesson) => lesson.lessonId)).toContain(plan.lesson?.lessonId)
      expect(plan.skillId).not.toBe('g2-poetry-planet-poetry')
      expect({ xp: state.totalXp, stars: state.totalStars, attempts: state.completedAttempts.length }).toEqual(before)

      const diagnostic = selectNextLessonWithDiagnostics({
        skillId: STORY_SKILL_ID,
        difficulty: 1,
        purpose: 'progression',
        availableLessons: allLessons,
        recentActivityUsage: state.skillProgress[STORY_SKILL_ID].recentActivityUsage,
      })
      expect(diagnostic.compatibleCandidateCount).toBe(3)
      expect(diagnostic.selection).toMatchObject({
        selectionMode: 'recycled',
        priorUseCount: 1,
        reasonCode: 'least_recently_used_activity',
      })
      expect(diagnostic.plan).not.toHaveProperty('selectionMode')
      expect(diagnostic.plan).not.toHaveProperty('selection')
    }
  })

  test('keeps exhausted Story Scouts verification live without changing mastery evidence', () => {
    const state = exhaustedStoryState(false)
    const progress = state.skillProgress[STORY_SKILL_ID]
    progress.currentLearningState = 'VERIFY_MASTERY'
    progress.qualifyingIndependentActivityIds = [storyVerification[0].activityId]
    progress.recentActivityUsage = storyVerification.map((lesson, index) => usage(lesson, index))
    state.completedAttempts = [completedAttempt(storyVerification[0], 0)]

    const plan = planGlobalQuest({ progress: state, availableLessons: allLessons, now: NOW })

    expect(plan).toMatchObject({
      status: 'available',
      purpose: 'verification',
      skillId: STORY_SKILL_ID,
      unitId: 'ss-unit-1',
    })
    expect(progress.qualifyingIndependentActivityIds).toEqual([storyVerification[0].activityId])
  })

  test.each(['GUIDED_PRACTICE', 'REMEDIATE_PREREQUISITE'] as const)(
    'keeps exhausted %s work live inside its owning Story Scouts unit',
    (learningState) => {
      const unitTwoCheckpoint = allLessons.find((lesson) => (
        lesson.skillId === STORY_SKILL_ID
        && lesson.unitId === 'ss-unit-2'
        && lesson.difficulty === 2
        && lesson.eligiblePurposes.includes('progression')
      ))!
      const unitTwoGuidance = allLessons.filter((lesson) => (
        lesson.skillId === STORY_SKILL_ID
        && lesson.unitId === 'ss-unit-2'
        && lesson.difficulty === 2
        && lesson.eligiblePurposes.includes('remediation')
      ))
      expect(unitTwoGuidance).toHaveLength(2)

      const state = exhaustedStoryState(false)
      state.skillProgress[STORY_SKILL_ID] = createInitialSkillProgress(STORY_SKILL_ID, 2, 1)
      state.skillProgress[STORY_SKILL_ID].currentLearningState = learningState
      state.skillProgress[STORY_SKILL_ID].recentActivityUsage = unitTwoGuidance.map((lesson, index) => usage(lesson, index))
      state.completedAttempts = [completedAttempt(unitTwoCheckpoint, 0)]

      const plan = planGlobalQuest({ progress: state, availableLessons: allLessons, now: NOW })
      expect(plan).toMatchObject({
        status: 'available',
        purpose: 'remediation',
        skillId: STORY_SKILL_ID,
        unitId: 'ss-unit-2',
        difficulty: 2,
      })
    },
  )

  test('returns content-needed only when no compatible authored candidate exists', () => {
    const result = selectNextLessonWithDiagnostics({
      skillId: STORY_SKILL_ID,
      difficulty: 99,
      purpose: 'progression',
      availableLessons: allLessons,
      recentActivityUsage: [],
    })

    expect(result.plan).toMatchObject({
      status: 'content_needed',
      skillId: STORY_SKILL_ID,
      difficulty: 99,
      reason: 'No authored compatible lesson exists for this skill, difficulty, and purpose.',
    })
    expect(result.compatibleCandidateCount).toBe(0)
    expect(result.selection).toBeNull()
  })

  test('moves beyond a completed Story Scouts track instead of recycling completed-track progression', () => {
    const state = exhaustedStoryState(false)
    const storyTrack = curriculumTracks.find((track) => track.skillId === STORY_SKILL_ID)!
    state.skillProgress[STORY_SKILL_ID].currentDifficulty = storyTrack.completionDifficulty
    state.skillProgress[STORY_SKILL_ID].lastMasteredDifficulty = storyTrack.completionDifficulty - 1

    const plan = planGlobalQuest({ progress: state, availableLessons: allLessons, now: NOW })
    expect(plan).toMatchObject({ status: 'available', skillId: 'g2-poetry-planet-poetry' })
    expect(plan.skillId).not.toBe(STORY_SKILL_ID)
  })
})
