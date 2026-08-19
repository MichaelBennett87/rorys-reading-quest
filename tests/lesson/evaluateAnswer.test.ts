import { describe, expect, test } from 'vitest'

import { evaluateAnswer, type LessonQuestion } from '../../src/domain/lesson'
import type { LessonQuestionSubmission } from '../../src/domain/lesson'

const base = {
  lessonId: 'lesson-test',
  activityId: 'act-test',
  passageId: 'p1',
  skillId: 's1',
  difficulty: 1,
  explanation: '',
  evidenceReferenceIds: [],
}

const multipleChoiceQuestion: LessonQuestion = {
  questionId: 'q-mc',
  questionType: 'MULTIPLE_CHOICE',
  ...base,
  prompt: 'Pick the clue.',
  choices: [
    { id: 'c1', text: 'Trail' },
    { id: 'c2', text: 'Spark' },
    { id: 'c3', text: 'Glow' },
  ],
  correctChoiceIds: ['c2'],
}

const multiselectQuestion: LessonQuestion = {
  questionId: 'q-ms',
  questionType: 'MULTISELECT',
  ...base,
  prompt: 'Pick all clues.',
  choices: [
    { id: 'm1', text: 'Blue' },
    { id: 'm2', text: 'Red' },
    { id: 'm3', text: 'Green' },
  ],
  correctChoiceIds: ['m1', 'm3'],
}

const hotTextQuestion: LessonQuestion = {
  questionId: 'q-hot',
  questionType: 'HOT_TEXT',
  ...base,
  prompt: 'Pick the useful sentence.',
  segments: [
    { id: 's1', text: 'A fox crossed the path.' },
    { id: 's2', text: 'Clouds moved slowly.' },
    { id: 's3', text: 'Maya tied the knot.' },
  ],
  correctSegmentIds: ['s1', 's3'],
  allowMultiple: true,
}

const evidencePairQuestion: LessonQuestion = {
  questionId: 'q-pair',
  questionType: 'EVIDENCE_PAIR',
  ...base,
  prompt: 'Which lesson and proof fits?',
  partAPrompt: 'Part A',
  partAChoices: [
    { id: 'a1', text: 'Pattern' },
    { id: 'a2', text: 'No Pattern' },
  ],
  partACorrectChoiceId: 'a1',
  partBPrompt: 'Part B',
  partBChoices: [
    { id: 'b1', text: 'Detail line 1' },
    { id: 'b2', text: 'Detail line 2' },
  ],
  partBCorrectChoiceId: 'b1',
}

const tableMatchQuestion: LessonQuestion = {
  questionId: 'q-table',
  questionType: 'TABLE_MATCH',
  ...base,
  prompt: 'Match the row.',
  rows: [
    { id: 'row1', prompt: 'Row 1', correctChoiceId: 'r1-a', options: [{ id: 'r1-a', text: 'A' }, { id: 'r1-b', text: 'B' }] },
    { id: 'row2', prompt: 'Row 2', correctChoiceId: 'r2-b', options: [{ id: 'r2-a', text: 'A' }, { id: 'r2-b', text: 'B' }] },
  ],
}

describe('evaluateAnswer', () => {
  test('evaluates multiple-choice correct answer', () => {
    const result = evaluateAnswer(multipleChoiceQuestion, {
      questionType: 'MULTIPLE_CHOICE',
      payload: { selectedChoiceId: 'c2' },
    })
    expect(result.isCorrect).toBe(true)
    expect(result.correctAnswer).toBe('c2')
  })

  test('evaluates multiple-choice incorrect answer', () => {
    const result = evaluateAnswer(multipleChoiceQuestion, {
      questionType: 'MULTIPLE_CHOICE',
      payload: { selectedChoiceId: 'c1' },
    })
    expect(result.isCorrect).toBe(false)
  })

  test('multiselect checks exact set without order dependence', () => {
    const result = evaluateAnswer(multiselectQuestion, {
      questionType: 'MULTISELECT',
      payload: { selectedChoiceIds: ['m3', 'm1'] },
    })
    expect(result.isCorrect).toBe(true)
    expect(result.correctAnswer).toEqual(['m1', 'm3'])
  })

  test('hot text supports exact segment set', () => {
    const result = evaluateAnswer(hotTextQuestion, {
      questionType: 'HOT_TEXT',
      payload: { selectedSegmentIds: ['s3', 's1'] },
    })
    expect(result.isCorrect).toBe(true)
    expect(result.correctAnswer).toEqual(['s1', 's3'])
  })

  test('evidence pair preserves per-part results', () => {
    const result = evaluateAnswer(evidencePairQuestion, {
      questionType: 'EVIDENCE_PAIR',
      payload: { partAChoiceId: 'a1', partBChoiceId: 'b1' },
    })
    expect(result.isCorrect).toBe(true)
    expect(result.correctAnswer).toEqual({ partA: 'a1', partB: 'b1' })
  })

  test('table match requires all rows to match', () => {
    const result = evaluateAnswer(tableMatchQuestion, {
      questionType: 'TABLE_MATCH',
      payload: { selectedMappings: { row1: 'r1-a', row2: 'r2-b' } },
    })
    expect(result.isCorrect).toBe(true)
    expect(result.correctAnswer).toEqual({ row1: 'r1-a', row2: 'r2-b' })
  })

  test('preserves source content without mutation', () => {
    const sourceQuestion: LessonQuestion = JSON.parse(JSON.stringify(multiselectQuestion))
    const submission: LessonQuestionSubmission = {
      questionType: 'MULTISELECT',
      payload: { selectedChoiceIds: ['m1', 'm3'] },
    }
    const copyBefore = JSON.parse(JSON.stringify(sourceQuestion))

    evaluateAnswer(multiselectQuestion, submission)
    expect(multiselectQuestion).toEqual(copyBefore)
    expect(sourceQuestion).toEqual(copyBefore)
    expect(JSON.stringify(multiselectQuestion)).toEqual(JSON.stringify(sourceQuestion))
  })
})
