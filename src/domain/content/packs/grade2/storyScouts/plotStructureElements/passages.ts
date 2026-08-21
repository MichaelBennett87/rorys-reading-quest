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
      'On a sunny Saturday morning, Tia led three neighbors around the block. Snack wrappers and cans had blown across the sidewalk after the picnic. Tia sorted the trash, and the helpers worked carefully until every bag was full. At the end, the street looked fresh, and Tia waved proudly at the clean sidewalk. The neighbors lined up the bags near the curb for pickup that evening.',
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 1),
        text: 'On a sunny Saturday morning, Tia led three neighbors around the block.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 2),
        text: 'Snack wrappers and cans had blown across the sidewalk after the picnic.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 3),
        text: 'Tia sorted the trash, and the helpers worked carefully until every bag was full.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 4),
        text: 'At the end, the street looked fresh, and Tia waved proudly at the clean sidewalk.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 5),
        text: 'The neighbors lined up the bags near the curb for pickup that evening.',
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
          'On a sunny Saturday morning, Tia led three neighbors around the block.',
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
          'Tia sorted the trash, and the helpers worked carefully until every bag was full.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup,
        targetKey: 'helpers',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 3),
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
          'Tia sorted the trash, and the helpers worked carefully until every bag was full.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
        passageKey: STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup,
        targetKey: 'proudly',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup, 4),
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
          'At the end, the street looked fresh, and Tia waved proudly at the clean sidewalk.',
      }),
    ],
  },
  {
    passageIdentifier: STORY_MAP_PASSAGE_IDS.bridgeModel,
    gradeBand: 2,
    passageText:
      'After lunch in the classroom, Carlos and Emmi studied a model bridge for the science fair. The middle beam sagged, and the paper road dipped low. Carlos added a stronger brace while Emmi taped the sides and checked each corner. When the bridge stood steady, their teacher nodded, and the two friends laughed quietly. They placed the model on a blue tray so the class could see the fix.',
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 1),
        text: 'After lunch in the classroom, Carlos and Emmi studied a model bridge for the science fair.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 2),
        text: 'The middle beam sagged, and the paper road dipped low.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 3),
        text: 'Carlos added a stronger brace while Emmi taped the sides and checked each corner.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 4),
        text: 'When the bridge stood steady, their teacher nodded, and the two friends laughed quietly.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 5),
        text: 'They placed the model on a blue tray so the class could see the fix.',
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
          'Carlos added a stronger brace while Emmi taped the sides and checked each corner.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
        passageKey: STORY_MAP_PASSAGE_KEYS.bridgeModel,
        targetKey: 'taped',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 3),
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
          'Carlos added a stronger brace while Emmi taped the sides and checked each corner.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
        passageKey: STORY_MAP_PASSAGE_KEYS.bridgeModel,
        targetKey: 'quietly',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 4),
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
          'When the bridge stood steady, their teacher nodded, and the two friends laughed quietly.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
        passageKey: STORY_MAP_PASSAGE_KEYS.bridgeModel,
        targetKey: 'steady',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.bridgeModel, 4),
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
          'When the bridge stood steady, their teacher nodded, and the two friends laughed quietly.',
      }),
    ],
  },
  {
    passageIdentifier: STORY_MAP_PASSAGE_IDS.seedlingsRain,
    gradeBand: 2,
    passageText:
      'During a rainy afternoon in the school garden, Harper watched the young seedlings lean in the wind. A cover had slipped off the tray, and the soil looked too wet. Harper lifted the cover, moved the tray under the awning, and patted the leaves dry with a cloth. By the end, the seedlings stood safer, and Harper felt calm and helpful. A teacher thanked Harper for keeping the plants safe before the next storm.',
    sentences: [
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 1),
        text: 'During a rainy afternoon in the school garden, Harper watched the young seedlings lean in the wind.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 2),
        text: 'A cover had slipped off the tray, and the soil looked too wet.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 3),
        text: 'Harper lifted the cover, moved the tray under the awning, and patted the leaves dry with a cloth.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 4),
        text: 'By the end, the seedlings stood safer, and Harper felt calm and helpful.',
      },
      {
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 5),
        text: 'A teacher thanked Harper for keeping the plants safe before the next storm.',
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
          'During a rainy afternoon in the school garden, Harper watched the young seedlings lean in the wind.',
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
          'During a rainy afternoon in the school garden, Harper watched the young seedlings lean in the wind.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.seedlingsRain,
        passageKey: STORY_MAP_PASSAGE_KEYS.seedlingsRain,
        targetKey: 'helpful',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 4),
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
          'By the end, the seedlings stood safer, and Harper felt calm and helpful.',
      }),
      supportTarget({
        passageId: STORY_MAP_PASSAGE_IDS.seedlingsRain,
        passageKey: STORY_MAP_PASSAGE_KEYS.seedlingsRain,
        targetKey: 'calm',
        sentenceId: storyMapSentenceId(STORY_MAP_PASSAGE_KEYS.seedlingsRain, 4),
        surfaceWord: 'calm',
        focusParts: [
          { text: 'calm', emphasis: true },
        ],
        displayChunks: supportChunks([['cal', 'cal'], ['m', 'm']]),
        spokenChunks: supportChunks([['cal', 'cal'], ['m', 'm']]),
        blendSpeechText: 'calm',
        wholeWordSpeechText: 'calm',
        sentenceSpeechText:
          'By the end, the seedlings stood safer, and Harper felt calm and helpful.',
      }),
    ],
  },
]
