import type { ContentPack } from '../../../contentPackTypes'
import {
  PURPOSE_DEVELOPMENT_BENCHMARK, PURPOSE_DEVELOPMENT_PACK_ID, PURPOSE_DEVELOPMENT_SKILL_ID,
  PURPOSE_DEVELOPMENT_UNIT_ID, PURPOSE_DEVELOPMENT_VERSION, PURPOSE_DEVELOPMENT_WORLD_ID,
} from './ids'
import { purposeDevelopmentGuides, purposeDevelopmentPassages } from './passages'
import { purposeDevelopmentLessons, purposeDevelopmentQuestions } from './questions'

export const purposeDevelopmentPack: ContentPack = {
  manifest: {
    packId: PURPOSE_DEVELOPMENT_PACK_ID,
    packTitle: 'Grade 3 Information Detectives: Purpose Development Path',
    gradeBand: 3, worldId: PURPOSE_DEVELOPMENT_WORLD_ID, unitId: PURPOSE_DEVELOPMENT_UNIT_ID,
    primarySkillId: PURPOSE_DEVELOPMENT_SKILL_ID, benchmarkReferences: [PURPOSE_DEVELOPMENT_BENCHMARK], coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 informational reading practice explaining precise author purpose and how details, sections, examples, and organization develop that purpose.',
    difficultyRange: [2, 3], contentVersion: PURPOSE_DEVELOPMENT_VERSION, reviewStatus: 'DRAFT',
    coveredPatterns: ['author-purpose', 'purpose-development', 'supporting-details', 'text-evidence'],
    passageIds: purposeDevelopmentPassages.map((passage) => passage.passageIdentifier),
    questionIds: purposeDevelopmentQuestions.map((question) => question.questionIdentifier),
    lessonIds: purposeDevelopmentLessons.map((lesson) => lesson.lessonId),
  },
  passages: purposeDevelopmentPassages, questions: purposeDevelopmentQuestions, lessons: purposeDevelopmentLessons,
  authorPurposeGuides: purposeDevelopmentGuides,
}
