import type { Passage, WordSupportTarget } from '../../../../types'
import { TEXT_FEATURE_HUNT_CONTENT_VERSION, TEXT_FEATURE_HUNT_FEATURE_IDS, TEXT_FEATURE_HUNT_PASSAGE_IDS, TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS, TEXT_FEATURE_HUNT_PASSAGE_KEYS, TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS, textFeatureHuntSentenceId } from './ids'

type SupportTargetSpec = {
  targetId: string
  passageId: string
  sentenceId: string
  surfaceWord: string
  firstPart: string
  secondPart: string
  firstSpeech: string
  secondSpeech: string
  sentenceSpeechText: string
}

function sentence(sentenceId: string, lineNumber: number, text: string) {
  return {
    sentenceId,
    lineNumber,
    text,
  }
}

function supportTarget(spec: SupportTargetSpec): WordSupportTarget {
  return {
    targetId: spec.targetId,
    passageId: spec.passageId,
    sentenceId: spec.sentenceId,
    surfaceWord: spec.surfaceWord,
    focusParts: [
      { text: spec.firstPart, emphasis: false },
      { text: spec.secondPart, emphasis: true },
    ],
    displayChunks: [
      { displayText: spec.firstPart, speechText: spec.firstSpeech },
      { displayText: spec.secondPart, speechText: spec.secondSpeech },
    ],
    spokenChunks: [
      { displayText: spec.firstPart, speechText: spec.firstSpeech },
      { displayText: spec.secondPart, speechText: spec.secondSpeech },
    ],
    blendSpeechText: `${spec.firstSpeech} ${spec.secondSpeech}`,
    wholeWordSpeechText: spec.surfaceWord,
    sentenceSpeechText: spec.sentenceSpeechText,
    reviewStatus: 'DRAFT',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
  }
}

const feederWatchSentence1 = 'Maya and Leo count birds at the feeder each morning and write the numbers on a chart they can read together.'
const feederWatchSentence2 = 'A blue jay visits first, then a sparrow arrives, and two finches hop in after breakfast crumbs fall from the tray.'
const feederWatchSentence3 = 'Their graph shows that the blue jay bar is tallest, so the class can compare which bird appears most often.'
const feederWatchSentence4 = 'The glossary says observe means to look carefully and notice details, which helps the readers understand the count.'

const gardenGridSentence1 = 'Nia and Sol study a garden map before they walk to the bean bed in the sunny corner.'
const gardenGridSentence2 = 'The map marks the path, the compost bin, and the watering can shelf, so the class can locate each place quickly.'
const gardenGridSentence3 = 'A caption points to the bean bed and tells readers to start near the sunny corner.'
const gardenGridSentence4 = 'An illustration shows the bean plant, the trellis, and the labels for each part, and the glossary says locate means to find where something is placed.'

const rainGaugeSentence1 = 'After the morning storm, the class checks the rain gauge beside the window and writes down what it caught.'
const rainGaugeSentence2 = 'Their graph shows how many millimeters fell on each day, so the class can compare the rain amounts.'
const rainGaugeSentence3 = 'A caption tells readers that taller bars mean more rain on that day.'
const rainGaugeSentence4 = 'The glossary defines millimeter as a small unit that helps people measure rain carefully.'

export const textFeatureHuntPassages: readonly Passage[] = [
  {
    passageIdentifier: TEXT_FEATURE_HUNT_PASSAGE_IDS.feederWatch,
    gradeBand: 2,
    passageText: [feederWatchSentence1, feederWatchSentence2, feederWatchSentence3, feederWatchSentence4].join(' '),
    contentKind: 'informational',
    sentences: [
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 1), 1, feederWatchSentence1),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 2), 2, feederWatchSentence2),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 3), 3, feederWatchSentence3),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 4), 4, feederWatchSentence4),
    ],
    informationalStructure: {
      titleFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.title,
      sections: [
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.feederWatch.count,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.headingCount,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 1),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 2),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.graph,
            TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.caption,
          ],
        },
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.feederWatch.meaning,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.headingMeaning,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 3),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 4),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.glossary,
          ],
        },
      ],
      features: [
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.title,
          kind: 'title',
          text: 'Feeder Watch',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.headingCount,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.feederWatch.count,
          text: 'Counting Visitors',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.graph,
          kind: 'graph',
          title: 'Bird Visitor Graph',
          valueLabel: 'visits',
          dataPoints: [
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.graph}-blue-jay`, label: 'Blue jay', value: 5 },
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.graph}-sparrow`, label: 'Sparrow', value: 3 },
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.graph}-finches`, label: 'Finches', value: 2 },
          ],
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.caption,
          kind: 'caption',
          targetFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.graph,
          text: 'The tall blue bar shows the bird the class saw most often.',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.headingMeaning,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.feederWatch.meaning,
          text: 'A Helpful Word',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.glossary,
          kind: 'glossary',
          entries: [
            {
              entryId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.glossary}-observe`,
              term: 'observe',
              definition: 'to look carefully and notice details',
            },
          ],
        },
      ],
    },
    readingContext: 'A class feeder log and simple bird count chart.',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: [
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.feederWatch.sentence1,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.feederWatch,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 1),
        surfaceWord: 'feeder',
        firstPart: 'feed',
        secondPart: 'er',
        firstSpeech: 'feed',
        secondSpeech: 'er',
        sentenceSpeechText: feederWatchSentence1,
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.feederWatch.sentence2,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.feederWatch,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 2),
        surfaceWord: 'sparrow',
        firstPart: 'spar',
        secondPart: 'row',
        firstSpeech: 'spar',
        secondSpeech: 'row',
        sentenceSpeechText: feederWatchSentence2,
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.feederWatch.sentence3,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.feederWatch,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 3),
        surfaceWord: 'graph',
        firstPart: 'gr',
        secondPart: 'aph',
        firstSpeech: 'gr',
        secondSpeech: 'aph',
        sentenceSpeechText: feederWatchSentence3,
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.feederWatch.sentence4,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.feederWatch,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 4),
        surfaceWord: 'observe',
        firstPart: 'ob',
        secondPart: 'serve',
        firstSpeech: 'ob',
        secondSpeech: 'serve',
        sentenceSpeechText: feederWatchSentence4,
      }),
    ],
  },
  {
    passageIdentifier: TEXT_FEATURE_HUNT_PASSAGE_IDS.gardenGrid,
    gradeBand: 2,
    passageText: [gardenGridSentence1, gardenGridSentence2, gardenGridSentence3, gardenGridSentence4].join(' '),
    contentKind: 'informational',
    sentences: [
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 1), 1, gardenGridSentence1),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 2), 2, gardenGridSentence2),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 3), 3, gardenGridSentence3),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 4), 4, gardenGridSentence4),
    ],
    informationalStructure: {
      titleFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.title,
      sections: [
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.gardenGrid.map,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.headingMap,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 1),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 2),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map,
            TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.caption,
          ],
        },
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.gardenGrid.word,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.headingWord,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 3),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 4),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.illustration,
          ],
        },
      ],
      features: [
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.title,
          kind: 'title',
          text: 'Garden Grid',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.headingMap,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.gardenGrid.map,
          text: 'Finding Places',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map,
          kind: 'map',
          title: 'Garden Path Map',
          rows: 3,
          columns: 3,
          locations: [
            {
              locationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map}-bean-bed`,
              label: 'Bean bed',
              description: 'The bean bed sits near the sunny corner.',
              position: { row: 1, column: 3 },
              order: 1,
            },
            {
              locationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map}-compost-bin`,
              label: 'Compost bin',
              description: 'The compost bin sits by the fence path.',
              position: { row: 2, column: 1 },
              order: 2,
            },
            {
              locationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map}-hose-shelf`,
              label: 'Watering shelf',
              description: 'The watering can shelf waits beside the tools.',
              position: { row: 3, column: 2 },
              order: 3,
            },
          ],
          legendEntries: [
            {
              legendId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map}-legend-path`,
              label: 'Path',
              description: 'The path shows where to walk.',
            },
            {
              legendId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map}-legend-bed`,
              label: 'Bed',
              description: 'The bed shows where plants grow.',
            },
          ],
          connections: [
            {
              fromLocationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map}-compost-bin`,
              toLocationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map}-bean-bed`,
              label: 'walks to',
            },
          ],
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.caption,
          kind: 'caption',
          targetFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map,
          text: 'The caption points to the bean bed and tells readers to start near the sunny corner.',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.headingWord,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.gardenGrid.word,
          text: 'Reading the Picture',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.illustration,
          kind: 'illustration',
          title: 'Bean Plant Illustration',
          accessibleDescription: 'A simple drawing shows the bean plant, trellis, and labels for each part.',
          labels: [
            {
              labelId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.illustration}-bean`,
              text: 'Bean plant',
              description: 'The main plant climbing upward.',
            },
            {
              labelId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.illustration}-trellis`,
              text: 'Trellis',
              description: 'The support that helps the plant climb.',
            },
          ],
        },
      ],
    },
    readingContext: 'A class garden map and labeled plant drawing.',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: [
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.gardenGrid.sentence1,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.gardenGrid,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 1),
        surfaceWord: 'garden',
        firstPart: 'gar',
        secondPart: 'den',
        firstSpeech: 'gar',
        secondSpeech: 'den',
        sentenceSpeechText: gardenGridSentence1,
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.gardenGrid.sentence2,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.gardenGrid,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 2),
        surfaceWord: 'locate',
        firstPart: 'lo',
        secondPart: 'cate',
        firstSpeech: 'lo',
        secondSpeech: 'cate',
        sentenceSpeechText: gardenGridSentence2,
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.gardenGrid.sentence3,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.gardenGrid,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 3),
        surfaceWord: 'caption',
        firstPart: 'cap',
        secondPart: 'tion',
        firstSpeech: 'cap',
        secondSpeech: 'shun',
        sentenceSpeechText: gardenGridSentence3,
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.gardenGrid.sentence4,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.gardenGrid,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 4),
        surfaceWord: 'trellis',
        firstPart: 'trel',
        secondPart: 'lis',
        firstSpeech: 'trel',
        secondSpeech: 'lis',
        sentenceSpeechText: gardenGridSentence4,
      }),
    ],
  },
  {
    passageIdentifier: TEXT_FEATURE_HUNT_PASSAGE_IDS.rainGauge,
    gradeBand: 2,
    passageText: [rainGaugeSentence1, rainGaugeSentence2, rainGaugeSentence3, rainGaugeSentence4].join(' '),
    contentKind: 'informational',
    sentences: [
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 1), 1, rainGaugeSentence1),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 2), 2, rainGaugeSentence2),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 3), 3, rainGaugeSentence3),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 4), 4, rainGaugeSentence4),
    ],
    informationalStructure: {
      titleFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.title,
      sections: [
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.rainGauge.graph,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.headingGraph,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 1),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 2),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.graph,
            TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.caption,
          ],
        },
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.rainGauge.glossary,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.headingGlossary,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 3),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 4),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.glossary,
          ],
        },
      ],
      features: [
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.title,
          kind: 'title',
          text: 'Rain Gauge Notes',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.headingGraph,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.rainGauge.graph,
          text: 'Measuring the Storm',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.graph,
          kind: 'graph',
          title: 'Rainfall Graph',
          valueLabel: 'millimeters',
          dataPoints: [
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.graph}-monday`, label: 'Monday', value: 4, unitText: 'mm' },
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.graph}-tuesday`, label: 'Tuesday', value: 7, unitText: 'mm' },
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.graph}-wednesday`, label: 'Wednesday', value: 5, unitText: 'mm' },
          ],
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.caption,
          kind: 'caption',
          targetFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.graph,
          text: 'The caption tells readers that taller bars mean more rain on that day.',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.headingGlossary,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.rainGauge.glossary,
          text: 'Words That Help',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.glossary,
          kind: 'glossary',
          entries: [
            {
              entryId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.glossary}-millimeter`,
              term: 'millimeter',
              definition: 'a small unit that helps people measure rain carefully',
            },
          ],
        },
      ],
    },
    readingContext: 'A classroom rain gauge and simple rainfall graph.',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: [
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.rainGauge.sentence1,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.rainGauge,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 1),
        surfaceWord: 'gauge',
        firstPart: 'gaug',
        secondPart: 'e',
        firstSpeech: 'gaug',
        secondSpeech: 'e',
        sentenceSpeechText: rainGaugeSentence1,
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.rainGauge.sentence2,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.rainGauge,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 2),
        surfaceWord: 'graph',
        firstPart: 'gr',
        secondPart: 'aph',
        firstSpeech: 'gr',
        secondSpeech: 'aph',
        sentenceSpeechText: rainGaugeSentence2,
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.rainGauge.sentence3,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.rainGauge,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 3),
        surfaceWord: 'caption',
        firstPart: 'cap',
        secondPart: 'tion',
        firstSpeech: 'cap',
        secondSpeech: 'shun',
        sentenceSpeechText: rainGaugeSentence3,
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.rainGauge.sentence4,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.rainGauge,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 4),
        surfaceWord: 'millimeter',
        firstPart: 'milli',
        secondPart: 'meter',
        firstSpeech: 'mil-lee',
        secondSpeech: 'meer-ter',
        sentenceSpeechText: rainGaugeSentence4,
      }),
    ],
  },
  {
    passageIdentifier: TEXT_FEATURE_HUNT_PASSAGE_IDS.trailMap,
    gradeBand: 2,
    passageText: [
      'A family follows a trail map at the nature center and stops at the trail sign before they begin.',
      'The map shows the pond, the oak tree, and the overlook, so the family can choose the right path.',
      'A caption says the dashed line marks the walking route and helps readers match the route to the trail.',
      'The glossary says route means a path that people follow.',
    ].join(' '),
    contentKind: 'informational',
    sentences: [
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 1), 1, 'A family follows a trail map at the nature center and stops at the trail sign before they begin.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 2), 2, 'The map shows the pond, the oak tree, and the overlook, so the family can choose the right path.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 3), 3, 'A caption says the dashed line marks the walking route and helps readers match the route to the trail.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 4), 4, 'The glossary says route means a path that people follow.'),
    ],
    informationalStructure: {
      titleFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.title,
      sections: [
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.trailMap.map,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.headingMap,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 1),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 2),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map,
            TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.caption,
          ],
        },
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.trailMap.illustration,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.headingIllustration,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 3),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 4),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.illustration,
          ],
        },
      ],
      features: [
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.title,
          kind: 'title',
          text: 'Nature Center Trail',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.headingMap,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.trailMap.map,
          text: 'Reading the Map',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map,
          kind: 'map',
          title: 'Nature Center Trail Map',
          rows: 3,
          columns: 3,
          locations: [
            {
              locationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map}-pond`,
              label: 'Pond',
              description: 'A small pond sits beside the trail.',
              position: { row: 1, column: 2 },
              order: 1,
            },
            {
              locationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map}-oak`,
              label: 'Oak tree',
              description: 'The oak tree stands near the bend.',
              position: { row: 2, column: 2 },
              order: 2,
            },
            {
              locationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map}-overlook`,
              label: 'Overlook',
              description: 'The overlook sits at the end of the path.',
              position: { row: 3, column: 3 },
              order: 3,
            },
          ],
          legendEntries: [
            {
              legendId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map}-legend-path`,
              label: 'Path',
              description: 'The path shows where to walk.',
            },
            {
              legendId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map}-legend-stop`,
              label: 'Stop',
              description: 'A stop marks a place to pause and look.',
            },
          ],
          connections: [
            {
              fromLocationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map}-pond`,
              toLocationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map}-overlook`,
              label: 'leads to',
            },
          ],
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.caption,
          kind: 'caption',
          targetFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map,
          text: 'The caption says the dashed line marks the walking route.',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.headingIllustration,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.trailMap.illustration,
          text: 'Looking Closely',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.illustration,
          kind: 'illustration',
          title: 'Trail Sign Illustration',
          accessibleDescription: 'A simple drawing shows the trail sign, pond reeds, and a bench near the start.',
          labels: [
            {
              labelId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.illustration}-sign`,
              text: 'Trail sign',
              description: 'The sign points walkers to the trail.',
            },
            {
              labelId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.illustration}-reeds`,
              text: 'Pond reeds',
              description: 'Tall plants near the pond water.',
            },
          ],
        },
      ],
    },
    readingContext: 'A fictional nature-center trail map and path sign.',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: [
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.trailMap.sentence1,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.trailMap,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 1),
        surfaceWord: 'trail',
        firstPart: 'tr',
        secondPart: 'ail',
        firstSpeech: 'tr',
        secondSpeech: 'ail',
        sentenceSpeechText: 'A family follows a trail map at the nature center and stops at the trail sign before they begin.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.trailMap.sentence2,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.trailMap,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 2),
        surfaceWord: 'overlook',
        firstPart: 'over',
        secondPart: 'look',
        firstSpeech: 'over',
        secondSpeech: 'look',
        sentenceSpeechText: 'The map shows the pond, the oak tree, and the overlook, so the family can choose the right path.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.trailMap.sentence3,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.trailMap,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 3),
        surfaceWord: 'caption',
        firstPart: 'cap',
        secondPart: 'tion',
        firstSpeech: 'cap',
        secondSpeech: 'shun',
        sentenceSpeechText: 'A caption says the dashed line marks the walking route and helps readers match the route to the trail.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.trailMap.sentence4,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.trailMap,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 4),
        surfaceWord: 'route',
        firstPart: 'ro',
        secondPart: 'ute',
        firstSpeech: 'ro',
        secondSpeech: 'ute',
        sentenceSpeechText: 'The glossary says route means a path that people follow.',
      }),
    ],
  },
  {
    passageIdentifier: TEXT_FEATURE_HUNT_PASSAGE_IDS.moonNotes,
    gradeBand: 2,
    passageText: [
      'Each night, Priya writes moon notes in a class log and circles the shape she sees before bed.',
      'The graph shows which moon shape the class saw each night, so the reader can compare the moon changes across the week.',
      'A caption explains that the tallest bar names the shape seen most often.',
      'The glossary says observe means to watch carefully over time.',
    ].join(' '),
    contentKind: 'informational',
    sentences: [
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 1), 1, 'Each night, Priya writes moon notes in a class log and circles the shape she sees before bed.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 2), 2, 'The graph shows which moon shape the class saw each night, so the reader can compare the moon changes across the week.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 3), 3, 'A caption explains that the tallest bar names the shape seen most often.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 4), 4, 'The glossary says observe means to watch carefully over time.'),
    ],
    informationalStructure: {
      titleFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.title,
      sections: [
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.moonNotes.graph,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.headingGraph,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 1),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 2),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.graph,
            TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.caption,
          ],
        },
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.moonNotes.glossary,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.headingGlossary,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 3),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 4),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.glossary,
          ],
        },
      ],
      features: [
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.title,
          kind: 'title',
          text: 'Moon Notes',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.headingGraph,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.moonNotes.graph,
          text: 'Night by Night',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.graph,
          kind: 'graph',
          title: 'Moon Shape Graph',
          valueLabel: 'nights',
          dataPoints: [
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.graph}-full`, label: 'Full moon', value: 2 },
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.graph}-half`, label: 'Half moon', value: 3 },
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.graph}-crescent`, label: 'Crescent moon', value: 1 },
          ],
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.caption,
          kind: 'caption',
          targetFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.graph,
          text: 'The caption explains that the tallest bar names the shape seen most often.',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.headingGlossary,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.moonNotes.glossary,
          text: 'A Word for Careful Watching',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.glossary,
          kind: 'glossary',
          entries: [
            {
              entryId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.glossary}-observe`,
              term: 'observe',
              definition: 'to watch carefully over time',
            },
          ],
        },
      ],
    },
    readingContext: 'A class log of moon shapes seen over several nights.',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: [
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.moonNotes.sentence1,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.moonNotes,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 1),
        surfaceWord: 'moon',
        firstPart: 'mo',
        secondPart: 'on',
        firstSpeech: 'mo',
        secondSpeech: 'on',
        sentenceSpeechText: 'Each night, Priya writes moon notes in a class log and circles the shape she sees before bed.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.moonNotes.sentence2,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.moonNotes,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 2),
        surfaceWord: 'graph',
        firstPart: 'gr',
        secondPart: 'aph',
        firstSpeech: 'gr',
        secondSpeech: 'aph',
        sentenceSpeechText: 'The graph shows which moon shape the class saw each night, so the reader can compare the moon changes across the week.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.moonNotes.sentence3,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.moonNotes,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 3),
        surfaceWord: 'caption',
        firstPart: 'cap',
        secondPart: 'tion',
        firstSpeech: 'cap',
        secondSpeech: 'shun',
        sentenceSpeechText: 'A caption explains that the tallest bar names the shape seen most often.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.moonNotes.sentence4,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.moonNotes,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 4),
        surfaceWord: 'observe',
        firstPart: 'ob',
        secondPart: 'serve',
        firstSpeech: 'ob',
        secondSpeech: 'serve',
        sentenceSpeechText: 'The glossary says observe means to watch carefully over time.',
      }),
    ],
  },
  {
    passageIdentifier: TEXT_FEATURE_HUNT_PASSAGE_IDS.recycleSort,
    gradeBand: 2,
    passageText: [
      'The class sorts paper, plastic, and cans into recycling bins after lunch clean-up time.',
      'The graph shows which bin filled fastest during cleanup day, and the class compares the tall bars to see the pattern.',
      'A caption points to the tallest bar and names the paper bin so readers know what it means.',
      'An illustration labels the bin lids, the sorting arrows, and the helper gloves to show how the class sorts each item.',
    ].join(' '),
    contentKind: 'informational',
    sentences: [
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 1), 1, 'The class sorts paper, plastic, and cans into recycling bins after lunch clean-up time.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 2), 2, 'The graph shows which bin filled fastest during cleanup day, and the class compares the tall bars to see the pattern.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 3), 3, 'A caption points to the tallest bar and names the paper bin so readers know what it means.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 4), 4, 'An illustration labels the bin lids, the sorting arrows, and the helper gloves to show how the class sorts each item.'),
    ],
    informationalStructure: {
      titleFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.title,
      sections: [
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.recycleSort.graph,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.headingGraph,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 1),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 2),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.graph,
            TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.caption,
          ],
        },
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.recycleSort.illustration,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.headingIllustration,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 3),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 4),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.illustration,
          ],
        },
      ],
      features: [
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.title,
          kind: 'title',
          text: 'Recycling Sort',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.headingGraph,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.recycleSort.graph,
          text: 'Counting the Bins',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.graph,
          kind: 'graph',
          title: 'Cleanup Day Recycling Graph',
          valueLabel: 'bags',
          dataPoints: [
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.graph}-paper`, label: 'Paper', value: 6 },
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.graph}-plastic`, label: 'Plastic', value: 4 },
            { dataPointId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.graph}-cans`, label: 'Cans', value: 3 },
          ],
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.caption,
          kind: 'caption',
          targetFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.graph,
          text: 'The caption points to the tallest bar and names the paper bin.',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.headingIllustration,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.recycleSort.illustration,
          text: 'Labels That Help',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.illustration,
          kind: 'illustration',
          title: 'Sorting Station Illustration',
          accessibleDescription: 'A simple drawing labels the bin lids, sorting arrows, and helper gloves.',
          labels: [
            {
              labelId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.illustration}-lids`,
              text: 'Bin lids',
              description: 'The tops that show what belongs inside.',
            },
            {
              labelId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.illustration}-gloves`,
              text: 'Helper gloves',
              description: 'The gloves keep the class clean while sorting.',
            },
          ],
        },
      ],
    },
    readingContext: 'A classroom recycling survey with simple counting.',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: [
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.recycleSort.sentence1,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.recycleSort,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 1),
        surfaceWord: 'bins',
        firstPart: 'bin',
        secondPart: 's',
        firstSpeech: 'bin',
        secondSpeech: 's',
        sentenceSpeechText: 'The class sorts paper, plastic, and cans into recycling bins after lunch clean-up time.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.recycleSort.sentence2,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.recycleSort,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 2),
        surfaceWord: 'graph',
        firstPart: 'gr',
        secondPart: 'aph',
        firstSpeech: 'gr',
        secondSpeech: 'aph',
        sentenceSpeechText: 'The graph shows which bin filled fastest during cleanup day, and the class compares the tall bars to see the pattern.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.recycleSort.sentence3,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.recycleSort,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 3),
        surfaceWord: 'caption',
        firstPart: 'cap',
        secondPart: 'tion',
        firstSpeech: 'cap',
        secondSpeech: 'shun',
        sentenceSpeechText: 'A caption points to the tallest bar and names the paper bin so readers know what it means.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.recycleSort.sentence4,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.recycleSort,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 4),
        surfaceWord: 'illustration',
        firstPart: 'illustr',
        secondPart: 'ation',
        firstSpeech: 'il-lus-tray-shun',
        secondSpeech: 'ay-shun',
        sentenceSpeechText: 'An illustration labels the bin lids, the sorting arrows, and the helper gloves to show how the class sorts each item.',
      }),
    ],
  },
  {
    passageIdentifier: TEXT_FEATURE_HUNT_PASSAGE_IDS.compostChange,
    gradeBand: 2,
    passageText: [
      'The garden team watches compost change from scraps into soil-like bits near the herb bed.',
      'The map shows where the compost bin sits beside the herb bed and the hose hook, so helpers can find it quickly.',
      'A caption explains that the shaded spot keeps the bin cool and slows the warm, slow change inside.',
      'The glossary defines compost as plant and food scraps that break down slowly into rich soil.',
    ].join(' '),
    contentKind: 'informational',
    sentences: [
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 1), 1, 'The garden team watches compost change from scraps into soil-like bits near the herb bed.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 2), 2, 'The map shows where the compost bin sits beside the herb bed and the hose hook, so helpers can find it quickly.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 3), 3, 'A caption explains that the shaded spot keeps the bin cool and slows the warm, slow change inside.'),
      sentence(textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 4), 4, 'The glossary defines compost as plant and food scraps that break down slowly into rich soil.'),
    ],
    informationalStructure: {
      titleFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.title,
      sections: [
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.compostChange.map,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.headingMap,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 1),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 2),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map,
            TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.caption,
          ],
        },
        {
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.compostChange.illustration,
          headingFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.headingIllustration,
          sentenceIds: [
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 3),
            textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 4),
          ],
          featureIds: [
            TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.glossary,
          ],
        },
      ],
      features: [
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.title,
          kind: 'title',
          text: 'Compost Change',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.headingMap,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.compostChange.map,
          text: 'Where It Stays',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map,
          kind: 'map',
          title: 'Compost Corner Map',
          rows: 3,
          columns: 3,
          locations: [
            {
              locationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map}-compost-bin`,
              label: 'Compost bin',
              description: 'The compost bin sits beside the herb bed.',
              position: { row: 2, column: 2 },
              order: 1,
            },
            {
              locationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map}-herb-bed`,
              label: 'Herb bed',
              description: 'Fresh herbs grow beside the bin.',
              position: { row: 1, column: 2 },
              order: 2,
            },
            {
              locationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map}-hose-hook`,
              label: 'Hose hook',
              description: 'The hose hook hangs near the path.',
              position: { row: 3, column: 3 },
              order: 3,
            },
          ],
          legendEntries: [
            {
              legendId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map}-legend-cool`,
              label: 'Cool spot',
              description: 'The shaded spot keeps the bin cool.',
            },
            {
              legendId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map}-legend-path`,
              label: 'Path',
              description: 'The path shows how helpers walk to the bin.',
            },
          ],
          connections: [
            {
              fromLocationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map}-hose-hook`,
              toLocationId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map}-compost-bin`,
              label: 'leads to',
            },
          ],
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.caption,
          kind: 'caption',
          targetFeatureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map,
          text: 'The caption explains that the shaded spot keeps the bin cool.',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.headingIllustration,
          kind: 'heading',
          sectionId: TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS.compostChange.illustration,
          text: 'What It Means',
        },
        {
          featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.glossary,
          kind: 'glossary',
          entries: [
            {
              entryId: `${TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.glossary}-compost`,
              term: 'compost',
              definition: 'plant and food scraps that break down slowly into rich soil',
            },
          ],
        },
      ],
    },
    readingContext: 'A garden compost corner with map and glossary support.',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: [
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.compostChange.sentence1,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.compostChange,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 1),
        surfaceWord: 'compost',
        firstPart: 'com',
        secondPart: 'post',
        firstSpeech: 'com',
        secondSpeech: 'post',
        sentenceSpeechText: 'The garden team watches compost change from scraps into soil-like bits near the herb bed.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.compostChange.sentence2,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.compostChange,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 2),
        surfaceWord: 'map',
        firstPart: 'm',
        secondPart: 'ap',
        firstSpeech: 'm',
        secondSpeech: 'ap',
        sentenceSpeechText: 'The map shows where the compost bin sits beside the herb bed and the hose hook, so helpers can find it quickly.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.compostChange.sentence3,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.compostChange,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 3),
        surfaceWord: 'caption',
        firstPart: 'cap',
        secondPart: 'tion',
        firstSpeech: 'cap',
        secondSpeech: 'shun',
        sentenceSpeechText: 'A caption explains that the shaded spot keeps the bin cool and slows the warm, slow change inside.',
      }),
      supportTarget({
        targetId: TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS.compostChange.sentence4,
        passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.compostChange,
        sentenceId: textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 4),
        surfaceWord: 'glossary',
        firstPart: 'glos',
        secondPart: 'sary',
        firstSpeech: 'glos',
        secondSpeech: 'sary',
        sentenceSpeechText: 'The glossary defines compost as plant and food scraps that break down slowly into rich soil.',
      }),
    ],
  },
]
