import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import App from '../src/App'
import { curriculumTracks, planGlobalQuest } from '../src/domain/curriculum'
import { getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress } from '../src/domain/progression'
import {
  PARENT_ACCESS_STORAGE_KEY,
  PARENT_RECORDS_STORAGE_KEY,
  QUEST_PROGRESS_STORAGE_KEY,
  createDefaultQuestProgress,
  type QuestProgressV1,
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
  window.history.replaceState(null, '', '/')
  parentCryptoSupported = true
})

function readProgress(): QuestProgressV1 {
  return JSON.parse(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY) ?? 'null') as QuestProgressV1
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

function openParentRoute() {
  window.location.hash = '#/parent'
  fireEvent(window, new HashChangeEvent('hashchange'))
}

describe('question-first child journey', () => {
  test('opens directly into the first planner-selected question with no child navigation decisions', async () => {
    const progress = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    const planned = planGlobalQuest({
      progress,
      availableLessons: getLessonCandidates(),
      now: '2026-08-20T12:00:00.000Z',
    })
    expect(planned.status).toBe('available')

    render(<App />)

    expect(await screen.findByText(/Question 1 of 6/i)).toBeTruthy()
    expect(readProgress().activeLessonSession?.lessonId).toBe(planned.lesson?.lessonId)
    expect(screen.queryByRole('button', { name: /Start Journey|Parent Area|Save and Exit/i })).toBeNull()
    expect(screen.queryByRole('region', { name: /Your Reading Journey/i })).toBeNull()
    const action = screen.getByRole('region', { name: 'Question action' })
    expect(within(action).getAllByRole('button')).toHaveLength(1)
    expect(within(action).getByRole('button', { name: 'Check Answer' }).hasAttribute('disabled')).toBe(true)
  })

  test('does not render world cards, selectors, counters, or parent controls on the child route', async () => {
    render(<App />)

    expect(await screen.findByText(/Question 1 of 6/i)).toBeTruthy()

    expect(screen.queryByText(/Story Scouts|Poetry Planet|Information Detectives|Context Cavern|Compare Castle/i)).toBeNull()
    expect(screen.queryByText(/Unit Selection|World Selection|Skills trained|Ready when you are/i)).toBeNull()
    expect(screen.queryByLabelText(/experience points|stars earned/i)).toBeNull()
    expect(screen.queryByRole('button', { name: /Parent/i })).toBeNull()
  })

  test('fresh ordinary planning starts Story Scouts without requiring Word Forge completion', async () => {
    const progress = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    const planned = planGlobalQuest({
      progress,
      availableLessons: getLessonCandidates(),
      now: '2026-08-20T12:00:00.000Z',
    })
    expect(planned.lesson?.worldId).toBe('story-scouts')

    render(<App />)

    expect(await screen.findByText(/Question 1 of/i)).toBeTruthy()
    expect(readProgress().activeLessonSession?.lessonId).toBe(planned.lesson?.lessonId)
  })

  test('keeps one primary action while answer controls and supportive feedback remain available', async () => {
    render(<App />)
    fireEvent.click(await screen.findByRole('radio', { name: /Wind has spread wrappers and cans/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Check Answer' }).hasAttribute('disabled')).toBe(false))
    fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }))

    expect(await screen.findByText(/Great clue-finding!/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Next Question|See Quest Complete|Continue Journey/i })).toBeNull()
  })

  test('opening the parent bookmark does not create a child session', async () => {
    window.location.hash = '#/parent'
    render(<App />)

    expect(screen.getByRole('heading', { name: /Set Up Parent Area/i })).toBeTruthy()
    expect(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    await waitFor(() => expect(screen.getByText(/Question 1 of 6/i)).toBeTruthy())
    expect(readProgress().activeLessonSession).not.toBeNull()
  })

  test('the bookmarkable parent route stays PIN-gated and returning resumes the child session', async () => {
    render(<App />)
    await screen.findByText(/Question 1 of 6/i)
    const sessionId = readProgress().activeLessonSession?.sessionId
    openParentRoute()

    expect(screen.getByRole('heading', { name: /Set Up Parent Area/i })).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Create Parent PIN/i), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText(/Confirm Parent PIN/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /Create Parent PIN/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Parent Area/i })).toBeTruthy())
    expect(screen.getByRole('navigation', { name: /Parent dashboard views/i })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Lock Parent Area/i }))
    expect(screen.getByRole('heading', { name: /Unlock Parent Area/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    await waitFor(() => expect(screen.getByText(/Question 1 of 6/i)).toBeTruthy())
    expect(readProgress().activeLessonSession?.sessionId).toBe(sessionId)
  })

  test('returning parent access still verifies the saved PIN', async () => {
    window.location.hash = '#/parent'
    render(<App />)
    fireEvent.change(screen.getByLabelText(/Create Parent PIN/i), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText(/Confirm Parent PIN/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /Create Parent PIN/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Parent Area/i })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    await waitFor(() => expect(screen.getByText(/Question 1 of 6/i)).toBeTruthy())
    openParentRoute()
    await waitFor(() => expect(screen.getByRole('heading', { name: /Unlock Parent Area/i })).toBeTruthy())
    fireEvent.change(screen.getByLabelText(/Parent PIN/i), { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/PIN did not match/i))
  })

  test('parent crypto failures do not block automatic child reading', async () => {
    parentCryptoSupported = false
    window.location.hash = '#/parent'
    render(<App />)
    expect(screen.getByText(/Secure local PIN setup is not available/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    await waitFor(() => expect(screen.getByText(/Question 1 of 6/i)).toBeTruthy())
  })

  test('parent storage failures do not damage or block child progress', async () => {
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
      expect(await screen.findByText(/Question 1 of 6/i)).toBeTruthy()
      expect(readProgress().activeLessonSession).not.toBeNull()
    } finally {
      getItemSpy.mockRestore()
      setItemSpy.mockRestore()
    }
  })

  test('full curriculum completion is calm, accurate, and does not fabricate navigation', async () => {
    seedAllAuthoredCurriculumComplete()
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Grade 3 Journey Complete!' })).toBeTruthy()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryByText(/Question 1 of/i)).toBeNull()
    expect(readProgress().activeLessonSession).toBeNull()

    cleanup()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Grade 3 Journey Complete!' })).toBeTruthy()
    expect(readProgress().activeLessonSession).toBeNull()
  })

  test('saved rewards remain intact without appearing on the ordinary child surface', async () => {
    const progress = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    progress.totalXp = 125
    progress.totalStars = 7
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progress))

    render(<App />)
    await screen.findByText(/Question 1 of 6/i)
    expect(readProgress().totalXp).toBe(125)
    expect(readProgress().totalStars).toBe(7)
    expect(screen.queryByLabelText(/experience points|stars earned/i)).toBeNull()
    expect(screen.queryByText(/failed|failure|bad reader|wrong level|behind/i)).toBeNull()
  })

  test('answer controls and the single primary action expose keyboard focus', async () => {
    render(<App />)
    const answer = await screen.findByRole('radio', { name: /wrappers and cans/i })
    answer.focus()
    expect(document.activeElement).toBe(answer)
    fireEvent.click(answer)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Check Answer' }).hasAttribute('disabled')).toBe(false))
    const action = screen.getByRole('button', { name: 'Check Answer' })
    action.focus()
    expect(document.activeElement).toBe(action)
  })
})
