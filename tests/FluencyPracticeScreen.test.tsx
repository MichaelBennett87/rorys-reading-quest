import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { getLessonById } from '../src/domain/lesson'
import type { LessonQuestion } from '../src/domain/lesson'
import { FluencyPracticeScreen } from '../src/screens/FluencyPracticeScreen'

const cancel = vi.fn()
const speakText = vi.fn(async () => {})
let resolveSpeech: (() => void) | null = null
const speakSequence = vi.fn(
  () => new Promise<void>((resolve) => {
    resolveSpeech = () => {
      resolve()
      resolveSpeech = null
    }
  }),
)

vi.mock('../src/services/speech', async () => {
  const actual = await vi.importActual<typeof import('../src/services/speech')>('../src/services/speech')
  return {
    ...actual,
    createSpeechService: () => ({
      isSupported: () => true,
      speakText,
      speakSequence,
      cancel,
    }),
  }
})

afterEach(() => {
  cleanup()
  cancel.mockClear()
  speakText.mockClear()
  speakSequence.mockClear()
  resolveSpeech = null
})

describe('FluencyPracticeScreen', () => {
  test('guided practice opens inline with model reading, rereading, and the current question', async () => {
    const lesson = getLessonById('lesson-word-forge-fluency-practice-punctuation-pauses').lesson
    expect(lesson).toBeDefined()

    render(
      <FluencyPracticeScreen
        lesson={lesson!}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: /Punctuation Pauses/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Start Practice|Start Understanding Check|Save and Exit/i })).toBeNull()
    expect(screen.getByRole('heading', { name: /Passage Preview/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Hear a Model Read/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /I Practiced the Phrases/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Read It Once/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Check Answer/i }).getAttribute('disabled')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Hear a Model Read/i }))
    expect(speakSequence).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /Stop Voice/i }).getAttribute('disabled')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Stop Voice/i }))
    expect(cancel).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /I Practiced the Phrases/i }))
    const requiredReadCount = lesson!.fluencyPracticeBlock?.requiredReadCount ?? 1
    for (let index = 0; index < requiredReadCount; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? /Read It Once/i : /Read It Again/i }))
    }
    fireEvent.click(screen.getByRole('button', { name: /That felt smooth\./i }))
    fireEvent.click(screen.getByRole('radio', { name: /comma/i }))
    if (resolveSpeech) resolveSpeech()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Check Answer/i }).getAttribute('disabled')).toBeNull()
    })

    if (resolveSpeech) resolveSpeech()
  })

  test('keeps model listening optional while requiring the non-audio practice steps', async () => {
    const lesson = getLessonById('lesson-word-forge-fluency-practice-punctuation-pauses').lesson
    expect(lesson).toBeDefined()

    render(
      <FluencyPracticeScreen
        lesson={lesson!}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /I Practiced the Phrases/i }))
    const requiredReadCount = lesson!.fluencyPracticeBlock?.requiredReadCount ?? 1
    for (let index = 0; index < requiredReadCount; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? /Read It Once/i : /Read It Again/i }))
    }
    fireEvent.click(screen.getByRole('button', { name: /That felt smooth\./i }))
    fireEvent.click(screen.getByRole('radio', { name: /comma/i }))
    if (resolveSpeech) resolveSpeech()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Check Answer/i }).getAttribute('disabled')).toBeNull()
    })
    expect(speakSequence).not.toHaveBeenCalled()
  })

  test('enables an exact-set response without consulting the hidden answer count', async () => {
    const lesson = getLessonById('lesson-word-forge-fluency-practice-punctuation-pauses').lesson
    expect(lesson).toBeDefined()
    const baseQuestion = lesson!.questions[0]
    const multiselectQuestion = {
      ...baseQuestion,
      questionId: 'fluency-readiness-multiselect',
      questionType: 'MULTISELECT',
      prompt: 'Choose every punctuation mark that can signal a pause.',
      choices: [
        { id: 'comma', text: 'comma' },
        { id: 'period', text: 'period' },
        { id: 'letter', text: 'capital letter' },
      ],
      correctChoiceIds: ['comma', 'period'],
    } as LessonQuestion
    const multiselectLesson = {
      ...lesson!,
      questionCount: 1,
      questions: [multiselectQuestion],
    }

    render(
      <FluencyPracticeScreen
        lesson={multiselectLesson}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /I Practiced the Phrases/i }))
    const requiredReadCount = multiselectLesson.fluencyPracticeBlock?.requiredReadCount ?? 1
    for (let index = 0; index < requiredReadCount; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? /Read It Once/i : /Read It Again/i }))
    }
    fireEvent.click(screen.getByRole('button', { name: /That felt smooth\./i }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'comma' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Check Answer/i }).getAttribute('disabled')).toBeNull()
    })
  })
})
