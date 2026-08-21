import type { ReadingQuestion } from '../../../../types'
import {
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
} from '../variableVowelsOoEa/questionFactories'
import {
  SILENT_LETTER_CONTENT_VERSION,
  SILENT_LETTER_LESSON_IDS,
  SILENT_LETTER_PASSAGE_IDS,
  SILENT_LETTER_QUESTION_IDS,
} from './ids'

type ChoiceLike = { id: string; text: string }

interface CommonQuestionSpec {
  kind: 'multiple_choice' | 'multi_select' | 'hot_text' | 'table_match'
  difficulty: number
  passageIdentifier: string
  lessonIdentifier: string
  activityIdentifier: string
  questionIdentifier: string
  prompt: string
  explanation: string
  evidenceReference: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  soundOutChunks: string[]
  tags: string[]
}

interface MultipleChoiceSpec extends CommonQuestionSpec {
  kind: 'multiple_choice'
  choices: ChoiceLike[]
  correctChoiceIds: string[]
}

interface MultiSelectSpec extends CommonQuestionSpec {
  kind: 'multi_select'
  choices: ChoiceLike[]
  correctChoiceIds: string[]
}

interface HotTextSpec extends CommonQuestionSpec {
  kind: 'hot_text'
  selectableSegments: ChoiceLike[]
  correctSegmentIds: string[]
}

interface TableMatchSpec extends CommonQuestionSpec {
  kind: 'table_match'
  rows: {
    id: string
    prompt: string
    correctChoiceId: string
    options: ChoiceLike[]
  }[]
}

type QuestionSpec = MultipleChoiceSpec | MultiSelectSpec | HotTextSpec | TableMatchSpec

const common = {
  benchmarkReference: 'ELA.2.F.1.3e',
  skillIdentifier: 'g2-word-forge-word-practice',
  reportingCategory: 'Foundational Skills Bridge',
  genre: 'Word Forge',
  gradeBand: 2 as const,
  estimatedReadingLevel: 'Grade 2',
  contentVersion: SILENT_LETTER_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
}

const makeQuestion = (spec: QuestionSpec): ReadingQuestion => {
  const base = {
    ...common,
    difficulty: spec.difficulty,
    passageIdentifier: spec.passageIdentifier,
    lessonIdentifier: spec.lessonIdentifier,
    activityIdentifier: spec.activityIdentifier,
    questionIdentifier: spec.questionIdentifier,
    prompt: spec.prompt,
    explanation: spec.explanation,
    evidenceReference: spec.evidenceReference,
    evidenceReferenceIds: [...spec.evidenceReferenceIds],
    targetVocabulary: [...spec.targetVocabulary],
    soundOutChunks: [...spec.soundOutChunks],
    tags: ['silent-letter-combinations', ...spec.tags],
  }

  switch (spec.kind) {
    case 'multiple_choice':
      return createMultipleChoiceQuestion({
        ...base,
        choices: spec.choices,
        correctChoiceIds: spec.correctChoiceIds,
      })
    case 'multi_select':
      return createMultiselectQuestion({
        ...base,
        choices: spec.choices,
        correctChoiceIds: spec.correctChoiceIds,
      })
    case 'hot_text':
      return createHotTextQuestion({
        ...base,
        selectableSegments: spec.selectableSegments,
        correctSegmentIds: spec.correctSegmentIds,
      })
    case 'table_match':
      return createTableMatchQuestion({
        ...base,
        rows: spec.rows,
      })
  }
}

const [a1, a2, a3, a4, a5, a6, a7] = SILENT_LETTER_QUESTION_IDS.checkpointA
const [b1, b2, b3, b4, b5, b6, b7] = SILENT_LETTER_QUESTION_IDS.checkpointB
const [c1, c2, c3, c4, c5, c6, c7] = SILENT_LETTER_QUESTION_IDS.checkpointC

export const checkpointQuestions: ReadingQuestion[] = [
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.museumKnight,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointA,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-a-1',
    questionIdentifier: a1,
    prompt: 'Which word in the museum passage begins with quiet kn and names the statue?',
    explanation: 'Knight begins with quiet kn, and we hear n at the start.',
    evidenceReference: 'silent-letter-combinations-1-s1',
    evidenceReferenceIds: ['knight-choice'],
    targetVocabulary: ['knight', 'knee', 'knock', 'knit'],
    soundOutChunks: ['kn', 'ight'],
    tags: ['silent-kn'],
    choices: [
      { id: 'wrap-choice', text: 'wrap' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'knight-choice', text: 'knight' },
    ],
    correctChoiceIds: ['knight-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.wrapStation,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointA,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-a-2',
    questionIdentifier: a2,
    prompt: 'Which word in the wrap station passage begins with quiet wr and tells what the helper will do?',
    explanation: 'Write begins with quiet wr, and we hear r at the start.',
    evidenceReference: 'silent-letter-combinations-3-s2',
    evidenceReferenceIds: ['write-choice'],
    targetVocabulary: ['wrap', 'wrist', 'write', 'wrong'],
    soundOutChunks: ['wr', 'ite'],
    tags: ['silent-wr'],
    choices: [
      { id: 'knight-choice', text: 'knight' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'write-choice', text: 'write' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['write-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.shelterCare,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointA,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-a-3',
    questionIdentifier: a3,
    prompt: 'Which word in the shelter passage ends with quiet mb and names a shiny tool?',
    explanation: 'Comb ends with quiet mb, and we hear m at the end.',
    evidenceReference: 'silent-letter-combinations-4-s1',
    evidenceReferenceIds: ['comb-choice'],
    targetVocabulary: ['lamb', 'comb', 'thumb', 'climb'],
    soundOutChunks: ['co', 'mb'],
    tags: ['silent-mb'],
    choices: [
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'wrist-choice', text: 'wrist' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['comb-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.nightPicnic,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointA,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-a-4',
    questionIdentifier: a4,
    prompt: 'Which word in the night picnic passage has the quiet gh family and names the story figure?',
    explanation: 'Ghost begins with quiet gh in this bounded set, and we hear g at the start.',
    evidenceReference: 'silent-letter-combinations-5-s1',
    evidenceReferenceIds: ['ghost-choice'],
    targetVocabulary: ['ghost', 'night', 'bright', 'crumb'],
    soundOutChunks: ['gh', 'ost'],
    tags: ['silent-gh'],
    choices: [
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'knight-choice', text: 'knight' },
      { id: 'wrap-choice', text: 'wrap' },
      { id: 'comb-choice', text: 'comb' },
    ],
    correctChoiceIds: ['ghost-choice'],
  }),
  makeQuestion({
    kind: 'multi_select',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.islandStudy,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointA,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-a-5',
    questionIdentifier: a5,
    prompt: 'Choose all the words in the checkpoint passages that have a quiet letter pattern.',
    explanation: 'Knight, wrap, comb, ghost, and island each belong to one of the reviewed silent-letter families.',
    evidenceReference: 'silent-letter-combinations-7-s1',
    evidenceReferenceIds: ['knight-choice', 'wrap-choice', 'comb-choice', 'ghost-choice', 'island-choice'],
    targetVocabulary: ['knight', 'wrap', 'comb', 'ghost', 'island'],
    soundOutChunks: ['kn', 'ight', 'wr', 'ap', 'co', 'mb', 'gh', 'ost', 'is', 'land'],
    tags: ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'],
    choices: [
      { id: 'knight-choice', text: 'knight' },
      { id: 'wrap-choice', text: 'wrap' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'island-choice', text: 'island' },
      { id: 'music-choice', text: 'music' },
    ],
    correctChoiceIds: ['knight-choice', 'wrap-choice', 'comb-choice', 'ghost-choice', 'island-choice'],
  }),
  makeQuestion({
    kind: 'hot_text',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.islandStudy,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointA,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-a-6',
    questionIdentifier: a6,
    prompt: 'Tap the word that belongs to the island family.',
    explanation: 'Island belongs to the reviewed island family because the s is not spoken.',
    evidenceReference: 'silent-letter-combinations-7-s1',
    evidenceReferenceIds: ['island-segment'],
    targetVocabulary: ['island', 'islander', 'isle', 'aisle'],
    soundOutChunks: ['is', 'land'],
    tags: ['silent-s-island'],
    selectableSegments: [
      { id: 'island-segment', text: 'island' },
      { id: 'ghost-segment', text: 'ghost' },
      { id: 'wrap-segment', text: 'wrap' },
      { id: 'comb-segment', text: 'comb' },
    ],
    correctSegmentIds: ['island-segment'],
  }),
  makeQuestion({
    kind: 'table_match',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.museumKnight,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointA,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-a-7',
    questionIdentifier: a7,
    prompt: 'Match each island-study word to its silent-letter family.',
    explanation: 'Each word belongs to one of the reviewed silent-letter families in this checkpoint.',
    evidenceReference: 'silent-letter-combinations-1-s1',
    evidenceReferenceIds: ['knight-family-a1', 'wrap-family-a2', 'comb-family-a3', 'ghost-family-a4', 'island-family-a5'],
    targetVocabulary: ['knight', 'wrap', 'comb', 'ghost', 'island'],
    soundOutChunks: ['kn', 'ight', 'wr', 'ap', 'co', 'mb', 'gh', 'ost', 'is', 'land'],
    tags: ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'],
    rows: [
      {
        id: 'knight-row',
        prompt: 'knight',
        correctChoiceId: 'knight-family-a1',
        options: [
          { id: 'knight-family-a1', text: 'silent kn' },
          { id: 'wrap-family-a1', text: 'silent wr' },
          { id: 'comb-family-a1', text: 'silent mb' },
          { id: 'ghost-family-a1', text: 'silent gh' },
          { id: 'island-family-a1', text: 'silent island' },
        ],
      },
      {
        id: 'wrap-row',
        prompt: 'wrap',
        correctChoiceId: 'wrap-family-a2',
        options: [
          { id: 'knight-family-a2', text: 'silent kn' },
          { id: 'wrap-family-a2', text: 'silent wr' },
          { id: 'comb-family-a2', text: 'silent mb' },
          { id: 'ghost-family-a2', text: 'silent gh' },
          { id: 'island-family-a2', text: 'silent island' },
        ],
      },
      {
        id: 'comb-row',
        prompt: 'comb',
        correctChoiceId: 'comb-family-a3',
        options: [
          { id: 'knight-family-a3', text: 'silent kn' },
          { id: 'wrap-family-a3', text: 'silent wr' },
          { id: 'comb-family-a3', text: 'silent mb' },
          { id: 'ghost-family-a3', text: 'silent gh' },
          { id: 'island-family-a3', text: 'silent island' },
        ],
      },
      {
        id: 'ghost-row',
        prompt: 'ghost',
        correctChoiceId: 'ghost-family-a4',
        options: [
          { id: 'knight-family-a4', text: 'silent kn' },
          { id: 'wrap-family-a4', text: 'silent wr' },
          { id: 'comb-family-a4', text: 'silent mb' },
          { id: 'ghost-family-a4', text: 'silent gh' },
          { id: 'island-family-a4', text: 'silent island' },
        ],
      },
      {
        id: 'island-row',
        prompt: 'island',
        correctChoiceId: 'island-family-a5',
        options: [
          { id: 'knight-family-a5', text: 'silent kn' },
          { id: 'wrap-family-a5', text: 'silent wr' },
          { id: 'comb-family-a5', text: 'silent mb' },
          { id: 'ghost-family-a5', text: 'silent gh' },
          { id: 'island-family-a5', text: 'silent island' },
        ],
      },
    ],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.workshopQuiet,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointB,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-b-1',
    questionIdentifier: b1,
    prompt: 'Which word in the workshop passage begins with quiet kn and names a careful action?',
    explanation: 'Kneel begins with quiet kn, and we hear n at the start.',
    evidenceReference: 'silent-letter-combinations-2-s1',
    evidenceReferenceIds: ['kneel-choice'],
    targetVocabulary: ['kneel', 'knob', 'know', 'knot'],
    soundOutChunks: ['kn', 'eel'],
    tags: ['silent-kn'],
    choices: [
      { id: 'kneel-choice', text: 'kneel' },
      { id: 'wrong-choice', text: 'wrong' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['kneel-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.gardenWatch,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointB,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-b-2',
    questionIdentifier: b2,
    prompt: 'Which word in the garden passage begins with quiet wr and names a bird?',
    explanation: 'Wren begins with quiet wr, and we hear r at the start.',
    evidenceReference: 'silent-letter-combinations-6-s1',
    evidenceReferenceIds: ['wren-choice'],
    targetVocabulary: ['wren', 'wreck', 'light', 'high'],
    soundOutChunks: ['wr', 'en'],
    tags: ['silent-wr'],
    choices: [
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'wren-choice', text: 'wren' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['wren-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.shelterCare,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointB,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-b-3',
    questionIdentifier: b3,
    prompt: 'Which word in the shelter passage ends with quiet mb and names the way up the ramp?',
    explanation: 'Climb ends with quiet mb, and we hear m at the end.',
    evidenceReference: 'silent-letter-combinations-4-s2',
    evidenceReferenceIds: ['climb-choice'],
    targetVocabulary: ['lamb', 'comb', 'thumb', 'climb'],
    soundOutChunks: ['cli', 'mb'],
    tags: ['silent-mb'],
    choices: [
      { id: 'thumb-choice', text: 'thumb' },
      { id: 'climb-choice', text: 'climb' },
      { id: 'night-choice', text: 'night' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['climb-choice'],
  }),
  makeQuestion({
    kind: 'multi_select',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.nightPicnic,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointB,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-b-4',
    questionIdentifier: b4,
    prompt: 'Choose all the words in the checkpoint passages that have a quiet letter pattern.',
    explanation: 'Knight, wrong, thumb, bright, and island each belong to one of the reviewed silent-letter families.',
    evidenceReference: 'silent-letter-combinations-5-s1',
    evidenceReferenceIds: ['knight-choice', 'wrong-choice', 'thumb-choice', 'bright-choice', 'island-choice'],
    targetVocabulary: ['knight', 'wrong', 'thumb', 'bright', 'island'],
    soundOutChunks: ['kn', 'ight', 'wr', 'ong', 'thu', 'mb', 'bri', 'ght', 'is', 'land'],
    tags: ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'],
    choices: [
      { id: 'knight-choice', text: 'knight' },
      { id: 'wrong-choice', text: 'wrong' },
      { id: 'thumb-choice', text: 'thumb' },
      { id: 'bright-choice', text: 'bright' },
      { id: 'island-choice', text: 'island' },
      { id: 'music-choice', text: 'music' },
    ],
    correctChoiceIds: ['knight-choice', 'wrong-choice', 'thumb-choice', 'bright-choice', 'island-choice'],
  }),
  makeQuestion({
    kind: 'hot_text',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.islandStudy,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointB,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-b-5',
    questionIdentifier: b5,
    prompt: 'Tap the word that belongs to the island family.',
    explanation: 'Island is the reviewed island-family word in this sentence.',
    evidenceReference: 'silent-letter-combinations-7-s1',
    evidenceReferenceIds: ['island-segment'],
    targetVocabulary: ['island', 'islander', 'isle', 'aisle'],
    soundOutChunks: ['is', 'land'],
    tags: ['silent-s-island'],
    selectableSegments: [
      { id: 'island-segment', text: 'island' },
      { id: 'map-segment', text: 'map' },
      { id: 'shore-segment', text: 'shore' },
      { id: 'finger-segment', text: 'finger' },
    ],
    correctSegmentIds: ['island-segment'],
  }),
  makeQuestion({
    kind: 'table_match',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.gardenWatch,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointB,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-b-6',
    questionIdentifier: b6,
    prompt: 'Match each review word to its silent-letter family.',
    explanation: 'Each word belongs to the reviewed silent-letter family shown in the table.',
    evidenceReference: 'silent-letter-combinations-6-s1',
    evidenceReferenceIds: ['knot-family-b1', 'wrist-family-b2', 'comb-family-b3', 'light-family-b4', 'aisle-family-b5'],
    targetVocabulary: ['knot', 'wrist', 'comb', 'light', 'aisle'],
    soundOutChunks: ['kn', 'ot', 'wr', 'ist', 'co', 'mb', 'li', 'ght', 'ai', 'sle'],
    tags: ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'],
    rows: [
      {
        id: 'knot-row',
        prompt: 'knot',
        correctChoiceId: 'knot-family-b1',
        options: [
          { id: 'knot-family-b1', text: 'silent kn' },
          { id: 'wrist-family-b1', text: 'silent wr' },
          { id: 'comb-family-b1', text: 'silent mb' },
          { id: 'light-family-b1', text: 'silent gh' },
          { id: 'aisle-family-b1', text: 'silent island' },
        ],
      },
      {
        id: 'wrist-row',
        prompt: 'wrist',
        correctChoiceId: 'wrist-family-b2',
        options: [
          { id: 'knight-family-2', text: 'silent kn' },
          { id: 'wrist-family-b2', text: 'silent wr' },
          { id: 'comb-family-b2', text: 'silent mb' },
          { id: 'light-family-b2', text: 'silent gh' },
          { id: 'aisle-family-b2', text: 'silent island' },
        ],
      },
      {
        id: 'comb-row',
        prompt: 'comb',
        correctChoiceId: 'comb-family-b3',
        options: [
          { id: 'knight-family-3', text: 'silent kn' },
          { id: 'wrist-family-b3', text: 'silent wr' },
          { id: 'comb-family-b3', text: 'silent mb' },
          { id: 'light-family-b3', text: 'silent gh' },
          { id: 'aisle-family-b3', text: 'silent island' },
        ],
      },
      {
        id: 'light-row',
        prompt: 'light',
        correctChoiceId: 'light-family-b4',
        options: [
          { id: 'knight-family-b4', text: 'silent kn' },
          { id: 'wrist-family-b4', text: 'silent wr' },
          { id: 'comb-family-b4', text: 'silent mb' },
          { id: 'light-family-b4', text: 'silent gh' },
          { id: 'aisle-family-b4', text: 'silent island' },
        ],
      },
      {
        id: 'aisle-row',
        prompt: 'aisle',
        correctChoiceId: 'aisle-family-b5',
        options: [
          { id: 'knight-family-b5', text: 'silent kn' },
          { id: 'wrist-family-b5', text: 'silent wr' },
          { id: 'comb-family-b5', text: 'silent mb' },
          { id: 'light-family-b5', text: 'silent gh' },
          { id: 'aisle-family-b5', text: 'silent island' },
        ],
      },
    ],
  }),
  makeQuestion({
    kind: 'table_match',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.islandStudy,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointB,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-b-7',
    questionIdentifier: b7,
    prompt: 'Match the garden words to their silent-letter family.',
    explanation: 'Each word belongs to the reviewed silent-letter family shown in the table.',
    evidenceReference: 'silent-letter-combinations-7-s1',
    evidenceReferenceIds: ['kneel-family-c1', 'wrong-family-c2', 'thumb-family-c3', 'ghost-family-c4', 'islander-family-c5'],
    targetVocabulary: ['kneel', 'wrong', 'thumb', 'ghost', 'islander'],
    soundOutChunks: ['kn', 'eel', 'wr', 'ong', 'thu', 'mb', 'gh', 'ost', 'is', 'lander'],
    tags: ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'],
    rows: [
      {
        id: 'kneel-row',
        prompt: 'kneel',
        correctChoiceId: 'kneel-family-c1',
        options: [
          { id: 'kneel-family-c1', text: 'silent kn' },
          { id: 'wrong-family-c1', text: 'silent wr' },
          { id: 'thumb-family-c1', text: 'silent mb' },
          { id: 'ghost-family-c1', text: 'silent gh' },
          { id: 'islander-family-c1', text: 'silent island' },
        ],
      },
      {
        id: 'wrong-row',
        prompt: 'wrong',
        correctChoiceId: 'wrong-family-c2',
        options: [
          { id: 'kneel-family-c2', text: 'silent kn' },
          { id: 'wrong-family-c2', text: 'silent wr' },
          { id: 'thumb-family-c2', text: 'silent mb' },
          { id: 'ghost-family-c2', text: 'silent gh' },
          { id: 'islander-family-c2', text: 'silent island' },
        ],
      },
      {
        id: 'thumb-row',
        prompt: 'thumb',
        correctChoiceId: 'thumb-family-c3',
        options: [
          { id: 'kneel-family-c3', text: 'silent kn' },
          { id: 'wrong-family-c3', text: 'silent wr' },
          { id: 'thumb-family-c3', text: 'silent mb' },
          { id: 'ghost-family-c3', text: 'silent gh' },
          { id: 'islander-family-c3', text: 'silent island' },
        ],
      },
      {
        id: 'ghost-row',
        prompt: 'ghost',
        correctChoiceId: 'ghost-family-c4',
        options: [
          { id: 'kneel-family-c4', text: 'silent kn' },
          { id: 'wrong-family-c4', text: 'silent wr' },
          { id: 'thumb-family-c4', text: 'silent mb' },
          { id: 'ghost-family-c4', text: 'silent gh' },
          { id: 'islander-family-c4', text: 'silent island' },
        ],
      },
      {
        id: 'islander-row',
        prompt: 'islander',
        correctChoiceId: 'islander-family-c5',
        options: [
          { id: 'kneel-family-c5', text: 'silent kn' },
          { id: 'wrong-family-c5', text: 'silent wr' },
          { id: 'thumb-family-c5', text: 'silent mb' },
          { id: 'ghost-family-c5', text: 'silent gh' },
          { id: 'islander-family-c5', text: 'silent island' },
        ],
      },
    ],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.museumKnight,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointC,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-c-1',
    questionIdentifier: c1,
    prompt: 'Which word in the museum passage begins with quiet kn and names a body part?',
    explanation: 'Knee begins with quiet kn, and we hear n at the start.',
    evidenceReference: 'silent-letter-combinations-1-s1',
    evidenceReferenceIds: ['knee-choice'],
    targetVocabulary: ['knight', 'knee', 'knock', 'knit'],
    soundOutChunks: ['kn', 'ee'],
    tags: ['silent-kn'],
    choices: [
      { id: 'knee-choice', text: 'knee' },
      { id: 'wrap-choice', text: 'wrap' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'comb-choice', text: 'comb' },
    ],
    correctChoiceIds: ['knee-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.wrapStation,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointC,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-c-2',
    questionIdentifier: c2,
    prompt: 'Which word in the wrap station passage begins with quiet wr and means to make a label with letters?',
    explanation: 'Write begins with quiet wr, and we hear r at the start.',
    evidenceReference: 'silent-letter-combinations-3-s2',
    evidenceReferenceIds: ['write-choice'],
    targetVocabulary: ['wrap', 'wrist', 'write', 'wrong'],
    soundOutChunks: ['wr', 'ite'],
    tags: ['silent-wr'],
    choices: [
      { id: 'knit-choice', text: 'knit' },
      { id: 'write-choice', text: 'write' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['write-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.shelterCare,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointC,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-c-3',
    questionIdentifier: c3,
    prompt: 'Which word in the shelter passage ends with quiet mb and shows careful movement up the ramp?',
    explanation: 'Climb ends with quiet mb, and we hear m at the end.',
    evidenceReference: 'silent-letter-combinations-4-s2',
    evidenceReferenceIds: ['climb-choice'],
    targetVocabulary: ['lamb', 'comb', 'thumb', 'climb'],
    soundOutChunks: ['cli', 'mb'],
    tags: ['silent-mb'],
    choices: [
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'climb-choice', text: 'climb' },
      { id: 'wren-choice', text: 'wren' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['climb-choice'],
  }),
  makeQuestion({
    kind: 'multi_select',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.nightPicnic,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointC,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-c-4',
    questionIdentifier: c4,
    prompt: 'Choose all the words in the checkpoint passages that have a quiet letter pattern.',
    explanation: 'Knot, wrist, lamb, ghost, and isle each belong to one of the reviewed silent-letter families.',
    evidenceReference: 'silent-letter-combinations-5-s3',
    evidenceReferenceIds: ['knot-choice', 'wrist-choice', 'lamb-choice', 'ghost-choice', 'isle-choice'],
    targetVocabulary: ['knot', 'wrist', 'lamb', 'ghost', 'isle'],
    soundOutChunks: ['kn', 'ot', 'wr', 'ist', 'la', 'mb', 'gh', 'ost', 'is', 'le'],
    tags: ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'],
    choices: [
      { id: 'knot-choice', text: 'knot' },
      { id: 'wrist-choice', text: 'wrist' },
      { id: 'lamb-choice', text: 'lamb' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'isle-choice', text: 'isle' },
      { id: 'music-choice', text: 'music' },
    ],
    correctChoiceIds: ['knot-choice', 'wrist-choice', 'lamb-choice', 'ghost-choice', 'isle-choice'],
  }),
  makeQuestion({
    kind: 'hot_text',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.islandStudy,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointC,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-c-5',
    questionIdentifier: c5,
    prompt: 'Tap the word that names the island family word in the sentence.',
    explanation: 'Island is the reviewed island-family word in this sentence.',
    evidenceReference: 'silent-letter-combinations-7-s1',
    evidenceReferenceIds: ['island-segment'],
    targetVocabulary: ['island', 'islander', 'isle', 'aisle'],
    soundOutChunks: ['is', 'land'],
    tags: ['silent-s-island'],
    selectableSegments: [
      { id: 'island-segment', text: 'island' },
      { id: 'path-segment', text: 'path' },
      { id: 'shore-segment', text: 'shore' },
      { id: 'finger-segment', text: 'finger' },
    ],
    correctSegmentIds: ['island-segment'],
  }),
  makeQuestion({
    kind: 'table_match',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.gardenWatch,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointC,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-c-6',
    questionIdentifier: c6,
    prompt: 'Match the island-study words to their silent-letter family.',
    explanation: 'Each word belongs to one of the reviewed silent-letter families.',
    evidenceReference: 'silent-letter-combinations-6-s1',
    evidenceReferenceIds: ['knock-family-c1', 'write-family-c2', 'thumb-family-c3', 'bright-family-c4', 'aisle-family-c5'],
    targetVocabulary: ['knock', 'write', 'thumb', 'bright', 'aisle'],
    soundOutChunks: ['kn', 'ock', 'wr', 'ite', 'thu', 'mb', 'bri', 'ght', 'ai', 'sle'],
    tags: ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'],
    rows: [
      {
        id: 'knock-row',
        prompt: 'knock',
        correctChoiceId: 'knock-family-c1',
        options: [
          { id: 'knock-family-c1', text: 'silent kn' },
          { id: 'write-family-c1', text: 'silent wr' },
          { id: 'thumb-family-c1', text: 'silent mb' },
          { id: 'bright-family-c1', text: 'silent gh' },
          { id: 'aisle-family-c1', text: 'silent island' },
        ],
      },
      {
        id: 'write-row',
        prompt: 'write',
        correctChoiceId: 'write-family-c2',
        options: [
          { id: 'knock-family-c2', text: 'silent kn' },
          { id: 'write-family-c2', text: 'silent wr' },
          { id: 'thumb-family-c2', text: 'silent mb' },
          { id: 'bright-family-c2', text: 'silent gh' },
          { id: 'aisle-family-c2', text: 'silent island' },
        ],
      },
      {
        id: 'thumb-row',
        prompt: 'thumb',
        correctChoiceId: 'thumb-family-c3',
        options: [
          { id: 'knock-family-c3', text: 'silent kn' },
          { id: 'write-family-c3', text: 'silent wr' },
          { id: 'thumb-family-c3', text: 'silent mb' },
          { id: 'bright-family-c3', text: 'silent gh' },
          { id: 'aisle-family-c3', text: 'silent island' },
        ],
      },
      {
        id: 'bright-row',
        prompt: 'bright',
        correctChoiceId: 'bright-family-c4',
        options: [
          { id: 'knock-family-c4', text: 'silent kn' },
          { id: 'write-family-c4', text: 'silent wr' },
          { id: 'thumb-family-c4', text: 'silent mb' },
          { id: 'bright-family-c4', text: 'silent gh' },
          { id: 'aisle-family-c4', text: 'silent island' },
        ],
      },
      {
        id: 'aisle-row',
        prompt: 'aisle',
        correctChoiceId: 'aisle-family-c5',
        options: [
          { id: 'knock-family-c5', text: 'silent kn' },
          { id: 'write-family-c5', text: 'silent wr' },
          { id: 'thumb-family-c5', text: 'silent mb' },
          { id: 'bright-family-c5', text: 'silent gh' },
          { id: 'aisle-family-c5', text: 'silent island' },
        ],
      },
    ],
  }),
  makeQuestion({
    kind: 'table_match',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.islandStudy,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.checkpointC,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-checkpoint-c-7',
    questionIdentifier: c7,
    prompt: 'Match each word to its silent-letter family.',
    explanation: 'Each word belongs to one of the reviewed silent-letter families.',
    evidenceReference: 'silent-letter-combinations-7-s1',
    evidenceReferenceIds: ['knee-family-d1', 'wrong-family-d2', 'comb-family-d3', 'high-family-d4', 'island-family-d5'],
    targetVocabulary: ['knee', 'wrong', 'comb', 'high', 'island'],
    soundOutChunks: ['kn', 'ee', 'wr', 'ong', 'co', 'mb', 'hi', 'gh', 'is', 'land'],
    tags: ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'],
    rows: [
      {
        id: 'knee-row',
        prompt: 'knee',
        correctChoiceId: 'knee-family-d1',
        options: [
          { id: 'knee-family-d1', text: 'silent kn' },
          { id: 'wrong-family-d1', text: 'silent wr' },
          { id: 'comb-family-d1', text: 'silent mb' },
          { id: 'high-family-d1', text: 'silent gh' },
          { id: 'island-family-d1', text: 'silent island' },
        ],
      },
      {
        id: 'wrong-row',
        prompt: 'wrong',
        correctChoiceId: 'wrong-family-d2',
        options: [
          { id: 'knee-family-d2', text: 'silent kn' },
          { id: 'wrong-family-d2', text: 'silent wr' },
          { id: 'comb-family-d2', text: 'silent mb' },
          { id: 'high-family-d2', text: 'silent gh' },
          { id: 'island-family-d2', text: 'silent island' },
        ],
      },
      {
        id: 'comb-row',
        prompt: 'comb',
        correctChoiceId: 'comb-family-d3',
        options: [
          { id: 'knee-family-d3', text: 'silent kn' },
          { id: 'wrong-family-d3', text: 'silent wr' },
          { id: 'comb-family-d3', text: 'silent mb' },
          { id: 'high-family-d3', text: 'silent gh' },
          { id: 'island-family-d3', text: 'silent island' },
        ],
      },
      {
        id: 'high-row',
        prompt: 'high',
        correctChoiceId: 'high-family-d4',
        options: [
          { id: 'knee-family-d4', text: 'silent kn' },
          { id: 'wrong-family-d4', text: 'silent wr' },
          { id: 'comb-family-d4', text: 'silent mb' },
          { id: 'high-family-d4', text: 'silent gh' },
          { id: 'island-family-d4', text: 'silent island' },
        ],
      },
      {
        id: 'island-row',
        prompt: 'island',
        correctChoiceId: 'island-family-d5',
        options: [
          { id: 'knee-family-d5', text: 'silent kn' },
          { id: 'wrong-family-d5', text: 'silent wr' },
          { id: 'comb-family-d5', text: 'silent mb' },
          { id: 'high-family-d5', text: 'silent gh' },
          { id: 'island-family-d5', text: 'silent island' },
        ],
      },
    ],
  }),
]
