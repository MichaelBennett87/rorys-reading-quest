import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import App from '../src/App'
import { curriculumTracks, planGlobalQuest } from '../src/domain/curriculum'
import { getLessonById, getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress } from '../src/domain/progression'
import { ProgressionOutcomeScreen } from '../src/screens/ProgressionOutcomeScreen'
import {
  PARENT_ACCESS_STORAGE_KEY,
  PARENT_RECORDS_STORAGE_KEY,
  QUEST_PROGRESS_STORAGE_KEY,
  createDefaultQuestProgress,
} from '../src/persistence'
import * as parentAccess from '../src/services/parentAccess'
import type { ParentPinRecord } from '../src/services/parentAccess'

let parentCryptoSupported = true

vi.spyOn(parentAccess, 'createBrowserParentPinService').mockImplementation(() => ({
  isSupported: () => parentCryptoSupported,
  async setupPin({ pin, confirmPin }: { pin: string; confirmPin: string }, now = '2026-08-20T12:00:00.000Z') {
    if (!parentCryptoSupported) return { status: 'unavailable', reason: 'Secure local PIN setup is not available in this browser.' }
    if (!/^\d+$/.test(pin)) return { status: 'invalid_input', reason: 'PIN must contain digits only.' }
    if (pin.length < 4) return { status: 'invalid_input', reason: 'PIN must be at least 4 digits.' }
    if (pin.length > 8) return { status: 'invalid_input', reason: 'PIN must be at most 8 digits.' }
    if (pin !== confirmPin) return { status: 'invalid_input', reason: 'PIN confirmation does not match.' }
    return {
      status: 'created',
      record: {
        schemaVersion: 1,
        pinHash: `hash:${pin}`,
        pinSalt: `salt:${pin}`,
        hashAlgorithm: 'PBKDF2-SHA-256',
        hashIterations: 60000,
        createdAt: now,
        updatedAt: now,
      },
    }
  },
  async verifyPin(pin: string, record: ParentPinRecord) {
    if (!parentCryptoSupported) return { status: 'unavailable', reason: 'Secure local PIN setup is not available in this browser.' }
    return pin === record.pinHash.replace('hash:', '')
      ? { status: 'created', record }
      : { status: 'incorrect', reason: 'The PIN did not match.' }
  },
}) as never)

afterEach(() => {
  cleanup()
  window.localStorage.removeItem(QUEST_PROGRESS_STORAGE_KEY)
  window.localStorage.removeItem(PARENT_ACCESS_STORAGE_KEY)
  window.localStorage.removeItem(PARENT_RECORDS_STORAGE_KEY)
  parentCryptoSupported = true
})

function getHomeButtons() {
  return screen.getAllByRole('button')
}

function startJourney() {
  fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
}

function seedWordForgeComplete() {
  const now = '2026-08-20T12:00:00.000Z'
  const progress = createDefaultQuestProgress(now)
  const wordForge = curriculumTracks.find((track) => track.skillId === 'g2-word-forge-word-practice')!
  progress.skillProgress[wordForge.skillId].currentDifficulty = wordForge.completionDifficulty
  progress.skillProgress[wordForge.skillId].lastMasteredDifficulty = wordForge.completionDifficulty - 1
  window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  return progress
}

function seedAllAuthoredCurriculumComplete() {
  const now = '2026-08-20T12:00:00.000Z'
  const progress = createDefaultQuestProgress(now)
  for (const track of curriculumTracks) {
    progress.skillProgress[track.skillId] = createInitialSkillProgress(
      track.skillId,
      track.completionDifficulty,
      track.completionDifficulty - 1,
    )
  }
  window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
}

describe('simplified guided child journey', () => {
  test('renders the title and exactly the two approved Home navigation buttons', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: "Rory's Reading Quest" })).toBeTruthy()
    expect(getHomeButtons().map((button) => button.textContent?.trim())).toEqual([
      'Start Journey',
      'Parent Area',
    ])
  })

  test('keeps the whole journey visible as static, unfocusable progress landmarks', () => {
    render(<App />)

    const map = screen.getByRole('region', { name: 'Your Reading Journey' })
    expect(within(map).queryAllByRole('button')).toHaveLength(0)
    expect(within(map).queryAllByRole('link')).toHaveLength(0)
    expect(within(map).getByRole('article', { name: /Word Forge: You are here/i }).getAttribute('aria-current')).toBe('step')
    expect(within(map).getByRole('article', { name: /Story Scouts: Up Next/i })).toBeTruthy()
    expect(within(map).getByText('Poetry Planet')).toBeTruthy()
    expect(within(map).getByText('Information Detectives')).toBeTruthy()
    expect(within(map).getByText('Context Cavern')).toBeTruthy()
    expect(within(map).getByText('Compare Castle')).toBeTruthy()
    within(map).getAllByRole('article').forEach((card) => {
      expect(card.getAttribute('tabindex')).toBeNull()
    })
  })

  test('world-card text cannot navigate or activate a selection route', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Story Scouts'))
    fireEvent.keyDown(screen.getByText('Story Scouts'), { key: 'Enter' })
    expect(screen.getByRole('heading', { name: "Rory's Reading Quest" })).toBeTruthy()
    expect(screen.queryByText(/Skills trained/i)).toBeNull()
    expect(screen.queryByText(/Unit Selection/i)).toBeNull()
  })

  test('fresh Start Journey launches Word Forge directly with no selection or preview route', () => {
    const progress = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    const planned = planGlobalQuest({
      progress,
      availableLessons: getLessonCandidates(),
      now: '2026-08-20T12:00:00.000Z',
    })
    expect(planned.lesson?.worldId).toBe('word-forge')
    const lesson = getLessonById(planned.lesson!.lessonId).lesson!

    render(<App />)
    startJourney()

    expect(screen.getByRole('heading', { name: lesson.lessonTitle })).toBeTruthy()
    expect(screen.queryByText(/Skills trained|Unit Selection|Ready when you are/i)).toBeNull()
  })

  test('completed Word Forge moves Start Journey directly to Story Scouts', () => {
    const progress = seedWordForgeComplete()
    const planned = planGlobalQuest({
      progress,
      availableLessons: getLessonCandidates(),
      now: '2026-08-20T12:00:00.000Z',
    })
    expect(planned.lesson?.worldId).toBe('story-scouts')
    const lesson = getLessonById(planned.lesson!.lessonId).lesson!

    render(<App />)
    startJourney()

    expect(screen.getByRole('heading', { name: lesson.lessonTitle })).toBeTruthy()
    expect(screen.queryByText(/Unit Selection|Ready when you are/i)).toBeNull()
  })

  test('lesson answer controls remain interactive and feedback remains supportive', () => {
    render(<App />)
    startJourney()

    fireEvent.click(screen.getByRole('radio', { name: /leaf/i }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    expect(screen.getByText(/Great clue-finding!/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Next Question/i })).toBeTruthy()
  })

  test('Parent Area setup, lock, and return preserve the simplified Home', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Parent Area' }))
    expect(screen.getByRole('heading', { name: /Set Up Parent Area/i })).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Create Parent PIN/i), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText(/Confirm Parent PIN/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /Create Parent PIN/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Parent Area/i })).toBeTruthy())
    expect(screen.getByRole('navigation', { name: /Parent dashboard views/i })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Lock Parent Area/i }))
    expect(screen.getByRole('heading', { name: /Unlock Parent Area/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    expect(getHomeButtons().map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
  })

  test('returning parent access still verifies the saved PIN', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Parent Area' }))
    fireEvent.change(screen.getByLabelText(/Create Parent PIN/i), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText(/Confirm Parent PIN/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /Create Parent PIN/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Parent Area/i })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Parent Area' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Unlock Parent Area/i })).toBeTruthy())
    fireEvent.change(screen.getByLabelText(/Parent PIN/i), { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/PIN did not match/i))
  })

  test('parent crypto failures do not block Start Journey', () => {
    parentCryptoSupported = false
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Parent Area' }))
    expect(screen.getByText(/Secure local PIN setup is not available/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    startJourney()
    expect(screen.getByText(/Question 1 of 7/i)).toBeTruthy()
  })

  test('parent storage failures do not damage or block child progress', () => {
    const originalGetItem = Storage.prototype.getItem
    const originalSetItem = Storage.prototype.setItem
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key: string) {
      if (key === PARENT_ACCESS_STORAGE_KEY || key === PARENT_RECORDS_STORAGE_KEY) throw new Error('parent storage blocked')
      return originalGetItem.call(this, key)
    })
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === PARENT_ACCESS_STORAGE_KEY || key === PARENT_RECORDS_STORAGE_KEY) throw new Error('parent storage blocked')
      return originalSetItem.call(this, key, value)
    })

    try {
      render(<App />)
      startJourney()
      expect(screen.getByText(/Question 1 of 7/i)).toBeTruthy()
    } finally {
      getItemSpy.mockRestore()
      setItemSpy.mockRestore()
    }
  })

  test('content-needed progression exposes exactly one Back Home action', () => {
    render(
      <ProgressionOutcomeScreen
        outcome={{
          kind: 'CONTENT_NEEDED',
          earnedXp: 0,
          earnedStars: 0,
          currentDifficulty: 1,
          completionId: 'content-needed-test',
          nextQuest: {
            status: 'content_needed',
            purpose: 'progression',
            skillId: 'g2-word-forge-word-practice',
            difficulty: 1,
            reason: 'More guided quests are being prepared.',
          },
          curriculumComplete: false,
        }}
        onContinueJourney={() => {}}
        onBackHome={() => {}}
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Back Home' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Return to Map|Continue Journey/i })).toBeNull()
  })

  test('full curriculum completion survives reload and returning Home without relaunching a lesson', () => {
    seedAllAuthoredCurriculumComplete()
    render(<App />)

    startJourney()
    expect(screen.getByRole('heading', { name: 'Grade 3 Journey Complete!' })).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Back Home' }))

    expect(getHomeButtons().map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
    startJourney()
    expect(screen.getByRole('heading', { name: 'Grade 3 Journey Complete!' })).toBeTruthy()
    expect(screen.queryByText(/Question 1 of/i)).toBeNull()
  })

  test('saved rewards and progress load without a schema migration', () => {
    const progress = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    progress.totalXp = 125
    progress.totalStars = 7
    progress.skillProgress['g2-story-scouts-prose'] = createInitialSkillProgress('g2-story-scouts-prose', 1, 0)
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progress))

    render(<App />)
    expect(screen.getByLabelText('125 experience points')).toBeTruthy()
    expect(screen.getByLabelText('7 stars earned')).toBeTruthy()
    expect(screen.queryByText(/failed|failure|bad reader|wrong level|behind/i)).toBeNull()
  })

  test('both Home actions expose visible keyboard focus', () => {
    render(<App />)
    getHomeButtons().forEach((button) => {
      button.focus()
      expect(document.activeElement).toBe(button)
    })
  })
})
