import type { TeachingBlock } from '../../../../../lesson'
import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson, Grade3PoemForm } from '../../../contentPackTypes'
import { lineId, poemFormRecords, type PoemFormRecord } from './poems'
import {
  POEM_FORM_BENCHMARK, POEM_FORM_LESSON_IDS, POEM_FORM_LESSON_TITLES,
  POEM_FORM_REPORTING_CATEGORY, POEM_FORM_SKILL_ID, POEM_FORM_UNIT_ID,
  POEM_FORM_VERSION, POEM_FORM_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }
const FORM_LABELS: Record<Grade3PoemForm, string> = {
  'free-verse': 'Free verse', 'rhymed-verse': 'Rhymed verse', haiku: 'Haiku', limerick: 'Limerick',
}
const lessonObjectives = [
  'Use line breaks and rhyme clues to identify free verse.',
  'Use intentional end rhyme to identify rhymed verse.',
  'Identify a classroom haiku using several form clues.',
  'Identify a limerick using line count, tone, and AABBA rhyme.',
  'Classify free verse and transfer poem-form clues.',
  'Classify rhymed verse and compare rhyme organizations.',
  'Classify a limerick and distinguish all four target forms.',
]
const teachingBlocks: TeachingBlock[] = [
  {
    title: 'Use more than one clue',
    explanation: 'Free verse uses intentional line breaks without a required fixed rhyme or meter pattern.',
    examples: ['Notice where lines stop.', 'Compare line lengths.', 'Check whether a fixed rhyme pattern is required.'],
    contrast: 'Free verse may sometimes rhyme, so "never rhymes" is not a safe rule.', learnerCue: 'Use lineation and pattern clues together.',
  },
  {
    title: 'Listen for intentional rhyme',
    explanation: 'Rhymed verse organizes matching end sounds on purpose. The rhyme may appear in different patterns.',
    examples: ['AABB uses neighboring pairs.', 'ABAB uses alternating pairs.', 'Other rhyme organizations are possible.'],
    contrast: 'Not every rhymed poem is a limerick.', learnerCue: 'Find the rhyme relationships before naming the form.',
  },
  {
    title: 'A classroom haiku example',
    explanation: 'A haiku is a short poetic form that often captures a moment or observation. This example has three lines and uses a common English classroom 5-7-5 pattern.',
    examples: ['Count this example carefully: 5, then 7, then 5.', 'Notice the quiet natural observation.', 'Use several clues, not line count alone.'],
    contrast: 'The classroom 5-7-5 pattern is not a universal law for every haiku.', learnerCue: 'Combine short form, observation, and the qualified classroom pattern.',
  },
  {
    title: 'Five playful lines',
    explanation: 'A limerick commonly has five playful lines with an AABBA rhyme relationship and a recognizable rhythm.',
    examples: ['Lines 1, 2, and 5 rhyme.', 'Lines 3 and 4 rhyme.', 'The event often feels playful.'],
    contrast: 'Five lines alone do not prove a limerick.', learnerCue: 'Check line count, rhyme organization, and playful effect together.',
  },
]

function choice(id: string, suffix: string, text: string): Choice { return { id: `${id}-${suffix}`, text } }
function line(record: PoemFormRecord, number: number): string { return record.lines[number - 1] }
function otherForms(form: Grade3PoemForm): Grade3PoemForm[] { return (Object.keys(FORM_LABELS) as Grade3PoemForm[]).filter((value) => value !== form) }

function base(record: PoemFormRecord, lessonIndex: number, questionIndex: number, type: ReadingQuestion['questionType'], prompt: string, explanation: string, evidence: number[], tags: string[]) {
  const questionIdentifier = `g3-pp-pfo-q${lessonIndex + 1}-${questionIndex}`
  const evidenceReferenceIds = evidence.map((number) => lineId(record.passageId, number))
  return {
    questionIdentifier, questionType: type, prompt, gradeBand: 3 as const,
    benchmarkReference: POEM_FORM_BENCHMARK, skillIdentifier: POEM_FORM_SKILL_ID,
    prerequisiteSkillIdentifiers: [], reportingCategory: POEM_FORM_REPORTING_CATEGORY,
    genre: 'poetry', difficulty: record.difficulty, passageIdentifier: record.passageId,
    activityIdentifier: `g3-pp-pfo-activity-${lessonIndex + 1}-question-${questionIndex}`,
    lessonIdentifier: POEM_FORM_LESSON_IDS[lessonIndex], explanation,
    evidenceReference: evidenceReferenceIds[0], evidenceReferenceIds,
    targetVocabulary: [], soundOutChunks: [], estimatedReadingLevel: 'Grade 3',
    tags: [record.form, 'poem-form-identification', 'structural-evidence', ...tags],
    reviewStatus: 'DRAFT' as const, contentVersion: POEM_FORM_VERSION,
  }
}

function multipleChoice(record: PoemFormRecord, lessonIndex: number, questionIndex: number, prompt: string, correctText: string, distractors: [string, string, string], explanation: string, evidence: number[], tags: string[]): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multiple_choice', prompt, explanation, evidence, tags)
  const texts = [...distractors]
  texts.splice((lessonIndex + questionIndex) % 4, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] } }
}

function classification(record: PoemFormRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return multipleChoice(record, lessonIndex, questionIndex, `Which type of poem is "${record.title}"?`, record.formLabel,
    otherForms(record.form).map((form) => FORM_LABELS[form]) as [string, string, string],
    `${record.bestFeature} These combined structural clues best support ${record.formLabel.toLowerCase()}.`,
    record.evidenceLineNumbers, ['form-classification'])
}

function feature(record: PoemFormRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return multipleChoice(record, lessonIndex, questionIndex, `Which feature best supports classifying "${record.title}" as ${record.formLabel.toLowerCase()}?`,
    record.bestFeature, record.featureDistractors,
    `The best evidence combines defining structure rather than relying on one superficial clue. ${record.bestFeature}`,
    record.evidenceLineNumbers, ['defining-feature'])
}

function transfer(record: PoemFormRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const target = record.transfer!
  return multipleChoice(record, lessonIndex, questionIndex, target.prompt, FORM_LABELS[target.correctForm],
    otherForms(target.correctForm).map((form) => FORM_LABELS[form]) as [string, string, string], target.explanation,
    record.evidenceLineNumbers.slice(0, 2), ['poem-form-transfer', target.correctForm])
}

function multiselect(record: PoemFormRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multi_select', 'Choose the two features that work together to identify this poem form.',
    `Both selected clues are supported by the displayed structure: ${record.bestFeature} ${record.secondFeature}`,
    record.evidenceLineNumbers, ['defining-feature'])
  const choices = [
    choice(data.questionIdentifier, 'correct-1', record.bestFeature),
    choice(data.questionIdentifier, 'wrong-1', record.featureDistractors[0]),
    choice(data.questionIdentifier, 'correct-2', record.secondFeature),
    choice(data.questionIdentifier, 'wrong-2', record.featureDistractors[1]),
  ]
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [choices[0].text, choices[2].text], questionContent: { type: 'multi_select', choices, correctChoiceIds: [choices[0].id, choices[2].id], allowMultiple: true } }
}

function hotText(record: PoemFormRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'hot_text', record.hotPrompt,
    `The selected line is the unique displayed line that matches the requested structural clue: "${line(record, record.hotCorrectLine)}"`,
    [record.hotCorrectLine], ['line-evidence'])
  const lineNumbers = [record.hotCorrectLine, ...record.hotDistractorLines]
  const uniqueLineNumbers = [...new Set(lineNumbers)]
  const ordered = [...uniqueLineNumbers]
  const correctNumber = ordered.shift()!
  ordered.splice((lessonIndex + 1) % 4, 0, correctNumber)
  const segments = ordered.map((number, index) => choice(data.questionIdentifier, `segment-${index + 1}`, line(record, number)))
  const correct = segments.find((segment) => segment.text === line(record, record.hotCorrectLine))!
  return { ...data, answerChoices: segments.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [correct.id] } }
}

function tableMatch(record: PoemFormRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'table_match', 'Match the poem with its form and strongest structural clue.',
    'The form label and structural clue must both match the displayed poem.', record.evidenceLineNumbers, ['poem-form-table'])
  const options = [
    choice(data.questionIdentifier, 'form', record.formLabel), choice(data.questionIdentifier, 'feature', record.bestFeature),
    choice(data.questionIdentifier, 'other-form', FORM_LABELS[otherForms(record.form)[0]]),
  ]
  const rows = [
    { id: `${data.questionIdentifier}-row-form`, prompt: 'Poem form', correctChoiceId: options[0].id, options },
    { id: `${data.questionIdentifier}-row-feature`, prompt: 'Strongest structural clue', correctChoiceId: options[1].id, options },
  ]
  return { ...data, answerChoices: options.map((entry) => entry.text), correctAnswers: rows.map((row) => row.correctChoiceId), questionContent: { type: 'table_match', selectionMode: 'use_each_once', rows } }
}

function twoPart(record: PoemFormRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'two_part', 'Identify the poem form, then choose the structural evidence that proves it.',
    `The form and evidence agree: ${record.formLabel}. ${record.bestFeature}`, record.evidenceLineNumbers, ['two-part-evidence'])
  const partAChoices = [choice(data.questionIdentifier, 'a-correct', record.formLabel), ...otherForms(record.form).slice(0, 2).map((form, index) => choice(data.questionIdentifier, `a-wrong-${index + 1}`, FORM_LABELS[form]))]
  const partBChoices = [choice(data.questionIdentifier, 'b-correct', record.bestFeature), choice(data.questionIdentifier, 'b-wrong-1', record.featureDistractors[0]), choice(data.questionIdentifier, 'b-wrong-2', record.featureDistractors[1])]
  return {
    ...data, answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text), correctAnswers: [partAChoices[0].text, partBChoices[0].text],
    questionContent: { type: 'two_part', partAPrompt: 'Part A: Which poem form is best supported?', partAChoices, partACorrectChoiceId: partAChoices[0].id, partBPrompt: 'Part B: Which structural clue best supports Part A?', partBChoices, partBCorrectChoiceId: partBChoices[0].id },
  }
}

function guidedQuestions(record: PoemFormRecord, lessonIndex: number): ReadingQuestion[] {
  return [classification(record, lessonIndex, 1), feature(record, lessonIndex, 2), multiselect(record, lessonIndex, 3), hotText(record, lessonIndex, 4), tableMatch(record, lessonIndex, 5)]
}
function checkpointQuestions(record: PoemFormRecord, lessonIndex: number): ReadingQuestion[] {
  return [classification(record, lessonIndex, 1), feature(record, lessonIndex, 2), transfer(record, lessonIndex, 3), multiselect(record, lessonIndex, 4), hotText(record, lessonIndex, 5), tableMatch(record, lessonIndex, 6), twoPart(record, lessonIndex, 7)]
}

export const poemFormQuestions: ReadingQuestion[] = poemFormRecords.flatMap((record, index) => index < 4 ? guidedQuestions(record, index) : checkpointQuestions(record, index))

export const poemFormLessons: ContentPackLesson[] = poemFormRecords.map((record, index) => {
  const checkpoint = index >= 4
  return {
    lessonId: POEM_FORM_LESSON_IDS[index], worldId: POEM_FORM_WORLD_ID, unitId: POEM_FORM_UNIT_ID,
    activityId: `g3-pp-pfo-activity-${index + 1}`, difficulty: record.difficulty,
    passageIdentifiers: [record.passageId],
    questionIdentifiers: poemFormQuestions.filter((question) => question.lessonIdentifier === POEM_FORM_LESSON_IDS[index]).map((question) => question.questionIdentifier),
    lessonTitle: POEM_FORM_LESSON_TITLES[index], lessonObjective: lessonObjectives[index],
    lessonRole: checkpoint ? 'CHECKPOINT' : 'GUIDED_PRACTICE', selectionStatus: 'active',
    ...(checkpoint ? {} : { teachingBlock: teachingBlocks[index] }), contentVersion: POEM_FORM_VERSION,
    eligiblePurposes: checkpoint ? ['progression', 'verification', 'review'] : ['remediation', 'review'],
  }
})
