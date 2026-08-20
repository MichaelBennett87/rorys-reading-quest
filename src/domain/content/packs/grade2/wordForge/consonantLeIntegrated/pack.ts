import type { ContentPack } from '../../../contentPackTypes'
import { grade2WordForgeConsonantLeLessons, grade2WordForgeConsonantLeManifest } from './manifest'
import { grade2WordForgeConsonantLePassages } from './passages'
import { buildingBlockQuestions } from './questionsBuildingBlock'
import { guidedQuestions } from './questionsGuided'
import { checkpointQuestions } from './questionsCheckpoint'

export const grade2WordForgeConsonantLePack: ContentPack = {
  manifest: grade2WordForgeConsonantLeManifest,
  passages: grade2WordForgeConsonantLePassages,
  questions: [
    ...buildingBlockQuestions,
    ...guidedQuestions,
    ...checkpointQuestions,
  ],
  lessons: grade2WordForgeConsonantLeLessons,
}
