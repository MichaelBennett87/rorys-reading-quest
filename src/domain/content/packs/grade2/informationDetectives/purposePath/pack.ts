import type { ContentPack } from '../../../contentPackTypes'
import { authorPurposeGuides } from './authorPurposeGuides'
import { grade2InformationDetectivesPurposePathManifest, purposePathLessons } from './manifest'
import { purposePathCheckpointQuestions } from './questionsCheckpoint'
import { purposePathGuidedQuestions } from './questionsGuided'
import { purposePathPrerequisiteQuestions } from './questionsPrerequisite'
import { purposePathPassages } from './passages'

export const grade2InformationDetectivesPurposePathPack: ContentPack = {
  manifest: grade2InformationDetectivesPurposePathManifest,
  passages: [...purposePathPassages],
  questions: [
    ...purposePathPrerequisiteQuestions,
    ...purposePathGuidedQuestions,
    ...purposePathCheckpointQuestions,
  ],
  lessons: [...purposePathLessons],
  authorPurposeGuides: [...authorPurposeGuides],
}





