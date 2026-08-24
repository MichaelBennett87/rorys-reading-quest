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

function readyState(): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  state.skillProgress['g2-story-scouts-prose'] = createInitialSkillProgress('g2-story-scouts-prose', 4, 3)
  return state
}

describe('Character Arc Camp child chapter UI', () => {
  test('shows an honest locked Grade 3 chapter before the Grade 2 prerequisite', () => {
    const initial = createDefaultQuestProgress(NOW)
    const world = deriveWorldsForProgress(demoWorlds, initial, lessons).find((entry) => entry.id === 'story-scouts')!
    const unit = world.units.find((entry) => entry.id === 'g3-ss-unit-1')
    expect(unit).toMatchObject({ state: 'locked', stars: 0, progressPercent: 0, practiceFocus: 'Complete the Grade 2 Story Scouts chapter to unlock Character Arc Camp.' })
    expect(initial.skillProgress['g3-story-scouts-prose']).toBeUndefined()

    render(<UnitSelectScreen world={world} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByRole('heading', { name: 'Grade 2 Chapter' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Grade 3 Literary Analysis' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Character Arc Camp/i }).hasAttribute('disabled')).toBe(true)
    expect(screen.queryByRole('button', { name: /Start Character Arc Camp/i })).toBeNull()
  })

  test('shows Trail 1 after readiness while later literary units remain locked', () => {
    const ready = readyState()
    const world = deriveWorldsForProgress(demoWorlds, ready, lessons).find((entry) => entry.id === 'story-scouts')!
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-1')).toMatchObject({ state: 'available', difficultyLabel: 'Trail 1' })
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-2')).toMatchObject({ state: 'locked', practiceFocus: 'Theme Development Trail quests are being prepared.' })
    expect(world.units.find((entry) => entry.id === 'g3-ss-unit-3')?.state).toBe('locked')
    expect(planUnitQuest({ selectedUnitId: 'g3-ss-unit-1', progress: ready, availableLessons: lessons })).toMatchObject({ status: 'available', unitId: 'g3-ss-unit-1' })

    render(<UnitSelectScreen world={world} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByRole('button', { name: /Character Arc Camp/i }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByText('Trail 1')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Theme Development Trail/i }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: /Perspective Portal Grade 3/i }).hasAttribute('disabled')).toBe(true)
  })

  test('shows Power-Up Mission during Grade 3 remediation and keeps all five question types available', () => {
    const ready = readyState()
    ready.skillProgress['g3-story-scouts-prose'] = {
      skillId: 'g3-story-scouts-prose', currentDifficulty: 0, lastMasteredDifficulty: 0,
      currentLearningState: 'REMEDIATE_PREREQUISITE', qualifyingIndependentActivityIds: [],
      consecutiveUnsuccessfulAtCurrentDifficulty: 2, lastCompletedActivityId: null, recentActivityUsage: [],
      reviewStep: 0, nextReviewDate: null, lastDecisionReasonCodes: ['consecutive_unsuccessful_results'],
      remediationContext: { originalSkillId: 'g3-story-scouts-prose', originalDifficulty: 1, remediationSkillId: 'g3-story-scouts-prose', remediationDifficulty: 0, reason: 'last_mastered_difficulty' },
    }
    const unit = deriveWorldsForProgress(demoWorlds, ready, lessons).find((entry) => entry.id === 'story-scouts')?.units.find((entry) => entry.id === 'g3-ss-unit-1')
    expect(unit).toMatchObject({ state: 'available', difficultyLabel: 'Power-Up Mission' })

    const lessonIds = lessons.filter((lesson) => lesson.unitId === 'g3-ss-unit-1').map((lesson) => lesson.lessonId)
    const questionTypes = new Set(lessonIds.flatMap((lessonId) => getLessonById(lessonId).lesson?.questions.map((question) => question.questionType) ?? []))
    expect([...questionTypes].sort()).toEqual(['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'])
  })
})
