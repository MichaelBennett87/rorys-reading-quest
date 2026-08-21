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

const [q1, q2, q3, q4, q5] = SILENT_LETTER_QUESTION_IDS.guidedQuietReview
const [q6, q7, q8, q9, q10] = SILENT_LETTER_QUESTION_IDS.guidedQuietFamilies

export const guidedQuestions: ReadingQuestion[] = [
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.shelterCare,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietReview,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-review-1',
    questionIdentifier: q1,
    prompt: 'Which word in the shelter passage ends with quiet mb and names an animal?',
    explanation: 'Lamb ends with quiet mb, and we hear m at the end.',
    evidenceReference: 'silent-letter-combinations-4-s1',
    evidenceReferenceIds: ['lamb-choice'],
    targetVocabulary: ['lamb', 'comb', 'thumb', 'climb'],
    soundOutChunks: ['la', 'mb'],
    tags: ['silent-mb'],
    choices: [
      { id: 'wren-choice', text: 'wren' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'lamb-choice', text: 'lamb' },
    ],
    correctChoiceIds: ['lamb-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.shelterCare,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietReview,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-review-2',
    questionIdentifier: q2,
    prompt: 'Which word in the shelter passage ends with quiet mb and names a shiny tool?',
    explanation: 'Comb ends with quiet mb, and we hear m at the end.',
    evidenceReference: 'silent-letter-combinations-4-s1',
    evidenceReferenceIds: ['comb-choice'],
    targetVocabulary: ['lamb', 'comb', 'thumb', 'climb'],
    soundOutChunks: ['co', 'mb'],
    tags: ['silent-mb'],
    choices: [
      { id: 'comb-choice', text: 'comb' },
      { id: 'wrong-choice', text: 'wrong' },
      { id: 'wrist-choice', text: 'wrist' },
      { id: 'island-choice', text: 'island' },
    ],
    correctChoiceIds: ['comb-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.shelterCare,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietReview,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-review-3',
    questionIdentifier: q3,
    prompt: 'Which word in the shelter passage ends with quiet mb and shows careful movement up the ramp?',
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
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.shelterCare,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietReview,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-review-4',
    questionIdentifier: q4,
    prompt: 'Choose all the quiet-mb words in the passage.',
    explanation: 'Lamb, comb, thumb, and climb all end with quiet mb.',
    evidenceReference: 'silent-letter-combinations-4-s1',
    evidenceReferenceIds: ['lamb-choice', 'comb-choice', 'thumb-choice', 'climb-choice'],
    targetVocabulary: ['lamb', 'comb', 'thumb', 'climb'],
    soundOutChunks: ['la', 'mb', 'co', 'mb', 'thu', 'mb', 'cli', 'mb'],
    tags: ['silent-mb'],
    choices: [
      { id: 'lamb-choice', text: 'lamb' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'thumb-choice', text: 'thumb' },
      { id: 'climb-choice', text: 'climb' },
      { id: 'ghost-choice', text: 'ghost' },
    ],
    correctChoiceIds: ['lamb-choice', 'comb-choice', 'thumb-choice', 'climb-choice'],
  }),
  makeQuestion({
    kind: 'hot_text',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.shelterCare,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietReview,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-review-5',
    questionIdentifier: q5,
    prompt: 'Tap the word that tells what the helper used to feel the paper list.',
    explanation: 'Thumb is the word in the sentence that matches the clue.',
    evidenceReference: 'silent-letter-combinations-4-s2',
    evidenceReferenceIds: ['thumb-segment'],
    targetVocabulary: ['lamb', 'comb', 'thumb', 'climb'],
    soundOutChunks: ['thu', 'mb'],
    tags: ['silent-mb'],
    selectableSegments: [
      { id: 'team-segment', text: 'The team will' },
      { id: 'thumb-segment', text: 'thumb' },
      { id: 'list-segment', text: 'through the list' },
      { id: 'ramp-segment', text: 'then climb the ramp' },
    ],
    correctSegmentIds: ['thumb-segment'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.nightPicnic,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietFamilies,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-families-1',
    questionIdentifier: q6,
    prompt: 'Which word in the night picnic passage has a quiet gh family?',
    explanation: 'Ghost begins with the quiet gh family and we hear g at the start.',
    evidenceReference: 'silent-letter-combinations-5-s1',
    evidenceReferenceIds: ['ghost-choice'],
    targetVocabulary: ['ghost', 'night', 'bright', 'crumb'],
    soundOutChunks: ['gh', 'ost'],
    tags: ['silent-gh'],
    choices: [
      { id: 'crumb-choice', text: 'crumb' },
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'island-choice', text: 'island' },
      { id: 'knight-choice', text: 'knight' },
    ],
    correctChoiceIds: ['ghost-choice'],
  }),
  makeQuestion({
    kind: 'multiple_choice',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.nightPicnic,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietFamilies,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-families-2',
    questionIdentifier: q7,
    prompt: 'Which word in the night picnic passage has a quiet gh family and tells about the time of day?',
    explanation: 'Night is a quiet-gh word in this bounded set, and we hear n at the start.',
    evidenceReference: 'silent-letter-combinations-5-s3',
    evidenceReferenceIds: ['night-choice'],
    targetVocabulary: ['ghost', 'night', 'bright', 'crumb'],
    soundOutChunks: ['ni', 'ght'],
    tags: ['silent-gh'],
    choices: [
      { id: 'night-choice', text: 'night' },
      { id: 'wren-choice', text: 'wren' },
      { id: 'comb-choice', text: 'comb' },
      { id: 'wrap-choice', text: 'wrap' },
    ],
    correctChoiceIds: ['night-choice'],
  }),
  makeQuestion({
    kind: 'multi_select',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.nightPicnic,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietFamilies,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-families-3',
    questionIdentifier: q8,
    prompt: 'Choose all the quiet-gh words in the passage.',
    explanation: 'Ghost, night, and bright all belong to the quiet-gh family in this bounded set.',
    evidenceReference: 'silent-letter-combinations-5-s1',
    evidenceReferenceIds: ['ghost-choice', 'night-choice', 'bright-choice'],
    targetVocabulary: ['ghost', 'night', 'bright', 'crumb'],
    soundOutChunks: ['gh', 'ost', 'ni', 'ght', 'bri', 'ght'],
    tags: ['silent-gh'],
    choices: [
      { id: 'ghost-choice', text: 'ghost' },
      { id: 'night-choice', text: 'night' },
      { id: 'bright-choice', text: 'bright' },
      { id: 'crumb-choice', text: 'crumb' },
      { id: 'lamb-choice', text: 'lamb' },
    ],
    correctChoiceIds: ['ghost-choice', 'night-choice', 'bright-choice'],
  }),
  makeQuestion({
    kind: 'hot_text',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.nightPicnic,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietFamilies,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-families-4',
    questionIdentifier: q9,
    prompt: 'Tap the word that shows the snack trail near the table.',
    explanation: 'The sentence says the lantern lights a crumb trail.',
    evidenceReference: 'silent-letter-combinations-5-s2',
    evidenceReferenceIds: ['crumb-segment'],
    targetVocabulary: ['ghost', 'night', 'bright', 'crumb'],
    soundOutChunks: ['cru', 'mb'],
    tags: ['silent-mb'],
    selectableSegments: [
      { id: 'lantern-segment', text: 'A bright lantern' },
      { id: 'lights-segment', text: 'lights' },
      { id: 'crumb-segment', text: 'crumb' },
      { id: 'table-segment', text: 'near the table' },
    ],
    correctSegmentIds: ['crumb-segment'],
  }),
  makeQuestion({
    kind: 'table_match',
    difficulty: 7,
    passageIdentifier: SILENT_LETTER_PASSAGE_IDS.nightPicnic,
    lessonIdentifier: SILENT_LETTER_LESSON_IDS.guidedQuietFamilies,
    activityIdentifier: 'activity-word-forge-silent-letter-combinations-guided-quiet-families-5',
    questionIdentifier: q10,
    prompt: 'Match each word to its silent-letter family.',
    explanation: 'Ghost and night belong to the quiet gh family, and crumb belongs to the quiet mb family.',
    evidenceReference: 'silent-letter-combinations-5-s1',
    evidenceReferenceIds: ['ghost-family', 'night-family', 'bright-family', 'crumb-family'],
    targetVocabulary: ['ghost', 'night', 'bright', 'crumb'],
    soundOutChunks: ['gh', 'ost', 'ni', 'ght', 'bri', 'ght', 'cru', 'mb'],
    tags: ['silent-gh', 'silent-mb'],
    rows: [
      {
        id: 'ghost-row',
        prompt: 'ghost',
        correctChoiceId: 'ghost-family',
        options: [
          { id: 'ghost-family', text: 'silent gh' },
          { id: 'crumb-family', text: 'silent mb' },
          { id: 'knight-family', text: 'silent kn' },
          { id: 'island-family', text: 'silent island' },
        ],
      },
      {
        id: 'night-row',
        prompt: 'night',
        correctChoiceId: 'night-family',
        options: [
          { id: 'night-family', text: 'silent gh' },
          { id: 'crumb-family-2', text: 'silent mb' },
          { id: 'knight-family-2', text: 'silent kn' },
          { id: 'island-family-2', text: 'silent island' },
        ],
      },
      {
        id: 'bright-row',
        prompt: 'bright',
        correctChoiceId: 'bright-family',
        options: [
          { id: 'bright-family', text: 'silent gh' },
          { id: 'crumb-family-3', text: 'silent mb' },
          { id: 'knight-family-3', text: 'silent kn' },
          { id: 'island-family-3', text: 'silent island' },
        ],
      },
      {
        id: 'crumb-row',
        prompt: 'crumb',
        correctChoiceId: 'crumb-family',
        options: [
          { id: 'crumb-family', text: 'silent mb' },
          { id: 'ghost-family-2', text: 'silent gh' },
          { id: 'knight-family-4', text: 'silent kn' },
          { id: 'island-family-4', text: 'silent island' },
        ],
      },
    ],
  }),
]
