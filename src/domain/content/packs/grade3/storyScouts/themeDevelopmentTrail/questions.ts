import type { TeachingBlock } from '../../../../../lesson'
import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson } from '../../../contentPackTypes'
import { themeDevelopmentCoveragePatterns, themeDevelopmentStories, type ThemeDevelopmentStoryRecord } from './themeDevelopmentGuides'
import {
  THEME_DEVELOPMENT_BENCHMARK,
  THEME_DEVELOPMENT_LESSON_IDS,
  THEME_DEVELOPMENT_LESSON_TITLES,
  THEME_DEVELOPMENT_REPORTING_CATEGORY,
  THEME_DEVELOPMENT_SKILL_ID,
  THEME_DEVELOPMENT_UNIT_ID,
  THEME_DEVELOPMENT_VERSION,
  THEME_DEVELOPMENT_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }

const COMMON_TAGS = [...themeDevelopmentCoveragePatterns]
const lessonObjectives = [
  'Distinguish a complete theme from a topic or plot summary.',
  'Connect beginning and ending details to one supported theme.',
  'Explain how choices and consequences make a theme clearer.',
  'Use a turning point to trace theme development across a plot.',
  'Explain how repeated effort develops a theme across the whole story.',
  'Explain how a character\'s question and later choice develop a theme.',
  'Use beginning, middle, and ending evidence to explain a fairness theme.',
]

const teachingBlocks: TeachingBlock[] = [
  {
    title: 'Topic, theme, and summary do different jobs',
    explanation: 'A topic names a broad subject. A theme is a complete message the story supports. A summary tells what happened.',
    examples: ['Topic: friendship', 'Theme: Friendship grows stronger when people listen and solve problems together.'],
    contrast: 'One word is usually a topic, and a list of events is a summary. Neither is a complete theme explanation.',
    learnerCue: 'Choose the complete message that important story events support.',
  },
  {
    title: 'Trace details across the plot',
    explanation: 'A theme develops as beginning, middle, and ending events add support to the same important message.',
    examples: ['Find the first choice.', 'Notice its consequence.', 'Connect the later choice to the same message.'],
    contrast: 'A detail is not theme evidence just because it is true. It should connect to conflict, choice, consequence, or resolution.',
    learnerCue: 'Find one early detail and one later detail that support the same theme.',
  },
  {
    title: 'Choices and consequences build a theme',
    explanation: 'A character\'s choice may create a consequence. A later choice can show why the story\'s message matters.',
    examples: ['Ask what the character chose.', 'Ask what happened because of that choice.', 'Notice what the character does next.'],
    contrast: 'Do not answer with only the character\'s trait or with a command such as “Always be honest.”',
    learnerCue: 'Connect the choice, the result, and the later response.',
  },
  {
    title: 'A turning point strengthens the message',
    explanation: 'The turning point often makes the conflict clear enough for a character to choose a new response.',
    examples: ['Locate the event that makes the first plan stop working.', 'Find the later detail that confirms the new response.'],
    contrast: 'The theme is broader than the turning point. Explain how that event adds support to the message.',
    learnerCue: 'Trace the theme before, during, and after the turning point.',
  },
]

function choice(questionId: string, suffix: string, text: string): Choice {
  return { id: `${questionId}-${suffix}`, text }
}

function base(
  story: ThemeDevelopmentStoryRecord,
  lessonIndex: number,
  questionIndex: number,
  questionType: ReadingQuestion['questionType'],
  prompt: string,
  explanation: string,
  evidenceReferenceIds: string[],
  tags: string[],
) {
  const questionIdentifier = `g3-ss-tdt-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier,
    questionType,
    prompt,
    gradeBand: 3 as const,
    benchmarkReference: THEME_DEVELOPMENT_BENCHMARK,
    skillIdentifier: THEME_DEVELOPMENT_SKILL_ID,
    prerequisiteSkillIdentifiers: [],
    reportingCategory: THEME_DEVELOPMENT_REPORTING_CATEGORY,
    genre: 'literary',
    difficulty: story.difficulty,
    passageIdentifier: story.passageId,
    activityIdentifier: `g3-ss-tdt-activity-${lessonIndex + 1}-question-${questionIndex}`,
    lessonIdentifier: THEME_DEVELOPMENT_LESSON_IDS[lessonIndex],
    explanation,
    evidenceReference: evidenceReferenceIds[0] ?? story.beginningEvidenceId,
    evidenceReferenceIds,
    targetVocabulary: [],
    soundOutChunks: [],
    estimatedReadingLevel: 'Grade 3',
    tags: [...COMMON_TAGS, ...tags],
    reviewStatus: 'DRAFT' as const,
    contentVersion: THEME_DEVELOPMENT_VERSION,
  }
}

function multipleChoice(
  story: ThemeDevelopmentStoryRecord,
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
  const texts = [...distractors]
  texts.splice((lessonIndex * 2 + questionIndex) % 4, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return {
    ...data,
    answerChoices: choices.map((entry) => entry.text),
    correctAnswers: [correct.text],
    questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] },
  }
}

function themeQuestion(story: ThemeDevelopmentStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return multipleChoice(
    story,
    lessonIndex,
    questionIndex,
    'Which statement is the best-supported theme of this story?',
    story.supportedTheme,
    [story.topicLabel, story.summaryChoice, story.unsupportedThemeChoice],
    'The best theme is a complete message supported by the conflict, turning point, and resolution.',
    [story.beginningEvidenceId, story.turningEvidenceId, story.endingEvidenceId],
    ['best-supported-theme', 'theme-topic-summary-distinction', 'supporting-details'],
  )
}

function developmentQuestion(story: ThemeDevelopmentStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return multipleChoice(
    story,
    lessonIndex,
    questionIndex,
    'Which statement best explains how the theme develops across the story?',
    story.developmentSummary,
    [story.summaryChoice, story.beginningEvidenceChoice, story.unsupportedThemeChoice],
    'The correct explanation connects the early choice, the middle consequence or turning point, and the ending response.',
    [story.beginningEvidenceId, story.middleEvidenceId, story.turningEvidenceId, story.endingEvidenceId],
    ['theme-development', 'plot-theme-connection', 'all-three-stage-evidence'],
  )
}

function topicQuestion(story: ThemeDevelopmentStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return multipleChoice(
    story,
    lessonIndex,
    questionIndex,
    'Which choice is only the broad topic rather than a complete theme?',
    story.topicLabel,
    [story.supportedTheme, story.summaryChoice, story.unsupportedThemeChoice],
    'The topic names the broad subject in a few words; a theme expresses a complete message.',
    [story.beginningEvidenceId],
    ['theme-topic-summary-distinction', 'topic-only'],
  )
}

function multiselect(story: ThemeDevelopmentStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(
    story,
    lessonIndex,
    questionIndex,
    'multi_select',
    'Choose two details, one from the beginning and one from the end, that develop the supported theme.',
    'The early choice introduces the important idea, and the ending choice shows that idea guiding a later response.',
    [story.beginningEvidenceId, story.endingEvidenceId],
    ['beginning-theme-evidence', 'ending-theme-evidence', 'supporting-details', 'multi-stage-evidence'],
  )
  const choices = [
    choice(data.questionIdentifier, 'beginning', story.beginningEvidenceChoice),
    choice(data.questionIdentifier, 'minor', story.minorEvidenceChoice),
    choice(data.questionIdentifier, 'ending', story.endingEvidenceChoice),
    choice(data.questionIdentifier, 'unsupported', story.unsupportedThemeChoice),
  ]
  return {
    ...data,
    answerChoices: choices.map((entry) => entry.text),
    correctAnswers: [choices[0].text, choices[2].text],
    questionContent: { type: 'multi_select', choices, correctChoiceIds: [choices[0].id, choices[2].id], allowMultiple: true },
  }
}

function hotText(story: ThemeDevelopmentStoryRecord, lessonIndex: number, questionIndex: number, target: 'turning' | 'ending'): ReadingQuestion {
  const targetId = target === 'turning' ? story.turningEvidenceId : story.endingEvidenceId
  const data = base(
    story,
    lessonIndex,
    questionIndex,
    'hot_text',
    target === 'turning'
      ? 'Select the sentence that best shows the turning point that makes the theme clearer.'
      : 'Select the ending sentence that most clearly completes the theme\'s development.',
    target === 'turning'
      ? 'The turning point changes the response to the conflict and strengthens the story\'s message.'
      : 'The ending detail shows the important message guiding a later choice.',
    [targetId],
    target === 'turning' ? ['middle-theme-evidence', 'turning-point', 'plot-theme-connection'] : ['ending-theme-evidence', 'theme-development'],
  )
  const sentenceIds = [story.beginningEvidenceId, story.turningEvidenceId, story.endingEvidenceId, story.minorEvidenceId]
  const segments = sentenceIds.map((sentenceId, index) => choice(
    data.questionIdentifier,
    `segment-${index + 1}`,
    story.sentences.find((sentence) => sentence.sentenceId === sentenceId)?.text ?? '',
  ))
  const correctIndex = sentenceIds.indexOf(targetId)
  return {
    ...data,
    answerChoices: segments.map((entry) => entry.text),
    correctAnswers: [segments[correctIndex].text],
    questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [segments[correctIndex].id] },
  }
}

function tableMatch(story: ThemeDevelopmentStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(
    story,
    lessonIndex,
    questionIndex,
    'table_match',
    'Match each plot stage with the detail that develops the theme at that point.',
    'The matches trace how an early choice, a middle consequence, and a later response build one message.',
    [story.beginningEvidenceId, story.middleEvidenceId, story.endingEvidenceId],
    ['beginning-theme-evidence', 'middle-theme-evidence', 'ending-theme-evidence', 'beginning-middle-end-table', 'all-three-stage-evidence'],
  )
  const options = [
    choice(data.questionIdentifier, 'option-beginning', story.beginningEvidenceChoice),
    choice(data.questionIdentifier, 'option-middle', story.middleEvidenceChoice),
    choice(data.questionIdentifier, 'option-end', story.endingEvidenceChoice),
    choice(data.questionIdentifier, 'option-minor', story.minorEvidenceChoice),
  ]
  const rows = [
    { id: `${data.questionIdentifier}-row-beginning`, prompt: 'Beginning', correctChoiceId: options[0].id, options },
    { id: `${data.questionIdentifier}-row-middle`, prompt: 'Middle', correctChoiceId: options[1].id, options },
    { id: `${data.questionIdentifier}-row-end`, prompt: 'End', correctChoiceId: options[2].id, options },
  ]
  return {
    ...data,
    answerChoices: options.map((entry) => entry.text),
    correctAnswers: rows.map((row) => row.correctChoiceId),
    questionContent: { type: 'table_match', selectionMode: 'use_each_once', rows },
  }
}

function twoPart(story: ThemeDevelopmentStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(
    story,
    lessonIndex,
    questionIndex,
    'two_part',
    'Identify the best-supported theme, then choose the evidence that shows how it develops.',
    'The complete theme is supported by connected evidence from the beginning, turning point, and end.',
    [story.beginningEvidenceId, story.turningEvidenceId, story.endingEvidenceId],
    ['best-supported-theme', 'supporting-details', 'theme-development', 'all-three-stage-evidence'],
  )
  const partAChoices = [
    choice(data.questionIdentifier, 'part-a-theme', story.supportedTheme),
    choice(data.questionIdentifier, 'part-a-summary', story.summaryChoice),
    choice(data.questionIdentifier, 'part-a-unsupported', story.unsupportedThemeChoice),
  ]
  const sentence = (id: string) => story.sentences.find((entry) => entry.sentenceId === id)?.text ?? ''
  const partBChoices = [
    choice(data.questionIdentifier, 'part-b-all-stages', `Beginning: ${sentence(story.beginningEvidenceId)} Turning point: ${sentence(story.turningEvidenceId)} End: ${sentence(story.endingEvidenceId)}`),
    choice(data.questionIdentifier, 'part-b-beginning-minor', `Beginning: ${sentence(story.beginningEvidenceId)} Minor detail: ${sentence(story.minorEvidenceId)}`),
    choice(data.questionIdentifier, 'part-b-middle-minor', `Middle: ${sentence(story.middleEvidenceId)} Minor detail: ${sentence(story.minorEvidenceId)}`),
  ]
  return {
    ...data,
    answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text),
    correctAnswers: [partAChoices[0].text, partBChoices[0].text],
    questionContent: {
      type: 'two_part',
      partAPrompt: 'Part A: Which statement best expresses the theme?',
      partAChoices,
      partACorrectChoiceId: partAChoices[0].id,
      partBPrompt: 'Part B: Which beginning, turning-point, and ending details best show how that theme develops?',
      partBChoices,
      partBCorrectChoiceId: partBChoices[0].id,
    },
  }
}

function guidedQuestions(story: ThemeDevelopmentStoryRecord, lessonIndex: number): ReadingQuestion[] {
  return [
    themeQuestion(story, lessonIndex, 1),
    developmentQuestion(story, lessonIndex, 2),
    multiselect(story, lessonIndex, 3),
    hotText(story, lessonIndex, 4, 'turning'),
    tableMatch(story, lessonIndex, 5),
  ]
}

function checkpointQuestions(story: ThemeDevelopmentStoryRecord, lessonIndex: number): ReadingQuestion[] {
  return [
    themeQuestion(story, lessonIndex, 1),
    topicQuestion(story, lessonIndex, 2),
    developmentQuestion(story, lessonIndex, 3),
    multiselect(story, lessonIndex, 4),
    hotText(story, lessonIndex, 5, 'ending'),
    tableMatch(story, lessonIndex, 6),
    twoPart(story, lessonIndex, 7),
  ]
}

export const themeDevelopmentQuestions: ReadingQuestion[] = themeDevelopmentStories.flatMap((story, lessonIndex) => (
  lessonIndex < 4 ? guidedQuestions(story, lessonIndex) : checkpointQuestions(story, lessonIndex)
))

export const themeDevelopmentLessons: ContentPackLesson[] = themeDevelopmentStories.map((story, lessonIndex) => {
  const lessonQuestions = themeDevelopmentQuestions.filter((question) => question.lessonIdentifier === THEME_DEVELOPMENT_LESSON_IDS[lessonIndex])
  const checkpoint = lessonIndex >= 4
  return {
    lessonId: THEME_DEVELOPMENT_LESSON_IDS[lessonIndex],
    worldId: THEME_DEVELOPMENT_WORLD_ID,
    unitId: THEME_DEVELOPMENT_UNIT_ID,
    activityId: `g3-ss-tdt-activity-${lessonIndex + 1}`,
    difficulty: story.difficulty,
    passageIdentifiers: [story.passageId],
    questionIdentifiers: lessonQuestions.map((question) => question.questionIdentifier),
    lessonTitle: THEME_DEVELOPMENT_LESSON_TITLES[lessonIndex],
    lessonObjective: lessonObjectives[lessonIndex],
    lessonRole: checkpoint ? 'CHECKPOINT' : 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    ...(checkpoint ? {} : { teachingBlock: teachingBlocks[lessonIndex] }),
    contentVersion: THEME_DEVELOPMENT_VERSION,
    eligiblePurposes: checkpoint
      ? ['progression', 'verification', 'review']
      : ['remediation', 'review'],
  }
})
