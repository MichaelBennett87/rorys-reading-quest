import { useRef, useState } from 'react'

import { getTrackBySkillId, normalizeQuestProgressForPlanning, planGlobalQuest } from '../domain/curriculum'
import { getLessonById, type LessonDefinition, type LessonResult } from '../domain/lesson'
import { completeFluencyPractice } from '../domain/progression/fluencyPractice'
import {
  applyLessonResult,
  type NextQuestPlan,
  type SkillProgressState,
} from '../domain/progression'
import { getLessonCandidates } from '../domain/lesson'
import {
  abandonActiveLesson as abandonActiveLessonState,
  completeQuestProgress,
  completeFluencyPracticeProgress,
  createActiveLessonSession,
  createLocalStorageQuestProgressStore,
  getBrowserLocalStorage,
  recoverActiveLessonSession,
  type ActiveLessonSession,
  type QuestProgressStorageStatus,
  type QuestProgressV1,
} from '../persistence'

export interface ProgressionOutcomeViewModel {
  kind: string
  earnedXp: number
  earnedStars: number
  currentDifficulty: number
  nextQuest: NextQuestPlan
  completionId: string
}

export type JourneyLaunchDecision =
  | {
      status: 'resume'
      lesson: LessonDefinition
      session: ActiveLessonSession
      state: QuestProgressV1
    }
  | {
      status: 'start'
      lesson: LessonDefinition
      session: ActiveLessonSession
      state: QuestProgressV1
    }
  | {
      status: 'content_needed'
      plan: Extract<NextQuestPlan, { status: 'content_needed' }>
      state: QuestProgressV1
    }
  | {
      status: 'unavailable'
      reason: string
      difficulty: number
      state: QuestProgressV1
    }

export type SaveActiveSessionResult =
  | { status: 'saved'; state: QuestProgressV1 }
  | { status: 'ignored_completed' | 'ignored_stale' | 'conflict'; state: QuestProgressV1 }

interface InitialProgress {
  store: ReturnType<typeof createLocalStorageQuestProgressStore>
  state: QuestProgressV1
  storageStatus: QuestProgressStorageStatus
  technicalDetail?: string
}

const availableLessons = getLessonCandidates()

export function useQuestProgress() {
  const [initial] = useState<InitialProgress>(() => {
    const store = createLocalStorageQuestProgressStore(getBrowserLocalStorage())
    const loaded = store.load()
    const recovered = recoverActiveLessonSession({ state: loaded.state, availableLessons })
    const normalized = normalizeQuestProgressForPlanning(recovered.state, availableLessons)
    const normalizedState = normalized.changed ? normalized.state : recovered.state
    const saved = normalized.changed ? store.save(normalizedState) : null
    return {
      store,
      state: saved?.status === 'saved' ? saved.state : normalizedState,
      storageStatus: saved?.status === 'saved' ? 'loaded' : loaded.status,
      technicalDetail: recovered.technicalDetail ?? loaded.technicalDetail ?? saved?.technicalDetail,
    }
  })
  const storeRef = useRef(initial.store)
  const [progress, setProgress] = useState(initial.state)
  const progressRef = useRef(initial.state)
  const [storageStatus, setStorageStatus] = useState(initial.storageStatus)
  const [technicalDetail, setTechnicalDetail] = useState(initial.technicalDetail)

  const persist = (next: QuestProgressV1): QuestProgressV1 => {
    const saved = storeRef.current.save(next)
    progressRef.current = saved.state
    setProgress(saved.state)
    setStorageStatus(saved.status === 'saved' ? 'loaded' : saved.status)
    setTechnicalDetail(saved.technicalDetail)
    return saved.state
  }

  const beginLesson = (lesson: LessonDefinition): {
    status: 'started' | 'resumed' | 'conflict'
    session: ActiveLessonSession
  } => {
    const existing = progressRef.current.activeLessonSession
    if (
      existing
      && existing.lessonId === lesson.lessonId
      && existing.activityId === lesson.activityId
      && existing.contentVersion === lesson.contentVersion
    ) {
      return { status: 'resumed', session: existing }
    }
    if (existing) {
      return { status: 'conflict', session: existing }
    }
    const timestamp = new Date().toISOString()
    const session = createActiveLessonSession(
      lesson,
      `${lesson.activityId}:${progressRef.current.completedSessionCount + 1}:${timestamp}`,
      timestamp,
    )
    persist({ ...progressRef.current, activeLessonSession: session })
    return { status: 'started', session }
  }

  const saveActiveSession = (session: ActiveLessonSession): SaveActiveSessionResult => {
    const current = progressRef.current
    if (current.completedAttempts.some((attempt) => attempt.completionId === session.sessionId)) {
      return { status: 'ignored_completed', state: current }
    }
    const active = current.activeLessonSession
    if (!active) return { status: 'ignored_stale', state: current }
    if (active.sessionId !== session.sessionId) return { status: 'conflict', state: current }
    if (
      active.lessonId !== session.lessonId
      || active.activityId !== session.activityId
      || active.contentVersion !== session.contentVersion
      || active.skillId !== session.skillId
      || active.difficulty !== session.difficulty
    ) {
      return { status: 'ignored_stale', state: current }
    }
    return { status: 'saved', state: persist({ ...current, activeLessonSession: session }) }
  }

  const abandonActiveLesson = () => {
    const nextState = abandonActiveLessonState(progressRef.current)
    persist(nextState)
  }

  const completeLesson = (
    lessonResult: LessonResult,
    completionId: string,
  ): ProgressionOutcomeViewModel => {
    const existingAttempt = progressRef.current.completedAttempts.find(
      (attempt) => attempt.completionId === completionId,
    )
    if (existingAttempt) {
      const recovered = recoverActiveLessonSession({ state: progressRef.current, availableLessons })
      const normalized = normalizeQuestProgressForPlanning(recovered.state, availableLessons)
      const reconciled = normalized.state
      const nextQuest = planGlobalQuest({
        progress: reconciled,
        availableLessons,
        now: new Date().toISOString(),
      }).nextQuest
      persist({ ...reconciled, plannedNextQuest: nextQuest })
      return {
        kind: nextQuest.status === 'content_needed'
          ? 'CONTENT_NEEDED'
          : existingAttempt.progressionDecisionState,
        earnedXp: 0,
        earnedStars: 0,
        currentDifficulty: reconciled.skillProgress[lessonResult.skillId]?.currentDifficulty
          ?? lessonResult.difficulty,
        nextQuest,
        completionId,
      }
    }

    const progressEntry = findActiveSkillProgress(progressRef.current, lessonResult)
    const completedAt = new Date().toISOString()

    if (lessonResult.lessonRole === 'FLUENCY_PRACTICE') {
      const track = getTrackBySkillId(lessonResult.skillId)
      const fluencyProgress = completeFluencyPractice({
        progress: progressEntry,
        lessonResult,
        availableLessons,
        completedAttempts: progressRef.current.completedAttempts,
        completedAt,
        completionDifficulty: track?.completionDifficulty,
      })
      const completed = completeFluencyPracticeProgress({
        state: progressRef.current,
        completionId,
        lessonResult,
        fluencyProgress,
        completedAt,
      })
      const guidedNextQuest = planGlobalQuest({
        progress: completed.state,
        availableLessons,
        now: completedAt,
      }).nextQuest
      persist({ ...completed.state, plannedNextQuest: guidedNextQuest })
      return {
        kind: fluencyProgress.reasonCodes.includes('fluency_practice_chapter_completed')
          ? 'FLUENCY_PRACTICE'
          : guidedNextQuest.status === 'content_needed'
          ? 'CONTENT_NEEDED'
          : 'FLUENCY_PRACTICE',
        earnedXp: completed.earnedXp,
        earnedStars: completed.earnedStars,
        currentDifficulty: fluencyProgress.progress.currentDifficulty,
        nextQuest: guidedNextQuest,
        completionId,
      }
    }

    const progression = applyLessonResult({
      progress: progressEntry,
      lessonResult,
      availableLessons,
      completedAt,
    })
    if (progression.status === 'declined') {
      const nextQuest: NextQuestPlan = {
        status: 'content_needed',
        purpose: 'progression',
        skillId: lessonResult.skillId,
        difficulty: lessonResult.difficulty,
        reason: progression.reason,
      }
      persist({ ...progressRef.current, activeLessonSession: null, plannedNextQuest: nextQuest })
      return {
        kind: 'CONTENT_NEEDED',
        earnedXp: 0,
        earnedStars: 0,
        currentDifficulty: lessonResult.difficulty,
        nextQuest,
        completionId,
      }
    }

    const completed = completeQuestProgress({
      state: progressRef.current,
      completionId,
      lessonResult,
      progression,
      completedAt,
    })
    const guidedNextQuest = planGlobalQuest({
      progress: completed.state,
      availableLessons,
      now: completedAt,
    }).nextQuest
    persist({ ...completed.state, plannedNextQuest: guidedNextQuest })
    return {
      kind: guidedNextQuest.status === 'content_needed'
        && progression.decision.decisionState !== 'ADVANCE'
        ? 'CONTENT_NEEDED'
        : progression.decision.decisionState,
      earnedXp: completed.earnedXp,
      earnedStars: completed.earnedStars,
      currentDifficulty: progression.progress.currentDifficulty,
      nextQuest: guidedNextQuest,
      completionId,
    }
  }

  const planContinue = (): NextQuestPlan => {
    const state = progressRef.current
    return planGlobalQuest({
      progress: state,
      availableLessons,
      now: new Date().toISOString(),
    }).nextQuest
  }

  const prepareJourneyLaunch = (): JourneyLaunchDecision => {
    const recovered = recoverActiveLessonSession({
      state: progressRef.current,
      availableLessons,
    })
    const normalized = normalizeQuestProgressForPlanning(recovered.state, availableLessons)
    let current = normalized.state
    if (recovered.status === 'discarded_completed' || recovered.status === 'discarded_incompatible' || normalized.changed) {
      current = persist(current)
    }

    const active = current.activeLessonSession
    if (active) {
      const resolved = getLessonById(active.lessonId)
      if (resolved.lesson) {
        return { status: 'resume', lesson: resolved.lesson, session: active, state: current }
      }
      current = persist({ ...current, activeLessonSession: null })
    }

    const plan = planGlobalQuest({
      progress: current,
      availableLessons,
      now: new Date().toISOString(),
    }).nextQuest
    if (plan.status === 'content_needed') {
      const state = persist({ ...current, plannedNextQuest: plan })
      return { status: 'content_needed', plan, state }
    }

    const selected = getLessonById(plan.lesson.lessonId)
    if (!selected.lesson) {
      const state = persist({ ...current, plannedNextQuest: null })
      return {
        status: 'unavailable',
        reason: selected.errors[0] ?? 'The planned quest is unavailable.',
        difficulty: plan.lesson.difficulty,
        state,
      }
    }

    const begun = beginLesson(selected.lesson)
    if (begun.status === 'conflict') {
      const conflictingLesson = getLessonById(begun.session.lessonId)
      if (conflictingLesson.lesson) {
        return {
          status: 'resume',
          lesson: conflictingLesson.lesson,
          session: begun.session,
          state: progressRef.current,
        }
      }
      return {
        status: 'unavailable',
        reason: 'The saved quest could not be resumed safely.',
        difficulty: begun.session.difficulty,
        state: progressRef.current,
      }
    }

    return {
      status: begun.status === 'resumed' ? 'resume' : 'start',
      lesson: selected.lesson,
      session: begun.session,
      state: progressRef.current,
    }
  }

  return {
    progress,
    storageStatus,
    technicalDetail,
    beginLesson,
    saveActiveSession,
    abandonActiveLesson,
    completeLesson,
    planContinue,
    prepareJourneyLaunch,
  }
}

function findActiveSkillProgress(state: QuestProgressV1, result: LessonResult): SkillProgressState {
  return Object.values(state.skillProgress).find((progress) => (
    progress.skillId === result.skillId && progress.currentDifficulty === result.difficulty
  )) ?? state.skillProgress[result.skillId]
}
