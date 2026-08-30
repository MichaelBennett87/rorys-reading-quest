import type { ReadingQuestion } from '../../../../types'
import { grade3AcademicVocabularyArtifacts, type Grade3AcademicVocabularyArtifact } from './content'
import {
  grade3AcademicWordWorkshopLessonIds,
  grade3AcademicWordWorkshopQuestionIds,
} from './ids'
import {
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
  createTwoPartQuestion,
  lessonChoice,
} from './questionFactories'

const baseTags = [
  'grade-level-academic-vocabulary',
  'appropriate-use',
  'speaking-writing-support',
  'no-open-response-scoring',
] as const

type LessonContext = {
  lessonId: string
  questionIds: readonly string[]
  artifact: Grade3AcademicVocabularyArtifact
  difficulty: 0 | 1
}

const sentenceText = (context: LessonContext, index: number): string =>
  context.artifact.passage.sentences?.[index]?.text ?? ''

const evidenceIds = (context: LessonContext, ...indices: number[]): string[] =>
  indices.map((index) => context.artifact.sentenceIds[index])

function choices(questionId: string, texts: readonly string[]) {
  return texts.map((text, index) => lessonChoice(`${questionId}-choice-${index + 1}`, text))
}

function mc(
  context: LessonContext,
  questionIndex: number,
  prompt: string,
  optionTexts: readonly string[],
  correctIndex: number,
  explanation: string,
  evidence: number[],
  vocabulary: string[],
  construct: string,
): ReadingQuestion {
  const questionId = context.questionIds[questionIndex]
  const answerChoices = choices(questionId, optionTexts)
  return createMultipleChoiceQuestion({
    difficulty: context.difficulty,
    passageIdentifier: context.artifact.passage.passageIdentifier,
    lessonIdentifier: context.lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReferenceIds: evidenceIds(context, ...evidence),
    targetVocabulary: vocabulary,
    tags: [...baseTags, construct],
    choices: answerChoices,
    correctChoiceIds: [answerChoices[correctIndex].id],
  })
}

function multiselect(
  context: LessonContext,
  questionIndex: number,
  prompt: string,
  optionTexts: readonly string[],
  correctIndices: number[],
  explanation: string,
  evidence: number[],
  vocabulary: string[],
  construct: string,
): ReadingQuestion {
  const questionId = context.questionIds[questionIndex]
  const answerChoices = choices(questionId, optionTexts)
  return createMultiselectQuestion({
    difficulty: context.difficulty,
    passageIdentifier: context.artifact.passage.passageIdentifier,
    lessonIdentifier: context.lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReferenceIds: evidenceIds(context, ...evidence),
    targetVocabulary: vocabulary,
    tags: [...baseTags, construct, `select-exactly-${correctIndices.length}`],
    choices: answerChoices,
    correctChoiceIds: correctIndices.map((index) => answerChoices[index].id),
  })
}

function hotText(
  context: LessonContext,
  questionIndex: number,
  prompt: string,
  sentenceIndices: number[],
  correctIndex: number,
  explanation: string,
  vocabulary: string[],
  construct: string,
): ReadingQuestion {
  const questionId = context.questionIds[questionIndex]
  const selectableSegments = sentenceIndices.map((sentenceIndex, index) => ({
    id: `${questionId}-segment-${index + 1}`,
    text: sentenceText(context, sentenceIndex),
  }))
  return createHotTextQuestion({
    difficulty: context.difficulty,
    passageIdentifier: context.artifact.passage.passageIdentifier,
    lessonIdentifier: context.lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReferenceIds: evidenceIds(context, sentenceIndices[correctIndex]),
    targetVocabulary: vocabulary,
    tags: [...baseTags, construct],
    selectableSegments,
    correctSegmentIds: [selectableSegments[correctIndex].id],
  })
}

function tableMatch(
  context: LessonContext,
  questionIndex: number,
  prompt: string,
  rows: readonly { prompt: string; options: readonly string[]; correctIndex: number }[],
  explanation: string,
  evidence: number[],
  vocabulary: string[],
): ReadingQuestion {
  const questionId = context.questionIds[questionIndex]
  const builtRows = rows.map((row, rowIndex) => {
    const rowChoices = row.options.map((text, optionIndex) =>
      lessonChoice(`${questionId}-row-${rowIndex + 1}-choice-${optionIndex + 1}`, text),
    )
    return {
      id: `${questionId}-row-${rowIndex + 1}`,
      prompt: row.prompt,
      options: rowChoices,
      correctChoiceId: rowChoices[row.correctIndex].id,
    }
  })
  return createTableMatchQuestion({
    difficulty: context.difficulty,
    passageIdentifier: context.artifact.passage.passageIdentifier,
    lessonIdentifier: context.lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReferenceIds: evidenceIds(context, ...evidence),
    targetVocabulary: vocabulary,
    tags: [...baseTags, 'academic-function-match'],
    rows: builtRows,
  })
}

function twoPart(
  context: LessonContext,
  questionIndex: number,
  prompt: string,
  partAPrompt: string,
  partAOptions: readonly string[],
  partACorrectIndex: number,
  partBPrompt: string,
  partBOptions: readonly string[],
  partBCorrectIndex: number,
  explanation: string,
  evidence: number[],
  vocabulary: string[],
): ReadingQuestion {
  const questionId = context.questionIds[questionIndex]
  const partAChoices = partAOptions.map((text, index) => lessonChoice(`${questionId}-part-a-${index + 1}`, text))
  const partBChoices = partBOptions.map((text, index) => lessonChoice(`${questionId}-part-b-${index + 1}`, text))
  return createTwoPartQuestion({
    difficulty: context.difficulty,
    passageIdentifier: context.artifact.passage.passageIdentifier,
    lessonIdentifier: context.lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReferenceIds: evidenceIds(context, ...evidence),
    targetVocabulary: vocabulary,
    tags: [...baseTags, 'meaning-and-use-two-part'],
    partAPrompt,
    partAChoices,
    partACorrectChoiceId: partAChoices[partACorrectIndex].id,
    partBPrompt,
    partBChoices,
    partBCorrectChoiceId: partBChoices[partBCorrectIndex].id,
  })
}

const schoolThinking: LessonContext = {
  lessonId: grade3AcademicWordWorkshopLessonIds.wordsForSchoolThinking,
  questionIds: grade3AcademicWordWorkshopQuestionIds.wordsForSchoolThinking,
  artifact: grade3AcademicVocabularyArtifacts.scienceInvestigation,
  difficulty: 0,
}

const preciseWord: LessonContext = {
  lessonId: grade3AcademicWordWorkshopLessonIds.chooseThePreciseWord,
  questionIds: grade3AcademicWordWorkshopQuestionIds.chooseThePreciseWord,
  artifact: grade3AcademicVocabularyArtifacts.mathematicsModel,
  difficulty: 0,
}

const explainSupport: LessonContext = {
  lessonId: grade3AcademicWordWorkshopLessonIds.explainAndSupport,
  questionIds: grade3AcademicWordWorkshopQuestionIds.explainAndSupport,
  artifact: grade3AcademicVocabularyArtifacts.readingDiscussion,
  difficulty: 1,
}

const organizeRevise: LessonContext = {
  lessonId: grade3AcademicWordWorkshopLessonIds.organizeAndRevise,
  questionIds: grade3AcademicWordWorkshopQuestionIds.organizeAndRevise,
  artifact: grade3AcademicVocabularyArtifacts.writingRevision,
  difficulty: 1,
}

const scienceMath: LessonContext = {
  lessonId: grade3AcademicWordWorkshopLessonIds.scienceAndMathCheckpoint,
  questionIds: grade3AcademicWordWorkshopQuestionIds.scienceAndMathCheckpoint,
  artifact: grade3AcademicVocabularyArtifacts.engineeringInvestigation,
  difficulty: 1,
}

const readingWriting: LessonContext = {
  lessonId: grade3AcademicWordWorkshopLessonIds.readingAndWritingCheckpoint,
  questionIds: grade3AcademicWordWorkshopQuestionIds.readingAndWritingCheckpoint,
  artifact: grade3AcademicVocabularyArtifacts.sourceDiscussion,
  difficulty: 1,
}

const acrossSubjects: LessonContext = {
  lessonId: grade3AcademicWordWorkshopLessonIds.acrossSubjectsCheckpoint,
  questionIds: grade3AcademicWordWorkshopQuestionIds.acrossSubjectsCheckpoint,
  artifact: grade3AcademicVocabularyArtifacts.projectPresentation,
  difficulty: 1,
}

const schoolThinkingQuestions = [
  mc(schoolThinking, 0, 'The team has collected three trials. Which sentence describes how to analyze the results?', [
    'We will study each measurement and look for a pattern.',
    'We will decorate the chart before reading the numbers.',
    'We will erase the units so the table looks shorter.',
    'We will choose the answer before checking the trials.',
  ], 0, 'To analyze results, the team studies the measurements closely for a pattern.', [4, 5], ['analyze'], 'meaning-in-context'),
  mc(schoolThinking, 1, 'Which sentence uses evidence as information that supports a science idea?', [
    'Our evidence is the set of measurements from all three trials.',
    'Our evidence is the blue border, although the question asks how much water was held.',
    'Our evidence is the answer we chose before we tested either towel.',
    'Our evidence is the empty space where a measurement should be.',
  ], 0, 'Measurements from the fair trials are relevant information that can support the science conclusion.', [6], ['evidence'], 'appropriate-writing-use'),
  multiselect(schoolThinking, 2, 'Choose two actions that help keep the written table accurate.', [
    'Copy every measurement with the correct unit.',
    'Check each number against the recorded trial.',
    'Change a number so it matches the first guess.',
    'Leave out the trial that does not look neat.',
  ], [0, 1], 'Correctly copying and checking the recorded measurements protects accuracy.', [7, 8], ['accurate'], 'appropriate-use'),
  hotText(schoolThinking, 3, 'Select the sentence that shows the team making a conclusion after considering its evidence.', [3, 6, 9, 11], 2, 'The students conclude only after using the repeated measurements as evidence.', ['conclude', 'evidence'], 'meaning-in-context'),
  tableMatch(schoolThinking, 4, 'Match each academic word to the school-thinking job it performs.', [
    { prompt: 'Study the measurements closely for a pattern.', options: ['analyze', 'evidence', 'accurate', 'conclude'], correctIndex: 0 },
    { prompt: 'Information used to support an idea.', options: ['conclude', 'accurate', 'evidence', 'analyze'], correctIndex: 2 },
    { prompt: 'Correct for the measurement task.', options: ['evidence', 'accurate', 'analyze', 'conclude'], correctIndex: 1 },
    { prompt: 'Decide what makes sense after reviewing results.', options: ['accurate', 'analyze', 'conclude', 'evidence'], correctIndex: 2 },
  ], 'Each word names a different academic job in the investigation.', [4, 6, 8, 9], ['analyze', 'evidence', 'accurate', 'conclude']),
]

const preciseWordQuestions = [
  mc(preciseWord, 0, 'Before counting every square, which sentence uses estimate correctly?', [
    'I estimate that about sixty chairs will fit.',
    'I estimate that exactly fifty-four chairs fit after counting twice.',
    'I estimate the chairs by choosing my favorite number.',
    'I estimate the aisle by erasing it from the plan.',
  ], 0, 'An estimate is a reasonable approximate answer made before the exact count is known.', [1, 2], ['estimate'], 'near-neighbor-distinction'),
  mc(preciseWord, 1, 'Which sentence uses represent to explain the math model?', [
    'Each counter represents one chair in the room.',
    'Each counter determines the room by moving a wall.',
    'Each counter justifies the room without any explanation.',
    'Each counter estimates the room after every chair is counted.',
  ], 0, 'A counter represents a chair because it stands for that chair in the model.', [4, 10], ['represent'], 'appropriate-writing-use'),
  multiselect(preciseWord, 2, 'Choose two sentences that appropriately use justify, one for speaking and one for writing.', [
    'Speaking: I can justify my plan with the counters and equation.',
    'Writing: I justify the total by showing both multiplication and addition.',
    'Speaking: I justify the ruler by making it longer.',
    'Writing: I justify my answer by repeating it with no reason.',
  ], [0, 1], 'Both correct sentences use reasons or evidence to explain why an answer makes sense.', [8, 9], ['justify'], 'speaking-writing-transfer'),
  hotText(preciseWord, 3, 'Select the sentence that shows students determining an exact answer from information.', [1, 4, 6, 9], 2, 'The students determine the exact total by using multiplication with the model.', ['determine'], 'meaning-in-context'),
  tableMatch(preciseWord, 4, 'Match each word to its precise mathematics job.', [
    { prompt: 'Make a reasonable approximate answer.', options: ['estimate', 'represent', 'determine', 'justify'], correctIndex: 0 },
    { prompt: 'Stand for something in a model.', options: ['determine', 'justify', 'represent', 'estimate'], correctIndex: 2 },
    { prompt: 'Find out by checking or calculating.', options: ['justify', 'determine', 'estimate', 'represent'], correctIndex: 1 },
    { prompt: 'Explain why an answer makes sense with reasons.', options: ['represent', 'estimate', 'justify', 'determine'], correctIndex: 2 },
  ], 'The words separate approximation, modeling, finding, and defending an answer.', [1, 4, 6, 8], ['estimate', 'represent', 'determine', 'justify']),
]

const explainSupportQuestions = [
  mc(explainSupport, 0, 'Which reader makes an inference rather than repeats a stated fact?', [
    'Lena says Nia expects her cousin because the note, shelter, and footprints point to that unstated idea.',
    'Lena copies the exact words about the damp note.',
    'Lena names the title printed above the story.',
    'Lena counts how many sentences are on the page.',
  ], 0, 'An inference connects clues to an idea the story does not state directly.', [4, 5], ['infer'], 'meaning-in-context'),
  mc(explainSupport, 1, 'Which sentence appropriately uses interpret in an academic discussion?', [
    'I interpret the repeated rain and leaning flowers as clues that guide Nia and create a hopeful mood.',
    'I interpret the paper by folding it into a smaller square.',
    'I interpret the page number by copying it exactly.',
    'I interpret the pencil by sharpening it before class.',
  ], 0, 'To interpret is to explain what information or a text feature means.', [7, 8], ['interpret'], 'appropriate-speaking-use'),
  multiselect(explainSupport, 2, 'Choose two sentences that use support in the academic idea-strengthening sense.', [
    'The story details support my inference about Nia.',
    'The measurements support the science conclusion.',
    'The wooden leg supports the table.',
    'I support the page number by writing it twice.',
  ], [0, 1], 'The correct details and measurements make an idea stronger with information.', [6, 11], ['support'], 'cross-subject-transfer'),
  hotText(explainSupport, 3, 'Select the sentence that tells readers to keep only the most important information briefly.', [4, 7, 9, 13], 2, 'To summarize is to tell the important ideas briefly rather than repeat every detail.', ['summarize'], 'meaning-in-context'),
  tableMatch(explainSupport, 4, 'Match each discussion word to the job it performs.', [
    { prompt: 'Figure out an unstated idea from clues.', options: ['infer', 'interpret', 'summarize', 'support'], correctIndex: 0 },
    { prompt: 'Explain what a text or display means.', options: ['summarize', 'support', 'interpret', 'infer'], correctIndex: 2 },
    { prompt: 'Tell the most important ideas briefly.', options: ['support', 'summarize', 'infer', 'interpret'], correctIndex: 1 },
    { prompt: 'Make an idea stronger with useful details.', options: ['interpret', 'infer', 'support', 'summarize'], correctIndex: 2 },
  ], 'Each word describes a distinct job readers perform during discussion and writing.', [4, 7, 9, 11], ['infer', 'interpret', 'summarize', 'support']),
]

const organizeReviseQuestions = [
  mc(organizeRevise, 0, 'Which action is the best example of revising the proposal?', [
    'Move the main request to the opening and add evidence for a reason.',
    'Read the unchanged draft one more time.',
    'Copy the same vague phrase onto clean paper.',
    'Choose a brighter pencil without changing the writing.',
  ], 0, 'Revising makes purposeful changes that improve the ideas or clarity of the work.', [2, 3, 4], ['revise'], 'appropriate-writing-use'),
  mc(organizeRevise, 1, 'Which sentence uses structure as a noun meaning the arrangement of connected parts?', [
    'The structure of the proposal includes a claim, reasons, and a closing.',
    'We structure the pencil by sharpening it.',
    'The structure is the color of the paper.',
    'The structure estimates how many words are present.',
  ], 0, 'Here, structure names the way the proposal parts are arranged and connected.', [9, 10], ['structure'], 'part-of-speech-use'),
  multiselect(organizeRevise, 2, 'Choose two sentences that appropriately use clarify in school speaking or writing.', [
    'Speaking: I can clarify my reason by naming the evidence.',
    'Writing: This label clarifies what the diagram shows.',
    'Speaking: I clarify the directions by removing the needed final step.',
    'Writing: The empty sentence clarifies every detail.',
  ], [0, 1], 'Both correct uses make an idea easier to understand.', [5, 11], ['clarify'], 'speaking-writing-transfer'),
  hotText(organizeRevise, 3, 'Select the sentence that shows writers putting information into a useful order.', [3, 5, 7, 12], 2, 'The headings organize the ideas into a useful sequence of sections.', ['organize'], 'meaning-in-context'),
  tableMatch(organizeRevise, 4, 'Match each writing word to its precise job.', [
    { prompt: 'Change work so it becomes clearer or stronger.', options: ['revise', 'clarify', 'organize', 'structure'], correctIndex: 0 },
    { prompt: 'Make one idea easier to understand.', options: ['organize', 'structure', 'clarify', 'revise'], correctIndex: 2 },
    { prompt: 'Put ideas into a useful order or groups.', options: ['structure', 'organize', 'revise', 'clarify'], correctIndex: 1 },
    { prompt: 'The arrangement of connected parts.', options: ['clarify', 'revise', 'structure', 'organize'], correctIndex: 2 },
  ], 'The words distinguish changing, clarifying, arranging, and naming the arrangement.', [3, 5, 7, 9], ['revise', 'clarify', 'organize', 'structure']),
]

const scienceMathQuestions = [
  mc(scienceMath, 0, 'The team chose to add one counter at a time during every trial. Which word names that chosen way of testing?', [
    'method',
    'process',
    'factor',
    'outcome',
  ], 0, 'A method is the chosen way the team carries out the test.', [3, 4], ['method', 'process'], 'near-neighbor-distinction'),
  mc(scienceMath, 1, 'Which sentence uses factor correctly in an engineering explanation?', [
    'The fold shape was one factor that could affect bridge strength.',
    'The title was a factor that made the paper hold more counters.',
    'The factor was every step from planning through revision.',
    'The factor was the way the team chose to add counters.',
  ], 0, 'The fold shape is one condition that can affect the test result.', [10, 11], ['factor'], 'appropriate-writing-use'),
  mc(scienceMath, 2, 'Which speaking sentence appropriately uses investigate?', [
    'We will investigate whether folded paper holds more weight by testing both designs.',
    'We will investigate the answer by choosing folded paper before any test.',
    'We will investigate the ruler so the ruler becomes stronger.',
    'We will investigate the title by changing its color.',
  ], 0, 'An investigation asks a question and gathers information through a planned test.', [1, 2], ['investigate'], 'appropriate-speaking-use'),
  multiselect(scienceMath, 3, 'Choose two sentences that correctly distinguish a method from a process.', [
    'Our method was to add one counter at a time.',
    'The design process included planning, testing, and revising.',
    'Our method was every change from the first idea to the final bridge.',
    'The process was the single ruler chosen for measuring.',
  ], [0, 1], 'The method is one chosen way; the process is the connected series of steps.', [3, 8, 9], ['method', 'process'], 'near-neighbor-distinction'),
  hotText(scienceMath, 4, 'Select the sentence that identifies one condition that could affect the bridge result.', [3, 8, 10, 13], 2, 'The fold shape is named as one factor that could affect bridge strength.', ['factor'], 'meaning-in-context'),
  tableMatch(scienceMath, 5, 'Match each engineering word to its academic function.', [
    { prompt: 'Ask a question and gather information.', options: ['investigate', 'method', 'process', 'factor'], correctIndex: 0 },
    { prompt: 'A chosen way to carry out a task.', options: ['process', 'factor', 'method', 'investigate'], correctIndex: 2 },
    { prompt: 'A connected series of steps.', options: ['factor', 'process', 'investigate', 'method'], correctIndex: 1 },
    { prompt: 'One thing that can affect a result.', options: ['method', 'investigate', 'factor', 'process'], correctIndex: 2 },
  ], 'Each word identifies a different part of planning and explaining an investigation.', [1, 3, 8, 10], ['investigate', 'method', 'process', 'factor']),
  twoPart(scienceMath, 6, 'Use meaning and context to choose the precise academic word.', 'Which word best completes this sentence? "Before deciding which design is stronger, we will ___ both shapes with repeated tests."', [
    'investigate', 'conclude', 'select', 'summarize',
  ], 0, 'Why is that word appropriate?', [
    'It means to ask a question and gather information before deciding.',
    'It means to state a final decision before gathering information.',
    'It means to choose one design without testing.',
    'It means to tell only the most important story events.',
  ], 0, 'Investigate fits because the team will gather information with tests before reaching a conclusion.', [1, 16], ['investigate', 'conclude'],),
]

const readingWritingQuestions = [
  mc(readingWriting, 0, 'Which sentence compares how the maps differ rather than only naming a shared feature?', [
    'I contrast the ferry crossing on the older map with the bridge on the newer map.',
    'I contrast the maps by saying both have compass roses.',
    'I contrast the maps by copying both titles.',
    'I contrast the maps by naming only the river they share.',
  ], 0, 'Contrast focuses on a meaningful difference between the two sources.', [4, 11], ['contrast'], 'near-neighbor-distinction'),
  mc(readingWriting, 1, 'Which detail is relevant to the question about how transportation changed?', [
    'The older map shows a ferry dock, while the newer map shows a bridge.',
    'Both maps have decorative borders.',
    'One map title is printed in larger letters.',
    'The compass rose uses a dark arrow.',
  ], 0, 'The ferry and bridge directly help answer how transportation changed.', [1, 2, 8, 9], ['relevant'], 'appropriate-use'),
  mc(readingWriting, 2, 'Which writing sentence appropriately responds to the source question?', [
    'Transportation changed from a ferry crossing to a bridge, as the two maps show.',
    'The weather was probably sunny because I like sunny maps.',
    'The border is blue, so every family must have moved.',
    'I will answer by listing unrelated buildings from another town.',
  ], 0, 'The correct response addresses the question and uses evidence visible in both sources.', [10, 12], ['respond'], 'appropriate-writing-use'),
  multiselect(readingWriting, 3, 'Choose two sentences that appropriately describe a relationship in an academic context.', [
    'The timeline shows a relationship between the storm and the road closing.',
    'The graph shows a relationship between hours traveled and distance.',
    'The relationship proves one event caused another whenever both appear together.',
    'The relationship is the decorative color around a map.',
  ], [0, 1], 'Both correct sentences identify a connection without claiming that connection always proves cause.', [6, 7], ['relationship'], 'cross-subject-transfer'),
  hotText(readingWriting, 4, 'Select the sentence that names one useful map detail and one decorative detail that is not useful.', [5, 8, 9, 15], 2, 'The sentence separates a relevant source detail from a decorative border that does not answer the question.', ['relevant'], 'meaning-in-context'),
  tableMatch(readingWriting, 5, 'Match each source-discussion word to its precise job.', [
    { prompt: 'Show how two sources are different.', options: ['contrast', 'relationship', 'relevant', 'respond'], correctIndex: 0 },
    { prompt: 'A connection between ideas, events, or amounts.', options: ['relevant', 'respond', 'relationship', 'contrast'], correctIndex: 2 },
    { prompt: 'Directly useful for answering the question.', options: ['respond', 'relevant', 'contrast', 'relationship'], correctIndex: 1 },
    { prompt: 'Answer in a way that fits what was asked.', options: ['relationship', 'contrast', 'respond', 'relevant'], correctIndex: 2 },
  ], 'The words distinguish differences, connections, useful details, and answering the task.', [4, 6, 8, 10], ['contrast', 'relationship', 'relevant', 'respond']),
  twoPart(readingWriting, 6, 'Choose the precise word and the reason it fits.', 'Which word best completes this sentence? "The bridge label is ___ because it helps answer how transportation changed."', [
    'relevant', 'accurate', 'decorative', 'unrelated',
  ], 0, 'Why is the word you chose in Part A appropriate?', [
    'The label is directly connected to the question and useful for answering it.',
    'The label must be correct merely because it appears on a map.',
    'The label is visually interesting but does not answer the question.',
    'The label belongs to a different topic.',
  ], 0, 'Relevant names information that directly helps answer the current source question.', [8, 9], ['relevant', 'accurate']),
]

const acrossSubjectsQuestions = [
  mc(acrossSubjects, 0, 'Which action correctly classifies the survey answers?', [
    'Group each answer by the plant purpose it names.',
    'Place each answer into a random pile.',
    'Place the papers in the order they were collected.',
    'Choose one favorite answer and ignore the rest.',
  ], 0, 'Classifying uses a stated shared feature to place items into groups.', [2, 3], ['classify', 'organize'], 'near-neighbor-distinction'),
  mc(acrossSubjects, 1, 'Which sentence uses select rather than determine?', [
    'The team will select two results from the available survey findings for its presentation.',
    'The team will determine the total by adding every survey mark.',
    'The team will analyze the graph for a pattern.',
    'The team will classify all answers by plant purpose.',
  ], 0, 'Select means choose carefully from options; determine means find an answer by checking information.', [5, 6], ['select', 'determine'], 'near-neighbor-distinction'),
  mc(acrossSubjects, 2, 'Which sentence correctly identifies the project outcome?', [
    'The outcome was a clear garden recommendation supported by the survey.',
    'The outcome was the first question written before the survey began.',
    'The outcome was the blank chart waiting for information.',
    'The outcome was the method planned before any answers were counted.',
  ], 0, 'An outcome is what happens after the action or process is completed.', [13, 14], ['outcome'], 'meaning-in-context'),
  multiselect(acrossSubjects, 3, 'Choose two sentences that appropriately use demonstrate in speaking or writing.', [
    'Speaking: I will demonstrate how the model places tall plants behind short plants.',
    'Writing: The graph demonstrates which groups received the most requests.',
    'Speaking: The blank page demonstrates every step clearly.',
    'Writing: The title demonstrates the result without showing any information.',
  ], [0, 1], 'The model and graph both show an idea clearly with visible information.', [9, 10], ['demonstrate'], 'speaking-writing-transfer'),
  hotText(acrossSubjects, 4, 'Select the sentence that shows the team using a stated grouping rule.', [2, 5, 9, 13], 0, 'The team classifies answers by plant purpose, a clear shared feature.', ['classify'], 'meaning-in-context'),
  tableMatch(acrossSubjects, 5, 'Match each project word to its academic function.', [
    { prompt: 'Group items by shared features.', options: ['classify', 'select', 'demonstrate', 'outcome'], correctIndex: 0 },
    { prompt: 'Choose carefully from available options.', options: ['demonstrate', 'outcome', 'select', 'classify'], correctIndex: 2 },
    { prompt: 'Show an idea clearly with a model or evidence.', options: ['outcome', 'demonstrate', 'classify', 'select'], correctIndex: 1 },
    { prompt: 'What happens after an action or process.', options: ['select', 'classify', 'outcome', 'demonstrate'], correctIndex: 2 },
  ], 'Each word names a different project-planning or presentation job.', [2, 5, 9, 13], ['classify', 'select', 'demonstrate', 'outcome']),
  twoPart(acrossSubjects, 6, 'Choose the precise academic word and a frame that uses it correctly.', 'Which word best completes this sentence? "From the available charts, we will ___ the one that makes the survey pattern clearest."', [
    'select', 'determine', 'classify', 'outcome',
  ], 0, 'Which frame correctly uses the word you chose in Part A?', [
    'I selected ___ because it best shows ___.',
    'I determined ___ by calculating the exact total.',
    'I classified ___ by its shared feature.',
    'The outcome was ___ after the work ended.',
  ], 0, 'Select is the precise verb for choosing carefully among available chart options.', [5, 6], ['select', 'determine', 'classify', 'outcome']),
]

export const grade3AcademicWordWorkshopQuestions: ReadingQuestion[] = [
  ...schoolThinkingQuestions,
  ...preciseWordQuestions,
  ...explainSupportQuestions,
  ...organizeReviseQuestions,
  ...scienceMathQuestions,
  ...readingWritingQuestions,
  ...acrossSubjectsQuestions,
]
