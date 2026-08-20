import { getLessonById } from '../lesson'
import type { LessonActivityCandidate, NextQuestPlan } from './skillProgressTypes'
import type { QuestProgressV1 } from '../../persistence'
import { selectNextLesson } from './selectNextLesson'

export interface PlanUnitQuestInput {
  selectedUnitId: string
  progress: QuestProgressV1
  availableLessons: readonly LessonActivityCandidate[]
}

export type UnitQuestPlan =
  | {
      status: 'available'
      purpose: NextQuestPlan['purpose']
      lesson: LessonActivityCandidate
      lessonId: string
      unitId: string
      activityId: string
    }
  | {
      status: 'content_needed'
      purpose: NextQuestPlan['purpose']
      skillId: string
      difficulty: number
      reason: string
      unitId: string
    }
  | {
      status: 'locked'
      purpose: NextQuestPlan['purpose']
      unitId: string
      reason: string
    }

export function planUnitQuest(input: PlanUnitQuestInput): UnitQuestPlan {
  const currentSkill = Object.values(input.progress.skillProgress)[0]
  const activeSession = input.progress.activeLessonSession
  const plannedNextQuest = input.progress.plannedNextQuest
  const availableNextQuest = plannedNextQuest?.status === 'available' ? plannedNextQuest : null
  const contentNeededNextQuest = plannedNextQuest?.status === 'content_needed' ? plannedNextQuest : null
  const plannedPurpose = plannedNextQuest?.purpose ?? 'progression'
  const activeLesson = activeSession ? getLessonById(activeSession.lessonId).lesson : null
  const plannedLesson = availableNextQuest ? getLessonById(availableNextQuest.lesson.lessonId).lesson : null

  if (activeLesson && activeLesson.unitId === input.selectedUnitId) {
    const matchingLesson = input.availableLessons.find((lesson) => lesson.lessonId === activeLesson.lessonId)
    if (matchingLesson) {
      return {
        status: 'available',
        purpose: 'progression',
        lesson: matchingLesson,
        lessonId: matchingLesson.lessonId,
        unitId: matchingLesson.unitId,
        activityId: matchingLesson.activityId,
      }
    }
  }

  if (availableNextQuest && plannedLesson && plannedLesson.unitId === input.selectedUnitId) {
    return {
      status: 'available',
      purpose: availableNextQuest.purpose,
      lesson: availableNextQuest.lesson,
      lessonId: availableNextQuest.lesson.lessonId,
      unitId: plannedLesson.unitId,
      activityId: availableNextQuest.lesson.activityId,
    }
  }

  if (activeLesson && activeLesson.unitId !== input.selectedUnitId) {
    return {
      status: 'locked',
      purpose: plannedPurpose,
      unitId: input.selectedUnitId,
      reason: 'A different quest is already in progress. Continue that quest before starting this unit.',
    }
  }

  if (availableNextQuest && plannedLesson && plannedLesson.unitId !== input.selectedUnitId) {
    return {
      status: 'locked',
      purpose: plannedPurpose,
      unitId: input.selectedUnitId,
      reason: 'A different quest is already in progress. Continue that quest before starting this unit.',
    }
  }

  const selectedDifficulty = currentSkill?.currentDifficulty ?? 1
  if (input.selectedUnitId === 'wg-unit-1') {
    if (selectedDifficulty >= 3) {
      if (contentNeededNextQuest && contentNeededNextQuest.difficulty >= 3) {
        return {
          status: 'content_needed',
          purpose: contentNeededNextQuest.purpose,
          skillId: contentNeededNextQuest.skillId,
          difficulty: contentNeededNextQuest.difficulty,
          reason: contentNeededNextQuest.reason,
          unitId: input.selectedUnitId,
        }
      }
      return {
        status: 'content_needed',
        purpose: 'review',
        skillId: currentSkill?.skillId ?? 'unknown',
        difficulty: selectedDifficulty,
        reason: 'Vowel Voyage is complete for normal progression. A review quest will appear when needed.',
        unitId: input.selectedUnitId,
      }
    }

    const plan = selectNextLesson({
      skillId: currentSkill?.skillId ?? 'unknown',
      difficulty: selectedDifficulty,
      purpose: 'progression',
      availableLessons: input.availableLessons.filter((lesson) => lesson.unitId === input.selectedUnitId),
      recentActivityUsage: currentSkill?.recentActivityUsage ?? [],
    })
    if (plan.status === 'available') {
      return {
        status: 'available',
        purpose: plan.purpose,
        lesson: plan.lesson,
        lessonId: plan.lesson.lessonId,
        unitId: plan.lesson.unitId,
        activityId: plan.lesson.activityId,
      }
    }
    return {
      status: 'content_needed',
      purpose: plan.purpose,
      skillId: plan.skillId,
      difficulty: plan.difficulty,
      reason: plan.reason,
      unitId: input.selectedUnitId,
    }
  }

  if (input.selectedUnitId === 'wg-unit-2') {
    if (selectedDifficulty < 3) {
      return {
        status: 'locked',
        purpose: 'progression',
        unitId: input.selectedUnitId,
        reason: 'Complete Vowel Voyage to unlock Syllable Summit.',
      }
    }
    if (selectedDifficulty >= 5) {
      if (contentNeededNextQuest && contentNeededNextQuest.difficulty >= 5) {
        return {
          status: 'content_needed',
          purpose: contentNeededNextQuest.purpose,
          skillId: contentNeededNextQuest.skillId,
          difficulty: contentNeededNextQuest.difficulty,
          reason: contentNeededNextQuest.reason,
          unitId: input.selectedUnitId,
        }
      }
      return {
        status: 'content_needed',
        purpose: contentNeededNextQuest?.purpose ?? plannedPurpose,
        skillId: currentSkill?.skillId ?? 'unknown',
        difficulty: selectedDifficulty,
        reason: 'Syllable Summit has no fresh content in this phase.',
        unitId: input.selectedUnitId,
      }
    }

    const plan = selectNextLesson({
      skillId: currentSkill?.skillId ?? 'unknown',
      difficulty: selectedDifficulty,
      purpose: availableNextQuest?.purpose ?? 'progression',
      availableLessons: input.availableLessons.filter((lesson) => lesson.unitId === input.selectedUnitId),
      recentActivityUsage: currentSkill?.recentActivityUsage ?? [],
    })
    if (plan.status === 'available') {
      return {
        status: 'available',
        purpose: plan.purpose,
        lesson: plan.lesson,
        lessonId: plan.lesson.lessonId,
        unitId: plan.lesson.unitId,
        activityId: plan.lesson.activityId,
      }
    }
    return {
      status: 'content_needed',
      purpose: plan.purpose,
      skillId: plan.skillId,
      difficulty: plan.difficulty,
      reason: plan.reason,
      unitId: input.selectedUnitId,
    }
  }

  if (input.selectedUnitId === 'wg-unit-3') {
    if (selectedDifficulty < 5) {
      return {
        status: 'locked',
        purpose: 'progression',
        unitId: input.selectedUnitId,
        reason: 'Complete Syllable Summit to unlock Prefix Power.',
      }
    }
    if (selectedDifficulty >= 6) {
      if (contentNeededNextQuest && contentNeededNextQuest.difficulty >= 6) {
        return {
          status: 'content_needed',
          purpose: contentNeededNextQuest.purpose,
          skillId: contentNeededNextQuest.skillId,
          difficulty: contentNeededNextQuest.difficulty,
          reason: contentNeededNextQuest.reason,
          unitId: input.selectedUnitId,
        }
      }
      return {
        status: 'content_needed',
        purpose: contentNeededNextQuest?.purpose ?? plannedPurpose,
        skillId: currentSkill?.skillId ?? 'unknown',
        difficulty: selectedDifficulty,
        reason: 'Prefix Power has no fresh content in this phase.',
        unitId: input.selectedUnitId,
      }
    }

    const plan = selectNextLesson({
      skillId: currentSkill?.skillId ?? 'unknown',
      difficulty: selectedDifficulty,
      purpose: availableNextQuest?.purpose ?? 'progression',
      availableLessons: input.availableLessons.filter((lesson) => lesson.unitId === input.selectedUnitId),
      recentActivityUsage: currentSkill?.recentActivityUsage ?? [],
    })
    if (plan.status === 'available') {
      return {
        status: 'available',
        purpose: plan.purpose,
        lesson: plan.lesson,
        lessonId: plan.lesson.lessonId,
        unitId: plan.lesson.unitId,
        activityId: plan.lesson.activityId,
      }
    }
    return {
      status: 'content_needed',
      purpose: plan.purpose,
      skillId: plan.skillId,
      difficulty: plan.difficulty,
      reason: plan.reason,
      unitId: input.selectedUnitId,
    }
  }

  return {
    status: 'locked',
    purpose: 'progression',
    unitId: input.selectedUnitId,
    reason: 'This unit remains locked for later phases.',
  }
}
