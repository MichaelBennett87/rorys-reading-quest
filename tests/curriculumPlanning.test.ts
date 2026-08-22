import { describe, expect, test } from 'vitest'

import {
  curriculumTracks,
  discoverPlayableTracks,
  ensureProgressForPlayableTracks,
  normalizePlannedNextQuest,
  normalizeQuestProgressForPlanning,
  planGlobalQuest,
  resolveActiveLearningFocus,
} from '../src/domain/curriculum'
import { getLessonById, getLessonCandidates } from '../src/domain/lesson'
import { planUnitQuest } from '../src/domain/progression'
import type { LessonActivityCandidate } from '../src/domain/progression'
import { createInitialSkillProgress } from '../src/domain/progression'
import { createActiveLessonSession, createDefaultQuestProgress } from '../src/persistence'

const now = '2026-08-20T12:00:00.000Z'

function createStoryScoutsLesson(overrides: Partial<LessonActivityCandidate> = {}): LessonActivityCandidate {
  return {
    lessonId: 'lesson-story-scouts-map-checkpoint-a',
    activityId: 'activity-story-scouts-map-checkpoint-a',
    skillId: 'g2-story-scouts-prose',
    difficulty: 1,
    worldId: 'story-scouts',
    unitId: 'ss-unit-1',
    packId: 'fixture-story-scouts-pack',
    benchmarkReferences: ['ELA.2.R.1.1'],
    eligiblePurposes: ['progression', 'review', 'verification', 'remediation'],
    passageQuestionKeys: ['story-scouts-map-a|q1'],
    contentVersion: 'fixture-story-scouts-v1',
    ...overrides,
  }
}

function createInformationDetectivesLesson(overrides: Partial<LessonActivityCandidate> = {}): LessonActivityCandidate {
  return {
    lessonId: 'lesson-information-detectives-text-feature-hunt-checkpoint-a',
    activityId: 'activity-information-detectives-text-feature-hunt-checkpoint-a',
    skillId: 'g2-information-detectives-reading',
    difficulty: 1,
    worldId: 'information-detectives',
    unitId: 'id-unit-1',
    packId: 'fixture-information-detectives-pack',
    benchmarkReferences: ['ELA.2.R.2.1'],
    eligiblePurposes: ['progression', 'review', 'verification', 'remediation'],
    passageQuestionKeys: ['information-detectives-text-feature-hunt-a|q1'],
    contentVersion: 'fixture-information-detectives-v1',
    ...overrides,
  }
}

function createContextCavernLesson(overrides: Partial<LessonActivityCandidate> = {}): LessonActivityCandidate {
  return {
    lessonId: 'lesson-context-cavern-academic-word-workshop-checkpoint-a',
    activityId: 'activity-context-cavern-academic-word-workshop-checkpoint-a',
    skillId: 'g2-context-cavern-vocabulary',
    difficulty: 1,
    worldId: 'context-cavern',
    unitId: 'cc-unit-1',
    packId: 'fixture-context-cavern-pack',
    benchmarkReferences: ['ELA.2.V.1.1'],
    eligiblePurposes: ['progression', 'review', 'verification', 'remediation'],
    passageQuestionKeys: ['context-cavern-academic-word-workshop-a|q1'],
    contentVersion: 'fixture-context-cavern-v1',
    ...overrides,
  }
}

function createWordForgeLesson(overrides: Partial<LessonActivityCandidate> = {}): LessonActivityCandidate {
  return {
    lessonId: 'lesson-word-forge-trail-1-checkpoint-a',
    activityId: 'activity-word-forge-trail-1-checkpoint-a',
    skillId: 'g2-word-forge-word-practice',
    difficulty: 1,
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    packId: 'fixture-word-forge-pack',
    benchmarkReferences: ['ELA.2.F.1.1'],
    eligiblePurposes: ['progression', 'review', 'verification', 'remediation'],
    passageQuestionKeys: ['word-forge-trail-1-a|q1'],
    contentVersion: 'fixture-word-forge-v1',
    ...overrides,
  }
}

function createLegacyLesson(overrides: Partial<LessonActivityCandidate> = {}): LessonActivityCandidate {
  return {
    lessonId: 'legacy-lesson',
    activityId: 'legacy-activity',
    skillId: 'legacy-skill',
    difficulty: 1,
    worldId: 'legacy-world',
    unitId: 'legacy-unit',
    packId: 'legacy-pack',
    benchmarkReferences: [],
    eligiblePurposes: ['progression'],
    passageQuestionKeys: ['legacy|q1'],
    contentVersion: 'legacy-v1',
    ...overrides,
  }
}

function createCompletedAttempt(skillId: string, completedAt: string, activityId = `${skillId}-activity`): unknown {
  return {
    attemptId: `${skillId}-${completedAt}`,
    completionId: `${skillId}-${completedAt}-completion`,
    lessonId: `${skillId}-lesson`,
    lessonRole: 'CHECKPOINT',
    activityId,
    skillId,
    difficulty: 1,
    questionResults: [],
    accuracy: 1,
    assistanceCount: 0,
    assistanceSummary: {
      totalEvents: 0,
      assistanceKinds: {},
      maxAssistanceLevel: 0,
    },
    assistanceEvents: [],
    completedAt,
    progressionDecisionState: 'ADVANCE',
    reasonCodes: [],
    nextReviewDate: null,
  }
}

describe('curriculum planning foundation', () => {
  test('keeps curriculum tracks immutable and explicitly ordered', () => {
    expect(Object.isFrozen(curriculumTracks)).toBe(true)
    expect(curriculumTracks.every((track) => Object.isFrozen(track))).toBe(true)
    expect(curriculumTracks.map((track) => track.trackId)).toEqual([
      'g2-word-forge-foundations',
      'g2-story-scouts-prose',
      'g2-poetry-planet',
      'g2-information-detectives-reading',
      'g2-context-cavern-vocabulary',
    ])
    expect(curriculumTracks.find((track) => track.trackId === 'g2-story-scouts-prose')?.status).toBe('active')
    expect(curriculumTracks.find((track) => track.trackId === 'g2-poetry-planet')?.status).toBe('active')
    expect(curriculumTracks.find((track) => track.trackId === 'g2-information-detectives-reading')?.status).toBe('active')
    expect(curriculumTracks.find((track) => track.trackId === 'g2-context-cavern-vocabulary')?.status).toBe('planned_until_content_exists')
    expect(new Set(curriculumTracks.map((track) => track.trackId)).size).toBe(curriculumTracks.length)
    expect(new Set(curriculumTracks.map((track) => track.skillId)).size).toBe(curriculumTracks.length)
  })

  test('discovers playable tracks only from active progression lessons', () => {
    const storyScoutsLesson = createStoryScoutsLesson()
    const reviewOnlyStoryScoutsLesson = createStoryScoutsLesson({
      lessonId: 'lesson-story-scouts-review-only',
      activityId: 'activity-story-scouts-review-only',
      eligiblePurposes: ['review'],
    })
    const legacyLesson = createLegacyLesson()

    expect(discoverPlayableTracks([storyScoutsLesson]).map((entry) => entry.track.skillId)).toEqual([
      'g2-story-scouts-prose',
    ])
    expect(discoverPlayableTracks([createInformationDetectivesLesson()]).map((entry) => entry.track.skillId)).toEqual([
      'g2-information-detectives-reading',
    ])
    expect(discoverPlayableTracks([createContextCavernLesson()]).map((entry) => entry.track.skillId)).toEqual([
      'g2-context-cavern-vocabulary',
    ])
    expect(discoverPlayableTracks([
      createContextCavernLesson(),
      createInformationDetectivesLesson(),
    ]).map((entry) => entry.track.skillId)).toEqual([
      'g2-information-detectives-reading',
      'g2-context-cavern-vocabulary',
    ])
    expect(discoverPlayableTracks([reviewOnlyStoryScoutsLesson])).toHaveLength(0)
    expect(discoverPlayableTracks([legacyLesson])).toHaveLength(0)
  })

  test('ensures missing playable skill progress is added without touching older progress', () => {
    const progress = createDefaultQuestProgress(now)
    const storyScoutsLesson = createStoryScoutsLesson()

    const result = ensureProgressForPlayableTracks(progress, [storyScoutsLesson])

    expect(result.changed).toBe(true)
    expect(result.state.skillProgress['g2-word-forge-word-practice']).toEqual(progress.skillProgress['g2-word-forge-word-practice'])
    expect(result.state.skillProgress['g2-story-scouts-prose']).toMatchObject({
      skillId: 'g2-story-scouts-prose',
      currentDifficulty: 1,
      lastMasteredDifficulty: 0,
    })
    expect(result.state.skillProgress['g2-poetry-planet-poetry']).toBeUndefined()
  })

  test('normalizes stale planned quests and preserves valid ones', () => {
    const lessons = getLessonCandidates()
    const validLesson = lessons.find((lesson) => lesson.unitId === 'wg-unit-1')!
    const validProgress = createDefaultQuestProgress(now)
    validProgress.plannedNextQuest = {
      status: 'available',
      purpose: 'progression',
      lesson: validLesson,
    }

    expect(normalizePlannedNextQuest(validProgress, lessons).changed).toBe(false)

    const staleProgress = createDefaultQuestProgress(now)
    staleProgress.plannedNextQuest = {
      status: 'available',
      purpose: 'progression',
      lesson: {
        ...validLesson,
        contentVersion: 'stale-version',
      },
    }

    const normalized = normalizePlannedNextQuest(staleProgress, lessons)
    expect(normalized.changed).toBe(true)
    expect(normalized.state.plannedNextQuest).toBeNull()
  })

  test('returns active sessions before any other global plan', () => {
    const lessons = getLessonCandidates()
    const activeLessonCandidate = lessons.find((lesson) => lesson.unitId === 'wg-unit-1')!
    const activeLesson = getLessonById(activeLessonCandidate.lessonId).lesson!
    const progress = createDefaultQuestProgress(now)
    progress.activeLessonSession = createActiveLessonSession(activeLesson, 'session-active', now)

    const plan = planGlobalQuest({ progress, availableLessons: lessons, now })

    expect(plan.status).toBe('available')
    expect(plan.source).toBe('active_session')
    expect(plan.skillId).toBe(activeLesson.skillId)
    expect(plan.lesson?.lessonId).toBe(activeLesson.lessonId)
  })

  test('honors verification, remediation, and due review across skills', () => {
    const storyScoutsLesson = createStoryScoutsLesson()
    const wordForgeLesson = createWordForgeLesson()
    const lessons = [wordForgeLesson, storyScoutsLesson]
    const verificationProgress = createDefaultQuestProgress(now)
    verificationProgress.skillProgress['g2-word-forge-word-practice'].currentLearningState = 'VERIFY_MASTERY'

    const verificationPlan = planGlobalQuest({ progress: verificationProgress, availableLessons: lessons, now })
    expect(verificationPlan.status).toBe('available')
    expect(verificationPlan.purpose).toBe('verification')
    expect(verificationPlan.source).toBe('global_planned_quest')

    const remediationProgress = createDefaultQuestProgress(now)
    remediationProgress.skillProgress['g2-word-forge-word-practice'].currentLearningState = 'REMEDIATE_PREREQUISITE'

    const remediationPlan = planGlobalQuest({ progress: remediationProgress, availableLessons: lessons, now })
    expect(remediationPlan.status).toBe('available')
    expect(remediationPlan.purpose).toBe('remediation')
    expect(remediationPlan.source).toBe('global_planned_quest')

    const reviewProgress = createDefaultQuestProgress(now)
    reviewProgress.reviewQueue = [
      {
        skillId: 'g2-word-forge-word-practice',
        difficulty: 1,
        reviewStep: 1,
        dueAt: now,
      },
      {
        skillId: 'g2-story-scouts-prose',
        difficulty: 1,
        reviewStep: 1,
        dueAt: now,
      },
    ]

    const dueReviewPlan = planGlobalQuest({ progress: reviewProgress, availableLessons: lessons, now })
    expect(dueReviewPlan.status).toBe('available')
    expect(dueReviewPlan.purpose).toBe('review')
    expect(dueReviewPlan.skillId).toBe('g2-word-forge-word-practice')
    expect(dueReviewPlan.source).toBe('global_planned_quest')
  })

  test('balances fresh progression across skills without first-entry bias', () => {
    const wordForgeLesson = createWordForgeLesson()
    const storyScoutsLesson = createStoryScoutsLesson({
      eligiblePurposes: ['progression'],
    })
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-word-forge-word-practice'].recentActivityUsage = [
      {
        lessonId: wordForgeLesson.lessonId,
        activityId: wordForgeLesson.activityId,
        skillId: wordForgeLesson.skillId,
        difficulty: wordForgeLesson.difficulty,
        passageQuestionKeys: [...wordForgeLesson.passageQuestionKeys],
        contentVersion: wordForgeLesson.contentVersion,
        completedAt: now,
      },
    ]
    progress.completedAttempts = [
      createCompletedAttempt('g2-word-forge-word-practice', '2026-08-19T12:00:00.000Z') as never,
      createCompletedAttempt('g2-word-forge-word-practice', '2026-08-20T09:00:00.000Z') as never,
    ]

    const plan = planGlobalQuest({
      progress,
      availableLessons: [wordForgeLesson, storyScoutsLesson],
      now,
    })

    expect(plan.status).toBe('available')
    expect(plan.skillId).toBe('g2-story-scouts-prose')
    expect(plan.lesson?.lessonId).toBe('lesson-story-scouts-map-checkpoint-a')
  })

  test('resolves active learning focus from active session, planned quest, latest attempt, and fallback', () => {
    const lessons = [...getLessonCandidates(), createStoryScoutsLesson()]
    const activeLessonCandidate = lessons.find((lesson) => lesson.unitId === 'wg-unit-1')!
    const activeLesson = getLessonById(activeLessonCandidate.lessonId).lesson!

    const activeProgress = createDefaultQuestProgress(now)
    activeProgress.activeLessonSession = createActiveLessonSession(activeLesson, 'session-focus-active', now)
    const activeFocus = resolveActiveLearningFocus({ progress: activeProgress, availableLessons: lessons, now })
    expect(activeFocus.source).toBe('active_session')
    expect(activeFocus.displayName).toBe('Word Forge Foundations Trail 1')

    const plannedProgress = createDefaultQuestProgress(now)
    plannedProgress.plannedNextQuest = {
      status: 'available',
      purpose: 'progression',
      lesson: createStoryScoutsLesson(),
    }
    const plannedFocus = resolveActiveLearningFocus({ progress: plannedProgress, availableLessons: lessons, now })
    expect(plannedFocus.source).toBe('planned_quest')
    expect(plannedFocus.displayName).toBe('Story Scouts Prose Trail 1')

    const latestProgress = createDefaultQuestProgress(now)
    latestProgress.completedAttempts = [
      createCompletedAttempt('g2-story-scouts-prose', '2026-08-20T11:00:00.000Z', 'story-scouts-focus') as never,
    ]
    const latestFocus = resolveActiveLearningFocus({ progress: latestProgress, availableLessons: lessons, now })
    expect(latestFocus.source).toBe('latest_attempt')
    expect(latestFocus.displayName).toBe('Story Scouts Prose Trail 1')

    const fallbackFocus = resolveActiveLearningFocus({
      progress: createDefaultQuestProgress(now),
      availableLessons: [],
      now,
    })
    expect(fallbackFocus.source).toBe('safe_fallback')
    expect(fallbackFocus.displayName).toBe('Reading Quest Ready')
  })

  test('plans Story Scouts through the selected unit when its track is playable', () => {
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-word-forge-word-practice'].currentDifficulty = 8

    const plan = planUnitQuest({
      selectedUnitId: 'ss-unit-1',
      progress,
      availableLessons: [createStoryScoutsLesson()],
    })

    expect(plan.status).toBe('available')
    expect(plan.unitId).toBe('ss-unit-1')
    if (plan.status === 'available') {
      expect(plan.lesson.skillId).toBe('g2-story-scouts-prose')
      expect(plan.lesson.lessonId).toBe('lesson-story-scouts-map-checkpoint-a')
    }
  })

  test('plans Poetry Planet through the selected unit when its track is playable', () => {
    const poetryLesson = getLessonCandidates().find((lesson) => lesson.lessonId === 'g2-poetry-planet-rhyme-routes-lesson-checkpoint-a')!
    const progress = ensureProgressForPlayableTracks(createDefaultQuestProgress(now), [poetryLesson]).state

    progress.skillProgress['g2-poetry-planet-poetry'] = createInitialSkillProgress('g2-poetry-planet-poetry', 1, 0)

    const plan = planUnitQuest({
      selectedUnitId: 'pp-unit-1',
      progress,
      availableLessons: [poetryLesson],
    })

    expect(plan.status).toBe('available')
    expect(plan.unitId).toBe('pp-unit-1')
    if (plan.status === 'available') {
      expect(plan.lesson.skillId).toBe('g2-poetry-planet-poetry')
      expect(plan.lesson.lessonId).toBe('g2-poetry-planet-rhyme-routes-lesson-checkpoint-a')
    }
  })

  test('does not create playable progress for review-only or legacy tracks', () => {
    const progress = createDefaultQuestProgress(now)
    const result = normalizeQuestProgressForPlanning(progress, [
      createStoryScoutsLesson({ eligiblePurposes: ['review'] }),
      createLegacyLesson(),
    ])

    expect(result.changed).toBe(false)
    expect(result.state.skillProgress).toEqual(progress.skillProgress)
  })

  test('chooses a playable non-Word Forge track instead of returning content-needed for Word Forge', () => {
    const wordForgeLesson = createWordForgeLesson({
      eligiblePurposes: ['progression'],
    })
    const storyScoutsLesson = createStoryScoutsLesson({
      eligiblePurposes: ['progression'],
    })
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-word-forge-word-practice'].currentDifficulty = wordForgeLesson.difficulty
    progress.skillProgress['g2-word-forge-word-practice'].recentActivityUsage = [
      {
        lessonId: wordForgeLesson.lessonId,
        activityId: wordForgeLesson.activityId,
        skillId: wordForgeLesson.skillId,
        difficulty: wordForgeLesson.difficulty,
        passageQuestionKeys: [...wordForgeLesson.passageQuestionKeys],
        contentVersion: wordForgeLesson.contentVersion,
        completedAt: now,
      },
    ]

    const plan = planGlobalQuest({
      progress,
      availableLessons: [wordForgeLesson, storyScoutsLesson],
      now,
    })

    expect(plan.status).toBe('available')
    expect(plan.skillId).toBe('g2-story-scouts-prose')
    expect(plan.source).toBe('global_planned_quest')
  })

  test('initializes playable Story Scouts progress without resetting Word Forge or creating planned tracks', () => {
    const progress = createDefaultQuestProgress(now)

    const result = ensureProgressForPlayableTracks(progress, getLessonCandidates())

    expect(result.changed).toBe(true)
    expect(result.state.skillProgress['g2-word-forge-word-practice']).toEqual(progress.skillProgress['g2-word-forge-word-practice'])
    expect(result.state.skillProgress['g2-story-scouts-prose']).toBeDefined()
    expect(result.state.skillProgress['g2-poetry-planet-poetry']).toBeDefined()
  })

  test('initializes fixture Information Detectives and Context Cavern progress without touching existing tracks', () => {
    const progress = createDefaultQuestProgress(now)

    const result = ensureProgressForPlayableTracks(progress, [
      createInformationDetectivesLesson(),
      createContextCavernLesson(),
    ])

    expect(result.changed).toBe(true)
    expect(result.state.skillProgress['g2-word-forge-word-practice']).toEqual(progress.skillProgress['g2-word-forge-word-practice'])
    expect(result.state.skillProgress['g2-information-detectives-reading']).toMatchObject({
      skillId: 'g2-information-detectives-reading',
      currentDifficulty: 1,
      lastMasteredDifficulty: 0,
    })
    expect(result.state.skillProgress['g2-context-cavern-vocabulary']).toMatchObject({
      skillId: 'g2-context-cavern-vocabulary',
      currentDifficulty: 1,
      lastMasteredDifficulty: 0,
    })
  })

  test('does not initialize planned future tracks without active content', () => {
    const progress = createDefaultQuestProgress(now)

    const result = ensureProgressForPlayableTracks(progress, [])

    expect(result.changed).toBe(false)
    expect(result.state.skillProgress['g2-information-detectives-reading']).toBeUndefined()
    expect(result.state.skillProgress['g2-context-cavern-vocabulary']).toBeUndefined()
  })

  test('uses future track curriculum order when fixture information and vocabulary lessons are available', () => {
    const plan = planGlobalQuest({
      progress: createDefaultQuestProgress(now),
      availableLessons: [
        createContextCavernLesson(),
        createInformationDetectivesLesson(),
      ],
      now,
    })

    expect(plan.status).toBe('available')
    expect(plan.skillId).toBe('g2-information-detectives-reading')
    expect(plan.lesson?.unitId).toBe('id-unit-1')
  })

  test('balances fresh progression across Word Forge and Story Scouts deterministically', () => {
    const lessons = getLessonCandidates()
    const progress = createDefaultQuestProgress(now)
    const normalized = ensureProgressForPlayableTracks(progress, lessons).state

    normalized.skillProgress['g2-word-forge-word-practice'].currentDifficulty = 1
    normalized.skillProgress['g2-story-scouts-prose'].currentDifficulty = 1

    const firstPlan = planGlobalQuest({
      progress: normalized,
      availableLessons: lessons,
      now,
    })
    expect(firstPlan.status).toBe('available')
    expect(firstPlan.skillId).toBe('g2-word-forge-word-practice')

    normalized.completedAttempts = [
      createCompletedAttempt('g2-word-forge-word-practice', '2026-08-19T12:00:00.000Z') as never,
      createCompletedAttempt('g2-word-forge-word-practice', '2026-08-20T09:00:00.000Z') as never,
    ]

    const secondPlan = planGlobalQuest({
      progress: normalized,
      availableLessons: lessons,
      now,
    })
    expect(secondPlan.status).toBe('available')
    expect(secondPlan.skillId).toBe('g2-story-scouts-prose')
  })
})
