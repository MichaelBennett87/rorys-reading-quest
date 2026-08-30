import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { AnswerFeedback } from '../../src/components/lesson/AnswerFeedback'
import { EvidencePairQuestion } from '../../src/components/lesson/EvidencePairQuestion'
import { HotTextQuestion } from '../../src/components/lesson/HotTextQuestion'
import { MultipleChoiceQuestion } from '../../src/components/lesson/MultipleChoiceQuestion'
import { MultiselectQuestion } from '../../src/components/lesson/MultiselectQuestion'
import { TableMatchQuestion } from '../../src/components/lesson/TableMatchQuestion'
import {
  buildCanonicalSubmission,
  evaluateAnswer,
  generateAdversarialSubmissions,
  getLessonById,
  lessonCatalog,
} from '../../src/domain/lesson'
import { LessonScreen } from '../../src/screens/LessonScreen'

afterEach(cleanup)

const choices = [
  { id: 'correct', text: 'Supported answer' },
  { id: 'incorrect', text: 'Unsupported answer' },
]

describe('semantic answer feedback states', () => {
  test('renders explicit correct and incorrect feedback with different status semantics', () => {
    const { rerender } = render(<AnswerFeedback isCorrect explanation="The passage supports this answer." />)
    const correct = screen.getByRole('status')
    expect(correct.getAttribute('data-result')).toBe('correct')
    expect(correct.classList.contains('answer-feedback-correct')).toBe(true)
    expect(correct.classList.contains('answer-feedback-incorrect')).toBe(false)
    expect(screen.getByText(/Correct!/i)).toBeTruthy()

    rerender(<AnswerFeedback isCorrect={false} explanation="Use the passage clue." />)
    const incorrect = screen.getByRole('status')
    expect(incorrect.getAttribute('data-result')).toBe('incorrect')
    expect(incorrect.classList.contains('answer-feedback-incorrect')).toBe(true)
    expect(incorrect.classList.contains('answer-feedback-correct')).toBe(false)
    expect(screen.getByText(/Not quite/i)).toBeTruthy()
  })

  test('keeps multiple-choice selection neutral before grading and decorates both outcomes afterward', () => {
    const props = {
      questionId: 'mc',
      questionPrompt: 'Choose one.',
      choices,
      disabled: false,
      onSelectChoice: vi.fn(),
    }
    const { rerender } = render(<MultipleChoiceQuestion {...props} selectedChoiceId="incorrect" />)
    expect(getAnswerContainer('Unsupported answer').getAttribute('data-answer-state')).toBe('selected')

    rerender(<MultipleChoiceQuestion {...props} selectedChoiceId="incorrect" submitted correctChoiceIds={['correct']} disabled />)
    expect(getAnswerContainer('Unsupported answer').getAttribute('data-answer-state')).toBe('incorrect')
    expect(getAnswerContainer('Supported answer').getAttribute('data-answer-state')).toBe('correct')
  })

  test('decorates multiselect and hot-text choices without using result colors before grading', () => {
    const { rerender } = render(
      <MultiselectQuestion
        questionId="multi"
        questionPrompt="Choose two."
        choices={choices}
        selectedChoiceIds={['correct']}
        disabled={false}
        onToggleChoice={vi.fn()}
      />,
    )
    expect(getAnswerContainer('Supported answer').getAttribute('data-answer-state')).toBe('selected')
    rerender(
      <MultiselectQuestion
        questionId="multi"
        questionPrompt="Choose two."
        choices={choices}
        selectedChoiceIds={['correct', 'incorrect']}
        disabled
        submitted
        correctChoiceIds={['correct']}
        onToggleChoice={vi.fn()}
      />,
    )
    expect(getAnswerContainer('Supported answer').getAttribute('data-answer-state')).toBe('correct')
    expect(getAnswerContainer('Unsupported answer').getAttribute('data-answer-state')).toBe('incorrect')

    cleanup()
    render(
      <HotTextQuestion
        questionPrompt="Choose the sentence."
        allowMultiple={false}
        segments={choices}
        selectedSegmentIds={['incorrect']}
        disabled
        submitted
        correctSegmentIds={['correct']}
        onToggleSegment={vi.fn()}
      />,
    )
    expect(getAnswerContainer('Supported answer').getAttribute('data-answer-state')).toBe('correct')
    expect(getAnswerContainer('Unsupported answer').getAttribute('data-answer-state')).toBe('incorrect')
  })

  test('decorates Part A and Part B independently after a two-part response', () => {
    render(
      <EvidencePairQuestion
        partAPrompt="Choose the idea."
        partAChoices={choices}
        partBPrompt="Choose the evidence."
        partBChoices={choices}
        selectedPartAChoiceId="correct"
        selectedPartBChoiceId="incorrect"
        disabled
        submitted
        partACorrectChoiceId="correct"
        partBCorrectChoiceId="correct"
        onPartASelect={vi.fn()}
        onPartBSelect={vi.fn()}
      />,
    )
    expect(screen.getAllByText('Correct answer')).toHaveLength(2)
    expect(screen.getByText('Needs correction')).toBeTruthy()
  })

  test('decorates independent and use-each-once table rows with correction text', () => {
    const rows = [
      { id: 'row-1', prompt: 'First', options: choices, selectedChoiceId: 'correct', correctChoiceId: 'correct' },
      { id: 'row-2', prompt: 'Second', options: choices, selectedChoiceId: 'incorrect', correctChoiceId: 'correct' },
    ]
    const { rerender } = render(
      <TableMatchQuestion rows={rows} disabled submitted onSelectChoice={vi.fn()} />,
    )
    expect(screen.getByText('Correct match')).toBeTruthy()
    expect(screen.getByText(/Needs correction. Correct match: Supported answer/i)).toBeTruthy()

    rerender(
      <TableMatchQuestion
        rows={rows}
        disabled
        submitted
        selectionMode="use_each_once"
        onSelectChoice={vi.fn()}
      />,
    )
    expect(screen.getByText(/Each retell piece can be used only once/i)).toBeTruthy()
    expect(screen.getByText(/Needs correction/i)).toBeTruthy()
  })

  test('keeps distinct one-cycle animations with an explicit reduced-motion fallback', () => {
    const css = readFileSync('src/App.css', 'utf8')
    expect(css).toContain('@keyframes feedback-correct-pulse')
    expect(css).toContain('@keyframes feedback-incorrect-pulse')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toMatch(/answer-feedback-correct[\s\S]*answer-feedback-incorrect[\s\S]*animation:\s*none !important/)
  })

  test('uses the same correct and incorrect semantics inside a paired-text lesson', () => {
    const pairedEntry = lessonCatalog.find((entry) => (
      entry.selectionStatus === 'active' && Boolean(entry.pairedTextSetId)
    ))
    const pairedLesson = pairedEntry ? getLessonById(pairedEntry.lessonId).lesson : null
    const question = pairedLesson?.questions[0]
    expect(question?.questionType).toBe('MULTIPLE_CHOICE')
    if (!pairedLesson || !question || question.questionType !== 'MULTIPLE_CHOICE') return
    const correct = question.choices.find((choice) => question.correctChoiceIds.includes(choice.id))
    const incorrect = question.choices.find((choice) => !question.correctChoiceIds.includes(choice.id))
    if (!correct || !incorrect) throw new Error(`Paired question ${question.questionId} needs one key and one distractor.`)

    render(<LessonScreen lesson={pairedLesson} onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('radio', { name: correct.text }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    expect(screen.getByRole('status').getAttribute('data-result')).toBe('correct')

    cleanup()
    render(<LessonScreen lesson={pairedLesson} onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('radio', { name: incorrect.text }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))
    expect(screen.getByRole('status').getAttribute('data-result')).toBe('incorrect')
  })

  test('submits a neutral selected answer without pre-grading result decoration', () => {
    render(
      <MultipleChoiceQuestion
        questionId="neutral"
        questionPrompt="Choose."
        choices={choices}
        selectedChoiceId="correct"
        disabled={false}
        onSelectChoice={vi.fn()}
      />,
    )
    const selected = getAnswerContainer('Supported answer')
    expect(selected.classList.contains('answer-state-correct')).toBe(false)
    expect(selected.classList.contains('answer-state-incorrect')).toBe(false)
  })

  test('keeps correct and incorrect semantics for every active Grade 3 question type', () => {
    const packs = [
      { packId: 'g3-word-forge-suffix-shifter', expectedTypes: ['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'] },
      { packId: 'g3-word-forge-multisyllable-mountain', expectedTypes: ['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'] },
      { packId: 'g3-word-forge-fluency-flight', expectedTypes: ['HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'] },
      { packId: 'g3-story-scouts-character-arc-camp', expectedTypes: ['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'] },
      { packId: 'g3-story-scouts-theme-development-trail', expectedTypes: ['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'] },
      { packId: 'g3-story-scouts-perspective-portal', expectedTypes: ['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'] },
      { packId: 'g3-context-cavern-academic-word-workshop', expectedTypes: ['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'] },
      { packId: 'g3-context-cavern-root-meaning-vault', expectedTypes: ['EVIDENCE_PAIR', 'HOT_TEXT', 'MULTIPLE_CHOICE', 'MULTISELECT', 'TABLE_MATCH'] },
    ]
    for (const { packId, expectedTypes } of packs) {
      const questions = lessonCatalog
        .filter((entry) => entry.packId === packId)
        .flatMap((entry) => getLessonById(entry.lessonId).lesson?.questions ?? [])
      const byType = new Map(questions.map((question) => [question.questionType, question] as const))
      expect([...byType.keys()].sort()).toEqual(expectedTypes)

      for (const question of byType.values()) {
        const correct = evaluateAnswer(question, buildCanonicalSubmission(question))
        const adversarial = generateAdversarialSubmissions(question)[0]
        if (!adversarial) throw new Error(`${packId} question ${question.questionId} needs an adversarial response.`)
        const incorrect = evaluateAnswer(question, adversarial.submission)
        expect(correct.isCorrect, question.questionId).toBe(true)
        expect(incorrect.isCorrect, question.questionId).toBe(false)

        const view = render(<AnswerFeedback isCorrect={correct.isCorrect} explanation={correct.explanation} />)
        expect(screen.getByRole('status').getAttribute('data-result')).toBe('correct')
        expect(screen.getByRole('status').classList.contains('answer-feedback-incorrect')).toBe(false)
        view.rerender(<AnswerFeedback isCorrect={incorrect.isCorrect} explanation={incorrect.explanation} />)
        expect(screen.getByRole('status').getAttribute('data-result')).toBe('incorrect')
        expect(screen.getByRole('status').classList.contains('answer-feedback-correct')).toBe(false)
        view.unmount()
      }
    }
  }, 15_000)
})

function getAnswerContainer(text: string): HTMLElement {
  const container = screen.getByText(text).closest('label')
  if (!container) throw new Error(`No answer label for ${text}`)
  return container
}
