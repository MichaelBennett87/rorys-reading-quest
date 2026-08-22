import type { ContentPack } from '../../../contentPackTypes'
import { authorOpinionGuides } from './authorOpinionGuides'
import { grade2InformationDetectivesOpinionEvidenceDeskManifest, opinionEvidenceDeskLessons } from './manifest'
import { opinionEvidenceDeskCheckpointQuestions } from './questionsCheckpoint'
import { opinionEvidenceDeskGuidedQuestions } from './questionsGuided'
import { opinionEvidenceDeskPrerequisiteQuestions } from './questionsPrerequisite'
import { opinionEvidenceDeskPassages } from './passages'

export const grade2InformationDetectivesOpinionEvidenceDeskPack: ContentPack = {
  manifest: grade2InformationDetectivesOpinionEvidenceDeskManifest,
  passages: [...opinionEvidenceDeskPassages],
  questions: [
    ...opinionEvidenceDeskPrerequisiteQuestions,
    ...opinionEvidenceDeskGuidedQuestions,
    ...opinionEvidenceDeskCheckpointQuestions,
  ],
  lessons: [...opinionEvidenceDeskLessons],
  authorOpinionGuides: [...authorOpinionGuides],
}
