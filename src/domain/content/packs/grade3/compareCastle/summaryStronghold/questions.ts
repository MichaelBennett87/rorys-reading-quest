import type { TeachingBlock } from '../../../../../lesson'
import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson, Grade3SummaryGuide, SummaryImportantDetail, SummaryMinorDetail } from '../../../contentPackTypes'
import { summaryGuides, summaryTextRecords, type SummaryTextRecord } from './content'
import {
  SUMMARY_STRONGHOLD_BENCHMARK, SUMMARY_STRONGHOLD_LESSON_IDS, SUMMARY_STRONGHOLD_LESSON_TITLES,
  SUMMARY_STRONGHOLD_REPORTING_CATEGORY, SUMMARY_STRONGHOLD_SKILL_ID, SUMMARY_STRONGHOLD_UNIT_ID,
  SUMMARY_STRONGHOLD_VERSION, SUMMARY_STRONGHOLD_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }

const objectives = [
  'Keep the problem, important events, resolution, and supported meaning in a literary summary.',
  'State a central idea with relevant details while leaving out minor examples.',
  'Build a concise literary summary from plot events and a supported theme.',
  'Build a concise informational summary from a central idea and important relationships.',
  'Select an accurate literary summary and defend its important parts.',
  'Select an accurate informational summary and defend its relevant details.',
  'Transfer summary judgment across Grade 3 literary and informational reading.',
]

const teachingBlocks: TeachingBlock[] = [
  { title: 'Keep the story-changing parts', explanation: 'A literary summary keeps the main problem or goal, events that change what happens, the resolution, and a supported theme when it helps preserve meaning.', examples: ['Keep: The route card is missing.', 'Keep: Ava uses a photograph and asks for help.', 'Leave out: Ava wears a green star badge.'], contrast: 'An interesting description may be true without changing the plot.', learnerCue: 'Ask whether removing the detail would change the important story.' },
  { title: 'Central idea plus support', explanation: 'An informational summary combines the central idea with the most useful supporting details and relationships.', examples: ['Topic: composting', 'Central idea: Decomposers, air, and moisture gradually change scraps.', 'Summary: Add the useful result, not bucket colors.'], contrast: 'A topic or central-idea sentence alone is not a complete informational summary when support is requested.', learnerCue: 'Keep details that explain how or why the central idea is true.' },
  { title: 'Compress without changing meaning', explanation: 'A summary is much shorter than its source, but it still preserves the conflict, essential sequence, resolution, and supported theme.', examples: ['Name the problem.', 'Combine related middle events.', 'End with the resolution and supported meaning.'], contrast: 'A retell can include more events; a summary deliberately selects and compresses.', learnerCue: 'Remove a detail only when the important meaning remains clear.' },
  { title: 'Follow the relationship', explanation: 'An informational summary keeps relationships that matter, such as comparison, chronology, or cause and effect.', examples: ['Wind, animals, and water move seeds differently.', 'Each method spreads seeds away from a parent plant.'], contrast: 'A narrow example should not replace the central relationship.', learnerCue: 'State the central idea, then select details that work together to support it.' },
]

function choice(id: string, suffix: string, text: string): Choice { return { id: `${id}-${suffix}`, text } }
function guide(record: SummaryTextRecord): Grade3SummaryGuide { return summaryGuides.find((entry) => entry.passageId === record.passageId)! }
function important(record: SummaryTextRecord): SummaryImportantDetail[] { const g = guide(record); return g.textKind === 'literary' ? g.importantPlotEvents : g.importantDetails }
function minor(record: SummaryTextRecord): SummaryMinorDetail[] { return guide(record).minorDetails }
function evidence(details: readonly (SummaryImportantDetail | SummaryMinorDetail)[]) { return [...new Set(details.flatMap((detail) => detail.evidenceIds))] }

function base(record: SummaryTextRecord, lessonIndex: number, questionIndex: number, type: ReadingQuestion['questionType'], prompt: string, explanation: string, evidenceIds: string[], tags: string[]) {
  const questionIdentifier = `g3-cg-ss-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier, questionType: type, prompt, gradeBand: 3 as const, benchmarkReference: SUMMARY_STRONGHOLD_BENCHMARK,
    skillIdentifier: SUMMARY_STRONGHOLD_SKILL_ID, prerequisiteSkillIdentifiers: [], reportingCategory: SUMMARY_STRONGHOLD_REPORTING_CATEGORY,
    genre: record.kind === 'literary' ? 'literary' : 'informational', difficulty: record.difficulty,
    passageIdentifier: record.passageId, activityIdentifier: `g3-cg-ss-activity-${lessonIndex + 1}-question-${questionIndex}`,
    lessonIdentifier: SUMMARY_STRONGHOLD_LESSON_IDS[lessonIndex], explanation, evidenceReference: evidenceIds[0],
    evidenceReferenceIds: [...new Set(evidenceIds)], targetVocabulary: [], soundOutChunks: [], estimatedReadingLevel: 'Grade 3',
    tags: ['summary-stronghold', record.kind === 'literary' ? 'literary-summary' : 'informational-summary', ...tags],
    reviewStatus: 'DRAFT' as const, contentVersion: SUMMARY_STRONGHOLD_VERSION,
  }
}

function mc(record: SummaryTextRecord, lessonIndex: number, questionIndex: number, prompt: string, correctText: string, distractors: [string, string, string], explanation: string, evidenceIds: string[], tags: string[]): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multiple_choice', prompt, explanation, evidenceIds, tags)
  const texts = [...distractors]
  texts.splice((lessonIndex + questionIndex) % 4, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] } }
}

function bestSummary(record: SummaryTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return mc(record, lessonIndex, questionIndex, 'Which choice is the best concise and accurate summary?', record.modelSummary, record.distractors,
    "The best summary preserves the source's essential meaning, important relationships, and resolution or central idea without minor details or outside information.",
    evidence(important(record)), ['summary-selection', 'important-vs-minor', record.kind === 'literary' ? 'plot' : 'central-idea'])
}

function essentialDetail(record: SummaryTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const key = important(record)[0]
  const minors = minor(record)
  return mc(record, lessonIndex, questionIndex, 'Which detail is important enough to include in a summary?', key.statement,
    [minors[0].statement, minors[1].statement, 'The reader should add a new event that is not in the source.'],
    `${key.statement} ${key.importanceReason}`, key.evidenceIds, ['relevant-details', 'important-vs-minor', record.kind === 'literary' ? 'plot' : 'central-idea'])
}

function themeOrCentralIdea(record: SummaryTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const g = guide(record)
  if (g.textKind === 'literary') {
    return mc(record, lessonIndex, questionIndex, "Which supported theme can help preserve the story's important meaning in a complete summary?", g.supportedThemeStatement,
      [`The topic is ${g.mainCharacterNames[0]}'s task.`, 'Everyone should always avoid changing a plan.', minor(record)[0].statement],
      "The theme is a complete source-supported idea developed through the character's important choices and outcome.", g.themeEvidenceIds, ['theme', 'plot', 'important-vs-minor'])
  }
  return mc(record, lessonIndex, questionIndex, 'Which statement gives the central idea that a complete informational summary must support?', g.centralIdeaStatement,
    [g.topicLabel, minor(record)[0].statement, 'The author proves that every example always works in exactly the same way.'],
    'The central idea is a complete thought that fits all sections; a full summary then adds relevant support.', evidence(important(record)), ['central-idea', 'relevant-details', 'important-vs-minor'])
}

function multiselect(record: SummaryTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const keys = important(record).slice(0, 2)
  const misses = minor(record).slice(0, 2)
  const data = base(record, lessonIndex, questionIndex, 'multi_select', 'Choose the two details that belong in a concise summary.',
    "Both selected details are necessary to understand the source's main plot or central idea; the other choices are minor.", evidence(keys), ['relevant-details', 'important-vs-minor', record.kind === 'literary' ? 'plot' : 'central-idea'])
  const plans = [keys[0], misses[0], keys[1], misses[1]]
  const choices = plans.map((detail, index) => choice(data.questionIdentifier, `choice-${index + 1}`, detail.statement))
  const correctChoiceIds = choices.filter((_, index) => index === 0 || index === 2).map((entry) => entry.id)
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: choices.filter((entry) => correctChoiceIds.includes(entry.id)).map((entry) => entry.text), questionContent: { type: 'multi_select', choices, correctChoiceIds, allowMultiple: true } }
}

function hotText(record: SummaryTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const key = minor(record)[0]
  const candidates = [important(record)[0], important(record)[1], key]
  const data = base(record, lessonIndex, questionIndex, 'hot_text', 'Select the source detail that can be omitted because it is minor.',
    `${key.statement} ${key.omissionReason}`, key.evidenceIds, ['important-vs-minor', 'summary-selection'])
  const segments = candidates.map((detail, index) => choice(data.questionIdentifier, `segment-${index + 1}`, detail.statement))
  return { ...data, answerChoices: segments.map((entry) => entry.text), correctAnswers: [key.statement], questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [segments[2].id] } }
}

function table(record: SummaryTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const keys = important(record).slice(0, 2)
  const misses = minor(record).slice(0, 2)
  const details = [keys[0], misses[0], keys[1], misses[1]]
  const data = base(record, lessonIndex, questionIndex, 'table_match', 'Match each source detail with its role in a concise summary.',
    'Important details preserve the main plot or central idea. Minor details can be omitted without changing essential meaning.', evidence(details), ['important-vs-minor', 'relevant-details', record.kind === 'literary' ? 'plot' : 'central-idea'])
  const options = [choice(data.questionIdentifier, 'important', 'Important: include'), choice(data.questionIdentifier, 'minor', 'Minor: omit')]
  const rows = details.map((detail, index) => ({ id: `${data.questionIdentifier}-row-${index + 1}`, prompt: detail.statement, correctChoiceId: options[index % 2 === 0 ? 0 : 1].id, options }))
  return { ...data, answerChoices: options.map((entry) => entry.text), correctAnswers: rows.map((row) => row.correctChoiceId), questionContent: { type: 'table_match', selectionMode: 'independent', rows } }
}

function twoPart(record: SummaryTextRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const keyDetail = important(record)[1]
  const data = base(record, lessonIndex, questionIndex, 'two_part', 'Choose the best summary, then choose the evidence that helps show why it is strongest.',
    "The model summary preserves the source's essential meaning, and the selected evidence is an important detail that directly supports it.", evidence(important(record)), ['summary-selection', 'relevant-details', 'important-vs-minor', record.kind === 'literary' ? 'plot' : 'central-idea'])
  const partAChoices = [record.modelSummary, ...record.distractors].map((text, index) => choice(data.questionIdentifier, `a-${index + 1}`, text))
  const partBChoices = [keyDetail.statement, minor(record)[0].statement, 'A prediction that is not stated in the source.'].map((text, index) => choice(data.questionIdentifier, `b-${index + 1}`, text))
  return { ...data, answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text), correctAnswers: [partAChoices[0].text, partBChoices[0].text], questionContent: { type: 'two_part', partAPrompt: 'Part A: Which is the best summary?', partAChoices, partACorrectChoiceId: partAChoices[0].id, partBPrompt: 'Part B: Which important source detail supports that choice?', partBChoices, partBCorrectChoiceId: partBChoices[0].id } }
}

function guided(record: SummaryTextRecord, index: number): ReadingQuestion[] { return [bestSummary(record, index, 1), essentialDetail(record, index, 2), multiselect(record, index, 3), hotText(record, index, 4), table(record, index, 5)] }
function checkpoint(record: SummaryTextRecord, index: number): ReadingQuestion[] { return [bestSummary(record, index, 1), essentialDetail(record, index, 2), themeOrCentralIdea(record, index, 3), multiselect(record, index, 4), hotText(record, index, 5), table(record, index, 6), twoPart(record, index, 7)] }

export const summaryStrongholdQuestions: ReadingQuestion[] = summaryTextRecords.flatMap((record, index) => index < 4 ? guided(record, index) : checkpoint(record, index))

export const summaryStrongholdLessons: ContentPackLesson[] = summaryTextRecords.map((record, index) => {
  const checkpointLesson = index >= 4
  return {
    lessonId: SUMMARY_STRONGHOLD_LESSON_IDS[index], worldId: SUMMARY_STRONGHOLD_WORLD_ID, unitId: SUMMARY_STRONGHOLD_UNIT_ID,
    activityId: `g3-cg-ss-activity-${index + 1}`, difficulty: record.difficulty, passageIdentifiers: [record.passageId],
    questionIdentifiers: summaryStrongholdQuestions.filter((question) => question.lessonIdentifier === SUMMARY_STRONGHOLD_LESSON_IDS[index]).map((question) => question.questionIdentifier),
    lessonTitle: SUMMARY_STRONGHOLD_LESSON_TITLES[index], lessonObjective: objectives[index], lessonRole: checkpointLesson ? 'CHECKPOINT' : 'GUIDED_PRACTICE',
    selectionStatus: 'active', ...(checkpointLesson ? {} : { teachingBlock: teachingBlocks[index] }), contentVersion: SUMMARY_STRONGHOLD_VERSION,
    eligiblePurposes: checkpointLesson ? ['progression', 'verification', 'review'] : ['remediation', 'review'],
  }
})
