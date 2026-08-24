import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { deriveWorldsForProgress } from '../src/domain/curriculum'
import { getLessonById, getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress, planUnitQuest } from '../src/domain/progression'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../src/persistence'
import { demoWorlds } from '../src/data/demoWorlds'
import { UnitSelectScreen } from '../src/screens/UnitSelectScreen'

const NOW = '2026-08-24T12:00:00.000Z'
const lessons = getLessonCandidates()

afterEach(cleanup)

function storyState(difficulty: 1 | 2): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  state.skillProgress['g2-story-scouts-prose'] = createInitialSkillProgress('g2-story-scouts-prose', 4, 3)
  state.skillProgress['g3-story-scouts-prose'] = createInitialSkillProgress('g3-story-scouts-prose', difficulty, difficulty - 1)
  return state
}

describe('Theme Development Trail child chapter UI', () => {
  test('keeps Theme Development Trail locked until Character Arc Camp is complete', () => {
    const state = storyState(1)
    const world = deriveWorldsForProgress(demoWorlds, state, lessons).find((entry) => entry.id === 'story-scouts')!
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-1')).toMatchObject({ state: 'available', difficultyLabel: 'Trail 1' })
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-2')).toMatchObject({ state: 'locked', practiceFocus: 'Complete Character Arc Camp to unlock Theme Development Trail.' })

    render(<UnitSelectScreen world={world} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByRole('heading', { name: 'Grade 3 Literary Analysis' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Theme Development Trail/i }).hasAttribute('disabled')).toBe(true)
  })

  test('shows Trail 2 after Character Arc completion while Perspective Portal remains locked', () => {
    const state = storyState(2)
    const world = deriveWorldsForProgress(demoWorlds, state, lessons).find((entry) => entry.id === 'story-scouts')!
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-1')?.state).toBe('complete')
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-2')).toMatchObject({ state: 'available', difficultyLabel: 'Trail 2' })
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-3')?.state).toBe('locked')
    expect(planUnitQuest({ selectedUnitId: 'g3-ss-unit-2', progress: state, availableLessons: lessons })).toMatchObject({ status: 'available', unitId: 'g3-ss-unit-2' })

    render(<UnitSelectScreen world={world} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByText('Trail 2')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Theme Development Trail/i }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('button', { name: /Perspective Portal Grade 3/i }).hasAttribute('disabled')).toBe(true)
  })

  test('shows the unit Power-Up during remediation and keeps all five question types available', () => {
    const state = storyState(2)
    const checkpoint = lessons.find((lesson) => lesson.unitId === 'g3-ss-unit-2' && lesson.eligiblePurposes.includes('progression'))!
    state.skillProgress['g3-story-scouts-prose'] = {
      ...state.skillProgress['g3-story-scouts-prose'],
      currentDifficulty: 1,
      currentLearningState: 'REMEDIATE_PREREQUISITE',
      consecutiveUnsuccessfulAtCurrentDifficulty: 2,
      remediationContext: { originalSkillId: 'g3-story-scouts-prose', originalDifficulty: 2, remediationSkillId: 'g3-story-scouts-prose', remediationDifficulty: 1, reason: 'last_mastered_difficulty' },
      lastCompletedActivityId: checkpoint.activityId,
    }
    const powerUp = lessons.find((lesson) => lesson.unitId === 'g3-ss-unit-2' && lesson.difficulty === 1)
    if (!powerUp) throw new Error('Theme Development power-up lesson is required.')
    state.plannedNextQuest = { status: 'available', purpose: 'remediation', lesson: powerUp }
    const unit = deriveWorldsForProgress(demoWorlds, state, lessons).find((entry) => entry.id === 'story-scouts')?.units.find((entry) => entry.id === 'g3-ss-unit-2')
    expect(unit).toMatchObject({ state: 'available', difficultyLabel: 'Power-Up Mission' })

    const lessonIds = lessons.filter((lesson) => lesson.unitId === 'g3-ss-unit-2').map((lesson) => lesson.lessonId)
    const questionTypes = new Set(lessonIds.flatMap((lessonId) => getLessonById(lessonId).lesson?.questions.map((question) => question.questionType) ?? []))
    expect([...questionTypes].sort()).toEqual(['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'])
  })
})
