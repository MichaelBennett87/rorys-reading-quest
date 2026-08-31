import type {
  HotTextQuestionData,
  LessonChoice,
  MultipleChoiceQuestionData,
  MultiselectQuestionData,
  ReadingQuestion,
  TableMatchQuestionData,
  TwoPartQuestionData,
} from '../../../../types'
import type { DerivationalSuffixTarget, DerivationalWordRole } from '../../../contentPackTypes'
import {
  suffixShifterContentVersion,
  suffixShifterLessonIds,
  suffixShifterPassageIds,
  suffixShifterQuestionIds,
  suffixShifterSkillId,
} from './ids'
import { getSuffixShifterArtifact } from './derivationalSuffixGuides'

const COMMON_TAGS = [
  'derivational-suffix-decoding',
  'part-of-speech-change',
  'base-suffix-segmentation',
  'morphological-segmentation',
  'reading-chunk-decoding',
  'connected-text-decoding',
  'suffix-pattern-highlight',
  'grade-3-word-help',
] as const

const SUFFIX_LABELS = ['-ness', '-ment', '-er', '-ful', '-less', '-ly', '-able', '-y']

interface QuestionBase {
  questionIdentifier: string
  lessonIdentifier: string
  passageIdentifier: string
  difficulty: 1 | 2
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  soundOutChunks: string[]
  tags: string[]
}

interface LessonConfig {
  lessonId: string
  passageId: string
  questionIds: readonly string[]
  difficulty: 1 | 2
  sharedRole: 'noun' | 'adjective'
}

interface CheckpointConfig extends Omit<LessonConfig, 'sharedRole'> {
  multiselect: { kind: 'role'; role: DerivationalWordRole } | { kind: 'suffix'; suffix: string }
}

const roleLabel: Record<DerivationalWordRole, string> = {
  noun: 'noun - names a person, place, thing, or idea',
  verb: 'verb - shows an action or state',
  adjective: 'adjective - describes a noun',
  adverb: 'adverb - tells how an action happens here',
}

function base(spec: QuestionBase) {
  return {
    gradeBand: 3 as const,
    benchmarkReference: 'ELA.3.F.1.3',
    skillIdentifier: suffixShifterSkillId,
    prerequisiteSkillIdentifiers: [] as string[],
    reportingCategory: 'Foundational Skills Bridge',
    genre: 'informational',
    difficulty: spec.difficulty,
    passageIdentifier: spec.passageIdentifier,
    activityIdentifier: `${spec.questionIdentifier}-activity`,
    questionIdentifier: spec.questionIdentifier,
    prompt: spec.prompt,
    lessonIdentifier: spec.lessonIdentifier,
    explanation: spec.explanation,
    evidenceReference: spec.evidenceReferenceIds[0] ?? spec.passageIdentifier,
    evidenceReferenceIds: [...spec.evidenceReferenceIds],
    targetVocabulary: [...spec.targetVocabulary],
    soundOutChunks: [...spec.soundOutChunks],
    estimatedReadingLevel: 'Grade 3',
    reviewStatus: 'DRAFT' as const,
    contentVersion: suffixShifterContentVersion,
    tags: [...spec.tags],
  }
}

function choice(id: string, text: string): LessonChoice {
  return { id, text }
}

function multipleChoice(spec: QuestionBase & { choices: LessonChoice[]; correctChoiceId: string }): ReadingQuestion {
  const questionContent: MultipleChoiceQuestionData = { type: 'multiple_choice', choices: spec.choices.map((item) => ({ ...item })), correctChoiceIds: [spec.correctChoiceId] }
  return { ...base(spec), questionType: 'multiple_choice', answerChoices: spec.choices.map((item) => item.text), correctAnswers: [spec.correctChoiceId], questionContent }
}

function multiselect(spec: QuestionBase & { choices: LessonChoice[]; correctChoiceIds: string[] }): ReadingQuestion {
  const questionContent: MultiselectQuestionData = { type: 'multi_select', choices: spec.choices.map((item) => ({ ...item })), correctChoiceIds: [...spec.correctChoiceIds], allowMultiple: true }
  return { ...base(spec), questionType: 'multi_select', answerChoices: spec.choices.map((item) => item.text), correctAnswers: [...spec.correctChoiceIds], questionContent }
}

function hotText(spec: QuestionBase & { segments: LessonChoice[]; correctSegmentIds: string[] }): ReadingQuestion {
  const questionContent: HotTextQuestionData = { type: 'hot_text', selectableSegments: spec.segments.map((item) => ({ ...item })), correctSegmentIds: [...spec.correctSegmentIds] }
  return { ...base(spec), questionType: 'hot_text', answerChoices: spec.segments.map((item) => item.text), correctAnswers: [...spec.correctSegmentIds], questionContent }
}

function tableMatch(spec: QuestionBase & { rows: TableMatchQuestionData['rows'] }): ReadingQuestion {
  const questionContent: TableMatchQuestionData = { type: 'table_match', rows: spec.rows.map((row) => ({ ...row, options: row.options.map((item) => ({ ...item })) })) }
  return { ...base(spec), questionType: 'table_match', answerChoices: spec.rows.flatMap((row) => row.options.map((item) => item.text)), correctAnswers: spec.rows.map((row) => row.correctChoiceId), questionContent }
}

function twoPart(spec: QuestionBase & Omit<TwoPartQuestionData, 'type'>): ReadingQuestion {
  const questionContent: TwoPartQuestionData = {
    type: 'two_part',
    partAPrompt: spec.partAPrompt,
    partAChoices: spec.partAChoices.map((item) => ({ ...item })),
    partACorrectChoiceId: spec.partACorrectChoiceId,
    partBPrompt: spec.partBPrompt,
    partBChoices: spec.partBChoices.map((item) => ({ ...item })),
    partBCorrectChoiceId: spec.partBCorrectChoiceId,
  }
  return { ...base(spec), questionType: 'two_part', answerChoices: [...spec.partAChoices, ...spec.partBChoices].map((item) => item.text), correctAnswers: [spec.partACorrectChoiceId, spec.partBCorrectChoiceId], questionContent }
}

function questionBase(config: LessonConfig | CheckpointConfig, index: number, values: Omit<QuestionBase, 'questionIdentifier' | 'lessonIdentifier' | 'passageIdentifier' | 'difficulty'>): QuestionBase {
  return { questionIdentifier: config.questionIds[index], lessonIdentifier: config.lessonId, passageIdentifier: config.passageId, difficulty: config.difficulty, ...values }
}

function tags(...extra: string[]): string[] {
  return [...COMMON_TAGS, ...extra]
}

function suffixLabel(target: DerivationalSuffixTarget): string {
  return `-${target.suffix}`
}

function morphology(target: DerivationalSuffixTarget): string {
  return target.morphologicalChunks.map((chunk) => chunk.text).join(' | ')
}

function reading(target: DerivationalSuffixTarget): string {
  return target.readingChunks.map((chunk) => chunk.displayText).join(' | ')
}

function makeChoiceSet(questionId: string, correctText: string, distractors: readonly string[], correctIndex: number) {
  const unique = [...new Set(distractors.filter((text) => text !== correctText))]
  if (unique.length < 3) throw new Error(`Question ${questionId} needs three unique distractors.`)
  const texts = unique.slice(0, 3)
  texts.splice(correctIndex, 0, correctText)
  const choices = texts.map((text, index) => choice(`${questionId}-choice-${index + 1}`, text))
  return { choices, correctChoiceId: choices[correctIndex].id }
}

function boundaryDistractors(target: DerivationalSuffixTarget): string[] {
  return [
    target.derivedWord,
    `${target.derivedWord.slice(0, 1)} | ${target.derivedWord.slice(1)}`,
    `${target.baseWord}${target.suffix.slice(0, 1)} | ${target.suffix.slice(1) || target.suffix}`,
  ]
}

function buildGuidedQuestions(config: LessonConfig): ReadingQuestion[] {
  const artifact = getSuffixShifterArtifact(config.passageId)
  const [first, second, , fourth] = artifact.targets
  const suffixChoices = makeChoiceSet(config.questionIds[0], suffixLabel(first), SUFFIX_LABELS, 1)
  const splitChoices = makeChoiceSet(config.questionIds[1], morphology(second), boundaryDistractors(second), 2)
  const roleChoices = artifact.targets.map((target, index) => choice(`${config.questionIds[2]}-choice-${index + 1}`, target.derivedWord))
  const roleCorrectIds = roleChoices
    .filter((_, index) => artifact.targets[index].derivedWordRole === config.sharedRole)
    .map((item) => item.id)
  if (roleCorrectIds.length !== 2) throw new Error(`${config.lessonId} requires exactly two ${config.sharedRole} targets.`)
  const hotSegments = fourth.morphologicalChunks.map((chunk, index) => choice(`${config.questionIds[3]}-segment-${index + 1}`, chunk.text))
  const suffixOptions = artifact.targets.map((target, index) => choice(`${config.questionIds[4]}-suffix-${index + 1}`, suffixLabel(target)))

  return [
    multipleChoice({
      ...questionBase(config, 0, {
        prompt: `Which suffix was added to ${first.baseWord} to build ${first.derivedWord}?`,
        explanation: `${suffixLabel(first)} is attached to ${first.baseWord} in ${first.derivedWord}.`,
        evidenceReferenceIds: [first.sentenceId], targetVocabulary: [first.baseWord, first.derivedWord], soundOutChunks: first.readingChunks.map((chunk) => chunk.displayText), tags: tags('suffix-identification'),
      }),
      ...suffixChoices,
    }),
    multipleChoice({
      ...questionBase(config, 1, {
        prompt: `Which split shows the base word and suffix in ${second.derivedWord}?`,
        explanation: `${morphology(second)} separates the base ${second.baseWord} from ${suffixLabel(second)}.`,
        evidenceReferenceIds: [second.sentenceId], targetVocabulary: [second.baseWord, second.derivedWord], soundOutChunks: second.readingChunks.map((chunk) => chunk.displayText), tags: tags('base-suffix-segmentation'),
      }),
      ...splitChoices,
    }),
    multiselect({
      ...questionBase(config, 2, {
        prompt: `Choose two derived words that work as ${config.sharedRole}s in this passage.`,
        explanation: artifact.targets.filter((target) => target.derivedWordRole === config.sharedRole).map((target) => target.derivedWord).join(' and ') + ` work as ${config.sharedRole}s in their source sentences.`,
        evidenceReferenceIds: artifact.targets.filter((target) => target.derivedWordRole === config.sharedRole).map((target) => target.sentenceId), targetVocabulary: artifact.targets.map((target) => target.derivedWord), soundOutChunks: [], tags: tags('word-function-analysis'),
      }),
      choices: roleChoices,
      correctChoiceIds: roleCorrectIds,
    }),
    hotText({
      ...questionBase(config, 3, {
        prompt: `Select the suffix in ${fourth.derivedWord}.`,
        explanation: `${suffixLabel(fourth)} is the suffix attached to ${fourth.baseWord}.`,
        evidenceReferenceIds: [fourth.sentenceId], targetVocabulary: [fourth.derivedWord], soundOutChunks: fourth.readingChunks.map((chunk) => chunk.displayText), tags: tags('suffix-pattern-highlight'),
      }),
      segments: hotSegments,
      correctSegmentIds: [hotSegments[1].id],
    }),
    tableMatch({
      ...questionBase(config, 4, {
        prompt: 'Match each derived word to the suffix added to its base word.',
        explanation: 'Each row matches the complete derived word to its transparent ending suffix.',
        evidenceReferenceIds: artifact.targets.map((target) => target.sentenceId), targetVocabulary: artifact.targets.map((target) => target.derivedWord), soundOutChunks: [], tags: tags('suffix-identification', 'word-family-decoding'),
      }),
      rows: artifact.targets.map((target, index) => ({
        id: `${config.questionIds[4]}-row-${index + 1}`,
        prompt: target.derivedWord,
        correctChoiceId: suffixOptions.find((option) => option.text === suffixLabel(target))?.id ?? suffixOptions[0].id,
        options: suffixOptions.map((option) => ({ ...option })),
      })),
    }),
  ]
}

function buildCheckpointQuestions(config: CheckpointConfig): ReadingQuestion[] {
  const artifact = getSuffixShifterArtifact(config.passageId)
  const [first, second, third, fourth] = artifact.targets
  const suffixChoices = makeChoiceSet(config.questionIds[0], suffixLabel(first), SUFFIX_LABELS, 1)
  const pairText = (target: DerivationalSuffixTarget) => `${target.baseWord} + ${suffixLabel(target)} -> ${target.derivedWord}`
  const pairChoices = makeChoiceSet(config.questionIds[1], pairText(second), artifact.targets.filter((target) => target !== second).map(pairText), 2)
  const roleChoices = (Object.keys(roleLabel) as DerivationalWordRole[]).map((role, index) => choice(`${config.questionIds[2]}-choice-${index + 1}`, roleLabel[role]))
  const multiChoices = artifact.targets.map((target, index) => choice(`${config.questionIds[3]}-choice-${index + 1}`, target.derivedWord))
  const multiTargets = artifact.targets.filter((target) => config.multiselect.kind === 'role'
    ? target.derivedWordRole === config.multiselect.role
    : target.suffix === config.multiselect.suffix)
  if (multiTargets.length !== 2) throw new Error(`${config.lessonId} requires exactly two multiselect targets.`)
  const multiCorrectIds = multiChoices.filter((_, index) => multiTargets.includes(artifact.targets[index])).map((item) => item.id)
  const hotSegments = fourth.morphologicalChunks.map((chunk, index) => choice(`${config.questionIds[4]}-segment-${index + 1}`, chunk.text))
  const transformationLabels = [...new Set(artifact.targets.map((target) => `${target.baseWordRole} -> ${target.derivedWordRole}`))]
  const transformationOptions = transformationLabels.map((text, index) => choice(`${config.questionIds[5]}-role-${index + 1}`, text))
  const analysisTarget = artifact.targets.find((target) => reading(target) !== morphology(target))
  if (!analysisTarget) throw new Error(`${config.lessonId} requires a target with distinct meaningful and reading boundaries.`)
  const partA = makeChoiceSet(`${config.questionIds[6]}-a`, morphology(analysisTarget), boundaryDistractors(analysisTarget), 1)
  const partB = makeChoiceSet(
    `${config.questionIds[6]}-b`,
    reading(analysisTarget),
    [morphology(analysisTarget), analysisTarget.derivedWord, `${analysisTarget.derivedWord.slice(0, 1)} | ${analysisTarget.derivedWord.slice(1)}`],
    2,
  )

  return [
    multipleChoice({
      ...questionBase(config, 0, {
        prompt: `Which suffix helps you analyze and read ${first.derivedWord}?`,
        explanation: `${suffixLabel(first)} is the ending attached to ${first.baseWord}.`,
        evidenceReferenceIds: [first.sentenceId], targetVocabulary: [first.derivedWord], soundOutChunks: first.readingChunks.map((chunk) => chunk.displayText), tags: tags('suffix-identification'),
      }),
      ...suffixChoices,
    }),
    multipleChoice({
      ...questionBase(config, 1, {
        prompt: `Which word-building pair correctly forms ${second.derivedWord}?`,
        explanation: `${second.baseWord} plus ${suffixLabel(second)} forms ${second.derivedWord} without a spelling change.`,
        evidenceReferenceIds: [second.sentenceId], targetVocabulary: [second.baseWord, second.derivedWord], soundOutChunks: second.readingChunks.map((chunk) => chunk.displayText), tags: tags('base-suffix-segmentation'),
      }),
      ...pairChoices,
    }),
    multipleChoice({
      ...questionBase(config, 2, {
        prompt: `In its passage sentence, what job does ${third.derivedWord} do?`,
        explanation: `${third.derivedWord} works as ${third.derivedWordRole === 'adjective' ? 'an' : 'a'} ${third.derivedWordRole} in this sentence. ${third.transformationExplanation}`,
        evidenceReferenceIds: [third.sentenceId], targetVocabulary: [third.derivedWord], soundOutChunks: third.readingChunks.map((chunk) => chunk.displayText), tags: tags('word-function-analysis', 'part-of-speech-change'),
      }),
      choices: roleChoices,
      correctChoiceId: roleChoices.find((item) => item.text === roleLabel[third.derivedWordRole])?.id ?? roleChoices[0].id,
    }),
    multiselect({
      ...questionBase(config, 3, {
        prompt: config.multiselect.kind === 'role'
          ? `Choose two words that work as ${config.multiselect.role}s in this passage.`
          : `Choose two words that use the suffix -${config.multiselect.suffix}.`,
        explanation: config.multiselect.kind === 'role'
          ? `${multiTargets.map((target) => target.derivedWord).join(' and ')} work as ${config.multiselect.role}s in their passage sentences.`
          : `${multiTargets.map((target) => target.derivedWord).join(' and ')} both end with -${config.multiselect.suffix}.`,
        evidenceReferenceIds: multiTargets.map((target) => target.sentenceId), targetVocabulary: multiTargets.map((target) => target.derivedWord), soundOutChunks: [], tags: tags('word-function-analysis', 'word-family-decoding'),
      }),
      choices: multiChoices,
      correctChoiceIds: multiCorrectIds,
    }),
    hotText({
      ...questionBase(config, 4, {
        prompt: `Select the suffix in ${fourth.derivedWord}.`,
        explanation: `${suffixLabel(fourth)} is attached after the base word ${fourth.baseWord}.`,
        evidenceReferenceIds: [fourth.sentenceId], targetVocabulary: [fourth.derivedWord], soundOutChunks: fourth.readingChunks.map((chunk) => chunk.displayText), tags: tags('suffix-pattern-highlight'),
      }),
      segments: hotSegments,
      correctSegmentIds: [hotSegments[1].id],
    }),
    tableMatch({
      ...questionBase(config, 5, {
        prompt: 'Match each word to the part-of-speech change shown in this passage.',
        explanation: 'Each row uses the role of the transparent base and the role of the derived word in its source sentence.',
        evidenceReferenceIds: artifact.targets.map((target) => target.sentenceId), targetVocabulary: artifact.targets.map((target) => target.derivedWord), soundOutChunks: [], tags: tags('part-of-speech-change', 'word-function-analysis'),
      }),
      rows: artifact.targets.map((target, index) => ({
        id: `${config.questionIds[5]}-row-${index + 1}`,
        prompt: target.derivedWord,
        correctChoiceId: transformationOptions.find((option) => option.text === `${target.baseWordRole} -> ${target.derivedWordRole}`)?.id ?? transformationOptions[0].id,
        options: transformationOptions.map((option) => ({ ...option })),
      })),
    }),
    twoPart({
      ...questionBase(config, 6, {
        prompt: `Compare the meaningful parts and reading chunks in ${analysisTarget.derivedWord}.`,
        explanation: `${morphology(analysisTarget)} shows the meaningful base and suffix. ${reading(analysisTarget)} shows pronounceable reading chunks. The boundaries differ because the two analyses have different jobs.`,
        evidenceReferenceIds: [analysisTarget.sentenceId], targetVocabulary: [analysisTarget.baseWord, analysisTarget.derivedWord], soundOutChunks: analysisTarget.readingChunks.map((chunk) => chunk.displayText), tags: tags('morphological-segmentation', 'root-affix-vs-syllable-distinction', 'reading-chunk-decoding'),
      }),
      partAPrompt: 'Which split shows the base word and suffix?',
      partAChoices: partA.choices,
      partACorrectChoiceId: partA.correctChoiceId,
      partBPrompt: 'Which reading chunks help decode the complete word?',
      partBChoices: partB.choices,
      partBCorrectChoiceId: partB.correctChoiceId,
    }),
  ]
}

export const suffixShifterQuestions: ReadingQuestion[] = [
  ...buildGuidedQuestions({ lessonId: suffixShifterLessonIds.powerUpNames, passageId: suffixShifterPassageIds.workshopTeam, questionIds: suffixShifterQuestionIds.powerUpNames, difficulty: 1, sharedRole: 'noun' }),
  ...buildGuidedQuestions({ lessonId: suffixShifterLessonIds.powerUpDescriptions, passageId: suffixShifterPassageIds.natureCenter, questionIds: suffixShifterQuestionIds.powerUpDescriptions, difficulty: 1, sharedRole: 'adjective' }),
  ...buildGuidedQuestions({ lessonId: suffixShifterLessonIds.labWordJobs, passageId: suffixShifterPassageIds.artProject, questionIds: suffixShifterQuestionIds.labWordJobs, difficulty: 2, sharedRole: 'noun' }),
  ...buildGuidedQuestions({ lessonId: suffixShifterLessonIds.labSentenceFit, passageId: suffixShifterPassageIds.schoolNewsroom, questionIds: suffixShifterQuestionIds.labSentenceFit, difficulty: 2, sharedRole: 'noun' }),
  ...buildCheckpointQuestions({ lessonId: suffixShifterLessonIds.checkpointMaker, passageId: suffixShifterPassageIds.makerShowcase, questionIds: suffixShifterQuestionIds.checkpointMaker, difficulty: 2, multiselect: { kind: 'role', role: 'adjective' } }),
  ...buildCheckpointQuestions({ lessonId: suffixShifterLessonIds.checkpointNature, passageId: suffixShifterPassageIds.natureNight, questionIds: suffixShifterQuestionIds.checkpointNature, difficulty: 2, multiselect: { kind: 'role', role: 'adjective' } }),
  ...buildCheckpointQuestions({ lessonId: suffixShifterLessonIds.checkpointWeather, passageId: suffixShifterPassageIds.weatherGarden, questionIds: suffixShifterQuestionIds.checkpointWeather, difficulty: 2, multiselect: { kind: 'suffix', suffix: 'y' } }),
]
