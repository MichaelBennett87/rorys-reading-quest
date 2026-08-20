import { grade2WordForgeVariableVowelsOoEaLessons, grade2WordForgeVariableVowelsOoEaManifest } from './manifest'
import { grade2WordForgeVariableVowelsOoEaPassages } from './passages'
import { checkpointQuestions } from './questionsCheckpoint'
import { buildingBlockQuestions } from './questionsBuildingBlock'
import { guidedQuestions } from './questionsGuided'
import type { ContentPack } from '../../../contentPackTypes'

export const grade2WordForgeVariableVowelsOoEaPack: ContentPack = {
  manifest: grade2WordForgeVariableVowelsOoEaManifest,
  passages: grade2WordForgeVariableVowelsOoEaPassages,
  questions: [
    ...checkpointQuestions,
    ...buildingBlockQuestions,
    ...guidedQuestions,
  ],
  lessons: grade2WordForgeVariableVowelsOoEaLessons,
}
