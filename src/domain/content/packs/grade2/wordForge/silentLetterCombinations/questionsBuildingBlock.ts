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

const [q1, q2, q3, q4, q5] = SILENT_LETTER_QUESTION_IDS.guidedQuietBeginnings
const [q6, q7, q8, q9, q10] = SILENT_LETTER_QUESTION_IDS.guidedQuietEndings

export const buildingBlockQuestions: ReadingQuestion[] = [
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.museumKnight,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietBeginnings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-beginnings-1',
    questionIdentifier: q1,
    prompt: 'Which word in the museum passage begins with quiet kn and names the statue?',
    explanation: 'Knight begins with the quiet kn group, and we hear n at the start.',
    evidenceReference: 'silent-letter-combinations-1-s1',
    evidenceReferenceIds: ['knight-choice'],
    targetVocabulary: ['knight', 'knee', 'knock', 'knit'],
    soundOutChunks: ['kn', 'ight'],
    tags: ['silent-kn'],
    choices: [
      { id: 'wrap-choice', text: 'wrap' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'island-choice', text: 'island' },
      { id: 'knight-choice', text: 'knight' },
    ],
    correctChoiceIds: ['knight-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.museumKnight,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietBeginnings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-beginnings-2',
    questionIdentifier: q2,
    prompt: 'Which word begins with quiet kn and names a body part?',
    explanation: 'Knee begins with the quiet kn group, and we hear n at the start.',
    evidenceReference: 'silent-letter-combinations-1-s1',
    evidenceReferenceIds: ['knee-choice'],
    targetVocabulary: ['knight', 'knee', 'knock', 'knit'],
    soundOutChunks: ['kn', 'ee'],
    tags: ['silent-kn'],
    choices: [
      { id: 'wrap-choice', text: 'wrap' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'knee-choice', text: 'knee' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['knee-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.museumKnight,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietBeginnings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-beginnings-3',
    questionIdentifier: q3,
    prompt: 'Which word in the museum passage begins with quiet kn and means to tap softly?',
    explanation: 'Knock begins with the quiet kn group, and we hear n at the start.',
    evidenceReference: 'silent-letter-combinations-1-s2',
    evidenceReferenceIds: ['knock-choice'],
    targetVocabulary: ['knight', 'knee', 'knock', 'knit'],
    soundOutChunks: ['kn', 'ock'],
    tags: ['silent-kn'],
    choices: [
      { id: 'knock-choice', text: 'knock' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'wrong-choice', text: 'wrong' },
    ],
    correctChoiceIds: ['knock-choice'],
  }),
  makeQuestion({
    kind: 'multi_select',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.museumKnight,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietBeginnings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-beginnings-4',
    questionIdentifier: q4,
    prompt: 'Choose all the quiet-kn words in the passage.',
    explanation: 'Knight, knee, knock, and knit all begin with the quiet kn group.',
    evidenceReference: 'silent-letter-combinations-1-s1',
    evidenceReferenceIds: ['knight-choice', 'knee-choice', 'knock-choice', 'knit-choice'],
    targetVocabulary: ['knight', 'knee', 'knock', 'knit'],
    soundOutChunks: ['kn', 'ight', 'kn', 'ee', 'kn', 'ock', 'kn', 'it'],
    tags: ['silent-kn'],
    choices: [
      { id: 'knight-choice', text: 'knight' },
      { id: 'knee-choice', text: 'knee' },
      { id: 'knock-choice', text: 'knock' },
      { id: 'knit-choice', text: 'knit' },
      { id: 'wrap-choice', text: 'wrap' },
    ],
    correctChoiceIds: ['knight-choice', 'knee-choice', 'knock-choice', 'knit-choice'],
  }),
  makeQuestion({
    kind: 'hot_text',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.museumKnight,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietBeginnings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-beginnings-5',
    questionIdentifier: q5,
    prompt: 'Tap the word with quiet kn.',
    explanation: 'The word knight begins with the quiet kn group.',
    evidenceReference: 'silent-letter-combinations-1-s1',
    evidenceReferenceIds: ['knight-segment'],
    targetVocabulary: ['knight', 'knee', 'knock', 'knit'],
    soundOutChunks: ['kn', 'ight'],
    tags: ['silent-kn'],
    selectableSegments: [
      { id: 'knight-segment', text: 'knight' },
      { id: 'museum-segment', text: 'museum' },
      { id: 'shield-segment', text: 'shield' },
      { id: 'closer-segment', text: 'closer' },
    ],
    correctSegmentIds: ['knight-segment'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.wrapStation,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietEndings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-endings-1',
    questionIdentifier: q6,
    prompt: 'Which word in the wrap station passage begins with quiet wr?',
    explanation: 'Wrap begins with the quiet wr group, and we hear r at the start.',
    evidenceReference: 'silent-letter-combinations-3-s1',
    evidenceReferenceIds: ['wrap-choice'],
    targetVocabulary: ['wrap', 'wrist', 'write', 'wrong'],
    soundOutChunks: ['wr', 'ap'],
    tags: ['silent-wr'],
    choices: [
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'wrap-choice', text: 'wrap' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['wrap-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.wrapStation,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietEndings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-endings-2',
    questionIdentifier: q7,
    prompt: 'Which word in the wrap station passage begins with quiet wr and names a body part?',
    explanation: 'Wrist begins with the quiet wr group, and we hear r at the start.',
    evidenceReference: 'silent-letter-combinations-3-s2',
    evidenceReferenceIds: ['wrist-choice'],
    targetVocabulary: ['wrap', 'wrist', 'write', 'wrong'],
    soundOutChunks: ['wr', 'ist'],
    tags: ['silent-wr'],
    choices: [
      { id: 'wrist-choice', text: 'wrist' },
      { id: 'knock-choice', text: 'knock' },
      { id: 'lamb-choice', text: 'lamb' },
      { id: 'night-choice', text: 'night' },
    ],
    correctChoiceIds: ['wrist-choice'],
  }),
  makeQuestion({
    kind: 'multi_select',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.wrapStation,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietEndings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-endings-3',
    questionIdentifier: q8,
    prompt: 'Choose all the quiet-wr words in the passage.',
    explanation: 'Wrap, wrist, write, and wrong all begin with the quiet wr group.',
    evidenceReference: 'silent-letter-combinations-3-s1',
    evidenceReferenceIds: ['wrap-choice', 'wrist-choice', 'write-choice', 'wrong-choice'],
    targetVocabulary: ['wrap', 'wrist', 'write', 'wrong'],
    soundOutChunks: ['wr', 'ap', 'wr', 'ist', 'wr', 'ite', 'wr', 'ong'],
    tags: ['silent-wr'],
    choices: [
      { id: 'wrap-choice', text: 'wrap' },
      { id: 'wrist-choice', text: 'wrist' },
      { id: 'write-choice', text: 'write' },
      { id: 'wrong-choice', text: 'wrong' },
      { id: 'comb-choice', text: 'comb' },
    ],
    correctChoiceIds: ['wrap-choice', 'wrist-choice', 'write-choice', 'wrong-choice'],
  }),
  makeQuestion({
    kind: 'hot_text',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.wrapStation,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietEndings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-endings-4',
    questionIdentifier: q9,
    prompt: 'Tap the word that tells what the helper did.',
    explanation: 'The sentence says the helper will write the label.',
    evidenceReference: 'silent-letter-combinations-3-s2',
    evidenceReferenceIds: ['write-segment'],
    targetVocabulary: ['wrap', 'wrist', 'write', 'wrong'],
    soundOutChunks: ['wr', 'ite'],
    tags: ['silent-wr'],
    selectableSegments: [
      { id: 'wrist-segment', text: 'wrist' },
      { id: 'helper-segment', text: 'helper' },
      { id: 'write-segment', text: 'write' },
      { id: 'label-segment', text: 'label' },
    ],
    correctSegmentIds: ['write-segment'],
  }),
  makeQuestion({
    kind: 'table_match',
    difficulty: 6,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.wrapStation,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietEndings,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-endings-5',
    questionIdentifier: q10,
    prompt: 'Match each word to its silent-letter family.',
    explanation: 'Wrap, wrist, write, and wrong all belong to the quiet wr family.',
    evidenceReference: 'silent-letter-combinations-3-s1',
    evidenceReferenceIds: ['wrap-family', 'wrist-family', 'write-family', 'wrong-family'],
    targetVocabulary: ['wrap', 'wrist', 'write', 'wrong'],
    soundOutChunks: ['wr', 'ap', 'wr', 'ist', 'wr', 'ite', 'wr', 'ong'],
    tags: ['silent-wr'],
    rows: [
      {
        id: 'wrap-row',
        prompt: 'wrap',
        correctChoiceId: 'wrap-family',
        options: [
          { id: 'wrap-family', text: 'silent wr' },
          { id: 'knight-family', text: 'silent kn' },
          { id: 'mb-family', text: 'silent mb' },
          { id: 'island-family', text: 'silent island' },
        ],
      },
      {
        id: 'wrist-row',
        prompt: 'wrist',
        correctChoiceId: 'wrist-family',
        options: [
          { id: 'wrist-family', text: 'silent wr' },
          { id: 'ghost-family', text: 'silent gh' },
          { id: 'mb-family-2', text: 'silent mb' },
          { id: 'island-family-2', text: 'silent island' },
        ],
      },
      {
        id: 'write-row',
        prompt: 'write',
        correctChoiceId: 'write-family',
        options: [
          { id: 'write-family', text: 'silent wr' },
          { id: 'knight-family-2', text: 'silent kn' },
          { id: 'ghost-family-2', text: 'silent gh' },
          { id: 'mb-family-3', text: 'silent mb' },
        ],
      },
      {
        id: 'wrong-row',
        prompt: 'wrong',
        correctChoiceId: 'wrong-family',
        options: [
          { id: 'wrong-family', text: 'silent wr' },
          { id: 'island-family-3', text: 'silent island' },
          { id: 'ghost-family-3', text: 'silent gh' },
          { id: 'mb-family-4', text: 'silent mb' },
        ],
      },
    ],
  }),
]
