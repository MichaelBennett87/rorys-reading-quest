import type { Passage, WordSupportTarget } from '../../../../types'
import {
  THEME_TRAIL_CONTENT_VERSION,
  THEME_TRAIL_PASSAGE_KEYS,
  THEME_TRAIL_PASSAGE_IDS,
  themeTrailSentenceId,
  themeTrailSupportTargetId,
} from './ids'

function supportChunks(chunks: Array<[string, string]>) {
  return chunks.map(([displayText, speechText]) => ({ displayText, speechText }))
}

function supportTarget(spec: {
  passageId: string
  passageKey: string
  targetKey: string
  sentenceId: string
  surfaceWord: string
  focusParts: { text: string; emphasis: boolean }[]
  displayChunks: { displayText: string; speechText: string }[]
  spokenChunks: { displayText: string; speechText: string }[]
  blendSpeechText: string
  wholeWordSpeechText: string
  sentenceSpeechText: string
}): WordSupportTarget {
  return {
    targetId: themeTrailSupportTargetId(spec.passageKey, spec.targetKey),
    passageId: spec.passageId,
    sentenceId: spec.sentenceId,
    surfaceWord: spec.surfaceWord,
    focusParts: spec.focusParts,
    displayChunks: spec.displayChunks,
    spokenChunks: spec.spokenChunks,
    blendSpeechText: spec.blendSpeechText,
    wholeWordSpeechText: spec.wholeWordSpeechText,
    sentenceSpeechText: spec.sentenceSpeechText,
    reviewStatus: 'DRAFT',
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
  }
}

function createPassage(spec: {
  passageIdentifier: string
  passageKey: string
  readingContext: string
  sentences: string[]
  supportTargets: Array<{
    targetKey: string
    sentenceNumber: number
    surfaceWord: string
    focusParts: { text: string; emphasis: boolean }[]
    displayChunks: Array<[string, string]>
    spokenChunks: Array<[string, string]>
    blendSpeechText: string
    wholeWordSpeechText: string
    sentenceSpeechText: string
  }>
}): Passage {
  return {
    passageIdentifier: spec.passageIdentifier,
    gradeBand: 2,
    passageText: spec.sentences.join(' '),
    sentences: spec.sentences.map((text, index) => ({
      sentenceId: themeTrailSentenceId(spec.passageKey, index + 1),
      text,
    })),
    readingContext: spec.readingContext,
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: spec.supportTargets.map((target) =>
      supportTarget({
        passageId: spec.passageIdentifier,
        passageKey: spec.passageKey,
        targetKey: target.targetKey,
        sentenceId: themeTrailSentenceId(spec.passageKey, target.sentenceNumber),
        surfaceWord: target.surfaceWord,
        focusParts: target.focusParts,
        displayChunks: supportChunks(target.displayChunks),
        spokenChunks: supportChunks(target.spokenChunks),
        blendSpeechText: target.blendSpeechText,
        wholeWordSpeechText: target.wholeWordSpeechText,
        sentenceSpeechText: target.sentenceSpeechText,
      }),
    ),
  }
}

export const themeTrailPassages: Passage[] = [
  createPassage({
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.gardenHelp,
    passageKey: THEME_TRAIL_PASSAGE_KEYS.gardenHelp,
    readingContext: 'A story about asking for help at a community garden before a seed swap.',
    sentences: [
      'On a sunny Saturday morning, Tia carried poster strips to the community garden.',
      'The welcome sign had slid sideways in the wind, and the words were hard to read.',
      'Tia tried to lift the board alone, but it wobbled.',
      'She asked her neighbor, Ben, for help, and they carefully held the sign together while Tia tied the rope tighter.',
      'By the time the seed swap began, the sign stood straight, and Tia smiled because the job felt easier with help.',
    ],
    supportTargets: [
      {
        targetKey: 'community',
        sentenceNumber: 1,
        surfaceWord: 'community',
        focusParts: [{ text: 'com', emphasis: true }, { text: 'mu', emphasis: false }, { text: 'ni', emphasis: false }, { text: 'ty', emphasis: false }],
        displayChunks: [['com', 'com'], ['mu', 'mu'], ['ni', 'ni'], ['ty', 'ty']],
        spokenChunks: [['com', 'com'], ['mu', 'mu'], ['ni', 'ni'], ['ty', 'ty']],
        blendSpeechText: 'com - mu - ni - ty',
        wholeWordSpeechText: 'community',
        sentenceSpeechText: 'On a sunny Saturday morning, Tia carried poster strips to the community garden.',
      },
      {
        targetKey: 'carefully',
        sentenceNumber: 4,
        surfaceWord: 'carefully',
        focusParts: [{ text: 'care', emphasis: true }, { text: 'ful', emphasis: false }, { text: 'ly', emphasis: false }],
        displayChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        spokenChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        blendSpeechText: 'care - ful - ly',
        wholeWordSpeechText: 'carefully',
        sentenceSpeechText: 'She asked her neighbor, Ben, for help, and they carefully held the sign together while Tia tied the rope tighter.',
      },
      {
        targetKey: 'together',
        sentenceNumber: 4,
        surfaceWord: 'together',
        focusParts: [{ text: 'to', emphasis: true }, { text: 'geth', emphasis: false }, { text: 'er', emphasis: false }],
        displayChunks: [['to', 'to'], ['geth', 'geth'], ['er', 'er']],
        spokenChunks: [['to', 'to'], ['geth', 'geth'], ['er', 'er']],
        blendSpeechText: 'to - geth - er',
        wholeWordSpeechText: 'together',
        sentenceSpeechText: 'She asked her neighbor, Ben, for help, and they carefully held the sign together while Tia tied the rope tighter.',
      },
      {
        targetKey: 'easier',
        sentenceNumber: 5,
        surfaceWord: 'easier',
        focusParts: [{ text: 'eas', emphasis: true }, { text: 'ier', emphasis: false }],
        displayChunks: [['eas', 'eas'], ['ier', 'ier']],
        spokenChunks: [['eas', 'eas'], ['ier', 'ier']],
        blendSpeechText: 'eas - ier',
        wholeWordSpeechText: 'easier',
        sentenceSpeechText: 'By the time the seed swap began, the sign stood straight, and Tia smiled because the job felt easier with help.',
      },
    ],
  }),
  createPassage({
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.libraryPause,
    passageKey: THEME_TRAIL_PASSAGE_KEYS.libraryPause,
    readingContext: 'A story about waiting patiently at the library to notice a missing label.',
    sentences: [
      'After school on a rainy afternoon, Nia helped sort picture books at the library.',
      'She wanted to hand out the bird bookmarks right away, but the stack looked messy.',
      'Nia patiently counted the books again and waited until the shelves were neat.',
      'Then she noticed a missing label tucked behind a return bin.',
      'She smiled, placed it in the right spot, and the display looked ready for story time.',
    ],
    supportTargets: [
      {
        targetKey: 'library',
        sentenceNumber: 1,
        surfaceWord: 'library',
        focusParts: [{ text: 'lib', emphasis: true }, { text: 'rar', emphasis: false }, { text: 'y', emphasis: false }],
        displayChunks: [['lib', 'lib'], ['rar', 'rar'], ['y', 'y']],
        spokenChunks: [['lib', 'lib'], ['rar', 'rar'], ['y', 'y']],
        blendSpeechText: 'lib - rar - y',
        wholeWordSpeechText: 'library',
        sentenceSpeechText: 'After school on a rainy afternoon, Nia helped sort picture books at the library.',
      },
      {
        targetKey: 'patiently',
        sentenceNumber: 3,
        surfaceWord: 'patiently',
        focusParts: [{ text: 'patient', emphasis: true }, { text: 'ly', emphasis: false }],
        displayChunks: [['patient', 'patient'], ['ly', 'ly']],
        spokenChunks: [['patient', 'patient'], ['ly', 'ly']],
        blendSpeechText: 'patient - ly',
        wholeWordSpeechText: 'patiently',
        sentenceSpeechText: 'Nia patiently counted the books again and waited until the shelves were neat.',
      },
      {
        targetKey: 'noticed',
        sentenceNumber: 4,
        surfaceWord: 'noticed',
        focusParts: [{ text: 'no', emphasis: true }, { text: 'ticed', emphasis: false }],
        displayChunks: [['no', 'no'], ['ticed', 'ticed']],
        spokenChunks: [['no', 'no'], ['ticed', 'ticed']],
        blendSpeechText: 'no - ticed',
        wholeWordSpeechText: 'noticed',
        sentenceSpeechText: 'Then she noticed a missing label tucked behind a return bin.',
      },
      {
        targetKey: 'display',
        sentenceNumber: 5,
        surfaceWord: 'display',
        focusParts: [{ text: 'dis', emphasis: true }, { text: 'play', emphasis: false }],
        displayChunks: [['dis', 'dis'], ['play', 'play']],
        spokenChunks: [['dis', 'dis'], ['play', 'play']],
        blendSpeechText: 'dis - play',
        wholeWordSpeechText: 'display',
        sentenceSpeechText: 'She smiled, placed it in the right spot, and the display looked ready for story time.',
      },
    ],
  }),
  createPassage({
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
    passageKey: THEME_TRAIL_PASSAGE_KEYS.hallwayTruth,
    readingContext: 'A story about telling the truth after a paint jar spills during cleanup.',
    sentences: [
      'During lunch at school, Marco found a cracked paint jar by the mural wall.',
      'Blue drops dotted the floor, and he knew the jar had tipped during cleanup.',
      'Marco wanted to hide the jar and walk away, but he told Ms. Reed the truth.',
      'He also showed where the spill began and helped wipe the floor.',
      'Ms. Reed thanked him, and the class fixed the mural together.',
    ],
    supportTargets: [
      {
        targetKey: 'mural',
        sentenceNumber: 1,
        surfaceWord: 'mural',
        focusParts: [{ text: 'mu', emphasis: true }, { text: 'ral', emphasis: false }],
        displayChunks: [['mu', 'mu'], ['ral', 'ral']],
        spokenChunks: [['mu', 'mu'], ['ral', 'ral']],
        blendSpeechText: 'mu - ral',
        wholeWordSpeechText: 'mural',
        sentenceSpeechText: 'During lunch at school, Marco found a cracked paint jar by the mural wall.',
      },
      {
        targetKey: 'truth',
        sentenceNumber: 3,
        surfaceWord: 'truth',
        focusParts: [{ text: 'truth', emphasis: true }],
        displayChunks: [['tru', 'tru'], ['th', 'th']],
        spokenChunks: [['tru', 'tru'], ['th', 'th']],
        blendSpeechText: 'tru - th',
        wholeWordSpeechText: 'truth',
        sentenceSpeechText: 'Marco wanted to hide the jar and walk away, but he told Ms. Reed the truth.',
      },
      {
        targetKey: 'cleanup',
        sentenceNumber: 2,
        surfaceWord: 'cleanup',
        focusParts: [{ text: 'clean', emphasis: true }, { text: 'up', emphasis: false }],
        displayChunks: [['clean', 'clean'], ['up', 'up']],
        spokenChunks: [['clean', 'clean'], ['up', 'up']],
        blendSpeechText: 'clean - up',
        wholeWordSpeechText: 'cleanup',
        sentenceSpeechText: 'Blue drops dotted the floor, and he knew the jar had tipped during cleanup.',
      },
      {
        targetKey: 'together',
        sentenceNumber: 5,
        surfaceWord: 'together',
        focusParts: [{ text: 'to', emphasis: true }, { text: 'geth', emphasis: false }, { text: 'er', emphasis: false }],
        displayChunks: [['to', 'to'], ['geth', 'geth'], ['er', 'er']],
        spokenChunks: [['to', 'to'], ['geth', 'geth'], ['er', 'er']],
        blendSpeechText: 'to - geth - er',
        wholeWordSpeechText: 'together',
        sentenceSpeechText: 'Ms. Reed thanked him, and the class fixed the mural together.',
      },
    ],
  }),
  createPassage({
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.springFair,
    passageKey: THEME_TRAIL_PASSAGE_KEYS.springFair,
    readingContext: 'A story about preparing carefully before spring fair rain arrives.',
    sentences: [
      'Before the spring fair, Lila and her dad packed the seed table in the community center.',
      'Dark clouds gathered outside, and Lila remembered the forecast.',
      'She carefully taped the labels to the crates, covered the tiny pots, and moved the watering can near the door.',
      'When the rain started, the supplies stayed dry.',
      'Lila felt calm because careful preparation kept the fair materials safe.',
    ],
    supportTargets: [
      {
        targetKey: 'carefully',
        sentenceNumber: 3,
        surfaceWord: 'carefully',
        focusParts: [{ text: 'care', emphasis: true }, { text: 'ful', emphasis: false }, { text: 'ly', emphasis: false }],
        displayChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        spokenChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        blendSpeechText: 'care - ful - ly',
        wholeWordSpeechText: 'carefully',
        sentenceSpeechText: 'She carefully taped the labels to the crates, covered the tiny pots, and moved the watering can near the door.',
      },
      {
        targetKey: 'forecast',
        sentenceNumber: 2,
        surfaceWord: 'forecast',
        focusParts: [{ text: 'fore', emphasis: true }, { text: 'cast', emphasis: false }],
        displayChunks: [['fore', 'fore'], ['cast', 'cast']],
        spokenChunks: [['fore', 'fore'], ['cast', 'cast']],
        blendSpeechText: 'fore - cast',
        wholeWordSpeechText: 'forecast',
        sentenceSpeechText: 'Dark clouds gathered outside, and Lila remembered the forecast.',
      },
      {
        targetKey: 'preparation',
        sentenceNumber: 5,
        surfaceWord: 'preparation',
        focusParts: [{ text: 'pre', emphasis: true }, { text: 'pa', emphasis: false }, { text: 'ra', emphasis: false }, { text: 'tion', emphasis: false }],
        displayChunks: [['pre', 'pre'], ['pa', 'pa'], ['ra', 'ra'], ['tion', 'tion']],
        spokenChunks: [['pre', 'pre'], ['pa', 'pa'], ['ra', 'ra'], ['tion', 'tion']],
        blendSpeechText: 'pre - pa - ra - tion',
        wholeWordSpeechText: 'preparation',
        sentenceSpeechText: 'Lila felt calm because careful preparation kept the fair materials safe.',
      },
      {
        targetKey: 'materials',
        sentenceNumber: 5,
        surfaceWord: 'materials',
        focusParts: [{ text: 'ma', emphasis: true }, { text: 'te', emphasis: false }, { text: 'ri', emphasis: false }, { text: 'als', emphasis: false }],
        displayChunks: [['ma', 'ma'], ['te', 'te'], ['ri', 'ri'], ['als', 'als']],
        spokenChunks: [['ma', 'ma'], ['te', 'te'], ['ri', 'ri'], ['als', 'als']],
        blendSpeechText: 'ma - te - ri - als',
        wholeWordSpeechText: 'materials',
        sentenceSpeechText: 'Lila felt calm because careful preparation kept the fair materials safe.',
      },
    ],
  }),
  createPassage({
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.modelBridge,
    passageKey: THEME_TRAIL_PASSAGE_KEYS.modelBridge,
    readingContext: 'A story about different strengths helping two friends build a model bridge.',
    sentences: [
      'At the science club table, Omar and Jun built a model bridge from sticks and tape.',
      'Omar was good at measuring, and Jun was good at holding tiny pieces steady.',
      'Their first try sagged in the middle, so they talked, swapped jobs, and tried again.',
      'Omar measured the next stick while Jun balanced the supports.',
      'The bridge stood up at last, and both boys smiled because their different strengths worked together.',
    ],
    supportTargets: [
      {
        targetKey: 'measuring',
        sentenceNumber: 2,
        surfaceWord: 'measuring',
        focusParts: [{ text: 'mea', emphasis: true }, { text: 'sur', emphasis: false }, { text: 'ing', emphasis: false }],
        displayChunks: [['mea', 'mea'], ['sur', 'sur'], ['ing', 'ing']],
        spokenChunks: [['mea', 'mea'], ['sur', 'sur'], ['ing', 'ing']],
        blendSpeechText: 'mea - sur - ing',
        wholeWordSpeechText: 'measuring',
        sentenceSpeechText: 'Omar was good at measuring, and Jun was good at holding tiny pieces steady.',
      },
      {
        targetKey: 'steady',
        sentenceNumber: 2,
        surfaceWord: 'steady',
        focusParts: [{ text: 'stead', emphasis: true }, { text: 'y', emphasis: false }],
        displayChunks: [['stead', 'stead'], ['y', 'y']],
        spokenChunks: [['stead', 'stead'], ['y', 'y']],
        blendSpeechText: 'stead - y',
        wholeWordSpeechText: 'steady',
        sentenceSpeechText: 'Omar was good at measuring, and Jun was good at holding tiny pieces steady.',
      },
      {
        targetKey: 'different',
        sentenceNumber: 5,
        surfaceWord: 'different',
        focusParts: [{ text: 'dif', emphasis: true }, { text: 'fer', emphasis: false }, { text: 'ent', emphasis: false }],
        displayChunks: [['dif', 'dif'], ['fer', 'fer'], ['ent', 'ent']],
        spokenChunks: [['dif', 'dif'], ['fer', 'fer'], ['ent', 'ent']],
        blendSpeechText: 'dif - fer - ent',
        wholeWordSpeechText: 'different',
        sentenceSpeechText: 'The bridge stood up at last, and both boys smiled because their different strengths worked together.',
      },
      {
        targetKey: 'together',
        sentenceNumber: 5,
        surfaceWord: 'together',
        focusParts: [{ text: 'to', emphasis: true }, { text: 'geth', emphasis: false }, { text: 'er', emphasis: false }],
        displayChunks: [['to', 'to'], ['geth', 'geth'], ['er', 'er']],
        spokenChunks: [['to', 'to'], ['geth', 'geth'], ['er', 'er']],
        blendSpeechText: 'to - geth - er',
        wholeWordSpeechText: 'together',
        sentenceSpeechText: 'The bridge stood up at last, and both boys smiled because their different strengths worked together.',
      },
    ],
  }),
  createPassage({
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.birdhousePlan,
    passageKey: THEME_TRAIL_PASSAGE_KEYS.birdhousePlan,
    readingContext: 'A story about trying a new plan when a birdhouse will not stay steady.',
    sentences: [
      'On a windy afternoon, Ava tried to hang a birdhouse on the fence by the garden.',
      'The first knot slipped twice, and the birdhouse swung sideways.',
      'Ava paused, looked at the twine, and chose a new plan.',
      'She tied the knot around the post instead, then added one more loop to hold it tight.',
      'The birdhouse stayed steady, and Ava felt proud that trying a new plan solved the problem.',
    ],
    supportTargets: [
      {
        targetKey: 'afternoon',
        sentenceNumber: 1,
        surfaceWord: 'afternoon',
        focusParts: [{ text: 'after', emphasis: true }, { text: 'noon', emphasis: false }],
        displayChunks: [['after', 'after'], ['noon', 'noon']],
        spokenChunks: [['after', 'after'], ['noon', 'noon']],
        blendSpeechText: 'af - ter - noon',
        wholeWordSpeechText: 'afternoon',
        sentenceSpeechText: 'On a windy afternoon, Ava tried to hang a birdhouse on the fence by the garden.',
      },
      {
        targetKey: 'instead',
        sentenceNumber: 4,
        surfaceWord: 'instead',
        focusParts: [{ text: 'in', emphasis: true }, { text: 'stead', emphasis: false }],
        displayChunks: [['in', 'in'], ['stead', 'stead']],
        spokenChunks: [['in', 'in'], ['stead', 'stead']],
        blendSpeechText: 'in - stead',
        wholeWordSpeechText: 'instead',
        sentenceSpeechText: 'She tied the knot around the post instead, then added one more loop to hold it tight.',
      },
      {
        targetKey: 'steady',
        sentenceNumber: 5,
        surfaceWord: 'steady',
        focusParts: [{ text: 'stead', emphasis: true }, { text: 'y', emphasis: false }],
        displayChunks: [['stead', 'stead'], ['y', 'y']],
        spokenChunks: [['stead', 'stead'], ['y', 'y']],
        blendSpeechText: 'stead - y',
        wholeWordSpeechText: 'steady',
        sentenceSpeechText: 'The birdhouse stayed steady, and Ava felt proud that trying a new plan solved the problem.',
      },
      {
        targetKey: 'paused',
        sentenceNumber: 3,
        surfaceWord: 'paused',
        focusParts: [{ text: 'paus', emphasis: true }, { text: 'ed', emphasis: false }],
        displayChunks: [['paus', 'paus'], ['ed', 'ed']],
        spokenChunks: [['paus', 'paus'], ['ed', 'ed']],
        blendSpeechText: 'paus - ed',
        wholeWordSpeechText: 'paused',
        sentenceSpeechText: 'Ava paused, looked at the twine, and chose a new plan.',
      },
    ],
  }),
  createPassage({
    passageIdentifier: THEME_TRAIL_PASSAGE_IDS.bookSwapTrust,
    passageKey: THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust,
    readingContext: 'A story about taking responsibility after forgetting to return a borrowed book.',
    sentences: [
      'At the classroom book swap, Eli borrowed a photo book and promised to return it on Friday.',
      'He forgot the date and left the book in his backpack all weekend.',
      'On Monday, Eli told his teacher the truth, returned the book, and wrote an apology note for the class shelf.',
      'He also helped sort the new books before recess.',
      'His teacher smiled because Eli took responsibility and showed he could be trusted again.',
    ],
    supportTargets: [
      {
        targetKey: 'responsibility',
        sentenceNumber: 5,
        surfaceWord: 'responsibility',
        focusParts: [
          { text: 're', emphasis: true },
          { text: 'spon', emphasis: false },
          { text: 'si', emphasis: false },
          { text: 'bil', emphasis: false },
          { text: 'i', emphasis: false },
          { text: 'ty', emphasis: false },
        ],
        displayChunks: [['re', 're'], ['spon', 'spon'], ['si', 'si'], ['bil', 'bil'], ['i', 'i'], ['ty', 'ty']],
        spokenChunks: [['re', 're'], ['spon', 'spon'], ['si', 'si'], ['bil', 'bil'], ['i', 'i'], ['ty', 'ty']],
        blendSpeechText: 're - spon - si - bil - i - ty',
        wholeWordSpeechText: 'responsibility',
        sentenceSpeechText: 'His teacher smiled because Eli took responsibility and showed he could be trusted again.',
      },
      {
        targetKey: 'apology',
        sentenceNumber: 3,
        surfaceWord: 'apology',
        focusParts: [{ text: 'a', emphasis: true }, { text: 'pol', emphasis: false }, { text: 'o', emphasis: false }, { text: 'gy', emphasis: false }],
        displayChunks: [['a', 'a'], ['pol', 'pol'], ['o', 'o'], ['gy', 'gy']],
        spokenChunks: [['a', 'a'], ['pol', 'pol'], ['o', 'o'], ['gy', 'gy']],
        blendSpeechText: 'a - pol - o - gy',
        wholeWordSpeechText: 'apology',
        sentenceSpeechText: 'On Monday, Eli told his teacher the truth, returned the book, and wrote an apology note for the class shelf.',
      },
      {
        targetKey: 'trusted',
        sentenceNumber: 5,
        surfaceWord: 'trusted',
        focusParts: [{ text: 'trust', emphasis: true }, { text: 'ed', emphasis: false }],
        displayChunks: [['trust', 'trust'], ['ed', 'ed']],
        spokenChunks: [['trust', 'trust'], ['ed', 'ed']],
        blendSpeechText: 'trust - ed',
        wholeWordSpeechText: 'trusted',
        sentenceSpeechText: 'His teacher smiled because Eli took responsibility and showed he could be trusted again.',
      },
      {
        targetKey: 'weekend',
        sentenceNumber: 2,
        surfaceWord: 'weekend',
        focusParts: [{ text: 'week', emphasis: true }, { text: 'end', emphasis: false }],
        displayChunks: [['week', 'week'], ['end', 'end']],
        spokenChunks: [['week', 'week'], ['end', 'end']],
        blendSpeechText: 'week - end',
        wholeWordSpeechText: 'weekend',
        sentenceSpeechText: 'He forgot the date and left the book in his backpack all weekend.',
      },
    ],
  }),
]
