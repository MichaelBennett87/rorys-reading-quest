import { createScopedEvidenceReference } from '../../../../evidence'
import type { InformationalFeature } from '../../../../informationalTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import type {
  AuthorPresentationFeature,
  Grade3AuthorComparisonGuide,
  PairedTextSet,
  PresentationDifference,
  PresentationSimilarity,
} from '../../../contentPackTypes'
import { AUTHOR_LENS_PAIR_IDS, AUTHOR_LENS_PASSAGE_IDS, AUTHOR_LENS_VERSION } from './ids'

interface SupportPlan { word: string; sentence: number; chunks: string[] }
interface TextPlan {
  passageId: string
  title: string
  sentences: string[]
  support: [SupportPlan, SupportPlan]
  headings?: [string, string]
}
interface SimilarityPlan {
  id: string
  feature: AuthorPresentationFeature
  statement: string
  textA: number[]
  textB: number[]
  explanation: string
}
interface DifferencePlan {
  id: string
  feature: AuthorPresentationFeature
  textAStatement: string
  textBStatement: string
  textA: number[]
  textB: number[]
  explanation: string
}
interface AuthorLensPairRecord {
  pairId: string
  pairTitle: string
  kind: 'informational' | 'literary'
  difficulty: 2 | 3
  sharedBasis: string
  textA: TextPlan
  textB: TextPlan
  textAFocus: string
  textBFocus: string
  similarities: [SimilarityPlan, SimilarityPlan]
  differences: [DifferencePlan, DifferencePlan]
  synthesis: string
  factOnlyComparison: string
  hotText: { side: 'A' | 'B'; choices: [number, number, number]; correct: number }
  nonEvidence: { textA: number; textB: number }
}

const passage = AUTHOR_LENS_PASSAGE_IDS
const pair = AUTHOR_LENS_PAIR_IDS

export const authorLensSentenceId = (passageId: string, number: number) => `${passageId}-sentence-${number}`
const sectionId = (passageId: string, number: number) => `${passageId}-section-${number}`
const featureId = (passageId: string, key: string) => `${passageId}-feature-${key}`

export const authorLensPairRecords: AuthorLensPairRecord[] = [
  {
    pairId: pair[0], pairTitle: 'Rain Gardens: Building and Benefits', kind: 'informational', difficulty: 2,
    sharedBasis: 'Both texts explain how rain gardens manage runoff near buildings and paved areas.',
    textA: {
      passageId: passage[0], title: 'Building a Rain Garden', headings: ['Choose and Shape the Place', 'Plant and Guide the Water'],
      sentences: [
        'A rain garden is a shallow planted area that catches runoff from roofs or pavement.',
        'Builders begin by watching where rainwater travels across a yard.',
        'They choose a low place that is safely away from the building foundation.',
        'Next, they loosen the soil and shape a wide basin with gently sloping sides.',
        'A narrow stone border may mark the edge.',
        'They add plants that can handle both damp and dry times.',
        'Mulch covers open soil and can slow splashing raindrops.',
        'After planting, builders guide a downspout or shallow channel toward the basin.',
        'During a storm, water collects for a while instead of racing past.',
        'Then much of it gradually soaks into the ground.',
      ],
      support: [{ word: 'pavement', sentence: 1, chunks: ['pave', 'ment'] }, { word: 'gradually', sentence: 10, chunks: ['grad', 'u', 'al', 'ly'] }],
    },
    textB: {
      passageId: passage[1], title: 'What Rain Gardens Change', headings: ['Runoff Moves Quickly', 'A Slower Path'],
      sentences: [
        'Rain falling on roofs and pavement can become runoff.',
        'On hard surfaces, runoff moves quickly and may collect in low places.',
        'A rain garden interrupts that fast path.',
        'Its basin holds water briefly, giving it more time to soak into soil.',
        'Plant roots help keep spaces open in the ground.',
        'Stems and leaves also soften the force of some falling drops.',
        'After a heavy storm, extra water may still move beyond the garden.',
        'Even so, slowing and spreading runoff can reduce fast-moving puddles near the garden.',
        'A small garden sign may name the plants.',
        'The connected effects begin with slower water and end with more water entering soil.',
      ],
      support: [{ word: 'interrupts', sentence: 3, chunks: ['in', 'ter', 'rupts'] }, { word: 'connected', sentence: 10, chunks: ['con', 'nect', 'ed'] }],
    },
    textAFocus: 'Text A focuses on the ordered steps people use to build a rain garden.',
    textBFocus: 'Text B focuses on the cause-and-effect changes a rain garden makes to runoff.',
    similarities: [
      { id: 'al1-sim-structures', feature: 'examples', statement: 'Both authors use the basin and plants as concrete examples of how a rain garden handles water.', textA: [4, 6], textB: [4, 5], explanation: 'The shared examples connect rain-garden parts to water movement in both texts.' },
      { id: 'al1-sim-water', feature: 'cause-effect', statement: 'Both authors connect the garden structure with water slowing and soaking into soil.', textA: [8, 9, 10], textB: [3, 4, 10], explanation: 'Each text explains a relationship between the designed area and a slower path for runoff.' },
    ],
    differences: [
      { id: 'al1-diff-organization', feature: 'organization', textAStatement: 'Text A presents building steps in sequence.', textBStatement: 'Text B presents causes and effects of runoff moving through a rain garden.', textA: [2, 4, 8], textB: [1, 3, 4, 10], explanation: 'Text A moves from choosing a place to planting, while Text B traces how the garden changes fast runoff.' },
      { id: 'al1-diff-focus', feature: 'detail-focus', textAStatement: 'Text A emphasizes actions builders take.', textBStatement: 'Text B emphasizes changes in water movement.', textA: [3, 6, 8], textB: [2, 4, 8], explanation: 'The texts share a topic but select details for different main focuses.' },
    ],
    synthesis: 'Both authors explain rain gardens with concrete parts, but Text A organizes how to build one while Text B organizes the effects on runoff.',
    factOnlyComparison: 'Text A mentions mulch, while Text B mentions a garden sign.',
    hotText: { side: 'A', choices: [1, 4, 5], correct: 4 }, nonEvidence: { textA: 5, textB: 9 },
  },
  {
    pairId: pair[1], pairTitle: 'Asking for Help Solves a Problem', kind: 'literary', difficulty: 2,
    sharedBasis: 'Asking for help can solve a problem that is difficult to handle alone.',
    textA: {
      passageId: passage[2], title: 'The Jammed Curtain',
      sentences: [
        'Lia promised to open the stage curtain before the class play rehearsal.',
        'A gold tape star marked her place beside the rope.',
        'When Lia pulled, the curtain moved one inch and stopped.',
        'She tugged harder by herself, but the rope only tightened.',
        'Omar looked upward and said, "The cord seems twisted near the hook."',
        'Lia asked him to hold the lower loop while she loosened the twist.',
        'They called their teacher to check the pulley before they pulled again.',
        'The teacher showed them where the cord had slipped beside the wheel.',
        'Lia and Omar reset the cord together and tested it slowly.',
        'The curtain opened smoothly, and rehearsal began on time.',
      ],
      support: [{ word: 'promised', sentence: 1, chunks: ['prom', 'ised'] }, { word: 'twisted', sentence: 5, chunks: ['twist', 'ed'] }],
    },
    textB: {
      passageId: passage[3], title: 'The Mixed-Up Garden Signs',
      sentences: [
        'Ben carried row signs to the school herb garden before visitors arrived.',
        'He had drawn a blue border around every plant name.',
        'A gust scattered the signs across two garden beds.',
        'Ben hurried to replace them alone and set the basil sign beside the carrots.',
        'Maya noticed the leaf sketches and laid matching signs beside the plants.',
        'Ben paused and asked Maya to help compare each sketch with the real leaves.',
        'Maya pointed to a jagged parsley leaf while Ben checked its label.',
        'They worked side by side, moving every sign to the correct row.',
        'Ben tested their work by reading the labels from one end of the bed to the other.',
        'The visitors found the herbs easily, and Ben thanked Maya for joining him.',
      ],
      support: [{ word: 'scattered', sentence: 3, chunks: ['scat', 'tered'] }, { word: 'compare', sentence: 6, chunks: ['com', 'pare'] }],
    },
    textAFocus: 'Text A develops the shared theme mainly through dialogue and advice about the stuck curtain.',
    textBFocus: 'Text B develops the shared theme mainly through visual clues and the characters working side by side.',
    similarities: [
      { id: 'al2-sim-help', feature: 'event-emphasis', statement: 'Both authors show a character trying alone before accepting useful help.', textA: [4, 6], textB: [4, 6], explanation: 'The failed solo attempts make the later cooperation important in both stories.' },
      { id: 'al2-sim-check', feature: 'character-action', statement: 'Both authors end with the characters checking their solution before success.', textA: [9, 10], textB: [9, 10], explanation: 'Testing the solution helps each story reach a believable resolution.' },
    ],
    differences: [
      { id: 'al2-diff-dialogue', feature: 'dialogue', textAStatement: 'Text A uses spoken advice to identify the curtain problem.', textBStatement: 'Text B emphasizes leaf sketches, pointing, and side-by-side actions.', textA: [5, 6, 7], textB: [5, 7, 8], explanation: 'The first author relies on dialogue, while the second author relies more on visible clues and actions.' },
      { id: 'al2-diff-support', feature: 'event-emphasis', textAStatement: 'Text A includes an adult safety check for a mechanical problem.', textBStatement: 'Text B keeps the solution between two classmates sorting signs.', textA: [7, 8], textB: [6, 8, 9], explanation: 'Each author selects a different kind of help to develop the same theme.' },
    ],
    synthesis: 'Both stories show help improving a failed first attempt, but one author emphasizes spoken advice and an adult check while the other emphasizes visual clues and peer actions.',
    factOnlyComparison: 'Lia works near a curtain, while Ben works in a garden.',
    hotText: { side: 'A', choices: [2, 5, 9], correct: 5 }, nonEvidence: { textA: 2, textB: 2 },
  },
  {
    pairId: pair[2], pairTitle: 'Bridge Shapes and Tests', kind: 'informational', difficulty: 3,
    sharedBasis: 'Both texts explain how the shape of a bridge can help it support a load.',
    textA: {
      passageId: passage[4], title: 'Parts That Hold a Bridge', headings: ['Several Useful Shapes', 'How the Parts Work Together'],
      sentences: [
        'A bridge carries a path across a space such as a stream, road, or valley.',
        'A beam bridge has a straight deck resting on supports.',
        'Supports at the ends hold up the beam and the load above it.',
        'A short beam model can be made with a flat strip placed across two blocks.',
        'An arch bridge uses a curved shape above an opening.',
        'The curve directs much of the load toward supports on both sides.',
        'A truss bridge contains a framework of connected triangles.',
        'Triangles can help the framework keep its shape when forces press on it.',
        'Beam, arch, and truss designs use different shapes to handle loads.',
        'A labeled diagram can point out the deck, supports, arch, and truss.',
      ],
      support: [{ word: 'framework', sentence: 7, chunks: ['frame', 'work'] }, { word: 'connected', sentence: 7, chunks: ['con', 'nect', 'ed'] }],
    },
    textB: {
      passageId: passage[5], title: 'Testing a Model Bridge', headings: ['Make a Fair Test', 'Compare the Results'],
      sentences: [
        'Engineers can learn about bridge shapes by building and testing models.',
        'First, students place a flat index card between two equal blocks.',
        'They add identical coins one at a time and count how many the card holds.',
        'The flat card soon bends in the middle.',
        'Next, students fold a second card into a channel shape and place it on the same blocks.',
        'They add the same kind of coins in the same position.',
        'Students record the load before the folded card bends.',
        'Finally, they compare the two results and repeat the test.',
        'A classroom model does not prove that every full bridge works the same way.',
        'The repeated test does show how changing one shape can change the load a model supports.',
      ],
      support: [{ word: 'engineers', sentence: 1, chunks: ['en', 'gi', 'neers'] }, { word: 'repeated', sentence: 10, chunks: ['re', 'peat', 'ed'] }],
    },
    textAFocus: 'Text A describes and compares several bridge structures and their parts.',
    textBFocus: 'Text B presents a chronological classroom test of two model bridge shapes.',
    similarities: [
      { id: 'al3-sim-shape', feature: 'examples', statement: 'Both authors use specific shapes to explain how bridge designs support loads.', textA: [2, 5, 7, 9], textB: [2, 5, 10], explanation: 'Concrete shapes connect the broad topic to visible examples in both texts.' },
      { id: 'al3-sim-support', feature: 'cause-effect', statement: 'Both authors connect a change in shape with a change in support.', textA: [6, 8], textB: [4, 7, 10], explanation: 'Each text explains that design affects how a bridge or model responds to a load.' },
    ],
    differences: [
      { id: 'al3-diff-structure', feature: 'organization', textAStatement: 'Text A compares beam, arch, and truss structures by description.', textBStatement: 'Text B follows the steps of one controlled model test.', textA: [2, 5, 7, 9], textB: [2, 5, 8], explanation: 'One author organizes several types by their features, while the other organizes an investigation in time order.' },
      { id: 'al3-diff-evidence', feature: 'evidence-selection', textAStatement: 'Text A uses definitions and a labeled-diagram reference.', textBStatement: 'Text B uses recorded results and a repeated test.', textA: [2, 7, 10], textB: [3, 7, 8], explanation: 'The authors select different evidence to explain the same bridge-design topic.' },
    ],
    synthesis: 'Both authors connect bridge shape with support, but Text A compares named structures while Text B demonstrates the idea through a step-by-step model test.',
    factOnlyComparison: 'Text A mentions a valley, while Text B mentions index cards.',
    hotText: { side: 'B', choices: [1, 5, 9], correct: 5 }, nonEvidence: { textA: 1, textB: 9 },
  },
  {
    pairId: pair[3], pairTitle: 'Flexible Plans Can Still Work', kind: 'literary', difficulty: 3,
    sharedBasis: 'Flexibility helps people make progress when an original plan cannot work.',
    textA: {
      passageId: passage[6], title: 'The Indoor Picnic',
      sentences: [
        'Mira had planned the class reading picnic under the large oak tree.',
        'She packed green napkins beside the book baskets.',
        'Just before lunch, steady rain covered the playground.',
        'Mira frowned and said, "Our whole plan is ruined."',
        'Jon asked, "What parts of the picnic do we really need?"',
        'Their classmates named open space, books, and a place to sit together.',
        'Mira suggested the gym, but another class was using it.',
        'Jon pointed to the wide hallway beside the library and proposed paper tree signs.',
        'The class spread blankets along the wall and arranged books in baskets.',
        'Mira welcomed everyone to the rainy-day reading grove, and the picnic began.',
      ],
      support: [{ word: 'picnic', sentence: 1, chunks: ['pic', 'nic'] }, { word: 'proposed', sentence: 8, chunks: ['pro', 'posed'] }],
    },
    textB: {
      passageId: passage[7], title: 'A New Tail for the Kite',
      sentences: [
        'Arun reached the field and discovered that his kite tail had torn in the bicycle basket.',
        'The kite was painted with three orange circles.',
        'He tied the short piece back on and ran, but the kite spun sideways.',
        'Arun stopped instead of pulling harder.',
        'He tested a spare ribbon from his backpack, yet the ribbon was too light.',
        'Then he linked several cloth strips and tied them evenly below the frame.',
        'He walked slowly to check whether the strips dragged on the grass.',
        'After shortening one strip, Arun tried again.',
        'The kite climbed steadily and stayed pointed into the wind.',
        'Arun saved the torn tail as a pattern for a stronger one he could make later.',
      ],
      support: [{ word: 'discovered', sentence: 1, chunks: ['dis', 'cov', 'ered'] }, { word: 'steadily', sentence: 9, chunks: ['stead', 'i', 'ly'] }],
    },
    textAFocus: 'Text A develops flexibility through a group discussion that reshapes a class event.',
    textBFocus: 'Text B develops flexibility through one character testing and adjusting materials.',
    similarities: [
      { id: 'al4-sim-change', feature: 'event-emphasis', statement: 'Both authors begin with a plan that suddenly cannot work as expected.', textA: [1, 3, 4], textB: [1, 3], explanation: 'The disrupted plans create the need for flexibility in both stories.' },
      { id: 'al4-sim-adjust', feature: 'character-action', statement: 'Both main characters stop forcing the first plan and make a workable change.', textA: [5, 8, 9], textB: [4, 6, 8], explanation: 'Each resolution grows from adjusting rather than giving up.' },
    ],
    differences: [
      { id: 'al4-diff-dialogue', feature: 'dialogue', textAStatement: 'Text A uses questions and group suggestions to create a new plan.', textBStatement: 'Text B uses actions and repeated material tests with almost no dialogue.', textA: [4, 5, 6, 8], textB: [3, 5, 6, 8], explanation: 'One author develops flexibility through conversation, while the other shows it through experiments.' },
      { id: 'al4-diff-scope', feature: 'detail-focus', textAStatement: 'Text A focuses on preserving the important parts of a group event.', textBStatement: 'Text B focuses on changing one object until it works.', textA: [6, 8, 9], textB: [5, 6, 8, 9], explanation: 'The authors use different scales of problem and solution to present the same theme.' },
    ],
    synthesis: 'Both stories show flexible responses to a broken plan, but Text A relies on group dialogue while Text B follows one character testing physical changes.',
    factOnlyComparison: 'Mira has green napkins, while Arun has an orange kite.',
    hotText: { side: 'A', choices: [2, 5, 10], correct: 5 }, nonEvidence: { textA: 2, textB: 2 },
  },
  {
    pairId: pair[4], pairTitle: 'Pollinators in a School Garden', kind: 'informational', difficulty: 3,
    sharedBasis: 'Both texts explain how pollinators visit flowers and how a garden can support those visits.',
    textA: {
      passageId: passage[8], title: 'A Morning with Schoolyard Pollinators', headings: ['Early Visits', 'The Garden Gets Busier'],
      sentences: [
        'A class observed one flower bed from early morning until lunchtime.',
        'At eight o\'clock, the cool garden was quiet except for a small bee visiting white clover.',
        'The bee moved from flower to flower and brushed against pollen.',
        'By nine o\'clock, sunlight reached the purple salvia near the wall.',
        'Several larger bees began visiting those blossoms.',
        'Later, a butterfly landed on a flat cluster of pink flowers and unrolled its feeding tube.',
        'The class recorded the time, flower, and visitor for each observation.',
        'They did not count insects that flew over without landing.',
        'Near noon, the warm bed had more visitors than it had early in the morning.',
        'The observations showed changing activity across one morning, not a rule for every garden or day.',
      ],
      support: [{ word: 'observed', sentence: 1, chunks: ['ob', 'served'] }, { word: 'activity', sentence: 10, chunks: ['ac', 'tiv', 'i', 'ty'] }],
    },
    textB: {
      passageId: passage[9], title: 'Planning Flowers for Pollinators', headings: ['Offer Different Flowers', 'Protect the Visiting Space'],
      sentences: [
        'A pollinator garden can offer flowers during more than one part of the growing season.',
        'Gardeners may choose several kinds of plants that bloom at different times.',
        'Different flower shapes can give different visitors places to land or reach nectar.',
        'Flat flower clusters can provide a broad landing place for some butterflies.',
        'Tube-shaped flowers may be reached by visitors with long feeding parts.',
        'Grouping several plants of one kind can make a patch easier for flying insects to find.',
        'A shallow water dish needs stones above the water so small visitors have dry places to stand.',
        'Gardeners also avoid spraying chemicals that could harm visiting insects.',
        'A painted wooden marker can identify the garden for students.',
        'Together, bloom times, flower shapes, and safe conditions support many kinds of visits.',
      ],
      support: [{ word: 'pollinator', sentence: 1, chunks: ['pol', 'li', 'na', 'tor'] }, { word: 'conditions', sentence: 10, chunks: ['con', 'di', 'tions'] }],
    },
    textAFocus: 'Text A focuses on a chronological record of pollinator visits during one morning.',
    textBFocus: 'Text B focuses on garden features that can support different pollinator visits.',
    similarities: [
      { id: 'al5-sim-examples', feature: 'examples', statement: 'Both authors use specific flowers and visiting insects as examples.', textA: [2, 4, 6], textB: [3, 4, 5], explanation: 'The examples make the shared pollinator topic concrete in both texts.' },
      { id: 'al5-sim-careful', feature: 'evidence-selection', statement: 'Both authors give bounded details instead of claiming that every insect visits every flower.', textA: [8, 10], textB: [3, 10], explanation: 'Each text keeps its evidence connected to particular observations or garden features.' },
    ],
    differences: [
      { id: 'al5-diff-time', feature: 'organization', textAStatement: 'Text A moves from eight o\'clock to noon in chronological order.', textBStatement: 'Text B groups information by useful garden features.', textA: [2, 4, 6, 9], textB: [2, 3, 6, 7, 8], explanation: 'One author organizes observations by time, while the other organizes guidance by feature.' },
      { id: 'al5-diff-focus', feature: 'detail-focus', textAStatement: 'Text A emphasizes evidence recorded during a single observation period.', textBStatement: 'Text B emphasizes choices gardeners can make across a growing season.', textA: [1, 7, 10], textB: [1, 2, 10], explanation: 'The authors select different scopes and details for the same topic.' },
    ],
    synthesis: 'Both authors use flower-and-insect examples, but Text A presents a timed observation while Text B explains garden features that support pollinator visits.',
    factOnlyComparison: 'Text A mentions white clover, while Text B mentions a water dish.',
    hotText: { side: 'A', choices: [2, 3, 8], correct: 2 }, nonEvidence: { textA: 8, textB: 9 },
  },
  {
    pairId: pair[5], pairTitle: 'Cooperation Improves the Result', kind: 'literary', difficulty: 3,
    sharedBasis: 'Cooperation helps a group complete a task more successfully than uncoordinated effort.',
    textA: {
      passageId: passage[10], title: 'The Mural Grid',
      sentences: [
        'Elena, Malik, and June volunteered to paint a hallway mural of the town park.',
        'A paper cup held six sharpened pencils.',
        'At first, each student began drawing a favorite park object wherever space looked empty.',
        'Malik\'s bridge crossed through June\'s tree, and Elena\'s path ended at the wall edge.',
        '"We need one plan before we add more," Elena said.',
        'June suggested a light pencil grid, and Malik proposed assigning one section to each artist.',
        'They agreed that paths and bridges would cross grid lines at marked points.',
        'As they painted, the students called out when a shared edge was almost complete.',
        'June adjusted one branch so it met the sky section without covering a bird.',
        'The finished mural looked like one connected park instead of three separate pictures.',
      ],
      support: [{ word: 'volunteered', sentence: 1, chunks: ['vol', 'un', 'teered'] }, { word: 'connected', sentence: 10, chunks: ['con', 'nect', 'ed'] }],
    },
    textB: {
      passageId: passage[11], title: 'The Reading Bench Move',
      sentences: [
        'Four students needed to move a heavy reading bench to the other side of the library corner.',
        'A red cushion rested on its wooden seat.',
        'They first pushed from different sides, and the bench turned crooked against a rug.',
        'Tariq stopped the group and placed the cushion safely on a shelf.',
        'Mei rolled up the rug so the bench would have a clear path.',
        'Tariq and Luis lifted one end while Mei and Rosa guided the other.',
        'They took three slow steps and set the bench down together.',
        'Rosa checked the walking space between the bench and a bookcase.',
        'The group shifted the bench a few inches so everyone could pass easily.',
        'When reading time began, the bench was steady and the walkway was clear.',
      ],
      support: [{ word: 'different', sentence: 3, chunks: ['dif', 'fer', 'ent'] }, { word: 'walkway', sentence: 10, chunks: ['walk', 'way'] }],
    },
    textAFocus: 'Text A develops cooperation through planning dialogue and coordination across a shared design.',
    textBFocus: 'Text B develops cooperation through assigned physical roles and synchronized actions.',
    similarities: [
      { id: 'al6-sim-first', feature: 'event-emphasis', statement: 'Both authors show an uncoordinated first attempt creating a problem.', textA: [3, 4], textB: [3], explanation: 'The weak first attempts establish why cooperation is needed.' },
      { id: 'al6-sim-check', feature: 'character-action', statement: 'Both groups coordinate roles and check the final result.', textA: [7, 8, 9, 10], textB: [5, 6, 8, 9, 10], explanation: 'Shared planning and checking lead to a better outcome in both stories.' },
    ],
    differences: [
      { id: 'al6-diff-method', feature: 'dialogue', textAStatement: 'Text A uses dialogue to create a shared drawing plan.', textBStatement: 'Text B emphasizes physical roles and timed movement.', textA: [5, 6, 7], textB: [5, 6, 7], explanation: 'The first author makes planning talk central, while the second author makes coordinated action central.' },
      { id: 'al6-diff-result', feature: 'detail-focus', textAStatement: 'Text A focuses on making separate artwork look connected.', textBStatement: 'Text B focuses on moving an object safely and clearing a walkway.', textA: [8, 9, 10], textB: [7, 8, 9, 10], explanation: 'Different task details show cooperation improving both creative and physical work.' },
    ],
    synthesis: 'Both stories contrast a messy first attempt with coordinated success, but Text A presents cooperation through planning dialogue and Text B presents it through assigned actions.',
    factOnlyComparison: 'Text A includes pencils, while Text B includes a red cushion.',
    hotText: { side: 'A', choices: [2, 5, 9], correct: 5 }, nonEvidence: { textA: 2, textB: 2 },
  },
  {
    pairId: pair[6], pairTitle: 'Erosion: Causes and Solutions', kind: 'informational', difficulty: 3,
    sharedBasis: 'Both texts explain how moving water can carry soil and change the ground.',
    textA: {
      passageId: passage[12], title: 'What Happened After the Rain', headings: ['Rain Strikes Bare Soil', 'Runoff Carries Particles'],
      sentences: [
        'A hard rain fell on a bare slope beside a walking path.',
        'Raindrops struck loose soil and knocked tiny particles apart.',
        'Because few roots covered the slope, water flowed freely downhill.',
        'The runoff gathered soil particles and carried them toward the path.',
        'Small channels formed where the moving water followed the same route.',
        'At the bottom, muddy water spread a thin layer of soil across the pavement.',
        'A silver bottle cap also washed near the drain, but it was not part of the soil.',
        'When water or wind moves soil from one place to another, that change is called erosion.',
        'The storm showed a chain of causes and effects: bare ground, moving water, and displaced soil.',
        'One storm did not remove the whole slope, but repeated erosion could change it over time.',
      ],
      support: [{ word: 'particles', sentence: 2, chunks: ['par', 'ti', 'cles'] }, { word: 'displaced', sentence: 9, chunks: ['dis', 'placed'] }],
    },
    textB: {
      passageId: passage[13], title: 'Ways to Slow Erosion', headings: ['Cover and Hold Soil', 'Slow the Water'],
      sentences: [
        'Several methods can reduce how quickly water carries soil away.',
        'Plant roots hold nearby soil while stems and leaves cover part of the ground.',
        'A layer of mulch can protect bare soil from direct raindrop strikes.',
        'On a gentle garden slope, a low border can slow water and spread it across a wider area.',
        'Terraces create flatter steps on a steeper managed slope.',
        'Each step can shorten the distance that water runs straight downhill.',
        'A drainpipe may be brown or white, but its color does not control erosion.',
        'Plants, mulch, borders, and terraces work in different ways.',
        'Some protect soil from impact, while others slow or redirect flowing water.',
        'Choosing a method depends on the place, the slope, and how water moves there.',
      ],
      support: [{ word: 'terraces', sentence: 5, chunks: ['ter', 'rac', 'es'] }, { word: 'redirect', sentence: 9, chunks: ['re', 'di', 'rect'] }],
    },
    textAFocus: 'Text A traces the causes and effects of erosion during and after one storm.',
    textBFocus: 'Text B compares several methods that protect soil or slow moving water.',
    similarities: [
      { id: 'al7-sim-water', feature: 'cause-effect', statement: 'Both authors connect moving water with soil being carried downhill.', textA: [3, 4, 8], textB: [1, 4, 6], explanation: 'Water movement is the shared cause-and-effect link across both texts.' },
      { id: 'al7-sim-specific', feature: 'examples', statement: 'Both authors use specific ground features to make erosion easier to understand.', textA: [1, 3, 5], textB: [2, 3, 4, 5], explanation: 'The details show where erosion happens or how people can slow it.' },
    ],
    differences: [
      { id: 'al7-diff-focus', feature: 'detail-focus', textAStatement: 'Text A emphasizes what causes erosion and what changes after a storm.', textBStatement: 'Text B emphasizes methods for reducing erosion.', textA: [2, 3, 4, 9], textB: [2, 3, 4, 5, 9], explanation: 'One author explains the problem, while the other compares possible protections.' },
      { id: 'al7-diff-organization', feature: 'organization', textAStatement: 'Text A follows a cause-and-effect chain from rainfall to displaced soil.', textBStatement: 'Text B groups and compares plants, mulch, borders, and terraces.', textA: [1, 2, 4, 6, 9], textB: [2, 3, 4, 5, 8, 9], explanation: 'The organization changes from one connected storm sequence to categories of solutions.' },
    ],
    synthesis: 'Both authors explain water moving soil, but Text A traces erosion through one storm while Text B compares several ways to protect soil and slow water.',
    factOnlyComparison: 'Text A mentions a bottle cap, while Text B mentions a drainpipe color.',
    hotText: { side: 'A', choices: [2, 7, 9], correct: 9 }, nonEvidence: { textA: 7, textB: 7 },
  },
]

function buildSupportTarget(text: TextPlan, plan: SupportPlan): WordSupportTarget {
  return {
    targetId: `${text.passageId}-support-${plan.word.toLowerCase()}`,
    passageId: text.passageId,
    sentenceId: authorLensSentenceId(text.passageId, plan.sentence),
    surfaceWord: plan.word,
    focusParts: plan.chunks.map((part, index) => ({ text: part, emphasis: index === plan.chunks.length - 1 })),
    displayChunks: plan.chunks.map((part) => ({ displayText: part, speechText: part })),
    spokenChunks: plan.chunks.map((part) => ({ displayText: part, speechText: part })),
    blendSpeechText: plan.word,
    wholeWordSpeechText: plan.word,
    sentenceSpeechText: text.sentences[plan.sentence - 1],
    reviewStatus: 'DRAFT',
    contentVersion: AUTHOR_LENS_VERSION,
  }
}

function buildInformationalStructure(text: TextPlan) {
  const headings = text.headings ?? ['Main Ideas', 'More Details']
  const split = Math.ceil(text.sentences.length / 2)
  const sections = headings.map((_, index) => {
    const start = index === 0 ? 1 : split + 1
    const end = index === 0 ? split : text.sentences.length
    return {
      sectionId: sectionId(text.passageId, index + 1),
      headingFeatureId: featureId(text.passageId, `heading-${index + 1}`),
      sentenceIds: Array.from({ length: end - start + 1 }, (_, offset) => authorLensSentenceId(text.passageId, start + offset)),
      featureIds: [],
    }
  })
  const features: InformationalFeature[] = [
    { featureId: featureId(text.passageId, 'title'), kind: 'title', text: text.title },
    ...headings.map((heading, index) => ({ featureId: featureId(text.passageId, `heading-${index + 1}`), kind: 'heading' as const, sectionId: sections[index].sectionId, text: heading })),
  ]
  return { titleFeatureId: featureId(text.passageId, 'title'), sections, features }
}

function buildPassage(record: AuthorLensPairRecord, text: TextPlan): Passage {
  return {
    passageIdentifier: text.passageId,
    gradeBand: 3,
    contentKind: record.kind === 'informational' ? 'informational' : 'prose',
    passageText: text.sentences.join(' '),
    sentences: text.sentences.map((sentence, index) => ({ sentenceId: authorLensSentenceId(text.passageId, index + 1), text: sentence })),
    informationalStructure: record.kind === 'informational' ? buildInformationalStructure(text) : undefined,
    readingContext: text.title,
    contentVersion: AUTHOR_LENS_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: text.support.map((plan) => buildSupportTarget(text, plan)),
  }
}

function scoped(text: TextPlan, numbers: readonly number[]) {
  return numbers.map((number) => createScopedEvidenceReference(text.passageId, authorLensSentenceId(text.passageId, number)))
}

function buildSimilarity(record: AuthorLensPairRecord, plan: SimilarityPlan): PresentationSimilarity {
  return { similarityId: plan.id, feature: plan.feature, statement: plan.statement, textAEvidenceIds: scoped(record.textA, plan.textA), textBEvidenceIds: scoped(record.textB, plan.textB), explanation: plan.explanation }
}

function buildDifference(record: AuthorLensPairRecord, plan: DifferencePlan): PresentationDifference {
  return { differenceId: plan.id, feature: plan.feature, textAStatement: plan.textAStatement, textBStatement: plan.textBStatement, textAEvidenceIds: scoped(record.textA, plan.textA), textBEvidenceIds: scoped(record.textB, plan.textB), explanation: plan.explanation }
}

export const authorLensPassages: Passage[] = authorLensPairRecords.flatMap((record) => [buildPassage(record, record.textA), buildPassage(record, record.textB)])

export const authorLensPairedTextSets: PairedTextSet[] = authorLensPairRecords.map((record) => ({
  pairId: record.pairId,
  pairTitle: record.pairTitle,
  relationshipKind: record.kind === 'informational' ? 'same-topic' : 'same-theme',
  members: [
    { passageId: record.textA.passageId, label: 'Text A', displayTitle: record.textA.title, format: record.kind === 'informational' ? 'informational' : 'literary-prose' },
    { passageId: record.textB.passageId, label: 'Text B', displayTitle: record.textB.title, format: record.kind === 'informational' ? 'informational' : 'literary-prose' },
  ],
  formatRelationship: 'same-format',
  reviewStatus: 'DRAFT',
  contentVersion: AUTHOR_LENS_VERSION,
}))

export const authorLensComparisonGuides: Grade3AuthorComparisonGuide[] = authorLensPairRecords.map((record) => ({
  pairedTextSetId: record.pairId,
  sharedBasis: record.kind === 'informational' ? { kind: 'same-topic', topicStatement: record.sharedBasis } : { kind: 'same-theme', themeStatement: record.sharedBasis },
  textAKind: record.kind,
  textBKind: record.kind,
  textAFocusStatement: record.textAFocus,
  textBFocusStatement: record.textBFocus,
  similarities: record.similarities.map((plan) => buildSimilarity(record, plan)),
  differences: record.differences.map((plan) => buildDifference(record, plan)),
  evidenceFromBothRequired: true,
  synthesisStatement: record.synthesis,
  reviewStatus: 'DRAFT',
  contentVersion: AUTHOR_LENS_VERSION,
}))
