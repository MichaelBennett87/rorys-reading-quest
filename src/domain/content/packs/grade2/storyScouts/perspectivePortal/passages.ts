import type { Passage, WordSupportTarget } from '../../../../types'
import {
  PERSPECTIVE_PORTAL_CONTENT_VERSION,
  PERSPECTIVE_PORTAL_PASSAGE_KEYS,
  PERSPECTIVE_PORTAL_PASSAGE_IDS,
  perspectivePortalSentenceId,
  perspectivePortalSupportTargetId,
} from './ids'

type PerspectivePortalPassageSlug =
  (typeof PERSPECTIVE_PORTAL_PASSAGE_KEYS)[keyof typeof PERSPECTIVE_PORTAL_PASSAGE_KEYS]

export interface PerspectivePortalCharacterBlueprint {
  characterId: string
  characterName: string
  perspectiveStatement: string
  supportingSentenceNumbers: number[]
  wordsSentenceNumbers: number[]
  actionSentenceNumbers: number[]
  feelingSentenceNumbers: number[]
  choiceSentenceNumbers: number[]
}

export interface PerspectivePortalPassageTargetBlueprint {
  targetKey: string
  sentenceNumber: number
  surfaceWord: string
  focusParts: { text: string; emphasis: boolean }[]
  displayChunks: Array<[string, string]>
  spokenChunks: Array<[string, string]>
  blendSpeechText: string
  wholeWordSpeechText: string
  sentenceSpeechText: string
}

export interface PerspectivePortalPassageBlueprint {
  passageIdentifier: string
  passageKey: PerspectivePortalPassageSlug
  readingContext: string
  sharedSituation: string
  topicLabel: string
  topicDistractor: string
  summaryDistractor: string
  contrastSummary: string
  sentences: string[]
  characters: [PerspectivePortalCharacterBlueprint, PerspectivePortalCharacterBlueprint]
  supportTargets: PerspectivePortalPassageTargetBlueprint[]
}

function supportChunks(chunks: Array<[string, string]>) {
  return chunks.map(([displayText, speechText]) => ({ displayText, speechText }))
}

function supportTarget(spec: {
  passageId: string
  passageKey: PerspectivePortalPassageSlug
  target: PerspectivePortalPassageTargetBlueprint
}): WordSupportTarget {
  return {
    targetId: perspectivePortalSupportTargetId(spec.passageKey, spec.target.targetKey),
    passageId: spec.passageId,
    sentenceId: perspectivePortalSentenceId(spec.passageKey, spec.target.sentenceNumber),
    surfaceWord: spec.target.surfaceWord,
    focusParts: spec.target.focusParts,
    displayChunks: supportChunks(spec.target.displayChunks),
    spokenChunks: supportChunks(spec.target.spokenChunks),
    blendSpeechText: spec.target.blendSpeechText,
    wholeWordSpeechText: spec.target.wholeWordSpeechText,
    sentenceSpeechText: spec.target.sentenceSpeechText,
    reviewStatus: 'DRAFT',
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
  }
}

function createPassage(spec: PerspectivePortalPassageBlueprint): Passage {
  return {
    passageIdentifier: spec.passageIdentifier,
    gradeBand: 2,
    passageText: spec.sentences.join(' '),
    sentences: spec.sentences.map((text, index) => ({
      sentenceId: perspectivePortalSentenceId(spec.passageKey, index + 1),
      text,
    })),
    readingContext: spec.readingContext,
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: spec.supportTargets.map((target) =>
      supportTarget({
        passageId: spec.passageIdentifier,
        passageKey: spec.passageKey,
        target,
      }),
    ),
  }
}

export const perspectivePortalPassageBlueprints: PerspectivePortalPassageBlueprint[] = [
  {
    passageIdentifier: PERSPECTIVE_PORTAL_PASSAGE_IDS.rainyGarden,
    passageKey: PERSPECTIVE_PORTAL_PASSAGE_KEYS.rainyGarden,
    readingContext: 'A story about two garden helpers who see the rainy morning in different ways.',
    sharedSituation: 'preparing the community garden before the seed swap',
    topicLabel: 'covering seedlings before rain',
    topicDistractor: 'the rainy morning',
    summaryDistractor: 'Maya and Theo finished the welcome sign before the visitors came.',
    contrastSummary: 'Maya thinks the rain is a reason to protect the seedlings right away, while Theo thinks they still have time to finish the sign.',
    sentences: [
      'On a rainy Saturday morning, Maya and Theo arrived at the community garden before the seed swap.',
      'Maya noticed gray clouds and said the seedlings should be covered right away.',
      'Theo watched the drizzle and thought they still had time to finish the welcome sign.',
      'Maya carefully spread a tarp over the tiny plants while Theo straightened the sign posts.',
      'Theo then saw the wind grow stronger and gave helpful support by grabbing the rope.',
      'Together they finished the sign and protected the garden beds before the visitors came.',
      'Maya smiled because the quick work kept the plants safe.',
    ],
    characters: [
      {
        characterId: 'maya',
        characterName: 'Maya',
        perspectiveStatement: 'Maya thinks the rainy sky is a reason to cover the seedlings right away.',
        supportingSentenceNumbers: [2, 4, 7],
        wordsSentenceNumbers: [2, 4],
        actionSentenceNumbers: [4, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [2, 4],
      },
      {
        characterId: 'theo',
        characterName: 'Theo',
        perspectiveStatement: 'Theo thinks the drizzle is not a big problem, so he wants to finish the sign first.',
        supportingSentenceNumbers: [3, 5, 6],
        wordsSentenceNumbers: [3, 5],
        actionSentenceNumbers: [3, 5, 6],
        feelingSentenceNumbers: [6],
        choiceSentenceNumbers: [3, 5],
      },
    ],
    supportTargets: [
      {
        targetKey: 'community',
        sentenceNumber: 1,
        surfaceWord: 'community',
        focusParts: [
          { text: 'com', emphasis: true },
          { text: 'mu', emphasis: false },
          { text: 'ni', emphasis: false },
          { text: 'ty', emphasis: false },
        ],
        displayChunks: [['com', 'com'], ['mu', 'mu'], ['ni', 'ni'], ['ty', 'ty']],
        spokenChunks: [['com', 'com'], ['mu', 'mu'], ['ni', 'ni'], ['ty', 'ty']],
        blendSpeechText: 'com - mu - ni - ty',
        wholeWordSpeechText: 'community',
        sentenceSpeechText: 'On a rainy Saturday morning, Maya and Theo arrived at the community garden before the seed swap.',
      },
      {
        targetKey: 'carefully',
        sentenceNumber: 4,
        surfaceWord: 'carefully',
        focusParts: [
          { text: 'care', emphasis: true },
          { text: 'ful', emphasis: false },
          { text: 'ly', emphasis: false },
        ],
        displayChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        spokenChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        blendSpeechText: 'care - ful - ly',
        wholeWordSpeechText: 'carefully',
        sentenceSpeechText: 'Maya carefully spread a tarp over the tiny plants while Theo straightened the sign posts.',
      },
      {
        targetKey: 'helpful',
        sentenceNumber: 5,
        surfaceWord: 'helpful',
        focusParts: [
          { text: 'help', emphasis: true },
          { text: 'ful', emphasis: false },
        ],
        displayChunks: [['help', 'help'], ['ful', 'ful']],
        spokenChunks: [['help', 'help'], ['ful', 'ful']],
        blendSpeechText: 'help - ful',
        wholeWordSpeechText: 'helpful',
        sentenceSpeechText: 'Theo then saw the wind grow stronger and gave helpful support by grabbing the rope.',
      },
      {
        targetKey: 'rainy',
        sentenceNumber: 1,
        surfaceWord: 'rainy',
        focusParts: [
          { text: 'rain', emphasis: true },
          { text: 'y', emphasis: false },
        ],
        displayChunks: [['rain', 'rain'], ['y', 'y']],
        spokenChunks: [['rain', 'rain'], ['y', 'y']],
        blendSpeechText: 'rain - y',
        wholeWordSpeechText: 'rainy',
        sentenceSpeechText: 'On a rainy Saturday morning, Maya and Theo arrived at the community garden before the seed swap.',
      },
    ],
  },
  {
    passageIdentifier: PERSPECTIVE_PORTAL_PASSAGE_IDS.libraryDisplay,
    passageKey: PERSPECTIVE_PORTAL_PASSAGE_KEYS.libraryDisplay,
    readingContext: 'A story about two library helpers who want the same display to feel useful in different ways.',
    sharedSituation: 'setting up a new library display after school',
    topicLabel: 'library display setup',
    topicDistractor: 'the afternoon in the library',
    summaryDistractor: 'Nia and Leo unpacked display cards and made the table neat.',
    contrastSummary: 'Nia wants the display to feel cheerful and colorful, while Leo wants the labels to stay clear and tidy.',
    sentences: [
      'After school in the library, Nia and Leo unpacked a box of display cards.',
      'Nia quietly spread the bright pictures across the table and imagined children smiling.',
      'Leo noticed one card was crooked and wanted to fix the order before anyone came in.',
      'Nia thought the display should look cheerful and full of color.',
      'Leo thought the labels should stay clear so readers could find the books quickly.',
      'They listened to each other, moved the cards, and made the display both bright and tidy.',
      'By story time, both children felt proud of the finished table.',
    ],
    characters: [
      {
        characterId: 'nia',
        characterName: 'Nia',
        perspectiveStatement: 'Nia thinks the display should look cheerful and colorful so readers feel welcome.',
        supportingSentenceNumbers: [2, 4, 6],
        wordsSentenceNumbers: [2, 4],
        actionSentenceNumbers: [2, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [4, 6],
      },
      {
        characterId: 'leo',
        characterName: 'Leo',
        perspectiveStatement: 'Leo thinks the labels should stay clear and tidy so readers can find the books quickly.',
        supportingSentenceNumbers: [3, 5, 6],
        wordsSentenceNumbers: [3, 5],
        actionSentenceNumbers: [3, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [3, 5],
      },
    ],
    supportTargets: [
      {
        targetKey: 'quietly',
        sentenceNumber: 2,
        surfaceWord: 'quietly',
        focusParts: [
          { text: 'quiet', emphasis: true },
          { text: 'ly', emphasis: false },
        ],
        displayChunks: [['quiet', 'quiet'], ['ly', 'ly']],
        spokenChunks: [['quiet', 'quiet'], ['ly', 'ly']],
        blendSpeechText: 'quiet - ly',
        wholeWordSpeechText: 'quietly',
        sentenceSpeechText: 'Nia quietly spread the bright pictures across the table and imagined children smiling.',
      },
      {
        targetKey: 'noticed',
        sentenceNumber: 3,
        surfaceWord: 'noticed',
        focusParts: [
          { text: 'no', emphasis: true },
          { text: 'ticed', emphasis: false },
        ],
        displayChunks: [['no', 'no'], ['ticed', 'ticed']],
        spokenChunks: [['no', 'no'], ['ticed', 'ticed']],
        blendSpeechText: 'no - ticed',
        wholeWordSpeechText: 'noticed',
        sentenceSpeechText: 'Leo noticed one card was crooked and wanted to fix the order before anyone came in.',
      },
      {
        targetKey: 'clear',
        sentenceNumber: 5,
        surfaceWord: 'clear',
        focusParts: [
          { text: 'cl', emphasis: true },
          { text: 'ear', emphasis: false },
        ],
        displayChunks: [['cl', 'cl'], ['ear', 'ear']],
        spokenChunks: [['cl', 'cl'], ['ear', 'ear']],
        blendSpeechText: 'cl - ear',
        wholeWordSpeechText: 'clear',
        sentenceSpeechText: 'Leo thought the labels should stay clear so readers could find the books quickly.',
      },
      {
        targetKey: 'bright',
        sentenceNumber: 2,
        surfaceWord: 'bright',
        focusParts: [
          { text: 'br', emphasis: true },
          { text: 'ight', emphasis: false },
        ],
        displayChunks: [['br', 'br'], ['ight', 'ight']],
        spokenChunks: [['br', 'br'], ['ight', 'ight']],
        blendSpeechText: 'br - ight',
        wholeWordSpeechText: 'bright',
        sentenceSpeechText: 'Nia quietly spread the bright pictures across the table and imagined children smiling.',
      },
    ],
  },
  {
    passageIdentifier: PERSPECTIVE_PORTAL_PASSAGE_IDS.trailRoute,
    passageKey: PERSPECTIVE_PORTAL_PASSAGE_KEYS.trailRoute,
    readingContext: 'A story about two trail walkers who notice the same path in different ways.',
    sharedSituation: 'choosing a route on an evening walk',
    topicLabel: 'choosing a trail route',
    topicDistractor: 'the evening sky',
    summaryDistractor: 'Aria and Ben walked beside the trail and returned to the marker post.',
    contrastSummary: 'Aria thinks the new side path could be exciting and useful, while Ben thinks the familiar marker keeps the walk safe.',
    sentences: [
      'One clear evening, Aria and Ben walked with the nature club beside the trail.',
      'Aria noticed a new side path and thought it would be exciting to explore.',
      'Ben looked at the familiar marker post and wanted to stay on the regular route.',
      'Aria said the new path might show a better viewpoint of the creek.',
      'Ben said the marker post helped him feel safe on the familiar trail.',
      'They made a different decision and chose to walk together, check the new path, and then return to the marked route.',
      'Both children smiled because they could share the walk without getting lost.',
    ],
    characters: [
      {
        characterId: 'aria',
        characterName: 'Aria',
        perspectiveStatement: 'Aria thinks trying the new side path could show a better viewpoint and make the walk exciting.',
        supportingSentenceNumbers: [2, 4, 6],
        wordsSentenceNumbers: [2, 4],
        actionSentenceNumbers: [2, 4, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [2, 4, 6],
      },
      {
        characterId: 'ben',
        characterName: 'Ben',
        perspectiveStatement: 'Ben thinks staying with the familiar marker is safer and easier to trust.',
        supportingSentenceNumbers: [3, 5, 6],
        wordsSentenceNumbers: [3, 5],
        actionSentenceNumbers: [3, 5, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [3, 5],
      },
    ],
    supportTargets: [
      {
        targetKey: 'viewpoint',
        sentenceNumber: 4,
        surfaceWord: 'viewpoint',
        focusParts: [
          { text: 'view', emphasis: true },
          { text: 'point', emphasis: false },
        ],
        displayChunks: [['view', 'view'], ['point', 'point']],
        spokenChunks: [['view', 'view'], ['point', 'point']],
        blendSpeechText: 'view - point',
        wholeWordSpeechText: 'viewpoint',
        sentenceSpeechText: 'Aria said the new path might show a better viewpoint of the creek.',
      },
      {
        targetKey: 'decision',
        sentenceNumber: 6,
        surfaceWord: 'decision',
        focusParts: [
          { text: 'de', emphasis: true },
          { text: 'ci', emphasis: false },
          { text: 'sion', emphasis: false },
        ],
        displayChunks: [['de', 'de'], ['ci', 'ci'], ['sion', 'sion']],
        spokenChunks: [['de', 'de'], ['ci', 'ci'], ['sion', 'sion']],
        blendSpeechText: 'de - ci - sion',
        wholeWordSpeechText: 'decision',
        sentenceSpeechText: 'They decided to walk together, check the new path, and then return to the marked route.',
      },
      {
        targetKey: 'different',
        sentenceNumber: 6,
        surfaceWord: 'different',
        focusParts: [
          { text: 'dif', emphasis: true },
          { text: 'fer', emphasis: false },
          { text: 'ent', emphasis: false },
        ],
        displayChunks: [['dif', 'dif'], ['fer', 'fer'], ['ent', 'ent']],
        spokenChunks: [['dif', 'dif'], ['fer', 'fer'], ['ent', 'ent']],
        blendSpeechText: 'dif - fer - ent',
        wholeWordSpeechText: 'different',
        sentenceSpeechText: 'They decided to walk together, check the new path, and then return to the marked route.',
      },
      {
        targetKey: 'evening',
        sentenceNumber: 1,
        surfaceWord: 'evening',
        focusParts: [
          { text: 'eve', emphasis: true },
          { text: 'ning', emphasis: false },
        ],
        displayChunks: [['eve', 'eve'], ['ning', 'ning']],
        spokenChunks: [['eve', 'eve'], ['ning', 'ning']],
        blendSpeechText: 'eve - ning',
        wholeWordSpeechText: 'evening',
        sentenceSpeechText: 'One clear evening, Aria and Ben walked with the nature club beside the trail.',
      },
    ],
  },
  {
    passageIdentifier: PERSPECTIVE_PORTAL_PASSAGE_IDS.artTable,
    passageKey: PERSPECTIVE_PORTAL_PASSAGE_KEYS.artTable,
    readingContext: 'A story about two helpers who set up an art table in different ways.',
    sharedSituation: 'setting up the community art table before the spring fair',
    topicLabel: 'setting up the art table',
    topicDistractor: 'the spring fair',
    summaryDistractor: 'Jada and Omar set up the art table and waited for the fair.',
    contrastSummary: 'Jada thinks sorting the supplies first will keep the table ready, while Omar thinks the bright banner should go up first to welcome people.',
    sentences: [
      'At the community center, Jada and Omar set up the art table for the spring fair.',
      'Jada thought the paints should be sorted first so the table would stay ready.',
      'Omar wanted to tape up the bright banner right away so the space would feel welcoming.',
      'Jada carefully lined up the jars and counted the brushes.',
      'Omar added the banner and then helped arrange the markers in neat rows.',
      'When the children arrived, the table looked bright and organized.',
      'Jada and Omar felt pleased because they had prepared the table in two different but helpful ways.',
    ],
    characters: [
      {
        characterId: 'jada',
        characterName: 'Jada',
        perspectiveStatement: 'Jada thinks sorting the supplies first will keep the art table ready and organized.',
        supportingSentenceNumbers: [2, 4, 6],
        wordsSentenceNumbers: [2, 4],
        actionSentenceNumbers: [4, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [2, 4],
      },
      {
        characterId: 'omar',
        characterName: 'Omar',
        perspectiveStatement: 'Omar thinks putting up the bright banner first will make the table feel welcoming.',
        supportingSentenceNumbers: [3, 5, 6],
        wordsSentenceNumbers: [3, 5],
        actionSentenceNumbers: [3, 5, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [3, 5],
      },
    ],
    supportTargets: [
      {
        targetKey: 'prepared',
        sentenceNumber: 7,
        surfaceWord: 'prepared',
        focusParts: [
          { text: 'pre', emphasis: true },
          { text: 'pared', emphasis: false },
        ],
        displayChunks: [['pre', 'pre'], ['pared', 'pared']],
        spokenChunks: [['pre', 'pre'], ['pared', 'pared']],
        blendSpeechText: 'pre - pared',
        wholeWordSpeechText: 'prepared',
        sentenceSpeechText: 'Jada and Omar felt pleased because they had prepared the table in two different but helpful ways.',
      },
      {
        targetKey: 'bright',
        sentenceNumber: 3,
        surfaceWord: 'bright',
        focusParts: [
          { text: 'br', emphasis: true },
          { text: 'ight', emphasis: false },
        ],
        displayChunks: [['br', 'br'], ['ight', 'ight']],
        spokenChunks: [['br', 'br'], ['ight', 'ight']],
        blendSpeechText: 'br - ight',
        wholeWordSpeechText: 'bright',
        sentenceSpeechText: 'Omar wanted to tape up the bright banner right away so the space would feel welcoming.',
      },
      {
        targetKey: 'carefully',
        sentenceNumber: 4,
        surfaceWord: 'carefully',
        focusParts: [
          { text: 'care', emphasis: true },
          { text: 'ful', emphasis: false },
          { text: 'ly', emphasis: false },
        ],
        displayChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        spokenChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        blendSpeechText: 'care - ful - ly',
        wholeWordSpeechText: 'carefully',
        sentenceSpeechText: 'Jada carefully lined up the jars and counted the brushes.',
      },
      {
        targetKey: 'community',
        sentenceNumber: 1,
        surfaceWord: 'community',
        focusParts: [
          { text: 'com', emphasis: true },
          { text: 'mu', emphasis: false },
          { text: 'ni', emphasis: false },
          { text: 'ty', emphasis: false },
        ],
        displayChunks: [['com', 'com'], ['mu', 'mu'], ['ni', 'ni'], ['ty', 'ty']],
        spokenChunks: [['com', 'com'], ['mu', 'mu'], ['ni', 'ni'], ['ty', 'ty']],
        blendSpeechText: 'com - mu - ni - ty',
        wholeWordSpeechText: 'community',
        sentenceSpeechText: 'At the community center, Jada and Omar set up the art table for the spring fair.',
      },
    ],
  },
  {
    passageIdentifier: PERSPECTIVE_PORTAL_PASSAGE_IDS.seedlingsStorm,
    passageKey: PERSPECTIVE_PORTAL_PASSAGE_KEYS.seedlingsStorm,
    readingContext: 'A story about two garden helpers who react to a storm in different ways.',
    sharedSituation: 'protecting seedlings before the windy afternoon storm',
    topicLabel: 'protecting seedlings before the storm',
    topicDistractor: 'the windy afternoon',
    summaryDistractor: 'Lani and Theo moved the seedlings and closed the shed before the rain.',
    contrastSummary: 'Lani thinks the seedlings should move inside right away, while Theo thinks they can wait a little longer for the sun.',
    sentences: [
      'Before the windy afternoon, Lani and Theo checked the seedlings in the school garden.',
      'Lani worried the storm could bend the tiny stems.',
      'Theo thought the sun was still warm and wanted to wait a little longer.',
      'Lani carefully carried the trays inside the shed.',
      'Theo noticed the clouds getting darker and helped move the last flat.',
      'The seedlings stayed safe, and the children closed the door before the rain started.',
      'Lani felt relieved because the earlier choice kept the plants safer.',
    ],
    characters: [
      {
        characterId: 'lani',
        characterName: 'Lani',
        perspectiveStatement: 'Lani thinks moving the seedlings inside right away will keep them safer from the storm.',
        supportingSentenceNumbers: [2, 4, 6],
        wordsSentenceNumbers: [2, 4],
        actionSentenceNumbers: [2, 4, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [2, 4],
      },
      {
        characterId: 'theo',
        characterName: 'Theo',
        perspectiveStatement: 'Theo thinks waiting a little longer lets the warm sun help the seedlings before the rain.',
        supportingSentenceNumbers: [3, 5, 6],
        wordsSentenceNumbers: [3, 5],
        actionSentenceNumbers: [3, 5, 6],
        feelingSentenceNumbers: [6],
        choiceSentenceNumbers: [3, 5],
      },
    ],
    supportTargets: [
      {
        targetKey: 'worried',
        sentenceNumber: 2,
        surfaceWord: 'worried',
        focusParts: [
          { text: 'wor', emphasis: true },
          { text: 'ried', emphasis: false },
        ],
        displayChunks: [['wor', 'wor'], ['ried', 'ried']],
        spokenChunks: [['wor', 'wor'], ['ried', 'ried']],
        blendSpeechText: 'wor - ried',
        wholeWordSpeechText: 'worried',
        sentenceSpeechText: 'Lani worried the storm could bend the tiny stems.',
      },
      {
        targetKey: 'carefully',
        sentenceNumber: 4,
        surfaceWord: 'carefully',
        focusParts: [
          { text: 'care', emphasis: true },
          { text: 'ful', emphasis: false },
          { text: 'ly', emphasis: false },
        ],
        displayChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        spokenChunks: [['care', 'care'], ['ful', 'ful'], ['ly', 'ly']],
        blendSpeechText: 'care - ful - ly',
        wholeWordSpeechText: 'carefully',
        sentenceSpeechText: 'Lani carefully carried the trays inside the shed.',
      },
      {
        targetKey: 'safer',
        sentenceNumber: 7,
        surfaceWord: 'safer',
        focusParts: [
          { text: 'safe', emphasis: true },
          { text: 'r', emphasis: false },
        ],
        displayChunks: [['safe', 'safe'], ['r', 'r']],
        spokenChunks: [['safe', 'safe'], ['r', 'r']],
        blendSpeechText: 'safe - r',
        wholeWordSpeechText: 'safer',
        sentenceSpeechText: 'Lani felt relieved because the earlier choice kept the plants safer.',
      },
      {
        targetKey: 'noticed',
        sentenceNumber: 5,
        surfaceWord: 'noticed',
        focusParts: [
          { text: 'no', emphasis: true },
          { text: 'ticed', emphasis: false },
        ],
        displayChunks: [['no', 'no'], ['ticed', 'ticed']],
        spokenChunks: [['no', 'no'], ['ticed', 'ticed']],
        blendSpeechText: 'no - ticed',
        wholeWordSpeechText: 'noticed',
        sentenceSpeechText: 'Theo noticed the clouds getting darker and helped move the last flat.',
      },
    ],
  },
  {
    passageIdentifier: PERSPECTIVE_PORTAL_PASSAGE_IDS.bridgeMeasure,
    passageKey: PERSPECTIVE_PORTAL_PASSAGE_KEYS.bridgeMeasure,
    readingContext: 'A story about two science club builders who disagree about checking a model bridge.',
    sharedSituation: 'building a model bridge for a class exhibit',
    topicLabel: 'building the model bridge',
    topicDistractor: 'the science room exhibit',
    summaryDistractor: 'Sofia and Kai built a model bridge and showed it to the class.',
    contrastSummary: 'Sofia thinks measuring again will help the bridge stay steady, while Kai thinks gluing soon is enough.',
    sentences: [
      'In the science room, Sofia and Kai worked on a model bridge for the class exhibit.',
      'Sofia said they should measure the sticks again because the first try looked uneven.',
      'Kai thought the bridge was fine and wanted to glue the pieces quickly.',
      'Sofia prepared the ruler and measured the span one more time.',
      'Kai watched the different pieces fit better and agreed to adjust the supports.',
      'The bridge stood steady, and the class could see the whole shape clearly.',
      'Both children felt proud because checking carefully helped the model stay strong.',
    ],
    characters: [
      {
        characterId: 'sofia',
        characterName: 'Sofia',
        perspectiveStatement: 'Sofia thinks measuring again will help the model bridge fit better and stay steady.',
        supportingSentenceNumbers: [2, 4, 7],
        wordsSentenceNumbers: [2, 4],
        actionSentenceNumbers: [4, 7],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [2, 4],
      },
      {
        characterId: 'kai',
        characterName: 'Kai',
        perspectiveStatement: 'Kai thinks gluing soon is enough because the bridge already looks close to right.',
        supportingSentenceNumbers: [3, 5, 6],
        wordsSentenceNumbers: [3, 5],
        actionSentenceNumbers: [3, 5, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [3, 5],
      },
    ],
    supportTargets: [
      {
        targetKey: 'prepared',
        sentenceNumber: 4,
        surfaceWord: 'prepared',
        focusParts: [
          { text: 'pre', emphasis: true },
          { text: 'pared', emphasis: false },
        ],
        displayChunks: [['pre', 'pre'], ['pared', 'pared']],
        spokenChunks: [['pre', 'pre'], ['pared', 'pared']],
        blendSpeechText: 'pre - pared',
        wholeWordSpeechText: 'prepared',
        sentenceSpeechText: 'Sofia prepared the ruler and measured the span one more time.',
      },
      {
        targetKey: 'measured',
        sentenceNumber: 4,
        surfaceWord: 'measured',
        focusParts: [
          { text: 'mea', emphasis: true },
          { text: 'sured', emphasis: false },
        ],
        displayChunks: [['mea', 'mea'], ['sured', 'sured']],
        spokenChunks: [['mea', 'mea'], ['sured', 'sured']],
        blendSpeechText: 'mea - sured',
        wholeWordSpeechText: 'measured',
        sentenceSpeechText: 'Sofia prepared the ruler and measured the span one more time.',
      },
      {
        targetKey: 'steady',
        sentenceNumber: 6,
        surfaceWord: 'steady',
        focusParts: [
          { text: 'stead', emphasis: true },
          { text: 'y', emphasis: false },
        ],
        displayChunks: [['stead', 'stead'], ['y', 'y']],
        spokenChunks: [['stead', 'stead'], ['y', 'y']],
        blendSpeechText: 'stead - y',
        wholeWordSpeechText: 'steady',
        sentenceSpeechText: 'The bridge stood steady, and the class could see the whole shape clearly.',
      },
      {
        targetKey: 'different',
        sentenceNumber: 5,
        surfaceWord: 'different',
        focusParts: [
          { text: 'dif', emphasis: true },
          { text: 'fer', emphasis: false },
          { text: 'ent', emphasis: false },
        ],
        displayChunks: [['dif', 'dif'], ['fer', 'fer'], ['ent', 'ent']],
        spokenChunks: [['dif', 'dif'], ['fer', 'fer'], ['ent', 'ent']],
        blendSpeechText: 'dif - fer - ent',
        wholeWordSpeechText: 'different',
        sentenceSpeechText: 'Kai watched the different pieces fit better and agreed to adjust the supports.',
      },
    ],
  },
  {
    passageIdentifier: PERSPECTIVE_PORTAL_PASSAGE_IDS.cleanupWater,
    passageKey: PERSPECTIVE_PORTAL_PASSAGE_KEYS.cleanupWater,
    readingContext: 'A story about two cleanup helpers who choose between water and trash bags first.',
    sharedSituation: 'finishing a neighborhood cleanup near the park',
    topicLabel: 'the neighborhood cleanup',
    topicDistractor: 'the park bench',
    summaryDistractor: 'Mira and Ben finished the cleanup and handed out cups of water.',
    contrastSummary: 'Mira thinks bringing water first will help the volunteers, while Ben thinks the trash bags should be finished before a break.',
    sentences: [
      'During the neighborhood cleanup, Mira and Ben filled bags near the park bench.',
      'Mira thought the volunteers would feel better if she brought water first.',
      'Ben wanted to finish the last trash bags before taking a break.',
      'Mira carried the water jug and told Ben the helpers looked tired.',
      'Ben noticed the full bags were done and decided the water could wait a little longer.',
      'They handed out cups, finished the cleanup, and thanked the helpers.',
      'By the end, both children felt calm because they had made a helpful decision.',
    ],
    characters: [
      {
        characterId: 'mira',
        characterName: 'Mira',
        perspectiveStatement: 'Mira thinks carrying water first will help the tired volunteers and show care.',
        supportingSentenceNumbers: [2, 4, 6],
        wordsSentenceNumbers: [2, 4],
        actionSentenceNumbers: [4, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [2, 4],
      },
      {
        characterId: 'ben',
        characterName: 'Ben',
        perspectiveStatement: 'Ben thinks finishing the trash bags first keeps the cleanup moving before a break.',
        supportingSentenceNumbers: [3, 5, 6],
        wordsSentenceNumbers: [3, 5],
        actionSentenceNumbers: [3, 5, 6],
        feelingSentenceNumbers: [7],
        choiceSentenceNumbers: [3, 5],
      },
    ],
    supportTargets: [
      {
        targetKey: 'helpful',
        sentenceNumber: 7,
        surfaceWord: 'helpful',
        focusParts: [
          { text: 'help', emphasis: true },
          { text: 'ful', emphasis: false },
        ],
        displayChunks: [['help', 'help'], ['ful', 'ful']],
        spokenChunks: [['help', 'help'], ['ful', 'ful']],
        blendSpeechText: 'help - ful',
        wholeWordSpeechText: 'helpful',
        sentenceSpeechText: 'By the end, both children felt calm because they had made a helpful decision.',
      },
      {
        targetKey: 'noticed',
        sentenceNumber: 5,
        surfaceWord: 'noticed',
        focusParts: [
          { text: 'no', emphasis: true },
          { text: 'ticed', emphasis: false },
        ],
        displayChunks: [['no', 'no'], ['ticed', 'ticed']],
        spokenChunks: [['no', 'no'], ['ticed', 'ticed']],
        blendSpeechText: 'no - ticed',
        wholeWordSpeechText: 'noticed',
        sentenceSpeechText: 'Ben noticed the full bags were done and decided the water could wait a little longer.',
      },
      {
        targetKey: 'decision',
        sentenceNumber: 7,
        surfaceWord: 'decision',
        focusParts: [
          { text: 'de', emphasis: true },
          { text: 'ci', emphasis: false },
          { text: 'sion', emphasis: false },
        ],
        displayChunks: [['de', 'de'], ['ci', 'ci'], ['sion', 'sion']],
        spokenChunks: [['de', 'de'], ['ci', 'ci'], ['sion', 'sion']],
        blendSpeechText: 'de - ci - sion',
        wholeWordSpeechText: 'decision',
        sentenceSpeechText: 'By the end, both children felt calm because they had made a helpful decision.',
      },
      {
        targetKey: 'calm',
        sentenceNumber: 7,
        surfaceWord: 'calm',
        focusParts: [
          { text: 'cal', emphasis: true },
          { text: 'm', emphasis: false },
        ],
        displayChunks: [['cal', 'cal'], ['m', 'm']],
        spokenChunks: [['cal', 'cal'], ['m', 'm']],
        blendSpeechText: 'cal - m',
        wholeWordSpeechText: 'calm',
        sentenceSpeechText: 'By the end, both children felt calm because they had made a helpful decision.',
      },
    ],
  },
]

export const perspectivePortalPassages: Passage[] = perspectivePortalPassageBlueprints.map((blueprint) => createPassage(blueprint))
