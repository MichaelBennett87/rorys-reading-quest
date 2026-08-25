import type { InformationalFeature } from '../../../../informationalTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import type { Grade3SummaryGuide, SummaryImportantDetail, SummaryMinorDetail } from '../../../contentPackTypes'
import { SUMMARY_STRONGHOLD_PASSAGE_IDS, SUMMARY_STRONGHOLD_VERSION } from './ids'

interface SupportPlan { word: string; sentence: number; chunks: string[] }
interface DetailPlan { id: string; sentence: number; reason: string }
interface SummaryBaseRecord {
  passageId: string
  title: string
  kind: 'literary' | 'informational'
  difficulty: 1 | 2
  sentences: string[]
  important: DetailPlan[]
  minor: DetailPlan[]
  modelSummary: string
  summaryRationale: string
  distractors: [string, string, string]
  support: [SupportPlan, SupportPlan, SupportPlan, SupportPlan]
}
interface LiteraryRecord extends SummaryBaseRecord {
  kind: 'literary'
  characters: string[]
  setting?: string
  problem: string
  resolution: string
  theme: string
  themeEvidence: number[]
}
interface InformationalRecord extends SummaryBaseRecord {
  kind: 'informational'
  topic: string
  centralIdea: string
  relationship: 'description' | 'chronology' | 'cause-effect' | 'comparison' | 'mixed'
  headings: [string, string, string]
  sectionEnds: [number, number]
}
export type SummaryTextRecord = LiteraryRecord | InformationalRecord

const p = SUMMARY_STRONGHOLD_PASSAGE_IDS
export const summarySentenceId = (passageId: string, number: number) => `${passageId}-sentence-${number}`
const sectionId = (passageId: string, number: number) => `${passageId}-section-${number}`
const featureId = (passageId: string, key: string) => `${passageId}-feature-${key}`

export const summaryTextRecords: SummaryTextRecord[] = [
  {
    passageId: p[0], title: 'The Missing Route Card', kind: 'literary', difficulty: 1,
    sentences: [
      'Ava arrived early to help guide families through the school art walk.',
      'She wore a green badge shaped like a star.',
      'Her job was to follow the route card and lead each group from the lobby to three art rooms.',
      'When the first families entered, the route card was missing from the welcome table.',
      'Ava checked beneath a stack of yellow programs and beside a jar of pencils.',
      'Then she remembered taking a photograph of the route during practice the day before.',
      'The photograph showed that the final stop was beside the music room, but one hallway turn was hidden by glare.',
      'Ava asked Mr. Ruiz, the custodian, whether he had seen the card while moving a bench.',
      'He remembered placing a loose paper behind the lobby sign so it would not blow away.',
      'Ava found the route card there, with one corner slightly bent.',
      'She compared the card with her photograph and marked the hidden turn on her copy.',
      'Ava led the waiting families through all three rooms without skipping a stop.',
      'Afterward, she thanked Mr. Ruiz and saved the photograph in the art-walk folder.',
      'By using a clue and asking for help, Ava solved the problem instead of giving up.',
    ],
    characters: ['Ava', 'Mr. Ruiz'], setting: 'the school art walk',
    problem: 'Ava needs the missing route card before she can guide families through the art walk.',
    important: [
      { id: 'ss1-important-problem', sentence: 4, reason: 'This event creates the central problem.' },
      { id: 'ss1-important-photo', sentence: 6, reason: 'Ava uses an important clue instead of stopping.' },
      { id: 'ss1-important-asks', sentence: 8, reason: 'Asking Mr. Ruiz directly advances the solution.' },
      { id: 'ss1-important-found', sentence: 10, reason: 'Finding the card resolves the missing-object problem.' },
      { id: 'ss1-important-guides', sentence: 12, reason: 'This event shows that Ava completes her goal.' },
    ],
    resolution: 'Ava finds the route card, checks the route, and successfully guides the families.',
    theme: 'Using available clues and asking for help can solve a difficult problem.', themeEvidence: [6, 8, 10, 12],
    minor: [
      { id: 'ss1-minor-badge', sentence: 2, reason: 'The badge color and shape do not affect the problem or solution.' },
      { id: 'ss1-minor-corner', sentence: 10, reason: 'The bent corner is descriptive but does not change the resolution.' },
    ],
    modelSummary: 'Ava must guide families through a school art walk, but the route card is missing. She uses a practice photograph and asks Mr. Ruiz for help, then finds the card and leads the families through every stop. Her actions show that clues and teamwork can help solve a problem.',
    summaryRationale: 'The summary preserves the problem, essential attempts, resolution, and supported theme while omitting decorative details.',
    distractors: [
      'The story is about a school art walk and a girl named Ava.',
      'Ava wears a green star badge, looks beneath yellow programs, notices a bent corner, and saves a photograph in a folder.',
      'Ava loses the route card, decides the art walk cannot happen, and sends every family home before asking anyone for help.',
    ],
    support: [
      { word: 'families', sentence: 1, chunks: ['fam', 'i', 'lies'] }, { word: 'photograph', sentence: 6, chunks: ['pho', 'to', 'graph'] },
      { word: 'custodian', sentence: 8, chunks: ['cus', 'to', 'di', 'an'] }, { word: 'compared', sentence: 11, chunks: ['com', 'pared'] },
    ],
  },
  {
    passageId: p[1], title: 'From Scraps to Compost', kind: 'informational', difficulty: 1,
    headings: ['A Useful Mixture', 'Small Changes over Time', 'Helping the Process'], sectionEnds: [5, 10], relationship: 'cause-effect',
    sentences: [
      'Compost forms when plant scraps and other once-living materials break down into a dark, crumbly mixture.',
      'This process turns some kitchen and yard scraps into material that can be added to soil.',
      'Fruit peels, dry leaves, and small plant pieces can be part of a compost pile.',
      'A classroom collection bucket might be brown or green.',
      'Meat, dairy foods, and oily scraps are usually left out of a simple school compost system.',
      'Tiny living decomposers help break the scraps into smaller materials.',
      'Air and a small amount of moisture help many decomposers stay active.',
      'As the materials break down, the pile changes in texture and appearance.',
      'One dry leaf may keep its shape for a while before becoming brittle.',
      'Over time, the original scraps become harder to recognize.',
      'Mixing a pile can move air into places that were packed tightly.',
      'Adding dry leaves can balance a pile that has become very wet.',
      'A few pill bugs may crawl near the outer pieces.',
      'Finished compost can be mixed into garden soil, where it adds organic material.',
      'Composting does not make scraps disappear instantly; it is a gradual process supported by decomposers, air, and moisture.',
    ],
    topic: 'composting', centralIdea: 'Composting gradually changes selected plant scraps into useful organic material through decomposition supported by air and moisture.',
    important: [
      { id: 'ss2-important-process', sentence: 1, reason: 'This sentence explains the overall process.' },
      { id: 'ss2-important-decomposers', sentence: 6, reason: 'Decomposers cause the scraps to break down.' },
      { id: 'ss2-important-air', sentence: 7, reason: 'Air and moisture are important conditions for the process.' },
      { id: 'ss2-important-result', sentence: 14, reason: 'This detail explains how finished compost is useful.' },
    ],
    minor: [
      { id: 'ss2-minor-bucket', sentence: 4, reason: 'The collection bucket color is not needed to understand composting.' },
      { id: 'ss2-minor-leaf', sentence: 9, reason: 'The single-leaf example is narrower than the broader process.' },
    ],
    modelSummary: 'Composting is a gradual process that changes selected plant scraps into dark organic material. Decomposers break down the scraps, while air and moisture help the process continue. Finished compost can then add organic material to garden soil.',
    summaryRationale: 'The summary states the central idea, main cause-and-effect conditions, and useful result without narrow examples.',
    distractors: [
      'This passage is about compost.',
      'A compost bucket may be brown or green, one leaf may stay whole for a while, and pill bugs sometimes crawl near the edge.',
      'Composting instantly turns every kind of kitchen scrap into soil without air, moisture, or decomposers.',
    ],
    support: [
      { word: 'materials', sentence: 1, chunks: ['ma', 'te', 'ri', 'als'] }, { word: 'decomposers', sentence: 6, chunks: ['de', 'com', 'pos', 'ers'] },
      { word: 'moisture', sentence: 7, chunks: ['mois', 'ture'] }, { word: 'gradual', sentence: 15, chunks: ['grad', 'u', 'al'] },
    ],
  },
  {
    passageId: p[2], title: 'The Library Cart Challenge', kind: 'literary', difficulty: 2,
    sentences: [
      'Nia and Theo volunteered to return a cart of library books before the after-school reading club began.',
      'A blue ribbon from last month still hung from the cart handle.',
      'They planned to visit the upstairs classrooms first and finish in the library downstairs.',
      'Halfway down the first hallway, one front wheel locked and dragged across the floor.',
      'Theo pushed harder, but the cart tilted and a stack of books began to slide.',
      'Nia caught the books and asked Theo to stop before the cart tipped.',
      'They tested the empty corner of the cart and saw that the wheel would turn backward but not forward.',
      'Theo wanted to carry every book by hand, yet Nia pointed out that they might mix up the classroom stacks.',
      'Nia suggested sorting the books into three labeled trays and making several smaller trips.',
      'The wall clock made a soft click as its minute hand moved.',
      'Theo worried that several trips would take too long, so they asked librarian Ms. Bell for advice.',
      'Ms. Bell showed them a lightweight bin and reminded them to keep each classroom label with its books.',
      'Nia carried the bin while Theo checked the labels and opened classroom doors.',
      'After two trips, Theo noticed that the broken cart was blocking the hallway.',
      'They rolled it backward into an empty storage space and placed a repair note on the handle.',
      'The final books reached the library just as the first reading-club students arrived.',
      'Ms. Bell thanked them for protecting the books, keeping the hallway clear, and changing their plan safely.',
      'Nia and Theo learned that slowing down to organize a new plan can be faster than forcing a broken one.',
    ],
    characters: ['Nia', 'Theo', 'Ms. Bell'], setting: 'the school hallways and library',
    problem: 'Nia and Theo must return sorted books, but the library cart wheel locks.',
    important: [
      { id: 'ss3-important-wheel', sentence: 4, reason: 'The locked wheel creates the main conflict.' },
      { id: 'ss3-important-stop', sentence: 6, reason: 'Nia prevents the books and cart from falling.' },
      { id: 'ss3-important-plan', sentence: 9, reason: 'The smaller-trip plan changes how they pursue their goal.' },
      { id: 'ss3-important-advice', sentence: 12, reason: 'Ms. Bell provides the safe tool that supports the solution.' },
      { id: 'ss3-important-finish', sentence: 16, reason: 'This event resolves the goal of returning the books.' },
    ],
    resolution: 'They sort the books into a light bin, make smaller trips, move the cart safely, and finish before the club begins.',
    theme: 'A careful new plan can solve a problem better than forcing the original plan.', themeEvidence: [6, 9, 12, 15, 16],
    minor: [
      { id: 'ss3-minor-ribbon', sentence: 2, reason: 'The ribbon is decorative and does not affect the conflict.' },
      { id: 'ss3-minor-clock', sentence: 10, reason: 'The clock sound adds atmosphere but does not change the solution.' },
    ],
    modelSummary: 'Nia and Theo must return library books before reading club, but a cart wheel locks and nearly spills the books. Instead of forcing the cart, they sort the books, ask Ms. Bell for a lighter bin, and make safe smaller trips. They finish on time, showing that a careful new plan can work better than forcing a broken one.',
    summaryRationale: 'The summary keeps the goal, conflict, turning decisions, resolution, and supported theme while omitting decoration.',
    distractors: [
      'The story is about Nia, Theo, library books, and an after-school club.',
      'The cart has a blue ribbon, the wall clock clicks, Theo opens doors, and Ms. Bell owns a lightweight bin.',
      'When the cart wheel locks, Nia and Theo leave every book in the hallway and miss the reading club completely.',
    ],
    support: [
      { word: 'volunteered', sentence: 1, chunks: ['vol', 'un', 'teered'] }, { word: 'classrooms', sentence: 3, chunks: ['class', 'rooms'] },
      { word: 'lightweight', sentence: 12, chunks: ['light', 'weight'] }, { word: 'organize', sentence: 18, chunks: ['or', 'gan', 'ize'] },
    ],
  },
  {
    passageId: p[3], title: 'Seeds on the Move', kind: 'informational', difficulty: 2,
    headings: ['Carried by Wind', 'Riding with Animals', 'Floating with Water'], sectionEnds: [6, 12], relationship: 'comparison',
    sentences: [
      'Plants cannot walk to a new growing place, but their seeds can travel in several ways.',
      'The shape and covering of a seed can help it move by wind, animals, or water.',
      'Some light seeds have thin parts that catch moving air.',
      'A dandelion seed has a tuft that slows its fall and lets wind carry it away from the parent plant.',
      'A maple seed spins as it drops, which can help it land beyond the tree branches.',
      'The spinning motion may look like a tiny turning wing.',
      'Other seeds travel by attaching to animal fur or human clothing.',
      'Burdock fruits have small hooks that can catch on a passing animal.',
      'The animal carries the hooked fruit until it falls or is brushed away in another place.',
      'Some fleshy fruits are eaten by animals, and their seeds may later be left elsewhere.',
      'A fox has reddish fur, but its fur color does not control seed travel.',
      'In each animal example, movement carries a seed away from the parent plant.',
      'Water can carry seeds or fruits that float.',
      'A coconut has a fibrous outer layer that helps the fruit float in water.',
      'Currents may move a floating fruit toward another shore.',
      'Not every traveling seed reaches a place where it can grow.',
      'Although wind, animals, and water move seeds differently, each method can spread seeds to new locations.',
    ],
    topic: 'ways seeds travel', centralIdea: 'Seeds have structures or coverings that let wind, animals, or water carry them to new locations.',
    important: [
      { id: 'ss4-important-main', sentence: 2, reason: 'This sentence states the shared idea behind all sections.' },
      { id: 'ss4-important-wind', sentence: 4, reason: 'The dandelion detail explains wind transport.' },
      { id: 'ss4-important-animal', sentence: 8, reason: 'The hook detail explains one animal transport method.' },
      { id: 'ss4-important-water', sentence: 14, reason: 'The fibrous coconut detail explains water transport.' },
      { id: 'ss4-important-compare', sentence: 17, reason: 'This sentence connects the three methods.' },
    ],
    minor: [
      { id: 'ss4-minor-wing', sentence: 6, reason: 'The tiny-wing image is decorative rather than essential.' },
      { id: 'ss4-minor-fur', sentence: 11, reason: 'A fox fur color does not explain how seeds travel.' },
    ],
    modelSummary: 'Seeds can spread to new locations in different ways. Light or spinning structures help some seeds travel by wind, hooks can attach seeds to animals, and floating coverings help water carry some fruits. These different methods all move seeds away from parent plants.',
    summaryRationale: 'The summary states the central idea and compares one essential mechanism from each section.',
    distractors: [
      'This passage is about seeds.',
      'A maple seed can look like a tiny wing, a fox may have reddish fur, and some fruits are brushed away.',
      'All seeds travel in the same way, and every seed that moves immediately grows into a new plant.',
    ],
    support: [
      { word: 'covering', sentence: 2, chunks: ['cov', 'er', 'ing'] }, { word: 'attaching', sentence: 7, chunks: ['at', 'tach', 'ing'] },
      { word: 'fibrous', sentence: 14, chunks: ['fi', 'brous'] }, { word: 'locations', sentence: 17, chunks: ['lo', 'ca', 'tions'] },
    ],
  },
  {
    passageId: p[4], title: 'The Rainy Rehearsal', kind: 'literary', difficulty: 2,
    sentences: [
      'Sam had planned the class puppet rehearsal for the courtyard because the wide steps made a natural stage.',
      'He carried a striped umbrella even though the morning sky was clear.',
      'By lunchtime, dark clouds covered the sun and rain began tapping the courtyard tables.',
      'The paper scenery could not get wet, and the final rehearsal was scheduled to begin in twenty minutes.',
      'Sam first suggested squeezing the whole stage beneath the narrow roof beside the door.',
      'Mina tested that space and showed that the tallest puppet would strike the low ceiling.',
      'The group considered canceling, but their performance for younger students was the next morning.',
      'Sam walked through the nearby hallway and noticed an empty display wall across from the music room.',
      'He proposed using the wall for scenery and placing the puppeteers behind two rolling tables.',
      'Mina worried that the hallway lights would make the paper moon hard to see.',
      'Jules found two battery lanterns in the drama cabinet and aimed them at the scenery.',
      'One lantern had a small scratch near its switch.',
      'The group asked their teacher to confirm that the tables left a wide, safe walking path.',
      'After she approved the arrangement, the students moved the dry scenery and marked where each person would stand.',
      'During the first hallway run, the narrator could not see the final cue card from behind the table.',
      'Sam copied the final cue in larger letters and clipped it beside the scenery.',
      'On the second run, the puppets, lights, and narration worked together.',
      'Rain still drummed outside, but the class completed the entire rehearsal before dismissal.',
      'Sam folded the striped umbrella and thanked everyone for testing each new idea.',
      'The next morning, the class used the hallway plan again because it kept the puppets visible and the path clear.',
      'Their performance made the younger students laugh at all the right moments.',
      'Sam realized that adapting a plan together could turn an obstacle into a workable solution.',
    ],
    characters: ['Sam', 'Mina', 'Jules', 'the class'], setting: 'the school courtyard and hallway',
    problem: 'Rain threatens the paper puppet scenery shortly before the final rehearsal.',
    important: [
      { id: 'ss5-important-rain', sentence: 4, reason: 'Wet scenery and limited time create the main conflict.' },
      { id: 'ss5-important-reject', sentence: 6, reason: 'Testing reveals why the first solution will not work.' },
      { id: 'ss5-important-hall', sentence: 9, reason: 'Sam proposes the workable location and arrangement.' },
      { id: 'ss5-important-light', sentence: 11, reason: 'Jules solves the visibility problem.' },
      { id: 'ss5-important-safe', sentence: 14, reason: 'Teacher approval ensures the plan is safe.' },
      { id: 'ss5-important-cue', sentence: 16, reason: 'The group fixes the last problem revealed by rehearsal.' },
      { id: 'ss5-important-success', sentence: 18, reason: 'Completing the rehearsal resolves the immediate goal.' },
    ],
    resolution: 'The class adapts the rehearsal to the hallway, tests and improves the setup, and performs successfully.',
    theme: 'Working together to test and adapt ideas can overcome an unexpected obstacle.', themeEvidence: [6, 9, 11, 14, 16, 18, 22],
    minor: [
      { id: 'ss5-minor-umbrella', sentence: 2, reason: 'The umbrella pattern does not affect the solution.' },
      { id: 'ss5-minor-scratch', sentence: 12, reason: 'The lantern scratch does not affect its function.' },
      { id: 'ss5-minor-folded', sentence: 19, reason: 'Folding the umbrella is not essential to the plot resolution.' },
    ],
    modelSummary: 'Rain threatens the class puppet rehearsal and its paper scenery. After testing and rejecting a cramped space, Sam and his classmates create a safe hallway stage, add lanterns, and enlarge a hidden cue. Their successful rehearsal and performance show that teamwork and careful adaptation can overcome an unexpected obstacle.',
    summaryRationale: 'The summary preserves the conflict, tested failures, essential improvements, resolution, and theme without decorative details.',
    distractors: [
      'The story is about a class puppet rehearsal at school.',
      'Sam carries a striped umbrella, a lantern has a scratch, rain taps tables, and Sam folds the umbrella after rehearsal.',
      'The class moves outside in the rain, lets the paper scenery become wet, and cancels the performance for younger students.',
    ],
    support: [
      { word: 'courtyard', sentence: 1, chunks: ['court', 'yard'] }, { word: 'considered', sentence: 7, chunks: ['con', 'sid', 'ered'] },
      { word: 'arrangement', sentence: 14, chunks: ['ar', 'range', 'ment'] }, { word: 'adapting', sentence: 22, chunks: ['a', 'dapt', 'ing'] },
    ],
  },
  {
    passageId: p[5], title: 'From Roof to Rain Garden', kind: 'informational', difficulty: 2,
    headings: ['Where Runoff Begins', 'Slowing and Soaking', 'Why the Parts Matter'], sectionEnds: [7, 14], relationship: 'mixed',
    sentences: [
      'Rain that lands on a roof or paved surface cannot soak into that hard surface.',
      'Instead, the water flows downhill as runoff.',
      'A rain garden is a shallow planted area designed to receive some runoff and let it soak into the ground.',
      'A roof downspout can direct water toward the garden through a safe channel.',
      'The channel at one school garden is lined with smooth gray stones.',
      'The stones can slow fast-moving water and help protect loose soil from washing away.',
      'The garden must be placed where water can enter without flowing toward a building foundation.',
      'When runoff reaches the shallow basin, it spreads across a wider area.',
      'Soil and plant roots create spaces where some water can move downward.',
      'Water that soaks in does not remain as a puddle on the pavement.',
      'Deep-rooted plants can help hold soil in place as water passes through the garden.',
      'A bee may visit a flower while the soil below is dry.',
      'A rain garden is not meant to stay filled like a pond.',
      'It should drain after a rain rather than hold standing water for a long time.',
      'Each part has a role: the channel directs and slows runoff, the basin spreads it, and soil and roots help water soak in.',
      'Together, those parts can reduce some puddling and erosion near hard surfaces.',
      'Rain gardens still need ordinary care such as removing weeds and checking that water can enter the basin.',
      'A wooden plant label may fade after many sunny days.',
      'A rain garden manages water by guiding runoff into a planted area where it can slow, spread, and soak into the ground.',
      'Its location and design must fit the site so water moves safely away from structures.',
    ],
    topic: 'how rain gardens manage runoff', centralIdea: 'Rain gardens use channels, shallow basins, soil, and plants to slow runoff and help it soak safely into the ground.',
    important: [
      { id: 'ss6-important-runoff', sentence: 2, reason: 'This detail identifies the water problem.' },
      { id: 'ss6-important-definition', sentence: 3, reason: 'This sentence defines the system and its main purpose.' },
      { id: 'ss6-important-channel', sentence: 6, reason: 'The channel detail explains how water is slowed.' },
      { id: 'ss6-important-basin', sentence: 8, reason: 'The basin detail explains how water spreads.' },
      { id: 'ss6-important-soak', sentence: 9, reason: 'Soil and roots explain how water moves into the ground.' },
      { id: 'ss6-important-result', sentence: 16, reason: 'This detail gives the combined result of the parts.' },
    ],
    minor: [
      { id: 'ss6-minor-stone-color', sentence: 5, reason: 'Stone color is decorative and does not explain the system.' },
      { id: 'ss6-minor-bee', sentence: 12, reason: 'The visiting bee is true but unrelated to runoff management.' },
      { id: 'ss6-minor-label', sentence: 18, reason: 'A fading label does not affect how the rain garden manages water.' },
    ],
    modelSummary: 'Rain gardens manage runoff from roofs and pavement by directing it into a shallow planted basin. A channel slows the water, the basin spreads it, and spaces in soil and around roots let some water soak into the ground. These connected parts can reduce puddling and erosion when the garden is placed safely.',
    summaryRationale: 'The summary preserves the runoff problem, sequence, functions of connected parts, and result while omitting side facts.',
    distractors: [
      'This passage is about rain gardens and water.',
      'A school channel has smooth gray stones, a bee may visit a flower, and a wooden label can fade in the sun.',
      'Rain gardens are deep ponds that store all runoff forever beside building foundations without needing soil or plants.',
    ],
    support: [
      { word: 'surface', sentence: 1, chunks: ['sur', 'face'] }, { word: 'downspout', sentence: 4, chunks: ['down', 'spout'] },
      { word: 'foundation', sentence: 7, chunks: ['foun', 'da', 'tion'] }, { word: 'erosion', sentence: 16, chunks: ['e', 'ro', 'sion'] },
    ],
  },
  {
    passageId: p[6], title: 'The Last Garden Sign', kind: 'literary', difficulty: 2,
    sentences: [
      'Priya promised to finish four plant signs before families visited the community garden on Saturday.',
      'The signs would explain which paths led to herbs, vegetables, flowers, and the rain barrel.',
      'Her neighbor Mateo offered to help after finishing his own watering job.',
      'Priya painted the first three signs on thin cardboard and leaned them against a bench to dry.',
      'A red ladybug rested on the bench arm for several minutes.',
      'When Priya began the final rain-barrel sign, a sprinkler suddenly turned toward the bench.',
      'Drops struck the cardboard before she could move every sign, and blue paint blurred across two arrows.',
      'Priya felt frustrated because the visitor walk began the next morning.',
      'She wanted to repaint immediately, but Mateo pointed out that wet cardboard would bend and smear again.',
      'They carried the signs into the tool shed and placed them on a flat shelf.',
      'A small brass bell hung beside the shed door.',
      'Mateo suggested making replacement signs from the plastic boards left from an old seed display.',
      'Priya tested one marker on a corner and splashed it with a spoonful of water.',
      'The writing stayed clear, so they traced the important arrows and labels onto the boards.',
      'They also moved each signpost beyond the sprinkler spray before attaching the replacements.',
      'Priya checked the route by walking from the entrance to every marked garden area.',
      'At the rain barrel, she noticed that its arrow pointed toward the compost bins instead.',
      'Rather than ignoring the mistake, she turned the sign and walked the route once more.',
      'The corrected signs guided her to all four places without confusion.',
      'Priya and Mateo stored the damaged cardboard for a future art project instead of placing it outside.',
      'On Saturday, families followed the signs while the sprinkler watered a different garden bed.',
      'One child used the rain-barrel sign to find the watering-can station.',
      'Priya thanked Mateo for helping her test the material and the entire route.',
      'She learned that careful testing and checking can strengthen a rushed solution.',
    ],
    characters: ['Priya', 'Mateo'], setting: 'a community garden before a visitor walk',
    problem: "Sprinkler water smears Priya's cardboard direction signs just before families visit.",
    important: [
      { id: 'ss7-important-damage', sentence: 7, reason: 'The smeared arrows create the main conflict.' },
      { id: 'ss7-important-wait', sentence: 9, reason: 'Mateo prevents Priya from repeating the failed approach.' },
      { id: 'ss7-important-material', sentence: 12, reason: 'The plastic boards provide a stronger replacement plan.' },
      { id: 'ss7-important-test', sentence: 13, reason: 'Testing confirms that the new material resists water.' },
      { id: 'ss7-important-route', sentence: 16, reason: 'Walking the route tests whether the information is accurate.' },
      { id: 'ss7-important-correct', sentence: 18, reason: 'Priya corrects an important directional error.' },
      { id: 'ss7-important-success', sentence: 21, reason: 'The families using the signs resolves the original goal.' },
    ],
    resolution: 'Priya and Mateo replace the signs with tested plastic boards, correct the route, and guide families successfully.',
    theme: 'Testing both materials and information can turn a rushed fix into a dependable solution.', themeEvidence: [9, 12, 13, 16, 18, 21, 24],
    minor: [
      { id: 'ss7-minor-ladybug', sentence: 5, reason: 'The ladybug does not affect the sign problem or solution.' },
      { id: 'ss7-minor-bell', sentence: 11, reason: 'The brass bell is a setting detail unrelated to the solution.' },
      { id: 'ss7-minor-art', sentence: 20, reason: 'The future art-project plan is not needed to understand the resolution.' },
    ],
    modelSummary: "Sprinkler water smears Priya's cardboard garden signs just before a visitor walk. With Mateo's help, she tests water-resistant boards, replaces the signs, and checks the entire route, correcting one wrong arrow. Families use the signs successfully, showing that careful testing can make a rushed solution dependable.",
    summaryRationale: 'The summary includes the conflict, essential tests, correction, resolution, and supported theme while excluding side details.',
    distractors: [
      'The story is about Priya making signs in a community garden.',
      'A ladybug sits on a bench, a brass bell hangs by the shed, damaged cardboard may become art, and one child finds a watering can.',
      'Priya leaves the smeared cardboard outside, skips checking the route, and every family follows the wrong arrows on Saturday.',
    ],
    support: [
      { word: 'community', sentence: 1, chunks: ['com', 'mu', 'ni', 'ty'] }, { word: 'frustrated', sentence: 8, chunks: ['frus', 'trat', 'ed'] },
      { word: 'replacement', sentence: 12, chunks: ['re', 'place', 'ment'] }, { word: 'dependable', sentence: 24, chunks: ['de', 'pend', 'a', 'ble'] },
    ],
  },
]

function buildSupportTarget(record: SummaryTextRecord, plan: SupportPlan): WordSupportTarget {
  return {
    targetId: `${record.passageId}-support-${plan.word.toLowerCase()}`, passageId: record.passageId,
    sentenceId: summarySentenceId(record.passageId, plan.sentence), surfaceWord: plan.word,
    focusParts: plan.chunks.map((text, index) => ({ text, emphasis: index === plan.chunks.length - 1 })),
    displayChunks: plan.chunks.map((text) => ({ displayText: text, speechText: text })),
    spokenChunks: plan.chunks.map((text) => ({ displayText: text, speechText: text })),
    blendSpeechText: plan.word, wholeWordSpeechText: plan.word, sentenceSpeechText: record.sentences[plan.sentence - 1],
    reviewStatus: 'DRAFT', contentVersion: SUMMARY_STRONGHOLD_VERSION,
  }
}

function buildInformationalStructure(record: InformationalRecord) {
  const sections = record.headings.map((_, index) => {
    const start = index === 0 ? 1 : record.sectionEnds[index - 1]! + 1
    const end = index === 2 ? record.sentences.length : record.sectionEnds[index]!
    return {
      sectionId: sectionId(record.passageId, index + 1), headingFeatureId: featureId(record.passageId, `heading-${index + 1}`),
      sentenceIds: Array.from({ length: end - start + 1 }, (_, offset) => summarySentenceId(record.passageId, start + offset)), featureIds: [],
    }
  })
  const features: InformationalFeature[] = [
    { featureId: featureId(record.passageId, 'title'), kind: 'title', text: record.title },
    ...record.headings.map((text, index) => ({ featureId: featureId(record.passageId, `heading-${index + 1}`), kind: 'heading' as const, sectionId: sections[index]!.sectionId, text })),
  ]
  return { titleFeatureId: featureId(record.passageId, 'title'), sections, features }
}

export const summaryStrongholdPassages: Passage[] = summaryTextRecords.map((record) => ({
  passageIdentifier: record.passageId, gradeBand: 3, contentKind: record.kind === 'informational' ? 'informational' : 'prose',
  passageText: record.sentences.join(' '),
  sentences: record.sentences.map((text, index) => ({ sentenceId: summarySentenceId(record.passageId, index + 1), text })),
  informationalStructure: record.kind === 'informational' ? buildInformationalStructure(record) : undefined,
  readingContext: record.title, contentVersion: SUMMARY_STRONGHOLD_VERSION, reviewStatus: 'DRAFT',
  wordSupportTargets: record.support.map((plan) => buildSupportTarget(record, plan)),
}))

function importantDetail(record: SummaryTextRecord, plan: DetailPlan): SummaryImportantDetail {
  return { detailId: plan.id, statement: record.sentences[plan.sentence - 1], evidenceIds: [summarySentenceId(record.passageId, plan.sentence)], importanceReason: plan.reason }
}
function minorDetail(record: SummaryTextRecord, plan: DetailPlan): SummaryMinorDetail {
  return { detailId: plan.id, statement: record.sentences[plan.sentence - 1], evidenceIds: [summarySentenceId(record.passageId, plan.sentence)], omissionReason: plan.reason }
}

export const summaryGuides: Grade3SummaryGuide[] = summaryTextRecords.map((record) => record.kind === 'literary' ? {
  passageId: record.passageId, textKind: 'literary', mainCharacterNames: record.characters, settingStatement: record.setting,
  problemOrGoalStatement: record.problem, importantPlotEvents: record.important.map((plan) => importantDetail(record, plan)),
  resolutionStatement: record.resolution, supportedThemeStatement: record.theme,
  themeEvidenceIds: record.themeEvidence.map((number) => summarySentenceId(record.passageId, number)),
  minorDetails: record.minor.map((plan) => minorDetail(record, plan)), modelSummary: record.modelSummary,
  summaryRationale: record.summaryRationale, reviewStatus: 'DRAFT', contentVersion: SUMMARY_STRONGHOLD_VERSION,
} : {
  passageId: record.passageId, textKind: 'informational', topicLabel: record.topic, centralIdeaStatement: record.centralIdea,
  importantDetails: record.important.map((plan) => importantDetail(record, plan)), minorDetails: record.minor.map((plan) => minorDetail(record, plan)),
  essentialRelationship: record.relationship, modelSummary: record.modelSummary, summaryRationale: record.summaryRationale,
  reviewStatus: 'DRAFT', contentVersion: SUMMARY_STRONGHOLD_VERSION,
})
