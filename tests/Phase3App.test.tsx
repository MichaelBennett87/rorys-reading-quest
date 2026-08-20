import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { getLessonCandidates } from '../src/domain/lesson'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  createDefaultQuestProgress,
  type QuestProgressV1,
} from '../src/persistence'

afterEach(() => {
  cleanup()
  window.localStorage.removeItem(QUEST_PROGRESS_STORAGE_KEY)
})

function launchFromMap() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /Word Forge world - Available/i }))
  fireEvent.click(screen.getByRole('button', { name: /Open Unit Map/i }))
  fireEvent.click(screen.getByRole('button', { name: /Vowel Voyage Available/i }))
  fireEvent.click(screen.getByRole('button', { name: /Start Quest/i }))
}

function submitAndAdvance(final = false) {
  fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
  fireEvent.click(screen.getByRole('button', {
    name: final ? /See Quest Complete/i : /Next Question/i,
  }))
}

function completeKiteLesson(firstCorrect = true) {
  fireEvent.click(screen.getByRole('radio', {
    name: firstCorrect
      ? /Packing her kite bag and checking the wind/i
      : /Jumping twice into the air/i,
  }))
  submitAndAdvance()
  fireEvent.click(screen.getByRole('radio', { name: /Checking the wind and then stepping outside/i }))
  submitAndAdvance()
  fireEvent.click(screen.getByRole('checkbox', { name: /She asked her brother to hold the spool/i }))
  fireEvent.click(screen.getByRole('checkbox', { name: /He called out each number slowly/i }))
  submitAndAdvance()
  fireEvent.click(screen.getByRole('radio', { name: /Work safely with a team/i }))
  fireEvent.click(screen.getByRole('radio', {
    name: /She asked her brother to hold the spool and to call out each count slowly/i,
  }))
  submitAndAdvance(true)
}

function completeKiteLessonLow() {
  fireEvent.click(screen.getByRole('radio', { name: /Jumping twice into the air/i }))
  submitAndAdvance()
  fireEvent.click(screen.getByRole('radio', { name: /Holding the spool too hard/i }))
  submitAndAdvance()
  fireEvent.click(screen.getByRole('checkbox', { name: /She asked her brother to hold the spool/i }))
  fireEvent.click(screen.getByRole('checkbox', { name: /He called out each number slowly/i }))
  submitAndAdvance()
  fireEvent.click(screen.getByRole('radio', { name: /Work safely with a team/i }))
  fireEvent.click(screen.getByRole('radio', {
    name: /She asked her brother to hold the spool and to call out each count slowly/i,
  }))
  submitAndAdvance(true)
}

function completeSeedLesson(correct = true) {
  if (correct) {
    fireEvent.click(screen.getByRole('checkbox', {
      name: /She covered each cup with earth and smiled when each cup had a tiny label/i,
    }))
    fireEvent.click(screen.getByRole('checkbox', { name: /She wrote Day 1, Day 2, and Day 3 on the labels/i }))
  } else {
    fireEvent.click(screen.getByRole('checkbox', { name: /Nora and Maya planted seeds in three little cups/i }))
  }
  submitAndAdvance()
  const mappings = correct
    ? ['habit-planned', 'habit-tracked', 'habit-safe']
    : ['habit-observed', 'habit-skipped', 'habit-rush']
  screen.getAllByRole('combobox').forEach((select, index) => {
    fireEvent.change(select, { target: { value: mappings[index] } })
  })
  submitAndAdvance()
  fireEvent.click(screen.getByRole('checkbox', {
    name: correct ? /She planted three cups, not one/i : /She ran quickly to class/i,
  }))
  if (correct) {
    fireEvent.click(screen.getByRole('checkbox', { name: /She wrote Day 1, Day 2, and Day 3/i }))
  }
  submitAndAdvance(true)
}

function readProgress(): QuestProgressV1 {
  return JSON.parse(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY) ?? 'null') as QuestProgressV1
}

describe('Phase 3 adaptive child flow', () => {
  test('completing a strong lesson creates a supportive fresh-verification outcome', () => {
    launchFromMap()
    completeKiteLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Almost There/i })).toBeTruthy()
    expect(screen.getByText(/One fresh quest will prove this reading power is ready/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Start Fresh Quest/i })).toBeTruthy()
    expect(readProgress().completedAttempts).toHaveLength(1)
  })

  test('selects a fresh activity and a second distinct strong lesson unlocks the next trail', () => {
    launchFromMap()
    completeKiteLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    fireEvent.click(screen.getByRole('button', { name: /Start Fresh Quest/i }))
    expect(screen.getByRole('heading', { name: /Seed Clues/i })).toBeTruthy()
    completeSeedLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Trail Complete/i })).toBeTruthy()
    expect(screen.getByText(/You unlocked the next trail/i)).toBeTruthy()
    expect(readProgress().completedAttempts).toHaveLength(2)
  })

  test('partial performance remains on the same trail with training language', () => {
    launchFromMap()
    completeKiteLesson(false)
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Training Round/i })).toBeTruthy()
    expect(screen.getByText(/new quest will help this skill grow stronger/i)).toBeTruthy()
    expect(readProgress().skillProgress['g2-word-forge-word-practice'].currentDifficulty).toBe(1)
  })

  test('two consecutive low completions route to a supportive building-block mission', () => {
    launchFromMap()
    completeKiteLessonLow()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Try a New Route/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Start Fresh Quest/i }))
    completeSeedLesson(false)
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Power-Up Mission/i })).toBeTruthy()
    expect(screen.getByText(/building block to strengthen/i)).toBeTruthy()
  })

  test('persisted XP and stars appear after a reload', () => {
    launchFromMap()
    completeKiteLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    const state = readProgress()
    cleanup()
    render(<App />)
    expect(screen.getByLabelText(`${state.totalXp} experience points`)).toBeTruthy()
    expect(screen.getByLabelText(`${state.totalStars} stars earned`)).toBeTruthy()
  })

  test('a submitted active question resumes at its feedback boundary after reload', () => {
    launchFromMap()
    fireEvent.click(screen.getByRole('radio', { name: /Packing her kite bag and checking the wind/i }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    cleanup()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByText(/Great clue-finding/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Next Question/i })).toBeTruthy()
  })

  test('exiting before completion does not create a completed attempt', () => {
    launchFromMap()
    fireEvent.click(screen.getByRole('button', { name: /Exit Quest/i }))
    expect(readProgress().completedAttempts).toHaveLength(0)
  })

  test('double interaction at completion cannot duplicate an attempt or rewards', () => {
    launchFromMap()
    completeKiteLesson()
    const continueButton = screen.getByRole('button', { name: /Continue Quest/i })
    fireEvent.click(continueButton)
    fireEvent.click(continueButton)
    const state = readProgress()
    expect(state.completedAttempts).toHaveLength(1)
    expect(state.completedSessionCount).toBe(1)
  })

  test('no fresh content produces the friendly content-needed screen', () => {
    const state = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    const candidates = getLessonCandidates().filter((candidate) => candidate.difficulty === 1)
    state.skillProgress['g2-word-forge-word-practice'].recentActivityUsage = candidates.map((candidate) => ({
      ...candidate,
      completedAt: '2026-08-20T12:00:00.000Z',
    }))
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /More Quests Are Being Prepared/i })).toBeTruthy()
    expect(screen.getByText(/Your progress is safe/i)).toBeTruthy()
    expect(screen.queryByText(/failed|failure|bad reader|wrong level|behind/i)).toBeNull()
  })

  test('an incompatible active session returns safely to a fresh quest', () => {
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
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByText(/Question 1 of 4/i)).toBeTruthy()
  })
})
