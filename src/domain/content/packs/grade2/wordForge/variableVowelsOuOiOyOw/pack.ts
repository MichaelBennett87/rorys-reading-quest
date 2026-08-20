import type { ContentPack } from '../../../contentPackTypes'
import { grade2WordForgeVariableVowelsOuOiOyOwManifest, grade2WordForgeVariableVowelsOuOiOyOwLessons } from './manifest'
import { grade2WordForgeVariableVowelsOuOiOyOwPassages } from './passages'
import { buildingBlockQuestions } from './questionsBuildingBlock'
import { guidedQuestions } from './questionsGuided'
import { checkpointQuestions } from './questionsCheckpoint'

export const grade2WordForgeVariableVowelsOuOiOyOwPack: ContentPack = {
  manifest: grade2WordForgeVariableVowelsOuOiOyOwManifest,
  passages: grade2WordForgeVariableVowelsOuOiOyOwPassages,
  questions: [
    ...buildingBlockQuestions,
    ...guidedQuestions,
    ...checkpointQuestions,
  ],
  lessons: grade2WordForgeVariableVowelsOuOiOyOwLessons,
}
