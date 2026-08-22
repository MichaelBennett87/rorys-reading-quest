import type { Passage, WordSupportTarget } from '../../../../types'
import type {
  InformationalCaptionFeature,
  InformationalFeature,
  InformationalGlossaryFeature,
  InformationalGraphFeature,
  InformationalHeadingFeature,
  InformationalIllustrationFeature,
  InformationalMapFeature,
  InformationalSection,
  InformationalTitleFeature,
} from '../../../../informationalTypes'
import {
  opinionEvidenceDeskContentVersion,
  opinionEvidenceDeskFeatureIds,
  opinionEvidenceDeskPassageIds,
  opinionEvidenceDeskSentenceIds,
} from './ids'

type Sentence = {
  sentenceId: string
  text: string
}

const title = (featureId: string, text: string): InformationalTitleFeature => ({ featureId, kind: 'title', text })
const heading = (featureId: string, sectionId: string, text: string): InformationalHeadingFeature => ({
  featureId,
  kind: 'heading',
  sectionId,
  text,
})
const caption = (featureId: string, targetFeatureId: string, text: string): InformationalCaptionFeature => ({
  featureId,
  kind: 'caption',
  targetFeatureId,
  text,
})
const graph = (featureId: string, titleText: string, valueLabel: string, dataPoints: InformationalGraphFeature['dataPoints']): InformationalGraphFeature => ({
  featureId,
  kind: 'graph',
  title: titleText,
  valueLabel,
  dataPoints,
})
const map = (
  featureId: string,
  titleText: string,
  rows: number,
  columns: number,
  locations: InformationalMapFeature['locations'],
  legendEntries: InformationalMapFeature['legendEntries'],
  connections: InformationalMapFeature['connections'] = [],
): InformationalMapFeature => ({
  featureId,
  kind: 'map',
  title: titleText,
  rows,
  columns,
  locations,
  legendEntries,
  connections,
})
const glossary = (featureId: string, entries: InformationalGlossaryFeature['entries']): InformationalGlossaryFeature => ({
  featureId,
  kind: 'glossary',
  entries,
})
const illustration = (
  featureId: string,
  titleText: string,
  accessibleDescription: string,
  labels: InformationalIllustrationFeature['labels'],
): InformationalIllustrationFeature => ({
  featureId,
  kind: 'illustration',
  title: titleText,
  accessibleDescription,
  labels,
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
    contentVersion: opinionEvidenceDeskContentVersion,
  }
}

function buildPassage(spec: {
  passageIdentifier: string
  readingContext: string
  sentences: Sentence[]
  sections: InformationalSection[]
  features: InformationalFeature[]
  wordSupportTargets: WordSupportTarget[]
}): Passage {
  const titleFeature = spec.features.find((feature): feature is InformationalTitleFeature => feature.kind === 'title')
  if (!titleFeature) {
    throw new Error(`Passage ${spec.passageIdentifier} is missing a title feature.`)
  }

  return {
    passageIdentifier: spec.passageIdentifier,
    gradeBand: 2,
    passageText: spec.sentences.map((sentence) => sentence.text).join(' '),
    contentKind: 'informational',
    sentences: spec.sentences.map((sentence) => ({ sentenceId: sentence.sentenceId, text: sentence.text })),
    informationalStructure: {
      titleFeatureId: titleFeature.featureId,
      sections: spec.sections,
      features: spec.features,
    },
    readingContext: spec.readingContext,
    contentVersion: opinionEvidenceDeskContentVersion,
    reviewStatus: 'DRAFT',
    wordSupportTargets: spec.wordSupportTargets,
  }
}

const shadedRestSpotSentences: Sentence[] = [
  { sentenceId: opinionEvidenceDeskSentenceIds.shadedRestSpots[0], text: 'The nature center has two benches near the trail.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.shadedRestSpots[1], text: 'One bench sits under a tree, and one sits in the open sun.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.shadedRestSpots[2], text: 'The class measured the shaded bench at three degrees cooler at noon.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.shadedRestSpots[3], text: 'Visitors stayed longer at the shaded bench because it felt more comfortable.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.shadedRestSpots[4], text: 'The ranger said families often rest there after the steep hill.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.shadedRestSpots[5], text: 'The nature center should add more shaded rest spots.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.shadedRestSpots[6], text: 'A graph shows the shaded bench staying cooler than the sunny bench.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.shadedRestSpots[7], text: 'That cooler spot helps people pause before they keep walking.' },
]

const nativeFlowerBedSentences: Sentence[] = [
  { sentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[0], text: 'The school garden has a sunny bed and a shady bed.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[1], text: 'Bees visited the native flowers more often than the nonnative flowers.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[2], text: 'The native flowers opened well after the morning sun came up.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[3], text: 'A few taller plants cast shadows on the back row.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[4], text: 'The garden should include more native flowers.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[5], text: 'The taller plants should stay at the back so the shorter plants get sun.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[6], text: 'A small illustration shows bees near the native flower row.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[7], text: 'The shady bed held fewer blooms but more leaves.' },
]

const clearTrailSymbolSentences: Sentence[] = [
  { sentenceId: opinionEvidenceDeskSentenceIds.clearTrailSymbols[0], text: 'The trail map uses arrows, stars, and water-drop symbols.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.clearTrailSymbols[1], text: 'A family paused because they could not tell which symbol meant the rest stop.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.clearTrailSymbols[2], text: 'The ranger added a small key near the top of the map.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.clearTrailSymbols[3], text: 'The key shows that the star means the overlook and the drop means water.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.clearTrailSymbols[4], text: 'The path marker at the river bends to the left.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.clearTrailSymbols[5], text: 'The trail map should use clearer symbols so visitors can find places quickly.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.clearTrailSymbols[6], text: 'A map legend lists the symbols and what they mean.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.clearTrailSymbols[7], text: 'Clear symbols help visitors keep moving without getting turned around.' },
]

const reusableContainerSentences: Sentence[] = [
  { sentenceId: opinionEvidenceDeskSentenceIds.reusableContainers[0], text: 'The class packed fruit and crackers in sturdy plastic boxes.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.reusableContainers[1], text: 'Each box could be washed and used again.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.reusableContainers[2], text: 'The trash can held fewer wrappers when the class used the boxes.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.reusableContainers[3], text: 'The class should use reusable containers for the school event.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.reusableContainers[4], text: 'The return bin near the door kept the empty boxes together.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.reusableContainers[5], text: 'A label on the bin helped students sort the containers quickly.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.reusableContainers[6], text: 'The boxes cost less than buying new paper trays every time.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.reusableContainers[7], text: 'Reusable means something can be used again after it is cleaned.' },
]

const birdFriendlyPlantSentences: Sentence[] = [
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[0], text: 'The observation area has a low fence, a path, and a small tree.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[1], text: 'Birds landed on the tree branches and ate the berries.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[2], text: 'The wind felt strong in the open part of the yard.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[3], text: 'The observation area should include more berry shrubs.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[4], text: 'The area should also place one water dish under the tree.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[5], text: 'A graph showed birds resting in the leaves.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[6], text: 'The class counted more bird visits near the shrubs than near the fence.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[7], text: 'The shrubs gave the birds food and a place to hide.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[8], text: 'A map of the area showed the tree, the path, and the fence.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[9], text: 'The berry shrubs sat nearest the middle path.' },
]

const compostSortingSignSentences: Sentence[] = [
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[0], text: 'The compost bin used to collect apple cores, leaves, and napkins.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[1], text: 'Some students put plastic wrappers in the bin by mistake.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[2], text: 'The class added clear sorting signs with pictures and words.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[3], text: 'The signs showed what belongs in compost and what does not.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[4], text: 'After the signs went up, the wrong items showed up less often.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[5], text: 'The compost pile stayed cleaner and easier to turn.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[6], text: 'The class should keep the sorting signs near the bin.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[7], text: 'A chart showed fewer mistakes after the signs appeared.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[8], text: 'One sign used a picture of an apple core and a leaf.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[9], text: 'The guide paper beside the bin listed three good compost items.' },
]

const rainBarrelPlanSentences: Sentence[] = [
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[0], text: 'The community garden sat near a roof that sent rainwater into a gutter.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[1], text: 'A rain barrel could catch that water before it ran into the dirt path.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[2], text: 'The garden beds dried out quickly on hot afternoons.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[3], text: 'The gardeners should add a rain barrel by the shed.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[4], text: 'The barrel could help the class water plants without using the hose as much.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[5], text: 'A map showed the shed, the beds, and the gutter line.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[6], text: 'The class measured more dry soil on the days without rain.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[7], text: 'The compost pile sat beside the shed.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[8], text: 'The water would be ready when the beds needed it.' },
  { sentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[9], text: 'A graph showed the barrel holding more water after storms.' },
]

const shadedRestSpotsPassage = buildPassage({
  passageIdentifier: opinionEvidenceDeskPassageIds.shadedRestSpots.passageId,
  readingContext: 'Nature center notes about where families stop to rest on a trail walk.',
  sentences: shadedRestSpotSentences,
  sections: [
    {
      sectionId: 'shaded-rest-spots-section-1',
      headingFeatureId: opinionEvidenceDeskFeatureIds.shadedRestSpots.headingA,
      sentenceIds: [
        shadedRestSpotSentences[0].sentenceId,
        shadedRestSpotSentences[1].sentenceId,
        shadedRestSpotSentences[2].sentenceId,
        shadedRestSpotSentences[3].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.shadedRestSpots.visual],
    },
    {
      sectionId: 'shaded-rest-spots-section-2',
      headingFeatureId: opinionEvidenceDeskFeatureIds.shadedRestSpots.headingB,
      sentenceIds: [
        shadedRestSpotSentences[4].sentenceId,
        shadedRestSpotSentences[5].sentenceId,
        shadedRestSpotSentences[6].sentenceId,
        shadedRestSpotSentences[7].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.shadedRestSpots.caption],
    },
  ],
  features: [
    title(opinionEvidenceDeskFeatureIds.shadedRestSpots.title, 'Shaded Rest Spots'),
    heading(opinionEvidenceDeskFeatureIds.shadedRestSpots.headingA, 'shaded-rest-spots-section-1', 'Why the Bench Feels Better'),
    heading(opinionEvidenceDeskFeatureIds.shadedRestSpots.headingB, 'shaded-rest-spots-section-2', 'What the Class Measured'),
    graph(
      opinionEvidenceDeskFeatureIds.shadedRestSpots.visual,
      'Bench Temperatures',
      'degrees cooler than the sunny bench',
      [
        { dataPointId: `${opinionEvidenceDeskPassageIds.shadedRestSpots.passageId}-shaded-bench`, label: 'Shaded bench', value: 3, unitText: 'degrees cooler' },
        { dataPointId: `${opinionEvidenceDeskPassageIds.shadedRestSpots.passageId}-sunny-bench`, label: 'Sunny bench', value: 0, unitText: 'degrees cooler' },
      ],
    ),
    caption(opinionEvidenceDeskFeatureIds.shadedRestSpots.caption, opinionEvidenceDeskFeatureIds.shadedRestSpots.visual, 'The shaded bench stayed cooler than the sunny bench during the class walk.'),
  ],
  wordSupportTargets: [
    makeSupportTarget(opinionEvidenceDeskPassageIds.shadedRestSpots.passageId, shadedRestSpotSentences[5].text, shadedRestSpotSentences[5].sentenceId, 'shaded', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.shadedRestSpots.passageId, shadedRestSpotSentences[2].text, shadedRestSpotSentences[2].sentenceId, 'cooler', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.shadedRestSpots.passageId, shadedRestSpotSentences[3].text, shadedRestSpotSentences[3].sentenceId, 'comfortable', 4),
    makeSupportTarget(opinionEvidenceDeskPassageIds.shadedRestSpots.passageId, shadedRestSpotSentences[7].text, shadedRestSpotSentences[7].sentenceId, 'pause', 2),
  ],
})

const nativeFlowerBedsPassage = buildPassage({
  passageIdentifier: opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId,
  readingContext: 'Garden notes about flowers that bring in bees and how the plants sit in the bed.',
  sentences: nativeFlowerBedSentences,
  sections: [
    {
      sectionId: 'native-flower-beds-section-1',
      headingFeatureId: opinionEvidenceDeskFeatureIds.nativeFlowerBeds.headingA,
      sentenceIds: [
        nativeFlowerBedSentences[0].sentenceId,
        nativeFlowerBedSentences[1].sentenceId,
        nativeFlowerBedSentences[2].sentenceId,
        nativeFlowerBedSentences[3].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.nativeFlowerBeds.visual],
    },
    {
      sectionId: 'native-flower-beds-section-2',
      headingFeatureId: opinionEvidenceDeskFeatureIds.nativeFlowerBeds.headingB,
      sentenceIds: [
        nativeFlowerBedSentences[4].sentenceId,
        nativeFlowerBedSentences[5].sentenceId,
        nativeFlowerBedSentences[6].sentenceId,
        nativeFlowerBedSentences[7].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.nativeFlowerBeds.caption],
    },
  ],
  features: [
    title(opinionEvidenceDeskFeatureIds.nativeFlowerBeds.title, 'Native Flower Beds'),
    heading(opinionEvidenceDeskFeatureIds.nativeFlowerBeds.headingA, 'native-flower-beds-section-1', 'What the Bees Showed'),
    heading(opinionEvidenceDeskFeatureIds.nativeFlowerBeds.headingB, 'native-flower-beds-section-2', 'What the Class Thinks'),
    illustration(
      opinionEvidenceDeskFeatureIds.nativeFlowerBeds.visual,
      'Flower Row Sketch',
      'A sketch of two garden rows with bees and taller plants.',
      [
        { labelId: `${opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId}-native-row`, text: 'Native flower row', description: 'The row with bees and more blossoms.' },
        { labelId: `${opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId}-tall-plants`, text: 'Tall plants', description: 'Plants that shade the back row.' },
        { labelId: `${opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId}-shady-row`, text: 'Shady row', description: 'The row with fewer blooms and more leaves.' },
      ],
    ),
    caption(opinionEvidenceDeskFeatureIds.nativeFlowerBeds.caption, opinionEvidenceDeskFeatureIds.nativeFlowerBeds.visual, 'The sketch shows bees near the native flowers and taller plants near the back row.'),
  ],
  wordSupportTargets: [
    makeSupportTarget(opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId, nativeFlowerBedSentences[1].text, nativeFlowerBedSentences[1].sentenceId, 'native', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId, nativeFlowerBedSentences[1].text, nativeFlowerBedSentences[1].sentenceId, 'flowers', 4),
    makeSupportTarget(opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId, nativeFlowerBedSentences[2].text, nativeFlowerBedSentences[2].sentenceId, 'sun', 2),
    makeSupportTarget(opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId, nativeFlowerBedSentences[5].text, nativeFlowerBedSentences[5].sentenceId, 'shorter', 4),
  ],
})

const clearTrailSymbolsPassage = buildPassage({
  passageIdentifier: opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId,
  readingContext: 'Trail guide notes about symbols on a map and how visitors use them.',
  sentences: clearTrailSymbolSentences,
  sections: [
    {
      sectionId: 'clear-trail-symbols-section-1',
      headingFeatureId: opinionEvidenceDeskFeatureIds.clearTrailSymbols.headingA,
      sentenceIds: [
        clearTrailSymbolSentences[0].sentenceId,
        clearTrailSymbolSentences[1].sentenceId,
        clearTrailSymbolSentences[2].sentenceId,
        clearTrailSymbolSentences[3].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.clearTrailSymbols.visual],
    },
    {
      sectionId: 'clear-trail-symbols-section-2',
      headingFeatureId: opinionEvidenceDeskFeatureIds.clearTrailSymbols.headingB,
      sentenceIds: [
        clearTrailSymbolSentences[4].sentenceId,
        clearTrailSymbolSentences[5].sentenceId,
        clearTrailSymbolSentences[6].sentenceId,
        clearTrailSymbolSentences[7].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.clearTrailSymbols.caption],
    },
  ],
  features: [
    title(opinionEvidenceDeskFeatureIds.clearTrailSymbols.title, 'Clear Trail Symbols'),
    heading(opinionEvidenceDeskFeatureIds.clearTrailSymbols.headingA, 'clear-trail-symbols-section-1', 'What the Map Already Had'),
    heading(opinionEvidenceDeskFeatureIds.clearTrailSymbols.headingB, 'clear-trail-symbols-section-2', 'Why the Legend Matters'),
    map(
      opinionEvidenceDeskFeatureIds.clearTrailSymbols.visual,
      'Trail Map Symbols',
      3,
      3,
      [
        { locationId: `${opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId}-rest-stop`, label: 'Rest stop', description: 'Where visitors can pause.', position: { row: 2, column: 2 }, order: 1 },
        { locationId: `${opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId}-overlook`, label: 'Overlook', description: 'A place with a long view.', position: { row: 1, column: 3 }, order: 2 },
        { locationId: `${opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId}-water-stop`, label: 'Water stop', description: 'A place to refill water.', position: { row: 3, column: 1 }, order: 3 },
      ],
      [
        { legendId: `${opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId}-star-legend`, label: 'Star symbol', description: 'Means the overlook.' },
        { legendId: `${opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId}-drop-legend`, label: 'Drop symbol', description: 'Means water.' },
      ],
      [
        { fromLocationId: `${opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId}-rest-stop`, toLocationId: `${opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId}-overlook`, label: 'walks toward' },
      ],
    ),
    caption(opinionEvidenceDeskFeatureIds.clearTrailSymbols.caption, opinionEvidenceDeskFeatureIds.clearTrailSymbols.visual, 'The legend explains the symbols so visitors can find the right places faster.'),
  ],
  wordSupportTargets: [
    makeSupportTarget(opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId, clearTrailSymbolSentences[0].text, clearTrailSymbolSentences[0].sentenceId, 'symbols', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId, clearTrailSymbolSentences[5].text, clearTrailSymbolSentences[5].sentenceId, 'clearer', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId, clearTrailSymbolSentences[6].text, clearTrailSymbolSentences[6].sentenceId, 'legend', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId, clearTrailSymbolSentences[1].text, clearTrailSymbolSentences[1].sentenceId, 'visitors', 4),
  ],
})

const reusableContainersPassage = buildPassage({
  passageIdentifier: opinionEvidenceDeskPassageIds.reusableContainers.passageId,
  readingContext: 'Class event notes about snack boxes, labels, and containers that can be used again.',
  sentences: reusableContainerSentences,
  sections: [
    {
      sectionId: 'reusable-containers-section-1',
      headingFeatureId: opinionEvidenceDeskFeatureIds.reusableContainers.headingA,
      sentenceIds: [
        reusableContainerSentences[0].sentenceId,
        reusableContainerSentences[1].sentenceId,
        reusableContainerSentences[2].sentenceId,
        reusableContainerSentences[3].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.reusableContainers.visual, opinionEvidenceDeskFeatureIds.reusableContainers.glossary],
    },
    {
      sectionId: 'reusable-containers-section-2',
      headingFeatureId: opinionEvidenceDeskFeatureIds.reusableContainers.headingB,
      sentenceIds: [
        reusableContainerSentences[4].sentenceId,
        reusableContainerSentences[5].sentenceId,
        reusableContainerSentences[6].sentenceId,
        reusableContainerSentences[7].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.reusableContainers.caption],
    },
  ],
  features: [
    title(opinionEvidenceDeskFeatureIds.reusableContainers.title, 'Reusable Containers'),
    heading(opinionEvidenceDeskFeatureIds.reusableContainers.headingA, 'reusable-containers-section-1', 'Packing the Event'),
    heading(opinionEvidenceDeskFeatureIds.reusableContainers.headingB, 'reusable-containers-section-2', 'After the Snack Table'),
    illustration(
      opinionEvidenceDeskFeatureIds.reusableContainers.visual,
      'Snack Box Setup',
      'A tray of reusable boxes and a return bin.',
      [
        { labelId: `${opinionEvidenceDeskPassageIds.reusableContainers.passageId}-box-stack`, text: 'Snack boxes', description: 'Boxes that can be washed and used again.' },
        { labelId: `${opinionEvidenceDeskPassageIds.reusableContainers.passageId}-return-bin`, text: 'Return bin', description: 'A bin for empty boxes.' },
        { labelId: `${opinionEvidenceDeskPassageIds.reusableContainers.passageId}-label-card`, text: 'Label card', description: 'A sign that helps students sort the containers.' },
      ],
    ),
    caption(opinionEvidenceDeskFeatureIds.reusableContainers.caption, opinionEvidenceDeskFeatureIds.reusableContainers.visual, 'The label and return bin help students keep the reusable boxes together.'),
    glossary(opinionEvidenceDeskFeatureIds.reusableContainers.glossary, [
      { entryId: `${opinionEvidenceDeskPassageIds.reusableContainers.passageId}-glossary-reusable`, term: 'reusable', definition: 'Can be used again after it is cleaned.' },
      { entryId: `${opinionEvidenceDeskPassageIds.reusableContainers.passageId}-glossary-container`, term: 'container', definition: 'A box or holder used to carry something.' },
      { entryId: `${opinionEvidenceDeskPassageIds.reusableContainers.passageId}-glossary-sort`, term: 'sort', definition: 'Put things into groups or places.' },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(opinionEvidenceDeskPassageIds.reusableContainers.passageId, reusableContainerSentences[3].text, reusableContainerSentences[3].sentenceId, 'reusable', 4),
    makeSupportTarget(opinionEvidenceDeskPassageIds.reusableContainers.passageId, reusableContainerSentences[0].text, reusableContainerSentences[0].sentenceId, 'containers', 4),
    makeSupportTarget(opinionEvidenceDeskPassageIds.reusableContainers.passageId, reusableContainerSentences[5].text, reusableContainerSentences[5].sentenceId, 'label', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.reusableContainers.passageId, reusableContainerSentences[5].text, reusableContainerSentences[5].sentenceId, 'sort', 2),
  ],
})

const birdFriendlyPlantsPassage = buildPassage({
  passageIdentifier: opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId,
  readingContext: 'Observation notes about birds visiting different parts of a small habitat area.',
  sentences: birdFriendlyPlantSentences,
  sections: [
    {
      sectionId: 'bird-friendly-plants-section-1',
      headingFeatureId: opinionEvidenceDeskFeatureIds.birdFriendlyPlants.headingA,
      sentenceIds: [
        birdFriendlyPlantSentences[0].sentenceId,
        birdFriendlyPlantSentences[1].sentenceId,
        birdFriendlyPlantSentences[2].sentenceId,
        birdFriendlyPlantSentences[3].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.birdFriendlyPlants.visual],
    },
    {
      sectionId: 'bird-friendly-plants-section-2',
      headingFeatureId: opinionEvidenceDeskFeatureIds.birdFriendlyPlants.headingB,
      sentenceIds: [
        birdFriendlyPlantSentences[4].sentenceId,
        birdFriendlyPlantSentences[5].sentenceId,
        birdFriendlyPlantSentences[6].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.birdFriendlyPlants.caption],
    },
    {
      sectionId: 'bird-friendly-plants-section-3',
      headingFeatureId: opinionEvidenceDeskFeatureIds.birdFriendlyPlants.headingC,
      sentenceIds: [
        birdFriendlyPlantSentences[7].sentenceId,
        birdFriendlyPlantSentences[8].sentenceId,
        birdFriendlyPlantSentences[9].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.birdFriendlyPlants.visual],
    },
  ],
  features: [
    title(opinionEvidenceDeskFeatureIds.birdFriendlyPlants.title, 'Bird-Friendly Plants'),
    heading(opinionEvidenceDeskFeatureIds.birdFriendlyPlants.headingA, 'bird-friendly-plants-section-1', 'What the Birds Used'),
    heading(opinionEvidenceDeskFeatureIds.birdFriendlyPlants.headingB, 'bird-friendly-plants-section-2', 'What the Class Wants'),
    heading(opinionEvidenceDeskFeatureIds.birdFriendlyPlants.headingC, 'bird-friendly-plants-section-3', 'What the Sketch Showed'),
    graph(
      opinionEvidenceDeskFeatureIds.birdFriendlyPlants.visual,
      'Bird Visits by Area',
      'visits',
      [
        { dataPointId: `${opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId}-shrubs-visits`, label: 'Shrubs', value: 8 },
        { dataPointId: `${opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId}-tree-visits`, label: 'Tree', value: 5 },
        { dataPointId: `${opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId}-fence-visits`, label: 'Fence', value: 2 },
      ],
    ),
    caption(opinionEvidenceDeskFeatureIds.birdFriendlyPlants.caption, opinionEvidenceDeskFeatureIds.birdFriendlyPlants.visual, 'Bird visits were highest near the shrubs and lower near the fence.'),
    glossary(opinionEvidenceDeskPassageIds.birdFriendlyPlants.glossaryFeatureId, [
      { entryId: `${opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId}-glossary-shrub`, term: 'berry shrub', definition: 'A shrub that can grow berries for birds.' },
      { entryId: `${opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId}-glossary-hide`, term: 'hide', definition: 'Stay out of sight for a short time.' },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId, birdFriendlyPlantSentences[3].text, birdFriendlyPlantSentences[3].sentenceId, 'birds', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId, birdFriendlyPlantSentences[7].text, birdFriendlyPlantSentences[7].sentenceId, 'shrubs', 4),
    makeSupportTarget(opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId, birdFriendlyPlantSentences[4].text, birdFriendlyPlantSentences[4].sentenceId, 'water', 2),
    makeSupportTarget(opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId, birdFriendlyPlantSentences[1].text, birdFriendlyPlantSentences[1].sentenceId, 'branch', 4),
  ],
})

const compostSortingSignsPassage = buildPassage({
  passageIdentifier: opinionEvidenceDeskPassageIds.compostSortingSigns.passageId,
  readingContext: 'Garden notes about clear signs that help students sort compost items.',
  sentences: compostSortingSignSentences,
  sections: [
    {
      sectionId: 'compost-sorting-signs-section-1',
      headingFeatureId: opinionEvidenceDeskFeatureIds.compostSortingSigns.headingA,
      sentenceIds: [
        compostSortingSignSentences[0].sentenceId,
        compostSortingSignSentences[1].sentenceId,
        compostSortingSignSentences[2].sentenceId,
        compostSortingSignSentences[3].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.compostSortingSigns.visual],
    },
    {
      sectionId: 'compost-sorting-signs-section-2',
      headingFeatureId: opinionEvidenceDeskFeatureIds.compostSortingSigns.headingB,
      sentenceIds: [
        compostSortingSignSentences[4].sentenceId,
        compostSortingSignSentences[5].sentenceId,
        compostSortingSignSentences[6].sentenceId,
        compostSortingSignSentences[7].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.compostSortingSigns.caption],
    },
    {
      sectionId: 'compost-sorting-signs-section-3',
      headingFeatureId: opinionEvidenceDeskFeatureIds.compostSortingSigns.headingC,
      sentenceIds: [
        compostSortingSignSentences[8].sentenceId,
        compostSortingSignSentences[9].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskPassageIds.compostSortingSigns.glossaryFeatureId],
    },
  ],
  features: [
    title(opinionEvidenceDeskFeatureIds.compostSortingSigns.title, 'Compost Sorting Signs'),
    heading(opinionEvidenceDeskFeatureIds.compostSortingSigns.headingA, 'compost-sorting-signs-section-1', 'What Went in the Bin'),
    heading(opinionEvidenceDeskFeatureIds.compostSortingSigns.headingB, 'compost-sorting-signs-section-2', 'What Changed After the Signs'),
    heading(opinionEvidenceDeskFeatureIds.compostSortingSigns.headingC, 'compost-sorting-signs-section-3', 'What the Guide Showed'),
    illustration(
      opinionEvidenceDeskFeatureIds.compostSortingSigns.visual,
      'Compost Sign Sketch',
      'A sketch of a compost bin with clear signs and labels.',
      [
        { labelId: `${opinionEvidenceDeskPassageIds.compostSortingSigns.passageId}-sign-card`, text: 'Sorting sign', description: 'A picture-and-word sign near the bin.' },
        { labelId: `${opinionEvidenceDeskPassageIds.compostSortingSigns.passageId}-apple-core`, text: 'Apple core', description: 'A good compost item shown on the sign.' },
        { labelId: `${opinionEvidenceDeskPassageIds.compostSortingSigns.passageId}-leaf`, text: 'Leaf', description: 'Another good compost item shown on the sign.' },
      ],
    ),
    caption(opinionEvidenceDeskFeatureIds.compostSortingSigns.caption, opinionEvidenceDeskFeatureIds.compostSortingSigns.visual, 'The picture signs helped students sort the compost more quickly.'),
    glossary(opinionEvidenceDeskPassageIds.compostSortingSigns.glossaryFeatureId, [
      { entryId: `${opinionEvidenceDeskPassageIds.compostSortingSigns.passageId}-glossary-compost`, term: 'compost', definition: 'A mix of scraps that can break down into soil.' },
      { entryId: `${opinionEvidenceDeskPassageIds.compostSortingSigns.passageId}-glossary-sort`, term: 'sort', definition: 'Put things into groups or places.' },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(opinionEvidenceDeskPassageIds.compostSortingSigns.passageId, compostSortingSignSentences[6].text, compostSortingSignSentences[6].sentenceId, 'compost', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.compostSortingSigns.passageId, compostSortingSignSentences[2].text, compostSortingSignSentences[2].sentenceId, 'signs', 3),
    makeSupportTarget(opinionEvidenceDeskPassageIds.compostSortingSigns.passageId, compostSortingSignSentences[1].text, compostSortingSignSentences[1].sentenceId, 'mistakes', 4),
    makeSupportTarget(opinionEvidenceDeskPassageIds.compostSortingSigns.passageId, compostSortingSignSentences[8].text, compostSortingSignSentences[8].sentenceId, 'picture', 4),
  ],
})

const rainBarrelPlanPassage = buildPassage({
  passageIdentifier: opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId,
  readingContext: 'Garden notes about catching rainwater and helping beds stay ready on hot days.',
  sentences: rainBarrelPlanSentences,
  sections: [
    {
      sectionId: 'rain-barrel-plan-section-1',
      headingFeatureId: opinionEvidenceDeskFeatureIds.rainBarrelPlan.headingA,
      sentenceIds: [
        rainBarrelPlanSentences[0].sentenceId,
        rainBarrelPlanSentences[1].sentenceId,
        rainBarrelPlanSentences[2].sentenceId,
        rainBarrelPlanSentences[3].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.rainBarrelPlan.visual],
    },
    {
      sectionId: 'rain-barrel-plan-section-2',
      headingFeatureId: opinionEvidenceDeskFeatureIds.rainBarrelPlan.headingB,
      sentenceIds: [
        rainBarrelPlanSentences[4].sentenceId,
        rainBarrelPlanSentences[5].sentenceId,
        rainBarrelPlanSentences[6].sentenceId,
        rainBarrelPlanSentences[7].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskFeatureIds.rainBarrelPlan.caption],
    },
    {
      sectionId: 'rain-barrel-plan-section-3',
      headingFeatureId: opinionEvidenceDeskFeatureIds.rainBarrelPlan.headingC,
      sentenceIds: [
        rainBarrelPlanSentences[8].sentenceId,
        rainBarrelPlanSentences[9].sentenceId,
      ],
      featureIds: [opinionEvidenceDeskPassageIds.rainBarrelPlan.glossaryFeatureId],
    },
  ],
  features: [
    title(opinionEvidenceDeskFeatureIds.rainBarrelPlan.title, 'Rain Barrel Plan'),
    heading(opinionEvidenceDeskFeatureIds.rainBarrelPlan.headingA, 'rain-barrel-plan-section-1', 'Where the Water Goes'),
    heading(opinionEvidenceDeskFeatureIds.rainBarrelPlan.headingB, 'rain-barrel-plan-section-2', 'Why the Barrel Helps'),
    heading(opinionEvidenceDeskFeatureIds.rainBarrelPlan.headingC, 'rain-barrel-plan-section-3', 'What the Map Showed'),
    map(
      opinionEvidenceDeskFeatureIds.rainBarrelPlan.visual,
      'Community Garden Water Paths',
      4,
      4,
      [
        { locationId: `${opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId}-shed`, label: 'Shed', description: 'The shed sits near the garden tools.', position: { row: 2, column: 3 }, order: 1 },
        { locationId: `${opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId}-beds`, label: 'Beds', description: 'The garden beds need water on hot days.', position: { row: 3, column: 2 }, order: 2 },
        { locationId: `${opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId}-gutter`, label: 'Gutter', description: 'The gutter carries rain off the roof.', position: { row: 1, column: 4 }, order: 3 },
      ],
      [
        { legendId: `${opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId}-rain-legend`, label: 'Rain barrel', description: 'Catches water from the roof.' },
        { legendId: `${opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId}-water-legend`, label: 'Water line', description: 'Shows where water can move.' },
      ],
      [
        { fromLocationId: `${opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId}-gutter`, toLocationId: `${opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId}-shed`, label: 'moves toward' },
      ],
    ),
    caption(opinionEvidenceDeskFeatureIds.rainBarrelPlan.caption, opinionEvidenceDeskFeatureIds.rainBarrelPlan.visual, 'The map shows why a rain barrel by the shed could help the beds later.'),
    glossary(opinionEvidenceDeskPassageIds.rainBarrelPlan.glossaryFeatureId, [
      { entryId: `${opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId}-glossary-rain-barrel`, term: 'rain barrel', definition: 'A container that catches and stores rainwater.' },
      { entryId: `${opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId}-glossary-gutter`, term: 'gutter', definition: 'A channel that carries rainwater off a roof.' },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId, rainBarrelPlanSentences[3].text, rainBarrelPlanSentences[3].sentenceId, 'rain', 2),
    makeSupportTarget(opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId, rainBarrelPlanSentences[3].text, rainBarrelPlanSentences[3].sentenceId, 'barrel', 4),
    makeSupportTarget(opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId, rainBarrelPlanSentences[4].text, rainBarrelPlanSentences[4].sentenceId, 'plants', 5),
    makeSupportTarget(opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId, rainBarrelPlanSentences[1].text, rainBarrelPlanSentences[1].sentenceId, 'water', 3),
  ],
})

export const opinionEvidenceDeskPassages: Passage[] = [
  shadedRestSpotsPassage,
  nativeFlowerBedsPassage,
  clearTrailSymbolsPassage,
  reusableContainersPassage,
  birdFriendlyPlantsPassage,
  compostSortingSignsPassage,
  rainBarrelPlanPassage,
]
