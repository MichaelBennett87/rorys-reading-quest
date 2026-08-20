import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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

function getCurrentLegendText() {
  return screen.queryByRole('group')?.querySelector('legend')?.textContent?.trim() ?? ''
}

function answerCurrentMultipleChoice(correct = true) {
  const group = screen.getByRole('group')
  fireEvent.click(within(group).getAllByRole('radio')[correct ? 0 : 1])
}

function answerCurrentMultiselect(indices: number[]) {
  const group = screen.getByRole('group')
  const checkboxes = within(group).getAllByRole('checkbox')
  indices.forEach((index) => {
    fireEvent.click(checkboxes[index])
  })
}

function answerCurrentTableMatch(choiceValue: string) {
  const region = screen.getByRole('region', { name: /table matching question/i })
  fireEvent.change(within(region).getByRole('combobox'), { target: { value: choiceValue } })
}

function answerCurrentQuestionWrong() {
  const tableRegion = screen.queryByRole('region', { name: /table matching question/i })
  if (tableRegion) {
    const select = within(tableRegion).getByRole('combobox')
    const options = Array.from(select.querySelectorAll('option[value]'))
      .map((option) => option.getAttribute('value') ?? '')
      .filter(Boolean)
    fireEvent.change(select, { target: { value: options[1] ?? options[0] ?? 'book-sound' } })
    return
  }
  const group = screen.getByRole('group')
  const radios = within(group).queryAllByRole('radio')
  if (radios.length > 0) {
    fireEvent.click(radios[1] ?? radios[0])
    return
  }
  const checkboxes = within(group).queryAllByRole('checkbox')
  if (checkboxes.length > 0) {
    fireEvent.click(checkboxes[0])
  }
}

function answerCheckpointQuestion(correct = true) {
  if (screen.queryByRole('region', { name: /table matching question/i })) {
    const region = screen.getByRole('region', { name: /table matching question/i })
    const select = within(region).getByRole('combobox')
    const options = Array.from(select.querySelectorAll('option[value]')).map((option) => option.getAttribute('value') ?? '')
    const nextValue = correct ? options.find((value) => value) ?? 'leaf-sound' : options.find((value) => value && value !== options.find((candidate) => candidate)) ?? 'book-sound'
    fireEvent.change(select, { target: { value: nextValue } })
    return
  }
  const prompt = getCurrentLegendText()
  if (/Which word has ea like leaf\?/i.test(prompt) || /Which word has oo like pool\?/i.test(prompt) || /Which word has ea like head\?/i.test(prompt)) {
    answerCurrentMultipleChoice(correct)
    return
  }
  if (/Choose all the ea words in the passage\./i.test(prompt)) {
    if (/tree room/i.test(screen.getByRole('heading', { name: /Reading Passage/i }).parentElement?.textContent ?? '')) {
      answerCurrentMultiselect(correct ? [0, 1, 2, 3] : [0])
      return
    }
    if (/pool party/i.test(screen.getByRole('heading', { name: /Reading Passage/i }).parentElement?.textContent ?? '')) {
      answerCurrentMultiselect(correct ? [0, 1] : [0])
      return
    }
    answerCurrentMultiselect(correct ? [0, 1, 2, 3] : [0])
    return
  }
  if (/Choose all the oo words in the passage\./i.test(prompt)) {
    if (/tree room/i.test(screen.getByRole('heading', { name: /Reading Passage/i }).parentElement?.textContent ?? '')) {
      answerCurrentMultiselect(correct ? [0, 1] : [0])
      return
    }
    if (/pool party/i.test(screen.getByRole('heading', { name: /Reading Passage/i }).parentElement?.textContent ?? '')) {
      answerCurrentMultiselect(correct ? [0, 1, 2, 3] : [0])
      return
    }
    if (/garden morning/i.test(screen.getByRole('heading', { name: /Reading Passage/i }).parentElement?.textContent ?? '')) {
      answerCurrentMultiselect(correct ? [0, 1, 2] : [0])
      return
    }
    answerCurrentMultiselect(correct ? [0] : [1])
    return
  }
  if (/Select the sentence about the dream\./i.test(prompt)) {
    const group = screen.getByRole('group')
    fireEvent.click(within(group).getByRole('radio', { name: /They wrote about a dream, a green branch, and a little pond\./i }))
    return
  }
  if (/Select the sentence that says the food tasted good\./i.test(prompt)) {
    const group = screen.getByRole('group')
    fireEvent.click(within(group).getByRole('radio', { name: /The food tasted good, and the room felt bright\./i }))
    return
  }
  if (/Select the sentence that mentions the beach path\./i.test(prompt)) {
    const group = screen.getByRole('group')
    fireEvent.click(within(group).getByRole('radio', { name: /A spoon of soil helped one seed sprout near the beach path\./i }))
    return
  }
  if (/Which sound group fits leaf\?/i.test(prompt)) {
    answerCurrentTableMatch(correct ? 'leaf-sound' : 'team-sound')
    return
  }
  if (/Which sound group fits boot\?/i.test(prompt)) {
    answerCurrentTableMatch(correct ? 'boot-sound' : 'ea-sound')
    return
  }
  if (/Which sound group fits beach\?/i.test(prompt)) {
    answerCurrentTableMatch(correct ? 'beach-sound' : 'pool-sound')
    return
  }
  if (/Which word has ea like clean\?/i.test(prompt)) {
    answerCurrentMultipleChoice(correct)
    return
  }
  if (/Which word has oo like spoon\?/i.test(prompt) || /Which word has oo like good\?/i.test(prompt)) {
    answerCurrentMultipleChoice(correct)
    return
  }
  if (/Which word has ea like bread\?/i.test(prompt) || /Which word has ea like beach\?/i.test(prompt) || /Which word has ea like weather\?/i.test(prompt) || /Which word has ea like team\?/i.test(prompt)) {
    answerCurrentMultipleChoice(correct)
    return
  }
  answerCurrentMultipleChoice(correct)
}

function completeCheckpointLesson(firstCorrect = true) {
  answerCheckpointQuestion(firstCorrect)
  submitAndAdvance()
  answerCheckpointQuestion(firstCorrect)
  submitAndAdvance()
  answerCheckpointQuestion(true)
  submitAndAdvance()
  answerCheckpointQuestion(true)
  submitAndAdvance()
  answerCheckpointQuestion(true)
  submitAndAdvance()
  answerCheckpointQuestion(true)
  submitAndAdvance()
  answerCheckpointQuestion(true)
  submitAndAdvance(true)
}

function completeCheckpointLessonLow() {
  for (let i = 0; i < 7; i += 1) {
    answerCheckpointQuestion(false)
    submitAndAdvance(i === 6)
  }
}

function completeGuidedLessonLow() {
  const startPractice = screen.queryByRole('button', { name: /Start Practice/i })
  if (startPractice) {
    fireEvent.click(startPractice)
  }
  for (let safety = 0; safety < 10; safety += 1) {
    answerCurrentQuestionWrong()
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    const nextQuestionButton = screen.queryByRole('button', { name: /Next Question/i })
    if (nextQuestionButton) {
      fireEvent.click(nextQuestionButton)
      continue
    }
    const completeButton = screen.queryByRole('button', { name: /See Quest Complete/i })
    if (completeButton) {
      fireEvent.click(completeButton)
      return
    }
    throw new Error('Expected Next Question or See Quest Complete after submitting guided lesson answer')
  }
  throw new Error('Guided low helper exceeded the expected question count')
}

function clickRadioChoice(label: string) {
  const group = screen.getByRole('group')
  fireEvent.click(within(group).getByRole('radio', { name: label }))
}

function clickCheckboxChoice(label: string) {
  const group = screen.getByRole('group')
  fireEvent.click(within(group).getByRole('checkbox', { name: label }))
}

function setTrail2TableMatches(values: string[]) {
  const region = screen.getByRole('region', { name: /table matching question/i })
  const selects = within(region).getAllByRole('combobox')
  values.forEach((value, index) => {
    fireEvent.change(selects[index], { target: { value } })
  })
}

function answerTrail2CheckpointQuestion(correct = true) {
  const prompt = getCurrentLegendText()
  const passageText = screen.getByRole('heading', { name: /Reading Passage/i }).parentElement?.textContent ?? ''

  if (/Which word has ou like cloud\?/i.test(prompt)) {
    clickRadioChoice(correct ? 'cloud' : 'snow')
    return
  }
  if (/Which word has ow like snow\?/i.test(prompt)) {
    clickRadioChoice(correct ? 'snow' : 'cloud')
    return
  }
  if (/Which word has oi like coin\?/i.test(prompt)) {
    clickRadioChoice(correct ? 'coin' : 'cloud')
    return
  }
  if (/Which word has oy like toy\?/i.test(prompt)) {
    clickRadioChoice(correct ? 'toy' : 'cloud')
    return
  }
  if (/Which word has ou like round\?/i.test(prompt)) {
    clickRadioChoice(correct ? 'round' : 'toy')
    return
  }
  if (/Which word has oi like choice\?/i.test(prompt)) {
    clickRadioChoice(correct ? 'choice' : 'toy')
    return
  }
  if (/Which word has ow like cow\?/i.test(prompt)) {
    clickRadioChoice(correct ? 'cow' : 'toy')
    return
  }
  if (/Choose all the words that show the Trail 2 patterns in this fair passage\./i.test(prompt)) {
    if (correct) clickCheckboxChoice('cloud')
    if (correct) clickCheckboxChoice('coin')
    if (correct) clickCheckboxChoice('toy')
    if (correct) clickCheckboxChoice('snow')
    else clickCheckboxChoice('cloud')
    return
  }
  if (/Choose all the words that show the Trail 2 patterns in the cleanup passage\./i.test(prompt)) {
    if (correct) clickCheckboxChoice('round')
    if (correct) clickCheckboxChoice('choice')
    if (correct) clickCheckboxChoice('toy')
    if (correct) clickCheckboxChoice('cow')
    else clickCheckboxChoice('round')
    return
  }
  if (/Choose all the words that show the Trail 2 patterns in the science walk\./i.test(prompt)) {
    if (correct) clickCheckboxChoice('cloud')
    if (correct) clickCheckboxChoice('voice')
    if (correct) clickCheckboxChoice('boy')
    if (correct) clickCheckboxChoice('cow')
    else clickCheckboxChoice('cloud')
    return
  }
  if (/Select the sentence that says a coin spun beside a toy wagon\./i.test(prompt)) {
    clickRadioChoice(correct ? 'A coin spun beside a toy wagon while the boy waited.' : 'At the town fair, a cloud of smoke rose from the soup tent.')
    return
  }
  if (/Select the sentence that says another child carried a toy crow past the window\./i.test(prompt)) {
    clickRadioChoice(correct ? 'Another child carried a toy crow past the window.' : 'During the cleanup, the team found a round sign and a loud horn.')
    return
  }
  if (/Select the sentence that says the cow moved down the brown trail\./i.test(prompt)) {
    clickRadioChoice(correct ? 'On the science walk, the cow moved down the brown trail.' : 'The children heard the voice of the guide, and one boy held a cloud chart.')
    return
  }

  if (screen.queryByRole('region', { name: /table matching question/i })) {
    if (/At the town fair/i.test(passageText)) {
      setTrail2TableMatches(correct
        ? ['cloud-ou-sound', 'coin-oi-sound', 'toy-oy-sound', 'snow-ow-sound']
        : ['cloud-oi-sound', 'coin-ou-sound', 'toy-ow-sound', 'snow-oy-sound'])
      return
    }
    if (/During the cleanup/i.test(passageText)) {
      setTrail2TableMatches(correct
        ? ['round-ou-sound', 'choice-oi-sound', 'toy-oy-sound', 'cow-ow-sound']
        : ['round-oi-sound', 'choice-ou-sound', 'toy-ow-sound', 'cow-oy-sound'])
      return
    }
    if (/On the science walk/i.test(passageText)) {
      setTrail2TableMatches(correct
        ? ['cloud-ou-sound', 'voice-oi-sound', 'boy-oy-sound', 'cow-ow-sound']
        : ['cloud-oi-sound', 'voice-ou-sound', 'boy-ow-sound', 'cow-oy-sound'])
      return
    }
  }

  answerCurrentMultipleChoice(correct)
}

function completeTrail2CheckpointLesson(firstCorrect = true) {
  answerTrail2CheckpointQuestion(firstCorrect)
  submitAndAdvance()
  answerTrail2CheckpointQuestion(firstCorrect)
  submitAndAdvance()
  answerTrail2CheckpointQuestion(true)
  submitAndAdvance()
  answerTrail2CheckpointQuestion(true)
  submitAndAdvance()
  answerTrail2CheckpointQuestion(true)
  submitAndAdvance()
  answerTrail2CheckpointQuestion(true)
  submitAndAdvance()
  answerTrail2CheckpointQuestion(true)
  submitAndAdvance(true)
}

function completeTrail2CheckpointLessonLow() {
  for (let i = 0; i < 7; i += 1) {
    answerTrail2CheckpointQuestion(false)
    submitAndAdvance(i === 6)
  }
}

function readProgress(): QuestProgressV1 {
  return JSON.parse(window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY) ?? 'null') as QuestProgressV1
}

function seedTrailDifficulty(difficulty: number) {
  const state = createDefaultQuestProgress('2026-08-20T12:00:00.000Z')
  state.skillProgress['g2-word-forge-word-practice'].currentDifficulty = difficulty
  state.skillProgress['g2-word-forge-word-practice'].currentLearningState = difficulty >= 2 ? 'ADVANCE' : 'VERIFY_MASTERY'
  window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
}

describe('Phase 3 adaptive child flow', () => {
  test('completing a strong lesson creates a supportive fresh-verification outcome', () => {
    launchFromMap()
    completeCheckpointLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Almost There/i })).toBeTruthy()
    expect(screen.getByText(/One fresh quest will prove this reading power is ready/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Start Fresh Quest/i })).toBeTruthy()
    expect(readProgress().completedAttempts).toHaveLength(1)
  })

  test('selects a fresh activity and a second distinct strong lesson unlocks the next trail', () => {
    launchFromMap()
    completeCheckpointLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    fireEvent.click(screen.getByRole('button', { name: /Start Fresh Quest/i }))
    expect(screen.getByRole('heading', { name: /Beach and Bread Quest/i })).toBeTruthy()
    completeCheckpointLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Trail Complete/i })).toBeTruthy()
    expect(screen.getByText(/You unlocked the next trail/i)).toBeTruthy()
    expect(readProgress().skillProgress['g2-word-forge-word-practice'].currentDifficulty).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: /Start Fresh Quest/i }))
    expect(screen.getByText(/Which word has ou like cloud\?/i)).toBeTruthy()
    expect(readProgress().completedAttempts).toHaveLength(2)
  })

  test('partial performance remains on the same trail with training language', () => {
    launchFromMap()
    completeCheckpointLesson(false)
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Training Round/i })).toBeTruthy()
    expect(screen.getByText(/new quest will help this skill grow stronger/i)).toBeTruthy()
    expect(readProgress().skillProgress['g2-word-forge-word-practice'].currentDifficulty).toBe(1)
  })

  test('manual unit launch respects the current trail and opens Trail 2 checkpoint content', () => {
    seedTrailDifficulty(2)
    launchFromMap()
    expect(screen.getByText(/Which word has ou like cloud\?/i)).toBeTruthy()
    expect(screen.queryByText(/Which word has ea like leaf\?/i)).toBeNull()
  })

  test('a strong Trail 2 checkpoint requests verification and a second distinct success reaches Trail 3', () => {
    seedTrailDifficulty(2)
    launchFromMap()
    completeTrail2CheckpointLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Almost There/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Start Fresh Quest/i }))
    expect(screen.getByText(/Which word has ou like round\?/i)).toBeTruthy()
    completeTrail2CheckpointLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Trail Complete!/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Start Fresh Quest/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Start Fresh Quest/i }))
    expect(screen.getByText(/Which word has two short vowels like picnic\?/i)).toBeTruthy()
    expect(readProgress().skillProgress['g2-word-forge-word-practice'].currentDifficulty).toBe(3)
  })

  test('partial Trail 2 performance remains at the same difficulty', () => {
    seedTrailDifficulty(2)
    launchFromMap()
    completeTrail2CheckpointLesson(false)
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Training Round/i })).toBeTruthy()
    expect(readProgress().skillProgress['g2-word-forge-word-practice'].currentDifficulty).toBe(2)
  })

  test('a low Trail 2 checkpoint routes to guided practice and preserves the original Trail 2 target', () => {
    seedTrailDifficulty(2)
    launchFromMap()
    completeTrail2CheckpointLessonLow()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Try a New Route/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Start Fresh Quest/i }))
    expect(screen.getByRole('heading', { name: /Look closely at oi and oy/i })).toBeTruthy()
    completeGuidedLessonLow()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Power-Up Mission/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Start Fresh Quest/i }))
    expect(screen.getByRole('heading', { name: /Look closely at oi and oy/i })).toBeTruthy()
    expect(readProgress().skillProgress['g2-word-forge-word-practice'].currentDifficulty).toBe(1)
    expect(readProgress().skillProgress['g2-word-forge-word-practice'].remediationContext?.originalDifficulty).toBe(2)
  })

  test('two consecutive low completions route to a supportive building-block mission', () => {
    launchFromMap()
    completeCheckpointLessonLow()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Try a New Route/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Start Fresh Quest/i }))
    completeGuidedLessonLow()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    expect(screen.getByRole('heading', { name: /Power-Up Mission/i })).toBeTruthy()
    expect(screen.getByText(/building block to strengthen/i)).toBeTruthy()
  })

  test('persisted XP and stars appear after a reload', () => {
    launchFromMap()
    completeCheckpointLesson()
    fireEvent.click(screen.getByRole('button', { name: /Continue Quest/i }))
    const state = readProgress()
    cleanup()
    render(<App />)
    expect(screen.getByLabelText(`${state.totalXp} experience points`)).toBeTruthy()
    expect(screen.getByLabelText(`${state.totalStars} stars earned`)).toBeTruthy()
  })

  test('a submitted active question resumes at its feedback boundary after reload', () => {
    launchFromMap()
    fireEvent.click(screen.getByRole('radio', { name: /leaf/i }))
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
    completeCheckpointLesson()
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
    expect(screen.getByText(/Question 1 of 7/i)).toBeTruthy()
  })
})
