import type { TeachingBlock } from '../../../../../lesson'
import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson, Grade3InformationalStructure } from '../../../contentPackTypes'
import { sentenceId, structureStationRecords, type StructureStationRecord } from './passages'
import {
  STRUCTURE_STATION_BENCHMARK, STRUCTURE_STATION_LESSON_IDS, STRUCTURE_STATION_LESSON_TITLES,
  STRUCTURE_STATION_REPORTING_CATEGORY, STRUCTURE_STATION_SKILL_ID, STRUCTURE_STATION_UNIT_ID,
  STRUCTURE_STATION_VERSION, STRUCTURE_STATION_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }
const STRUCTURE_LABELS: Record<Grade3InformationalStructure, string> = {
  chronology: 'Chronology', comparison: 'Comparison', 'cause-effect': 'Cause and effect',
}
const lessonObjectives = [
  'Use ordered events and a timeline to recognize chronology.',
  'Use similarities, differences, and labeled features to recognize comparison.',
  'Connect real causes with their results and use text features for clarification.',
  'Follow a process and explain how features make its order clear.',
  'Compare two designs and explain how text features support the comparison.',
  'Trace causes and effects and explain how a diagram and caption add meaning.',
  'Identify chronological organization and transfer among all three structures.',
]
const teachingBlocks: TeachingBlock[] = [
  {
    title: 'Follow the important order',
    explanation: 'Chronology organizes important information by time or steps. A single time word is only a clue; the main ideas must truly follow an order.',
    examples: ['Find what happens first.', 'Trace what happens next and later.', 'Ask whether changing the order would damage understanding.'],
    contrast: 'Events happening one after another do not automatically mean one caused the other.', learnerCue: 'Follow the whole sequence, not one signal word.',
  },
  {
    title: 'Look for relationships',
    explanation: 'Comparison organizes information around meaningful similarities and differences between subjects.',
    examples: ['Name both subjects.', 'Find what they share.', 'Find how they differ.'],
    contrast: 'Two nouns in one section do not prove comparison.', learnerCue: 'Explain the relationship between both subjects.',
  },
  {
    title: 'Connect a cause to its result',
    explanation: 'Cause and effect explains why something happens and what result follows.',
    examples: ['Name what happens.', 'Ask why it happens.', 'Find the result that follows from that cause.'],
    contrast: 'An earlier event is not always the cause of a later event.', learnerCue: 'Prove the causal link, not just the order.',
  },
  {
    title: 'Let features guide you',
    explanation: 'Headings, timelines, captions, diagrams, and glossaries help readers locate, connect, and clarify information.',
    examples: ['Use headings to preview sections.', 'Use a timeline to scan order.', 'Use a glossary to clarify a key word.'],
    contrast: 'A feature contributes meaning only when it helps readers understand the text.', learnerCue: 'Name what the feature makes easier to understand.',
  },
]

function choice(id: string, suffix: string, text: string): Choice { return { id: `${id}-${suffix}`, text } }
function otherStructures(structure: Grade3InformationalStructure): Grade3InformationalStructure[] {
  return (Object.keys(STRUCTURE_LABELS) as Grade3InformationalStructure[]).filter((value) => value !== structure)
}
function base(record: StructureStationRecord, lessonIndex: number, questionIndex: number, type: ReadingQuestion['questionType'], prompt: string, explanation: string, evidenceIds: string[], tags: string[]) {
  const questionIdentifier = `g3-id-ss-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier, questionType: type, prompt, gradeBand: 3 as const,
    benchmarkReference: STRUCTURE_STATION_BENCHMARK, skillIdentifier: STRUCTURE_STATION_SKILL_ID,
    prerequisiteSkillIdentifiers: [], reportingCategory: STRUCTURE_STATION_REPORTING_CATEGORY,
    genre: 'informational', difficulty: record.difficulty, passageIdentifier: record.passageId,
    activityIdentifier: `g3-id-ss-activity-${lessonIndex + 1}-question-${questionIndex}`,
    lessonIdentifier: STRUCTURE_STATION_LESSON_IDS[lessonIndex], explanation,
    evidenceReference: evidenceIds[0], evidenceReferenceIds: evidenceIds,
    targetVocabulary: [], soundOutChunks: [], estimatedReadingLevel: 'Grade 3',
    tags: [record.structure, 'informational-structure', ...tags], reviewStatus: 'DRAFT' as const,
    contentVersion: STRUCTURE_STATION_VERSION,
  }
}
function mc(record: StructureStationRecord, lessonIndex: number, questionIndex: number, prompt: string, correctText: string, distractors: [string, string, string], explanation: string, evidenceIds: string[], tags: string[]): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multiple_choice', prompt, explanation, evidenceIds, tags)
  const texts = [...distractors]
  texts.splice((lessonIndex + questionIndex) % 4, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] } }
}
function structureQuestion(record: StructureStationRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const others = otherStructures(record.structure).map((value) => STRUCTURE_LABELS[value])
  return mc(record, lessonIndex, questionIndex, `Which structure organizes the important ideas in "${record.title}"?`, record.structureLabel,
    [others[0], others[1], 'A collection of unrelated facts'], `${record.structureReason} Therefore, ${record.structureLabel.toLowerCase()} is the best-supported structure.`,
    record.evidenceSentenceNumbers.map((number) => sentenceId(record.passageId, number)), ['structure-identification', `${record.structure}-structure`])
}
function featureQuestion(record: StructureStationRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const plan = record.featurePlans[0]
  return mc(record, lessonIndex, questionIndex, `How does the ${featureLabel(plan.kind)} contribute to the meaning of "${record.title}"?`, plan.contribution,
    [`It decorates the page but adds no information.`, `It tells the reader who wrote the text.`, `It replaces every important detail in the passage.`],
    `${plan.contribution} This explains the feature's contribution instead of merely naming it.`, [`${record.passageId}-feature-${plan.key}`],
    ['text-features-contribute-to-meaning', 'feature-contribution'])
}
function multiselect(record: StructureStationRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multi_select', `Choose the two details that best prove the passage uses ${record.structureLabel.toLowerCase()}.`,
    `The selected details work together across the passage. ${record.structureReason}`,
    record.evidenceSentenceNumbers.map((number) => sentenceId(record.passageId, number)), ['structure-evidence', `${record.structure}-structure`])
  const correctTexts = record.evidenceSentenceNumbers.map((number) => record.sentences[number - 1])
  const distractorNumbers = record.sentences.map((_, index) => index + 1).filter((number) => !record.evidenceSentenceNumbers.includes(number as never)).slice(-2)
  const choices = [
    choice(data.questionIdentifier, 'correct-1', correctTexts[0]),
    choice(data.questionIdentifier, 'wrong-1', record.sentences[distractorNumbers[0] - 1]),
    choice(data.questionIdentifier, 'correct-2', correctTexts[1]),
    choice(data.questionIdentifier, 'wrong-2', record.sentences[distractorNumbers[1] - 1]),
  ]
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [choices[0].text, choices[2].text], questionContent: { type: 'multi_select', choices, correctChoiceIds: [choices[0].id, choices[2].id], allowMultiple: true } }
}
function hotText(record: StructureStationRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'hot_text', record.hotPrompt,
    `This sentence is the unique detail that matches the requested relationship: "${record.sentences[record.hotCorrectSentence - 1]}"`,
    [sentenceId(record.passageId, record.hotCorrectSentence)], ['structure-evidence', `${record.structure}-structure`])
  const numbers = [record.hotCorrectSentence, ...record.hotDistractorSentences]
  const correctNumber = numbers.shift()!
  numbers.splice((lessonIndex + 1) % 4, 0, correctNumber)
  const segments = numbers.map((number, index) => choice(data.questionIdentifier, `segment-${index + 1}`, record.sentences[number - 1]))
  const correct = segments.find((segment) => segment.text === record.sentences[record.hotCorrectSentence - 1])!
  return { ...data, answerChoices: segments.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [correct.id] } }
}
function tableMatch(record: StructureStationRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const plan = record.featurePlans[0]
  const data = base(record, lessonIndex, questionIndex, 'table_match', 'Match each text element with what it helps the reader understand.',
    `The passage structure is ${record.structureLabel.toLowerCase()}, and the feature has a separate, specific contribution to meaning.`,
    [sentenceId(record.passageId, record.evidenceSentenceNumbers[0]), `${record.passageId}-feature-${plan.key}`], ['structure-feature-table', 'text-features-contribute-to-meaning'])
  const options = [
    choice(data.questionIdentifier, 'structure', record.organizationHelp),
    choice(data.questionIdentifier, 'feature', plan.contribution),
    choice(data.questionIdentifier, 'unused', 'It gives the author\'s opinion about which fact is best.'),
  ]
  const rows = [
    { id: `${data.questionIdentifier}-row-structure`, prompt: `${record.structureLabel} organization`, correctChoiceId: options[0].id, options },
    { id: `${data.questionIdentifier}-row-feature`, prompt: featureLabel(plan.kind), correctChoiceId: options[1].id, options },
  ]
  return { ...data, answerChoices: options.map((entry) => entry.text), correctAnswers: rows.map((row) => row.correctChoiceId), questionContent: { type: 'table_match', selectionMode: 'use_each_once', rows } }
}
function transferQuestion(record: StructureStationRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const transfer = record.transfer!
  const others = otherStructures(transfer.correctStructure).map((value) => STRUCTURE_LABELS[value])
  return mc(record, lessonIndex, questionIndex, transfer.prompt, STRUCTURE_LABELS[transfer.correctStructure],
    [others[0], others[1], 'A list with no organization'], transfer.explanation,
    record.evidenceSentenceNumbers.map((number) => sentenceId(record.passageId, number)), ['structure-transfer', `${transfer.correctStructure}-structure`])
}
function twoPart(record: StructureStationRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'two_part', 'Identify the text structure, then choose the evidence that proves it.',
    `${record.structureReason} The evidence pair directly supports ${record.structureLabel.toLowerCase()}.`,
    record.evidenceSentenceNumbers.map((number) => sentenceId(record.passageId, number)), ['two-part-evidence', 'structure-evidence', `${record.structure}-structure`])
  const partAChoices = [choice(data.questionIdentifier, 'a-correct', record.structureLabel), ...otherStructures(record.structure).map((value, index) => choice(data.questionIdentifier, `a-wrong-${index + 1}`, STRUCTURE_LABELS[value]))]
  const evidenceText = record.evidenceSentenceNumbers.map((number) => record.sentences[number - 1]).join(' / ')
  const partBChoices = [
    choice(data.questionIdentifier, 'b-correct', evidenceText),
    choice(data.questionIdentifier, 'b-wrong-1', record.distractorReasons[0]),
    choice(data.questionIdentifier, 'b-wrong-2', record.distractorReasons[1]),
  ]
  return {
    ...data, answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text), correctAnswers: [partAChoices[0].text, partBChoices[0].text],
    questionContent: { type: 'two_part', partAPrompt: 'Part A: Which structure is best supported?', partAChoices, partACorrectChoiceId: partAChoices[0].id, partBPrompt: 'Part B: Which pair of details best proves Part A?', partBChoices, partBCorrectChoiceId: partBChoices[0].id },
  }
}
function guidedQuestions(record: StructureStationRecord, lessonIndex: number): ReadingQuestion[] {
  return [structureQuestion(record, lessonIndex, 1), featureQuestion(record, lessonIndex, 2), multiselect(record, lessonIndex, 3), hotText(record, lessonIndex, 4), tableMatch(record, lessonIndex, 5)]
}
function checkpointQuestions(record: StructureStationRecord, lessonIndex: number): ReadingQuestion[] {
  return [structureQuestion(record, lessonIndex, 1), featureQuestion(record, lessonIndex, 2), transferQuestion(record, lessonIndex, 3), multiselect(record, lessonIndex, 4), hotText(record, lessonIndex, 5), tableMatch(record, lessonIndex, 6), twoPart(record, lessonIndex, 7)]
}
function featureLabel(kind: string): string {
  if (kind === 'illustration') return 'labeled diagram'
  if (kind === 'sidebar') return 'fact box'
  return kind
}

export const structureStationQuestions: ReadingQuestion[] = structureStationRecords.flatMap((record, index) => index < 4 ? guidedQuestions(record, index) : checkpointQuestions(record, index))

export const structureStationLessons: ContentPackLesson[] = structureStationRecords.map((record, index) => {
  const checkpoint = index >= 4
  return {
    lessonId: STRUCTURE_STATION_LESSON_IDS[index], worldId: STRUCTURE_STATION_WORLD_ID, unitId: STRUCTURE_STATION_UNIT_ID,
    activityId: `g3-id-ss-activity-${index + 1}`, difficulty: record.difficulty,
    passageIdentifiers: [record.passageId],
    questionIdentifiers: structureStationQuestions.filter((question) => question.lessonIdentifier === STRUCTURE_STATION_LESSON_IDS[index]).map((question) => question.questionIdentifier),
    lessonTitle: STRUCTURE_STATION_LESSON_TITLES[index], lessonObjective: lessonObjectives[index],
    lessonRole: checkpoint ? 'CHECKPOINT' : 'GUIDED_PRACTICE', selectionStatus: 'active',
    ...(checkpoint ? {} : { teachingBlock: teachingBlocks[index] }), contentVersion: STRUCTURE_STATION_VERSION,
    eligiblePurposes: checkpoint ? ['progression', 'verification', 'review'] : ['remediation', 'review'],
  }
})
