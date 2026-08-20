import type { ContentPack } from '../../../contentPackTypes'
import { grade2WordForgeCommonPrefixesLessons, grade2WordForgeCommonPrefixesManifest } from './manifest'
import { grade2WordForgeCommonPrefixesPassages } from './passages'
import { buildingBlockQuestions } from './questionsBuildingBlock'
import { guidedQuestions } from './questionsGuided'
import { checkpointQuestions } from './questionsCheckpoint'

export const grade2WordForgeCommonPrefixesPack: ContentPack = {
  manifest: grade2WordForgeCommonPrefixesManifest,
  passages: grade2WordForgeCommonPrefixesPassages,
  questions: [
    ...buildingBlockQuestions,
    ...guidedQuestions,
    ...checkpointQuestions,
  ],
  lessons: grade2WordForgeCommonPrefixesLessons,
}
