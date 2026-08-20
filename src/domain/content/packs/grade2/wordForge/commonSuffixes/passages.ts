import type { Passage, WordSupportChunk, WordSupportPart } from '../../../../types'
import { COMMON_SUFFIX_CONTENT_VERSION, COMMON_SUFFIX_PASSAGE_IDS } from './ids'

interface TargetSpec {
  targetId: string
  sentenceId: string
  surfaceWord: string
  focusParts: WordSupportPart[]
  displayChunks: WordSupportChunk[]
  spokenChunks: WordSupportChunk[]
  blendSpeechText: string
  wholeWordSpeechText: string
  sentenceSpeechText: string
}

interface PassageSpec {
  passageIdentifier: string
  sentences: { sentenceId: string; text: string }[]
  readingContext: string
  passageText: string
  targets: TargetSpec[]
}

const part = (text: string, emphasis: boolean): WordSupportPart => ({ text, emphasis })
const chunk = (displayText: string, speechText = displayText): WordSupportChunk => ({ displayText, speechText })

const sentence = (sentenceId: string, text: string) => ({ sentenceId, text })

const createPassage = (spec: PassageSpec): Passage => ({
  passageIdentifier: spec.passageIdentifier,
  gradeBand: 2,
  passageText: spec.passageText,
  sentences: spec.sentences,
  readingContext: spec.readingContext,
  contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
  reviewStatus: 'DRAFT',
  wordSupportTargets: spec.targets.map((target) => ({
    ...target,
    passageId: spec.passageIdentifier,
    reviewStatus: 'DRAFT',
    contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
  })),
})

const gardenSentence1 = 'At the garden, the class planted seeds and watered plants.'
const gardenSentence2 = 'A helpful helper helped carry boxes of tools and cleaned the table.'
const gardenSentence3 = 'The team worked carefully.'

const shelterSentence1 = 'At the shelter, boxes of blankets lined the table.'
const shelterSentence2 = 'The kind volunteer carried dishes, cleaned bowls, and walked softly.'
const shelterSentence3 = 'The dogs looked fearless and happy.'

const trailSentence1 = 'On the trail cleanup, the children were helping quickly.'
const trailSentence2 = 'They moved faster than before and sorted the smallest sticks.'
const trailSentence3 = 'The team felt careful and calm.'

const weatherSentence1 = 'During the weather watch, the sky stayed clear.'
const weatherSentence2 = 'The reporter wrote the calmer note and the children listened kindly.'
const weatherSentence3 = 'A hopeful sign appeared when the warmer wind passed.'

const signSentence1 = 'The team painted bright signs for the pantry.'
const signSentence2 = 'They chose the smaller brush and a careful paint path.'
const signSentence3 = 'A careless drip would show.'

const scienceSentence1 = 'At the science table, the class tested tools and wanted the cleanest tray.'
const scienceSentence2 = 'The students were jumping, and the teacher moved softly.'
const scienceSentence3 = 'A kinder helper said the box was empty.'

const pantrySentence1 = 'At the pantry, the children carried careful bags and cleaned the shelves.'
const pantrySentence2 = 'The fastest cart rolled past the hopeful signs, and the family made wishes for a full shelf.'
const pantrySentence3 = 'A careless spill was wiped quickly.'

export const grade2WordForgeCommonSuffixesPassages: Passage[] = [
  createPassage({
    passageIdentifier: COMMON_SUFFIX_PASSAGE_IDS.gardenBed,
    passageText: [gardenSentence1, gardenSentence2, gardenSentence3].join(' '),
    sentences: [
      sentence('suffix-garden-1', gardenSentence1),
      sentence('suffix-garden-2', gardenSentence2),
      sentence('suffix-garden-3', gardenSentence3),
    ],
    readingContext: 'Word Forge Trail 6 practice about a garden and careful helpers.',
    targets: [
      {
        targetId: 'target-g2-word-forge-common-suffixes-1-planted',
        sentenceId: 'suffix-garden-1',
        surfaceWord: 'planted',
        focusParts: [part('plant', false), part('ed', true)],
        displayChunks: [chunk('plant'), chunk('ed')],
        spokenChunks: [chunk('plant'), chunk('id')],
        blendSpeechText: 'planted',
        wholeWordSpeechText: 'planted',
        sentenceSpeechText: gardenSentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-1-watered',
        sentenceId: 'suffix-garden-1',
        surfaceWord: 'watered',
        focusParts: [part('water', false), part('ed', true)],
        displayChunks: [chunk('water'), chunk('ed')],
        spokenChunks: [chunk('water'), chunk('d')],
        blendSpeechText: 'watered',
        wholeWordSpeechText: 'watered',
        sentenceSpeechText: gardenSentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-1-helped',
        sentenceId: 'suffix-garden-2',
        surfaceWord: 'helped',
        focusParts: [part('help', false), part('ed', true)],
        displayChunks: [chunk('help'), chunk('ed')],
        spokenChunks: [chunk('help'), chunk('t')],
        blendSpeechText: 'helped',
        wholeWordSpeechText: 'helped',
        sentenceSpeechText: gardenSentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-1-helpful',
        sentenceId: 'suffix-garden-2',
        surfaceWord: 'helpful',
        focusParts: [part('help', false), part('ful', true)],
        displayChunks: [chunk('help'), chunk('ful')],
        spokenChunks: [chunk('help'), chunk('ful')],
        blendSpeechText: 'helpful',
        wholeWordSpeechText: 'helpful',
        sentenceSpeechText: gardenSentence2,
      },
    ],
  }),
  createPassage({
    passageIdentifier: COMMON_SUFFIX_PASSAGE_IDS.shelterCare,
    passageText: [shelterSentence1, shelterSentence2, shelterSentence3].join(' '),
    sentences: [
      sentence('suffix-shelter-1', shelterSentence1),
      sentence('suffix-shelter-2', shelterSentence2),
      sentence('suffix-shelter-3', shelterSentence3),
    ],
    readingContext: 'Word Forge Trail 6 practice about a shelter and calm helpers.',
    targets: [
      {
        targetId: 'target-g2-word-forge-common-suffixes-2-boxes',
        sentenceId: 'suffix-shelter-1',
        surfaceWord: 'boxes',
        focusParts: [part('box', false), part('es', true)],
        displayChunks: [chunk('box'), chunk('es')],
        spokenChunks: [chunk('box'), chunk('iz')],
        blendSpeechText: 'boxes',
        wholeWordSpeechText: 'boxes',
        sentenceSpeechText: shelterSentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-2-dishes',
        sentenceId: 'suffix-shelter-2',
        surfaceWord: 'dishes',
        focusParts: [part('dish', false), part('es', true)],
        displayChunks: [chunk('dish'), chunk('es')],
        spokenChunks: [chunk('dish'), chunk('iz')],
        blendSpeechText: 'dishes',
        wholeWordSpeechText: 'dishes',
        sentenceSpeechText: shelterSentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-2-softly',
        sentenceId: 'suffix-shelter-2',
        surfaceWord: 'softly',
        focusParts: [part('soft', false), part('ly', true)],
        displayChunks: [chunk('soft'), chunk('ly')],
        spokenChunks: [chunk('soft'), chunk('lee')],
        blendSpeechText: 'softly',
        wholeWordSpeechText: 'softly',
        sentenceSpeechText: shelterSentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-2-fearless',
        sentenceId: 'suffix-shelter-3',
        surfaceWord: 'fearless',
        focusParts: [part('fear', false), part('less', true)],
        displayChunks: [chunk('fear'), chunk('less')],
        spokenChunks: [chunk('fear'), chunk('less')],
        blendSpeechText: 'fearless',
        wholeWordSpeechText: 'fearless',
        sentenceSpeechText: shelterSentence3,
      },
    ],
  }),
  createPassage({
    passageIdentifier: COMMON_SUFFIX_PASSAGE_IDS.trailCleanup,
    passageText: [trailSentence1, trailSentence2, trailSentence3].join(' '),
    sentences: [
      sentence('suffix-trail-1', trailSentence1),
      sentence('suffix-trail-2', trailSentence2),
      sentence('suffix-trail-3', trailSentence3),
    ],
    readingContext: 'Word Forge Trail 6 practice about a cleanup walk and careful sorting.',
    targets: [
      {
        targetId: 'target-g2-word-forge-common-suffixes-3-helping',
        sentenceId: 'suffix-trail-1',
        surfaceWord: 'helping',
        focusParts: [part('help', false), part('ing', true)],
        displayChunks: [chunk('help'), chunk('ing')],
        spokenChunks: [chunk('help'), chunk('ing')],
        blendSpeechText: 'helping',
        wholeWordSpeechText: 'helping',
        sentenceSpeechText: trailSentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-3-quickly',
        sentenceId: 'suffix-trail-1',
        surfaceWord: 'quickly',
        focusParts: [part('quick', false), part('ly', true)],
        displayChunks: [chunk('quick'), chunk('ly')],
        spokenChunks: [chunk('quick'), chunk('lee')],
        blendSpeechText: 'quickly',
        wholeWordSpeechText: 'quickly',
        sentenceSpeechText: trailSentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-3-faster',
        sentenceId: 'suffix-trail-2',
        surfaceWord: 'faster',
        focusParts: [part('fast', false), part('er', true)],
        displayChunks: [chunk('fast'), chunk('er')],
        spokenChunks: [chunk('fast'), chunk('er')],
        blendSpeechText: 'faster',
        wholeWordSpeechText: 'faster',
        sentenceSpeechText: trailSentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-3-smallest',
        sentenceId: 'suffix-trail-2',
        surfaceWord: 'smallest',
        focusParts: [part('small', false), part('est', true)],
        displayChunks: [chunk('small'), chunk('est')],
        spokenChunks: [chunk('small'), chunk('est')],
        blendSpeechText: 'smallest',
        wholeWordSpeechText: 'smallest',
        sentenceSpeechText: trailSentence2,
      },
    ],
  }),
  createPassage({
    passageIdentifier: COMMON_SUFFIX_PASSAGE_IDS.weatherWatch,
    passageText: [weatherSentence1, weatherSentence2, weatherSentence3].join(' '),
    sentences: [
      sentence('suffix-weather-1', weatherSentence1),
      sentence('suffix-weather-2', weatherSentence2),
      sentence('suffix-weather-3', weatherSentence3),
    ],
    readingContext: 'Word Forge Trail 6 practice about weather notes and kind help.',
    targets: [
      {
        targetId: 'target-g2-word-forge-common-suffixes-4-calmer',
        sentenceId: 'suffix-weather-2',
        surfaceWord: 'calmer',
        focusParts: [part('calm', false), part('er', true)],
        displayChunks: [chunk('calm'), chunk('er')],
        spokenChunks: [chunk('calm'), chunk('er')],
        blendSpeechText: 'calmer',
        wholeWordSpeechText: 'calmer',
        sentenceSpeechText: weatherSentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-4-kindly',
        sentenceId: 'suffix-weather-2',
        surfaceWord: 'kindly',
        focusParts: [part('kind', false), part('ly', true)],
        displayChunks: [chunk('kind'), chunk('ly')],
        spokenChunks: [chunk('kind'), chunk('lee')],
        blendSpeechText: 'kindly',
        wholeWordSpeechText: 'kindly',
        sentenceSpeechText: weatherSentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-4-hopeful',
        sentenceId: 'suffix-weather-3',
        surfaceWord: 'hopeful',
        focusParts: [part('hope', false), part('ful', true)],
        displayChunks: [chunk('hope'), chunk('ful')],
        spokenChunks: [chunk('hope'), chunk('ful')],
        blendSpeechText: 'hopeful',
        wholeWordSpeechText: 'hopeful',
        sentenceSpeechText: weatherSentence3,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-4-warmer',
        sentenceId: 'suffix-weather-3',
        surfaceWord: 'warmer',
        focusParts: [part('warm', false), part('er', true)],
        displayChunks: [chunk('warm'), chunk('er')],
        spokenChunks: [chunk('warm'), chunk('er')],
        blendSpeechText: 'warmer',
        wholeWordSpeechText: 'warmer',
        sentenceSpeechText: weatherSentence3,
      },
    ],
  }),
  createPassage({
    passageIdentifier: COMMON_SUFFIX_PASSAGE_IDS.signPainting,
    passageText: [signSentence1, signSentence2, signSentence3].join(' '),
    sentences: [
      sentence('suffix-sign-1', signSentence1),
      sentence('suffix-sign-2', signSentence2),
      sentence('suffix-sign-3', signSentence3),
    ],
    readingContext: 'Word Forge Trail 6 practice about painting signs and careful work.',
    targets: [
      {
        targetId: 'target-g2-word-forge-common-suffixes-5-signs',
        sentenceId: 'suffix-sign-1',
        surfaceWord: 'signs',
        focusParts: [part('sign', false), part('s', true)],
        displayChunks: [chunk('sign'), chunk('s')],
        spokenChunks: [chunk('sign'), chunk('z')],
        blendSpeechText: 'signs',
        wholeWordSpeechText: 'signs',
        sentenceSpeechText: signSentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-5-painted',
        sentenceId: 'suffix-sign-1',
        surfaceWord: 'painted',
        focusParts: [part('paint', false), part('ed', true)],
        displayChunks: [chunk('paint'), chunk('ed')],
        spokenChunks: [chunk('paint'), chunk('id')],
        blendSpeechText: 'painted',
        wholeWordSpeechText: 'painted',
        sentenceSpeechText: signSentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-5-smaller',
        sentenceId: 'suffix-sign-2',
        surfaceWord: 'smaller',
        focusParts: [part('small', false), part('er', true)],
        displayChunks: [chunk('small'), chunk('er')],
        spokenChunks: [chunk('small'), chunk('er')],
        blendSpeechText: 'smaller',
        wholeWordSpeechText: 'smaller',
        sentenceSpeechText: signSentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-5-careless',
        sentenceId: 'suffix-sign-3',
        surfaceWord: 'careless',
        focusParts: [part('care', false), part('less', true)],
        displayChunks: [chunk('care'), chunk('less')],
        spokenChunks: [chunk('care'), chunk('less')],
        blendSpeechText: 'careless',
        wholeWordSpeechText: 'careless',
        sentenceSpeechText: signSentence3,
      },
    ],
  }),
  createPassage({
    passageIdentifier: COMMON_SUFFIX_PASSAGE_IDS.scienceTools,
    passageText: [scienceSentence1, scienceSentence2, scienceSentence3].join(' '),
    sentences: [
      sentence('suffix-science-1', scienceSentence1),
      sentence('suffix-science-2', scienceSentence2),
      sentence('suffix-science-3', scienceSentence3),
    ],
    readingContext: 'Word Forge Trail 6 practice about science tools and careful sorting.',
    targets: [
      {
        targetId: 'target-g2-word-forge-common-suffixes-6-wanted',
        sentenceId: 'suffix-science-1',
        surfaceWord: 'wanted',
        focusParts: [part('want', false), part('ed', true)],
        displayChunks: [chunk('want'), chunk('ed')],
        spokenChunks: [chunk('want'), chunk('id')],
        blendSpeechText: 'wanted',
        wholeWordSpeechText: 'wanted',
        sentenceSpeechText: scienceSentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-6-jumping',
        sentenceId: 'suffix-science-2',
        surfaceWord: 'jumping',
        focusParts: [part('jump', false), part('ing', true)],
        displayChunks: [chunk('jump'), chunk('ing')],
        spokenChunks: [chunk('jump'), chunk('ing')],
        blendSpeechText: 'jumping',
        wholeWordSpeechText: 'jumping',
        sentenceSpeechText: scienceSentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-6-cleanest',
        sentenceId: 'suffix-science-1',
        surfaceWord: 'cleanest',
        focusParts: [part('clean', false), part('est', true)],
        displayChunks: [chunk('clean'), chunk('est')],
        spokenChunks: [chunk('clean'), chunk('est')],
        blendSpeechText: 'cleanest',
        wholeWordSpeechText: 'cleanest',
        sentenceSpeechText: scienceSentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-6-kinder',
        sentenceId: 'suffix-science-3',
        surfaceWord: 'kinder',
        focusParts: [part('kind', false), part('er', true)],
        displayChunks: [chunk('kind'), chunk('er')],
        spokenChunks: [chunk('kind'), chunk('er')],
        blendSpeechText: 'kinder',
        wholeWordSpeechText: 'kinder',
        sentenceSpeechText: scienceSentence3,
      },
    ],
  }),
  createPassage({
    passageIdentifier: COMMON_SUFFIX_PASSAGE_IDS.pantryHelp,
    passageText: [pantrySentence1, pantrySentence2, pantrySentence3].join(' '),
    sentences: [
      sentence('suffix-pantry-1', pantrySentence1),
      sentence('suffix-pantry-2', pantrySentence2),
      sentence('suffix-pantry-3', pantrySentence3),
    ],
    readingContext: 'Word Forge Trail 6 practice about a pantry help day and careful work.',
    targets: [
      {
        targetId: 'target-g2-word-forge-common-suffixes-7-wishes',
        sentenceId: 'suffix-pantry-2',
        surfaceWord: 'wishes',
        focusParts: [part('wish', false), part('es', true)],
        displayChunks: [chunk('wish'), chunk('es')],
        spokenChunks: [chunk('wish'), chunk('iz')],
        blendSpeechText: 'wishes',
        wholeWordSpeechText: 'wishes',
        sentenceSpeechText: pantrySentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-7-cleaned',
        sentenceId: 'suffix-pantry-1',
        surfaceWord: 'cleaned',
        focusParts: [part('clean', false), part('ed', true)],
        displayChunks: [chunk('clean'), chunk('ed')],
        spokenChunks: [chunk('clean'), chunk('d')],
        blendSpeechText: 'cleaned',
        wholeWordSpeechText: 'cleaned',
        sentenceSpeechText: pantrySentence1,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-7-fastest',
        sentenceId: 'suffix-pantry-2',
        surfaceWord: 'fastest',
        focusParts: [part('fast', false), part('est', true)],
        displayChunks: [chunk('fast'), chunk('est')],
        spokenChunks: [chunk('fast'), chunk('est')],
        blendSpeechText: 'fastest',
        wholeWordSpeechText: 'fastest',
        sentenceSpeechText: pantrySentence2,
      },
      {
        targetId: 'target-g2-word-forge-common-suffixes-7-careful',
        sentenceId: 'suffix-pantry-1',
        surfaceWord: 'careful',
        focusParts: [part('care', false), part('ful', true)],
        displayChunks: [chunk('care'), chunk('ful')],
        spokenChunks: [chunk('care'), chunk('ful')],
        blendSpeechText: 'careful',
        wholeWordSpeechText: 'careful',
        sentenceSpeechText: pantrySentence1,
      },
    ],
  }),
]
