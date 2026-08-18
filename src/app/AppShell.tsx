import { useState } from 'react'

import { demoLearner } from '../data/demoLearner'
import { demoWorlds, getDemoWorldById, getRecommendedWorldId } from '../data/demoWorlds'
import type { AppScreen } from './appView'
import { HomeScreen } from '../screens/HomeScreen'
import { LessonReadyScreen } from '../screens/LessonReadyScreen'
import { ParentPlaceholderScreen } from '../screens/ParentPlaceholderScreen'
import { UnitSelectScreen } from '../screens/UnitSelectScreen'
import { WorldScreen } from '../screens/WorldScreen'

interface AppShellState {
  screen: AppScreen
  selectedWorldId: string | null
  selectedUnitId: string | null
  lessonPrepared: boolean
}

export function AppShell() {
  const [state, setState] = useState<AppShellState>({
    screen: 'home',
    selectedWorldId: getRecommendedWorldId(),
    selectedUnitId: null,
    lessonPrepared: false,
  })
  const [, setHistory] = useState<AppScreen[]>([])

  const selectedWorld = state.selectedWorldId ? getDemoWorldById(state.selectedWorldId) : null
  const selectedUnit = selectedWorld ? selectedWorld.units.find((unit) => unit.id === state.selectedUnitId) : null

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
        lessonPrepared: false,
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
    setState((prev) => ({ ...prev, selectedWorldId: worldId, selectedUnitId: null, lessonPrepared: false }))
    navigate('world')
  }

  const openUnitSelect = () => {
    if (!selectedWorld) {
      return
    }
    setState((prev) => ({ ...prev, selectedUnitId: null, lessonPrepared: false }))
    navigate('unit_select')
  }

  const openLessonReady = (unitId: string) => {
    setState((prev) => ({ ...prev, selectedUnitId: unitId, lessonPrepared: false }))
    navigate('lesson_ready')
  }

  const openParentGate = () => {
    navigate('parent_gate')
  }

  const startQuest = () => {
    setState((prev) => ({ ...prev, lessonPrepared: true }))
  }

  if (state.screen === 'parent_gate') {
    return (
      <ParentPlaceholderScreen
        onBack={() => {
          setHistory([])
          setState((prev) => ({ ...prev, screen: 'home', lessonPrepared: false }))
        }}
      />
    )
  }

  if (state.screen === 'lesson_ready' && selectedWorld && selectedUnit) {
    return (
      <LessonReadyScreen
        world={selectedWorld}
        unit={selectedUnit}
        lessonPrepared={state.lessonPrepared}
        onBack={navigateBack}
        onStartQuest={startQuest}
      />
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
