import type { TeachingBlock } from '../../../../../lesson'
import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson } from '../../../contentPackTypes'
import { purposeDevelopmentRecords, purposeSentenceId, type PurposeDevelopmentRecord } from './passages'
import {
  PURPOSE_DEVELOPMENT_BENCHMARK, PURPOSE_DEVELOPMENT_LESSON_IDS, PURPOSE_DEVELOPMENT_LESSON_TITLES,
  PURPOSE_DEVELOPMENT_REPORTING_CATEGORY, PURPOSE_DEVELOPMENT_SKILL_ID, PURPOSE_DEVELOPMENT_UNIT_ID,
  PURPOSE_DEVELOPMENT_VERSION, PURPOSE_DEVELOPMENT_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }

const lessonObjectives = [
  'Distinguish an author\'s precise purpose from a topic and central idea.',
  'Identify details that strongly reveal why an author wrote a text.',
  'Explain how directions and sections develop a teaching purpose.',
  'Explain how parallel sections and comparisons develop purpose.',
  'Use cause-and-effect details across sections to explain author purpose.',
  'Use chronological section evidence to explain a purpose about change.',
  'Explain how system details across sections develop an author\'s purpose.',
]

const teachingBlocks: TeachingBlock[] = [
  {
    title: 'Topic, central idea, or purpose?',
    explanation: 'The topic names what the text is about. The central idea tells the most important idea. The author\'s purpose explains why the author wrote this specific text.',
    examples: ['Topic: recycled paper', 'Central idea: Paper fibers can be reused.', 'Purpose: To explain the steps that turn used paper into a new sheet.'],
    contrast: 'A precise purpose is more useful than the broad answer “to inform.”', learnerCue: 'Ask what the author wants readers to understand or learn how to do.',
  },
  {
    title: 'Find strong purpose clues',
    explanation: 'Strong clues reveal the author\'s repeated focus. A true detail can be interesting without showing why the whole text was written.',
    examples: ['Check more than one section.', 'Notice repeated kinds of details.', 'Set aside facts that do not match the whole-text purpose.'],
    contrast: 'One colorful fact should not outweigh the design of the full text.', learnerCue: 'Choose details that serve the same author goal.',
  },
  {
    title: 'Follow a teaching purpose',
    explanation: 'When an author teaches a process, sections often move from preparation to action to using the result. Directions and explanations work together.',
    examples: ['Identify what readers are learning to do.', 'Find fair or ordered steps.', 'Explain how the final section helps readers use the result.'],
    contrast: 'The topic names the process; the purpose states why the author explains it.', learnerCue: 'Trace how each section helps teach the process.',
  },
  {
    title: 'Notice a comparison purpose',
    explanation: 'An author may explain one subject, explain another in a parallel way, and then connect their similarities and differences.',
    examples: ['Find evidence for Subject A.', 'Find evidence for Subject B.', 'Notice the section that brings them together.'],
    contrast: 'Two subjects alone do not prove comparison; the text must organize details around their relationship.', learnerCue: 'Explain how both sides help accomplish the author\'s purpose.',
  },
]

function choice(id: string, suffix: string, text: string): Choice { return { id: `${id}-${suffix}`, text } }

function base(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number, type: ReadingQuestion['questionType'], prompt: string, explanation: string, evidenceIds: string[], tags: string[]) {
  const questionIdentifier = `g3-id-pd-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier, questionType: type, prompt, gradeBand: 3 as const,
    benchmarkReference: PURPOSE_DEVELOPMENT_BENCHMARK, skillIdentifier: PURPOSE_DEVELOPMENT_SKILL_ID,
    prerequisiteSkillIdentifiers: [], reportingCategory: PURPOSE_DEVELOPMENT_REPORTING_CATEGORY,
    genre: 'informational', difficulty: record.difficulty, passageIdentifier: record.passageId,
    activityIdentifier: `g3-id-pd-activity-${lessonIndex + 1}-question-${questionIndex}`,
    lessonIdentifier: PURPOSE_DEVELOPMENT_LESSON_IDS[lessonIndex], explanation,
    evidenceReference: evidenceIds[0], evidenceReferenceIds: evidenceIds,
    targetVocabulary: [], soundOutChunks: [], estimatedReadingLevel: 'Grade 3',
    tags: ['purpose-development-path', ...tags], reviewStatus: 'DRAFT' as const,
    contentVersion: PURPOSE_DEVELOPMENT_VERSION,
  }
}

function mc(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number, prompt: string, correctText: string, distractors: [string, string, string], explanation: string, evidenceIds: string[], tags: string[]): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multiple_choice', prompt, explanation, evidenceIds, tags)
  const texts = [...distractors]
  texts.splice((lessonIndex + questionIndex) % 4, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] } }
}

function purposeQuestion(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const evidence = [record.supportingDetails[0], record.supportingDetails.at(-1)!].map((detail) => purposeSentenceId(record.passageId, detail.sentence))
  return mc(record, lessonIndex, questionIndex, `What is the author's precise purpose in "${record.title}"?`, record.purpose,
    [record.topic, record.centralIdea, 'To inform readers about this topic.'],
    `${record.purpose} The selected details and section design serve this precise goal, while the other choices are a topic, central idea, or overly broad label.`,
    evidence, ['author-purpose', 'topic-purpose-distinction', 'central-idea-purpose-distinction'])
}

function topicQuestion(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return mc(record, lessonIndex, questionIndex, 'Which choice names only the topic rather than the author’s purpose?', record.topic,
    [record.purpose, record.centralIdea, record.narrowPurpose],
    `${record.topic} names what the text is about but does not explain why the author wrote it.`,
    [purposeSentenceId(record.passageId, 1)], ['topic-purpose-distinction', 'central-idea-purpose-distinction'])
}

function sectionContributionQuestion(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const middleDetails = record.supportingDetails.filter((detail) => detail.sentence > record.sectionEnds[0] && detail.sentence <= record.sectionEnds[1])
  return mc(record, lessonIndex, questionIndex, `How does the section "${record.headings[1]}" help develop the author's purpose?`, record.sectionContributions[1],
    ['It only repeats the title without adding useful information.', 'It presents an opinion that readers must agree with.', 'It adds one decorative fact unrelated to the author’s goal.'],
    `${record.sectionContributions[1]} This section contribution directly serves the author’s whole-text purpose.`,
    middleDetails.map((detail) => purposeSentenceId(record.passageId, detail.sentence)), ['purpose-development', 'section-contribution', 'supporting-details'])
}

function multiselect(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const first = record.supportingDetails[0]
  const last = record.supportingDetails.at(-1)!
  const data = base(record, lessonIndex, questionIndex, 'multi_select', 'Choose the two details from different sections that most strongly support the author’s purpose.',
    `Both details serve the same precise purpose across sections: ${record.purpose}`,
    [first, last].map((detail) => purposeSentenceId(record.passageId, detail.sentence)), ['supporting-details', 'purpose-development', 'text-evidence'])
  const choices = [
    choice(data.questionIdentifier, 'correct-1', record.sentences[first.sentence - 1]),
    choice(data.questionIdentifier, 'weak-1', record.sentences[record.weakDetails[0].sentence - 1]),
    choice(data.questionIdentifier, 'correct-2', record.sentences[last.sentence - 1]),
    choice(data.questionIdentifier, 'weak-2', record.sentences[record.weakDetails[1].sentence - 1]),
  ]
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [choices[0].text, choices[2].text], questionContent: { type: 'multi_select', choices, correctChoiceIds: [choices[0].id, choices[2].id], allowMultiple: true } }
}

function hotText(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'hot_text', record.hotPrompt,
    `This sentence is the unique strongest selection because it directly serves the author’s purpose: “${record.sentences[record.hotCorrectSentence - 1]}”`,
    [purposeSentenceId(record.passageId, record.hotCorrectSentence)], ['author-purpose', 'supporting-details', 'text-evidence'])
  const numbers = [record.hotCorrectSentence, ...record.hotDistractorSentences]
  const correctNumber = numbers.shift()!
  numbers.splice((lessonIndex + 1) % 4, 0, correctNumber)
  const segments = numbers.map((number, index) => choice(data.questionIdentifier, `segment-${index + 1}`, record.sentences[number - 1]))
  const correct = segments.find((segment) => segment.text === record.sentences[record.hotCorrectSentence - 1])!
  return { ...data, answerChoices: segments.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [correct.id] } }
}

function classificationTable(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const weakText = record.sentences[record.weakDetails[0].sentence - 1]
  const data = base(record, lessonIndex, questionIndex, 'table_match', 'Match each kind of statement with the example from this text.',
    'The topic names the subject, the central idea states the important understanding, and author purpose explains why the text was written.',
    [purposeSentenceId(record.passageId, record.supportingDetails[0].sentence), purposeSentenceId(record.passageId, record.weakDetails[0].sentence)],
    ['author-purpose', 'topic-purpose-distinction', 'central-idea-purpose-distinction', 'text-evidence'])
  const options = [
    choice(data.questionIdentifier, 'purpose', record.purpose),
    choice(data.questionIdentifier, 'topic', record.topic),
    choice(data.questionIdentifier, 'central', record.centralIdea),
    choice(data.questionIdentifier, 'detail', weakText),
  ]
  const rows = [
    { id: `${data.questionIdentifier}-row-purpose`, prompt: 'Author purpose', correctChoiceId: options[0].id, options },
    { id: `${data.questionIdentifier}-row-topic`, prompt: 'Topic', correctChoiceId: options[1].id, options },
    { id: `${data.questionIdentifier}-row-central`, prompt: 'Central idea', correctChoiceId: options[2].id, options },
  ]
  return { ...data, answerChoices: options.map((entry) => entry.text), correctAnswers: rows.map((row) => row.correctChoiceId), questionContent: { type: 'table_match', selectionMode: 'use_each_once', rows } }
}

function transferQuestion(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const transfer = record.transfer!
  return mc(record, lessonIndex, questionIndex, `Read this new example: ${transfer.text} What is the author's most precise purpose?`, transfer.purpose,
    [transfer.topic, transfer.centralIdea, transfer.unsupported], transfer.explanation,
    [purposeSentenceId(record.passageId, record.supportingDetails[0].sentence)], ['author-purpose', 'purpose-transfer'])
}

function twoPart(record: PurposeDevelopmentRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const first = record.supportingDetails[0]
  const last = record.supportingDetails.at(-1)!
  const correctEvidence = `${record.sentences[first.sentence - 1]} / ${record.sentences[last.sentence - 1]}`
  const weakEvidence = `${record.sentences[record.weakDetails[0].sentence - 1]} / ${record.sentences[record.weakDetails[1].sentence - 1]}`
  const partialEvidence = `${record.sentences[first.sentence - 1]} / ${record.sentences[record.weakDetails[1].sentence - 1]}`
  const data = base(record, lessonIndex, questionIndex, 'two_part', 'Identify the author’s purpose, then choose evidence from separate sections that best supports it.',
    `${record.purpose} The correct evidence pair shows how details from separate sections accomplish that purpose.`,
    [first, last].map((detail) => purposeSentenceId(record.passageId, detail.sentence)), ['author-purpose', 'purpose-development', 'supporting-details', 'text-evidence'])
  const partAChoices = [
    choice(data.questionIdentifier, 'a-correct', record.purpose),
    choice(data.questionIdentifier, 'a-topic', record.topic),
    choice(data.questionIdentifier, 'a-central', record.centralIdea),
  ]
  const partBChoices = [
    choice(data.questionIdentifier, 'b-correct', correctEvidence),
    choice(data.questionIdentifier, 'b-weak', weakEvidence),
    choice(data.questionIdentifier, 'b-partial', partialEvidence),
  ]
  return {
    ...data, answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text), correctAnswers: [partAChoices[0].text, partBChoices[0].text],
    questionContent: { type: 'two_part', partAPrompt: 'Part A: What is the author’s precise purpose?', partAChoices, partACorrectChoiceId: partAChoices[0].id, partBPrompt: 'Part B: Which pair of details from separate sections best supports Part A?', partBChoices, partBCorrectChoiceId: partBChoices[0].id },
  }
}

function guidedQuestions(record: PurposeDevelopmentRecord, lessonIndex: number): ReadingQuestion[] {
  return [purposeQuestion(record, lessonIndex, 1), topicQuestion(record, lessonIndex, 2), multiselect(record, lessonIndex, 3), hotText(record, lessonIndex, 4), classificationTable(record, lessonIndex, 5)]
}

function checkpointQuestions(record: PurposeDevelopmentRecord, lessonIndex: number): ReadingQuestion[] {
  return [purposeQuestion(record, lessonIndex, 1), sectionContributionQuestion(record, lessonIndex, 2), transferQuestion(record, lessonIndex, 3), multiselect(record, lessonIndex, 4), hotText(record, lessonIndex, 5), classificationTable(record, lessonIndex, 6), twoPart(record, lessonIndex, 7)]
}

export const purposeDevelopmentQuestions: ReadingQuestion[] = purposeDevelopmentRecords.flatMap((record, index) => index < 4 ? guidedQuestions(record, index) : checkpointQuestions(record, index))

export const purposeDevelopmentLessons: ContentPackLesson[] = purposeDevelopmentRecords.map((record, index) => {
  const checkpoint = index >= 4
  return {
    lessonId: PURPOSE_DEVELOPMENT_LESSON_IDS[index], worldId: PURPOSE_DEVELOPMENT_WORLD_ID, unitId: PURPOSE_DEVELOPMENT_UNIT_ID,
    activityId: `g3-id-pd-activity-${index + 1}`, difficulty: record.difficulty, passageIdentifiers: [record.passageId],
    questionIdentifiers: purposeDevelopmentQuestions.filter((question) => question.lessonIdentifier === PURPOSE_DEVELOPMENT_LESSON_IDS[index]).map((question) => question.questionIdentifier),
    lessonTitle: PURPOSE_DEVELOPMENT_LESSON_TITLES[index], lessonObjective: lessonObjectives[index],
    lessonRole: checkpoint ? 'CHECKPOINT' : 'GUIDED_PRACTICE', selectionStatus: 'active',
    ...(checkpoint ? {} : { teachingBlock: teachingBlocks[index] }), contentVersion: PURPOSE_DEVELOPMENT_VERSION,
    eligiblePurposes: checkpoint ? ['progression', 'verification', 'review'] : ['remediation', 'review'],
  }
})
