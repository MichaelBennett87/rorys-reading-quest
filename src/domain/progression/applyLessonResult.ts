import { getLessonCatalogMetadata } from '../lesson'
import { evaluateCheckpoint } from './evaluateCheckpoint'
import { applyProgressionDecision, purposeForDecision } from './applyProgressionDecision'
import { lessonResultToCheckpoint } from './lessonResultToCheckpoint'
import { planNextQuest } from './planNextQuest'
import type {
  ApplyLessonResultInput,
  ApplyLessonResultResult,
  LessonActivityCandidate,
  RemediationContext,
  SkillProgressState,
} from './skillProgressTypes'

const RECENT_ACTIVITY_LIMIT = 12

export function applyLessonResult(input: ApplyLessonResultInput): ApplyLessonResultResult {
  const knownSkillIds = [...new Set(input.availableLessons.map((lesson) => lesson.skillId))]
  const supportedDifficulties = [...new Set(input.availableLessons.map((lesson) => lesson.difficulty))]
  const adapted = lessonResultToCheckpoint(input.lessonResult, {
    progress: input.progress,
    knownSkillIds,
    supportedDifficulties,
    relevantPrerequisite: input.relevantPrerequisiteSkillId ?? null,
  })
  if (adapted.status === 'declined') {
    return { status: 'declined', progress: cloneProgress(input.progress), reason: adapted.reason }
  }

  const decision = evaluateCheckpoint(adapted.checkpointInput)
  let progress = applyProgressionDecision(input.progress, decision, input.completedAt)
  const lesson = input.availableLessons.find((candidate) => (
    candidate.lessonId === input.lessonResult.lessonId
    && candidate.activityId === input.lessonResult.activityId
  ))
  const lessonMetadata = getLessonCatalogMetadata(input.lessonResult.lessonId)
  progress = recordCompletion(progress, input, lesson)

  if (
    decision.reasonCodes.includes('independent_evidence')
    && !decision.reasonCodes.includes('duplicate_activity_not_counted')
    && decision.decisionState !== 'ADVANCE'
  ) {
    progress.qualifyingIndependentActivityIds = [
      ...new Set([...progress.qualifyingIndependentActivityIds, input.lessonResult.activityId]),
    ]
  }

  if (decision.decisionState === 'ADVANCE' && input.progress.remediationContext) {
    const context = input.progress.remediationContext
    progress = {
      ...progress,
      skillId: context.originalSkillId,
      currentDifficulty: context.originalDifficulty,
      currentLearningState: 'CHECKPOINT',
      qualifyingIndependentActivityIds: [],
      consecutiveUnsuccessfulAtCurrentDifficulty: 0,
      remediationContext: null,
    }
    return {
      status: 'applied',
      progress,
      decision,
      nextQuest: planNextQuest({
        progress,
        availableLessons: input.availableLessons,
        purpose: 'progression',
        preferredUnitId: lessonMetadata?.unitId ?? lesson?.unitId ?? null,
        preferredContentVersion: lessonMetadata?.contentVersion ?? lesson?.contentVersion ?? null,
      }),
    }
  }

  if (decision.decisionState === 'REMEDIATE_PREREQUISITE') {
    const target = resolveRemediationTarget(input)
    if (!target) {
      return {
        status: 'applied',
        progress,
        decision,
        nextQuest: {
          status: 'content_needed',
          purpose: 'remediation',
          skillId: input.progress.skillId,
          difficulty: input.progress.lastMasteredDifficulty,
          reason: 'No playable prerequisite or last-mastered lesson is available.',
        },
      }
    }
    if (target) {
      const remediationContext: RemediationContext = {
        originalSkillId: input.progress.skillId,
        originalDifficulty: input.progress.currentDifficulty,
        remediationSkillId: target.skillId,
        remediationDifficulty: target.difficulty,
        reason: target.reason,
      }
      progress = {
        ...progress,
        skillId: target.skillId,
        currentDifficulty: target.difficulty,
        currentLearningState: 'REMEDIATE_PREREQUISITE',
        qualifyingIndependentActivityIds: [],
        remediationContext,
      }
    }
  }

  const purpose = purposeForDecision(decision)
  return {
    status: 'applied',
    progress,
    decision,
    nextQuest: planNextQuest({
      progress,
      availableLessons: input.availableLessons,
      purpose,
      preferredUnitId: decision.decisionState === 'ADVANCE' ? null : lessonMetadata?.unitId ?? lesson?.unitId ?? null,
      preferredContentVersion: decision.decisionState === 'ADVANCE' ? null : lessonMetadata?.contentVersion ?? lesson?.contentVersion ?? null,
    }),
  }
}

function recordCompletion(
  progress: SkillProgressState,
  input: ApplyLessonResultInput,
  lesson: LessonActivityCandidate | undefined,
): SkillProgressState {
  const usage = lesson ? {
    lessonId: lesson.lessonId,
    activityId: lesson.activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    passageQuestionKeys: [...lesson.passageQuestionKeys],
    contentVersion: lesson.contentVersion,
    completedAt: input.completedAt,
  } : null
  return {
    ...progress,
    lastCompletedActivityId: input.lessonResult.activityId,
    recentActivityUsage: usage
      ? [...progress.recentActivityUsage, usage].slice(-RECENT_ACTIVITY_LIMIT)
      : progress.recentActivityUsage.map((entry) => ({ ...entry, passageQuestionKeys: [...entry.passageQuestionKeys] })),
  }
}

function resolveRemediationTarget(
  input: ApplyLessonResultInput,
): { skillId: string; difficulty: number; reason: RemediationContext['reason'] } | null {
  if (input.relevantPrerequisiteSkillId) {
    const prerequisiteDifficulties = input.availableLessons
      .filter((lesson) => lesson.skillId === input.relevantPrerequisiteSkillId)
      .filter((lesson) => lesson.eligiblePurposes.includes('remediation'))
      .map((lesson) => lesson.difficulty)
      .sort((left, right) => right - left)
    if (prerequisiteDifficulties[0] !== undefined) {
      return {
        skillId: input.relevantPrerequisiteSkillId,
        difficulty: prerequisiteDifficulties[0],
        reason: 'explicit_prerequisite',
      }
    }
  }

  const fallbackDifficulty = input.availableLessons
    .filter((lesson) => lesson.skillId === input.progress.skillId)
    .filter((lesson) => lesson.eligiblePurposes.includes('remediation'))
    .map((lesson) => lesson.difficulty)
    .filter((difficulty) => difficulty < input.progress.currentDifficulty)
    .sort((left, right) => right - left)[0]
  return fallbackDifficulty === undefined ? null : {
    skillId: input.progress.skillId,
    difficulty: fallbackDifficulty,
    reason: 'last_mastered_difficulty',
  }
}

function cloneProgress(progress: SkillProgressState): SkillProgressState {
  return {
    ...progress,
    qualifyingIndependentActivityIds: [...progress.qualifyingIndependentActivityIds],
    recentActivityUsage: progress.recentActivityUsage.map((entry) => ({
      ...entry,
      passageQuestionKeys: [...entry.passageQuestionKeys],
    })),
    lastDecisionReasonCodes: [...progress.lastDecisionReasonCodes],
    remediationContext: progress.remediationContext ? { ...progress.remediationContext } : null,
  }
}
