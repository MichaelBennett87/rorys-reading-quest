import type { ContentPack } from '../../../contentPackTypes'
import { grade2InformationDetectivesTextFeatureHuntManifest, textFeatureHuntLessons } from './manifest'
import { textFeatureHuntPassages } from './passages'
import { textFeatureHuntCheckpointQuestions } from './questionsCheckpoint'
import { textFeatureHuntBuildingBlockQuestions } from './questionsBuildingBlock'
import { textFeatureHuntGuidedQuestions } from './questionsGuided'
import { textFeatureHuntTextFeatureGuides } from './textFeatureGuides'

export const grade2InformationDetectivesTextFeatureHuntPack: ContentPack = {
  manifest: grade2InformationDetectivesTextFeatureHuntManifest,
  passages: [...textFeatureHuntPassages],
  questions: [
    ...textFeatureHuntBuildingBlockQuestions,
    ...textFeatureHuntGuidedQuestions,
    ...textFeatureHuntCheckpointQuestions,
  ],
  lessons: [...textFeatureHuntLessons],
  textFeatureGuides: [...textFeatureHuntTextFeatureGuides],
}
