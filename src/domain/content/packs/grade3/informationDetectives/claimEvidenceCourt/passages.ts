import type { InformationalFeature } from '../../../../informationalTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import type { AuthorClaimGuide, AuthorClaimKind, ClaimEvidenceKind } from '../../../contentPackTypes'
import { CLAIM_EVIDENCE_PASSAGE_IDS, CLAIM_EVIDENCE_VERSION } from './ids'

interface SupportPlan { word: string; sentence: number; chunks: string[]; focus: string }
interface ReasonPlan { sentence: number; evidenceSentences: [number, ...number[]]; connection: string }
interface EvidencePlan { sentence: number; kind: ClaimEvidenceKind; reasonIndexes: [number, ...number[]]; connection: string; strength: 'strong' | 'secondary' }
interface WeakPlan { sentence: number; explanation: string }
interface TransferPlan { text: string; claim: string; topic: string; centralIdea: string; purpose: string; fact: string; explanation: string }

export interface ClaimEvidenceRecord {
  passageId: string
  title: string
  difficulty: 3 | 4
  topic: string
  centralIdea: string
  purpose: string
  claimKind: AuthorClaimKind
  claim: string
  claimSentences: [number, ...number[]]
  headings: [string, string, string]
  sectionEnds: [number, number]
  sentences: string[]
  reasons: [ReasonPlan, ReasonPlan, ...ReasonPlan[]]
  evidence: [EvidencePlan, EvidencePlan, EvidencePlan, ...EvidencePlan[]]
  weakDetails: [WeakPlan, ...WeakPlan[]]
  synthesis: string
  hotPrompt: string
  hotCorrectSentence: number
  hotDistractorSentences: [number, number, number]
  support: [SupportPlan, SupportPlan, SupportPlan, SupportPlan]
  transfer?: TransferPlan
}

const p = CLAIM_EVIDENCE_PASSAGE_IDS
export const claimSentenceId = (passageId: string, number: number) => `${passageId}-sentence-${number}`
export const claimSectionId = (passageId: string, number: number) => `${passageId}-section-${number}`
const featureId = (passageId: string, key: string) => `${passageId}-feature-${key}`

const records: ClaimEvidenceRecord[] = [
  {
    passageId: p[0], title: 'A Native Flower Strip for the Garden', difficulty: 3,
    topic: 'native flowering plants in a school garden',
    centralIdea: 'Native flowers can provide food and shelter for pollinators during different parts of the growing season.',
    purpose: 'To explain why native flowering plants would improve a school garden.', claimKind: 'recommendation',
    claim: 'The school garden should include a strip of native flowering plants.', claimSentences: [2],
    headings: ['A Garden Recommendation', 'Food Across the Season', 'Evidence from a Sample Count'], sectionEnds: [5, 10],
    sentences: [
      'A garden team is deciding what to plant along an empty sunny edge.',
      'The school garden should include a strip of native flowering plants.',
      'One reason is that native flowers can provide nectar and pollen for local pollinators.',
      'Many pollinators move pollen while visiting flowers for food.',
      'The sample garden plan includes purple, yellow, and white blooms.',
      'A second reason is that a variety of native plants can bloom at different times.',
      'Early, middle, and late bloom periods can make food available across more of the growing season.',
      'The planning chart lists one native flower for each of those three bloom periods.',
      'That comparison shows why a mixed strip can offer food longer than a single short-blooming plant.',
      'The wooden border in the drawing is painted green.',
      'The article uses a fictional three-day observation count to test the recommendation.',
      'The sample chart recorded bees or butterflies at all three native flower groups during the morning counts.',
      'It recorded no visits at the nearby empty soil during those same count periods.',
      'Those observations support the claim because they show the planned flowers could provide useful pollinator stops.',
    ],
    reasons: [
      { sentence: 3, evidenceSentences: [4, 12], connection: 'Pollinator visits show that the flowers can provide useful food sources.' },
      { sentence: 6, evidenceSentences: [7, 8, 9], connection: 'Different bloom periods support the recommendation by extending when food may be available.' },
    ],
    evidence: [
      { sentence: 4, kind: 'fact', reasonIndexes: [1], connection: 'The fact explains why flower visits matter to pollinators and plants.', strength: 'secondary' },
      { sentence: 12, kind: 'observation', reasonIndexes: [1], connection: 'The sample visits show pollinators using each native flower group.', strength: 'strong' },
      { sentence: 8, kind: 'example', reasonIndexes: [2], connection: 'The three planned bloom periods show how the recommendation could extend available food.', strength: 'strong' },
      { sentence: 9, kind: 'comparison', reasonIndexes: [2], connection: 'The comparison explains why a mixture can serve pollinators longer than one short-blooming plant.', strength: 'strong' },
      { sentence: 13, kind: 'result', reasonIndexes: [1], connection: 'The empty-soil result makes the observed flower visits more meaningful.', strength: 'secondary' },
    ],
    weakDetails: [{ sentence: 10, explanation: 'The border color is true in the plan but does not support planting native flowers.' }],
    synthesis: 'The two reasons and their evidence connect the flower strip claim to longer food availability and actual sample visits.',
    hotPrompt: 'Select the sentence that states the author’s claim.', hotCorrectSentence: 2, hotDistractorSentences: [1, 4, 10],
    support: [
      { word: 'native', sentence: 2, chunks: ['na', 'tive'], focus: 'tive' },
      { word: 'pollinators', sentence: 3, chunks: ['pol', 'li', 'na', 'tors'], focus: 'pol' },
      { word: 'variety', sentence: 6, chunks: ['va', 'ri', 'e', 'ty'], focus: 'ri' },
      { word: 'recorded', sentence: 12, chunks: ['re', 'cord', 'ed'], focus: 'cord' },
    ],
  },
  {
    passageId: p[1], title: 'Signs That Can Serve Again', difficulty: 3,
    topic: 'signs for yearly school events',
    centralIdea: 'Reusable signs can be stored, updated, and used again, while disposable paper signs are replaced after one event.',
    purpose: 'To explain why reusable signs would work well for yearly school events.', claimKind: 'best-choice',
    claim: 'Reusable signs are the better choice for yearly school events than disposable paper signs.', claimSentences: [4],
    headings: ['The Choice', 'A Sample Durability Test', 'Use Them Next Year'], sectionEnds: [5, 11],
    sentences: [
      'A planning team needs direction signs for a family reading night held each year.',
      'The signs must be readable in hallways and near a covered outdoor entrance.',
      'This article uses a fictional planning test rather than records from a real school.',
      'Reusable signs are the better choice for yearly school events than disposable paper signs.',
      'One reason is that sturdy reusable signs can handle repeated setup and storage.',
      'In the sample test, twelve laminated signs and twelve plain paper signs were displayed for two practice days.',
      'After a light water mist at the covered entrance, all twelve laminated signs remained flat and readable.',
      'Only seven plain paper signs remained flat enough to read without being replaced.',
      'The comparison supports using the sturdier signs more than once.',
      'One sample sign used blue letters, while another used red letters.',
      'Letter color did not affect whether the material stayed flat.',
      'A second reason is that reusable signs can reduce the number of new signs made for the next event.',
      'The team can store the signs in one labeled box and replace only the event date card.',
      'The sample plan reuses the same arrows, room names, and welcome messages the following year.',
      'That result means fewer complete signs need to be printed and assembled again.',
    ],
    reasons: [
      { sentence: 5, evidenceSentences: [6, 7, 8, 9], connection: 'The durability comparison shows that reusable signs can survive repeated use better.' },
      { sentence: 12, evidenceSentences: [13, 14, 15], connection: 'Storage and replaceable date cards make yearly reuse practical.' },
    ],
    evidence: [
      { sentence: 6, kind: 'measurement', reasonIndexes: [1], connection: 'Equal groups make the material comparison easy to understand.', strength: 'secondary' },
      { sentence: 7, kind: 'result', reasonIndexes: [1], connection: 'All laminated signs staying readable supports repeated use.', strength: 'strong' },
      { sentence: 8, kind: 'comparison', reasonIndexes: [1], connection: 'The lower plain-paper result strengthens the best-choice claim.', strength: 'strong' },
      { sentence: 13, kind: 'example', reasonIndexes: [2], connection: 'The labeled-box and date-card example shows how signs can be prepared for another year.', strength: 'strong' },
      { sentence: 15, kind: 'result', reasonIndexes: [2], connection: 'Needing fewer complete replacements supports choosing reusable signs.', strength: 'strong' },
    ],
    weakDetails: [{ sentence: 10, explanation: 'Letter colors do not show whether a sign can be reused.' }],
    synthesis: 'Durability results and reuse examples provide evidence for both reasons and support the claim that reusable signs are the better yearly choice.',
    hotPrompt: 'Select the strongest sample result supporting the reason that reusable signs handle repeated use.', hotCorrectSentence: 7, hotDistractorSentences: [2, 10, 13],
    support: [
      { word: 'reusable', sentence: 4, chunks: ['re', 'us', 'a', 'ble'], focus: 'us' },
      { word: 'disposable', sentence: 4, chunks: ['dis', 'pos', 'a', 'ble'], focus: 'pos' },
      { word: 'laminated', sentence: 6, chunks: ['lam', 'i', 'nat', 'ed'], focus: 'nat' },
      { word: 'assembled', sentence: 15, chunks: ['as', 'sem', 'bled'], focus: 'sem' },
    ],
  },
  {
    passageId: p[2], title: 'A Rain Barrel for the Demonstration Garden', difficulty: 4,
    topic: 'using a covered rain barrel in a school demonstration garden',
    centralIdea: 'A properly installed rain barrel can store roof runoff for later plant watering while directing extra water safely away.',
    purpose: 'To explain how a covered rain barrel could help a demonstration garden.', claimKind: 'evaluation',
    claim: 'A covered rain barrel is a practical tool for watering a school demonstration garden.', claimSentences: [1],
    headings: ['Store Water for Later', 'A Safe Sample Setup', 'Use and Check the System'], sectionEnds: [6, 12],
    sentences: [
      'A covered rain barrel is a practical tool for watering a school demonstration garden.',
      'The first reason is that it can store some roof runoff for later non-drinking garden use.',
      'Rain moving through a downspout would otherwise continue toward the ground or a drain.',
      'In this article’s fictional demonstration, a marked barrel collected eighteen liters during a short modeled rainfall.',
      'That amount filled three six-liter watering cans after the model ended.',
      'The barrel in the diagram is dark green, although color does not determine how it works.',
      'The second reason is that a careful setup can control how water enters, leaves, and overflows.',
      'An adult secures a close-fitting lid and screen so leaves and insects stay out.',
      'A low spigot lets an adult fill a watering can without tipping the barrel.',
      'An overflow hose directs extra water away from the building foundation.',
      'The sample observation showed water entering through the screened opening while larger leaf pieces stayed above it.',
      'The barrel is labeled “Not for Drinking” because the stored runoff is intended only for the garden task.',
      'After dry weather, the stored water can be carried to garden beds that need it.',
      'The demonstration team checks the lid, screen, hose, and spigot before each use.',
      'If the barrel or its supports are damaged, an adult stops using the system until it is repaired.',
      'The measured storage result and the controlled setup support the claim that the barrel is practical for this limited job.',
    ],
    reasons: [
      { sentence: 2, evidenceSentences: [3, 4, 5], connection: 'Measured stored water shows that runoff can be saved for later garden use.' },
      { sentence: 7, evidenceSentences: [8, 9, 10, 11], connection: 'The lid, screen, spigot, and overflow hose show that the system can be managed carefully.' },
    ],
    evidence: [
      { sentence: 4, kind: 'measurement', reasonIndexes: [1], connection: 'The eighteen-liter sample measurement shows useful storage for the garden task.', strength: 'strong' },
      { sentence: 5, kind: 'result', reasonIndexes: [1], connection: 'Filling three watering cans shows a practical use for the stored amount.', strength: 'strong' },
      { sentence: 8, kind: 'fact', reasonIndexes: [2], connection: 'The secured lid and screen explain how the opening is controlled.', strength: 'strong' },
      { sentence: 10, kind: 'example', reasonIndexes: [2], connection: 'The overflow hose is a concrete example of directing extra water.', strength: 'secondary' },
      { sentence: 11, kind: 'observation', reasonIndexes: [2], connection: 'The sample observation shows the screen performing its stated job.', strength: 'strong' },
    ],
    weakDetails: [{ sentence: 6, explanation: 'The barrel color is unrelated to whether it stores and controls water effectively.' }],
    synthesis: 'Measurements, results, facts, examples, and an observation provide evidence for the storage and controlled-setup reasons supporting the practical-tool claim.',
    hotPrompt: 'Select the measurement that most directly supports storing rainwater for later garden use.', hotCorrectSentence: 4, hotDistractorSentences: [3, 6, 12],
    support: [
      { word: 'practical', sentence: 1, chunks: ['prac', 'ti', 'cal'], focus: 'prac' },
      { word: 'collected', sentence: 4, chunks: ['col', 'lect', 'ed'], focus: 'lect' },
      { word: 'overflow', sentence: 10, chunks: ['o', 'ver', 'flow'], focus: 'flow' },
      { word: 'damaged', sentence: 15, chunks: ['dam', 'aged'], focus: 'dam' },
    ],
  },
  {
    passageId: p[3], title: 'Shade First for the Play Area', difficulty: 4,
    topic: 'improving a sunny school play area',
    centralIdea: 'A shade sail could cool one resting space and make the area more useful during sunny parts of the day.',
    purpose: 'To explain why a shade sail deserves attention before decorative play-area changes.', claimKind: 'priority',
    claim: 'Adding a shade sail should be the first improvement made to the sunny play area.', claimSentences: [6],
    headings: ['What the Sample Map Shows', 'A Cooler Resting Place', 'Compare the Possible Projects'], sectionEnds: [6, 12],
    sentences: [
      'A fictional planning map shows a play area with climbing equipment, two benches, and very little midday shade.',
      'The team is comparing a shade sail, a painted wall picture, and a new set of decorative flags.',
      'All three projects could change how the space looks or feels.',
      'The map marks the benches beside the area used for quiet breaks and water bottles.',
      'A color key shows that direct sun reaches both benches during the sample noon period.',
      'Adding a shade sail should be the first improvement made to the sunny play area.',
      'One reason is that shade can create a cooler resting place during bright midday conditions.',
      'In this article’s sample surface test, the shaded model bench measured nine degrees cooler than the model bench under the lamp.',
      'The same thermometer and equal testing time were used for both model benches.',
      'That comparison supports placing shade above the real bench area rather than changing only its decoration.',
      'The sample sail fabric is teal, but another color could perform the same shading job.',
      'A wall picture might brighten the view without blocking direct sunlight from the benches.',
      'A second reason is that a shade sail serves the resting area during many ordinary visits.',
      'The observation schedule marks the bench area as used during four of the five sample activity periods.',
      'Decorative flags would move in the breeze, but they would cast only narrow changing shadows.',
      'The proposed sail covers both benches while leaving the climbing path clear.',
      'That result connects the improvement to a repeated use of the space instead of a one-time display.',
      'The model comparison and activity observations make shade the strongest first priority among the three choices.',
    ],
    reasons: [
      { sentence: 7, evidenceSentences: [8, 9, 10], connection: 'The controlled temperature comparison shows that shade can make the resting surface cooler.' },
      { sentence: 13, evidenceSentences: [14, 16, 17], connection: 'Repeated bench use and full coverage show that the sail serves an everyday need.' },
    ],
    evidence: [
      { sentence: 8, kind: 'measurement', reasonIndexes: [1], connection: 'The nine-degree sample difference gives measured support for the cooling reason.', strength: 'strong' },
      { sentence: 9, kind: 'fact', reasonIndexes: [1], connection: 'Matching tools and time make the sample comparison more useful.', strength: 'secondary' },
      { sentence: 10, kind: 'comparison', reasonIndexes: [1], connection: 'The model comparison connects shade, rather than decoration, to a cooler bench.', strength: 'strong' },
      { sentence: 14, kind: 'observation', reasonIndexes: [2], connection: 'Frequent sample use supports improving the resting area first.', strength: 'strong' },
      { sentence: 16, kind: 'result', reasonIndexes: [2], connection: 'Covering both benches while preserving the path shows useful placement.', strength: 'strong' },
    ],
    weakDetails: [{ sentence: 11, explanation: 'Fabric color does not determine whether the sail should be the first improvement.' }],
    synthesis: 'Temperature measurements, a controlled comparison, use observations, and coverage results serve as evidence for both reasons supporting the priority claim.',
    hotPrompt: 'Select the result that best supports the reason that the shade sail would serve the resting area.', hotCorrectSentence: 16, hotDistractorSentences: [3, 11, 15],
    support: [
      { word: 'decorative', sentence: 2, chunks: ['dec', 'o', 'ra', 'tive'], focus: 'ra' },
      { word: 'improvement', sentence: 6, chunks: ['im', 'prove', 'ment'], focus: 'prove' },
      { word: 'thermometer', sentence: 9, chunks: ['ther', 'mom', 'e', 'ter'], focus: 'mom' },
      { word: 'proposed', sentence: 16, chunks: ['pro', 'posed'], focus: 'posed' },
    ],
  },
  {
    passageId: p[4], title: 'Make Recycling Directions Easier to Follow', difficulty: 4,
    topic: 'sorting materials at a school recycling station',
    centralIdea: 'Matching colors, words, and pictures can help people place common materials in the intended recycling containers.',
    purpose: 'To support a clearer recycling-station design with repeated visual sorting clues.', claimKind: 'proposed-action',
    claim: 'The school should add color-coded labels with words and pictures to its recycling station.', claimSentences: [2],
    headings: ['A Clear Proposed Action', 'Results from a Practice Sort', 'More Than Color Alone'], sectionEnds: [7, 14],
    sentences: [
      'A recycling station works best when its directions are quick to notice and easy to understand.',
      'The school should add color-coded labels with words and pictures to its recycling station.',
      'One reason is that matching visual clues can help students find the intended container for each material.',
      'A blue paper label shows a sheet icon and the word Paper.',
      'A gray metal label shows a can icon and the word Cans.',
      'A green container in the sample drawing stands beside a wall clock.',
      'The clock color does not explain where any material belongs.',
      'This article uses a fictional practice sort with thirty clean sample items.',
      'With plain identical labels, seventeen items were placed in the intended containers on the first try.',
      'With color, words, and pictures together, twenty-seven items were placed correctly on the first try.',
      'The ten-item improvement is a result supporting the clearer-label proposal.',
      'Observers also recorded fewer pauses when the combined labels were used.',
      'The measurements do not prove that color alone caused every correct choice.',
      'They do show that the full label system worked better in this sample than the plain labels.',
      'A second reason is that words and pictures keep the directions understandable without depending only on color.',
      'A reader who does not notice the color can still match the word Paper or the drawing of a sheet.',
      'The same repeated layout can be used on the station sign, each opening, and the cleanup chart.',
      'That example shows how several clues can point to the same sorting category.',
      'The proposal combines color with readable text and pictures instead of using color as the only direction.',
      'The sample results and accessible label design support making the recycling station easier to use.',
    ],
    reasons: [
      { sentence: 3, evidenceSentences: [9, 10, 11, 12, 14], connection: 'The practice-sort results show that matching visual clues improved first-try sorting in the sample.' },
      { sentence: 15, evidenceSentences: [16, 17, 18, 19], connection: 'Words and pictures provide directions even when color is not noticed.' },
    ],
    evidence: [
      { sentence: 9, kind: 'measurement', reasonIndexes: [1], connection: 'The plain-label result creates a baseline for comparison.', strength: 'secondary' },
      { sentence: 10, kind: 'measurement', reasonIndexes: [1], connection: 'The higher combined-label count supports the clearer-label claim.', strength: 'strong' },
      { sentence: 11, kind: 'result', reasonIndexes: [1], connection: 'The ten-item improvement states the practical result of the sample change.', strength: 'strong' },
      { sentence: 12, kind: 'observation', reasonIndexes: [1], connection: 'Fewer pauses provide another observed sign that the labels were easier to use.', strength: 'secondary' },
      { sentence: 16, kind: 'example', reasonIndexes: [2], connection: 'The word and picture example shows how directions remain available beyond color.', strength: 'strong' },
      { sentence: 18, kind: 'example', reasonIndexes: [2], connection: 'Repeated clues across the station show how the proposed system can stay consistent.', strength: 'strong' },
    ],
    weakDetails: [{ sentence: 6, explanation: 'The nearby clock and container color do not explain how the label system improves sorting.' }],
    synthesis: 'Practice measurements and observations provide evidence for the first reason, while text-and-picture examples support the second reason and together strengthen the proposed label claim.',
    hotPrompt: 'Select the practice-sort result that most strongly supports adding the combined labels.', hotCorrectSentence: 10, hotDistractorSentences: [6, 8, 13],
    support: [
      { word: 'recycling', sentence: 1, chunks: ['re', 'cy', 'cling'], focus: 'cy' },
      { word: 'intended', sentence: 3, chunks: ['in', 'tend', 'ed'], focus: 'tend' },
      { word: 'identical', sentence: 9, chunks: ['i', 'den', 'ti', 'cal'], focus: 'den' },
      { word: 'accessible', sentence: 20, chunks: ['ac', 'cess', 'i', 'ble'], focus: 'cess' },
    ],
    transfer: {
      text: 'A supply cabinet has three identical drawers. In a sample cleanup, picture-and-word labels helped students return more tools correctly than blank drawer fronts did. The cabinet should use picture-and-word labels.',
      claim: 'The cabinet should use picture-and-word labels.', topic: 'organizing a supply cabinet',
      centralIdea: 'Labels can show where classroom tools belong.', purpose: 'To explain why labels can improve cabinet cleanup.',
      fact: 'The cabinet has three drawers.', explanation: 'The explicit proposed action is supported by the sample comparison rather than by the topic or a neutral fact.',
    },
  },
  {
    passageId: p[5], title: 'Walk Together to the Nearby Library', difficulty: 4,
    topic: 'traveling from a community center to a nearby library',
    centralIdea: 'The mapped route is short, has continuous sidewalks, and can be traveled as one supervised group.',
    purpose: 'To explain why an adult-led walking group fits the specific library route described in the article.', claimKind: 'best-choice',
    claim: 'For this short library route, an adult-led walking group is the best choice for the class visit.', claimSentences: [5],
    headings: ['Study the Specific Route', 'Compare the Travel Plans', 'Keep the Group Together'], sectionEnds: [7, 14],
    sentences: [
      'A fictional community-center class is planning a visit to a branch library.',
      'The choice in this article applies only to the mapped route and is not a rule for every trip.',
      'The map measures the route at four tenths of a mile from door to door.',
      'A sidewalk runs along the full route, with one marked crossing controlled by a walk signal.',
      'For this short library route, an adult-led walking group is the best choice for the class visit.',
      'One reason is that the route is short and has a continuous walking path.',
      'The map details directly support traveling the distance on foot with adult supervision.',
      'The article compares walking with using a bus for the same short route.',
      'The sample schedule gives the walking group twelve minutes for travel and the bus plan ten minutes after boarding.',
      'The bus plan also requires a separate eight-minute loading and safety-check period before departure.',
      'In the full sample schedule, walking takes less total trip time for this particular route.',
      'The bus seats in the diagram are shown in blue.',
      'Seat color does not help decide which travel plan fits the route.',
      'The comparison supports walking here, but a longer route or missing sidewalk could lead to a different choice.',
      'A second reason is that an adult-led group can follow one coordinated crossing plan.',
      'In the fictional practice walk, the group stopped together at the marked corner and crossed only after the walk signal appeared.',
      'The observation record shows that every practice participant stayed between the lead and trailing adults.',
      'The plan assigns one adult to the front, one to the back, and another to check the middle of the group.',
      'Those roles and observations support the supervised walking plan for the specific short route.',
      'The distance, sidewalk, schedule comparison, and coordinated practice provide reasons and evidence for the claim.',
    ],
    reasons: [
      { sentence: 6, evidenceSentences: [3, 4, 9, 10, 11, 14], connection: 'The mapped distance, continuous sidewalk, and total-time comparison support walking on this specific route.' },
      { sentence: 15, evidenceSentences: [16, 17, 18, 19], connection: 'The practice observations and adult positions support keeping the group coordinated.' },
    ],
    evidence: [
      { sentence: 3, kind: 'measurement', reasonIndexes: [1], connection: 'The four-tenths-mile measurement establishes that the described route is short.', strength: 'strong' },
      { sentence: 4, kind: 'fact', reasonIndexes: [1], connection: 'The continuous sidewalk and signal crossing describe a usable walking path.', strength: 'strong' },
      { sentence: 11, kind: 'comparison', reasonIndexes: [1], connection: 'The full schedule comparison supports walking for this route without claiming it is always best.', strength: 'strong' },
      { sentence: 16, kind: 'observation', reasonIndexes: [2], connection: 'The coordinated stop-and-cross observation supports the supervision plan.', strength: 'strong' },
      { sentence: 17, kind: 'result', reasonIndexes: [2], connection: 'Everyone remaining within the adult positions is a result supporting group coordination.', strength: 'strong' },
      { sentence: 18, kind: 'example', reasonIndexes: [2], connection: 'The assigned adult roles show how supervision would be organized.', strength: 'secondary' },
    ],
    weakDetails: [{ sentence: 12, explanation: 'The seat color is unrelated to route distance, travel time, or supervision.' }],
    synthesis: 'Route facts, measurements, a travel-time comparison, and supervised-practice observations give evidence for both reasons supporting the route-specific best-choice claim.',
    hotPrompt: 'Select the sentence that gives the full schedule result supporting walking for this route.', hotCorrectSentence: 11, hotDistractorSentences: [1, 12, 13],
    support: [
      { word: 'controlled', sentence: 4, chunks: ['con', 'trolled'], focus: 'trolled' },
      { word: 'supervision', sentence: 7, chunks: ['su', 'per', 'vi', 'sion'], focus: 'vi' },
      { word: 'coordinated', sentence: 15, chunks: ['co', 'or', 'di', 'nat', 'ed'], focus: 'nat' },
      { word: 'participant', sentence: 17, chunks: ['par', 'tic', 'i', 'pant'], focus: 'tic' },
    ],
    transfer: {
      text: 'A nature center has a flat half-mile loop with signs at every turn. A sample schedule shows the loop fits the visit time, and adults can stand at the front and back. The group should use the marked loop for its short hike.',
      claim: 'The group should use the marked loop for its short hike.', topic: 'a nature-center walking loop',
      centralIdea: 'The loop is short, marked, and easy to supervise.', purpose: 'To explain why the marked loop fits a short group hike.',
      fact: 'The loop is half a mile long.', explanation: 'The recommended action is the claim, and the route details supply evidence for it.',
    },
  },
  {
    passageId: p[6], title: 'A Return Cart Beside the Hallway', difficulty: 4,
    topic: 'returning shared library books from classroom hallways',
    centralIdea: 'A labeled return cart could provide one visible collection place and help library helpers organize books before shelving.',
    purpose: 'To explain why a labeled return cart could improve the shared-book return process.', claimKind: 'proposed-action',
    claim: 'The library should place a labeled return cart beside the classroom hallway.', claimSentences: [2, 20],
    headings: ['One Visible Return Place', 'Results from a Mock Week', 'Organize Before Shelving'], sectionEnds: [7, 14],
    sentences: [
      'Shared library books sometimes travel from the library to several classroom reading baskets.',
      'The library should place a labeled return cart beside the classroom hallway.',
      'One reason is that a single visible cart can give readers a consistent place to return shared books.',
      'The cart sign in the drawing uses the words Library Returns and a large book picture.',
      'The sign can be read from both directions along the hallway.',
      'A small paper star decorates one corner of the sample sign.',
      'The star is cheerful, but it does not show whether the return system works.',
      'This article describes a fictional mock week using cardboard book cards instead of real student records.',
      'Before the cart was added, twenty of thirty mock book cards reached the collection desk by the sample Friday check.',
      'With the labeled cart in place, twenty-eight of thirty cards reached the cart by the same point in the schedule.',
      'The eight-card improvement is a measured result supporting one clear return place.',
      'Observers recorded fewer mock cards left on windowsills or unrelated tables.',
      'The comparison does not prove every future book will be returned on time.',
      'It does show that the cart plan performed better in the bounded sample.',
      'A second reason is that divided shelves on the cart can help library helpers organize returns before shelving.',
      'The sample cart has sections labeled Picture Books, Information Books, and Longer Stories.',
      'During the mock sort, twenty-six of the twenty-eight returned cards were placed in the matching cart section on the first try.',
      'That result could help helpers move each group of books toward the correct library area.',
      'The labels, sections, and sample results connect the cart to a clearer return-and-sort routine.',
      'The library should place a labeled return cart beside the classroom hallway.',
    ],
    reasons: [
      { sentence: 3, evidenceSentences: [4, 9, 10, 11, 12, 14], connection: 'The visible sign and improved collection result support using one consistent return place.' },
      { sentence: 15, evidenceSentences: [16, 17, 18], connection: 'Labeled cart sections and the sample sorting result support organizing books before shelving.' },
    ],
    evidence: [
      { sentence: 4, kind: 'example', reasonIndexes: [1], connection: 'The words and book picture show how the return place would be clearly labeled.', strength: 'secondary' },
      { sentence: 9, kind: 'measurement', reasonIndexes: [1], connection: 'The first count provides a baseline for the mock comparison.', strength: 'secondary' },
      { sentence: 10, kind: 'measurement', reasonIndexes: [1], connection: 'The higher cart count supports the value of one return place.', strength: 'strong' },
      { sentence: 11, kind: 'result', reasonIndexes: [1], connection: 'The eight-card improvement summarizes the sample benefit.', strength: 'strong' },
      { sentence: 12, kind: 'observation', reasonIndexes: [1], connection: 'Fewer cards in unrelated places supports a clearer return routine.', strength: 'strong' },
      { sentence: 16, kind: 'example', reasonIndexes: [2], connection: 'The three labeled sections show how the cart could organize different books.', strength: 'strong' },
      { sentence: 17, kind: 'result', reasonIndexes: [2], connection: 'The first-try sorting result supports organizing returns before shelving.', strength: 'strong' },
    ],
    weakDetails: [{ sentence: 6, explanation: 'The decorative star does not show that the cart improves returning or sorting books.' }],
    synthesis: 'Measurements, observations, examples, and results provide evidence for both the consistent-return and pre-sorting reasons supporting the cart claim.',
    hotPrompt: 'Select the measured result that best supports using one visible return place.', hotCorrectSentence: 10, hotDistractorSentences: [6, 8, 13],
    support: [
      { word: 'consistent', sentence: 3, chunks: ['con', 'sis', 'tent'], focus: 'sis' },
      { word: 'collection', sentence: 9, chunks: ['col', 'lec', 'tion'], focus: 'lec' },
      { word: 'bounded', sentence: 14, chunks: ['bound', 'ed'], focus: 'bound' },
      { word: 'organize', sentence: 15, chunks: ['or', 'gan', 'ize'], focus: 'gan' },
    ],
    transfer: {
      text: 'A game shelf has pieces in mixed containers. In a mock cleanup, labeled bins helped more pieces reach the matching game than one open box did. The room should use labeled bins for game pieces.',
      claim: 'The room should use labeled bins for game pieces.', topic: 'storing game pieces',
      centralIdea: 'Labeled bins can help sort pieces by game.', purpose: 'To explain why labeled bins could improve game cleanup.',
      fact: 'The shelf holds several games.', explanation: 'The proposed action is the supported claim; the cleanup comparison supplies evidence.',
    },
  },
]

export const claimEvidenceRecords: readonly ClaimEvidenceRecord[] = records

export const claimEvidencePassages: Passage[] = records.map((record) => {
  const sentences = record.sentences.map((text, index) => ({ sentenceId: claimSentenceId(record.passageId, index + 1), sentenceNumber: index + 1, text }))
  const ranges: Array<[number, number]> = [[1, record.sectionEnds[0]], [record.sectionEnds[0] + 1, record.sectionEnds[1]], [record.sectionEnds[1] + 1, sentences.length]]
  const headingFeatures: InformationalFeature[] = record.headings.map((heading, index) => ({
    featureId: featureId(record.passageId, `heading-${index + 1}`), kind: 'heading', sectionId: claimSectionId(record.passageId, index + 1), text: heading,
  }))
  const glossaryFeature: InformationalFeature = {
    featureId: featureId(record.passageId, 'glossary'), kind: 'glossary', entries: [{
      entryId: `${featureId(record.passageId, 'glossary')}-entry`, term: record.support[0].word,
      definition: `a useful word from this informational argument about ${record.topic}`,
    }],
  }
  const sidebarFeature: InformationalFeature = {
    featureId: featureId(record.passageId, 'sidebar'), kind: 'sidebar', title: 'Evidence Court Note',
    text: 'Separate the claim from its reasons, then connect each evidence detail to the reason it supports.',
  }
  return {
    passageIdentifier: record.passageId, title: record.title, contentKind: 'informational', passageText: record.sentences.join(' '), sentences,
    informationalStructure: {
      titleFeatureId: featureId(record.passageId, 'title'),
      sections: ranges.map(([start, end], index) => ({
        sectionId: claimSectionId(record.passageId, index + 1), headingFeatureId: featureId(record.passageId, `heading-${index + 1}`),
        sentenceIds: sentences.slice(start - 1, end).map((sentence) => sentence.sentenceId),
        featureIds: index === 2 ? [featureId(record.passageId, 'glossary'), featureId(record.passageId, 'sidebar')] : [],
      })),
      features: [{ featureId: featureId(record.passageId, 'title'), kind: 'title', text: record.title }, ...headingFeatures, glossaryFeature, sidebarFeature],
    },
    genre: 'informational', gradeBand: 3, readingContext: 'Grade 3 Information Detectives claim-and-evidence practice',
    reviewStatus: 'DRAFT', contentVersion: CLAIM_EVIDENCE_VERSION,
    wordSupportTargets: record.support.map((support) => buildSupportTarget(record, support)),
  }
})

export const authorClaimGuides: AuthorClaimGuide[] = records.map((record) => {
  const sectionForSentence = (sentence: number) => sentence <= record.sectionEnds[0] ? 1 : sentence <= record.sectionEnds[1] ? 2 : 3
  const reasonIds = record.reasons.map((_, index) => `${record.passageId}-reason-${index + 1}`)
  return {
    passageId: record.passageId, topic: record.topic, claimKind: record.claimKind, claimStatement: record.claim,
    claimEvidenceIds: record.claimSentences.map((sentence) => claimSentenceId(record.passageId, sentence)),
    reasons: record.reasons.map((reason, index) => ({
      reasonId: reasonIds[index], reasonStatement: record.sentences[reason.sentence - 1],
      sectionId: claimSectionId(record.passageId, sectionForSentence(reason.sentence)),
      evidenceIds: reason.evidenceSentences.map((sentence) => claimSentenceId(record.passageId, sentence)), connectionStatement: reason.connection,
    })),
    evidence: record.evidence.map((evidence, index) => ({
      evidenceId: `${record.passageId}-evidence-${index + 1}`, evidenceKind: evidence.kind,
      sectionId: claimSectionId(record.passageId, sectionForSentence(evidence.sentence)),
      sourceEvidenceIds: [claimSentenceId(record.passageId, evidence.sentence)],
      supportsReasonIds: evidence.reasonIndexes.map((reasonIndex) => reasonIds[reasonIndex - 1]),
      evidenceStatement: record.sentences[evidence.sentence - 1], claimConnectionStatement: evidence.connection, strength: evidence.strength,
    })),
    weakOrIrrelevantDetails: record.weakDetails.map((detail, index) => ({
      detailId: `${record.passageId}-weak-${index + 1}`, sectionId: claimSectionId(record.passageId, sectionForSentence(detail.sentence)),
      evidenceIds: [claimSentenceId(record.passageId, detail.sentence)], explanation: detail.explanation,
    })),
    synthesisStatement: record.synthesis, reviewStatus: 'DRAFT', contentVersion: CLAIM_EVIDENCE_VERSION,
  }
})

function buildSupportTarget(record: ClaimEvidenceRecord, support: SupportPlan): WordSupportTarget {
  const text = record.sentences[support.sentence - 1]
  const index = text.toLowerCase().indexOf(support.word.toLowerCase())
  const surfaceWord = index >= 0 ? text.slice(index, index + support.word.length) : support.word
  const focusIndex = surfaceWord.toLowerCase().indexOf(support.focus.toLowerCase())
  return {
    targetId: `${record.passageId}-support-${support.word.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    passageId: record.passageId, sentenceId: claimSentenceId(record.passageId, support.sentence), surfaceWord,
    focusParts: focusIndex < 0 ? [{ text: surfaceWord, emphasis: true }] : [
      { text: surfaceWord.slice(0, focusIndex), emphasis: false },
      { text: surfaceWord.slice(focusIndex, focusIndex + support.focus.length), emphasis: true },
      { text: surfaceWord.slice(focusIndex + support.focus.length), emphasis: false },
    ].filter((part) => part.text.length > 0),
    displayChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    spokenChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    blendSpeechText: surfaceWord, wholeWordSpeechText: surfaceWord, sentenceSpeechText: text,
    reviewStatus: 'DRAFT', contentVersion: CLAIM_EVIDENCE_VERSION,
  }
}
