import { useState } from 'react'

import { demoLearner } from '../data/demoLearner'
import { deriveWorldsForProgress, getRecommendedWorldId } from '../data/demoWorlds'
import { getLessonById, getLessonCandidates, type LessonDefinition } from '../domain/lesson'
import { planUnitQuest } from '../domain/progression'
import type { ActiveLessonSession } from '../persistence'
import { HomeScreen } from '../screens/HomeScreen'
import { LessonReadyScreen } from '../screens/LessonReadyScreen'
import { LessonScreen } from '../screens/LessonScreen'
import { ParentPlaceholderScreen } from '../screens/ParentPlaceholderScreen'
import { ProgressionOutcomeScreen } from '../screens/ProgressionOutcomeScreen'
import { UnitSelectScreen } from '../screens/UnitSelectScreen'
import { WorldScreen } from '../screens/WorldScreen'
import type { AppScreen } from './appView'
import { type ProgressionOutcomeViewModel, useQuestProgress } from './useQuestProgress'

interface AppShellState {
  screen: AppScreen
  selectedWorldId: string | null
  selectedUnitId: string | null
}

interface LessonLaunchState {
  lesson: LessonDefinition | null
  session: ActiveLessonSession | null
  errors: string[]
}

export function AppShell() {
  const questProgress = useQuestProgress()
  const worlds = deriveWorldsForProgress(questProgress.progress)
  const [state, setState] = useState<AppShellState>({
    screen: 'home',
    selectedWorldId: getRecommendedWorldId(),
    selectedUnitId: null,
  })
  const [, setHistory] = useState<AppScreen[]>([])
  const [lessonState, setLessonState] = useState<LessonLaunchState>({
    lesson: null,
    session: null,
    errors: [],
  })
  const [outcome, setOutcome] = useState<ProgressionOutcomeViewModel | null>(null)

  const selectedWorld = state.selectedWorldId ? worlds.find((world) => world.id === state.selectedWorldId) ?? null : null
  const selectedUnit = selectedWorld ? selectedWorld.units.find((unit) => unit.id === state.selectedUnitId) : null
  const availableLessons = getLessonCandidates()
  const resolveLaunchState = (selectedUnitId?: string | null): LessonLaunchState => {
    if (selectedUnitId) {
      const plannedUnitQuest = planUnitQuest({
        selectedUnitId,
        progress: questProgress.progress,
        availableLessons,
      })

      if (plannedUnitQuest.status === 'locked' || plannedUnitQuest.status === 'content_needed') {
        return { lesson: null, session: null, errors: [plannedUnitQuest.reason] }
      }

      const selected = getLessonById(plannedUnitQuest.lesson.lessonId)
      if (selected.lesson) {
        return { lesson: selected.lesson, session: null, errors: [] }
      }

      return { lesson: null, session: null, errors: [selected.errors[0] ?? 'The planned quest is unavailable.'] }
    }

    const active = questProgress.progress.activeLessonSession
    if (active) {
      const resumed = getLessonById(active.lessonId)
      if (resumed.lesson) {
        return { lesson: resumed.lesson, session: active, errors: [] }
      }
    }

    const planned = questProgress.planContinue()
    if (planned.status === 'content_needed') {
      return { lesson: null, session: null, errors: [planned.reason] }
    }

    const selected = getLessonById(planned.lesson.lessonId)
    if (selected.lesson) {
      return { lesson: selected.lesson, session: null, errors: [] }
    }

    return { lesson: null, session: null, errors: [selected.errors[0] ?? 'The planned quest is unavailable.'] }
  }

  const lessonPreview = selectedUnit ? resolveLaunchState(selectedUnit.id) : null
  const activeSkill = Object.values(questProgress.progress.skillProgress)[0]
  const learner = {
    ...demoLearner,
    currentPath: activeSkill?.currentDifficulty === 0
      ? 'Word Forge Building Block'
      : `Word Forge Trail ${activeSkill?.currentDifficulty ?? 1}`,
    level: activeSkill?.currentDifficulty ?? 1,
    xp: questProgress.progress.totalXp,
    stars: questProgress.progress.totalStars,
    questStreak: questProgress.progress.completedSessionCount,
  }

  const navigate = (screen: AppScreen) => {
    setHistory((previous) => [...previous, state.screen])
    setState((previous) => ({ ...previous, screen }))
  }

  const navigateBack = () => {
    setHistory((previous) => {
      const nextHistory = previous.slice(0, -1)
      const previousScreen = previous.at(-1) ?? 'home'
      setState((current) => ({ ...current, screen: previousScreen }))
      return nextHistory
    })
  }

  const launchLesson = (lesson: LessonDefinition) => {
    const session = questProgress.beginLesson(lesson)
    setLessonState({ lesson, session, errors: [] })
    setState((previous) => ({
      ...previous,
      screen: 'lesson_run',
      selectedWorldId: lesson.worldId,
      selectedUnitId: lesson.unitId,
    }))
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
        skillId: activeSkill?.skillId ?? 'unknown',
        difficulty,
        reason,
      },
    })
    setState((previous) => ({ ...previous, screen: 'progression_outcome' }))
  }

  const handleContinue = () => {
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
    if (selected.lesson) launchLesson(selected.lesson)
    else showContentNeeded(selected.errors[0] ?? 'The planned quest is unavailable.', plan.lesson.difficulty)
  }

  const openWorld = (worldId: string) => {
    const world = worlds.find((entry) => entry.id === worldId)
    if (!world || world.status !== 'available') return
    setState((previous) => ({ ...previous, selectedWorldId: worldId, selectedUnitId: null }))
    navigate('world')
  }

  const openUnitSelect = () => {
    if (!selectedWorld) return
    setState((previous) => ({ ...previous, selectedUnitId: null }))
    navigate('unit_select')
  }

  const openLessonReady = (unitId: string) => {
    setState((previous) => ({ ...previous, selectedUnitId: unitId }))
    navigate('lesson_ready')
  }

  const startQuest = () => {
    const launch = resolveLaunchState(selectedUnit?.id ?? null)
    if (launch.lesson) {
      launchLesson(launch.lesson)
      return
    }
    setLessonState({ lesson: null, session: null, errors: launch.errors })
    navigate('lesson_run')
  }

  const startOutcomeQuest = () => {
    if (!outcome || outcome.nextQuest.status !== 'available') return
    const selected = getLessonById(outcome.nextQuest.lesson.lessonId)
    if (selected.lesson) launchLesson(selected.lesson)
    else showContentNeeded(selected.errors[0] ?? 'The next fresh quest is unavailable.', outcome.currentDifficulty)
  }

  if (state.screen === 'parent_gate') {
    return (
      <ParentPlaceholderScreen onBack={() => {
        setHistory([])
        setState((previous) => ({ ...previous, screen: 'home' }))
      }} progress={questProgress.progress} />
    )
  }

  if (state.screen === 'progression_outcome' && outcome) {
    return (
      <ProgressionOutcomeScreen
        outcome={outcome}
        onStartNext={startOutcomeQuest}
        onReturnToMap={() => {
          setHistory([])
          setState((previous) => ({ ...previous, screen: 'unit_select', selectedWorldId: 'word-forge' }))
        }}
      />
    )
  }

  if (state.screen === 'lesson_ready' && selectedWorld && selectedUnit) {
    return (
      <LessonReadyScreen
        world={selectedWorld}
        unit={selectedUnit}
        hasLesson={Boolean(lessonPreview?.lesson)}
        previewQuestionCount={lessonPreview?.lesson?.questionCount}
        unavailableMessage={lessonPreview?.errors[0]}
        onBack={navigateBack}
        onStartQuest={startQuest}
      />
    )
  }

  if (state.screen === 'lesson_run') {
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
            setState((previous) => ({ ...previous, screen: 'progression_outcome' }))
          }}
          onBack={() => {
            setHistory([])
            setState((previous) => ({ ...previous, screen: 'unit_select' }))
          }}
        />
      )
    }

    return (
      <section className="screen-shell">
        <header className="screen-header"><h1>Lesson content is not available</h1></header>
        <section className="card">
          <p>{lessonState.errors[0] ?? 'This unit has no configured lesson data for this phase.'}</p>
        </section>
        <section className="screen-actions">
          <button type="button" className="child-button primary-action" onClick={navigateBack}>Return to Unit</button>
        </section>
      </section>
    )
  }

  if (state.screen === 'unit_select' && selectedWorld) {
    return <UnitSelectScreen world={selectedWorld} onBack={navigateBack} onSelectUnit={openLessonReady} />
  }

  if (state.screen === 'world' && selectedWorld) {
    return <WorldScreen world={selectedWorld} onBack={navigateBack} onOpenUnitSelect={openUnitSelect} />
  }

  const storageNotice = ['unavailable', 'invalid_json', 'unsupported_version', 'invalid_state', 'storage_error']
    .includes(questProgress.storageStatus)
    ? 'Your quest can continue safely, but this browser could not restore saved progress.'
    : undefined
  return (
      <HomeScreen
        learner={learner}
        worlds={worlds}
        storageNotice={storageNotice}
        onContinue={handleContinue}
        onWorldSelect={openWorld}
      onOpenParentArea={() => navigate('parent_gate')}
    />
  )
}
