import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { LessonScreen } from '../src/screens/LessonScreen'
import { getLessonById } from '../src/domain/lesson'
import { createActiveLessonSession } from '../src/persistence'

afterEach(() => cleanup())

describe('LessonScreen guided teaching flow', () => {
  test('a fresh guided lesson begins at its teaching block and Start Practice advances to scored content', () => {
    const lesson = getLessonById('lesson-word-forge-ou-oi-oy-ow-guided-ou-ow-prereq').lesson
    expect(lesson).toBeDefined()

    render(
      <LessonScreen
        lesson={lesson!}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: /Look closely at ou and ow/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Start Practice/i })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /Reading Passage/i })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }))

    expect(screen.queryByRole('button', { name: /Start Practice/i })).toBeNull()
    expect(screen.getByRole('heading', { name: /Reading Passage/i })).toBeTruthy()
  })

  test('a checkpoint lesson starts directly with scored content', () => {
    const lesson = getLessonById('lesson-word-forge-ou-oi-oy-ow-checkpoint-a').lesson
    expect(lesson).toBeDefined()

    render(
      <LessonScreen
        lesson={lesson!}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    expect(screen.queryByRole('button', { name: /Start Practice/i })).toBeNull()
    expect(screen.getByRole('heading', { name: /Reading Passage/i })).toBeTruthy()
  })

  test('a resumed guided lesson with submitted questions skips repeated teaching', () => {
    const lesson = getLessonById('lesson-word-forge-ou-oi-oy-ow-guided-ou-ow-prereq').lesson
    expect(lesson).toBeDefined()

    const session = {
      ...createActiveLessonSession(lesson!, 'session-guided-resume', '2026-08-20T12:00:00.000Z'),
      currentQuestionIndex: 1,
      submittedQuestions: [
        {
          questionId: lesson!.questions[0].questionId,
          submittedAnswer: 'cloud-choice',
          isCorrect: true,
          isFirstAttemptCorrect: true,
        },
      ],
    }

    render(
      <LessonScreen
        lesson={lesson!}
        session={session}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    expect(screen.queryByRole('button', { name: /Start Practice/i })).toBeNull()
    expect(screen.getByRole('heading', { name: /Reading Passage/i })).toBeTruthy()
  })
})
