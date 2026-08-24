import type { ContentPack } from '../../../contentPackTypes'
import {
  STRUCTURE_STATION_BENCHMARK, STRUCTURE_STATION_PACK_ID, STRUCTURE_STATION_SKILL_ID,
  STRUCTURE_STATION_UNIT_ID, STRUCTURE_STATION_VERSION, STRUCTURE_STATION_WORLD_ID,
} from './ids'
import { informationalStructureGuides, structureStationPassages } from './passages'
import { structureStationLessons, structureStationQuestions } from './questions'

export const structureStationPack: ContentPack = {
  manifest: {
    packId: STRUCTURE_STATION_PACK_ID,
    packTitle: 'Grade 3 Information Detectives: Structure Station',
    gradeBand: 3, worldId: STRUCTURE_STATION_WORLD_ID, unitId: STRUCTURE_STATION_UNIT_ID,
    primarySkillId: STRUCTURE_STATION_SKILL_ID, benchmarkReferences: [STRUCTURE_STATION_BENCHMARK], coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 informational reading practice explaining how text features contribute to meaning and how chronology, comparison, and cause-and-effect structures organize ideas.',
    difficultyRange: [0, 1], contentVersion: STRUCTURE_STATION_VERSION, reviewStatus: 'DRAFT',
    coveredPatterns: ['text-features-contribute-to-meaning', 'chronology', 'comparison-structure', 'cause-effect-structure'],
    passageIds: structureStationPassages.map((passage) => passage.passageIdentifier),
    questionIds: structureStationQuestions.map((question) => question.questionIdentifier),
    lessonIds: structureStationLessons.map((lesson) => lesson.lessonId),
  },
  passages: structureStationPassages, questions: structureStationQuestions, lessons: structureStationLessons,
  informationalStructureGuides,
}
