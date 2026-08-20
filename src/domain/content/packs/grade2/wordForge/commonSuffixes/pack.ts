import type { ContentPack } from '../../../contentPackTypes'
import { grade2WordForgeCommonSuffixesLessons, grade2WordForgeCommonSuffixesManifest } from './manifest'
import { grade2WordForgeCommonSuffixesPassages } from './passages'
import { buildingBlockQuestions } from './questionsBuildingBlock'
import { guidedQuestions } from './questionsGuided'
import { checkpointQuestions } from './questionsCheckpoint'

export const grade2WordForgeCommonSuffixesPack: ContentPack = {
  manifest: grade2WordForgeCommonSuffixesManifest,
  passages: grade2WordForgeCommonSuffixesPassages,
  questions: [
    ...buildingBlockQuestions,
    ...guidedQuestions,
    ...checkpointQuestions,
  ],
  lessons: grade2WordForgeCommonSuffixesLessons,
}

