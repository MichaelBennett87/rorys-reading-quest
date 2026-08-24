import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { getLessonById } from '../src/domain/lesson'
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
  test('guided practice reveals model reading, phrase practice, rereading, and understanding check controls', async () => {
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

    expect(screen.getByRole('heading', { level: 1, name: /Punctuation Pauses/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }))

    expect(screen.getByRole('heading', { name: /Passage Preview/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Hear a Model Read/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /I Practiced the Phrases/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Read It Once/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Start Understanding Check/i }).getAttribute('disabled')).not.toBeNull()

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
    if (resolveSpeech) resolveSpeech()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Understanding Check/i }).getAttribute('disabled')).toBeNull()
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

    fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }))
    fireEvent.click(screen.getByRole('button', { name: /I Practiced the Phrases/i }))
    const requiredReadCount = lesson!.fluencyPracticeBlock?.requiredReadCount ?? 1
    for (let index = 0; index < requiredReadCount; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? /Read It Once/i : /Read It Again/i }))
    }
    fireEvent.click(screen.getByRole('button', { name: /That felt smooth\./i }))
    if (resolveSpeech) resolveSpeech()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Understanding Check/i }).getAttribute('disabled')).toBeNull()
    })
    expect(speakSequence).not.toHaveBeenCalled()
  })
})
