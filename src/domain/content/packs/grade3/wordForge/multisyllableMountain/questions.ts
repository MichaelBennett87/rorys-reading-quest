import type {
  HotTextQuestionData,
  LessonChoice,
  MultipleChoiceQuestionData,
  MultiselectQuestionData,
  ReadingQuestion,
  TableMatchQuestionData,
  TwoPartQuestionData,
} from '../../../../types'
import type { MultisyllableDecodingTarget, MultisyllablePatternLabel } from '../../../contentPackTypes'
import {
  multisyllableMountainContentVersion,
  multisyllableMountainLessonIds,
  multisyllableMountainPassageIds,
  multisyllableMountainQuestionIds,
  multisyllableMountainSkillId,
} from './ids'
import { getMultisyllableMountainArtifact } from './multisyllableDecodingGuides'

const COMMON_TAGS = [
  'multisyllabic-decoding',
  'full-word-chunking',
  'flexible-syllable-chunking',
  'sentence-context-confirmation',
  'grade-3-word-help',
] as const

const patternLabel: Record<MultisyllablePatternLabel, string> = {
  closed: 'closed syllable',
  open: 'open syllable',
  'vowel-consonant-e': 'silent-e syllable',
  'vowel-team': 'vowel-team syllable',
  'r-controlled': 'r-controlled syllable',
  'consonant-le': 'consonant-le ending',
}

interface QuestionBase {
  questionIdentifier: string
  lessonIdentifier: string
  passageIdentifier: string
  difficulty: 2 | 3
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
  difficulty: 2 | 3
  multiPattern: MultisyllablePatternLabel
}

interface CheckpointConfig extends Omit<LessonConfig, 'multiPattern'> {
  contrast: [number, number, number, number]
  transferTargetIndex: number
  transferPrompt: string
  consonantLeTargetIndex: number
  hotTargetIndex: number
  analysisTargetIndex: number
  multiselectKind: 'any-hint' | 'compound-part'
}

function base(spec: QuestionBase) {
  return {
    gradeBand: 3 as const,
    benchmarkReference: 'ELA.3.F.1.3',
    skillIdentifier: multisyllableMountainSkillId,
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
    contentVersion: multisyllableMountainContentVersion,
    tags: [...spec.tags],
  }
}

const choice = (id: string, text: string): LessonChoice => ({ id, text })

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

function reading(target: MultisyllableDecodingTarget): string {
  return target.pronunciationChunks.map((chunk) => chunk.displayText).join(' | ')
}

function morphology(target: MultisyllableDecodingTarget): string {
  return target.morphologicalHints.map((entry) => entry.text).join(' | ')
}

function makeChoiceSet(questionId: string, correctText: string, distractors: readonly string[], correctIndex: number) {
  const unique = [...new Set(distractors.filter((text) => text !== correctText))]
  if (unique.length < 3) throw new Error(`Question ${questionId} needs three unique distractors.`)
  const texts = unique.slice(0, 3)
  texts.splice(correctIndex, 0, correctText)
  const choices = texts.map((text, index) => choice(`${questionId}-choice-${index + 1}`, text))
  return { choices, correctChoiceId: choices[correctIndex].id }
}

function splitDistractors(target: MultisyllableDecodingTarget): string[] {
  const word = target.surfaceWord
  return [word, `${word.slice(0, 1)} | ${word.slice(1)}`, `${word.slice(0, -1)} | ${word.slice(-1)}`]
}

function buildGuidedQuestions(config: LessonConfig): ReadingQuestion[] {
  const artifact = getMultisyllableMountainArtifact(config.passageId)
  const [first, second, , fourth] = artifact.targets
  const splitChoices = makeChoiceSet(config.questionIds[0], reading(first), splitDistractors(first), 1)
  const focusIndex = artifact.passage.wordSupportTargets?.find((support) => support.targetId === second.targetId)?.focusParts.findIndex((part) => part.emphasis) ?? 0
  const focusChunk = second.pronunciationChunks[focusIndex]
  const focusPattern = second.syllablePatterns[focusIndex]
  const patternChoices = makeChoiceSet(config.questionIds[1], patternLabel[focusPattern], Object.values(patternLabel), 2)
  const multiChoices = artifact.targets.map((target, index) => choice(`${config.questionIds[2]}-choice-${index + 1}`, target.surfaceWord))
  const multiCorrectIds = multiChoices.filter((_, index) => artifact.targets[index].syllablePatterns.includes(config.multiPattern)).map((item) => item.id)
  if (multiCorrectIds.length !== 2) throw new Error(`${config.lessonId} requires exactly two ${config.multiPattern} targets.`)
  const fourthSupport = artifact.passage.wordSupportTargets?.find((support) => support.targetId === fourth.targetId)
  const fourthFocus = fourthSupport?.focusParts.findIndex((part) => part.emphasis) ?? 0
  const fourthPattern = fourth.syllablePatterns[fourthFocus]
  const samePatternCount = fourth.syllablePatterns.filter((pattern) => pattern === fourthPattern).length
  const prefixHint = fourth.morphologicalHints.find((entry) => entry.kind === 'prefix' && entry.text === fourth.pronunciationChunks[fourthFocus].displayText)
  const hotPrompt = prefixHint
    ? `Select the prefix chunk in ${fourth.surfaceWord}.`
    : samePatternCount === 1
      ? `Select the ${patternLabel[fourthPattern]} in ${fourth.surfaceWord}.`
      : `Select the first reading chunk in ${fourth.surfaceWord}.`
  const hotSegments = fourth.pronunciationChunks.map((chunk, index) => choice(`${config.questionIds[3]}-segment-${index + 1}`, chunk.displayText))
  const readingOptions = artifact.targets.map((target, index) => choice(`${config.questionIds[4]}-reading-${index + 1}`, reading(target)))

  return [
    multipleChoice({
      ...questionBase(config, 0, {
        prompt: `Which set of reading chunks helps decode ${first.surfaceWord}?`,
        explanation: `${reading(first)} separates ${first.surfaceWord} into pronounceable chunks that rebuild the complete word.`,
        evidenceReferenceIds: [first.sourceSentenceId], targetVocabulary: [first.surfaceWord], soundOutChunks: first.pronunciationChunks.map((chunk) => chunk.displayText), tags: tags('syllable-segmentation'),
      }),
      ...splitChoices,
    }),
    multipleChoice({
      ...questionBase(config, 1, {
        prompt: `Which syllable pattern describes the chunk ${focusChunk.displayText} in ${second.surfaceWord}?`,
        explanation: `${focusChunk.displayText} is a ${patternLabel[focusPattern]} in ${second.surfaceWord}.`,
        evidenceReferenceIds: [second.sourceSentenceId], targetVocabulary: [second.surfaceWord], soundOutChunks: second.pronunciationChunks.map((chunk) => chunk.displayText), tags: tags(`${focusPattern}-decoding`),
      }),
      ...patternChoices,
    }),
    multiselect({
      ...questionBase(config, 2, {
        prompt: `Choose two words that contain an ${patternLabel[config.multiPattern]}.`,
        explanation: artifact.targets.filter((target) => target.syllablePatterns.includes(config.multiPattern)).map((target) => target.surfaceWord).join(' and ') + ` each contain an ${patternLabel[config.multiPattern]}.`,
        evidenceReferenceIds: artifact.targets.filter((target) => target.syllablePatterns.includes(config.multiPattern)).map((target) => target.sourceSentenceId), targetVocabulary: artifact.targets.map((target) => target.surfaceWord), soundOutChunks: [], tags: tags(`${config.multiPattern}-decoding`),
      }),
      choices: multiChoices,
      correctChoiceIds: multiCorrectIds,
    }),
    hotText({
      ...questionBase(config, 3, {
        prompt: hotPrompt,
        explanation: `${fourth.pronunciationChunks[fourthFocus].displayText} is the requested chunk in ${reading(fourth)}.`,
        evidenceReferenceIds: [fourth.sourceSentenceId], targetVocabulary: [fourth.surfaceWord], soundOutChunks: fourth.pronunciationChunks.map((chunk) => chunk.displayText), tags: tags('syllable-pattern-highlight'),
      }),
      segments: hotSegments,
      correctSegmentIds: [hotSegments[fourthFocus].id],
    }),
    tableMatch({
      ...questionBase(config, 4, {
        prompt: 'Match each passage word to the reading chunks that rebuild it.',
        explanation: 'Each row matches a complete word with the authored pronounceable chunks that reconstruct its spelling.',
        evidenceReferenceIds: artifact.targets.map((target) => target.sourceSentenceId), targetVocabulary: artifact.targets.map((target) => target.surfaceWord), soundOutChunks: [], tags: tags('syllable-segmentation'),
      }),
      rows: artifact.targets.map((target, index) => ({
        id: `${config.questionIds[4]}-row-${index + 1}`,
        prompt: target.surfaceWord,
        correctChoiceId: readingOptions.find((option) => option.text === reading(target))?.id ?? readingOptions[0].id,
        options: readingOptions.map((option) => ({ ...option })),
      })),
    }),
  ]
}

function buildCheckpointQuestions(config: CheckpointConfig): ReadingQuestion[] {
  const artifact = getMultisyllableMountainArtifact(config.passageId)
  const [firstTarget, firstChunk, secondTarget, secondChunk] = config.contrast
  const left = artifact.targets[firstTarget]
  const right = artifact.targets[secondTarget]
  const leftText = left.pronunciationChunks[firstChunk].displayText
  const rightText = right.pronunciationChunks[secondChunk].displayText
  const leftPattern = left.syllablePatterns[firstChunk]
  const rightPattern = right.syllablePatterns[secondChunk]
  const contrastCorrect = `${leftText} is open; ${rightText} is closed.`
  if (leftPattern !== 'open' || rightPattern !== 'closed') throw new Error(`${config.lessonId} requires an open/closed contrast.`)
  const contrastChoices = makeChoiceSet(config.questionIds[0], contrastCorrect, [
    `${leftText} is closed; ${rightText} is open.`,
    `${leftText} and ${rightText} are both open.`,
    `${leftText} and ${rightText} are both closed.`,
  ], 1)
  const transferTarget = artifact.targets[config.transferTargetIndex]
  const transferChoices = makeChoiceSet(config.questionIds[1], transferTarget.surfaceWord, artifact.targets.filter((target) => target !== transferTarget).map((target) => target.surfaceWord), 2)
  const consonantLeTarget = artifact.targets[config.consonantLeTargetIndex]
  const consonantLeChoices = makeChoiceSet(config.questionIds[2], consonantLeTarget.surfaceWord, artifact.targets.filter((target) => target !== consonantLeTarget).map((target) => target.surfaceWord), 1)
  if (!consonantLeTarget.syllablePatterns.includes('consonant-le')) throw new Error(`${config.lessonId} requires a consonant-le transfer target.`)
  const multiTargets = artifact.targets.filter((target) => config.multiselectKind === 'compound-part'
    ? target.morphologicalHints.some((entry) => entry.kind === 'compound-part')
    : target.morphologicalHints.length > 0)
  if (multiTargets.length !== 2) throw new Error(`${config.lessonId} requires exactly two morphology-assisted targets.`)
  const multiChoices = artifact.targets.map((target, index) => choice(`${config.questionIds[3]}-choice-${index + 1}`, target.surfaceWord))
  const multiCorrectIds = multiChoices.filter((_, index) => multiTargets.includes(artifact.targets[index])).map((item) => item.id)
  const focusTarget = artifact.targets[config.hotTargetIndex]
  const focusSupport = artifact.passage.wordSupportTargets?.find((support) => support.targetId === focusTarget.targetId)
  const focusIndex = focusSupport?.focusParts.findIndex((part) => part.emphasis) ?? 0
  const prefixHint = focusTarget.morphologicalHints.find((entry) => entry.kind === 'prefix' && entry.text === focusTarget.pronunciationChunks[focusIndex].displayText)
  if (!prefixHint) throw new Error(`${config.lessonId} requires a prefix-focused hot-text target.`)
  const hotSegments = focusTarget.pronunciationChunks.map((chunk, index) => choice(`${config.questionIds[4]}-segment-${index + 1}`, chunk.displayText))
  const readingOptions = artifact.targets.map((target, index) => choice(`${config.questionIds[5]}-reading-${index + 1}`, reading(target)))
  const analysisTarget = artifact.targets[config.analysisTargetIndex]
  const morphologyText = morphology(analysisTarget)
  if (!morphologyText || morphologyText === reading(analysisTarget)) throw new Error(`${config.lessonId} requires distinct meaningful and reading boundaries.`)
  const partA = makeChoiceSet(`${config.questionIds[6]}-a`, morphologyText, [reading(analysisTarget), analysisTarget.surfaceWord, `${analysisTarget.surfaceWord.slice(0, 1)} | ${analysisTarget.surfaceWord.slice(1)}`], 1)
  const partB = makeChoiceSet(`${config.questionIds[6]}-b`, reading(analysisTarget), [morphologyText, analysisTarget.surfaceWord, `${analysisTarget.surfaceWord.slice(0, -1)} | ${analysisTarget.surfaceWord.slice(-1)}`], 2)

  return [
    multipleChoice({
      ...questionBase(config, 0, {
        prompt: `Which statement correctly contrasts the chunks ${leftText} and ${rightText}?`,
        explanation: `${leftText} ends with a vowel sound, so it is open. ${rightText} closes with a consonant sound after its vowel.`,
        evidenceReferenceIds: [left.sourceSentenceId, right.sourceSentenceId], targetVocabulary: [left.surfaceWord, right.surfaceWord], soundOutChunks: [leftText, rightText], tags: tags('open-closed-contrast', 'open-syllable-decoding', 'closed-syllable-decoding'),
      }),
      ...contrastChoices,
    }),
    multipleChoice({
      ...questionBase(config, 1, {
        prompt: config.transferPrompt,
        explanation: `${transferTarget.surfaceWord} uses ${reading(transferTarget)}, including the matching vowel-pattern clue.`,
        evidenceReferenceIds: [transferTarget.sourceSentenceId], targetVocabulary: [transferTarget.surfaceWord], soundOutChunks: transferTarget.pronunciationChunks.map((chunk) => chunk.displayText), tags: tags('vowel-team-or-vce-transfer', 'transfer-decoding'),
      }),
      ...transferChoices,
    }),
    multipleChoice({
      ...questionBase(config, 2, {
        prompt: 'The word puzzle ends with the consonant-le chunk zle. Which passage word also ends with a consonant-le chunk?',
        explanation: `${consonantLeTarget.surfaceWord} ends with ${consonantLeTarget.pronunciationChunks.at(-1)?.displayText}, a consonant-le chunk.`,
        evidenceReferenceIds: [consonantLeTarget.sourceSentenceId], targetVocabulary: [consonantLeTarget.surfaceWord], soundOutChunks: consonantLeTarget.pronunciationChunks.map((chunk) => chunk.displayText), tags: tags('r-controlled-or-consonant-le-transfer', 'consonant-le-syllable-decoding', 'transfer-decoding'),
      }),
      ...consonantLeChoices,
    }),
    multiselect({
      ...questionBase(config, 3, {
        prompt: config.multiselectKind === 'compound-part'
          ? 'Choose two words that use a compound-word boundary as a decoding clue.'
          : 'Choose two words with a useful prefix or compound boundary that helps decoding.',
        explanation: `${multiTargets.map((target) => target.surfaceWord).join(' and ')} each provide an authored meaningful boundary that supports reading the longer word.`,
        evidenceReferenceIds: multiTargets.map((target) => target.sourceSentenceId), targetVocabulary: multiTargets.map((target) => target.surfaceWord), soundOutChunks: [], tags: tags('morphology-assisted-decoding', 'compound-boundary-decoding', 'prefix-boundary-decoding'),
      }),
      choices: multiChoices,
      correctChoiceIds: multiCorrectIds,
    }),
    hotText({
      ...questionBase(config, 4, {
        prompt: `Select the prefix chunk at the beginning of ${focusTarget.surfaceWord}.`,
        explanation: `${focusTarget.pronunciationChunks[focusIndex].displayText} is the prefix chunk; the remaining chunks complete ${focusTarget.surfaceWord}.`,
        evidenceReferenceIds: [focusTarget.sourceSentenceId], targetVocabulary: [focusTarget.surfaceWord], soundOutChunks: focusTarget.pronunciationChunks.map((chunk) => chunk.displayText), tags: tags('full-word-chunking', 'syllable-pattern-highlight'),
      }),
      segments: hotSegments,
      correctSegmentIds: [hotSegments[focusIndex].id],
    }),
    tableMatch({
      ...questionBase(config, 5, {
        prompt: 'Match each complete word to the reading chunks that rebuild it.',
        explanation: 'Each mapping preserves every letter while separating the word into authored pronunciation chunks.',
        evidenceReferenceIds: artifact.targets.map((target) => target.sourceSentenceId), targetVocabulary: artifact.targets.map((target) => target.surfaceWord), soundOutChunks: [], tags: tags('full-word-chunking', 'syllable-segmentation'),
      }),
      rows: artifact.targets.map((target, index) => ({
        id: `${config.questionIds[5]}-row-${index + 1}`,
        prompt: target.surfaceWord,
        correctChoiceId: readingOptions.find((option) => option.text === reading(target))?.id ?? readingOptions[0].id,
        options: readingOptions.map((option) => ({ ...option })),
      })),
    }),
    twoPart({
      ...questionBase(config, 6, {
        prompt: `Compare the meaningful parts and reading chunks in ${analysisTarget.surfaceWord}.`,
        explanation: `${morphologyText} shows helpful meaningful parts. ${reading(analysisTarget)} shows pronounceable chunks. The boundaries differ because meaning analysis and reading analysis have different jobs.`,
        evidenceReferenceIds: [analysisTarget.sourceSentenceId], targetVocabulary: [analysisTarget.surfaceWord], soundOutChunks: analysisTarget.pronunciationChunks.map((chunk) => chunk.displayText), tags: tags('morphology-vs-reading-chunks', 'morphology-assisted-decoding', 'full-word-chunking'),
      }),
      partAPrompt: 'Which split shows the helpful meaningful parts?',
      partAChoices: partA.choices,
      partACorrectChoiceId: partA.correctChoiceId,
      partBPrompt: 'Which split shows the authored reading chunks?',
      partBChoices: partB.choices,
      partBCorrectChoiceId: partB.correctChoiceId,
    }),
  ]
}

export const multisyllableMountainQuestions: ReadingQuestion[] = [
  ...buildGuidedQuestions({ lessonId: multisyllableMountainLessonIds.powerUpCompounds, passageId: multisyllableMountainPassageIds.trailStation, questionIds: multisyllableMountainQuestionIds.powerUpCompounds, difficulty: 2, multiPattern: 'vowel-consonant-e' }),
  ...buildGuidedQuestions({ lessonId: multisyllableMountainLessonIds.powerUpVowels, passageId: multisyllableMountainPassageIds.weatherTrip, questionIds: multisyllableMountainQuestionIds.powerUpVowels, difficulty: 2, multiPattern: 'r-controlled' }),
  ...buildGuidedQuestions({ lessonId: multisyllableMountainLessonIds.labGarden, passageId: multisyllableMountainPassageIds.gardenProject, questionIds: multisyllableMountainQuestionIds.labGarden, difficulty: 3, multiPattern: 'open' }),
  ...buildGuidedQuestions({ lessonId: multisyllableMountainLessonIds.labWildlife, passageId: multisyllableMountainPassageIds.wildlifeCenter, questionIds: multisyllableMountainQuestionIds.labWildlife, difficulty: 3, multiPattern: 'open' }),
  ...buildCheckpointQuestions({ lessonId: multisyllableMountainLessonIds.checkpointMuseum, passageId: multisyllableMountainPassageIds.museumExpedition, questionIds: multisyllableMountainQuestionIds.checkpointMuseum, difficulty: 3, contrast: [0, 0, 3, 0], transferTargetIndex: 1, transferPrompt: 'The word bedtime contains the silent-e chunk time. Which passage word contains two silent-e chunks?', consonantLeTargetIndex: 2, hotTargetIndex: 3, analysisTargetIndex: 3, multiselectKind: 'any-hint' }),
  ...buildCheckpointQuestions({ lessonId: multisyllableMountainLessonIds.checkpointEngineering, passageId: multisyllableMountainPassageIds.engineeringChallenge, questionIds: multisyllableMountainQuestionIds.checkpointEngineering, difficulty: 3, contrast: [0, 0, 3, 0], transferTargetIndex: 0, transferPrompt: 'The word sunshine ends with the silent-e chunk shine. Which passage word also ends with a silent-e chunk?', consonantLeTargetIndex: 1, hotTargetIndex: 2, analysisTargetIndex: 1, multiselectKind: 'any-hint' }),
  ...buildCheckpointQuestions({ lessonId: multisyllableMountainLessonIds.checkpointAdventure, passageId: multisyllableMountainPassageIds.adventureClub, questionIds: multisyllableMountainQuestionIds.checkpointAdventure, difficulty: 3, contrast: [3, 0, 1, 0], transferTargetIndex: 0, transferPrompt: 'The word raincoat begins with the vowel-team chunk rain. Which passage word also begins with a vowel-team chunk?', consonantLeTargetIndex: 3, hotTargetIndex: 2, analysisTargetIndex: 0, multiselectKind: 'compound-part' }),
]
