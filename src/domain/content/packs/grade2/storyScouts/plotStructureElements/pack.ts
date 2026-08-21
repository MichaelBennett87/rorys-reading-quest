import type { ContentPack } from '../../../contentPackTypes'
import { storyMapLessons, grade2StoryScoutsPlotStructureElementsManifest } from './manifest'
import { storyMapPassages } from './passages'
import { storyMapBuildingBlockQuestions } from './questionsBuildingBlock'
import { storyMapCheckpointQuestions } from './questionsCheckpoint'
import { storyMapGuidedQuestions } from './questionsGuided'

export const grade2StoryScoutsPlotStructureElementsPack: ContentPack = {
  manifest: grade2StoryScoutsPlotStructureElementsManifest,
  passages: storyMapPassages,
  questions: [
    ...storyMapBuildingBlockQuestions,
    ...storyMapGuidedQuestions,
    ...storyMapCheckpointQuestions,
  ],
  lessons: storyMapLessons,
}

