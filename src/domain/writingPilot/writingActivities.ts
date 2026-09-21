import { sampleContent } from '../content'
import {
  CHARACTER_ARC_LESSON_IDS,
  CHARACTER_ARC_PASSAGE_IDS,
  CHARACTER_ARC_VERSION,
  STORY_MAP_CONTENT_VERSION,
  STORY_MAP_LESSON_IDS,
  STORY_MAP_PASSAGE_IDS,
} from '../content/packs'
import type { LessonDefinition, LessonPurpose } from '../lesson'
import type { WritingPilotActivity } from './writingPilotTypes'

export const WRITING_PILOT_CATALOG_VERSION = 'rrq-writing-pilot-r0.1.0'

export const writingPilotActivities: readonly WritingPilotActivity[] = [
  {
    activityId: 'rw-g2-tia-wrappers-reason',
    title: "Tia's Cleanup Plan: Explain a Choice",
    gradeBand: 2,
    triggerLessonId: STORY_MAP_LESSON_IDS.checkpointA,
    sourcePassageId: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
    sourceContentVersion: STORY_MAP_CONTENT_VERSION,
    prompt: 'Why did Tia collect the light wrappers first? Write one sentence using a detail from the story.',
    rubricVersion: 'rw-rubric-tia-r1',
    reviewStatus: 'DRAFT',
  },
  {
    activityId: 'rw-g2-tia-solution',
    title: "Tia's Cleanup Plan: Explain the Solution",
    gradeBand: 2,
    triggerLessonId: STORY_MAP_LESSON_IDS.checkpointA,
    sourcePassageId: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
    sourceContentVersion: STORY_MAP_CONTENT_VERSION,
    prompt: 'How did Tia and the neighbors solve the sidewalk problem? Write one sentence using a detail from the story.',
    rubricVersion: 'rw-rubric-tia-r2',
    reviewStatus: 'DRAFT',
  },
  {
    activityId: 'rw-g2-bridge-brace-reason',
    title: 'The Steady Bridge: Explain a Choice',
    gradeBand: 2,
    triggerLessonId: STORY_MAP_LESSON_IDS.checkpointB,
    sourcePassageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
    sourceContentVersion: STORY_MAP_CONTENT_VERSION,
    prompt: 'Why did Carlos suggest adding a brace beneath the beam? Write one sentence using a detail from the story.',
    rubricVersion: 'rw-rubric-bridge-r1',
    reviewStatus: 'DRAFT',
  },
  {
    activityId: 'rw-g2-bridge-proof',
    title: 'The Steady Bridge: Use Evidence',
    gradeBand: 2,
    triggerLessonId: STORY_MAP_LESSON_IDS.checkpointB,
    sourcePassageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
    sourceContentVersion: STORY_MAP_CONTENT_VERSION,
    prompt: 'How did Carlos and Emmi know the bridge was fixed? Write one sentence using evidence from the story.',
    rubricVersion: 'rw-rubric-bridge-r2',
    reviewStatus: 'DRAFT',
  },
  {
    activityId: 'rw-g3-jalen-new-plan',
    title: 'The Bent Trail Marker: Explain a Decision',
    gradeBand: 3,
    triggerLessonId: CHARACTER_ARC_LESSON_IDS[2],
    sourcePassageId: CHARACTER_ARC_PASSAGE_IDS[2],
    sourceContentVersion: CHARACTER_ARC_VERSION,
    prompt: "Why did Jalen decide to try Mara's plan? Write one sentence using evidence from the story.",
    rubricVersion: 'rw-rubric-jalen-r1',
    reviewStatus: 'DRAFT',
  },
  {
    activityId: 'rw-g3-jalen-change',
    title: 'The Bent Trail Marker: Explain Character Change',
    gradeBand: 3,
    triggerLessonId: CHARACTER_ARC_LESSON_IDS[2],
    sourcePassageId: CHARACTER_ARC_PASSAGE_IDS[2],
    sourceContentVersion: CHARACTER_ARC_VERSION,
    prompt: 'How did Jalen change from the beginning to the end? Write one sentence using evidence from the story.',
    rubricVersion: 'rw-rubric-jalen-r2',
    reviewStatus: 'DRAFT',
  },
] as const

export function getWritingPilotActivity(activityId: string): WritingPilotActivity | null {
  return writingPilotActivities.find((activity) => activity.activityId === activityId) ?? null
}

export function getWritingPilotPassage(activity: WritingPilotActivity) {
  return sampleContent.passages.find((passage) => passage.passageIdentifier === activity.sourcePassageId) ?? null
}

export function selectWritingActivityAfterLesson(input: {
  lesson: LessonDefinition
  purpose: LessonPurpose
  offeredActivityIds: readonly string[]
}): WritingPilotActivity | null {
  if (input.lesson.lessonRole !== 'CHECKPOINT') return null
  if (input.purpose !== 'progression' && input.purpose !== 'verification') return null
  return writingPilotActivities.find((activity) => (
    activity.triggerLessonId === input.lesson.lessonId
    && input.lesson.passageIds.includes(activity.sourcePassageId)
    && !input.offeredActivityIds.includes(activity.activityId)
  )) ?? null
}

export function validateWritingPilotCatalog(): string[] {
  const issues: string[] = []
  const activityIds = new Set<string>()
  const sourceIds = new Set<string>()
  for (const activity of writingPilotActivities) {
    if (activityIds.has(activity.activityId)) issues.push(`Duplicate writing activity: ${activity.activityId}`)
    activityIds.add(activity.activityId)
    sourceIds.add(activity.sourcePassageId)
    const passage = getWritingPilotPassage(activity)
    if (!passage) issues.push(`${activity.activityId}: source passage is missing.`)
    if (passage && passage.contentVersion !== activity.sourceContentVersion) {
      issues.push(`${activity.activityId}: source content version is stale.`)
    }
    if (!activity.prompt.includes('one sentence') || !/detail|evidence/i.test(activity.prompt)) {
      issues.push(`${activity.activityId}: prompt must request one source-supported sentence.`)
    }
    if (activity.reviewStatus !== 'DRAFT') issues.push(`${activity.activityId}: pilot content must remain DRAFT.`)
  }
  if (writingPilotActivities.length !== 6) issues.push('The pilot must contain exactly six activities.')
  if (sourceIds.size !== 3) issues.push('The pilot must use exactly three existing passages.')
  return issues
}
