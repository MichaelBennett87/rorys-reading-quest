import type { ContentPackManifest } from '../../../contentPackTypes'
import {
  RETELL_HALL_CONTENT_VERSION,
  RETELL_HALL_LESSON_IDS,
  RETELL_HALL_PACK_ID,
  RETELL_HALL_PACK_TITLE,
  RETELL_HALL_PRIMARY_SKILL_ID,
  RETELL_HALL_UNIT_ID,
  RETELL_HALL_WORLD_ID,
} from './ids'
import {
  RETELL_HALL_BROAD_PATTERNS,
  RETELL_HALL_COVERED_PATTERNS,
} from './patterns'
import { retellHallCheckpointQuestions } from './questionsCheckpoint'
import { retellHallGuidedQuestions } from './questionsGuided'
import { retellHallPrerequisiteQuestions } from './questionsPrerequisite'
import { retellHallPassages } from './passages'

const retellHallQuestionIds = [
  ...retellHallPrerequisiteQuestions,
  ...retellHallGuidedQuestions,
  ...retellHallCheckpointQuestions,
].map((question) => question.questionIdentifier)

export const grade2CompareCastleRetellHallManifest: ContentPackManifest = {
  packId: RETELL_HALL_PACK_ID,
  packTitle: RETELL_HALL_PACK_TITLE,
  gradeBand: 2,
  worldId: RETELL_HALL_WORLD_ID,
  unitId: RETELL_HALL_UNIT_ID,
  primarySkillId: RETELL_HALL_PRIMARY_SKILL_ID,
  benchmarkReferences: ['ELA.2.R.3.2'],
  partialBenchmarkCoverage:
    'Grade 2 structured authored retelling of literary texts using main story elements in logical sequence and informational texts using the central idea and relevant details, without oral-retell measurement, open-ended writing scoring, Grade 3 summarization, paired texts, or comparison analysis.',
  difficultyRange: [1, 2],
  contentVersion: RETELL_HALL_CONTENT_VERSION,
  reviewStatus: 'DRAFT',
  coverageKind: 'benchmark',
  coveredPatterns: [...RETELL_HALL_BROAD_PATTERNS, ...RETELL_HALL_COVERED_PATTERNS],
  passageIds: retellHallPassages.map((passage) => passage.passageIdentifier),
  questionIds: retellHallQuestionIds,
  lessonIds: [
    RETELL_HALL_LESSON_IDS.prereqStoryPartsInOrder,
    RETELL_HALL_LESSON_IDS.prereqCentralIdeaAndImportantDetails,
    RETELL_HALL_LESSON_IDS.guidedBuildALiteraryRetell,
    RETELL_HALL_LESSON_IDS.guidedBuildAnInformationalRetell,
    RETELL_HALL_LESSON_IDS.checkpointLiteraryA,
    RETELL_HALL_LESSON_IDS.checkpointInformational,
    RETELL_HALL_LESSON_IDS.checkpointLiteraryB,
  ],
}
