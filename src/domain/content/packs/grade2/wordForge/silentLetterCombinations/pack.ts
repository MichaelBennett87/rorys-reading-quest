import type { ContentPack } from '../../../contentPackTypes'
import { grade2WordForgeSilentLetterCombinationsLessons, grade2WordForgeSilentLetterCombinationsManifest } from './manifest'
import { grade2WordForgeSilentLetterCombinationsPassages } from './passages'
import { buildingBlockQuestions } from './questionsBuildingBlock'
import { guidedQuestions } from './questionsGuided'
import { checkpointQuestions } from './questionsCheckpoint'

export const grade2WordForgeSilentLetterCombinationsPack: ContentPack = {
  manifest: grade2WordForgeSilentLetterCombinationsManifest,
  passages: grade2WordForgeSilentLetterCombinationsPassages,
  questions: [
    ...buildingBlockQuestions,
    ...guidedQuestions,
    ...checkpointQuestions,
  ],
  lessons: grade2WordForgeSilentLetterCombinationsLessons,
}
