import type { ContentPack } from '../../../contentPackTypes'
import { summaryGuides, summaryStrongholdPassages } from './content'
import {
  SUMMARY_STRONGHOLD_BENCHMARK, SUMMARY_STRONGHOLD_PACK_ID, SUMMARY_STRONGHOLD_PASSAGE_IDS,
  SUMMARY_STRONGHOLD_SKILL_ID, SUMMARY_STRONGHOLD_UNIT_ID, SUMMARY_STRONGHOLD_VERSION, SUMMARY_STRONGHOLD_WORLD_ID,
} from './ids'
import { summaryStrongholdLessons, summaryStrongholdQuestions } from './questions'

export const summaryStrongholdPack: ContentPack = {
  manifest: {
    packId: SUMMARY_STRONGHOLD_PACK_ID, packTitle: 'Grade 3 Compare Castle: Summary Stronghold', gradeBand: 3,
    worldId: SUMMARY_STRONGHOLD_WORLD_ID, unitId: SUMMARY_STRONGHOLD_UNIT_ID, primarySkillId: SUMMARY_STRONGHOLD_SKILL_ID,
    benchmarkReferences: [SUMMARY_STRONGHOLD_BENCHMARK], coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 literary and informational summary selection and explanation, including plot, supported theme, central idea, relevant details, essential relationships, and important-versus-minor judgment.',
    difficultyRange: [1, 2], contentVersion: SUMMARY_STRONGHOLD_VERSION, reviewStatus: 'DRAFT',
    coveredPatterns: ['literary-summary', 'plot', 'theme', 'informational-summary', 'central-idea', 'relevant-details', 'important-vs-minor'],
    passageIds: [...SUMMARY_STRONGHOLD_PASSAGE_IDS], questionIds: summaryStrongholdQuestions.map((question) => question.questionIdentifier),
    lessonIds: summaryStrongholdLessons.map((lesson) => lesson.lessonId),
  },
  passages: summaryStrongholdPassages, questions: summaryStrongholdQuestions, lessons: summaryStrongholdLessons, summaryGuides,
}
