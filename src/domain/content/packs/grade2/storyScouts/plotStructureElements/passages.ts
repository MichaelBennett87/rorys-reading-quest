import type { Passage, WordSupportTarget } from '../../../../types'
import {
  STORY_MAP_CONTENT_VERSION,
  STORY_MAP_PASSAGE_IDS,
  STORY_MAP_PASSAGE_KEYS,
  storyMapSentenceId,
  storyMapSupportTargetId,
} from './ids'

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
    targetId: storyMapSupportTargetId(spec.passageKey, spec.targetKey),
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
    contentVersion: STORY_MAP_CONTENT_VERSION,
  }
}

function supportChunks(chunks: Array<[string, string]>) {
  return chunks.map(([displayText, speechText]) => ({ displayText, speechText }))
}

export const storyMapPassages: Passage[] = [
  {
    passageIdentifier: STORY_MAP_PASSAGE_IDS.gardenSign,
    gradeBand: 2,
    passageText:
      'On a bright Monday morning, Mia arrived at the community garden before the harvest sign-up table opened. A wind gust had bent the welcome sign, and the letters looked crooked. Mia frowned, then carefully straightened the board with tape and two helping hands from her brother, Leo. By the end, the sign stood tall again, and Mia smiled because the garden looked ready for visitors. The early visitors would see the message clearly, and Mia felt proud of the fix.',
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.gardenSign, 1),
        text: 'On a bright Monday morning, Mia arrived at the community garden before the harvest sign-up table opened.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.gardenSign, 2),
        text: 'A wind gust had bent the welcome sign, and the letters looked crooked.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.gardenSign, 3),
        text: 'Mia frowned, then carefully straightened the board with tape and two helping hands from her brother, Leo.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.gardenSign, 4),
        text: 'By the end, the sign stood tall again, and Mia smiled because the garden looked ready for visitors.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.gardenSign, 5),
        text: 'The early visitors would see the message clearly, and Mia felt proud of the fix.',
      },
    ],
    readingContext: 'A story about fixing a community garden sign before a morning event.',
    reviewStatus: 'DRAFT',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    wordSupportTargets: [
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.gardenSign,
        passageKey: STORY_MAP_PASSAGE_KEYS.gardenSign,
        targetKey: 'morning',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.gardenSign, 1),
        surfaceWord: 'morning',
        focusParts: [
          { text: 'mor', emphasis: true },
          { text: 'ning', emphasis: false },
        ],
        displayChunks: supportChunks([['mor', 'mor'], ['ning', 'ning']]),
        spokenChunks: supportChunks([['mor', 'mor'], ['ning', 'ning']]),
        blendSpeechText: 'mor - ning',
        wholeWordSpeechText: 'morning',
        sentenceSpeechText:
          'On a bright Monday morning, Mia arrived at the community garden before the harvest sign-up table opened.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.gardenSign,
        passageKey: STORY_MAP_PASSAGE_KEYS.gardenSign,
        targetKey: 'carefully',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.gardenSign, 3),
        surfaceWord: 'carefully',
        focusParts: [
          { text: 'care', emphasis: true },
          { text: 'ful', emphasis: false },
          { text: 'ly', emphasis: false },
        ],
        displayChunks: supportChunks([['care', 'care'], ['ful', 'ful'], ['ly', 'ly']]),
        spokenChunks: supportChunks([['care', 'care'], ['ful', 'ful'], ['ly', 'ly']]),
        blendSpeechText: 'care - ful - ly',
        wholeWordSpeechText: 'carefully',
        sentenceSpeechText:
          'Mia frowned, then carefully straightened the board with tape and two helping hands from her brother, Leo.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.gardenSign,
        passageKey: STORY_MAP_PASSAGE_KEYS.gardenSign,
        targetKey: 'straightened',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.gardenSign, 3),
        surfaceWord: 'straightened',
        focusParts: [
          { text: 'straight', emphasis: true },
          { text: 'ened', emphasis: false },
        ],
        displayChunks: supportChunks([['straight', 'straight'], ['ened', 'ened']]),
        spokenChunks: supportChunks([['straight', 'straight'], ['ened', 'ened']]),
        blendSpeechText: 'straight - ened',
        wholeWordSpeechText: 'straightened',
        sentenceSpeechText:
          'Mia frowned, then carefully straightened the board with tape and two helping hands from her brother, Leo.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.gardenSign,
        passageKey: STORY_MAP_PASSAGE_KEYS.gardenSign,
        targetKey: 'visitors',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.gardenSign, 4),
        surfaceWord: 'visitors',
        focusParts: [
          { text: 'visit', emphasis: true },
          { text: 'ors', emphasis: false },
        ],
        displayChunks: supportChunks([['visit', 'visit'], ['ors', 'ors']]),
        spokenChunks: supportChunks([['visit', 'visit'], ['ors', 'ors']]),
        blendSpeechText: 'visit - ors',
        wholeWordSpeechText: 'visitors',
        sentenceSpeechText:
          'By the end, the sign stood tall again, and Mia smiled because the garden looked ready for visitors.',
      }),
    ],
  },
  {
    passageIdentifier: STORY_MAP_PASSAGE_IDS.libraryCard,
    gradeBand: 2,
    passageText:
      "After school on a rainy afternoon, Jamal helped at the library table. A card about the bird book slipped behind the display, and the shelf looked messy. Jamal opened the drawer, sorted the cards, and wrote a new label with his teacher's kind help. Soon the display looked neat, and Jamal felt proud when the children stopped to read it. He placed the old card in front of the shelf so no one would miss the bright picture book again.",
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.libraryCard, 1),
        text: 'After school on a rainy afternoon, Jamal helped at the library table.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.libraryCard, 2),
        text: 'A card about the bird book slipped behind the display, and the shelf looked messy.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.libraryCard, 3),
        text: "Jamal opened the drawer, sorted the cards, and wrote a new label with his teacher's kind help.",
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.libraryCard, 4),
        text: 'Soon the display looked neat, and Jamal felt proud when the children stopped to read it.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.libraryCard, 5),
        text: 'He placed the old card in front of the shelf so no one would miss the bright picture book again.',
      },
    ],
    readingContext: 'A story about fixing a library display card after school.',
    reviewStatus: 'DRAFT',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    wordSupportTargets: [
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.libraryCard,
        passageKey: STORY_MAP_PASSAGE_KEYS.libraryCard,
        targetKey: 'afternoon',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.libraryCard, 1),
        surfaceWord: 'afternoon',
        focusParts: [
          { text: 'after', emphasis: true },
          { text: 'noon', emphasis: false },
        ],
        displayChunks: supportChunks([['after', 'after'], ['noon', 'noon']]),
        spokenChunks: supportChunks([['after', 'after'], ['noon', 'noon']]),
        blendSpeechText: 'af - ter - noon',
        wholeWordSpeechText: 'afternoon',
        sentenceSpeechText:
          'After school on a rainy afternoon, Jamal helped at the library table.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.libraryCard,
        passageKey: STORY_MAP_PASSAGE_KEYS.libraryCard,
        targetKey: 'opened',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.libraryCard, 3),
        surfaceWord: 'opened',
        focusParts: [
          { text: 'open', emphasis: true },
          { text: 'ed', emphasis: false },
        ],
        displayChunks: supportChunks([['open', 'open'], ['ed', 'ed']]),
        spokenChunks: supportChunks([['open', 'open'], ['ed', 'ed']]),
        blendSpeechText: 'open - ed',
        wholeWordSpeechText: 'opened',
        sentenceSpeechText:
          "Jamal opened the drawer, sorted the cards, and wrote a new label with his teacher's kind help.",
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.libraryCard,
        passageKey: STORY_MAP_PASSAGE_KEYS.libraryCard,
        targetKey: 'sorted',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.libraryCard, 3),
        surfaceWord: 'sorted',
        focusParts: [
          { text: 'sort', emphasis: true },
          { text: 'ed', emphasis: false },
        ],
        displayChunks: supportChunks([['sort', 'sort'], ['ed', 'ed']]),
        spokenChunks: supportChunks([['sort', 'sort'], ['ed', 'ed']]),
        blendSpeechText: 'sort - ed',
        wholeWordSpeechText: 'sorted',
        sentenceSpeechText:
          "Jamal opened the drawer, sorted the cards, and wrote a new label with his teacher's kind help.",
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.libraryCard,
        passageKey: STORY_MAP_PASSAGE_KEYS.libraryCard,
        targetKey: 'display',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.libraryCard, 2),
        surfaceWord: 'display',
        focusParts: [
          { text: 'dis', emphasis: true },
          { text: 'play', emphasis: false },
        ],
        displayChunks: supportChunks([['dis', 'dis'], ['play', 'play']]),
        spokenChunks: supportChunks([['dis', 'dis'], ['play', 'play']]),
        blendSpeechText: 'dis - play',
        wholeWordSpeechText: 'display',
        sentenceSpeechText:
          'A card about the bird book slipped behind the display, and the shelf looked messy.',
      }),
    ],
  },
  {
    passageIdentifier: STORY_MAP_PASSAGE_IDS.trailCleanup,
    gradeBand: 2,
    passageText:
      'On Saturday morning, Nia and Ben walked the nature trail after a windy night. Leaves covered the small sign, and wrappers hid near the bench. Nia picked up the trash while Ben cleaned the sign carefully with a cloth. When they finished, the trail felt calm again, and the hikers smiled as they passed. The pair left the bench area tidy for the next group of walkers that afternoon.',
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.trailCleanup, 1),
        text: 'On Saturday morning, Nia and Ben walked the nature trail after a windy night.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.trailCleanup, 2),
        text: 'Leaves covered the small sign, and wrappers hid near the bench.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.trailCleanup, 3),
        text: 'Nia picked up the trash while Ben cleaned the sign carefully with a cloth.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.trailCleanup, 4),
        text: 'When they finished, the trail felt calm again, and the hikers smiled as they passed.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.trailCleanup, 5),
        text: 'The pair left the bench area tidy for the next group of walkers that afternoon.',
      },
    ],
    readingContext: 'A story about cleaning a nature trail after a windy night.',
    reviewStatus: 'DRAFT',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    wordSupportTargets: [
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.trailCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.trailCleanup,
        targetKey: 'saturday',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.trailCleanup, 1),
        surfaceWord: 'Saturday',
        focusParts: [
          { text: 'Sat', emphasis: true },
          { text: 'ur', emphasis: false },
          { text: 'day', emphasis: false },
        ],
        displayChunks: supportChunks([['Sat', 'sat'], ['ur', 'ur'], ['day', 'day']]),
        spokenChunks: supportChunks([['Sat', 'sat'], ['ur', 'ur'], ['day', 'day']]),
        blendSpeechText: 'Sat - ur - day',
        wholeWordSpeechText: 'Saturday',
        sentenceSpeechText:
          'On Saturday morning, Nia and Ben walked the nature trail after a windy night.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.trailCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.trailCleanup,
        targetKey: 'carefully',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.trailCleanup, 3),
        surfaceWord: 'carefully',
        focusParts: [
          { text: 'care', emphasis: true },
          { text: 'ful', emphasis: false },
          { text: 'ly', emphasis: false },
        ],
        displayChunks: supportChunks([['care', 'care'], ['ful', 'ful'], ['ly', 'ly']]),
        spokenChunks: supportChunks([['care', 'care'], ['ful', 'ful'], ['ly', 'ly']]),
        blendSpeechText: 'care - ful - ly',
        wholeWordSpeechText: 'carefully',
        sentenceSpeechText:
          'Nia picked up the trash while Ben cleaned the sign carefully with a cloth.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.trailCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.trailCleanup,
        targetKey: 'finished',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.trailCleanup, 4),
        surfaceWord: 'finished',
        focusParts: [
          { text: 'finish', emphasis: true },
          { text: 'ed', emphasis: false },
        ],
        displayChunks: supportChunks([['finish', 'finish'], ['ed', 'ed']]),
        spokenChunks: supportChunks([['finish', 'finish'], ['ed', 'ed']]),
        blendSpeechText: 'finish - ed',
        wholeWordSpeechText: 'finished',
        sentenceSpeechText:
          'When they finished, the trail felt calm again, and the hikers smiled as they passed.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.trailCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.trailCleanup,
        targetKey: 'cleaned',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.trailCleanup, 3),
        surfaceWord: 'cleaned',
        focusParts: [
          { text: 'clean', emphasis: true },
          { text: 'ed', emphasis: false },
        ],
        displayChunks: supportChunks([['clean', 'clean'], ['ed', 'ed']]),
        spokenChunks: supportChunks([['clean', 'clean'], ['ed', 'ed']]),
        blendSpeechText: 'clean - ed',
        wholeWordSpeechText: 'cleaned',
        sentenceSpeechText:
          'Nia picked up the trash while Ben cleaned the sign carefully with a cloth.',
      }),
    ],
  },
  {
    passageIdentifier: STORY_MAP_PASSAGE_IDS.birdBoxStorm,
    gradeBand: 2,
    passageText:
      'Late one afternoon, Priya and her brother Malik noticed a bird box hanging loose by the school yard. Dark clouds moved in, and the wind made the box sway. Priya held the ladder steady while Malik secured the hook and tightened the string. Before the storm arrived, the box was safe again, and the siblings grinned with relief. A small robin hopped nearby as if it knew the home would hold.',
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.birdBoxStorm, 1),
        text: 'Late one afternoon, Priya and her brother Malik noticed a bird box hanging loose by the school yard.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.birdBoxStorm, 2),
        text: 'Dark clouds moved in, and the wind made the box sway.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.birdBoxStorm, 3),
        text: 'Priya held the ladder steady while Malik secured the hook and tightened the string.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.birdBoxStorm, 4),
        text: 'Before the storm arrived, the box was safe again, and the siblings grinned with relief.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.birdBoxStorm, 5),
        text: 'A small robin hopped nearby as if it knew the home would hold.',
      },
    ],
    readingContext: 'A story about helping a bird box stay safe before a storm.',
    reviewStatus: 'DRAFT',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    wordSupportTargets: [
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.birdBoxStorm,
        passageKey: STORY_MAP_PASSAGE_KEYS.birdBoxStorm,
        targetKey: 'afternoon',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.birdBoxStorm, 1),
        surfaceWord: 'afternoon',
        focusParts: [
          { text: 'after', emphasis: true },
          { text: 'noon', emphasis: false },
        ],
        displayChunks: supportChunks([['after', 'after'], ['noon', 'noon']]),
        spokenChunks: supportChunks([['after', 'after'], ['noon', 'noon']]),
        blendSpeechText: 'af - ter - noon',
        wholeWordSpeechText: 'afternoon',
        sentenceSpeechText:
          'Late one afternoon, Priya and her brother Malik noticed a bird box hanging loose by the school yard.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.birdBoxStorm,
        passageKey: STORY_MAP_PASSAGE_KEYS.birdBoxStorm,
        targetKey: 'secured',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.birdBoxStorm, 3),
        surfaceWord: 'secured',
        focusParts: [
          { text: 'secure', emphasis: true },
          { text: 'd', emphasis: false },
        ],
        displayChunks: supportChunks([['secure', 'secure'], ['d', 'd']]),
        spokenChunks: supportChunks([['secure', 'secure'], ['d', 'd']]),
        blendSpeechText: 'secure - d',
        wholeWordSpeechText: 'secured',
        sentenceSpeechText:
          'Priya held the ladder steady while Malik secured the hook and tightened the string.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.birdBoxStorm,
        passageKey: STORY_MAP_PASSAGE_KEYS.birdBoxStorm,
        targetKey: 'tightened',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.birdBoxStorm, 3),
        surfaceWord: 'tightened',
        focusParts: [
          { text: 'tighten', emphasis: true },
          { text: 'ed', emphasis: false },
        ],
        displayChunks: supportChunks([['tighten', 'tighten'], ['ed', 'ed']]),
        spokenChunks: supportChunks([['tighten', 'tighten'], ['ed', 'ed']]),
        blendSpeechText: 'tighten - ed',
        wholeWordSpeechText: 'tightened',
        sentenceSpeechText:
          'Priya held the ladder steady while Malik secured the hook and tightened the string.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.birdBoxStorm,
        passageKey: STORY_MAP_PASSAGE_KEYS.birdBoxStorm,
        targetKey: 'relief',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.birdBoxStorm, 4),
        surfaceWord: 'relief',
        focusParts: [
          { text: 're', emphasis: true },
          { text: 'lief', emphasis: false },
        ],
        displayChunks: supportChunks([['re', 're'], ['lief', 'lief']]),
        spokenChunks: supportChunks([['re', 're'], ['lief', 'lief']]),
        blendSpeechText: 're - lief',
        wholeWordSpeechText: 'relief',
        sentenceSpeechText:
          'Before the storm arrived, the box was safe again, and the siblings grinned with relief.',
      }),
    ],
  },
  {
    passageIdentifier: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
    gradeBand: 2,
    passageText:
      "On a sunny Saturday morning, Tia met three neighbors beside the block's littered sidewalk. Wind had spread snack wrappers and cans left after Friday's picnic. Tia carefully decided to collect the light wrappers first so they could not blow farther.\n\nShe asked two helpers to hold open bags while she and Malik picked up paper. Then the group sorted cans into a recycling bin and tied every bag. When the sidewalk was clear, Tia proudly thanked everyone for following the plan.",
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 1),
        text: "On a sunny Saturday morning, Tia met three neighbors beside the block's littered sidewalk.",
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 2),
        text: "Wind had spread snack wrappers and cans left after Friday's picnic.",
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 3),
        text: 'Tia carefully decided to collect the light wrappers first so they could not blow farther.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 4),
        text: 'She asked two helpers to hold open bags while she and Malik picked up paper.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 5),
        text: 'Then the group sorted cans into a recycling bin and tied every bag.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 6),
        text: 'When the sidewalk was clear, Tia proudly thanked everyone for following the plan.',
      },
    ],
    readingContext: 'A story about neighbors cleaning up a block after a picnic.',
    reviewStatus: 'DRAFT',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    wordSupportTargets: [
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup,
        targetKey: 'saturday',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 1),
        surfaceWord: 'Saturday',
        focusParts: [
          { text: 'Sat', emphasis: true },
          { text: 'ur', emphasis: false },
          { text: 'day', emphasis: false },
        ],
        displayChunks: supportChunks([['Sat', 'sat'], ['ur', 'ur'], ['day', 'day']]),
        spokenChunks: supportChunks([['Sat', 'sat'], ['ur', 'ur'], ['day', 'day']]),
        blendSpeechText: 'Sat - ur - day',
        wholeWordSpeechText: 'Saturday',
        sentenceSpeechText:
          "On a sunny Saturday morning, Tia met three neighbors beside the block's littered sidewalk.",
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup,
        targetKey: 'carefully',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 3),
        surfaceWord: 'carefully',
        focusParts: [
          { text: 'care', emphasis: true },
          { text: 'ful', emphasis: false },
          { text: 'ly', emphasis: false },
        ],
        displayChunks: supportChunks([['care', 'care'], ['ful', 'ful'], ['ly', 'ly']]),
        spokenChunks: supportChunks([['care', 'care'], ['ful', 'ful'], ['ly', 'ly']]),
        blendSpeechText: 'care - ful - ly',
        wholeWordSpeechText: 'carefully',
        sentenceSpeechText:
          'Tia carefully decided to collect the light wrappers first so they could not blow farther.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup,
        targetKey: 'helpers',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 4),
        surfaceWord: 'helpers',
        focusParts: [
          { text: 'help', emphasis: true },
          { text: 'ers', emphasis: false },
        ],
        displayChunks: supportChunks([['help', 'help'], ['ers', 'ers']]),
        spokenChunks: supportChunks([['help', 'help'], ['ers', 'ers']]),
        blendSpeechText: 'help - ers',
        wholeWordSpeechText: 'helpers',
        sentenceSpeechText:
          'She asked two helpers to hold open bags while she and Malik picked up paper.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup,
        targetKey: 'proudly',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 6),
        surfaceWord: 'proudly',
        focusParts: [
          { text: 'proud', emphasis: true },
          { text: 'ly', emphasis: false },
        ],
        displayChunks: supportChunks([['proud', 'proud'], ['ly', 'ly']]),
        spokenChunks: supportChunks([['proud', 'proud'], ['ly', 'ly']]),
        blendSpeechText: 'proud - ly',
        wholeWordSpeechText: 'proudly',
        sentenceSpeechText:
          'When the sidewalk was clear, Tia proudly thanked everyone for following the plan.',
      }),
    ],
  },
  {
    passageIdentifier: STORY_MAP_PASSAGE_IDS.bridgeModel,
    gradeBand: 2,
    passageText:
      'After lunch in the classroom, Carlos and Emmi studied their model bridge for the science fair. The middle beam sagged, so the paper road dipped low. Carlos suggested adding a stronger brace beneath the beam.\n\nHe slid the brace into place while Emmi taped the sides and checked each corner. They tested the bridge with three wooden blocks; the road stayed level and the bridge stood steady. The friends laughed quietly and placed the repaired model on a blue tray.',
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 1),
        text: 'After lunch in the classroom, Carlos and Emmi studied their model bridge for the science fair.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 2),
        text: 'The middle beam sagged, so the paper road dipped low.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 3),
        text: 'Carlos suggested adding a stronger brace beneath the beam.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 4),
        text: 'He slid the brace into place while Emmi taped the sides and checked each corner.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 5),
        text: 'They tested the bridge with three wooden blocks; the road stayed level and the bridge stood steady.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 6),
        text: 'The friends laughed quietly and placed the repaired model on a blue tray.',
      },
    ],
    readingContext: 'A story about fixing a model bridge in a classroom after lunch.',
    reviewStatus: 'DRAFT',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    wordSupportTargets: [
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
        passageKey: STORY_MAP_PASSAGE_KEYS.bridgeModel,
        targetKey: 'stronger',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 3),
        surfaceWord: 'stronger',
        focusParts: [
          { text: 'strong', emphasis: true },
          { text: 'er', emphasis: false },
        ],
        displayChunks: supportChunks([['strong', 'strong'], ['er', 'er']]),
        spokenChunks: supportChunks([['strong', 'strong'], ['er', 'er']]),
        blendSpeechText: 'strong - er',
        wholeWordSpeechText: 'stronger',
        sentenceSpeechText:
          'Carlos suggested adding a stronger brace beneath the beam.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
        passageKey: STORY_MAP_PASSAGE_KEYS.bridgeModel,
        targetKey: 'taped',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 4),
        surfaceWord: 'taped',
        focusParts: [
          { text: 'tape', emphasis: true },
          { text: 'd', emphasis: false },
        ],
        displayChunks: supportChunks([['tape', 'tape'], ['d', 'd']]),
        spokenChunks: supportChunks([['tape', 'tape'], ['d', 'd']]),
        blendSpeechText: 'tape - d',
        wholeWordSpeechText: 'taped',
        sentenceSpeechText:
          'He slid the brace into place while Emmi taped the sides and checked each corner.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
        passageKey: STORY_MAP_PASSAGE_KEYS.bridgeModel,
        targetKey: 'quietly',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 6),
        surfaceWord: 'quietly',
        focusParts: [
          { text: 'quiet', emphasis: true },
          { text: 'ly', emphasis: false },
        ],
        displayChunks: supportChunks([['quiet', 'quiet'], ['ly', 'ly']]),
        spokenChunks: supportChunks([['quiet', 'quiet'], ['ly', 'ly']]),
        blendSpeechText: 'quiet - ly',
        wholeWordSpeechText: 'quietly',
        sentenceSpeechText:
          'The friends laughed quietly and placed the repaired model on a blue tray.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
        passageKey: STORY_MAP_PASSAGE_KEYS.bridgeModel,
        targetKey: 'steady',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 5),
        surfaceWord: 'steady',
        focusParts: [
          { text: 'stead', emphasis: true },
          { text: 'y', emphasis: false },
        ],
        displayChunks: supportChunks([['stead', 'stead'], ['y', 'y']]),
        spokenChunks: supportChunks([['stead', 'stead'], ['y', 'y']]),
        blendSpeechText: 'stead - y',
        wholeWordSpeechText: 'steady',
        sentenceSpeechText:
          'They tested the bridge with three wooden blocks; the road stayed level and the bridge stood steady.',
      }),
    ],
  },
  {
    passageIdentifier: STORY_MAP_PASSAGE_IDS.seedlingsRain,
    gradeBand: 2,
    passageText:
      'During a rainy afternoon in the school garden, Harper saw the young seedlings leaning in the wind. A plastic cover had slipped off their tray, and rainwater was collecting beside the wet soil. Harper worried that more rain could wash the soil away from the roots.\n\nHarper put the cover back, moved the tray under the awning, and patted the leaves dry. Soon the seedlings stood upright, and the teacher said they were safe. Harper felt calm and helpful after acting quickly.',
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 1),
        text: 'During a rainy afternoon in the school garden, Harper saw the young seedlings leaning in the wind.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 2),
        text: 'A plastic cover had slipped off their tray, and rainwater was collecting beside the wet soil.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 3),
        text: 'Harper worried that more rain could wash the soil away from the roots.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 4),
        text: 'Harper put the cover back, moved the tray under the awning, and patted the leaves dry.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 5),
        text: 'Soon the seedlings stood upright, and the teacher said they were safe.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 6),
        text: 'Harper felt calm and helpful after acting quickly.',
      },
    ],
    readingContext: 'A story about protecting seedlings in a rainy school garden.',
    reviewStatus: 'DRAFT',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    wordSupportTargets: [
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.seedlingsRain,
        passageKey: STORY_MAP_PASSAGE_KEYS.seedlingsRain,
        targetKey: 'afternoon',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 1),
        surfaceWord: 'afternoon',
        focusParts: [
          { text: 'after', emphasis: true },
          { text: 'noon', emphasis: false },
        ],
        displayChunks: supportChunks([['after', 'after'], ['noon', 'noon']]),
        spokenChunks: supportChunks([['after', 'after'], ['noon', 'noon']]),
        blendSpeechText: 'af - ter - noon',
        wholeWordSpeechText: 'afternoon',
        sentenceSpeechText:
          'During a rainy afternoon in the school garden, Harper saw the young seedlings leaning in the wind.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.seedlingsRain,
        passageKey: STORY_MAP_PASSAGE_KEYS.seedlingsRain,
        targetKey: 'seedlings',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 1),
        surfaceWord: 'seedlings',
        focusParts: [
          { text: 'seed', emphasis: true },
          { text: 'lings', emphasis: false },
        ],
        displayChunks: supportChunks([['seed', 'seed'], ['lings', 'lings']]),
        spokenChunks: supportChunks([['seed', 'seed'], ['lings', 'lings']]),
        blendSpeechText: 'seed - lings',
        wholeWordSpeechText: 'seedlings',
        sentenceSpeechText:
          'During a rainy afternoon in the school garden, Harper saw the young seedlings leaning in the wind.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.seedlingsRain,
        passageKey: STORY_MAP_PASSAGE_KEYS.seedlingsRain,
        targetKey: 'helpful',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 6),
        surfaceWord: 'helpful',
        focusParts: [
          { text: 'help', emphasis: true },
          { text: 'ful', emphasis: false },
        ],
        displayChunks: supportChunks([['help', 'help'], ['ful', 'ful']]),
        spokenChunks: supportChunks([['help', 'help'], ['ful', 'ful']]),
        blendSpeechText: 'help - ful',
        wholeWordSpeechText: 'helpful',
        sentenceSpeechText:
          'Harper felt calm and helpful after acting quickly.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.seedlingsRain,
        passageKey: STORY_MAP_PASSAGE_KEYS.seedlingsRain,
        targetKey: 'calm',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 6),
        surfaceWord: 'calm',
        focusParts: [
          { text: 'calm', emphasis: true },
        ],
        displayChunks: supportChunks([['cal', 'cal'], ['m', 'm']]),
        spokenChunks: supportChunks([['cal', 'cal'], ['m', 'm']]),
        blendSpeechText: 'calm',
        wholeWordSpeechText: 'calm',
        sentenceSpeechText:
          'Harper felt calm and helpful after acting quickly.',
      }),
    ],
  },
]
