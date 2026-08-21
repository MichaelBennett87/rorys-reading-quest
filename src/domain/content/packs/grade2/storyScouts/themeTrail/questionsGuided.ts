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

const lessonAId = THEME_TRAIL_LESSON_IDS.guidedA
const lessonBId = THEME_TRAIL_LESSON_IDS.guidedB

const lessonATags = ['theme-identification', 'theme-explanation', 'theme-vs-topic', 'theme-supported-by-character-actions']
const lessonBTags = ['theme-identification', 'theme-explanation', 'theme-supported-by-events', 'theme-supported-by-outcome']

const mc = (spec: Parameters<typeof createMultipleChoiceQuestion>[0]) =>
  createMultipleChoiceQuestion(spec)

const ms = (spec: Parameters<typeof createMultiselectQuestion>[0]) =>
  createMultiselectQuestion(spec)

const ht = (spec: Parameters<typeof createHotTextQuestion>[0]) =>
  createHotTextQuestion(spec)

const tm = (spec: Parameters<typeof createTableMatchQuestion>[0]) =>
  createTableMatchQuestion(spec)

export const themeTrailGuidedQuestions: ReadingQuestion[] = [
  mc({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('guided-a', 'mc-1'),
    prompt: 'Which sentence is the best-supported theme?',
    explanation: 'The story shows that telling the truth helped the class solve the paint problem.',
    evidenceReference: 'theme-support',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-hallway-truth-sentence-3',
      'g2-story-scouts-theme-trail-passage-hallway-truth-sentence-4',
      'g2-story-scouts-theme-trail-passage-hallway-truth-sentence-5',
    ],
    targetVocabulary: ['truth', 'solve', 'together'],
    soundOutChunks: ['truth', 'solve', 'to-geth-er'],
    tags: [...lessonATags],
    choices: [
      { id: 'choice-a', text: 'Telling the truth helps people solve problems together.' },
      { id: 'choice-b', text: 'Marco found a cracked paint jar by the mural wall.' },
      { id: 'choice-c', text: 'The class fixed the mural together.' },
      { id: 'choice-d', text: 'The story is mostly about lunch at school.' },
    ],
    correctChoiceIds: ['choice-a'],
  }),
  mc({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('guided-a', 'mc-2'),
    prompt: 'Which choice is the topic, not the theme?',
    explanation: 'A topic is a short label. "Telling the truth" names the topic, but the theme says more.',
    evidenceReference: 'topic-versus-theme',
    evidenceReferenceIds: ['g2-story-scouts-theme-trail-passage-hallway-truth-sentence-3'],
    targetVocabulary: ['topic', 'truth', 'theme'],
    soundOutChunks: ['top-ic', 'truth', 'theme'],
    tags: [...lessonATags],
    choices: [
      { id: 'choice-a', text: 'telling the truth' },
      { id: 'choice-b', text: 'Telling the truth helps people solve problems together.' },
      { id: 'choice-c', text: 'Marco helped wipe the floor.' },
      { id: 'choice-d', text: 'The mural was fixed by the class.' },
    ],
    correctChoiceIds: ['choice-a'],
  }),
  ms({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('guided-a', 'ms-1'),
    prompt: 'Choose all the details that support the theme.',
    explanation: 'These details show honesty and helpful actions that lead to a solution.',
    evidenceReference: 'supporting-details',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-hallway-truth-sentence-3',
      'g2-story-scouts-theme-trail-passage-hallway-truth-sentence-4',
      'g2-story-scouts-theme-trail-passage-hallway-truth-sentence-5',
    ],
    targetVocabulary: ['truth', 'help', 'solve'],
    soundOutChunks: ['truth', 'help', 'solve'],
    tags: [...THEME_TRAIL_QUESTION_TAGS, 'theme-supported-by-details'],
    choices: [
      { id: 'choice-a', text: 'Marco told Ms. Reed the truth.' },
      { id: 'choice-b', text: 'He showed where the spill began and helped wipe the floor.' },
      { id: 'choice-c', text: 'Ms. Reed thanked him, and the class fixed the mural together.' },
      { id: 'choice-d', text: 'Blue drops dotted the floor.' },
    ],
    correctChoiceIds: ['choice-a', 'choice-b', 'choice-c'],
  }),
  ht({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('guided-a', 'ht-1'),
    prompt: 'Select the sentence that shows Marco told the truth.',
    explanation: 'The third sentence says he told Ms. Reed the truth.',
    evidenceReference: 'sentence-clue',
    evidenceReferenceIds: ['g2-story-scouts-theme-trail-passage-hallway-truth-sentence-3'],
    targetVocabulary: ['truth', 'help'],
    soundOutChunks: ['truth', 'help'],
    tags: [...lessonATags, 'theme-supported-by-character-actions'],
    selectableSegments: [
      {
        id: 'segment-1',
        text: 'Blue drops dotted the floor, and he knew the jar had tipped during cleanup.',
      },
      {
        id: 'segment-2',
        text: 'Marco wanted to hide the jar and walk away, but he told Ms. Reed the truth.',
      },
      {
        id: 'segment-3',
        text: 'Ms. Reed thanked him, and the class fixed the mural together.',
      },
    ],
    correctSegmentIds: ['segment-2'],
  }),
  tm({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
    lessonIdentifier: lessonAId,
    questionIdentifier: themeTrailQuestionId('guided-a', 'tm-1'),
    prompt: 'Match each detail to what it shows.',
    explanation: 'Each detail helps show that honesty and teamwork solved the problem.',
    evidenceReference: 'detail-to-meaning',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-hallway-truth-sentence-3',
      'g2-story-scouts-theme-trail-passage-hallway-truth-sentence-4',
      'g2-story-scouts-theme-trail-passage-hallway-truth-sentence-5',
    ],
    targetVocabulary: ['truth', 'mural', 'help'],
    soundOutChunks: ['truth', 'mu-ral', 'help'],
    tags: [...lessonATags, 'theme-supported-by-events'],
    rows: [
      {
        id: 'row-1',
        prompt: 'What does Marco told Ms. Reed the truth show?',
        correctChoiceId: 'honesty-choice',
        options: [
          { id: 'honesty-choice', text: 'choosing honesty' },
          { id: 'jar-choice', text: 'the jar was cracked' },
          { id: 'lunch-choice', text: 'it was lunchtime' },
          { id: 'paint-choice', text: 'the paint was blue' },
        ],
      },
      {
        id: 'row-2',
        prompt: 'What does he showed where the spill began and helped wipe the floor show?',
        correctChoiceId: 'help-choice',
        options: [
          { id: 'help-choice', text: 'helping solve the problem' },
          { id: 'wall-choice', text: 'the mural wall was big' },
          { id: 'drop-choice', text: 'paint drops were on the floor' },
          { id: 'school-choice', text: 'it happened at school' },
        ],
      },
      {
        id: 'row-3',
        prompt: 'What does the class fixed the mural together show?',
        correctChoiceId: 'team-choice',
        options: [
          { id: 'team-choice', text: 'working as a team' },
          { id: 'hide-choice', text: 'hiding the jar' },
          { id: 'dirt-choice', text: 'the floor was dirty' },
          { id: 'paint-choice-2', text: 'the paint jar was new' },
        ],
      },
      {
        id: 'row-4',
        prompt: 'What does Ms. Reed thanked him show?',
        correctChoiceId: 'trust-choice',
        options: [
          { id: 'trust-choice', text: 'the class could trust him' },
          { id: 'noise-choice', text: 'the hallway was noisy' },
          { id: 'wrong-choice', text: 'he made the problem bigger' },
          { id: 'lunch-choice-2', text: 'the lunch line was long' },
        ],
      },
    ],
  }),
  mc({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.springFair,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('guided-b', 'mc-1'),
    prompt: 'Which sentence is the best-supported theme?',
    explanation: 'The story shows that careful preparation kept the fair supplies safe when the rain began.',
    evidenceReference: 'theme-support',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-3',
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-4',
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-5',
    ],
    targetVocabulary: ['careful', 'prepare', 'safe'],
    soundOutChunks: ['care-ful', 'pre-pare', 'safe'],
    tags: [...lessonBTags],
    choices: [
      { id: 'choice-a', text: 'Preparing carefully can prevent a larger problem.' },
      { id: 'choice-b', text: 'Lila and her dad packed the seed table in the community center.' },
      { id: 'choice-c', text: 'The rain started after the clouds gathered.' },
      { id: 'choice-d', text: 'The fair materials were the topic of the story.' },
    ],
    correctChoiceIds: ['choice-a'],
  }),
  mc({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.springFair,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('guided-b', 'mc-2'),
    prompt: 'Which choice is a complete theme, not just a topic?',
    explanation: 'A complete theme says something about a bigger idea, not just what the story is about.',
    evidenceReference: 'complete-thought',
    evidenceReferenceIds: ['g2-story-scouts-theme-trail-passage-spring-fair-sentence-5'],
    targetVocabulary: ['theme', 'topic', 'prepare'],
    soundOutChunks: ['theme', 'top-ic', 'pre-pare'],
    tags: [...lessonBTags, 'theme-as-complete-thought'],
    choices: [
      { id: 'choice-a', text: 'getting ready for the fair' },
      { id: 'choice-b', text: 'Preparing carefully can prevent a larger problem.' },
      { id: 'choice-c', text: 'The seed table was in the community center.' },
      { id: 'choice-d', text: 'Dark clouds gathered outside.' },
    ],
    correctChoiceIds: ['choice-b'],
  }),
  ms({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.springFair,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('guided-b', 'ms-1'),
    prompt: 'Choose all the details that support the theme.',
    explanation: 'These details show Lila prepared carefully before the rain came.',
    evidenceReference: 'supporting-details',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-2',
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-3',
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-4',
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-5',
    ],
    targetVocabulary: ['careful', 'forecast', 'safe'],
    soundOutChunks: ['care-ful', 'fore-cast', 'safe'],
    tags: [...THEME_TRAIL_QUESTION_TAGS, 'theme-supported-by-details'],
    choices: [
      { id: 'choice-a', text: 'Lila remembered the forecast.' },
      { id: 'choice-b', text: 'She carefully taped the labels to the crates, covered the tiny pots, and moved the watering can near the door.' },
      { id: 'choice-c', text: 'When the rain started, the supplies stayed dry.' },
      { id: 'choice-d', text: 'The spring fair was in the community center.' },
    ],
    correctChoiceIds: ['choice-a', 'choice-b', 'choice-c'],
  }),
  ht({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.springFair,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('guided-b', 'ht-1'),
    prompt: 'Select the sentence that shows careful preparation.',
    explanation: 'The third sentence shows Lila carefully getting the supplies ready.',
    evidenceReference: 'sentence-clue',
    evidenceReferenceIds: ['g2-story-scouts-theme-trail-passage-spring-fair-sentence-3'],
    targetVocabulary: ['carefully', 'prepare'],
    soundOutChunks: ['care-ful-ly', 'pre-pare'],
    tags: [...lessonBTags, 'theme-supported-by-character-actions'],
    selectableSegments: [
      {
        id: 'segment-1',
        text: 'Dark clouds gathered outside, and Lila remembered the forecast.',
      },
      {
        id: 'segment-2',
        text: 'She carefully taped the labels to the crates, covered the tiny pots, and moved the watering can near the door.',
      },
      {
        id: 'segment-3',
        text: 'Lila felt calm because careful preparation kept the fair materials safe.',
      },
    ],
    correctSegmentIds: ['segment-2'],
  }),
  tm({
    ...common,
    difficulty: 2,
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.springFair,
    lessonIdentifier: lessonBId,
    questionIdentifier: themeTrailQuestionId('guided-b', 'tm-1'),
    prompt: 'Match each detail to what it shows.',
    explanation: 'Each detail shows how planning ahead kept the supplies safe.',
    evidenceReference: 'detail-to-meaning',
    evidenceReferenceIds: [
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-2',
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-3',
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-4',
      'g2-story-scouts-theme-trail-passage-spring-fair-sentence-5',
    ],
    targetVocabulary: ['forecast', 'careful', 'safe'],
    soundOutChunks: ['fore-cast', 'care-ful', 'safe'],
    tags: [...lessonBTags, 'theme-supported-by-events'],
    rows: [
      {
        id: 'row-1',
        prompt: 'What does Lila remembered the forecast show?',
        correctChoiceId: 'weather-clue',
        options: [
          { id: 'weather-clue', text: 'she noticed a weather clue' },
          { id: 'book-clue', text: 'she was reading a book' },
          { id: 'music-clue', text: 'she was hearing music' },
          { id: 'game-clue', text: 'she wanted to play a game' },
        ],
      },
      {
        id: 'row-2',
        prompt: 'What does she carefully taped the labels to the crates show?',
        correctChoiceId: 'prepare-clue',
        options: [
          { id: 'prepare-clue', text: 'she prepared the supplies' },
          { id: 'run-clue', text: 'she rushed away' },
          { id: 'mess-clue', text: 'she made things messier' },
          { id: 'song-clue', text: 'she sang a song' },
        ],
      },
      {
        id: 'row-3',
        prompt: 'What does the supplies stayed dry show?',
        correctChoiceId: 'problem-clue',
        options: [
          { id: 'problem-clue', text: 'a bigger problem was prevented' },
          { id: 'rain-clue', text: 'the rain got stronger' },
          { id: 'fair-clue', text: 'the fair moved away' },
          { id: 'noise-clue', text: 'the center got louder' },
        ],
      },
      {
        id: 'row-4',
        prompt: 'What does careful preparation kept the fair materials safe show?',
        correctChoiceId: 'theme-clue',
        options: [
          { id: 'theme-clue', text: 'planning ahead helps protect important things' },
          { id: 'topic-clue', text: 'the story is about the fair' },
          { id: 'summary-clue', text: 'the rain came after clouds gathered' },
          { id: 'detail-clue', text: 'the crates held tiny pots' },
        ],
      },
    ],
  }),
]
