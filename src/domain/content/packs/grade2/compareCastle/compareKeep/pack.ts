import type { ContentPack } from '../../../contentPackTypes'
import { compareKeepComparisonGuides } from './comparisonGuides'
import { compareKeepInformationalPassages } from './informationalPassages'
import { compareKeepLessons, compareKeepManifest } from './manifest'
import { compareKeepLiteraryPassages } from './literaryPassages'
import { compareKeepLiteraryPoems } from './literaryPoems'
import { compareKeepPairedTextSets } from './pairedTextSets'
import { compareKeepCheckpointQuestions } from './questionsCheckpoint'
import { compareKeepPrerequisiteQuestions } from './questionsPrerequisite'
import { compareKeepGuidedQuestions } from './questionsGuided'

export const grade2CompareCastleCompareKeepPack: ContentPack = {
  manifest: compareKeepManifest,
  passages: [
    ...compareKeepLiteraryPassages,
    ...compareKeepLiteraryPoems,
    ...compareKeepInformationalPassages,
  ],
  questions: [
    ...compareKeepPrerequisiteQuestions,
    ...compareKeepGuidedQuestions,
    ...compareKeepCheckpointQuestions,
  ],
  lessons: compareKeepLessons,
  pairedTextSets: [...compareKeepPairedTextSets],
  pairedTextComparisonGuides: [...compareKeepComparisonGuides],
}
