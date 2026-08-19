import { useState } from 'react'

import { demoLearner } from '../data/demoLearner'
import { demoWorlds, getDemoWorldById, getRecommendedWorldId } from '../data/demoWorlds'
import { getLessonForUnit, type LessonDefinition } from '../domain/lesson'
import type { AppScreen } from './appView'
import { HomeScreen } from '../screens/HomeScreen'
import { LessonReadyScreen } from '../screens/LessonReadyScreen'
import { LessonScreen } from '../screens/LessonScreen'
import { ParentPlaceholderScreen } from '../screens/ParentPlaceholderScreen'
import { UnitSelectScreen } from '../screens/UnitSelectScreen'
import { WorldScreen } from '../screens/WorldScreen'

interface AppShellState {
  screen: AppScreen
  selectedWorldId: string | null
  selectedUnitId: string | null
}

interface LessonLaunchState {
  lesson: LessonDefinition | null
  errors: string[]
}

export function AppShell() {
  const [state, setState] = useState<AppShellState>({
    screen: 'home',
    selectedWorldId: getRecommendedWorldId(),
    selectedUnitId: null,
  })
  const [, setHistory] = useState<AppScreen[]>([])
  const [lessonState, setLessonState] = useState<LessonLaunchState>({ lesson: null, errors: [] })

  const selectedWorld = state.selectedWorldId ? getDemoWorldById(state.selectedWorldId) : null
  const selectedUnit = selectedWorld ? selectedWorld.units.find((unit) => unit.id === state.selectedUnitId) : null
  const lessonPreview = selectedUnit ? getLessonForUnit(selectedUnit.id) : null

  const navigate = (screen: AppScreen) => {
    setHistory((prev) => [...prev, state.screen])
    setState((prev) => ({ ...prev, screen }))
  }

  const navigateBack = () => {
    setHistory((prev) => {
      const nextHistory = prev.slice(0, -1)
      const previous = prev.at(-1) ?? 'home'
      setState((currentState) => ({
        ...currentState,
        screen: previous,
      }))
      return nextHistory
    })
  }

  const handleContinue = () => {
    const recommendedWorld = getDemoWorldById(getRecommendedWorldId())
    if (!recommendedWorld) {
      return
    }
    if (recommendedWorld.status === 'available') {
      setState((prev) => ({ ...prev, selectedWorldId: recommendedWorld.id }))
      navigate('world')
    }
  }

  const openWorld = (worldId: string) => {
    const world = getDemoWorldById(worldId)
    if (!world || world.status !== 'available') {
      return
    }
    setState((prev) => ({ ...prev, selectedWorldId: worldId, selectedUnitId: null }))
    navigate('world')
  }

  const openUnitSelect = () => {
    if (!selectedWorld) {
      return
    }
    setState((prev) => ({ ...prev, selectedUnitId: null }))
    navigate('unit_select')
  }

  const openLessonReady = (unitId: string) => {
    setState((prev) => ({ ...prev, selectedUnitId: unitId }))
    navigate('lesson_ready')
  }

  const openParentGate = () => {
    navigate('parent_gate')
  }

  const startQuest = () => {
    const launchResult = getLessonForUnit(state.selectedUnitId ?? '')
    if (launchResult.lesson) {
      setLessonState({ lesson: launchResult.lesson, errors: [] })
    } else {
      setLessonState({ lesson: null, errors: launchResult.errors })
    }
    navigate('lesson_run')
  }

  if (state.screen === 'parent_gate') {
    return (
      <ParentPlaceholderScreen
        onBack={() => {
          setHistory([])
          setState((prev) => ({ ...prev, screen: 'home' }))
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

  if (state.screen === 'lesson_run' && selectedWorld && selectedUnit) {
    if (lessonState.lesson) {
      return (
        <LessonScreen
          lesson={lessonState.lesson}
          onBack={() => {
            setHistory([])
            setState((prev) => ({ ...prev, screen: 'unit_select' }))
          }}
        />
      )
    }

    return (
      <section className="screen-shell">
        <header className="screen-header">
          <h1>{selectedUnit.title}</h1>
          <p>{selectedWorld.name}</p>
        </header>
        <section className="card">
          <h2>Lesson content is not available</h2>
          <p>
            {lessonState.errors[0] ?? 'This unit has no configured lesson data for this phase.'}
          </p>
        </section>
        <section className="screen-actions">
          <button type="button" className="child-button primary-action" onClick={navigateBack}>
            Return to Unit
          </button>
        </section>
      </section>
    )
  }

  if (state.screen === 'unit_select' && selectedWorld) {
    return (
      <UnitSelectScreen
        world={selectedWorld}
        onBack={navigateBack}
        onSelectUnit={openLessonReady}
      />
    )
  }

  if (state.screen === 'world' && selectedWorld) {
    return (
      <WorldScreen
        world={selectedWorld}
        onBack={navigateBack}
        onOpenUnitSelect={openUnitSelect}
      />
    )
  }

  return (
    <HomeScreen
      learner={demoLearner}
      worlds={demoWorlds}
      onContinue={handleContinue}
      onWorldSelect={openWorld}
      onOpenParentArea={openParentGate}
    />
  )
}
