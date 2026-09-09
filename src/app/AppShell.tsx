import { useCallback, useEffect, useRef, useState } from 'react'

import type { LessonDefinition } from '../domain/lesson'
import type { ActiveLessonSession } from '../persistence'
import { LessonScreen } from '../screens/LessonScreen'
import { ParentPlaceholderScreen } from '../screens/ParentPlaceholderScreen'
import { type ProgressionOutcomeViewModel, useQuestProgress } from './useQuestProgress'

interface LessonLaunchState {
  lesson: LessonDefinition | null
  session: ActiveLessonSession | null
  errors: string[]
}

type QuestionFirstScreen = 'loading' | 'lesson_run' | 'rest' | 'load_error' | 'parent_gate'

function isParentRoute() {
  return typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#/parent'
}

export function AppShell() {
  const questProgress = useQuestProgress()
  const [screen, setScreen] = useState<QuestionFirstScreen>(() => isParentRoute() ? 'parent_gate' : 'loading')
  const [lessonState, setLessonState] = useState<LessonLaunchState>({
    lesson: null,
    session: null,
    errors: [],
  })
  const [outcome, setOutcome] = useState<ProgressionOutcomeViewModel | null>(null)
  const journeyLaunchPendingRef = useRef(false)
  const prepareJourneyLaunchRef = useRef(questProgress.prepareJourneyLaunch)
  const storageNotice = ['unavailable', 'invalid_json', 'unsupported_version', 'invalid_state', 'conflict', 'write_blocked', 'storage_error']
    .includes(questProgress.storageStatus)
    ? 'This browser could not safely update saved progress. Your earlier saved work was left unchanged.'
    : undefined

  useEffect(() => {
    journeyLaunchPendingRef.current = false
  }, [screen])

  useEffect(() => {
    prepareJourneyLaunchRef.current = questProgress.prepareJourneyLaunch
  }, [questProgress.prepareJourneyLaunch])

  const launchCurrentJourney = useCallback(() => {
    if (journeyLaunchPendingRef.current) return
    journeyLaunchPendingRef.current = true
    const decision = prepareJourneyLaunchRef.current()
    if (decision.status === 'resume' || decision.status === 'start') {
      setLessonState({ lesson: decision.lesson, session: decision.session, errors: [] })
      setScreen('lesson_run')
      return
    }
    if (decision.status === 'content_needed') {
      setOutcome({
        persisted: true,
        kind: 'CONTENT_NEEDED',
        earnedXp: 0,
        earnedStars: 0,
        currentDifficulty: decision.plan.difficulty,
        completionId: 'content-needed',
        nextQuest: decision.plan,
        curriculumComplete: decision.curriculumComplete,
      })
      setScreen('rest')
      return
    }
    if (decision.status === 'unavailable') {
      setLessonState({ lesson: null, session: null, errors: [decision.reason] })
      setScreen('load_error')
    }
  }, [])

  const completeAndLaunchNext = (result: Parameters<typeof questProgress.completeLesson>[0], completionId: string) => {
    const nextOutcome = questProgress.completeLesson(result, completionId)
    if (!nextOutcome.persisted) {
      setLessonState((previous) => ({
        ...previous,
        errors: ['Rory\'s Reading Quest could not safely save that completed lesson. Your earlier saved progress is unchanged. Please retry.'],
      }))
      setScreen('load_error')
      return
    }
    if (nextOutcome.nextQuest.status === 'content_needed') {
      setOutcome(nextOutcome)
      setScreen('rest')
      return
    }
    journeyLaunchPendingRef.current = false
    launchCurrentJourney()
  }

  useEffect(() => {
    const syncRoute = () => {
      if (isParentRoute()) {
        journeyLaunchPendingRef.current = false
        setScreen('parent_gate')
        return
      }
      setScreen((current) => current === 'parent_gate' ? 'loading' : current)
      launchCurrentJourney()
    }

    window.addEventListener('hashchange', syncRoute)
    syncRoute()
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [launchCurrentJourney])

  if (screen === 'parent_gate') {
    return (
      <ParentPlaceholderScreen
        progress={questProgress.progress}
        onBack={() => {
          window.location.hash = ''
        }}
      />
    )
  }

  if (screen === 'rest' && outcome) {
    return (
      <main className="question-first-status" aria-live="polite">
        <section className="question-first-status-card">
          <p className="question-first-mark">Rory's Reading Quest</p>
          <h1>{outcome.curriculumComplete ? 'Grade 3 Journey Complete!' : 'Reading Rest'}</h1>
          <p>
            {outcome.curriculumComplete
              ? "You completed every reading trail currently in Rory's Reading Quest. Reviews will appear when they are ready."
              : 'There is no new reading activity ready right now. Your completed work is safely saved.'}
          </p>
        </section>
      </main>
    )
  }

  if (screen === 'lesson_run') {
    if (lessonState.lesson && lessonState.session) {
      return (
        <LessonScreen
          key={lessonState.session.sessionId}
          lesson={lessonState.lesson}
          session={lessonState.session}
          onSessionCheckpoint={(session) => {
            const saved = questProgress.saveActiveSession(session)
            if (saved.status === 'saved') {
              setLessonState((previous) => ({ ...previous, session }))
            }
          }}
          onComplete={(result, completionId) => {
            completeAndLaunchNext(result, completionId)
          }}
          onBack={() => {
            journeyLaunchPendingRef.current = false
            setScreen('loading')
            launchCurrentJourney()
          }}
          storageNotice={storageNotice}
        />
      )
    }
  }

  if (screen === 'load_error') {
    return (
      <main className="question-first-status" aria-live="assertive">
        <section className="question-first-status-card">
          <p className="question-first-mark">Rory's Reading Quest</p>
          <h1>Let's try that reading again</h1>
          <p>{lessonState.errors[0] ?? 'The next reading activity could not load safely.'}</p>
          <button
            type="button"
            className="child-button primary-action"
            onClick={() => {
              journeyLaunchPendingRef.current = false
              setScreen('loading')
              launchCurrentJourney()
            }}
          >
            Retry
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="question-first-status" aria-live="polite" aria-busy="true">
      <section className="question-first-status-card">
        <p className="question-first-mark">Rory's Reading Quest</p>
        <h1>Finding your next reading question...</h1>
        {storageNotice && <p className="storage-notice">{storageNotice}</p>}
      </section>
    </main>
  )
}
