import type { ReadingQuestion } from '../../../../types'
import {
  createEvidencePairQuestion,
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
} from './questionFactories'
import {
  PERSPECTIVE_PORTAL_CONTENT_VERSION,
  PERSPECTIVE_PORTAL_LESSON_IDS,
  PERSPECTIVE_PORTAL_QUESTION_TAGS,
  perspectivePortalQuestionId,
  perspectivePortalSentenceId,
} from './ids'
import { perspectivePortalPassageBlueprints } from './passages'

const common = {
  benchmarkReference: 'ELA.2.R.1.3',
  skillIdentifier: 'g2-story-scouts-prose',
  reportingCategory: 'Reading Prose and Poetry',
  genre: 'literary',
  gradeBand: 2 as const,
  estimatedReadingLevel: 'Grade 2',
  contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
}

const [rainyGarden, libraryDisplay, trailRoute, artTable, seedlingsStorm, bridgeMeasure, cleanupWater] = perspectivePortalPassageBlueprints

const chars = (blueprint = rainyGarden) => ({
  a: blueprint.characters[0],
  b: blueprint.characters[1],
})

const mc = (spec: Parameters<typeof createMultipleChoiceQuestion>[0]) =>
  createMultipleChoiceQuestion(spec)

const ms = (spec: Parameters<typeof createMultiselectQuestion>[0]) =>
  createMultiselectQuestion(spec)

const ht = (spec: Parameters<typeof createHotTextQuestion>[0]) =>
  createHotTextQuestion(spec)

const tm = (spec: Parameters<typeof createTableMatchQuestion>[0]) =>
  createTableMatchQuestion(spec)

const ep = (spec: Parameters<typeof createEvidencePairQuestion>[0]) =>
  createEvidencePairQuestion(spec)

function sentenceIds(blueprint = rainyGarden, ...numbers: number[]) {
  return numbers.map((number) => perspectivePortalSentenceId(blueprint.passageKey, number))
}

function supportTags(...tags: string[]) {
  return [...PERSPECTIVE_PORTAL_QUESTION_TAGS, ...tags]
}

function perspectivePrompt(characterName: string, sharedSituation: string): string {
  return `Which sentence best describes ${characterName}'s perspective about ${sharedSituation}?`
}

function differencePrompt(sharedSituation: string): string {
  return `Which choice best shows how the two characters see ${sharedSituation} differently?`
}

function buildFiveQuestionLesson(
  lessonId: string,
  lessonKey: string,
  blueprint = rainyGarden,
  difficulty = 2,
): ReadingQuestion[] {
  const { a, b } = chars(blueprint)
  const passageId = blueprint.passageIdentifier
  return [
    mc({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'mc-1'),
      prompt: perspectivePrompt(a.characterName, blueprint.sharedSituation),
      explanation: `The story details support this perspective: ${a.perspectiveStatement}`,
      evidenceReference: 'character-perspective-a',
      evidenceReferenceIds: sentenceIds(blueprint, ...a.supportingSentenceNumbers.slice(0, 2)),
      targetVocabulary: [a.characterName.toLowerCase(), 'perspective', 'details'],
      soundOutChunks: ['per-spec-tive', 'de-tails'],
      tags: supportTags('perspective-from-words', 'perspective-supported-by-details'),
      choices: [
        { id: 'choice-a', text: blueprint.topicDistractor },
        { id: 'choice-b', text: a.perspectiveStatement },
        { id: 'choice-c', text: blueprint.summaryDistractor },
        { id: 'choice-d', text: b.perspectiveStatement },
      ],
      correctChoiceIds: ['choice-b'],
    }),
    mc({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'mc-2'),
      prompt: perspectivePrompt(b.characterName, blueprint.sharedSituation),
      explanation: `The story details support this perspective: ${b.perspectiveStatement}`,
      evidenceReference: 'character-perspective-b',
      evidenceReferenceIds: sentenceIds(blueprint, ...b.supportingSentenceNumbers.slice(0, 2)),
      targetVocabulary: [b.characterName.toLowerCase(), 'perspective', 'clues'],
      soundOutChunks: ['per-spec-tive', 'clues'],
      tags: supportTags('perspective-from-actions', 'perspective-supported-by-details'),
      choices: [
        { id: 'choice-a', text: b.perspectiveStatement },
        { id: 'choice-b', text: blueprint.topicDistractor },
        { id: 'choice-c', text: 'The narrator tells the whole story.' },
        { id: 'choice-d', text: blueprint.summaryDistractor },
      ],
      correctChoiceIds: ['choice-a'],
    }),
    ms({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'ms-1'),
      prompt: `Choose the two details that best support ${a.characterName}'s perspective.`,
      explanation: `These details support this perspective: ${a.perspectiveStatement}`,
      evidenceReference: 'supporting-details-a',
      evidenceReferenceIds: sentenceIds(blueprint, ...a.supportingSentenceNumbers),
      targetVocabulary: ['support', 'details', a.characterName.toLowerCase()],
      soundOutChunks: ['sup-port', 'de-tails'],
      tags: supportTags('perspective-from-feelings', 'perspective-from-choices'),
      choices: [
        { id: 'choice-a', text: blueprint.sentences[0] },
        { id: 'choice-b', text: blueprint.sentences[(a.supportingSentenceNumbers[0] ?? 1) - 1] },
        { id: 'choice-c', text: blueprint.sentences[(a.supportingSentenceNumbers[1] ?? 2) - 1] },
        { id: 'choice-d', text: blueprint.sentences[(b.supportingSentenceNumbers[0] ?? 3) - 1] },
      ],
      correctChoiceIds: ['choice-b', 'choice-c'],
    }),
    ht({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'ht-1'),
      prompt: `Select the sentence that best shows ${b.characterName}'s perspective.`,
      explanation: `This sentence shows ${b.characterName}'s own way of thinking about the shared situation.`,
      evidenceReference: 'perspective-sentence-b',
      evidenceReferenceIds: sentenceIds(blueprint, ...b.supportingSentenceNumbers.slice(0, 2)),
      targetVocabulary: [b.characterName.toLowerCase(), 'sentence', 'clues'],
      soundOutChunks: ['sen-tence', 'clues'],
      tags: supportTags('perspective-from-noticing', 'perspective-as-attitude'),
      selectableSegments: blueprint.sentences.map((text, index) => ({ id: `segment-${index + 1}`, text })),
      correctSegmentIds: [`segment-${b.supportingSentenceNumbers[0] ?? 1}`],
    }),
    tm({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'tm-1'),
      prompt: `Match each row to the best answer about ${blueprint.sharedSituation}.`,
      explanation: 'Each row asks about a character or clue from the story, so the best match uses the detail that shows that perspective.',
      evidenceReference: 'perspective-match',
      evidenceReferenceIds: sentenceIds(blueprint, 1, 2, 3, 4, 5, 6, 7),
      targetVocabulary: ['match', 'clues', 'perspective'],
      soundOutChunks: ['match', 'clues'],
      tags: supportTags('perspective-from-actions', 'perspective-vs-narrator-point-of-view'),
      rows: [
        {
          id: 'row-1',
          prompt: `${a.characterName} thinks the situation should be handled how?`,
          correctChoiceId: 'option-b',
          options: [
            { id: 'option-a', text: blueprint.topicDistractor },
            { id: 'option-b', text: a.perspectiveStatement },
            { id: 'option-c', text: blueprint.summaryDistractor },
            { id: 'option-d', text: b.perspectiveStatement },
          ],
        },
        {
          id: 'row-2',
          prompt: `Which detail shows ${b.characterName}'s view?`,
          correctChoiceId: 'option-c',
          options: [
            { id: 'option-a', text: blueprint.sentences[0] },
            { id: 'option-b', text: blueprint.sentences[1] },
            { id: 'option-c', text: blueprint.sentences[(b.supportingSentenceNumbers[0] ?? 3) - 1] },
            { id: 'option-d', text: blueprint.sentences[6] },
          ],
        },
        {
          id: 'row-3',
          prompt: 'Which choice tells about the shared situation?',
          correctChoiceId: 'option-a',
          options: [
            { id: 'option-a', text: blueprint.sharedSituation },
            { id: 'option-b', text: a.perspectiveStatement },
            { id: 'option-c', text: b.perspectiveStatement },
            { id: 'option-d', text: 'The narrator is first person.' },
          ],
        },
      ],
    }),
  ]
}

function buildCheckpointQuestions(
  lessonId: string,
  lessonKey: string,
  blueprint = rainyGarden,
  difficulty = 3,
): ReadingQuestion[] {
  const { a, b } = chars(blueprint)
  const passageId = blueprint.passageIdentifier
  return [
    mc({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'mc-1'),
      prompt: perspectivePrompt(a.characterName, blueprint.sharedSituation),
      explanation: `${a.characterName} sees the shared situation this way because the story gives clues in words, actions, and choices.`,
      evidenceReference: 'checkpoint-perspective-a',
      evidenceReferenceIds: sentenceIds(blueprint, ...a.supportingSentenceNumbers.slice(0, 2)),
      targetVocabulary: [a.characterName.toLowerCase(), 'shared', 'situation'],
      soundOutChunks: ['shared', 'sit-u-a-tion'],
      tags: ['character-perspective-identification', 'perspective-from-words', 'perspective-supported-by-details'],
      choices: [
        { id: 'choice-a', text: blueprint.topicDistractor },
        { id: 'choice-b', text: a.perspectiveStatement },
        { id: 'choice-c', text: blueprint.summaryDistractor },
        { id: 'choice-d', text: b.perspectiveStatement },
      ],
      correctChoiceIds: ['choice-b'],
    }),
    mc({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'mc-2'),
      prompt: perspectivePrompt(b.characterName, blueprint.sharedSituation),
      explanation: `${b.characterName} sees the situation this way because the story shows a different set of clues.`,
      evidenceReference: 'checkpoint-perspective-b',
      evidenceReferenceIds: sentenceIds(blueprint, ...b.supportingSentenceNumbers.slice(0, 2)),
      targetVocabulary: [b.characterName.toLowerCase(), 'different', 'clues'],
      soundOutChunks: ['dif-fer-ent', 'clues'],
      tags: ['character-perspective-identification', 'perspective-from-actions', 'perspective-supported-by-details'],
      choices: [
        { id: 'choice-a', text: b.perspectiveStatement },
        { id: 'choice-b', text: blueprint.topicDistractor },
        { id: 'choice-c', text: 'The narrator tells the whole story.' },
        { id: 'choice-d', text: blueprint.summaryDistractor },
      ],
      correctChoiceIds: ['choice-a'],
    }),
    mc({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'mc-3'),
      prompt: differencePrompt(blueprint.sharedSituation),
      explanation: 'The best answer names both perspectives and shows that the characters think about the same situation in different ways.',
      evidenceReference: 'checkpoint-difference',
      evidenceReferenceIds: sentenceIds(blueprint, 2, 3, 4, 5),
      targetVocabulary: ['perspective', 'different', 'same'],
      soundOutChunks: ['per-spec-tive', 'dif-fer-ent', 'same'],
      tags: ['different-character-perspectives', 'shared-event-different-views', 'perspective-vs-narrator-point-of-view'],
      choices: [
        { id: 'choice-a', text: `${a.characterName} and ${b.characterName} think the same thing.` },
        { id: 'choice-b', text: `${a.perspectiveStatement} ${b.perspectiveStatement}` },
        { id: 'choice-c', text: 'The narrator explains everything in the story.' },
        { id: 'choice-d', text: blueprint.summaryDistractor },
      ],
      correctChoiceIds: ['choice-b'],
    }),
    ms({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'ms-1'),
      prompt: `Choose the two details that best support ${a.characterName}'s perspective.`,
      explanation: `These details support this perspective: ${a.perspectiveStatement}`,
      evidenceReference: 'checkpoint-support-a',
      evidenceReferenceIds: sentenceIds(blueprint, ...a.supportingSentenceNumbers),
      targetVocabulary: ['support', 'details', a.characterName.toLowerCase()],
      soundOutChunks: ['sup-port', 'de-tails'],
      tags: ['perspective-from-feelings', 'perspective-from-choices', 'perspective-supported-by-details'],
      choices: [
        { id: 'choice-a', text: blueprint.sentences[(a.supportingSentenceNumbers[0] ?? 2) - 1] },
        { id: 'choice-b', text: blueprint.sentences[(b.supportingSentenceNumbers[0] ?? 3) - 1] },
        { id: 'choice-c', text: blueprint.sentences[(a.supportingSentenceNumbers[1] ?? 4) - 1] },
        { id: 'choice-d', text: blueprint.sentences[6] },
      ],
      correctChoiceIds: ['choice-a', 'choice-c'],
    }),
    ht({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'ht-1'),
      prompt: `Select the sentence that best shows ${b.characterName}'s perspective.`,
      explanation: `This sentence gives a clear clue about how ${b.characterName} regards the situation.`,
      evidenceReference: 'checkpoint-sentence-b',
      evidenceReferenceIds: sentenceIds(blueprint, ...b.supportingSentenceNumbers.slice(0, 2)),
      targetVocabulary: [b.characterName.toLowerCase(), 'sentence', 'clue'],
      soundOutChunks: ['sen-tence', 'clue'],
      tags: ['perspective-from-noticing', 'perspective-from-words', 'perspective-as-attitude'],
      selectableSegments: blueprint.sentences.map((text, index) => ({ id: `segment-${index + 1}`, text })),
      correctSegmentIds: [`segment-${b.supportingSentenceNumbers[0] ?? 1}`],
    }),
    tm({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'tm-1'),
      prompt: 'Match the row to the best answer.',
      explanation: 'Each row points to one part of the story, so the best match uses the detail that shows that perspective.',
      evidenceReference: 'checkpoint-match',
      evidenceReferenceIds: sentenceIds(blueprint, 1, 2, 3, 4, 5, 6, 7),
      targetVocabulary: ['match', 'perspective', 'clues'],
      soundOutChunks: ['match', 'clues'],
      tags: ['perspective-from-actions', 'perspective-from-choices', 'perspective-supported-by-details'],
      rows: [
        {
          id: 'row-1',
          prompt: `${a.characterName} sees the situation as...`,
          correctChoiceId: 'option-b',
          options: [
            { id: 'option-a', text: blueprint.topicDistractor },
            { id: 'option-b', text: a.perspectiveStatement },
            { id: 'option-c', text: blueprint.summaryDistractor },
            { id: 'option-d', text: 'The narrator tells the whole story.' },
          ],
        },
        {
          id: 'row-2',
          prompt: `${b.characterName} gives this clue...`,
          correctChoiceId: 'option-c',
          options: [
            { id: 'option-a', text: blueprint.sentences[0] },
            { id: 'option-b', text: blueprint.sentences[1] },
            { id: 'option-c', text: blueprint.sentences[(b.supportingSentenceNumbers[0] ?? 3) - 1] },
            { id: 'option-d', text: blueprint.sentences[6] },
          ],
        },
        {
          id: 'row-3',
          prompt: 'This sentence shows the shared situation.',
          correctChoiceId: 'option-a',
          options: [
            { id: 'option-a', text: blueprint.sharedSituation },
            { id: 'option-b', text: a.perspectiveStatement },
            { id: 'option-c', text: b.perspectiveStatement },
            { id: 'option-d', text: 'The narrator is first person.' },
          ],
        },
      ],
    }),
    ep({
      ...common,
      difficulty,
      passageIdentifier: passageId,
      lessonIdentifier: lessonId,
      questionIdentifier: perspectivePortalQuestionId(lessonKey, 'ep-1'),
      prompt: `Which statement best describes ${a.characterName}'s perspective about ${blueprint.sharedSituation}?`,
      explanation: `${a.characterName}'s perspective is supported by the story details and the outcome.`,
      evidenceReference: 'checkpoint-evidence',
      evidenceReferenceIds: sentenceIds(blueprint, ...a.supportingSentenceNumbers.slice(0, 2)),
      targetVocabulary: ['perspective', a.characterName.toLowerCase(), 'evidence'],
      soundOutChunks: ['per-spec-tive', 'evi-dence'],
      tags: ['character-perspective-identification', 'different-character-perspectives', 'perspective-supported-by-details'],
      partAChoices: [
        { id: 'choice-a', text: blueprint.topicDistractor },
        { id: 'choice-b', text: a.perspectiveStatement },
        { id: 'choice-c', text: blueprint.summaryDistractor },
        { id: 'choice-d', text: b.perspectiveStatement },
      ],
      partACorrectChoiceId: 'choice-b',
      partBChoices: [
        { id: 'choice-a', text: blueprint.sentences[(a.supportingSentenceNumbers[0] ?? 2) - 1] },
        { id: 'choice-b', text: blueprint.sentences[(b.supportingSentenceNumbers[0] ?? 3) - 1] },
        { id: 'choice-c', text: blueprint.sentences[(a.supportingSentenceNumbers[1] ?? 4) - 1] },
        { id: 'choice-d', text: blueprint.sentences[6] },
      ],
      partBCorrectChoiceId: 'choice-c',
    }),
  ]
}

export const perspectivePortalPrerequisiteQuestions: ReadingQuestion[] = [
  ...buildFiveQuestionLesson(PERSPECTIVE_PORTAL_LESSON_IDS.prerequisiteA, 'prerequisite-a', rainyGarden, 2),
  ...buildFiveQuestionLesson(PERSPECTIVE_PORTAL_LESSON_IDS.prerequisiteB, 'prerequisite-b', libraryDisplay, 2),
]

export const perspectivePortalGuidedQuestions: ReadingQuestion[] = [
  ...buildFiveQuestionLesson(PERSPECTIVE_PORTAL_LESSON_IDS.guidedA, 'guided-a', trailRoute, 3),
  ...buildFiveQuestionLesson(PERSPECTIVE_PORTAL_LESSON_IDS.guidedB, 'guided-b', artTable, 3),
]

export const perspectivePortalCheckpointQuestions: ReadingQuestion[] = [
  ...buildCheckpointQuestions(PERSPECTIVE_PORTAL_LESSON_IDS.checkpointA, 'checkpoint-a', seedlingsStorm, 3),
  ...buildCheckpointQuestions(PERSPECTIVE_PORTAL_LESSON_IDS.checkpointB, 'checkpoint-b', bridgeMeasure, 3),
  ...buildCheckpointQuestions(PERSPECTIVE_PORTAL_LESSON_IDS.checkpointC, 'checkpoint-c', cleanupWater, 3),
]

export const perspectivePortalQuestions: ReadingQuestion[] = [
  ...perspectivePortalPrerequisiteQuestions,
  ...perspectivePortalGuidedQuestions,
  ...perspectivePortalCheckpointQuestions,
]
