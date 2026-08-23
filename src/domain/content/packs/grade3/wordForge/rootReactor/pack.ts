import type { ContentPack, ContentPackLesson } from '../../../contentPackTypes'
import {
  rootReactorContentVersion,
  rootReactorLessonIds,
  rootReactorPackId,
  rootReactorPassageIds,
  rootReactorQuestionIds,
  rootReactorSkillId,
  rootReactorUnitId,
  rootReactorWorldId,
} from './ids'
import {
  rootReactorGuides,
  rootReactorPassages,
  rootReactorSupportTargets,
  rootReactorTargets,
} from './rootDecodingGuides'
import { rootReactorQuestions } from './questions'

const guidedPurposes = ['remediation', 'review'] as const
const checkpointPurposes = ['progression', 'verification', 'review'] as const

export const rootReactorLessons: ContentPackLesson[] = [
  guidedLesson(
    rootReactorLessonIds.powerUpFarEarth,
    'activity-g3-root-reactor-power-up-far-earth',
    rootReactorPassageIds.farEarthCounts,
    rootReactorQuestionIds.powerUpFarEarth,
    0,
    'Root Reactor Power-Up: Far, Earth, Two, and Three',
    'Use tele, geo, bi-, and tri- as starting clues before reading complete words.',
    {
      title: 'Meaningful parts and reading chunks work together',
      explanation: 'A root carries a useful core part. An affix is attached before or after another part. First find a familiar part, then break the whole word into pronounceable reading chunks.',
      examples: ['tele | phone shows meaningful parts.', 'tel | e | phone shows pronounceable reading chunks.', 'bi- and tri- are useful beginnings.'],
      contrast: 'A meaningful word-part boundary and a syllable boundary are not always in the same place.',
      learnerCue: 'Find a useful part, mark reading chunks, blend the word, and reread the sentence.',
    },
  ),
  guidedLesson(
    rootReactorLessonIds.powerUpPicturesLife,
    'activity-g3-root-reactor-power-up-pictures-life',
    rootReactorPassageIds.picturesLifeTools,
    rootReactorQuestionIds.powerUpPicturesLife,
    0,
    'Root Reactor Power-Up: Pictures, Life, and Tiny Tools',
    'Use photo, bio, micro, and bi- to begin decoding connected-text words.',
    {
      title: 'Use a familiar part as the launch point',
      explanation: 'Greek and Latin word parts appear in many English words. A brief meaning can help you remember a part, but the reading job is to decode the complete written word.',
      examples: ['photo is a useful part in photograph.', 'micro and scope are meaningful parts in microscope.', 'mi | cro | scope are reading chunks.'],
      contrast: 'Do not stop after naming a root. Read every chunk and blend the whole word.',
      learnerCue: 'Spot the part, read the chunks, blend, then check the sentence.',
    },
  ),
  guidedLesson(
    rootReactorLessonIds.labGreek,
    'activity-g3-root-reactor-lab-greek',
    rootReactorPassageIds.greekWordLab,
    rootReactorQuestionIds.labGreek,
    1,
    'Root Reactor Lab: Greek Word Parts',
    'Decode words containing common Greek roots and combining forms.',
    {
      title: 'Run the six-step decoding routine',
      explanation: 'Find a familiar root, mark meaningful parts, break the complete word into pronounceable chunks, read each chunk, blend the written word, and reread the sentence.',
      examples: ['tele | scope marks meaningful parts.', 'tel | e | scope marks reading chunks.', 'auto | graph and au | to | graph show two useful views.'],
      contrast: 'The root can guide your eyes even when the spoken syllables divide it differently.',
      learnerCue: 'Use both maps of the word before you blend it.',
    },
  ),
  guidedLesson(
    rootReactorLessonIds.labLatin,
    'activity-g3-root-reactor-lab-latin',
    rootReactorPassageIds.latinMovingLab,
    rootReactorQuestionIds.labLatin,
    1,
    'Root Reactor Lab: Latin Word Parts and Affixes',
    'Decode connected-text words containing port, tract, rupt, and classical prefixes.',
    {
      title: 'Use roots and affixes without confusing the boundaries',
      explanation: 'A prefix attaches before another part. A root carries a useful core. Mark those meaningful pieces, then choose chunks that are comfortable to pronounce.',
      examples: ['trans | port marks meaningful parts.', 'trac | tor marks reading chunks in tractor.', 'sub | ma | rine helps you read submarine.'],
      contrast: 'Meaningful chunks explain word construction; reading chunks guide pronunciation. They can match, but they do not have to.',
      learnerCue: 'Find, mark, chunk, read, blend, and confirm.',
    },
  ),
  checkpointLesson(rootReactorLessonIds.checkpointScience, 'activity-g3-root-reactor-checkpoint-science', rootReactorPassageIds.scienceExhibit, rootReactorQuestionIds.checkpointScience, 'Root Reactor Checkpoint: Science Exhibit'),
  checkpointLesson(rootReactorLessonIds.checkpointMoving, 'activity-g3-root-reactor-checkpoint-moving', rootReactorPassageIds.movingChanging, rootReactorQuestionIds.checkpointMoving, 'Root Reactor Checkpoint: Moving and Changing'),
  checkpointLesson(rootReactorLessonIds.checkpointAcross, 'activity-g3-root-reactor-checkpoint-across', rootReactorPassageIds.acrossUnder, rootReactorQuestionIds.checkpointAcross, 'Root Reactor Checkpoint: Across and Under'),
]

export const grade3WordForgeRootReactorPack: ContentPack = {
  manifest: {
    packId: rootReactorPackId,
    packTitle: 'Grade 3 Word Forge: Root Reactor',
    gradeBand: 3,
    worldId: rootReactorWorldId,
    unitId: rootReactorUnitId,
    primarySkillId: rootReactorSkillId,
    benchmarkReferences: ['ELA.3.F.1.3'],
    coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Greek and Latin root and affix decoding only. Derivational suffixes, part-of-speech changes, and systematic multisyllabic decoding remain deferred to Phases 7A2 and 7A3.',
    difficultyRange: [0, 1],
    contentVersion: rootReactorContentVersion,
    reviewStatus: 'DRAFT',
    coveredPatterns: [
      'greek-latin-root-decoding',
      'affix-decoding',
      'greek-root-decoding',
      'latin-root-decoding',
      'classical-prefix-decoding',
      'classical-part-identification',
      'morphological-segmentation',
      'syllable-segmentation',
      'root-affix-vs-syllable-distinction',
      'word-family-decoding',
      'visual-word-blending',
      'connected-text-decoding',
      'root-pattern-highlight',
      'grade-3-word-help',
    ],
    passageIds: rootReactorPassages.map((passage) => passage.passageIdentifier),
    questionIds: rootReactorQuestions.map((question) => question.questionIdentifier),
    lessonIds: rootReactorLessons.map((lesson) => lesson.lessonId),
  },
  passages: rootReactorPassages,
  questions: rootReactorQuestions,
  lessons: rootReactorLessons,
  rootDecodingGuides: rootReactorGuides,
}

function guidedLesson(
  lessonId: string,
  activityId: string,
  passageId: string,
  questionIdentifiers: readonly string[],
  difficulty: 0 | 1,
  lessonTitle: string,
  lessonObjective: string,
  teachingBlock: NonNullable<ContentPackLesson['teachingBlock']>,
): ContentPackLesson {
  return {
    lessonId,
    worldId: rootReactorWorldId,
    unitId: rootReactorUnitId,
    activityId,
    difficulty,
    passageIdentifiers: [passageId],
    questionIdentifiers: [...questionIdentifiers],
    lessonTitle,
    lessonObjective,
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock,
    contentVersion: rootReactorContentVersion,
    eligiblePurposes: [...guidedPurposes],
  }
}

function checkpointLesson(
  lessonId: string,
  activityId: string,
  passageId: string,
  questionIdentifiers: readonly string[],
  lessonTitle: string,
): ContentPackLesson {
  return {
    lessonId,
    worldId: rootReactorWorldId,
    unitId: rootReactorUnitId,
    activityId,
    difficulty: 1,
    passageIdentifiers: [passageId],
    questionIdentifiers: [...questionIdentifiers],
    lessonTitle,
    lessonObjective: 'Analyze roots, affixes, meaningful parts, and reading chunks while decoding complete words in connected text.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: rootReactorContentVersion,
    eligiblePurposes: [...checkpointPurposes],
  }
}

export {
  rootReactorGuides,
  rootReactorPassages,
  rootReactorQuestions,
  rootReactorSupportTargets,
  rootReactorTargets,
}
