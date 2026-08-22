import { describe, expect, test } from 'vitest'

import { demoWorlds, deriveWorldsForProgress } from '../../src/data/demoWorlds'
import { deriveWorldsForProgress as deriveCurriculumWorlds } from '../../src/domain/curriculum'
import { getLessonById, getLessonCandidates } from '../../src/domain/lesson'
import { planUnitQuest } from '../../src/domain/progression'
import type { LessonActivityCandidate } from '../../src/domain/progression'
import { createInitialSkillProgress } from '../../src/domain/progression/skillProgressTypes'
import { createActiveLessonSession, createDefaultQuestProgress } from '../../src/persistence'

const now = '2026-08-20T12:00:00.000Z'

function createProgress(currentDifficulty: number) {
  const progress = createDefaultQuestProgress(now)
  const skill = progress.skillProgress['g2-word-forge-word-practice']
  skill.currentDifficulty = currentDifficulty
  return progress
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

function createCentralIdeaCenterLesson(overrides: Partial<LessonActivityCandidate> = {}): LessonActivityCandidate {
  return {
    lessonId: 'lesson-central-idea-checkpoint-a',
    activityId: 'activity-central-idea-checkpoint-a',
    skillId: 'g2-information-detectives-reading',
    difficulty: 2,
    worldId: 'information-detectives',
    unitId: 'id-unit-2',
    packId: 'fixture-information-detectives-pack',
    benchmarkReferences: ['ELA.2.R.2.2'],
    eligiblePurposes: ['progression', 'review', 'verification', 'remediation'],
    passageQuestionKeys: ['central-idea-checkpoint-a|q1'],
    contentVersion: 'fixture-information-detectives-v2',
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

describe('unit-aware Word Forge planning', () => {
  test('derives Vowel Voyage and Syllable Summit states from progress', () => {
    const difficultyOneWorlds = deriveWorldsForProgress(createProgress(1))
    const wordForgeAtOne = difficultyOneWorlds.find((world) => world.id === 'word-forge')!
    expect(wordForgeAtOne.units.find((unit) => unit.id === 'wg-unit-1')?.state).toBe('available')
    expect(wordForgeAtOne.units.find((unit) => unit.id === 'wg-unit-2')?.state).toBe('locked')

    const difficultyThreeWorlds = deriveWorldsForProgress(createProgress(3))
    const wordForgeAtThree = difficultyThreeWorlds.find((world) => world.id === 'word-forge')!
    expect(['complete', 'review']).toContain(wordForgeAtThree.units.find((unit) => unit.id === 'wg-unit-1')?.state)
    expect(wordForgeAtThree.units.find((unit) => unit.id === 'wg-unit-2')?.state).toBe('available')

    const difficultyFourWorlds = deriveWorldsForProgress(createProgress(4))
    const wordForgeAtFour = difficultyFourWorlds.find((world) => world.id === 'word-forge')!
    expect(wordForgeAtFour.units.find((unit) => unit.id === 'wg-unit-2')?.state).toBe('available')
    expect(wordForgeAtFour.units.find((unit) => unit.id === 'wg-unit-2')?.difficultyLabel).toBe('Trail 4')
    expect(wordForgeAtFour.units.find((unit) => unit.id === 'wg-unit-3')?.state).toBe('locked')

    const difficultyFiveWorlds = deriveWorldsForProgress(createProgress(5))
    const wordForgeAtFive = difficultyFiveWorlds.find((world) => world.id === 'word-forge')!
    expect(['complete', 'review']).toContain(wordForgeAtFive.units.find((unit) => unit.id === 'wg-unit-2')?.state)
    expect(wordForgeAtFive.units.find((unit) => unit.id === 'wg-unit-3')?.state).toBe('available')
    expect(wordForgeAtFive.units.find((unit) => unit.id === 'wg-unit-3')?.difficultyLabel).toBe('Trail 5')

    const difficultySixWorlds = deriveWorldsForProgress(createProgress(6))
    const wordForgeAtSix = difficultySixWorlds.find((world) => world.id === 'word-forge')!
    expect(['complete', 'review', 'available']).toContain(wordForgeAtSix.units.find((unit) => unit.id === 'wg-unit-3')?.state)
    expect(wordForgeAtSix.units.find((unit) => unit.id === 'wg-unit-4')?.state).toBe('available')
    expect(wordForgeAtSix.units.find((unit) => unit.id === 'wg-unit-4')?.difficultyLabel).toBe('Trail 6')
    expect(wordForgeAtSix.units.find((unit) => unit.id === 'wg-unit-4')?.practiceFocus).toContain('common suffixes')

    const difficultySevenWorlds = deriveWorldsForProgress(createProgress(7))
    const wordForgeAtSeven = difficultySevenWorlds.find((world) => world.id === 'word-forge')!
    expect(['complete', 'review']).toContain(wordForgeAtSeven.units.find((unit) => unit.id === 'wg-unit-3')?.state)
    expect(['complete', 'review']).toContain(wordForgeAtSeven.units.find((unit) => unit.id === 'wg-unit-4')?.state)
    expect(wordForgeAtSeven.units.find((unit) => unit.id === 'wg-unit-4')?.practiceFocus).toContain('prepared')
    expect(wordForgeAtSeven.units.find((unit) => unit.id === 'wg-unit-5')?.state).toBe('available')
    expect(wordForgeAtSeven.units.find((unit) => unit.id === 'wg-unit-5')?.difficultyLabel).toBe('Trail 7')
    expect(wordForgeAtSeven.units.find((unit) => unit.id === 'wg-unit-5')?.practiceFocus).toContain('silent-letter combinations')
    expect(wordForgeAtSeven.units.find((unit) => unit.id === 'wg-unit-6')?.state).toBe('locked')
    expect(wordForgeAtSeven.units.find((unit) => unit.id === 'wg-unit-6')?.practiceFocus).toContain('Complete Quiet Letter Quest to unlock Fluency Flight.')

    const difficultyEightWorlds = deriveWorldsForProgress(createProgress(8))
    const wordForgeAtEight = difficultyEightWorlds.find((world) => world.id === 'word-forge')!
    expect(['complete', 'review']).toContain(wordForgeAtEight.units.find((unit) => unit.id === 'wg-unit-5')?.state)
    expect(wordForgeAtEight.units.find((unit) => unit.id === 'wg-unit-5')?.difficultyLabel).toMatch(/Complete|Review/)
    expect(wordForgeAtEight.units.find((unit) => unit.id === 'wg-unit-6')?.state).toBe('available')
    expect(wordForgeAtEight.units.find((unit) => unit.id === 'wg-unit-6')?.difficultyLabel).toBe('Fluency Practice')

    const completedFluencyProgress = createProgress(8)
    Object.values(completedFluencyProgress.skillProgress)[0].currentLearningState = 'FLUENCY_PRACTICE'
    const completedFluencyWorlds = deriveWorldsForProgress(completedFluencyProgress)
    const wordForgeAfterFluency = completedFluencyWorlds.find((world) => world.id === 'word-forge')!
    expect(['complete', 'review']).toContain(wordForgeAfterFluency.units.find((unit) => unit.id === 'wg-unit-6')?.state)
    expect(wordForgeAfterFluency.units.find((unit) => unit.id === 'wg-unit-6')?.difficultyLabel).toBe('Practice Complete')
  })

  test('unit planning respects unit boundaries and freshness', () => {
    const availableLessons = getLessonCandidates()

    const trailOneProgress = createProgress(1)
    const trailOnePlan = planUnitQuest({
      selectedUnitId: 'wg-unit-1',
      progress: trailOneProgress,
      availableLessons,
    })
    expect(trailOnePlan.status).toBe('available')
    expect(trailOnePlan.unitId).toBe('wg-unit-1')

    const lockedTrailTwoPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-2',
      progress: trailOneProgress,
      availableLessons,
    })
    expect(lockedTrailTwoPlan.status).toBe('locked')

    const trailThreeProgress = createProgress(3)
    const trailTwoPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-2',
      progress: trailThreeProgress,
      availableLessons,
    })
    expect(trailTwoPlan.status).toBe('available')
    expect(trailTwoPlan.unitId).toBe('wg-unit-2')

    const trailFourProgress = createProgress(4)
    const trailFiveProgress = createProgress(5)
    const trailSixProgress = createProgress(6)
    const trailFourPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-2',
      progress: trailFourProgress,
      availableLessons,
    })
    expect(trailFourPlan.status).toBe('available')
    expect(trailFourPlan.unitId).toBe('wg-unit-2')

    const exhaustedPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-2',
      progress: trailFiveProgress,
      availableLessons,
    })
    expect(exhaustedPlan.status).toBe('content_needed')

    const trailFourPrefixLock = planUnitQuest({
      selectedUnitId: 'wg-unit-3',
      progress: trailFourProgress,
      availableLessons,
    })
    expect(trailFourPrefixLock.status).toBe('locked')

    const trailFivePrefixPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-3',
      progress: trailFiveProgress,
      availableLessons,
    })
    expect(trailFivePrefixPlan.status).toBe('available')
    expect(trailFivePrefixPlan.unitId).toBe('wg-unit-3')

    const trailSixPrefixPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-3',
      progress: trailSixProgress,
      availableLessons,
    })
    expect(trailSixPrefixPlan.status).toBe('content_needed')

    const trailSixSuffixPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-4',
      progress: trailSixProgress,
      availableLessons,
    })
    expect(trailSixSuffixPlan.status).toBe('available')
    expect(trailSixSuffixPlan.unitId).toBe('wg-unit-4')

    const trailSevenSuffixPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-4',
      progress: createProgress(7),
      availableLessons,
    })
    expect(trailSevenSuffixPlan.status).toBe('content_needed')

    const trailSixSilentLock = planUnitQuest({
      selectedUnitId: 'wg-unit-5',
      progress: trailSixProgress,
      availableLessons,
    })
    expect(trailSixSilentLock.status).toBe('locked')
    if (trailSixSilentLock.status === 'locked') {
      expect(trailSixSilentLock.reason).toMatch(/Complete Suffix Station to unlock Quiet Letter Quest/i)
    }

    const trailSevenSilentPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-5',
      progress: createProgress(7),
      availableLessons,
    })
    expect(trailSevenSilentPlan.status).toBe('available')
    expect(trailSevenSilentPlan.unitId).toBe('wg-unit-5')

    const trailEightSilentPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-5',
      progress: createProgress(8),
      availableLessons,
    })
    expect(trailEightSilentPlan.status).toBe('content_needed')

    const trailSevenFluencyLock = planUnitQuest({
      selectedUnitId: 'wg-unit-6',
      progress: createProgress(7),
      availableLessons,
    })
    expect(trailSevenFluencyLock.status).toBe('locked')
    if (trailSevenFluencyLock.status === 'locked') {
      expect(trailSevenFluencyLock.reason).toMatch(/Complete Quiet Letter Quest to unlock Fluency Flight/i)
    }

    const trailEightFluencyPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-6',
      progress: createProgress(8),
      availableLessons,
    })
    expect(trailEightFluencyPlan.status).toBe('available')
    if (trailEightFluencyPlan.status === 'available') {
      expect(trailEightFluencyPlan.lessonId).toBe('lesson-word-forge-fluency-practice-community-announcement')
    }

    const exhaustedFluencyProgress = createProgress(8)
    exhaustedFluencyProgress.skillProgress[Object.keys(exhaustedFluencyProgress.skillProgress)[0]].recentActivityUsage = availableLessons
      .filter((lesson) => lesson.unitId === 'wg-unit-6')
      .map((lesson) => ({
        ...lesson,
        completedAt: now,
      }))
    const exhaustedFluencyPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-6',
      progress: exhaustedFluencyProgress,
      availableLessons,
    })
    expect(exhaustedFluencyPlan.status).toBe('content_needed')
  })

  test('story scouts unit planning respects story map progress and future locks', () => {
    const availableLessons = getLessonCandidates()

    const storyProgress = createDefaultQuestProgress(now)
    storyProgress.skillProgress['g2-story-scouts-prose'] = createInitialSkillProgress('g2-story-scouts-prose', 1, 0)

    const storyMapPlan = planUnitQuest({
      selectedUnitId: 'ss-unit-1',
      progress: storyProgress,
      availableLessons,
    })
    expect(storyMapPlan.status).toBe('available')
    if (storyMapPlan.status === 'available') {
      expect(storyMapPlan.lesson.skillId).toBe('g2-story-scouts-prose')
      expect(storyMapPlan.lesson.lessonId).toBe('g2-story-scouts-plot-structure-elements-lesson-checkpoint-a')
    }

    const storyExhaustedProgress = createDefaultQuestProgress(now)
    storyExhaustedProgress.skillProgress['g2-story-scouts-prose'] = createInitialSkillProgress('g2-story-scouts-prose', 2, 0)

    const storyMapExhaustedPlan = planUnitQuest({
      selectedUnitId: 'ss-unit-1',
      progress: storyExhaustedProgress,
      availableLessons,
    })
    expect(storyMapExhaustedPlan.status).toBe('content_needed')
    if (storyMapExhaustedPlan.status === 'content_needed') {
      expect(storyMapExhaustedPlan.reason).toMatch(/Theme Trail is available/i)
    }

    const themeTrailLocked = planUnitQuest({
      selectedUnitId: 'ss-unit-2',
      progress: storyProgress,
      availableLessons,
    })
    expect(themeTrailLocked.status).toBe('locked')
    if (themeTrailLocked.status === 'locked') {
      expect(themeTrailLocked.reason).toMatch(/Complete Story Map to unlock Theme Trail/i)
    }

    const themeTrailPreparing = planUnitQuest({
      selectedUnitId: 'ss-unit-2',
      progress: storyExhaustedProgress,
      availableLessons,
    })
    expect(themeTrailPreparing.status).toBe('available')
    if (themeTrailPreparing.status === 'available') {
      expect(themeTrailPreparing.lesson.lessonId).toBe('g2-story-scouts-theme-trail-lesson-checkpoint-a')
      expect(themeTrailPreparing.lesson.unitId).toBe('ss-unit-2')
      expect(themeTrailPreparing.lesson.difficulty).toBe(2)
    }

    const perspectivePortalLocked = planUnitQuest({
      selectedUnitId: 'ss-unit-3',
      progress: storyProgress,
      availableLessons,
    })
    expect(perspectivePortalLocked.status).toBe('locked')
    if (perspectivePortalLocked.status === 'locked') {
      expect(perspectivePortalLocked.reason).toMatch(/Complete Theme Trail to unlock Perspective Portal/i)
    }
  })

  test('future Information Detectives and Context Cavern units stay locked without content and become playable with fixture lessons', () => {
    const noContentProgress = createDefaultQuestProgress(now)

    const informationLocked = planUnitQuest({
      selectedUnitId: 'id-unit-1',
      progress: noContentProgress,
      availableLessons: [],
    })
    expect(informationLocked.status).toBe('locked')
    if (informationLocked.status === 'locked') {
      expect(informationLocked.reason).toMatch(/no active lesson content yet/i)
    }

    const contextLocked = planUnitQuest({
      selectedUnitId: 'cc-unit-1',
      progress: noContentProgress,
      availableLessons: [],
    })
    expect(contextLocked.status).toBe('locked')
    if (contextLocked.status === 'locked') {
      expect(contextLocked.reason).toMatch(/Context Cavern Vocabulary quests are being prepared/i)
    }

    const fixtureLessons = [createInformationDetectivesLesson(), createContextCavernLesson()]
    const playableWorlds = deriveCurriculumWorlds(demoWorlds, createDefaultQuestProgress(now), fixtureLessons)
    const informationWorld = playableWorlds.find((world) => world.id === 'information-detectives')!
    const contextWorld = playableWorlds.find((world) => world.id === 'context-cavern')!

    expect(informationWorld.status).toBe('available')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-1')?.state).toBe('available')
    expect(contextWorld.status).toBe('available')
    expect(contextWorld.units.find((unit) => unit.id === 'cc-unit-1')?.state).toBe('available')

    const informationPlayable = planUnitQuest({
      selectedUnitId: 'id-unit-1',
      progress: createDefaultQuestProgress(now),
      availableLessons: [createInformationDetectivesLesson()],
    })
    expect(informationPlayable.status).toBe('available')
    if (informationPlayable.status === 'available') {
      expect(informationPlayable.lesson.skillId).toBe('g2-information-detectives-reading')
      expect(informationPlayable.lesson.unitId).toBe('id-unit-1')
    }

    const contextPlayable = planUnitQuest({
      selectedUnitId: 'cc-unit-1',
      progress: createDefaultQuestProgress(now),
      availableLessons: [createContextCavernLesson()],
    })
    expect(contextPlayable.status).toBe('available')
    if (contextPlayable.status === 'available') {
      expect(contextPlayable.lesson.skillId).toBe('g2-context-cavern-vocabulary')
      expect(contextPlayable.lesson.unitId).toBe('cc-unit-1')
    }
  })

  test('keeps Information Detectives review labels unit-specific when one unit is in spaced review', () => {
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-information-detectives-reading'] = createInitialSkillProgress('g2-information-detectives-reading', 2, 1)
    progress.skillProgress['g2-information-detectives-reading'].currentLearningState = 'SPACED_REVIEW'
    progress.activeLessonSession = createActiveLessonSession(
      getLessonById('lesson-central-idea-topic-vs-central-idea').lesson!,
      'session-info-review',
      now,
    )

    const worlds = deriveCurriculumWorlds(
      demoWorlds,
      progress,
      [createInformationDetectivesLesson(), createCentralIdeaCenterLesson()],
    )
    const informationWorld = worlds.find((world) => world.id === 'information-detectives')!

    expect(informationWorld.status).toBe('available')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-1')?.state).toBe('review')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-2')?.state).toBe('available')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-2')?.difficultyLabel).toBe('Trail 2')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-2')?.practiceFocus).toContain('central idea')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-3')?.state).toBe('locked')
  })

  test('uses Power-Up Mission for Central Idea Center remediation owned below its active difficulty', () => {
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-information-detectives-reading'] = createInitialSkillProgress('g2-information-detectives-reading', 1, 0)
    progress.activeLessonSession = createActiveLessonSession(
      getLessonById('lesson-central-idea-checkpoint-a').lesson!,
      'session-info-remediation',
      now,
    )

    const worlds = deriveCurriculumWorlds(
      demoWorlds,
      progress,
      [createInformationDetectivesLesson(), createCentralIdeaCenterLesson({ difficulty: 1 })],
    )
    const informationWorld = worlds.find((world) => world.id === 'information-detectives')!

    expect(informationWorld.status).toBe('available')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-1')?.state).toBe('available')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-2')?.state).toBe('available')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-2')?.difficultyLabel).toBe('Power-Up Mission')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-2')?.practiceFocus).toContain('central idea')
  })

  test('an active session in another unit blocks a fresh unit launch', () => {
    const progress = createProgress(3)
    const activeLesson = getLessonCandidates().find((candidate) => candidate.unitId === 'wg-unit-1')!
    progress.activeLessonSession = createActiveLessonSession(
      getLessonById(activeLesson.lessonId).lesson!,
      'session-1',
      now,
    )

    const plan = planUnitQuest({
      selectedUnitId: 'wg-unit-2',
      progress,
      availableLessons: getLessonCandidates(),
    })

    expect(plan.status).toBe('locked')
    if (plan.status === 'locked') {
      expect(plan.reason).toMatch(/different quest is already in progress/i)
    }
  })
})
