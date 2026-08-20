import { useRef, useState } from 'react'

import type { LessonDefinition, LessonResult } from '../domain/lesson'
import {
  applyLessonResult,
  getReviewIntervalForStep,
  planNextQuest,
  type NextQuestPlan,
  type SkillProgressState,
} from '../domain/progression'
import { getLessonCandidates } from '../domain/lesson'
import {
  completeQuestProgress,
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
    return {
      store,
      state: recovered.state,
      storageStatus: loaded.status,
      technicalDetail: recovered.technicalDetail ?? loaded.technicalDetail,
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
    if (state.plannedNextQuest?.status === 'available') return state.plannedNextQuest
    const skill = Object.values(state.skillProgress)[0]
    if (!skill) {
      return { status: 'content_needed', purpose: 'progression', skillId: 'unknown', difficulty: 0, reason: 'No skill trail is configured.' }
    }
    const purpose = purposeForProgress(skill, state)
    return planNextQuest({ progress: skill, availableLessons, purpose })
  }

  return {
    progress,
    storageStatus,
    technicalDetail,
    beginLesson,
    saveActiveSession,
    completeLesson,
    planContinue,
  }
}

function findActiveSkillProgress(state: QuestProgressV1, result: LessonResult): SkillProgressState {
  return Object.values(state.skillProgress).find((progress) => (
    progress.skillId === result.skillId && progress.currentDifficulty === result.difficulty
  )) ?? state.skillProgress[result.skillId]
}

function purposeForProgress(skill: SkillProgressState, state: QuestProgressV1) {
  if (skill.remediationContext || skill.currentLearningState === 'GUIDED_PRACTICE') return 'remediation' as const
  if (skill.currentLearningState === 'VERIFY_MASTERY') return 'verification' as const
  const dueReview = state.reviewQueue.find((entry) => (
    entry.skillId === skill.skillId && new Date(entry.dueAt).getTime() <= Date.now()
  ))
  if (dueReview && getReviewIntervalForStep(dueReview.reviewStep) >= 1) return 'review' as const
  return 'progression' as const
}
