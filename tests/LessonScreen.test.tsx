import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { LessonScreen } from '../src/screens/LessonScreen'
import { WordHelpPanel } from '../src/components/wordSupport'
import { sampleContent } from '../src/domain/content'
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

  test('a fluency lesson routes into practice controls from the lesson shell', () => {
    const lesson = getLessonById('lesson-word-forge-fluency-practice-punctuation-pauses').lesson
    expect(lesson).toBeDefined()

    render(
      <LessonScreen
        lesson={lesson!}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: /Punctuation Pauses/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }))
    expect(screen.getByRole('button', { name: /Hear a Model Read/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Read It Once/i })).toBeTruthy()
  })

  test('renders Compare Keep paired texts with accessible word help from both texts', () => {
    const lesson = getLessonById('lesson-compare-castle-compare-keep-checkpoint-literary-b').lesson
    expect(lesson).toBeDefined()

    render(
      <LessonScreen
        lesson={lesson!}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: /Preparing for a Shared Moment/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Text 1: Camp Lanterns/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Text 2: Before the Show/i })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Open word help for gathered/i }))
    expect(screen.getByRole('heading', { name: /Word Help/i })).toBeTruthy()
    expect(screen.getByText(/Help step 1 of 5/i)).toBeTruthy()
    expect(screen.getByText(/^Target word$/i)).toBeTruthy()
    expect(screen.getAllByText(/^gathered$/i).length).toBeGreaterThan(1)
    expect(screen.getAllByRole('button', {
      name: /Look at the Pattern|Break It Apart|Hear the Parts|Hear the Word|Hear the Sentence/i,
    })).toHaveLength(5)
    expect(screen.queryByRole('button', { name: /Blend It/i })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Close Word Help/i }))
    fireEvent.click(screen.getByRole('button', { name: /Open word help for careful$/i }))
    expect(screen.getByRole('heading', { name: /Word Help/i })).toBeTruthy()
    expect(screen.getByText(/Help step 1 of 5/i)).toBeTruthy()
    expect(screen.getByText(/^Target word$/i)).toBeTruthy()
    expect(screen.getAllByText(/^careful$/i).length).toBeGreaterThan(1)
    expect(screen.getAllByRole('heading', { name: /Word Help/i })).toHaveLength(1)
  })

  test('legacy level-4 support renders safely without exposing Blend It', () => {
    const target = sampleContent.passages
      .flatMap((passage) => passage.wordSupportTargets ?? [])
      .find((candidate) => candidate.surfaceWord === 'team')

    expect(target).toBeDefined()
    if (!target) return

    render(
      <WordHelpPanel
        target={target}
        level={4}
        speechSupported
        onRequestLevel={() => undefined}
        onStop={() => undefined}
        onClose={() => undefined}
        speechActive={false}
      />,
    )

    expect(screen.getByText(/Help step 4 of 5/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Hear the Word/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Blend It/i })).toBeNull()
  })

  test('shows Compare Keep evidence in both text areas after scoring', () => {
    const lesson = getLessonById('lesson-compare-castle-compare-keep-checkpoint-literary-b').lesson
    expect(lesson).toBeDefined()

    render(
      <LessonScreen
        lesson={lesson!}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('radio', { name: /Both texts show helpers getting ready with care\./i }))
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))

    expect(screen.getByText(/Great clue-finding!/i)).toBeTruthy()
    expect(screen.getByText(/They worked carefully so each camper would have a bright spot to sit\./i)).toBeTruthy()
    expect(screen.getByText(/Line 2: Hands checked strings, lanterns, and notes in a careful row\./i)).toBeTruthy()
  })
})
