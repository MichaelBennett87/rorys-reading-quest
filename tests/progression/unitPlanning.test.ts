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
    const exhaustedPlan = planUnitQuest({
      selectedUnitId: 'wg-unit-2',
      progress: trailFourProgress,
      availableLessons,
    })
    expect(exhaustedPlan.status).toBe('content_needed')
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
