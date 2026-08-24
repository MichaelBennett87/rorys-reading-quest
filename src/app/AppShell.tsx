import { useState } from 'react'

import { resolveActiveLearningFocus } from '../domain/curriculum'
import { demoLearner } from '../data/demoLearner'
import { deriveWorldsForProgress } from '../data/demoWorlds'
import { getLessonById, getLessonCandidates, type LessonDefinition } from '../domain/lesson'
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

  const learner = {
    ...demoLearner,
    currentPath: activeFocus.displayName,
    level: activeFocus.difficulty || 1,
    xp: questProgress.progress.totalXp,
    stars: questProgress.progress.totalStars,
    questStreak: questProgress.progress.completedSessionCount,
  }

  const launchLesson = (lesson: LessonDefinition) => {
    const session = questProgress.beginLesson(lesson)
    setLessonState({ lesson, session, errors: [] })
    setScreen('lesson_run')
  }

  const showContentNeeded = (reason: string, difficulty: number) => {
    setOutcome({
      kind: 'CONTENT_NEEDED',
      earnedXp: 0,
      earnedStars: 0,
      currentDifficulty: difficulty,
      completionId: 'content-needed',
      nextQuest: {
        status: 'content_needed',
        purpose: 'progression',
        skillId: activeFocus.skillId ?? 'unknown',
        difficulty,
        reason,
      },
    })
    setScreen('progression_outcome')
  }

  const startJourney = () => {
    const active = questProgress.progress.activeLessonSession
    if (active) {
      const resumed = getLessonById(active.lessonId)
      if (resumed.lesson) {
        launchLesson(resumed.lesson)
        return
      }
    }

    const plan = questProgress.planContinue()
    if (plan.status === 'content_needed') {
      showContentNeeded(plan.reason, plan.difficulty)
      return
    }

    const selected = getLessonById(plan.lesson.lessonId)
    if (selected.lesson) {
      launchLesson(selected.lesson)
      return
    }

    showContentNeeded(selected.errors[0] ?? 'The planned quest is unavailable.', plan.lesson.difficulty)
  }

  const continueJourney = () => {
    if (!outcome || outcome.nextQuest.status !== 'available') return
    const selected = getLessonById(outcome.nextQuest.lesson.lessonId)
    if (selected.lesson) {
      launchLesson(selected.lesson)
      return
    }
    showContentNeeded(selected.errors[0] ?? 'The next fresh quest is unavailable.', outcome.currentDifficulty)
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
        onContinueJourney={continueJourney}
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
            setLessonState((previous) => ({ ...previous, session }))
            questProgress.saveActiveSession(session)
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
      onStartJourney={startJourney}
      onOpenParentArea={() => setScreen('parent_gate')}
    />
  )
}
