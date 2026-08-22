import type { ContentPack } from '../../../contentPackTypes'
import { grade2PoetryPlanetRhymeRoutesManifest, rhymeRoutesLessons } from './manifest'
import { rhymeRoutesPassages } from './passages'
import { rhymeRoutesCheckpointQuestions } from './questionsCheckpoint'
import { rhymeRoutesGuidedQuestions } from './questionsGuided'
import { rhymeRoutesBuildingBlockQuestions } from './questionsBuildingBlock'
import { rhymeRoutesRhymeSchemeGuides } from './rhymeSchemeGuides'

export const grade2PoetryPlanetRhymeRoutesPack: ContentPack = {
  manifest: grade2PoetryPlanetRhymeRoutesManifest,
  passages: rhymeRoutesPassages,
  questions: [
    ...rhymeRoutesBuildingBlockQuestions,
    ...rhymeRoutesGuidedQuestions,
    ...rhymeRoutesCheckpointQuestions,
  ],
  lessons: rhymeRoutesLessons,
  rhymeSchemeGuides: rhymeRoutesRhymeSchemeGuides,
}

