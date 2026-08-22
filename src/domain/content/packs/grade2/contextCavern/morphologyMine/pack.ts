import type { Passage, WordSupportTarget } from '../../../../types'
import type { InformationalHeadingFeature, InformationalSection, InformationalTitleFeature } from '../../../../informationalTypes'
import type {
  ContentPack,
  ContentPackLesson,
  MorphologyAffixAnalysis,
  MorphologyGuide,
  MorphologyTarget,
} from '../../../contentPackTypes'
import {
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
  createTwoPartQuestion,
  lessonChoice as choice,
} from './questionFactories'
import {
  contextCavernMorphologyMineContentVersion,
  contextCavernMorphologyMineLessonIds,
  contextCavernMorphologyMinePackId,
  contextCavernMorphologyMinePassageIds,
  contextCavernMorphologyMinePrimarySkillId,
  contextCavernMorphologyMineQuestionIds,
  contextCavernMorphologyMineSentenceIds,
  contextCavernMorphologyMineUnitId,
  contextCavernMorphologyMineWorldId,
} from './ids'

type Sentence = {
  sentenceId: string
  text: string
}

type TargetPlan = {
  word: WordKey
  sentenceIndex: number
}

type QuestionMeta = {
  benchmarkReference: 'ELA.2.V.1.2'
  skillIdentifier: 'g2-context-cavern-vocabulary'
  reportingCategory: 'Vocabulary'
  genre: 'informational'
  gradeBand: 2
  estimatedReadingLevel: 'Grade 2'
  contentVersion: string
  reviewStatus: 'DRAFT'
  difficulty: 1 | 2
  passageIdentifier: string
  lessonIdentifier: string
  questionIdentifier: string
  prompt: string
  explanation: string
  evidenceReference: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  soundOutChunks: string[]
  tags: string[]
}

type PassagePlan = {
  key: keyof typeof contextCavernMorphologyMinePassageIds
  passageId: string
  title: string
  readingContext: string
  sectionHeadings: [string, string] | [string, string, string]
  sentences: Sentence[]
  targetPlans: readonly TargetPlan[]
}

type TargetSpec = {
  word: WordKey
  sentenceId: string
  sentenceText: string
}

type PassageArtifact = {
  passage: Passage
  guide: MorphologyGuide
  targets: MorphologyTarget[]
  targetSpecs: TargetSpec[]
}

type WordKey = keyof typeof WORD_INFO

const morphologyTags = [
  'base-words',
  'affixes',
  'base-word-identification',
  'base-word-meaning',
  'prefix-identification',
  'suffix-identification',
  'affix-meaning',
  'word-meaning-from-parts',
  'affix-changes-meaning',
  'word-building-for-meaning',
  'transparent-word-composition',
  'prefix-un',
  'prefix-re',
  'prefix-pre',
  'prefix-dis',
  'prefix-mis',
  'suffix-s-es',
  'suffix-ed',
  'suffix-ing',
  'suffix-er-est',
  'suffix-ful-less',
  'suffix-ly',
] as const

const WORD_INFO: Record<string, {
  baseWord: string
  baseMeaning: string
  affix: MorphologyAffixAnalysis
  composedMeaning: string
  splitIndex: number
}> = {
  unpack: {
    baseWord: 'pack',
    baseMeaning: 'to gather things into a bundle or bag.',
    affix: {
      affixId: 'affix-un',
      kind: 'prefix',
      surfaceForm: 'un',
      displayLabel: 'prefix un-',
      commonMeaning: 'not or opposite of.',
    },
    composedMeaning: 'take something out of a pack or undo packing.',
    splitIndex: 2,
  },
  rebuild: {
    baseWord: 'build',
    baseMeaning: 'to make something by putting parts together.',
    affix: {
      affixId: 'affix-re',
      kind: 'prefix',
      surfaceForm: 're',
      displayLabel: 'prefix re-',
      commonMeaning: 'again.',
    },
    composedMeaning: 'build again.',
    splitIndex: 2,
  },
  preheat: {
    baseWord: 'heat',
    baseMeaning: 'to make something warm.',
    affix: {
      affixId: 'affix-pre',
      kind: 'prefix',
      surfaceForm: 'pre',
      displayLabel: 'prefix pre-',
      commonMeaning: 'before.',
    },
    composedMeaning: 'heat before doing something else.',
    splitIndex: 3,
  },
  disagree: {
    baseWord: 'agree',
    baseMeaning: 'to think the same way or say yes.',
    affix: {
      affixId: 'affix-dis',
      kind: 'prefix',
      surfaceForm: 'dis',
      displayLabel: 'prefix dis-',
      commonMeaning: 'not or opposite of.',
    },
    composedMeaning: 'not agree.',
    splitIndex: 3,
  },
  miscount: {
    baseWord: 'count',
    baseMeaning: 'to say or keep track of numbers.',
    affix: {
      affixId: 'affix-mis',
      kind: 'prefix',
      surfaceForm: 'mis',
      displayLabel: 'prefix mis-',
      commonMeaning: 'wrongly or incorrectly.',
    },
    composedMeaning: 'count wrongly.',
    splitIndex: 3,
  },
  plants: {
    baseWord: 'plant',
    baseMeaning: 'a living thing that grows from soil.',
    affix: {
      affixId: 'affix-s',
      kind: 'suffix',
      surfaceForm: 's',
      displayLabel: 'suffix -s',
      commonMeaning: 'more than one.',
    },
    composedMeaning: 'more than one plant.',
    splitIndex: 5,
  },
  boxes: {
    baseWord: 'box',
    baseMeaning: 'a container with sides and a lid or open top.',
    affix: {
      affixId: 'affix-es',
      kind: 'suffix',
      surfaceForm: 'es',
      displayLabel: 'suffix -es',
      commonMeaning: 'more than one.',
    },
    composedMeaning: 'more than one box.',
    splitIndex: 3,
  },
  helped: {
    baseWord: 'help',
    baseMeaning: 'to give aid or make something easier.',
    affix: {
      affixId: 'affix-ed',
      kind: 'suffix',
      surfaceForm: 'ed',
      displayLabel: 'suffix -ed',
      commonMeaning: 'the action already happened.',
    },
    composedMeaning: 'help already happened.',
    splitIndex: 4,
  },
  helping: {
    baseWord: 'help',
    baseMeaning: 'to give aid or make something easier.',
    affix: {
      affixId: 'affix-ing',
      kind: 'suffix',
      surfaceForm: 'ing',
      displayLabel: 'suffix -ing',
      commonMeaning: 'the action is happening or continuing.',
    },
    composedMeaning: 'helping is happening now.',
    splitIndex: 4,
  },
  faster: {
    baseWord: 'fast',
    baseMeaning: 'moving with speed.',
    affix: {
      affixId: 'affix-er',
      kind: 'suffix',
      surfaceForm: 'er',
      displayLabel: 'suffix -er',
      commonMeaning: 'more, when comparing two.',
    },
    composedMeaning: 'more fast when comparing two things.',
    splitIndex: 4,
  },
  tallest: {
    baseWord: 'tall',
    baseMeaning: 'having a lot of height.',
    affix: {
      affixId: 'affix-est',
      kind: 'suffix',
      surfaceForm: 'est',
      displayLabel: 'suffix -est',
      commonMeaning: 'most, when comparing three or more.',
    },
    composedMeaning: 'most tall.',
    splitIndex: 4,
  },
  helpful: {
    baseWord: 'help',
    baseMeaning: 'to give aid or make something easier.',
    affix: {
      affixId: 'affix-ful',
      kind: 'suffix',
      surfaceForm: 'ful',
      displayLabel: 'suffix -ful',
      commonMeaning: 'full of.',
    },
    composedMeaning: 'full of help.',
    splitIndex: 4,
  },
  careless: {
    baseWord: 'care',
    baseMeaning: 'to be careful or pay attention.',
    affix: {
      affixId: 'affix-less',
      kind: 'suffix',
      surfaceForm: 'less',
      displayLabel: 'suffix -less',
      commonMeaning: 'without.',
    },
    composedMeaning: 'without care.',
    splitIndex: 4,
  },
  slowly: {
    baseWord: 'slow',
    baseMeaning: 'not fast.',
    affix: {
      affixId: 'affix-ly',
      kind: 'suffix',
      surfaceForm: 'ly',
      displayLabel: 'suffix -ly',
      commonMeaning: 'in a particular way.',
    },
    composedMeaning: 'in a slow way.',
    splitIndex: 4,
  },
}

const createTitle = (featureId: string, text: string): InformationalTitleFeature => ({ featureId, kind: 'title', text })
const createHeading = (featureId: string, sectionId: string, text: string): InformationalHeadingFeature => ({
  featureId,
  kind: 'heading',
  sectionId,
  text,
})

function rotate<T>(items: readonly T[], startIndex: number): T[] {
  const normalized = startIndex % items.length
  return [...items.slice(normalized), ...items.slice(0, normalized)]
}

function makeSupportTarget(
  passageId: string,
  sentenceId: string,
  sentenceText: string,
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
    contentVersion: contextCavernMorphologyMineContentVersion,
  }
}

function buildPassageArtifact(plan: PassagePlan): PassageArtifact {
  const passageIds = contextCavernMorphologyMinePassageIds[plan.key]
  const sentenceById = new Map(plan.sentences.map((sentence) => [sentence.sentenceId, sentence] as const))
  const targetSpecs = plan.targetPlans.map((targetPlan) => {
    const sentence = plan.sentences[targetPlan.sentenceIndex]
    return {
      word: targetPlan.word,
      sentenceId: sentence.sentenceId,
      sentenceText: sentence.text,
    } satisfies TargetSpec
  })
  const sectionCount = plan.sectionHeadings.length
  const sentenceGroups = sectionCount === 2
    ? [
        plan.sentences.slice(0, 4),
        plan.sentences.slice(4),
      ]
    : [
        plan.sentences.slice(0, 3),
        plan.sentences.slice(3, 6),
        plan.sentences.slice(6),
      ]

  const passage: Passage = {
    passageIdentifier: plan.passageId,
    gradeBand: 2,
    contentKind: 'informational',
    passageText: plan.sentences.map((sentence) => sentence.text).join(' '),
    sentences: plan.sentences.map((sentence) => ({ ...sentence })),
    informationalStructure: {
      titleFeatureId: passageIds.titleFeatureId,
      sections: sentenceGroups.map((group, index) => ({
        sectionId: `${plan.key}-section-${index + 1}`,
        headingFeatureId: passageIds.headingFeatureIds[index],
        sentenceIds: group.map((sentence) => sentence.sentenceId),
        featureIds: [],
      })) satisfies InformationalSection[],
      features: [
        createTitle(passageIds.titleFeatureId, plan.title),
        ...passageIds.headingFeatureIds.map((featureId, index) =>
          createHeading(featureId, `${plan.key}-section-${index + 1}`, plan.sectionHeadings[index]),
        ),
      ],
    },
    readingContext: plan.readingContext,
    contentVersion: contextCavernMorphologyMineContentVersion,
    reviewStatus: 'DRAFT',
    wordSupportTargets: targetSpecs.map((targetSpec) => {
      const info = WORD_INFO[targetSpec.word]
      return makeSupportTarget(
        plan.passageId,
        targetSpec.sentenceId,
        sentenceById.get(targetSpec.sentenceId)!.text,
        targetSpec.word,
        info.splitIndex,
      )
    }),
  }

  const guide: MorphologyGuide = {
    passageId: plan.passageId,
    targets: targetSpecs.map((targetSpec) => {
      const info = WORD_INFO[targetSpec.word]
      return {
        targetId: `${plan.passageId}-${targetSpec.word}`,
        surfaceWord: targetSpec.word,
        sentenceId: targetSpec.sentenceId,
        baseWord: info.baseWord,
        baseMeaning: info.baseMeaning,
        affixes: [{ ...info.affix }],
        composedMeaning: info.composedMeaning,
        transparentComposition: true,
      } satisfies MorphologyTarget
    }),
    reviewStatus: 'DRAFT',
    contentVersion: contextCavernMorphologyMineContentVersion,
  }

  return {
    passage,
    guide,
    targets: guide.targets,
    targetSpecs,
  }
}

function buildQuestionMeta(params: {
  lessonId: string
  passageId: string
  questionId: string
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  difficulty: 1 | 2
  tags: string[]
}): QuestionMeta {
  return {
    benchmarkReference: 'ELA.2.V.1.2',
    skillIdentifier: contextCavernMorphologyMinePrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernMorphologyMineContentVersion,
    reviewStatus: 'DRAFT',
    difficulty: params.difficulty,
    passageIdentifier: params.passageId,
    lessonIdentifier: params.lessonId,
    questionIdentifier: params.questionId,
    prompt: params.prompt,
    explanation: params.explanation,
    evidenceReference: params.evidenceReferenceIds[0],
    evidenceReferenceIds: [...params.evidenceReferenceIds],
    targetVocabulary: [...params.targetVocabulary],
    soundOutChunks: [...params.targetVocabulary],
    tags: [...params.tags],
  }
}

function makeMultipleChoiceQuestion(params: {
  lessonId: string
  passageId: string
  questionId: string
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  difficulty: 1 | 2
  tags: string[]
  correctText: string
  distractorTexts: [string, string, string]
  correctIndex: number
}) {
  const choices = rotate(
    [
      choice(`${params.questionId}-choice-1`, params.correctText),
      choice(`${params.questionId}-choice-2`, params.distractorTexts[0]),
      choice(`${params.questionId}-choice-3`, params.distractorTexts[1]),
      choice(`${params.questionId}-choice-4`, params.distractorTexts[2]),
    ],
    params.correctIndex,
  )
  return createMultipleChoiceQuestion({
    ...buildQuestionMeta(params),
    choices,
    correctChoiceIds: [choices.find((item) => item.text === params.correctText)!.id],
  })
}

function makeMultiselectQuestion(params: {
  lessonId: string
  passageId: string
  questionId: string
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  difficulty: 1 | 2
  tags: string[]
  choiceTexts: string[]
  correctChoiceTexts: string[]
  correctIndex: number
}) {
  const choices = rotate(
    params.choiceTexts.map((text, index) => choice(`${params.questionId}-choice-${index + 1}`, text)),
    params.correctIndex,
  )
  return createMultiselectQuestion({
    ...buildQuestionMeta(params),
    choices,
    correctChoiceIds: params.correctChoiceTexts.map((text) => choices.find((item) => item.text === text)!.id),
  })
}

function makeHotTextQuestion(params: {
  lessonId: string
  passageId: string
  questionId: string
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  difficulty: 1 | 2
  tags: string[]
  segmentTexts: string[]
  correctSegmentText: string
  correctIndex: number
}) {
  const selectableSegments = rotate(
    params.segmentTexts.map((text, index) => ({ id: `${params.questionId}-segment-${index + 1}`, text })),
    params.correctIndex,
  )
  return createHotTextQuestion({
    ...buildQuestionMeta(params),
    selectableSegments,
    correctSegmentIds: [selectableSegments.find((segment) => segment.text === params.correctSegmentText)!.id],
  })
}

function makeTableMatchQuestion(params: {
  lessonId: string
  passageId: string
  questionId: string
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  difficulty: 1 | 2
  tags: string[]
  rows: {
    prompt: string
    correctChoiceText: string
    optionTexts: [string, string, string, string]
  }[]
}) {
  const rows = params.rows.map((row, rowIndex) => {
    const options = rotate(
      row.optionTexts.map((text, optionIndex) => choice(`${params.questionId}-row-${rowIndex + 1}-choice-${optionIndex + 1}`, text)),
      rowIndex % 4,
    )
    return {
      id: `${params.questionId}-row-${rowIndex + 1}`,
      prompt: row.prompt,
      correctChoiceId: options.find((item) => item.text === row.correctChoiceText)!.id,
      options,
    }
  })
  return createTableMatchQuestion({
    ...buildQuestionMeta(params),
    rows,
  })
}

function makeTwoPartQuestion(params: {
  lessonId: string
  passageId: string
  questionId: string
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  difficulty: 1 | 2
  tags: string[]
  partAPrompt: string
  partAChoices: string[]
  partACorrectChoiceText: string
  partAPosition: number
  partBPrompt: string
  partBChoices: string[]
  partBCorrectChoiceText: string
  partBPosition: number
}) {
  const partAChoices = rotate(
    params.partAChoices.map((text, index) => choice(`${params.questionId}-part-a-${index + 1}`, text)),
    params.partAPosition,
  )
  const partBChoices = rotate(
    params.partBChoices.map((text, index) => choice(`${params.questionId}-part-b-${index + 1}`, text)),
    params.partBPosition,
  )
  return createTwoPartQuestion({
    ...buildQuestionMeta(params),
    partAPrompt: params.partAPrompt,
    partAChoices,
    partACorrectChoiceId: partAChoices.find((item) => item.text === params.partACorrectChoiceText)!.id,
    partBPrompt: params.partBPrompt,
    partBChoices,
    partBCorrectChoiceId: partBChoices.find((item) => item.text === params.partBCorrectChoiceText)!.id,
  })
}

const unpackSupplyCartPlan: PassagePlan = {
  key: 'unpackSupplyCart',
  passageId: contextCavernMorphologyMinePassageIds.unpackSupplyCart.passageId,
  title: 'Unpack the Supply Cart',
  readingContext: 'The class uses unpack to get ready for the walk.',
  sectionHeadings: ['Getting Ready', 'Finishing the Cart'],
  sentences: [
    { sentenceId: contextCavernMorphologyMineSentenceIds.unpackSupplyCart[0], text: 'The class had to unpack the supply cart before the walk.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.unpackSupplyCart[1], text: 'A faster checklist showed where each bag belonged.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.unpackSupplyCart[2], text: 'One helper kept helping the others reach the shelves.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.unpackSupplyCart[3], text: 'The students moved slowly so the cups would stay steady.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.unpackSupplyCart[4], text: 'The cart looked empty after the unpack step.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.unpackSupplyCart[5], text: 'A calm helper pointed to the last box.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.unpackSupplyCart[6], text: 'The group smiled when the cart was ready.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.unpackSupplyCart[7], text: 'The class could start the trail with less worry.' },
  ],
  targetPlans: [
    { word: 'unpack', sentenceIndex: 0 },
    { word: 'faster', sentenceIndex: 1 },
    { word: 'helping', sentenceIndex: 2 },
    { word: 'slowly', sentenceIndex: 3 },
  ],
}

const rebuildPlantShelfPlan: PassagePlan = {
  key: 'rebuildPlantShelf',
  passageId: contextCavernMorphologyMinePassageIds.rebuildPlantShelf.passageId,
  title: 'Rebuild the Plant Shelf',
  readingContext: 'The garden shelf needs rebuild after a windy day.',
  sectionHeadings: ['The Damage', 'The Repair'],
  sentences: [
    { sentenceId: contextCavernMorphologyMineSentenceIds.rebuildPlantShelf[0], text: 'The garden team had to rebuild the plant shelf after a windy day.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.rebuildPlantShelf[1], text: 'The plants waited in boxes near the wall.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.rebuildPlantShelf[2], text: 'A careless bump could make the pots slide.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.rebuildPlantShelf[3], text: 'The helpers lifted each tray one at a time.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.rebuildPlantShelf[4], text: 'One student wrote the plan on a card.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.rebuildPlantShelf[5], text: 'Another student checked the labels.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.rebuildPlantShelf[6], text: 'The shelf looked stronger after the work.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.rebuildPlantShelf[7], text: 'The bright corner felt ready again.' },
  ],
  targetPlans: [
    { word: 'rebuild', sentenceIndex: 0 },
    { word: 'plants', sentenceIndex: 1 },
    { word: 'boxes', sentenceIndex: 1 },
    { word: 'careless', sentenceIndex: 2 },
  ],
}

const preheatSnackDemoPlan: PassagePlan = {
  key: 'preheatSnackDemo',
  passageId: contextCavernMorphologyMinePassageIds.preheatSnackDemo.passageId,
  title: 'Preheat the Snack Demo',
  readingContext: 'The snack demo shows what preheat means.',
  sectionHeadings: ['Before the Snack', 'The Warm Oven'],
  sentences: [
    { sentenceId: contextCavernMorphologyMineSentenceIds.preheatSnackDemo[0], text: 'The class had to preheat the small oven before the snack demo.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.preheatSnackDemo[1], text: 'A preview card showed the steps in order.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.preheatSnackDemo[2], text: 'Two students disagree about which tray should go first.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.preheatSnackDemo[3], text: 'The helpful helper covered the warm pan.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.preheatSnackDemo[4], text: 'A helper placed the tray on the counter.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.preheatSnackDemo[5], text: 'The teacher said the preheat light meant the oven was warming.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.preheatSnackDemo[6], text: 'The helper helped cover the warm pan.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.preheatSnackDemo[7], text: 'The class was ready to begin.' },
  ],
  targetPlans: [
    { word: 'preheat', sentenceIndex: 0 },
    { word: 'disagree', sentenceIndex: 2 },
    { word: 'helpful', sentenceIndex: 3 },
    { word: 'helped', sentenceIndex: 6 },
  ],
}

const toolShelfSortPlan: PassagePlan = {
  key: 'toolShelfSort',
  passageId: contextCavernMorphologyMinePassageIds.toolShelfSort.passageId,
  title: 'Sort the Tool Shelf',
  readingContext: 'The class sorts tools and notices how word parts change meaning.',
  sectionHeadings: ['Counting the Supplies', 'Sorting the Shelf', 'Checking the Plan'],
  sentences: [
    { sentenceId: contextCavernMorphologyMineSentenceIds.toolShelfSort[0], text: 'The helper could miscount the small sticky notes at first.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.toolShelfSort[1], text: 'The tallest box stood beside the shelf.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.toolShelfSort[2], text: 'The plants for the window sat in a tray.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.toolShelfSort[3], text: 'The notes slowly moved into the right bin.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.toolShelfSort[4], text: 'A second helper checked the count again.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.toolShelfSort[5], text: 'The shelves looked neat after the sort.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.toolShelfSort[6], text: 'The class had a clear spot for each item.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.toolShelfSort[7], text: 'Everyone could see the tidy shelf.' },
  ],
  targetPlans: [
    { word: 'miscount', sentenceIndex: 0 },
    { word: 'tallest', sentenceIndex: 1 },
    { word: 'plants', sentenceIndex: 2 },
    { word: 'slowly', sentenceIndex: 3 },
  ],
}

const kitchenCrewPracticePlan: PassagePlan = {
  key: 'kitchenCrewPractice',
  passageId: contextCavernMorphologyMinePassageIds.kitchenCrewPractice.passageId,
  title: 'Pack the Cart Again',
  readingContext: 'The crew packs the cart again and notices prefixes and suffixes.',
  sectionHeadings: ['Starting the Reset', 'Working Together', 'Getting Ready Again'],
  sentences: [
    { sentenceId: contextCavernMorphologyMineSentenceIds.kitchenCrewPractice[0], text: 'The class could unpack the cart again after cleanup.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.kitchenCrewPractice[1], text: 'A helpful partner carried the heavy box.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.kitchenCrewPractice[2], text: 'The helpers were helping each other line up the bins.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.kitchenCrewPractice[3], text: 'Two students disagree about where the markers should go.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.kitchenCrewPractice[4], text: 'The last box stayed near the door.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.kitchenCrewPractice[5], text: 'The plan made the reset easier.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.kitchenCrewPractice[6], text: 'The group could start faster next time.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.kitchenCrewPractice[7], text: 'The cart looked calm again.' },
  ],
  targetPlans: [
    { word: 'unpack', sentenceIndex: 0 },
    { word: 'helpful', sentenceIndex: 1 },
    { word: 'helping', sentenceIndex: 2 },
    { word: 'disagree', sentenceIndex: 3 },
  ],
}

const readingTableResetPlan: PassagePlan = {
  key: 'readingTableReset',
  passageId: contextCavernMorphologyMinePassageIds.readingTableReset.passageId,
  title: 'Warm the Snack Table',
  readingContext: 'The table reset helps the class use base words and affixes to read meanings.',
  sectionHeadings: ['Preparing the Table', 'Heating the Snack', 'Checking the Result'],
  sentences: [
    { sentenceId: contextCavernMorphologyMineSentenceIds.readingTableReset[0], text: 'The class had to rebuild the snack table after lunch.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.readingTableReset[1], text: 'The teacher asked the group to preheat the little oven.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.readingTableReset[2], text: 'The cookies were helped onto the tray with tongs.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.readingTableReset[3], text: 'The careless hand left crumbs on the edge.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.readingTableReset[4], text: 'The oven beeped when it was ready.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.readingTableReset[5], text: 'The table looked smooth again.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.readingTableReset[6], text: 'The warm snack smelled good.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.readingTableReset[7], text: 'The group stayed focused.' },
  ],
  targetPlans: [
    { word: 'rebuild', sentenceIndex: 0 },
    { word: 'preheat', sentenceIndex: 1 },
    { word: 'helped', sentenceIndex: 2 },
    { word: 'careless', sentenceIndex: 3 },
  ],
}

const countAndComparePlan: PassagePlan = {
  key: 'countAndCompare',
  passageId: contextCavernMorphologyMinePassageIds.countAndCompare.passageId,
  title: 'Count and Compare',
  readingContext: 'The class counts items and compares how word parts change meaning.',
  sectionHeadings: ['Counting the Shells', 'Comparing the Piles', 'Checking the Chart'],
  sentences: [
    { sentenceId: contextCavernMorphologyMineSentenceIds.countAndCompare[0], text: 'The helper could miscount the shells if the pile moved.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.countAndCompare[1], text: 'The class checked the boxes one by one.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.countAndCompare[2], text: 'The faster team finished first.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.countAndCompare[3], text: 'The tallest cup sat beside the scale.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.countAndCompare[4], text: 'The numbers were clear after the recount.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.countAndCompare[5], text: 'The group checked every line again.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.countAndCompare[6], text: 'The chart looked neat.' },
    { sentenceId: contextCavernMorphologyMineSentenceIds.countAndCompare[7], text: 'The team smiled at the result.' },
  ],
  targetPlans: [
    { word: 'miscount', sentenceIndex: 0 },
    { word: 'boxes', sentenceIndex: 1 },
    { word: 'faster', sentenceIndex: 2 },
    { word: 'tallest', sentenceIndex: 3 },
  ],
}

const unpackSupplyCartArtifact = buildPassageArtifact(unpackSupplyCartPlan)
const rebuildPlantShelfArtifact = buildPassageArtifact(rebuildPlantShelfPlan)
const preheatSnackDemoArtifact = buildPassageArtifact(preheatSnackDemoPlan)
const toolShelfSortArtifact = buildPassageArtifact(toolShelfSortPlan)
const kitchenCrewPracticeArtifact = buildPassageArtifact(kitchenCrewPracticePlan)
const readingTableResetArtifact = buildPassageArtifact(readingTableResetPlan)
const countAndCompareArtifact = buildPassageArtifact(countAndComparePlan)

const passageArtifacts = [
  unpackSupplyCartArtifact,
  rebuildPlantShelfArtifact,
  preheatSnackDemoArtifact,
  toolShelfSortArtifact,
  kitchenCrewPracticeArtifact,
  readingTableResetArtifact,
  countAndCompareArtifact,
] as const

function buildQuestionSets() {
  const prereqFindBaseWordQuestions = [
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqFindBaseWord,
      passageId: unpackSupplyCartArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqFindBaseWord[0],
      prompt: 'What is the base word in unpack?',
      explanation: 'Pack is the base word because un- was added to it.',
      evidenceReferenceIds: [unpackSupplyCartArtifact.targets[0].sentenceId],
      targetVocabulary: ['unpack', 'pack'],
      difficulty: 1,
      tags: ['base-word-identification', 'base-words'],
      correctText: 'pack',
      distractorTexts: ['un', 'back', 'cart'],
      correctIndex: 2,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqFindBaseWord,
      passageId: unpackSupplyCartArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqFindBaseWord[1],
      prompt: 'What is the base word in faster?',
      explanation: 'Fast is the base word because -er was added to it.',
      evidenceReferenceIds: [unpackSupplyCartArtifact.targets[1].sentenceId],
      targetVocabulary: ['faster', 'fast'],
      difficulty: 1,
      tags: ['base-word-identification', 'suffix-identification'],
      correctText: 'fast',
      distractorTexts: ['slow', 'friend', 'hope'],
      correctIndex: 1,
    }),
    makeMultiselectQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqFindBaseWord,
      passageId: unpackSupplyCartArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqFindBaseWord[2],
      prompt: 'Choose two words that keep the base word help.',
      explanation: 'Helpful and helping both keep the base word help.',
      evidenceReferenceIds: [unpackSupplyCartArtifact.targets[1].sentenceId, unpackSupplyCartArtifact.targets[2].sentenceId],
      targetVocabulary: ['helpful', 'helping'],
      difficulty: 1,
      tags: ['base-word-identification', 'base-words'],
      choiceTexts: ['helpful', 'helping', 'unpack', 'slowly'],
      correctChoiceTexts: ['helpful', 'helping'],
      correctIndex: 0,
    }),
    makeHotTextQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqFindBaseWord,
      passageId: unpackSupplyCartArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqFindBaseWord[3],
      prompt: 'Which chunk is the base word in slowly?',
      explanation: 'Slow is the base word because -ly was added after it.',
      evidenceReferenceIds: [unpackSupplyCartArtifact.targets[3].sentenceId],
      targetVocabulary: ['slowly', 'slow'],
      difficulty: 1,
      tags: ['base-word-identification', 'suffix-identification'],
      segmentTexts: ['slow', 'ly', 'slowly', 'moving'],
      correctSegmentText: 'slow',
      correctIndex: 0,
    }),
    makeTableMatchQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqFindBaseWord,
      passageId: unpackSupplyCartArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqFindBaseWord[4],
      prompt: 'Match each word to the base word inside it.',
      explanation: 'Each word keeps a smaller base word that helps explain the full meaning.',
      evidenceReferenceIds: [
        unpackSupplyCartArtifact.targets[0].sentenceId,
        unpackSupplyCartArtifact.targets[1].sentenceId,
        unpackSupplyCartArtifact.targets[2].sentenceId,
        unpackSupplyCartArtifact.targets[3].sentenceId,
      ],
      targetVocabulary: ['unpack', 'faster', 'helping', 'slowly'],
      difficulty: 1,
      tags: ['base-word-identification', 'base-word-meaning', 'word-meaning-from-parts'],
      rows: [
        {
          prompt: 'unpack',
          correctChoiceText: 'pack',
          optionTexts: ['pack', 'bag', 'cart', 'supply'],
        },
        {
          prompt: 'faster',
          correctChoiceText: 'fast',
          optionTexts: ['fast', 'kind helper', 'careless choice', 'before the walk'],
        },
        {
          prompt: 'helping',
          correctChoiceText: 'help happening now',
          optionTexts: ['help happening now', 'slowly moving', 'more than one', 'build again'],
        },
        {
          prompt: 'slowly',
          correctChoiceText: 'in a slow way',
          optionTexts: ['in a slow way', 'heat before', 'count wrongly', 'most tall'],
        },
      ],
    }),
  ] as const

  const prereqMatchAffixMeaningQuestions = [
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqMatchAffixMeaning,
      passageId: rebuildPlantShelfArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqMatchAffixMeaning[0],
      prompt: 'What does re- mean in rebuild?',
      explanation: 'Re- means again, so rebuild means build again.',
      evidenceReferenceIds: [rebuildPlantShelfArtifact.targets[0].sentenceId],
      targetVocabulary: ['rebuild', 're-'],
      difficulty: 1,
      tags: ['prefix-identification', 'affix-meaning', 'prefix-re'],
      correctText: 'again',
      distractorTexts: ['before', 'without', 'more than one'],
      correctIndex: 0,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqMatchAffixMeaning,
      passageId: rebuildPlantShelfArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqMatchAffixMeaning[1],
      prompt: 'What does -less mean in careless?',
      explanation: 'Less means without, so careless means without care.',
      evidenceReferenceIds: [rebuildPlantShelfArtifact.targets[3].sentenceId],
      targetVocabulary: ['careless', '-less'],
      difficulty: 1,
      tags: ['suffix-identification', 'affix-meaning', 'suffix-ful-less'],
      correctText: 'without',
      distractorTexts: ['again', 'before', 'most'],
      correctIndex: 3,
    }),
    makeMultiselectQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqMatchAffixMeaning,
      passageId: rebuildPlantShelfArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqMatchAffixMeaning[2],
      prompt: 'Choose two words in the passage that mean more than one after the suffix is added.',
      explanation: 'Plants and boxes both use a plural suffix to mean more than one.',
      evidenceReferenceIds: [rebuildPlantShelfArtifact.targets[1].sentenceId],
      targetVocabulary: ['plants', 'boxes'],
      difficulty: 1,
      tags: ['suffix-identification', 'affix-meaning', 'suffix-s-es'],
      choiceTexts: ['plants', 'boxes', 'careless', 'rebuild'],
      correctChoiceTexts: ['plants', 'boxes'],
      correctIndex: 1,
    }),
    makeHotTextQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqMatchAffixMeaning,
      passageId: rebuildPlantShelfArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqMatchAffixMeaning[3],
      prompt: 'Which chunk is the prefix in rebuild?',
      explanation: 'Re- comes before the base word build and means again.',
      evidenceReferenceIds: [rebuildPlantShelfArtifact.targets[0].sentenceId],
      targetVocabulary: ['rebuild', 're-'],
      difficulty: 1,
      tags: ['prefix-identification', 'prefix-re'],
      segmentTexts: ['re', 'build', 'rebuild', 'again'],
      correctSegmentText: 're',
      correctIndex: 1,
    }),
    makeTableMatchQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.prereqMatchAffixMeaning,
      passageId: rebuildPlantShelfArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.prereqMatchAffixMeaning[4],
      prompt: 'Match each affix to its common meaning.',
      explanation: 'The words in the passage show how each affix changes the base word meaning.',
      evidenceReferenceIds: [
        rebuildPlantShelfArtifact.targets[0].sentenceId,
        rebuildPlantShelfArtifact.targets[1].sentenceId,
        rebuildPlantShelfArtifact.targets[2].sentenceId,
        rebuildPlantShelfArtifact.targets[3].sentenceId,
      ],
      targetVocabulary: ['re-', '-less', '-s', '-es'],
      difficulty: 1,
      tags: ['affix-meaning', 'prefix-re', 'suffix-s-es', 'suffix-ful-less'],
      rows: [
        {
          prompt: 're-',
          correctChoiceText: 'again',
          optionTexts: ['again', 'before', 'opposite', 'wrongly'],
        },
        {
          prompt: '-less',
          correctChoiceText: 'without',
          optionTexts: ['without', 'full of help', 'build again', 'more fast'],
        },
        {
          prompt: '-s',
          correctChoiceText: 'more than one plant',
          optionTexts: ['more than one plant', 'kind helper', 'slowly moving', 'heat before'],
        },
        {
          prompt: '-es',
          correctChoiceText: 'more than one box',
          optionTexts: ['more than one box', 'count wrongly', 'most tall', 'careful'],
        },
      ],
    }),
  ] as const

  const guidedPrefixesBuildMeaningsQuestions = [
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedPrefixesBuildMeanings,
      passageId: preheatSnackDemoArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedPrefixesBuildMeanings[0],
      prompt: 'What does pre- mean in preheat?',
      explanation: 'Pre- means before, so preheat means heat before the snack demo.',
      evidenceReferenceIds: [preheatSnackDemoArtifact.targets[0].sentenceId],
      targetVocabulary: ['preheat', 'pre-'],
      difficulty: 2,
      tags: ['prefix-identification', 'affix-meaning', 'prefix-pre'],
      correctText: 'before',
      distractorTexts: ['again', 'without', 'more than one'],
      correctIndex: 1,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedPrefixesBuildMeanings,
      passageId: preheatSnackDemoArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedPrefixesBuildMeanings[1],
      prompt: 'Which word means heat before the snack demo?',
      explanation: 'Preheat means heat before something starts.',
      evidenceReferenceIds: [preheatSnackDemoArtifact.targets[0].sentenceId],
      targetVocabulary: ['preheat'],
      difficulty: 2,
      tags: ['word-meaning-from-parts', 'prefix-pre', 'prefix-identification'],
      correctText: 'preheat',
      distractorTexts: ['preview', 'rebuild', 'helping'],
      correctIndex: 0,
    }),
    makeMultiselectQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedPrefixesBuildMeanings,
      passageId: preheatSnackDemoArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedPrefixesBuildMeanings[2],
      prompt: 'Choose two words in the passage that start with pre-.',
      explanation: 'Preheat and preview both start with pre-, which means before.',
      evidenceReferenceIds: [
        preheatSnackDemoArtifact.targets[0].sentenceId,
        preheatSnackDemoArtifact.passage.sentences![1].sentenceId,
      ],
      targetVocabulary: ['preheat', 'preview'],
      difficulty: 2,
      tags: ['prefix-identification', 'prefix-pre'],
      choiceTexts: ['preheat', 'preview', 'helped', 'faster'],
      correctChoiceTexts: ['preheat', 'preview'],
      correctIndex: 2,
    }),
    makeHotTextQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedPrefixesBuildMeanings,
      passageId: preheatSnackDemoArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedPrefixesBuildMeanings[3],
      prompt: 'Which chunk is the prefix in preheat?',
      explanation: 'Pre- comes before the base word heat and means before.',
      evidenceReferenceIds: [preheatSnackDemoArtifact.targets[0].sentenceId],
      targetVocabulary: ['preheat', 'pre-'],
      difficulty: 2,
      tags: ['prefix-identification', 'prefix-pre'],
      segmentTexts: ['pre', 'heat', 'preheat', 'before'],
      correctSegmentText: 'pre',
      correctIndex: 0,
    }),
    makeTableMatchQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedPrefixesBuildMeanings,
      passageId: preheatSnackDemoArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedPrefixesBuildMeanings[4],
      prompt: 'Match each word to what it means in the passage.',
      explanation: 'The passage gives clues about what the prefix and base word do together.',
      evidenceReferenceIds: [
        preheatSnackDemoArtifact.targets[0].sentenceId,
        preheatSnackDemoArtifact.passage.sentences![1].sentenceId,
        preheatSnackDemoArtifact.targets[2].sentenceId,
        preheatSnackDemoArtifact.targets[3].sentenceId,
      ],
      targetVocabulary: ['preheat', 'preview', 'helpful', 'helped'],
      difficulty: 2,
      tags: ['word-meaning-from-parts', 'prefix-pre', 'suffix-ful-less', 'suffix-ed'],
      rows: [
        {
          prompt: 'preheat',
          correctChoiceText: 'heat before the demo',
          optionTexts: ['heat before the demo', 'count wrongly', 'without care', 'more than one plant'],
        },
        {
          prompt: 'preview',
          correctChoiceText: 'look before the steps',
          optionTexts: ['look before the steps', 'build again', 'full of help', 'in a slow way'],
        },
        {
          prompt: 'helpful',
          correctChoiceText: 'full of help',
          optionTexts: ['full of help', 'before the test', 'kind helper', 'most tall'],
        },
        {
          prompt: 'helped',
          correctChoiceText: 'help already happened',
          optionTexts: ['help already happened', 'slowly moving', 'one box', 'again'],
        },
      ],
    }),
  ] as const

  const guidedSuffixesBuildMeaningsQuestions = [
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedSuffixesBuildMeanings,
      passageId: toolShelfSortArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedSuffixesBuildMeanings[0],
      prompt: 'What does -s mean in plants?',
      explanation: '-s means more than one, so plants means more than one plant.',
      evidenceReferenceIds: [toolShelfSortArtifact.targets[2].sentenceId],
      targetVocabulary: ['plants', '-s'],
      difficulty: 2,
      tags: ['suffix-identification', 'affix-meaning', 'suffix-s-es'],
      correctText: 'more than one',
      distractorTexts: ['before', 'again', 'without'],
      correctIndex: 0,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedSuffixesBuildMeanings,
      passageId: toolShelfSortArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedSuffixesBuildMeanings[1],
      prompt: 'What does -ly mean in slowly?',
      explanation: '-ly means in a particular way, so slowly means in a slow way.',
      evidenceReferenceIds: [toolShelfSortArtifact.targets[3].sentenceId],
      targetVocabulary: ['slowly', '-ly'],
      difficulty: 2,
      tags: ['suffix-identification', 'affix-meaning', 'suffix-ly'],
      correctText: 'in a particular way',
      distractorTexts: ['before', 'again', 'without'],
      correctIndex: 0,
    }),
    makeMultiselectQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedSuffixesBuildMeanings,
      passageId: toolShelfSortArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedSuffixesBuildMeanings[2],
      prompt: 'Choose two words whose suffix tells about more than one or a way of doing something.',
      explanation: 'Plants uses -s for more than one, and slowly uses -ly for a way of doing something.',
      evidenceReferenceIds: [toolShelfSortArtifact.targets[2].sentenceId, toolShelfSortArtifact.targets[3].sentenceId],
      targetVocabulary: ['plants', 'slowly'],
      difficulty: 2,
      tags: ['suffix-identification', 'suffix-s-es', 'suffix-ly'],
      choiceTexts: ['plants', 'slowly', 'miscount', 'rebuild'],
      correctChoiceTexts: ['plants', 'slowly'],
      correctIndex: 1,
    }),
    makeHotTextQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedSuffixesBuildMeanings,
      passageId: toolShelfSortArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedSuffixesBuildMeanings[3],
      prompt: 'Which chunk is the suffix in tallest?',
      explanation: '-est comes after tall and means most.',
      evidenceReferenceIds: [toolShelfSortArtifact.targets[1].sentenceId],
      targetVocabulary: ['tallest', '-est'],
      difficulty: 2,
      tags: ['suffix-identification', 'suffix-er-est'],
      segmentTexts: ['tall', 'est', 'tallest', 'most'],
      correctSegmentText: 'est',
      correctIndex: 2,
    }),
    makeTableMatchQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.guidedSuffixesBuildMeanings,
      passageId: toolShelfSortArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.guidedSuffixesBuildMeanings[4],
      prompt: 'Match each word to its meaning in the passage.',
      explanation: 'The suffix tells the reader how the word changes from the base word.',
      evidenceReferenceIds: [
        toolShelfSortArtifact.targets[0].sentenceId,
        toolShelfSortArtifact.targets[1].sentenceId,
        toolShelfSortArtifact.targets[2].sentenceId,
        toolShelfSortArtifact.targets[3].sentenceId,
      ],
      targetVocabulary: ['miscount', 'tallest', 'plants', 'slowly'],
      difficulty: 2,
      tags: ['word-meaning-from-parts', 'suffix-identification', 'suffix-ly', 'suffix-er-est', 'suffix-s-es'],
      rows: [
        {
          prompt: 'miscount',
          correctChoiceText: 'count wrongly',
          optionTexts: ['count wrongly', 'before the test', 'full of help', 'not agree'],
        },
        {
          prompt: 'tallest',
          correctChoiceText: 'most tall',
          optionTexts: ['most tall', 'build again', 'without care', 'heat before'],
        },
        {
          prompt: 'plants',
          correctChoiceText: 'more than one plant',
          optionTexts: ['more than one plant', 'kind helper', 'slowly moving', 'wrongly'],
        },
        {
          prompt: 'slowly',
          correctChoiceText: 'in a slow way',
          optionTexts: ['in a slow way', 'more fast', 'again', 'one box'],
        },
      ],
    }),
  ] as const

  const checkpointAQuestions = [
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointA,
      passageId: kitchenCrewPracticeArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointA[0],
      prompt: 'What is the base word in unpack?',
      explanation: 'Pack is the base word because un- was added before it.',
      evidenceReferenceIds: [kitchenCrewPracticeArtifact.targets[0].sentenceId],
      targetVocabulary: ['unpack', 'pack'],
      difficulty: 2,
      tags: ['base-word-identification', 'base-words', 'prefix-un'],
      correctText: 'pack',
      distractorTexts: ['un', 'cart', 'again'],
      correctIndex: 1,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointA,
      passageId: kitchenCrewPracticeArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointA[1],
      prompt: 'What does helpful mean in the passage?',
      explanation: 'Helpful means full of help because -ful was added to help.',
      evidenceReferenceIds: [kitchenCrewPracticeArtifact.targets[1].sentenceId],
      targetVocabulary: ['helpful', 'help'],
      difficulty: 2,
      tags: ['suffix-identification', 'affix-meaning', 'suffix-ful-less'],
      correctText: 'full of help',
      distractorTexts: ['without care', 'before', 'more fast'],
      correctIndex: 0,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointA,
      passageId: kitchenCrewPracticeArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointA[2],
      prompt: 'What does disagree mean in the passage?',
      explanation: 'Disagree means not agree because dis- means not or opposite of.',
      evidenceReferenceIds: [kitchenCrewPracticeArtifact.targets[3].sentenceId],
      targetVocabulary: ['disagree', 'dis-'],
      difficulty: 2,
      tags: ['prefix-identification', 'affix-meaning', 'prefix-dis'],
      correctText: 'not agree',
      distractorTexts: ['count wrongly', 'most tall', 'more than one'],
      correctIndex: 2,
    }),
    makeMultiselectQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointA,
      passageId: kitchenCrewPracticeArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointA[3],
      prompt: 'Choose two words in the passage that start with a prefix.',
      explanation: 'Unpack and disagree both begin with a prefix that changes the base word.',
      evidenceReferenceIds: [kitchenCrewPracticeArtifact.targets[0].sentenceId, kitchenCrewPracticeArtifact.targets[3].sentenceId],
      targetVocabulary: ['unpack', 'disagree'],
      difficulty: 2,
      tags: ['prefix-identification', 'word-meaning-from-parts', 'prefix-un', 'prefix-dis'],
      choiceTexts: ['unpack', 'disagree', 'helpful', 'boxes'],
      correctChoiceTexts: ['unpack', 'disagree'],
      correctIndex: 1,
    }),
    makeHotTextQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointA,
      passageId: kitchenCrewPracticeArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointA[4],
      prompt: 'Which chunk is the suffix in helping?',
      explanation: 'The suffix -ing comes after help and means the action is happening now.',
      evidenceReferenceIds: [kitchenCrewPracticeArtifact.targets[2].sentenceId],
      targetVocabulary: ['helping', '-ing'],
      difficulty: 2,
      tags: ['suffix-identification', 'suffix-ing'],
      segmentTexts: ['help', 'ing', 'helping', 'again'],
      correctSegmentText: 'ing',
      correctIndex: 1,
    }),
    makeTableMatchQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointA,
      passageId: kitchenCrewPracticeArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointA[5],
      prompt: 'Match each word to its meaning in the passage.',
      explanation: 'The full word meaning comes from the base word and the affix.',
      evidenceReferenceIds: [
        kitchenCrewPracticeArtifact.targets[0].sentenceId,
        kitchenCrewPracticeArtifact.targets[1].sentenceId,
        kitchenCrewPracticeArtifact.targets[2].sentenceId,
        kitchenCrewPracticeArtifact.targets[3].sentenceId,
      ],
      targetVocabulary: ['unpack', 'helpful', 'helping', 'disagree'],
      difficulty: 2,
      tags: [...morphologyTags],
      rows: [
        {
          prompt: 'unpack',
          correctChoiceText: 'take something out of a pack',
          optionTexts: ['take something out of a pack', 'kind helper', 'not agree', 'more than one box'],
        },
        {
          prompt: 'helpful',
          correctChoiceText: 'full of help',
          optionTexts: ['full of help', 'count wrongly', 'heat before', 'more fast'],
        },
        {
          prompt: 'helping',
          correctChoiceText: 'helping is happening now',
          optionTexts: ['helping is happening now', 'without care', 'most tall', 'before'],
        },
        {
          prompt: 'disagree',
          correctChoiceText: 'not agree',
          optionTexts: ['not agree', 'in a slow way', 'more than one plant', 'again'],
        },
      ],
    }),
    makeTwoPartQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointA,
      passageId: kitchenCrewPracticeArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointA[6],
      prompt: 'What does the prefix do in disagree?',
      explanation: 'Dis- means not or opposite of, so disagree means not agree.',
      evidenceReferenceIds: [kitchenCrewPracticeArtifact.targets[3].sentenceId],
      targetVocabulary: ['disagree', 'dis-'],
      difficulty: 2,
      tags: ['prefix-identification', 'affix-meaning', 'word-meaning-from-parts', 'prefix-dis'],
      partAPrompt: 'Which prefix appears in disagree?',
      partAChoices: ['dis-', 'un-', 're-', 'pre-'],
      partACorrectChoiceText: 'dis-',
      partAPosition: 2,
      partBPrompt: 'What does disagree mean?',
      partBChoices: ['not agree', 'build again', 'heat before', 'more than one'],
      partBCorrectChoiceText: 'not agree',
      partBPosition: 1,
    }),
  ] as const

  const checkpointBQuestions = [
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointB,
      passageId: readingTableResetArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointB[0],
      prompt: 'What is the base word in rebuild?',
      explanation: 'Build is the base word because re- was added before it.',
      evidenceReferenceIds: [readingTableResetArtifact.targets[0].sentenceId],
      targetVocabulary: ['rebuild', 'build'],
      difficulty: 2,
      tags: ['base-word-identification', 'base-words', 'prefix-re'],
      correctText: 'build',
      distractorTexts: ['re', 'again', 'snack'],
      correctIndex: 3,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointB,
      passageId: readingTableResetArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointB[1],
      prompt: 'What does pre- mean in preheat?',
      explanation: 'Pre- means before, so preheat means heat before something starts.',
      evidenceReferenceIds: [readingTableResetArtifact.targets[1].sentenceId],
      targetVocabulary: ['preheat', 'pre-'],
      difficulty: 2,
      tags: ['prefix-identification', 'affix-meaning', 'prefix-pre'],
      correctText: 'before',
      distractorTexts: ['again', 'without', 'most'],
      correctIndex: 0,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointB,
      passageId: readingTableResetArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointB[2],
      prompt: 'What does careless mean in the passage?',
      explanation: 'Careless means without care because -less means without.',
      evidenceReferenceIds: [readingTableResetArtifact.targets[3].sentenceId],
      targetVocabulary: ['careless', 'care'],
      difficulty: 2,
      tags: ['suffix-identification', 'affix-meaning', 'suffix-ful-less'],
      correctText: 'without care',
      distractorTexts: ['full of help', 'more fast', 'before'],
      correctIndex: 1,
    }),
    makeMultiselectQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointB,
      passageId: readingTableResetArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointB[3],
      prompt: 'Choose two words in the passage that begin with a prefix.',
      explanation: 'Rebuild and preheat both begin with prefixes that change the base word meaning.',
      evidenceReferenceIds: [readingTableResetArtifact.targets[0].sentenceId, readingTableResetArtifact.targets[1].sentenceId],
      targetVocabulary: ['rebuild', 'preheat'],
      difficulty: 2,
      tags: ['prefix-identification', 'prefix-re', 'prefix-pre'],
      choiceTexts: ['rebuild', 'preheat', 'helped', 'slowly'],
      correctChoiceTexts: ['rebuild', 'preheat'],
      correctIndex: 2,
    }),
    makeHotTextQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointB,
      passageId: readingTableResetArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointB[4],
      prompt: 'Which chunk is the suffix in helped?',
      explanation: 'The suffix -ed comes after help and means the action already happened.',
      evidenceReferenceIds: [readingTableResetArtifact.targets[2].sentenceId],
      targetVocabulary: ['helped', '-ed'],
      difficulty: 2,
      tags: ['suffix-identification', 'suffix-ed'],
      segmentTexts: ['help', 'ed', 'helped', 'before'],
      correctSegmentText: 'ed',
      correctIndex: 0,
    }),
    makeTableMatchQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointB,
      passageId: readingTableResetArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointB[5],
      prompt: 'Match each word to its meaning in the passage.',
      explanation: 'The base word and affix work together to create the full meaning.',
      evidenceReferenceIds: [
        readingTableResetArtifact.targets[0].sentenceId,
        readingTableResetArtifact.targets[1].sentenceId,
        readingTableResetArtifact.targets[2].sentenceId,
        readingTableResetArtifact.targets[3].sentenceId,
      ],
      targetVocabulary: ['rebuild', 'preheat', 'helped', 'careless'],
      difficulty: 2,
      tags: [...morphologyTags],
      rows: [
        {
          prompt: 'rebuild',
          correctChoiceText: 'build again',
          optionTexts: ['build again', 'count wrongly', 'full of help', 'more fast'],
        },
        {
          prompt: 'preheat',
          correctChoiceText: 'heat before',
          optionTexts: ['heat before', 'more than one plant', 'look before', 'before the test'],
        },
        {
          prompt: 'helped',
          correctChoiceText: 'help already happened',
          optionTexts: ['help already happened', 'kind helper', 'slowly moving', 'most tall'],
        },
        {
          prompt: 'careless',
          correctChoiceText: 'without care',
          optionTexts: ['without care', 'again', 'one box', 'wrongly'],
        },
      ],
    }),
    makeTwoPartQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointB,
      passageId: readingTableResetArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointB[6],
      prompt: 'What does the prefix do in rebuild?',
      explanation: 'Re- means again, so rebuild means build again.',
      evidenceReferenceIds: [readingTableResetArtifact.targets[0].sentenceId],
      targetVocabulary: ['rebuild', 're-'],
      difficulty: 2,
      tags: ['prefix-identification', 'affix-meaning', 'word-meaning-from-parts', 'prefix-re'],
      partAPrompt: 'Which prefix appears in rebuild?',
      partAChoices: ['re-', 'un-', 'dis-', 'pre-'],
      partACorrectChoiceText: 're-',
      partAPosition: 1,
      partBPrompt: 'What does rebuild mean?',
      partBChoices: ['build again', 'count wrongly', 'heat before', 'full of help'],
      partBCorrectChoiceText: 'build again',
      partBPosition: 0,
    }),
  ] as const

  const checkpointCQuestions = [
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointC,
      passageId: countAndCompareArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointC[0],
      prompt: 'What is the base word in fastest?',
      explanation: 'Fast is the base word because -est was added after it.',
      evidenceReferenceIds: [countAndCompareArtifact.targets[2].sentenceId],
      targetVocabulary: ['fastest', 'fast'],
      difficulty: 2,
      tags: ['base-word-identification', 'base-word-meaning', 'suffix-er-est'],
      correctText: 'fast',
      distractorTexts: ['faster', 'most', 'quickly'],
      correctIndex: 2,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointC,
      passageId: countAndCompareArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointC[1],
      prompt: 'What does -ly mean in slowly?',
      explanation: '-ly means in a particular way, so slowly means in a slow way.',
      evidenceReferenceIds: [countAndCompareArtifact.targets[0].sentenceId],
      targetVocabulary: ['slowly', '-ly'],
      difficulty: 2,
      tags: ['suffix-identification', 'affix-meaning', 'suffix-ly'],
      correctText: 'in a particular way',
      distractorTexts: ['before', 'again', 'without'],
      correctIndex: 1,
    }),
    makeMultipleChoiceQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointC,
      passageId: countAndCompareArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointC[2],
      prompt: 'What does miscount mean in the passage?',
      explanation: 'Miscount means count wrongly because mis- means wrongly or incorrectly.',
      evidenceReferenceIds: [countAndCompareArtifact.targets[0].sentenceId],
      targetVocabulary: ['miscount', 'mis-'],
      difficulty: 2,
      tags: ['prefix-identification', 'affix-meaning', 'prefix-mis'],
      correctText: 'count wrongly',
      distractorTexts: ['more than one', 'heat before', 'full of help'],
      correctIndex: 0,
    }),
    makeMultiselectQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointC,
      passageId: countAndCompareArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointC[3],
      prompt: 'Choose two words in the passage that show comparison.',
      explanation: 'Faster means more fast, and tallest means most tall.',
      evidenceReferenceIds: [countAndCompareArtifact.targets[2].sentenceId, countAndCompareArtifact.targets[3].sentenceId],
      targetVocabulary: ['faster', 'tallest'],
      difficulty: 2,
      tags: ['suffix-identification', 'suffix-er-est', 'word-meaning-from-parts'],
      choiceTexts: ['faster', 'tallest', 'plants', 'helped'],
      correctChoiceTexts: ['faster', 'tallest'],
      correctIndex: 2,
    }),
    makeHotTextQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointC,
      passageId: countAndCompareArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointC[4],
      prompt: 'Which chunk is the prefix in miscount?',
      explanation: 'Mis- comes before count and means wrongly or incorrectly.',
      evidenceReferenceIds: [countAndCompareArtifact.targets[0].sentenceId],
      targetVocabulary: ['miscount', 'mis-'],
      difficulty: 2,
      tags: ['prefix-identification', 'prefix-mis'],
      segmentTexts: ['mis', 'count', 'miscount', 'wrongly'],
      correctSegmentText: 'mis',
      correctIndex: 1,
    }),
    makeTableMatchQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointC,
      passageId: countAndCompareArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointC[5],
      prompt: 'Match each word to its meaning in the passage.',
      explanation: 'The affix helps readers make the meaning clear.',
      evidenceReferenceIds: [
        countAndCompareArtifact.targets[0].sentenceId,
        countAndCompareArtifact.targets[1].sentenceId,
        countAndCompareArtifact.targets[2].sentenceId,
        countAndCompareArtifact.targets[3].sentenceId,
      ],
      targetVocabulary: ['miscount', 'slowly', 'faster', 'tallest'],
      difficulty: 2,
      tags: [...morphologyTags],
      rows: [
        {
          prompt: 'miscount',
          correctChoiceText: 'count wrongly',
          optionTexts: ['count wrongly', 'before the test', 'full of help', 'more than one plant'],
        },
        {
          prompt: 'slowly',
          correctChoiceText: 'in a slow way',
          optionTexts: ['in a slow way', 'build again', 'without care', 'heat before'],
        },
        {
          prompt: 'faster',
          correctChoiceText: 'more fast',
          optionTexts: ['more fast', 'kind helper', 'again', 'one box'],
        },
        {
          prompt: 'tallest',
          correctChoiceText: 'most tall',
          optionTexts: ['most tall', 'slowly moving', 'not agree', 'wrongly'],
        },
      ],
    }),
    makeTwoPartQuestion({
      lessonId: contextCavernMorphologyMineLessonIds.checkpointC,
      passageId: countAndCompareArtifact.passage.passageIdentifier,
      questionId: contextCavernMorphologyMineQuestionIds.checkpointC[6],
      prompt: 'What does the prefix do in miscount?',
      explanation: 'Mis- means wrongly, so miscount means count wrongly.',
      evidenceReferenceIds: [countAndCompareArtifact.targets[0].sentenceId],
      targetVocabulary: ['miscount', 'mis-'],
      difficulty: 2,
      tags: ['prefix-identification', 'affix-meaning', 'word-meaning-from-parts', 'prefix-mis'],
      partAPrompt: 'Which prefix appears in miscount?',
      partAChoices: ['mis-', 're-', 'pre-', 'un-'],
      partACorrectChoiceText: 'mis-',
      partAPosition: 0,
      partBPrompt: 'What does miscount mean?',
      partBChoices: ['count wrongly', 'build again', 'heat before', 'full of help'],
      partBCorrectChoiceText: 'count wrongly',
      partBPosition: 2,
    }),
  ] as const

  return [
    ...prereqFindBaseWordQuestions,
    ...prereqMatchAffixMeaningQuestions,
    ...guidedPrefixesBuildMeaningsQuestions,
    ...guidedSuffixesBuildMeaningsQuestions,
    ...checkpointAQuestions,
    ...checkpointBQuestions,
    ...checkpointCQuestions,
  ]
}

const morphologyMineQuestions = buildQuestionSets()

const morphologyMineLessons: ContentPackLesson[] = [
  {
    lessonId: contextCavernMorphologyMineLessonIds.prereqFindBaseWord,
    worldId: contextCavernMorphologyMineWorldId,
    unitId: contextCavernMorphologyMineUnitId,
    activityId: 'activity-cc-morphology-prereq-find-base-word',
    difficulty: 1,
    passageIdentifiers: [unpackSupplyCartArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernMorphologyMineQuestionIds.prereqFindBaseWord,
    lessonTitle: 'Find the Base Word',
    lessonObjective: 'Identify the base word inside a transparent affixed word.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Find the part that carries the main meaning',
      explanation:
        'A base word carries the main meaning. A prefix goes before it, and a suffix goes after it. Say the base word first, then check how the affix changes the meaning.',
      examples: [
        'Pack is the base word in unpack.',
        'Help is the base word in helpful.',
        'Slow is the base word in slowly.',
      ],
      contrast: 'Do not stop at the longer word. Find the smaller word that still makes sense on its own.',
      learnerCue: 'Look for the word part that stays when the prefix or suffix is removed.',
    },
    contentVersion: contextCavernMorphologyMineContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernMorphologyMineLessonIds.prereqMatchAffixMeaning,
    worldId: contextCavernMorphologyMineWorldId,
    unitId: contextCavernMorphologyMineUnitId,
    activityId: 'activity-cc-morphology-prereq-match-affix-meaning',
    difficulty: 1,
    passageIdentifiers: [rebuildPlantShelfArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernMorphologyMineQuestionIds.prereqMatchAffixMeaning,
    lessonTitle: 'Match the Affix to Its Meaning',
    lessonObjective: 'Match common prefixes and suffixes to their usual meanings.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Affixes change the base word meaning',
      explanation:
        'An affix is a meaningful word part added to the start or end of a base word. The affix often tells the reader something new about the word.',
      examples: [
        'Re- often means again.',
        '-less often means without.',
        '-s or -es often means more than one.',
      ],
      contrast: 'Use the affix meaning that fits the word in the sentence.',
      learnerCue: 'Say the affix meaning, then combine it with the base word.',
    },
    contentVersion: contextCavernMorphologyMineContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernMorphologyMineLessonIds.guidedPrefixesBuildMeanings,
    worldId: contextCavernMorphologyMineWorldId,
    unitId: contextCavernMorphologyMineUnitId,
    activityId: 'activity-cc-morphology-guided-prefixes-build-meanings',
    difficulty: 2,
    passageIdentifiers: [preheatSnackDemoArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernMorphologyMineQuestionIds.guidedPrefixesBuildMeanings,
    lessonTitle: 'Prefixes Build New Meanings',
    lessonObjective: 'Use prefixes to figure out how a word meaning changes.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'A prefix goes before the base word',
      explanation:
        'A prefix is added before the base word. The prefix often changes the meaning in a way the sentence can show.',
      examples: [
        'Pre- means before.',
        'Dis- often means not or opposite of.',
        'Re- often means again.',
      ],
      contrast: 'Do not guess from the first letters alone. Check the whole word and the sentence.',
      learnerCue: 'Look at the front part, then combine it with the base word meaning.',
    },
    contentVersion: contextCavernMorphologyMineContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernMorphologyMineLessonIds.guidedSuffixesBuildMeanings,
    worldId: contextCavernMorphologyMineWorldId,
    unitId: contextCavernMorphologyMineUnitId,
    activityId: 'activity-cc-morphology-guided-suffixes-build-meanings',
    difficulty: 2,
    passageIdentifiers: [toolShelfSortArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernMorphologyMineQuestionIds.guidedSuffixesBuildMeanings,
    lessonTitle: 'Suffixes Build New Meanings',
    lessonObjective: 'Use suffixes to figure out how a word meaning changes.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'A suffix goes after the base word',
      explanation:
        'A suffix is added after the base word. The suffix often helps the reader understand how the word changes.',
      examples: [
        '-ly often means in a particular way.',
        '-est often means most.',
        '-ing often means the action is happening or continuing.',
      ],
      contrast: 'The ending should still make sense with the base word and the sentence.',
      learnerCue: 'Look at the end part, then combine it with the base word meaning.',
    },
    contentVersion: contextCavernMorphologyMineContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernMorphologyMineLessonIds.checkpointA,
    worldId: contextCavernMorphologyMineWorldId,
    unitId: contextCavernMorphologyMineUnitId,
    activityId: 'activity-cc-morphology-checkpoint-a',
    difficulty: 2,
    passageIdentifiers: [
      preheatSnackDemoArtifact.passage.passageIdentifier,
      unpackSupplyCartArtifact.passage.passageIdentifier,
      kitchenCrewPracticeArtifact.passage.passageIdentifier,
    ],
    questionIdentifiers: contextCavernMorphologyMineQuestionIds.checkpointA,
    lessonTitle: 'Morphology Mine Checkpoint A',
    lessonObjective: 'Show how base words and prefixes or suffixes work together.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: contextCavernMorphologyMineContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: contextCavernMorphologyMineLessonIds.checkpointB,
    worldId: contextCavernMorphologyMineWorldId,
    unitId: contextCavernMorphologyMineUnitId,
    activityId: 'activity-cc-morphology-checkpoint-b',
    difficulty: 2,
    passageIdentifiers: [
      kitchenCrewPracticeArtifact.passage.passageIdentifier,
      rebuildPlantShelfArtifact.passage.passageIdentifier,
      readingTableResetArtifact.passage.passageIdentifier,
    ],
    questionIdentifiers: contextCavernMorphologyMineQuestionIds.checkpointB,
    lessonTitle: 'Morphology Mine Checkpoint B',
    lessonObjective: 'Show how base words and prefixes or suffixes work together.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: contextCavernMorphologyMineContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: contextCavernMorphologyMineLessonIds.checkpointC,
    worldId: contextCavernMorphologyMineWorldId,
    unitId: contextCavernMorphologyMineUnitId,
    activityId: 'activity-cc-morphology-checkpoint-c',
    difficulty: 2,
    passageIdentifiers: [
      countAndCompareArtifact.passage.passageIdentifier,
      toolShelfSortArtifact.passage.passageIdentifier,
      preheatSnackDemoArtifact.passage.passageIdentifier,
    ],
    questionIdentifiers: contextCavernMorphologyMineQuestionIds.checkpointC,
    lessonTitle: 'Morphology Mine Checkpoint C',
    lessonObjective: 'Show how base words and prefixes or suffixes work together.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: contextCavernMorphologyMineContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]

const morphologyMinePassages = passageArtifacts.map((artifact) => artifact.passage)
const morphologyMineMorphologyGuides = passageArtifacts.map((artifact) => artifact.guide)
const morphologyMineSupportTargets = morphologyMinePassages.flatMap((passage) => passage.wordSupportTargets ?? [])

export const grade2ContextCavernMorphologyMinePack: ContentPack = {
  manifest: {
    packId: contextCavernMorphologyMinePackId,
    packTitle: 'Grade 2 Context Cavern: Morphology Mine',
    gradeBand: 2,
    worldId: contextCavernMorphologyMineWorldId,
    unitId: contextCavernMorphologyMineUnitId,
    primarySkillId: contextCavernMorphologyMinePrimarySkillId,
    benchmarkReferences: ['ELA.2.V.1.2'],
    partialBenchmarkCoverage:
      'Grade 2 transparent base-word and affix meaning work across speaking and writing, without Greek or Latin roots, context clues, or dictionary use.',
    coverageKind: 'benchmark',
    difficultyRange: [1, 2],
    contentVersion: contextCavernMorphologyMineContentVersion,
    reviewStatus: 'DRAFT',
    coveredPatterns: [...morphologyTags],
    passageIds: morphologyMinePassages.map((passage) => passage.passageIdentifier),
    questionIds: morphologyMineQuestions.map((question) => question.questionIdentifier),
    lessonIds: morphologyMineLessons.map((lesson) => lesson.lessonId),
  },
  passages: morphologyMinePassages,
  questions: morphologyMineQuestions,
  lessons: morphologyMineLessons,
  morphologyGuides: morphologyMineMorphologyGuides,
}

export {
  morphologyMineMorphologyGuides,
  morphologyMinePassages,
  morphologyMineQuestions,
  morphologyMineSupportTargets,
  morphologyMineLessons,
}
