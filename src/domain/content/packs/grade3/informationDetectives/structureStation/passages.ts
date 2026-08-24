import type { Passage, WordSupportTarget } from '../../../../types'
import type { Grade3InformationalStructure, InformationalStructureGuide } from '../../../contentPackTypes'
import type { InformationalFeature } from '../../../../informationalTypes'
import { STRUCTURE_STATION_PASSAGE_IDS, STRUCTURE_STATION_VERSION } from './ids'

interface SupportPlan { word: string; sentence: number; chunks: string[]; focus: string }
interface FeaturePlan {
  key: string
  kind: InformationalFeature['kind']
  contribution: string
}

export interface StructureStationRecord {
  passageId: string
  title: string
  difficulty: 0 | 1
  structure: Grade3InformationalStructure
  structureLabel: string
  sentences: string[]
  firstSectionHeading: string
  secondSectionHeading: string
  splitAfter: number
  features: InformationalFeature[]
  featurePlans: [FeaturePlan, FeaturePlan, ...FeaturePlan[]]
  structureReason: string
  organizationHelp: string
  evidenceSentenceNumbers: [number, number]
  distractorReasons: [string, string, string]
  hotPrompt: string
  hotCorrectSentence: number
  hotDistractorSentences: [number, number, number]
  support: [SupportPlan, SupportPlan, SupportPlan, SupportPlan]
  transfer?: { prompt: string; correctStructure: Grade3InformationalStructure; explanation: string }
}

const p = STRUCTURE_STATION_PASSAGE_IDS
const featureId = (passageId: string, key: string) => `${passageId}-feature-${key}`
export const sentenceId = (passageId: string, number: number) => `${passageId}-sentence-${number}`
const sectionId = (passageId: string, number: number) => `${passageId}-section-${number}`

const records: StructureStationRecord[] = [
  {
    passageId: p[0], title: 'A Day at the Weather Station', difficulty: 0, structure: 'chronology', structureLabel: 'Chronology',
    sentences: [
      'Early in the morning, a weather observer checks the thermometer and writes down the air temperature.',
      'Next, the observer studies the rain gauge to see whether rain collected overnight.',
      'At noon, the observer measures the wind and records which direction it is blowing.',
      'Later in the afternoon, another temperature reading shows how the day has changed.',
      'Finally, the observer places all four records in the daily weather log.',
      'The timeline lists each observation from morning through afternoon, so readers can follow the work in order.',
      'A glossary explains that a rain gauge is a tool that collects and measures rain.',
      'Together, the ordered details show how one day of weather information is gathered.',
    ],
    firstSectionHeading: 'Morning Checks', secondSectionHeading: 'Finishing the Daily Log', splitAfter: 4,
    features: [
      { featureId: featureId(p[0], 'title'), kind: 'title', text: 'A Day at the Weather Station' },
      { featureId: featureId(p[0], 'heading-1'), kind: 'heading', sectionId: sectionId(p[0], 1), text: 'Morning Checks' },
      { featureId: featureId(p[0], 'heading-2'), kind: 'heading', sectionId: sectionId(p[0], 2), text: 'Finishing the Daily Log' },
      { featureId: featureId(p[0], 'timeline'), kind: 'timeline', title: 'Daily Observation Timeline', items: [
        { itemId: `${featureId(p[0], 'timeline')}-morning`, label: 'Early morning', description: 'Check temperature and collected rain.', order: 1 },
        { itemId: `${featureId(p[0], 'timeline')}-noon`, label: 'Noon', description: 'Measure wind direction.', order: 2 },
        { itemId: `${featureId(p[0], 'timeline')}-afternoon`, label: 'Afternoon', description: 'Record temperature and finish the log.', order: 3 },
      ] },
      { featureId: featureId(p[0], 'glossary'), kind: 'glossary', entries: [{ entryId: `${featureId(p[0], 'glossary')}-rain-gauge`, term: 'rain gauge', definition: 'a tool that collects and measures rain' }] },
    ],
    featurePlans: [
      { key: 'timeline', kind: 'timeline', contribution: 'The timeline makes the observer\'s work easy to follow from morning to afternoon.' },
      { key: 'glossary', kind: 'glossary', contribution: 'The glossary explains the meaning of rain gauge without interrupting the sequence.' },
      { key: 'heading-2', kind: 'heading', contribution: 'The heading signals that the section explains how the daily record is completed.' },
    ],
    structureReason: 'The important observations are arranged in the time order they happen during one day.',
    organizationHelp: 'Chronology helps the reader follow each weather-station task from the first morning check to the finished log.',
    evidenceSentenceNumbers: [1, 5],
    distractorReasons: ['It mainly explains similarities and differences between two weather stations.', 'It mainly explains why rain causes every tool to change.', 'It lists unrelated weather facts with no meaningful order.'],
    hotPrompt: 'Select the sentence that shows the final step in the observer\'s day.', hotCorrectSentence: 5, hotDistractorSentences: [1, 3, 7],
    support: [
      { word: 'observer', sentence: 1, chunks: ['ob', 'serv', 'er'], focus: 'serv' },
      { word: 'thermometer', sentence: 1, chunks: ['ther', 'mom', 'e', 'ter'], focus: 'therm' },
      { word: 'direction', sentence: 3, chunks: ['di', 'rec', 'tion'], focus: 'rec' },
      { word: 'collects', sentence: 7, chunks: ['col', 'lects'], focus: 'lect' },
    ],
  },
  {
    passageId: p[1], title: 'Desert Fox and Arctic Fox', difficulty: 0, structure: 'comparison', structureLabel: 'Comparison',
    sentences: [
      'A desert fox and an Arctic fox both have body features that help them live in their habitats.',
      'The desert fox has very large ears that release body heat into the warm air.',
      'Its sandy coat also blends with dry ground.',
      'The Arctic fox has much smaller ears that help it hold in body heat.',
      'Its thick coat traps warm air, and its winter color blends with snow.',
      'Both foxes use sharp hearing to notice small animals moving nearby.',
      'The labeled illustration places the foxes side by side and points to their different ears and coats.',
      'A glossary defines habitat as the place where a living thing finds what it needs.',
      'The similarities and differences show how each fox is suited to a very different home.',
    ],
    firstSectionHeading: 'Different Ears and Coats', secondSectionHeading: 'Helpful Features They Share', splitAfter: 5,
    features: [
      { featureId: featureId(p[1], 'title'), kind: 'title', text: 'Desert Fox and Arctic Fox' },
      { featureId: featureId(p[1], 'heading-1'), kind: 'heading', sectionId: sectionId(p[1], 1), text: 'Different Ears and Coats' },
      { featureId: featureId(p[1], 'heading-2'), kind: 'heading', sectionId: sectionId(p[1], 2), text: 'Helpful Features They Share' },
      { featureId: featureId(p[1], 'illustration'), kind: 'illustration', title: 'Two Foxes, Two Habitats', accessibleDescription: 'A desert fox and an Arctic fox stand side by side with labels for ears and coats.', labels: [
        { labelId: `${featureId(p[1], 'illustration')}-desert-ears`, text: 'Large desert-fox ears', description: 'Large ears release heat into warm air.' },
        { labelId: `${featureId(p[1], 'illustration')}-arctic-ears`, text: 'Small Arctic-fox ears', description: 'Small ears help hold in body heat.' },
        { labelId: `${featureId(p[1], 'illustration')}-coats`, text: 'Protective coats', description: 'Each coat helps the fox in its own habitat.' },
      ] },
      { featureId: featureId(p[1], 'glossary'), kind: 'glossary', entries: [{ entryId: `${featureId(p[1], 'glossary')}-habitat`, term: 'habitat', definition: 'the place where a living thing finds what it needs' }] },
    ],
    featurePlans: [
      { key: 'illustration', kind: 'illustration', contribution: 'The side-by-side labels make the foxes\' different ears and coats easy to compare.' },
      { key: 'heading-2', kind: 'heading', contribution: 'The heading tells readers that the next section explains a feature both foxes share.' },
      { key: 'glossary', kind: 'glossary', contribution: 'The glossary clarifies habitat, a word needed to understand the comparison.' },
    ],
    structureReason: 'The text is organized around meaningful similarities and differences between desert and Arctic foxes.',
    organizationHelp: 'Comparison helps readers connect each fox\'s ears, coat, and hearing to its habitat.',
    evidenceSentenceNumbers: [2, 4],
    distractorReasons: ['It puts every detail in the order the foxes discovered it.', 'It explains that one fox directly causes the other fox to change.', 'It describes only the desert fox and never relates it to another animal.'],
    hotPrompt: 'Select the sentence that states a meaningful similarity between the two foxes.', hotCorrectSentence: 6, hotDistractorSentences: [2, 4, 8],
    support: [
      { word: 'features', sentence: 1, chunks: ['fea', 'tures'], focus: 'fea' },
      { word: 'release', sentence: 2, chunks: ['re', 'lease'], focus: 'lease' },
      { word: 'blends', sentence: 3, chunks: ['blend', 's'], focus: 'blend' },
      { word: 'habitat', sentence: 8, chunks: ['hab', 'i', 'tat'], focus: 'hab' },
    ],
  },
  {
    passageId: p[2], title: 'Shade, Mulch, and Moist Soil', difficulty: 1, structure: 'cause-effect', structureLabel: 'Cause and effect',
    sentences: [
      'On a sunny day, water can leave bare garden soil as it warms and changes into vapor.',
      'Because the soil loses water, plant roots may not have enough moisture later in the day.',
      'Gardeners can spread a layer of mulch, such as dry leaves, over the soil.',
      'The mulch blocks some sunlight and slows moving air at the soil surface.',
      'As a result, water leaves the covered soil more slowly.',
      'Shade from taller plants can also keep nearby soil cooler.',
      'The labeled diagram shows sunlight above bare soil and a protective layer above covered soil.',
      'Its caption explains that the cover helps moisture remain near plant roots.',
      'These causes and results explain why covered, shaded soil often stays moist longer than bare soil.',
    ],
    firstSectionHeading: 'Why Bare Soil Dries', secondSectionHeading: 'How Cover Changes the Result', splitAfter: 4,
    features: [
      { featureId: featureId(p[2], 'title'), kind: 'title', text: 'Shade, Mulch, and Moist Soil' },
      { featureId: featureId(p[2], 'heading-1'), kind: 'heading', sectionId: sectionId(p[2], 1), text: 'Why Bare Soil Dries' },
      { featureId: featureId(p[2], 'heading-2'), kind: 'heading', sectionId: sectionId(p[2], 2), text: 'How Cover Changes the Result' },
      { featureId: featureId(p[2], 'illustration'), kind: 'illustration', title: 'Bare and Covered Soil', accessibleDescription: 'A text diagram compares sunlight over bare soil with mulch covering moist soil.', labels: [
        { labelId: `${featureId(p[2], 'illustration')}-sunlight`, text: 'Sunlight', description: 'Sunlight warms uncovered soil.' },
        { labelId: `${featureId(p[2], 'illustration')}-mulch`, text: 'Mulch layer', description: 'The cover blocks some sunlight and moving air.' },
        { labelId: `${featureId(p[2], 'illustration')}-moisture`, text: 'Moisture near roots', description: 'Water remains longer under the cover.' },
      ] },
      { featureId: featureId(p[2], 'caption'), kind: 'caption', targetFeatureId: featureId(p[2], 'illustration'), text: 'Cover over the soil slows water loss near plant roots.' },
      { featureId: featureId(p[2], 'sidebar'), kind: 'sidebar', title: 'Mulch Can Be Simple', text: 'Dry leaves can form a protective layer when a gardener uses them safely.' },
    ],
    featurePlans: [
      { key: 'illustration', kind: 'illustration', contribution: 'The labels connect sunlight and mulch to different moisture results.' },
      { key: 'caption', kind: 'caption', contribution: 'The caption states the causal result shown by the diagram: cover slows water loss.' },
      { key: 'heading-2', kind: 'heading', contribution: 'The heading prepares readers for causes that change how quickly soil dries.' },
    ],
    structureReason: 'The text explains what causes soil to lose water and how shade or mulch changes that result.',
    organizationHelp: 'Cause-and-effect organization helps readers connect sunlight, moving air, cover, and soil moisture.',
    evidenceSentenceNumbers: [1, 5],
    distractorReasons: ['It lists gardening actions only in the order they must always be completed.', 'It mainly compares two kinds of foxes.', 'It names soil facts without explaining why any result happens.'],
    hotPrompt: 'Select the sentence that states the result of placing mulch over soil.', hotCorrectSentence: 5, hotDistractorSentences: [1, 3, 7],
    support: [
      { word: 'vapor', sentence: 1, chunks: ['va', 'por'], focus: 'va' },
      { word: 'moisture', sentence: 2, chunks: ['mois', 'ture'], focus: 'mois' },
      { word: 'Gardeners', sentence: 3, chunks: ['Gar', 'den', 'ers'], focus: 'den' },
      { word: 'protective', sentence: 7, chunks: ['pro', 'tec', 'tive'], focus: 'tec' },
    ],
  },
  {
    passageId: p[3], title: 'Building a Classroom Wind Vane', difficulty: 1, structure: 'chronology', structureLabel: 'Chronology',
    sentences: [
      'A wind vane turns to show the direction from which the wind is blowing.',
      'First, place a lump of modeling clay in the middle of a sturdy paper plate.',
      'Next, press a sharpened pencil into the clay with the eraser pointing up.',
      'Push a straight pin through the center of a paper arrow and gently into the eraser.',
      'Then label the plate north, east, south, and west with help from a compass.',
      'Carry the wind vane outside and set it on a level surface.',
      'Finally, watch the arrow turn and record the direction it points from.',
      'The timeline gathers the building and observing steps in order.',
      'A glossary explains that direction tells where something points or moves.',
      'Following the sequence keeps the arrow free to turn before the wind vane is tested.',
    ],
    firstSectionHeading: 'Build the Spinner', secondSectionHeading: 'Label and Test It', splitAfter: 4,
    features: [
      { featureId: featureId(p[3], 'title'), kind: 'title', text: 'Building a Classroom Wind Vane' },
      { featureId: featureId(p[3], 'heading-1'), kind: 'heading', sectionId: sectionId(p[3], 1), text: 'Build the Spinner' },
      { featureId: featureId(p[3], 'heading-2'), kind: 'heading', sectionId: sectionId(p[3], 2), text: 'Label and Test It' },
      { featureId: featureId(p[3], 'timeline'), kind: 'timeline', title: 'Build-and-Test Sequence', items: [
        { itemId: `${featureId(p[3], 'timeline')}-base`, label: '1. Make the base', description: 'Press the pencil into clay on the plate.', order: 1 },
        { itemId: `${featureId(p[3], 'timeline')}-arrow`, label: '2. Attach the arrow', description: 'Pin the arrow so it can turn.', order: 2 },
        { itemId: `${featureId(p[3], 'timeline')}-test`, label: '3. Label and test', description: 'Add directions and observe the wind.', order: 3 },
      ] },
      { featureId: featureId(p[3], 'glossary'), kind: 'glossary', entries: [{ entryId: `${featureId(p[3], 'glossary')}-direction`, term: 'direction', definition: 'where something points or moves' }] },
    ],
    featurePlans: [
      { key: 'timeline', kind: 'timeline', contribution: 'The timeline groups the building and testing steps into an order readers can follow.' },
      { key: 'heading-2', kind: 'heading', contribution: 'The heading shows where building ends and labeling and testing begin.' },
      { key: 'glossary', kind: 'glossary', contribution: 'The glossary clarifies direction, a key word for reading the wind vane.' },
    ],
    structureReason: 'The important ideas are organized as a sequence of building, labeling, and testing steps.',
    organizationHelp: 'Chronology helps readers perform the steps in a useful order and understand when the wind vane is ready to test.',
    evidenceSentenceNumbers: [2, 7],
    distractorReasons: ['It mainly compares two different wind vanes.', 'It explains that every step causes the wind to blow.', 'It presents unrelated facts that may be read in any order.'],
    hotPrompt: 'Select the sentence that tells what to do immediately before taking the wind vane outside.', hotCorrectSentence: 5, hotDistractorSentences: [2, 4, 7],
    support: [
      { word: 'direction', sentence: 1, chunks: ['di', 'rec', 'tion'], focus: 'rec' },
      { word: 'modeling', sentence: 2, chunks: ['mod', 'el', 'ing'], focus: 'mod' },
      { word: 'sharpened', sentence: 3, chunks: ['sharp', 'ened'], focus: 'sharp' },
      { word: 'sequence', sentence: 10, chunks: ['se', 'quence'], focus: 'quence' },
    ],
  },
  {
    passageId: p[4], title: 'Beam Bridges and Arch Bridges', difficulty: 1, structure: 'comparison', structureLabel: 'Comparison',
    sentences: [
      'Bridges carry people and vehicles across spaces such as streams, roads, and valleys.',
      'A beam bridge uses a straight deck supported from below by piers or strong banks.',
      'Its simple shape works well across shorter spaces.',
      'An arch bridge curves upward and carries force along the curve toward supports at each end.',
      'The arch shape can cross a space while leaving an open area beneath it.',
      'Both kinds need firm supports and materials strong enough for the load they carry.',
      'Unlike a beam bridge, an arch bridge depends on its curved shape.',
      'A labeled illustration places the straight deck beside the curved arch.',
      'The caption points out that both designs move weight toward supports.',
      'A glossary defines a pier as an upright support beneath a bridge.',
      'Organizing the details side by side helps readers see what the designs share and how their shapes differ.',
    ],
    firstSectionHeading: 'Two Different Shapes', secondSectionHeading: 'What Both Bridges Need', splitAfter: 5,
    features: [
      { featureId: featureId(p[4], 'title'), kind: 'title', text: 'Beam Bridges and Arch Bridges' },
      { featureId: featureId(p[4], 'heading-1'), kind: 'heading', sectionId: sectionId(p[4], 1), text: 'Two Different Shapes' },
      { featureId: featureId(p[4], 'heading-2'), kind: 'heading', sectionId: sectionId(p[4], 2), text: 'What Both Bridges Need' },
      { featureId: featureId(p[4], 'illustration'), kind: 'illustration', title: 'Bridge Shapes Side by Side', accessibleDescription: 'A text diagram shows a straight beam bridge and a curved arch bridge.', labels: [
        { labelId: `${featureId(p[4], 'illustration')}-beam`, text: 'Straight beam deck', description: 'A level deck rests on supports below.' },
        { labelId: `${featureId(p[4], 'illustration')}-arch`, text: 'Curved arch', description: 'A curved structure directs force toward both ends.' },
        { labelId: `${featureId(p[4], 'illustration')}-supports`, text: 'Firm supports', description: 'Both bridge types require stable supports.' },
      ] },
      { featureId: featureId(p[4], 'caption'), kind: 'caption', targetFeatureId: featureId(p[4], 'illustration'), text: 'Both designs move weight toward supports, but their shapes are different.' },
      { featureId: featureId(p[4], 'glossary'), kind: 'glossary', entries: [{ entryId: `${featureId(p[4], 'glossary')}-pier`, term: 'pier', definition: 'an upright support beneath a bridge' }] },
    ],
    featurePlans: [
      { key: 'illustration', kind: 'illustration', contribution: 'The side-by-side labels make the straight beam and curved arch easy to compare.' },
      { key: 'caption', kind: 'caption', contribution: 'The caption helps readers see both a similarity in support and a difference in shape.' },
      { key: 'glossary', kind: 'glossary', contribution: 'The glossary explains pier, a support named in the beam-bridge section.' },
    ],
    structureReason: 'The passage organizes details around similarities and differences between beam and arch bridges.',
    organizationHelp: 'Comparison helps readers understand how two bridge shapes solve a similar crossing problem in different ways.',
    evidenceSentenceNumbers: [2, 4],
    distractorReasons: ['It puts bridge inventions in date order.', 'It explains that a beam bridge causes an arch bridge to form.', 'It describes only one bridge without relating it to another design.'],
    hotPrompt: 'Select the sentence that states a similarity between beam and arch bridges.', hotCorrectSentence: 6, hotDistractorSentences: [2, 4, 10],
    support: [
      { word: 'vehicles', sentence: 1, chunks: ['ve', 'hi', 'cles'], focus: 'hi' },
      { word: 'supported', sentence: 2, chunks: ['sup', 'port', 'ed'], focus: 'port' },
      { word: 'materials', sentence: 6, chunks: ['ma', 'te', 'ri', 'als'], focus: 'te' },
      { word: 'upright', sentence: 10, chunks: ['up', 'right'], focus: 'right' },
    ],
    transfer: { prompt: 'A new article explains how bicycles and scooters are alike and different. Which structure best fits that article?', correctStructure: 'comparison', explanation: 'An organization built around similarities and differences is comparison.' },
  },
  {
    passageId: p[5], title: 'How a Rain Garden Reduces Puddles', difficulty: 1, structure: 'cause-effect', structureLabel: 'Cause and effect',
    sentences: [
      'During a storm, rain runs off roofs, sidewalks, and other hard surfaces.',
      'Because the water cannot soak through those surfaces, it may gather in low places or rush toward a drain.',
      'A rain garden is a shallow planted area placed where some runoff can flow.',
      'Its loose soil and plant roots make spaces where water can soak downward.',
      'As a result, less water remains on the nearby surface as a puddle.',
      'The plants also slow the moving water, so soil is less likely to wash away.',
      'A labeled diagram traces runoff from a roof toward the shallow garden.',
      'The caption explains that water spreads among the plants before soaking into the ground.',
      'A fact box reminds readers that a rain garden needs a safe location chosen with an adult.',
      'The causes and effects show how the planted area changes what happens to some storm water.',
    ],
    firstSectionHeading: 'Why Water Collects', secondSectionHeading: 'A Planted Place to Soak', splitAfter: 4,
    features: [
      { featureId: featureId(p[5], 'title'), kind: 'title', text: 'How a Rain Garden Reduces Puddles' },
      { featureId: featureId(p[5], 'heading-1'), kind: 'heading', sectionId: sectionId(p[5], 1), text: 'Why Water Collects' },
      { featureId: featureId(p[5], 'heading-2'), kind: 'heading', sectionId: sectionId(p[5], 2), text: 'A Planted Place to Soak' },
      { featureId: featureId(p[5], 'illustration'), kind: 'illustration', title: 'Where Runoff Goes', accessibleDescription: 'A text diagram follows rain from a roof into a shallow planted rain garden.', labels: [
        { labelId: `${featureId(p[5], 'illustration')}-roof`, text: 'Roof runoff', description: 'Rain flows from the hard roof surface.' },
        { labelId: `${featureId(p[5], 'illustration')}-garden`, text: 'Shallow garden', description: 'Plants and loose soil slow and receive some runoff.' },
        { labelId: `${featureId(p[5], 'illustration')}-ground`, text: 'Soaking water', description: 'Water moves into spaces in the soil.' },
      ] },
      { featureId: featureId(p[5], 'caption'), kind: 'caption', targetFeatureId: featureId(p[5], 'illustration'), text: 'Runoff spreads among the plants before soaking into the ground.' },
      { featureId: featureId(p[5], 'sidebar'), kind: 'sidebar', title: 'Plan Safely', text: 'An adult should help choose a safe rain-garden location away from building foundations.' },
    ],
    featurePlans: [
      { key: 'illustration', kind: 'illustration', contribution: 'The labels trace the path that causes runoff to move from a roof into soil.' },
      { key: 'caption', kind: 'caption', contribution: 'The caption clarifies the result shown in the diagram: water spreads and soaks downward.' },
      { key: 'sidebar', kind: 'sidebar', contribution: 'The fact box adds a practical safety detail without interrupting the cause-and-effect explanation.' },
    ],
    structureReason: 'The passage explains why puddles form and how a rain garden changes where some runoff goes.',
    organizationHelp: 'Cause-and-effect organization connects hard surfaces, moving runoff, plant roots, soaking water, and fewer puddles.',
    evidenceSentenceNumbers: [2, 5],
    distractorReasons: ['It gives exact construction steps that must be followed in order.', 'It mainly compares rain gardens with four other gardens.', 'It lists storm facts without explaining any result.'],
    hotPrompt: 'Select the sentence that gives a result of water soaking into the rain garden.', hotCorrectSentence: 5, hotDistractorSentences: [1, 3, 7],
    support: [
      { word: 'surfaces', sentence: 1, chunks: ['sur', 'fac', 'es'], focus: 'fac' },
      { word: 'gather', sentence: 2, chunks: ['gath', 'er'], focus: 'gath' },
      { word: 'shallow', sentence: 3, chunks: ['shal', 'low'], focus: 'shal' },
      { word: 'changes', sentence: 10, chunks: ['chang', 'es'], focus: 'chang' },
    ],
    transfer: { prompt: 'A new section explains that cold air cools water vapor, so droplets form. Which structure best fits that section?', correctStructure: 'cause-effect', explanation: 'The section explains why droplets form and the result of cooling, so it uses cause and effect.' },
  },
  {
    passageId: p[6], title: 'Making Recycled Paper', difficulty: 1, structure: 'chronology', structureLabel: 'Chronology',
    sentences: [
      'Used classroom paper can become material for a new sheet instead of going straight into the trash.',
      'First, small pieces of used paper soak in water until they become soft.',
      'Next, the wet pieces are mixed into a thick pulp with adult help.',
      'The pulp is spread in a thin layer across a screen so extra water can drain away.',
      'Then a cloth presses more water from the layer.',
      'After the damp sheet is lifted from the screen, it rests on a flat surface.',
      'Finally, the sheet dries and can be used for a note or drawing.',
      'The timeline shows the change from torn paper to pulp, damp sheet, and dry paper.',
      'Its caption makes the four main stages easy to scan before reading every step.',
      'A glossary defines pulp as a soft, wet mixture of paper fibers.',
      'The ordered process explains how the material changes at each stage.',
    ],
    firstSectionHeading: 'From Pieces to Pulp', secondSectionHeading: 'From Wet Layer to New Sheet', splitAfter: 4,
    features: [
      { featureId: featureId(p[6], 'title'), kind: 'title', text: 'Making Recycled Paper' },
      { featureId: featureId(p[6], 'heading-1'), kind: 'heading', sectionId: sectionId(p[6], 1), text: 'From Pieces to Pulp' },
      { featureId: featureId(p[6], 'heading-2'), kind: 'heading', sectionId: sectionId(p[6], 2), text: 'From Wet Layer to New Sheet' },
      { featureId: featureId(p[6], 'timeline'), kind: 'timeline', title: 'Paper Changes Step by Step', items: [
        { itemId: `${featureId(p[6], 'timeline')}-pieces`, label: '1. Soft pieces', description: 'Used paper soaks in water.', order: 1 },
        { itemId: `${featureId(p[6], 'timeline')}-pulp`, label: '2. Pulp', description: 'Wet pieces become a thick mixture.', order: 2 },
        { itemId: `${featureId(p[6], 'timeline')}-damp`, label: '3. Damp sheet', description: 'The pulp drains and is pressed.', order: 3 },
        { itemId: `${featureId(p[6], 'timeline')}-dry`, label: '4. Dry paper', description: 'The flat sheet dries for later use.', order: 4 },
      ] },
      { featureId: featureId(p[6], 'caption'), kind: 'caption', targetFeatureId: featureId(p[6], 'timeline'), text: 'Four stages trace the material from used pieces to a dry new sheet.' },
      { featureId: featureId(p[6], 'glossary'), kind: 'glossary', entries: [{ entryId: `${featureId(p[6], 'glossary')}-pulp`, term: 'pulp', definition: 'a soft, wet mixture of paper fibers' }] },
    ],
    featurePlans: [
      { key: 'timeline', kind: 'timeline', contribution: 'The timeline condenses the process into four stages readers can scan in order.' },
      { key: 'caption', kind: 'caption', contribution: 'The caption explains that the timeline follows one material as it changes.' },
      { key: 'glossary', kind: 'glossary', contribution: 'The glossary explains pulp, the material made during an important middle step.' },
    ],
    structureReason: 'The passage organizes a paper-making process in the order its steps must happen.',
    organizationHelp: 'Chronology helps readers follow how used pieces change into pulp, a damp layer, and a dry sheet.',
    evidenceSentenceNumbers: [2, 7],
    distractorReasons: ['It mainly compares recycled paper with plastic.', 'It explains that drying causes the paper to be torn first.', 'It lists paper facts that may be rearranged without changing the process.'],
    hotPrompt: 'Select the sentence that tells what happens immediately after the pulp is spread on the screen.', hotCorrectSentence: 5, hotDistractorSentences: [2, 4, 7],
    support: [
      { word: 'material', sentence: 1, chunks: ['ma', 'te', 'ri', 'al'], focus: 'te' },
      { word: 'mixture', sentence: 10, chunks: ['mix', 'ture'], focus: 'mix' },
      { word: 'screen', sentence: 4, chunks: ['scr', 'een'], focus: 'scr' },
      { word: 'process', sentence: 11, chunks: ['proc', 'ess'], focus: 'proc' },
    ],
    transfer: { prompt: 'A new article explains how a seed sprouts, grows roots, and later forms leaves in time order. Which structure best fits?', correctStructure: 'chronology', explanation: 'The article follows stages in time order, so chronology is the best structure.' },
  },
]

export const structureStationRecords: readonly StructureStationRecord[] = records

export const structureStationPassages: Passage[] = records.map((record) => {
  const sentences = record.sentences.map((text, index) => ({ sentenceId: sentenceId(record.passageId, index + 1), sentenceNumber: index + 1, text }))
  const firstSentenceIds = sentences.slice(0, record.splitAfter).map((sentence) => sentence.sentenceId)
  const secondSentenceIds = sentences.slice(record.splitAfter).map((sentence) => sentence.sentenceId)
  const firstFeatureIds = record.featurePlans.filter((_, index) => index % 2 === 0).map((plan) => featureId(record.passageId, plan.key))
  const secondFeatureIds = record.featurePlans.filter((_, index) => index % 2 === 1).map((plan) => featureId(record.passageId, plan.key))
  return {
    passageIdentifier: record.passageId, title: record.title, contentKind: 'informational',
    passageText: record.sentences.join(' '), sentences,
    informationalStructure: {
      titleFeatureId: featureId(record.passageId, 'title'),
      sections: [
        { sectionId: sectionId(record.passageId, 1), headingFeatureId: featureId(record.passageId, 'heading-1'), sentenceIds: firstSentenceIds, featureIds: firstFeatureIds },
        { sectionId: sectionId(record.passageId, 2), headingFeatureId: featureId(record.passageId, 'heading-2'), sentenceIds: secondSentenceIds, featureIds: secondFeatureIds },
      ],
      features: record.features,
    },
    genre: 'informational', gradeBand: 3, readingContext: 'Grade 3 Information Detectives text-structure practice',
    reviewStatus: 'DRAFT', contentVersion: STRUCTURE_STATION_VERSION,
    wordSupportTargets: record.support.map((support) => buildSupportTarget(record, support)),
  }
})

export const informationalStructureGuides: InformationalStructureGuide[] = records.map((record) => ({
  passageId: record.passageId,
  primaryStructure: record.structure,
  featureContributions: record.featurePlans.map((plan) => ({
    featureId: featureId(record.passageId, plan.key), featureKind: plan.kind,
    contributionStatement: plan.contribution, evidenceIds: [featureId(record.passageId, plan.key)],
  })),
  structureEvidence: [
    { evidenceId: `${record.passageId}-structure-evidence-beginning`, structure: record.structure, evidenceIds: [sentenceId(record.passageId, record.evidenceSentenceNumbers[0])], explanation: record.structureReason },
    { evidenceId: `${record.passageId}-structure-evidence-later`, structure: record.structure, evidenceIds: [sentenceId(record.passageId, record.evidenceSentenceNumbers[1])], explanation: record.organizationHelp },
  ],
  organizationalSummary: `${record.structureReason} ${record.organizationHelp}`,
  reviewStatus: 'DRAFT', contentVersion: STRUCTURE_STATION_VERSION,
}))

function buildSupportTarget(record: StructureStationRecord, support: SupportPlan): WordSupportTarget {
  const text = record.sentences[support.sentence - 1]
  const index = text.toLowerCase().indexOf(support.word.toLowerCase())
  const surfaceWord = index >= 0 ? text.slice(index, index + support.word.length) : support.word
  const focusIndex = surfaceWord.toLowerCase().indexOf(support.focus.toLowerCase())
  return {
    targetId: `${record.passageId}-support-${support.word.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    passageId: record.passageId, sentenceId: sentenceId(record.passageId, support.sentence), surfaceWord,
    focusParts: focusIndex < 0 ? [{ text: surfaceWord, emphasis: true }] : [
      { text: surfaceWord.slice(0, focusIndex), emphasis: false },
      { text: surfaceWord.slice(focusIndex, focusIndex + support.focus.length), emphasis: true },
      { text: surfaceWord.slice(focusIndex + support.focus.length), emphasis: false },
    ].filter((part) => part.text.length > 0),
    displayChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    spokenChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    blendSpeechText: surfaceWord, wholeWordSpeechText: surfaceWord, sentenceSpeechText: text,
    reviewStatus: 'DRAFT', contentVersion: STRUCTURE_STATION_VERSION,
  }
}
