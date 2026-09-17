import { useRef, useState } from 'react'

import {
  getTrackBySkillId,
  normalizeQuestProgressForPlanning,
  planGlobalQuest,
  reconcileDeferredWordStudySession,
} from '../domain/curriculum'
import { getLessonById, type LessonDefinition, type LessonResult } from '../domain/lesson'
import { completeFluencyPractice } from '../domain/progression/fluencyPractice'
import {
  applyLessonResult,
  applyReviewLessonResult,
  type NextQuestPlan,
  type SkillProgressState,
} from '../domain/progression'
import { getLessonCandidates } from '../domain/lesson'
import {
  abandonActiveLesson as abandonActiveLessonState,
  completeQuestProgress,
  completeFluencyPracticeProgress,
  createActiveLessonSession,
  getActiveLessonCheckpointRevision,
  runWithProgressWriteLock,
  sameActiveLessonCheckpointPayload,
  sameActiveLessonSessionIdentity,
  validateActiveLessonCheckpointTransition,
  withAcceptedCheckpointRevision,
  createLocalStorageQuestProgressStore,
  getBrowserLocalStorage,
  recoverActiveLessonSession,
  type ActiveLessonSession,
  type ActiveLessonLaunchContext,
  type QuestProgressSaveResult,
  type QuestProgressStorageStatus,
  type QuestProgressV1,
} from '../persistence'
import { findReviewQueueEntryByResolvedIdentity } from '../domain/progression/reviewQueueAffinity'

export interface ProgressionOutcomeViewModel {
  persisted: boolean
  kind: string
  earnedXp: number
  earnedStars: number
  currentDifficulty: number
  nextQuest: NextQuestPlan
  completionId: string
  curriculumComplete: boolean
  recoveryMessage?: string
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
      curriculumComplete: boolean
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
  | { status: 'unchanged' | 'ignored_completed' | 'ignored_stale' | 'conflict'; state: QuestProgressV1 }
  | { status: 'persistence_failed'; state: QuestProgressV1; technicalDetail?: string }

interface InitialProgress {
  store: ReturnType<typeof createLocalStorageQuestProgressStore>
  state: QuestProgressV1
  storageStatus: QuestProgressStorageStatus
  technicalDetail?: string
}

const availableLessons = getLessonCandidates()

function reconcileJourneyProgress(state: QuestProgressV1): {
  state: QuestProgressV1
  changed: boolean
  technicalDetail?: string
} {
  const recoveredActive = recoverActiveLessonSession({ state, availableLessons })
  const deferred = reconcileDeferredWordStudySession(recoveredActive.state, availableLessons)
  const recoveredDeferred = recoverActiveLessonSession({ state: deferred.state, availableLessons })
  const normalized = normalizeQuestProgressForPlanning(recoveredDeferred.state, availableLessons)
  return {
    state: normalized.state,
    changed: activeSessionRecoveryChanged(state, recoveredActive.state)
      || deferred.changed
      || activeSessionRecoveryChanged(deferred.state, recoveredDeferred.state)
      || normalized.changed,
    technicalDetail: recoveredDeferred.technicalDetail ?? recoveredActive.technicalDetail,
  }
}

export function useQuestProgress() {
  const [initial] = useState<InitialProgress>(() => {
    const store = createLocalStorageQuestProgressStore(getBrowserLocalStorage())
    const loaded = store.load()
    const reconciled = reconcileJourneyProgress(loaded.state)
    return {
      store,
      state: reconciled.state,
      storageStatus: loaded.status,
      technicalDetail: reconciled.technicalDetail ?? loaded.technicalDetail,
    }
  })
  const storeRef = useRef(initial.store)
  const [progress, setProgress] = useState(initial.state)
  const progressRef = useRef(initial.state)
  const [storageStatus, setStorageStatus] = useState(initial.storageStatus)
  const [technicalDetail, setTechnicalDetail] = useState(initial.technicalDetail)

  const persist = (next: QuestProgressV1): QuestProgressSaveResult => {
    const saved = storeRef.current.save(next)
    const authoritativeState = saved.status === 'saved' || saved.status === 'conflict'
      ? saved.state
      : progressRef.current
    const result = { ...saved, state: authoritativeState }
    progressRef.current = authoritativeState
    setProgress(authoritativeState)
    setStorageStatus(saved.status === 'saved' ? 'loaded' : saved.status)
    setTechnicalDetail(saved.technicalDetail)
    return result
  }

  const refreshFromDurableStore = (): QuestProgressV1 => {
    const loaded = storeRef.current.load()
    if (loaded.status === 'loaded' || loaded.status === 'recovered') {
      progressRef.current = loaded.state
      setProgress(loaded.state)
      setStorageStatus(loaded.status)
      setTechnicalDetail(loaded.technicalDetail)
      return loaded.state
    }
    if (loaded.status !== 'empty') {
      setStorageStatus(loaded.status)
      setTechnicalDetail(loaded.technicalDetail)
    }
    return progressRef.current
  }

  const beginLessonWithContext = (
    lesson: LessonDefinition,
    launchContext: ActiveLessonLaunchContext,
  ): {
    status: 'started' | 'resumed' | 'conflict' | 'persistence_failed'
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
      launchContext,
    )
    const saved = persist({ ...progressRef.current, activeLessonSession: session })
    if (saved.status === 'conflict') {
      return { status: 'conflict', session: saved.state.activeLessonSession ?? session }
    }
    return saved.status === 'saved'
      ? { status: 'started', session }
      : { status: 'persistence_failed' as const, session }
  }

  const beginLesson = (lesson: LessonDefinition) => beginLessonWithContext(lesson, { purpose: 'progression' })

  const saveActiveSession = (session: ActiveLessonSession): SaveActiveSessionResult => {
    const current = progressRef.current
    if (current.completedAttempts.some((attempt) => attempt.completionId === session.sessionId)) {
      return { status: 'ignored_completed', state: current }
    }
    const active = current.activeLessonSession
    if (!active) return { status: 'ignored_stale', state: current }
    if (active.sessionId !== session.sessionId) return { status: 'conflict', state: current }
    if (!sameActiveLessonSessionIdentity(active, session)) {
      return { status: 'ignored_stale', state: current }
    }
    if (
      session.checkpointRevision !== undefined
      && (!Number.isSafeInteger(session.checkpointRevision) || session.checkpointRevision < 0)
    ) {
      return { status: 'ignored_stale', state: current }
    }
    const activeRevision = getActiveLessonCheckpointRevision(active)
    const proposedRevision = getActiveLessonCheckpointRevision(session)
    if (
      proposedRevision === activeRevision - 1
      && sameActiveLessonCheckpointPayload(active, session)
    ) {
      return { status: 'unchanged', state: current }
    }
    if (proposedRevision !== activeRevision) {
      return { status: 'ignored_stale', state: current }
    }
    if (sameActiveLessonCheckpointPayload(active, session)) {
      return { status: 'unchanged', state: current }
    }
    const lesson = getLessonById(active.lessonId).lesson
    if (!lesson || validateActiveLessonCheckpointTransition(active, session, lesson)) {
      return { status: 'ignored_stale', state: current }
    }
    const accepted = withAcceptedCheckpointRevision(session, activeRevision + 1)
    const saved = persist({ ...current, activeLessonSession: accepted })
    if (saved.status === 'saved') return { status: 'saved', state: saved.state }
    if (saved.status === 'conflict') return { status: 'conflict', state: saved.state }
    return { status: 'persistence_failed', state: saved.state, technicalDetail: saved.technicalDetail }
  }

  const abandonActiveLesson = () => {
    const nextState = abandonActiveLessonState(progressRef.current)
    persist(nextState)
  }

  const completeLesson = (
    lessonResult: LessonResult,
    completionId: string,
    expectedCheckpointRevision?: number,
  ): ProgressionOutcomeViewModel => {
    const existingAttempt = progressRef.current.completedAttempts.find(
      (attempt) => attempt.completionId === completionId,
    )
    if (existingAttempt) {
      const planned = reconcileAndPlanJourney(progressRef.current, new Date().toISOString())
      const reconciled = planned.state
      const guidedPlan = planned.plan
      const nextQuest = guidedPlan.nextQuest
      const saved = persist({ ...reconciled, plannedNextQuest: nextQuest })
      return {
        persisted: saved.status === 'saved',
        kind: nextQuest.status === 'content_needed'
          ? 'CONTENT_NEEDED'
          : existingAttempt.progressionDecisionState,
        earnedXp: 0,
        earnedStars: 0,
        currentDifficulty: reconciled.skillProgress[lessonResult.skillId]?.currentDifficulty
          ?? lessonResult.difficulty,
        nextQuest,
        completionId,
        curriculumComplete: guidedPlan.curriculumComplete,
      }
    }

    const completedAt = new Date().toISOString()
    const active = progressRef.current.activeLessonSession
    const activeMatchesResult = Boolean(
      active
      && active.sessionId === completionId
      && active.lessonId === lessonResult.lessonId
      && active.activityId === lessonResult.activityId
      && active.skillId === lessonResult.skillId
      && active.difficulty === lessonResult.difficulty
      && (!active.lessonRole || active.lessonRole === lessonResult.lessonRole)
      && (expectedCheckpointRevision === undefined
        || getActiveLessonCheckpointRevision(active) === expectedCheckpointRevision)
      && (expectedCheckpointRevision === undefined
        || activeSessionSupportsCompletion(active, lessonResult)),
    )
    if (!activeMatchesResult) {
      return buildRejectedCompletionOutcome(
        progressRef.current,
        lessonResult,
        completionId,
        'Lesson result does not match the active lesson session.',
      )
    }

    const reviewContext = active?.launchContext?.purpose === 'review'
      ? active.launchContext
      : null
    if (reviewContext?.reviewIdentity) {
      const reviewEntry = findReviewQueueEntryByResolvedIdentity(reviewContext.reviewIdentity, {
        reviewQueue: progressRef.current.reviewQueue,
        completedAttempts: progressRef.current.completedAttempts,
        availableLessons,
      })
      const reviewProgress = progressRef.current.skillProgress[reviewContext.reviewIdentity.skillId]
      const reviewResult = reviewEntry && reviewProgress
        && (!reviewContext.returnLearningState
          || reviewProgress.currentLearningState === reviewContext.returnLearningState)
        ? applyReviewLessonResult({
            progress: reviewProgress,
            lessonResult,
            availableLessons,
            reviewIdentity: reviewContext.reviewIdentity,
            reviewEntry,
            completedAt,
          })
        : null
      if (!reviewResult || reviewResult.status === 'declined') {
        return buildRejectedCompletionOutcome(
          progressRef.current,
          lessonResult,
          completionId,
          reviewResult?.reason ?? 'Review result does not match the authoritative review launch.',
        )
      }
      const completed = completeQuestProgress({
        state: progressRef.current,
        completionId,
        lessonResult,
        progression: reviewResult,
        reviewCompletion: reviewResult.reviewCompletion,
        completedAt,
      })
      const planned = reconcileAndPlanJourney(completed.state, completedAt)
      const guidedPlan = planned.plan
      const guidedNextQuest = guidedPlan.nextQuest
      const saved = persist({ ...planned.state, plannedNextQuest: guidedNextQuest })
      return {
        persisted: saved.status === 'saved',
        kind: 'SPACED_REVIEW',
        earnedXp: completed.earnedXp,
        earnedStars: completed.earnedStars,
        currentDifficulty: reviewResult.progress.currentDifficulty,
        nextQuest: guidedNextQuest,
        completionId,
        curriculumComplete: guidedPlan.curriculumComplete,
      }
    }

    const progressEntry = findActiveSkillProgress(progressRef.current, lessonResult)

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
      const planned = reconcileAndPlanJourney(completed.state, completedAt)
      const guidedPlan = planned.plan
      const guidedNextQuest = guidedPlan.nextQuest
      const saved = persist({ ...planned.state, plannedNextQuest: guidedNextQuest })
      return {
        persisted: saved.status === 'saved',
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
        curriculumComplete: guidedPlan.curriculumComplete,
      }
    }

    const progression = applyLessonResult({
      progress: progressEntry,
      lessonResult,
      availableLessons,
      completedAt,
    })
    if (progression.status === 'declined') {
      return buildRejectedCompletionOutcome(
        progressRef.current,
        lessonResult,
        completionId,
        progression.reason,
      )
    }

    const completed = completeQuestProgress({
      state: progressRef.current,
      completionId,
      lessonResult,
      progression,
      completedAt,
    })
    const planned = reconcileAndPlanJourney(completed.state, completedAt)
    const guidedPlan = planned.plan
    const guidedNextQuest = guidedPlan.nextQuest
    const saved = persist({ ...planned.state, plannedNextQuest: guidedNextQuest })
    return {
      persisted: saved.status === 'saved',
      kind: guidedNextQuest.status === 'content_needed'
        && progression.decision.decisionState !== 'ADVANCE'
        ? 'CONTENT_NEEDED'
        : progression.decision.decisionState,
      earnedXp: completed.earnedXp,
      earnedStars: completed.earnedStars,
      currentDifficulty: progression.progress.currentDifficulty,
      nextQuest: guidedNextQuest,
      completionId,
      curriculumComplete: guidedPlan.curriculumComplete,
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
    let current = refreshFromDurableStore()
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const reconciled = reconcileJourneyProgress(current)
      current = reconciled.state
      if (!reconciled.changed) break
      const saved = persist(current)
      if (saved.status !== 'saved' && saved.status !== 'conflict') {
        return {
          status: 'unavailable',
          reason: 'This browser could not safely save the reading-priority update. Your earlier saved progress was left unchanged.',
          difficulty: current.activeLessonSession?.difficulty ?? 1,
          state: saved.state,
        }
      }
      current = saved.state
      if (saved.status === 'saved') break
      if (attempt === 1) {
        return {
          status: 'unavailable',
          reason: 'A newer saved reading session was found. It was preserved, but the next activity could not be selected safely yet.',
          difficulty: current.activeLessonSession?.difficulty ?? 1,
          state: current,
        }
      }
    }

    const active = current.activeLessonSession
    if (active) {
      const resolved = getLessonById(active.lessonId)
      if (resolved.lesson) {
        return { status: 'resume', lesson: resolved.lesson, session: active, state: current }
      }
      current = persist({ ...current, activeLessonSession: null }).state
    }

    const globalPlan = planGlobalQuest({
      progress: current,
      availableLessons,
      now: new Date().toISOString(),
    })
    const plan = globalPlan.nextQuest
    if (plan.status === 'content_needed') {
      const state = persist({ ...current, plannedNextQuest: plan }).state
      return { status: 'content_needed', plan, curriculumComplete: globalPlan.curriculumComplete, state }
    }

    const selected = getLessonById(plan.lesson.lessonId)
    if (!selected.lesson) {
      const state = persist({ ...current, plannedNextQuest: null }).state
      return {
        status: 'unavailable',
        reason: selected.errors[0] ?? 'The planned quest is unavailable.',
        difficulty: plan.lesson.difficulty,
        state,
      }
    }

    const begun = beginLessonWithContext(
      selected.lesson,
      globalPlan.launchContext ?? { purpose: plan.purpose },
    )
    if (begun.status === 'persistence_failed') {
      return {
        status: 'unavailable',
        reason: 'This browser could not safely save the next reading activity. Your earlier saved progress was left unchanged.',
        difficulty: selected.lesson.difficulty,
        state: progressRef.current,
      }
    }
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

  function reconcileAndPlanJourney(state: QuestProgressV1, now: string) {
    const reconciled = reconcileJourneyProgress(state)
    return {
      state: reconciled.state,
      plan: planGlobalQuest({
        progress: reconciled.state,
        availableLessons,
        now,
      }),
    }
  }

  const runCoordinated = async <T,>(
    operation: () => T,
    unavailable: (technicalDetail: string) => T,
  ): Promise<T> => {
    const locked = await runWithProgressWriteLock(() => {
      const loaded = storeRef.current.load()
      if (loaded.status !== 'loaded' && loaded.status !== 'recovered' && loaded.status !== 'empty') {
        return unavailable(loaded.technicalDetail ?? 'Saved reading progress could not be loaded safely.')
      }
      progressRef.current = loaded.state
      setProgress(loaded.state)
      setStorageStatus(loaded.status)
      setTechnicalDetail(loaded.technicalDetail)
      return operation()
    })
    if (locked.status === 'acquired') return locked.value
    setStorageStatus('write_blocked')
    setTechnicalDetail(locked.technicalDetail)
    return unavailable(locked.technicalDetail)
  }

  const prepareJourneyLaunchCoordinated = () => runCoordinated(
    prepareJourneyLaunch,
    (reason): JourneyLaunchDecision => ({
      status: 'unavailable',
      reason,
      difficulty: progressRef.current.activeLessonSession?.difficulty ?? 1,
      state: progressRef.current,
    }),
  )

  const saveActiveSessionCoordinated = (session: ActiveLessonSession) => runCoordinated(
    () => saveActiveSession(session),
    (technicalDetail): SaveActiveSessionResult => ({
      status: 'persistence_failed',
      state: progressRef.current,
      technicalDetail,
    }),
  )

  const completeLessonCoordinated = (
    lessonResult: LessonResult,
    completionId: string,
    expectedCheckpointRevision: number,
  ) => runCoordinated(
    () => completeLesson(lessonResult, completionId, expectedCheckpointRevision),
    (reason) => buildRejectedCompletionOutcome(
      progressRef.current,
      lessonResult,
      completionId,
      reason,
    ),
  )

  return {
    progress,
    storageStatus,
    technicalDetail,
    beginLesson,
    saveActiveSession,
    saveActiveSessionCoordinated,
    abandonActiveLesson,
    completeLesson,
    completeLessonCoordinated,
    planContinue,
    prepareJourneyLaunch,
    prepareJourneyLaunchCoordinated,
    refreshFromDurableStore,
  }
}

function activeSessionRecoveryChanged(before: QuestProgressV1, after: QuestProgressV1): boolean {
  const previous = before.activeLessonSession
  const current = after.activeLessonSession
  return previous?.sessionId !== current?.sessionId
    || previous?.sessionContentFingerprint !== current?.sessionContentFingerprint
}

function buildRejectedCompletionOutcome(
  state: QuestProgressV1,
  lessonResult: LessonResult,
  completionId: string,
  reason: string,
): ProgressionOutcomeViewModel {
  return {
    persisted: false,
    kind: 'RECOVERY_NEEDED',
    earnedXp: 0,
    earnedStars: 0,
    currentDifficulty: state.skillProgress[lessonResult.skillId]?.currentDifficulty
      ?? lessonResult.difficulty,
    nextQuest: {
      status: 'content_needed',
      purpose: 'progression',
      skillId: lessonResult.skillId,
      difficulty: lessonResult.difficulty,
      reason,
    },
    completionId,
    curriculumComplete: false,
    recoveryMessage: 'That completed lesson could not be confirmed safely. Your current work is still available. Please retry.',
  }
}

function findActiveSkillProgress(state: QuestProgressV1, result: LessonResult): SkillProgressState {
  return Object.values(state.skillProgress).find((progress) => (
    progress.skillId === result.skillId && progress.currentDifficulty === result.difficulty
  )) ?? state.skillProgress[result.skillId]
}

function activeSessionSupportsCompletion(
  active: ActiveLessonSession,
  result: LessonResult,
): boolean {
  const lesson = getLessonById(active.lessonId).lesson
  if (!lesson || lesson.questions.length === 0) return false
  if (active.currentQuestionIndex !== lesson.questions.length - 1) return false
  if (active.submittedQuestions.length !== lesson.questions.length) return false
  if (result.totalQuestions !== lesson.questions.length || result.questionResults.length !== lesson.questions.length) {
    return false
  }
  const submitted = new Map(active.submittedQuestions.map((question) => [question.questionId, question] as const))
  for (const question of result.questionResults) {
    const persisted = submitted.get(question.questionId)
    if (
      !persisted
      || persisted.isCorrect !== question.isCorrect
      || persisted.isFirstAttemptCorrect !== question.isFirstAttemptCorrect
    ) return false
  }
  if (active.assistanceEvents.length !== result.assistanceUsed) return false
  if (lesson.lessonRole === 'FLUENCY_PRACTICE') {
    const state = active.fluencyPracticeState
    const summary = result.fluencyPracticeSummary
    if (!state || !summary) return false
    if (
      state.modelReadUsed !== summary.modelReadUsed
      || state.phrasePracticeCompleted !== summary.phrasePracticeCompleted
      || state.completedReadCount !== summary.completedReadCount
      || state.reflection !== summary.reflection
    ) return false
  }
  return true
}
