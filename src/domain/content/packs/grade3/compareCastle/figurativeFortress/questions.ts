import type { TeachingBlock } from '../../../../../lesson'
import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson, FigurativeLanguageTarget } from '../../../contentPackTypes'
import { figurativeLanguageGuides, figurativeTextRecords, type FigurativeTextRecord } from './content'
import {
  FIGURATIVE_FORTRESS_BENCHMARK, FIGURATIVE_FORTRESS_LESSON_IDS, FIGURATIVE_FORTRESS_LESSON_TITLES,
  FIGURATIVE_FORTRESS_REPORTING_CATEGORY, FIGURATIVE_FORTRESS_SKILL_ID, FIGURATIVE_FORTRESS_UNIT_ID,
  FIGURATIVE_FORTRESS_VERSION, FIGURATIVE_FORTRESS_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }
const labels = { metaphor: 'Metaphor', personification: 'Personification', hyperbole: 'Hyperbole' } as const

const lessonObjectives = [
  'Decide whether words are literal or figurative and explain clear metaphors.',
  'Use factual context to interpret metaphor and personification safely.',
  'Explain metaphors, personification, and hyperbole in a story.',
  'Use poem context to explain deliberate exaggeration.',
  'Interpret figurative language and context clues in literary prose.',
  'Interpret figurative language and contrast it with ordinary animal behavior in poetry.',
  'Interpret figurative comparisons and exaggeration in factual informational text.',
]

const teachingBlocks: TeachingBlock[] = [
  {
    title: 'Literal or figurative?', explanation: 'Literal words mean exactly what they say. Figurative words communicate another idea. A metaphor directly describes one thing as another without using like or as.',
    examples: ['Literal: The closet held twelve boxes.', 'Metaphor: The closet was a sleeping dragon.', 'Meaning: The closet seemed large and difficult to approach.'],
    contrast: 'A sentence with is or was can still be literal. Check whether two unlike things are directly compared.', learnerCue: 'Read nearby details, then state the realistic meaning.',
  },
  {
    title: 'Three powerful clues', explanation: 'Metaphor compares directly. Personification gives a nonhuman thing a human action or quality. Hyperbole deliberately exaggerates for emphasis, intensity, or humor.',
    examples: ['Metaphor: A lever is a strong arm.', 'Personification: The fulcrum waits.', 'Hyperbole: I waited a thousand years.'],
    contrast: 'Ordinary facts and ordinary animal actions are not automatically figurative.', learnerCue: 'Name the clue, then explain what the words really communicate.',
  },
  {
    title: 'Compare or personify?', explanation: 'A metaphor names a shared quality between two things. Personification assigns a human action or quality to something nonhuman.',
    examples: ['The field was a patchwork quilt compares colored sections.', 'The wind whispered gives the wind a human action.'],
    contrast: 'A simile uses like or as for its comparison; a metaphor makes the comparison directly.', learnerCue: 'Ask what is compared or what human action is assigned.',
  },
  {
    title: 'Stretching the truth on purpose', explanation: 'Hyperbole is an obvious, deliberate exaggeration. Context reveals the smaller realistic meaning the speaker wants to emphasize.',
    examples: ['A thousand nights means a very long time.', 'One cricket filling the sky means the cricket sounds surprisingly loud.'],
    contrast: 'A mistake or a possible large number is not automatically hyperbole.', learnerCue: 'Find what is exaggerated, then replace it with the realistic idea.',
  },
]

function choice(id: string, suffix: string, text: string): Choice { return { id: `${id}-${suffix}`, text } }
function targets(record: FigurativeTextRecord) { return figurativeLanguageGuides.find((guide) => guide.passageId === record.passageId)!.targets }
function targetEvidence(target: FigurativeLanguageTarget) { return [...target.sourceEvidenceIds, ...target.contextEvidenceIds] }

function base(record: FigurativeTextRecord, lessonIndex: number, questionIndex: number, type: ReadingQuestion['questionType'], prompt: string, explanation: string, evidenceIds: string[], tags: string[]) {
  const questionIdentifier = `g3-cg-ff-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier, questionType: type, prompt, gradeBand: 3 as const,
    benchmarkReference: FIGURATIVE_FORTRESS_BENCHMARK, skillIdentifier: FIGURATIVE_FORTRESS_SKILL_ID,
    prerequisiteSkillIdentifiers: [], reportingCategory: FIGURATIVE_FORTRESS_REPORTING_CATEGORY,
    genre: record.format === 'informational' ? 'informational' : record.format === 'poem' ? 'poetry' : 'literary',
    difficulty: record.difficulty, passageIdentifier: record.passageId,
    activityIdentifier: `g3-cg-ff-activity-${lessonIndex + 1}-question-${questionIndex}`,
    lessonIdentifier: FIGURATIVE_FORTRESS_LESSON_IDS[lessonIndex], explanation,
    evidenceReference: evidenceIds[0], evidenceReferenceIds: [...new Set(evidenceIds)],
    targetVocabulary: [], soundOutChunks: [], estimatedReadingLevel: 'Grade 3',
    tags: ['figurative-fortress', ...tags], reviewStatus: 'DRAFT' as const, contentVersion: FIGURATIVE_FORTRESS_VERSION,
  }
}

function mc(record: FigurativeTextRecord, lessonIndex: number, questionIndex: number, prompt: string, correctText: string, distractors: [string, string, string], explanation: string, evidenceIds: string[], tags: string[]): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multiple_choice', prompt, explanation, evidenceIds, tags)
  const texts = [...distractors]
  texts.splice((lessonIndex + questionIndex) % 4, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] } }
}

function deviceQuestion(record: FigurativeTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const target = targets(record)[0]
  return mc(record, lessonIndex, questionIndex, `Which kind of figurative language appears in “${target.expressionText}”?`, labels[target.kind],
    [labels[otherKinds(target.kind)[0]], labels[otherKinds(target.kind)[1]], 'Literal statement'],
    `The expression is ${labels[target.kind].toLowerCase()}: ${target.explanationStatement}`,
    targetEvidence(target), ['figurative-device-identification', kindTag(target.kind), 'literal-vs-nonliteral'])
}

function meaningQuestion(record: FigurativeTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const allTargets = targets(record)
  const target = allTargets[1]
  return mc(record, lessonIndex, questionIndex, `What does “${target.expressionText}” mean in context?`, target.figurativeMeaning,
    [target.literalReading, allTargets[0].figurativeMeaning, 'The words give an exact measurement.'],
    `${target.figurativeMeaning} ${target.explanationStatement}`,
    targetEvidence(target), ['figurative-meaning', 'literal-vs-nonliteral', 'context-evidence', kindTag(target.kind)])
}

function transferQuestion(record: FigurativeTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const transfer = record.transfer!
  return mc(record, lessonIndex, questionIndex, transfer.prompt, transfer.correct, transfer.distractors, transfer.explanation,
    targetEvidence(targets(record)[0]), ['figurative-transfer', 'figurative-device-identification', 'figurative-meaning', 'literal-vs-nonliteral', 'context-evidence'])
}

function multiselect(record: FigurativeTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const allTargets = targets(record)
  const repeatedKind = allTargets.find((target) => allTargets.filter((other) => other.kind === target.kind).length === 2)!.kind
  const correctTargets = allTargets.filter((target) => target.kind === repeatedKind)
  const data = base(record, lessonIndex, questionIndex, 'multi_select', `Choose the two expressions that are ${labels[repeatedKind].toLowerCase()} examples.`,
    `“${correctTargets[0].expressionText}” and “${correctTargets[1].expressionText}” are the two ${labels[repeatedKind].toLowerCase()} examples.`,
    correctTargets.flatMap((target) => targetEvidence(target)), ['figurative-device-identification', 'literal-vs-nonliteral', kindTag(repeatedKind)])
  const choices = allTargets.map((target, index) => choice(data.questionIdentifier, `choice-${index + 1}`, target.expressionText))
  const correctIds = choices.filter((_, index) => allTargets[index].kind === repeatedKind).map((entry) => entry.id)
  const correctTexts = choices.filter((entry) => correctIds.includes(entry.id)).map((entry) => entry.text)
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: correctTexts, questionContent: { type: 'multi_select', choices, correctChoiceIds: correctIds, allowMultiple: true } }
}

function hotText(record: FigurativeTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const allTargets = targets(record)
  const target = allTargets[2]
  const data = base(record, lessonIndex, questionIndex, 'hot_text', `Select the expression that means: ${target.figurativeMeaning}`,
    `“${target.expressionText}” has that realistic meaning in context.`, targetEvidence(target), ['figurative-meaning', 'literal-vs-nonliteral', 'context-evidence', kindTag(target.kind)])
  const order = [...allTargets]
  const selected = order.splice(2, 1)[0]
  order.splice((lessonIndex + 1) % 4, 0, selected)
  const segments = order.map((entry, index) => choice(data.questionIdentifier, `segment-${index + 1}`, entry.expressionText))
  const correct = segments.find((segment) => segment.text === target.expressionText)!
  return { ...data, answerChoices: segments.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [correct.id] } }
}

function classificationTable(record: FigurativeTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const allTargets = targets(record)
  const data = base(record, lessonIndex, questionIndex, 'table_match', 'Match each expression with its clearly best classification.',
    'A metaphor compares directly, personification gives a human action or quality to something nonhuman, and hyperbole deliberately exaggerates.',
    allTargets.flatMap((target) => targetEvidence(target)), ['figurative-device-identification', 'figurative-meaning', 'literal-vs-nonliteral', 'context-evidence', ...new Set(allTargets.map((target) => kindTag(target.kind)))])
  const options = [
    choice(data.questionIdentifier, 'metaphor', 'Metaphor'), choice(data.questionIdentifier, 'personification', 'Personification'),
    choice(data.questionIdentifier, 'hyperbole', 'Hyperbole'), choice(data.questionIdentifier, 'literal', 'Literal statement'),
  ]
  const rows = allTargets.map((target, index) => ({ id: `${data.questionIdentifier}-row-${index + 1}`, prompt: target.expressionText, correctChoiceId: options.find((option) => option.text === labels[target.kind])!.id, options }))
  return { ...data, answerChoices: options.map((entry) => entry.text), correctAnswers: rows.map((row) => row.correctChoiceId), questionContent: { type: 'table_match', selectionMode: 'independent', rows } }
}

function twoPart(record: FigurativeTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const allTargets = targets(record)
  const target = allTargets[3]
  const data = base(record, lessonIndex, questionIndex, 'two_part', 'Identify the figurative-language kind, then interpret its meaning in context.',
    `${labels[target.kind]} is the clearly best classification, and “${target.figurativeMeaning}” is the context-supported realistic meaning.`,
    targetEvidence(target), ['figurative-device-identification', 'figurative-meaning', 'literal-vs-nonliteral', 'context-evidence', kindTag(target.kind)])
  const partAChoices = [target.kind, ...otherKinds(target.kind)].map((kind, index) => choice(data.questionIdentifier, `a-${index + 1}`, labels[kind]))
  const partBChoices = [
    choice(data.questionIdentifier, 'b-correct', target.figurativeMeaning), choice(data.questionIdentifier, 'b-literal', target.literalReading),
    choice(data.questionIdentifier, 'b-other', allTargets[0].figurativeMeaning),
  ]
  return {
    ...data, answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text), correctAnswers: [partAChoices[0].text, partBChoices[0].text],
    questionContent: { type: 'two_part', partAPrompt: `Part A: Which kind appears in “${target.expressionText}”?`, partAChoices, partACorrectChoiceId: partAChoices[0].id, partBPrompt: 'Part B: What does that expression mean in this source?', partBChoices, partBCorrectChoiceId: partBChoices[0].id },
  }
}

function otherKinds(kind: FigurativeLanguageTarget['kind']): [FigurativeLanguageTarget['kind'], FigurativeLanguageTarget['kind']] {
  return (['metaphor', 'personification', 'hyperbole'] as const).filter((entry) => entry !== kind) as [FigurativeLanguageTarget['kind'], FigurativeLanguageTarget['kind']]
}
function kindTag(kind: FigurativeLanguageTarget['kind']) { return kind === 'metaphor' ? 'metaphors' : kind }

function guidedQuestions(record: FigurativeTextRecord, lessonIndex: number): ReadingQuestion[] {
  return [deviceQuestion(record, lessonIndex, 1), meaningQuestion(record, lessonIndex, 2), multiselect(record, lessonIndex, 3), hotText(record, lessonIndex, 4), classificationTable(record, lessonIndex, 5)]
}
function checkpointQuestions(record: FigurativeTextRecord, lessonIndex: number): ReadingQuestion[] {
  return [deviceQuestion(record, lessonIndex, 1), meaningQuestion(record, lessonIndex, 2), transferQuestion(record, lessonIndex, 3), multiselect(record, lessonIndex, 4), hotText(record, lessonIndex, 5), classificationTable(record, lessonIndex, 6), twoPart(record, lessonIndex, 7)]
}

export const figurativeFortressQuestions: ReadingQuestion[] = figurativeTextRecords.flatMap((record, index) => index < 4 ? guidedQuestions(record, index) : checkpointQuestions(record, index))

export const figurativeFortressLessons: ContentPackLesson[] = figurativeTextRecords.map((record, index) => {
  const checkpoint = index >= 4
  return {
    lessonId: FIGURATIVE_FORTRESS_LESSON_IDS[index], worldId: FIGURATIVE_FORTRESS_WORLD_ID, unitId: FIGURATIVE_FORTRESS_UNIT_ID,
    activityId: `g3-cg-ff-activity-${index + 1}`, difficulty: record.difficulty, passageIdentifiers: [record.passageId],
    questionIdentifiers: figurativeFortressQuestions.filter((question) => question.lessonIdentifier === FIGURATIVE_FORTRESS_LESSON_IDS[index]).map((question) => question.questionIdentifier),
    lessonTitle: FIGURATIVE_FORTRESS_LESSON_TITLES[index], lessonObjective: lessonObjectives[index],
    lessonRole: checkpoint ? 'CHECKPOINT' : 'GUIDED_PRACTICE', selectionStatus: 'active',
    ...(checkpoint ? {} : { teachingBlock: teachingBlocks[index] }), contentVersion: FIGURATIVE_FORTRESS_VERSION,
    eligiblePurposes: checkpoint ? ['progression', 'verification', 'review'] : ['remediation', 'review'],
  }
})
