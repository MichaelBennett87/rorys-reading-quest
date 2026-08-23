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

function createMorphologyMineLesson(overrides: Partial<LessonActivityCandidate> = {}): LessonActivityCandidate {
  return {
    lessonId: 'lesson-context-cavern-morphology-mine-checkpoint-a',
    activityId: 'activity-context-cavern-morphology-mine-checkpoint-a',
    skillId: 'g2-context-cavern-vocabulary',
    difficulty: 2,
    worldId: 'context-cavern',
    unitId: 'cc-unit-2',
    packId: 'fixture-context-cavern-pack',
    benchmarkReferences: ['ELA.2.V.1.2'],
    eligiblePurposes: ['progression', 'review', 'verification', 'remediation'],
    passageQuestionKeys: ['context-cavern-morphology-mine-a|q1'],
    contentVersion: 'fixture-context-cavern-v2',
    ...overrides,
  }
}

function createMeaningClueChamberLesson(overrides: Partial<LessonActivityCandidate> = {}): LessonActivityCandidate {
  return {
    lessonId: 'lesson-context-cavern-meaning-clue-chamber-checkpoint-a',
    activityId: 'activity-context-cavern-meaning-clue-chamber-checkpoint-a',
    skillId: 'g2-context-cavern-vocabulary',
    difficulty: 3,
    worldId: 'context-cavern',
    unitId: 'cc-unit-3',
    packId: 'fixture-context-cavern-pack',
    benchmarkReferences: ['ELA.2.V.1.3'],
    eligiblePurposes: ['progression', 'review', 'verification', 'remediation'],
    passageQuestionKeys: ['context-cavern-meaning-clue-chamber-a|q1'],
    contentVersion: 'fixture-context-cavern-v3',
    ...overrides,
  }
}

function createCompareCastleLesson(overrides: Partial<LessonActivityCandidate> = {}): LessonActivityCandidate {
  return {
    lessonId: 'lesson-compare-castle-wordplay-watchtower-checkpoint-a',
    activityId: 'activity-compare-castle-wordplay-watchtower-checkpoint-a',
    skillId: 'g2-across-genres-reading',
    difficulty: 1,
    worldId: 'compare-castle',
    unitId: 'cg-unit-1',
    packId: 'fixture-compare-castle-pack',
    benchmarkReferences: ['ELA.2.R.3.1'],
    eligiblePurposes: ['progression', 'review', 'verification', 'remediation'],
    passageQuestionKeys: ['compare-castle-wordplay-watchtower-a|q1'],
    contentVersion: 'fixture-compare-castle-v1',
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
    expect(contextLocked.status).toBe('content_needed')
    if (contextLocked.status === 'content_needed') {
      expect(contextLocked.reason).toMatch(/No lesson exists for this skill/i)
    }

    const morphologyLocked = planUnitQuest({
      selectedUnitId: 'cc-unit-2',
      progress: noContentProgress,
      availableLessons: [],
    })
    expect(morphologyLocked.status).toBe('locked')
    if (morphologyLocked.status === 'locked') {
      expect(morphologyLocked.reason).toMatch(/Complete Academic Word Workshop to unlock Morphology Mine/i)
    }

    const meaningClueLocked = planUnitQuest({
      selectedUnitId: 'cc-unit-3',
      progress: noContentProgress,
      availableLessons: [],
    })
    expect(meaningClueLocked.status).toBe('locked')
    if (meaningClueLocked.status === 'locked') {
      expect(meaningClueLocked.reason).toMatch(/Complete Morphology Mine to unlock Meaning Clue Chamber/i)
    }

    const morphologyRemediationProgress = createDefaultQuestProgress(now)
    morphologyRemediationProgress.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 1, 0)
    morphologyRemediationProgress.plannedNextQuest = {
      status: 'available',
      purpose: 'remediation',
      lesson: createMorphologyMineLesson({ difficulty: 1, eligiblePurposes: ['remediation', 'review'] }),
    }

    const morphologyRemediationWorlds = deriveCurriculumWorlds(
      demoWorlds,
      morphologyRemediationProgress,
      [createMorphologyMineLesson({ difficulty: 1, eligiblePurposes: ['remediation', 'review'] })],
    )
    const morphologyRemediationWorld = morphologyRemediationWorlds.find((world) => world.id === 'context-cavern')!

    expect(morphologyRemediationWorld.status).toBe('available')
    expect(morphologyRemediationWorld.units.find((unit) => unit.id === 'cc-unit-2')?.state).toBe('available')
    expect(morphologyRemediationWorld.units.find((unit) => unit.id === 'cc-unit-2')?.difficultyLabel).toBe('Power-Up Mission')

    const morphologyRemediation = planUnitQuest({
      selectedUnitId: 'cc-unit-2',
      progress: morphologyRemediationProgress,
      availableLessons: [createMorphologyMineLesson({ difficulty: 1, eligiblePurposes: ['remediation', 'review'] })],
    })
    expect(morphologyRemediation.status).toBe('available')
    if (morphologyRemediation.status === 'available') {
      expect(morphologyRemediation.lesson.skillId).toBe('g2-context-cavern-vocabulary')
      expect(morphologyRemediation.lesson.unitId).toBe('cc-unit-2')
      expect(morphologyRemediation.lesson.benchmarkReferences).toEqual(['ELA.2.V.1.2'])
    }

    const meaningClueRemediationProgress = createDefaultQuestProgress(now)
    meaningClueRemediationProgress.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 2, 1)
    meaningClueRemediationProgress.plannedNextQuest = {
      status: 'available',
      purpose: 'remediation',
      lesson: createMeaningClueChamberLesson({ difficulty: 2, eligiblePurposes: ['remediation', 'review'] }),
    }

    const meaningClueRemediationWorlds = deriveCurriculumWorlds(
      demoWorlds,
      meaningClueRemediationProgress,
      [createMeaningClueChamberLesson({ difficulty: 2, eligiblePurposes: ['remediation', 'review'] })],
    )
    const meaningClueRemediationWorld = meaningClueRemediationWorlds.find((world) => world.id === 'context-cavern')!

    expect(meaningClueRemediationWorld.status).toBe('available')
    expect(meaningClueRemediationWorld.units.find((unit) => unit.id === 'cc-unit-3')?.state).toBe('available')
    expect(meaningClueRemediationWorld.units.find((unit) => unit.id === 'cc-unit-3')?.difficultyLabel).toBe('Power-Up Mission')

    const meaningClueRemediation = planUnitQuest({
      selectedUnitId: 'cc-unit-3',
      progress: meaningClueRemediationProgress,
      availableLessons: [createMeaningClueChamberLesson({ difficulty: 2, eligiblePurposes: ['remediation', 'review'] })],
    })
    expect(meaningClueRemediation.status).toBe('available')
    if (meaningClueRemediation.status === 'available') {
      expect(meaningClueRemediation.lesson.skillId).toBe('g2-context-cavern-vocabulary')
      expect(meaningClueRemediation.lesson.unitId).toBe('cc-unit-3')
      expect(meaningClueRemediation.lesson.benchmarkReferences).toEqual(['ELA.2.V.1.3'])
    }

    const fixtureLessons = [createInformationDetectivesLesson(), createContextCavernLesson(), createMorphologyMineLesson(), createMeaningClueChamberLesson()]
    const playableWorlds = deriveCurriculumWorlds(demoWorlds, createDefaultQuestProgress(now), fixtureLessons)
    const informationWorld = playableWorlds.find((world) => world.id === 'information-detectives')!
    const contextWorld = playableWorlds.find((world) => world.id === 'context-cavern')!

    expect(informationWorld.status).toBe('available')
    expect(informationWorld.units.find((unit) => unit.id === 'id-unit-1')?.state).toBe('available')
    expect(contextWorld.status).toBe('available')
    expect(contextWorld.units.find((unit) => unit.id === 'cc-unit-1')?.state).toBe('available')
    expect(contextWorld.units.find((unit) => unit.id === 'cc-unit-2')?.state).toBe('locked')
    expect(contextWorld.units.find((unit) => unit.id === 'cc-unit-3')?.state).toBe('locked')

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

  test('morphology mine becomes available at difficulty 2 and review-ready at difficulty 3', () => {
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 2, 1)

    const worldsAtTwo = deriveCurriculumWorlds(
      demoWorlds,
      progress,
      [createContextCavernLesson(), createMorphologyMineLesson(), createMeaningClueChamberLesson({ difficulty: 2, eligiblePurposes: ['remediation', 'review'] })],
    )
    const contextWorldAtTwo = worldsAtTwo.find((world) => world.id === 'context-cavern')!

    expect(contextWorldAtTwo.status).toBe('available')
    expect(contextWorldAtTwo.units.find((unit) => unit.id === 'cc-unit-1')?.state).toBe('complete')
    expect(contextWorldAtTwo.units.find((unit) => unit.id === 'cc-unit-2')?.state).toBe('available')
    expect(contextWorldAtTwo.units.find((unit) => unit.id === 'cc-unit-2')?.difficultyLabel).toBe('Trail 2')
    expect(contextWorldAtTwo.units.find((unit) => unit.id === 'cc-unit-3')?.state).toBe('locked')
    expect(contextWorldAtTwo.units.find((unit) => unit.id === 'cc-unit-3')?.difficultyLabel).toBe('Locked')
    expect(contextWorldAtTwo.units.find((unit) => unit.id === 'cc-unit-3')?.practiceFocus).toContain('quests are being prepared')

    const reviewProgress = createDefaultQuestProgress(now)
    reviewProgress.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 3, 2)
    reviewProgress.skillProgress['g2-context-cavern-vocabulary'].currentLearningState = 'SPACED_REVIEW'

    const worldsAtThree = deriveCurriculumWorlds(
      demoWorlds,
      reviewProgress,
      [createContextCavernLesson(), createMorphologyMineLesson(), createMeaningClueChamberLesson()],
    )
    const contextWorldAtThree = worldsAtThree.find((world) => world.id === 'context-cavern')!

    expect(contextWorldAtThree.units.find((unit) => unit.id === 'cc-unit-2')?.state).toBe('review')
    expect(contextWorldAtThree.units.find((unit) => unit.id === 'cc-unit-2')?.difficultyLabel).toBe('Review')
    expect(contextWorldAtThree.units.find((unit) => unit.id === 'cc-unit-3')?.state).toBe('available')
    expect(contextWorldAtThree.units.find((unit) => unit.id === 'cc-unit-3')?.difficultyLabel).toBe('Trail 3')

    const reviewReadyProgress = createDefaultQuestProgress(now)
    reviewReadyProgress.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 4, 3)
    reviewReadyProgress.skillProgress['g2-context-cavern-vocabulary'].currentLearningState = 'SPACED_REVIEW'

    const worldsAtFour = deriveCurriculumWorlds(
      demoWorlds,
      reviewReadyProgress,
      [createContextCavernLesson(), createMorphologyMineLesson(), createMeaningClueChamberLesson()],
    )
    const contextWorldAtFour = worldsAtFour.find((world) => world.id === 'context-cavern')!

    expect(contextWorldAtFour.units.find((unit) => unit.id === 'cc-unit-3')?.state).toMatch(/^(review|complete)$/)

    const reviewPlan = planUnitQuest({
      selectedUnitId: 'cc-unit-2',
      progress: reviewProgress,
      availableLessons: [createMorphologyMineLesson({ eligiblePurposes: ['review'] })],
    })
    expect(reviewPlan.status).toBe('content_needed')
    if (reviewPlan.status === 'content_needed') {
      expect(reviewPlan.reason).toMatch(/Meaning Clue Chamber quests are being prepared/i)
    }

    const meaningClueReviewPlan = planUnitQuest({
      selectedUnitId: 'cc-unit-3',
      progress: reviewReadyProgress,
      availableLessons: [createMeaningClueChamberLesson({ eligiblePurposes: ['review'] })],
    })
    expect(meaningClueReviewPlan.status).toBe('content_needed')
    if (meaningClueReviewPlan.status === 'content_needed') {
      expect(meaningClueReviewPlan.reason).toMatch(/available Context Cavern quests/i)
      expect(meaningClueReviewPlan.reason).toMatch(/across-genre missions are prepared/i)
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

  test('keeps all three Context Cavern review labels unit-specific when Meaning Clue Chamber is in spaced review', () => {
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 3, 2)
    progress.skillProgress['g2-context-cavern-vocabulary'].currentLearningState = 'SPACED_REVIEW'

    const worlds = deriveCurriculumWorlds(
      demoWorlds,
      progress,
      [createContextCavernLesson(), createMorphologyMineLesson(), createMeaningClueChamberLesson()],
    )
    const contextWorld = worlds.find((world) => world.id === 'context-cavern')!

    expect(contextWorld.units.find((unit) => unit.id === 'cc-unit-1')?.state).toBe('complete')
    expect(contextWorld.units.find((unit) => unit.id === 'cc-unit-2')?.state).toBe('review')
    expect(contextWorld.units.find((unit) => unit.id === 'cc-unit-3')?.state).toBe('available')
    expect(contextWorld.units.find((unit) => unit.id === 'cc-unit-3')?.difficultyLabel).toBe('Trail 3')
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

describe('Compare Castle planning', () => {
  test('shows Compare Castle as available when production content exists', () => {
    const worlds = deriveWorldsForProgress(createProgress(1))
    const compareCastle = worlds.find((world) => world.id === 'compare-castle')!

    expect(compareCastle.status).toBe('available')
    expect(compareCastle.units).toHaveLength(3)
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-1')?.state).toBe('available')
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-2')?.state).toBe('locked')
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-3')?.state).toBe('locked')
  })

  test('makes Wordplay Watchtower available with fixture content at difficulty 1', () => {
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-across-genres-reading'] = createInitialSkillProgress('g2-across-genres-reading', 1, 0)

    const worlds = deriveCurriculumWorlds(demoWorlds, progress, [createCompareCastleLesson()])
    const compareCastle = worlds.find((world) => world.id === 'compare-castle')!

    expect(compareCastle.status).toBe('available')
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-1')?.state).toBe('available')
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-1')?.difficultyLabel).toBe('Trail 1')
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-2')?.state).toBe('locked')
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-3')?.state).toBe('locked')
  })

  test('makes Retell Hall available with fixture content at difficulty 2', () => {
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-across-genres-reading'] = createInitialSkillProgress('g2-across-genres-reading', 2, 1)

    const worlds = deriveCurriculumWorlds(demoWorlds, progress, [
      createCompareCastleLesson(),
      createCompareCastleLesson({
        lessonId: 'lesson-compare-castle-retell-hall-checkpoint-a',
        activityId: 'activity-compare-castle-retell-hall-checkpoint-a',
        unitId: 'cg-unit-2',
        difficulty: 2,
        benchmarkReferences: ['ELA.2.R.3.2'],
        contentVersion: 'fixture-compare-castle-v2',
      }),
    ])
    const compareCastle = worlds.find((world) => world.id === 'compare-castle')!

    expect(compareCastle.status).toBe('available')
    expect(['complete', 'review']).toContain(compareCastle.units.find((unit) => unit.id === 'cg-unit-1')?.state)
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-2')?.state).toBe('available')
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-2')?.difficultyLabel).toBe('Trail 2')
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-3')?.state).toBe('locked')
  })

  test('makes Compare Keep available with fixture content at difficulty 3', () => {
    const progress = createDefaultQuestProgress(now)
    progress.skillProgress['g2-across-genres-reading'] = createInitialSkillProgress('g2-across-genres-reading', 3, 2)

    const worlds = deriveCurriculumWorlds(demoWorlds, progress, [
      createCompareCastleLesson(),
      createCompareCastleLesson({
        lessonId: 'lesson-compare-castle-retell-hall-checkpoint-a',
        activityId: 'activity-compare-castle-retell-hall-checkpoint-a',
        unitId: 'cg-unit-2',
        difficulty: 2,
        benchmarkReferences: ['ELA.2.R.3.2'],
        contentVersion: 'fixture-compare-castle-v2',
      }),
      createCompareCastleLesson({
        lessonId: 'lesson-compare-castle-compare-keep-checkpoint-a',
        activityId: 'activity-compare-castle-compare-keep-checkpoint-a',
        unitId: 'cg-unit-3',
        difficulty: 3,
        benchmarkReferences: ['ELA.2.R.3.3'],
        contentVersion: 'fixture-compare-castle-v3',
      }),
    ])
    const compareCastle = worlds.find((world) => world.id === 'compare-castle')!

    expect(compareCastle.status).toBe('available')
    expect(['complete', 'review']).toContain(compareCastle.units.find((unit) => unit.id === 'cg-unit-1')?.state)
    expect(['complete', 'review']).toContain(compareCastle.units.find((unit) => unit.id === 'cg-unit-2')?.state)
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-3')?.state).toBe('available')
    expect(compareCastle.units.find((unit) => unit.id === 'cg-unit-3')?.difficultyLabel).toBe('Trail 3')
  })

  test('plans Compare Castle through the selected unit without crossing ownership', () => {
    const baseProgress = createDefaultQuestProgress(now)
    baseProgress.skillProgress['g2-across-genres-reading'] = createInitialSkillProgress('g2-across-genres-reading', 1, 0)

    const unitOnePlan = planUnitQuest({
      selectedUnitId: 'cg-unit-1',
      progress: baseProgress,
      availableLessons: [createCompareCastleLesson()],
    })
    expect(unitOnePlan.status).toBe('available')
    expect(unitOnePlan.unitId).toBe('cg-unit-1')

    const unitTwoProgress = createDefaultQuestProgress(now)
    unitTwoProgress.skillProgress['g2-across-genres-reading'] = createInitialSkillProgress('g2-across-genres-reading', 2, 1)
    const unitTwoLessons = [
      createCompareCastleLesson(),
      createCompareCastleLesson({
        lessonId: 'lesson-compare-castle-retell-hall-checkpoint-a',
        activityId: 'activity-compare-castle-retell-hall-checkpoint-a',
        unitId: 'cg-unit-2',
        difficulty: 2,
        benchmarkReferences: ['ELA.2.R.3.2'],
        contentVersion: 'fixture-compare-castle-v2',
      }),
    ]
    const unitTwoPlan = planUnitQuest({
      selectedUnitId: 'cg-unit-2',
      progress: unitTwoProgress,
      availableLessons: unitTwoLessons,
    })
    expect(unitTwoPlan.status).toBe('available')
    expect(unitTwoPlan.unitId).toBe('cg-unit-2')

    const unitThreeProgress = createDefaultQuestProgress(now)
    unitThreeProgress.skillProgress['g2-across-genres-reading'] = createInitialSkillProgress('g2-across-genres-reading', 3, 2)
    const unitThreeLessons = [
      ...unitTwoLessons,
      createCompareCastleLesson({
        lessonId: 'lesson-compare-castle-compare-keep-checkpoint-a',
        activityId: 'activity-compare-castle-compare-keep-checkpoint-a',
        unitId: 'cg-unit-3',
        difficulty: 3,
        benchmarkReferences: ['ELA.2.R.3.3'],
        contentVersion: 'fixture-compare-castle-v3',
      }),
    ]
    const unitThreePlan = planUnitQuest({
      selectedUnitId: 'cg-unit-3',
      progress: unitThreeProgress,
      availableLessons: unitThreeLessons,
    })
    expect(unitThreePlan.status).toBe('available')
    expect(unitThreePlan.unitId).toBe('cg-unit-3')
  })
})
