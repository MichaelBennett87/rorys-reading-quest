export type AppScreen =
  | 'home'
  | 'world'
  | 'unit_select'
  | 'lesson_ready'
  | 'parent_gate'

export interface AppViewState {
  screen: AppScreen
  selectedWorldId: string | null
  selectedUnitId: string | null
  lessonPrepared: boolean
  screenHistory: AppScreen[]
}

export const initialAppViewState: AppViewState = {
  screen: 'home',
  selectedWorldId: null,
  selectedUnitId: null,
  lessonPrepared: false,
  screenHistory: [],
}
