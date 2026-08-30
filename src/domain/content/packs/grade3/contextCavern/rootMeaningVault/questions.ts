import type { LessonChoice, ReadingQuestion } from '../../../../types'
import { rootMeaningArtifacts, rootMeaningWordInfo, type RootMeaningArtifact, type RootMeaningWord } from './content'
import { rootMeaningVaultLessonIds, rootMeaningVaultQuestionIds } from './ids'
import {
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
  createTwoPartQuestion,
  lessonChoice,
} from './questionFactories'

const tags = ['greek-roots', 'latin-roots', 'base-words', 'affixes', 'unfamiliar-word-meaning']

type QuestionPlan = {
  artifact: RootMeaningArtifact
  lessonId: string
  questionIds: readonly string[]
  difficulty: 1 | 2
  words: readonly [RootMeaningWord, RootMeaningWord, RootMeaningWord, RootMeaningWord]
  thirdMultipleChoice?: {
    prompt: string
    correct: string
    distractors: readonly [string, string, string]
    explanation: string
    evidenceIndexes: readonly number[]
    targetVocabulary: readonly string[]
  }
  multiselectOverride?: {
    prompt: string
    choices: readonly [string, string, string, string]
    correctIndexes: readonly [number, number]
    explanation: string
    evidenceIndexes: readonly number[]
    targetVocabulary: readonly string[]
  }
}

function choiceSet(questionId: string, correct: string, distractors: readonly [string, string, string], correctIndex: number) {
  const ordered = [...distractors]
  ordered.splice(correctIndex, 0, correct)
  return {
    choices: ordered.map((text, index) => lessonChoice(`${questionId}-choice-${index + 1}`, text)),
    correctChoiceId: `${questionId}-choice-${correctIndex + 1}`,
  }
}

function base(plan: QuestionPlan, questionIdentifier: string, prompt: string, explanation: string, evidenceReferenceIds: string[], targetVocabulary: string[]) {
  return {
    difficulty: plan.difficulty,
    genre: plan.artifact.passage.contentKind === 'prose' ? 'literary' as const : 'informational' as const,
    passageIdentifier: plan.artifact.passage.passageIdentifier,
    lessonIdentifier: plan.lessonId,
    questionIdentifier,
    prompt,
    explanation,
    evidenceReferenceIds,
    targetVocabulary,
    tags,
  }
}

function sourceId(plan: QuestionPlan, word: RootMeaningWord): string {
  return plan.artifact.guide.targets.find((target) => target.surfaceWord === word)?.sourceSentenceId ?? ''
}

function target(plan: QuestionPlan, word: RootMeaningWord) {
  const found = plan.artifact.guide.targets.find((candidate) => candidate.surfaceWord === word)
  if (!found) throw new Error(`Missing root-meaning target ${word}.`)
  return found
}

function sentenceText(plan: QuestionPlan, sentenceId: string): string {
  return plan.artifact.passage.sentences?.find((sentence) => sentence.sentenceId === sentenceId)?.text ?? ''
}

function buildQuestions(plan: QuestionPlan): ReadingQuestion[] {
  const [word1, word2, word3, word4] = plan.words
  const qids = plan.questionIds
  const info1 = rootMeaningWordInfo[word1]
  const info2 = rootMeaningWordInfo[word2]
  const info3 = rootMeaningWordInfo[word3]
  const info4 = rootMeaningWordInfo[word4]
  const firstChoices = choiceSet(qids[0], info1.inferredMeaning, info1.distractors, Number(qids[0].endsWith('-1')) ? 1 : 0)
  const secondChoices = choiceSet(qids[1], info2.combinedPartClue, [
    info2.distractors[1], info1.combinedPartClue, info4.combinedPartClue,
  ], 2)
  const result: ReadingQuestion[] = [
    createMultipleChoiceQuestion({
      ...base(plan, qids[0], `What does ${word1} most likely mean in this passage?`, `The meaningful parts suggest ${info1.combinedPartClue}, and the passage confirms ${info1.inferredMeaning}.`, target(plan, word1).contextEvidenceIds, [word1]),
      choices: firstChoices.choices,
      correctChoiceIds: [firstChoices.correctChoiceId],
    }),
    createMultipleChoiceQuestion({
      ...base(plan, qids[1], `Which word-part clue best helps explain ${word2}?`, `The genuine parts combine to suggest ${info2.combinedPartClue}; the surrounding details confirm that clue.`, target(plan, word2).contextEvidenceIds, [word2]),
      choices: secondChoices.choices,
      correctChoiceIds: [secondChoices.correctChoiceId],
    }),
  ]

  if (plan.thirdMultipleChoice) {
    const custom = plan.thirdMultipleChoice
    const customChoices = choiceSet(qids[2], custom.correct, custom.distractors, 3)
    result.push(createMultipleChoiceQuestion({
      ...base(plan, qids[2], custom.prompt, custom.explanation, custom.evidenceIndexes.map((index) => plan.artifact.sentenceIds[index]), [...custom.targetVocabulary]),
      choices: customChoices.choices,
      correctChoiceIds: [customChoices.correctChoiceId],
    }))
  }

  const multiselectQuestionId = qids[plan.thirdMultipleChoice ? 3 : 2]
  if (plan.multiselectOverride) {
    const custom = plan.multiselectOverride
    const choices = custom.choices.map((text, index) => lessonChoice(`${multiselectQuestionId}-choice-${index + 1}`, text))
    result.push(createMultiselectQuestion({
      ...base(plan, multiselectQuestionId, custom.prompt, custom.explanation, custom.evidenceIndexes.map((index) => plan.artifact.sentenceIds[index]), [...custom.targetVocabulary]),
      choices,
      correctChoiceIds: custom.correctIndexes.map((index) => choices[index].id),
    }))
  } else {
    const firstPart = target(plan, word3).parts.find((candidate) => candidate.contributesMeaning)!
    const context = sentenceText(plan, sourceId(plan, word3))
    const choices = [
      lessonChoice(`${multiselectQuestionId}-choice-1`, `The part ${firstPart.surfaceForm} means ${firstPart.commonMeaning}.`),
      lessonChoice(`${multiselectQuestionId}-choice-2`, `The passage says: ${context}`),
      lessonChoice(`${multiselectQuestionId}-choice-3`, `The part ${firstPart.surfaceForm} means ${target(plan, word4).parts[0].commonMeaning}.`),
      lessonChoice(`${multiselectQuestionId}-choice-4`, `The context shows that ${word3} means ${info3.distractors[0]}.`),
    ]
    result.push(createMultiselectQuestion({
      ...base(plan, multiselectQuestionId, `Choose exactly two statements that correctly help explain ${word3}.`, `The genuine word-part meaning and the source sentence work together to support ${info3.inferredMeaning}.`, target(plan, word3).contextEvidenceIds, [word3]),
      choices,
      correctChoiceIds: [choices[0].id, choices[1].id],
    }))
  }

  const hotTextQuestionId = qids[plan.thirdMultipleChoice ? 4 : 3]
  const hotSegments = plan.words.map((word, index) => ({ id: `${hotTextQuestionId}-segment-${index + 1}`, text: sentenceText(plan, sourceId(plan, word)) }))
  result.push(createHotTextQuestion({
    ...base(plan, hotTextQuestionId, `Select the sentence that best confirms that ${word4} means ${info4.inferredMeaning}.`, `The selected sentence shows ${info4.inferredMeaning}, which agrees with the clue ${info4.combinedPartClue}.`, target(plan, word4).contextEvidenceIds, [word4]),
    selectableSegments: hotSegments,
    correctSegmentIds: [hotSegments[3].id],
  }))

  const tableQuestionId = qids[plan.thirdMultipleChoice ? 5 : 4]
  const meaningOptions: LessonChoice[] = plan.words.map((word, index) => lessonChoice(`${tableQuestionId}-meaning-${index + 1}`, rootMeaningWordInfo[word].inferredMeaning))
  result.push(createTableMatchQuestion({
    ...base(plan, tableQuestionId, 'Match each target word to the meaning supported by both its genuine parts and the passage context.', 'Each row combines a transparent word-part clue with source context that confirms the whole-word meaning.', plan.words.flatMap((word) => target(plan, word).contextEvidenceIds), [...plan.words]),
    rows: plan.words.map((word, index) => ({ id: `${tableQuestionId}-row-${index + 1}`, prompt: word, correctChoiceId: meaningOptions[index].id, options: meaningOptions })),
  }))

  if (plan.thirdMultipleChoice) {
    const twoPartQuestionId = qids[6]
    const partA = choiceSet(`${twoPartQuestionId}-a`, info1.inferredMeaning, info1.distractors, 1)
    const supportStatement = `${target(plan, word1).parts.filter((candidate) => candidate.contributesMeaning).map((candidate) => `${candidate.surfaceForm} means ${candidate.commonMeaning}`).join(', and ')}; the passage shows ${sentenceText(plan, sourceId(plan, word1))}`
    const partB = choiceSet(`${twoPartQuestionId}-b`, supportStatement, [
      `The letters ${word1.slice(0, 2)} form a familiar sound, so context is unnecessary.`,
      `Only the last letter matters, and the surrounding sentence gives no useful information.`,
      `A pronunciation chunk supplies the complete dictionary meaning without checking the passage.`,
    ], 2)
    result.push(createTwoPartQuestion({
      ...base(plan, twoPartQuestionId, `Use word parts and context to analyze ${word1}.`, `The correct whole-word meaning is supported by genuine meaning parts and a confirming source detail.`, target(plan, word1).contextEvidenceIds, [word1]),
      partAPrompt: `Part A: What does ${word1} most likely mean?`,
      partAChoices: partA.choices,
      partACorrectChoiceId: partA.correctChoiceId,
      partBPrompt: 'Part B: Which explanation best supports the Part A answer?',
      partBChoices: partB.choices,
      partBCorrectChoiceId: partB.correctChoiceId,
    }))
  }

  return result
}

const plans: QuestionPlan[] = [
  { artifact: rootMeaningArtifacts.prefixClues, lessonId: rootMeaningVaultLessonIds.prefixClues, questionIds: rootMeaningVaultQuestionIds.prefixClues, difficulty: 1, words: ['preview', 'reread', 'miscount', 'unclear'] },
  { artifact: rootMeaningArtifacts.suffixClues, lessonId: rootMeaningVaultLessonIds.suffixClues, questionIds: rootMeaningVaultQuestionIds.suffixClues, difficulty: 1, words: ['hopeful', 'careless', 'washable', 'kindness'] },
  { artifact: rootMeaningArtifacts.greekRoots, lessonId: rootMeaningVaultLessonIds.greekRoots, questionIds: rootMeaningVaultQuestionIds.greekRoots, difficulty: 2, words: ['thermometer', 'thermal', 'polygon', 'monorail'] },
  { artifact: rootMeaningArtifacts.latinRoots, lessonId: rootMeaningVaultLessonIds.latinRoots, questionIds: rootMeaningVaultQuestionIds.latinRoots, difficulty: 2, words: ['portable', 'import', 'predict', 'visible'] },
  {
    artifact: rootMeaningArtifacts.buildMeaning, lessonId: rootMeaningVaultLessonIds.buildMeaningCheckpoint, questionIds: rootMeaningVaultQuestionIds.buildMeaningCheckpoint, difficulty: 2,
    words: ['preheat', 'disconnect', 'nonfiction', 'agreement'],
    thirdMultipleChoice: {
      prompt: 'Which split shows the genuine meaning parts in nonfiction?', correct: 'non + fiction',
      distractors: ['no + nfiction', 'nonf + iction', 'n + onfiction'],
      explanation: 'Non means not and fiction means made-up writing; the book context confirms writing about real information.', evidenceIndexes: [5, 6, 11], targetVocabulary: ['nonfiction'],
    },
  },
  {
    artifact: rootMeaningArtifacts.rootsAcrossSubjects, lessonId: rootMeaningVaultLessonIds.rootsAcrossSubjectsCheckpoint, questionIds: rootMeaningVaultQuestionIds.rootsAcrossSubjectsCheckpoint, difficulty: 2,
    words: ['astronaut', 'biology', 'telegram', 'audible'],
    thirdMultipleChoice: {
      prompt: 'Which statement correctly distinguishes meaning parts from pronunciation chunks in astronaut?',
      correct: 'Astro and naut carry meaning, while spoken chunks help a reader pronounce the word.',
      distractors: ['Every spoken beat is a Greek root with its own meaning.', 'Pronunciation chunks make context evidence unnecessary.', 'The letters her inside astronaut form a hidden meaning root.'],
      explanation: 'The passage explicitly separates the astro and naut meaning display from the readable sound-chunk display.', evidenceIndexes: [12, 13], targetVocabulary: ['astronaut'],
    },
    multiselectOverride: {
      prompt: 'Choose exactly two words that use tele as a genuine root meaning far.',
      choices: ['telegram', 'telephone', 'thermal', 'biology'], correctIndexes: [0, 1],
      explanation: 'The passage names telegram and telephone together and states that tele connects both words with communication from far away.', evidenceIndexes: [5, 6], targetVocabulary: ['telegram', 'telephone'],
    },
  },
  {
    artifact: rootMeaningArtifacts.unfamiliarWord, lessonId: rootMeaningVaultLessonIds.unfamiliarWordCheckpoint, questionIds: rootMeaningVaultQuestionIds.unfamiliarWordCheckpoint, difficulty: 2,
    words: ['inspect', 'aqueduct', 'refillable', 'readable'],
    thirdMultipleChoice: {
      prompt: 'Which split shows the genuine meaning parts in readable?', correct: 'read + able',
      distractors: ['re + adable', 'rea + dable', 'r + eadable'],
      explanation: 'Read names the action and able means can be; the label test confirms that the words can be read easily.', evidenceIndexes: [7, 8, 12, 13], targetVocabulary: ['readable'],
    },
  },
]

export const rootMeaningVaultQuestions: ReadingQuestion[] = plans.flatMap(buildQuestions)
