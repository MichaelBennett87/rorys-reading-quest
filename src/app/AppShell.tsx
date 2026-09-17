import { useCallback, useEffect, useRef, useState } from 'react'

import type { LessonDefinition } from '../domain/lesson'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  getActiveLessonCheckpointRevision,
  type ActiveLessonSession,
  type ActiveSessionCheckpointResponse,
} from '../persistence'
import { LessonScreen } from '../screens/LessonScreen'
import { ParentPlaceholderScreen } from '../screens/ParentPlaceholderScreen'
import { type ProgressionOutcomeViewModel, useQuestProgress } from './useQuestProgress'

interface LessonLaunchState {
  lesson: LessonDefinition | null
  session: ActiveLessonSession | null
  errors: string[]
  retryable: boolean
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
    retryable: true,
  })
  const [outcome, setOutcome] = useState<ProgressionOutcomeViewModel | null>(null)
  const journeyLaunchPendingRef = useRef(false)
  const prepareJourneyLaunchRef = useRef(questProgress.prepareJourneyLaunchCoordinated)
  const storageNotice = ['unavailable', 'invalid_json', 'unsupported_version', 'invalid_state', 'conflict', 'write_blocked', 'storage_error']
    .includes(questProgress.storageStatus)
    ? 'This browser could not safely update saved progress. Your earlier saved work was left unchanged.'
    : undefined

  useEffect(() => {
    journeyLaunchPendingRef.current = false
  }, [screen])

  useEffect(() => {
    prepareJourneyLaunchRef.current = questProgress.prepareJourneyLaunchCoordinated
  }, [questProgress.prepareJourneyLaunchCoordinated])

  const launchCurrentJourney = useCallback(async () => {
    if (journeyLaunchPendingRef.current) return
    journeyLaunchPendingRef.current = true
    const decision = await prepareJourneyLaunchRef.current()
    if (decision.status === 'resume' || decision.status === 'start') {
      setLessonState({ lesson: decision.lesson, session: decision.session, errors: [], retryable: true })
      setScreen('lesson_run')
      return
    }
    if (decision.status === 'content_needed') {
      journeyLaunchPendingRef.current = false
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
      journeyLaunchPendingRef.current = false
      setLessonState({ lesson: null, session: null, errors: [decision.reason], retryable: decision.retryable })
      setScreen('load_error')
    }
  }, [])

  const completeAndLaunchNext = async (
    result: Parameters<typeof questProgress.completeLesson>[0],
    completionId: string,
    expectedCheckpointRevision: number,
  ) => {
    const nextOutcome = await questProgress.completeLessonCoordinated(
      result,
      completionId,
      expectedCheckpointRevision,
    )
    if (!nextOutcome.persisted) {
      setLessonState((previous) => ({
        ...previous,
        errors: [nextOutcome.recoveryMessage
          ?? 'Rory\'s Reading Quest could not safely save that completed lesson. Your earlier saved progress is unchanged. Please retry.'],
        retryable: nextOutcome.recoveryRetryable ?? true,
      }))
      setScreen('load_error')
      return
    }
    journeyLaunchPendingRef.current = false
    await launchCurrentJourney()
  }

  useEffect(() => {
    if (screen !== 'rest') return

    const retryWhenVisible = () => {
      if (document.visibilityState !== 'visible' || isParentRoute()) return
      void launchCurrentJourney()
    }
    const retryAfterPageRestore = () => {
      if (isParentRoute()) return
      void launchCurrentJourney()
    }
    const retryAfterStorageChange = (event: StorageEvent) => {
      if (event.key !== QUEST_PROGRESS_STORAGE_KEY || isParentRoute()) return
      void launchCurrentJourney()
    }

    document.addEventListener('visibilitychange', retryWhenVisible)
    window.addEventListener('pageshow', retryAfterPageRestore)
    window.addEventListener('storage', retryAfterStorageChange)
    return () => {
      document.removeEventListener('visibilitychange', retryWhenVisible)
      window.removeEventListener('pageshow', retryAfterPageRestore)
      window.removeEventListener('storage', retryAfterStorageChange)
    }
  }, [screen, launchCurrentJourney])

  useEffect(() => {
    const syncRoute = () => {
      if (isParentRoute()) {
        journeyLaunchPendingRef.current = false
        setScreen('parent_gate')
        return
      }
      setScreen((current) => current === 'parent_gate' ? 'loading' : current)
    void launchCurrentJourney()
    }

    window.addEventListener('hashchange', syncRoute)
    syncRoute()
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [launchCurrentJourney])

  useEffect(() => {
    const reconcileActiveView = (event: StorageEvent) => {
      if (event.key !== QUEST_PROGRESS_STORAGE_KEY || isParentRoute()) return
      const latest = questProgress.refreshFromDurableStore()
      const active = latest.activeLessonSession
      if (
        screen === 'lesson_run'
        && active
        && lessonState.session?.sessionId === active.sessionId
        && getActiveLessonCheckpointRevision(lessonState.session) !== getActiveLessonCheckpointRevision(active)
      ) {
        setLessonState((previous) => ({ ...previous, session: active }))
        return
      }
      if (screen === 'lesson_run' && active?.sessionId !== lessonState.session?.sessionId) {
        journeyLaunchPendingRef.current = false
        void launchCurrentJourney()
      }
    }
    window.addEventListener('storage', reconcileActiveView)
    return () => window.removeEventListener('storage', reconcileActiveView)
  }, [launchCurrentJourney, lessonState.session, questProgress, screen])

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
          key={`${lessonState.session.sessionId}:${getActiveLessonCheckpointRevision(lessonState.session)}`}
          lesson={lessonState.lesson}
          session={lessonState.session}
          onSessionCheckpoint={async (session): Promise<ActiveSessionCheckpointResponse> => {
            const saved = await questProgress.saveActiveSessionCoordinated(session)
            const authoritative = saved.state.activeLessonSession
            if (saved.status === 'saved') {
              return { status: 'accepted', session: authoritative }
            }
            if (saved.status === 'unchanged') {
              return { status: 'unchanged', session: authoritative }
            }
            if (authoritative && authoritative.sessionId === session.sessionId) {
              setLessonState((previous) => ({ ...previous, session: authoritative }))
            } else if (saved.status !== 'persistence_failed') {
              journeyLaunchPendingRef.current = false
              void launchCurrentJourney()
            }
            return {
              status: saved.status === 'ignored_completed'
                ? 'already_completed'
                : saved.status === 'persistence_failed'
                  ? 'persistence_failed'
                  : 'stale',
              session: authoritative,
              ...('technicalDetail' in saved && saved.technicalDetail
                ? { technicalDetail: saved.technicalDetail }
                : {}),
            }
          }}
          onComplete={async (result, completionId, expectedCheckpointRevision) => {
            await completeAndLaunchNext(result, completionId, expectedCheckpointRevision)
          }}
          onBack={() => {
            journeyLaunchPendingRef.current = false
            setScreen('loading')
            void launchCurrentJourney()
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
          <h1>{lessonState.retryable ? "Let's try that reading again" : 'A grown-up needs to help'}</h1>
          <p>{lessonState.errors[0] ?? 'The next reading activity could not load safely.'}</p>
          {lessonState.retryable && (
            <button
              type="button"
              className="child-button primary-action"
              onClick={() => {
                journeyLaunchPendingRef.current = false
                setScreen('loading')
                void launchCurrentJourney()
              }}
            >
              Retry
            </button>
          )}
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
