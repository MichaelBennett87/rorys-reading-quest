import type { ContentPackManifest } from '../../../contentPackTypes'
import {
  WORDPLAY_WATCHTOWER_CONTENT_VERSION,
  WORDPLAY_WATCHTOWER_LESSON_IDS,
  WORDPLAY_WATCHTOWER_PACK_ID,
  WORDPLAY_WATCHTOWER_PACK_TITLE,
  WORDPLAY_WATCHTOWER_PRIMARY_SKILL_ID,
  WORDPLAY_WATCHTOWER_UNIT_ID,
  WORDPLAY_WATCHTOWER_WORLD_ID,
} from './ids'
import { wordplayWatchtowerCheckpointQuestions } from './questionsCheckpoint'
import { wordplayWatchtowerGuidedQuestions } from './questionsGuided'
import { wordplayWatchtowerPrerequisiteQuestions } from './questionsPrerequisite'
import { WORDPLAY_WATCHTOWER_BROAD_PATTERNS, WORDPLAY_WATCHTOWER_DETAILED_PATTERNS } from './patterns'
import { wordplayWatchtowerPassages } from './wordplayGuides'

const wordplayWatchtowerQuestionIds = [
  ...wordplayWatchtowerPrerequisiteQuestions,
  ...wordplayWatchtowerGuidedQuestions,
  ...wordplayWatchtowerCheckpointQuestions,
].map((question) => question.questionIdentifier)

export const grade2CompareCastleWordplayWatchtowerManifest: ContentPackManifest = {
  packId: WORDPLAY_WATCHTOWER_PACK_ID,
  packTitle: WORDPLAY_WATCHTOWER_PACK_TITLE,
  gradeBand: 2,
  worldId: WORDPLAY_WATCHTOWER_WORLD_ID,
  unitId: WORDPLAY_WATCHTOWER_UNIT_ID,
  primarySkillId: WORDPLAY_WATCHTOWER_PRIMARY_SKILL_ID,
  benchmarkReferences: ['ELA.2.R.3.1'],
  partialBenchmarkCoverage:
    'Grade 2 identification and explanation of similes, idioms, and alliteration in original prose and poetry without metaphors, personification, hyperbole, tone analysis, mood analysis, retell, or paired-text comparison.',
  difficultyRange: [0, 1],
  contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
  reviewStatus: 'DRAFT',
  coverageKind: 'benchmark',
  coveredPatterns: [...WORDPLAY_WATCHTOWER_BROAD_PATTERNS, ...WORDPLAY_WATCHTOWER_DETAILED_PATTERNS],
  passageIds: wordplayWatchtowerPassages.map((passage) => passage.passageIdentifier),
  questionIds: wordplayWatchtowerQuestionIds,
  lessonIds: [
    WORDPLAY_WATCHTOWER_LESSON_IDS.prereqSpotTheComparison,
    WORDPLAY_WATCHTOWER_LESSON_IDS.prereqMeaningBeyondWords,
    WORDPLAY_WATCHTOWER_LESSON_IDS.guidedSimilesAndIdiomsInContext,
    WORDPLAY_WATCHTOWER_LESSON_IDS.guidedSoundPatternsInAPoem,
    WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointA,
    WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointB,
    WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointC,
  ],
}
