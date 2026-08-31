import type { TeachingBlock } from '../../../../../lesson'
import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson } from '../../../contentPackTypes'
import { claimEvidenceRecords, claimSentenceId, type ClaimEvidenceRecord } from './passages'
import {
  CLAIM_EVIDENCE_BENCHMARK, CLAIM_EVIDENCE_LESSON_IDS, CLAIM_EVIDENCE_LESSON_TITLES,
  CLAIM_EVIDENCE_REPORTING_CATEGORY, CLAIM_EVIDENCE_SKILL_ID, CLAIM_EVIDENCE_UNIT_ID,
  CLAIM_EVIDENCE_VERSION, CLAIM_EVIDENCE_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }

const lessonObjectives = [
  'Distinguish an author claim from a topic, central idea, purpose, and fact.',
  'Separate reasons from the evidence that supports them.',
  'Connect measurements, results, and observations to an author claim.',
  'Compare strong and weak evidence for a priority claim.',
  'Explain how evidence across sections supports a proposed action.',
  'Use route facts, comparisons, and observations to evaluate a best-choice claim.',
  'Match reasons and evidence to explain a supported school improvement claim.',
]

const teachingBlocks: TeachingBlock[] = [
  {
    title: 'Find the position', explanation: 'A topic names the subject. A central idea explains important information. A purpose tells why the author wrote. A claim is the position the author supports.',
    examples: ['Topic: native flowers', 'Claim: The garden should include native flowers.', 'Fact: Bees visited the flowers in the sample count.'],
    contrast: 'A neutral fact can support a claim, but it is not automatically the claim.', learnerCue: 'Ask which statement the author wants readers to accept.',
  },
  {
    title: 'Reason or evidence?', explanation: 'A reason tells why a claim makes sense. Evidence is a fact, example, observation, measurement, result, or comparison supporting that reason.',
    examples: ['Reason: Reusable signs can last through repeated setup.', 'Evidence: All twelve laminated samples stayed readable.'],
    contrast: 'Repeating the claim is not evidence.', learnerCue: 'Name what the detail shows, then connect it to a reason.',
  },
  {
    title: 'Build the connection', explanation: 'Strong evidence does more than mention the topic. It shows something that makes a reason and claim more believable.',
    examples: ['Claim → reason → evidence', 'Explain what the evidence shows.', 'Connect that result back to the claim.'],
    contrast: 'A true color or decoration detail can still be weak or irrelevant.', learnerCue: 'Finish: This supports the claim because it shows…',
  },
  {
    title: 'Compare evidence strength', explanation: 'Measurements and observations can be strong when they directly test a reason. Other true details may be secondary or unrelated.',
    examples: ['Check whether the evidence fits the stated reason.', 'Use details across sections.', 'Reject evidence connected to a different claim.'],
    contrast: 'Emotional words do not replace support.', learnerCue: 'Choose evidence with the clearest logical link.',
  },
]

function choice(id: string, suffix: string, text: string): Choice { return { id: `${id}-${suffix}`, text } }

function base(record: ClaimEvidenceRecord, lessonIndex: number, questionIndex: number, type: ReadingQuestion['questionType'], prompt: string, explanation: string, evidenceIds: string[], tags: string[]) {
  const questionIdentifier = `g3-id-ce-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier, questionType: type, prompt, gradeBand: 3 as const,
    benchmarkReference: CLAIM_EVIDENCE_BENCHMARK, skillIdentifier: CLAIM_EVIDENCE_SKILL_ID,
    prerequisiteSkillIdentifiers: [], reportingCategory: CLAIM_EVIDENCE_REPORTING_CATEGORY,
    genre: 'informational', difficulty: record.difficulty, passageIdentifier: record.passageId,
    activityIdentifier: `g3-id-ce-activity-${lessonIndex + 1}-question-${questionIndex}`,
    lessonIdentifier: CLAIM_EVIDENCE_LESSON_IDS[lessonIndex], explanation,
    evidenceReference: evidenceIds[0], evidenceReferenceIds: evidenceIds,
    targetVocabulary: [], soundOutChunks: [], estimatedReadingLevel: 'Grade 3',
    tags: ['claim-evidence-court', ...tags], reviewStatus: 'DRAFT' as const,
    contentVersion: CLAIM_EVIDENCE_VERSION,
  }
}

function mc(record: ClaimEvidenceRecord, lessonIndex: number, questionIndex: number, prompt: string, correctText: string, distractors: [string, string, string], explanation: string, evidenceIds: string[], tags: string[]): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multiple_choice', prompt, explanation, evidenceIds, tags)
  const texts = [...distractors]
  texts.splice((lessonIndex + questionIndex) % 4, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] } }
}

function claimQuestion(record: ClaimEvidenceRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return mc(record, lessonIndex, questionIndex, `What is the author's claim in "${record.title}"?`, record.claim,
    [record.topic, record.centralIdea, record.purpose],
    `${record.claim} is the supported position. The other choices name the topic, central idea, or author purpose.`,
    record.claimSentences.map((sentence) => claimSentenceId(record.passageId, sentence)),
    ['author-claim', 'claim-topic-distinction', 'claim-central-idea-distinction', 'claim-purpose-distinction', 'claim-fact-distinction'])
}

function reasonQuestion(record: ClaimEvidenceRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const reason = record.reasons[0]
  const evidence = record.sentences[reason.evidenceSentences[0] - 1]
  const weak = record.sentences[record.weakDetails[0].sentence - 1]
  return mc(record, lessonIndex, questionIndex, 'Which statement is a reason supporting the author’s claim?', record.sentences[reason.sentence - 1],
    [record.claim, evidence, weak],
    `${record.sentences[reason.sentence - 1]} explains why the claim makes sense; the other statements are the claim, evidence, or a weak detail.`,
    [claimSentenceId(record.passageId, reason.sentence), ...reason.evidenceSentences.map((sentence) => claimSentenceId(record.passageId, sentence))],
    ['reasons', 'evidence', 'reason-evidence-distinction', 'claim-evidence-connection'])
}

function multiselect(record: ClaimEvidenceRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const strongEvidence = record.evidence.filter((entry) => entry.strength === 'strong')
  const first = strongEvidence[0]
  const last = strongEvidence.findLast((entry) => sectionFor(record, entry.sentence) !== sectionFor(record, first.sentence))
  if (!first || !last) throw new Error(`${record.passageId} needs strong claim evidence from two sections.`)
  const weak = record.weakDetails[0]
  const data = base(record, lessonIndex, questionIndex, 'multi_select', 'Choose the two evidence details from different sections that support the author’s claim.',
    `“${record.sentences[first.sentence - 1]}” and “${record.sentences[last.sentence - 1]}” support declared reasons and connect those reasons to the claim: ${record.claim}`,
    [first.sentence, last.sentence].map((sentence) => claimSentenceId(record.passageId, sentence)),
    ['author-claim', 'evidence', 'claim-evidence-connection', 'cross-section-evidence', 'strong-weak-evidence'])
  const choices = [
    choice(data.questionIdentifier, 'correct-1', record.sentences[first.sentence - 1]),
    choice(data.questionIdentifier, 'weak', record.sentences[weak.sentence - 1]),
    choice(data.questionIdentifier, 'correct-2', record.sentences[last.sentence - 1]),
    choice(data.questionIdentifier, 'repeat', record.claim),
  ]
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [choices[0].text, choices[2].text], questionContent: { type: 'multi_select', choices, correctChoiceIds: [choices[0].id, choices[2].id], allowMultiple: true } }
}

function hotText(record: ClaimEvidenceRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'hot_text', record.hotPrompt,
    `This is the unique selection that answers the prompt: “${record.sentences[record.hotCorrectSentence - 1]}”`,
    [claimSentenceId(record.passageId, record.hotCorrectSentence)], ['author-claim', 'evidence', 'claim-evidence-connection', 'strong-weak-evidence'])
  const numbers = [record.hotCorrectSentence, ...record.hotDistractorSentences]
  const correctNumber = numbers.shift()!
  numbers.splice((lessonIndex + 1) % 4, 0, correctNumber)
  const segments = numbers.map((number, index) => choice(data.questionIdentifier, `segment-${index + 1}`, record.sentences[number - 1]))
  const correct = segments.find((segment) => segment.text === record.sentences[record.hotCorrectSentence - 1])!
  return { ...data, answerChoices: segments.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [correct.id] } }
}

function classificationTable(record: ClaimEvidenceRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const reason = record.reasons[0]
  const evidence = record.evidence.find((entry) => entry.reasonIndexes.includes(1))!
  const weak = record.weakDetails[0]
  const data = base(record, lessonIndex, questionIndex, 'table_match', 'Match each statement with its role in the author’s argument.',
    'The claim is the supported position, a reason says why it makes sense, evidence supports a reason, and a weak detail does not strengthen the claim.',
    [record.claimSentences[0], reason.sentence, evidence.sentence, weak.sentence].map((sentence) => claimSentenceId(record.passageId, sentence)),
    ['author-claim', 'reasons', 'evidence', 'reason-evidence-distinction', 'claim-fact-distinction', 'strong-weak-evidence'])
  const options = [
    choice(data.questionIdentifier, 'claim', 'Claim'), choice(data.questionIdentifier, 'reason', 'Reason'),
    choice(data.questionIdentifier, 'evidence', 'Evidence'), choice(data.questionIdentifier, 'weak', 'Weak or irrelevant detail'),
    choice(data.questionIdentifier, 'unused', 'Unsupported opinion'),
  ]
  const rows = [
    { id: `${data.questionIdentifier}-row-claim`, prompt: record.claim, correctChoiceId: options[0].id, options },
    { id: `${data.questionIdentifier}-row-reason`, prompt: record.sentences[reason.sentence - 1], correctChoiceId: options[1].id, options },
    { id: `${data.questionIdentifier}-row-evidence`, prompt: record.sentences[evidence.sentence - 1], correctChoiceId: options[2].id, options },
    { id: `${data.questionIdentifier}-row-weak`, prompt: record.sentences[weak.sentence - 1], correctChoiceId: options[3].id, options },
  ]
  return { ...data, answerChoices: options.map((entry) => entry.text), correctAnswers: rows.map((row) => row.correctChoiceId), questionContent: { type: 'table_match', selectionMode: 'use_each_once', rows } }
}

function transferQuestion(record: ClaimEvidenceRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const transfer = record.transfer!
  return mc(record, lessonIndex, questionIndex, `Read this new example: ${transfer.text} Which statement is the supported claim?`, transfer.claim,
    [transfer.topic, transfer.centralIdea, transfer.purpose], transfer.explanation,
    [claimSentenceId(record.passageId, record.evidence[0].sentence)],
    ['author-claim', 'claim-transfer', 'claim-topic-distinction', 'claim-central-idea-distinction', 'claim-purpose-distinction', 'claim-fact-distinction', 'claim-evidence-connection'])
}

function twoPart(record: ClaimEvidenceRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const first = record.evidence.find((entry) => entry.strength === 'strong')!
  const last = record.evidence.findLast((entry) => entry.strength === 'strong' && sectionFor(record, entry.sentence) !== sectionFor(record, first.sentence))!
  const weak = record.weakDetails[0]
  const correctEvidence = `${record.sentences[first.sentence - 1]} / ${record.sentences[last.sentence - 1]}`
  const partialEvidence = `${record.sentences[first.sentence - 1]} / ${record.sentences[weak.sentence - 1]}`
  const repeatedClaim = `${record.claim} / ${record.claim}`
  const data = base(record, lessonIndex, questionIndex, 'two_part', 'Identify the author’s claim, then choose the evidence pair from separate sections that best supports it.',
    `${record.claim} The correct evidence pair supports two reasons and creates a direct claim-evidence connection.`,
    [first.sentence, last.sentence].map((sentence) => claimSentenceId(record.passageId, sentence)),
    ['author-claim', 'reasons', 'evidence', 'claim-evidence-connection', 'cross-section-evidence', 'strong-weak-evidence'])
  const partAChoices = [
    choice(data.questionIdentifier, 'a-correct', record.claim), choice(data.questionIdentifier, 'a-topic', record.topic),
    choice(data.questionIdentifier, 'a-purpose', record.purpose),
  ]
  const partBChoices = [
    choice(data.questionIdentifier, 'b-correct', correctEvidence), choice(data.questionIdentifier, 'b-partial', partialEvidence),
    choice(data.questionIdentifier, 'b-repeat', repeatedClaim),
  ]
  return {
    ...data, answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text), correctAnswers: [partAChoices[0].text, partBChoices[0].text],
    questionContent: { type: 'two_part', partAPrompt: 'Part A: What is the author’s claim?', partAChoices, partACorrectChoiceId: partAChoices[0].id, partBPrompt: 'Part B: Which pair of details from separate sections best supports that claim?', partBChoices, partBCorrectChoiceId: partBChoices[0].id },
  }
}

function guidedQuestions(record: ClaimEvidenceRecord, lessonIndex: number): ReadingQuestion[] {
  return [claimQuestion(record, lessonIndex, 1), reasonQuestion(record, lessonIndex, 2), multiselect(record, lessonIndex, 3), hotText(record, lessonIndex, 4), classificationTable(record, lessonIndex, 5)]
}

function checkpointQuestions(record: ClaimEvidenceRecord, lessonIndex: number): ReadingQuestion[] {
  return [claimQuestion(record, lessonIndex, 1), reasonQuestion(record, lessonIndex, 2), transferQuestion(record, lessonIndex, 3), multiselect(record, lessonIndex, 4), hotText(record, lessonIndex, 5), classificationTable(record, lessonIndex, 6), twoPart(record, lessonIndex, 7)]
}

function sectionFor(record: ClaimEvidenceRecord, sentence: number): number {
  return sentence <= record.sectionEnds[0] ? 1 : sentence <= record.sectionEnds[1] ? 2 : 3
}

export const claimEvidenceQuestions: ReadingQuestion[] = claimEvidenceRecords.flatMap((record, index) => index < 4 ? guidedQuestions(record, index) : checkpointQuestions(record, index))

export const claimEvidenceLessons: ContentPackLesson[] = claimEvidenceRecords.map((record, index) => {
  const checkpoint = index >= 4
  return {
    lessonId: CLAIM_EVIDENCE_LESSON_IDS[index], worldId: CLAIM_EVIDENCE_WORLD_ID, unitId: CLAIM_EVIDENCE_UNIT_ID,
    activityId: `g3-id-ce-activity-${index + 1}`, difficulty: record.difficulty, passageIdentifiers: [record.passageId],
    questionIdentifiers: claimEvidenceQuestions.filter((question) => question.lessonIdentifier === CLAIM_EVIDENCE_LESSON_IDS[index]).map((question) => question.questionIdentifier),
    lessonTitle: CLAIM_EVIDENCE_LESSON_TITLES[index], lessonObjective: lessonObjectives[index],
    lessonRole: checkpoint ? 'CHECKPOINT' : 'GUIDED_PRACTICE', selectionStatus: 'active',
    ...(checkpoint ? {} : { teachingBlock: teachingBlocks[index] }), contentVersion: CLAIM_EVIDENCE_VERSION,
    eligiblePurposes: checkpoint ? ['progression', 'verification', 'review'] : ['remediation', 'review'],
  }
})
