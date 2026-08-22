import type { DemoUnit, DemoWorld, UnitState } from '../../data/demoWorlds'
import { getLessonCatalogMetadata } from '../lesson'
import type { LessonActivityCandidate, SkillProgressState } from '../progression'
import { createInitialSkillProgress } from '../progression'
import type { QuestProgressV1 } from '../../persistence'
import { discoverPlayableTracks, normalizeQuestProgressForPlanning } from './curriculumPlanning'
import { getTrackBySkillId, getTrackByWorldId } from './curriculumTracks'

export function deriveWorldsForProgress(
  worlds: readonly DemoWorld[],
  progress: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
): DemoWorld[] {
  const normalized = normalizeQuestProgressForPlanning(progress, availableLessons)
  const skillProgress = normalized.state.skillProgress
  const playableTrackIds = new Set(discoverPlayableTracks(availableLessons).map((entry) => entry.track.trackId))
  const activeUnitId = progress.activeLessonSession ? getLessonCatalogMetadata(progress.activeLessonSession.lessonId)?.unitId ?? null : null
  const plannedUnitId = progress.plannedNextQuest?.status === 'available'
    ? getLessonCatalogMetadata(progress.plannedNextQuest.lesson.lessonId)?.unitId ?? null
    : null

  return worlds.map((world) => {
    if (world.id === 'word-forge') {
      return deriveWordForgeWorld(world, skillProgress, activeUnitId, plannedUnitId)
    }
    if (world.id === 'story-scouts') {
      return deriveStoryScoutsWorld(world, skillProgress, activeUnitId, plannedUnitId, playableTrackIds)
    }
    if (world.id === 'poetry-planet') {
      return derivePoetryPlanetWorld(world, skillProgress, activeUnitId, plannedUnitId, playableTrackIds)
    }
    return deriveNonPlayableWorld(world)
  })
}

function deriveWordForgeWorld(
  world: DemoWorld,
  skillProgress: QuestProgressV1['skillProgress'],
  activeUnitId: string | null,
  plannedUnitId: string | null,
): DemoWorld {
  const track = getTrackBySkillId('g2-word-forge-word-practice')
  const progress = track
    ? skillProgress[track.skillId] ?? createInitialSkillProgress(track.skillId, track.initialDifficulty, track.initialLastMasteredDifficulty)
    : createInitialSkillProgress('g2-word-forge-word-practice')
  const currentDifficulty = progress.currentDifficulty
  const units = world.units.map((unit) => {
    if (unit.id === 'wg-unit-1') return deriveWordForgeTrail1(unit, progress, plannedUnitId)
    if (unit.id === 'wg-unit-2') return deriveWordForgeTrail2(unit, progress, activeUnitId, plannedUnitId)
    if (unit.id === 'wg-unit-3') return deriveWordForgeTrail3(unit, progress, activeUnitId, plannedUnitId)
    if (unit.id === 'wg-unit-4') return deriveWordForgeTrail4(unit, progress, activeUnitId, plannedUnitId)
    if (unit.id === 'wg-unit-5') return deriveWordForgeTrail5(unit, progress, activeUnitId, plannedUnitId)
    if (unit.id === 'wg-unit-6') return deriveWordForgeTrail6(unit, progress, activeUnitId, plannedUnitId)
    return { ...unit }
  })

  return {
    ...world,
    status: 'available',
    progressionLabel: currentDifficulty >= 8 ? 'Trail 7 complete' : `Trail ${Math.max(1, Math.min(currentDifficulty, 7))} active`,
    currentProgress: Math.min(100, currentDifficulty * 12),
    units,
  }
}

function derivePoetryPlanetWorld(
  world: DemoWorld,
  skillProgress: QuestProgressV1['skillProgress'],
  activeUnitId: string | null,
  plannedUnitId: string | null,
  playableTrackIds: Set<string>,
): DemoWorld {
  const track = getTrackByWorldId(world.id)
  const playable = Boolean(track && playableTrackIds.has(track.trackId))
  const progress = track
    ? skillProgress[track.skillId] ?? createInitialSkillProgress(track.skillId, track.initialDifficulty, track.initialLastMasteredDifficulty)
    : null
  const currentDifficulty = progress?.currentDifficulty ?? 1
  const currentLearningState = progress?.currentLearningState ?? null
  const poetryRoutesActive = activeUnitId === 'pp-unit-1' || plannedUnitId === 'pp-unit-1'
  const units = world.units.map((unit) => {
    if (unit.id !== 'pp-unit-1') return { ...unit }
    return deriveRhymeRoutesUnit(unit, currentDifficulty, currentLearningState, poetryRoutesActive)
  })

  return {
    ...world,
    status: playable ? 'available' : 'coming-later',
    progressionLabel: playable
      ? currentDifficulty >= 2
        ? currentLearningState === 'SPACED_REVIEW'
          ? 'Rhyme Routes review available'
          : 'Rhyme Routes complete'
        : currentDifficulty === 1
          ? 'Rhyme Routes active'
          : 'Rhyme Routes Building Block active'
      : 'Poetry Planet quests are being prepared.',
    currentProgress: playable ? Math.min(100, Math.max(0, currentDifficulty) * 25 + 25) : 0,
    units,
  }
}

function deriveStoryScoutsWorld(
  world: DemoWorld,
  skillProgress: QuestProgressV1['skillProgress'],
  activeUnitId: string | null,
  plannedUnitId: string | null,
  playableTrackIds: Set<string>,
): DemoWorld {
  const track = getTrackByWorldId(world.id)
  const playable = Boolean(track && playableTrackIds.has(track.trackId))
  const progress = track
    ? skillProgress[track.skillId] ?? createInitialSkillProgress(track.skillId, track.initialDifficulty, track.initialLastMasteredDifficulty)
    : null
  const currentDifficulty = progress?.currentDifficulty ?? 1
  const currentLearningState = progress?.currentLearningState ?? null
  const storyMapActive = activeUnitId === 'ss-unit-1' || plannedUnitId === 'ss-unit-1'
  const themeTrailActive = activeUnitId === 'ss-unit-2' || plannedUnitId === 'ss-unit-2'
  const perspectivePortalActive = activeUnitId === 'ss-unit-3' || plannedUnitId === 'ss-unit-3'
  const units = world.units.map((unit) => {
    if (unit.id === 'ss-unit-1') return deriveStoryMapUnit(unit, currentDifficulty, currentLearningState, storyMapActive)
    if (unit.id === 'ss-unit-2') return deriveThemeTrailUnit(unit, currentDifficulty, currentLearningState, themeTrailActive)
    return derivePerspectivePortalUnit(unit, currentDifficulty, currentLearningState, perspectivePortalActive)
  })

  return {
    ...world,
    status: playable ? 'available' : 'coming-later',
    progressionLabel: playable
      ? currentDifficulty >= 4
        ? currentLearningState === 'SPACED_REVIEW'
          ? 'Perspective Portal review available'
          : 'Perspective Portal complete'
        : currentDifficulty === 3
          ? 'Perspective Portal active'
          : currentDifficulty === 2
            ? 'Theme Trail active'
            : currentDifficulty <= 0
              ? 'Building Block Trail active'
              : 'Story Map Trail 1 active'
      : 'Story Scouts quests are being prepared.',
    currentProgress: playable ? Math.min(100, Math.max(0, currentDifficulty) * 25 + 25) : 0,
    units,
  }
}

function deriveStoryMapUnit(
  unit: DemoUnit,
  currentDifficulty: number,
  currentLearningState: SkillProgressState['currentLearningState'] | null,
  activeOrPlanned: boolean,
): DemoUnit {
  const state: UnitState = currentDifficulty >= 2
    ? (currentLearningState === 'SPACED_REVIEW' ? 'review' : 'complete')
    : 'available'

  return {
    ...unit,
    state,
    difficultyLabel: currentDifficulty <= 0
      ? 'Building Block Trail'
      : currentDifficulty >= 2
        ? (state === 'review' ? 'Review' : 'Complete')
        : 'Trail 1',
    progressPercent: currentDifficulty <= 0 ? 25 : currentDifficulty === 1 ? 50 : 100,
    stars: currentDifficulty <= 0 ? 0 : currentDifficulty === 1 ? 1 : 3,
    practiceFocus: currentDifficulty <= 0
      ? 'building block story pieces and sequence'
      : currentDifficulty === 1
        ? 'plot structure, setting, characters, and sequence of events'
        : state === 'review'
          ? 'Review the story map clues and events.'
          : activeOrPlanned
            ? 'Story Map quests are ready to resume.'
            : 'Story Map quests are complete. Theme Trail quests are being prepared.',
  }
}

function deriveThemeTrailUnit(
  unit: DemoUnit,
  currentDifficulty: number,
  currentLearningState: SkillProgressState['currentLearningState'] | null,
  activeOrPlanned: boolean,
): DemoUnit {
  const state: UnitState = currentDifficulty < 2
    ? 'locked'
    : currentDifficulty >= 3
      ? (currentLearningState === 'SPACED_REVIEW' ? 'review' : 'complete')
      : 'available'
  return {
    ...unit,
    state,
    difficultyLabel: state === 'locked' ? 'Locked' : state === 'review' ? 'Review' : state === 'complete' ? 'Complete' : 'Trail 2',
    progressPercent: state === 'locked' ? 0 : state === 'available' ? 75 : 100,
    stars: state === 'locked' ? 0 : state === 'available' ? 2 : 3,
    practiceFocus: currentDifficulty < 2
      ? 'Complete Story Map to unlock Theme Trail.'
      : state === 'available'
        ? activeOrPlanned
          ? 'Theme Trail quests are ready to resume.'
          : 'theme, topic, summary, and literary details'
        : state === 'review'
          ? 'Review theme clues and supporting story details.'
          : 'Theme Trail quests are complete. Perspective Portal quests are being prepared.',
  }
}

function derivePerspectivePortalUnit(
  unit: DemoUnit,
  currentDifficulty: number,
  currentLearningState: SkillProgressState['currentLearningState'] | null,
  activeOrPlanned: boolean,
): DemoUnit {
  const state: UnitState = currentDifficulty < 3
    ? 'locked'
    : currentDifficulty >= 4
      ? (currentLearningState === 'SPACED_REVIEW' ? 'review' : 'complete')
      : 'available'
  return {
    ...unit,
    state,
    difficultyLabel: state === 'locked' ? 'Locked' : state === 'review' ? 'Review' : state === 'complete' ? 'Complete' : 'Trail 3',
    progressPercent: state === 'locked' ? 0 : state === 'available' ? 75 : 100,
    stars: state === 'locked' ? 0 : state === 'available' ? 2 : 3,
    practiceFocus: currentDifficulty < 3
      ? 'Complete Theme Trail to unlock Perspective Portal.'
      : state === 'available'
        ? activeOrPlanned
          ? 'Perspective Portal quests are ready to resume.'
          : 'character perspectives and supporting story clues'
        : state === 'review'
          ? 'Review character perspective clues and supporting details.'
          : 'Perspective Portal quests are complete. Poetry Planet quests are being prepared.',
  }
}

function deriveRhymeRoutesUnit(
  unit: DemoUnit,
  currentDifficulty: number,
  currentLearningState: SkillProgressState['currentLearningState'] | null,
  activeOrPlanned: boolean,
): DemoUnit {
  const state: UnitState = currentDifficulty < 2
    ? 'available'
    : currentDifficulty >= 2
      ? (currentLearningState === 'SPACED_REVIEW' ? 'review' : 'complete')
      : 'locked'

  return {
    ...unit,
    state,
    difficultyLabel: currentDifficulty <= 0
      ? 'Building Block'
      : currentDifficulty === 1
        ? 'Trail 1'
        : state === 'review'
          ? 'Review'
          : 'Complete',
    progressPercent: currentDifficulty <= 0 ? 25 : currentDifficulty === 1 ? 50 : 100,
    stars: currentDifficulty <= 0 ? 0 : currentDifficulty === 1 ? 1 : 3,
    practiceFocus: currentDifficulty <= 0
      ? 'end rhymes and line endings'
      : currentDifficulty === 1
        ? activeOrPlanned
          ? 'Rhyme Routes quests are ready to resume.'
          : 'line-end words, rhyme letters, and poem patterns'
        : state === 'review'
          ? 'Review rhyme letters and line-end clues.'
          : 'Rhyme Routes quests are complete. More poetry quests are being prepared.',
  }
}

function deriveNonPlayableWorld(world: DemoWorld): DemoWorld {
  return {
    ...world,
    status: world.status === 'locked' ? 'locked' : 'coming-later',
    currentProgress: 0,
    units: world.units.map((unit) => ({
      ...unit,
      state: 'locked' as UnitState,
      progressPercent: 0,
      stars: 0,
    })),
  }
}

function deriveWordForgeTrail1(unit: DemoUnit, progress: SkillProgressState, plannedUnitId: string | null): DemoUnit {
  const isReview = plannedUnitId === unit.id && progress.currentLearningState === 'SPACED_REVIEW'
  const state: UnitState = progress.currentDifficulty >= 3 ? (isReview ? 'review' : 'complete') : 'available'
  return {
    ...unit,
    state,
    difficultyLabel: progress.currentDifficulty >= 3 ? (state === 'review' ? 'Review' : 'Complete') : 'Trail 1',
    progressPercent: progress.currentDifficulty >= 3 ? 100 : progress.currentDifficulty === 2 ? 75 : 50,
    practiceFocus: progress.currentDifficulty >= 3 ? 'Review the vowel patterns you already know.' : 'vowel patterns and short decoding',
  }
}

function deriveWordForgeTrail2(
  unit: DemoUnit,
  progress: SkillProgressState,
  activeUnitId: string | null,
  plannedUnitId: string | null,
): DemoUnit {
  const activeOrPlanned = activeUnitId === unit.id || plannedUnitId === unit.id
  const state: UnitState = progress.currentDifficulty >= 5 && !activeOrPlanned
    ? (progress.currentLearningState === 'SPACED_REVIEW' ? 'review' : 'complete')
    : progress.currentDifficulty >= 3 || activeOrPlanned
      ? 'available'
      : 'locked'
  return {
    ...unit,
    state,
    difficultyLabel: progress.currentDifficulty >= 5
      ? (state === 'review' ? 'Review' : 'Complete')
      : progress.currentDifficulty >= 4
        ? 'Trail 4'
        : 'Trail 3',
    progressPercent: state === 'locked' ? 0 : progress.currentDifficulty >= 5 ? 100 : progress.currentDifficulty >= 4 ? 75 : 50,
    practiceFocus: state === 'locked'
      ? 'Complete Vowel Voyage to unlock Syllable Summit.'
      : progress.currentDifficulty >= 4
        ? 'consonant-le syllables and syllable review'
        : 'regularly spelled two-syllable words, open syllables, and closed syllables',
  }
}

function deriveWordForgeTrail3(
  unit: DemoUnit,
  progress: SkillProgressState,
  activeUnitId: string | null,
  plannedUnitId: string | null,
): DemoUnit {
  const activeOrPlanned = activeUnitId === unit.id || plannedUnitId === unit.id
  const state: UnitState = progress.currentDifficulty >= 6
    ? (activeOrPlanned ? 'available' : (progress.currentLearningState === 'SPACED_REVIEW' ? 'review' : 'complete'))
    : progress.currentDifficulty >= 5 || activeOrPlanned
      ? 'available'
      : 'locked'
  return {
    ...unit,
    state,
    difficultyLabel: progress.currentDifficulty >= 6
      ? (state === 'review' ? 'Review' : 'Complete')
      : progress.currentDifficulty >= 5
        ? 'Trail 5'
        : activeOrPlanned
          ? 'Trail 4'
          : 'Locked',
    progressPercent: state === 'locked' ? 0 : progress.currentDifficulty >= 6 ? 100 : 75,
    practiceFocus: state === 'locked'
      ? 'Complete Syllable Summit to unlock Prefix Power.'
      : progress.currentDifficulty >= 6
        ? 'Review common prefixes and base words.'
        : 'common prefixes and base words',
  }
}

function deriveWordForgeTrail4(
  unit: DemoUnit,
  progress: SkillProgressState,
  activeUnitId: string | null,
  plannedUnitId: string | null,
): DemoUnit {
  const activeOrPlanned = activeUnitId === unit.id || plannedUnitId === unit.id
  const state: UnitState = progress.currentDifficulty >= 7
    ? (activeOrPlanned ? 'available' : (progress.currentLearningState === 'SPACED_REVIEW' ? 'review' : 'complete'))
    : progress.currentDifficulty >= 6 || activeOrPlanned
      ? 'available'
      : 'locked'
  return {
    ...unit,
    state,
    difficultyLabel: progress.currentDifficulty >= 7
      ? (state === 'review' ? 'Review' : 'Complete')
      : progress.currentDifficulty >= 6
        ? 'Trail 6'
        : 'Locked',
    progressPercent: state === 'locked' ? 0 : progress.currentDifficulty >= 7 ? 100 : 75,
    practiceFocus: state === 'locked'
      ? 'Complete Prefix Power to unlock Suffix Station.'
      : progress.currentDifficulty >= 7
        ? 'New Word Forge quests are being prepared.'
        : 'common suffixes and ending sounds',
  }
}

function deriveWordForgeTrail5(
  unit: DemoUnit,
  progress: SkillProgressState,
  activeUnitId: string | null,
  plannedUnitId: string | null,
): DemoUnit {
  const activeOrPlanned = activeUnitId === unit.id || plannedUnitId === unit.id
  const state: UnitState = progress.currentDifficulty >= 8
    ? (activeOrPlanned ? 'available' : (progress.currentLearningState === 'SPACED_REVIEW' ? 'review' : 'complete'))
    : progress.currentDifficulty >= 7 || activeOrPlanned
      ? 'available'
      : 'locked'
  return {
    ...unit,
    state,
    difficultyLabel: progress.currentDifficulty >= 8
      ? (state === 'review' ? 'Review' : 'Complete')
      : progress.currentDifficulty >= 7
        ? 'Trail 7'
        : 'Locked',
    progressPercent: state === 'locked' ? 0 : progress.currentDifficulty >= 8 ? 100 : 75,
    practiceFocus: state === 'locked'
      ? 'Complete Suffix Station to unlock Quiet Letter Quest.'
      : progress.currentDifficulty >= 8
        ? 'Review silent-letter combinations and careful blending.'
        : 'silent-letter combinations and careful blending',
  }
}

function deriveWordForgeTrail6(
  unit: DemoUnit,
  progress: SkillProgressState,
  activeUnitId: string | null,
  plannedUnitId: string | null,
): DemoUnit {
  const activeOrPlanned = activeUnitId === unit.id || plannedUnitId === unit.id
  const isPracticeComplete = progress.currentLearningState === 'FLUENCY_PRACTICE'
  const state: UnitState = progress.currentDifficulty >= 8
    ? (activeOrPlanned
      ? 'available'
      : (progress.currentLearningState === 'SPACED_REVIEW'
        ? 'review'
        : isPracticeComplete
          ? 'complete'
          : 'available'))
    : 'locked'
  return {
    ...unit,
    state,
    difficultyLabel: progress.currentDifficulty >= 8
      ? (state === 'review' ? 'Review' : state === 'complete' ? 'Practice Complete' : 'Fluency Practice')
      : 'Locked',
    progressPercent: state === 'locked' ? 0 : state === 'complete' ? 100 : 75,
    practiceFocus: state === 'locked'
      ? 'Complete Quiet Letter Quest to unlock Fluency Flight.'
      : state === 'complete'
        ? 'Fluency Flight supports practice only while new reading worlds are prepared.'
        : 'modeled reading, phrase-cued reading, rereading, and self-monitoring',
  }
}
