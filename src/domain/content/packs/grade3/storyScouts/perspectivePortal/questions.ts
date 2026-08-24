import type { TeachingBlock } from '../../../../../lesson'
import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson } from '../../../contentPackTypes'
import { perspectivePortalCoveragePatterns, perspectivePortalStories, type PerspectiveStoryRecord } from './perspectiveGuides'
import {
  PERSPECTIVE_PORTAL_BENCHMARK,
  PERSPECTIVE_PORTAL_LESSON_IDS,
  PERSPECTIVE_PORTAL_LESSON_TITLES,
  PERSPECTIVE_PORTAL_REPORTING_CATEGORY,
  PERSPECTIVE_PORTAL_SKILL_ID,
  PERSPECTIVE_PORTAL_UNIT_ID,
  PERSPECTIVE_PORTAL_VERSION,
  PERSPECTIVE_PORTAL_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }

const COMMON_TAGS = [...perspectivePortalCoveragePatterns]
const NARRATOR_DISTRACTOR = 'The story is told by a third-person narrator.'
const lessonObjectives = [
  'Explain how two characters view the same plan differently.',
  'Use words and actions to compare partly similar perspectives.',
  'Trace how new evidence changes a character\'s perspective.',
  'Compare shared goals and different ideas about one space.',
  'Compare two reasonable views about preparing a weather test.',
  'Explain how two similar perspectives use different evidence.',
  'Explain and support a character\'s changing view of a shared place.',
]

const teachingBlocks: TeachingBlock[] = [
  {
    title: 'Perspective is how a character sees a situation',
    explanation: 'Use what a character notices, thinks, says, and does to explain the character\'s view of one event or choice.',
    examples: ['Name the shared situation.', 'Find two details from the character.', 'Explain what the character believes should happen.'],
    contrast: 'A feeling or trait can be a clue, but it is not a complete perspective explanation.',
    learnerCue: 'Tell what the character thinks about the situation and why.',
  },
  {
    title: 'Two views can share a goal',
    explanation: 'Characters may want the same result but prefer different ways to reach it. Their perspectives can be partly similar.',
    examples: ['Find the shared goal.', 'Find each character\'s plan.', 'Compare what is alike and different.'],
    contrast: 'Do not assume that every difference makes one character unreasonable or wrong.',
    learnerCue: 'Use evidence from both characters before comparing their views.',
  },
  {
    title: 'New evidence can change a view',
    explanation: 'An event may give a character new information. Compare the earlier viewpoint with later words, thoughts, or choices.',
    examples: ['Find the earlier view.', 'Locate the event that matters.', 'Find the later view.'],
    contrast: 'A changed feeling alone is not enough. Explain what the character now believes about the situation.',
    learnerCue: 'Connect the new evidence to the changed perspective.',
  },
  {
    title: 'Perspective is not narrator point of view',
    explanation: 'Character perspective explains how a character understands an event. Narrator point of view identifies who tells the story.',
    examples: ['Character view: Suri believes readers need quiet space.', 'Narrator view: A third-person narrator tells the story.'],
    contrast: 'A narrator statement does not answer what a character thinks about the shared situation.',
    learnerCue: 'Choose the viewpoint supported by that character\'s words, actions, or thoughts.',
  },
]

function choice(questionId: string, suffix: string, text: string): Choice {
  return { id: `${questionId}-${suffix}`, text }
}

function sentence(story: PerspectiveStoryRecord, id: string): string {
  return story.sentences.find((entry) => entry.sentenceId === id)?.text ?? ''
}

function base(
  story: PerspectiveStoryRecord,
  lessonIndex: number,
  questionIndex: number,
  questionType: ReadingQuestion['questionType'],
  prompt: string,
  explanation: string,
  evidenceReferenceIds: string[],
  tags: string[],
) {
  const questionIdentifier = `g3-ss-pp3-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier, questionType, prompt,
    gradeBand: 3 as const,
    benchmarkReference: PERSPECTIVE_PORTAL_BENCHMARK,
    skillIdentifier: PERSPECTIVE_PORTAL_SKILL_ID,
    prerequisiteSkillIdentifiers: [],
    reportingCategory: PERSPECTIVE_PORTAL_REPORTING_CATEGORY,
    genre: 'literary', difficulty: story.difficulty,
    passageIdentifier: story.passageId,
    activityIdentifier: `g3-ss-pp3-activity-${lessonIndex + 1}-question-${questionIndex}`,
    lessonIdentifier: PERSPECTIVE_PORTAL_LESSON_IDS[lessonIndex],
    explanation,
    evidenceReference: evidenceReferenceIds[0] ?? story.minorEvidenceId,
    evidenceReferenceIds,
    targetVocabulary: [], soundOutChunks: [], estimatedReadingLevel: 'Grade 3',
    tags: [...COMMON_TAGS, ...tags],
    reviewStatus: 'DRAFT' as const,
    contentVersion: PERSPECTIVE_PORTAL_VERSION,
  }
}

function multipleChoice(
  story: PerspectiveStoryRecord,
  lessonIndex: number,
  questionIndex: number,
  prompt: string,
  correctText: string,
  distractors: [string, string, string],
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

function characterQuestion(story: PerspectiveStoryRecord, lessonIndex: number, questionIndex: number, target: 'a' | 'b'): ReadingQuestion {
  const character = target === 'a' ? story.characterA : story.characterB
  const other = target === 'a' ? story.characterB : story.characterA
  return multipleChoice(
    story, lessonIndex, questionIndex,
    `Which statement best explains ${character.name}'s perspective about ${story.situationLabel}?`,
    character.perspective,
    [character.feelingOnly, character.traitOnly, target === 'a' ? other.perspective : NARRATOR_DISTRACTOR],
    `${character.name}'s words and actions show what ${character.name} believes should happen and why; a feeling, trait, or narrator statement is incomplete.`,
    character.evidenceIds,
    [target === 'a' ? 'character-a-perspective' : 'character-b-perspective', target === 'a' ? 'perspective-evidence-a' : 'perspective-evidence-b', 'perspective-boundary'],
  )
}

function comparisonQuestion(story: PerspectiveStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return multipleChoice(
    story, lessonIndex, questionIndex,
    `How do ${story.characterA.name} and ${story.characterB.name} view ${story.situationLabel}?`,
    story.comparisonStatement,
    story.comparisonDistractors,
    'The correct comparison names the shared situation and accurately connects evidence from both characters.',
    [story.characterA.evidenceIds[0], story.characterB.evidenceIds[0]],
    ['perspective-comparison', 'similarity-or-difference', 'evidence-from-both'],
  )
}

function changeQuestion(story: PerspectiveStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const change = story.change!
  return multipleChoice(
    story, lessonIndex, questionIndex,
    'Which statement best explains how one character\'s perspective changes?',
    change.summary,
    change.distractors,
    `The earlier and later evidence shows a changed belief caused by new information: ${change.cause}`,
    change.evidenceIds,
    ['perspective-change', 'perspective-evidence-a', 'perspective-boundary'],
  )
}

function multiselect(story: PerspectiveStoryRecord, lessonIndex: number, questionIndex: number, checkpoint: boolean): ReadingQuestion {
  const data = base(
    story, lessonIndex, questionIndex, 'multi_select',
    checkpoint
      ? `Choose two details, one from ${story.characterA.name} and one from ${story.characterB.name}, that reveal their perspectives.`
      : `Choose two details that reveal ${story.characterA.name}'s perspective.`,
    checkpoint
      ? 'The selected details show what each character says, notices, thinks, or does about the same situation.'
      : `Both selected details show how ${story.characterA.name} understands and responds to the shared situation.`,
    checkpoint
      ? [story.characterA.evidenceIds[0], story.characterB.evidenceIds[0]]
      : story.characterA.evidenceIds.slice(0, 2),
    checkpoint
      ? ['perspective-evidence-a', 'perspective-evidence-b', 'evidence-from-both']
      : ['perspective-evidence-a'],
  )
  const correctIds = checkpoint
    ? [story.characterA.evidenceIds[0], story.characterB.evidenceIds[0]]
    : story.characterA.evidenceIds.slice(0, 2)
  const choices = [
    choice(data.questionIdentifier, 'evidence-1', sentence(story, correctIds[0])),
    choice(data.questionIdentifier, 'minor', sentence(story, story.minorEvidenceId)),
    choice(data.questionIdentifier, 'evidence-2', sentence(story, correctIds[1])),
    choice(data.questionIdentifier, 'other', checkpoint ? story.characterA.feelingOnly : sentence(story, story.characterB.evidenceIds[0])),
  ]
  return {
    ...data,
    answerChoices: choices.map((entry) => entry.text),
    correctAnswers: [choices[0].text, choices[2].text],
    questionContent: { type: 'multi_select', choices, correctChoiceIds: [choices[0].id, choices[2].id], allowMultiple: true },
  }
}

function hotText(story: PerspectiveStoryRecord, lessonIndex: number, questionIndex: number, useChange: boolean): ReadingQuestion {
  const targetId = useChange && story.change ? story.change.evidenceIds.at(-1)! : story.characterB.evidenceIds[0]
  const data = base(
    story, lessonIndex, questionIndex, 'hot_text',
    useChange && story.change
      ? 'Select the sentence that most clearly shows the character\'s later, changed perspective.'
      : `Select the sentence that most clearly reveals ${story.characterB.name}'s perspective.`,
    useChange && story.change
      ? 'The selected later action or statement shows what the character now believes after receiving new evidence.'
      : `${story.characterB.name}'s words directly explain how ${story.characterB.name} views the shared situation.`,
    [targetId],
    useChange && story.change ? ['perspective-change', 'perspective-evidence-a'] : ['character-b-perspective', 'perspective-evidence-b'],
  )
  const sourceIds = [targetId, story.characterA.evidenceIds[0], story.minorEvidenceId, story.characterA.evidenceIds[1]]
  const segments = sourceIds.map((id, index) => choice(data.questionIdentifier, `segment-${index + 1}`, sentence(story, id)))
  return {
    ...data,
    answerChoices: segments.map((entry) => entry.text),
    correctAnswers: [segments[0].text],
    questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [segments[0].id] },
  }
}

function tableMatch(story: PerspectiveStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(
    story, lessonIndex, questionIndex, 'table_match',
    'Match each character with the perspective that the story supports.',
    'Each perspective matches that character\'s own words, actions, thoughts, or noticing about the shared situation.',
    [story.characterA.evidenceIds[0], story.characterB.evidenceIds[0]],
    ['character-perspective-table', 'character-a-perspective', 'character-b-perspective', 'evidence-from-both'],
  )
  const options = [
    choice(data.questionIdentifier, 'option-a', story.characterA.perspective),
    choice(data.questionIdentifier, 'option-b', story.characterB.perspective),
    choice(data.questionIdentifier, 'option-feeling', story.characterA.feelingOnly),
    choice(data.questionIdentifier, 'option-narrator', NARRATOR_DISTRACTOR),
  ]
  const rows = [
    { id: `${data.questionIdentifier}-row-a`, prompt: story.characterA.name, correctChoiceId: options[0].id, options },
    { id: `${data.questionIdentifier}-row-b`, prompt: story.characterB.name, correctChoiceId: options[1].id, options },
  ]
  return {
    ...data,
    answerChoices: options.map((entry) => entry.text),
    correctAnswers: rows.map((row) => row.correctChoiceId),
    questionContent: { type: 'table_match', selectionMode: 'use_each_once', rows },
  }
}

function twoPart(story: PerspectiveStoryRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(
    story, lessonIndex, questionIndex, 'two_part',
    'Compare the characters\' perspectives, then choose the evidence pair that supports the comparison.',
    'The comparison is supported only by the pair containing one relevant detail from each character.',
    [story.characterA.evidenceIds[0], story.characterB.evidenceIds[0]],
    ['perspective-comparison', 'similarity-or-difference', 'perspective-evidence-a', 'perspective-evidence-b', 'evidence-from-both'],
  )
  const partAChoices = [
    choice(data.questionIdentifier, 'part-a-correct', story.comparisonStatement),
    choice(data.questionIdentifier, 'part-a-wrong-1', story.comparisonDistractors[0]),
    choice(data.questionIdentifier, 'part-a-wrong-2', NARRATOR_DISTRACTOR),
  ]
  const correctPair = `${story.characterA.name}: ${sentence(story, story.characterA.evidenceIds[0])} ${story.characterB.name}: ${sentence(story, story.characterB.evidenceIds[0])}`
  const partBChoices = [
    choice(data.questionIdentifier, 'part-b-correct', correctPair),
    choice(data.questionIdentifier, 'part-b-a-minor', `${story.characterA.name}: ${sentence(story, story.characterA.evidenceIds[0])} Other detail: ${sentence(story, story.minorEvidenceId)}`),
    choice(data.questionIdentifier, 'part-b-b-minor', `${story.characterB.name}: ${sentence(story, story.characterB.evidenceIds[0])} Other detail: ${sentence(story, story.minorEvidenceId)}`),
  ]
  return {
    ...data,
    answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text),
    correctAnswers: [partAChoices[0].text, partBChoices[0].text],
    questionContent: {
      type: 'two_part',
      partAPrompt: 'Part A: How are the two characters\' perspectives related?',
      partAChoices, partACorrectChoiceId: partAChoices[0].id,
      partBPrompt: 'Part B: Which pair of details best supports that comparison?',
      partBChoices, partBCorrectChoiceId: partBChoices[0].id,
    },
  }
}

function guidedQuestions(story: PerspectiveStoryRecord, lessonIndex: number): ReadingQuestion[] {
  return [
    characterQuestion(story, lessonIndex, 1, 'a'),
    story.change ? changeQuestion(story, lessonIndex, 2) : comparisonQuestion(story, lessonIndex, 2),
    multiselect(story, lessonIndex, 3, false),
    hotText(story, lessonIndex, 4, false),
    tableMatch(story, lessonIndex, 5),
  ]
}

function checkpointQuestions(story: PerspectiveStoryRecord, lessonIndex: number): ReadingQuestion[] {
  return [
    characterQuestion(story, lessonIndex, 1, 'a'),
    characterQuestion(story, lessonIndex, 2, 'b'),
    story.change ? changeQuestion(story, lessonIndex, 3) : comparisonQuestion(story, lessonIndex, 3),
    multiselect(story, lessonIndex, 4, true),
    hotText(story, lessonIndex, 5, Boolean(story.change)),
    tableMatch(story, lessonIndex, 6),
    twoPart(story, lessonIndex, 7),
  ]
}

export const perspectivePortalQuestions: ReadingQuestion[] = perspectivePortalStories.flatMap((story, lessonIndex) => (
  lessonIndex < 4 ? guidedQuestions(story, lessonIndex) : checkpointQuestions(story, lessonIndex)
))

export const perspectivePortalLessons: ContentPackLesson[] = perspectivePortalStories.map((story, lessonIndex) => {
  const lessonQuestions = perspectivePortalQuestions.filter((question) => question.lessonIdentifier === PERSPECTIVE_PORTAL_LESSON_IDS[lessonIndex])
  const checkpoint = lessonIndex >= 4
  return {
    lessonId: PERSPECTIVE_PORTAL_LESSON_IDS[lessonIndex],
    worldId: PERSPECTIVE_PORTAL_WORLD_ID,
    unitId: PERSPECTIVE_PORTAL_UNIT_ID,
    activityId: `g3-ss-pp3-activity-${lessonIndex + 1}`,
    difficulty: story.difficulty,
    passageIdentifiers: [story.passageId],
    questionIdentifiers: lessonQuestions.map((question) => question.questionIdentifier),
    lessonTitle: PERSPECTIVE_PORTAL_LESSON_TITLES[lessonIndex],
    lessonObjective: lessonObjectives[lessonIndex],
    lessonRole: checkpoint ? 'CHECKPOINT' : 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    ...(checkpoint ? {} : { teachingBlock: teachingBlocks[lessonIndex] }),
    contentVersion: PERSPECTIVE_PORTAL_VERSION,
    eligiblePurposes: checkpoint ? ['progression', 'verification', 'review'] : ['remediation', 'review'],
  }
})
