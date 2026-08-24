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

function storyState(difficulty: 2 | 3 | 4): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  state.skillProgress['g2-story-scouts-prose'] = createInitialSkillProgress('g2-story-scouts-prose', 4, 3)
  state.skillProgress['g3-story-scouts-prose'] = createInitialSkillProgress('g3-story-scouts-prose', difficulty, difficulty - 1)
  return state
}

describe('Perspective Portal Grade 3 child chapter UI', () => {
  test('keeps Perspective Portal locked until Theme Development Trail is complete', () => {
    const state = storyState(2)
    const world = deriveWorldsForProgress(demoWorlds, state, lessons).find((entry) => entry.id === 'story-scouts')!
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-2')).toMatchObject({ state: 'available', difficultyLabel: 'Trail 2' })
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-3')).toMatchObject({ state: 'locked', practiceFocus: 'Complete Theme Development Trail to unlock Perspective Portal Grade 3.' })
    render(<UnitSelectScreen world={world} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByRole('heading', { name: 'Grade 3 Literary Analysis' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Perspective Portal Grade 3/i }).hasAttribute('disabled')).toBe(true)
  })

  test('shows Trail 3 after Theme Development completion and completes the Story Scouts chapter at difficulty 4', () => {
    const ready = storyState(3)
    const readyWorld = deriveWorldsForProgress(demoWorlds, ready, lessons).find((entry) => entry.id === 'story-scouts')!
    expect(readyWorld.units.find((entry) => entry.id === 'g3-ss-unit-1')?.state).toBe('complete')
    expect(readyWorld.units.find((entry) => entry.id === 'g3-ss-unit-2')?.state).toBe('complete')
    expect(readyWorld.units.find((entry) => entry.id === 'g3-ss-unit-3')).toMatchObject({ state: 'available', difficultyLabel: 'Trail 3' })
    expect(planUnitQuest({ selectedUnitId: 'g3-ss-unit-3', progress: ready, availableLessons: lessons })).toMatchObject({ status: 'available', unitId: 'g3-ss-unit-3' })

    render(<UnitSelectScreen world={readyWorld} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByText('Trail 3')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Perspective Portal Grade 3/i }).hasAttribute('disabled')).toBe(false)
    expect(screen.queryByText(/Grade 3 reader/i)).toBeNull()
    cleanup()

    const completeWorld = deriveWorldsForProgress(demoWorlds, storyState(4), lessons).find((entry) => entry.id === 'story-scouts')!
    expect(completeWorld.units.filter((entry) => entry.id.startsWith('g3-ss-unit-')).every((entry) => entry.state === 'complete')).toBe(true)
  })

  test('shows the unit Power-Up during remediation and keeps all five question types available', () => {
    const state = storyState(3)
    const checkpoint = lessons.find((lesson) => lesson.unitId === 'g3-ss-unit-3' && lesson.eligiblePurposes.includes('progression'))!
    state.skillProgress['g3-story-scouts-prose'] = {
      ...state.skillProgress['g3-story-scouts-prose'], currentDifficulty: 2,
      currentLearningState: 'REMEDIATE_PREREQUISITE', consecutiveUnsuccessfulAtCurrentDifficulty: 2,
      remediationContext: { originalSkillId: 'g3-story-scouts-prose', originalDifficulty: 3, remediationSkillId: 'g3-story-scouts-prose', remediationDifficulty: 2, reason: 'last_mastered_difficulty' },
      lastCompletedActivityId: checkpoint.activityId,
    }
    const powerUp = lessons.find((lesson) => lesson.unitId === 'g3-ss-unit-3' && lesson.difficulty === 2)
    if (!powerUp) throw new Error('Perspective Portal power-up lesson is required.')
    state.plannedNextQuest = { status: 'available', purpose: 'remediation', lesson: powerUp }
    const unit = deriveWorldsForProgress(demoWorlds, state, lessons).find((entry) => entry.id === 'story-scouts')?.units.find((entry) => entry.id === 'g3-ss-unit-3')
    expect(unit).toMatchObject({ state: 'available', difficultyLabel: 'Power-Up Mission' })

    const lessonIds = lessons.filter((lesson) => lesson.unitId === 'g3-ss-unit-3').map((lesson) => lesson.lessonId)
    const questionTypes = new Set(lessonIds.flatMap((lessonId) => getLessonById(lessonId).lesson?.questions.map((question) => question.questionType) ?? []))
    expect([...questionTypes].sort()).toEqual(['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'])
  })
})
