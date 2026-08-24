import { useRef, useState } from 'react'

import { getTrackBySkillId, normalizeQuestProgressForPlanning, planGlobalQuest } from '../domain/curriculum'
import type { LessonDefinition, LessonResult } from '../domain/lesson'
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

  const beginLesson = (lesson: LessonDefinition): ActiveLessonSession => {
    const existing = progressRef.current.activeLessonSession
    if (
      existing
      && existing.lessonId === lesson.lessonId
      && existing.activityId === lesson.activityId
      && existing.contentVersion === lesson.contentVersion
    ) {
      return existing
    }
    const timestamp = new Date().toISOString()
    const session = createActiveLessonSession(
      lesson,
      `${lesson.activityId}:${progressRef.current.completedSessionCount + 1}:${timestamp}`,
      timestamp,
    )
    persist({ ...progressRef.current, activeLessonSession: session })
    return session
  }

  const saveActiveSession = (session: ActiveLessonSession) => {
    persist({ ...progressRef.current, activeLessonSession: session })
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
    if (existingAttempt && progressRef.current.lastProgressionOutcome && progressRef.current.plannedNextQuest) {
      return {
        kind: progressRef.current.plannedNextQuest.status === 'content_needed'
          ? 'CONTENT_NEEDED'
          : existingAttempt.progressionDecisionState,
        earnedXp: 0,
        earnedStars: 0,
        currentDifficulty: progressRef.current.skillProgress[lessonResult.skillId]?.currentDifficulty
          ?? lessonResult.difficulty,
        nextQuest: progressRef.current.plannedNextQuest,
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
      persist(completed.state)
      return {
        kind: fluencyProgress.reasonCodes.includes('fluency_practice_chapter_completed')
          ? 'FLUENCY_PRACTICE'
          : fluencyProgress.nextQuest.status === 'content_needed'
          ? 'CONTENT_NEEDED'
          : 'FLUENCY_PRACTICE',
        earnedXp: completed.earnedXp,
        earnedStars: completed.earnedStars,
        currentDifficulty: fluencyProgress.progress.currentDifficulty,
        nextQuest: fluencyProgress.nextQuest,
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
    persist(completed.state)
    return {
      kind: progression.nextQuest.status === 'content_needed'
        && progression.decision.decisionState !== 'ADVANCE'
        ? 'CONTENT_NEEDED'
        : progression.decision.decisionState,
      earnedXp: completed.earnedXp,
      earnedStars: completed.earnedStars,
      currentDifficulty: progression.progress.currentDifficulty,
      nextQuest: progression.nextQuest,
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

  return {
    progress,
    storageStatus,
    technicalDetail,
    beginLesson,
    saveActiveSession,
    abandonActiveLesson,
    completeLesson,
    planContinue,
  }
}

function findActiveSkillProgress(state: QuestProgressV1, result: LessonResult): SkillProgressState {
  return Object.values(state.skillProgress).find((progress) => (
    progress.skillId === result.skillId && progress.currentDifficulty === result.difficulty
  )) ?? state.skillProgress[result.skillId]
}
