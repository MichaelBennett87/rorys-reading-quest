import type {
  LessonActivityCandidate,
  NextQuestPlan,
  RecentLessonActivityUsage,
} from './skillProgressTypes'
import type { LessonPurpose } from '../lesson'

export interface SelectNextLessonInput {
  skillId: string
  difficulty: number
  purpose: LessonPurpose
  availableLessons: readonly LessonActivityCandidate[]
  recentActivityUsage: readonly RecentLessonActivityUsage[]
}

export function selectNextLesson(input: SelectNextLessonInput): NextQuestPlan {
  const candidates = input.availableLessons
    .filter((lesson) => lesson.skillId === input.skillId)
    .filter((lesson) => lesson.difficulty === input.difficulty)
    .filter((lesson) => lesson.eligiblePurposes.includes(input.purpose))
    .slice()
    .sort((left, right) => left.activityId.localeCompare(right.activityId))

  const usedActivityIds = new Set(input.recentActivityUsage.map((usage) => usage.activityId))
  const lastUsage = input.recentActivityUsage.at(-1)
  const lastPassageQuestionKeys = new Set(lastUsage?.passageQuestionKeys ?? [])
  const fresh = candidates.filter((candidate) => (
    !usedActivityIds.has(candidate.activityId)
    && !candidate.passageQuestionKeys.some((key) => lastPassageQuestionKeys.has(key))
  ))

  if (!fresh[0]) {
    return {
      status: 'content_needed',
      purpose: input.purpose,
      skillId: input.skillId,
      difficulty: input.difficulty,
      reason: candidates.length === 0
        ? 'No lesson exists for this skill, difficulty, and purpose.'
        : 'No fresh lesson remains without repeating a recent activity or passage-question pair.',
    }
  }

  return { status: 'available', purpose: input.purpose, lesson: fresh[0] }
}
