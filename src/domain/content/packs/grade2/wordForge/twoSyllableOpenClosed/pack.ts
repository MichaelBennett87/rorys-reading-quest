import type { ContentPack } from '../../../contentPackTypes'
import { grade2WordForgeTwoSyllableOpenClosedLessons, grade2WordForgeTwoSyllableOpenClosedManifest } from './manifest'
import { grade2WordForgeTwoSyllableOpenClosedPassages } from './passages'
import { buildingBlockQuestions } from './questionsBuildingBlock'
import { guidedQuestions } from './questionsGuided'
import { checkpointQuestions } from './questionsCheckpoint'

export const grade2WordForgeTwoSyllableOpenClosedPack: ContentPack = {
  manifest: grade2WordForgeTwoSyllableOpenClosedManifest,
  passages: grade2WordForgeTwoSyllableOpenClosedPassages,
  questions: [
    ...buildingBlockQuestions,
    ...guidedQuestions,
    ...checkpointQuestions,
  ],
  lessons: grade2WordForgeTwoSyllableOpenClosedLessons,
}

