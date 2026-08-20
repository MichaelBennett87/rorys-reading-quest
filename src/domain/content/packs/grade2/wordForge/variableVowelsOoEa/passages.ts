import type { Passage, WordSupportChunk, WordSupportPart } from '../../../../types'
import { OO_EA_CONTENT_VERSION, OO_EA_PASSAGE_IDS } from './ids'

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

const createPassage = (spec: PassageSpec): Passage => ({
  passageIdentifier: spec.passageIdentifier,
  gradeBand: 2,
  passageText: spec.passageText,
  sentences: spec.sentences,
  readingContext: spec.readingContext,
  contentVersion: OO_EA_CONTENT_VERSION,
  reviewStatus: 'DRAFT',
  wordSupportTargets: spec.targets.map((target) => ({
    ...target,
    passageId: spec.passageIdentifier,
    reviewStatus: 'DRAFT',
    contentVersion: OO_EA_CONTENT_VERSION,
  })),
})

const moonRoomSentence1 = 'The clean team walked into the moon room at dusk.'
const moonRoomSentence2 = 'Nia carried a spoon and a book for the quiet show.'
const moonRoomSentence3 = 'The room glowed while the moon shone on the wood shelf.'

const beachCleanupSentence1 = 'The clean team met at the beach before breakfast.'
const beachCleanupSentence2 = 'They wore boots and picked up trash near the blue pool.'
const beachCleanupSentence3 = 'A leaf rested on the sand, and everyone smiled.'

const kitchenBreadSentence1 = 'Mia and her dad baked bread for the team dinner.'
const kitchenBreadSentence2 = 'They measured tea leaves, checked the spoon, and kept the oven clean.'
const kitchenBreadSentence3 = 'The bread looked good and ready on the tray.'

const weatherWatchSentence1 = 'On a cloudy morning, the weather team checked the chart by the room door.'
const weatherWatchSentence2 = 'They found a wood seat, a blue boot, and a neat sign.'
const weatherWatchSentence3 = 'The room stayed calm while the rain tapped the glass.'

const treeStudySentence1 = 'The leaf study team carried a book and a clean note card into the tree room.'
const treeStudySentence2 = 'They wrote about a dream, a green branch, and a little pond.'
const treeStudySentence3 = 'The leaf stayed on the page while the team talked softly.'

const poolPartySentence1 = 'At the pool party, the team wore a boot and passed a spoon of fruit to each friend.'
const poolPartySentence2 = 'The food tasted good, and the room felt bright.'
const poolPartySentence3 = 'A blue pool card helped the team keep track of each turn.'

const gardenMorningSentence1 = 'At the garden morning, the clean team watched the head gardener water the beds.'
const gardenMorningSentence2 = 'A spoon of soil helped one seed sprout near the beach path.'
const gardenMorningSentence3 = 'Everyone said the new plant looked good by noon.'

export const grade2WordForgeVariableVowelsOoEaPassages: Passage[] = [
  createPassage({
    passageIdentifier: OO_EA_PASSAGE_IDS.moonRoom,
    passageText: [moonRoomSentence1, moonRoomSentence2, moonRoomSentence3].join(' '),
    sentences: [
      { sentenceId: 'oo-ea-p1-s1', text: moonRoomSentence1 },
      { sentenceId: 'oo-ea-p1-s2', text: moonRoomSentence2 },
      { sentenceId: 'oo-ea-p1-s3', text: moonRoomSentence3 },
    ],
    readingContext: 'Moon room word study with oo and ea patterns.',
    targets: [
      {
        targetId: 'g2-oo-ea-p1-moon',
        sentenceId: 'oo-ea-p1-s1',
        surfaceWord: 'moon',
        focusParts: [
          { text: 'm', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'n', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'm', speechText: 'm' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'n', speechText: 'n' },
        ],
        spokenChunks: [
          { displayText: 'm', speechText: 'm' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'n', speechText: 'n' },
        ],
        blendSpeechText: 'moon',
        wholeWordSpeechText: 'moon',
        sentenceSpeechText: moonRoomSentence1,
      },
      {
        targetId: 'g2-oo-ea-p1-team',
        sentenceId: 'oo-ea-p1-s1',
        surfaceWord: 'team',
        focusParts: [
          { text: 't', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'm', emphasis: false },
        ],
        displayChunks: [
          { displayText: 't', speechText: 't' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'm', speechText: 'm' },
        ],
        spokenChunks: [
          { displayText: 't', speechText: 't' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'm', speechText: 'm' },
        ],
        blendSpeechText: 'team',
        wholeWordSpeechText: 'team',
        sentenceSpeechText: moonRoomSentence1,
      },
      {
        targetId: 'g2-oo-ea-p1-spoon',
        sentenceId: 'oo-ea-p1-s2',
        surfaceWord: 'spoon',
        focusParts: [
          { text: 'sp', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'n', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'sp', speechText: 'sp' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'n', speechText: 'n' },
        ],
        spokenChunks: [
          { displayText: 'sp', speechText: 'sp' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'n', speechText: 'n' },
        ],
        blendSpeechText: 'spoon',
        wholeWordSpeechText: 'spoon',
        sentenceSpeechText: moonRoomSentence2,
      },
      {
        targetId: 'g2-oo-ea-p1-book',
        sentenceId: 'oo-ea-p1-s2',
        surfaceWord: 'book',
        focusParts: [
          { text: 'b', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'k', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'k', speechText: 'k' },
        ],
        spokenChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'k', speechText: 'k' },
        ],
        blendSpeechText: 'book',
        wholeWordSpeechText: 'book',
        sentenceSpeechText: moonRoomSentence2,
      },
    ],
  }),
  createPassage({
    passageIdentifier: OO_EA_PASSAGE_IDS.beachCleanup,
    passageText: [beachCleanupSentence1, beachCleanupSentence2, beachCleanupSentence3].join(' '),
    sentences: [
      { sentenceId: 'oo-ea-p2-s1', text: beachCleanupSentence1 },
      { sentenceId: 'oo-ea-p2-s2', text: beachCleanupSentence2 },
      { sentenceId: 'oo-ea-p2-s3', text: beachCleanupSentence3 },
    ],
    readingContext: 'Beach cleanup word study with oo and ea patterns.',
    targets: [
      {
        targetId: 'g2-oo-ea-p2-beach',
        sentenceId: 'oo-ea-p2-s1',
        surfaceWord: 'beach',
        focusParts: [
          { text: 'b', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'ch', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'ch', speechText: 'ch' },
        ],
        spokenChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'ch', speechText: 'ch' },
        ],
        blendSpeechText: 'beach',
        wholeWordSpeechText: 'beach',
        sentenceSpeechText: beachCleanupSentence1,
      },
      {
        targetId: 'g2-oo-ea-p2-clean',
        sentenceId: 'oo-ea-p2-s1',
        surfaceWord: 'clean',
        focusParts: [
          { text: 'cl', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'n', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'cl', speechText: 'cl' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'n', speechText: 'n' },
        ],
        spokenChunks: [
          { displayText: 'cl', speechText: 'cl' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'n', speechText: 'n' },
        ],
        blendSpeechText: 'clean',
        wholeWordSpeechText: 'clean',
        sentenceSpeechText: beachCleanupSentence1,
      },
      {
        targetId: 'g2-oo-ea-p2-boots',
        sentenceId: 'oo-ea-p2-s2',
        surfaceWord: 'boots',
        focusParts: [
          { text: 'b', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'ts', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'ts', speechText: 'ts' },
        ],
        spokenChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'ts', speechText: 'ts' },
        ],
        blendSpeechText: 'boots',
        wholeWordSpeechText: 'boots',
        sentenceSpeechText: beachCleanupSentence2,
      },
      {
        targetId: 'g2-oo-ea-p2-leaf',
        sentenceId: 'oo-ea-p2-s3',
        surfaceWord: 'leaf',
        focusParts: [
          { text: 'l', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'f', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'l', speechText: 'l' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'f', speechText: 'f' },
        ],
        spokenChunks: [
          { displayText: 'l', speechText: 'l' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'f', speechText: 'f' },
        ],
        blendSpeechText: 'leaf',
        wholeWordSpeechText: 'leaf',
        sentenceSpeechText: beachCleanupSentence3,
      },
    ],
  }),
  createPassage({
    passageIdentifier: OO_EA_PASSAGE_IDS.kitchenBread,
    passageText: [kitchenBreadSentence1, kitchenBreadSentence2, kitchenBreadSentence3].join(' '),
    sentences: [
      { sentenceId: 'oo-ea-p3-s1', text: kitchenBreadSentence1 },
      { sentenceId: 'oo-ea-p3-s2', text: kitchenBreadSentence2 },
      { sentenceId: 'oo-ea-p3-s3', text: kitchenBreadSentence3 },
    ],
    readingContext: 'Kitchen word study with oo and ea patterns.',
    targets: [
      {
        targetId: 'g2-oo-ea-p3-bread',
        sentenceId: 'oo-ea-p3-s1',
        surfaceWord: 'bread',
        focusParts: [
          { text: 'br', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'd', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'br', speechText: 'br' },
          { displayText: 'ea', speechText: 'eh' },
          { displayText: 'd', speechText: 'd' },
        ],
        spokenChunks: [
          { displayText: 'br', speechText: 'br' },
          { displayText: 'ea', speechText: 'eh' },
          { displayText: 'd', speechText: 'd' },
        ],
        blendSpeechText: 'bread',
        wholeWordSpeechText: 'bread',
        sentenceSpeechText: kitchenBreadSentence1,
      },
      {
        targetId: 'g2-oo-ea-p3-tea',
        sentenceId: 'oo-ea-p3-s2',
        surfaceWord: 'tea',
        focusParts: [
          { text: 't', emphasis: false },
          { text: 'ea', emphasis: true },
        ],
        displayChunks: [
          { displayText: 't', speechText: 't' },
          { displayText: 'ea', speechText: 'ee' },
        ],
        spokenChunks: [
          { displayText: 't', speechText: 't' },
          { displayText: 'ea', speechText: 'ee' },
        ],
        blendSpeechText: 'tea',
        wholeWordSpeechText: 'tea',
        sentenceSpeechText: kitchenBreadSentence2,
      },
      {
        targetId: 'g2-oo-ea-p3-spoon',
        sentenceId: 'oo-ea-p3-s2',
        surfaceWord: 'spoon',
        focusParts: [
          { text: 'sp', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'n', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'sp', speechText: 'sp' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'n', speechText: 'n' },
        ],
        spokenChunks: [
          { displayText: 'sp', speechText: 'sp' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'n', speechText: 'n' },
        ],
        blendSpeechText: 'spoon',
        wholeWordSpeechText: 'spoon',
        sentenceSpeechText: kitchenBreadSentence2,
      },
      {
        targetId: 'g2-oo-ea-p3-good',
        sentenceId: 'oo-ea-p3-s3',
        surfaceWord: 'good',
        focusParts: [
          { text: 'g', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'd', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'g', speechText: 'g' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        spokenChunks: [
          { displayText: 'g', speechText: 'g' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        blendSpeechText: 'good',
        wholeWordSpeechText: 'good',
        sentenceSpeechText: kitchenBreadSentence3,
      },
      {
        targetId: 'g2-oo-ea-p3-ready',
        sentenceId: 'oo-ea-p3-s3',
        surfaceWord: 'ready',
        focusParts: [
          { text: 'r', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'dy', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'r', speechText: 'r' },
          { displayText: 'ea', speechText: 'eh' },
          { displayText: 'dy', speechText: 'dy' },
        ],
        spokenChunks: [
          { displayText: 'r', speechText: 'r' },
          { displayText: 'ea', speechText: 'eh' },
          { displayText: 'dy', speechText: 'dy' },
        ],
        blendSpeechText: 'ready',
        wholeWordSpeechText: 'ready',
        sentenceSpeechText: kitchenBreadSentence3,
      },
    ],
  }),
  createPassage({
    passageIdentifier: OO_EA_PASSAGE_IDS.weatherWatch,
    passageText: [weatherWatchSentence1, weatherWatchSentence2, weatherWatchSentence3].join(' '),
    sentences: [
      { sentenceId: 'oo-ea-p4-s1', text: weatherWatchSentence1 },
      { sentenceId: 'oo-ea-p4-s2', text: weatherWatchSentence2 },
      { sentenceId: 'oo-ea-p4-s3', text: weatherWatchSentence3 },
    ],
    readingContext: 'Weather watch word study with oo and ea patterns.',
    targets: [
      {
        targetId: 'g2-oo-ea-p4-weather',
        sentenceId: 'oo-ea-p4-s1',
        surfaceWord: 'weather',
        focusParts: [
          { text: 'w', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'ther', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'w', speechText: 'w' },
          { displayText: 'ea', speechText: 'eh' },
          { displayText: 'ther', speechText: 'ther' },
        ],
        spokenChunks: [
          { displayText: 'w', speechText: 'w' },
          { displayText: 'ea', speechText: 'eh' },
          { displayText: 'ther', speechText: 'ther' },
        ],
        blendSpeechText: 'weather',
        wholeWordSpeechText: 'weather',
        sentenceSpeechText: weatherWatchSentence1,
      },
      {
        targetId: 'g2-oo-ea-p4-room',
        sentenceId: 'oo-ea-p4-s1',
        surfaceWord: 'room',
        focusParts: [
          { text: 'r', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'm', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'r', speechText: 'r' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'm', speechText: 'm' },
        ],
        spokenChunks: [
          { displayText: 'r', speechText: 'r' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'm', speechText: 'm' },
        ],
        blendSpeechText: 'room',
        wholeWordSpeechText: 'room',
        sentenceSpeechText: weatherWatchSentence1,
      },
      {
        targetId: 'g2-oo-ea-p4-seat',
        sentenceId: 'oo-ea-p4-s2',
        surfaceWord: 'seat',
        focusParts: [
          { text: 's', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 't', emphasis: false },
        ],
        displayChunks: [
          { displayText: 's', speechText: 's' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 't', speechText: 't' },
        ],
        spokenChunks: [
          { displayText: 's', speechText: 's' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 't', speechText: 't' },
        ],
        blendSpeechText: 'seat',
        wholeWordSpeechText: 'seat',
        sentenceSpeechText: weatherWatchSentence2,
      },
      {
        targetId: 'g2-oo-ea-p4-boot',
        sentenceId: 'oo-ea-p4-s2',
        surfaceWord: 'boot',
        focusParts: [
          { text: 'b', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 't', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 't', speechText: 't' },
        ],
        spokenChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 't', speechText: 't' },
        ],
        blendSpeechText: 'boot',
        wholeWordSpeechText: 'boot',
        sentenceSpeechText: weatherWatchSentence2,
      },
      {
        targetId: 'g2-oo-ea-p4-wood',
        sentenceId: 'oo-ea-p4-s2',
        surfaceWord: 'wood',
        focusParts: [
          { text: 'w', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'd', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'w', speechText: 'w' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        spokenChunks: [
          { displayText: 'w', speechText: 'w' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        blendSpeechText: 'wood',
        wholeWordSpeechText: 'wood',
        sentenceSpeechText: weatherWatchSentence2,
      },
    ],
  }),
  createPassage({
    passageIdentifier: OO_EA_PASSAGE_IDS.treeStudy,
    passageText: [treeStudySentence1, treeStudySentence2, treeStudySentence3].join(' '),
    sentences: [
      { sentenceId: 'oo-ea-p5-s1', text: treeStudySentence1 },
      { sentenceId: 'oo-ea-p5-s2', text: treeStudySentence2 },
      { sentenceId: 'oo-ea-p5-s3', text: treeStudySentence3 },
    ],
    readingContext: 'Tree study word lab with oo and ea patterns.',
    targets: [
      {
        targetId: 'g2-oo-ea-p5-leaf',
        sentenceId: 'oo-ea-p5-s1',
        surfaceWord: 'leaf',
        focusParts: [
          { text: 'l', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'f', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'l', speechText: 'l' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'f', speechText: 'f' },
        ],
        spokenChunks: [
          { displayText: 'l', speechText: 'l' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'f', speechText: 'f' },
        ],
        blendSpeechText: 'leaf',
        wholeWordSpeechText: 'leaf',
        sentenceSpeechText: treeStudySentence1,
      },
      {
        targetId: 'g2-oo-ea-p5-book',
        sentenceId: 'oo-ea-p5-s1',
        surfaceWord: 'book',
        focusParts: [
          { text: 'b', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'k', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'k', speechText: 'k' },
        ],
        spokenChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'k', speechText: 'k' },
        ],
        blendSpeechText: 'book',
        wholeWordSpeechText: 'book',
        sentenceSpeechText: treeStudySentence1,
      },
      {
        targetId: 'g2-oo-ea-p5-clean',
        sentenceId: 'oo-ea-p5-s1',
        surfaceWord: 'clean',
        focusParts: [
          { text: 'cl', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'n', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'cl', speechText: 'cl' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'n', speechText: 'n' },
        ],
        spokenChunks: [
          { displayText: 'cl', speechText: 'cl' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'n', speechText: 'n' },
        ],
        blendSpeechText: 'clean',
        wholeWordSpeechText: 'clean',
        sentenceSpeechText: treeStudySentence1,
      },
      {
        targetId: 'g2-oo-ea-p5-dream',
        sentenceId: 'oo-ea-p5-s2',
        surfaceWord: 'dream',
        focusParts: [
          { text: 'dr', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'm', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'dr', speechText: 'dr' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'm', speechText: 'm' },
        ],
        spokenChunks: [
          { displayText: 'dr', speechText: 'dr' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'm', speechText: 'm' },
        ],
        blendSpeechText: 'dream',
        wholeWordSpeechText: 'dream',
        sentenceSpeechText: treeStudySentence2,
      },
      {
        targetId: 'g2-oo-ea-p5-team',
        sentenceId: 'oo-ea-p5-s3',
        surfaceWord: 'team',
        focusParts: [
          { text: 't', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'm', emphasis: false },
        ],
        displayChunks: [
          { displayText: 't', speechText: 't' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'm', speechText: 'm' },
        ],
        spokenChunks: [
          { displayText: 't', speechText: 't' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'm', speechText: 'm' },
        ],
        blendSpeechText: 'team',
        wholeWordSpeechText: 'team',
        sentenceSpeechText: treeStudySentence3,
      },
    ],
  }),
  createPassage({
    passageIdentifier: OO_EA_PASSAGE_IDS.poolParty,
    passageText: [poolPartySentence1, poolPartySentence2, poolPartySentence3].join(' '),
    sentences: [
      { sentenceId: 'oo-ea-p6-s1', text: poolPartySentence1 },
      { sentenceId: 'oo-ea-p6-s2', text: poolPartySentence2 },
      { sentenceId: 'oo-ea-p6-s3', text: poolPartySentence3 },
    ],
    readingContext: 'Pool party word study with oo and ea patterns.',
    targets: [
      {
        targetId: 'g2-oo-ea-p6-pool',
        sentenceId: 'oo-ea-p6-s1',
        surfaceWord: 'pool',
        focusParts: [
          { text: 'p', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'l', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'p', speechText: 'p' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'l', speechText: 'l' },
        ],
        spokenChunks: [
          { displayText: 'p', speechText: 'p' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'l', speechText: 'l' },
        ],
        blendSpeechText: 'pool',
        wholeWordSpeechText: 'pool',
        sentenceSpeechText: poolPartySentence1,
      },
      {
        targetId: 'g2-oo-ea-p6-boot',
        sentenceId: 'oo-ea-p6-s1',
        surfaceWord: 'boot',
        focusParts: [
          { text: 'b', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 't', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 't', speechText: 't' },
        ],
        spokenChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 't', speechText: 't' },
        ],
        blendSpeechText: 'boot',
        wholeWordSpeechText: 'boot',
        sentenceSpeechText: poolPartySentence1,
      },
      {
        targetId: 'g2-oo-ea-p6-food',
        sentenceId: 'oo-ea-p6-s2',
        surfaceWord: 'food',
        focusParts: [
          { text: 'f', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'd', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'f', speechText: 'f' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        spokenChunks: [
          { displayText: 'f', speechText: 'f' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        blendSpeechText: 'food',
        wholeWordSpeechText: 'food',
        sentenceSpeechText: poolPartySentence2,
      },
      {
        targetId: 'g2-oo-ea-p6-good',
        sentenceId: 'oo-ea-p6-s2',
        surfaceWord: 'good',
        focusParts: [
          { text: 'g', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'd', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'g', speechText: 'g' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        spokenChunks: [
          { displayText: 'g', speechText: 'g' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        blendSpeechText: 'good',
        wholeWordSpeechText: 'good',
        sentenceSpeechText: poolPartySentence2,
      },
      {
        targetId: 'g2-oo-ea-p6-team',
        sentenceId: 'oo-ea-p6-s3',
        surfaceWord: 'team',
        focusParts: [
          { text: 't', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'm', emphasis: false },
        ],
        displayChunks: [
          { displayText: 't', speechText: 't' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'm', speechText: 'm' },
        ],
        spokenChunks: [
          { displayText: 't', speechText: 't' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'm', speechText: 'm' },
        ],
        blendSpeechText: 'team',
        wholeWordSpeechText: 'team',
        sentenceSpeechText: poolPartySentence3,
      },
    ],
  }),
  createPassage({
    passageIdentifier: OO_EA_PASSAGE_IDS.gardenMorning,
    passageText: [gardenMorningSentence1, gardenMorningSentence2, gardenMorningSentence3].join(' '),
    sentences: [
      { sentenceId: 'oo-ea-p7-s1', text: gardenMorningSentence1 },
      { sentenceId: 'oo-ea-p7-s2', text: gardenMorningSentence2 },
      { sentenceId: 'oo-ea-p7-s3', text: gardenMorningSentence3 },
    ],
    readingContext: 'Garden morning word study with oo and ea patterns.',
    targets: [
      {
        targetId: 'g2-oo-ea-p7-head',
        sentenceId: 'oo-ea-p7-s1',
        surfaceWord: 'head',
        focusParts: [
          { text: 'h', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'd', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'h', speechText: 'h' },
          { displayText: 'ea', speechText: 'eh' },
          { displayText: 'd', speechText: 'd' },
        ],
        spokenChunks: [
          { displayText: 'h', speechText: 'h' },
          { displayText: 'ea', speechText: 'eh' },
          { displayText: 'd', speechText: 'd' },
        ],
        blendSpeechText: 'head',
        wholeWordSpeechText: 'head',
        sentenceSpeechText: gardenMorningSentence1,
      },
      {
        targetId: 'g2-oo-ea-p7-clean',
        sentenceId: 'oo-ea-p7-s1',
        surfaceWord: 'clean',
        focusParts: [
          { text: 'cl', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'n', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'cl', speechText: 'cl' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'n', speechText: 'n' },
        ],
        spokenChunks: [
          { displayText: 'cl', speechText: 'cl' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'n', speechText: 'n' },
        ],
        blendSpeechText: 'clean',
        wholeWordSpeechText: 'clean',
        sentenceSpeechText: gardenMorningSentence1,
      },
      {
        targetId: 'g2-oo-ea-p7-spoon',
        sentenceId: 'oo-ea-p7-s2',
        surfaceWord: 'spoon',
        focusParts: [
          { text: 'sp', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'n', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'sp', speechText: 'sp' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'n', speechText: 'n' },
        ],
        spokenChunks: [
          { displayText: 'sp', speechText: 'sp' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'n', speechText: 'n' },
        ],
        blendSpeechText: 'spoon',
        wholeWordSpeechText: 'spoon',
        sentenceSpeechText: gardenMorningSentence2,
      },
      {
        targetId: 'g2-oo-ea-p7-beach',
        sentenceId: 'oo-ea-p7-s2',
        surfaceWord: 'beach',
        focusParts: [
          { text: 'b', emphasis: false },
          { text: 'ea', emphasis: true },
          { text: 'ch', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'ch', speechText: 'ch' },
        ],
        spokenChunks: [
          { displayText: 'b', speechText: 'b' },
          { displayText: 'ea', speechText: 'ee' },
          { displayText: 'ch', speechText: 'ch' },
        ],
        blendSpeechText: 'beach',
        wholeWordSpeechText: 'beach',
        sentenceSpeechText: gardenMorningSentence2,
      },
      {
        targetId: 'g2-oo-ea-p7-good',
        sentenceId: 'oo-ea-p7-s3',
        surfaceWord: 'good',
        focusParts: [
          { text: 'g', emphasis: false },
          { text: 'oo', emphasis: true },
          { text: 'd', emphasis: false },
        ],
        displayChunks: [
          { displayText: 'g', speechText: 'g' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        spokenChunks: [
          { displayText: 'g', speechText: 'g' },
          { displayText: 'oo', speechText: 'oo' },
          { displayText: 'd', speechText: 'd' },
        ],
        blendSpeechText: 'good',
        wholeWordSpeechText: 'good',
        sentenceSpeechText: gardenMorningSentence3,
      },
    ],
  }),
]
