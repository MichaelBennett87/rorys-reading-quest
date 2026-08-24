import type { Passage } from '../../../../types'
import type { CharacterDevelopmentArc, CharacterDevelopmentGuide } from '../../../contentPackTypes'
import {
  CHARACTER_ARC_BENCHMARK,
  CHARACTER_ARC_PASSAGE_IDS,
  CHARACTER_ARC_VERSION,
} from './ids'

interface SupportSpec {
  targetId: string
  word: string
  sentenceId: string
  focusParts: string[]
  chunks: Array<{ displayText: string; speechText: string }>
}

export interface CharacterArcStoryRecord {
  passageId: string
  title: string
  difficulty: number
  sentences: Array<{ sentenceId: string; text: string }>
  support: SupportSpec[]
  arcs: CharacterDevelopmentArc[]
  primaryCharacter: string
  beginningChoice: string
  turningChoice: string
  endingChoice: string
  developmentChoice: string
  traitOnlyChoice: string
  unrelatedChoice: string
  beginningEvidenceId: string
  turningEvidenceId: string
  endingEvidenceId: string
  minorEvidenceId: string
  combinedDevelopmentChoice?: string
}

const arc = (
  passageNumber: number,
  characterId: string,
  characterName: string,
  developmentKind: CharacterDevelopmentArc['developmentKind'],
  stages: CharacterDevelopmentArc['stages'],
  turningPointEvidenceIds: string[],
  plotCauseStatement: string,
  developmentSummary: string,
): CharacterDevelopmentArc => ({
  characterId,
  characterName,
  developmentKind,
  stages: stages.map((stage, index) => ({ ...stage, stageId: `g3-ss-cac-p${passageNumber}-${characterId}-stage-${index + 1}` })) as CharacterDevelopmentArc['stages'],
  turningPointEvidenceIds,
  plotCauseStatement,
  developmentSummary,
})

export const characterArcStories: CharacterArcStoryRecord[] = [
  {
    passageId: CHARACTER_ARC_PASSAGE_IDS[0],
    title: 'The Quiet Map Maker',
    difficulty: 0,
    sentences: [
      { sentenceId: 'cac-p1-s1', text: 'At camp, Mina carefully drew a map for the short creek walk.' },
      { sentenceId: 'cac-p1-s2', text: 'She had a useful idea for marking a safe turn, but she kept her pencil still.' },
      { sentenceId: 'cac-p1-s3', text: '“Someone else probably has a better suggestion,” Mina whispered.' },
      { sentenceId: 'cac-p1-s4', text: 'She felt uncertain when the group reached two paths that looked alike.' },
      { sentenceId: 'cac-p1-s5', text: 'A gust folded the old map, and the campers could no longer see the faded arrow.' },
      { sentenceId: 'cac-p1-s6', text: 'Ana asked, “Mina, did you notice a clue while you were drawing?”' },
      { sentenceId: 'cac-p1-s7', text: 'Mina opened her map, explained her suggestion, and pointed to the creek stones beside the safe path.' },
      { sentenceId: 'cac-p1-s8', text: 'By the end, the group followed her mark, and Mina felt confident enough to label the next turn aloud.' },
    ],
    support: [
      { targetId: 'cac-support-1', word: 'carefully', sentenceId: 'cac-p1-s1', focusParts: ['care'], chunks: [{ displayText: 'care', speechText: 'care' }, { displayText: 'ful', speechText: 'ful' }, { displayText: 'ly', speechText: 'lee' }] },
      { targetId: 'cac-support-2', word: 'suggestion', sentenceId: 'cac-p1-s3', focusParts: ['tion'], chunks: [{ displayText: 'sug', speechText: 'sug' }, { displayText: 'ges', speechText: 'jes' }, { displayText: 'tion', speechText: 'chun' }] },
      { targetId: 'cac-support-3', word: 'uncertain', sentenceId: 'cac-p1-s4', focusParts: ['un'], chunks: [{ displayText: 'un', speechText: 'un' }, { displayText: 'cer', speechText: 'sur' }, { displayText: 'tain', speechText: 'tun' }] },
      { targetId: 'cac-support-4', word: 'confident', sentenceId: 'cac-p1-s8', focusParts: ['con'], chunks: [{ displayText: 'con', speechText: 'con' }, { displayText: 'fi', speechText: 'fuh' }, { displayText: 'dent', speechText: 'dent' }] },
    ],
    arcs: [arc(1, 'mina', 'Mina', 'builds-confidence', [
      { stageId: '', stage: 'beginning', stateStatement: 'Mina keeps her useful map idea to herself because she doubts it.', plotEventStatement: 'The campers begin a creek walk and need a clear map.', evidenceIds: ['cac-p1-s2', 'cac-p1-s3'], evidenceKinds: ['action', 'dialogue', 'thought'] },
      { stageId: '', stage: 'middle', stateStatement: 'Mina answers when the missing arrow makes her observation important.', plotEventStatement: 'The old map folds at a confusing fork, and Ana asks Mina about her clue.', evidenceIds: ['cac-p1-s5', 'cac-p1-s6', 'cac-p1-s7'], evidenceKinds: ['response-to-event', 'dialogue', 'choice', 'action'] },
      { stageId: '', stage: 'end', stateStatement: 'Mina confidently shares another map label aloud.', plotEventStatement: 'Her creek-stone mark guides the group onto the safe path.', evidenceIds: ['cac-p1-s8'], evidenceKinds: ['action', 'feeling'] },
    ], ['cac-p1-s6', 'cac-p1-s7'], 'The confusing fork gives Mina a real reason to trust and share her careful observation.', 'At first Mina hides her idea; after the group loses its arrow, she explains her clue; by the end she confidently labels the next turn aloud.')],
    primaryCharacter: 'Mina',
    beginningChoice: 'Mina has a useful map idea but keeps it to herself.',
    turningChoice: 'The old arrow disappears, and Ana asks Mina about the clue she noticed.',
    endingChoice: 'Mina confidently labels the next turn aloud.',
    developmentChoice: 'At first Mina hides her idea, but after her clue helps the group, she shares map ideas with confidence.',
    traitOnlyChoice: 'Mina is careful.',
    unrelatedChoice: 'Mina likes walking beside creeks.',
    beginningEvidenceId: 'cac-p1-s2',
    turningEvidenceId: 'cac-p1-s6',
    endingEvidenceId: 'cac-p1-s8',
    minorEvidenceId: 'cac-p1-s1',
  },
  {
    passageId: CHARACTER_ARC_PASSAGE_IDS[1],
    title: 'The Kite Sign',
    difficulty: 0,
    sentences: [
      { sentenceId: 'cac-p2-s1', text: 'Theo gathered the materials for a kite-shaped camp sign.' },
      { sentenceId: 'cac-p2-s2', text: 'He measured one stick quickly, then said, “That looks close enough.”' },
      { sentenceId: 'cac-p2-s3', text: 'Theo wanted to finish first, so he tied the frame before checking the second side.' },
      { sentenceId: 'cac-p2-s4', text: 'When the group lifted the sign, the short side bent and the paper wrinkled.' },
      { sentenceId: 'cac-p2-s5', text: 'Theo noticed that everyone had to stop because of his rushed choice.' },
      { sentenceId: 'cac-p2-s6', text: 'He thought, I can either blame the wind or fix what I skipped.' },
      { sentenceId: 'cac-p2-s7', text: '“I rushed the frame,” Theo admitted, and he repaired it with two equal sticks.' },
      { sentenceId: 'cac-p2-s8', text: 'By the end, Theo checked every knot and invited a partner to test the finished sign.' },
    ],
    support: [
      { targetId: 'cac-support-5', word: 'materials', sentenceId: 'cac-p2-s1', focusParts: ['mater'], chunks: [{ displayText: 'ma', speechText: 'muh' }, { displayText: 'te', speechText: 'teer' }, { displayText: 'ri', speechText: 'ree' }, { displayText: 'als', speechText: 'ulz' }] },
      { targetId: 'cac-support-6', word: 'measured', sentenceId: 'cac-p2-s2', focusParts: ['meas'], chunks: [{ displayText: 'meas', speechText: 'mezh' }, { displayText: 'ured', speechText: 'urd' }] },
      { targetId: 'cac-support-7', word: 'noticed', sentenceId: 'cac-p2-s5', focusParts: ['notice'], chunks: [{ displayText: 'no', speechText: 'noh' }, { displayText: 'ticed', speechText: 'tist' }] },
      { targetId: 'cac-support-8', word: 'repaired', sentenceId: 'cac-p2-s7', focusParts: ['re'], chunks: [{ displayText: 're', speechText: 'ree' }, { displayText: 'paired', speechText: 'paird' }] },
    ],
    arcs: [arc(2, 'theo', 'Theo', 'becomes-more-responsible', [
      { stageId: '', stage: 'beginning', stateStatement: 'Theo rushes because finishing first matters more to him than checking his work.', plotEventStatement: 'The group begins building a kite-shaped sign.', evidenceIds: ['cac-p2-s2', 'cac-p2-s3'], evidenceKinds: ['action', 'dialogue', 'choice'] },
      { stageId: '', stage: 'middle', stateStatement: 'Theo recognizes that his rushed choice caused the problem and decides to repair it.', plotEventStatement: 'The uneven frame bends when the group lifts it.', evidenceIds: ['cac-p2-s4', 'cac-p2-s5', 'cac-p2-s6', 'cac-p2-s7'], evidenceKinds: ['response-to-event', 'thought', 'dialogue', 'action', 'choice'] },
      { stageId: '', stage: 'end', stateStatement: 'Theo checks his work and asks a partner to test it.', plotEventStatement: 'The repaired sign is ready for a final check.', evidenceIds: ['cac-p2-s8'], evidenceKinds: ['action', 'choice'] },
    ], ['cac-p2-s5', 'cac-p2-s6'], 'Seeing the group stop because of his shortcut helps Theo accept responsibility and change how he works.', 'At first Theo rushes without checking; after the frame bends, he admits and repairs his mistake; by the end he checks every knot with a partner.')],
    primaryCharacter: 'Theo',
    beginningChoice: 'Theo rushes because he wants to finish first.',
    turningChoice: 'Theo notices that his rushed choice made the whole group stop.',
    endingChoice: 'Theo checks every knot and asks a partner to test the sign.',
    developmentChoice: 'At first Theo rushes, but after his frame bends, he takes responsibility and checks his work.',
    traitOnlyChoice: 'Theo is creative.',
    unrelatedChoice: 'Theo prefers paper signs to wooden signs.',
    beginningEvidenceId: 'cac-p2-s3',
    turningEvidenceId: 'cac-p2-s5',
    endingEvidenceId: 'cac-p2-s8',
    minorEvidenceId: 'cac-p2-s1',
  },
  {
    passageId: CHARACTER_ARC_PASSAGE_IDS[2],
    title: 'The Bent Trail Marker',
    difficulty: 1,
    sentences: [
      { sentenceId: 'cac-p3-s1', text: 'Jalen led his cabin group toward a marker that had fallen across the trail.' },
      { sentenceId: 'cac-p3-s2', text: 'He tugged the heavy post twice and said, “I can move it if I pull harder.”' },
      { sentenceId: 'cac-p3-s3', text: 'The obstacle scraped the ground but did not lift.' },
      { sentenceId: 'cac-p3-s4', text: 'Mara pointed to two loose boards and suggested rebuilding the marker where it stood.' },
      { sentenceId: 'cac-p3-s5', text: 'Jalen almost pulled again, because changing his plan felt like giving up.' },
      { sentenceId: 'cac-p3-s6', text: 'Then he noticed that his friends were waiting with rope, nails, and a possible solution.' },
      { sentenceId: 'cac-p3-s7', text: '“Let us try the flexible plan,” Jalen said as he handed Mara the rope.' },
      { sentenceId: 'cac-p3-s8', text: 'The group adjusted the boards, tied the post upright, and cleared the path.' },
      { sentenceId: 'cac-p3-s9', text: 'Jalen thought, A new plan can still reach the same goal.' },
      { sentenceId: 'cac-p3-s10', text: 'By the end, he asked for everyone’s ideas before choosing how to repair the next marker.' },
    ],
    support: [
      { targetId: 'cac-support-9', word: 'obstacle', sentenceId: 'cac-p3-s3', focusParts: ['stac'], chunks: [{ displayText: 'ob', speechText: 'ob' }, { displayText: 'sta', speechText: 'stuh' }, { displayText: 'cle', speechText: 'kul' }] },
      { targetId: 'cac-support-10', word: 'solution', sentenceId: 'cac-p3-s6', focusParts: ['tion'], chunks: [{ displayText: 'so', speechText: 'suh' }, { displayText: 'lu', speechText: 'loo' }, { displayText: 'tion', speechText: 'shun' }] },
      { targetId: 'cac-support-11', word: 'flexible', sentenceId: 'cac-p3-s7', focusParts: ['flex'], chunks: [{ displayText: 'flex', speechText: 'flex' }, { displayText: 'i', speechText: 'uh' }, { displayText: 'ble', speechText: 'bul' }] },
      { targetId: 'cac-support-12', word: 'adjusted', sentenceId: 'cac-p3-s8', focusParts: ['just'], chunks: [{ displayText: 'ad', speechText: 'uhd' }, { displayText: 'just', speechText: 'just' }, { displayText: 'ed', speechText: 'id' }] },
    ],
    arcs: [arc(3, 'jalen', 'Jalen', 'changes-strategy', [
      { stageId: '', stage: 'beginning', stateStatement: 'Jalen insists on solving the problem by pulling harder.', plotEventStatement: 'A heavy fallen marker blocks the trail.', evidenceIds: ['cac-p3-s1', 'cac-p3-s2'], evidenceKinds: ['action', 'dialogue', 'choice'] },
      { stageId: '', stage: 'middle', stateStatement: 'Jalen pauses, notices the group’s materials, and agrees to rebuild instead.', plotEventStatement: 'His pulling fails, and Mara offers a workable new plan.', evidenceIds: ['cac-p3-s4', 'cac-p3-s5', 'cac-p3-s6', 'cac-p3-s7'], evidenceKinds: ['dialogue', 'thought', 'response-to-event', 'choice', 'action'] },
      { stageId: '', stage: 'end', stateStatement: 'Jalen asks for ideas before selecting a repair strategy.', plotEventStatement: 'The flexible plan repairs the marker and clears the trail.', evidenceIds: ['cac-p3-s8', 'cac-p3-s9', 'cac-p3-s10'], evidenceKinds: ['action', 'thought', 'choice'] },
    ], ['cac-p3-s6', 'cac-p3-s7'], 'The failed pull and the group’s ready materials show Jalen that changing strategy can solve the same problem.', 'At first Jalen repeats his own plan; after he sees the group’s solution, he changes strategy; by the end he asks for ideas before acting.')],
    primaryCharacter: 'Jalen',
    beginningChoice: 'Jalen keeps trying to move the marker by pulling harder.',
    turningChoice: 'Jalen notices his friends waiting with materials for another solution.',
    endingChoice: 'Jalen asks for everyone’s ideas before choosing a repair plan.',
    developmentChoice: 'At first Jalen repeats one failed plan, but after listening to the group, he becomes willing to change strategies.',
    traitOnlyChoice: 'Jalen is strong.',
    unrelatedChoice: 'Jalen enjoys walking on marked trails.',
    beginningEvidenceId: 'cac-p3-s2',
    turningEvidenceId: 'cac-p3-s6',
    endingEvidenceId: 'cac-p3-s10',
    minorEvidenceId: 'cac-p3-s3',
  },
  {
    passageId: CHARACTER_ARC_PASSAGE_IDS[3],
    title: 'The Lantern Plan',
    difficulty: 1,
    sentences: [
      { sentenceId: 'cac-p4-s1', text: 'Sora and Ben were assigned to build one lantern display for the camp porch.' },
      { sentenceId: 'cac-p4-s2', text: 'Sora wanted to work alone and said, “Two plans will only slow us down.”' },
      { sentenceId: 'cac-p4-s3', text: 'Ben quietly folded paper shades, but he worried that his first crooked fold had ruined them.' },
      { sentenceId: 'cac-p4-s4', text: 'Sora grew frustrated when her tall frame tipped under the heavy shades.' },
      { sentenceId: 'cac-p4-s5', text: 'Ben started packing the paper away and thought, I should let Sora finish without me.' },
      { sentenceId: 'cac-p4-s6', text: 'A counselor asked them to name one useful part of each plan.' },
      { sentenceId: 'cac-p4-s7', text: 'Sora studied Ben’s wide base and said, “Your shape could steady my frame.”' },
      { sentenceId: 'cac-p4-s8', text: 'Encouraged, Ben unfolded a new sheet and tried the difficult fold again.' },
      { sentenceId: 'cac-p4-s9', text: 'Sora held the paper while Ben creased it, and Ben braced the frame while Sora tied it.' },
      { sentenceId: 'cac-p4-s10', text: 'By the end, they completed one bright lantern and each asked what the other thought before adding a final star.' },
    ],
    support: [
      { targetId: 'cac-support-13', word: 'frustrated', sentenceId: 'cac-p4-s4', focusParts: ['frus'], chunks: [{ displayText: 'frus', speechText: 'frus' }, { displayText: 'trat', speechText: 'trayt' }, { displayText: 'ed', speechText: 'id' }] },
      { targetId: 'cac-support-14', word: 'encouraged', sentenceId: 'cac-p4-s8', focusParts: ['en'], chunks: [{ displayText: 'en', speechText: 'en' }, { displayText: 'cour', speechText: 'kur' }, { displayText: 'aged', speechText: 'ijd' }] },
      { targetId: 'cac-support-15', word: 'completed', sentenceId: 'cac-p4-s10', focusParts: ['complete'], chunks: [{ displayText: 'com', speechText: 'kum' }, { displayText: 'plet', speechText: 'pleet' }, { displayText: 'ed', speechText: 'id' }] },
      { targetId: 'cac-support-16', word: 'counselor', sentenceId: 'cac-p4-s6', focusParts: ['coun'], chunks: [{ displayText: 'coun', speechText: 'kown' }, { displayText: 'sel', speechText: 'suh' }, { displayText: 'or', speechText: 'lur' }] },
    ],
    arcs: [
      arc(4, 'sora', 'Sora', 'becomes-more-cooperative', [
        { stageId: '', stage: 'beginning', stateStatement: 'Sora rejects Ben’s help because she thinks two plans will slow the work.', plotEventStatement: 'Sora and Ben receive one shared lantern assignment.', evidenceIds: ['cac-p4-s1', 'cac-p4-s2'], evidenceKinds: ['action', 'dialogue', 'choice'] },
        { stageId: '', stage: 'middle', stateStatement: 'Sora recognizes that Ben’s wide base can strengthen her frame.', plotEventStatement: 'Her frame tips, and the counselor asks them to find value in both plans.', evidenceIds: ['cac-p4-s4', 'cac-p4-s6', 'cac-p4-s7'], evidenceKinds: ['response-to-event', 'dialogue', 'thought'] },
        { stageId: '', stage: 'end', stateStatement: 'Sora shares tasks and asks for Ben’s ideas.', plotEventStatement: 'Combining their plans creates a stable lantern.', evidenceIds: ['cac-p4-s9', 'cac-p4-s10'], evidenceKinds: ['action', 'choice', 'dialogue'] },
      ], ['cac-p4-s6', 'cac-p4-s7'], 'The tipped frame shows Sora that Ben’s different idea can improve their shared project.', 'At first Sora refuses to cooperate; after her frame tips, she values Ben’s plan; by the end she shares tasks and asks for his ideas.'),
      arc(4, 'ben', 'Ben', 'persists-after-setback', [
        { stageId: '', stage: 'beginning', stateStatement: 'Ben worries that one crooked fold means his paper work is ruined.', plotEventStatement: 'Ben begins making shades for the shared lantern.', evidenceIds: ['cac-p4-s3'], evidenceKinds: ['action', 'thought', 'feeling'] },
        { stageId: '', stage: 'middle', stateStatement: 'Ben nearly quits, then tries the difficult fold again after Sora values his design.', plotEventStatement: 'The frame tips, and Sora identifies Ben’s wide base as useful.', evidenceIds: ['cac-p4-s5', 'cac-p4-s7', 'cac-p4-s8'], evidenceKinds: ['action', 'thought', 'dialogue', 'response-to-event', 'choice'] },
        { stageId: '', stage: 'end', stateStatement: 'Ben keeps working and contributes to every final step.', plotEventStatement: 'The partners combine the base, frame, and paper shades.', evidenceIds: ['cac-p4-s9', 'cac-p4-s10'], evidenceKinds: ['action', 'dialogue'] },
      ], ['cac-p4-s7', 'cac-p4-s8'], 'Sora’s recognition of Ben’s useful design encourages him to try again after a discouraging fold.', 'At first Ben thinks one setback ruined his work; after Sora values his design, he tries again; by the end he persists and completes the lantern with her.'),
    ],
    primaryCharacter: 'Sora',
    beginningChoice: 'Sora wants to work alone, while Ben worries one mistake has ruined his work.',
    turningChoice: 'The counselor asks them to find one useful part of each plan.',
    endingChoice: 'Sora and Ben share tasks and ask for each other’s ideas.',
    developmentChoice: 'At first Sora rejects teamwork, but after her frame tips, she learns to combine her plan with Ben’s.',
    traitOnlyChoice: 'Sora is inventive, and Ben is quiet.',
    unrelatedChoice: 'Sora and Ben both like bright lanterns.',
    beginningEvidenceId: 'cac-p4-s2',
    turningEvidenceId: 'cac-p4-s6',
    endingEvidenceId: 'cac-p4-s10',
    minorEvidenceId: 'cac-p4-s1',
    combinedDevelopmentChoice: 'Sora becomes more cooperative, and Ben learns to persist after a setback.',
  },
  {
    passageId: CHARACTER_ARC_PASSAGE_IDS[4],
    title: 'The New Plan',
    difficulty: 1,
    sentences: [
      { sentenceId: 'cac-p5-s1', text: 'Priya’s camp team needed an organized plan for carrying art supplies to the outdoor stage.' },
      { sentenceId: 'cac-p5-s2', text: 'Priya drew one route and announced, “We should use my path because I finished it first.”' },
      { sentenceId: 'cac-p5-s3', text: 'When Luis pointed out a steep step, Priya folded her map and repeated that her route was fastest.' },
      { sentenceId: 'cac-p5-s4', text: 'The team loaded a cart, but its wide paint box caught against the narrow gate on Priya’s path.' },
      { sentenceId: 'cac-p5-s5', text: 'Priya pushed once, then stopped when a jar tipped toward the edge.' },
      { sentenceId: 'cac-p5-s6', text: 'She admitted to herself, I ignored the warning because I wanted my proposal chosen.' },
      { sentenceId: 'cac-p5-s7', text: 'Priya reconsidered her choice and asked Luis to show the longer path around the garden.' },
      { sentenceId: 'cac-p5-s8', text: 'His proposal included a flat ramp and a shaded place where the team could rest the cart.' },
      { sentenceId: 'cac-p5-s9', text: 'Priya added a safe turn from her map, and the team combined both ideas.' },
      { sentenceId: 'cac-p5-s10', text: 'By the end, Priya organized the carriers into pairs and asked each person to check the shared route.' },
      { sentenceId: 'cac-p5-s11', text: 'The supplies reached the stage safely, and Priya thanked Luis for speaking up.' },
    ],
    support: [
      { targetId: 'cac-support-17', word: 'admitted', sentenceId: 'cac-p5-s6', focusParts: ['mit'], chunks: [{ displayText: 'ad', speechText: 'ad' }, { displayText: 'mit', speechText: 'mit' }, { displayText: 'ted', speechText: 'id' }] },
      { targetId: 'cac-support-18', word: 'reconsidered', sentenceId: 'cac-p5-s7', focusParts: ['re'], chunks: [{ displayText: 're', speechText: 'ree' }, { displayText: 'con', speechText: 'kun' }, { displayText: 'sid', speechText: 'sid' }, { displayText: 'ered', speechText: 'urd' }] },
      { targetId: 'cac-support-19', word: 'proposal', sentenceId: 'cac-p5-s8', focusParts: ['pro'], chunks: [{ displayText: 'pro', speechText: 'pruh' }, { displayText: 'pos', speechText: 'pohz' }, { displayText: 'al', speechText: 'ul' }] },
      { targetId: 'cac-support-20', word: 'organized', sentenceId: 'cac-p5-s10', focusParts: ['organ'], chunks: [{ displayText: 'or', speechText: 'or' }, { displayText: 'gan', speechText: 'guh' }, { displayText: 'ized', speechText: 'nized' }] },
    ],
    arcs: [arc(5, 'priya', 'Priya', 'reconsiders-a-choice', [
      { stageId: '', stage: 'beginning', stateStatement: 'Priya insists on her own route and dismisses Luis’s warning.', plotEventStatement: 'The team must choose a route for a loaded art cart.', evidenceIds: ['cac-p5-s2', 'cac-p5-s3'], evidenceKinds: ['dialogue', 'choice', 'action'] },
      { stageId: '', stage: 'middle', stateStatement: 'Priya recognizes why she ignored the warning and asks to see Luis’s route.', plotEventStatement: 'The cart catches at the gate and a jar nearly tips.', evidenceIds: ['cac-p5-s4', 'cac-p5-s5', 'cac-p5-s6', 'cac-p5-s7'], evidenceKinds: ['response-to-event', 'action', 'thought', 'dialogue', 'choice'] },
      { stageId: '', stage: 'end', stateStatement: 'Priya combines ideas, includes the team, and thanks Luis.', plotEventStatement: 'The shared route moves the supplies safely to the stage.', evidenceIds: ['cac-p5-s9', 'cac-p5-s10', 'cac-p5-s11'], evidenceKinds: ['action', 'choice', 'dialogue', 'thought'] },
    ], ['cac-p5-s6', 'cac-p5-s7'], 'The blocked cart reveals the cost of ignoring Luis and leads Priya to reconsider whose plan the team should use.', 'At first Priya insists on her route; after the cart catches, she reconsiders and asks for Luis’s plan; by the end she builds and checks a shared route.')],
    primaryCharacter: 'Priya',
    beginningChoice: 'Priya insists on using her route and ignores Luis’s warning.',
    turningChoice: 'The cart catches at the gate, and Priya realizes why she ignored Luis.',
    endingChoice: 'Priya combines both routes and asks everyone to check the shared plan.',
    developmentChoice: 'At first Priya insists on her own route, but after it fails, she reconsiders and builds a shared plan.',
    traitOnlyChoice: 'Priya is organized.',
    unrelatedChoice: 'Priya knows how to draw maps.',
    beginningEvidenceId: 'cac-p5-s3',
    turningEvidenceId: 'cac-p5-s6',
    endingEvidenceId: 'cac-p5-s10',
    minorEvidenceId: 'cac-p5-s1',
  },
  {
    passageId: CHARACTER_ARC_PASSAGE_IDS[5],
    title: 'Across the Trail',
    difficulty: 1,
    sentences: [
      { sentenceId: 'cac-p6-s1', text: 'Mateo’s adventure club planned to carry a small weather flag across a wooded trail.' },
      { sentenceId: 'cac-p6-s2', text: 'He knew the route, but he let others call every direction.' },
      { sentenceId: 'cac-p6-s3', text: 'At a fork, Mateo felt hesitation and thought, If I choose poorly, everyone will notice.' },
      { sentenceId: 'cac-p6-s4', text: 'The group chose the narrow lower trail without asking him, and a puddle soon covered it.' },
      { sentenceId: 'cac-p6-s5', text: 'Mateo saw the dry ridge path above them, yet his first words came out too softly to hear.' },
      { sentenceId: 'cac-p6-s6', text: 'Then the wind pulled the weather flag from its loose clip and sent it toward the puddle.' },
      { sentenceId: 'cac-p6-s7', text: 'Mateo caught the pole and called, “Stop! The ridge path is dry, and I can lead us there.”' },
      { sentenceId: 'cac-p6-s8', text: 'He balanced the flag on his shoulder and guided the club back to the fork.' },
      { sentenceId: 'cac-p6-s9', text: 'A younger volunteer asked which mark to follow, and Mateo explained the blue ridge symbol.' },
      { sentenceId: 'cac-p6-s10', text: 'Halfway up, he checked that the last hiker could still see the group.' },
      { sentenceId: 'cac-p6-s11', text: 'By the end, Mateo spoke clearly at each turn and invited questions before the club moved on.' },
    ],
    support: [
      { targetId: 'cac-support-21', word: 'hesitation', sentenceId: 'cac-p6-s3', focusParts: ['tion'], chunks: [{ displayText: 'hes', speechText: 'hez' }, { displayText: 'i', speechText: 'uh' }, { displayText: 'ta', speechText: 'tay' }, { displayText: 'tion', speechText: 'shun' }] },
      { targetId: 'cac-support-22', word: 'narrow', sentenceId: 'cac-p6-s4', focusParts: ['narr'], chunks: [{ displayText: 'nar', speechText: 'nair' }, { displayText: 'row', speechText: 'roh' }] },
      { targetId: 'cac-support-23', word: 'balanced', sentenceId: 'cac-p6-s8', focusParts: ['balance'], chunks: [{ displayText: 'bal', speechText: 'bal' }, { displayText: 'anced', speechText: 'unst' }] },
      { targetId: 'cac-support-24', word: 'volunteer', sentenceId: 'cac-p6-s9', focusParts: ['vol'], chunks: [{ displayText: 'vol', speechText: 'vol' }, { displayText: 'un', speechText: 'un' }, { displayText: 'teer', speechText: 'teer' }] },
    ],
    arcs: [arc(6, 'mateo', 'Mateo', 'builds-confidence', [
      { stageId: '', stage: 'beginning', stateStatement: 'Mateo knows the route but stays quiet because he fears choosing incorrectly.', plotEventStatement: 'The club begins carrying a weather flag across the trail.', evidenceIds: ['cac-p6-s2', 'cac-p6-s3'], evidenceKinds: ['action', 'thought', 'feeling'] },
      { stageId: '', stage: 'middle', stateStatement: 'Mateo catches the flag and clearly offers to lead the group to the dry path.', plotEventStatement: 'The lower trail floods and the wind pulls the flag loose.', evidenceIds: ['cac-p6-s4', 'cac-p6-s6', 'cac-p6-s7'], evidenceKinds: ['response-to-event', 'action', 'dialogue', 'choice'] },
      { stageId: '', stage: 'end', stateStatement: 'Mateo gives clear directions and checks that every hiker can follow.', plotEventStatement: 'The club follows Mateo safely along the ridge.', evidenceIds: ['cac-p6-s8', 'cac-p6-s9', 'cac-p6-s10', 'cac-p6-s11'], evidenceKinds: ['action', 'dialogue', 'thought', 'choice'] },
    ], ['cac-p6-s6', 'cac-p6-s7'], 'The loose flag creates an urgent moment when Mateo must use the trail knowledge he had been afraid to share.', 'At first Mateo stays quiet despite knowing the route; after the flag blows loose, he speaks up and leads; by the end he gives clear directions and invites questions.')],
    primaryCharacter: 'Mateo',
    beginningChoice: 'Mateo knows the route but lets others call every direction.',
    turningChoice: 'The flag blows loose, and Mateo catches it and offers to lead.',
    endingChoice: 'Mateo speaks clearly at each turn and invites questions.',
    developmentChoice: 'At first Mateo stays quiet, but after the flag blows loose, he gains confidence and guides the group.',
    traitOnlyChoice: 'Mateo is observant.',
    unrelatedChoice: 'Mateo likes weather flags.',
    beginningEvidenceId: 'cac-p6-s3',
    turningEvidenceId: 'cac-p6-s7',
    endingEvidenceId: 'cac-p6-s11',
    minorEvidenceId: 'cac-p6-s1',
  },
  {
    passageId: CHARACTER_ARC_PASSAGE_IDS[6],
    title: 'The Shared Project',
    difficulty: 1,
    sentences: [
      { sentenceId: 'cac-p7-s1', text: 'Nia and Omar’s cabin planned a display showing animal tracks around camp.' },
      { sentenceId: 'cac-p7-s2', text: 'Nia offered to label the cards, while Omar volunteered to arrange the trail scene.' },
      { sentenceId: 'cac-p7-s3', text: 'They worked at separate tables, and neither checked how the labels would fit the scene.' },
      { sentenceId: 'cac-p7-s4', text: 'Nia rushed through the last cards so she could join a game outside.' },
      { sentenceId: 'cac-p7-s5', text: 'Omar moved every track into one straight line and said, “My arrangement is easiest to follow.”' },
      { sentenceId: 'cac-p7-s6', text: 'During a practice tour, visitors could not tell which label matched each turn in the trail.' },
      { sentenceId: 'cac-p7-s7', text: 'Nia thought about her rushed cards, and Omar wondered whether his straight line had ignored her label plan.' },
      { sentenceId: 'cac-p7-s8', text: '“My part caused some confusion,” Nia said. “I will take responsibility and remake these cards.”' },
      { sentenceId: 'cac-p7-s9', text: 'Omar offered a compromise: he would curve the trail while Nia placed each new label beside its matching print.' },
      { sentenceId: 'cac-p7-s10', text: 'They tested every turn together and changed two signs that still pointed the wrong way.' },
      { sentenceId: 'cac-p7-s11', text: 'By the end, Nia completed her contribution before the game, and Omar asked the group to check his arrangement.' },
      { sentenceId: 'cac-p7-s12', text: 'The next visitors followed the animal trail without missing a single label.' },
    ],
    support: [
      { targetId: 'cac-support-25', word: 'separate', sentenceId: 'cac-p7-s3', focusParts: ['sep'], chunks: [{ displayText: 'sep', speechText: 'sep' }, { displayText: 'a', speechText: 'uh' }, { displayText: 'rate', speechText: 'rut' }] },
      { targetId: 'cac-support-26', word: 'responsibility', sentenceId: 'cac-p7-s8', focusParts: ['respons'], chunks: [{ displayText: 're', speechText: 'ree' }, { displayText: 'spon', speechText: 'spon' }, { displayText: 'si', speechText: 'suh' }, { displayText: 'bil', speechText: 'bil' }, { displayText: 'i', speechText: 'uh' }, { displayText: 'ty', speechText: 'tee' }] },
      { targetId: 'cac-support-27', word: 'compromise', sentenceId: 'cac-p7-s9', focusParts: ['com'], chunks: [{ displayText: 'com', speechText: 'kom' }, { displayText: 'pro', speechText: 'pruh' }, { displayText: 'mise', speechText: 'mize' }] },
      { targetId: 'cac-support-28', word: 'contribution', sentenceId: 'cac-p7-s11', focusParts: ['tion'], chunks: [{ displayText: 'con', speechText: 'kon' }, { displayText: 'tri', speechText: 'truh' }, { displayText: 'bu', speechText: 'byoo' }, { displayText: 'tion', speechText: 'shun' }] },
    ],
    arcs: [
      arc(7, 'nia', 'Nia', 'becomes-more-responsible', [
        { stageId: '', stage: 'beginning', stateStatement: 'Nia rushes her cards and leaves without checking how they fit the display.', plotEventStatement: 'Nia and Omar divide the animal-track project into separate jobs.', evidenceIds: ['cac-p7-s3', 'cac-p7-s4'], evidenceKinds: ['action', 'choice'] },
        { stageId: '', stage: 'middle', stateStatement: 'Nia recognizes that her rushed cards caused confusion and promises to remake them.', plotEventStatement: 'Visitors cannot match the labels to the trail turns.', evidenceIds: ['cac-p7-s6', 'cac-p7-s7', 'cac-p7-s8'], evidenceKinds: ['response-to-event', 'thought', 'dialogue', 'choice'] },
        { stageId: '', stage: 'end', stateStatement: 'Nia finishes and tests her contribution before leaving.', plotEventStatement: 'The partners rebuild and check the display together.', evidenceIds: ['cac-p7-s10', 'cac-p7-s11'], evidenceKinds: ['action', 'dialogue', 'thought'] },
      ], ['cac-p7-s7', 'cac-p7-s8'], 'The confusing practice tour makes Nia see the effect of rushing and decide to repair her part.', 'At first Nia rushes and leaves her work unchecked; after visitors become confused, she accepts responsibility; by the end she completes and tests her contribution.'),
      arc(7, 'omar', 'Omar', 'becomes-more-cooperative', [
        { stageId: '', stage: 'beginning', stateStatement: 'Omar arranges the scene alone and insists his straight line is best.', plotEventStatement: 'Omar and Nia work separately on connected parts of the display.', evidenceIds: ['cac-p7-s3', 'cac-p7-s5'], evidenceKinds: ['action', 'dialogue', 'choice'] },
        { stageId: '', stage: 'middle', stateStatement: 'Omar questions his arrangement and offers a compromise that connects both jobs.', plotEventStatement: 'The practice tour reveals that the labels and trail do not match.', evidenceIds: ['cac-p7-s6', 'cac-p7-s7', 'cac-p7-s9'], evidenceKinds: ['response-to-event', 'thought', 'dialogue', 'choice'] },
        { stageId: '', stage: 'end', stateStatement: 'Omar tests changes with Nia and asks the group to check his work.', plotEventStatement: 'The combined layout lets visitors follow every label.', evidenceIds: ['cac-p7-s10', 'cac-p7-s11', 'cac-p7-s12'], evidenceKinds: ['action', 'dialogue', 'thought'] },
      ], ['cac-p7-s7', 'cac-p7-s9'], 'The failed practice tour shows Omar that his arrangement must connect with Nia’s labels.', 'At first Omar insists on arranging the trail alone; after visitors become confused, he offers a compromise; by the end he tests with Nia and asks others to check his work.'),
    ],
    primaryCharacter: 'Nia and Omar',
    beginningChoice: 'Nia rushes her cards, while Omar insists on arranging the trail alone.',
    turningChoice: 'The practice visitors cannot match the labels to the trail turns.',
    endingChoice: 'Nia and Omar test the connected display and invite others to check it.',
    developmentChoice: 'Nia becomes more responsible for her work, while Omar becomes more willing to cooperate.',
    traitOnlyChoice: 'Nia is artistic, and Omar is organized.',
    unrelatedChoice: 'Nia and Omar both study animal tracks.',
    beginningEvidenceId: 'cac-p7-s3',
    turningEvidenceId: 'cac-p7-s6',
    endingEvidenceId: 'cac-p7-s11',
    minorEvidenceId: 'cac-p7-s1',
    combinedDevelopmentChoice: 'Nia takes responsibility for rushed work, and Omar learns to combine his plan with hers.',
  },
]

export const characterArcPassages: Passage[] = characterArcStories.map((story) => ({
  passageIdentifier: story.passageId,
  title: story.title,
  passageText: story.sentences.map((sentence) => sentence.text).join(' '),
  readingContext: story.title,
  sentences: story.sentences,
  genre: 'literary',
  gradeBand: 3,
  reviewStatus: 'DRAFT',
  contentVersion: CHARACTER_ARC_VERSION,
  wordSupportTargets: story.support.map((target) => ({
    targetId: target.targetId,
    passageId: story.passageId,
    sentenceId: target.sentenceId,
    surfaceWord: target.word,
    focusParts: buildFocusParts(target.word, target.focusParts[0]),
    displayChunks: target.chunks,
    spokenChunks: target.chunks,
    blendSpeechText: target.word,
    wholeWordSpeechText: target.word,
    sentenceSpeechText: story.sentences.find((sentence) => sentence.sentenceId === target.sentenceId)?.text ?? '',
    reviewStatus: 'DRAFT',
    contentVersion: CHARACTER_ARC_VERSION,
  })),
}))

function buildFocusParts(word: string, focus: string) {
  const index = word.toLowerCase().indexOf(focus.toLowerCase())
  if (index < 0) return [{ text: word, emphasis: true }]
  return [
    { text: word.slice(0, index), emphasis: false },
    { text: word.slice(index, index + focus.length), emphasis: true },
    { text: word.slice(index + focus.length), emphasis: false },
  ].filter((part) => part.text.length > 0)
}

export const characterDevelopmentGuides: CharacterDevelopmentGuide[] = characterArcStories.map((story) => ({
  passageId: story.passageId,
  arcs: story.arcs,
  importantPlotEvidenceIds: [...new Set(story.arcs.flatMap((entry) => [
    entry.stages[0].evidenceIds[0],
    ...entry.turningPointEvidenceIds,
    entry.stages[2].evidenceIds.at(-1),
  ].filter((id): id is string => Boolean(id))))],
  reviewStatus: 'DRAFT',
  contentVersion: CHARACTER_ARC_VERSION,
}))

export const characterArcCoveragePatterns = [
  'character-development',
  'plot-linked-change',
  'actions-dialogue-thoughts',
  'beginning-middle-end-development',
  'text-evidence',
] as const

void CHARACTER_ARC_BENCHMARK
