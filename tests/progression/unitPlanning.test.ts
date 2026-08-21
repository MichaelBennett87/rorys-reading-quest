import { describe, expect, test } from 'vitest'

import { deriveWorldsForProgress } from '../../src/data/demoWorlds'
import { getLessonById, getLessonCandidates } from '../../src/domain/lesson'
import { planUnitQuest } from '../../src/domain/progression'
import { createActiveLessonSession, createDefaultQuestProgress } from '../../src/persistence'

const now = '2026-08-20T12:00:00.000Z'

function createProgress(currentDifficulty: number) {
  const progress = createDefaultQuestProgress(now)
  const skill = Object.values(progress.skillProgress)[0]
  skill.currentDifficulty = currentDifficulty
  return progress
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
    expect(wordForgeAtSeven.units.find((unit) => unit.id === 'wg-unit-6')?.practiceFocus).toContain('Fluency Flight quests are being prepared')

    const difficultyEightWorlds = deriveWorldsForProgress(createProgress(8))
    const wordForgeAtEight = difficultyEightWorlds.find((world) => world.id === 'word-forge')!
    expect(['complete', 'review']).toContain(wordForgeAtEight.units.find((unit) => unit.id === 'wg-unit-5')?.state)
    expect(wordForgeAtEight.units.find((unit) => unit.id === 'wg-unit-5')?.difficultyLabel).toMatch(/Complete|Review/)
    expect(wordForgeAtEight.units.find((unit) => unit.id === 'wg-unit-6')?.state).toBe('locked')
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
    if (trailTwoPlan.status === 'available') {
      expect(getLessonById(trailTwoPlan.lessonId).lesson).toBeTruthy()
    }

    const trailFourProgress = createProgress(4)
    const trailFiveProgress = createProgress(5)
    const trailSixProgress = createProgress(6)
    const trailFourPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-2',
      progress: trailFourProgress,
      availableLessons,
    })
    expect(trailFourPlan.status).toBe('available')
    if (trailFourPlan.status === 'available') {
      expect(trailFourPlan.lessonId).toBe('lesson-word-forge-consonant-le-checkpoint-a')
    }

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
    if (trailFivePrefixPlan.status === 'available') {
      expect(trailFivePrefixPlan.lessonId).toBe('lesson-word-forge-common-prefixes-checkpoint-a')
    }

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
    if (trailSixSuffixPlan.status === 'available') {
      expect(trailSixSuffixPlan.lessonId).toBe('lesson-word-forge-common-suffixes-checkpoint-a')
    }

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
    if (trailSevenSilentPlan.status === 'available') {
      expect(trailSevenSilentPlan.lessonId).toBe('lesson-word-forge-silent-letter-combinations-checkpoint-a')
    }

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
      expect(trailSevenFluencyLock.reason).toMatch(/Fluency Flight quests are being prepared/i)
    }
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
