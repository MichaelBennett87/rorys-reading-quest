import type { ContentPack } from '../../../contentPackTypes'
import { grade2StoryScoutsThemeTrailManifest, themeTrailLessons } from './manifest'
import { themeTrailPassages } from './passages'
import { themeTrailCheckpointQuestions } from './questionsCheckpoint'
import { themeTrailGuidedQuestions } from './questionsGuided'
import { themeTrailPrerequisiteQuestions } from './questionsPrerequisite'
import { themeTrailThemeGuides } from './themeGuides'

export const grade2StoryScoutsThemeTrailPack: ContentPack = {
  manifest: grade2StoryScoutsThemeTrailManifest,
  passages: themeTrailPassages,
  questions: [
    ...themeTrailPrerequisiteQuestions,
    ...themeTrailGuidedQuestions,
    ...themeTrailCheckpointQuestions,
  ],
  lessons: themeTrailLessons,
  themeGuides: themeTrailThemeGuides,
}
