import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
  window.history.replaceState(null, '', '/')
})

async function launchJourney() {
  render(<App />)
  await screen.findByText(/Question \d+ of \d+/i)
}

async function submitAndAdvance() {
  await waitFor(() => expect(screen.getByRole('button', { name: /Check Answer/i }).hasAttribute('disabled')).toBe(false))
  fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }))
  fireEvent.click(await screen.findByRole('button', { name: /^Next$/i }))
  await screen.findByRole('button', { name: /Check Answer/i })
}

async function performDraftAction(action: () => void) {
  const previousRevision = readProgress().activeLessonSession?.checkpointRevision ?? 0
  action()
  await waitFor(() => {
    expect(readProgress().activeLessonSession?.checkpointRevision).toBe(previousRevision + 1)
  })
}

async function answerCurrentQuestion(correct = true) {
  const table = screen.queryByRole('region', { name: /table matching question/i })
  if (table) {
    const selects = within(table).getAllByRole('combobox')
    for (const [index, select] of selects.entries()) {
      const values = Array.from(select.querySelectorAll('option[value]'))
        .map((option) => option.getAttribute('value') ?? '')
        .filter(Boolean)
      await performDraftAction(() => {
        fireEvent.change(select, { target: { value: correct || index > 0 ? values[index] ?? values[0] : values[1] ?? values[0] } })
      })
    }
    return
  }

  const radios = screen.queryAllByRole('radio') as HTMLInputElement[]
  if (radios.length > 0) {
    const names = [...new Set(radios.map((radio) => radio.name))]
    for (const [index, name] of names.entries()) {
      const choices = radios.filter((radio) => radio.name === name)
      await performDraftAction(() => {
        fireEvent.click(choices[correct || index > 0 ? 0 : 1] ?? choices[0])
      })
    }
    return
  }

  const group = screen.getByRole('group')
  const checkboxes = within(group).getAllByRole('checkbox')
  const chooseCount = /Which two|Choose 2/i.test(group.textContent ?? '') ? 2 : 1
  for (const choice of checkboxes.slice(correct ? 0 : 2, correct ? chooseCount : 3)) {
    await performDraftAction(() => fireEvent.click(choice))
  }
  if (!correct && checkboxes.length > 0 && !checkboxes.some((choice) => (choice as HTMLInputElement).checked)) {
    await performDraftAction(() => fireEvent.click(checkboxes.at(-1)!))
  }
}

function currentQuestionCount(): number {
  const indicator = screen.getByText(/Question \d+ of \d+/i).textContent ?? ''
  const count = Number(indicator.match(/of (\d+)/i)?.[1])
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Could not read the current lesson question count from: ${indicator}`)
  }
  return count
}

async function completeCheckpoint(correct = true) {
  const questionCount = currentQuestionCount()
  for (let index = 0; index < questionCount; index += 1) {
    await answerCurrentQuestion(correct || index > 1)
    await submitAndAdvance()
  }
}

function readProgress(): QuestProgressV1 {
  return JSON.parse(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY) ?? 'null') as QuestProgressV1
}

describe('guided adaptive question-first flow', () => {
  test('a completed quest launches the next plan with no result or map detour', async () => {
    await launchJourney()
    await completeCheckpoint()

    expect(screen.getByText(/Question 1 of/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Continue Quest|Continue Journey|Return to Map/i })).toBeNull()
    expect(screen.getByRole('button', { name: /Check Answer/i })).toBeTruthy()
    expect(readProgress().completedAttempts).toHaveLength(1)
  }, 10_000)

  test('final Next launches the planner-selected fresh lesson directly', async () => {
    await launchJourney()
    const completedLessonId = readProgress().activeLessonSession?.lessonId
    await completeCheckpoint()

    expect(readProgress().activeLessonSession?.lessonId).not.toBe(completedLessonId)
    expect(screen.getByText(/Question 1 of/i)).toBeTruthy()
    expect(screen.queryByText(/Quest Complete|Almost There|Unit Selection|Ready when you are|Return to Map/i)).toBeNull()
  }, 10_000)

  test('partial performance keeps automatic same-level guidance', async () => {
    await launchJourney()
    await completeCheckpoint(false)
    expect(screen.getByText(/Question 1 of/i)).toBeTruthy()
    expect(readProgress().skillProgress['g2-story-scouts-prose'].currentDifficulty).toBe(1)
  })

  test('draft answers autosave and resume without Save and Exit', async () => {
    await launchJourney()
    fireEvent.click(screen.getByRole('radio', { name: /Wind has spread wrappers and cans/i }))
    await waitFor(() => expect(readProgress().activeLessonSession?.draftQuestion?.answer).toBeTruthy())
    const sessionId = readProgress().activeLessonSession?.sessionId
    expect(readProgress().activeLessonSession?.draftQuestion?.answer).toBeTruthy()
    expect(readProgress().activeLessonSession).not.toBeNull()
    expect(readProgress().completedAttempts).toHaveLength(0)
    cleanup()
    render(<App />)
    expect((await screen.findByRole('radio', { name: /Wind has spread wrappers and cans/i }) as HTMLInputElement).checked).toBe(true)
    expect(readProgress().activeLessonSession?.sessionId).toBe(sessionId)
    expect(screen.queryByRole('button', { name: /Save and Exit|Start Journey/i })).toBeNull()
  })

  test('a submitted answer resumes at its feedback boundary after reload', async () => {
    await launchJourney()
    fireEvent.click(screen.getByRole('radio', { name: /Wind has spread wrappers and cans/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /Check Answer/i }).hasAttribute('disabled')).toBe(false))
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }))
    await screen.findByText(/Great clue-finding/i)
    cleanup()
    render(<App />)
    expect(await screen.findByText(/Great clue-finding/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /^Next$/i })).toBeTruthy()
  })

  test('an existing active lesson always resumes before a stored fresh plan', async () => {
    const state = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    const candidates = getLessonCandidates()
    const activeCandidate = candidates.find((candidate) => candidate.unitId === 'ss-unit-1')!
    const activeLesson = getLessonById(activeCandidate.lessonId).lesson!
    const otherLesson = candidates.find((candidate) => candidate.lessonId !== activeLesson.lessonId)!
    state.activeLessonSession = createActiveLessonSession(activeLesson, 'guided-active-session', '2026-08-20T12:00:00.000Z')
    state.plannedNextQuest = { status: 'available', purpose: 'progression', lesson: otherLesson }
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))

    render(<App />)
    expect(await screen.findByText(activeLesson.questions[0].prompt)).toBeTruthy()
    expect(readProgress().activeLessonSession?.lessonId).toBe(activeLesson.lessonId)
  })

  test('saved schema-version-1 progress opens the live guided quest without migration loss', async () => {
    const state = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
    state.totalXp = 90
    state.totalStars = 3
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
    render(<App />)

    expect(await screen.findByText(/Question 1 of 6/i)).toBeTruthy()

    expect(readProgress().totalXp).toBe(90)
    expect(readProgress().totalStars).toBe(3)
    expect(screen.queryByLabelText(/experience points|stars earned/i)).toBeNull()
  })

  test('an incompatible active session recovers safely to a fresh guided quest', async () => {
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
    expect(await screen.findByText(/Question 1 of 6/i)).toBeTruthy()
  })

  test('double completion interaction remains idempotent', async () => {
    await launchJourney()
    await completeCheckpoint()
    expect(readProgress().completedAttempts).toHaveLength(1)
    expect(readProgress().completedSessionCount).toBe(1)
  })
})
