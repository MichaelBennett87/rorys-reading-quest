import { getLessonById } from '../lesson'
import type { LessonActivityCandidate, NextQuestPlan } from './skillProgressTypes'
import type { QuestProgressV1 } from '../../persistence'
import { selectNextLesson } from './selectNextLesson'
import { createInitialSkillProgress } from './skillProgressTypes'
import { getTrackByUnitId } from '../curriculum'

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
  const selectedTrack = getTrackByUnitId(input.selectedUnitId)
  const currentSkill = selectedTrack
    ? input.progress.skillProgress[selectedTrack.skillId] ?? createInitialSkillProgress(
      selectedTrack.skillId,
      selectedTrack.initialDifficulty,
      selectedTrack.initialLastMasteredDifficulty,
    )
    : null
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

  if (input.selectedUnitId === 'wg-unit-4') {
    if (selectedDifficulty < 6) {
      return {
        status: 'locked',
        purpose: 'progression',
        unitId: input.selectedUnitId,
        reason: 'Complete Prefix Power to unlock Suffix Station.',
      }
    }
    if (selectedDifficulty >= 7) {
      if (contentNeededNextQuest && contentNeededNextQuest.difficulty >= 7) {
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
        reason: 'Suffix Station has no fresh content in this phase.',
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

  if (input.selectedUnitId === 'wg-unit-5') {
    if (selectedDifficulty < 7) {
      return {
        status: 'locked',
        purpose: 'progression',
        unitId: input.selectedUnitId,
        reason: 'Complete Suffix Station to unlock Quiet Letter Quest.',
      }
    }
    if (selectedDifficulty >= 8) {
      if (contentNeededNextQuest && contentNeededNextQuest.difficulty >= 8) {
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
        reason: 'Quiet Letter Quest has no fresh content in this phase.',
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

  if (input.selectedUnitId === 'wg-unit-6') {
    if (selectedDifficulty < 8) {
      return {
        status: 'locked',
        purpose: 'progression',
        unitId: input.selectedUnitId,
        reason: 'Complete Quiet Letter Quest to unlock Fluency Flight.',
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
    if (contentNeededNextQuest && contentNeededNextQuest.difficulty >= 8) {
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
      purpose: plan.purpose,
      skillId: plan.skillId,
      difficulty: plan.difficulty,
      reason: plan.reason,
      unitId: input.selectedUnitId,
    }
  }

  if (input.selectedUnitId === 'ss-unit-1') {
    if (selectedDifficulty >= 2) {
      if (contentNeededNextQuest && contentNeededNextQuest.difficulty >= 2) {
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
        purpose: plannedPurpose,
        skillId: currentSkill?.skillId ?? 'unknown',
        difficulty: selectedDifficulty,
        reason: 'Story Map quests are complete. Theme Trail is available.',
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

  if (input.selectedUnitId === 'ss-unit-2') {
    if (selectedDifficulty < 2) {
      return {
        status: 'locked',
        purpose: 'progression',
        unitId: input.selectedUnitId,
        reason: 'Complete Story Map to unlock Theme Trail.',
      }
    }

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
        purpose: contentNeededNextQuest?.purpose ?? plannedPurpose,
        skillId: currentSkill?.skillId ?? 'unknown',
        difficulty: selectedDifficulty,
        reason: 'Theme Trail quests are complete. Perspective Portal quests are being prepared.',
        unitId: input.selectedUnitId,
      }
    }

    const plan = selectNextLesson({
      skillId: currentSkill?.skillId ?? 'unknown',
      difficulty: selectedDifficulty,
      purpose: availableNextQuest?.purpose ?? 'progression',
      availableLessons: input.availableLessons.filter((lesson) => lesson.unitId === input.selectedUnitId),
      recentActivityUsage: currentSkill?.recentActivityUsage ?? [],
      preferredUnitId: input.selectedUnitId,
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

  if (input.selectedUnitId === 'ss-unit-3') {
    if (selectedDifficulty < 3) {
      return {
        status: 'locked',
        purpose: 'progression',
        unitId: input.selectedUnitId,
        reason: 'Complete Theme Trail to unlock Perspective Portal.',
      }
    }

    if (selectedDifficulty >= 4) {
      if (contentNeededNextQuest && contentNeededNextQuest.difficulty >= 4) {
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
        purpose: contentNeededNextQuest?.purpose ?? 'review',
        skillId: currentSkill?.skillId ?? 'unknown',
        difficulty: selectedDifficulty,
        reason: 'Perspective Portal quests are complete. Poetry Planet quests are being prepared.',
        unitId: input.selectedUnitId,
      }
    }

    const plan = selectNextLesson({
      skillId: currentSkill?.skillId ?? 'unknown',
      difficulty: selectedDifficulty,
      purpose: availableNextQuest?.purpose ?? 'progression',
      availableLessons: input.availableLessons.filter((lesson) => lesson.unitId === input.selectedUnitId),
      recentActivityUsage: currentSkill?.recentActivityUsage ?? [],
      preferredUnitId: input.selectedUnitId,
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

  if (selectedTrack) {
    const selectedLessons = input.availableLessons.filter((lesson) => lesson.unitId === input.selectedUnitId)
    if (selectedLessons.length === 0) {
      return {
        status: 'locked',
        purpose: plannedPurpose,
        unitId: input.selectedUnitId,
        reason: selectedTrack.status === 'planned_until_content_exists'
          ? `${selectedTrack.displayName} quests are being prepared.`
          : 'This unit has no active lesson content yet.',
      }
    }

    const selectedProgress = currentSkill ?? createInitialSkillProgress(
      selectedTrack.skillId,
      selectedTrack.initialDifficulty,
      selectedTrack.initialLastMasteredDifficulty,
    )
    const plan = selectNextLesson({
      skillId: selectedProgress.skillId,
      difficulty: selectedProgress.currentDifficulty,
      purpose: availableNextQuest?.purpose ?? 'progression',
      availableLessons: selectedLessons,
      recentActivityUsage: selectedProgress.recentActivityUsage,
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
