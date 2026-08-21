import type { ReadingQuestion } from '../../../../types'
import {
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
} from './questionFactories'
import {
  THEME_TRAIL_CONTENT_VERSION,
  THEME_TRAIL_LESSON_IDS,
  THEME_TRAIL_PASSAGE_IDS,
  THEME_TRAIL_QUESTION_TAGS,
  themeTrailQuestionId,
} from './ids'

const common = {
  benchmarkReference: 'ELA.2.R.1.2',
  skillIdentifier: 'g2-story-scouts-prose',
  reportingCategory: 'Reading Prose and Poetry',
  genre: 'literary',
  gradeBand: 2 as const,
  estimatedReadingLevel: 'Grade 2',
  contentVersion: THEME_TRAIL_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
}

const lessonAId = THEME_TRAIL_LESSON_IDS.prerequisiteA
const lessonBId = THEME_TRAIL_LESSON_IDS.prerequisiteB

const lessonATags = ['theme-identification', 'theme-vs-topic', 'theme-explanation', 'theme-supported-by-details']
const lessonBTags = ['theme-identification', 'theme-vs-summary', 'theme-as-complete-thought', 'best-supported-theme']

const mc = (spec: Parameters<typeof createMultipleChoiceQuestion>[0]) =>
  createMultipleChoiceQuestion(spec)

const ms = (spec: Parameters<typeof createMultiselectQuestion>[0]) =>
  createMultiselectQuestion(spec)

const ht = (spec: Parameters<typeof createHotTextQuestion>[0]) =>
  createHotTextQuestion(spec)

const tm = (spec: Parameters<typeof createTableMatchQuestion>[0]) =>
  createTableMatchQuestion(spec)

export const themeTrailPrerequisiteQuestions: ReadingQuestion[] = [
  mc({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.gardenHelp,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('prerequisite-a', 'mc-1'),
    prompt: 'Which sentence is the best-supported theme?',
    explanation: 'The story shows that asking for help made the hard sign job easier.',
    evidenceReference: 'theme-support',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-garden-help-sentence-4',
      'g2-story-scouts-theme-trail-passage-garden-help-sentence-5',
    ],
    targetVocabulary: ['help', 'easier', 'together'],
    soundOutChunks: ['help', 'eas-ier', 'to-geth-er'],
    tags: [...lessonATags],
    choices: [
      { id: 'choice-a', text: 'Asking for help can make a hard task easier.' },
      { id: 'choice-b', text: 'The welcome sign was hard to read.' },
      { id: 'choice-c', text: 'Tia carried poster strips to the garden.' },
      { id: 'choice-d', text: 'The story is mostly about a seed swap.' },
    ],
    correctChoiceIds: ['choice-a'],
  }),
  mc({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.gardenHelp,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('prerequisite-a', 'mc-2'),
    prompt: 'Which choice names the topic, not the theme?',
    explanation: 'A topic is a short label. "Fixing the welcome sign" is a topic, not a complete theme.',
    evidenceReference: 'topic-versus-theme',
    evidenceReferenceIds: ['g2-story-scouts-theme-trail-passage-garden-help-sentence-1'],
    targetVocabulary: ['topic', 'theme', 'help'],
    soundOutChunks: ['top-ic', 'theme', 'help'],
    tags: [...lessonATags],
    choices: [
      { id: 'choice-a', text: 'fixing the welcome sign' },
      { id: 'choice-b', text: 'Asking for help can make a hard task easier.' },
      { id: 'choice-c', text: 'Tia and Ben worked together.' },
      { id: 'choice-d', text: 'The sign stood straight at the end.' },
    ],
    correctChoiceIds: ['choice-a'],
  }),
  ms({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.gardenHelp,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('prerequisite-a', 'ms-1'),
    prompt: 'Choose all the details that support the theme.',
    explanation: 'These details show Tia needed help and the job became easier when she got it.',
    evidenceReference: 'supporting-details',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-garden-help-sentence-3',
      'g2-story-scouts-theme-trail-passage-garden-help-sentence-4',
      'g2-story-scouts-theme-trail-passage-garden-help-sentence-5',
    ],
    targetVocabulary: ['help', 'together', 'easier'],
    soundOutChunks: ['help', 'to-geth-er', 'eas-ier'],
    tags: [...THEME_TRAIL_QUESTION_TAGS, 'theme-supported-by-character-actions'],
    choices: [
      { id: 'choice-a', text: 'Tia tried to lift the board alone, but it wobbled.' },
      { id: 'choice-b', text: 'She asked her neighbor, Ben, for help.' },
      { id: 'choice-c', text: 'They carefully held the sign together while Tia tied the rope tighter.' },
      { id: 'choice-d', text: 'The seed swap began.' },
    ],
    correctChoiceIds: ['choice-a', 'choice-b', 'choice-c'],
  }),
  ht({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.gardenHelp,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('prerequisite-a', 'ht-1'),
    prompt: 'Select the sentence that shows Tia and Ben worked together.',
    explanation: 'The fourth sentence says they held the sign together.',
    evidenceReference: 'sentence-clue',
    evidenceReferenceIds: ['g2-story-scouts-theme-trail-passage-garden-help-sentence-4'],
    targetVocabulary: ['together', 'help'],
    soundOutChunks: ['to-geth-er', 'help'],
    tags: [...lessonATags, 'theme-supported-by-character-actions'],
    selectableSegments: [
      {
        id: 'segment-1',
        text: 'Tia tried to lift the board alone, but it wobbled.',
      },
      {
        id: 'segment-2',
        text: 'She asked her neighbor, Ben, for help, and they carefully held the sign together while Tia tied the rope tighter.',
      },
      {
        id: 'segment-3',
        text: 'By the time the seed swap began, the sign stood straight, and Tia smiled because the job felt easier with help.',
      },
    ],
    correctSegmentIds: ['segment-2'],
  }),
  tm({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.gardenHelp,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('prerequisite-a', 'tm-1'),
    prompt: 'Match each detail to what it shows.',
    explanation: 'Each detail points to the way help made the task easier.',
    evidenceReference: 'detail-to-meaning',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-garden-help-sentence-3',
      'g2-story-scouts-theme-trail-passage-garden-help-sentence-4',
      'g2-story-scouts-theme-trail-passage-garden-help-sentence-5',
    ],
    targetVocabulary: ['help', 'together', 'easier', 'sign'],
    soundOutChunks: ['help', 'to-geth-er', 'eas-ier', 'sign'],
    tags: [...lessonATags, 'theme-supported-by-details'],
    rows: [
      {
        id: 'row-1',
        prompt: 'What does Tia asking Ben for help show?',
        correctChoiceId: 'help-question',
        options: [
          { id: 'help-question', text: 'asking for help' },
          { id: 'sign-question', text: 'the sign was crooked' },
          { id: 'swap-question', text: 'the seed swap began' },
          { id: 'rope-question', text: 'the rope was tight' },
        ],
      },
      {
        id: 'row-2',
        prompt: 'What does they carefully held the sign together show?',
        correctChoiceId: 'work-question',
        options: [
          { id: 'work-question', text: 'working together' },
          { id: 'read-question', text: 'reading the garden sign' },
          { id: 'visitor-question', text: 'waiting for visitors' },
          { id: 'move-question', text: 'moving the rope' },
        ],
      },
      {
        id: 'row-3',
        prompt: 'What does the job felt easier with help show?',
        correctChoiceId: 'easy-question',
        options: [
          { id: 'easy-question', text: 'help can make a hard task easier' },
          { id: 'loud-question', text: 'the garden was loud' },
          { id: 'new-question', text: 'the sign was new' },
          { id: 'wind-question', text: 'the wind stopped' },
        ],
      },
      {
        id: 'row-4',
        prompt: 'What does the sign stood straight show?',
        correctChoiceId: 'finished-question',
        options: [
          { id: 'finished-question', text: 'the hard task was finished' },
          { id: 'topic-question', text: 'the topic changed' },
          { id: 'sad-question', text: 'the story turned sad' },
          { id: 'lost-question', text: 'the help was lost' },
        ],
      },
    ],
  }),
  mc({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.libraryPause,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('prerequisite-b', 'mc-1'),
    prompt: 'Which sentence is the best-supported theme?',
    explanation: 'The story shows that patience helped Nia notice a missing label.',
    evidenceReference: 'theme-support',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-library-pause-sentence-3',
      'g2-story-scouts-theme-trail-passage-library-pause-sentence-4',
      'g2-story-scouts-theme-trail-passage-library-pause-sentence-5',
    ],
    targetVocabulary: ['patient', 'notice', 'detail'],
    soundOutChunks: ['pa-tient', 'no-ticed', 'de-tail'],
    tags: [...lessonBTags],
    choices: [
      { id: 'choice-a', text: 'Being patient can help someone notice important details.' },
      { id: 'choice-b', text: 'Nia sorted books at the library after school.' },
      { id: 'choice-c', text: 'The story is about rainy afternoons.' },
      { id: 'choice-d', text: 'The display was ready for story time.' },
    ],
    correctChoiceIds: ['choice-a'],
  }),
  mc({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.libraryPause,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('prerequisite-b', 'mc-2'),
    prompt: 'Which choice is the topic, not the theme?',
    explanation: 'A topic is a short phrase. "Sorting books" names what Nia is doing, but it is not the full message.',
    evidenceReference: 'topic-versus-theme',
    evidenceReferenceIds: ['g2-story-scouts-theme-trail-passage-library-pause-sentence-1'],
    targetVocabulary: ['topic', 'theme', 'patient'],
    soundOutChunks: ['top-ic', 'theme', 'pa-tient'],
    tags: [...lessonBTags],
    choices: [
      { id: 'choice-a', text: 'sorting books' },
      { id: 'choice-b', text: 'Being patient can help someone notice important details.' },
      { id: 'choice-c', text: 'Nia noticed a missing label.' },
      { id: 'choice-d', text: 'The display looked ready for story time.' },
    ],
    correctChoiceIds: ['choice-a'],
  }),
  ms({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.libraryPause,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('prerequisite-b', 'ms-1'),
    prompt: 'Choose all the details that support the theme.',
    explanation: 'These details show patience helped Nia notice the missing label and fix the display.',
    evidenceReference: 'supporting-details',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-library-pause-sentence-3',
      'g2-story-scouts-theme-trail-passage-library-pause-sentence-4',
      'g2-story-scouts-theme-trail-passage-library-pause-sentence-5',
    ],
    targetVocabulary: ['patient', 'notice', 'display'],
    soundOutChunks: ['pa-tient', 'no-ticed', 'dis-play'],
    tags: [...THEME_TRAIL_QUESTION_TAGS, 'theme-supported-by-details'],
    choices: [
      { id: 'choice-a', text: 'Nia patiently counted the books again and waited until the shelves were neat.' },
      { id: 'choice-b', text: 'Then she noticed a missing label tucked behind a return bin.' },
      { id: 'choice-c', text: 'She smiled, placed it in the right spot, and the display looked ready for story time.' },
      { id: 'choice-d', text: 'The books were picture books.' },
    ],
    correctChoiceIds: ['choice-a', 'choice-b', 'choice-c'],
  }),
  ht({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.libraryPause,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('prerequisite-b', 'ht-1'),
    prompt: 'Select the sentence that shows Nia noticed an important detail.',
    explanation: 'The fourth sentence says she noticed the missing label.',
    evidenceReference: 'sentence-clue',
    evidenceReferenceIds: ['g2-story-scouts-theme-trail-passage-library-pause-sentence-4'],
    targetVocabulary: ['noticed', 'detail'],
    soundOutChunks: ['no-ticed', 'de-tail'],
    tags: [...lessonBTags, 'theme-supported-by-details'],
    selectableSegments: [
      {
        id: 'segment-1',
        text: 'She wanted to hand out the bird bookmarks right away, but the stack looked messy.',
      },
      {
        id: 'segment-2',
        text: 'Nia patiently counted the books again and waited until the shelves were neat.',
      },
      {
        id: 'segment-3',
        text: 'Then she noticed a missing label tucked behind a return bin.',
      },
    ],
    correctSegmentIds: ['segment-3'],
  }),
  tm({
    ...common,
    difficulty: 1,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.libraryPause,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('prerequisite-b', 'tm-1'),
    prompt: 'Match each detail to what it shows.',
    explanation: 'Each detail helps show that patience and careful reading led to a good fix.',
    evidenceReference: 'detail-to-meaning',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-library-pause-sentence-3',
      'g2-story-scouts-theme-trail-passage-library-pause-sentence-4',
      'g2-story-scouts-theme-trail-passage-library-pause-sentence-5',
    ],
    targetVocabulary: ['patient', 'notice', 'display', 'library'],
    soundOutChunks: ['pa-tient', 'no-ticed', 'dis-play', 'li-brar-y'],
    tags: [...lessonBTags, 'theme-supported-by-details'],
    rows: [
      {
        id: 'row-1',
        prompt: 'What does Nia patiently counted the books again show?',
        correctChoiceId: 'patient-choice',
        options: [
          { id: 'patient-choice', text: 'being patient' },
          { id: 'quiet-choice', text: 'keeping the library quiet' },
          { id: 'book-choice', text: 'reading a new book' },
          { id: 'time-choice', text: 'telling the time of day' },
        ],
      },
      {
        id: 'row-2',
        prompt: 'What does she noticed a missing label show?',
        correctChoiceId: 'detail-choice',
        options: [
          { id: 'detail-choice', text: 'noticing an important detail' },
          { id: 'book-choice-2', text: 'sorting the books' },
          { id: 'rain-choice', text: 'waiting for the rain' },
          { id: 'story-choice', text: 'telling a story' },
        ],
      },
      {
        id: 'row-3',
        prompt: 'What does the display looked ready for story time show?',
        correctChoiceId: 'fix-choice',
        options: [
          { id: 'fix-choice', text: 'the problem was fixed' },
          { id: 'mess-choice', text: 'the shelf got messier' },
          { id: 'label-choice', text: 'the label stayed missing' },
          { id: 'sleep-choice', text: 'it was bedtime' },
        ],
      },
      {
        id: 'row-4',
        prompt: 'What does placing the label in the right spot show?',
        correctChoiceId: 'care-choice',
        options: [
          { id: 'care-choice', text: 'careful thinking' },
          { id: 'shout-choice', text: 'a loud voice' },
          { id: 'run-choice', text: 'running away' },
          { id: 'song-choice', text: 'singing a song' },
        ],
      },
    ],
  }),
]
