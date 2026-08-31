import type { InformationalFeature } from '../../../../informationalTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import type { CentralIdeaGuide, CentralIdeaMode } from '../../../contentPackTypes'
import { CENTRAL_IDEA_ENGINE_PASSAGE_IDS, CENTRAL_IDEA_ENGINE_VERSION } from './ids'

interface SupportPlan { word: string; sentence: number; chunks: string[]; focus: string }
interface DetailPlan { sentence: number; contribution: string }
interface TransferPlan { text: string; centralIdea: string; topic: string; narrowDetail: string; unsupported: string; explanation: string }

export interface CentralIdeaEngineRecord {
  passageId: string
  title: string
  difficulty: 1 | 2
  topic: string
  centralIdea: string
  mode: CentralIdeaMode
  explicitCentralIdeaSentence?: number
  headings: [string, string, string]
  sectionEnds: [number, number]
  sentences: string[]
  relevantDetails: [DetailPlan, DetailPlan, DetailPlan, DetailPlan, ...DetailPlan[]]
  minorDetails: [DetailPlan, DetailPlan, ...DetailPlan[]]
  sectionContributions: [string, string, string]
  synthesis: string
  summaryDistractor: string
  narrowDistractor: string
  broadDistractor: string
  hotPrompt: string
  hotCorrectSentence: number
  hotDistractorSentences: [number, number, number]
  support: [SupportPlan, SupportPlan, SupportPlan, SupportPlan]
  transfer?: TransferPlan
}

const p = CENTRAL_IDEA_ENGINE_PASSAGE_IDS
export const centralIdeaSentenceId = (passageId: string, number: number) => `${passageId}-sentence-${number}`
export const centralIdeaSectionId = (passageId: string, number: number) => `${passageId}-section-${number}`
const featureId = (passageId: string, key: string) => `${passageId}-feature-${key}`

const GLOSSARY_DEFINITIONS: Record<string, string> = {
  ocean: 'a very large body of salt water',
  uncovered: 'not covered or no longer hidden',
  helmet: 'a hard covering worn to protect the head',
  structures: 'things built or arranged from connected parts',
  wetland: 'land that stays covered or soaked with water for much of the time',
  roofs: 'top coverings that protect buildings',
  returned: 'came or went back to a place',
}

function glossaryDefinition(word: string): string {
  const definition = GLOSSARY_DEFINITIONS[word.toLowerCase()]
  if (!definition) throw new Error(`Missing Central Idea Engine glossary definition for ${word}.`)
  return definition
}

const records: CentralIdeaEngineRecord[] = [
  {
    passageId: p[0], title: 'How Beach Grass Builds a Dune', difficulty: 1, topic: 'beach grass and sand dunes', mode: 'stated', explicitCentralIdeaSentence: 12,
    centralIdea: 'Beach grass uses its leaves and roots to help sand dunes form and stay in place.',
    headings: ['Wind Drops Sand', 'Roots Hold the Mound', 'A Growing Barrier'], sectionEnds: [4, 8],
    sentences: [
      'Beach grass grows in loose sand beside the ocean.',
      'Its long leaves slow wind that carries loose grains of sand.',
      'When the wind slows near the leaves, some sand drops around the stems.',
      'A clump of grass can collect a small mound as more wind passes.',
      'Under the mound, spreading roots and underground stems hold sand in place.',
      'New shoots grow from those stems and trap even more sand.',
      'The roots also help the grass remain anchored during windy weather.',
      'Over time, the mound can become part of a larger dune.',
      'Dunes can reduce some blowing sand before it reaches places farther inland.',
      'Small dune plants may grow where enough sand and water collect.',
      'A beetle can leave tiny tracks across the dune early in the morning.',
      'Beach grass uses its leaves and roots to help sand dunes form and stay in place.',
    ],
    relevantDetails: [
      { sentence: 2, contribution: 'The leaves slow sand-carrying wind.' },
      { sentence: 3, contribution: 'Slower wind drops sand near the grass.' },
      { sentence: 5, contribution: 'Spreading roots hold the collected sand.' },
      { sentence: 8, contribution: 'Repeated trapping can build a larger dune.' },
      { sentence: 9, contribution: 'The finished dune changes how blowing sand moves inland.' },
    ],
    minorDetails: [
      { sentence: 1, contribution: 'This introduces where beach grass grows but does not explain its main work.' },
      { sentence: 11, contribution: 'Beetle tracks are true but do not explain how grass builds and holds a dune.' },
    ],
    sectionContributions: [
      'The first section explains how grass leaves slow wind and collect sand.',
      'The middle section explains how roots hold the mound while new shoots trap more sand.',
      'The final section shows the larger result and states the central idea directly.',
    ],
    synthesis: 'Details across all three sections support the idea that beach grass leaves and roots work together to form and hold dunes.',
    summaryDistractor: 'Wind blows sand, grass grows, beetles make tracks, and dunes stand beside the ocean.',
    narrowDistractor: 'A beetle can leave tracks on a dune in the morning.',
    broadDistractor: 'Every plant beside the ocean creates a large dune by itself.',
    hotPrompt: 'Select the sentence that directly states the central idea.', hotCorrectSentence: 12, hotDistractorSentences: [2, 8, 11],
    support: [
      { word: 'ocean', sentence: 1, chunks: ['o', 'cean'], focus: 'cean' },
      { word: 'grains', sentence: 2, chunks: ['grain', 's'], focus: 'grain' },
      { word: 'spreading', sentence: 5, chunks: ['spread', 'ing'], focus: 'spread' },
      { word: 'larger', sentence: 8, chunks: ['larg', 'er'], focus: 'larg' },
    ],
  },
  {
    passageId: p[1], title: 'Cooling a City Block', difficulty: 1, topic: 'trees in cities', mode: 'inferred',
    centralIdea: 'Groups of healthy city trees improve nearby spaces by providing shade, cooling air, and offering places for animals.',
    headings: ['Shade on Surfaces', 'Cooling Through Leaves', 'More Than Cooling'], sectionEnds: [4, 8],
    sentences: [
      'On a hot sunny day, roofs and sidewalks can absorb energy and become warm.',
      'A street tree canopy blocks some sunlight before it reaches the ground.',
      'Surfaces under the shade often stay cooler than uncovered surfaces nearby.',
      'People walking beneath the branches can also rest out of direct sunlight.',
      'Tree roots take in water from the soil.',
      'Leaves release some water vapor through tiny openings.',
      'As that water evaporates, it can cool the air close to the leaves.',
      'The cooling effect is strongest near healthy trees with many leaves.',
      'Branches can give birds places to perch, hide, and build nests.',
      'Flowers or fruits on some city trees can provide food for insects or birds.',
      'Tree workers sometimes attach small numbered tags while caring for young trees.',
      'One tree cannot cool an entire city, but groups of trees can make nearby streets and parks more comfortable.',
    ],
    relevantDetails: [
      { sentence: 2, contribution: 'The canopy provides shade by blocking sunlight.' },
      { sentence: 3, contribution: 'Shaded surfaces stay cooler.' },
      { sentence: 7, contribution: 'Evaporating water near leaves can cool nearby air.' },
      { sentence: 9, contribution: 'Branches provide places for birds.' },
      { sentence: 12, contribution: 'Groups of trees can make nearby public spaces more comfortable.' },
    ],
    minorDetails: [
      { sentence: 1, contribution: 'This introduces the hot setting but does not explain a benefit from trees.' },
      { sentence: 11, contribution: 'Numbered care tags are interesting but do not develop the main benefits of city trees.' },
    ],
    sectionContributions: [
      'The first section shows how tree shade changes sunny surfaces and walking spaces.',
      'The middle section explains how water released by leaves can cool nearby air.',
      'The final section adds habitat and comfort details that broaden the same central idea.',
    ],
    synthesis: 'Readers combine shade, evaporation, habitat, and comfort details across sections to infer how healthy city trees improve nearby spaces.',
    summaryDistractor: 'Sidewalks warm, roots take in water, birds perch, workers add tags, and people visit parks.',
    narrowDistractor: 'Tree workers may attach numbered tags to young trees.',
    broadDistractor: 'Planting one tree immediately changes the temperature of an entire city.',
    hotPrompt: 'Select the sentence that explains how water from tree leaves can cool nearby air.', hotCorrectSentence: 7, hotDistractorSentences: [1, 5, 11],
    support: [
      { word: 'uncovered', sentence: 3, chunks: ['un', 'cov', 'ered'], focus: 'cov' },
      { word: 'canopy', sentence: 2, chunks: ['can', 'o', 'py'], focus: 'can' },
      { word: 'evaporates', sentence: 7, chunks: ['e', 'vap', 'o', 'rates'], focus: 'vap' },
      { word: 'comfortable', sentence: 12, chunks: ['com', 'fort', 'a', 'ble'], focus: 'fort' },
    ],
  },
  {
    passageId: p[2], title: 'A Helmet Has More Than One Job', difficulty: 2, topic: 'bicycle helmets', mode: 'stated', explicitCentralIdeaSentence: 2,
    centralIdea: 'A bicycle helmet uses several fitted parts to help manage impact force and protect a rider during a crash.',
    headings: ['Layers That Manage Force', 'A Secure Fit', 'Use and Replace Carefully'], sectionEnds: [5, 9],
    sentences: [
      'A bicycle helmet may look simple from the outside, but it contains several important parts.',
      'A bicycle helmet uses several fitted parts to help manage impact force and protect a rider during a crash.',
      'The hard outer shell can spread some force and resist contact with a sharp surface.',
      'Inside, a firm foam layer compresses during a hard impact and absorbs some energy.',
      'Soft pads make the helmet more comfortable, but the shell and foam do most of the protective work.',
      'Straps help keep the helmet in the correct position.',
      'A level helmet should sit low on the forehead rather than tilt far back.',
      'The side straps form a V shape around each ear.',
      'A snug buckle helps prevent the helmet from sliding during movement.',
      'A helmet should be replaced after a hard crash because damage may not be visible.',
      'Helmets are sold in many colors and patterns.',
      'No helmet prevents every injury, so riders still need safe routes, careful choices, and adult guidance.',
    ],
    relevantDetails: [
      { sentence: 3, contribution: 'The shell spreads some force and resists sharp contact.' },
      { sentence: 4, contribution: 'The foam compresses to absorb some impact energy.' },
      { sentence: 6, contribution: 'Straps keep the protective parts in position.' },
      { sentence: 9, contribution: 'A snug buckle keeps the helmet from sliding.' },
      { sentence: 10, contribution: 'Replacement after a crash matters because hidden damage can weaken protection.' },
    ],
    minorDetails: [
      { sentence: 1, contribution: 'The opening introduces the object but does not explain how its parts protect a rider.' },
      { sentence: 11, contribution: 'Colors and patterns do not explain how a helmet manages force.' },
    ],
    sectionContributions: [
      'The first section names the layers and explains how they handle force.',
      'The middle section explains why the protective parts must fit and stay in place.',
      'The final section explains safe replacement and the limits of helmet protection.',
    ],
    synthesis: 'Details from the layers, fit, and careful-use sections support the stated idea that several fitted helmet parts work together during a crash.',
    summaryDistractor: 'A helmet has a shell, foam, pads, straps, a buckle, colors, and patterns.',
    narrowDistractor: 'A bicycle helmet can come in many colors and patterns.',
    broadDistractor: 'A helmet prevents every possible bicycle injury.',
    hotPrompt: 'Select the sentence that directly states the central idea.', hotCorrectSentence: 2, hotDistractorSentences: [4, 9, 11],
    support: [
      { word: 'helmet', sentence: 1, chunks: ['hel', 'met'], focus: 'hel' },
      { word: 'impact', sentence: 2, chunks: ['im', 'pact'], focus: 'pact' },
      { word: 'compresses', sentence: 4, chunks: ['com', 'press', 'es'], focus: 'press' },
      { word: 'visible', sentence: 10, chunks: ['vis', 'i', 'ble'], focus: 'vis' },
    ],
  },
  {
    passageId: p[3], title: 'Seeds with Built-In Travel Tools', difficulty: 2, topic: 'ways seeds travel', mode: 'inferred',
    centralIdea: 'Different seed structures help plants move their seeds away from the parent plant by using wind, animals, or water.',
    headings: ['Riding the Air', 'Moving with Animals', 'Floating to New Ground'], sectionEnds: [5, 9],
    sentences: [
      'Plants cannot walk to a new growing place, but many seeds have structures that help them travel.',
      'A maple seed has a thin wing attached to it.',
      'The wing makes the seed spin as it falls and can give a breeze more time to carry it.',
      'A dandelion seed hangs below a feathery tuft that catches moving air.',
      'Both air travelers may land beyond the shade of the parent plant.',
      'Burdock seeds grow inside burrs with tiny hooks.',
      'The hooks can catch on animal fur and later fall off in another place.',
      'Some fleshy fruits attract animals that carry fruit or seeds away from the plant.',
      'These trips use animal movement instead of wind.',
      'A coconut has a fibrous covering that helps it float in water.',
      'A floating seed may reach a shore where it can begin growing.',
      'Moving away can reduce competition with the parent plant for light, water, and space.',
      'Seed collectors sometimes store dry examples in labeled paper envelopes.',
      'Each travel structure works with a different part of the seed surroundings.',
    ],
    relevantDetails: [
      { sentence: 3, contribution: 'A maple wing helps wind carry the seed.' },
      { sentence: 4, contribution: 'A feathery tuft is another structure that catches air.' },
      { sentence: 7, contribution: 'Hooks use animal fur to move a seed.' },
      { sentence: 10, contribution: 'A fibrous covering helps a coconut travel by water.' },
      { sentence: 12, contribution: 'Travel can reduce competition near the parent plant.' },
    ],
    minorDetails: [
      { sentence: 1, contribution: 'The opening names the broad problem but does not give evidence for a particular travel structure.' },
      { sentence: 13, contribution: 'Storage envelopes are about collecting seeds, not how plant structures move them naturally.' },
    ],
    sectionContributions: [
      'The first section gives two structures that use moving air.',
      'The middle section explains structures and fruits that use animal movement.',
      'The final section adds water travel and explains why moving away can help a seedling.',
    ],
    synthesis: 'Details across the wind, animal, and water sections support the inferred idea that seed structures use different surroundings to carry seeds away.',
    summaryDistractor: 'Maple seeds spin, burrs hook, coconuts float, and collectors use paper envelopes.',
    narrowDistractor: 'A maple seed spins because it has a thin wing.',
    broadDistractor: 'Every seed can travel equally well through air, on animals, and across water.',
    hotPrompt: 'Select the sentence that explains how a seed can travel on an animal.', hotCorrectSentence: 7, hotDistractorSentences: [1, 9, 13],
    support: [
      { word: 'structures', sentence: 1, chunks: ['struc', 'tures'], focus: 'struc' },
      { word: 'feathery', sentence: 4, chunks: ['feath', 'er', 'y'], focus: 'feath' },
      { word: 'fibrous', sentence: 10, chunks: ['fi', 'brous'], focus: 'brous' },
      { word: 'competition', sentence: 12, chunks: ['com', 'pe', 'ti', 'tion'], focus: 'pe' },
    ],
  },
  {
    passageId: p[4], title: 'A Wetland Handles Water', difficulty: 2, topic: 'wetlands', mode: 'inferred',
    centralIdea: 'Wetlands support nearby land and living things by slowing and holding water, trapping soil, and providing habitat.',
    headings: ['Room for Rain', 'Water Slows Down', 'A Place for Life'], sectionEnds: [5, 10],
    sentences: [
      'A wetland is an area where water covers the soil or stays close to the surface for part or all of the year.',
      'After heavy rain, water can spread into a low wetland instead of rushing through one narrow channel.',
      'The shallow area gives some storm water room to collect for a time.',
      'Some water later soaks into the ground, and some leaves slowly through streams or evaporation.',
      'A measuring stake may show how high the water rose after a storm.',
      'Dense stems and leaves slow water moving through the wetland.',
      'When water slows, some soil particles settle instead of traveling farther.',
      'Plant roots help hold wet soil in place.',
      'These effects can reduce the amount of loose soil carried into nearby water.',
      'A wooden boardwalk may let visitors cross a wet area without stepping into soft ground.',
      'Frogs can lay eggs among wetland plants.',
      'Young fish and insects can find food or shelter in shallow water.',
      'Birds may rest or feed where water and plants meet.',
      'Scientists sometimes use numbered flags to mark study locations.',
      'Water storage, slower flow, and many habitats all occur within the same wetland.',
    ],
    relevantDetails: [
      { sentence: 2, contribution: 'A wetland gives storm water another place to spread.' },
      { sentence: 6, contribution: 'Dense plants slow moving water.' },
      { sentence: 7, contribution: 'Slower water drops some soil particles.' },
      { sentence: 11, contribution: 'Wetland plants provide a place for frog eggs.' },
      { sentence: 12, contribution: 'Shallow water provides food and shelter for young animals.' },
      { sentence: 15, contribution: 'The final detail connects water handling and habitat within one place.' },
    ],
    minorDetails: [
      { sentence: 10, contribution: 'The boardwalk helps visitors but does not explain the wetland work developed across the text.' },
      { sentence: 14, contribution: 'Numbered study flags are interesting but do not show how the wetland supports land or wildlife.' },
    ],
    sectionContributions: [
      'The first section explains how a wetland temporarily receives storm water.',
      'The middle section explains how plants slow water and reduce moving soil.',
      'The final section shows that the same wet area provides habitat for several animals.',
    ],
    synthesis: 'Details across the water, soil, and habitat sections support the inferred idea that wetlands perform several connected jobs for nearby land and living things.',
    summaryDistractor: 'Rain enters a wetland, visitors cross a boardwalk, frogs lay eggs, birds feed, and scientists place flags.',
    narrowDistractor: 'A boardwalk can help visitors cross soft wetland ground.',
    broadDistractor: 'Every wetland completely prevents floods and soil movement.',
    hotPrompt: 'Select the sentence that explains how slower wetland water affects soil particles.', hotCorrectSentence: 7, hotDistractorSentences: [5, 10, 14],
    support: [
      { word: 'wetland', sentence: 1, chunks: ['wet', 'land'], focus: 'wet' },
      { word: 'particles', sentence: 7, chunks: ['par', 'ti', 'cles'], focus: 'par' },
      { word: 'shelter', sentence: 12, chunks: ['shel', 'ter'], focus: 'shel' },
      { word: 'Scientists', sentence: 14, chunks: ['Sci', 'en', 'tists'], focus: 'Sci' },
    ],
    transfer: {
      text: 'One section explains that prairie roots hold soil. Another explains that prairie flowers feed insects. A final section describes birds nesting among tall grasses.',
      centralIdea: 'Prairies support soil and many living things in several connected ways.', topic: 'prairies',
      narrowDetail: 'Some birds nest among tall grasses.', unsupported: 'Prairies are the only habitats that insects need.',
      explanation: 'The central idea fits the soil, insect, and bird details across all three sections.',
    },
  },
  {
    passageId: p[5], title: 'From Sunlight to Classroom Electricity', difficulty: 2, topic: 'a school solar-panel system', mode: 'stated', explicitCentralIdeaSentence: 2,
    centralIdea: 'A school solar-panel system changes sunlight into usable electricity and safely delivers that energy to the building.',
    headings: ['Cells Capture Light', 'Electricity Becomes Usable', 'Watching the System'], sectionEnds: [5, 10],
    sentences: [
      'Some schools place groups of solar panels on sunny roofs or open ground.',
      'A school solar-panel system changes sunlight into usable electricity and safely delivers that energy to the building.',
      'Each panel contains many solar cells that absorb energy from sunlight.',
      'Inside the cells, that energy helps create an electrical current.',
      'Wires carry the current away from the panels.',
      'An inverter changes the current into the form used by most school equipment.',
      'Safety switches allow trained adults to disconnect parts of the system when work is needed.',
      'The electricity then moves through the building wiring.',
      'Lights, computers, or other equipment can use the delivered energy.',
      'If the panels produce less than the building needs, another connected power source can provide the rest.',
      'A monitor can show how much electricity the panels are producing.',
      'Clouds, shade, and the time of day can change the amount shown on the monitor.',
      'Many panels look dark blue or black from the ground.',
      'The readings help adults check whether electricity is moving through the system as expected.',
      'Each part has a different job in carrying energy from the panels to useful equipment.',
    ],
    relevantDetails: [
      { sentence: 3, contribution: 'Solar cells absorb energy from sunlight.' },
      { sentence: 5, contribution: 'Wires move electrical current from the panels.' },
      { sentence: 6, contribution: 'The inverter changes the current into a usable form.' },
      { sentence: 8, contribution: 'Building wiring delivers electricity to equipment.' },
      { sentence: 11, contribution: 'A monitor reports how much electricity the system produces.' },
      { sentence: 15, contribution: 'The final detail connects the different parts to one energy-delivery job.' },
    ],
    minorDetails: [
      { sentence: 1, contribution: 'This introduces where panels may be placed but does not explain the whole energy system.' },
      { sentence: 13, contribution: 'Panel color is true but does not explain how energy becomes usable electricity.' },
    ],
    sectionContributions: [
      'The first section explains how cells begin changing light energy into current.',
      'The middle section follows the current through equipment that makes and delivers usable electricity.',
      'The final section explains how adults observe changes and check the working system.',
    ],
    synthesis: 'Details across the capture, delivery, and monitoring sections support the stated idea that several system parts move sunlight-derived energy into the school.',
    summaryDistractor: 'Panels sit on roofs, wires carry current, switches disconnect parts, monitors show numbers, and panels look dark.',
    narrowDistractor: 'Many solar panels look dark blue or black.',
    broadDistractor: 'Solar panels always provide every bit of electricity a school needs.',
    hotPrompt: 'Select the sentence that directly states the central idea.', hotCorrectSentence: 2, hotDistractorSentences: [3, 11, 13],
    support: [
      { word: 'roofs', sentence: 1, chunks: ['roof', 's'], focus: 'roof' },
      { word: 'electrical', sentence: 4, chunks: ['e', 'lec', 'tri', 'cal'], focus: 'lec' },
      { word: 'inverter', sentence: 6, chunks: ['in', 'vert', 'er'], focus: 'vert' },
      { word: 'monitor', sentence: 11, chunks: ['mon', 'i', 'tor'], focus: 'mon' },
    ],
    transfer: {
      text: 'A greenhouse roof lets sunlight reach plants. Vents release extra heat, and a watering system supplies moisture. Sensors help workers adjust these parts.',
      centralIdea: 'Several greenhouse parts work together to create useful growing conditions.', topic: 'greenhouses',
      narrowDetail: 'Vents release extra heat.', unsupported: 'A greenhouse can grow every plant without any care.',
      explanation: 'The central idea connects the roof, vents, watering system, and sensors instead of selecting one detail.',
    },
  },
  {
    passageId: p[6], title: 'The Return Trip of a Library Book', difficulty: 2, topic: 'returned library books', mode: 'inferred',
    centralIdea: 'Labels, scanning, sorting, and shelving work together so a returned library book can be found by the next reader.',
    headings: ['Check the Return', 'Sort by Location', 'Ready for the Next Reader'], sectionEnds: [5, 10],
    sentences: [
      'A returned library book begins another trip before it reaches the shelf.',
      'A library worker first checks the cover and pages for damage.',
      'If a bookmark or paper is left inside, the worker removes it before shelving.',
      'A scanner reads the code on the book and records that it has been returned.',
      'The catalog can then show that the book is moving back toward its shelf location.',
      'A label on the spine gives letters, numbers, or both that identify where the book belongs.',
      'Workers place books with similar labels together on a cart.',
      'Picture books, information books, and chapter books may belong in different areas.',
      'Sorting the cart reduces extra searching when books are carried to the shelves.',
      'A bright cover may catch a reader\'s eye, but cover color does not decide the shelf location.',
      'At the shelf, a worker follows the label order to find the exact space.',
      'The worker may straighten nearby books so labels remain easy to read.',
      'A final check makes sure the returned book is not hidden behind a larger one.',
      'After these steps, a reader searching the catalog can find the book in its expected place.',
      'The careful return system prepares the same book to be borrowed again.',
    ],
    relevantDetails: [
      { sentence: 4, contribution: 'Scanning records that the book has returned.' },
      { sentence: 6, contribution: 'The spine label identifies the correct location.' },
      { sentence: 7, contribution: 'Sorting groups books that belong near one another.' },
      { sentence: 11, contribution: 'Workers use label order to locate the exact shelf space.' },
      { sentence: 14, contribution: 'The completed steps make the book findable in the catalog and on the shelf.' },
      { sentence: 15, contribution: 'The system prepares the book for another reader.' },
    ],
    minorDetails: [
      { sentence: 3, contribution: 'Removing a forgotten paper is useful care but does not explain the location system.' },
      { sentence: 10, contribution: 'Cover color may be noticeable but does not determine where a book belongs.' },
    ],
    sectionContributions: [
      'The first section explains the return check and catalog scan.',
      'The middle section explains how labels and sorting point toward a shelf area.',
      'The final section explains how exact shelving makes the book findable again.',
    ],
    synthesis: 'Details across the return, sorting, and shelving sections support the inferred idea that several coordinated steps make a library book available to the next reader.',
    summaryDistractor: 'A worker checks a book, removes paper, scans it, sorts it, straightens shelves, and looks at its cover.',
    narrowDistractor: 'A scanner records that one book has been returned.',
    broadDistractor: 'A book cover color tells every library exactly where to place it.',
    hotPrompt: 'Select the sentence that shows the final result of the book return system.', hotCorrectSentence: 14, hotDistractorSentences: [2, 3, 10],
    support: [
      { word: 'returned', sentence: 1, chunks: ['re', 'turned'], focus: 'turn' },
      { word: 'scanner', sentence: 4, chunks: ['scan', 'ner'], focus: 'scan' },
      { word: 'different', sentence: 8, chunks: ['dif', 'fer', 'ent'], focus: 'fer' },
      { word: 'expected', sentence: 14, chunks: ['ex', 'pect', 'ed'], focus: 'pect' },
    ],
    transfer: {
      text: 'A museum worker records each object, adds a location label, and places it in a padded box. A catalog tells staff where to find the box later.',
      centralIdea: 'Records, labels, and careful storage help museum workers protect and find objects.', topic: 'museum storage',
      narrowDetail: 'A padded box protects one object.', unsupported: 'Every museum object is stored in the same box.',
      explanation: 'The central idea fits the recording, labeling, storing, and finding details together.',
    },
  },
]

export const centralIdeaEngineRecords: readonly CentralIdeaEngineRecord[] = records

export const centralIdeaEnginePassages: Passage[] = records.map((record) => {
  const sentences = record.sentences.map((text, index) => ({ sentenceId: centralIdeaSentenceId(record.passageId, index + 1), sentenceNumber: index + 1, text }))
  const ranges: Array<[number, number]> = [[1, record.sectionEnds[0]], [record.sectionEnds[0] + 1, record.sectionEnds[1]], [record.sectionEnds[1] + 1, sentences.length]]
  const headingFeatures: InformationalFeature[] = record.headings.map((heading, index) => ({
    featureId: featureId(record.passageId, `heading-${index + 1}`), kind: 'heading', sectionId: centralIdeaSectionId(record.passageId, index + 1), text: heading,
  }))
  const glossaryFeature: InformationalFeature = {
    featureId: featureId(record.passageId, 'glossary'), kind: 'glossary', entries: [{
      entryId: `${featureId(record.passageId, 'glossary')}-entry`, term: record.support[0].word,
      definition: glossaryDefinition(record.support[0].word),
    }],
  }
  const sidebarFeature: InformationalFeature = {
    featureId: featureId(record.passageId, 'sidebar'), kind: 'sidebar', title: 'Notice the Important Details',
    text: 'Ask how details from more than one section connect to the same important idea.',
  }
  return {
    passageIdentifier: record.passageId, title: record.title, contentKind: 'informational', passageText: record.sentences.join(' '), sentences,
    informationalStructure: {
      titleFeatureId: featureId(record.passageId, 'title'),
      sections: ranges.map(([start, end], index) => ({
        sectionId: centralIdeaSectionId(record.passageId, index + 1), headingFeatureId: featureId(record.passageId, `heading-${index + 1}`),
        sentenceIds: sentences.slice(start - 1, end).map((sentence) => sentence.sentenceId),
        featureIds: index === 2 ? [featureId(record.passageId, 'glossary'), featureId(record.passageId, 'sidebar')] : [],
      })),
      features: [{ featureId: featureId(record.passageId, 'title'), kind: 'title', text: record.title }, ...headingFeatures, glossaryFeature, sidebarFeature],
    },
    genre: 'informational', gradeBand: 3, readingContext: 'Grade 3 Information Detectives central-idea practice',
    reviewStatus: 'DRAFT', contentVersion: CENTRAL_IDEA_ENGINE_VERSION,
    wordSupportTargets: record.support.map((support) => buildSupportTarget(record, support)),
  }
})

export const centralIdeaEngineGuides: CentralIdeaGuide[] = records.map((record) => {
  const sectionForSentence = (sentence: number) => sentence <= record.sectionEnds[0] ? 1 : sentence <= record.sectionEnds[1] ? 2 : 3
  const relevantDetails = record.relevantDetails.map((detail, index) => ({
    detailId: `${record.passageId}-relevant-${index + 1}`, evidenceIds: [centralIdeaSentenceId(record.passageId, detail.sentence)],
    contributionStatement: detail.contribution, sectionId: centralIdeaSectionId(record.passageId, sectionForSentence(detail.sentence)), relevant: true,
  }))
  const minorDetails = record.minorDetails.map((detail, index) => ({
    detailId: `${record.passageId}-minor-${index + 1}`, evidenceIds: [centralIdeaSentenceId(record.passageId, detail.sentence)],
    contributionStatement: detail.contribution, sectionId: centralIdeaSectionId(record.passageId, sectionForSentence(detail.sentence)), relevant: false,
  }))
  return {
    passageId: record.passageId, topicLabel: record.topic, centralIdeaStatement: record.centralIdea, centralIdeaMode: record.mode,
    ...(record.explicitCentralIdeaSentence ? { explicitCentralIdeaSentenceId: centralIdeaSentenceId(record.passageId, record.explicitCentralIdeaSentence) } : {}),
    relevantEvidenceIds: relevantDetails.map((detail) => detail.evidenceIds[0]), otherEvidenceIds: minorDetails.map((detail) => detail.evidenceIds[0]),
    relevantDetails, irrelevantOrMinorDetails: minorDetails,
    sectionSupport: record.sectionContributions.map((contributionStatement, index) => ({
      sectionId: centralIdeaSectionId(record.passageId, index + 1), contributionStatement,
      evidenceIds: relevantDetails.filter((detail) => detail.sectionId === centralIdeaSectionId(record.passageId, index + 1)).map((detail) => detail.evidenceIds[0]),
    })),
    synthesisStatement: record.synthesis, reviewStatus: 'DRAFT', contentVersion: CENTRAL_IDEA_ENGINE_VERSION,
  }
})

function buildSupportTarget(record: CentralIdeaEngineRecord, support: SupportPlan): WordSupportTarget {
  const text = record.sentences[support.sentence - 1]
  const index = text.toLowerCase().indexOf(support.word.toLowerCase())
  const surfaceWord = index >= 0 ? text.slice(index, index + support.word.length) : support.word
  const focusIndex = surfaceWord.toLowerCase().indexOf(support.focus.toLowerCase())
  return {
    targetId: `${record.passageId}-support-${support.word.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    passageId: record.passageId, sentenceId: centralIdeaSentenceId(record.passageId, support.sentence), surfaceWord,
    focusParts: focusIndex < 0 ? [{ text: surfaceWord, emphasis: true }] : [
      { text: surfaceWord.slice(0, focusIndex), emphasis: false },
      { text: surfaceWord.slice(focusIndex, focusIndex + support.focus.length), emphasis: true },
      { text: surfaceWord.slice(focusIndex + support.focus.length), emphasis: false },
    ].filter((part) => part.text.length > 0),
    displayChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    spokenChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    blendSpeechText: surfaceWord, wholeWordSpeechText: surfaceWord, sentenceSpeechText: text,
    reviewStatus: 'DRAFT', contentVersion: CENTRAL_IDEA_ENGINE_VERSION,
  }
}
