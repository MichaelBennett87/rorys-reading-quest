import type { TeachingBlock } from '../../../../../lesson'
import type { ReadingQuestion } from '../../../../types'
import type { ContentPackLesson } from '../../../contentPackTypes'
import { centralIdeaEngineRecords, centralIdeaSentenceId, type CentralIdeaEngineRecord } from './passages'
import {
  CENTRAL_IDEA_ENGINE_BENCHMARK, CENTRAL_IDEA_ENGINE_LESSON_IDS, CENTRAL_IDEA_ENGINE_LESSON_TITLES,
  CENTRAL_IDEA_ENGINE_REPORTING_CATEGORY, CENTRAL_IDEA_ENGINE_SKILL_ID, CENTRAL_IDEA_ENGINE_UNIT_ID,
  CENTRAL_IDEA_ENGINE_VERSION, CENTRAL_IDEA_ENGINE_WORLD_ID,
} from './ids'

type Choice = { id: string; text: string }

const lessonObjectives = [
  'Distinguish a complete central idea from a topic, summary, and minor detail.',
  'Combine important details to infer a central idea.',
  'Find a stated central idea and explain how sections support it.',
  'Use relevant details across sections to infer one central idea.',
  'Explain how wetland details across sections support an implied central idea.',
  'Connect solar-system details to a stated central idea.',
  'Infer a central idea from the return, sorting, and shelving sections.',
]

const teachingBlocks: TeachingBlock[] = [
  {
    title: 'Topic or central idea?',
    explanation: 'A topic names the broad subject. A central idea is a complete thought that tells what the author mostly explains about that topic.',
    examples: ['Topic: beach grass', 'Central idea: Beach grass leaves and roots help dunes form and stay in place.'],
    contrast: 'One word or a heading alone is not a complete central idea.', learnerCue: 'Name the topic, then say the most important idea about it.',
  },
  {
    title: 'Keep the details that matter',
    explanation: 'A relevant detail explains, proves, or illustrates the central idea. A minor detail may be true and interesting without helping the main idea.',
    examples: ['Check each section.', 'Ask how the detail connects.', 'Set aside a detail that does not develop the same idea.'],
    contrast: 'A true detail is not automatically an important supporting detail.', learnerCue: 'Keep details that support the same important idea.',
  },
  {
    title: 'Find a stated idea',
    explanation: 'Sometimes an author states the central idea in one sentence. Other sections still add details that explain and support it.',
    examples: ['Locate the complete stated idea.', 'Find support in another section.', 'Explain how the support adds meaning.'],
    contrast: 'The stated sentence is not enough by itself when a question asks how the text develops the idea.', learnerCue: 'Connect the stated idea to details across the text.',
  },
  {
    title: 'Build an implied idea',
    explanation: 'An implied central idea is not copied from one sentence. Readers combine relevant details from different sections.',
    examples: ['Read every heading and section.', 'Group details that point to one idea.', 'Check that the idea fits the whole text.'],
    contrast: 'Do not choose a narrow idea that fits only one section.', learnerCue: 'Combine support, then state one complete idea.',
  },
]

function choice(id: string, suffix: string, text: string): Choice { return { id: `${id}-${suffix}`, text } }

function base(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number, type: ReadingQuestion['questionType'], prompt: string, explanation: string, evidenceIds: string[], tags: string[]) {
  const questionIdentifier = `g3-id-ci-q${lessonIndex + 1}-${questionIndex}`
  return {
    questionIdentifier, questionType: type, prompt, gradeBand: 3 as const,
    benchmarkReference: CENTRAL_IDEA_ENGINE_BENCHMARK, skillIdentifier: CENTRAL_IDEA_ENGINE_SKILL_ID,
    prerequisiteSkillIdentifiers: [], reportingCategory: CENTRAL_IDEA_ENGINE_REPORTING_CATEGORY,
    genre: 'informational', difficulty: record.difficulty, passageIdentifier: record.passageId,
    activityIdentifier: `g3-id-ci-activity-${lessonIndex + 1}-question-${questionIndex}`,
    lessonIdentifier: CENTRAL_IDEA_ENGINE_LESSON_IDS[lessonIndex], explanation,
    evidenceReference: evidenceIds[0], evidenceReferenceIds: evidenceIds,
    targetVocabulary: [], soundOutChunks: [], estimatedReadingLevel: 'Grade 3',
    tags: ['central-idea-engine', ...tags], reviewStatus: 'DRAFT' as const,
    contentVersion: CENTRAL_IDEA_ENGINE_VERSION,
  }
}

function mc(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number, prompt: string, correctText: string, distractors: [string, string, string], explanation: string, evidenceIds: string[], tags: string[]): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'multiple_choice', prompt, explanation, evidenceIds, tags)
  const texts = [...distractors]
  texts.splice((lessonIndex + questionIndex) % 4, 0, correctText)
  const choices = texts.map((text, index) => choice(data.questionIdentifier, `choice-${index + 1}`, text))
  const correct = choices.find((entry) => entry.text === correctText)!
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'multiple_choice', choices, correctChoiceIds: [correct.id] } }
}

function centralIdeaQuestion(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const evidence = [record.relevantDetails[0], record.relevantDetails.at(-1)!].map((detail) => centralIdeaSentenceId(record.passageId, detail.sentence))
  return mc(record, lessonIndex, questionIndex, `What is the central idea of "${record.title}"?`, record.centralIdea,
    [record.topic, record.narrowDistractor, record.summaryDistractor],
    `${record.centralIdea} This complete thought fits the important details in every section, unlike the topic, narrow detail, or summary list.`,
    evidence, ['central-idea', 'topic-central-idea-distinction', 'central-idea-summary-distinction'])
}

function topicDistinctionQuestion(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  return mc(record, lessonIndex, questionIndex, 'Which choice names only the broad topic rather than stating the central idea?', record.topic,
    [record.centralIdea, record.narrowDistractor, record.summaryDistractor],
    `${record.topic} names the subject but does not state the important idea the author develops about it.`,
    [centralIdeaSentenceId(record.passageId, 1)], ['topic-central-idea-distinction', 'central-idea-summary-distinction'])
}

function sectionContributionQuestion(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const middleDetails = record.relevantDetails.filter((detail) => detail.sentence > record.sectionEnds[0] && detail.sentence <= record.sectionEnds[1])
  return mc(record, lessonIndex, questionIndex, `How does the section "${record.headings[1]}" support the central idea?`, record.sectionContributions[1],
    ['It only repeats the title without adding information.', 'It gives a minor fact that is unrelated to the central idea.', 'It replaces the other sections, so their details are not needed.'],
    `${record.sectionContributions[1]} This explains how the section contributes to the same central idea.`,
    middleDetails.map((detail) => centralIdeaSentenceId(record.passageId, detail.sentence)), ['section-contribution', 'evidence-across-sections'])
}

function multiselect(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const first = record.relevantDetails[0]
  const last = record.relevantDetails.at(-1)!
  const data = base(record, lessonIndex, questionIndex, 'multi_select', 'Choose the two details from different sections that best support the central idea.',
    `Both selected details support the same central idea across sections: ${record.centralIdea}`,
    [first, last].map((detail) => centralIdeaSentenceId(record.passageId, detail.sentence)), ['relevant-details', 'details-support-central-idea', 'evidence-across-sections'])
  const choices = [
    choice(data.questionIdentifier, 'correct-1', record.sentences[first.sentence - 1]),
    choice(data.questionIdentifier, 'wrong-1', record.sentences[record.minorDetails[0].sentence - 1]),
    choice(data.questionIdentifier, 'correct-2', record.sentences[last.sentence - 1]),
    choice(data.questionIdentifier, 'wrong-2', record.sentences[record.minorDetails[1].sentence - 1]),
  ]
  return { ...data, answerChoices: choices.map((entry) => entry.text), correctAnswers: [choices[0].text, choices[2].text], questionContent: { type: 'multi_select', choices, correctChoiceIds: [choices[0].id, choices[2].id], allowMultiple: true } }
}

function hotText(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const data = base(record, lessonIndex, questionIndex, 'hot_text', record.hotPrompt,
    `This learner-visible sentence is the unique selection that ${record.mode === 'stated' ? 'states' : 'most clearly supports'} the central idea: "${record.sentences[record.hotCorrectSentence - 1]}"`,
    [centralIdeaSentenceId(record.passageId, record.hotCorrectSentence)], ['central-idea', 'relevant-details', 'details-support-central-idea'])
  const numbers = [record.hotCorrectSentence, ...record.hotDistractorSentences]
  const correctNumber = numbers.shift()!
  numbers.splice((lessonIndex + 1) % 4, 0, correctNumber)
  const segments = numbers.map((number, index) => choice(data.questionIdentifier, `segment-${index + 1}`, record.sentences[number - 1]))
  const correct = segments.find((segment) => segment.text === record.sentences[record.hotCorrectSentence - 1])!
  return { ...data, answerChoices: segments.map((entry) => entry.text), correctAnswers: [correct.text], questionContent: { type: 'hot_text', selectableSegments: segments, correctSegmentIds: [correct.id] } }
}

function classificationTable(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const minorText = record.sentences[record.minorDetails[1].sentence - 1]
  const data = base(record, lessonIndex, questionIndex, 'table_match', 'Match each kind of information with the example from this text.',
    'The central idea is a complete whole-text thought, the topic is the broad subject, and the minor detail is true without being essential support.',
    [centralIdeaSentenceId(record.passageId, record.relevantDetails[0].sentence), centralIdeaSentenceId(record.passageId, record.minorDetails[1].sentence)],
    ['topic-central-idea-distinction', 'relevant-details', 'minor-detail-distinction', 'central-idea-summary-distinction'])
  const options = [
    choice(data.questionIdentifier, 'central', record.centralIdea),
    choice(data.questionIdentifier, 'topic', record.topic),
    choice(data.questionIdentifier, 'minor', minorText),
    choice(data.questionIdentifier, 'summary', record.summaryDistractor),
  ]
  const rows = [
    { id: `${data.questionIdentifier}-row-central`, prompt: 'Central idea', correctChoiceId: options[0].id, options },
    { id: `${data.questionIdentifier}-row-topic`, prompt: 'Topic', correctChoiceId: options[1].id, options },
    { id: `${data.questionIdentifier}-row-minor`, prompt: 'Interesting but minor detail', correctChoiceId: options[2].id, options },
  ]
  return { ...data, answerChoices: options.map((entry) => entry.text), correctAnswers: rows.map((row) => row.correctChoiceId), questionContent: { type: 'table_match', selectionMode: 'use_each_once', rows } }
}

function transferQuestion(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const transfer = record.transfer!
  return mc(record, lessonIndex, questionIndex, `Read this new example: ${transfer.text} What central idea fits all of these details?`, transfer.centralIdea,
    [transfer.topic, transfer.narrowDetail, transfer.unsupported], transfer.explanation,
    [centralIdeaSentenceId(record.passageId, record.relevantDetails[0].sentence)], ['central-idea', 'central-idea-transfer'])
}

function twoPart(record: CentralIdeaEngineRecord, lessonIndex: number, questionIndex: number): ReadingQuestion {
  const first = record.relevantDetails[0]
  const last = record.relevantDetails.at(-1)!
  const correctEvidence = `${record.sentences[first.sentence - 1]} / ${record.sentences[last.sentence - 1]}`
  const minorEvidence = `${record.sentences[record.minorDetails[0].sentence - 1]} / ${record.sentences[record.minorDetails[1].sentence - 1]}`
  const partialEvidence = `${record.sentences[0]} / ${record.sentences[record.minorDetails[1].sentence - 1]}`
  const data = base(record, lessonIndex, questionIndex, 'two_part', 'Identify the central idea, then choose details from separate sections that support it.',
    `${record.centralIdea} The correct evidence pair supports that idea with important details from separate sections.`,
    [first, last].map((detail) => centralIdeaSentenceId(record.passageId, detail.sentence)), ['central-idea', 'details-support-central-idea', 'evidence-across-sections'])
  const partAChoices = [
    choice(data.questionIdentifier, 'a-correct', record.centralIdea),
    choice(data.questionIdentifier, 'a-topic', record.topic),
    choice(data.questionIdentifier, 'a-wrong', record.broadDistractor),
  ]
  const partBChoices = [
    choice(data.questionIdentifier, 'b-correct', correctEvidence),
    choice(data.questionIdentifier, 'b-minor', minorEvidence),
    choice(data.questionIdentifier, 'b-partial', partialEvidence),
  ]
  return {
    ...data, answerChoices: [...partAChoices, ...partBChoices].map((entry) => entry.text), correctAnswers: [partAChoices[0].text, partBChoices[0].text],
    questionContent: { type: 'two_part', partAPrompt: 'Part A: Which central idea fits the whole text?', partAChoices, partACorrectChoiceId: partAChoices[0].id, partBPrompt: 'Part B: Which pair of details from separate sections best supports Part A?', partBChoices, partBCorrectChoiceId: partBChoices[0].id },
  }
}

function guidedQuestions(record: CentralIdeaEngineRecord, lessonIndex: number): ReadingQuestion[] {
  return [centralIdeaQuestion(record, lessonIndex, 1), topicDistinctionQuestion(record, lessonIndex, 2), multiselect(record, lessonIndex, 3), hotText(record, lessonIndex, 4), classificationTable(record, lessonIndex, 5)]
}

function checkpointQuestions(record: CentralIdeaEngineRecord, lessonIndex: number): ReadingQuestion[] {
  return [centralIdeaQuestion(record, lessonIndex, 1), sectionContributionQuestion(record, lessonIndex, 2), transferQuestion(record, lessonIndex, 3), multiselect(record, lessonIndex, 4), hotText(record, lessonIndex, 5), classificationTable(record, lessonIndex, 6), twoPart(record, lessonIndex, 7)]
}

export const centralIdeaEngineQuestions: ReadingQuestion[] = centralIdeaEngineRecords.flatMap((record, index) => index < 4 ? guidedQuestions(record, index) : checkpointQuestions(record, index))

export const centralIdeaEngineLessons: ContentPackLesson[] = centralIdeaEngineRecords.map((record, index) => {
  const checkpoint = index >= 4
  return {
    lessonId: CENTRAL_IDEA_ENGINE_LESSON_IDS[index], worldId: CENTRAL_IDEA_ENGINE_WORLD_ID, unitId: CENTRAL_IDEA_ENGINE_UNIT_ID,
    activityId: `g3-id-ci-activity-${index + 1}`, difficulty: record.difficulty, passageIdentifiers: [record.passageId],
    questionIdentifiers: centralIdeaEngineQuestions.filter((question) => question.lessonIdentifier === CENTRAL_IDEA_ENGINE_LESSON_IDS[index]).map((question) => question.questionIdentifier),
    lessonTitle: CENTRAL_IDEA_ENGINE_LESSON_TITLES[index], lessonObjective: lessonObjectives[index],
    lessonRole: checkpoint ? 'CHECKPOINT' : 'GUIDED_PRACTICE', selectionStatus: 'active',
    ...(checkpoint ? {} : { teachingBlock: teachingBlocks[index] }), contentVersion: CENTRAL_IDEA_ENGINE_VERSION,
    eligiblePurposes: checkpoint ? ['progression', 'verification', 'review'] : ['remediation', 'review'],
  }
})
