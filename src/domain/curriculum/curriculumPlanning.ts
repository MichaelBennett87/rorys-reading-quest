import { getLessonById, getLessonCatalogMetadata } from '../lesson'
import {
  createInitialSkillProgress,
  selectNextLesson,
  type LessonActivityCandidate,
  type NextQuestPlan,
  type SkillProgressState,
} from '../progression'
import { resolveReviewAffinity } from '../progression/reviewQueueAffinity'
import type { QuestProgressV1 } from '../../persistence'
import type {
  ActiveLearningFocus,
  ActiveLearningFocusSource,
  CurriculumTrackDefinition,
  PlayableTrackDiscovery,
} from './curriculumTrackTypes'
import {
  curriculumTracks,
  getTrackBySkillId,
  getTrackByUnitId,
} from './curriculumTracks'

export interface NormalizeQuestProgressForPlanningResult {
  state: QuestProgressV1
  changed: boolean
}

export interface PlanGlobalQuestInput {
  progress: QuestProgressV1
  availableLessons: readonly LessonActivityCandidate[]
  now: string
}

export interface GlobalQuestPlan {
  status: NextQuestPlan['status']
  purpose: NextQuestPlan['purpose']
  nextQuest: NextQuestPlan
  skillId: string | null
  worldId: string | null
  unitId: string | null
  difficulty: number
  displayName: string
  source: ActiveLearningFocusSource
  lesson: LessonActivityCandidate | null
  reason?: string
}

const ACTIVE_LEARNING_STATES: readonly SkillProgressState['currentLearningState'][] = [
  'REMEDIATE_PREREQUISITE',
  'GUIDED_PRACTICE',
  'VERIFY_MASTERY',
] as const

const ACTIVE_LEARNING_STATE_SET = new Set<SkillProgressState['currentLearningState']>(ACTIVE_LEARNING_STATES)

export function discoverPlayableTracks(
  availableLessons: readonly LessonActivityCandidate[],
  tracks: readonly CurriculumTrackDefinition[] = curriculumTracks,
): PlayableTrackDiscovery[] {
  return tracks
    .map((track) => ({
      track,
      activeLessonCandidates: availableLessons
        .filter((lesson) => (
          lesson.skillId === track.skillId
          && lesson.gradeBand === track.gradeBand
          && lesson.worldId === track.worldId
          && (track.unitIds ?? [track.entryUnitId]).includes(lesson.unitId)
        ))
        .filter((lesson) => lesson.eligiblePurposes.includes('progression')),
    }))
    .filter((entry) => entry.activeLessonCandidates.length > 0)
    .sort((left, right) => compareTrackDefinitions(left.track, right.track))
}

export function areTrackPrerequisitesSatisfied(
  track: CurriculumTrackDefinition,
  state: QuestProgressV1,
  tracks: readonly CurriculumTrackDefinition[] = curriculumTracks,
): boolean {
  const knownTrackIds = new Set(tracks.map((candidate) => candidate.trackId))
  return track.prerequisiteTrackIds.every((prerequisiteTrackId) => {
    if (!knownTrackIds.has(prerequisiteTrackId)) return false
    const prerequisite = tracks.find((candidate) => candidate.trackId === prerequisiteTrackId) ?? null
    if (!prerequisite) return false
    const progress = state.skillProgress[prerequisite.skillId]
    return Boolean(progress && progress.currentDifficulty >= prerequisite.completionDifficulty)
  })
}

export function isCurriculumTrackPlayable(
  track: CurriculumTrackDefinition,
  state: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
  tracks: readonly CurriculumTrackDefinition[] = curriculumTracks,
): boolean {
  const hasActiveContent = availableLessons.some((lesson) => (
    lesson.skillId === track.skillId
    && lesson.gradeBand === track.gradeBand
    && lesson.worldId === track.worldId
    && (track.unitIds ?? [track.entryUnitId]).includes(lesson.unitId)
    && lesson.eligiblePurposes.includes('progression')
  ))
  return hasActiveContent && areTrackPrerequisitesSatisfied(track, state, tracks)
}

export function discoverPlayableTracksForState(
  state: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
  tracks: readonly CurriculumTrackDefinition[] = curriculumTracks,
): PlayableTrackDiscovery[] {
  return discoverPlayableTracks(availableLessons, tracks)
    .filter(({ track }) => isCurriculumTrackPlayable(track, state, availableLessons, tracks))
}

export function ensureProgressForPlayableTracks(
  state: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
  tracks: readonly CurriculumTrackDefinition[] = curriculumTracks,
): NormalizeQuestProgressForPlanningResult {
  const playableTracks = discoverPlayableTracksForState(state, availableLessons, tracks).map((entry) => entry.track)
  if (playableTracks.length === 0) {
    return { state, changed: false }
  }

  const nextSkillProgress: QuestProgressV1['skillProgress'] = { ...state.skillProgress }
  let changed = false

  for (const track of playableTracks) {
    if (nextSkillProgress[track.skillId]) continue
    nextSkillProgress[track.skillId] = createInitialSkillProgress(
      track.skillId,
      track.initialDifficulty,
      track.initialLastMasteredDifficulty,
    )
    changed = true
  }

  if (!changed) return { state, changed: false }

  return {
    state: {
      ...state,
      skillProgress: nextSkillProgress,
    },
    changed: true,
  }
}

export function normalizePlannedNextQuest(
  state: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
): NormalizeQuestProgressForPlanningResult {
  const planned = state.plannedNextQuest
  if (!planned) {
    return { state, changed: false }
  }

  if (planned.status === 'content_needed') {
    return {
      state: {
        ...state,
        plannedNextQuest: null,
      },
      changed: true,
    }
  }

  if (!isValidPlannedQuest(state, planned, availableLessons)) {
    return {
      state: {
        ...state,
        plannedNextQuest: null,
      },
      changed: true,
    }
  }

  return { state, changed: false }
}

export function normalizeQuestProgressForPlanning(
  state: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
): NormalizeQuestProgressForPlanningResult {
  const ensured = ensureProgressForPlayableTracks(state, availableLessons)
  const planned = normalizePlannedNextQuest(ensured.state, availableLessons)
  return ensured.changed || planned.changed
    ? { state: planned.state, changed: true }
    : { state, changed: false }
}

export function planGlobalQuest(input: PlanGlobalQuestInput): GlobalQuestPlan {
  const normalized = normalizeQuestProgressForPlanning(input.progress, input.availableLessons)
  const state = normalized.state
  const playableTracks = discoverPlayableTracksForState(state, input.availableLessons)

  const activeSessionPlan = resolveActiveSessionPlan(state, input.availableLessons)
  if (activeSessionPlan) return activeSessionPlan

  const urgentPlannedQuest = state.plannedNextQuest?.status === 'available'
    && ['verification', 'remediation', 'review'].includes(state.plannedNextQuest.purpose)
    && isValidPlannedQuest(state, state.plannedNextQuest, input.availableLessons)
    ? buildPlanFromLesson(state.plannedNextQuest.lesson, state.plannedNextQuest.purpose, 'planned_quest')
    : null
  if (urgentPlannedQuest) return urgentPlannedQuest

  const dueReview = chooseDueReview(state, input.availableLessons, playableTracks, input.now)
  if (dueReview) return dueReview

  const activeStatePlan = chooseActiveStatePlan(state, input.availableLessons, playableTracks)
  if (activeStatePlan) return activeStatePlan

  const ordinaryPlan = state.plannedNextQuest?.status === 'available'
    && state.plannedNextQuest.purpose === 'progression'
    && isValidPlannedQuest(state, state.plannedNextQuest, input.availableLessons)
    ? buildPlanFromLesson(state.plannedNextQuest.lesson, state.plannedNextQuest.purpose, 'planned_quest')
    : null
  if (ordinaryPlan) return ordinaryPlan

  const guidedTrack = getCurrentGuidedJourneyTrack(state, playableTracks)
  const guidedProgression = chooseGuidedProgression(state, input.availableLessons, guidedTrack)
  if (guidedProgression) return guidedProgression

  return buildContentNeededPlan(
    state,
    guidedTrack ? [guidedTrack] : playableTracks,
    guidedTrack?.track.skillId ?? null,
  )
}

export function resolveActiveLearningFocus(
  input: PlanGlobalQuestInput,
): ActiveLearningFocus {
  const state = normalizeQuestProgressForPlanning(input.progress, input.availableLessons).state
  const activeSession = state.activeLessonSession ? getLessonById(state.activeLessonSession.lessonId).lesson : null
  if (activeSession) {
    return buildFocusForLesson(activeSession.skillId, activeSession.unitId, activeSession.worldId, activeSession.difficulty, 'active_session')
  }

  const plannedQuest = state.plannedNextQuest?.status === 'available' && isValidPlannedQuest(state, state.plannedNextQuest, input.availableLessons)
    ? state.plannedNextQuest
    : null
  if (plannedQuest) {
    return buildFocusForLesson(
      plannedQuest.lesson.skillId,
      plannedQuest.lesson.unitId,
      plannedQuest.lesson.worldId,
      plannedQuest.lesson.difficulty,
      'planned_quest',
    )
  }

  const plannedQuestResult = planGlobalQuest({ ...input, progress: state })
  if (plannedQuestResult.status === 'available' && plannedQuestResult.skillId) {
    return {
      skillId: plannedQuestResult.skillId,
      worldId: plannedQuestResult.worldId,
      unitId: plannedQuestResult.unitId,
      difficulty: plannedQuestResult.difficulty,
      displayName: plannedQuestResult.displayName,
      source: 'global_planned_quest',
    }
  }

  const latestAttempt = [...state.completedAttempts]
    .sort((left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime()
      || right.completionId.localeCompare(left.completionId))[0] ?? null
  if (latestAttempt) {
    const track = getTrackBySkillId(latestAttempt.skillId)
    return buildTrackFocus(track, latestAttempt.skillId, latestAttempt.difficulty, 'latest_attempt')
  }

  const firstPlayableTrack = discoverPlayableTracksForState(state, input.availableLessons)[0]?.track ?? null
  if (firstPlayableTrack) {
    const progress = state.skillProgress[firstPlayableTrack.skillId]
      ?? createInitialSkillProgress(
        firstPlayableTrack.skillId,
        firstPlayableTrack.initialDifficulty,
        firstPlayableTrack.initialLastMasteredDifficulty,
      )
    return buildTrackFocus(firstPlayableTrack, progress.skillId, progress.currentDifficulty, 'first_playable_track')
  }

  return {
    skillId: null,
    worldId: null,
    unitId: null,
    difficulty: 0,
    displayName: 'Reading Quest Ready',
    source: 'safe_fallback',
  }
}

function resolveActiveSessionPlan(
  state: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
): GlobalQuestPlan | null {
  const active = state.activeLessonSession
  if (!active) return null
  const lesson = availableLessons.find((candidate) => (
    candidate.lessonId === active.lessonId
    && candidate.activityId === active.activityId
    && candidate.skillId === active.skillId
    && candidate.difficulty === active.difficulty
    && candidate.contentVersion === active.contentVersion
  ))
  if (!lesson) return null
  return buildPlanFromLesson(lesson, lesson.eligiblePurposes[0] ?? 'progression', 'active_session')
}

function chooseDueReview(
  state: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
  playableTracks: readonly PlayableTrackDiscovery[],
  now: string,
): GlobalQuestPlan | null {
  const nowMs = new Date(now).getTime()
  const playableSkillIds = new Set(playableTracks.map((entry) => entry.track.skillId))
  const dueEntries = [...state.reviewQueue]
    .filter((entry) => playableSkillIds.has(entry.skillId))
    .filter((entry) => new Date(entry.dueAt).getTime() <= nowMs)
    .sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()
      || compareTrackIds(left.skillId, right.skillId)
      || left.skillId.localeCompare(right.skillId))

  for (const entry of dueEntries) {
    const affinity = resolveReviewAffinity(entry, {
      completedAttempts: state.completedAttempts,
      availableLessons,
    })
    if (affinity.status === 'ambiguous' || affinity.status === 'missing') {
      continue
    }
    const progress = state.skillProgress[entry.skillId]
      ?? createInitialSkillProgress(
        entry.skillId,
        getTrackBySkillId(entry.skillId)?.initialDifficulty ?? entry.difficulty,
        getTrackBySkillId(entry.skillId)?.initialLastMasteredDifficulty ?? 0,
      )
    const plan = selectNextLesson({
      skillId: entry.skillId,
      difficulty: entry.difficulty,
      purpose: 'review',
      availableLessons,
      recentActivityUsage: progress.recentActivityUsage,
      preferredUnitId: affinity.unitId,
      preferredContentVersion: affinity.contentVersion,
    })
    if (plan.status === 'available') {
      return buildPlanFromLesson(plan.lesson, 'review', 'global_planned_quest')
    }
  }

  return null
}

function chooseActiveStatePlan(
  state: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
  playableTracks: readonly PlayableTrackDiscovery[],
): GlobalQuestPlan | null {
  const lastCompletedLessonMetadata = state.completedAttempts.at(-1)
    ? getLessonCatalogMetadata(state.completedAttempts.at(-1)!.lessonId)
    : null
  const candidates = playableTracks
    .map((entry) => {
      const progress = state.skillProgress[entry.track.skillId]
      if (!progress || !ACTIVE_LEARNING_STATE_SET.has(progress.currentLearningState)) return null
      return {
        track: entry.track,
        progress,
      }
    })
    .filter((candidate): candidate is { track: CurriculumTrackDefinition; progress: SkillProgressState } => Boolean(candidate))
    .sort((left, right) => compareTrackDefinitions(left.track, right.track))

  for (const candidate of candidates) {
    const purpose = candidate.progress.currentLearningState === 'VERIFY_MASTERY' ? 'verification' : 'remediation'
    const plan = selectNextLesson({
      skillId: candidate.track.skillId,
      difficulty: candidate.progress.currentDifficulty,
      purpose,
      availableLessons,
      recentActivityUsage: candidate.progress.recentActivityUsage,
      preferredUnitId: lastCompletedLessonMetadata?.unitId ?? null,
      preferredContentVersion: lastCompletedLessonMetadata?.contentVersion ?? null,
    })
    if (plan.status === 'available') {
      return buildPlanFromLesson(plan.lesson, purpose, 'global_planned_quest')
    }
  }

  return null
}

function getCurrentGuidedJourneyTrack(
  state: QuestProgressV1,
  playableTracks: readonly PlayableTrackDiscovery[],
): PlayableTrackDiscovery | null {
  return [...playableTracks]
    .sort((left, right) => compareTrackDefinitions(left.track, right.track))
    .find((entry) => {
      const progress = state.skillProgress[entry.track.skillId]
        ?? createInitialSkillProgress(
          entry.track.skillId,
          entry.track.initialDifficulty,
          entry.track.initialLastMasteredDifficulty,
        )
      return progress.currentDifficulty < entry.track.completionDifficulty
    }) ?? null
}

function chooseGuidedProgression(
  state: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
  guidedTrack: PlayableTrackDiscovery | null,
): GlobalQuestPlan | null {
  if (!guidedTrack) return null
  const progress = state.skillProgress[guidedTrack.track.skillId]
    ?? createInitialSkillProgress(
      guidedTrack.track.skillId,
      guidedTrack.track.initialDifficulty,
      guidedTrack.track.initialLastMasteredDifficulty,
    )
  const plan = selectNextLesson({
    skillId: guidedTrack.track.skillId,
    difficulty: progress.currentDifficulty,
    purpose: 'progression',
    availableLessons,
    recentActivityUsage: progress.recentActivityUsage,
  })
  return plan.status === 'available'
    ? buildPlanFromLesson(plan.lesson, 'progression', 'global_planned_quest')
    : null
}

function buildPlanFromLesson(
  lesson: LessonActivityCandidate,
  purpose: NextQuestPlan['purpose'],
  source: ActiveLearningFocusSource,
): GlobalQuestPlan {
  const track = getTrackBySkillId(lesson.skillId)
    ?? getTrackByUnitId(lesson.unitId)
  const displayName = track ? `${track.displayName} ${formatTrailDisplayLabel(lesson.difficulty)}` : formatTrailDisplayLabel(lesson.difficulty)
  return {
    status: 'available',
    purpose,
    nextQuest: {
      status: 'available',
      purpose,
      lesson,
    },
    skillId: lesson.skillId,
    worldId: lesson.worldId,
    unitId: lesson.unitId,
    difficulty: lesson.difficulty,
    displayName,
    source,
    lesson,
  }
}

function buildContentNeededPlan(
  state: QuestProgressV1,
  playableTracks: readonly PlayableTrackDiscovery[],
  requiredSkillId: string | null = null,
): GlobalQuestPlan {
  const firstPlayableTrack = playableTracks[0]?.track ?? null
  const firstPlayableProgress = firstPlayableTrack ? state.skillProgress[firstPlayableTrack.skillId] : null
  const storedContentNeeded = state.plannedNextQuest?.status === 'content_needed' ? state.plannedNextQuest : null
  const planned = storedContentNeeded && (!requiredSkillId || storedContentNeeded.skillId === requiredSkillId)
    ? storedContentNeeded
    : null
  const skillId = planned?.skillId ?? firstPlayableTrack?.skillId ?? null
  const difficulty = planned?.difficulty
    ?? firstPlayableProgress?.currentDifficulty
    ?? firstPlayableTrack?.initialDifficulty
    ?? 1
  const reason = planned?.reason
    ?? (firstPlayableTrack
      ? `No compatible authored quest exists for ${firstPlayableTrack.displayName} at ${formatTrailDisplayLabel(difficulty)}.`
      : 'Every currently authored Grade 2 and Grade 3 curriculum track is complete. Reviews will still appear when they are due.')

  return {
    status: 'content_needed',
    purpose: planned?.purpose ?? 'progression',
    nextQuest: {
      status: 'content_needed',
      purpose: planned?.purpose ?? 'progression',
      skillId: skillId ?? 'unknown',
      difficulty,
      reason,
    },
    skillId,
    worldId: firstPlayableTrack?.worldId ?? null,
    unitId: firstPlayableTrack?.entryUnitId ?? null,
    difficulty,
    displayName: firstPlayableTrack ? `${firstPlayableTrack.displayName} ${formatTrailDisplayLabel(difficulty)}` : 'Grade 3 Journey Complete',
    source: 'safe_fallback',
    lesson: null,
    reason,
  }
}

function buildTrackFocus(
  track: CurriculumTrackDefinition | null,
  skillId: string,
  difficulty: number,
  source: ActiveLearningFocusSource,
): ActiveLearningFocus {
  if (!track) {
    return {
      skillId,
      worldId: null,
      unitId: null,
      difficulty,
      displayName: formatTrailDisplayLabel(difficulty),
      source,
    }
  }

  return {
    skillId,
    worldId: track.worldId,
    unitId: track.entryUnitId,
    difficulty,
    displayName: `${track.displayName} ${formatTrailDisplayLabel(difficulty)}`,
    source,
  }
}

function buildFocusForLesson(
  skillId: string,
  unitId: string,
  worldId: string,
  difficulty: number,
  source: ActiveLearningFocusSource,
): ActiveLearningFocus {
  const track = getTrackBySkillId(skillId)
    ?? getTrackByUnitId(unitId)
  return {
    skillId,
    worldId,
    unitId,
    difficulty,
    displayName: track ? `${track.displayName} ${formatTrailDisplayLabel(difficulty)}` : formatTrailDisplayLabel(difficulty),
    source,
  }
}

function formatTrailDisplayLabel(difficulty: number): string {
  return difficulty <= 0 ? 'Building Block Trail' : `Trail ${difficulty}`
}

function isValidPlannedQuest(
  state: QuestProgressV1,
  plannedQuest: Extract<QuestProgressV1['plannedNextQuest'], { status: 'available' }>,
  availableLessons: readonly LessonActivityCandidate[],
): boolean {
  const candidate = availableLessons.find((lesson) => (
    lesson.lessonId === plannedQuest.lesson.lessonId
    && lesson.activityId === plannedQuest.lesson.activityId
    && lesson.skillId === plannedQuest.lesson.skillId
    && lesson.difficulty === plannedQuest.lesson.difficulty
    && lesson.contentVersion === plannedQuest.lesson.contentVersion
    && lesson.eligiblePurposes.includes(plannedQuest.purpose)
  ))
  const track = candidate ? getTrackBySkillId(candidate.skillId) : null
  if (!candidate || !track || !isCurriculumTrackPlayable(track, state, availableLessons)) return false
  if (plannedQuest.purpose !== 'progression') return true
  const guidedTrack = getCurrentGuidedJourneyTrack(
    state,
    discoverPlayableTracksForState(state, availableLessons),
  )
  return guidedTrack?.track.skillId === candidate.skillId
}

function compareTrackDefinitions(left: CurriculumTrackDefinition, right: CurriculumTrackDefinition): number {
  return left.curriculumOrder - right.curriculumOrder || left.skillId.localeCompare(right.skillId)
}

function compareTrackIds(leftSkillId: string, rightSkillId: string): number {
  return (getTrackBySkillId(leftSkillId)?.curriculumOrder ?? Number.MAX_SAFE_INTEGER)
    - (getTrackBySkillId(rightSkillId)?.curriculumOrder ?? Number.MAX_SAFE_INTEGER)
    || leftSkillId.localeCompare(rightSkillId)
}
