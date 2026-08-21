import type { ContentPackLesson } from '../../../contentPackTypes'
import type { FluencyExpressionCue, FluencyPhrase, FluencyPracticeBlock, TeachingBlock } from '../../../../../lesson'
import {
  FLUENCY_PRACTICE_CONTENT_VERSION,
  FLUENCY_PRACTICE_LESSON_IDS,
  FLUENCY_PRACTICE_SKILL_ID,
  FLUENCY_PRACTICE_UNIT_ID,
  FLUENCY_PRACTICE_WORLD_ID,
  FLUENCY_PRACTICE_PACK_ID,
  FLUENCY_PRACTICE_PACK_TITLE,
  FLUENCY_PRACTICE_PASSAGE_IDS,
  FLUENCY_PRACTICE_QUESTION_IDS,
} from './ids'

const guidedTeaching = (
  title: string,
  explanation: string,
  examples: string[],
  contrast: string,
  learnerCue: string,
): TeachingBlock => ({
  title,
  explanation,
  examples,
  contrast,
  learnerCue,
})

const phrase = (phraseId: string, text: string, cue?: string): FluencyPhrase => ({ phraseId, text, cue })

const expressionCue = (cueId: string, sentenceId: string, label: string, explanation: string): FluencyExpressionCue => ({
  cueId,
  sentenceId,
  label,
  explanation,
})

const fluencyBlock = (spec: {
  title: string
  learnerCue: string
  phraseGroups: FluencyPhrase[]
  expressionCues: FluencyExpressionCue[]
  requiredReadCount: number
  practiceMode: 'guided' | 'independent'
}): FluencyPracticeBlock => ({
  title: spec.title,
  learnerCue: spec.learnerCue,
  phraseGroups: spec.phraseGroups,
  expressionCues: spec.expressionCues,
  requiredReadCount: spec.requiredReadCount,
  modelReadingAvailable: true,
  oralReadingMeasured: false,
  timerUsed: false,
  microphoneUsed: false,
  practiceMode: spec.practiceMode,
})

export const grade2WordForgeFluencyPracticeManifest = {
  packId: FLUENCY_PRACTICE_PACK_ID,
  packTitle: FLUENCY_PRACTICE_PACK_TITLE,
  gradeBand: 2 as const,
  worldId: FLUENCY_PRACTICE_WORLD_ID,
  unitId: FLUENCY_PRACTICE_UNIT_ID,
  primarySkillId: FLUENCY_PRACTICE_SKILL_ID,
  benchmarkReferences: [],
  supportingBenchmarkReferences: ['ELA.2.F.1.4'],
  coverageKind: 'supportive_practice' as const,
  partialBenchmarkCoverage: 'Fluency support only; oral reading is not measured.',
  difficultyRange: [8, 8] as const,
  contentVersion: FLUENCY_PRACTICE_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
  coveredPatterns: ['fluency-practice-support'],
  coveredSupportComponents: [
    'model-reading',
    'phrase-cued-reading',
    'punctuation-pauses',
    'question-expression',
    'exclamation-expression',
    'dialogue-expression',
    'repeated-reading',
    'self-monitoring',
    'understanding-check',
  ],
  passageIds: [...Object.values(FLUENCY_PRACTICE_PASSAGE_IDS)],
  questionIds: [
    ...FLUENCY_PRACTICE_QUESTION_IDS.guidedPunctuationPauses,
    ...FLUENCY_PRACTICE_QUESTION_IDS.guidedPhraseGroups,
    ...FLUENCY_PRACTICE_QUESTION_IDS.guidedQuestionsAndExclamations,
    ...FLUENCY_PRACTICE_QUESTION_IDS.guidedDialogueVoice,
    ...FLUENCY_PRACTICE_QUESTION_IDS.independentNatureReport,
    ...FLUENCY_PRACTICE_QUESTION_IDS.independentCommunityAnnouncement,
    ...FLUENCY_PRACTICE_QUESTION_IDS.independentScienceDemonstration,
  ],
  lessonIds: [
    FLUENCY_PRACTICE_LESSON_IDS.guidedPunctuationPauses,
    FLUENCY_PRACTICE_LESSON_IDS.guidedPhraseGroups,
    FLUENCY_PRACTICE_LESSON_IDS.guidedQuestionsAndExclamations,
    FLUENCY_PRACTICE_LESSON_IDS.guidedDialogueVoice,
    FLUENCY_PRACTICE_LESSON_IDS.independentNatureReport,
    FLUENCY_PRACTICE_LESSON_IDS.independentCommunityAnnouncement,
    FLUENCY_PRACTICE_LESSON_IDS.independentScienceDemonstration,
  ],
} satisfies {
  packId: string
  packTitle: string
  gradeBand: 2
  worldId: string
  unitId: string
  primarySkillId: string
  benchmarkReferences: string[]
  supportingBenchmarkReferences: string[]
  coverageKind: 'supportive_practice'
  partialBenchmarkCoverage: string
  difficultyRange: [number, number]
  contentVersion: string
  reviewStatus: 'DRAFT'
  coveredPatterns: string[]
  coveredSupportComponents: string[]
  passageIds: string[]
  questionIds: string[]
  lessonIds: string[]
}

export const grade2WordForgeFluencyPracticeLessons: ContentPackLesson[] = [
  {
    lessonId: FLUENCY_PRACTICE_LESSON_IDS.guidedPunctuationPauses,
    worldId: FLUENCY_PRACTICE_WORLD_ID,
    unitId: FLUENCY_PRACTICE_UNIT_ID,
    activityId: 'activity-word-forge-fluency-practice-punctuation-pauses',
    difficulty: 8,
    passageIdentifiers: [FLUENCY_PRACTICE_PASSAGE_IDS.weatherAnnouncement],
    questionIdentifiers: [...FLUENCY_PRACTICE_QUESTION_IDS.guidedPunctuationPauses],
    lessonTitle: 'Punctuation Pauses',
    lessonObjective: 'Use commas, periods, questions, and exclamations to guide smooth reading.',
    lessonRole: 'FLUENCY_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Punctuation Pauses',
      'Punctuation helps a reader know when to pause, stop, ask a question, or show excitement. We read the sentence first, notice the punctuation, and then read the whole passage smoothly.',
      ['comma = pause gently', 'period = stop at the end', 'question mark = let the voice rise'],
      'We listen to the sentence meaning and punctuation together, not just the mark by itself.',
      'Pause gently where the comma appears.',
    ),
    fluencyPracticeBlock: fluencyBlock({
      title: 'Weather Announcement Practice',
      learnerCue: 'Listen, phrase the passage, then read it smoothly.',
      phraseGroups: [
        phrase('weather-phrase-1', 'At the weather table,', 'Pause gently at the comma.'),
        phrase('weather-phrase-2', 'the host smiled and said,', 'Pause gently at the comma.'),
        phrase('weather-phrase-3', '"Clouds are moving in, but the morning is calm."', 'Pause inside the quote.'),
        phrase('weather-phrase-4', 'She pointed to the chart,', 'Pause at the comma.'),
        phrase('weather-phrase-5', 'then read the note again.', 'Stop at the period.'),
        phrase('weather-phrase-6', '"Will the wind stay gentle?"', 'Let your voice rise for the question.'),
        phrase('weather-phrase-7', 'she asked.', 'Stop at the period.'),
        phrase('weather-phrase-8', 'The class watched the map quietly.', 'Keep the sentence calm.'),
        phrase('weather-phrase-9', 'One student said,', 'Pause at the comma.'),
        phrase('weather-phrase-10', '"Let\'s reread the page before we leave!"', 'Read the exclamation with excitement.'),
      ],
      expressionCues: [
        expressionCue('weather-cue-comma', 'weather-1', 'Pause gently', 'The comma invites a small pause before the next part of the sentence.'),
        expressionCue('weather-cue-question', 'weather-3', 'Question cue', 'The question mark tells the reader to let the voice rise.'),
        expressionCue('weather-cue-exclamation', 'weather-5', 'Exclamation cue', 'The exclamation mark tells the reader to show energy at the end.'),
      ],
      requiredReadCount: 2,
      practiceMode: 'guided',
    }),
    contentVersion: FLUENCY_PRACTICE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: FLUENCY_PRACTICE_LESSON_IDS.guidedPhraseGroups,
    worldId: FLUENCY_PRACTICE_WORLD_ID,
    unitId: FLUENCY_PRACTICE_UNIT_ID,
    activityId: 'activity-word-forge-fluency-practice-phrase-groups',
    difficulty: 8,
    passageIdentifiers: [FLUENCY_PRACTICE_PASSAGE_IDS.natureTrailReport],
    questionIdentifiers: [...FLUENCY_PRACTICE_QUESTION_IDS.guidedPhraseGroups],
    lessonTitle: 'Phrase Groups',
    lessonObjective: 'Read short phrase groups together before blending the whole passage.',
    lessonRole: 'FLUENCY_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Phrase Groups',
      'Phrase groups help readers keep words together in a smooth chunk. We often group words that belong together in meaning, then read the full sentence.',
      ['unpacked a small lunch', 'a stable bench', 'read the sign carefully'],
      'We do not rush one word at a time when the words naturally belong together.',
      'Keep the phrase together before blending the sentence.',
    ),
    fluencyPracticeBlock: fluencyBlock({
      title: 'Nature Trail Report',
      learnerCue: 'Read each phrase chunk, then blend the passage.',
      phraseGroups: [
        phrase('trail-phrase-1', 'On the nature trail,', 'Pause gently at the comma.'),
        phrase('trail-phrase-2', 'the group unpacked a small lunch', 'Keep this action together.'),
        phrase('trail-phrase-3', 'and a helpful map.', 'Stop at the period.'),
        phrase('trail-phrase-4', 'They sat near a stable bench', 'Keep the descriptive phrase together.'),
        phrase('trail-phrase-5', 'and listened for birds.', 'Stop at the period.'),
        phrase('trail-phrase-6', 'A ranger said,', 'Pause at the comma.'),
        phrase('trail-phrase-7', '"Read the sign carefully,', 'Pause at the comma.'),
        phrase('trail-phrase-8', 'then look for the blue feather."', 'Follow the instruction smoothly.'),
        phrase('trail-phrase-9', 'The children smiled, checked the path, and moved on together.', 'Read the closing sentence smoothly.'),
      ],
      expressionCues: [
        expressionCue('trail-cue-comma', 'trail-1', 'Pause gently', 'The comma gives the reader a small pause.'),
        expressionCue('trail-cue-calm', 'trail-2', 'Calm informational tone', 'The trail sentences should stay calm and steady.'),
        expressionCue('trail-cue-instruction', 'trail-3', 'List phrasing cue', 'The ranger sentence gives a clear instruction to read with care.'),
      ],
      requiredReadCount: 2,
      practiceMode: 'guided',
    }),
    contentVersion: FLUENCY_PRACTICE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: FLUENCY_PRACTICE_LESSON_IDS.guidedQuestionsAndExclamations,
    worldId: FLUENCY_PRACTICE_WORLD_ID,
    unitId: FLUENCY_PRACTICE_UNIT_ID,
    activityId: 'activity-word-forge-fluency-practice-questions-and-exclamations',
    difficulty: 8,
    passageIdentifiers: [FLUENCY_PRACTICE_PASSAGE_IDS.scienceDemo],
    questionIdentifiers: [...FLUENCY_PRACTICE_QUESTION_IDS.guidedQuestionsAndExclamations],
    lessonTitle: 'Questions and Exclamations',
    lessonObjective: 'Notice how question marks and exclamation marks change the voice.',
    lessonRole: 'FLUENCY_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Questions and Exclamations',
      'A question asks something, so the voice often rises at the end. An exclamation shows excitement, so the voice often becomes lively and clear.',
      ['"Did the plan work?"', '"That is exciting!"', 'The class used a question card.'],
      'We do not make every sentence sound the same.',
      'Let the question rise and the exclamation shine.',
    ),
    fluencyPracticeBlock: fluencyBlock({
      title: 'Science Demonstration',
      learnerCue: 'Read for the question, then show the excitement.',
      phraseGroups: [
        phrase('science-phrase-1', 'During the science demonstration,', 'Pause gently at the comma.'),
        phrase('science-phrase-2', 'the teacher said,', 'Pause at the comma.'),
        phrase('science-phrase-3', '"Preheat the lamp board, then watch what changes."', 'Read this instruction smoothly.'),
        phrase('science-phrase-4', 'The class used a question card, wrote one careful note, and compared the results.', 'Read the whole informational sentence smoothly.'),
        phrase('science-phrase-5', '"That is exciting!"', 'Read the exclamation with excitement.'),
        phrase('science-phrase-6', 'one student shouted.', 'Stop at the period.'),
        phrase('science-phrase-7', 'Another student replied,', 'Pause at the comma.'),
        phrase('science-phrase-8', '"Let\'s review the steps and help each other."', 'Read the response in a calm voice.'),
      ],
      expressionCues: [
        expressionCue('science-cue-question', 'science-2', 'Question cue', 'The question card sentence should rise and sound curious.'),
        expressionCue('science-cue-exclamation', 'science-3', 'Excited announcement tone', 'The excited sentence should sound lively and strong.'),
        expressionCue('science-cue-dialogue', 'science-4', 'Dialogue cue', 'The quoted response should sound like someone speaking aloud.'),
      ],
      requiredReadCount: 2,
      practiceMode: 'guided',
    }),
    contentVersion: FLUENCY_PRACTICE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: FLUENCY_PRACTICE_LESSON_IDS.guidedDialogueVoice,
    worldId: FLUENCY_PRACTICE_WORLD_ID,
    unitId: FLUENCY_PRACTICE_UNIT_ID,
    activityId: 'activity-word-forge-fluency-practice-dialogue-and-character-voice',
    difficulty: 8,
    passageIdentifiers: [FLUENCY_PRACTICE_PASSAGE_IDS.museumDialogue],
    questionIdentifiers: [...FLUENCY_PRACTICE_QUESTION_IDS.guidedDialogueVoice],
    lessonTitle: 'Dialogue and Character Voice',
    lessonObjective: 'Read dialogue so each character sounds like a real speaker.',
    lessonRole: 'FLUENCY_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Dialogue and Character Voice',
      'Dialogue is what a character says. We look for quotation marks and speech verbs, then we let each line sound like a person talking.',
      ['"Is the ghost story real?"', '"It is only a story card."', '"The guide laughed softly."'],
      'We do not read dialogue like a flat list of facts.',
      'Make each speaker sound curious, calm, or excited as the words show.',
    ),
    fluencyPracticeBlock: fluencyBlock({
      title: 'Museum Dialogue',
      learnerCue: 'Read the speakers, then blend the conversation smoothly.',
      phraseGroups: [
        phrase('museum-phrase-1', 'At the museum,', 'Pause gently at the comma.'),
        phrase('museum-phrase-2', 'the guide said,', 'Pause at the comma before dialogue.'),
        phrase('museum-phrase-3', '"This room has a knight\'s helmet, a brass comb, and a map of an island."', 'Read the dialogue smoothly.'),
        phrase('museum-phrase-4', 'A child asked,', 'Pause at the comma.'),
        phrase('museum-phrase-5', '"Is the ghost story real?"', 'Let the voice rise for the question.'),
        phrase('museum-phrase-6', 'The guide laughed softly and said,', 'Pause at the comma.'),
        phrase('museum-phrase-7', '"It is only a story card, but it still makes readers curious!"', 'Read with a curious, excited voice.'),
        phrase('museum-phrase-8', 'The group moved from one case to the next and stopped to look closely.', 'Read the closing sentence calmly.'),
      ],
      expressionCues: [
        expressionCue('museum-cue-dialogue', 'museum-1', 'Dialogue cue', 'The speaker lines should sound like real conversation.'),
        expressionCue('museum-cue-question', 'museum-2', 'Question cue', 'The question should sound curious and gently rising.'),
        expressionCue('museum-cue-exclamation', 'museum-3', 'Excited announcement tone', 'The final dialogue line should sound curious and excited.'),
      ],
      requiredReadCount: 1,
      practiceMode: 'guided',
    }),
    contentVersion: FLUENCY_PRACTICE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: FLUENCY_PRACTICE_LESSON_IDS.independentNatureReport,
    worldId: FLUENCY_PRACTICE_WORLD_ID,
    unitId: FLUENCY_PRACTICE_UNIT_ID,
    activityId: 'activity-word-forge-fluency-practice-nature-report',
    difficulty: 8,
    passageIdentifiers: [FLUENCY_PRACTICE_PASSAGE_IDS.animalCareDemo],
    questionIdentifiers: [...FLUENCY_PRACTICE_QUESTION_IDS.independentNatureReport],
    lessonTitle: 'Nature Report Fluency Flight',
    lessonObjective: 'Read a calm report and notice how the sentence meaning stays clear.',
    lessonRole: 'FLUENCY_PRACTICE',
    selectionStatus: 'active',
    fluencyPracticeBlock: fluencyBlock({
      title: 'Animal Care Demonstration',
      learnerCue: 'Read, reread, and check the meaning as you go.',
      phraseGroups: [
        phrase('animal-phrase-1', 'At the animal-care center,', 'Pause gently at the comma.'),
        phrase('animal-phrase-2', 'the helper lit a candle in a safe jar', 'Keep the calm phrase together.'),
        phrase('animal-phrase-3', 'so the room stayed warm.', 'Stop at the period.'),
        phrase('animal-phrase-4', 'She showed how to hold a bottle with both hands', 'Keep the action together.'),
        phrase('animal-phrase-5', 'and move slowly.', 'Stop at the period.'),
        phrase('animal-phrase-6', '"Did the pup drink?"', 'Let the voice rise for the question.'),
        phrase('animal-phrase-7', 'asked one child.', 'Stop at the period.'),
        phrase('animal-phrase-8', '"Yes,"', 'Pause gently at the comma.'),
        phrase('animal-phrase-9', 'said the helper,', 'Pause gently at the comma.'),
        phrase('animal-phrase-10', '"and the pup feels safe and calm."', 'Keep the calm reply together.'),
        phrase('animal-phrase-11', 'The team checked the stable crate and smiled.', 'Read the ending calmly.'),
      ],
      expressionCues: [
        expressionCue('animal-cue-calm', 'animal-1', 'Calm informational tone', 'The calm sentences should sound steady and careful.'),
        expressionCue('animal-cue-question', 'animal-3', 'Question cue', 'The question should rise a little at the end.'),
        expressionCue('animal-cue-self-monitor', 'animal-5', 'Self-monitoring', 'The final sentence invites the reader to check the meaning and stay smooth.'),
      ],
      requiredReadCount: 2,
      practiceMode: 'independent',
    }),
    contentVersion: FLUENCY_PRACTICE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: FLUENCY_PRACTICE_LESSON_IDS.independentCommunityAnnouncement,
    worldId: FLUENCY_PRACTICE_WORLD_ID,
    unitId: FLUENCY_PRACTICE_UNIT_ID,
    activityId: 'activity-word-forge-fluency-practice-community-announcement',
    difficulty: 8,
    passageIdentifiers: [FLUENCY_PRACTICE_PASSAGE_IDS.gardenInstructions],
    questionIdentifiers: [...FLUENCY_PRACTICE_QUESTION_IDS.independentCommunityAnnouncement],
    lessonTitle: 'Community Announcement Fluency Flight',
    lessonObjective: 'Read a community announcement with list phrasing and clear expression cues.',
    lessonRole: 'FLUENCY_PRACTICE',
    selectionStatus: 'active',
    fluencyPracticeBlock: fluencyBlock({
      title: 'Community Garden Announcement',
      learnerCue: 'Notice the list, then read the message with a steady voice.',
      phraseGroups: [
        phrase('garden-phrase-1', 'At the community garden,', 'Pause gently at the comma.'),
        phrase('garden-phrase-2', 'the leader gave three steps:', 'Use a list cue.'),
        phrase('garden-phrase-3', 'water, weed, and wait.', 'Read the list smoothly.'),
        phrase('garden-phrase-4', 'The children carried a bundle of gloves', 'Keep the phrase together.'),
        phrase('garden-phrase-5', 'and moved carefully between the rows.', 'Stop at the period.'),
        phrase('garden-phrase-6', '"Can you find the tiny sprouts?"', 'Let the voice rise for the question.'),
        phrase('garden-phrase-7', 'she asked.', 'Stop at the period.'),
        phrase('garden-phrase-8', 'The team smiled and worked quickly.', 'Keep the ending smooth and lively.'),
        phrase('garden-phrase-9', 'Soon the table near the gate held fresh herbs and a sign that said,', 'Pause at the comma.'),
        phrase('garden-phrase-10', '"Please share!"', 'Read the exclamation with excitement.'),
      ],
      expressionCues: [
        expressionCue('garden-cue-list', 'garden-1', 'List phrasing cue', 'The list should sound linked together, not rushed word by word.'),
        expressionCue('garden-cue-question', 'garden-3', 'Question cue', 'The question should sound curious and friendly.'),
        expressionCue('garden-cue-exclamation', 'garden-5', 'Excited announcement tone', 'The closing sign should sound lively and bright.'),
      ],
      requiredReadCount: 2,
      practiceMode: 'independent',
    }),
    contentVersion: FLUENCY_PRACTICE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'review'],
  },
  {
    lessonId: FLUENCY_PRACTICE_LESSON_IDS.independentScienceDemonstration,
    worldId: FLUENCY_PRACTICE_WORLD_ID,
    unitId: FLUENCY_PRACTICE_UNIT_ID,
    activityId: 'activity-word-forge-fluency-practice-science-demonstration',
    difficulty: 8,
    passageIdentifiers: [FLUENCY_PRACTICE_PASSAGE_IDS.libraryAnnouncement],
    questionIdentifiers: [...FLUENCY_PRACTICE_QUESTION_IDS.independentScienceDemonstration],
    lessonTitle: 'Science Demonstration Fluency Flight',
    lessonObjective: 'Read a final passage with self-monitoring, rereading, and a calm ending.',
    lessonRole: 'FLUENCY_PRACTICE',
    selectionStatus: 'active',
    fluencyPracticeBlock: fluencyBlock({
      title: 'Library Event Announcement',
      learnerCue: 'Read the announcement, then check the meaning and try again if needed.',
      phraseGroups: [
        phrase('library-phrase-1', 'At the library event,', 'Pause gently at the comma.'),
        phrase('library-phrase-2', 'a librarian said,', 'Pause at the comma.'),
        phrase('library-phrase-3', '"Read the flyer, then join the bubble parade!"', 'Read the exclamation with excitement.'),
        phrase('library-phrase-4', 'The children lined up near a quiet table', 'Keep the phrase smooth and steady.'),
        phrase('library-phrase-5', 'and picked a book that could be read again.', 'Stop at the period.'),
        phrase('library-phrase-6', 'One child whispered,', 'Pause at the comma.'),
        phrase('library-phrase-7', '"I may misspell this title, so I will check it."', 'Read with careful self-monitoring.'),
        phrase('library-phrase-8', 'The librarian nodded and said,', 'Pause at the comma.'),
        phrase('library-phrase-9', '"That is a helpful plan."', 'Read the ending calmly.'),
      ],
      expressionCues: [
        expressionCue('library-cue-exclamation', 'library-1', 'Excited announcement tone', 'The flyer line should sound cheerful and bright.'),
        expressionCue('library-cue-self-monitor', 'library-3', 'Self-monitoring', 'The checking sentence should sound careful and thoughtful.'),
        expressionCue('library-cue-calm', 'library-4', 'Calm informational tone', 'The final line should sound calm and friendly.'),
      ],
      requiredReadCount: 2,
      practiceMode: 'independent',
    }),
    contentVersion: FLUENCY_PRACTICE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'review'],
  },
]
