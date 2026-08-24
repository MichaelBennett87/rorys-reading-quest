import type { Passage, WordSupportTarget } from '../../../../types'
import type { ContentPack, ContentPackLesson } from '../../../contentPackTypes'
import type { FluencyExpressionCue, FluencyPhrase, FluencyPracticeBlock, TeachingBlock } from '../../../../../lesson'
import {
  GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION,
  GRADE3_FLUENCY_FLIGHT_LESSON_IDS,
  GRADE3_FLUENCY_FLIGHT_PACK_ID,
  GRADE3_FLUENCY_FLIGHT_PACK_TITLE,
  GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS,
  GRADE3_FLUENCY_FLIGHT_QUESTION_IDS,
  GRADE3_FLUENCY_FLIGHT_SKILL_ID,
  GRADE3_FLUENCY_FLIGHT_TARGET_IDS,
  GRADE3_FLUENCY_FLIGHT_UNIT_ID,
  GRADE3_FLUENCY_FLIGHT_WORLD_ID,
} from './ids'
import { grade3WordForgeFluencyFlightQuestions } from './questions'

interface PassageSpec {
  passageId: string
  passageText: string
  sentences: { sentenceId: string; text: string }[]
  readingContext: string
  targets: WordSupportTarget[]
}

function supportTarget(spec: {
  targetId: string
  passageId: string
  sentenceId: string
  sentenceText: string
  surfaceWord: string
  displayChunks: string[]
  speechChunks: string[]
  focusIndices: number[]
}): WordSupportTarget {
  return {
    targetId: spec.targetId,
    passageId: spec.passageId,
    sentenceId: spec.sentenceId,
    surfaceWord: spec.surfaceWord,
    focusParts: spec.displayChunks.map((text, index) => ({ text, emphasis: spec.focusIndices.includes(index) })),
    displayChunks: spec.displayChunks.map((displayText, index) => ({ displayText, speechText: spec.speechChunks[index] })),
    spokenChunks: spec.displayChunks.map((displayText, index) => ({ displayText, speechText: spec.speechChunks[index] })),
    blendSpeechText: spec.surfaceWord,
    wholeWordSpeechText: spec.surfaceWord,
    sentenceSpeechText: spec.sentenceText,
    reviewStatus: 'DRAFT',
    contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION,
  }
}

function passage(spec: PassageSpec): Passage {
  return {
    passageIdentifier: spec.passageId,
    gradeBand: 3,
    passageText: spec.passageText,
    sentences: spec.sentences,
    readingContext: spec.readingContext,
    contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: spec.targets,
  }
}

const hilltopSentences = [
  { sentenceId: 'hilltop-1', text: 'Before sunrise, Lena carried a bright signal flag to the hilltop.' },
  { sentenceId: 'hilltop-2', text: 'She paused beside her uncle, took a steady breath, and watched the eastern horizon.' },
  { sentenceId: 'hilltop-3', text: '"Is the glider ready?" she asked.' },
  { sentenceId: 'hilltop-4', text: '"Ready for a careful launch!" Uncle Dev replied.' },
  { sentenceId: 'hilltop-5', text: 'When the wind became gentle, Lena raised the flag and called, "Now!"' },
  { sentenceId: 'hilltop-6', text: 'The small glider lifted smoothly, crossed the field, and landed near the orange marker.' },
]
const gliderSentences = [
  { sentenceId: 'glider-1', text: 'A paper glider moves because air pushes around its wings.' },
  { sentenceId: 'glider-2', text: 'As the glider travels forward, air moves over and under each wing.' },
  { sentenceId: 'glider-3', text: "The wing's shape helps create lift, which keeps the glider above the floor for a short time." },
  { sentenceId: 'glider-4', text: 'A balanced glider follows a steadier path.' },
  { sentenceId: 'glider-5', text: 'If one wing bends, the glider may turn suddenly or drop.' },
  { sentenceId: 'glider-6', text: 'A reader can pause at each comma and keep each cause-and-effect phrase together.' },
]
const mapSentences = [
  { sentenceId: 'map-1', text: '"Where did the flight map go?" Mateo asked.' },
  { sentenceId: 'map-2', text: 'Nia pointed toward the worktable and said, "I placed it beside the compass."' },
  { sentenceId: 'map-3', text: '"It isn\'t there now!" Mateo cried.' },
  { sentenceId: 'map-4', text: 'After a quiet moment, Nia noticed a corner of paper under the model runway.' },
  { sentenceId: 'map-5', text: '"Could the breeze have moved it?" she wondered.' },
  { sentenceId: 'map-6', text: 'Mateo laughed and answered, "Yes, and our mystery has landed!"' },
  { sentenceId: 'map-7', text: 'Together, they returned the map to its folder and checked the route.' },
]
const rotorSentences = [
  { sentenceId: 'rotor-1', text: 'First, fold a narrow strip of paper in half.' },
  { sentenceId: 'rotor-2', text: 'Next, cut two short lines at the top to make rotor blades.' },
  { sentenceId: 'rotor-3', text: 'Fold one blade forward and the other backward.' },
  { sentenceId: 'rotor-4', text: 'Then attach a paper clip at the bottom for balance.' },
  { sentenceId: 'rotor-5', text: 'Hold the rotor above a clear space, release it, and watch it spin.' },
  { sentenceId: 'rotor-6', text: 'If the rotation looks uneven, adjust one blade and try again.' },
  { sentenceId: 'rotor-7', text: 'Read each step as one complete direction, and stop fully at every period.' },
]
const marshSentences = [
  { sentenceId: 'marsh-1', text: 'Golden light spread across the quiet marsh.' },
  { sentenceId: 'marsh-2', text: 'A thin layer of mist floated above the water, and tiny drops sparkled on the reeds.' },
  { sentenceId: 'marsh-3', text: 'From the observation deck, two children lifted their binoculars and searched the shoreline.' },
  { sentenceId: 'marsh-4', text: 'A heron stood perfectly still beside a silver reflection.' },
  { sentenceId: 'marsh-5', text: 'Then its wings opened wide, powerful and silent, before the bird rose into the pale sky.' },
  { sentenceId: 'marsh-6', text: 'The children whispered, "What an amazing morning!"' },
]
const launchSentences = [
  { sentenceId: 'launch-1', text: 'Mira held the kite string tightly while clouds hurried above the park.' },
  { sentenceId: 'launch-2', text: 'She had practiced every step, but her hands still trembled.' },
  { sentenceId: 'launch-3', text: '"Remember the steady pull," her brother said gently.' },
  { sentenceId: 'launch-4', text: 'Mira ran forward, felt the string tug, and looked up.' },
  { sentenceId: 'launch-5', text: 'The red kite climbed past the treetops.' },
  { sentenceId: 'launch-6', text: '"I did it!" she shouted.' },
  { sentenceId: 'launch-7', text: 'Her brother grinned, and Mira let the kite sail in a smooth circle.' },
]
const geeseSentences = [
  { sentenceId: 'geese-1', text: 'Migrating geese often travel in a V-shaped formation.' },
  { sentenceId: 'geese-2', text: "Each bird's wings move the air and create a helpful current for the bird behind it." },
  { sentenceId: 'geese-3', text: 'The formation can save energy during a long journey.' },
  { sentenceId: 'geese-4', text: 'When the lead goose becomes tired, another goose may move to the front.' },
  { sentenceId: 'geese-5', text: 'The group also calls to one another as it travels.' },
  { sentenceId: 'geese-6', text: 'Those calls help the flock stay together and keep the same direction.' },
  { sentenceId: 'geese-7', text: 'Commas mark short pauses, while periods separate each complete fact.' },
]

const joinSentences = (sentences: { text: string }[]) => sentences.map((sentence) => sentence.text).join(' ')

export const grade3WordForgeFluencyFlightPassages: Passage[] = [
  passage({
    passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.hilltopSignal,
    passageText: joinSentences(hilltopSentences),
    sentences: hilltopSentences,
    readingContext: 'A narrative scene for punctuation, dialogue, and energetic expression practice.',
    targets: [
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.hilltopSignal, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.hilltopSignal, sentenceId: 'hilltop-1', sentenceText: hilltopSentences[0].text, surfaceWord: 'signal', displayChunks: ['sig', 'nal'], speechChunks: ['sig', 'nuhl'], focusIndices: [0] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.hilltopCareful, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.hilltopSignal, sentenceId: 'hilltop-4', sentenceText: hilltopSentences[3].text, surfaceWord: 'careful', displayChunks: ['care', 'ful'], speechChunks: ['care', 'ful'], focusIndices: [1] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.hilltopSmoothly, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.hilltopSignal, sentenceId: 'hilltop-6', sentenceText: hilltopSentences[5].text, surfaceWord: 'smoothly', displayChunks: ['smooth', 'ly'], speechChunks: ['smooth', 'lee'], focusIndices: [1] }),
    ],
  }),
  passage({
    passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperGlider,
    passageText: joinSentences(gliderSentences),
    sentences: gliderSentences,
    readingContext: 'An informational paragraph for phrase grouping and calm explanatory reading.',
    targets: [
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.gliderTravels, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperGlider, sentenceId: 'glider-2', sentenceText: gliderSentences[1].text, surfaceWord: 'travels', displayChunks: ['trav', 'els'], speechChunks: ['trav', 'uhls'], focusIndices: [0] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.gliderBalanced, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperGlider, sentenceId: 'glider-4', sentenceText: gliderSentences[3].text, surfaceWord: 'balanced', displayChunks: ['bal', 'anced'], speechChunks: ['bal', 'uhnst'], focusIndices: [0] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.gliderSuddenly, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperGlider, sentenceId: 'glider-5', sentenceText: gliderSentences[4].text, surfaceWord: 'suddenly', displayChunks: ['sud', 'den', 'ly'], speechChunks: ['sud', 'den', 'lee'], focusIndices: [2] }),
    ],
  }),
  passage({
    passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.missingMap,
    passageText: joinSentences(mapSentences),
    sentences: mapSentences,
    readingContext: 'A dialogue-rich scene for questions, exclamations, and speaker expression.',
    targets: [
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.mapCompass, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.missingMap, sentenceId: 'map-2', sentenceText: mapSentences[1].text, surfaceWord: 'compass', displayChunks: ['com', 'pass'], speechChunks: ['com', 'pass'], focusIndices: [0] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.mapMystery, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.missingMap, sentenceId: 'map-6', sentenceText: mapSentences[5].text, surfaceWord: 'mystery', displayChunks: ['mys', 'ter', 'y'], speechChunks: ['mis', 'ter', 'ee'], focusIndices: [0] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.mapReturned, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.missingMap, sentenceId: 'map-7', sentenceText: mapSentences[6].text, surfaceWord: 'returned', displayChunks: ['re', 'turned'], speechChunks: ['ree', 'turned'], focusIndices: [0] }),
    ],
  }),
  passage({
    passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperRotor,
    passageText: joinSentences(rotorSentences),
    sentences: rotorSentences,
    readingContext: 'A procedural paragraph for reading complete steps and rereading difficult directions.',
    targets: [
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.rotorRotor, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperRotor, sentenceId: 'rotor-5', sentenceText: rotorSentences[4].text, surfaceWord: 'rotor', displayChunks: ['ro', 'tor'], speechChunks: ['row', 'ter'], focusIndices: [0] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.rotorRotation, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperRotor, sentenceId: 'rotor-6', sentenceText: rotorSentences[5].text, surfaceWord: 'rotation', displayChunks: ['ro', 'ta', 'tion'], speechChunks: ['row', 'tay', 'shun'], focusIndices: [2] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.rotorUneven, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperRotor, sentenceId: 'rotor-6', sentenceText: rotorSentences[5].text, surfaceWord: 'uneven', displayChunks: ['un', 'e', 'ven'], speechChunks: ['un', 'ee', 'ven'], focusIndices: [0] }),
    ],
  }),
  passage({
    passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.morningMarsh,
    passageText: joinSentences(marshSentences),
    sentences: marshSentences,
    readingContext: 'A descriptive paragraph for calm phrasing, meaningful emphasis, and one excited line.',
    targets: [
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.marshObservation, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.morningMarsh, sentenceId: 'marsh-3', sentenceText: marshSentences[2].text, surfaceWord: 'observation', displayChunks: ['ob', 'ser', 'va', 'tion'], speechChunks: ['ob', 'zer', 'vay', 'shun'], focusIndices: [2] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.marshBinoculars, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.morningMarsh, sentenceId: 'marsh-3', sentenceText: marshSentences[2].text, surfaceWord: 'binoculars', displayChunks: ['bin', 'oc', 'u', 'lars'], speechChunks: ['bin', 'ock', 'yuh', 'lers'], focusIndices: [0] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.marshReflection, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.morningMarsh, sentenceId: 'marsh-4', sentenceText: marshSentences[3].text, surfaceWord: 'reflection', displayChunks: ['re', 'flec', 'tion'], speechChunks: ['ree', 'flek', 'shun'], focusIndices: [2] }),
    ],
  }),
  passage({
    passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.firstLaunch,
    passageText: joinSentences(launchSentences),
    sentences: launchSentences,
    readingContext: 'A short literary scene for nervous, encouraging, and joyful expression.',
    targets: [
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.launchPracticed, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.firstLaunch, sentenceId: 'launch-2', sentenceText: launchSentences[1].text, surfaceWord: 'practiced', displayChunks: ['prac', 'ticed'], speechChunks: ['prak', 'tist'], focusIndices: [0] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.launchTrembled, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.firstLaunch, sentenceId: 'launch-2', sentenceText: launchSentences[1].text, surfaceWord: 'trembled', displayChunks: ['trem', 'bled'], speechChunks: ['trem', 'buhld'], focusIndices: [0] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.launchGently, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.firstLaunch, sentenceId: 'launch-3', sentenceText: launchSentences[2].text, surfaceWord: 'gently', displayChunks: ['gent', 'ly'], speechChunks: ['jent', 'lee'], focusIndices: [1] }),
    ],
  }),
  passage({
    passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.geeseFormation,
    passageText: joinSentences(geeseSentences),
    sentences: geeseSentences,
    readingContext: 'A short informational explanation for cause-and-effect phrasing and punctuation pauses.',
    targets: [
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.geeseMigrating, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.geeseFormation, sentenceId: 'geese-1', sentenceText: geeseSentences[0].text, surfaceWord: 'Migrating', displayChunks: ['Mi', 'grat', 'ing'], speechChunks: ['my', 'gray', 'ting'], focusIndices: [1] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.geeseFormation, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.geeseFormation, sentenceId: 'geese-1', sentenceText: geeseSentences[0].text, surfaceWord: 'formation', displayChunks: ['for', 'ma', 'tion'], speechChunks: ['for', 'may', 'shun'], focusIndices: [2] }),
      supportTarget({ targetId: GRADE3_FLUENCY_FLIGHT_TARGET_IDS.geeseDirection, passageId: GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.geeseFormation, sentenceId: 'geese-6', sentenceText: geeseSentences[5].text, surfaceWord: 'direction', displayChunks: ['di', 'rec', 'tion'], speechChunks: ['duh', 'rek', 'shun'], focusIndices: [2] }),
    ],
  }),
]

const phrase = (phraseId: string, text: string, cue?: string): FluencyPhrase => ({ phraseId, text, cue })
const expressionCue = (cueId: string, sentenceId: string, label: string, explanation: string): FluencyExpressionCue => ({ cueId, sentenceId, label, explanation })
const teaching = (title: string, explanation: string, examples: string[], contrast: string, learnerCue: string): TeachingBlock => ({ title, explanation, examples, contrast, learnerCue })
const fluencyBlock = (spec: Omit<FluencyPracticeBlock, 'modelReadingAvailable' | 'oralReadingMeasured' | 'timerUsed' | 'microphoneUsed'>): FluencyPracticeBlock => ({
  ...spec,
  modelReadingAvailable: true,
  oralReadingMeasured: false,
  timerUsed: false,
  microphoneUsed: false,
})

export const grade3WordForgeFluencyFlightLessons: ContentPackLesson[] = [
  {
    lessonId: GRADE3_FLUENCY_FLIGHT_LESSON_IDS.guidedPunctuation,
    worldId: GRADE3_FLUENCY_FLIGHT_WORLD_ID,
    unitId: GRADE3_FLUENCY_FLIGHT_UNIT_ID,
    activityId: 'activity-g3-fluency-flight-punctuation-pilot',
    difficulty: 4,
    passageIdentifiers: [GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.hilltopSignal],
    questionIdentifiers: [...GRADE3_FLUENCY_FLIGHT_QUESTION_IDS.guidedPunctuation],
    lessonTitle: 'Fluency Flight: Punctuation Pilot',
    lessonObjective: 'Use commas, questions, and exclamations to guide pauses and expression.',
    lessonRole: 'FLUENCY_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: teaching('Punctuation Pilot', 'Punctuation gives useful reading cues. A comma suggests a brief pause, a question mark often lets the voice rise, and an exclamation mark adds clear energy.', ['Before sunrise,', '"Is the glider ready?"', '"Now!"'], 'Punctuation guides meaning, but it does not require an exaggerated voice.', 'Notice each mark, then keep the whole sentence smooth.'),
    fluencyPracticeBlock: fluencyBlock({
      title: 'The Hilltop Signal', learnerCue: 'Pause briefly, ask clearly, and show energy where the text calls for it.', requiredReadCount: 2, practiceMode: 'guided',
      phraseGroups: [
        phrase('hilltop-p1', 'Before sunrise,', 'Pause briefly.'), phrase('hilltop-p2', 'Lena carried a bright signal flag', 'Keep the action together.'), phrase('hilltop-p3', 'to the hilltop.', 'Stop fully.'),
        phrase('hilltop-p4', 'She paused beside her uncle,', 'Pause briefly.'), phrase('hilltop-p5', 'took a steady breath,', 'Pause briefly.'), phrase('hilltop-p6', 'and watched the eastern horizon.', 'Finish calmly.'),
        phrase('hilltop-p7', '"Is the glider ready?"', 'Let the question sound curious.'), phrase('hilltop-p8', 'she asked.', 'Finish the sentence.'),
        phrase('hilltop-p9', '"Ready for a careful launch!"', 'Use bright energy.'), phrase('hilltop-p10', 'Uncle Dev replied.', 'Finish the thought.'),
        phrase('hilltop-p11', 'When the wind became gentle,', 'Keep the opening idea together.'), phrase('hilltop-p12', 'Lena raised the flag', 'Keep the action together.'), phrase('hilltop-p13', 'and called, "Now!"', 'Emphasize the call.'),
        phrase('hilltop-p14', 'The small glider lifted smoothly,', 'Pause briefly.'), phrase('hilltop-p15', 'crossed the field,', 'Pause briefly.'), phrase('hilltop-p16', 'and landed near the orange marker.', 'Stop fully.'),
      ],
      expressionCues: [
        expressionCue('hilltop-question-cue', 'hilltop-3', 'Question cue', 'The question mark supports a curious voice.'),
        expressionCue('hilltop-exclamation-cue', 'hilltop-5', 'Excited announcement tone', 'The short call should sound clear and energetic.'),
        expressionCue('hilltop-comma-cue', 'hilltop-6', 'Comma pause', 'The commas separate three connected actions with brief pauses.'),
      ],
    }),
    contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: GRADE3_FLUENCY_FLIGHT_LESSON_IDS.guidedPhraseGroups,
    worldId: GRADE3_FLUENCY_FLIGHT_WORLD_ID,
    unitId: GRADE3_FLUENCY_FLIGHT_UNIT_ID,
    activityId: 'activity-g3-fluency-flight-phrase-formation',
    difficulty: 4,
    passageIdentifiers: [GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperGlider],
    questionIdentifiers: [...GRADE3_FLUENCY_FLIGHT_QUESTION_IDS.guidedPhraseGroups],
    lessonTitle: 'Fluency Flight: Phrase Formation',
    lessonObjective: 'Keep connected words together while reading an informational explanation.',
    lessonRole: 'FLUENCY_PRACTICE', selectionStatus: 'active',
    teachingBlock: teaching('Phrase Formation', 'Smooth readers group words that carry one connected idea. Punctuation and meaning can both show where a group begins or ends.', ['a paper glider', 'helps create lift', 'for a short time'], 'Do not pause between every word or split a name from the word that describes it.', 'Read each connected idea together, then blend the sentence.'),
    fluencyPracticeBlock: fluencyBlock({
      title: 'Why Paper Gliders Stay Up', learnerCue: 'Group each cause, action, and result into a smooth phrase.', requiredReadCount: 2, practiceMode: 'guided',
      phraseGroups: [
        phrase('glider-p1', 'A paper glider moves', 'Keep the subject and action together.'), phrase('glider-p2', 'because air pushes', 'Keep the cause together.'), phrase('glider-p3', 'around its wings.', 'Stop fully.'),
        phrase('glider-p4', 'As the glider travels forward,', 'Pause after the opening idea.'), phrase('glider-p5', 'air moves over and under each wing.', 'Keep the movement together.'),
        phrase('glider-p6', "The wing's shape", 'Keep the name together.'), phrase('glider-p7', 'helps create lift,', 'Pause briefly.'), phrase('glider-p8', 'which keeps the glider above the floor', 'Keep the result together.'), phrase('glider-p9', 'for a short time.', 'Stop fully.'),
        phrase('glider-p10', 'A balanced glider', 'Keep the description and name together.'), phrase('glider-p11', 'follows a steadier path.', 'Finish calmly.'),
        phrase('glider-p12', 'If one wing bends,', 'Pause after the condition.'), phrase('glider-p13', 'the glider may turn suddenly', 'Keep the result together.'), phrase('glider-p14', 'or drop.', 'Stop fully.'),
        phrase('glider-p15', 'A reader can pause at each comma', 'Keep this direction together.'), phrase('glider-p16', 'and keep each cause-and-effect phrase together.', 'Finish calmly.'),
      ],
      expressionCues: [
        expressionCue('glider-calm-cue', 'glider-1', 'Calm informational tone', 'The explanation should sound steady and clear.'),
        expressionCue('glider-list-cue', 'glider-3', 'List phrasing cue', 'The sentence groups a cause and a result.'),
        expressionCue('glider-comma-cue', 'glider-5', 'Comma pause', 'The comma separates the condition from its result.'),
      ],
    }),
    contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION, eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: GRADE3_FLUENCY_FLIGHT_LESSON_IDS.guidedDialogue,
    worldId: GRADE3_FLUENCY_FLIGHT_WORLD_ID, unitId: GRADE3_FLUENCY_FLIGHT_UNIT_ID,
    activityId: 'activity-g3-fluency-flight-dialogue-voices', difficulty: 4,
    passageIdentifiers: [GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.missingMap], questionIdentifiers: [...GRADE3_FLUENCY_FLIGHT_QUESTION_IDS.guidedDialogue],
    lessonTitle: 'Fluency Flight: Dialogue Voices', lessonObjective: 'Use dialogue punctuation and meaning to read questions and exclamations naturally.',
    lessonRole: 'FLUENCY_PRACTICE', selectionStatus: 'active',
    teachingBlock: teaching('Dialogue Voices', 'Quotation marks show spoken words. The question or exclamation inside the quotation marks helps a reader choose an appropriate voice.', ['"Where did the flight map go?"', '"It isn\'t there now!"', '"Could the breeze have moved it?"'], 'Not every character line needs the same expression.', 'Use the words and punctuation to choose a natural voice.'),
    fluencyPracticeBlock: fluencyBlock({
      title: 'The Missing Flight Map', learnerCue: 'Let each speaker sound curious, surprised, thoughtful, or playful as the line shows.', requiredReadCount: 2, practiceMode: 'guided',
      phraseGroups: [
        phrase('map-p1', '"Where did the flight map go?"', 'Use a curious question voice.'), phrase('map-p2', 'Mateo asked.', 'Stop fully.'),
        phrase('map-p3', 'Nia pointed toward the worktable and said,', 'Pause before the quoted words.'), phrase('map-p4', '"I placed it beside the compass."', 'Read the statement calmly.'),
        phrase('map-p5', '"It isn\'t there now!"', 'Show surprise.'), phrase('map-p6', 'Mateo cried.', 'Stop fully.'),
        phrase('map-p7', 'After a quiet moment,', 'Pause briefly.'), phrase('map-p8', 'Nia noticed a corner of paper under the model runway.', 'Read the discovery smoothly.'),
        phrase('map-p9', '"Could the breeze have moved it?"', 'Use a thoughtful question voice.'), phrase('map-p10', 'she wondered.', 'Stop fully.'),
        phrase('map-p11', 'Mateo laughed and answered,', 'Pause before the quoted words.'), phrase('map-p12', '"Yes, and our mystery has landed!"', 'Use a playful voice.'),
        phrase('map-p13', 'Together,', 'Pause briefly.'), phrase('map-p14', 'they returned the map to its folder and checked the route.', 'Finish smoothly.'),
      ],
      expressionCues: [
        expressionCue('map-dialogue-cue', 'map-2', 'Dialogue cue', 'The speech tag and quotation marks identify a speaker.'),
        expressionCue('map-question-cue', 'map-5', 'Question cue', 'The question mark supports a thoughtful voice.'),
        expressionCue('map-exclamation-cue', 'map-3', 'Exclamation cue', 'The exclamation mark supports surprise.'),
      ],
    }),
    contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION, eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: GRADE3_FLUENCY_FLIGHT_LESSON_IDS.guidedRereading,
    worldId: GRADE3_FLUENCY_FLIGHT_WORLD_ID, unitId: GRADE3_FLUENCY_FLIGHT_UNIT_ID,
    activityId: 'activity-g3-fluency-flight-reread-route', difficulty: 4,
    passageIdentifiers: [GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.paperRotor], questionIdentifiers: [...GRADE3_FLUENCY_FLIGHT_QUESTION_IDS.guidedRereading],
    lessonTitle: 'Fluency Flight: Reread Route', lessonObjective: 'Read procedural steps as complete directions and reread a difficult line smoothly.',
    lessonRole: 'FLUENCY_PRACTICE', selectionStatus: 'active',
    teachingBlock: teaching('Reread Route', 'Directions are easier to follow when each step stays together. If a line feels awkward, pause, find its phrase groups, and reread it.', ['First, fold a narrow strip of paper in half.', 'Hold the rotor above a clear space, release it, and watch it spin.', 'If the rotation looks uneven, adjust one blade and try again.'], 'Rereading is a helpful strategy, not a failure or oral score.', 'Keep each step together and reread when a line feels bumpy.'),
    fluencyPracticeBlock: fluencyBlock({
      title: 'Build a Paper Rotor', learnerCue: 'Read every direction as one complete step, with brief pauses inside longer steps.', requiredReadCount: 2, practiceMode: 'guided',
      phraseGroups: [
        phrase('rotor-p1', 'First,', 'Pause after the transition.'), phrase('rotor-p2', 'fold a narrow strip of paper in half.', 'Finish the step.'),
        phrase('rotor-p3', 'Next,', 'Pause after the transition.'), phrase('rotor-p4', 'cut two short lines at the top to make rotor blades.', 'Finish the step.'),
        phrase('rotor-p5', 'Fold one blade forward', 'Keep the action together.'), phrase('rotor-p6', 'and the other backward.', 'Finish the step.'),
        phrase('rotor-p7', 'Then attach a paper clip', 'Keep the action together.'), phrase('rotor-p8', 'at the bottom for balance.', 'Finish the step.'),
        phrase('rotor-p9', 'Hold the rotor above a clear space,', 'Pause briefly.'), phrase('rotor-p10', 'release it,', 'Pause briefly.'), phrase('rotor-p11', 'and watch it spin.', 'Stop fully.'),
        phrase('rotor-p12', 'If the rotation looks uneven,', 'Pause after the condition.'), phrase('rotor-p13', 'adjust one blade and try again.', 'Finish the direction.'),
        phrase('rotor-p14', 'Read each step as one complete direction,', 'Pause briefly.'), phrase('rotor-p15', 'and stop fully at every period.', 'Finish the reminder.'),
      ],
      expressionCues: [
        expressionCue('rotor-list-cue', 'rotor-5', 'List phrasing cue', 'The commas separate three actions in one direction.'),
        expressionCue('rotor-pause-cue', 'rotor-6', 'Comma pause', 'The comma separates a condition from the action to take.'),
        expressionCue('rotor-stop-cue', 'rotor-7', 'Full stop', 'The period signals the end of a complete direction.'),
      ],
    }),
    contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION, eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: GRADE3_FLUENCY_FLIGHT_LESSON_IDS.independentDescription,
    worldId: GRADE3_FLUENCY_FLIGHT_WORLD_ID, unitId: GRADE3_FLUENCY_FLIGHT_UNIT_ID,
    activityId: 'activity-g3-fluency-flight-marsh-morning', difficulty: 4,
    passageIdentifiers: [GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.morningMarsh], questionIdentifiers: [...GRADE3_FLUENCY_FLIGHT_QUESTION_IDS.independentDescription],
    lessonTitle: 'Fluency Flight: Marsh Morning', lessonObjective: 'Practice calm descriptive phrasing and meaningful emphasis.',
    lessonRole: 'FLUENCY_PRACTICE', selectionStatus: 'active',
    fluencyPracticeBlock: fluencyBlock({
      title: 'Morning Above the Marsh', learnerCue: 'Keep the description calm, pause at commas, and give the final exclamation clear wonder.', requiredReadCount: 2, practiceMode: 'independent',
      phraseGroups: [
        phrase('marsh-p1', 'Golden light spread', 'Keep the image together.'), phrase('marsh-p2', 'across the quiet marsh.', 'Stop fully.'),
        phrase('marsh-p3', 'A thin layer of mist floated above the water,', 'Pause briefly.'), phrase('marsh-p4', 'and tiny drops sparkled on the reeds.', 'Finish calmly.'),
        phrase('marsh-p5', 'From the observation deck,', 'Pause after the opening phrase.'), phrase('marsh-p6', 'two children lifted their binoculars', 'Keep the action together.'), phrase('marsh-p7', 'and searched the shoreline.', 'Stop fully.'),
        phrase('marsh-p8', 'A heron stood perfectly still', 'Emphasize still.'), phrase('marsh-p9', 'beside a silver reflection.', 'Finish quietly.'),
        phrase('marsh-p10', 'Then its wings opened wide,', 'Pause briefly.'), phrase('marsh-p11', 'powerful and silent,', 'Keep the description together.'), phrase('marsh-p12', 'before the bird rose into the pale sky.', 'Finish smoothly.'),
        phrase('marsh-p13', 'The children whispered,', 'Pause before the quoted words.'), phrase('marsh-p14', '"What an amazing morning!"', 'Use quiet wonder.'),
      ],
      expressionCues: [
        expressionCue('marsh-calm-cue', 'marsh-1', 'Calm informational tone', 'The descriptive opening should sound calm and steady.'),
        expressionCue('marsh-emphasis-cue', 'marsh-4', 'Meaningful emphasis', 'The word still highlights that the heron is not moving.'),
        expressionCue('marsh-exclamation-cue', 'marsh-6', 'Exclamation cue', 'The exclamation supports a voice of wonder.'),
      ],
    }),
    contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION, eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: GRADE3_FLUENCY_FLIGHT_LESSON_IDS.independentLiterary,
    worldId: GRADE3_FLUENCY_FLIGHT_WORLD_ID, unitId: GRADE3_FLUENCY_FLIGHT_UNIT_ID,
    activityId: 'activity-g3-fluency-flight-first-launch', difficulty: 4,
    passageIdentifiers: [GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.firstLaunch], questionIdentifiers: [...GRADE3_FLUENCY_FLIGHT_QUESTION_IDS.independentLiterary],
    lessonTitle: 'Fluency Flight: First Launch', lessonObjective: 'Practice nervous, encouraging, and joyful expression in a short scene.',
    lessonRole: 'FLUENCY_PRACTICE', selectionStatus: 'active',
    fluencyPracticeBlock: fluencyBlock({
      title: "Mira's First Launch", learnerCue: 'Use the words and punctuation to shift from nervous to encouraging to joyful.', requiredReadCount: 2, practiceMode: 'independent',
      phraseGroups: [
        phrase('launch-p1', 'Mira held the kite string tightly', 'Keep the action together.'), phrase('launch-p2', 'while clouds hurried above the park.', 'Stop fully.'),
        phrase('launch-p3', 'She had practiced every step,', 'Pause briefly.'), phrase('launch-p4', 'but her hands still trembled.', 'Use a nervous tone.'),
        phrase('launch-p5', '"Remember the steady pull,"', 'Read the advice gently.'), phrase('launch-p6', 'her brother said gently.', 'Stop fully.'),
        phrase('launch-p7', 'Mira ran forward,', 'Pause briefly.'), phrase('launch-p8', 'felt the string tug,', 'Pause briefly.'), phrase('launch-p9', 'and looked up.', 'Stop fully.'),
        phrase('launch-p10', 'The red kite climbed', 'Keep the action together.'), phrase('launch-p11', 'past the treetops.', 'Stop fully.'),
        phrase('launch-p12', '"I did it!"', 'Use joyful energy.'), phrase('launch-p13', 'she shouted.', 'Stop fully.'),
        phrase('launch-p14', 'Her brother grinned,', 'Pause briefly.'), phrase('launch-p15', 'and Mira let the kite sail in a smooth circle.', 'Finish smoothly.'),
      ],
      expressionCues: [
        expressionCue('launch-dialogue-cue', 'launch-3', 'Dialogue cue', 'The brother gives calm encouragement.'),
        expressionCue('launch-excited-cue', 'launch-6', 'Excited announcement tone', 'The exclamation supports joyful energy.'),
        expressionCue('launch-reread-cue', 'launch-4', 'Reread cue', 'The three actions should stay connected with brief pauses.'),
      ],
    }),
    contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION, eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: GRADE3_FLUENCY_FLIGHT_LESSON_IDS.independentInformational,
    worldId: GRADE3_FLUENCY_FLIGHT_WORLD_ID, unitId: GRADE3_FLUENCY_FLIGHT_UNIT_ID,
    activityId: 'activity-g3-fluency-flight-formation-facts', difficulty: 4,
    passageIdentifiers: [GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS.geeseFormation], questionIdentifiers: [...GRADE3_FLUENCY_FLIGHT_QUESTION_IDS.independentInformational],
    lessonTitle: 'Fluency Flight: Formation Facts', lessonObjective: 'Practice smooth cause-and-effect phrasing in an informational explanation.',
    lessonRole: 'FLUENCY_PRACTICE', selectionStatus: 'active',
    fluencyPracticeBlock: fluencyBlock({
      title: 'Why Geese Fly in a V', learnerCue: 'Keep causes and results together, pause briefly at commas, and stop fully at periods.', requiredReadCount: 2, practiceMode: 'independent',
      phraseGroups: [
        phrase('geese-p1', 'Migrating geese often travel', 'Keep the subject and action together.'), phrase('geese-p2', 'in a V-shaped formation.', 'Stop fully.'),
        phrase('geese-p3', "Each bird's wings move the air", 'Keep the cause together.'), phrase('geese-p4', 'and create a helpful current', 'Keep the result together.'), phrase('geese-p5', 'for the bird behind it.', 'Stop fully.'),
        phrase('geese-p6', 'The formation can save energy', 'Keep the result together.'), phrase('geese-p7', 'during a long journey.', 'Stop fully.'),
        phrase('geese-p8', 'When the lead goose becomes tired,', 'Pause after the opening idea.'), phrase('geese-p9', 'another goose may move to the front.', 'Finish the result.'),
        phrase('geese-p10', 'The group also calls to one another', 'Keep the action together.'), phrase('geese-p11', 'as it travels.', 'Stop fully.'),
        phrase('geese-p12', 'Those calls help the flock stay together', 'Keep the first result together.'), phrase('geese-p13', 'and keep the same direction.', 'Stop fully.'),
        phrase('geese-p14', 'Commas mark short pauses,', 'Pause briefly.'), phrase('geese-p15', 'while periods separate each complete fact.', 'Stop fully.'),
      ],
      expressionCues: [
        expressionCue('geese-calm-cue', 'geese-1', 'Calm informational tone', 'The fact should sound steady and clear.'),
        expressionCue('geese-list-cue', 'geese-2', 'List phrasing cue', 'The sentence links an action and its helpful result.'),
        expressionCue('geese-comma-cue', 'geese-4', 'Comma pause', 'The comma separates the opening condition from the result.'),
      ],
    }),
    contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION, eligiblePurposes: ['progression', 'review'],
  },
]

export const grade3WordForgeFluencyFlightManifest = {
  packId: GRADE3_FLUENCY_FLIGHT_PACK_ID,
  packTitle: GRADE3_FLUENCY_FLIGHT_PACK_TITLE,
  gradeBand: 3 as const,
  worldId: GRADE3_FLUENCY_FLIGHT_WORLD_ID,
  unitId: GRADE3_FLUENCY_FLIGHT_UNIT_ID,
  primarySkillId: GRADE3_FLUENCY_FLIGHT_SKILL_ID,
  benchmarkReferences: [],
  supportingBenchmarkReferences: ['ELA.3.F.1.4'],
  coverageKind: 'supportive_practice' as const,
  partialBenchmarkCoverage: 'Supportive fluency-knowledge practice only. The app does not record audio or measure oral accuracy, automaticity, phrasing, expression, pronunciation, prosody, or reading rate.',
  difficultyRange: [4, 4] as [number, number],
  contentVersion: GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
  coveredPatterns: ['accuracy-practice', 'automaticity-practice', 'phrasing-practice', 'expression-practice', 'no-oral-measurement'],
  coveredSupportComponents: ['model-reading', 'phrase-cued-reading', 'punctuation-pauses', 'question-expression', 'exclamation-expression', 'dialogue-expression', 'repeated-reading', 'self-monitoring', 'understanding-check'],
  passageIds: [...Object.values(GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS)],
  questionIds: Object.values(GRADE3_FLUENCY_FLIGHT_QUESTION_IDS).flatMap((ids) => [...ids]),
  lessonIds: [...Object.values(GRADE3_FLUENCY_FLIGHT_LESSON_IDS)],
}

export const grade3WordForgeFluencyFlightPack: ContentPack = {
  manifest: grade3WordForgeFluencyFlightManifest,
  passages: grade3WordForgeFluencyFlightPassages,
  questions: grade3WordForgeFluencyFlightQuestions,
  lessons: grade3WordForgeFluencyFlightLessons,
}
