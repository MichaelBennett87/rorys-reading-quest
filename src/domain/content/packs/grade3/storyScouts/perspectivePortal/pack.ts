import type { ContentPack } from '../../../contentPackTypes'
import { characterPerspectiveGuides, perspectivePortalCoveragePatterns, perspectivePortalPassages } from './perspectiveGuides'
import { perspectivePortalLessons, perspectivePortalQuestions } from './questions'
import {
  PERSPECTIVE_PORTAL_BENCHMARK,
  PERSPECTIVE_PORTAL_PACK_ID,
  PERSPECTIVE_PORTAL_SKILL_ID,
  PERSPECTIVE_PORTAL_UNIT_ID,
  PERSPECTIVE_PORTAL_VERSION,
  PERSPECTIVE_PORTAL_WORLD_ID,
} from './ids'

export const perspectivePortalPack: ContentPack = {
  manifest: {
    packId: PERSPECTIVE_PORTAL_PACK_ID,
    packTitle: 'Grade 3 Story Scouts: Perspective Portal',
    gradeBand: 3,
    worldId: PERSPECTIVE_PORTAL_WORLD_ID,
    unitId: PERSPECTIVE_PORTAL_UNIT_ID,
    primarySkillId: PERSPECTIVE_PORTAL_SKILL_ID,
    benchmarkReferences: [PERSPECTIVE_PORTAL_BENCHMARK],
    coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 literary practice explaining and comparing how characters understand the same situation using words, actions, thoughts, feelings, motivations, changes, and evidence. Narrator point of view and author perspective are explicitly excluded.',
    difficultyRange: [2, 3],
    contentVersion: PERSPECTIVE_PORTAL_VERSION,
    reviewStatus: 'DRAFT',
    coveredPatterns: [...perspectivePortalCoveragePatterns],
    passageIds: perspectivePortalPassages.map((passage) => passage.passageIdentifier),
    questionIds: perspectivePortalQuestions.map((question) => question.questionIdentifier),
    lessonIds: perspectivePortalLessons.map((lesson) => lesson.lessonId),
  },
  passages: perspectivePortalPassages,
  questions: perspectivePortalQuestions,
  lessons: perspectivePortalLessons,
  characterPerspectiveGuides,
}
