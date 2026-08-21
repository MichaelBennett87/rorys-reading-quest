import type { DemoUnit, DemoWorld, UnitState, WorldStatus } from '../../data/demoWorlds'
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
    if (world.id === 'story-scouts' || world.id === 'poetry-planet') {
      return deriveTrackWorld(world, skillProgress, playableTrackIds)
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

function deriveTrackWorld(
  world: DemoWorld,
  skillProgress: QuestProgressV1['skillProgress'],
  playableTrackIds: Set<string>,
): DemoWorld {
  const track = getTrackByWorldId(world.id)
  const playable = Boolean(track && playableTrackIds.has(track.trackId))
  const progress = track
    ? skillProgress[track.skillId] ?? createInitialSkillProgress(track.skillId, track.initialDifficulty, track.initialLastMasteredDifficulty)
    : null
  const currentDifficulty = progress?.currentDifficulty ?? 1
  const status: WorldStatus = playable ? 'available' : 'coming-later'
  const units = world.units.map((unit, index) => {
    const unitState: UnitState = playable && index === 0 ? 'available' : 'locked'
    return {
      ...unit,
      state: unitState,
      difficultyLabel: playable && index === 0 ? `Trail ${currentDifficulty}` : 'Locked',
      progressPercent: playable && index === 0 ? 50 : 0,
      stars: playable && index === 0 ? 1 : 0,
    }
  })
  return {
    ...world,
    status,
    progressionLabel: playable ? `Trail ${currentDifficulty} active` : `${world.name} quests are being prepared.`,
    currentProgress: playable ? Math.min(100, currentDifficulty * 10) : 0,
    units,
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
