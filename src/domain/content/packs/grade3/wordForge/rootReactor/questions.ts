import type { LessonChoice, ReadingQuestion } from '../../../../types'
import type { RootDecodingTarget } from '../../../contentPackTypes'
import {
  rootReactorLessonIds,
  rootReactorPassageIds,
  rootReactorQuestionIds,
} from './ids'
import { getRootReactorArtifact, rootReactorTargets } from './rootDecodingGuides'
import {
  makeRootHotText,
  makeRootMultipleChoice,
  makeRootMultiselect,
  makeRootTableMatch,
  makeRootTwoPart,
  rootChoice,
  type RootQuestionBase,
} from './questionFactories'

const COMMON_TAGS = [
  'greek-latin-root-decoding',
  'affix-decoding',
  'classical-part-identification',
  'visual-word-blending',
  'connected-text-decoding',
  'grade-3-word-help',
] as const

interface LessonQuestionConfig {
  lessonId: string
  passageId: string
  questionIds: readonly string[]
  difficulty: 0 | 1
}

interface CheckpointConfig extends LessonQuestionConfig {
  rootTargetWord: string
  affixTargetWord: string
  contextTargetWord: string
  distinctionTargetWord: string
  familyLabel: string
  familyWords: [string, string]
}

function targetByWord(word: string): RootDecodingTarget {
  const found = rootReactorTargets.find((target) => target.surfaceWord === word)
  if (!found) throw new Error(`Unknown Root Reactor target: ${word}`)
  return found
}

function baseSpec(
  config: LessonQuestionConfig,
  questionIndex: number,
  values: Omit<RootQuestionBase, 'questionIdentifier' | 'lessonIdentifier' | 'passageIdentifier' | 'difficulty'>,
): RootQuestionBase {
  return {
    questionIdentifier: config.questionIds[questionIndex],
    lessonIdentifier: config.lessonId,
    passageIdentifier: config.passageId,
    difficulty: config.difficulty,
    ...values,
  }
}

function choiceSet(questionId: string, correctText: string, distractors: string[], correctIndex: number): { choices: LessonChoice[]; correctChoiceId: string } {
  const unique = [...new Set(distractors.filter((text) => text !== correctText))].slice(0, 3)
  if (unique.length < 3) throw new Error(`Question ${questionId} needs three meaningful, unique distractors.`)
  const texts = [...unique]
  texts.splice(correctIndex, 0, correctText)
  const choices = texts.map((text, index) => rootChoice(`${questionId}-choice-${index + 1}`, text))
  return { choices, correctChoiceId: choices[correctIndex].id }
}

function split(target: RootDecodingTarget, kind: 'morphology' | 'syllable'): string {
  return kind === 'morphology'
    ? target.morphologicalChunks.map((chunk) => chunk.text).join(' | ')
    : target.syllableChunks.map((chunk) => chunk.displayText).join(' | ')
}

function tags(...values: string[]): string[] {
  return [...COMMON_TAGS, ...values]
}

function buildGuidedQuestions(config: LessonQuestionConfig): ReadingQuestion[] {
  const artifact = getRootReactorArtifact(config.passageId)
  const [first, second, third, fourth] = artifact.targets
  const q0 = config.questionIds[0]
  const q1 = config.questionIds[1]
  const partChoices = choiceSet(q0, first.primaryPart.displayLabel, artifact.targets.slice(1).map((target) => target.primaryPart.displayLabel), 1)
  const syllableChoices = choiceSet(q1, split(second, 'syllable'), [split(second, 'morphology'), second.surfaceWord, `${second.surfaceWord[0]} | ${second.surfaceWord.slice(1)}`], 2)
  const chunkTexts = third.syllableChunks.slice(0, 2).map((chunk) => chunk.displayText)
  const chunkChoices = [
    rootChoice(`${config.questionIds[2]}-choice-1`, chunkTexts[0]),
    rootChoice(`${config.questionIds[2]}-choice-2`, first.surfaceWord),
    rootChoice(`${config.questionIds[2]}-choice-3`, chunkTexts[1]),
    rootChoice(`${config.questionIds[2]}-choice-4`, fourth.surfaceWord),
  ]
  const chunkCorrectIds = [chunkChoices[0].id, chunkChoices[2].id]
  const hotSegments = fourth.morphologicalChunks.map((chunk, index) => rootChoice(`${config.questionIds[3]}-segment-${index + 1}`, chunk.text))
  const hotCorrect = hotSegments.filter((_, index) => fourth.morphologicalChunks[index].partId === fourth.primaryPart.partId).map((segment) => segment.id)
  const primaryOptions = artifact.targets.map((target, index) => rootChoice(`${config.questionIds[4]}-part-${index + 1}`, target.primaryPart.displayLabel))

  return [
    makeRootMultipleChoice({
      ...baseSpec(config, 0, {
        prompt: `Which useful part helps you begin reading ${first.surfaceWord}?`,
        explanation: `${first.primaryPart.displayLabel} is the useful classical part in ${first.surfaceWord}.`,
        evidenceReferenceIds: [first.sentenceId], targetVocabulary: [first.surfaceWord], soundOutChunks: first.syllableChunks.map((chunk) => chunk.displayText),
        tags: tags(first.primaryPart.kind === 'prefix' ? 'classical-prefix-decoding' : first.primaryPart.origin === 'Greek' ? 'greek-root-decoding' : 'latin-root-decoding', 'root-pattern-highlight'),
      }),
      ...partChoices,
    }),
    makeRootMultipleChoice({
      ...baseSpec(config, 1, {
        prompt: `Which set of reading chunks can help you read ${second.surfaceWord}?`,
        explanation: `${split(second, 'syllable')} gives pronounceable chunks that rebuild ${second.surfaceWord}.`,
        evidenceReferenceIds: [second.sentenceId], targetVocabulary: [second.surfaceWord], soundOutChunks: second.syllableChunks.map((chunk) => chunk.displayText),
        tags: tags('syllable-segmentation', 'root-affix-vs-syllable-distinction'),
      }),
      ...syllableChoices,
    }),
    makeRootMultiselect({
      ...baseSpec(config, 2, {
        prompt: `Choose two reading chunks shown for ${third.surfaceWord}.`,
        explanation: `${chunkTexts.join(' and ')} are two authored reading chunks in ${third.surfaceWord}.`,
        evidenceReferenceIds: [third.sentenceId], targetVocabulary: [third.surfaceWord], soundOutChunks: third.syllableChunks.map((chunk) => chunk.displayText),
        tags: tags('syllable-segmentation', 'visual-word-blending'),
      }),
      choices: chunkChoices,
      correctChoiceIds: chunkCorrectIds,
    }),
    makeRootHotText({
      ...baseSpec(config, 3, {
        prompt: `Select ${fourth.primaryPart.displayLabel} in ${fourth.surfaceWord}.`,
        explanation: `${fourth.primaryPart.displayLabel} is the highlighted useful part in ${fourth.surfaceWord}.`,
        evidenceReferenceIds: [fourth.sentenceId], targetVocabulary: [fourth.surfaceWord], soundOutChunks: fourth.syllableChunks.map((chunk) => chunk.displayText),
        tags: tags('root-pattern-highlight', fourth.primaryPart.kind === 'prefix' ? 'classical-prefix-decoding' : 'classical-part-identification'),
      }),
      segments: hotSegments,
      correctSegmentIds: hotCorrect,
    }),
    makeRootTableMatch({
      ...baseSpec(config, 4, {
        prompt: 'Match each displayed word to its primary useful part.',
        explanation: 'Each row matches a complete word to the root or affix highlighted in its Root Reactor guide.',
        evidenceReferenceIds: artifact.targets.map((target) => target.sentenceId), targetVocabulary: artifact.targets.map((target) => target.surfaceWord), soundOutChunks: [],
        tags: tags('classical-part-identification', 'word-family-decoding'),
      }),
      rows: artifact.targets.map((target, index) => ({
        id: `${config.questionIds[4]}-row-${index + 1}`,
        prompt: target.surfaceWord,
        correctChoiceId: primaryOptions.find((option) => option.text === target.primaryPart.displayLabel)?.id ?? primaryOptions[0].id,
        options: primaryOptions.map((option) => ({ ...option })),
      })),
    }),
  ]
}

function buildCheckpointQuestions(config: CheckpointConfig): ReadingQuestion[] {
  const artifact = getRootReactorArtifact(config.passageId)
  const rootTarget = targetByWord(config.rootTargetWord)
  const affixTarget = targetByWord(config.affixTargetWord)
  const contextTarget = targetByWord(config.contextTargetWord)
  const distinctionTarget = targetByWord(config.distinctionTargetWord)
  const rootQ = choiceSet(config.questionIds[0], rootTarget.primaryPart.displayLabel, artifact.targets.filter((target) => target !== rootTarget).map((target) => target.primaryPart.displayLabel), 1)
  const affixQ = choiceSet(config.questionIds[1], affixTarget.primaryPart.displayLabel, artifact.targets.filter((target) => target !== affixTarget).map((target) => target.primaryPart.displayLabel), 2)
  const contextSentence = artifact.passage.sentences?.find((sentence) => sentence.sentenceId === contextTarget.sentenceId)?.text ?? ''
  const sentenceWithBlank = contextSentence.replace(new RegExp(`\\b${contextTarget.surfaceWord}\\b`, 'i'), '_____')
  const contextQ = choiceSet(config.questionIds[2], contextTarget.surfaceWord, artifact.targets.filter((target) => target !== contextTarget).map((target) => target.surfaceWord), 0)
  const familyChoices = [
    rootChoice(`${config.questionIds[3]}-choice-1`, config.familyWords[1]),
    rootChoice(`${config.questionIds[3]}-choice-2`, affixTarget.surfaceWord),
    rootChoice(`${config.questionIds[3]}-choice-3`, config.familyWords[0]),
    rootChoice(`${config.questionIds[3]}-choice-4`, contextTarget.surfaceWord),
  ].filter((choice, index, list) => list.findIndex((item) => item.text === choice.text) === index)
  const familyCorrectIds = familyChoices.filter((choice) => config.familyWords.includes(choice.text as never)).map((choice) => choice.id)
  const hotSegments = rootTarget.morphologicalChunks.map((chunk, index) => rootChoice(`${config.questionIds[4]}-segment-${index + 1}`, chunk.text))
  const hotCorrect = hotSegments.filter((_, index) => rootTarget.morphologicalChunks[index].partId === rootTarget.primaryPart.partId).map((segment) => segment.id)

  return [
    makeRootMultipleChoice({
      ...baseSpec(config, 0, {
        prompt: `Which root helps you begin reading ${rootTarget.surfaceWord}?`,
        explanation: `${rootTarget.primaryPart.displayLabel} is the root readers can mark before blending ${rootTarget.surfaceWord}.`,
        evidenceReferenceIds: [rootTarget.sentenceId], targetVocabulary: [rootTarget.surfaceWord], soundOutChunks: rootTarget.syllableChunks.map((chunk) => chunk.displayText),
        tags: tags(rootTarget.primaryPart.origin === 'Greek' ? 'greek-root-decoding' : 'latin-root-decoding', 'root-pattern-highlight'),
      }),
      ...rootQ,
    }),
    makeRootMultipleChoice({
      ...baseSpec(config, 1, {
        prompt: `Which affix starts ${affixTarget.surfaceWord}?`,
        explanation: `${affixTarget.primaryPart.displayLabel} is attached at the beginning of ${affixTarget.surfaceWord}.`,
        evidenceReferenceIds: [affixTarget.sentenceId], targetVocabulary: [affixTarget.surfaceWord], soundOutChunks: affixTarget.syllableChunks.map((chunk) => chunk.displayText),
        tags: tags('classical-prefix-decoding', 'affix-decoding'),
      }),
      ...affixQ,
    }),
    makeRootMultipleChoice({
      ...baseSpec(config, 2, {
        prompt: `Which complete written word fits this passage sentence? ${sentenceWithBlank}`,
        explanation: `${contextTarget.surfaceWord} is the word used in the passage, and its authored chunks blend into the complete written word.`,
        evidenceReferenceIds: [contextTarget.sentenceId], targetVocabulary: [contextTarget.surfaceWord], soundOutChunks: contextTarget.syllableChunks.map((chunk) => chunk.displayText),
        tags: tags('connected-text-decoding', 'visual-word-blending'),
      }),
      ...contextQ,
    }),
    makeRootMultiselect({
      ...baseSpec(config, 3, {
        prompt: `Choose two words that contain ${config.familyLabel}.`,
        explanation: `${config.familyWords[0]} and ${config.familyWords[1]} both contain ${config.familyLabel}.`,
        evidenceReferenceIds: familyCorrectIds, targetVocabulary: [...config.familyWords], soundOutChunks: [],
        tags: tags('word-family-decoding', 'classical-part-identification'),
      }),
      choices: familyChoices,
      correctChoiceIds: familyCorrectIds,
    }),
    makeRootHotText({
      ...baseSpec(config, 4, {
        prompt: `Select ${rootTarget.primaryPart.displayLabel} in ${rootTarget.surfaceWord}.`,
        explanation: `${rootTarget.primaryPart.displayLabel} is the useful root inside ${rootTarget.surfaceWord}.`,
        evidenceReferenceIds: [rootTarget.sentenceId], targetVocabulary: [rootTarget.surfaceWord], soundOutChunks: rootTarget.syllableChunks.map((chunk) => chunk.displayText),
        tags: tags('root-pattern-highlight', 'classical-part-identification'),
      }),
      segments: hotSegments,
      correctSegmentIds: hotCorrect,
    }),
    makeRootTableMatch({
      ...baseSpec(config, 5, {
        prompt: 'Match each complete word to its authored reading-chunk split.',
        explanation: 'Each reading split uses pronounceable chunks that rebuild the complete written word.',
        evidenceReferenceIds: artifact.targets.map((target) => target.sentenceId), targetVocabulary: artifact.targets.map((target) => target.surfaceWord), soundOutChunks: [],
        tags: tags('syllable-segmentation', 'visual-word-blending'),
      }),
      rows: artifact.targets.map((target, index) => {
        const correct = split(target, 'syllable')
        const choices = choiceSet(`${config.questionIds[5]}-row-${index + 1}`, correct, [
          split(target, 'morphology'),
          target.surfaceWord,
          `${target.surfaceWord[0]} | ${target.surfaceWord.slice(1)}`,
          `${target.surfaceWord.slice(0, -1)} | ${target.surfaceWord.slice(-1)}`,
        ], index % 4)
        return { id: `${config.questionIds[5]}-row-${index + 1}`, prompt: target.surfaceWord, correctChoiceId: choices.correctChoiceId, options: choices.choices }
      }),
    }),
    makeRootTwoPart({
      ...baseSpec(config, 6, {
        prompt: `Use meaningful parts and reading chunks to analyze ${distinctionTarget.surfaceWord}.`,
        explanation: `${split(distinctionTarget, 'morphology')} marks meaningful parts, while ${split(distinctionTarget, 'syllable')} marks pronounceable reading chunks.`,
        evidenceReferenceIds: [distinctionTarget.sentenceId], targetVocabulary: [distinctionTarget.surfaceWord], soundOutChunks: distinctionTarget.syllableChunks.map((chunk) => chunk.displayText),
        tags: tags('morphological-segmentation', 'syllable-segmentation', 'root-affix-vs-syllable-distinction'),
      }),
      partAPrompt: 'Which split shows the meaningful word parts?',
      ...buildPartAChoices(config.questionIds[6], split(distinctionTarget, 'morphology'), [split(distinctionTarget, 'syllable'), distinctionTarget.surfaceWord, `${distinctionTarget.surfaceWord[0]} | ${distinctionTarget.surfaceWord.slice(1)}`], 1),
      partBPrompt: 'Which split shows the pronounceable reading chunks?',
      ...buildPartBChoices(config.questionIds[6], split(distinctionTarget, 'syllable'), [split(distinctionTarget, 'morphology'), distinctionTarget.surfaceWord, `${distinctionTarget.surfaceWord.slice(0, 2)} | ${distinctionTarget.surfaceWord.slice(2)}`], 2),
    }),
  ]
}

function buildPartAChoices(questionId: string, correct: string, distractors: string[], index: number) {
  const built = choiceSet(`${questionId}-a`, correct, distractors, index)
  return { partAChoices: built.choices, partACorrectChoiceId: built.correctChoiceId }
}

function buildPartBChoices(questionId: string, correct: string, distractors: string[], index: number) {
  const built = choiceSet(`${questionId}-b`, correct, distractors, index)
  return { partBChoices: built.choices, partBCorrectChoiceId: built.correctChoiceId }
}

export const rootReactorQuestions: ReadingQuestion[] = [
  ...buildGuidedQuestions({ lessonId: rootReactorLessonIds.powerUpFarEarth, passageId: rootReactorPassageIds.farEarthCounts, questionIds: rootReactorQuestionIds.powerUpFarEarth, difficulty: 0 }),
  ...buildGuidedQuestions({ lessonId: rootReactorLessonIds.powerUpPicturesLife, passageId: rootReactorPassageIds.picturesLifeTools, questionIds: rootReactorQuestionIds.powerUpPicturesLife, difficulty: 0 }),
  ...buildGuidedQuestions({ lessonId: rootReactorLessonIds.labGreek, passageId: rootReactorPassageIds.greekWordLab, questionIds: rootReactorQuestionIds.labGreek, difficulty: 1 }),
  ...buildGuidedQuestions({ lessonId: rootReactorLessonIds.labLatin, passageId: rootReactorPassageIds.latinMovingLab, questionIds: rootReactorQuestionIds.labLatin, difficulty: 1 }),
  ...buildCheckpointQuestions({ lessonId: rootReactorLessonIds.checkpointScience, passageId: rootReactorPassageIds.scienceExhibit, questionIds: rootReactorQuestionIds.checkpointScience, difficulty: 1, rootTargetWord: 'graphic', affixTargetWord: 'tripod', contextTargetWord: 'uniform', distinctionTargetWord: 'uniform', familyLabel: 'graph', familyWords: ['graphic', 'autograph'] }),
  ...buildCheckpointQuestions({ lessonId: rootReactorLessonIds.checkpointMoving, passageId: rootReactorPassageIds.movingChanging, questionIds: rootReactorQuestionIds.checkpointMoving, difficulty: 1, rootTargetWord: 'biography', affixTargetWord: 'subway', contextTargetWord: 'export', distinctionTargetWord: 'biography', familyLabel: 'bio', familyWords: ['biography', 'biology'] }),
  ...buildCheckpointQuestions({ lessonId: rootReactorLessonIds.checkpointAcross, passageId: rootReactorPassageIds.acrossUnder, questionIds: rootReactorQuestionIds.checkpointAcross, difficulty: 1, rootTargetWord: 'microphone', affixTargetWord: 'transplant', contextTargetWord: 'disrupt', distinctionTargetWord: 'microphone', familyLabel: 'micro', familyWords: ['microphone', 'microscope'] }),
]
