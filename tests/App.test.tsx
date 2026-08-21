import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import App from '../src/App'
import { QUEST_PROGRESS_STORAGE_KEY, createDefaultQuestProgress } from '../src/persistence'
import { PARENT_ACCESS_STORAGE_KEY, PARENT_RECORDS_STORAGE_KEY } from '../src/persistence'
import * as parentAccess from '../src/services/parentAccess'
import type { ParentPinRecord } from '../src/services/parentAccess'

let parentCryptoSupported = true

vi.spyOn(parentAccess, 'createBrowserParentPinService').mockImplementation(() => ({
  isSupported: () => parentCryptoSupported,
  async setupPin({ pin, confirmPin }: { pin: string; confirmPin: string }, now = '2026-08-20T12:00:00.000Z') {
    if (!parentCryptoSupported) {
      return { status: 'unavailable', reason: 'Secure local PIN setup is not available in this browser.' }
    }
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
    if (!parentCryptoSupported) {
      return { status: 'unavailable', reason: 'Secure local PIN setup is not available in this browser.' }
    }
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

const getSingleByRole = (
  role: Parameters<typeof screen.getAllByRole>[0],
  name: string | RegExp,
) => {
  const matches = screen.getAllByRole(role as Parameters<typeof screen.getAllByRole>[0], {
    name,
  })
  expect(matches).toHaveLength(1)
  return matches[0] as HTMLElement
}

const getWordForgeCard = () => getSingleByRole('button', /Word Forge world - Available/i)
const getLockedCard = () => getSingleByRole('button', /Context Cavern world - Locked/i)
const getPoetryCard = () => getSingleByRole('button', /Poetry Planet world - Coming Later/i)
const getContinueButton = () => getSingleByRole('button', /Continue Quest/i)
const getOpenParentButton = () => getSingleByRole('button', /Grown-Up Area/i)

function seedWordForgeDifficulty(difficulty: number) {
  const progress = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
  progress.skillProgress['g2-word-forge-word-practice'].currentDifficulty = difficulty
  window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
}

describe('Phase 2 lesson flow and child shell', () => {
  test('renders home title', () => {
    render(<App />)

    const appTitle = screen.getAllByRole('heading', { name: /Rory's Reading Quest/i })
    expect(appTitle).toHaveLength(1)
  })

  test('shows world map with all curriculum worlds', () => {
    render(<App />)

    expect(screen.getAllByRole('heading', { name: /Curriculum Worlds/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Word Forge world - Available/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Story Scouts world - Coming Later/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Information Detectives world - Coming Later/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Poetry Planet world - Coming Later/i })).toHaveLength(1)
  })

  test('shows Word Forge as available world', () => {
    render(<App />)

    const worldCard = getWordForgeCard()
    expect(worldCard.getAttribute('disabled')).toBeNull()
  })

  test('shows the current learning focus without a Word Forge-only fallback', () => {
    render(<App />)

    expect(screen.getByText(/Current path: Word Forge Foundations Trail 1/i)).toBeTruthy()
  })

  test('locked world cannot launch a unit screen', () => {
    render(<App />)

    const lockedCard = getLockedCard()
    expect(lockedCard.getAttribute('disabled')).not.toBeNull()

    fireEvent.click(lockedCard)
    const appTitle = screen.getAllByRole('heading', { name: /Rory's Reading Quest/i })
    expect(appTitle).toHaveLength(1)
  })

  test('opens world screen from Word Forge', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    expect(screen.getAllByRole('heading', { name: /^Word Forge$/i })).toHaveLength(1)
    expect(screen.getByText(/Skills trained/i)).toBeTruthy()
  })

  test('renders unit cards in unit selection', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    expect(screen.getAllByRole('heading', { name: /Word Forge: Unit Selection/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Vowel Voyage Available/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Syllable Summit Locked/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Prefix Power Locked/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Suffix Station Locked/i })).toHaveLength(1)
  })

  test('shows Trail 4 Syllable Summit when the current difficulty reaches 4', async () => {
    seedWordForgeDifficulty(4)
    render(<App />)

    await waitFor(() => expect(screen.getByText(/Current path: Word Forge Foundations Trail 4/i)).toBeTruthy())
    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))

    expect(screen.getAllByRole('button', { name: /Syllable Summit Available/i })).toHaveLength(1)
    expect(within(screen.getByRole('button', { name: /Syllable Summit Available/i })).getByText(/Trail 4/i)).toBeTruthy()
    expect(screen.getByText(/consonant-le syllables and syllable review/i)).toBeTruthy()
  })

  test('shows Prefix Power as available when the current difficulty reaches 5', async () => {
    seedWordForgeDifficulty(5)
    render(<App />)

    await waitFor(() => expect(screen.getByText(/Current path: Word Forge Foundations Trail 5/i)).toBeTruthy())
    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))

    expect(screen.getAllByRole('button', { name: /Syllable Summit (Complete|Review)/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Prefix Power Available/i })).toHaveLength(1)
    expect(within(screen.getByRole('button', { name: /Prefix Power Available/i })).getByText(/Trail 5/i)).toBeTruthy()
    expect(screen.getByText(/common prefixes and base words/i)).toBeTruthy()
  })

  test('shows Suffix Station as available when the current difficulty reaches 6', async () => {
    seedWordForgeDifficulty(6)
    render(<App />)

    await waitFor(() => expect(screen.getByText(/Current path: Word Forge Foundations Trail 6/i)).toBeTruthy())
    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))

    expect(screen.getAllByRole('button', { name: /Suffix Station Available/i })).toHaveLength(1)
    expect(within(screen.getByRole('button', { name: /Suffix Station Available/i })).getByText(/Trail 6/i)).toBeTruthy()
    expect(screen.getByText(/common suffixes and ending sounds/i)).toBeTruthy()
  })

  test('shows Suffix Station as complete or review when the current difficulty reaches 7', () => {
    seedWordForgeDifficulty(7)
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))

    expect(screen.getAllByRole('button', { name: /Suffix Station (Complete|Review)/i })).toHaveLength(1)
    expect(screen.getByText(/New Word Forge quests are being prepared/i)).toBeTruthy()
  })

  test('shows Quiet Letter Quest as locked before difficulty 7 with readable guidance', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))

    expect(screen.getAllByRole('button', { name: /Quiet Letter Quest Locked/i })).toHaveLength(1)
    expect(screen.getByText(/Complete Suffix Station to unlock Quiet Letter Quest/i)).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /Fluency Flight Locked/i })).toHaveLength(1)
    expect(screen.getByText(/Complete Quiet Letter Quest to unlock Fluency Flight/i)).toBeTruthy()
  })

  test('shows Quiet Letter Quest as a locked preview at difficulty 7', async () => {
    seedWordForgeDifficulty(7)
    render(<App />)

    await waitFor(() => expect(screen.getByText(/Current path: Word Forge Foundations Trail 7/i)).toBeTruthy())
    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))

    const quietLetterQuest = screen.getByRole('button', { name: /Quiet Letter Quest Available/i })
    expect(quietLetterQuest).toBeTruthy()
    expect(within(quietLetterQuest).getByText(/Trail 7/i)).toBeTruthy()
    expect(screen.getByText(/silent-letter combinations and careful blending/i)).toBeTruthy()

    fireEvent.click(quietLetterQuest)
    expect(screen.getByRole('heading', { name: /Quiet Letter Quest/i })).toBeTruthy()
    expect(screen.getByText(/This quest is almost ready; we can open the lesson route in a later phase\./i)).toBeTruthy()
    expect(screen.getByText(/This quest is not available yet/i)).toBeTruthy()
    expect(screen.getByText(/Complete Suffix Station to unlock Quiet Letter Quest/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Start Quest/i })).toBeNull()
  })

  test('shows Quiet Letter Quest as complete or review at difficulty 8 and keeps Fluency Flight locked', async () => {
    seedWordForgeDifficulty(8)
    render(<App />)

    await waitFor(() => expect(screen.getByText(/Current path: Word Forge Foundations Trail 8/i)).toBeTruthy())
    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))

    expect(screen.getAllByRole('button', { name: /Quiet Letter Quest (Complete|Review)/i })).toHaveLength(1)
    expect(screen.getByText(/Review silent-letter combinations and careful blending/i)).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /Fluency Flight Available/i })).toHaveLength(1)
    expect(screen.getByText(/Fluency Practice/i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Quiet Letter Quest (Complete|Review)/i }))
    expect(screen.getByRole('heading', { name: /Quiet Letter Quest/i })).toBeTruthy()
    expect(screen.getByText(/This quest is almost ready; we can open the lesson route in a later phase\./i)).toBeTruthy()
    expect(screen.getByText(/This quest is not available yet/i)).toBeTruthy()
    expect(screen.getByText(/Complete Suffix Station to unlock Quiet Letter Quest/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Start Quest/i })).toBeNull()
  })

  test('shows Trail 5 Prefix Power as a locked preview at difficulty 5', async () => {
    seedWordForgeDifficulty(5)
    render(<App />)

    await waitFor(() => expect(screen.getByText(/Current path: Word Forge Foundations Trail 5/i)).toBeTruthy())
    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Prefix Power Available/i }))
    expect(screen.getByRole('heading', { name: /Prefix Power/i })).toBeTruthy()
    expect(screen.getByText(/This quest is almost ready; we can open the lesson route in a later phase\./i)).toBeTruthy()
    expect(screen.getByText(/This quest is not available yet/i)).toBeTruthy()
    expect(screen.getByText(/Complete Syllable Summit to unlock Prefix Power/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Start Quest/i })).toBeNull()
  })

  test('opens lesson-ready screen from an available unit', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))

    expect(screen.getAllByRole('heading', { name: /Vowel Voyage/i })).toHaveLength(1)
    expect(screen.getByText(/Potential reward: up to 3 stars/i)).toBeTruthy()
  })

  test('shows Trail 4 Syllable Summit as a locked preview at difficulty 4', async () => {
    seedWordForgeDifficulty(4)
    render(<App />)

    await waitFor(() => expect(screen.getByText(/Current path: Word Forge Foundations Trail 4/i)).toBeTruthy())
    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Syllable Summit Available/i }))
    expect(screen.getByRole('heading', { name: /Syllable Summit/i })).toBeTruthy()
    expect(screen.getByText(/This quest is almost ready; we can open the lesson route in a later phase\./i)).toBeTruthy()
    expect(screen.getByText(/This quest is not available yet/i)).toBeTruthy()
    expect(screen.getByText(/Complete Vowel Voyage to unlock Syllable Summit/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Start Quest/i })).toBeNull()
  })

  test('shows Trail 6 Suffix Station as a locked preview at difficulty 6', async () => {
    seedWordForgeDifficulty(6)
    render(<App />)

    await waitFor(() => expect(screen.getByText(/Current path: Word Forge Foundations Trail 6/i)).toBeTruthy())
    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Suffix Station Available/i }))
    expect(screen.getByRole('heading', { name: /Suffix Station/i })).toBeTruthy()
    expect(screen.getByText(/This quest is almost ready; we can open the lesson route in a later phase\./i)).toBeTruthy()
    expect(screen.getByText(/This quest is not available yet/i)).toBeTruthy()
    expect(screen.getByText(/Complete Prefix Power to unlock Suffix Station/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Start Quest/i })).toBeNull()
  })

  test('shows Trail 7 Quiet Letter Quest as a locked preview at difficulty 7', async () => {
    seedWordForgeDifficulty(7)
    render(<App />)

    await waitFor(() => expect(screen.getByText(/Current path: Word Forge Foundations Trail 7/i)).toBeTruthy())
    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Quiet Letter Quest Available/i }))
    expect(screen.getByRole('heading', { name: /Quiet Letter Quest/i })).toBeTruthy()
    expect(screen.getByText(/This quest is almost ready; we can open the lesson route in a later phase\./i)).toBeTruthy()
    expect(screen.getByText(/This quest is not available yet/i)).toBeTruthy()
    expect(screen.getByText(/Complete Suffix Station to unlock Quiet Letter Quest/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Start Quest/i })).toBeNull()
  })

  test('starts the Word Forge lesson run and shows the first question', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))
    fireEvent.click(screen.getByRole('button', { name: /Start Quest/i }))

    expect(screen.getByRole('heading', { name: /Vowel Voyage/i })).toBeTruthy()
    expect(screen.getByText(/Question 1 of 7/i)).toBeTruthy()
    const submitButton = getSingleByRole('button', /Submit Answer/i)
    expect(submitButton.getAttribute('disabled')).not.toBeNull()
  })

  test('can answer one question and remain child-safe', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))
    fireEvent.click(screen.getByRole('button', { name: /Start Quest/i }))

    const firstChoice = screen.getByRole('radio', { name: /leaf/i })
    fireEvent.click(firstChoice)

    const submitButton = getSingleByRole('button', /Submit Answer/i)
    expect(submitButton.getAttribute('disabled')).toBeNull()
    fireEvent.click(submitButton)
    expect(screen.getByText(/Great clue-finding!/i)).toBeTruthy()
    expect(screen.getByText(/Leaf has the ea sound like leaf/i)).toBeTruthy()
    const nextButton = getSingleByRole('button', /Next Question/i)
    fireEvent.click(nextButton)
    expect(screen.getByText(/Question 2 of 7/i)).toBeTruthy()
  })

  test('unavailable lesson units show safe read-only state and no launch button', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    const lockedUnit = screen.getByRole('button', { name: /Syllable Summit Locked/i })
    expect(lockedUnit.getAttribute('disabled')).not.toBeNull()
    fireEvent.click(lockedUnit)
    expect(screen.getAllByRole('heading', { name: /Word Forge: Unit Selection/i })).toHaveLength(1)
  })

  test('returns from lesson-ready screen using back navigation', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))
    fireEvent.click(screen.getByRole('button', { name: /Back/i }))

    expect(screen.getAllByRole('heading', { name: /Word Forge: Unit Selection/i })).toHaveLength(1)
  })

  test('shows parent setup on first visit, then unlocks and locks again', async () => {
    render(<App />)

    fireEvent.click(getOpenParentButton())
    expect(screen.getByRole('heading', { name: /Set Up Parent Area/i })).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Create Parent PIN/i), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText(/Confirm Parent PIN/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /Create Parent PIN/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Parent Area/i })).toBeTruthy())
    expect(screen.getByRole('navigation', { name: /Parent dashboard views/i })).toBeTruthy()
    expect(screen.getByText(/^Completed sessions$/i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Lock Parent Area/i }))
    expect(screen.getByRole('heading', { name: /Unlock Parent Area/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    expect(screen.getAllByRole('heading', { name: /Rory's Reading Quest/i })).toHaveLength(1)
  })

  test('returning visit shows PIN verification and incorrect PIN stays generic', async () => {
    render(<App />)

    fireEvent.click(getOpenParentButton())
    fireEvent.change(screen.getByLabelText(/Create Parent PIN/i), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText(/Confirm Parent PIN/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /Create Parent PIN/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Parent Area/i })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    fireEvent.click(getOpenParentButton())

    await waitFor(() => expect(screen.getByRole('heading', { name: /Unlock Parent Area/i })).toBeTruthy())
    fireEvent.change(screen.getByLabelText(/Parent PIN/i), { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(/The PIN did not match/i);
    })
    fireEvent.change(screen.getByLabelText(/Parent PIN/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Parent Area/i })).toBeTruthy())
  })

  test('crypto unavailable shows a calm parent-facing notice and child gameplay still works', () => {
    parentCryptoSupported = false
    render(<App />)

    fireEvent.click(getOpenParentButton())
    expect(screen.getByText(/Secure local PIN setup is not available in this browser/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Back to Quest/i }))
    expect(screen.getAllByRole('heading', { name: /Rory's Reading Quest/i })).toHaveLength(1)
  })

  test('parent storage errors do not damage child progress', () => {
    const originalGetItem = Storage.prototype.getItem
    const originalSetItem = Storage.prototype.setItem
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key: string) {
      if (key === PARENT_ACCESS_STORAGE_KEY || key === PARENT_RECORDS_STORAGE_KEY) {
        throw new Error('parent storage blocked')
      }
      return originalGetItem.call(this, key)
    })
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === PARENT_ACCESS_STORAGE_KEY || key === PARENT_RECORDS_STORAGE_KEY) {
        throw new Error('parent storage blocked')
      }
      return originalSetItem.call(this, key, value)
    })

    try {
      render(<App />)
      fireEvent.click(getWordForgeCard())
      fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
      fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))
      fireEvent.click(screen.getByRole('button', { name: /Start Quest/i }))
      expect(screen.getByRole('heading', { name: /Vowel Voyage/i })).toBeTruthy()
    } finally {
      getItemSpy.mockRestore()
      setItemSpy.mockRestore()
    }
  })

  test('shows accessible reward and progress labels', () => {
    render(<App />)

    expect(screen.getAllByRole('region', { name: /Quest rewards/i })).toHaveLength(1)
    expect(screen.getByLabelText(/120 experience points/i)).toBeTruthy()
    expect(screen.getByLabelText(/8 stars earned/i)).toBeTruthy()
    expect(screen.getByLabelText(/Quest streak 0 sessions/i)).toBeTruthy()
  })

  test('does not show forbidden failure wording', () => {
    render(<App />)

    expect(screen.queryByText(/failed/i)).toBeNull()
    expect(screen.queryByText(/failure/i)).toBeNull()
    expect(screen.queryByText(/wrong level/i)).toBeNull()
    expect(screen.queryByText(/behind/i)).toBeNull()
    expect(screen.queryByText(/bad/i)).toBeNull()
  })

  test('supports keyboard focus on primary actions', () => {
    render(<App />)

    const continueButton = getContinueButton()
    continueButton.focus()
    fireEvent.keyDown(continueButton, { key: 'Enter', code: 'Enter' })

    expect(document.activeElement).toBe(continueButton)
  })

  test('uses visible focus styles on controls', () => {
    render(<App />)

    const continueButton = getContinueButton()
    continueButton.focus()
    expect(document.activeElement).toBe(continueButton)
  })

  test('locks unavailable worlds with non-available state', () => {
    render(<App />)

    const comingSoon = getPoetryCard()
    const locked = getLockedCard()

    expect(comingSoon.getAttribute('disabled')).not.toBeNull()
    expect(locked.getAttribute('disabled')).not.toBeNull()
  })
})
