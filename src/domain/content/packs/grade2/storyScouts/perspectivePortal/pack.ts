import type { ContentPack } from '../../../contentPackTypes'
import { grade2StoryScoutsPerspectivePortalManifest, perspectivePortalLessons } from './manifest'
import { perspectivePortalPassages } from './passages'
import {
  perspectivePortalCheckpointQuestions,
  perspectivePortalGuidedQuestions,
  perspectivePortalPrerequisiteQuestions,
} from './questions'
import { perspectivePortalPerspectiveGuides } from './perspectiveGuides'

export const grade2StoryScoutsPerspectivePortalPack: ContentPack = {
  manifest: grade2StoryScoutsPerspectivePortalManifest,
  passages: perspectivePortalPassages,
  questions: [
    ...perspectivePortalPrerequisiteQuestions,
    ...perspectivePortalGuidedQuestions,
    ...perspectivePortalCheckpointQuestions,
  ],
  lessons: perspectivePortalLessons,
  perspectiveGuides: perspectivePortalPerspectiveGuides,
}
