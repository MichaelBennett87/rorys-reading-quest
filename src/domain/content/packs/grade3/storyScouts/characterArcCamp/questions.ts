import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson } from '../../../contentPackTypes'
import type { TeachingBlock } from '../../../../../lesson'
import { characterArcCoveragePatterns, characterArcStories, type CharacterArcStoryRecord } from './characterDevelopmentGuides'
import {
  CHARACTER_ARC_BENCHMARK,
  CHARACTER_ARC_LESSON_IDS,
  CHARACTER_ARC_LESSON_TITLES,
  CHARACTER_ARC_REPORTING_CATEGORY,
  CHARACTER_ARC_SKILL_ID,
  CHARACTER_ARC_UNIT_ID,
  CHARACTER_ARC_VERSION,
  CHARACTER_ARC_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }

const COMMON_TAGS = [...characterArcCoveragePatterns]
const lessonObjectives = [
  'Use beginning and ending evidence to explain how a character develops.',
  'Connect a character’s actions and choices to a change across the plot.',
  'Identify a turning point and explain how it changes a character’s response.',
  'Trace how two characters develop during the same sequence of events.',
  'Explain a character’s development using beginning, middle, and ending evidence.',
  'Connect a turning point to a character’s later actions and confidence.',
  'Explain how two characters develop through responsibility and cooperation.',
]

const teachingBlocks: TeachingBlock[] = [
  {
    title: 'Trace the beginning and the end',
    explanation: 'Character development explains how a character grows, learns, changes a strategy, or responds differently as plot events happen.',
    examples: ['Beginning: find what the character wants, does, thinks, or feels.', 'End: find what the character does differently and which event helped cause the change.'],
    contrast: 'A trait such as “careful” describes a character. A development explanation connects at least two plot stages.',
    learnerCue: 'Find a beginning detail, a turning point, and an ending detail. Then connect them.',
  },
  {
    title: 'Actions and choices show change',
    explanation: 'A character’s actions, dialogue, thoughts, feelings, and choices can show development during a challenge.',
    examples: ['Notice an early response to the problem.', 'Compare it with an action or choice after the turning point.'],
    contrast: 'Do not stop at “The character is responsible.” Explain what the character did earlier and later.',
    learnerCue: 'Ask: What happened, how did the character respond, and what did the character do differently later?',
  },
  {
    title: 'Find the turning point',
    explanation: 'A turning point is an event or realization that starts or reveals an important change in the character.',
    examples: ['Locate the problem or consequence that makes the old strategy stop working.', 'Find the next action, dialogue, or thought that shows a shift.'],
    contrast: 'A minor event may happen in the middle without changing the character’s response.',
    learnerCue: 'Connect the turning point to a later action, not just to a trait word.',
  },
  {
    title: 'Trace two clear arcs',
    explanation: 'Two characters can develop during the same plot. Trace each character’s beginning, turning point, and end without comparing perspectives.',
    examples: ['Keep each character’s evidence in its own arc.', 'Explain how shared events lead each character to respond differently later.'],
    contrast: 'Naming two traits is not the same as explaining two developments.',
    learnerCue: 'Follow one character at a time, then state how the shared plot changed each response.',
  },
]

function choice(questionId: string, suffix: string, text: string): Choice {
  return { id: `${questionId}-${suffix}`, text }
}

function base(
  story: CharacterArcStoryRecord,
  lessonIndex: number,
  questionIndex: number,
  questionType: ReadingQuestion['questionType'],
  prompt: string,
  explanation: string,
  evidenceReferenceIds: string[],
  tags: string[],
) {
  const questionIdentifier = `g3-ss-cac-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier,
    questionType,
    prompt,
    gradeBand: 3 as const,
    benchmarkReference: CHARACTER_ARC_BENCHMARK,
    skillIdentifier: CHARACTER_ARC_SKILL_ID,
    prerequisiteSkillIdentifiers: [],
    reportingCategory: CHARACTER_ARC_REPORTING_CATEGORY,
    genre: 'literary',
    difficulty: story.difficulty,
    passageIdentifier: story.passageId,
    activityIdentifier: `g3-ss-cac-activity-${lessonIndex + 1}`,
    lessonIdentifier: CHARACTER_ARC_LESSON_IDS[lessonIndex],
    explanation,
    evidenceReference: evidenceReferenceIds[0] ?? story.beginningEvidenceId,
    evidenceReferenceIds,
    targetVocabulary: [],
    soundOutChunks: [],
    estimatedReadingLevel: 'Grade 3',
    tags: [...COMMON_TAGS, ...tags],
    reviewStatus: 'DRAFT' as const,
    contentVersion: CHARACTER_ARC_VERSION,
  }
}

function multipleChoice(
  story: CharacterArcStoryRecord,
  lessonIndex: number,
  questionIndex: number,
  prompt: string,
  correctText: string,
  distractors: string[],
  explanation: string,
  evidenceIds: string[],
  tags: string[],
): ReadingQuestion {
  const data = base(story, lessonIndex, questionIndex, 'multiple_choice', prompt, explanation, evidenceIds, tags)
  const answerPosition = (lessonIndex + questionIndex) % 4
  const texts = [...distractors]
  texts.splice(answerPosition, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return {
    ...data,
    answerChoices: choices.map((entry) => entry.text),
    correctAnswers: [correct.text],
    questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] },
  }
}

function multiselect(story: CharacterArcStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(
    story,
    lessonIndex,
    questionIndex,
    'multi_select',
    `Choose two details, one from the beginning and one from the end, that show how ${story.primaryCharacter} develops.`,
    `The beginning detail shows the earlier response, and the ending detail shows what ${story.primaryCharacter} does differently after the plot events.`,
    [story.beginningEvidenceId, story.endingEvidenceId],
    ['beginning-state', 'ending-state', 'plot-development-link', 'action-evidence'],
  )
  const choices = [
    choice(data.questionIdentifier, 'beginning', story.beginningChoice),
    choice(data.questionIdentifier, 'turning', story.turningChoice),
    choice(data.questionIdentifier, 'ending', story.endingChoice),
    choice(data.questionIdentifier, 'minor', story.unrelatedChoice),
  ]
  return {
    ...data,
    answerChoices: choices.map((entry) => entry.text),
    correctAnswers: [choices[0].text, choices[2].text],
    questionContent: { type: 'multi_select', choices, correctChoiceIds: [choices[0].id, choices[2].id], allowMultiple: true },
  }
}

function hotText(
  story: CharacterArcStoryRecord,
  lessonIndex: number,
  questionIndex: number,
  target: 'turning' | 'ending',
): ReadingQuestion {
  const targetId = target === 'turning' ? story.turningEvidenceId : story.endingEvidenceId
  const prompt = target === 'turning'
    ? `Select the sentence that best shows the turning point in ${story.primaryCharacter}’s development.`
    : `Select the sentence that best shows ${story.primaryCharacter} responding differently near the end.`
  const data = base(
    story,
    lessonIndex,
    questionIndex,
    'hot_text',
    prompt,
    target === 'turning'
      ? 'This event changes the situation and leads to a different response later.'
      : 'This ending action shows the character responding differently after the turning point.',
    [targetId],
    target === 'turning' ? ['turning-point', 'plot-development-link'] : ['ending-state', 'action-evidence'],
  )
  const segmentIds = [story.beginningEvidenceId, story.turningEvidenceId, story.endingEvidenceId, story.minorEvidenceId]
  const segments = segmentIds.map((sentenceId, index) => choice(
    data.questionIdentifier,
    `segment-${index + 1}`,
    story.sentences.find((sentence) => sentence.sentenceId === sentenceId)?.text ?? '',
  ))
  const correctIndex = segmentIds.indexOf(targetId)
  return {
    ...data,
    answerChoices: segments.map((entry) => entry.text),
    correctAnswers: [segments[correctIndex].text],
    questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [segments[correctIndex].id] },
  }
}

function tableMatch(story: CharacterArcStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(
    story,
    lessonIndex,
    questionIndex,
    'table_match',
    `Match each plot stage with the evidence that traces ${story.primaryCharacter}’s development.`,
    'The three matches trace an earlier response, a turning point, and a later response across the plot.',
    [story.beginningEvidenceId, story.turningEvidenceId, story.endingEvidenceId],
    ['beginning-state', 'turning-point', 'ending-state', 'beginning-middle-end-table', 'text-evidence'],
  )
  const options = [
    choice(data.questionIdentifier, 'option-beginning', story.beginningChoice),
    choice(data.questionIdentifier, 'option-middle', story.turningChoice),
    choice(data.questionIdentifier, 'option-end', story.endingChoice),
  ]
  const rows = [
    { id: `${data.questionIdentifier}-row-beginning`, prompt: 'Beginning', correctChoiceId: options[0].id, options },
    { id: `${data.questionIdentifier}-row-middle`, prompt: 'Middle or turning point', correctChoiceId: options[1].id, options },
    { id: `${data.questionIdentifier}-row-end`, prompt: 'End', correctChoiceId: options[2].id, options },
  ]
  return {
    ...data,
    answerChoices: options.map((entry) => entry.text),
    correctAnswers: rows.map((row) => row.correctChoiceId),
    questionContent: { type: 'table_match', selectionMode: 'use_each_once', rows },
  }
}

function twoPart(story: CharacterArcStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(
    story,
    lessonIndex,
    questionIndex,
    'two_part',
    `Use the plot to explain how ${story.primaryCharacter} develops, then choose the evidence pair that supports the explanation.`,
    'The development explanation connects an earlier response with a different later response, and the evidence pair proves both stages.',
    [story.beginningEvidenceId, story.endingEvidenceId],
    ['beginning-state', 'ending-state', 'plot-development-link', 'static-trait-distinction', 'text-evidence'],
  )
  const correctDevelopment = story.combinedDevelopmentChoice ?? story.developmentChoice
  const partAChoices = [
    choice(data.questionIdentifier, 'part-a-development', correctDevelopment),
    choice(data.questionIdentifier, 'part-a-trait', story.traitOnlyChoice),
    choice(data.questionIdentifier, 'part-a-unrelated', story.unrelatedChoice),
  ]
  const beginningSentence = story.sentences.find((sentence) => sentence.sentenceId === story.beginningEvidenceId)?.text ?? ''
  const endingSentence = story.sentences.find((sentence) => sentence.sentenceId === story.endingEvidenceId)?.text ?? ''
  const turningSentence = story.sentences.find((sentence) => sentence.sentenceId === story.turningEvidenceId)?.text ?? ''
  const minorSentence = story.sentences.find((sentence) => sentence.sentenceId === story.minorEvidenceId)?.text ?? ''
  const partBChoices = [
    choice(data.questionIdentifier, 'part-b-support', `Beginning: ${beginningSentence} End: ${endingSentence}`),
    choice(data.questionIdentifier, 'part-b-middle-only', `Middle: ${turningSentence} Minor detail: ${minorSentence}`),
    choice(data.questionIdentifier, 'part-b-minor', `Minor detail: ${minorSentence}`),
  ]
  return {
    ...data,
    answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text),
    correctAnswers: [partAChoices[0].text, partBChoices[0].text],
    questionContent: {
      type: 'two_part',
      partAPrompt: `Part A: Which statement best explains how ${story.primaryCharacter} develops?`,
      partAChoices,
      partACorrectChoiceId: partAChoices[0].id,
      partBPrompt: 'Part B: Which beginning-and-ending evidence best supports Part A?',
      partBChoices,
      partBCorrectChoiceId: partBChoices[0].id,
    },
  }
}

function guidedQuestions(story: CharacterArcStoryRecord, lessonIndex: number): ReadingQuestion[] {
  const developmentText = story.combinedDevelopmentChoice ?? story.developmentChoice
  return [
    multipleChoice(story, lessonIndex, 1, `What is most important about ${story.primaryCharacter} at the beginning?`, story.beginningChoice, [story.turningChoice, story.endingChoice, story.unrelatedChoice], 'This beginning detail establishes the earlier response before the important events occur.', [story.beginningEvidenceId], ['beginning-state', 'text-evidence']),
    multipleChoice(story, lessonIndex, 2, `Which statement explains ${story.primaryCharacter}’s development instead of naming only a trait?`, developmentText, [story.traitOnlyChoice, story.turningChoice, story.unrelatedChoice], 'A development explanation connects what happens earlier and later in the plot instead of naming one static trait.', [story.beginningEvidenceId, story.turningEvidenceId, story.endingEvidenceId], ['static-trait-distinction', 'plot-development-link', 'ending-state', ...(story.arcs.length === 2 ? ['two-character-development'] : [])]),
    multiselect(story, lessonIndex, 3),
    hotText(story, lessonIndex, 4, 'turning'),
    tableMatch(story, lessonIndex, 5),
  ]
}

function checkpointQuestions(story: CharacterArcStoryRecord, lessonIndex: number): ReadingQuestion[] {
  const developmentText = story.combinedDevelopmentChoice ?? story.developmentChoice
  return [
    multipleChoice(story, lessonIndex, 1, `How does ${story.primaryCharacter} respond near the beginning of the plot?`, story.beginningChoice, [story.turningChoice, story.endingChoice, story.unrelatedChoice], 'The beginning evidence shows the character’s earlier response before the turning point.', [story.beginningEvidenceId], ['beginning-state', 'text-evidence']),
    multipleChoice(story, lessonIndex, 2, `Which event is the clearest turning point for ${story.primaryCharacter}?`, story.turningChoice, [story.beginningChoice, story.endingChoice, story.unrelatedChoice], 'The turning point creates or reveals the shift that leads to a different later response.', [story.turningEvidenceId], ['turning-point', 'plot-development-link', 'dialogue-evidence', 'thought-evidence']),
    multipleChoice(story, lessonIndex, 3, `Which statement best explains ${story.primaryCharacter}’s development across the plot?`, developmentText, [story.traitOnlyChoice, story.endingChoice, story.unrelatedChoice], 'The best explanation connects the beginning, the plot’s turning point, and the changed response at the end.', [story.beginningEvidenceId, story.turningEvidenceId, story.endingEvidenceId], ['static-trait-distinction', 'ending-state', 'plot-development-link', ...(story.arcs.length === 2 ? ['two-character-development'] : [])]),
    multiselect(story, lessonIndex, 4),
    hotText(story, lessonIndex, 5, 'ending'),
    tableMatch(story, lessonIndex, 6),
    twoPart(story, lessonIndex, 7),
  ]
}

export const characterArcQuestions: ReadingQuestion[] = characterArcStories.flatMap((story, lessonIndex) => (
  lessonIndex < 4 ? guidedQuestions(story, lessonIndex) : checkpointQuestions(story, lessonIndex)
))

export const characterArcLessons: ContentPackLesson[] = characterArcStories.map((story, lessonIndex) => {
  const lessonQuestions = characterArcQuestions.filter((question) => question.lessonIdentifier === CHARACTER_ARC_LESSON_IDS[lessonIndex])
  const checkpoint = lessonIndex >= 4
  return {
    lessonId: CHARACTER_ARC_LESSON_IDS[lessonIndex],
    worldId: CHARACTER_ARC_WORLD_ID,
    unitId: CHARACTER_ARC_UNIT_ID,
    activityId: `g3-ss-cac-activity-${lessonIndex + 1}`,
    difficulty: story.difficulty,
    passageIdentifiers: [story.passageId],
    questionIdentifiers: lessonQuestions.map((question) => question.questionIdentifier),
    lessonTitle: CHARACTER_ARC_LESSON_TITLES[lessonIndex],
    lessonObjective: lessonObjectives[lessonIndex],
    lessonRole: checkpoint ? 'CHECKPOINT' : 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    ...(checkpoint ? {} : { teachingBlock: teachingBlocks[lessonIndex] }),
    contentVersion: CHARACTER_ARC_VERSION,
    eligiblePurposes: checkpoint
      ? ['progression', 'verification', 'review']
      : ['remediation', 'review'],
  }
})
