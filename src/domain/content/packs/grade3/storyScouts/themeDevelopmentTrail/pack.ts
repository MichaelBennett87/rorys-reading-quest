import type { ContentPack } from '../../../contentPackTypes'
import { themeDevelopmentCoveragePatterns, themeDevelopmentGuides, themeDevelopmentPassages } from './themeDevelopmentGuides'
import { themeDevelopmentLessons, themeDevelopmentQuestions } from './questions'
import {
  THEME_DEVELOPMENT_BENCHMARK,
  THEME_DEVELOPMENT_PACK_ID,
  THEME_DEVELOPMENT_SKILL_ID,
  THEME_DEVELOPMENT_UNIT_ID,
  THEME_DEVELOPMENT_VERSION,
  THEME_DEVELOPMENT_WORLD_ID,
} from './ids'

export const themeDevelopmentTrailPack: ContentPack = {
  manifest: {
    packId: THEME_DEVELOPMENT_PACK_ID,
    packTitle: 'Grade 3 Story Scouts: Theme Development Trail',
    gradeBand: 3,
    worldId: THEME_DEVELOPMENT_WORLD_ID,
    unitId: THEME_DEVELOPMENT_UNIT_ID,
    primarySkillId: THEME_DEVELOPMENT_SKILL_ID,
    benchmarkReferences: [THEME_DEVELOPMENT_BENCHMARK],
    coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 literary practice explaining a best-supported theme and how beginning, middle, turning-point, and ending details develop it. Character perspective and narrator point of view remain deferred.',
    difficultyRange: [1, 2],
    contentVersion: THEME_DEVELOPMENT_VERSION,
    reviewStatus: 'DRAFT',
    coveredPatterns: [...themeDevelopmentCoveragePatterns],
    passageIds: themeDevelopmentPassages.map((passage) => passage.passageIdentifier),
    questionIds: themeDevelopmentQuestions.map((question) => question.questionIdentifier),
    lessonIds: themeDevelopmentLessons.map((lesson) => lesson.lessonId),
  },
  passages: themeDevelopmentPassages,
  questions: themeDevelopmentQuestions,
  lessons: themeDevelopmentLessons,
  themeDevelopmentGuides,
}
