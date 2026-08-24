import type { InformationalFeature } from '../../../../informationalTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import type { AuthorPurposeGuide, InformationalPurposeKind } from '../../../contentPackTypes'
import { PURPOSE_DEVELOPMENT_PASSAGE_IDS, PURPOSE_DEVELOPMENT_VERSION } from './ids'

interface SupportPlan { word: string; sentence: number; chunks: string[]; focus: string }
interface DetailPlan { sentence: number; contribution: string; strength: 'strong' | 'secondary' }
interface WeakPlan { sentence: number; explanation: string }
interface TransferPlan { text: string; purpose: string; topic: string; centralIdea: string; unsupported: string; explanation: string }

export interface PurposeDevelopmentRecord {
  passageId: string
  title: string
  difficulty: 2 | 3
  topic: string
  centralIdea: string
  purposeKind: InformationalPurposeKind
  purpose: string
  headings: [string, string, string]
  sectionEnds: [number, number]
  sentences: string[]
  supportingDetails: [DetailPlan, DetailPlan, DetailPlan, ...DetailPlan[]]
  weakDetails: [WeakPlan, WeakPlan, ...WeakPlan[]]
  sectionContributions: [string, string, string]
  synthesis: string
  narrowPurpose: string
  claimDistractor: string
  hotPrompt: string
  hotCorrectSentence: number
  hotDistractorSentences: [number, number, number]
  support: [SupportPlan, SupportPlan, SupportPlan, SupportPlan]
  transfer?: TransferPlan
}

const p = PURPOSE_DEVELOPMENT_PASSAGE_IDS
export const purposeSentenceId = (passageId: string, number: number) => `${passageId}-sentence-${number}`
export const purposeSectionId = (passageId: string, number: number) => `${passageId}-section-${number}`
const featureId = (passageId: string, key: string) => `${passageId}-feature-${key}`

const records: PurposeDevelopmentRecord[] = [
  {
    passageId: p[0], title: 'A New Sheet from Used Paper', difficulty: 2,
    topic: 'recycling used classroom paper', purposeKind: 'explain-process',
    purpose: 'To explain the steps that turn used classroom paper into new sheets.',
    centralIdea: 'Used paper can become a new sheet when its fibers are softened, separated, spread, pressed, and dried.',
    headings: ['Collect and Soak', 'Make the Pulp', 'Form a New Sheet'], sectionEnds: [4, 8],
    sentences: [
      'A class can collect clean used paper in a recycling tray.',
      'Students remove tape, plastic, and metal clips before the paper is reused.',
      'They tear the paper into small pieces and place the pieces in warm water.',
      'Soaking softens the paper and loosens the tiny fibers inside it.',
      'An adult helps stir or blend the wet pieces into a thick pulp.',
      'The pulp is a mixture of water and separated paper fibers.',
      'More water is added so the fibers can spread instead of staying in one clump.',
      'A blue scrap may give the whole batch a pale blue tint.',
      'The watery pulp is poured across a flat screen.',
      'Water drains through the holes while the fibers remain on top.',
      'As the fibers settle, they overlap and begin forming one thin layer.',
      'A cloth and sponge press out more water without pulling the layer apart.',
      'The damp layer dries until it becomes a firm sheet.',
      'The finished paper can be used for a card, label, or drawing.',
    ],
    supportingDetails: [
      { sentence: 4, contribution: 'Soaking loosens the fibers needed for the new sheet.', strength: 'strong' },
      { sentence: 5, contribution: 'Stirring or blending turns wet pieces into pulp.', strength: 'strong' },
      { sentence: 9, contribution: 'Pouring pulp on a screen begins forming the sheet.', strength: 'strong' },
      { sentence: 11, contribution: 'Overlapping fibers create one layer.', strength: 'strong' },
      { sentence: 12, contribution: 'Pressing removes water while keeping the layer together.', strength: 'secondary' },
      { sentence: 13, contribution: 'Drying changes the damp layer into firm paper.', strength: 'strong' },
    ],
    weakDetails: [
      { sentence: 2, explanation: 'Removing clips is useful preparation but does not reveal the main fiber-changing steps.' },
      { sentence: 8, explanation: 'The possible tint is true but weak for determining why the author explained the process.' },
    ],
    sectionContributions: [
      'The first section explains how paper is prepared and softened.',
      'The middle section explains how softened paper becomes spreadable pulp.',
      'The final section follows the pulp as it is screened, pressed, and dried into a sheet.',
    ],
    synthesis: 'The ordered details across all three sections develop the purpose by following used paper through each major recycling step.',
    narrowPurpose: 'To explain why one batch of paper may look pale blue.',
    claimDistractor: 'To convince every class that handmade paper is better than all other paper.',
    hotPrompt: 'Select the sentence that best reveals that the author is explaining a step in making a new sheet.',
    hotCorrectSentence: 9, hotDistractorSentences: [2, 8, 14],
    support: [
      { word: 'recycling', sentence: 1, chunks: ['re', 'cy', 'cling'], focus: 'cy' },
      { word: 'fibers', sentence: 4, chunks: ['fi', 'bers'], focus: 'fi' },
      { word: 'mixture', sentence: 6, chunks: ['mix', 'ture'], focus: 'mix' },
      { word: 'overlap', sentence: 11, chunks: ['o', 'ver', 'lap'], focus: 'lap' },
    ],
  },
  {
    passageId: p[1], title: 'A Cactus Is Ready for Dry Days', difficulty: 2,
    topic: 'cactus structures', purposeKind: 'describe',
    purpose: 'To describe how cactus stems, surfaces, spines, and roots help the plant live in dry places.',
    centralIdea: 'Several cactus structures collect, store, and conserve the limited water available in a dry habitat.',
    headings: ['A Stem That Stores', 'Surfaces That Save', 'Roots Ready for Rain'], sectionEnds: [5, 10],
    sentences: [
      'Many cactuses live where rain is scarce and the air is often dry.',
      'A cactus usually stores water in a thick green stem instead of in soft leaves.',
      'After rain, the stem can swell as it takes in more water.',
      'Folds or ribs along some stems allow the plant to expand without splitting.',
      'The green stem also carries out the food-making work that leaves do on many plants.',
      'A waxy outer layer slows the loss of water from the stem.',
      'On many cactuses, leaves have been changed into spines with very little surface area.',
      'Spines can cast small patches of shade and may discourage thirsty animals from biting the stem.',
      'The shapes and sizes of spines differ among cactus species.',
      'Some cactus flowers open for only part of a day or night.',
      'Many cactuses grow shallow roots that spread far from the stem.',
      'These roots can quickly absorb rain that wets only the top layer of soil.',
      'Other roots may reach deeper moisture, depending on the species and habitat.',
      'A garden label may list the scientific name of a cactus.',
      'Together, the stem, surface, spines, and roots help a cactus manage water between rains.',
    ],
    supportingDetails: [
      { sentence: 2, contribution: 'The thick stem stores water.', strength: 'strong' },
      { sentence: 3, contribution: 'The stem swells after taking in rainwater.', strength: 'secondary' },
      { sentence: 6, contribution: 'A waxy layer slows water loss.', strength: 'strong' },
      { sentence: 7, contribution: 'Spines have less water-losing surface than broad leaves.', strength: 'strong' },
      { sentence: 11, contribution: 'Wide shallow roots reach water over a large area.', strength: 'strong' },
      { sentence: 12, contribution: 'The roots quickly absorb brief rain near the surface.', strength: 'strong' },
    ],
    weakDetails: [
      { sentence: 10, explanation: 'Flower opening time is interesting but less useful for identifying the descriptive focus on water-managing structures.' },
      { sentence: 14, explanation: 'A garden label does not describe how the cactus lives through dry conditions.' },
    ],
    sectionContributions: [
      'The first section describes the thick expandable stem and its jobs.',
      'The middle section describes outer features that reduce water loss and protect the stem.',
      'The final section describes how different roots collect scarce water.',
    ],
    synthesis: 'Descriptions across the three sections develop the purpose by showing how each cactus structure helps manage water.',
    narrowPurpose: 'To describe when one cactus flower may open.',
    claimDistractor: 'To argue that every home should replace its plants with cactuses.',
    hotPrompt: 'Select the sentence that most clearly supports the author\'s purpose of describing a water-saving cactus feature.',
    hotCorrectSentence: 6, hotDistractorSentences: [1, 10, 14],
    support: [
      { word: 'cactuses', sentence: 1, chunks: ['cac', 'tus', 'es'], focus: 'cac' },
      { word: 'expand', sentence: 4, chunks: ['ex', 'pand'], focus: 'pand' },
      { word: 'waxy', sentence: 6, chunks: ['wax', 'y'], focus: 'wax' },
      { word: 'absorb', sentence: 12, chunks: ['ab', 'sorb'], focus: 'sorb' },
    ],
  },
  {
    passageId: p[2], title: 'Test the Soil Before Planting', difficulty: 3,
    topic: 'testing soil drainage', purposeKind: 'teach-about',
    purpose: 'To teach how a garden team can test soil drainage and use the results before planting.',
    centralIdea: 'A fair drainage test helps gardeners learn how quickly water moves through soil and plan suitable growing spaces.',
    headings: ['Prepare a Fair Test', 'Watch and Measure', 'Use What You Learn'], sectionEnds: [6, 12],
    sentences: [
      'Plants need water, but roots can be harmed when some soils stay soaked for too long.',
      'A garden team can test drainage before choosing a planting spot.',
      'First, the team marks two places that receive similar amounts of sun.',
      'At each place, students dig an identical hole with adult help.',
      'They measure each hole so its width and depth match the other one.',
      'A bright orange bucket makes the water easy to carry across the garden.',
      'The team fills both holes with water and lets that first water soak in.',
      'Then students refill the holes to the same marked level.',
      'They start a timer and record how far the water level drops after equal amounts of time.',
      'Using equal holes, water levels, and timing makes the comparison fair.',
      'If rain begins during one test, the team pauses and repeats both tests later.',
      'A chart keeps the measurements from the two places organized.',
      'Water that disappears very quickly may pass through sandy soil before roots can use much of it.',
      'Water that remains for a long time may signal tightly packed soil or a low spot.',
      'Gardeners can choose plants suited to the drainage they measured.',
      'They may also add organic material or use a raised bed when a site drains poorly.',
      'A green marker can show where the team plans to place the first row.',
      'The test does not predict every rainy day, but it gives the team useful evidence for planning.',
    ],
    supportingDetails: [
      { sentence: 4, contribution: 'Matching holes helps create a fair test.', strength: 'strong' },
      { sentence: 8, contribution: 'Equal refill levels keep the comparison consistent.', strength: 'strong' },
      { sentence: 9, contribution: 'Timed water-level records provide the needed measurements.', strength: 'strong' },
      { sentence: 12, contribution: 'A chart organizes results for comparison.', strength: 'secondary' },
      { sentence: 15, contribution: 'Gardeners use measured drainage to choose plants.', strength: 'strong' },
      { sentence: 16, contribution: 'The results can guide changes to a poorly draining site.', strength: 'strong' },
    ],
    weakDetails: [
      { sentence: 6, explanation: 'The bucket color is true but does not teach how to conduct or use the drainage test.' },
      { sentence: 17, explanation: 'The marker color is a minor planning detail rather than strong evidence of the author\'s instructional purpose.' },
    ],
    sectionContributions: [
      'The first section teaches how to prepare matching test sites.',
      'The middle section teaches how to measure drainage fairly and record results.',
      'The final section teaches how the measurements can guide planting decisions.',
    ],
    synthesis: 'Directions and explanations across the sections develop the teaching purpose from setup through measurement to a practical garden decision.',
    narrowPurpose: 'To teach why a bright bucket is easy to see in a garden.',
    claimDistractor: 'To persuade readers that only one kind of soil is good enough for gardens.',
    hotPrompt: 'Select the sentence that best shows the author teaching how to keep the drainage comparison fair.',
    hotCorrectSentence: 10, hotDistractorSentences: [1, 6, 17],
    support: [
      { word: 'drainage', sentence: 2, chunks: ['drain', 'age'], focus: 'drain' },
      { word: 'identical', sentence: 4, chunks: ['i', 'den', 'ti', 'cal'], focus: 'den' },
      { word: 'organized', sentence: 12, chunks: ['or', 'gan', 'ized'], focus: 'gan' },
      { word: 'predict', sentence: 18, chunks: ['pre', 'dict'], focus: 'dict' },
    ],
  },
  {
    passageId: p[3], title: 'Beam Bridges and Arch Bridges', difficulty: 3,
    topic: 'beam and arch bridges', purposeKind: 'compare',
    purpose: 'To compare how beam bridges and arch bridges support and transfer loads.',
    centralIdea: 'Beam and arch bridges both carry loads to supports, but their shapes direct the forces in different ways.',
    headings: ['A Beam Across Supports', 'A Curved Arch', 'Choosing a Design'], sectionEnds: [6, 12],
    sentences: [
      'Every bridge must carry its own weight along with people, vehicles, wind, or other loads.',
      'A beam bridge uses a mostly straight horizontal deck across supports.',
      'The supports may stand at the ends and at points under a longer deck.',
      'As a load pushes down, the beam bends a tiny amount and transfers force to those supports.',
      'Short beam bridges can use simple shapes and common building materials.',
      'Some beam bridges are painted bright colors so drivers can see them easily.',
      'An arch bridge uses a curved shape above or below the travel path.',
      'Loads press along the curve toward strong supports called abutments at both ends.',
      'The arch shape works especially well with materials that handle squeezing forces.',
      'Stone arches have lasted for many years when their blocks and supports remained sound.',
      'Modern arch bridges may use steel or concrete and can look very different from old stone arches.',
      'Birds sometimes rest on quiet bridge rails.',
      'Both bridge types need firm supports and careful plans for the loads they will carry.',
      'A beam may be practical for one distance, while an arch may suit another site or design goal.',
      'Engineers also consider ground conditions, available materials, cost, and space below the bridge.',
      'Neither shape is automatically best for every crossing.',
      'Both designs move loads away from the travel path and into supports connected to the ground.',
      'Their different shapes provide two solutions to the same basic bridge problem.',
    ],
    supportingDetails: [
      { sentence: 2, contribution: 'The beam section identifies a straight load-carrying shape.', strength: 'strong' },
      { sentence: 4, contribution: 'It explains how a beam transfers force to supports.', strength: 'strong' },
      { sentence: 7, contribution: 'The arch section identifies the contrasting curved shape.', strength: 'strong' },
      { sentence: 8, contribution: 'It explains how an arch directs loads toward end abutments.', strength: 'strong' },
      { sentence: 13, contribution: 'The final section states an important similarity: both need strong supports.', strength: 'strong' },
      { sentence: 14, contribution: 'The author contrasts situations in which each design may be useful.', strength: 'secondary' },
    ],
    weakDetails: [
      { sentence: 6, explanation: 'Paint color is true but does not help compare how the bridge shapes carry loads.' },
      { sentence: 12, explanation: 'Resting birds do not reveal the author\'s comparison purpose.' },
    ],
    sectionContributions: [
      'The first section explains the shape and force path of a beam bridge.',
      'The middle section explains the contrasting shape and force path of an arch bridge.',
      'The final section brings the designs together by comparing shared needs and different uses.',
    ],
    synthesis: 'Parallel explanations and direct comparisons across the sections develop the purpose by showing both similarities and differences in load support.',
    narrowPurpose: 'To compare the paint colors used on two bridges.',
    claimDistractor: 'To convince every town to replace beam bridges with arch bridges.',
    hotPrompt: 'Select the sentence that most clearly compares when the two bridge designs may be useful.',
    hotCorrectSentence: 14, hotDistractorSentences: [5, 6, 12],
    support: [
      { word: 'horizontal', sentence: 2, chunks: ['hor', 'i', 'zon', 'tal'], focus: 'zon' },
      { word: 'transfers', sentence: 4, chunks: ['trans', 'fers'], focus: 'trans' },
      { word: 'abutments', sentence: 8, chunks: ['a', 'but', 'ments'], focus: 'but' },
      { word: 'available', sentence: 15, chunks: ['a', 'vail', 'a', 'ble'], focus: 'vail' },
    ],
  },
  {
    passageId: p[4], title: 'Why Some Puddles Vanish First', difficulty: 3,
    topic: 'puddle evaporation', purposeKind: 'explain-why',
    purpose: 'To explain why puddles disappear at different speeds after rain.',
    centralIdea: 'Sunlight, moving air, humidity, puddle depth, and the surface below affect how quickly puddle water evaporates or drains.',
    headings: ['Energy from Sunlight', 'Air Above the Water', 'Shape and Surface Below'], sectionEnds: [7, 14],
    sentences: [
      'After a rainstorm, two puddles on the same playground may disappear hours apart.',
      'Liquid water can change into invisible water vapor and move into the air.',
      'This change is called evaporation.',
      'Water molecules move faster when they receive more thermal energy.',
      'A puddle in direct sunlight often warms more than one in deep shade.',
      'The warmer puddle may evaporate faster when other conditions are similar.',
      'A chalk circle around one puddle can help students notice its shrinking edge.',
      'Moving air carries some water vapor away from the space above a puddle.',
      'That movement can allow more liquid water to evaporate into the air.',
      'On a humid day, the air already contains a great deal of water vapor.',
      'Evaporation may then happen more slowly than it does in drier air at the same temperature.',
      'A breeze may affect an open puddle more than one sheltered beside a wall.',
      'A weather flag can show that air is moving across the playground.',
      'Sunlight and moving air can work together rather than acting as separate switches.',
      'A wide shallow puddle exposes more water surface for its amount of water than a deep narrow puddle.',
      'The shallow puddle may disappear sooner because more water touches the air.',
      'Some water also soaks through cracks or drains into porous ground.',
      'Water on solid pavement cannot soak in as easily as water over loose soil.',
      'A boot print may leave a small pattern beside the puddle.',
      'Depth, ground material, warmth, wind, and humidity can all change the time a puddle lasts.',
      'That is why one simple rule cannot predict which puddle will vanish first in every place.',
    ],
    supportingDetails: [
      { sentence: 5, contribution: 'Sunlight can warm one puddle more than another.', strength: 'strong' },
      { sentence: 9, contribution: 'Moving air carries vapor away and can support more evaporation.', strength: 'strong' },
      { sentence: 11, contribution: 'Humid air can slow evaporation.', strength: 'strong' },
      { sentence: 15, contribution: 'Puddle shape changes how much water is exposed to air.', strength: 'strong' },
      { sentence: 17, contribution: 'Drainage can remove water in addition to evaporation.', strength: 'strong' },
      { sentence: 20, contribution: 'The ending combines the conditions that explain different drying times.', strength: 'secondary' },
    ],
    weakDetails: [
      { sentence: 7, explanation: 'The chalk circle is an observation tool, not a cause of different evaporation speeds.' },
      { sentence: 19, explanation: 'A boot-print pattern is true but does not help explain why puddles disappear.' },
    ],
    sectionContributions: [
      'The first section explains how energy and warmth affect evaporation.',
      'The middle section explains how wind and humidity change the air above a puddle.',
      'The final section adds puddle shape and ground drainage, then combines the causes.',
    ],
    synthesis: 'Cause-and-effect details across all three sections develop the purpose by explaining several reasons puddle drying times differ.',
    narrowPurpose: 'To explain why students draw chalk circles around puddles.',
    claimDistractor: 'To argue that playgrounds should never have puddles after rain.',
    hotPrompt: 'Select the sentence that best explains why humid air can change a puddle\'s drying time.',
    hotCorrectSentence: 11, hotDistractorSentences: [7, 13, 19],
    support: [
      { word: 'invisible', sentence: 2, chunks: ['in', 'vis', 'i', 'ble'], focus: 'vis' },
      { word: 'evaporation', sentence: 3, chunks: ['e', 'vap', 'o', 'ra', 'tion'], focus: 'vap' },
      { word: 'humidity', sentence: 20, chunks: ['hu', 'mid', 'i', 'ty'], focus: 'mid' },
      { word: 'porous', sentence: 17, chunks: ['por', 'ous'], focus: 'por' },
    ],
    transfer: {
      text: 'A wet towel dries quickly on a sunny clothesline with a breeze. The same towel dries more slowly in a cool, still room where the air is humid.',
      purpose: 'To explain why the same wet towel can dry at different speeds.', topic: 'drying towels',
      centralIdea: 'Warmth, moving air, and humidity affect how quickly water leaves a wet towel.',
      unsupported: 'To convince everyone to dry every towel outdoors.',
      explanation: 'The author contrasts conditions and results to explain why drying speeds differ.',
    },
  },
  {
    passageId: p[5], title: 'A Pond Through Four Seasons', difficulty: 3,
    topic: 'seasonal changes in a pond', purposeKind: 'explain-change',
    purpose: 'To explain how a pond and its living things change across the four seasons.',
    centralIdea: 'Changes in light, temperature, water, and plant growth create different pond conditions during winter, spring, summer, and fall.',
    headings: ['Winter into Spring', 'Summer Activity', 'Fall Preparation'], sectionEnds: [8, 15],
    sentences: [
      'A pond remains a habitat all year, but its conditions do not stay the same.',
      'During a cold winter, ice may form across part of the surface.',
      'Water below the ice can remain liquid, allowing some animals to survive beneath it.',
      'Many pond plants grow slowly or rest while days are short and cold.',
      'As spring brings longer days and warmer air, surface ice melts.',
      'Rain and melting snow may raise the water level.',
      'Insects become more active, and frogs may lay eggs in shallow water.',
      'A numbered stake can help observers compare water depth from month to month.',
      'Strong summer sunlight supports rapid growth in many pond plants and algae.',
      'Leafy plants provide hiding places for young fish and insects.',
      'Warm water holds less dissolved oxygen than colder water can hold.',
      'Wind, plant activity, and flowing water can affect oxygen levels too.',
      'Animals may gather where shade or moving water creates suitable conditions.',
      'A wooden bench near the pond was painted green last year.',
      'Summer is often the busiest season for visible activity near the surface.',
      'In fall, shorter days and cooler temperatures slow plant growth.',
      'Leaves from nearby trees may land in the water and begin to break down.',
      'Some insects complete their life cycles, while other animals prepare for cold weather.',
      'Birds that migrate may stop to feed before continuing south.',
      'Plant stems and seeds can remain even after green leaves fade.',
      'The pond gradually returns to its colder winter conditions.',
      'Each seasonal stage changes the resources and challenges available to pond life.',
    ],
    supportingDetails: [
      { sentence: 2, contribution: 'Winter cold can create surface ice.', strength: 'strong' },
      { sentence: 5, contribution: 'Longer, warmer spring days melt the ice.', strength: 'strong' },
      { sentence: 9, contribution: 'Summer sunlight increases plant and algae growth.', strength: 'strong' },
      { sentence: 11, contribution: 'Warm summer water changes oxygen conditions.', strength: 'secondary' },
      { sentence: 16, contribution: 'Fall cooling slows plant growth.', strength: 'strong' },
      { sentence: 21, contribution: 'The pond moves back toward winter conditions.', strength: 'strong' },
    ],
    weakDetails: [
      { sentence: 8, explanation: 'The numbered stake is a study tool rather than a seasonal change in the pond itself.' },
      { sentence: 14, explanation: 'The bench color does not develop the explanation of pond changes.' },
    ],
    sectionContributions: [
      'The first section follows the pond from winter ice into spring growth and activity.',
      'The middle section explains summer plant growth, oxygen conditions, and animal activity.',
      'The final section shows fall slowing and the return toward winter.',
    ],
    synthesis: 'The chronological details across sections develop the purpose by following pond conditions and living things through a full yearly cycle.',
    narrowPurpose: 'To explain why one bench beside the pond was painted green.',
    claimDistractor: 'To persuade people that summer is the only useful pond season.',
    hotPrompt: 'Select the sentence that most clearly shows the pond changing from winter toward spring.',
    hotCorrectSentence: 5, hotDistractorSentences: [8, 14, 20],
    support: [
      { word: 'surface', sentence: 2, chunks: ['sur', 'face'], focus: 'sur' },
      { word: 'dissolved', sentence: 11, chunks: ['dis', 'solved'], focus: 'solved' },
      { word: 'migrate', sentence: 19, chunks: ['mi', 'grate'], focus: 'grate' },
      { word: 'gradually', sentence: 21, chunks: ['grad', 'u', 'al', 'ly'], focus: 'grad' },
    ],
    transfer: {
      text: 'A city tree grows buds in spring, forms a full green canopy in summer, drops colorful leaves in fall, and rests with bare branches in winter.',
      purpose: 'To explain how a city tree changes through the seasons.', topic: 'a city tree',
      centralIdea: 'A city tree has a different stage of growth and rest in each season.',
      unsupported: 'To convince cities to remove trees before winter.',
      explanation: 'The ordered seasonal details reveal an explanation of change over time.',
    },
  },
  {
    passageId: p[6], title: 'Water Waiting High Above Town', difficulty: 3,
    topic: 'how a water tower works', purposeKind: 'explain-how',
    purpose: 'To explain how a water tower stores and delivers water to buildings.',
    centralIdea: 'Pumps, an elevated tank, gravity, pipes, and controls work together to keep water moving when a community needs it.',
    headings: ['Pump Water Up', 'Let Gravity Help', 'Meet Changing Demand'], sectionEnds: [7, 14],
    sentences: [
      'A water tower is a large tank raised high above the ground.',
      'The tower does not make water; it stores water that has already been treated for use.',
      'Electric pumps push treated water through pipes toward the elevated tank.',
      'A level sensor helps the system detect when the tank needs more water.',
      'When the level is low, controls can signal pumps to refill the tank.',
      'When the level is high enough, the pumps can stop or send water elsewhere in the system.',
      'Some towers display a town name in large painted letters.',
      'The height of the tank gives stored water gravitational energy.',
      'When a faucet opens, water can move down through connected pipes.',
      'Gravity helps create pressure that pushes water toward homes, schools, and other buildings.',
      'Valves direct flow through different parts of the pipe network.',
      'The exact pressure also depends on height, pipe size, water use, and other system equipment.',
      'Workers measure pressure and inspect equipment to keep the system operating safely.',
      'A bird may perch on a railing near the top of a quiet tower.',
      'Water use often rises in the morning when many people prepare for the day.',
      'The stored water can help meet that busy demand without every pump changing speed at once.',
      'During quieter times, pumps can refill the tank for later use.',
      'The stored supply can also help during some power interruptions or emergencies, although every system has limits.',
      'Operators monitor water level, pressure, and water quality.',
      'The tower works as one part of a larger treatment and pipe system.',
      'By storing water high above town, the tower helps balance supply and keep water moving when it is needed.',
    ],
    supportingDetails: [
      { sentence: 3, contribution: 'Pumps move treated water up to the tank.', strength: 'strong' },
      { sentence: 4, contribution: 'A sensor helps control refilling.', strength: 'secondary' },
      { sentence: 9, contribution: 'Water moves downward when a faucet opens.', strength: 'strong' },
      { sentence: 10, contribution: 'Gravity helps provide pressure to buildings.', strength: 'strong' },
      { sentence: 16, contribution: 'Stored water helps meet busy demand.', strength: 'strong' },
      { sentence: 17, contribution: 'Pumps refill the tank during quieter times.', strength: 'strong' },
    ],
    weakDetails: [
      { sentence: 7, explanation: 'Painted town letters do not explain how the tower stores or delivers water.' },
      { sentence: 14, explanation: 'A perched bird is unrelated to the water-delivery system.' },
    ],
    sectionContributions: [
      'The first section explains how pumps and controls fill the elevated tank.',
      'The middle section explains how height, gravity, pipes, and valves deliver water.',
      'The final section explains how storage balances busy and quiet times.',
    ],
    synthesis: 'System details across the filling, delivery, and demand sections develop the purpose by tracing how stored water reaches buildings reliably.',
    narrowPurpose: 'To explain why some towers display a town name.',
    claimDistractor: 'To argue that every building should replace its pipes with a private water tower.',
    hotPrompt: 'Select the sentence that best explains how the tower\'s height helps deliver water.',
    hotCorrectSentence: 10, hotDistractorSentences: [7, 13, 14],
    support: [
      { word: 'elevated', sentence: 3, chunks: ['el', 'e', 'vat', 'ed'], focus: 'vat' },
      { word: 'sensor', sentence: 4, chunks: ['sen', 'sor'], focus: 'sen' },
      { word: 'gravitational', sentence: 8, chunks: ['grav', 'i', 'ta', 'tion', 'al'], focus: 'grav' },
      { word: 'interruptions', sentence: 18, chunks: ['in', 'ter', 'rup', 'tions'], focus: 'rup' },
    ],
    transfer: {
      text: 'A grain silo receives dry grain from a conveyor, stores it above the ground, and releases it through a lower opening when trucks are ready to load.',
      purpose: 'To explain how a grain silo stores and releases grain.', topic: 'a grain silo',
      centralIdea: 'A conveyor, raised storage space, and lower opening work together to manage grain.',
      unsupported: 'To persuade every farm to build the tallest possible silo.',
      explanation: 'The details trace how parts of the silo system receive, hold, and release grain.',
    },
  },
]

export const purposeDevelopmentRecords: readonly PurposeDevelopmentRecord[] = records

export const purposeDevelopmentPassages: Passage[] = records.map((record) => {
  const sentences = record.sentences.map((text, index) => ({ sentenceId: purposeSentenceId(record.passageId, index + 1), sentenceNumber: index + 1, text }))
  const ranges: Array<[number, number]> = [[1, record.sectionEnds[0]], [record.sectionEnds[0] + 1, record.sectionEnds[1]], [record.sectionEnds[1] + 1, sentences.length]]
  const headingFeatures: InformationalFeature[] = record.headings.map((heading, index) => ({
    featureId: featureId(record.passageId, `heading-${index + 1}`), kind: 'heading', sectionId: purposeSectionId(record.passageId, index + 1), text: heading,
  }))
  const glossaryFeature: InformationalFeature = {
    featureId: featureId(record.passageId, 'glossary'), kind: 'glossary', entries: [{
      entryId: `${featureId(record.passageId, 'glossary')}-entry`, term: record.support[0].word,
      definition: `a useful word from this informational text about ${record.topic}`,
    }],
  }
  const sidebarFeature: InformationalFeature = {
    featureId: featureId(record.passageId, 'sidebar'), kind: 'sidebar', title: 'Purpose Detective Note',
    text: 'Notice which details the author chose and how each section helps readers understand the topic.',
  }
  return {
    passageIdentifier: record.passageId, title: record.title, contentKind: 'informational', passageText: record.sentences.join(' '), sentences,
    informationalStructure: {
      titleFeatureId: featureId(record.passageId, 'title'),
      sections: ranges.map(([start, end], index) => ({
        sectionId: purposeSectionId(record.passageId, index + 1), headingFeatureId: featureId(record.passageId, `heading-${index + 1}`),
        sentenceIds: sentences.slice(start - 1, end).map((sentence) => sentence.sentenceId),
        featureIds: index === 2 ? [featureId(record.passageId, 'glossary'), featureId(record.passageId, 'sidebar')] : [],
      })),
      features: [{ featureId: featureId(record.passageId, 'title'), kind: 'title', text: record.title }, ...headingFeatures, glossaryFeature, sidebarFeature],
    },
    genre: 'informational', gradeBand: 3, readingContext: 'Grade 3 Information Detectives author-purpose practice',
    reviewStatus: 'DRAFT', contentVersion: PURPOSE_DEVELOPMENT_VERSION,
    wordSupportTargets: record.support.map((support) => buildSupportTarget(record, support)),
  }
})

export const purposeDevelopmentGuides: AuthorPurposeGuide[] = records.map((record) => {
  const sectionForSentence = (sentence: number) => sentence <= record.sectionEnds[0] ? 1 : sentence <= record.sectionEnds[1] ? 2 : 3
  const supportingDetails = record.supportingDetails.map((detail, index) => ({
    detailId: `${record.passageId}-supporting-${index + 1}`, sectionId: purposeSectionId(record.passageId, sectionForSentence(detail.sentence)),
    evidenceIds: [purposeSentenceId(record.passageId, detail.sentence)], contributionStatement: detail.contribution, strength: detail.strength,
  }))
  const weakDetails = record.weakDetails.map((detail, index) => ({
    detailId: `${record.passageId}-weak-${index + 1}`, sectionId: purposeSectionId(record.passageId, sectionForSentence(detail.sentence)),
    evidenceIds: [purposeSentenceId(record.passageId, detail.sentence)], explanation: detail.explanation,
  }))
  return {
    passageId: record.passageId, topicLabel: record.topic, purposeKind: record.purposeKind,
    specificPurposeStatement: record.purpose,
    purposeEvidenceIds: supportingDetails.flatMap((detail) => detail.evidenceIds), secondaryDetailIds: weakDetails.flatMap((detail) => detail.evidenceIds),
    supportingDetails, weakOrNonDiagnosticDetails: weakDetails,
    sectionContributions: record.sectionContributions.map((contributionStatement, index) => ({
      sectionId: purposeSectionId(record.passageId, index + 1), contributionStatement,
      evidenceIds: supportingDetails.filter((detail) => detail.sectionId === purposeSectionId(record.passageId, index + 1)).flatMap((detail) => detail.evidenceIds),
    })),
    synthesisStatement: record.synthesis, reviewStatus: 'DRAFT', contentVersion: PURPOSE_DEVELOPMENT_VERSION,
  }
})

function buildSupportTarget(record: PurposeDevelopmentRecord, support: SupportPlan): WordSupportTarget {
  const text = record.sentences[support.sentence - 1]
  const index = text.toLowerCase().indexOf(support.word.toLowerCase())
  const surfaceWord = index >= 0 ? text.slice(index, index + support.word.length) : support.word
  const focusIndex = surfaceWord.toLowerCase().indexOf(support.focus.toLowerCase())
  return {
    targetId: `${record.passageId}-support-${support.word.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    passageId: record.passageId, sentenceId: purposeSentenceId(record.passageId, support.sentence), surfaceWord,
    focusParts: focusIndex < 0 ? [{ text: surfaceWord, emphasis: true }] : [
      { text: surfaceWord.slice(0, focusIndex), emphasis: false },
      { text: surfaceWord.slice(focusIndex, focusIndex + support.focus.length), emphasis: true },
      { text: surfaceWord.slice(focusIndex + support.focus.length), emphasis: false },
    ].filter((part) => part.text.length > 0),
    displayChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    spokenChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    blendSpeechText: surfaceWord, wholeWordSpeechText: surfaceWord, sentenceSpeechText: text,
    reviewStatus: 'DRAFT', contentVersion: PURPOSE_DEVELOPMENT_VERSION,
  }
}
