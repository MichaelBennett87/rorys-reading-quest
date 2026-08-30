import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson, Grade3AuthorComparisonGuide } from '../../../contentPackTypes'
import type { TeachingBlock } from '../../../../../lesson/lessonTypes'
import { createScopedEvidenceReference } from '../../../../evidence'
import { authorLensComparisonGuides, authorLensPairRecords, authorLensSentenceId } from './content'
import {
  AUTHOR_LENS_BENCHMARK,
  AUTHOR_LENS_LESSON_IDS,
  AUTHOR_LENS_LESSON_TITLES,
  AUTHOR_LENS_REPORTING_CATEGORY,
  AUTHOR_LENS_SKILL_ID,
  AUTHOR_LENS_UNIT_ID,
  AUTHOR_LENS_VERSION,
  AUTHOR_LENS_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }
type Record = (typeof authorLensPairRecords)[number]

const objectives = [
  'Distinguish a fact difference from a meaningful difference in how two authors present a topic.',
  'Compare how two stories use actions, dialogue, and events to present the same theme.',
  'Compare author focus, organization, examples, and evidence across two informational texts.',
  'Explain how two literary authors develop one theme through different presentation choices.',
  'Compare chronological observation with feature-based explanation using evidence from both texts.',
  'Compare how two stories present cooperation through planning and action.',
  'Compare cause-focused and solution-focused explanations of erosion using evidence from both texts.',
]

const teachingBlocks: TeachingBlock[] = [
  { title: 'Compare presentation, not facts alone', explanation: 'Two texts can share a topic but organize, emphasize, or explain it differently.', examples: ['Fact: Text A mentions mulch.', 'Presentation: Text A gives building steps.', 'Presentation: Text B explains effects.'], contrast: 'A fact from each text does not automatically explain how the authors present the topic.', learnerCue: 'Name the author choice, then support it with a clue from each text.' },
  { title: 'Follow the theme through author choices', explanation: 'Two stories may share a theme while using different dialogue, actions, problems, or resolutions.', examples: ['Both characters need help.', 'One author emphasizes spoken advice.', 'The other emphasizes visual clues and actions.'], contrast: 'The same theme does not mean the stories have the same characters or events.', learnerCue: 'Ask how each story makes the shared idea visible.' },
  { title: 'Notice focus and organization', explanation: 'An author may compare types, describe features, follow time order, or trace causes and effects.', examples: ['Text A compares bridge structures.', 'Text B follows a model test in sequence.'], contrast: 'Different examples are useful only when they reveal a larger presentation choice.', learnerCue: 'Decide what each author explains most fully and how the details are arranged.' },
  { title: 'Use evidence from both stories', explanation: 'A two-author comparison needs a Text A clue, a Text B clue, and a statement connecting them.', examples: ['Text A uses group dialogue.', 'Text B shows repeated action tests.', 'Both present flexibility after a plan fails.'], contrast: 'Evidence from only one story cannot prove a comparison.', learnerCue: 'Check that both sides of your comparison have source evidence.' },
]

function choice(id: string, suffix: string, text: string): Choice { return { id: `${id}-${suffix}`, text } }
function guide(record: Record): Grade3AuthorComparisonGuide { return authorLensComparisonGuides.find((entry) => entry.pairedTextSetId === record.pairId)! }
function sentence(record: Record, side: 'A' | 'B', number: number) { return (side === 'A' ? record.textA : record.textB).sentences[number - 1] }
function evidence(record: Record, side: 'A' | 'B', number: number) {
  const text = side === 'A' ? record.textA : record.textB
  return createScopedEvidenceReference(text.passageId, authorLensSentenceId(text.passageId, number))
}
function unique(values: readonly string[]) { return [...new Set(values)] }
function differenceText(record: Record) { const point = guide(record).differences[0]; return `${point.textAStatement} ${point.textBStatement}` }
function swappedDifferenceText(record: Record) { const point = guide(record).differences[0]; return `Text A ${point.textBStatement.replace(/^Text B\s*/i, '').replace(/^Text A\s*/i, '')} Text B ${point.textAStatement.replace(/^Text A\s*/i, '').replace(/^Text B\s*/i, '')}` }
function pointEvidence(record: Record, kind: 'similarity' | 'difference') {
  const point = kind === 'similarity' ? guide(record).similarities[0] : guide(record).differences[0]
  return unique([...point.textAEvidenceIds, ...point.textBEvidenceIds])
}

function base(record: Record, lessonIndex: number, questionIndex: number, questionType: ReadingQuestion['questionType'], prompt: string, explanation: string, evidenceReferenceIds: string[], tags: string[]) {
  const questionIdentifier = `g3-cg-al-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier, questionType, prompt, gradeBand: 3 as const, benchmarkReference: AUTHOR_LENS_BENCHMARK,
    skillIdentifier: AUTHOR_LENS_SKILL_ID, prerequisiteSkillIdentifiers: [], reportingCategory: AUTHOR_LENS_REPORTING_CATEGORY,
    genre: 'paired_text', difficulty: record.difficulty, passageIdentifier: record.textA.passageId,
    activityIdentifier: `g3-cg-al-activity-${lessonIndex + 1}-question-${questionIndex}`, lessonIdentifier: AUTHOR_LENS_LESSON_IDS[lessonIndex],
    explanation, evidenceReference: evidenceReferenceIds[0], evidenceReferenceIds: unique(evidenceReferenceIds),
    targetVocabulary: [], soundOutChunks: [], estimatedReadingLevel: 'Grade 3', reviewStatus: 'DRAFT' as const,
    contentVersion: AUTHOR_LENS_VERSION,
    tags: ['author-lens-tower', 'two-author-comparison', 'same-topic-or-theme', ...tags],
  }
}

function mc(record: Record, lessonIndex: number, questionIndex: number, prompt: string, correctText: string, distractors: [string, string, string], explanation: string, evidenceIds: string[], tags: string[]): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multiple_choice', prompt, explanation, evidenceIds, tags)
  const texts = [...distractors]
  texts.splice((lessonIndex + questionIndex) % 4, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [correct.id], questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] } }
}

function similarityQuestion(record: Record, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const currentGuide = guide(record)
  const key = currentGuide.similarities[0]
  return mc(record, lessonIndex, questionIndex, 'What is one meaningful similarity in how the two authors present the shared topic or theme?', key.statement,
    ['Both authors use exactly the same organization and include identical details.', record.factOnlyComparison, differenceText(record)],
    `${key.statement} ${key.explanation}`, pointEvidence(record, 'similarity'), ['presentation-similarity', 'evidence-from-both-texts'])
}

function differenceQuestion(record: Record, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const key = guide(record).differences[0]
  return mc(record, lessonIndex, questionIndex, 'What is the most meaningful difference in how the two authors present the shared topic or theme?', differenceText(record),
    [swappedDifferenceText(record), guide(record).similarities[0].statement, record.factOnlyComparison],
    `${key.explanation} This compares presentation choices rather than listing facts only.`, pointEvidence(record, 'difference'), ['presentation-difference', 'evidence-from-both-texts'])
}

function multiselect(record: Record, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const key = guide(record).differences[0]
  const correctA = sentence(record, 'A', record.differences[0].textA[0])
  const correctB = sentence(record, 'B', record.differences[0].textB[0])
  const entries = [
    { side: 'A', number: record.differences[0].textA[0], text: `Text A: ${correctA}`, correct: true },
    { side: 'A', number: record.nonEvidence.textA, text: `Text A: ${sentence(record, 'A', record.nonEvidence.textA)}`, correct: false },
    { side: 'B', number: record.differences[0].textB[0], text: `Text B: ${correctB}`, correct: true },
    { side: 'B', number: record.nonEvidence.textB, text: `Text B: ${sentence(record, 'B', record.nonEvidence.textB)}`, correct: false },
  ] as const
  const data = base(record, lessonIndex, questionIndex, 'multi_select', 'Choose the two source details, one from each text, that most directly support the main presentation difference.',
    `${key.explanation} The selected evidence pair supplies one direct clue from each source.`, pointEvidence(record, 'difference'), ['presentation-difference', 'evidence-from-both-texts'])
  const choices = entries.map((entry, index) => choice(data.questionIdentifier, `choice-${index + 1}`, entry.text))
  const correctChoiceIds = choices.filter((_, index) => entries[index].correct).map((entry) => entry.id)
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: correctChoiceIds, questionContent: { type: 'multi_select', choices, correctChoiceIds, allowMultiple: true } }
}

function hotText(record: Record, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const { side, choices: numbers, correct } = record.hotText
  const correctIndex = numbers.indexOf(correct)
  const scopedEvidence = evidence(record, side, correct)
  const data = base(record, lessonIndex, questionIndex, 'hot_text', `Select the sentence in Text ${side} that most clearly reveals that author's main presentation choice.`,
    `This Text ${side} sentence directly signals the author's focus or organization.`, [scopedEvidence], ['presentation-difference'])
  const selectableSegments = numbers.map((number, index) => choice(data.questionIdentifier, `segment-${index + 1}`, sentence(record, side, number)))
  return { ...data, answerChoices: selectableSegments.map((entry) => entry.text), correctAnswers: [selectableSegments[correctIndex].id], questionContent: { type: 'hot_text', selectableSegments, correctSegmentIds: [selectableSegments[correctIndex].id] } }
}

function table(record: Record, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const currentGuide = guide(record)
  const data = base(record, lessonIndex, questionIndex, 'table_match', 'Match each presentation statement to Text A, Text B, or Both.',
    'Text A and Text B have distinct focuses, while the similarity describes a choice shared by both authors.', unique([...pointEvidence(record, 'similarity'), ...pointEvidence(record, 'difference')]), ['presentation-similarity', 'presentation-difference', 'evidence-from-both-texts'])
  const options = [choice(data.questionIdentifier, 'text-a', 'Text A'), choice(data.questionIdentifier, 'text-b', 'Text B'), choice(data.questionIdentifier, 'both', 'Both')]
  const plans = [
    { prompt: currentGuide.textAFocusStatement, correctChoiceId: options[0].id },
    { prompt: currentGuide.textBFocusStatement, correctChoiceId: options[1].id },
    { prompt: currentGuide.similarities[0].statement, correctChoiceId: options[2].id },
  ]
  const rows = plans.map((plan, index) => ({ id: `${data.questionIdentifier}-row-${index + 1}`, prompt: plan.prompt, correctChoiceId: plan.correctChoiceId, options }))
  return { ...data, answerChoices: options.map((entry) => entry.text), correctAnswers: rows.map((row) => row.correctChoiceId), questionContent: { type: 'table_match', selectionMode: 'independent', rows } }
}

function transferQuestion(record: Record, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return mc(record, lessonIndex, questionIndex, 'Which choice compares author presentation rather than listing facts from the texts?', record.synthesis,
    [record.factOnlyComparison, `Text A is about ${record.pairTitle}.`, 'Both texts have titles and complete sentences.'],
    'The correct choice names what each author emphasizes or organizes and connects those choices in one comparison.', unique([...pointEvidence(record, 'similarity'), ...pointEvidence(record, 'difference')]), ['presentation-similarity', 'presentation-difference', 'evidence-from-both-texts', 'transfer'])
}

function twoPart(record: Record, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const currentGuide = guide(record)
  const key = currentGuide.differences[0]
  const data = base(record, lessonIndex, questionIndex, 'two_part', 'Choose the strongest presentation difference, then choose the evidence pair that supports it.',
    `${key.explanation} The supporting pair includes correctly assigned evidence from Text A and Text B.`, pointEvidence(record, 'difference'), ['presentation-difference', 'evidence-from-both-texts'])
  const partAChoices = [
    choice(data.questionIdentifier, 'a-1', differenceText(record)),
    choice(data.questionIdentifier, 'a-2', currentGuide.similarities[0].statement),
    choice(data.questionIdentifier, 'a-3', record.factOnlyComparison),
  ]
  const correctA = sentence(record, 'A', record.differences[0].textA[0])
  const correctB = sentence(record, 'B', record.differences[0].textB[0])
  const otherA = sentence(record, 'A', record.nonEvidence.textA)
  const otherB = sentence(record, 'B', record.nonEvidence.textB)
  const partBChoices = [
    choice(data.questionIdentifier, 'b-1', `Text A: "${correctA}" Text B: "${correctB}"`),
    choice(data.questionIdentifier, 'b-2', `Text A: "${correctB}" Text B: "${correctA}"`),
    choice(data.questionIdentifier, 'b-3', `Text A: "${otherA}" Text B: "${otherB}"`),
  ]
  return {
    ...data,
    answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text),
    correctAnswers: [partAChoices[0].id, partBChoices[0].id],
    questionContent: {
      type: 'two_part', partAPrompt: 'Part A: Which is the strongest presentation difference?', partAChoices,
      partACorrectChoiceId: partAChoices[0].id, partBPrompt: 'Part B: Which evidence pair, one clue from each text, best supports Part A?',
      partBChoices, partBCorrectChoiceId: partBChoices[0].id,
    },
  }
}

function guided(record: Record, index: number): ReadingQuestion[] {
  return [similarityQuestion(record, index, 1), differenceQuestion(record, index, 2), multiselect(record, index, 3), hotText(record, index, 4), table(record, index, 5)]
}
function checkpoint(record: Record, index: number): ReadingQuestion[] {
  return [similarityQuestion(record, index, 1), differenceQuestion(record, index, 2), transferQuestion(record, index, 3), multiselect(record, index, 4), hotText(record, index, 5), table(record, index, 6), twoPart(record, index, 7)]
}

export const authorLensQuestions: ReadingQuestion[] = authorLensPairRecords.flatMap((record, index) => index < 4 ? guided(record, index) : checkpoint(record, index))

export const authorLensLessons: ContentPackLesson[] = authorLensPairRecords.map((record, index) => {
  const checkpointLesson = index >= 4
  return {
    lessonId: AUTHOR_LENS_LESSON_IDS[index], worldId: AUTHOR_LENS_WORLD_ID, unitId: AUTHOR_LENS_UNIT_ID,
    activityId: `g3-cg-author-lens-activity-${index + 1}`, difficulty: record.difficulty,
    passageIdentifiers: [record.textA.passageId, record.textB.passageId], pairedTextSetId: record.pairId,
    questionIdentifiers: authorLensQuestions.filter((question) => question.lessonIdentifier === AUTHOR_LENS_LESSON_IDS[index]).map((question) => question.questionIdentifier),
    lessonTitle: AUTHOR_LENS_LESSON_TITLES[index], lessonObjective: objectives[index], lessonRole: checkpointLesson ? 'CHECKPOINT' : 'GUIDED_PRACTICE',
    selectionStatus: 'active', ...(checkpointLesson ? {} : { teachingBlock: teachingBlocks[index] }), contentVersion: AUTHOR_LENS_VERSION,
    eligiblePurposes: checkpointLesson ? ['progression', 'verification', 'review'] : ['remediation', 'review'],
  }
})
