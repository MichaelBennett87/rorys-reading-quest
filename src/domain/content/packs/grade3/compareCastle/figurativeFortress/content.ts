import type { InformationalFeature } from '../../../../informationalTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import type {
  FigurativeLanguageGuide, FigurativeLanguageTarget, FigurativeSourceFormat,
  Grade3FigurativeLanguageKind, HyperboleTarget, MetaphorTarget, PersonificationTarget,
} from '../../../contentPackTypes'
import { FIGURATIVE_FORTRESS_PASSAGE_IDS, FIGURATIVE_FORTRESS_VERSION } from './ids'

interface SupportPlan { word: string; sentence: number; chunks: string[] }
interface TargetBasePlan {
  targetId: string
  kind: Grade3FigurativeLanguageKind
  sentence: number
  expression: string
  context: [number, ...number[]]
  literal: string
  meaning: string
  explanation: string
}
interface MetaphorPlan extends TargetBasePlan { kind: 'metaphor'; subject: string; object: string; quality: string }
interface PersonificationPlan extends TargetBasePlan { kind: 'personification'; subject: string; action: string }
interface HyperbolePlan extends TargetBasePlan { kind: 'hyperbole'; purpose: 'emphasis' | 'humor' | 'intensity' }
type TargetPlan = MetaphorPlan | PersonificationPlan | HyperbolePlan

interface TransferPlan { prompt: string; correct: string; distractors: [string, string, string]; explanation: string }

export interface FigurativeTextRecord {
  passageId: string
  title: string
  format: FigurativeSourceFormat
  difficulty: 0 | 1
  sentences: string[]
  targets: [TargetPlan, TargetPlan, TargetPlan, TargetPlan]
  support: [SupportPlan, SupportPlan, SupportPlan, SupportPlan]
  stanzaEnds?: number[]
  headings?: [string, string, string]
  sectionEnds?: [number, number]
  transfer?: TransferPlan
}

const p = FIGURATIVE_FORTRESS_PASSAGE_IDS
export const figurativeSentenceId = (passageId: string, number: number) => `${passageId}-sentence-${number}`
const figurativeSectionId = (passageId: string, number: number) => `${passageId}-section-${number}`
const figurativeFeatureId = (passageId: string, key: string) => `${passageId}-feature-${key}`

export const figurativeTextRecords: FigurativeTextRecord[] = [
  {
    passageId: p[0], title: 'The Lantern Room', format: 'literary-prose', difficulty: 0,
    sentences: [
      'Maya and Eli opened the small room where the stage club stored its supplies.',
      'The supply closet was a sleeping dragon.',
      'Its shelves bulged with folded cloth, paper lanterns, and twelve labeled boxes.',
      'The rusty hinge complained with a long squeak.',
      'Eli jumped, then laughed when he saw that the noise came from the door.',
      '“We have a million boxes to sort,” he said, looking at the twelve boxes.',
      'Maya knew he meant that the job looked enormous, not that a million boxes were hiding there.',
      'She read every label and drew three clear spaces on the floor.',
      'Maya’s plan was a flashlight in the mess.',
      'It showed them where costumes, lights, and paper decorations belonged.',
      'Before long, both friends could walk safely from the door to every shelf.',
    ],
    targets: [
      { targetId: 'ff-t1-metaphor-dragon', kind: 'metaphor', sentence: 2, expression: 'The supply closet was a sleeping dragon.', context: [1, 3], literal: 'An actual dragon was asleep in the closet.', meaning: 'The crowded closet looked large and difficult to approach.', explanation: 'The closet is directly compared with a sleeping dragon to show that the mess seemed large and intimidating.', subject: 'the supply closet', object: 'a sleeping dragon', quality: 'large and intimidating' },
      { targetId: 'ff-t1-personification-hinge', kind: 'personification', sentence: 4, expression: 'The rusty hinge complained with a long squeak.', context: [4, 5], literal: 'The hinge used words to complain.', meaning: 'The hinge made a long, unpleasant squeaking sound.', explanation: 'A hinge cannot complain, so the human action helps readers imagine its unpleasant squeak.', subject: 'the rusty hinge', action: 'complained' },
      { targetId: 'ff-t1-hyperbole-boxes', kind: 'hyperbole', sentence: 6, expression: 'We have a million boxes to sort', context: [3, 6, 7], literal: 'Exactly one million boxes were in the room.', meaning: 'The twelve boxes felt like a very large job.', explanation: 'The number is deliberately exaggerated to emphasize how large the sorting job seemed.', purpose: 'emphasis' },
      { targetId: 'ff-t1-metaphor-flashlight', kind: 'metaphor', sentence: 9, expression: 'Maya’s plan was a flashlight in the mess.', context: [8, 9, 10], literal: 'Maya’s plan was an electric light.', meaning: 'Maya’s plan made the confusing job clear.', explanation: 'The plan is directly compared with a flashlight because both help someone see a clear way forward.', subject: 'Maya’s plan', object: 'a flashlight', quality: 'making a confusing situation clear' },
    ],
    support: [
      { word: 'supplies', sentence: 1, chunks: ['sup', 'plies'] }, { word: 'lanterns', sentence: 3, chunks: ['lan', 'terns'] },
      { word: 'enormous', sentence: 7, chunks: ['e', 'nor', 'mous'] }, { word: 'decorations', sentence: 10, chunks: ['dec', 'o', 'ra', 'tions'] },
    ],
  },
  {
    passageId: p[1], title: 'A Lever Lifts the Load', format: 'informational', difficulty: 0,
    headings: ['Three Main Parts', 'What Happens When You Push', 'Vivid Words and Clear Facts'], sectionEnds: [5, 10],
    sentences: [
      'A lever is a rigid bar that turns around a fixed point called a fulcrum.',
      'A lever is a strong arm for a simple job.',
      'That metaphor compares the bar with an arm because both can help move a load.',
      'The fulcrum waits beneath the board.',
      'In literal terms, the fulcrum stays in one place while the board turns over it.',
      'When you push down on one end of the board, the board rotates around the fulcrum.',
      'The board is a bridge that carries your push to the load.',
      'The comparison means that force travels through the board; it does not mean the board crosses water.',
      'The far end answers by rising.',
      'The word answers gives the board a human action, while the factual result is that the load moves upward.',
      'Moving the fulcrum closer to a load can make the lifting end easier to push in a simple model.',
      'The exact result depends on the positions of the effort, fulcrum, and load.',
      'The figurative sentences add a clear picture, but the nearby facts explain how the lever truly works.',
      'A classroom lever model should be used with a light object and a steady board.',
    ],
    targets: [
      { targetId: 'ff-t2-metaphor-arm', kind: 'metaphor', sentence: 2, expression: 'A lever is a strong arm for a simple job.', context: [1, 2, 3], literal: 'A lever is a living arm.', meaning: 'A lever can help apply force to move a load.', explanation: 'The lever is directly compared with an arm because both can help move something.', subject: 'a lever', object: 'a strong arm', quality: 'helping apply force to move a load' },
      { targetId: 'ff-t2-personification-fulcrum', kind: 'personification', sentence: 4, expression: 'The fulcrum waits beneath the board.', context: [4, 5], literal: 'The fulcrum decides to wait.', meaning: 'The fulcrum stays in place beneath the board.', explanation: 'Waiting is a human choice, so the sentence personifies the fixed fulcrum.', subject: 'the fulcrum', action: 'waits' },
      { targetId: 'ff-t2-metaphor-bridge', kind: 'metaphor', sentence: 7, expression: 'The board is a bridge that carries your push to the load.', context: [6, 7, 8], literal: 'The board is a bridge over water.', meaning: 'The board transfers force from the pushing end to the load.', explanation: 'The board is directly compared with a bridge because it connects the push to the load.', subject: 'the board', object: 'a bridge', quality: 'connecting and carrying force from one place to another' },
      { targetId: 'ff-t2-personification-answers', kind: 'personification', sentence: 9, expression: 'The far end answers by rising.', context: [6, 9, 10], literal: 'The end of the board speaks an answer.', meaning: 'The other end of the board rises when one end is pushed.', explanation: 'Answering is a human response, so the wording makes the board’s movement vivid.', subject: 'the far end of the board', action: 'answers' },
    ],
    support: [
      { word: 'rigid', sentence: 1, chunks: ['rig', 'id'] }, { word: 'fulcrum', sentence: 1, chunks: ['ful', 'crum'] },
      { word: 'rotates', sentence: 6, chunks: ['ro', 'tates'] }, { word: 'positions', sentence: 12, chunks: ['po', 'si', 'tions'] },
    ],
  },
  {
    passageId: p[2], title: 'Kites over Maple Field', format: 'literary-prose', difficulty: 1,
    sentences: [
      'On festival morning, Lena carried her box kite to Maple Field with her uncle.',
      'Families had spread bright blankets across the grass, and teams checked tails, knots, and wooden frames.',
      'The field was a patchwork quilt of red, yellow, and blue.',
      'Lena understood that the field was not cloth; the colored blankets made separate squares across the green grass.',
      'She lifted her kite while her uncle slowly let out the line.',
      'For a moment, the kite dipped toward the ground.',
      'The wind whispered its next direction.',
      'A cool breeze brushed Lena’s left cheek, so she turned and ran toward the open end of the field.',
      'The kite caught the moving air and rose above the nearby trees.',
      'After several careful minutes, Lena’s fingers felt tired around the wooden reel.',
      '“I have held this string for ten years!” she called to her uncle.',
      'He smiled because they had arrived less than an hour earlier.',
      'A stronger gust lifted the kite until it looked like a small square against the clouds.',
      '“My kite must be a hundred miles above us,” Lena said.',
      'The kite was still easy to see, so her words emphasized her excitement rather than giving a real measurement.',
      'Her uncle helped wind in some line, and together they kept the kite steady above the colorful field.',
    ],
    targets: [
      { targetId: 'ff-t3-metaphor-quilt', kind: 'metaphor', sentence: 3, expression: 'The field was a patchwork quilt of red, yellow, and blue.', context: [2, 3, 4], literal: 'The field was made from sewn cloth.', meaning: 'The colored blankets made the field look divided into bright squares.', explanation: 'The field is directly compared with a patchwork quilt because both show many colored sections.', subject: 'the field', object: 'a patchwork quilt', quality: 'many bright colored sections' },
      { targetId: 'ff-t3-personification-wind', kind: 'personification', sentence: 7, expression: 'The wind whispered its next direction.', context: [6, 7, 8], literal: 'The wind spoke quiet directions.', meaning: 'The light breeze gave Lena a gentle clue about which way to run.', explanation: 'Whispering directions is human behavior, so the sentence personifies the breeze.', subject: 'the wind', action: 'whispered its next direction' },
      { targetId: 'ff-t3-hyperbole-years', kind: 'hyperbole', sentence: 11, expression: 'I have held this string for ten years!', context: [10, 11, 12], literal: 'Lena held the string for exactly ten years.', meaning: 'Lena felt as though she had held the string for a very long time.', explanation: 'The impossible time span exaggerates how tired Lena’s hand felt.', purpose: 'intensity' },
      { targetId: 'ff-t3-hyperbole-miles', kind: 'hyperbole', sentence: 14, expression: 'My kite must be a hundred miles above us', context: [13, 14, 15], literal: 'The kite was exactly one hundred miles high.', meaning: 'The kite looked extremely high to Lena.', explanation: 'The huge distance is a deliberate exaggeration expressing Lena’s excitement.', purpose: 'emphasis' },
    ],
    support: [
      { word: 'festival', sentence: 1, chunks: ['fes', 'ti', 'val'] }, { word: 'separate', sentence: 4, chunks: ['sep', 'a', 'rate'] },
      { word: 'direction', sentence: 7, chunks: ['di', 'rec', 'tion'] }, { word: 'measurement', sentence: 15, chunks: ['meas', 'ure', 'ment'] },
    ],
  },
  {
    passageId: p[3], title: 'Night Garden Listening', format: 'poem', difficulty: 1, stanzaEnds: [6, 12],
    sentences: [
      'I step where evening shadows meet,',
      'beside the mint and garden seat.',
      'The pond is a silver mirror,',
      'holding every nearby light.',
      'The moon peeks between the branches,',
      'then clouds cover it from sight.',
      'I could listen for a thousand nights',
      'to water slipping past the stones.',
      'A cricket calls beside the path,',
      'One cricket fills the whole wide sky with song,',
      'though its small body waits below.',
      'The garden sounds enormous in the evening cool.',
    ],
    targets: [
      { targetId: 'ff-t4-metaphor-mirror', kind: 'metaphor', sentence: 3, expression: 'The pond is a silver mirror', context: [3, 4], literal: 'The pond is a mirror made from silver.', meaning: 'The smooth pond reflects pale light like a mirror.', explanation: 'The pond is directly compared with a silver mirror because its surface reflects light.', subject: 'the pond', object: 'a silver mirror', quality: 'a smooth surface that reflects pale light' },
      { targetId: 'ff-t4-personification-moon', kind: 'personification', sentence: 5, expression: 'The moon peeks between the branches', context: [5, 6], literal: 'The moon chooses to peek with eyes.', meaning: 'The moon becomes briefly visible through the branches.', explanation: 'Peeking is a human action, so it makes the brief view of the moon feel playful.', subject: 'the moon', action: 'peeks' },
      { targetId: 'ff-t4-hyperbole-nights', kind: 'hyperbole', sentence: 7, expression: 'I could listen for a thousand nights', context: [7, 8], literal: 'The speaker will listen for exactly one thousand nights.', meaning: 'The speaker enjoys the water sound enough to listen for a very long time.', explanation: 'A thousand nights deliberately exaggerates how long the speaker wants to listen.', purpose: 'emphasis' },
      { targetId: 'ff-t4-hyperbole-cricket', kind: 'hyperbole', sentence: 10, expression: 'One cricket fills the whole wide sky with song', context: [9, 10, 11], literal: 'A cricket’s sound physically fills the entire sky.', meaning: 'The single cricket sounds surprisingly loud in the quiet garden.', explanation: 'The huge reach of one small cricket’s sound is exaggerated for intensity.', purpose: 'intensity' },
    ],
    support: [
      { word: 'shadows', sentence: 1, chunks: ['shad', 'ows'] }, { word: 'branches', sentence: 5, chunks: ['branch', 'es'] },
      { word: 'nearby', sentence: 4, chunks: ['near', 'by'] }, { word: 'enormous', sentence: 12, chunks: ['e', 'nor', 'mous'] },
    ],
  },
  {
    passageId: p[4], title: 'Stormy Signals', format: 'literary-prose', difficulty: 1,
    sentences: [
      'The science club was finishing its model bridges when a low rumble rolled beyond the school windows.',
      'Ms. Chen checked the weather notice on the office tablet and calmly asked everyone to pause.',
      'The club members placed their materials on the tables and followed her into the interior gym.',
      'The gym was a safe harbor during the storm.',
      'It was not beside an ocean, but its strong walls and distance from the windows gave the group a protected place to wait.',
      'Ms. Chen counted the students, then reviewed the same safety steps the club had practiced earlier.',
      'Outside, the storm argued with the roof.',
      'Rain and wind made loud, uneven sounds above them, but the roof did not actually speak or disagree.',
      'Jamal opened a card game while Niko shared a puzzle book.',
      'Another boom sounded, and Niko said, “That thunder could wake every sleeper in the state!”',
      'Several friends laughed because they knew Niko was stretching the truth to describe one especially loud sound.',
      'The group could hear the storm, yet the gym lights stayed steady and the adults continued checking updates.',
      'The exit sign watched over the quiet line near the wall.',
      'The sign had no eyes; its bright letters simply remained easy to see while everyone stayed together.',
      'After a while, the rain softened and the long pauses between rumbles grew longer.',
      'Ms. Chen waited until the office announced that the weather notice had ended.',
      'The students returned to the science room in the same counted line.',
      'Their bridge models were exactly where they had left them, and not one reward, tool, or paper had been lost.',
      'Jamal said the safe harbor had done its job, and Niko agreed without pretending that the gym had ever become a real port.',
      'The club packed its models and went home with a calm story to tell.',
    ],
    targets: [
      { targetId: 'ff-t5-metaphor-harbor', kind: 'metaphor', sentence: 4, expression: 'The gym was a safe harbor during the storm.', context: [3, 4, 5], literal: 'The gym was a port where boats stopped.', meaning: 'The gym was a protected place where the group could wait safely.', explanation: 'The gym is directly compared with a safe harbor because both provide protection during rough conditions.', subject: 'the gym', object: 'a safe harbor', quality: 'providing a protected place during rough conditions' },
      { targetId: 'ff-t5-personification-storm', kind: 'personification', sentence: 7, expression: 'Outside, the storm argued with the roof.', context: [7, 8], literal: 'The storm and roof spoke during a disagreement.', meaning: 'Wind and rain struck the roof with loud, uneven sounds.', explanation: 'Arguing is a human action, so it helps readers imagine the noisy storm against the roof.', subject: 'the storm', action: 'argued' },
      { targetId: 'ff-t5-hyperbole-thunder', kind: 'hyperbole', sentence: 10, expression: 'That thunder could wake every sleeper in the state!', context: [10, 11, 12], literal: 'Every sleeping person in the state would wake up.', meaning: 'The thunder sounded extremely loud to Niko.', explanation: 'Waking every sleeper in a state is a deliberate exaggeration emphasizing one loud boom.', purpose: 'intensity' },
      { targetId: 'ff-t5-personification-sign', kind: 'personification', sentence: 13, expression: 'The exit sign watched over the quiet line near the wall.', context: [13, 14], literal: 'The sign used eyes to watch the students.', meaning: 'The bright exit sign stayed visible above the waiting group.', explanation: 'Watching is a human action, so the wording emphasizes the sign’s steady visible presence.', subject: 'the exit sign', action: 'watched over' },
    ],
    support: [
      { word: 'interior', sentence: 3, chunks: ['in', 'te', 'ri', 'or'] }, { word: 'protected', sentence: 5, chunks: ['pro', 'tect', 'ed'] },
      { word: 'uneven', sentence: 8, chunks: ['un', 'e', 'ven'] }, { word: 'announced', sentence: 16, chunks: ['an', 'nounced'] },
    ],
    transfer: {
      prompt: 'During a warm rehearsal, Nia says, “The classroom was a furnace.” Which explanation identifies the new expression accurately?',
      correct: 'It is a metaphor comparing the hot classroom with a furnace.',
      distractors: ['It is a simile because it uses the word was.', 'It is literal because a furnace was inside the classroom.', 'It is hyperbole giving an exact temperature.'],
      explanation: 'The classroom is directly described as a furnace without like or as, so the expression is a metaphor for an extremely warm room.',
    },
  },
  {
    passageId: p[5], title: 'Saturday Garden Crew', format: 'poem', difficulty: 1, stanzaEnds: [6, 12],
    sentences: [
      'We meet beside the garden gate,',
      'at half past seven, never late.',
      'The sunrise is a golden flag,',
      'above each open garden bag.',
      'The broom hums a working tune,',
      'while morning brightens into noon.',
      'We sweep a billion leaves today,',
      'then stack the full brown sacks away.',
      'We loosen soil around each row,',
      'and water every stem below.',
      'Our laughter crosses a hundred towns,',
      'though only nearby friends hear sounds.',
    ],
    targets: [
      { targetId: 'ff-t6-metaphor-flag', kind: 'metaphor', sentence: 3, expression: 'The sunrise is a golden flag', context: [1, 2, 3, 4], literal: 'The sunrise is cloth hanging from a pole.', meaning: 'The bright sunrise is a cheerful signal that the workday is beginning.', explanation: 'The sunrise is directly compared with a golden flag because both can be bright signals seen from far away.', subject: 'the sunrise', object: 'a golden flag', quality: 'a bright signal marking a beginning' },
      { targetId: 'ff-t6-personification-broom', kind: 'personification', sentence: 5, expression: 'The broom hums a working tune', context: [5, 6], literal: 'The broom chooses and hums a song.', meaning: 'The broom makes a soft repeated sound while someone sweeps.', explanation: 'Humming a tune is a human action, so the poem personifies the broom’s sweeping sound.', subject: 'the broom', action: 'hums a working tune' },
      { targetId: 'ff-t6-hyperbole-leaves', kind: 'hyperbole', sentence: 7, expression: 'We sweep a billion leaves today', context: [7, 8], literal: 'The crew sweeps exactly one billion leaves.', meaning: 'The crew sweeps a very large number of leaves.', explanation: 'One billion is a deliberate exaggeration emphasizing the size of the cleanup.', purpose: 'emphasis' },
      { targetId: 'ff-t6-hyperbole-laughter', kind: 'hyperbole', sentence: 11, expression: 'Our laughter crosses a hundred towns', context: [11, 12], literal: 'The laughter can be heard in exactly one hundred towns.', meaning: 'The crew laughs loudly and cheerfully.', explanation: 'The impossible distance exaggerates the cheerful volume of the crew’s laughter.', purpose: 'humor' },
    ],
    support: [
      { word: 'brightens', sentence: 6, chunks: ['bright', 'ens'] }, { word: 'loosen', sentence: 9, chunks: ['loos', 'en'] },
      { word: 'sunrise', sentence: 3, chunks: ['sun', 'rise'] }, { word: 'nearby', sentence: 12, chunks: ['near', 'by'] },
    ],
    transfer: {
      prompt: 'Which new line uses personification rather than ordinary animal behavior?',
      correct: 'The moon winked above the path.',
      distractors: ['The owl watched from a branch.', 'The rabbit hopped across the grass.', 'The fish swam beside the reeds.'],
      explanation: 'Winking is a human action given to the moon. Watching, hopping, and swimming are ordinary behaviors for the named animals.',
    },
  },
  {
    passageId: p[6], title: 'When Water Moves Soil', format: 'informational', difficulty: 1,
    headings: ['Water and Loose Soil', 'Roots Change the Path', 'A Small Classroom Model'], sectionEnds: [7, 14],
    sentences: [
      'Erosion is the movement of rock or soil from one place to another.',
      'Moving water can loosen small soil particles and carry them downhill.',
      'A shallow channel is a road for runoff.',
      'The channel is not pavement, but both a channel and a road guide movement along a path.',
      'On bare ground, fast runoff may carry more loose soil than slow water moving across protected ground.',
      'The bare slope invites water to rush straight downhill.',
      'A slope cannot truly invite anything; the sentence means that open ground gives water a clear downhill path.',
      'Plants can change how water reaches the soil surface and how easily some soil moves.',
      'Leaves and stems can slow some falling raindrops before they strike the ground.',
      'A plant’s roots are a woven net in the soil.',
      'Roots are not string, but their spreading shapes can help hold nearby soil together.',
      'Plant cover does not stop all erosion, and different soils and slopes respond differently to water.',
      'Ground coverings such as fallen leaves may also reduce the force of drops hitting bare soil.',
      'These facts explain why covered and bare slopes can produce different results in a model.',
      'A class can compare two trays filled with the same amount and type of soil.',
      'One tray can have a layer of craft stems and mesh representing plant cover, while the other stays bare.',
      'Equal amounts of water should be poured from the same height so the comparison stays fair.',
      'In one fictional model, the bare tray produced three spoonfuls of muddy runoff, while the covered tray produced one.',
      'A student looked at the loose soil in the cup and exclaimed, “That trickle carried the whole hill away!”',
      'The whole hill was still in the tray, so the student was using hyperbole to emphasize the visible soil movement.',
      'The model does not copy every condition outdoors, but it can show how cover changes water flow over a small surface.',
      'Clear measurements and realistic explanations keep the figurative phrases from being mistaken for scientific facts.',
    ],
    targets: [
      { targetId: 'ff-t7-metaphor-road', kind: 'metaphor', sentence: 3, expression: 'A shallow channel is a road for runoff.', context: [2, 3, 4], literal: 'The channel is a paved road.', meaning: 'The channel guides moving water along a path.', explanation: 'The channel is directly compared with a road because both guide movement along a route.', subject: 'a shallow channel', object: 'a road', quality: 'guiding movement along a path' },
      { targetId: 'ff-t7-personification-slope', kind: 'personification', sentence: 6, expression: 'The bare slope invites water to rush straight downhill.', context: [5, 6, 7], literal: 'The slope speaks and asks water to move.', meaning: 'The uncovered slope gives runoff a clear downhill path.', explanation: 'Inviting is a human action, so the sentence personifies the open slope.', subject: 'the bare slope', action: 'invites' },
      { targetId: 'ff-t7-metaphor-net', kind: 'metaphor', sentence: 10, expression: 'A plant’s roots are a woven net in the soil.', context: [8, 9, 10, 11], literal: 'The roots are made from woven string.', meaning: 'Spreading roots can help hold nearby soil together.', explanation: 'Roots are directly compared with a woven net because both can hold material together.', subject: 'a plant’s roots', object: 'a woven net', quality: 'spreading through and helping hold material together' },
      { targetId: 'ff-t7-hyperbole-hill', kind: 'hyperbole', sentence: 19, expression: 'That trickle carried the whole hill away!', context: [18, 19, 20], literal: 'The small trickle removed an entire hill.', meaning: 'The student was surprised that a visible amount of soil moved.', explanation: 'The whole hill remained, so the statement deliberately exaggerates the model’s soil movement.', purpose: 'emphasis' },
    ],
    support: [
      { word: 'erosion', sentence: 1, chunks: ['e', 'ro', 'sion'] }, { word: 'particles', sentence: 2, chunks: ['par', 'ti', 'cles'] },
      { word: 'representing', sentence: 16, chunks: ['rep', 're', 'sent', 'ing'] }, { word: 'measurements', sentence: 22, chunks: ['meas', 'ure', 'ments'] },
    ],
    transfer: {
      prompt: 'Which new statement is hyperbole rather than a literal measurement?',
      correct: 'The tiny trickle carried an ocean through the tray.',
      distractors: ['The cup held 20 milliliters of water.', 'The tray was 30 centimeters long.', 'Two spoonfuls of soil collected in the cup.'],
      explanation: 'A tiny trickle cannot carry an ocean. The other statements give quantities that could be measured literally.',
    },
  },
]

function buildSupportTarget(record: FigurativeTextRecord, plan: SupportPlan): WordSupportTarget {
  const sentence = record.sentences[plan.sentence - 1]
  return {
    targetId: `${record.passageId}-support-${plan.word.toLowerCase()}`, passageId: record.passageId,
    sentenceId: figurativeSentenceId(record.passageId, plan.sentence), surfaceWord: plan.word,
    focusParts: plan.chunks.map((text, index) => ({ text, emphasis: index === plan.chunks.length - 1 })),
    displayChunks: plan.chunks.map((text) => ({ displayText: text, speechText: text })),
    spokenChunks: plan.chunks.map((text) => ({ displayText: text, speechText: text })),
    blendSpeechText: plan.word, wholeWordSpeechText: plan.word, sentenceSpeechText: sentence,
    reviewStatus: 'DRAFT', contentVersion: FIGURATIVE_FORTRESS_VERSION,
  }
}

function buildTarget(record: FigurativeTextRecord, plan: TargetPlan): FigurativeLanguageTarget {
  const base = {
    targetId: plan.targetId, kind: plan.kind, sourceFormat: record.format, expressionText: plan.expression,
    sourceEvidenceIds: [figurativeSentenceId(record.passageId, plan.sentence)],
    contextEvidenceIds: plan.context.map((number) => figurativeSentenceId(record.passageId, number)),
    literalReading: plan.literal, figurativeMeaning: plan.meaning, explanationStatement: plan.explanation,
  }
  if (plan.kind === 'metaphor') return { ...base, kind: 'metaphor', comparisonSubject: plan.subject, comparisonObject: plan.object, sharedQuality: plan.quality, directComparison: true } satisfies MetaphorTarget
  if (plan.kind === 'personification') return { ...base, kind: 'personification', nonhumanSubject: plan.subject, humanActionOrQuality: plan.action, intendedMeaning: plan.meaning, humanQualityAssigned: true } satisfies PersonificationTarget
  return { ...base, kind: 'hyperbole', exaggeratedStatement: plan.expression, realisticMeaning: plan.meaning, exaggerationPurpose: plan.purpose, deliberateExaggeration: true } satisfies HyperboleTarget
}

function buildInformationalStructure(record: FigurativeTextRecord) {
  const headings = record.headings!
  const ends = record.sectionEnds!
  const sections = headings.map((_, index) => {
    const start = index === 0 ? 1 : ends[index - 1]! + 1
    const end = index === 2 ? record.sentences.length : ends[index]!
    return {
      sectionId: figurativeSectionId(record.passageId, index + 1),
      headingFeatureId: figurativeFeatureId(record.passageId, `heading-${index + 1}`),
      sentenceIds: Array.from({ length: end - start + 1 }, (_, offset) => figurativeSentenceId(record.passageId, start + offset)),
      featureIds: [],
    }
  })
  const features: InformationalFeature[] = [
    { featureId: figurativeFeatureId(record.passageId, 'title'), kind: 'title', text: record.title },
    ...headings.map((text, index) => ({ featureId: figurativeFeatureId(record.passageId, `heading-${index + 1}`), kind: 'heading' as const, sectionId: sections[index]!.sectionId, text })),
  ]
  return { titleFeatureId: figurativeFeatureId(record.passageId, 'title'), sections, features }
}

function buildPoemStructure(record: FigurativeTextRecord) {
  const ends = record.stanzaEnds!
  const stanzas = ends.map((end, index) => {
    const start = index === 0 ? 1 : ends[index - 1]! + 1
    const stanzaId = `${record.passageId}-stanza-${index + 1}`
    return { stanzaId, lineIds: Array.from({ length: end - start + 1 }, (_, offset) => figurativeSentenceId(record.passageId, start + offset)) }
  })
  return {
    lines: record.sentences.map((text, index) => ({ lineId: figurativeSentenceId(record.passageId, index + 1), lineNumber: index + 1, stanzaId: stanzas.find((stanza) => stanza.lineIds.includes(figurativeSentenceId(record.passageId, index + 1)))!.stanzaId, text })),
    stanzas,
  }
}

export const figurativeFortressPassages: Passage[] = figurativeTextRecords.map((record) => ({
  passageIdentifier: record.passageId, gradeBand: 3, contentKind: record.format === 'literary-prose' ? 'prose' : record.format,
  passageText: record.format === 'poem' ? record.sentences.join('\n') : record.sentences.join(' '),
  sentences: record.sentences.map((text, index) => ({
    sentenceId: figurativeSentenceId(record.passageId, index + 1),
    lineNumber: record.format === 'poem' ? index + 1 : undefined,
    stanzaId: record.format === 'poem' ? poemStanzaId(record, index + 1) : undefined,
    text,
  })),
  poemStructure: record.format === 'poem' ? buildPoemStructure(record) : undefined,
  informationalStructure: record.format === 'informational' ? buildInformationalStructure(record) : undefined,
  readingContext: record.title, contentVersion: FIGURATIVE_FORTRESS_VERSION, reviewStatus: 'DRAFT',
  wordSupportTargets: record.support.map((plan) => buildSupportTarget(record, plan)),
}))

function poemStanzaId(record: FigurativeTextRecord, lineNumber: number) {
  const stanzaIndex = record.stanzaEnds!.findIndex((end) => lineNumber <= end)
  return `${record.passageId}-stanza-${stanzaIndex + 1}`
}

export const figurativeLanguageGuides: FigurativeLanguageGuide[] = figurativeTextRecords.map((record) => ({
  passageId: record.passageId, targets: record.targets.map((plan) => buildTarget(record, plan)),
  literalVsNonliteralSummary: 'Literal words state exactly what happened. Each authored target uses context to communicate one clearly supported nonliteral meaning through metaphor, personification, or hyperbole.',
  reviewStatus: 'DRAFT', contentVersion: FIGURATIVE_FORTRESS_VERSION,
}))
