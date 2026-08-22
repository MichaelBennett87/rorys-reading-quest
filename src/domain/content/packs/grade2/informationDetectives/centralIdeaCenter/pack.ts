import type { ContentPack } from '../../../contentPackTypes'
import { centralIdeaCenterGuides } from './centralIdeaGuides'
import { grade2InformationDetectivesCentralIdeaCenterManifest, centralIdeaCenterLessons } from './manifest'
import { centralIdeaCenterCheckpointQuestions } from './questionsCheckpoint'
import { centralIdeaCenterGuidedQuestions } from './questionsGuided'
import { centralIdeaCenterPrerequisiteQuestions } from './questionsPrerequisite'
import { centralIdeaCenterPassages } from './passages'

export const grade2InformationDetectivesCentralIdeaCenterPack: ContentPack = {
  manifest: grade2InformationDetectivesCentralIdeaCenterManifest,
  passages: [...centralIdeaCenterPassages],
  questions: [
    ...centralIdeaCenterPrerequisiteQuestions,
    ...centralIdeaCenterGuidedQuestions,
    ...centralIdeaCenterCheckpointQuestions,
  ],
  lessons: [...centralIdeaCenterLessons],
  centralIdeaGuides: [...centralIdeaCenterGuides],
}

