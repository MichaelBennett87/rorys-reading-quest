import type { ContentPack } from '../../../contentPackTypes'
import { characterArcCoveragePatterns, characterArcPassages, characterDevelopmentGuides } from './characterDevelopmentGuides'
import { characterArcLessons, characterArcQuestions } from './questions'
import {
  CHARACTER_ARC_BENCHMARK,
  CHARACTER_ARC_PACK_ID,
  CHARACTER_ARC_SKILL_ID,
  CHARACTER_ARC_UNIT_ID,
  CHARACTER_ARC_VERSION,
  CHARACTER_ARC_WORLD_ID,
} from './ids'

export const characterArcCampPack: ContentPack = {
  manifest: {
    packId: CHARACTER_ARC_PACK_ID,
    packTitle: 'Grade 3 Story Scouts: Character Arc Camp',
    gradeBand: 3,
    worldId: CHARACTER_ARC_WORLD_ID,
    unitId: CHARACTER_ARC_UNIT_ID,
    primarySkillId: CHARACTER_ARC_SKILL_ID,
    benchmarkReferences: [CHARACTER_ARC_BENCHMARK],
    coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 literary practice explaining how one or more characters develop across the beginning, middle, and end of an original plot using actions, dialogue, thoughts, choices, turning points, and text evidence. Theme development and character perspective remain deferred.',
    difficultyRange: [0, 1],
    contentVersion: CHARACTER_ARC_VERSION,
    reviewStatus: 'DRAFT',
    coveredPatterns: [...characterArcCoveragePatterns],
    passageIds: characterArcPassages.map((passage) => passage.passageIdentifier),
    questionIds: characterArcQuestions.map((question) => question.questionIdentifier),
    lessonIds: characterArcLessons.map((lesson) => lesson.lessonId),
  },
  passages: characterArcPassages,
  questions: characterArcQuestions,
  lessons: characterArcLessons,
  characterDevelopmentGuides,
}
