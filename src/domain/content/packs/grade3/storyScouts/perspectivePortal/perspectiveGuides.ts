import type { Passage } from '../../../../types'
import type {
  CharacterPerspectiveGuide,
  PerspectiveEvidenceKind,
  PerspectiveComparison,
} from '../../../contentPackTypes'
import { PERSPECTIVE_PORTAL_PASSAGE_IDS, PERSPECTIVE_PORTAL_VERSION } from './ids'

interface SupportSpec {
  targetId: string
  word: string
  sentenceId: string
  focus: string
  chunks: Array<{ displayText: string; speechText: string }>
}

interface CharacterSpec {
  characterId: string
  name: string
  perspective: string
  motivation: string
  evidenceIds: string[]
  evidenceKinds: PerspectiveEvidenceKind[]
  feelingOnly: string
  traitOnly: string
}

interface ChangeSpec {
  characterId: string
  earlierPerspective: string
  laterPerspective: string
  evidenceIds: string[]
  cause: string
  summary: string
  distractors: [string, string, string]
}

export interface PerspectiveStoryRecord {
  passageId: string
  title: string
  difficulty: number
  situationId: string
  situationLabel: string
  relationship: PerspectiveComparison['relationship']
  comparisonStatement: string
  comparisonDistractors: [string, string, string]
  characterA: CharacterSpec
  characterB: CharacterSpec
  change?: ChangeSpec
  sentences: Array<{ sentenceId: string; text: string }>
  support: SupportSpec[]
  minorEvidenceId: string
}

export const perspectivePortalStories: PerspectiveStoryRecord[] = [
  {
    passageId: PERSPECTIVE_PORTAL_PASSAGE_IDS[0],
    title: 'The Rain Barrel Base',
    difficulty: 2,
    situationId: 'pp3-situation-rain-barrel',
    situationLabel: 'how to prepare the garden rain barrel before a storm',
    relationship: 'different',
    comparisonStatement: 'Talia wants to place the barrel quickly to catch the storm, while Owen wants to test and level the soft ground first.',
    comparisonDistractors: [
      'Talia and Owen both think the barrel should be placed immediately without checking the ground.',
      'Talia worries only about the ground, while Owen cares only about collecting rainwater.',
      'The narrator prefers Owen because the story is told in the third person.',
    ],
    characterA: {
      characterId: 'pp3-p1-talia', name: 'Talia',
      perspective: 'Talia believes the group should place the barrel beside the shed now so the coming storm will not be wasted.',
      motivation: 'She wants to collect as much rainwater as possible for the garden.',
      evidenceIds: ['pp3-p1-s2', 'pp3-p1-s5'], evidenceKinds: ['dialogue', 'action'],
      feelingOnly: 'Talia feels eager.', traitOnly: 'Talia is energetic.',
    },
    characterB: {
      characterId: 'pp3-p1-owen', name: 'Owen',
      perspective: 'Owen believes the group should test and level the ground before placing a heavy barrel on the soft soil.',
      motivation: 'He wants the full barrel to remain steady and safe.',
      evidenceIds: ['pp3-p1-s3', 'pp3-p1-s6'], evidenceKinds: ['dialogue', 'action'],
      feelingOnly: 'Owen feels concerned.', traitOnly: 'Owen is careful.',
    },
    sentences: [
      { sentenceId: 'pp3-p1-s1', text: 'The garden club unpacked a new rain barrel on the afternoon before a storm.' },
      { sentenceId: 'pp3-p1-s2', text: 'Talia pointed beside the shed and said, "Let us set it there now so we catch every drop tonight."' },
      { sentenceId: 'pp3-p1-s3', text: 'Owen pressed his boot into the damp soil and replied, "A full barrel will be heavy, so we should test the ground first."' },
      { sentenceId: 'pp3-p1-s4', text: 'Both students wanted the stored water for the vegetable beds.' },
      { sentenceId: 'pp3-p1-s5', text: 'Talia carried the connecting hose toward the shed and marked the shortest path from the gutter.' },
      { sentenceId: 'pp3-p1-s6', text: 'Owen pushed a wooden stake into her marked spot, and it sank several inches without effort.' },
      { sentenceId: 'pp3-p1-s7', text: 'He showed Talia how the barrel leaned when they rested its empty edge on the saturated ground.' },
      { sentenceId: 'pp3-p1-s8', text: 'Talia checked the dark clouds and asked whether they could make a level base before the rain arrived.' },
      { sentenceId: 'pp3-p1-s9', text: 'Owen suggested a temporary layer of flat stones and gravel beneath the barrel.' },
      { sentenceId: 'pp3-p1-s10', text: 'Talia gathered stones while Owen checked each corner with a level.' },
      { sentenceId: 'pp3-p1-s11', text: 'They connected the short hose just as the first drops tapped the shed roof.' },
      { sentenceId: 'pp3-p1-s12', text: 'The barrel collected rain on a firm base because the group used both students\' concerns.' },
    ],
    support: [
      { targetId: 'pp3-support-1', word: 'connecting', sentenceId: 'pp3-p1-s5', focus: 'connect', chunks: [{ displayText: 'con', speechText: 'kuh' }, { displayText: 'nect', speechText: 'nekt' }, { displayText: 'ing', speechText: 'ing' }] },
      { targetId: 'pp3-support-2', word: 'saturated', sentenceId: 'pp3-p1-s7', focus: 'sat', chunks: [{ displayText: 'sat', speechText: 'sach' }, { displayText: 'u', speechText: 'uh' }, { displayText: 'rat', speechText: 'ray' }, { displayText: 'ed', speechText: 'tid' }] },
      { targetId: 'pp3-support-3', word: 'temporary', sentenceId: 'pp3-p1-s9', focus: 'tempor', chunks: [{ displayText: 'tem', speechText: 'tem' }, { displayText: 'po', speechText: 'puh' }, { displayText: 'rar', speechText: 'rair' }, { displayText: 'y', speechText: 'ee' }] },
      { targetId: 'pp3-support-4', word: 'collected', sentenceId: 'pp3-p1-s12', focus: 'collect', chunks: [{ displayText: 'col', speechText: 'kuh' }, { displayText: 'lect', speechText: 'lekt' }, { displayText: 'ed', speechText: 'id' }] },
    ],
    minorEvidenceId: 'pp3-p1-s1',
  },
  {
    passageId: PERSPECTIVE_PORTAL_PASSAGE_IDS[1],
    title: 'The Loose Costume Button',
    difficulty: 2,
    situationId: 'pp3-situation-button',
    situationLabel: 'how rehearsal should continue after a costume button falls off',
    relationship: 'partly-similar',
    comparisonStatement: 'Priya and Mateo both want the missing button found, but Priya wants everyone to pause while Mateo wants most of the cast to keep rehearsing.',
    comparisonDistractors: [
      'Priya wants to ignore the button, while Mateo wants to cancel the entire performance.',
      'Priya and Mateo agree that every actor should leave rehearsal and search alone.',
      'The narrator thinks costumes matter more than practicing the scene.',
    ],
    characterA: {
      characterId: 'pp3-p2-priya', name: 'Priya',
      perspective: 'Priya believes the whole rehearsal should pause until the loose costume button is found and fastened securely.',
      motivation: 'She worries that someone will step on the button or that another costume piece will come loose.',
      evidenceIds: ['pp3-p2-s3', 'pp3-p2-s5'], evidenceKinds: ['dialogue', 'action'],
      feelingOnly: 'Priya feels worried.', traitOnly: 'Priya is responsible.',
    },
    characterB: {
      characterId: 'pp3-p2-mateo', name: 'Mateo',
      perspective: 'Mateo believes most actors should continue rehearsing while one person searches so the cast can use its limited time.',
      motivation: 'He wants to solve the costume problem without losing practice for the difficult scene.',
      evidenceIds: ['pp3-p2-s4', 'pp3-p2-s7'], evidenceKinds: ['dialogue', 'action'],
      feelingOnly: 'Mateo feels rushed.', traitOnly: 'Mateo is practical.',
    },
    sentences: [
      { sentenceId: 'pp3-p2-s1', text: 'The drama club had twenty minutes left to rehearse its busiest market scene.' },
      { sentenceId: 'pp3-p2-s2', text: 'As Priya crossed the stage, a silver button bounced from her costume and vanished near the painted stalls.' },
      { sentenceId: 'pp3-p2-s3', text: 'Priya raised her hand and said, "Everyone should stop until we find it, or someone could step on it."' },
      { sentenceId: 'pp3-p2-s4', text: 'Mateo answered, "The button matters, but the cast can practice while I check this side of the stage."' },
      { sentenceId: 'pp3-p2-s5', text: 'Priya inspected the other fastenings and guided the nearest actors away from the search area.' },
      { sentenceId: 'pp3-p2-s6', text: 'She thought a short pause would prevent a larger costume problem later.' },
      { sentenceId: 'pp3-p2-s7', text: 'Mateo moved one prop stall aside, then waved for the actors across the stage to continue their lines.' },
      { sentenceId: 'pp3-p2-s8', text: 'He kept one strip of floor empty so he could search without interrupting their movement.' },
      { sentenceId: 'pp3-p2-s9', text: 'Priya noticed that Mateo\'s plan protected the search area, and Mateo noticed that her costume check found a second loose thread.' },
      { sentenceId: 'pp3-p2-s10', text: 'They asked the actors near Priya to pause while the actors on the far side practiced quietly.' },
      { sentenceId: 'pp3-p2-s11', text: 'Mateo found the button beneath a paper basket, and Priya secured it before rejoining the scene.' },
      { sentenceId: 'pp3-p2-s12', text: 'The cast completed one careful rehearsal without stepping into the search space.' },
    ],
    support: [
      { targetId: 'pp3-support-5', word: 'rehearse', sentenceId: 'pp3-p2-s1', focus: 'hear', chunks: [{ displayText: 're', speechText: 'ree' }, { displayText: 'hearse', speechText: 'hurs' }] },
      { targetId: 'pp3-support-6', word: 'costume', sentenceId: 'pp3-p2-s2', focus: 'cost', chunks: [{ displayText: 'cos', speechText: 'kos' }, { displayText: 'tume', speechText: 'toom' }] },
      { targetId: 'pp3-support-7', word: 'fastenings', sentenceId: 'pp3-p2-s5', focus: 'fasten', chunks: [{ displayText: 'fast', speechText: 'fas' }, { displayText: 'en', speechText: 'un' }, { displayText: 'ings', speechText: 'ingz' }] },
      { targetId: 'pp3-support-8', word: 'interrupting', sentenceId: 'pp3-p2-s8', focus: 'rupt', chunks: [{ displayText: 'in', speechText: 'in' }, { displayText: 'ter', speechText: 'tuh' }, { displayText: 'rupt', speechText: 'rupt' }, { displayText: 'ing', speechText: 'ing' }] },
    ],
    minorEvidenceId: 'pp3-p2-s1',
  },
  {
    passageId: PERSPECTIVE_PORTAL_PASSAGE_IDS[2],
    title: 'The Map After the Storm',
    difficulty: 3,
    situationId: 'pp3-situation-creek-route',
    situationLabel: 'which creek route the adventure club should use after a storm',
    relationship: 'different',
    comparisonStatement: 'Zara first trusts the familiar marked crossing, while Theo believes the storm may have changed it and wants to inspect another route.',
    comparisonDistractors: [
      'Zara and Theo both refuse to use any map or inspect the creek.',
      'Zara wants a new route only because it is shorter, while Theo wants the old route because it is familiar.',
      'The first-person narrator cannot decide which student is correct.',
    ],
    characterA: {
      characterId: 'pp3-p3-zara', name: 'Zara',
      perspective: 'Zara initially believes the club should use the familiar marked crossing because the map shows it as the usual safe route.',
      motivation: 'She trusts the route the club prepared and wants to keep the expedition on schedule.',
      evidenceIds: ['pp3-p3-s2', 'pp3-p3-s6', 'pp3-p3-s13'], evidenceKinds: ['dialogue', 'thought', 'choice'],
      feelingOnly: 'Zara feels confident.', traitOnly: 'Zara is organized.',
    },
    characterB: {
      characterId: 'pp3-p3-theo', name: 'Theo',
      perspective: 'Theo believes the group should inspect the creek before trusting the old route because the storm may have changed the crossing.',
      motivation: 'He notices new water and debris and wants evidence about current conditions.',
      evidenceIds: ['pp3-p3-s3', 'pp3-p3-s7'], evidenceKinds: ['dialogue', 'action'],
      feelingOnly: 'Theo feels cautious.', traitOnly: 'Theo is observant.',
    },
    change: {
      characterId: 'pp3-p3-zara',
      earlierPerspective: 'Zara believes the familiar marked crossing should still guide the group.',
      laterPerspective: 'Zara believes the map must be updated and the group should use the newly inspected footbridge route.',
      evidenceIds: ['pp3-p3-s2', 'pp3-p3-s10', 'pp3-p3-s13'],
      cause: 'Seeing the flooded stones and the intact upstream footbridge gives Zara newer evidence than the old map.',
      summary: 'Zara changes from trusting the old marked crossing to using current evidence and updating the route.',
      distractors: ['Zara stays certain that the old crossing is best even after seeing the flood.', 'Zara feels surprised by the muddy water.', 'The narrator changes from first person to third person.'],
    },
    sentences: [
      { sentenceId: 'pp3-p3-s1', text: 'The adventure club began a short expedition the morning after a heavy storm.' },
      { sentenceId: 'pp3-p3-s2', text: 'Zara unfolded the club map and said, "The marked crossing has always been shallow, so we should stay with our planned route."' },
      { sentenceId: 'pp3-p3-s3', text: 'Theo pointed to fresh branches along the bank and replied, "Yesterday\'s storm may have changed the creek, so we need to look before we trust the mark."' },
      { sentenceId: 'pp3-p3-s4', text: 'Both students wanted the group to reach the science station before its afternoon program.' },
      { sentenceId: 'pp3-p3-s5', text: 'Zara noted that walking upstream would add time and might cause them to miss the opening demonstration.' },
      { sentenceId: 'pp3-p3-s6', text: 'She thought the laminated map was more dependable than guessing about an unseen route.' },
      { sentenceId: 'pp3-p3-s7', text: 'Theo walked cautiously to the edge and used a long stick to measure the current over the first stepping stone.' },
      { sentenceId: 'pp3-p3-s8', text: 'The stick dipped beneath brown water before touching the stone.' },
      { sentenceId: 'pp3-p3-s9', text: 'Zara compared the deep water with the blue shallow-water symbol printed on her map.' },
      { sentenceId: 'pp3-p3-s10', text: 'A floating branch struck the next stone and spun downstream.' },
      { sentenceId: 'pp3-p3-s11', text: 'Zara folded the map and asked Theo to help scout the upstream bend from the dry bank.' },
      { sentenceId: 'pp3-p3-s12', text: 'They found a narrow footbridge above the current and checked every board before calling the group forward.' },
      { sentenceId: 'pp3-p3-s13', text: 'At the station, Zara drew the footbridge on the club map and labeled the old crossing, "Check after storms."' },
      { sentenceId: 'pp3-p3-s14', text: 'The expedition arrived later than planned but before the demonstration began.' },
    ],
    support: [
      { targetId: 'pp3-support-9', word: 'expedition', sentenceId: 'pp3-p3-s1', focus: 'tion', chunks: [{ displayText: 'ex', speechText: 'eks' }, { displayText: 'pe', speechText: 'puh' }, { displayText: 'di', speechText: 'dish' }, { displayText: 'tion', speechText: 'un' }] },
      { targetId: 'pp3-support-10', word: 'dependable', sentenceId: 'pp3-p3-s6', focus: 'able', chunks: [{ displayText: 'de', speechText: 'duh' }, { displayText: 'pend', speechText: 'pen' }, { displayText: 'a', speechText: 'duh' }, { displayText: 'ble', speechText: 'bul' }] },
      { targetId: 'pp3-support-11', word: 'cautiously', sentenceId: 'pp3-p3-s7', focus: 'ly', chunks: [{ displayText: 'cau', speechText: 'kaw' }, { displayText: 'tious', speechText: 'shus' }, { displayText: 'ly', speechText: 'lee' }] },
      { targetId: 'pp3-support-12', word: 'upstream', sentenceId: 'pp3-p3-s11', focus: 'up', chunks: [{ displayText: 'up', speechText: 'up' }, { displayText: 'stream', speechText: 'streem' }] },
    ],
    minorEvidenceId: 'pp3-p3-s14',
  },
  {
    passageId: PERSPECTIVE_PORTAL_PASSAGE_IDS[3],
    title: 'The Empty Library Corner',
    difficulty: 3,
    situationId: 'pp3-situation-library-corner',
    situationLabel: 'how to redesign an unused corner of the library',
    relationship: 'partly-similar',
    comparisonStatement: 'Suri and Luis both want the empty corner to invite more reading, but Suri values quiet space while Luis first favors group discussion space.',
    comparisonDistractors: [
      'Suri wants to close the library corner, while Luis wants to remove every book.',
      'Suri and Luis agree that only silent individual reading should happen in the corner.',
      'The narrator believes group reading is better because the story uses third person.',
    ],
    characterA: {
      characterId: 'pp3-p4-suri', name: 'Suri',
      perspective: 'Suri believes the unused corner should become a quiet place where readers can focus without hearing group conversations.',
      motivation: 'She notices that some readers leave when the nearby tables become noisy.',
      evidenceIds: ['pp3-p4-s2', 'pp3-p4-s6'], evidenceKinds: ['dialogue', 'noticing'],
      feelingOnly: 'Suri feels hopeful.', traitOnly: 'Suri is thoughtful.',
    },
    characterB: {
      characterId: 'pp3-p4-luis', name: 'Luis',
      perspective: 'Luis initially believes the unused corner should hold one large table where book clubs can read and discuss stories together.',
      motivation: 'He enjoys sharing ideas and sees groups searching for places to meet.',
      evidenceIds: ['pp3-p4-s3', 'pp3-p4-s7', 'pp3-p4-s14'], evidenceKinds: ['dialogue', 'action', 'choice'],
      feelingOnly: 'Luis feels excited.', traitOnly: 'Luis is social.',
    },
    change: {
      characterId: 'pp3-p4-luis',
      earlierPerspective: 'Luis believes one large discussion table is the best use of the whole corner.',
      laterPerspective: 'Luis believes movable furniture can support both quiet readers and small discussion groups.',
      evidenceIds: ['pp3-p4-s3', 'pp3-p4-s11', 'pp3-p4-s14'],
      cause: 'The student survey and furniture test show Luis that the same corner can meet both reading needs.',
      summary: 'Luis changes from wanting one permanent group table to supporting a flexible corner with quiet and discussion spaces.',
      distractors: ['Luis continues to insist that one large table must fill the entire corner.', 'Luis feels pleased when students visit the corner.', 'The author changes the story from informational text to poetry.'],
    },
    sentences: [
      { sentenceId: 'pp3-p4-s1', text: 'The library council could rearrange one empty corner beside the tall windows.' },
      { sentenceId: 'pp3-p4-s2', text: 'Suri said, "Readers need a quiet place away from the busy checkout desk, so I would add soft chairs and small dividers."' },
      { sentenceId: 'pp3-p4-s3', text: 'Luis spread a sketch on the table and replied, "Book clubs need room for discussion, so one large table would bring people here."' },
      { sentenceId: 'pp3-p4-s4', text: 'They agreed that the dusty corner should help more students read.' },
      { sentenceId: 'pp3-p4-s5', text: 'They disagreed about whether quiet focus or shared conversation mattered most in that space.' },
      { sentenceId: 'pp3-p4-s6', text: 'During lunch, Suri counted three readers who moved away from noisy tables to finish their books.' },
      { sentenceId: 'pp3-p4-s7', text: 'Luis recorded two book clubs waiting for the single discussion room.' },
      { sentenceId: 'pp3-p4-s8', text: 'Instead of arguing from their own observations, they asked students to mark both activities they would use.' },
      { sentenceId: 'pp3-p4-s9', text: 'The survey showed strong interest in quiet reading and smaller group talks.' },
      { sentenceId: 'pp3-p4-s10', text: 'Suri proposed two movable shelves that could serve as dividers without blocking the windows.' },
      { sentenceId: 'pp3-p4-s11', text: 'Luis tested four light tables that could stand separately or connect for a book-club meeting.' },
      { sentenceId: 'pp3-p4-s12', text: 'For one week, students moved the portable pieces to fit what they needed.' },
      { sentenceId: 'pp3-p4-s13', text: 'Quiet readers used the window side while groups met behind the shelves at scheduled times.' },
      { sentenceId: 'pp3-p4-s14', text: 'Luis replaced his one-table poster with a flexible plan and wrote, "The corner can welcome more than one kind of reader."' },
      { sentenceId: 'pp3-p4-s15', text: 'Suri added a sign explaining when the discussion tables were available.' },
    ],
    support: [
      { targetId: 'pp3-support-13', word: 'rearrange', sentenceId: 'pp3-p4-s1', focus: 're', chunks: [{ displayText: 're', speechText: 'ree' }, { displayText: 'ar', speechText: 'uh' }, { displayText: 'range', speechText: 'raynj' }] },
      { targetId: 'pp3-support-14', word: 'discussion', sentenceId: 'pp3-p4-s3', focus: 'sion', chunks: [{ displayText: 'dis', speechText: 'dis' }, { displayText: 'cus', speechText: 'kush' }, { displayText: 'sion', speechText: 'un' }] },
      { targetId: 'pp3-support-15', word: 'observations', sentenceId: 'pp3-p4-s8', focus: 'tion', chunks: [{ displayText: 'ob', speechText: 'ob' }, { displayText: 'ser', speechText: 'zur' }, { displayText: 'va', speechText: 'vay' }, { displayText: 'tions', speechText: 'shunz' }] },
      { targetId: 'pp3-support-16', word: 'portable', sentenceId: 'pp3-p4-s12', focus: 'able', chunks: [{ displayText: 'port', speechText: 'por' }, { displayText: 'a', speechText: 'tuh' }, { displayText: 'ble', speechText: 'bul' }] },
    ],
    minorEvidenceId: 'pp3-p4-s1',
  },
  {
    passageId: PERSPECTIVE_PORTAL_PASSAGE_IDS[4],
    title: 'The Weather Balloon Test',
    difficulty: 3,
    situationId: 'pp3-situation-balloon-test',
    situationLabel: 'which test should come first before a weather balloon launch',
    relationship: 'different',
    comparisonStatement: 'Niko wants a short tethered outdoor test to study the real wind, while Esme wants to finish the indoor sensor checklist before moving outside.',
    comparisonDistractors: [
      'Niko wants to skip every test, while Esme wants to cancel the weather project.',
      'Niko and Esme both believe only the indoor checklist can reveal useful information.',
      'The narrator favors Esme by describing the laboratory in third person.',
    ],
    characterA: {
      characterId: 'pp3-p5-niko', name: 'Niko',
      perspective: 'Niko believes a short tethered outdoor test should come first because the team needs to observe how the balloon behaves in the actual wind.',
      motivation: 'He wants real outdoor movement data before the launch window closes.',
      evidenceIds: ['pp3-p5-s2', 'pp3-p5-s7', 'pp3-p5-s12'], evidenceKinds: ['dialogue', 'thought', 'action'],
      feelingOnly: 'Niko feels impatient.', traitOnly: 'Niko is adventurous.',
    },
    characterB: {
      characterId: 'pp3-p5-esme', name: 'Esme',
      perspective: 'Esme believes the team should finish checking and calibrating every sensor indoors before exposing the equipment to the wind.',
      motivation: 'She wants to know the instruments are sealed and recording accurately before an outdoor test.',
      evidenceIds: ['pp3-p5-s3', 'pp3-p5-s6', 'pp3-p5-s10'], evidenceKinds: ['dialogue', 'action', 'thought'],
      feelingOnly: 'Esme feels uneasy.', traitOnly: 'Esme is precise.',
    },
    sentences: [
      { sentenceId: 'pp3-p5-s1', text: 'Niko and Esme prepared a weather balloon for the science center\'s afternoon demonstration.' },
      { sentenceId: 'pp3-p5-s2', text: 'Niko held the tether spool and said, "The breeze is changing now, so a short outdoor test will show how the balloon really moves."' },
      { sentenceId: 'pp3-p5-s3', text: 'Esme kept the sensor case on the workbench and replied, "We should complete the calibration list before the equipment meets the wind."' },
      { sentenceId: 'pp3-p5-s4', text: 'Both students wanted reliable information from a safe demonstration.' },
      { sentenceId: 'pp3-p5-s5', text: 'The launch schedule left enough time for one full test and one quick test.' },
      { sentenceId: 'pp3-p5-s6', text: 'Esme checked the temperature instrument, the battery light, and the seal around the data wire.' },
      { sentenceId: 'pp3-p5-s7', text: 'Niko stepped to the open doorway and watched ribbons on the fence lift, twist, and settle.' },
      { sentenceId: 'pp3-p5-s8', text: 'He thought indoor numbers could not show whether the tether would pull sideways near the roof.' },
      { sentenceId: 'pp3-p5-s9', text: 'Esme noticed a tiny air bubble beneath the clear tape covering one wire opening.' },
      { sentenceId: 'pp3-p5-s10', text: 'She wondered whether moving air could loosen that tape and interrupt the signal.' },
      { sentenceId: 'pp3-p5-s11', text: 'They compared concerns and divided the remaining time instead of choosing one test for everything.' },
      { sentenceId: 'pp3-p5-s12', text: 'Niko performed a quick tether pull with an empty practice balloon while Esme resealed and calibrated the instrument case.' },
      { sentenceId: 'pp3-p5-s13', text: 'His test revealed a sideways tug near the roof, and her test produced a steady signal without gaps.' },
      { sentenceId: 'pp3-p5-s14', text: 'They moved the launch line away from the roof and attached the checked sensor case.' },
      { sentenceId: 'pp3-p5-s15', text: 'During the demonstration, the balloon rose on a clear path and sent back a complete set of measurements.' },
      { sentenceId: 'pp3-p5-s16', text: 'Niko recorded the wind behavior while Esme saved the sensor results for the next launch.' },
    ],
    support: [
      { targetId: 'pp3-support-17', word: 'calibration', sentenceId: 'pp3-p5-s3', focus: 'tion', chunks: [{ displayText: 'cal', speechText: 'kal' }, { displayText: 'i', speechText: 'uh' }, { displayText: 'bra', speechText: 'bray' }, { displayText: 'tion', speechText: 'shun' }] },
      { targetId: 'pp3-support-18', word: 'equipment', sentenceId: 'pp3-p5-s3', focus: 'ment', chunks: [{ displayText: 'e', speechText: 'ee' }, { displayText: 'quip', speechText: 'kwip' }, { displayText: 'ment', speechText: 'ment' }] },
      { targetId: 'pp3-support-19', word: 'instrument', sentenceId: 'pp3-p5-s6', focus: 'stru', chunks: [{ displayText: 'in', speechText: 'in' }, { displayText: 'stru', speechText: 'struh' }, { displayText: 'ment', speechText: 'ment' }] },
      { targetId: 'pp3-support-20', word: 'measurements', sentenceId: 'pp3-p5-s15', focus: 'measure', chunks: [{ displayText: 'meas', speechText: 'mezh' }, { displayText: 'ure', speechText: 'ur' }, { displayText: 'ments', speechText: 'ments' }] },
    ],
    minorEvidenceId: 'pp3-p5-s5',
  },
  {
    passageId: PERSPECTIVE_PORTAL_PASSAGE_IDS[5],
    title: 'The Lantern Path',
    difficulty: 3,
    situationId: 'pp3-situation-lantern-path',
    situationLabel: 'how to make an evening festival path clear and safe',
    relationship: 'similar',
    comparisonStatement: 'Mei and Arlo both believe visitors need a clearly marked safe path, although Mei emphasizes light spacing and Arlo emphasizes reflective directions.',
    comparisonDistractors: [
      'Mei wants visitors to follow the path, while Arlo wants them to wander without directions.',
      'Mei cares only about decoration, while Arlo cares only about ending the festival early.',
      'The author believes lanterns are better than signs in every situation.',
    ],
    characterA: {
      characterId: 'pp3-p6-mei', name: 'Mei',
      perspective: 'Mei believes evenly spaced lanterns should guide visitors by keeping every turn and dark section of the path visible.',
      motivation: 'She notices shadows between widely spaced lights and wants people to see where they are walking.',
      evidenceIds: ['pp3-p6-s2', 'pp3-p6-s6', 'pp3-p6-s12'], evidenceKinds: ['dialogue', 'noticing', 'action'],
      feelingOnly: 'Mei feels alert.', traitOnly: 'Mei is artistic.',
    },
    characterB: {
      characterId: 'pp3-p6-arlo', name: 'Arlo',
      perspective: 'Arlo believes reflective arrows and entrance markers should guide visitors wherever the path divides.',
      motivation: 'He notices that light alone does not tell visitors which branch leads to each activity.',
      evidenceIds: ['pp3-p6-s3', 'pp3-p6-s7', 'pp3-p6-s13'], evidenceKinds: ['dialogue', 'thought', 'action'],
      feelingOnly: 'Arlo feels focused.', traitOnly: 'Arlo is inventive.',
    },
    sentences: [
      { sentenceId: 'pp3-p6-s1', text: 'Mei and Arlo were assigned to mark the winding path for an evening school festival.' },
      { sentenceId: 'pp3-p6-s2', text: 'Mei placed a lantern at the entrance and said, "People need steady light at every turn so they can see the whole walking path."' },
      { sentenceId: 'pp3-p6-s3', text: 'Arlo held up a reflective arrow and replied, "People also need to know which branch reaches the music and which reaches the exhibits."' },
      { sentenceId: 'pp3-p6-s4', text: 'They both wanted families to move confidently without missing a turn.' },
      { sentenceId: 'pp3-p6-s5', text: 'They arranged a practice route before sunset and invited two helpers to walk it after the sky darkened.' },
      { sentenceId: 'pp3-p6-s6', text: 'Mei noticed a shadowy gap where a tree blocked the glow from two lanterns.' },
      { sentenceId: 'pp3-p6-s7', text: 'Arlo thought the bright entrance still did not explain which of two paths led to the exhibits.' },
      { sentenceId: 'pp3-p6-s8', text: 'One helper slowed in the shadow, and the other started down the music path while looking for the art room.' },
      { sentenceId: 'pp3-p6-s9', text: 'Mei explained that another light could make the hidden curve visible.' },
      { sentenceId: 'pp3-p6-s10', text: 'Arlo explained that an arrow could name the destination before the paths separated.' },
      { sentenceId: 'pp3-p6-s11', text: 'Neither idea competed with the other because each solved a different part of the same guidance problem.' },
      { sentenceId: 'pp3-p6-s12', text: 'Mei moved an illuminated lantern into the shadowy gap and checked the curve from both directions.' },
      { sentenceId: 'pp3-p6-s13', text: 'Arlo attached reflective labels at the entrance and at every fork.' },
      { sentenceId: 'pp3-p6-s14', text: 'On the second walk, the helpers saw each step and chose the correct branch without stopping.' },
      { sentenceId: 'pp3-p6-s15', text: 'Mei and Arlo drew both kinds of markers on the final path map.' },
    ],
    support: [
      { targetId: 'pp3-support-21', word: 'reflective', sentenceId: 'pp3-p6-s3', focus: 'reflect', chunks: [{ displayText: 're', speechText: 'ree' }, { displayText: 'flec', speechText: 'flek' }, { displayText: 'tive', speechText: 'tiv' }] },
      { targetId: 'pp3-support-22', word: 'confidently', sentenceId: 'pp3-p6-s4', focus: 'ly', chunks: [{ displayText: 'con', speechText: 'kon' }, { displayText: 'fi', speechText: 'fuh' }, { displayText: 'dent', speechText: 'dunt' }, { displayText: 'ly', speechText: 'lee' }] },
      { targetId: 'pp3-support-23', word: 'destination', sentenceId: 'pp3-p6-s10', focus: 'tion', chunks: [{ displayText: 'des', speechText: 'des' }, { displayText: 'ti', speechText: 'tuh' }, { displayText: 'na', speechText: 'nay' }, { displayText: 'tion', speechText: 'shun' }] },
      { targetId: 'pp3-support-24', word: 'illuminated', sentenceId: 'pp3-p6-s12', focus: 'lumin', chunks: [{ displayText: 'il', speechText: 'ih' }, { displayText: 'lu', speechText: 'loo' }, { displayText: 'mi', speechText: 'muh' }, { displayText: 'nat', speechText: 'nay' }, { displayText: 'ed', speechText: 'tid' }] },
    ],
    minorEvidenceId: 'pp3-p6-s1',
  },
  {
    passageId: PERSPECTIVE_PORTAL_PASSAGE_IDS[6],
    title: 'The Marsh Platform',
    difficulty: 3,
    situationId: 'pp3-situation-marsh-platform',
    situationLabel: 'whether every side of a marsh observation platform should remain open',
    relationship: 'different',
    comparisonStatement: 'Camille first wants every side of the platform open for visitors, while Jae wants to close and reroute one side to protect nesting birds.',
    comparisonDistractors: [
      'Camille wants to protect the nest, while Jae wants visitors to crowd around it.',
      'Camille and Jae both believe the platform should close for the entire season.',
      'The narrator dislikes visitors because the story is told in third person.',
    ],
    characterA: {
      characterId: 'pp3-p7-camille', name: 'Camille',
      perspective: 'Camille initially believes all sides of the observation platform should stay open so visitors can use the full view promised on the center map.',
      motivation: 'She wants families to enjoy the planned visit without an unexpected closure.',
      evidenceIds: ['pp3-p7-s2', 'pp3-p7-s6', 'pp3-p7-s14'], evidenceKinds: ['dialogue', 'thought', 'choice'],
      feelingOnly: 'Camille feels disappointed.', traitOnly: 'Camille is welcoming.',
    },
    characterB: {
      characterId: 'pp3-p7-jae', name: 'Jae',
      perspective: 'Jae believes the platform side nearest the new nest should close temporarily and visitors should use a quieter viewing route.',
      motivation: 'He notices the parent birds reacting to nearby movement and wants to protect the nesting area.',
      evidenceIds: ['pp3-p7-s3', 'pp3-p7-s7', 'pp3-p7-s11'], evidenceKinds: ['dialogue', 'action', 'noticing'],
      feelingOnly: 'Jae feels concerned.', traitOnly: 'Jae is protective.',
    },
    change: {
      characterId: 'pp3-p7-camille',
      earlierPerspective: 'Camille believes keeping every platform side open matters most for the promised visitor experience.',
      laterPerspective: 'Camille believes a temporary quiet route can protect the nest while still giving visitors a useful marsh view.',
      evidenceIds: ['pp3-p7-s2', 'pp3-p7-s10', 'pp3-p7-s14'],
      cause: 'Watching a parent bird circle without landing helps Camille understand how the open platform affects the nest.',
      summary: 'Camille changes from insisting on the full platform view to supporting a temporary quiet route that protects the birds.',
      distractors: ['Camille continues to believe visitor convenience matters more than the nesting birds.', 'Camille feels surprised when the bird circles.', 'The narrator changes from third person to first person.'],
    },
    sentences: [
      { sentenceId: 'pp3-p7-s1', text: 'Camille and Jae prepared the marsh observation platform for a weekend nature walk.' },
      { sentenceId: 'pp3-p7-s2', text: 'Camille unfolded the visitor map and said, "Families expect the full platform view, so we should keep every side open."' },
      { sentenceId: 'pp3-p7-s3', text: 'Jae pointed toward reeds below the east rail and replied, "A bird built a nest there, so this side should close temporarily."' },
      { sentenceId: 'pp3-p7-s4', text: 'Both students wanted visitors to learn about the marsh without harming it.' },
      { sentenceId: 'pp3-p7-s5', text: 'Camille worried that a closed rail would confuse families who followed the printed platform route.' },
      { sentenceId: 'pp3-p7-s6', text: 'She thought one morning of footsteps could not matter much if visitors stayed behind the rail.' },
      { sentenceId: 'pp3-p7-s7', text: 'Jae placed a marker several steps from the nest and watched from the shaded entrance.' },
      { sentenceId: 'pp3-p7-s8', text: 'When two volunteers crossed the east side, a parent bird rose from the reeds and circled above the water.' },
      { sentenceId: 'pp3-p7-s9', text: 'The volunteers moved away, but the bird continued circling instead of returning to the nest.' },
      { sentenceId: 'pp3-p7-s10', text: 'Camille watched the empty nest and whispered, "Our footsteps are changing what the bird can do."' },
      { sentenceId: 'pp3-p7-s11', text: 'Jae tested a western loop where tall grasses screened visitors from the nesting area.' },
      { sentenceId: 'pp3-p7-s12', text: 'From that loop, the volunteers could still see frogs, dragonflies, and most of the open water.' },
      { sentenceId: 'pp3-p7-s13', text: 'The parent bird returned to the nest after the platform became quiet.' },
      { sentenceId: 'pp3-p7-s14', text: 'Camille covered the east route on the map, drew the alternate loop, and labeled the change, "Quiet path during nesting season."' },
      { sentenceId: 'pp3-p7-s15', text: 'She explained the temporary route at the walk and invited visitors to look for the bird from a distance.' },
      { sentenceId: 'pp3-p7-s16', text: 'Jae added a note that the full platform could reopen after the young birds left the nest.' },
    ],
    support: [
      { targetId: 'pp3-support-25', word: 'observation', sentenceId: 'pp3-p7-s1', focus: 'tion', chunks: [{ displayText: 'ob', speechText: 'ob' }, { displayText: 'ser', speechText: 'zur' }, { displayText: 'va', speechText: 'vay' }, { displayText: 'tion', speechText: 'shun' }] },
      { targetId: 'pp3-support-26', word: 'platform', sentenceId: 'pp3-p7-s1', focus: 'form', chunks: [{ displayText: 'plat', speechText: 'plat' }, { displayText: 'form', speechText: 'form' }] },
      { targetId: 'pp3-support-27', word: 'temporarily', sentenceId: 'pp3-p7-s3', focus: 'tempor', chunks: [{ displayText: 'tem', speechText: 'tem' }, { displayText: 'po', speechText: 'puh' }, { displayText: 'rar', speechText: 'rair' }, { displayText: 'i', speechText: 'uh' }, { displayText: 'ly', speechText: 'lee' }] },
      { targetId: 'pp3-support-28', word: 'alternate', sentenceId: 'pp3-p7-s14', focus: 'alter', chunks: [{ displayText: 'al', speechText: 'awl' }, { displayText: 'ter', speechText: 'tur' }, { displayText: 'nate', speechText: 'nut' }] },
    ],
    minorEvidenceId: 'pp3-p7-s1',
  },
]

export const perspectivePortalPassages: Passage[] = perspectivePortalStories.map((story) => ({
  passageIdentifier: story.passageId,
  title: story.title,
  passageText: story.sentences.map((sentence) => sentence.text).join(' '),
  readingContext: story.title,
  sentences: story.sentences,
  genre: 'literary',
  gradeBand: 3,
  reviewStatus: 'DRAFT',
  contentVersion: PERSPECTIVE_PORTAL_VERSION,
  wordSupportTargets: story.support.map((target) => ({
    targetId: target.targetId,
    passageId: story.passageId,
    sentenceId: target.sentenceId,
    surfaceWord: target.word,
    focusParts: buildFocusParts(target.word, target.focus),
    displayChunks: target.chunks,
    spokenChunks: target.chunks,
    blendSpeechText: target.word,
    wholeWordSpeechText: target.word,
    sentenceSpeechText: story.sentences.find((sentence) => sentence.sentenceId === target.sentenceId)?.text ?? '',
    reviewStatus: 'DRAFT',
    contentVersion: PERSPECTIVE_PORTAL_VERSION,
  })),
}))

export const characterPerspectiveGuides: CharacterPerspectiveGuide[] = perspectivePortalStories.map((story, index) => ({
  passageId: story.passageId,
  characters: [story.characterA, story.characterB].map((character) => ({
    characterId: character.characterId,
    characterName: character.name,
    situationId: story.situationId,
    perspectiveStatement: character.perspective,
    evidenceIds: character.evidenceIds,
    evidenceKinds: character.evidenceKinds,
    motivationStatement: character.motivation,
  })),
  comparisons: [{
    comparisonId: `pp3-p${index + 1}-comparison`,
    characterAId: story.characterA.characterId,
    characterBId: story.characterB.characterId,
    situationId: story.situationId,
    relationship: story.relationship,
    comparisonStatement: story.comparisonStatement,
    characterAEvidenceIds: story.characterA.evidenceIds,
    characterBEvidenceIds: story.characterB.evidenceIds,
  }],
  perspectiveChanges: story.change ? [{
    characterId: story.change.characterId,
    earlierPerspectiveStatement: story.change.earlierPerspective,
    laterPerspectiveStatement: story.change.laterPerspective,
    changeEvidenceIds: story.change.evidenceIds,
    causeStatement: story.change.cause,
  }] : [],
  importantEvidenceIds: [...new Set([
    ...story.characterA.evidenceIds,
    ...story.characterB.evidenceIds,
    ...(story.change?.evidenceIds ?? []),
  ])],
  reviewStatus: 'DRAFT',
  contentVersion: PERSPECTIVE_PORTAL_VERSION,
}))

export const perspectivePortalCoveragePatterns = [
  'character-perspective',
  'different-character-perspectives',
  'similar-character-perspectives',
  'perspective-evidence',
  'perspective-change',
] as const

function buildFocusParts(word: string, focus: string) {
  const index = word.toLowerCase().indexOf(focus.toLowerCase())
  if (index < 0) return [{ text: word, emphasis: true }]
  return [
    { text: word.slice(0, index), emphasis: false },
    { text: word.slice(index, index + focus.length), emphasis: true },
    { text: word.slice(index + focus.length), emphasis: false },
  ].filter((part) => part.text.length > 0)
}
