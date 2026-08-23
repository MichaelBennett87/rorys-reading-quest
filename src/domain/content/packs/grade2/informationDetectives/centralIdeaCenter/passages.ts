import type { Passage, WordSupportTarget } from '../../../../types'
import type {
  InformationalCaptionFeature,
  InformationalFeature,
  InformationalHeadingFeature,
  InformationalGlossaryFeature,
  InformationalGraphFeature,
  InformationalIllustrationFeature,
  InformationalMapFeature,
  InformationalSection,
  InformationalTitleFeature,
} from '../../../../informationalTypes'
import {
  centralIdeaCenterContentVersion,
  centralIdeaCenterFeatureIds,
  centralIdeaCenterPassageIds,
  centralIdeaCenterSentenceIds,
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
const caption = (featureId: string, targetFeatureId: string, text: string): InformationalCaptionFeature => ({ featureId, kind: 'caption', targetFeatureId, text })
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
  const start = surfaceWord.slice(0, splitIndex)
  const end = surfaceWord.slice(splitIndex)
  return {
    targetId: `${passageId}-${sentenceId}-${surfaceWord}`,
    passageId,
    sentenceId,
    surfaceWord,
    focusParts: [
      { text: start, emphasis: false },
      { text: end, emphasis: true },
    ],
    displayChunks: [
      { displayText: start, speechText: start },
      { displayText: end, speechText: end },
    ],
    spokenChunks: [
      { displayText: start, speechText: start },
      { displayText: end, speechText: end },
    ],
    blendSpeechText: surfaceWord,
    wholeWordSpeechText: surfaceWord,
    sentenceSpeechText: sentenceText,
    reviewStatus: 'DRAFT',
    contentVersion: centralIdeaCenterContentVersion,
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
    contentVersion: centralIdeaCenterContentVersion,
    reviewStatus: 'DRAFT',
    wordSupportTargets: spec.wordSupportTargets,
  }
}

export const rainGardenSentences: Sentence[] = [
  { sentenceId: centralIdeaCenterSentenceIds.rainGardenHelpers[0], text: 'A rain garden is a shallow bed that catches rain from a roof or walkway.' },
  { sentenceId: centralIdeaCenterSentenceIds.rainGardenHelpers[1], text: 'The soil holds the water for a little while so it can soak in slowly.' },
  { sentenceId: centralIdeaCenterSentenceIds.rainGardenHelpers[2], text: 'Small rocks at the edge keep the water from rushing away too fast.' },
  { sentenceId: centralIdeaCenterSentenceIds.rainGardenHelpers[3], text: 'The basin gives the rain a place to pause before it moves on.' },
  { sentenceId: centralIdeaCenterSentenceIds.rainGardenHelpers[4], text: 'The plants send roots into the wet soil and help the bed stay steady.' },
  { sentenceId: centralIdeaCenterSentenceIds.rainGardenHelpers[5], text: 'Bees and butterflies can visit the flowers when the bed is blooming.' },
  { sentenceId: centralIdeaCenterSentenceIds.rainGardenHelpers[6], text: 'Children can watch how water disappears after a storm.' },
  { sentenceId: centralIdeaCenterSentenceIds.rainGardenHelpers[7], text: 'A rain garden helps water soak in and gives plants a safer place to grow.' },
]

export const quietShelterSentences: Sentence[] = [
  { sentenceId: centralIdeaCenterSentenceIds.quietShelterSpaces[0], text: 'The shelter has soft beds, low lights, and water bowls.' },
  { sentenceId: centralIdeaCenterSentenceIds.quietShelterSpaces[1], text: 'Each animal gets a small space where it can rest without much noise.' },
  { sentenceId: centralIdeaCenterSentenceIds.quietShelterSpaces[2], text: 'Helpers clean the rooms every day and refill the bowls before visitors arrive.' },
  { sentenceId: centralIdeaCenterSentenceIds.quietShelterSpaces[3], text: 'Visitors follow one-way paths so the animals do not feel crowded.' },
  { sentenceId: centralIdeaCenterSentenceIds.quietShelterSpaces[4], text: 'Signs show which rooms are open and which rooms need quiet.' },
  { sentenceId: centralIdeaCenterSentenceIds.quietShelterSpaces[5], text: 'A calm shelter helps animals settle in and feel safe.' },
  { sentenceId: centralIdeaCenterSentenceIds.quietShelterSpaces[6], text: 'The front desk keeps a simple list of the animals who need extra rest.' },
  { sentenceId: centralIdeaCenterSentenceIds.quietShelterSpaces[7], text: 'Quiet rooms, clean beds, and clear paths work together for the animals.' },
]

export const pollinatorPatchSentences: Sentence[] = [
  { sentenceId: centralIdeaCenterSentenceIds.pollinatorPatchCounts[0], text: 'Our class counted three kinds of blooms in the sunny row.' },
  { sentenceId: centralIdeaCenterSentenceIds.pollinatorPatchCounts[1], text: 'The graph shows more blue flowers than red ones there.' },
  { sentenceId: centralIdeaCenterSentenceIds.pollinatorPatchCounts[2], text: 'Bees visited the sunny row most often on warm mornings.' },
  { sentenceId: centralIdeaCenterSentenceIds.pollinatorPatchCounts[3], text: 'The sunny row also had the tallest stems near the path.' },
  { sentenceId: centralIdeaCenterSentenceIds.pollinatorPatchCounts[4], text: 'The shady row had fewer blooms but more leaves.' },
  { sentenceId: centralIdeaCenterSentenceIds.pollinatorPatchCounts[5], text: 'Butterflies rested there when the sun was bright.' },
  { sentenceId: centralIdeaCenterSentenceIds.pollinatorPatchCounts[6], text: 'The class compared the counts to see which row helped the most pollinators.' },
  { sentenceId: centralIdeaCenterSentenceIds.pollinatorPatchCounts[7], text: 'A pollinator garden gives insects places to find food and rest.' },
]

export const weatherStationSentences: Sentence[] = [
  { sentenceId: centralIdeaCenterSentenceIds.weatherStationNotes[0], text: 'A thermometer tells the class if the air feels warmer or cooler.' },
  { sentenceId: centralIdeaCenterSentenceIds.weatherStationNotes[1], text: 'A rain gauge shows how much rain fell overnight.' },
  { sentenceId: centralIdeaCenterSentenceIds.weatherStationNotes[2], text: 'The class records the numbers in a chart each afternoon.' },
  { sentenceId: centralIdeaCenterSentenceIds.weatherStationNotes[3], text: 'A wind sock points the direction the wind blows.' },
  { sentenceId: centralIdeaCenterSentenceIds.weatherStationNotes[4], text: 'The class compares the new notes with older notes to notice patterns.' },
  { sentenceId: centralIdeaCenterSentenceIds.weatherStationNotes[5], text: 'A student circles cloudy days on the chart so the group can check them later.' },
  { sentenceId: centralIdeaCenterSentenceIds.weatherStationNotes[6], text: 'The tools help the class watch weather changes from day to day.' },
  { sentenceId: centralIdeaCenterSentenceIds.weatherStationNotes[7], text: 'With tools and careful observations, the class learns more about weather.' },
]

export const seedTravelSentences: Sentence[] = [
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[0], text: 'Some seeds are light and drift on the wind.' },
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[1], text: 'Some float on water after a rain.' },
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[2], text: 'A seed that lands in a new place can start another plant.' },
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[3], text: 'Sticky seeds ride on fur or feathers.' },
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[4], text: 'Birds may drop seeds after eating fruit.' },
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[5], text: 'A few seeds even hitch a ride on shoes or socks.' },
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[6], text: 'A classroom map shows where the seeds traveled.' },
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[7], text: 'Each route helped a seed reach a fresh spot.' },
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[8], text: 'That new spot can give the plant sun, soil, and room to grow.' },
  { sentenceId: centralIdeaCenterSentenceIds.seedTravelRoutes[9], text: 'Different seeds travel in different ways, and those trips help plants grow in new places.' },
]

export const compostChangeSentences: Sentence[] = [
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[0], text: 'Food scraps, leaves, and paper go into the pile.' },
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[1], text: 'Tiny bugs and worms help break the pieces apart.' },
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[2], text: 'The class turns the pile so air can move through it.' },
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[3], text: 'The pile gets darker and crumbly over time.' },
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[4], text: 'A graph shows the pile warming up and then cooling down.' },
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[5], text: 'The class watches the graph each week.' },
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[6], text: 'When the pile changes, it smells less like food scraps and more like earth.' },
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[7], text: 'The scraps become dark, crumbly compost that helps plants grow.' },
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[8], text: 'A teacher says the class can still see leaf bits in the pile.' },
  { sentenceId: centralIdeaCenterSentenceIds.compostChangeStory[9], text: 'Composting changes scraps and leaves into material that helps soil.' },
]

export const trailMarkerSentences: Sentence[] = [
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[0], text: 'Bright markers show which path to take.' },
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[1], text: 'The map tells hikers where to turn and where the loop ends.' },
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[2], text: 'Small signs remind visitors to stay on the trail.' },
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[3], text: 'The guide notices a fallen branch and marks the safe side path.' },
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[4], text: 'A few arrows point back toward the main loop.' },
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[5], text: 'The trail keeps walkers away from a steep bank.' },
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[6], text: 'Families can follow the same color marker all the way around.' },
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[7], text: 'Markers help walkers avoid getting lost.' },
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[8], text: 'The end sign shows where the path meets the parking area.' },
  { sentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[9], text: 'Trail markers help visitors stay on the right path and reach the end safely.' },
]

const rainGardenPassage = buildPassage({
  passageIdentifier: centralIdeaCenterPassageIds.rainGardenHelpers.passageId,
  readingContext: 'Class science notes about where rain goes after a storm.',
  sentences: rainGardenSentences,
  sections: [
    {
      sectionId: 'rain-garden-helpers-section-1',
      headingFeatureId: centralIdeaCenterFeatureIds.rainGardenHelpers.headingA,
      sentenceIds: [
        rainGardenSentences[0].sentenceId,
        rainGardenSentences[1].sentenceId,
        rainGardenSentences[2].sentenceId,
        rainGardenSentences[3].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.rainGardenHelpers.visual,
        centralIdeaCenterFeatureIds.rainGardenHelpers.glossary,
      ],
    },
    {
      sectionId: 'rain-garden-helpers-section-2',
      headingFeatureId: centralIdeaCenterFeatureIds.rainGardenHelpers.headingB,
      sentenceIds: [
        rainGardenSentences[4].sentenceId,
        rainGardenSentences[5].sentenceId,
        rainGardenSentences[6].sentenceId,
        rainGardenSentences[7].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.rainGardenHelpers.caption,
      ],
    },
  ],
  features: [
    title(centralIdeaCenterFeatureIds.rainGardenHelpers.title, 'Rain Garden Helpers'),
    heading(centralIdeaCenterFeatureIds.rainGardenHelpers.headingA, 'rain-garden-helpers-section-1', 'Water Moves In'),
    heading(centralIdeaCenterFeatureIds.rainGardenHelpers.headingB, 'rain-garden-helpers-section-2', 'Plants Hold the Bed'),
    illustration(
      centralIdeaCenterFeatureIds.rainGardenHelpers.visual,
      'Rain Garden Sketch',
      'A simple sketch shows water slowing down in a shallow garden bed beside roots and rocks.',
      [
        {
          labelId: centralIdeaCenterFeatureIds.rainGardenHelpers.label,
          text: 'Root line',
          description: 'The roots reach down into the wet soil.',
        },
      ],
    ),
    caption(
      centralIdeaCenterFeatureIds.rainGardenHelpers.caption,
      centralIdeaCenterFeatureIds.rainGardenHelpers.visual,
      'The caption tells readers that the water stays in the bed long enough to soak in.',
    ),
    glossary(centralIdeaCenterFeatureIds.rainGardenHelpers.glossary, [
      {
        entryId: 'rain-garden-soak-entry',
        term: 'soak',
        definition: 'to take in water slowly',
      },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(centralIdeaCenterPassageIds.rainGardenHelpers.passageId, rainGardenSentences[0].text, rainGardenSentences[0].sentenceId, 'garden', 3),
    makeSupportTarget(centralIdeaCenterPassageIds.rainGardenHelpers.passageId, rainGardenSentences[1].text, rainGardenSentences[1].sentenceId, 'water', 2),
    makeSupportTarget(centralIdeaCenterPassageIds.rainGardenHelpers.passageId, rainGardenSentences[4].text, rainGardenSentences[4].sentenceId, 'roots', 3),
    makeSupportTarget(centralIdeaCenterPassageIds.rainGardenHelpers.passageId, rainGardenSentences[7].text, rainGardenSentences[7].sentenceId, 'soak', 2),
  ],
})

const quietShelterPassage = buildPassage({
  passageIdentifier: centralIdeaCenterPassageIds.quietShelterSpaces.passageId,
  readingContext: 'A class visit to an animal shelter that keeps the rooms calm.',
  sentences: quietShelterSentences,
  sections: [
    {
      sectionId: 'quiet-shelter-spaces-section-1',
      headingFeatureId: centralIdeaCenterFeatureIds.quietShelterSpaces.headingA,
      sentenceIds: [
        quietShelterSentences[0].sentenceId,
        quietShelterSentences[1].sentenceId,
        quietShelterSentences[2].sentenceId,
        quietShelterSentences[3].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.quietShelterSpaces.visual,
        centralIdeaCenterFeatureIds.quietShelterSpaces.glossary,
      ],
    },
    {
      sectionId: 'quiet-shelter-spaces-section-2',
      headingFeatureId: centralIdeaCenterFeatureIds.quietShelterSpaces.headingB,
      sentenceIds: [
        quietShelterSentences[4].sentenceId,
        quietShelterSentences[5].sentenceId,
        quietShelterSentences[6].sentenceId,
        quietShelterSentences[7].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.quietShelterSpaces.caption,
      ],
    },
  ],
  features: [
    title(centralIdeaCenterFeatureIds.quietShelterSpaces.title, 'A Quiet Place for Animals'),
    heading(centralIdeaCenterFeatureIds.quietShelterSpaces.headingA, 'quiet-shelter-spaces-section-1', 'Inside the Shelter'),
    heading(centralIdeaCenterFeatureIds.quietShelterSpaces.headingB, 'quiet-shelter-spaces-section-2', 'Paths and Visits'),
    map(
      centralIdeaCenterFeatureIds.quietShelterSpaces.visual,
      'Shelter Floor Plan',
      3,
      3,
      [
        { locationId: 'shelter-lobby', label: 'Lobby', description: 'The front desk where visitors check in.', position: { row: 1, column: 1 }, order: 1 },
        { locationId: 'shelter-bed-room', label: 'Bed Room', description: 'A small room with soft beds and low lights.', position: { row: 1, column: 2 }, order: 2 },
        { locationId: 'shelter-quiet-hall', label: 'Quiet Hall', description: 'A path that keeps visitors moving slowly.', position: { row: 2, column: 2 }, order: 3 },
      ],
      [
        { legendId: 'shelter-legend-quiet', label: 'Quiet path', description: 'A route that helps animals stay calm.' },
        { legendId: 'shelter-legend-bed', label: 'Rest room', description: 'A room with beds and water bowls.' },
      ],
      [
        { fromLocationId: 'shelter-lobby', toLocationId: 'shelter-quiet-hall', label: 'visitor path' },
        { fromLocationId: 'shelter-quiet-hall', toLocationId: 'shelter-bed-room', label: 'care route' },
      ],
    ),
    caption(
      centralIdeaCenterFeatureIds.quietShelterSpaces.caption,
      centralIdeaCenterFeatureIds.quietShelterSpaces.visual,
      'The caption explains that the paths keep people moving gently through the shelter.',
    ),
    glossary(centralIdeaCenterFeatureIds.quietShelterSpaces.glossary, [
      {
        entryId: 'quiet-shelter-quiet',
        term: 'quiet',
        definition: 'not loud and full of noise',
      },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(centralIdeaCenterPassageIds.quietShelterSpaces.passageId, quietShelterSentences[0].text, quietShelterSentences[0].sentenceId, 'shelter', 4),
    makeSupportTarget(centralIdeaCenterPassageIds.quietShelterSpaces.passageId, quietShelterSentences[1].text, quietShelterSentences[1].sentenceId, 'quiet', 2),
    makeSupportTarget(centralIdeaCenterPassageIds.quietShelterSpaces.passageId, quietShelterSentences[3].text, quietShelterSentences[3].sentenceId, 'paths', 3),
    makeSupportTarget(centralIdeaCenterPassageIds.quietShelterSpaces.passageId, quietShelterSentences[5].text, quietShelterSentences[5].sentenceId, 'safe', 2),
  ],
})

const pollinatorPatchPassage = buildPassage({
  passageIdentifier: centralIdeaCenterPassageIds.pollinatorPatchCounts.passageId,
  readingContext: 'A class counts flowers and visitors in a pollinator garden.',
  sentences: pollinatorPatchSentences,
  sections: [
    {
      sectionId: 'pollinator-patch-counts-section-1',
      headingFeatureId: centralIdeaCenterFeatureIds.pollinatorPatchCounts.headingA,
      sentenceIds: [
        pollinatorPatchSentences[0].sentenceId,
        pollinatorPatchSentences[1].sentenceId,
        pollinatorPatchSentences[2].sentenceId,
        pollinatorPatchSentences[3].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.pollinatorPatchCounts.visual,
      ],
    },
    {
      sectionId: 'pollinator-patch-counts-section-2',
      headingFeatureId: centralIdeaCenterFeatureIds.pollinatorPatchCounts.headingB,
      sentenceIds: [
        pollinatorPatchSentences[4].sentenceId,
        pollinatorPatchSentences[5].sentenceId,
        pollinatorPatchSentences[6].sentenceId,
        pollinatorPatchSentences[7].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.pollinatorPatchCounts.caption,
        centralIdeaCenterFeatureIds.pollinatorPatchCounts.glossary,
      ],
    },
  ],
  features: [
    title(centralIdeaCenterFeatureIds.pollinatorPatchCounts.title, 'Bloom Counts in the Pollinator Patch'),
    heading(centralIdeaCenterFeatureIds.pollinatorPatchCounts.headingA, 'pollinator-patch-counts-section-1', 'Sunny Row Counts'),
    heading(centralIdeaCenterFeatureIds.pollinatorPatchCounts.headingB, 'pollinator-patch-counts-section-2', 'Shady Row Counts'),
    graph(
      centralIdeaCenterFeatureIds.pollinatorPatchCounts.visual,
      'Bloom Counts',
      'blooms',
      [
        { dataPointId: 'pollinator-blue-blooms', label: 'Blue flowers', value: 5 },
        { dataPointId: 'pollinator-red-blooms', label: 'Red flowers', value: 2 },
        { dataPointId: 'pollinator-yellow-blooms', label: 'Yellow flowers', value: 4 },
      ],
    ),
    caption(
      centralIdeaCenterFeatureIds.pollinatorPatchCounts.caption,
      centralIdeaCenterFeatureIds.pollinatorPatchCounts.visual,
      'The caption tells readers that the sunny row had more blue flowers than red ones.',
    ),
    glossary(centralIdeaCenterFeatureIds.pollinatorPatchCounts.glossary, [
      {
        entryId: 'pollinator-patch-pollinator',
        term: 'pollinator',
        definition: 'an insect or animal that helps plants make new seeds',
      },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(centralIdeaCenterPassageIds.pollinatorPatchCounts.passageId, pollinatorPatchSentences[0].text, pollinatorPatchSentences[0].sentenceId, 'pollinator', 5),
    makeSupportTarget(centralIdeaCenterPassageIds.pollinatorPatchCounts.passageId, pollinatorPatchSentences[1].text, pollinatorPatchSentences[1].sentenceId, 'blooms', 3),
    makeSupportTarget(centralIdeaCenterPassageIds.pollinatorPatchCounts.passageId, pollinatorPatchSentences[2].text, pollinatorPatchSentences[2].sentenceId, 'bees', 2),
    makeSupportTarget(centralIdeaCenterPassageIds.pollinatorPatchCounts.passageId, pollinatorPatchSentences[7].text, pollinatorPatchSentences[7].sentenceId, 'rest', 2),
  ],
})

const weatherStationPassage = buildPassage({
  passageIdentifier: centralIdeaCenterPassageIds.weatherStationNotes.passageId,
  readingContext: 'Class weather notes from a small outdoor weather station.',
  sentences: weatherStationSentences,
  sections: [
    {
      sectionId: 'weather-station-notes-section-1',
      headingFeatureId: centralIdeaCenterFeatureIds.weatherStationNotes.headingA,
      sentenceIds: [
        weatherStationSentences[0].sentenceId,
        weatherStationSentences[1].sentenceId,
        weatherStationSentences[2].sentenceId,
        weatherStationSentences[3].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.weatherStationNotes.visual,
      ],
    },
    {
      sectionId: 'weather-station-notes-section-2',
      headingFeatureId: centralIdeaCenterFeatureIds.weatherStationNotes.headingB,
      sentenceIds: [
        weatherStationSentences[4].sentenceId,
        weatherStationSentences[5].sentenceId,
        weatherStationSentences[6].sentenceId,
        weatherStationSentences[7].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.weatherStationNotes.caption,
        centralIdeaCenterFeatureIds.weatherStationNotes.glossary,
      ],
    },
  ],
  features: [
    title(centralIdeaCenterFeatureIds.weatherStationNotes.title, 'Our Class Weather Station'),
    heading(centralIdeaCenterFeatureIds.weatherStationNotes.headingA, 'weather-station-notes-section-1', 'Measuring the Day'),
    heading(centralIdeaCenterFeatureIds.weatherStationNotes.headingB, 'weather-station-notes-section-2', 'Watching Patterns'),
    illustration(
      centralIdeaCenterFeatureIds.weatherStationNotes.visual,
      'Weather Station Tools',
      'A small illustration shows a thermometer, rain gauge, and wind sock beside a notebook.',
      [
        {
          labelId: centralIdeaCenterFeatureIds.weatherStationNotes.label,
          text: 'Wind sock',
          description: 'This label points to the tool that shows wind direction.',
        },
      ],
    ),
    caption(
      centralIdeaCenterFeatureIds.weatherStationNotes.caption,
      centralIdeaCenterFeatureIds.weatherStationNotes.visual,
      'The caption tells readers that the tools help the class keep daily weather notes.',
    ),
    glossary(centralIdeaCenterFeatureIds.weatherStationNotes.glossary, [
      {
        entryId: 'weather-station-observe',
        term: 'observe',
        definition: 'to watch carefully and notice details',
      },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(centralIdeaCenterPassageIds.weatherStationNotes.passageId, weatherStationSentences[0].text, weatherStationSentences[0].sentenceId, 'weather', 3),
    makeSupportTarget(centralIdeaCenterPassageIds.weatherStationNotes.passageId, weatherStationSentences[1].text, weatherStationSentences[1].sentenceId, 'gauge', 2),
    makeSupportTarget(centralIdeaCenterPassageIds.weatherStationNotes.passageId, weatherStationSentences[2].text, weatherStationSentences[2].sentenceId, 'chart', 2),
    makeSupportTarget(centralIdeaCenterPassageIds.weatherStationNotes.passageId, weatherStationSentences[4].text, weatherStationSentences[4].sentenceId, 'patterns', 4),
  ],
})

const seedTravelPassage = buildPassage({
  passageIdentifier: centralIdeaCenterPassageIds.seedTravelRoutes.passageId,
  readingContext: 'A science notebook about how seeds move to new places.',
  sentences: seedTravelSentences,
  sections: [
    {
      sectionId: 'seed-travel-routes-section-1',
      headingFeatureId: centralIdeaCenterFeatureIds.seedTravelRoutes.headingA,
      sentenceIds: [
        seedTravelSentences[0].sentenceId,
        seedTravelSentences[1].sentenceId,
        seedTravelSentences[2].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.seedTravelRoutes.visual,
      ],
    },
    {
      sectionId: 'seed-travel-routes-section-2',
      headingFeatureId: centralIdeaCenterFeatureIds.seedTravelRoutes.headingB,
      sentenceIds: [
        seedTravelSentences[3].sentenceId,
        seedTravelSentences[4].sentenceId,
        seedTravelSentences[5].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.seedTravelRoutes.caption,
      ],
    },
    {
      sectionId: 'seed-travel-routes-section-3',
      headingFeatureId: centralIdeaCenterFeatureIds.seedTravelRoutes.headingC,
      sentenceIds: [
        seedTravelSentences[6].sentenceId,
        seedTravelSentences[7].sentenceId,
        seedTravelSentences[8].sentenceId,
        seedTravelSentences[9].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.seedTravelRoutes.glossary,
      ],
    },
  ],
  features: [
    title(centralIdeaCenterFeatureIds.seedTravelRoutes.title, 'How Seeds Travel Far'),
    heading(centralIdeaCenterFeatureIds.seedTravelRoutes.headingA, 'seed-travel-routes-section-1', 'By Wind and Water'),
    heading(centralIdeaCenterFeatureIds.seedTravelRoutes.headingB, 'seed-travel-routes-section-2', 'By Animals'),
    heading(centralIdeaCenterFeatureIds.seedTravelRoutes.headingC, 'seed-travel-routes-section-3', 'Starting New Plants'),
    map(
      centralIdeaCenterFeatureIds.seedTravelRoutes.visual,
      'Seed Travel Routes',
      3,
      3,
      [
        { locationId: 'seed-route-wind', label: 'Wind', description: 'A route where seeds drift in the air.', position: { row: 1, column: 1 }, order: 1 },
        { locationId: 'seed-route-water', label: 'Water', description: 'A route where seeds float after rain.', position: { row: 1, column: 2 }, order: 2 },
        { locationId: 'seed-route-animal', label: 'Animal', description: 'A route where seeds ride on fur or feathers.', position: { row: 2, column: 2 }, order: 3 },
      ],
      [
        { legendId: 'seed-route-legend-wind', label: 'Wind route', description: 'Seeds drift in the wind.' },
        { legendId: 'seed-route-legend-animal', label: 'Animal route', description: 'Seeds hitch rides on animals.' },
      ],
      [
        { fromLocationId: 'seed-route-wind', toLocationId: 'seed-route-water', label: 'travel' },
        { fromLocationId: 'seed-route-water', toLocationId: 'seed-route-animal', label: 'move' },
      ],
    ),
    caption(
      centralIdeaCenterFeatureIds.seedTravelRoutes.caption,
      centralIdeaCenterFeatureIds.seedTravelRoutes.visual,
      'The caption explains that the map shows different ways seeds reach new places.',
    ),
    glossary(centralIdeaCenterFeatureIds.seedTravelRoutes.glossary, [
      {
        entryId: 'seed-travel-routes-drift',
        term: 'drift',
        definition: 'to move slowly along with the wind or water',
      },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(centralIdeaCenterPassageIds.seedTravelRoutes.passageId, seedTravelSentences[0].text, seedTravelSentences[0].sentenceId, 'wind', 2),
    makeSupportTarget(centralIdeaCenterPassageIds.seedTravelRoutes.passageId, seedTravelSentences[1].text, seedTravelSentences[1].sentenceId, 'water', 2),
    makeSupportTarget(centralIdeaCenterPassageIds.seedTravelRoutes.passageId, seedTravelSentences[2].text, seedTravelSentences[2].sentenceId, 'seeds', 3),
    makeSupportTarget(centralIdeaCenterPassageIds.seedTravelRoutes.passageId, seedTravelSentences[9].text, seedTravelSentences[9].sentenceId, 'plants', 3),
  ],
})

const compostChangePassage = buildPassage({
  passageIdentifier: centralIdeaCenterPassageIds.compostChangeStory.passageId,
  readingContext: 'A compost pile in a classroom garden.',
  sentences: compostChangeSentences,
  sections: [
    {
      sectionId: 'compost-change-story-section-1',
      headingFeatureId: centralIdeaCenterFeatureIds.compostChangeStory.headingA,
      sentenceIds: [
        compostChangeSentences[0].sentenceId,
        compostChangeSentences[1].sentenceId,
        compostChangeSentences[2].sentenceId,
        compostChangeSentences[3].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.compostChangeStory.visual,
      ],
    },
    {
      sectionId: 'compost-change-story-section-2',
      headingFeatureId: centralIdeaCenterFeatureIds.compostChangeStory.headingB,
      sentenceIds: [
        compostChangeSentences[4].sentenceId,
        compostChangeSentences[5].sentenceId,
        compostChangeSentences[6].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.compostChangeStory.caption,
      ],
    },
    {
      sectionId: 'compost-change-story-section-3',
      headingFeatureId: centralIdeaCenterFeatureIds.compostChangeStory.headingC,
      sentenceIds: [
        compostChangeSentences[7].sentenceId,
        compostChangeSentences[8].sentenceId,
        compostChangeSentences[9].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.compostChangeStory.glossary,
      ],
    },
  ],
  features: [
    title(centralIdeaCenterFeatureIds.compostChangeStory.title, 'What Happens in a Compost Pile'),
    heading(centralIdeaCenterFeatureIds.compostChangeStory.headingA, 'compost-change-story-section-1', 'What Goes In'),
    heading(centralIdeaCenterFeatureIds.compostChangeStory.headingB, 'compost-change-story-section-2', 'How the Pile Changes'),
    heading(centralIdeaCenterFeatureIds.compostChangeStory.headingC, 'compost-change-story-section-3', 'What Comes Out'),
    graph(
      centralIdeaCenterFeatureIds.compostChangeStory.visual,
      'Compost Change',
      'pile stage',
      [
        { dataPointId: 'compost-stage-1', label: 'Fresh scraps', value: 1 },
        { dataPointId: 'compost-stage-2', label: 'Mixed pile', value: 3 },
        { dataPointId: 'compost-stage-3', label: 'Useful soil', value: 5 },
      ],
    ),
    caption(
      centralIdeaCenterFeatureIds.compostChangeStory.caption,
      centralIdeaCenterFeatureIds.compostChangeStory.visual,
      'The caption helps readers notice that the pile changes a little at a time.',
    ),
    glossary(centralIdeaCenterFeatureIds.compostChangeStory.glossary, [
      {
        entryId: 'compost-change-compost',
        term: 'compost',
        definition: 'decayed plant and food bits that become helpful soil',
      },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(centralIdeaCenterPassageIds.compostChangeStory.passageId, compostChangeSentences[0].text, compostChangeSentences[0].sentenceId, 'scraps', 3),
    makeSupportTarget(centralIdeaCenterPassageIds.compostChangeStory.passageId, compostChangeSentences[1].text, compostChangeSentences[1].sentenceId, 'worms', 3),
    makeSupportTarget(centralIdeaCenterPassageIds.compostChangeStory.passageId, compostChangeSentences[3].text, compostChangeSentences[3].sentenceId, 'crumbly', 4),
    makeSupportTarget(centralIdeaCenterPassageIds.compostChangeStory.passageId, compostChangeSentences[7].text, compostChangeSentences[7].sentenceId, 'soil', 2),
  ],
})

const trailMarkersPassage = buildPassage({
  passageIdentifier: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId,
  readingContext: 'A nature-center trail guide with signs and map clues.',
  sentences: trailMarkerSentences,
  sections: [
    {
      sectionId: 'trail-markers-guide-the-way-section-1',
      headingFeatureId: centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.headingA,
      sentenceIds: [
        trailMarkerSentences[0].sentenceId,
        trailMarkerSentences[1].sentenceId,
        trailMarkerSentences[2].sentenceId,
        trailMarkerSentences[3].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.visual,
      ],
    },
    {
      sectionId: 'trail-markers-guide-the-way-section-2',
      headingFeatureId: centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.headingB,
      sentenceIds: [
        trailMarkerSentences[4].sentenceId,
        trailMarkerSentences[5].sentenceId,
        trailMarkerSentences[6].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.caption,
      ],
    },
    {
      sectionId: 'trail-markers-guide-the-way-section-3',
      headingFeatureId: centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.headingC,
      sentenceIds: [
        trailMarkerSentences[7].sentenceId,
        trailMarkerSentences[8].sentenceId,
        trailMarkerSentences[9].sentenceId,
      ],
      featureIds: [
        centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.glossary,
      ],
    },
  ],
  features: [
    title(centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.title, 'Trail Markers Guide the Way'),
    heading(centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.headingA, 'trail-markers-guide-the-way-section-1', 'Following the Signs'),
    heading(centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.headingB, 'trail-markers-guide-the-way-section-2', 'Staying Safe'),
    heading(centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.headingC, 'trail-markers-guide-the-way-section-3', 'Reaching the End'),
    map(
      centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.visual,
      'Trail Marker Map',
      3,
      3,
      [
        { locationId: 'trail-map-start', label: 'Start', description: 'Where the walk begins.', position: { row: 1, column: 1 }, order: 1 },
        { locationId: 'trail-map-turn', label: 'Turn', description: 'The turn where hikers choose the next path.', position: { row: 1, column: 2 }, order: 2 },
        { locationId: 'trail-map-finish', label: 'Finish', description: 'The end of the loop trail.', position: { row: 3, column: 3 }, order: 3 },
      ],
      [
        { legendId: 'trail-map-legend-marker', label: 'Marker', description: 'A bright sign that shows the path.' },
        { legendId: 'trail-map-legend-safe', label: 'Safe path', description: 'A side path that avoids a hazard.' },
      ],
      [
        { fromLocationId: 'trail-map-start', toLocationId: 'trail-map-turn', label: 'follow' },
        { fromLocationId: 'trail-map-turn', toLocationId: 'trail-map-finish', label: 'continue' },
      ],
    ),
    caption(
      centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.caption,
      centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.visual,
      'The caption points out that the map helps hikers stay on the trail.',
    ),
    glossary(centralIdeaCenterFeatureIds.trailMarkersGuideTheWay.glossary, [
      {
        entryId: 'trail-markers-loop',
        term: 'loop',
        definition: 'a path that goes around and comes back to the start',
      },
    ]),
  ],
  wordSupportTargets: [
    makeSupportTarget(centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId, trailMarkerSentences[0].text, trailMarkerSentences[0].sentenceId, 'markers', 4),
    makeSupportTarget(centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId, trailMarkerSentences[1].text, trailMarkerSentences[1].sentenceId, 'map', 2),
    makeSupportTarget(centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId, trailMarkerSentences[3].text, trailMarkerSentences[3].sentenceId, 'safe', 2),
    makeSupportTarget(centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId, trailMarkerSentences[7].text, trailMarkerSentences[7].sentenceId, 'trail', 2),
  ],
})

export const centralIdeaCenterPassages: Passage[] = [
  rainGardenPassage,
  quietShelterPassage,
  pollinatorPatchPassage,
  weatherStationPassage,
  seedTravelPassage,
  compostChangePassage,
  trailMarkersPassage,
]
