import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'

afterEach(() => {
  cleanup()
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
    expect(screen.getAllByRole('button', { name: /Story Scouts world - Available/i })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Poetry Planet world - Coming Later/i })).toHaveLength(1)
  })

  test('shows Word Forge as available world', () => {
    render(<App />)

    const worldCard = getWordForgeCard()
    expect(worldCard.getAttribute('disabled')).toBeNull()
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
    expect(screen.getAllByRole('button', { name: /Syllable Summit Available/i })).toHaveLength(1)
  })

  test('opens lesson-ready screen from an available unit', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))

    expect(screen.getAllByRole('heading', { name: /Vowel Voyage/i })).toHaveLength(1)
    expect(screen.getByText(/Potential reward: up to 3 stars/i)).toBeTruthy()
  })

  test('starts the Word Forge lesson run and shows the first question', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))
    fireEvent.click(screen.getByRole('button', { name: /Start Quest/i }))

    expect(screen.getByRole('heading', { name: /Vowel Voyage/i })).toBeTruthy()
    expect(screen.getByText(/Question 1 of 10/i)).toBeTruthy()
    const submitButton = getSingleByRole('button', /Submit Answer/i)
    expect(submitButton.getAttribute('disabled')).not.toBeNull()
  })

  test('can answer one question and remain child-safe', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))
    fireEvent.click(screen.getByRole('button', { name: /Start Quest/i }))

    const firstChoice = screen.getByRole('radio', { name: /Packing her kite bag and checking the wind/i })
    fireEvent.click(firstChoice)

    const submitButton = getSingleByRole('button', /Submit Answer/i)
    expect(submitButton.getAttribute('disabled')).toBeNull()
    fireEvent.click(submitButton)
    expect(screen.getByText(/Great clue-finding!/i)).toBeTruthy()
    expect(screen.getByText(/She packed her kite bag/i)).toBeTruthy()
    const nextButton = getSingleByRole('button', /Next Question/i)
    fireEvent.click(nextButton)
    expect(screen.getByText(/Question 2 of 10/i)).toBeTruthy()
  })

  test('unavailable lesson units show safe read-only state and no launch button', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Syllable Summit Available/i }))
    expect(screen.getByText(/This quest is not available yet/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Start Quest/i })).toBeNull()
  })

  test('returns from lesson-ready screen using back navigation', () => {
    render(<App />)

    fireEvent.click(getWordForgeCard())
    fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))
    fireEvent.click(screen.getByRole('button', { name: /Back/i }))

    expect(screen.getAllByRole('heading', { name: /Word Forge: Unit Selection/i })).toHaveLength(1)
  })

  test('opens and closes parent placeholder', () => {
    render(<App />)

    fireEvent.click(getOpenParentButton())
    expect(screen.getByText(/Parent dashboard is not implemented yet/i)).toBeTruthy()
    fireEvent.click(getSingleByRole('button', /Back to Quest/i))
    expect(screen.getAllByRole('heading', { name: /Rory's Reading Quest/i })).toHaveLength(1)
  })

  test('shows accessible reward and progress labels', () => {
    render(<App />)

    expect(screen.getAllByRole('region', { name: /Quest rewards/i })).toHaveLength(1)
    expect(screen.getByLabelText(/120 experience points/i)).toBeTruthy()
    expect(screen.getByLabelText(/8 stars earned/i)).toBeTruthy()
    expect(screen.getByLabelText(/Quest streak 3 sessions/i)).toBeTruthy()
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
