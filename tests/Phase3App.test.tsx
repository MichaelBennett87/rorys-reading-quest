import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { getLessonById, getLessonCandidates } from '../src/domain/lesson'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  createActiveLessonSession,
  createDefaultQuestProgress,
  type QuestProgressV1,
} from '../src/persistence'

afterEach(() => {
  cleanup()
  window.localStorage.removeItem(QUEST_PROGRESS_STORAGE_KEY)
})

function launchJourney() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
}

function submitAndAdvance(final = false) {
  fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
  fireEvent.click(screen.getByRole('button', { name: final ? /See Quest Complete/i : /Next Question/i }))
}

function answerCurrentQuestion(correct = true) {
  const table = screen.queryByRole('region', { name: /table matching question/i })
  if (table) {
    const select = within(table).getByRole('combobox')
    const values = Array.from(select.querySelectorAll('option[value]'))
      .map((option) => option.getAttribute('value') ?? '')
      .filter(Boolean)
    const prompt = (select as HTMLSelectElement).labels?.[0]?.textContent ?? ''
    const correctValue = /leaf/i.test(prompt) ? 'leaf-sound'
      : /boot/i.test(prompt) ? 'boot-sound'
      : 'beach-sound'
    fireEvent.change(select, { target: { value: correct ? correctValue : values.find((value) => value !== correctValue) ?? values[0] } })
    return
  }

  const group = screen.getByRole('group')
  const prompt = group.querySelector('legend')?.textContent ?? ''
  const radios = within(group).queryAllByRole('radio')
  if (radios.length > 0) {
    if (/dream, the green branch, and the little pond/i.test(prompt)) {
      fireEvent.click(within(group).getByRole('radio', { name: /They wrote about a dream, a green branch, and a little pond/i }))
    } else if (/food tasted good/i.test(prompt)) {
      fireEvent.click(within(group).getByRole('radio', { name: /The food tasted good, and the room felt bright/i }))
    } else if (/beach path/i.test(prompt)) {
      fireEvent.click(within(group).getByRole('radio', { name: /A spoon of soil helped one seed sprout near the beach path/i }))
    } else {
      fireEvent.click(radios[correct ? 0 : 1])
    }
    return
  }

  const checkboxes = within(group).getAllByRole('checkbox')
  const passage = screen.getByRole('heading', { name: /Reading Passage/i }).parentElement?.textContent ?? ''
  let correctCount = 1
  if (/Choose all the ea words/i.test(prompt)) correctCount = /pool party/i.test(passage) ? 2 : 4
  if (/Choose all the oo words/i.test(prompt)) correctCount = /garden morning/i.test(passage) ? 3 : 2
  checkboxes.slice(0, correct ? correctCount : 1).forEach((choice) => fireEvent.click(choice))
}

function completeCheckpoint(correct = true) {
  for (let index = 0; index < 7; index += 1) {
    answerCurrentQuestion(correct || index > 1)
    submitAndAdvance(index === 6)
  }
}

function readProgress(): QuestProgressV1 {
  return JSON.parse(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY) ?? 'null') as QuestProgressV1
}

describe('guided adaptive child flow', () => {
  test('a completed quest reaches one-action progression with no map return', () => {
    launchJourney()
    completeCheckpoint()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))

    expect(screen.getByRole('heading', { name: /Almost There/i })).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Continue Journey' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Return to Map/i })).toBeNull()
    expect(readProgress().completedAttempts).toHaveLength(1)
  }, 10_000)

  test('Continue Journey launches the planner-selected fresh lesson directly', () => {
    launchJourney()
    completeCheckpoint()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue Journey' }))

    expect(screen.getByRole('heading', { name: /Pool Party Quest/i })).toBeTruthy()
    expect(screen.queryByText(/Unit Selection|Ready when you are|Return to Map/i)).toBeNull()
  }, 10_000)

  test('partial performance keeps automatic same-level guidance', () => {
    launchJourney()
    completeCheckpoint(false)
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Training Round/i })).toBeTruthy()
    expect(readProgress().skillProgress['g2-word-forge-word-practice'].currentDifficulty).toBe(1)
  })

  test('Save and Exit returns Home while preserving and resuming the active lesson', () => {
    launchJourney()
    fireEvent.click(screen.getByRole('button', { name: /Save and Exit/i }))

    expect(screen.getByRole('heading', { name: "Rory's Reading Quest" })).toBeTruthy()
    expect(readProgress().activeLessonSession).not.toBeNull()
    expect(readProgress().completedAttempts).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(screen.getByRole('heading', { name: /Vowel Voyage: Tree Study Quest/i })).toBeTruthy()
  })

  test('a submitted answer resumes at its feedback boundary after reload', () => {
    launchJourney()
    fireEvent.click(screen.getByRole('radio', { name: /leaf/i }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    cleanup()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(screen.getByText(/Great clue-finding/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Next Question/i })).toBeTruthy()
  })

  test('an existing active lesson always resumes before a stored fresh plan', () => {
    const state = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    const candidates = getLessonCandidates()
    const activeLesson = getLessonById(candidates[0].lessonId).lesson!
    const otherLesson = candidates.find((candidate) => candidate.lessonId !== activeLesson.lessonId)!
    state.activeLessonSession = createActiveLessonSession(activeLesson, 'guided-active-session', '2026-08-20T12:00:00.000Z')
    state.plannedNextQuest = { status: 'available', purpose: 'progression', lesson: otherLesson }
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(screen.getByRole('heading', { name: activeLesson.lessonTitle })).toBeTruthy()
    expect(readProgress().activeLessonSession?.lessonId).toBe(activeLesson.lessonId)
  })

  test('saved schema-version-1 progress opens the live guided quest without migration loss', () => {
    const state = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    state.totalXp = 90
    state.totalStars = 3
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
    render(<App />)

    expect(screen.getByLabelText('90 experience points')).toBeTruthy()
    expect(screen.getByLabelText('3 stars earned')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(screen.getByRole('heading', { name: /Vowel Voyage: Tree Study Quest/i })).toBeTruthy()
  })

  test('an incompatible active session recovers safely to a fresh guided quest', () => {
    const state = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    const candidate = getLessonCandidates()[0]
    state.activeLessonSession = {
      sessionId: 'old-session',
      lessonId: candidate.lessonId,
      activityId: candidate.activityId,
      contentVersion: 'old-version',
      skillId: candidate.skillId,
      difficulty: candidate.difficulty,
      currentQuestionIndex: 0,
      submittedQuestions: [],
      assistanceEvents: [],
      startedAt: '2026-08-20T12:00:00.000Z',
      updatedAt: '2026-08-20T12:00:00.000Z',
    }
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(screen.getByText(/Question 1 of 7/i)).toBeTruthy()
  })

  test('double completion interaction remains idempotent', () => {
    launchJourney()
    completeCheckpoint()
    const continueButton = screen.getByRole('button', { name: /Continue Quest/i })
    fireEvent.click(continueButton)
    fireEvent.click(continueButton)
    expect(readProgress().completedAttempts).toHaveLength(1)
    expect(readProgress().completedSessionCount).toBe(1)
  })
})
