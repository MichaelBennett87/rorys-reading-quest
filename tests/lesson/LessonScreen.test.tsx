import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { LessonScreen } from '../../src/screens/LessonScreen'
import type { LessonDefinition, LessonQuestion } from '../../src/domain/lesson'

afterEach(() => {
  cleanup()
})

const baseLesson: Omit<LessonDefinition, 'questionCount' | 'questions'> = {
  lessonId: 'lesson-word-forge-vowel-voyage',
  activityId: 'act-word-forge-vowel-voyage',
  passageId: 'passage-word-forge-bridge-a',
  skillId: 'g2-word-forge-word-practice',
  difficulty: 1,
  unitId: 'wg-unit-1',
  worldId: 'word-forge',
  lessonTitle: 'Vowel Voyage',
  lessonObjective: 'Read for clues',
}

const multipleChoiceQuestion: LessonQuestion = {
  questionId: 'q1',
  questionType: 'MULTIPLE_CHOICE',
  lessonId: 'lesson-word-forge-vowel-voyage',
  activityId: 'act-word-forge-vowel-voyage-a-1',
  passageId: 'passage-word-forge-bridge-a',
  skillId: 'g2-word-forge-word-practice',
  difficulty: 1,
  prompt: 'Which action shows planning?',
  explanation: 'Correctly identifies the planning behavior.',
  evidenceReferenceIds: ['step-pack'],
  choices: [
    { id: 'step-pack', text: 'Packing her kite bag and checking wind' },
    { id: 'step-jump', text: 'Jumping twice' },
    { id: 'step-call', text: 'Waving' },
  ],
  correctChoiceIds: ['step-pack'],
}

const multiselectQuestion: LessonQuestion = {
  questionId: 'q2',
  questionType: 'MULTISELECT',
  lessonId: 'lesson-word-forge-vowel-voyage',
  activityId: 'act-word-forge-vowel-voyage-a-2',
  passageId: 'passage-word-forge-bridge-a',
  skillId: 'g2-word-forge-word-practice',
  difficulty: 1,
  prompt: 'Choose all helpful clues.',
  explanation: 'More than one clue shows teamwork.',
  evidenceReferenceIds: ['clue-brother', 'clue-count'],
  choices: [
    { id: 'clue-brother', text: 'Brother held the spool.' },
    { id: 'clue-count', text: 'He counted slowly.' },
    { id: 'clue-laugh', text: 'She laughed at the sky.' },
  ],
  correctChoiceIds: ['clue-brother', 'clue-count'],
}

const hotTextQuestion: LessonQuestion = {
  questionId: 'q3',
  questionType: 'HOT_TEXT',
  lessonId: 'lesson-word-forge-vowel-voyage',
  activityId: 'act-word-forge-vowel-voyage-b-1',
  passageId: 'passage-word-forge-bridge-b',
  skillId: 'g2-word-forge-word-practice',
  difficulty: 1,
  prompt: 'Pick the sentence about careful planting.',
  explanation: 'Caring for soil and water is part of setup.',
  evidenceReferenceIds: ['seed-2'],
  segments: [
    { id: 'seed-1', text: 'Nora packed her bag.' },
    { id: 'seed-2', text: 'She measured soil and water.' },
    { id: 'seed-3', text: 'She tied the string tight.' },
  ],
  correctSegmentIds: ['seed-2'],
  allowMultiple: false,
}

const evidencePairQuestion: LessonQuestion = {
  questionId: 'q4',
  questionType: 'EVIDENCE_PAIR',
  lessonId: 'lesson-word-forge-vowel-voyage',
  activityId: 'act-word-forge-vowel-voyage-a-4',
  passageId: 'passage-word-forge-bridge-a',
  skillId: 'g2-word-forge-word-practice',
  difficulty: 1,
  prompt: 'Pair the lesson with proof.',
  explanation: 'The answer shows linked learning.',
  evidenceReferenceIds: ['lesson-A'],
  partAPrompt: 'What did Nora practice?',
  partAChoices: [
    { id: 'lesson-A', text: 'Team launch with help' },
    { id: 'lesson-B', text: 'Ignore planning' },
  ],
  partACorrectChoiceId: 'lesson-A',
  partBPrompt: 'Which sentence proves it?',
  partBChoices: [
    { id: 'seg-a1', text: 'She packed her bag first.' },
    { id: 'seg-a2', text: 'Her brother counted the jumps.' },
  ],
  partBCorrectChoiceId: 'seg-a2',
}

const tableMatchQuestion: LessonQuestion = {
  questionId: 'q5',
  questionType: 'TABLE_MATCH',
  lessonId: 'lesson-word-forge-vowel-voyage',
  activityId: 'act-word-forge-vowel-voyage-b-4',
  passageId: 'passage-word-forge-bridge-b',
  skillId: 'g2-word-forge-word-practice',
  difficulty: 1,
  prompt: 'Match action to habit.',
  explanation: 'Each row matches one habit.',
  evidenceReferenceIds: ['habit-planned'],
  rows: [
    {
      id: 'row-1',
      prompt: 'Measured soil and water',
      correctChoiceId: 'habit-planned',
      options: [
        { id: 'habit-planned', text: 'Planned and measured carefully' },
        { id: 'habit-tracked', text: 'Skipped details' },
      ],
    },
    {
      id: 'row-2',
      prompt: 'Wrote labels',
      correctChoiceId: 'habit-tracked',
      options: [
        { id: 'habit-planned', text: 'Plan first' },
        { id: 'habit-tracked', text: 'Track each cup' },
      ],
    },
  ],
}

const renderLesson = (question: LessonQuestion, onBack = vi.fn()) => {
  const lesson: LessonDefinition = {
    ...baseLesson,
    questionCount: 1,
    questions: [question],
  }

  return {
    onBack,
    ...render(<LessonScreen lesson={lesson} onBack={onBack} />),
  }
}

describe('LessonScreen', () => {
  test('requires a selection before submit', () => {
    renderLesson(multipleChoiceQuestion)
    expect(screen.getByRole('button', { name: /Submit Answer/i }).getAttribute('disabled')).not.toBeNull()
    fireEvent.click(screen.getByRole('radio', { name: 'Packing her kite bag and checking wind' }))
    expect(screen.getByRole('button', { name: /Submit Answer/i }).getAttribute('disabled')).toBeNull()
  })

  test('locks a scored answer and cannot resubmit', () => {
    renderLesson(multipleChoiceQuestion)
    fireEvent.click(screen.getByRole('radio', { name: 'Waving' }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    expect(screen.getByText(/Not quite. Let’s look at the clue./i)).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Waving' }).getAttribute('disabled')).not.toBeNull()
  })

  test('supports multiselect interactions', () => {
    renderLesson(multiselectQuestion)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Brother held the spool.' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'He counted slowly.' }))
    expect(screen.getByRole('button', { name: /Submit Answer/i }).getAttribute('disabled')).toBeNull()
  })

  test('supports hot-text single-selection and explanation output', () => {
    renderLesson(hotTextQuestion)
    fireEvent.click(screen.getByRole('radio', { name: 'She measured soil and water.' }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    expect(screen.getByText(/Great clue-finding!/i)).toBeTruthy()
    expect(screen.getByText(/Caring for soil and water is part of setup/i)).toBeTruthy()
  })

  test('supports two-part evidence pairing', () => {
    renderLesson(evidencePairQuestion)
    fireEvent.click(screen.getByRole('radio', { name: 'Team launch with help' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Her brother counted the jumps.' }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    expect(screen.getByText(/Great clue-finding!/i)).toBeTruthy()
  })

  test('supports table matching', () => {
    renderLesson(tableMatchQuestion)
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'habit-planned' } })
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'habit-tracked' } })
    expect(screen.getByRole('button', { name: /Submit Answer/i }).getAttribute('disabled')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    fireEvent.click(screen.getByRole('button', { name: /See Quest Complete/i }))
    expect(screen.getByText(/Quest Complete/i)).toBeTruthy()
  })

  test('shows completion screen and return action', () => {
    const onBack = vi.fn()
    renderLesson(hotTextQuestion, onBack)
    fireEvent.click(screen.getByRole('radio', { name: 'She measured soil and water.' }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    fireEvent.click(screen.getByRole('button', { name: /See Quest Complete/i }))
    expect(screen.getByText(/Quest Complete/i)).toBeTruthy()
    expect(screen.getByText(/Stars earned:/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Return to Unit/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
