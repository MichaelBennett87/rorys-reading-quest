import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { useQuestProgress } from '../../src/app/useQuestProgress'
import type { SaveActiveSessionResult } from '../../src/app/useQuestProgress'
import { LessonScreen } from '../../src/screens/LessonScreen'
import {
  buildLessonResult,
  evaluateAnswer,
  type LessonDefinition,
  type LessonQuestion,
  type LessonQuestionSubmission,
  type QuestionEvaluationResult,
} from '../../src/domain/lesson'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  advanceActiveLessonSession,
  checkpointQuestionDraft,
  checkpointSubmittedQuestion,
  getActiveLessonCheckpointRevision,
  runWithProgressWriteLock,
  type ActiveSessionCheckpointResponse,
  type ActiveLessonSession,
} from '../../src/persistence'

type Journey = ReturnType<typeof useQuestProgress>
type Hook = ReturnType<typeof renderHook<Journey, unknown>>

afterEach(() => {
  cleanup()
  window.localStorage.removeItem(QUEST_PROGRESS_STORAGE_KEY)
  vi.restoreAllMocks()
})

describe('same-session checkpoint authority', () => {
  test('missing Web Locks fails closed without running an uncoordinated mutation', async () => {
    const lockManager = navigator.locks
    const operation = vi.fn()
    Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined })
    try {
      const result = await runWithProgressWriteLock(operation)
      expect(result.status).toBe('unavailable')
      expect(operation).not.toHaveBeenCalled()
    } finally {
      Object.defineProperty(navigator, 'locks', { configurable: true, value: lockManager })
    }
  })

  test('rejects both stale writes after conflict adoption and accepts a fresh recovered action', async () => {
    const first = renderHook(() => useQuestProgress())
    const firstLaunch = await launch(first)
    const second = renderHook(() => useQuestProgress())
    const secondLaunch = await launch(second)
    expect(secondLaunch.session.sessionId).toBe(firstLaunch.session.sessionId)

    const evaluation = evaluate(firstLaunch.lesson.questions[0])
    const submitted = await save(second, checkpointSubmittedQuestion(
      secondLaunch.session,
      evaluation,
      0,
      '2026-09-17T20:00:01.000Z',
    ))
    expect(submitted.status).toBe('saved')
    const submittedSession = requiredSession(submitted)
    const advanced = await save(second, advanceActiveLessonSession(
      submittedSession,
      1,
      '2026-09-17T20:00:02.000Z',
    ))
    expect(advanced.status).toBe('saved')
    expect(requiredSession(advanced).currentQuestionIndex).toBe(1)
    const authoritativeRaw = storedRaw()

    const staleDraft = checkpointQuestionDraft(
      firstLaunch.session,
      firstLaunch.lesson.questions[0].questionId,
      firstChoice(firstLaunch.lesson.questions[0]),
      '2026-09-17T20:00:03.000Z',
    )
    const firstRejected = await save(first, staleDraft)
    expect(firstRejected.status).toBe('ignored_stale')
    expect(storedRaw()).toBe(authoritativeRaw)

    const secondObsolete = checkpointSubmittedQuestion(
      firstLaunch.session,
      evaluation,
      0,
      '2026-09-17T20:00:04.000Z',
    )
    const secondRejected = await save(first, secondObsolete)
    expect(secondRejected.status).toBe('ignored_stale')
    expect(storedRaw()).toBe(authoritativeRaw)

    const recovered = requiredSession(secondRejected)
    const currentQuestion = firstLaunch.lesson.questions[1]
    const fresh = await save(first, checkpointQuestionDraft(
      recovered,
      currentQuestion.questionId,
      firstChoice(currentQuestion),
      '2026-09-17T20:00:05.000Z',
    ))
    expect(fresh.status).toBe('saved')
    expect(requiredSession(fresh)).toMatchObject({ currentQuestionIndex: 1, checkpointRevision: 3 })
  })

  test('a stale draft cannot erase submitted feedback at the same question index', async () => {
    const first = renderHook(() => useQuestProgress())
    const launchA = await launch(first)
    const second = renderHook(() => useQuestProgress())
    const launchB = await launch(second)
    const evaluation = evaluate(launchB.lesson.questions[0])
    const accepted = await save(second, checkpointSubmittedQuestion(
      launchB.session,
      evaluation,
      0,
      '2026-09-17T20:01:00.000Z',
    ))
    const rawWithFeedback = storedRaw()

    const stale = await save(first, checkpointQuestionDraft(
      launchA.session,
      launchA.lesson.questions[0].questionId,
      firstChoice(launchA.lesson.questions[0]),
      '2026-09-17T20:01:01.000Z',
    ))
    expect(stale.status).toBe('ignored_stale')
    expect(storedRaw()).toBe(rawWithFeedback)
    expect(requiredSession(stale).submittedQuestions).toEqual(requiredSession(accepted).submittedQuestions)
    expect(requiredSession(stale).draftQuestion).toBeNull()
  })

  test('a delayed callback from an obsolete render cannot displace the authoritative question', async () => {
    const hook = renderHook(() => useQuestProgress())
    const launched = await launch(hook)
    const evaluation = evaluate(launched.lesson.questions[0])
    const submitted = {
      ...checkpointSubmittedQuestion(
        launched.session,
        evaluation,
        0,
        '2026-09-17T20:00:10.000Z',
      ),
      checkpointRevision: 1,
    }
    const authoritative = {
      ...advanceActiveLessonSession(submitted, 1, '2026-09-17T20:00:11.000Z'),
      checkpointRevision: 2,
    }
    let resolveCheckpoint!: (response: ActiveSessionCheckpointResponse) => void
    const delayedCheckpoint = vi.fn(() => new Promise<ActiveSessionCheckpointResponse>((resolve) => {
      resolveCheckpoint = resolve
    }))
    const view = render(
      <LessonScreen
        key={`${launched.session.sessionId}:0`}
        lesson={launched.lesson}
        session={launched.session}
        onBack={() => undefined}
        onComplete={() => undefined}
        onSessionCheckpoint={delayedCheckpoint}
      />,
    )
    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(delayedCheckpoint).toHaveBeenCalledTimes(1)

    view.rerender(
      <LessonScreen
        key={`${authoritative.sessionId}:2`}
        lesson={launched.lesson}
        session={authoritative}
        onBack={() => undefined}
        onComplete={() => undefined}
        onSessionCheckpoint={delayedCheckpoint}
      />,
    )
    expect(screen.getByText(/Question 2 of/i)).toBeTruthy()

    await act(async () => {
      resolveCheckpoint({
        status: 'stale',
        session: authoritative,
      })
      await Promise.resolve()
    })
    await waitFor(() => expect(screen.getByText(/Question 2 of/i)).toBeTruthy())
    expect(screen.queryByText(/Question 1 of/i)).toBeNull()
  })

  test('a stale checkpoint cannot remove accepted assistance', async () => {
    const first = renderHook(() => useQuestProgress())
    const launchA = await launch(first)
    const second = renderHook(() => useQuestProgress())
    const launchB = await launch(second)
    const assistance = {
      eventId: 'assistance-1',
      sessionId: launchB.session.sessionId,
      lessonId: launchB.session.lessonId,
      activityId: launchB.session.activityId,
      questionId: launchB.lesson.questions[0].questionId,
      targetId: 'target-1',
      assistanceKind: 'PATTERN_HIGHLIGHT' as const,
      assistanceLevel: 1 as const,
      occurredAt: '2026-09-17T20:02:00.000Z',
    }
    const accepted = await save(second, {
      ...launchB.session,
      assistanceEvents: [assistance],
      updatedAt: '2026-09-17T20:02:00.000Z',
    })
    expect(accepted.status).toBe('saved')

    const stale = await save(first, checkpointQuestionDraft(
      launchA.session,
      launchA.lesson.questions[0].questionId,
      firstChoice(launchA.lesson.questions[0]),
      '2026-09-17T20:02:01.000Z',
    ))
    expect(stale.status).toBe('ignored_stale')
    expect(requiredSession(stale).assistanceEvents).toEqual([assistance])
  })

  test('valid draft replacement and deselection advance revisions without remount semantics', async () => {
    const hook = renderHook(() => useQuestProgress())
    const launched = await launch(hook)
    const question = launched.lesson.questions[0]
    const firstDraft = checkpointQuestionDraft(
      launched.session,
      question.questionId,
      firstChoice(question),
      '2026-09-17T20:03:00.000Z',
    )
    const accepted = await save(hook, firstDraft)
    expect(requiredSession(accepted).checkpointRevision).toBe(1)

    const duplicate = await save(hook, firstDraft)
    expect(duplicate.status).toBe('unchanged')
    expect(requiredSession(duplicate).checkpointRevision).toBe(1)

    const deselected = await save(hook, checkpointQuestionDraft(
      requiredSession(duplicate),
      question.questionId,
      '',
      '2026-09-17T20:03:01.000Z',
    ))
    expect(deselected.status).toBe('saved')
    expect(requiredSession(deselected)).toMatchObject({ checkpointRevision: 2, draftQuestion: null })
  })

  test('future and malformed proposal revisions are rejected without changing durable bytes', async () => {
    const hook = renderHook(() => useQuestProgress())
    const launched = await launch(hook)
    const before = storedRaw()
    for (const checkpointRevision of [99, -1, Number.NaN]) {
      const rejected = await save(hook, {
        ...launched.session,
        checkpointRevision,
        draftQuestion: {
          questionId: launched.lesson.questions[0].questionId,
          answer: firstChoice(launched.lesson.questions[0]),
        },
      })
      expect(rejected.status).toBe('ignored_stale')
      expect(storedRaw()).toBe(before)
    }
  })

  test('a failed write does not advance the accepted revision or claim success', async () => {
    const hook = renderHook(() => useQuestProgress())
    const launched = await launch(hook)
    const before = storedRaw()
    const original = Storage.prototype.setItem
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === QUEST_PROGRESS_STORAGE_KEY) throw new Error('quota exceeded')
      return original.call(this, key, value)
    })
    const failed = await save(hook, checkpointQuestionDraft(
      launched.session,
      launched.lesson.questions[0].questionId,
      firstChoice(launched.lesson.questions[0]),
      '2026-09-17T20:04:00.000Z',
    ))
    expect(failed.status).toBe('persistence_failed')
    expect(requiredSession(failed).checkpointRevision).toBe(0)
    expect(storedRaw()).toBe(before)
    setItem.mockRestore()
  })

  test('legacy schema-v1 sessions normalize to revision zero and then save revision one', async () => {
    const bootstrap = renderHook(() => useQuestProgress())
    await launch(bootstrap)
    bootstrap.unmount()
    const legacy = JSON.parse(storedRaw())
    delete legacy.activeLessonSession.checkpointRevision
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(legacy))

    const resumed = renderHook(() => useQuestProgress())
    const decision = await launch(resumed)
    expect(getActiveLessonCheckpointRevision(decision.session)).toBe(0)
    const saved = await save(resumed, checkpointQuestionDraft(
      decision.session,
      decision.lesson.questions[0].questionId,
      firstChoice(decision.lesson.questions[0]),
      '2026-09-17T20:05:00.000Z',
    ))
    expect(requiredSession(saved).checkpointRevision).toBe(1)
  })

  test('simultaneous proposals from one base produce one winner and one stale result', async () => {
    const first = renderHook(() => useQuestProgress())
    const launchA = await launch(first)
    const second = renderHook(() => useQuestProgress())
    const launchB = await launch(second)
    const question = launchA.lesson.questions[0]
    const answers = visibleChoices(question)
    expect(answers.length).toBeGreaterThan(1)
    const proposals = [
      checkpointQuestionDraft(launchA.session, question.questionId, answers[0], '2026-09-17T20:06:00.000Z'),
      checkpointQuestionDraft(launchB.session, question.questionId, answers[1], '2026-09-17T20:06:00.001Z'),
    ]
    let results!: SaveActiveSessionResult[]
    await act(async () => {
      results = await Promise.all([
        first.result.current.saveActiveSessionCoordinated(proposals[0]),
        second.result.current.saveActiveSessionCoordinated(proposals[1]),
      ])
    })
    expect(results.map((result) => result.status).sort()).toEqual(['ignored_stale', 'saved'])
    const stored = JSON.parse(storedRaw())
    expect(stored.activeLessonSession.checkpointRevision).toBe(1)
    expect(answers).toContain(stored.activeLessonSession.draftQuestion.answer)
  })

  test('stale final completion is rejected and duplicate completion remains exact-once', async () => {
    const first = renderHook(() => useQuestProgress())
    const initial = await launch(first)
    const staleSession = initial.session
    const second = renderHook(() => useQuestProgress())
    const resumed = await launch(second)
    const completed = await checkpointEveryQuestion(second, resumed.lesson, resumed.session)
    const result = buildLessonResult({
      lessonId: resumed.lesson.lessonId,
      activityId: resumed.lesson.activityId,
      skillId: resumed.lesson.skillId,
      difficulty: resumed.lesson.difficulty,
      lessonRole: resumed.lesson.lessonRole,
      questionEvaluations: completed.evaluations,
      assistanceSummary: {
        totalUniqueEvents: 0,
        targetsHelped: 0,
        maximumAssistanceLevel: 0,
        visualHintUsed: false,
        spokenChunkHelpUsed: false,
        spokenWordHelpUsed: false,
        sentenceReadAloudUsed: false,
      },
    })

    let rejected!: Awaited<ReturnType<Journey['completeLessonCoordinated']>>
    await act(async () => {
      rejected = await first.result.current.completeLessonCoordinated(
        result,
        staleSession.sessionId,
        getActiveLessonCheckpointRevision(staleSession),
      )
    })
    expect(rejected.persisted).toBe(false)
    expect(first.result.current.progress.completedAttempts).toHaveLength(0)
    expect(first.result.current.progress.totalXp).toBe(0)

    let accepted!: Awaited<ReturnType<Journey['completeLessonCoordinated']>>
    await act(async () => {
      accepted = await second.result.current.completeLessonCoordinated(
        result,
        completed.session.sessionId,
        getActiveLessonCheckpointRevision(completed.session),
      )
    })
    expect(accepted.persisted).toBe(true)
    const afterAccepted = JSON.parse(storedRaw())
    expect(afterAccepted.completedAttempts).toHaveLength(1)

    let duplicate!: Awaited<ReturnType<Journey['completeLessonCoordinated']>>
    await act(async () => {
      duplicate = await first.result.current.completeLessonCoordinated(
        result,
        completed.session.sessionId,
        getActiveLessonCheckpointRevision(completed.session),
      )
    })
    expect(duplicate.earnedXp).toBe(0)
    expect(duplicate.earnedStars).toBe(0)
    const afterDuplicate = JSON.parse(storedRaw())
    expect(afterDuplicate.completedAttempts).toHaveLength(1)
    expect(afterDuplicate.totalXp).toBe(afterAccepted.totalXp)
    expect(afterDuplicate.totalStars).toBe(afterAccepted.totalStars)
  })
})

async function launch(hook: Hook) {
  let decision!: Awaited<ReturnType<Journey['prepareJourneyLaunchCoordinated']>>
  await act(async () => {
    decision = await hook.result.current.prepareJourneyLaunchCoordinated()
  })
  if (decision.status !== 'start' && decision.status !== 'resume') {
    throw new Error(`Expected a lesson, received ${decision.status}.`)
  }
  return decision
}

async function save(hook: Hook, session: ActiveLessonSession): Promise<SaveActiveSessionResult> {
  let result!: SaveActiveSessionResult
  await act(async () => {
    result = await hook.result.current.saveActiveSessionCoordinated(session)
  })
  return result
}

function requiredSession(result: SaveActiveSessionResult): ActiveLessonSession {
  const session = result.state.activeLessonSession
  if (!session) throw new Error('Expected an authoritative active lesson session.')
  return session
}

function storedRaw(): string {
  const raw = window.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY)
  if (!raw) throw new Error('Expected persisted quest progress.')
  return raw
}

function evaluate(question: LessonQuestion): QuestionEvaluationResult {
  return evaluateAnswer(question, canonicalSubmission(question))
}

function canonicalSubmission(question: LessonQuestion): LessonQuestionSubmission {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
      return { questionType: question.questionType, payload: { selectedChoiceId: question.correctChoiceIds[0] } }
    case 'MULTISELECT':
      return { questionType: question.questionType, payload: { selectedChoiceIds: [...question.correctChoiceIds] } }
    case 'HOT_TEXT':
      return { questionType: question.questionType, payload: { selectedSegmentIds: [...question.correctSegmentIds] } }
    case 'EVIDENCE_PAIR':
      return {
        questionType: question.questionType,
        payload: {
          partAChoiceId: question.partACorrectChoiceId,
          partBChoiceId: question.partBCorrectChoiceId,
        },
      }
    case 'TABLE_MATCH':
      return {
        questionType: question.questionType,
        payload: {
          selectedMappings: Object.fromEntries(question.rows.map((row) => [row.id, row.correctChoiceId])),
        },
      }
  }
}

function visibleChoices(question: LessonQuestion): string[] {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
    case 'MULTISELECT': return question.choices.map((choice) => choice.id)
    case 'HOT_TEXT': return question.segments.map((segment) => segment.id)
    case 'EVIDENCE_PAIR': return question.partAChoices.map((choice) => choice.id)
    case 'TABLE_MATCH': return question.rows[0]?.options.map((option) => option.id) ?? []
  }
}

function firstChoice(question: LessonQuestion): string | string[] | Record<string, string> {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE': return question.choices[0].id
    case 'MULTISELECT': return [question.choices[0].id]
    case 'HOT_TEXT': return [question.segments[0].id]
    case 'EVIDENCE_PAIR': return { partA: question.partAChoices[0].id, partB: question.partBChoices[0].id }
    case 'TABLE_MATCH': return { [question.rows[0].id]: question.rows[0].options[0].id }
  }
}

async function checkpointEveryQuestion(
  hook: Hook,
  lesson: LessonDefinition,
  startingSession: ActiveLessonSession,
): Promise<{ session: ActiveLessonSession; evaluations: QuestionEvaluationResult[] }> {
  let session = startingSession
  const evaluations: QuestionEvaluationResult[] = []
  for (const [index, question] of lesson.questions.entries()) {
    const evaluation = evaluate(question)
    evaluations.push(evaluation)
    const submitted = await save(hook, checkpointSubmittedQuestion(
      session,
      evaluation,
      index,
      `2026-09-17T21:00:${String(index * 2).padStart(2, '0')}.000Z`,
    ))
    session = requiredSession(submitted)
    if (index + 1 < lesson.questions.length) {
      const advanced = await save(hook, advanceActiveLessonSession(
        session,
        index + 1,
        `2026-09-17T21:00:${String(index * 2 + 1).padStart(2, '0')}.000Z`,
      ))
      session = requiredSession(advanced)
    }
  }
  return { session, evaluations }
}
