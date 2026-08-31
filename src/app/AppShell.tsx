import { useEffect, useRef, useState } from 'react'

import { resolveActiveLearningFocus } from '../domain/curriculum'
import { demoLearner } from '../data/demoLearner'
import { deriveWorldsForProgress } from '../data/demoWorlds'
import { getLessonCandidates, type LessonDefinition } from '../domain/lesson'
import type { ActiveLessonSession } from '../persistence'
import { HomeScreen } from '../screens/HomeScreen'
import { LessonScreen } from '../screens/LessonScreen'
import { ParentPlaceholderScreen } from '../screens/ParentPlaceholderScreen'
import { ProgressionOutcomeScreen } from '../screens/ProgressionOutcomeScreen'
import type { AppScreen } from './appView'
import { type ProgressionOutcomeViewModel, useQuestProgress } from './useQuestProgress'

interface LessonLaunchState {
  lesson: LessonDefinition | null
  session: ActiveLessonSession | null
  errors: string[]
}

export function AppShell() {
  const questProgress = useQuestProgress()
  const availableLessons = getLessonCandidates()
  const activeFocus = resolveActiveLearningFocus({
    progress: questProgress.progress,
    availableLessons,
    now: new Date().toISOString(),
  })
  const worlds = deriveWorldsForProgress(questProgress.progress)
  const [screen, setScreen] = useState<AppScreen>('home')
  const [lessonState, setLessonState] = useState<LessonLaunchState>({
    lesson: null,
    session: null,
    errors: [],
  })
  const [outcome, setOutcome] = useState<ProgressionOutcomeViewModel | null>(null)
  const journeyLaunchPendingRef = useRef(false)

  useEffect(() => {
    journeyLaunchPendingRef.current = false
  }, [screen])

  const learner = {
    ...demoLearner,
    currentPath: activeFocus.displayName,
    level: activeFocus.difficulty || 1,
    xp: questProgress.progress.totalXp,
    stars: questProgress.progress.totalStars,
    questStreak: questProgress.progress.completedSessionCount,
  }

  const launchLesson = (lesson: LessonDefinition, session: ActiveLessonSession) => {
    setLessonState({ lesson, session, errors: [] })
    setScreen('lesson_run')
  }

  const showContentNeeded = (
    plan: Extract<ProgressionOutcomeViewModel['nextQuest'], { status: 'content_needed' }>,
    curriculumComplete = false,
  ) => {
    setOutcome({
      kind: 'CONTENT_NEEDED',
      earnedXp: 0,
      earnedStars: 0,
      currentDifficulty: plan.difficulty,
      completionId: 'content-needed',
      nextQuest: plan,
      curriculumComplete,
    })
    setScreen('progression_outcome')
  }

  const launchCurrentJourney = () => {
    if (journeyLaunchPendingRef.current) return
    journeyLaunchPendingRef.current = true
    const decision = questProgress.prepareJourneyLaunch()
    if (decision.status === 'resume' || decision.status === 'start') {
      launchLesson(decision.lesson, decision.session)
      return
    }
    if (decision.status === 'content_needed') {
      showContentNeeded(decision.plan, decision.curriculumComplete)
      return
    }
    if (decision.status === 'unavailable') {
      showContentNeeded({
        status: 'content_needed',
        purpose: 'progression',
        skillId: activeFocus.skillId ?? 'unknown',
        difficulty: decision.difficulty,
        reason: decision.reason,
      })
    }
  }

  if (screen === 'parent_gate') {
    return (
      <ParentPlaceholderScreen
        progress={questProgress.progress}
        onBack={() => setScreen('home')}
      />
    )
  }

  if (screen === 'progression_outcome' && outcome) {
    return (
      <ProgressionOutcomeScreen
        outcome={outcome}
        onContinueJourney={launchCurrentJourney}
        onBackHome={() => setScreen('home')}
      />
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
            const nextOutcome = questProgress.completeLesson(result, completionId)
            setOutcome(nextOutcome)
            setScreen('progression_outcome')
          }}
          onBack={() => setScreen('home')}
        />
      )
    }

    return (
      <section className="screen-shell">
        <header className="screen-header"><h1>Lesson content is not available</h1></header>
        <section className="card">
          <p>{lessonState.errors[0] ?? 'The next guided lesson is not available yet.'}</p>
        </section>
        <section className="screen-actions">
          <button type="button" className="child-button primary-action" onClick={() => setScreen('home')}>Back Home</button>
        </section>
      </section>
    )
  }

  const storageNotice = ['unavailable', 'invalid_json', 'unsupported_version', 'invalid_state', 'storage_error']
    .includes(questProgress.storageStatus)
    ? 'Your quest can continue safely, but this browser could not restore saved progress.'
    : undefined

  return (
    <HomeScreen
      learner={learner}
      worlds={worlds}
      currentWorldId={activeFocus.worldId ?? 'word-forge'}
      storageNotice={storageNotice}
      onStartJourney={launchCurrentJourney}
      onOpenParentArea={() => setScreen('parent_gate')}
    />
  )
}
