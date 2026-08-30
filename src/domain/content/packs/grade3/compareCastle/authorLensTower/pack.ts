import type { ContentPack } from '../../../contentPackTypes'
import { authorLensComparisonGuides, authorLensPairedTextSets, authorLensPassages } from './content'
import {
  AUTHOR_LENS_BENCHMARK,
  AUTHOR_LENS_PACK_ID,
  AUTHOR_LENS_PASSAGE_IDS,
  AUTHOR_LENS_SKILL_ID,
  AUTHOR_LENS_UNIT_ID,
  AUTHOR_LENS_VERSION,
  AUTHOR_LENS_WORLD_ID,
} from './ids'
import { authorLensLessons, authorLensQuestions } from './questions'

export const authorLensTowerPack: ContentPack = {
  manifest: {
    packId: AUTHOR_LENS_PACK_ID,
    packTitle: 'Grade 3 Compare Castle: Author Lens Tower',
    gradeBand: 3,
    worldId: AUTHOR_LENS_WORLD_ID,
    unitId: AUTHOR_LENS_UNIT_ID,
    primarySkillId: AUTHOR_LENS_SKILL_ID,
    benchmarkReferences: [AUTHOR_LENS_BENCHMARK],
    coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 comparison and contrast of how two authors present the same topic or theme through focus, organization, examples, evidence, events, dialogue, actions, descriptions, and text features, supported by evidence from both texts.',
    difficultyRange: [2, 3],
    contentVersion: AUTHOR_LENS_VERSION,
    reviewStatus: 'DRAFT',
    coveredPatterns: ['two-author-comparison', 'same-topic-or-theme', 'presentation-similarity', 'presentation-difference', 'evidence-from-both-texts'],
    passageIds: [...AUTHOR_LENS_PASSAGE_IDS],
    questionIds: authorLensQuestions.map((question) => question.questionIdentifier),
    lessonIds: authorLensLessons.map((lesson) => lesson.lessonId),
  },
  passages: authorLensPassages,
  questions: authorLensQuestions,
  lessons: authorLensLessons,
  pairedTextSets: authorLensPairedTextSets,
  grade3AuthorComparisonGuides: authorLensComparisonGuides,
}
