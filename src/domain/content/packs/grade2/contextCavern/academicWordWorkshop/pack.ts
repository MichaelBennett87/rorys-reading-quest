import type { AcademicVocabularyGuide, ContentPack, ContentPackLesson } from '../../../contentPackTypes'
import type { Passage, ReadingQuestion, WordSupportTarget } from '../../../../types'
import type {
  InformationalFeature,
  InformationalHeadingFeature,
  InformationalSection,
  InformationalTitleFeature,
} from '../../../../informationalTypes'
import {
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
  createTwoPartQuestion,
  lessonChoice as choice,
} from './questionFactories'
import {
  contextCavernAcademicWordWorkshopContentVersion,
  contextCavernAcademicWordWorkshopLessonIds,
  contextCavernAcademicWordWorkshopPackId,
  contextCavernAcademicWordWorkshopPassageIds,
  contextCavernAcademicWordWorkshopPrimarySkillId,
  contextCavernAcademicWordWorkshopQuestionIds,
  contextCavernAcademicWordWorkshopSentenceIds,
  contextCavernAcademicWordWorkshopUnitId,
  contextCavernAcademicWordWorkshopWorldId,
} from './ids'

type Sentence = {
  sentenceId: string
  text: string
}

type TargetPlan = {
  word: keyof typeof WORD_INFO
  sentenceIndex: number
}

type PassagePlan = {
  key: keyof typeof contextCavernAcademicWordWorkshopPassageIds
  passageId: string
  title: string
  readingContext: string
  sectionHeadings: [string, string]
  sentences: Sentence[]
  targetPlans: readonly TargetPlan[]
}

type PassageArtifact = {
  passage: Passage
  guide: AcademicVocabularyGuide
  targets: TargetSpec[]
}

type TargetSpec = {
  word: keyof typeof WORD_INFO
  sentenceId: string
  sentenceText: string
  splitIndex: number
  clue: string
  meaning: string
  speakingExample: string
  writingExample: string
  subjectContexts: readonly [string, string]
}

const academicVocabularyTags = [
  'academic-vocabulary-use',
  'speaking-vocabulary-use',
  'writing-vocabulary-use',
  'cross-subject-vocabulary-use',
] as const

const WORD_INFO: Record<string, {
  meaning: string
  speakingExample: string
  writingExample: string
  clue: string
  splitIndex: number
  subjectContexts: readonly [string, string]
}> = {
  compare: {
    meaning: 'To compare means to notice how two things are alike and different.',
    speakingExample: 'In science, a student might say, "I compare the two charts to see what changed."',
    writingExample: 'In math, a student might write, "I compare the numbers on the graph."',
    clue: 'notice how two things are alike and different',
    splitIndex: 3,
    subjectContexts: ['science', 'math'],
  },
  describe: {
    meaning: 'To describe means to tell what something looks like or is like.',
    speakingExample: 'In art, a student might say, "I describe the picture as bright and calm."',
    writingExample: 'In science, a student might write, "I describe the plant as tall and green."',
    clue: 'tell what something looks like or is like',
    splitIndex: 2,
    subjectContexts: ['art', 'science'],
  },
  explain: {
    meaning: 'To explain means to tell how or why something happens.',
    speakingExample: 'In science, a student might say, "I explain why the leaves changed color."',
    writingExample: 'In writing, a student might write, "I explain how the seed needs water."',
    clue: 'tell how or why something happens',
    splitIndex: 2,
    subjectContexts: ['science', 'writing'],
  },
  identify: {
    meaning: 'To identify means to name or pick out something correctly.',
    speakingExample: 'In reading, a student might say, "I identify the category of the book."',
    writingExample: 'In science, a student might write, "I identify the plant by its stem."',
    clue: 'name or pick out something correctly',
    splitIndex: 4,
    subjectContexts: ['reading', 'science'],
  },
  observe: {
    meaning: 'To observe means to look closely and notice details.',
    speakingExample: 'In science, a student might say, "I observe the birds near the pond."',
    writingExample: 'In nature study, a student might write, "I observe the water level each day."',
    clue: 'look closely and notice details',
    splitIndex: 2,
    subjectContexts: ['science', 'nature study'],
  },
  predict: {
    meaning: 'To predict means to make a smart guess about what may happen.',
    speakingExample: 'In science, a student might say, "I predict the plant will grow taller."',
    writingExample: 'In reading, a student might write, "I predict the story will end with a surprise."',
    clue: 'make a smart guess about what may happen',
    splitIndex: 3,
    subjectContexts: ['science', 'reading'],
  },
  reason: {
    meaning: 'A reason is why something happens or why someone thinks something.',
    speakingExample: 'In science, a student might say, "My reason is that the soil was dry."',
    writingExample: 'In social studies, a student might write, "The reason the team chose the bin is that it was clear."',
    clue: 'tell why something happens or why someone thinks it',
    splitIndex: 3,
    subjectContexts: ['science', 'social studies'],
  },
  result: {
    meaning: 'A result is what happens after something is done.',
    speakingExample: 'In science, a student might say, "The result was more water on the tray."',
    writingExample: 'In writing, a student might write, "The result was a taller plant after watering."',
    clue: 'tell what happens after something is done',
    splitIndex: 2,
    subjectContexts: ['science', 'writing'],
  },
  example: {
    meaning: 'An example is one sample that helps show an idea.',
    speakingExample: 'In reading, a student might say, "My example is the line that shows the idea."',
    writingExample: 'In writing, a student might write, "This example shows how the chart works."',
    clue: 'give one sample that helps show an idea',
    splitIndex: 2,
    subjectContexts: ['reading', 'writing'],
  },
  detail: {
    meaning: 'A detail is a small fact that adds more information.',
    speakingExample: 'In reading, a student might say, "That detail helps me picture the scene."',
    writingExample: 'In writing, a student might write, "I add one detail about the picture."',
    clue: 'small fact that adds more information',
    splitIndex: 2,
    subjectContexts: ['reading', 'writing'],
  },
  sequence: {
    meaning: 'A sequence is the order that steps or events happen in.',
    speakingExample: 'In social studies, a student might say, "I sequence the steps in order."',
    writingExample: 'In science, a student might write, "I sequence the steps for planting."',
    clue: 'show steps or events in order',
    splitIndex: 2,
    subjectContexts: ['social studies', 'science'],
  },
  measure: {
    meaning: 'To measure means to find how long, tall, or deep something is.',
    speakingExample: 'In math, a student might say, "I measure the length with a ruler."',
    writingExample: 'In science, a student might write, "I measure the sprout each Friday."',
    clue: 'find how long, tall, or deep something is',
    splitIndex: 3,
    subjectContexts: ['math', 'science'],
  },
  record: {
    meaning: 'To record means to write down or keep track of information.',
    speakingExample: 'In science, a student might say, "I record the rain count each day."',
    writingExample: 'In math, a student might write, "I record the numbers in my table."',
    clue: 'write down or keep track of information',
    splitIndex: 3,
    subjectContexts: ['science', 'math'],
  },
  category: {
    meaning: 'A category is a group of things that belong together.',
    speakingExample: 'In math, a student might say, "I put these shapes in one category."',
    writingExample: 'In reading, a student might write, "This book is in the adventure category."',
    clue: 'group things that belong together',
    splitIndex: 3,
    subjectContexts: ['math', 'reading'],
  },
}

const createTitle = (featureId: string, text: string): InformationalTitleFeature => ({ featureId, kind: 'title', text })
const createHeading = (featureId: string, sectionId: string, text: string): InformationalHeadingFeature => ({
  featureId,
  kind: 'heading',
  sectionId,
  text,
})

function makeSupportTarget(
  passageId: string,
  sentenceText: string,
  sentenceId: string,
  surfaceWord: string,
  splitIndex: number,
): WordSupportTarget {
  const first = surfaceWord.slice(0, splitIndex)
  const second = surfaceWord.slice(splitIndex)
  return {
    targetId: `${passageId}-${sentenceId}-${surfaceWord}`,
    passageId,
    sentenceId,
    surfaceWord,
    focusParts: [
      { text: first, emphasis: false },
      { text: second, emphasis: true },
    ],
    displayChunks: [
      { displayText: first, speechText: first },
      { displayText: second, speechText: second },
    ],
    spokenChunks: [
      { displayText: first, speechText: first },
      { displayText: second, speechText: second },
    ],
    blendSpeechText: surfaceWord,
    wholeWordSpeechText: surfaceWord,
    sentenceSpeechText: sentenceText,
    reviewStatus: 'DRAFT',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
  }
}

function buildPassageArtifact(plan: PassagePlan): PassageArtifact {
  const sentenceByIndex = plan.sentences
  const sentenceById = new Map(sentenceByIndex.map((sentence) => [sentence.sentenceId, sentence] as const))
  const titleFeatureId = contextCavernAcademicWordWorkshopPassageIds[plan.key].titleFeatureId
  const headingIds = contextCavernAcademicWordWorkshopPassageIds[plan.key].headingFeatureIds
  const sectionOneSentenceIds = sentenceByIndex.slice(0, 4).map((sentence) => sentence.sentenceId)
  const sectionTwoSentenceIds = sentenceByIndex.slice(4).map((sentence) => sentence.sentenceId)

  const targetSpecs = plan.targetPlans.map((targetPlan) => {
    const sentence = sentenceByIndex[targetPlan.sentenceIndex]
    const info = WORD_INFO[targetPlan.word]
    return {
      word: targetPlan.word,
      sentenceId: sentence.sentenceId,
      sentenceText: sentence.text,
      splitIndex: info.splitIndex,
      clue: info.clue,
      meaning: info.meaning,
      speakingExample: info.speakingExample,
      writingExample: info.writingExample,
      subjectContexts: info.subjectContexts,
    } satisfies TargetSpec
  })

  const passages = sentenceByIndex.map((sentence) => ({ ...sentence }))
  const features: InformationalFeature[] = [
    createTitle(titleFeatureId, plan.title),
    createHeading(headingIds[0], `${plan.key}-section-1`, plan.sectionHeadings[0]),
    createHeading(headingIds[1], `${plan.key}-section-2`, plan.sectionHeadings[1]),
  ]

  const passage: Passage = {
    passageIdentifier: plan.passageId,
    gradeBand: 2,
    contentKind: 'informational',
    passageText: sentenceByIndex.map((sentence) => sentence.text).join(' '),
    sentences: passages,
    informationalStructure: {
      titleFeatureId,
      sections: [
        {
          sectionId: `${plan.key}-section-1`,
          headingFeatureId: headingIds[0],
          sentenceIds: sectionOneSentenceIds,
          featureIds: [],
        },
        {
          sectionId: `${plan.key}-section-2`,
          headingFeatureId: headingIds[1],
          sentenceIds: sectionTwoSentenceIds,
          featureIds: [],
        },
      ] satisfies InformationalSection[],
      features,
    },
    readingContext: plan.readingContext,
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    reviewStatus: 'DRAFT',
    wordSupportTargets: targetSpecs.map((targetSpec) =>
      makeSupportTarget(
        plan.passageId,
        sentenceById.get(targetSpec.sentenceId)!.text,
        targetSpec.sentenceId,
        targetSpec.word,
        targetSpec.splitIndex,
      ),
    ),
  }

  const guide: AcademicVocabularyGuide = {
    passageId: plan.passageId,
    targets: targetSpecs.map((targetSpec) => ({
      targetId: `${plan.passageId}-${targetSpec.word}`,
      word: targetSpec.word,
      childFriendlyMeaning: targetSpec.meaning,
      speakingExample: targetSpec.speakingExample,
      writingExample: targetSpec.writingExample,
      appropriateUseSentenceIds: [targetSpec.sentenceId],
      subjectContexts: [...targetSpec.subjectContexts],
    })),
    reviewStatus: 'DRAFT',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
  }

  return { passage, guide, targets: targetSpecs }
}

function rotate<T>(items: readonly T[], startIndex: number): T[] {
  const normalized = startIndex % items.length
  return [...items.slice(normalized), ...items.slice(0, normalized)]
}

function buildSentenceMcQuestion(
  lessonId: string,
  questionId: string,
  passage: Passage,
  target: TargetSpec,
  correctChoiceIndex: number,
  prompt: string,
  explanation: string,
  difficulty: 0 | 1,
): ReadingQuestion {
  const passageSentences = passage.sentences ?? []
  const distractors = passageSentences
    .filter((sentence) => sentence.sentenceId !== target.sentenceId)
    .slice(0, 3)
    .map((sentence) => sentence.text)
  const choices = rotate([
    choice(`${questionId}-choice-1`, target.sentenceText),
    choice(`${questionId}-choice-2`, distractors[0]),
    choice(`${questionId}-choice-3`, distractors[1]),
    choice(`${questionId}-choice-4`, distractors[2]),
  ], correctChoiceIndex)
  const correctChoiceId = choices.find((item) => item.text === target.sentenceText)!.id
  return createMultipleChoiceQuestion({
    benchmarkReference: 'ELA.2.V.1.1',
    skillIdentifier: contextCavernAcademicWordWorkshopPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: target.sentenceId,
    evidenceReferenceIds: [target.sentenceId],
    targetVocabulary: [target.word],
    soundOutChunks: [target.word],
    tags: [...academicVocabularyTags],
    choices,
    correctChoiceIds: [correctChoiceId],
  })
}

function buildContextMultiselectQuestion(
  lessonId: string,
  questionId: string,
  passage: Passage,
  target: TargetSpec,
  prompt: string,
  explanation: string,
  difficulty: 0 | 1,
): ReadingQuestion {
  const allContexts = ['science', 'math', 'reading', 'writing', 'art', 'social studies', 'nature study', 'library']
  const choices = allContexts.map((context, index) => choice(`${questionId}-choice-${index + 1}`, context))
  const correctContexts = [...target.subjectContexts]
  return createMultiselectQuestion({
    benchmarkReference: 'ELA.2.V.1.1',
    skillIdentifier: contextCavernAcademicWordWorkshopPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: target.sentenceId,
    evidenceReferenceIds: [target.sentenceId],
    targetVocabulary: [target.word],
    soundOutChunks: [target.word],
    tags: [...academicVocabularyTags],
    choices,
    correctChoiceIds: correctContexts.map((context) => choices.find((choiceItem) => choiceItem.text === context)!.id),
  })
}

function buildHotTextQuestion(
  lessonId: string,
  questionId: string,
  passage: Passage,
  target: TargetSpec,
  correctSegmentIndex: number,
  prompt: string,
  explanation: string,
  difficulty: 0 | 1,
): ReadingQuestion {
  const passageSentences = passage.sentences ?? []
  const distractors = passageSentences
    .filter((sentence) => sentence.sentenceId !== target.sentenceId)
    .slice(0, 3)
  const selectableSegments = rotate([
    { id: `${questionId}-segment-1`, text: target.sentenceText },
    { id: `${questionId}-segment-2`, text: distractors[0]?.text ?? target.sentenceText },
    { id: `${questionId}-segment-3`, text: distractors[1]?.text ?? target.sentenceText },
    { id: `${questionId}-segment-4`, text: distractors[2]?.text ?? target.sentenceText },
  ], correctSegmentIndex)
  const correctSegmentId = selectableSegments.find((segment) => segment.text === target.sentenceText)!.id
  return createHotTextQuestion({
    benchmarkReference: 'ELA.2.V.1.1',
    skillIdentifier: contextCavernAcademicWordWorkshopPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: target.sentenceId,
    evidenceReferenceIds: [target.sentenceId],
    targetVocabulary: [target.word],
    soundOutChunks: [target.word],
    tags: [...academicVocabularyTags],
    selectableSegments,
    correctSegmentIds: [correctSegmentId],
  })
}

function buildTableMatchQuestion(
  lessonId: string,
  questionId: string,
  passage: Passage,
  focusTargets: readonly TargetSpec[],
  prompt: string,
  explanation: string,
  difficulty: 0 | 1,
): ReadingQuestion {
  const passageSentences = passage.sentences ?? []
  const words = focusTargets.map((target) => target.word)
  const rows = focusTargets.map((target, index) => {
    const options = rotate(
      words.map((word) => choice(`${questionId}-row-${index + 1}-${word}`, word)),
      index,
    )
    return {
      id: `${questionId}-row-${index + 1}`,
      prompt: target.clue,
      correctChoiceId: options.find((option) => option.text === target.word)!.id,
      options,
    }
  })

  return createTableMatchQuestion({
    benchmarkReference: 'ELA.2.V.1.1',
    skillIdentifier: contextCavernAcademicWordWorkshopPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: focusTargets[0]?.sentenceId ?? passageSentences[0].sentenceId,
    evidenceReferenceIds: focusTargets.map((target) => target.sentenceId),
    targetVocabulary: words,
    soundOutChunks: words,
    tags: [...academicVocabularyTags],
    rows,
  })
}

function buildTwoPartQuestion(
  lessonId: string,
  questionId: string,
  passage: Passage,
  target: TargetSpec,
  prompt: string,
  explanation: string,
  difficulty: 0 | 1,
): ReadingQuestion {
  const partAChoices = rotate([
    choice(`${questionId}-part-a-1`, target.word),
    choice(`${questionId}-part-a-2`, 'topic'),
    choice(`${questionId}-part-a-3`, 'detail'),
    choice(`${questionId}-part-a-4`, 'fact'),
  ], 1)
  const partBChoices = rotate([
    choice(`${questionId}-part-b-1`, 'It is a useful academic word for speaking or writing.'),
    choice(`${questionId}-part-b-2`, 'It names the topic only.'),
    choice(`${questionId}-part-b-3`, 'It is just one small detail.'),
    choice(`${questionId}-part-b-4`, 'It is not a school word.'),
  ], 0)
  return createTwoPartQuestion({
    benchmarkReference: 'ELA.2.V.1.1',
    skillIdentifier: contextCavernAcademicWordWorkshopPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: target.sentenceId,
    evidenceReferenceIds: [target.sentenceId],
    targetVocabulary: [target.word],
    soundOutChunks: [target.word],
    tags: [...academicVocabularyTags],
    partAPrompt: `Which word best fits the speaking or writing sentence about ${target.clue}?`,
    partAChoices,
    partACorrectChoiceId: partAChoices.find((choiceItem) => choiceItem.text === target.word)!.id,
    partBPrompt: 'Why does the word fit best?',
    partBChoices,
    partBCorrectChoiceId: partBChoices[0].id,
  })
}

function buildFiveQuestionLessonQuestions(
  lessonId: string,
  passage: Passage,
  focusTargets: readonly TargetSpec[],
  questionIds: readonly string[],
): ReadingQuestion[] {
  const [first, second, third, fourth] = focusTargets
  return [
    buildSentenceMcQuestion(
      lessonId,
      questionIds[0],
      passage,
      first,
      0,
      `Which sentence uses ${first.word} correctly?`,
      `The sentence shows ${first.word} being used in a complete thought.`,
      0,
    ),
    buildSentenceMcQuestion(
      lessonId,
      questionIds[1],
      passage,
      second,
      1,
      `Which sentence uses ${second.word} correctly?`,
      `The sentence shows ${second.word} being used in a complete thought.`,
      0,
    ),
    buildContextMultiselectQuestion(
      lessonId,
      questionIds[2],
      passage,
      third,
      `Choose two subjects where ${third.word} would fit.`,
      `The word fits the two school subjects the student would use most often.`,
      0,
    ),
    buildHotTextQuestion(
      lessonId,
      questionIds[3],
      passage,
      fourth,
      2,
      `Select the sentence that uses ${fourth.word} correctly.`,
      `This sentence uses ${fourth.word} in the way the passage teaches it.`,
      0,
    ),
    buildTableMatchQuestion(
      lessonId,
      questionIds[4],
      passage,
      focusTargets,
      'Match each clue to the best word.',
      'Each clue describes one academic word from the passage.',
      0,
    ),
  ]
}

function buildCheckpointQuestions(
  lessonId: string,
  passage: Passage,
  focusTargets: readonly TargetSpec[],
  questionIds: readonly string[],
): ReadingQuestion[] {
  const [first, second, third, fourth] = focusTargets
  return [
    buildSentenceMcQuestion(
      lessonId,
      questionIds[0],
      passage,
      first,
      2,
      `Which sentence uses ${first.word} correctly?`,
      `This sentence uses ${first.word} in the way the passage teaches it.`,
      1,
    ),
    buildSentenceMcQuestion(
      lessonId,
      questionIds[1],
      passage,
      second,
      1,
      `Which sentence uses ${second.word} correctly?`,
      `This sentence uses ${second.word} in the way the passage teaches it.`,
      1,
    ),
    buildSentenceMcQuestion(
      lessonId,
      questionIds[2],
      passage,
      third,
      3,
      `Which sentence uses ${third.word} correctly?`,
      `This sentence uses ${third.word} in the way the passage teaches it.`,
      1,
    ),
    buildContextMultiselectQuestion(
      lessonId,
      questionIds[3],
      passage,
      fourth,
      `Choose two subjects where ${fourth.word} would fit.`,
      `The word fits the two school subjects the student would use most often.`,
      1,
    ),
    buildHotTextQuestion(
      lessonId,
      questionIds[4],
      passage,
      second,
      0,
      `Select the sentence that uses ${second.word} correctly.`,
      `This sentence uses ${second.word} in the way the passage teaches it.`,
      1,
    ),
    buildTableMatchQuestion(
      lessonId,
      questionIds[5],
      passage,
      focusTargets,
      'Match each clue to the best word.',
      'Each clue describes one academic word from the passage.',
      1,
    ),
    buildTwoPartQuestion(
      lessonId,
      questionIds[6],
      passage,
      third,
      `Which word best fits the speaking or writing sentence about ${third.clue}?`,
      'The first part names the word, and the second part checks why it fits.',
      1,
    ),
  ]
}

const weatherChartsPassagePlan: PassagePlan = {
  key: 'weatherCharts',
  passageId: contextCavernAcademicWordWorkshopPassageIds.weatherCharts.passageId,
  title: 'Comparing Weather Charts',
  readingContext: 'A class uses weather charts in science and math.',
  sectionHeadings: ['Looking at the Charts', 'Speaking and Writing'],
  sentences: [
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.weatherCharts[0], text: 'The class looked at two weather charts after a rainy week.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.weatherCharts[1], text: 'Students compare the morning chart and the afternoon chart to see what changed.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.weatherCharts[2], text: 'A student can describe the morning chart as calm and bright.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.weatherCharts[3], text: 'The class talked about the result of the rainstorm on the playground.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.weatherCharts[4], text: 'The teacher asked for an example from the chart.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.weatherCharts[5], text: 'The class wrote one short sentence about the chart in their notebooks.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.weatherCharts[6], text: 'The graph showed the bars growing taller after each storm.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.weatherCharts[7], text: 'The students shared their ideas aloud.' },
  ],
  targetPlans: [
    { word: 'compare', sentenceIndex: 1 },
    { word: 'describe', sentenceIndex: 2 },
    { word: 'result', sentenceIndex: 3 },
    { word: 'example', sentenceIndex: 4 },
  ],
}

const researchNotesPassagePlan: PassagePlan = {
  key: 'researchNotes',
  passageId: contextCavernAcademicWordWorkshopPassageIds.researchNotes.passageId,
  title: 'Research Notes and Planting Steps',
  readingContext: 'A class keeps research notes while planting seeds.',
  sectionHeadings: ['Checking the Seed Jars', 'Writing the Notes'],
  sentences: [
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.researchNotes[0], text: 'The class kept research notes about a garden project.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.researchNotes[1], text: 'Students compare two seed jars to see which one grew faster.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.researchNotes[2], text: 'The teacher asked them to explain why one jar needed more water.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.researchNotes[3], text: 'The class checked the sprouts after each watering.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.researchNotes[4], text: 'A sequence chart showed the steps in planting the seeds.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.researchNotes[5], text: 'They record the notes in the book after each check.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.researchNotes[6], text: 'The notes helped the class talk about the project in order.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.researchNotes[7], text: 'The final page held a short summary sentence.' },
  ],
  targetPlans: [
    { word: 'compare', sentenceIndex: 1 },
    { word: 'explain', sentenceIndex: 2 },
    { word: 'sequence', sentenceIndex: 4 },
    { word: 'record', sentenceIndex: 5 },
  ],
}

const gardenJournalPassagePlan: PassagePlan = {
  key: 'gardenJournal',
  passageId: contextCavernAcademicWordWorkshopPassageIds.gardenJournal.passageId,
  title: 'A Garden Journal for Plant Changes',
  readingContext: 'A garden journal helps students talk about plant changes.',
  sectionHeadings: ['Describing the Plants', 'Sorting the Notes'],
  sentences: [
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.gardenJournal[0], text: 'The garden journal helped the class track plant changes.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.gardenJournal[1], text: 'Students describe the leaves by telling their color and shape.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.gardenJournal[2], text: 'The class tried to identify the plant category by looking at the stem.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.gardenJournal[3], text: 'The notebook gave the group a place to keep their notes.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.gardenJournal[4], text: 'They measure the sprouts with a ruler each Friday.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.gardenJournal[5], text: 'The group put the small plants in one category.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.gardenJournal[6], text: 'The journal gave the class one place to keep their notes.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.gardenJournal[7], text: 'The plants looked different as the days passed.' },
  ],
  targetPlans: [
    { word: 'describe', sentenceIndex: 1 },
    { word: 'identify', sentenceIndex: 2 },
    { word: 'measure', sentenceIndex: 4 },
    { word: 'category', sentenceIndex: 5 },
  ],
}

const plantReportPassagePlan: PassagePlan = {
  key: 'plantReport',
  passageId: contextCavernAcademicWordWorkshopPassageIds.plantReport.passageId,
  title: 'A Plant Report About Growth',
  readingContext: 'A plant report shows what happened after watering a garden.',
  sectionHeadings: ['Watching the Plants', 'What the Report Showed'],
  sentences: [
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.plantReport[0], text: 'The class wrote a short plant report after watering the garden.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.plantReport[1], text: 'Students explain why the leaves looked brighter after the rain.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.plantReport[2], text: 'They observe the stems before and after the watering.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.plantReport[3], text: 'The teacher asked them to predict what might happen next week.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.plantReport[4], text: 'The result was a taller plant with more green leaves.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.plantReport[5], text: 'The class shared the report aloud and pointed to the picture.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.plantReport[6], text: 'Everyone could see the change clearly.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.plantReport[7], text: 'The notes helped the group talk about the plant growth.' },
  ],
  targetPlans: [
    { word: 'explain', sentenceIndex: 1 },
    { word: 'observe', sentenceIndex: 2 },
    { word: 'predict', sentenceIndex: 3 },
    { word: 'result', sentenceIndex: 4 },
  ],
}

const libraryPreviewPassagePlan: PassagePlan = {
  key: 'libraryPreview',
  passageId: contextCavernAcademicWordWorkshopPassageIds.libraryPreview.passageId,
  title: 'A Library Preview Table',
  readingContext: 'A preview table helps students choose books and talk about them.',
  sectionHeadings: ['Looking at Book Covers', 'Talking About Books'],
  sentences: [
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.libraryPreview[0], text: 'The class visited the library preview table before story time.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.libraryPreview[1], text: 'Students identify the book category by looking at the cover.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.libraryPreview[2], text: 'A reader can predict the kind of ending after reading the first page.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.libraryPreview[3], text: 'The librarian gave an example of a note card from a book talk.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.libraryPreview[4], text: 'One detail on the page told readers the hero was nervous.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.libraryPreview[5], text: 'The class used the words in a short book review.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.libraryPreview[6], text: 'The preview table made it easier to choose a book.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.libraryPreview[7], text: 'A bright sign showed new and favorite books.' },
  ],
  targetPlans: [
    { word: 'identify', sentenceIndex: 1 },
    { word: 'predict', sentenceIndex: 2 },
    { word: 'example', sentenceIndex: 3 },
    { word: 'detail', sentenceIndex: 4 },
  ],
}

const natureWalkPassagePlan: PassagePlan = {
  key: 'natureWalk',
  passageId: contextCavernAcademicWordWorkshopPassageIds.natureWalk.passageId,
  title: 'A Nature Walk at the Pond',
  readingContext: 'A nature walk helps students notice and measure changes.',
  sectionHeadings: ['Observing the Path', 'Keeping Track'],
  sentences: [
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.natureWalk[0], text: 'The nature club followed a walk to a small pond.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.natureWalk[1], text: 'Students observe the birds and the water along the path.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.natureWalk[2], text: 'They reason that the ducks stay near the reeds for shelter.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.natureWalk[3], text: 'The group used a sequence strip to show the path steps.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.natureWalk[4], text: 'The class will measure the puddle depth with a stick.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.natureWalk[5], text: 'A map showed the trail, the pond, and the reeds.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.natureWalk[6], text: 'The notes helped the club share the walk in order.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.natureWalk[7], text: 'The trail made the walk easy to follow.' },
  ],
  targetPlans: [
    { word: 'observe', sentenceIndex: 1 },
    { word: 'reason', sentenceIndex: 2 },
    { word: 'sequence', sentenceIndex: 3 },
    { word: 'measure', sentenceIndex: 4 },
  ],
}

const sortingGuidePassagePlan: PassagePlan = {
  key: 'sortingGuide',
  passageId: contextCavernAcademicWordWorkshopPassageIds.sortingGuide.passageId,
  title: 'A Sorting Guide for Classroom Supplies',
  readingContext: 'A sorting guide helps students clean up classroom supplies.',
  sectionHeadings: ['Reasoning About Bins', 'Using the Guide'],
  sentences: [
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.sortingGuide[0], text: 'The class used a sorting guide for classroom supplies.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.sortingGuide[1], text: 'Students reason that pencils and crayons belong in different bins.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.sortingGuide[2], text: 'They record the items on a chart after each cleanup.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.sortingGuide[3], text: 'The chart used one category for art supplies.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.sortingGuide[4], text: 'One detail on the guide showed a picture of a pencil.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.sortingGuide[5], text: 'The helper folder kept the guide near the shelf.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.sortingGuide[6], text: 'The class used the guide during cleanup time.' },
    { sentenceId: contextCavernAcademicWordWorkshopSentenceIds.sortingGuide[7], text: 'The bins stayed neat after every cleanup.' },
  ],
  targetPlans: [
    { word: 'reason', sentenceIndex: 1 },
    { word: 'record', sentenceIndex: 2 },
    { word: 'category', sentenceIndex: 3 },
    { word: 'detail', sentenceIndex: 4 },
  ],
}

const weatherChartsArtifact = buildPassageArtifact(weatherChartsPassagePlan)
const researchNotesArtifact = buildPassageArtifact(researchNotesPassagePlan)
const gardenJournalArtifact = buildPassageArtifact(gardenJournalPassagePlan)
const plantReportArtifact = buildPassageArtifact(plantReportPassagePlan)
const libraryPreviewArtifact = buildPassageArtifact(libraryPreviewPassagePlan)
const natureWalkArtifact = buildPassageArtifact(natureWalkPassagePlan)
const sortingGuideArtifact = buildPassageArtifact(sortingGuidePassagePlan)

const academicWordWorkshopLessons = [
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.prereqCompareDescribe,
    worldId: contextCavernAcademicWordWorkshopWorldId,
    unitId: contextCavernAcademicWordWorkshopUnitId,
    activityId: 'activity-cc-aww-prereq-compare-describe',
    difficulty: 0,
    passageIdentifiers: [weatherChartsArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernAcademicWordWorkshopQuestionIds.prereqCompareDescribe,
    lessonTitle: 'Compare and Describe',
    lessonObjective: 'Use compare and describe when speaking and writing about charts.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Academic words help us talk and write',
      explanation:
        'Academic words are useful across subjects. They help students talk, write, and explain ideas in school work.',
      examples: [
        'A student can compare two charts in science.',
        'A student can describe a picture in art.',
        'A student can give an example in writing.',
      ],
      contrast: 'Use the word for the school job it fits best, not just for a topic name.',
      learnerCue: 'Choose the word that does the school job best.',
    },
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.prereqExplainRecord,
    worldId: contextCavernAcademicWordWorkshopWorldId,
    unitId: contextCavernAcademicWordWorkshopUnitId,
    activityId: 'activity-cc-aww-prereq-explain-record',
    difficulty: 0,
    passageIdentifiers: [researchNotesArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernAcademicWordWorkshopQuestionIds.prereqExplainRecord,
    lessonTitle: 'Explain and Record',
    lessonObjective: 'Use explain, sequence, and record when speaking and writing about notes.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Words can work across subjects',
      explanation:
        'A good academic word can help in science, math, reading, or writing. The same word can fit more than one subject.',
      examples: [
        'A student can explain why a jar needed more water.',
        'A student can sequence the steps in a process.',
        'A student can record notes in a book.',
      ],
      contrast: 'Do not pick a word that only names the topic.',
      learnerCue: 'Think about the school job the word does.',
    },
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.guidedIdentifyMeasure,
    worldId: contextCavernAcademicWordWorkshopWorldId,
    unitId: contextCavernAcademicWordWorkshopUnitId,
    activityId: 'activity-cc-aww-guided-identify-measure',
    difficulty: 1,
    passageIdentifiers: [gardenJournalArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernAcademicWordWorkshopQuestionIds.guidedIdentifyMeasure,
    lessonTitle: 'Identify and Measure',
    lessonObjective: 'Use identify, measure, and category when talking about a garden journal.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Look for the word that fits the job',
      explanation:
        'When students identify, measure, or group ideas, they use academic vocabulary to say exactly what the work does.',
      examples: [
        'A student can identify the plant category.',
        'A student can measure the sprouts with a ruler.',
        'A student can tell a classmate what category a book belongs in.',
      ],
      contrast: 'The best word should sound like a school word the class can use again.',
      learnerCue: 'Ask what the word helps the student do.',
    },
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.guidedObservePredict,
    worldId: contextCavernAcademicWordWorkshopWorldId,
    unitId: contextCavernAcademicWordWorkshopUnitId,
    activityId: 'activity-cc-aww-guided-observe-predict',
    difficulty: 1,
    passageIdentifiers: [plantReportArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernAcademicWordWorkshopQuestionIds.guidedObservePredict,
    lessonTitle: 'Observe and Predict',
    lessonObjective: 'Use explain, observe, predict, and result when talking and writing about plant growth.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Use the word that matches the sentence job',
      explanation:
        'Academic words help students say what they are doing in a science or reading task. They can observe, predict, and explain their ideas clearly.',
      examples: [
        'A student can observe the stems before watering.',
        'A student can predict what might happen next week.',
        'A student can talk about the result after the change.',
      ],
      contrast: 'The word should fit the sentence and the subject.',
      learnerCue: 'Choose the word that fits the speaking or writing job.',
    },
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.checkpointA,
    worldId: contextCavernAcademicWordWorkshopWorldId,
    unitId: contextCavernAcademicWordWorkshopUnitId,
    activityId: 'activity-cc-aww-checkpoint-a',
    difficulty: 1,
    passageIdentifiers: [
      libraryPreviewArtifact.passage.passageIdentifier,
      natureWalkArtifact.passage.passageIdentifier,
      sortingGuideArtifact.passage.passageIdentifier,
    ],
    questionIdentifiers: contextCavernAcademicWordWorkshopQuestionIds.checkpointA,
    lessonTitle: 'Academic Word Workshop Checkpoint A',
    lessonObjective: 'Show independent use of academic words across subjects.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.checkpointB,
    worldId: contextCavernAcademicWordWorkshopWorldId,
    unitId: contextCavernAcademicWordWorkshopUnitId,
    activityId: 'activity-cc-aww-checkpoint-b',
    difficulty: 1,
    passageIdentifiers: [
      weatherChartsArtifact.passage.passageIdentifier,
      researchNotesArtifact.passage.passageIdentifier,
      gardenJournalArtifact.passage.passageIdentifier,
    ],
    questionIdentifiers: contextCavernAcademicWordWorkshopQuestionIds.checkpointB,
    lessonTitle: 'Academic Word Workshop Checkpoint B',
    lessonObjective: 'Show independent use of academic words across subjects.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.checkpointC,
    worldId: contextCavernAcademicWordWorkshopWorldId,
    unitId: contextCavernAcademicWordWorkshopUnitId,
    activityId: 'activity-cc-aww-checkpoint-c',
    difficulty: 1,
    passageIdentifiers: [
      plantReportArtifact.passage.passageIdentifier,
      libraryPreviewArtifact.passage.passageIdentifier,
      natureWalkArtifact.passage.passageIdentifier,
    ],
    questionIdentifiers: contextCavernAcademicWordWorkshopQuestionIds.checkpointC,
    lessonTitle: 'Academic Word Workshop Checkpoint C',
    lessonObjective: 'Show independent use of academic words across subjects.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
] satisfies ContentPackLesson[]

const fiveQuestionLessons = [
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.prereqCompareDescribe,
    passage: weatherChartsArtifact.passage,
    focusTargets: [weatherChartsArtifact.targets[0], weatherChartsArtifact.targets[1], weatherChartsArtifact.targets[3], weatherChartsArtifact.targets[2]],
    questionIds: contextCavernAcademicWordWorkshopQuestionIds.prereqCompareDescribe,
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.prereqExplainRecord,
    passage: researchNotesArtifact.passage,
    focusTargets: [researchNotesArtifact.targets[0], researchNotesArtifact.targets[1], researchNotesArtifact.targets[2], researchNotesArtifact.targets[3]],
    questionIds: contextCavernAcademicWordWorkshopQuestionIds.prereqExplainRecord,
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.guidedIdentifyMeasure,
    passage: gardenJournalArtifact.passage,
    focusTargets: [gardenJournalArtifact.targets[0], gardenJournalArtifact.targets[1], gardenJournalArtifact.targets[2], gardenJournalArtifact.targets[3]],
    questionIds: contextCavernAcademicWordWorkshopQuestionIds.guidedIdentifyMeasure,
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.guidedObservePredict,
    passage: plantReportArtifact.passage,
    focusTargets: [plantReportArtifact.targets[0], plantReportArtifact.targets[1], plantReportArtifact.targets[2], plantReportArtifact.targets[3]],
    questionIds: contextCavernAcademicWordWorkshopQuestionIds.guidedObservePredict,
  },
]

const checkpointLessons = [
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.checkpointA,
    passage: libraryPreviewArtifact.passage,
    focusTargets: [libraryPreviewArtifact.targets[0], libraryPreviewArtifact.targets[1], libraryPreviewArtifact.targets[2], libraryPreviewArtifact.targets[3]],
    questionIds: contextCavernAcademicWordWorkshopQuestionIds.checkpointA,
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.checkpointB,
    passage: weatherChartsArtifact.passage,
    focusTargets: [weatherChartsArtifact.targets[0], weatherChartsArtifact.targets[1], weatherChartsArtifact.targets[2], weatherChartsArtifact.targets[3]],
    questionIds: contextCavernAcademicWordWorkshopQuestionIds.checkpointB,
  },
  {
    lessonId: contextCavernAcademicWordWorkshopLessonIds.checkpointC,
    passage: plantReportArtifact.passage,
    focusTargets: [plantReportArtifact.targets[0], plantReportArtifact.targets[1], plantReportArtifact.targets[2], plantReportArtifact.targets[3]],
    questionIds: contextCavernAcademicWordWorkshopQuestionIds.checkpointC,
  },
]

const academicWordWorkshopQuestions = [
  ...fiveQuestionLessons.flatMap((lesson) => buildFiveQuestionLessonQuestions(lesson.lessonId, lesson.passage, lesson.focusTargets, lesson.questionIds)),
  ...checkpointLessons.flatMap((lesson) => buildCheckpointQuestions(lesson.lessonId, lesson.passage, lesson.focusTargets, lesson.questionIds)),
]

const academicWordWorkshopPassages = [
  weatherChartsArtifact.passage,
  researchNotesArtifact.passage,
  gardenJournalArtifact.passage,
  plantReportArtifact.passage,
  libraryPreviewArtifact.passage,
  natureWalkArtifact.passage,
  sortingGuideArtifact.passage,
]

const academicVocabularyGuides = [
  weatherChartsArtifact.guide,
  researchNotesArtifact.guide,
  gardenJournalArtifact.guide,
  plantReportArtifact.guide,
  libraryPreviewArtifact.guide,
  natureWalkArtifact.guide,
  sortingGuideArtifact.guide,
]

const academicWordWorkshopLessonIds = academicWordWorkshopLessons.map((lesson) => lesson.lessonId)
const academicWordWorkshopPassageIds = academicWordWorkshopPassages.map((passage) => passage.passageIdentifier)
const academicWordWorkshopQuestionIds = academicWordWorkshopQuestions.map((question) => question.questionIdentifier)

export const grade2ContextCavernAcademicWordWorkshopPack: ContentPack = {
  manifest: {
    packId: contextCavernAcademicWordWorkshopPackId,
    packTitle: 'Grade 2 Context Cavern: Academic Word Workshop',
    gradeBand: 2,
    worldId: contextCavernAcademicWordWorkshopWorldId,
    unitId: contextCavernAcademicWordWorkshopUnitId,
    primarySkillId: contextCavernAcademicWordWorkshopPrimarySkillId,
    benchmarkReferences: ['ELA.2.V.1.1'],
    partialBenchmarkCoverage: 'Grade 2 academic vocabulary use in speaking and writing contexts across science, math, reading, and social studies, without microphone or open-response scoring',
    difficultyRange: [0, 1],
    contentVersion: contextCavernAcademicWordWorkshopContentVersion,
    reviewStatus: 'DRAFT',
    coverageKind: 'benchmark',
    lessonIds: academicWordWorkshopLessonIds,
    passageIds: academicWordWorkshopPassageIds,
    questionIds: academicWordWorkshopQuestionIds,
    coveredPatterns: [
      'academic-vocabulary-use',
      'speaking-vocabulary-use',
      'writing-vocabulary-use',
      'cross-subject-vocabulary-use',
    ],
  },
  passages: academicWordWorkshopPassages,
  questions: academicWordWorkshopQuestions,
  lessons: academicWordWorkshopLessons,
  academicVocabularyGuides,
}

export { academicWordWorkshopPassages, academicVocabularyGuides, academicWordWorkshopQuestions, academicWordWorkshopLessons }
