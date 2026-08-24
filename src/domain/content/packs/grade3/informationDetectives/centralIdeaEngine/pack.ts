import type { ContentPack } from '../../../contentPackTypes'
import {
  CENTRAL_IDEA_ENGINE_BENCHMARK, CENTRAL_IDEA_ENGINE_PACK_ID, CENTRAL_IDEA_ENGINE_SKILL_ID,
  CENTRAL_IDEA_ENGINE_UNIT_ID, CENTRAL_IDEA_ENGINE_VERSION, CENTRAL_IDEA_ENGINE_WORLD_ID,
} from './ids'
import { centralIdeaEngineGuides, centralIdeaEnginePassages } from './passages'
import { centralIdeaEngineLessons, centralIdeaEngineQuestions } from './questions'

export const centralIdeaEnginePack: ContentPack = {
  manifest: {
    packId: CENTRAL_IDEA_ENGINE_PACK_ID,
    packTitle: 'Grade 3 Information Detectives: Central Idea Engine',
    gradeBand: 3, worldId: CENTRAL_IDEA_ENGINE_WORLD_ID, unitId: CENTRAL_IDEA_ENGINE_UNIT_ID,
    primarySkillId: CENTRAL_IDEA_ENGINE_SKILL_ID, benchmarkReferences: [CENTRAL_IDEA_ENGINE_BENCHMARK], coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 informational reading practice identifying stated and implied central ideas and explaining how relevant details across sections support them.',
    difficultyRange: [1, 2], contentVersion: CENTRAL_IDEA_ENGINE_VERSION, reviewStatus: 'DRAFT',
    coveredPatterns: ['central-idea', 'relevant-details', 'details-support-central-idea', 'evidence-across-sections'],
    passageIds: centralIdeaEnginePassages.map((passage) => passage.passageIdentifier),
    questionIds: centralIdeaEngineQuestions.map((question) => question.questionIdentifier),
    lessonIds: centralIdeaEngineLessons.map((lesson) => lesson.lessonId),
  },
  passages: centralIdeaEnginePassages, questions: centralIdeaEngineQuestions, lessons: centralIdeaEngineLessons,
  centralIdeaGuides: centralIdeaEngineGuides,
}
