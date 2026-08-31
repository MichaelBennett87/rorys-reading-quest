import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { useQuestProgress } from '../src/app/useQuestProgress'
import { curriculumTracks, planGlobalQuest } from '../src/domain/curriculum'
import { getLessonById, getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress, type LessonActivityCandidate } from '../src/domain/progression'
import {
  createDefaultQuestProgress,
  QUEST_PROGRESS_STORAGE_KEY,
  type CompletedLessonAttempt,
  type QuestProgressV1,
} from '../src/persistence'
import { ProgressionOutcomeScreen } from '../src/screens/ProgressionOutcomeScreen'

const NOW = '2026-08-27T21:30:00.000Z'
const STORY_SKILL_ID = 'g2-story-scouts-prose'
const lessons = getLessonCandidates()
const storyDifficultyOne = lessons.filter((lesson) => (
  lesson.skillId === STORY_SKILL_ID && lesson.difficulty === 1
))
const storyProgression = storyDifficultyOne.filter((lesson) => lesson.eligiblePurposes.includes('progression'))

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

function attempt(lesson: LessonActivityCandidate, index: number): CompletedLessonAttempt {
  return {
    attemptId: 'deployed-attempt-' + String(index + 1),
    completionId: 'deployed-session-' + String(index + 1),
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

function deployedScreenshotState(): QuestProgressV1 {
  const state = createDefaultQuestProgress(NOW)
  const wordForge = curriculumTracks.find((track) => track.skillId === 'g2-word-forge-word-practice')!
  state.skillProgress[wordForge.skillId].currentDifficulty = wordForge.completionDifficulty
  state.skillProgress[wordForge.skillId].lastMasteredDifficulty = wordForge.completionDifficulty - 1
  state.skillProgress[STORY_SKILL_ID] = createInitialSkillProgress(STORY_SKILL_ID, 1, 0)
  const usage = storyProgression.map((lesson, index) => ({
    lessonId: lesson.lessonId,
    activityId: lesson.activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    passageQuestionKeys: [...lesson.passageQuestionKeys],
    contentVersion: lesson.contentVersion,
    completedAt: new Date(Date.parse(NOW) - (20 - index) * 60_000).toISOString(),
  }))
  state.skillProgress[STORY_SKILL_ID].recentActivityUsage = usage
  state.recentActivityUsage[STORY_SKILL_ID + '::1'] = usage
  state.completedAttempts = storyDifficultyOne.slice(0, 4).map(attempt)
  state.completedSessionCount = 4
  state.totalXp = 400
  state.totalStars = 10
  state.activeLessonSession = null
  state.plannedNextQuest = {
    status: 'content_needed',
    purpose: 'progression',
    skillId: STORY_SKILL_ID,
    difficulty: 1,
    reason: 'Stored false Story Scouts boundary.',
  }
  return state
}

function seedScreenshotState(): QuestProgressV1 {
  const state = deployedScreenshotState()
  window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
  return state
}

function readStoredState(): QuestProgressV1 {
  const raw = window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY)
  if (!raw) throw new Error('Expected persisted quest progress.')
  return JSON.parse(raw) as QuestProgressV1
}

function expectNoExactOwnProperty(value: unknown, propertyName: string): void {
  // Substring checks are invalid because the legitimate `reasonCodes` property contains `reasonCode`.
  if (!value || typeof value !== 'object') return
  expect(Object.prototype.hasOwnProperty.call(value, propertyName)).toBe(false)
  for (const child of Object.values(value)) {
    expectNoExactOwnProperty(child, propertyName)
  }
}

describe('P0 planner liveness screenshot integration', () => {
  test('turns the exact 400 XP, 10 star, four-session Story Scouts dead end into a resumable lesson', async () => {
    const seeded = seedScreenshotState()
    const expectedPlan = planGlobalQuest({ progress: seeded, availableLessons: lessons, now: NOW })
    expect(expectedPlan).toMatchObject({ status: 'available', skillId: STORY_SKILL_ID, difficulty: 1 })
    if (!expectedPlan.lesson) throw new Error('Expected a recycled Story Scouts lesson.')
    const expectedLesson = getLessonById(expectedPlan.lesson.lessonId).lesson
    if (!expectedLesson) throw new Error('Expected the production Story Scouts lesson to resolve.')

    render(<App />)

    expect(screen.getByLabelText('400 experience points')).toBeTruthy()
    expect(screen.getByLabelText('10 stars earned')).toBeTruthy()
    expect(screen.getByText('Completed quests: 4')).toBeTruthy()
    expect(screen.getByText(/Current path: Story Scouts Prose Trail 1.*Level 1/)).toBeTruthy()
    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual([
      'Start Journey',
      'Parent Area',
    ])
    expect(within(screen.getByRole('region', { name: 'Your Reading Journey' })).queryAllByRole('button')).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))

    expect(screen.getByRole('heading', { name: expectedLesson.lessonTitle })).toBeTruthy()
    expect(screen.queryByText('More Quests Are Being Prepared')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Back Home' })).toBeNull()
    const firstLaunch = readStoredState()
    expect(firstLaunch.activeLessonSession).toMatchObject({
      lessonId: expectedLesson.lessonId,
      skillId: STORY_SKILL_ID,
      difficulty: 1,
    })
    expect(firstLaunch).toMatchObject({ totalXp: 400, totalStars: 10, completedSessionCount: 4 })
    expect(firstLaunch.completedAttempts).toHaveLength(4)
    const firstSessionId = firstLaunch.activeLessonSession?.sessionId

    fireEvent.click(screen.getByRole('button', { name: 'Save and Exit' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start Journey' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))

    expect(screen.getByRole('heading', { name: expectedLesson.lessonTitle })).toBeTruthy()
    const resumed = readStoredState()
    expect(resumed.activeLessonSession?.sessionId).toBe(firstSessionId)
    expect(resumed.activeLessonSession?.skillId).toBe(STORY_SKILL_ID)
    expect(resumed.completedAttempts).toHaveLength(4)
    expect(resumed).toMatchObject({ totalXp: 400, totalStars: 10, completedSessionCount: 4 })
  })

  test('rapid authoritative launch calls create one session and keep diagnostics out of persistence', () => {
    seedScreenshotState()
    const journey = renderHook(() => useQuestProgress())
    let first!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    let repeated!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>

    act(() => { first = journey.result.current.prepareJourneyLaunch() })
    act(() => { repeated = journey.result.current.prepareJourneyLaunch() })

    expect(first).toMatchObject({ status: 'start', lesson: { skillId: STORY_SKILL_ID, difficulty: 1 } })
    expect(repeated).toMatchObject({ status: 'resume', lesson: { skillId: STORY_SKILL_ID, difficulty: 1 } })
    if (first.status === 'start' && repeated.status === 'resume') {
      expect(repeated.session.sessionId).toBe(first.session.sessionId)
    }
    expect(journey.result.current.progress).toMatchObject({ totalXp: 400, totalStars: 10, completedSessionCount: 4 })
    expect(journey.result.current.progress.completedAttempts).toHaveLength(4)
    const raw = window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY) ?? ''
    expect(raw).not.toContain('selectionMode')
    expect(raw).not.toContain('priorUseCount')
    expectNoExactOwnProperty(JSON.parse(raw) as unknown, 'reasonCode')
    journey.unmount()
  })

  test('shows the coming-soon outcome only for genuine current content-needed', () => {
    const available = planGlobalQuest({
      progress: deployedScreenshotState(),
      availableLessons: lessons,
      now: NOW,
    }).nextQuest
    expect(available.status).toBe('available')

    const rendered = render(
      <ProgressionOutcomeScreen
        outcome={{
          kind: 'CHECKPOINT',
          earnedXp: 0,
          earnedStars: 0,
          currentDifficulty: 1,
          completionId: 'recycled-plan',
          nextQuest: available,
          curriculumComplete: false,
        }}
        onContinueJourney={() => {}}
        onBackHome={() => {}}
      />,
    )
    expect(screen.queryByText('More Quests Are Being Prepared')).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Continue Journey' })).toBeTruthy()

    rendered.rerender(
      <ProgressionOutcomeScreen
        outcome={{
          kind: 'CONTENT_NEEDED',
          earnedXp: 0,
          earnedStars: 0,
          currentDifficulty: 99,
          completionId: 'genuine-boundary',
          nextQuest: {
            status: 'content_needed',
            purpose: 'progression',
            skillId: STORY_SKILL_ID,
            difficulty: 99,
            reason: 'No authored compatible lesson exists for this skill, difficulty, and purpose.',
          },
          curriculumComplete: false,
        }}
        onContinueJourney={() => {}}
        onBackHome={() => {}}
      />,
    )
    expect(screen.getByText('More Quests Are Being Prepared')).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Back Home' })).toBeTruthy()
  })
})
