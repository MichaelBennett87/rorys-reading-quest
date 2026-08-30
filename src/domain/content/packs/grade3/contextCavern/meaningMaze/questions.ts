import type { ReadingQuestion } from '../../../../types'
import { grade3MeaningMazeArtifacts } from './content'
import {
  grade3MeaningMazeLessonIds,
  grade3MeaningMazeQuestionIds,
} from './ids'
import {
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
  createTwoPartQuestion,
  lessonChoice,
} from './questionFactories'

type ArtifactKey = keyof typeof grade3MeaningMazeArtifacts
type QuestionContext = {
  artifactKey: ArtifactKey
  lessonId: string
  questionIds: readonly string[]
  difficulty: 2 | 3
  genre: 'informational' | 'literary' | 'poetry'
}

const contexts = {
  context: { artifactKey: 'contextClueCompass', lessonId: grade3MeaningMazeLessonIds.contextClueCompass, questionIds: grade3MeaningMazeQuestionIds.contextClueCompass, difficulty: 2, genre: 'informational' },
  relationship: { artifactKey: 'relationshipRopes', lessonId: grade3MeaningMazeLessonIds.relationshipRopes, questionIds: grade3MeaningMazeQuestionIds.relationshipRopes, difficulty: 2, genre: 'literary' },
  reference: { artifactKey: 'referenceToolRoom', lessonId: grade3MeaningMazeLessonIds.referenceToolRoom, questionIds: grade3MeaningMazeQuestionIds.referenceToolRoom, difficulty: 3, genre: 'informational' },
  background: { artifactKey: 'backgroundKnowledgeBridge', lessonId: grade3MeaningMazeLessonIds.backgroundKnowledgeBridge, questionIds: grade3MeaningMazeQuestionIds.backgroundKnowledgeBridge, difficulty: 3, genre: 'literary' },
  senses: { artifactKey: 'moreThanOneDoor', lessonId: grade3MeaningMazeLessonIds.moreThanOneDoor, questionIds: grade3MeaningMazeQuestionIds.moreThanOneDoor, difficulty: 3, genre: 'informational' },
  figurative: { artifactKey: 'figurativePhrasePaths', lessonId: grade3MeaningMazeLessonIds.figurativePhrasePaths, questionIds: grade3MeaningMazeQuestionIds.figurativePhrasePaths, difficulty: 3, genre: 'poetry' },
  combined: { artifactKey: 'unknownWordsPhrases', lessonId: grade3MeaningMazeLessonIds.unknownWordsPhrases, questionIds: grade3MeaningMazeQuestionIds.unknownWordsPhrases, difficulty: 3, genre: 'informational' },
} satisfies Record<string, QuestionContext>

const patterns = [
  'context-clues', 'figurative-language', 'word-relationships', 'reference-materials',
  'background-knowledge', 'multiple-meaning-words', 'unknown-words', 'unknown-phrases',
]

const evidence = (context: QuestionContext, ...oneBasedIndexes: number[]) =>
  oneBasedIndexes.map((index) => grade3MeaningMazeArtifacts[context.artifactKey].sentenceIds[index - 1]!)
const text = (context: QuestionContext, oneBasedIndex: number) =>
  grade3MeaningMazeArtifacts[context.artifactKey].passage.sentences![oneBasedIndex - 1]!.text
const passageId = (context: QuestionContext) => grade3MeaningMazeArtifacts[context.artifactKey].passage.passageIdentifier

const choices = (questionId: string, values: string[]) => values.map((value, index) => lessonChoice(`${questionId}-choice-${index + 1}`, value))
const base = (context: QuestionContext, index: number, prompt: string, explanation: string, evidenceReferenceIds: string[], targetVocabulary: string[], tags: string[]) => ({
  difficulty: context.difficulty,
  genre: context.genre,
  passageIdentifier: passageId(context),
  lessonIdentifier: context.lessonId,
  questionIdentifier: context.questionIds[index]!,
  prompt,
  explanation,
  evidenceReferenceIds,
  targetVocabulary,
  tags: [...patterns, ...tags],
})

const mc = (context: QuestionContext, index: number, prompt: string, values: string[], correctIndex: number, explanation: string, refs: number[], vocabulary: string[], tags: string[]) => {
  const questionChoices = choices(context.questionIds[index]!, values)
  return createMultipleChoiceQuestion({ ...base(context, index, prompt, explanation, evidence(context, ...refs), vocabulary, tags), choices: questionChoices, correctChoiceIds: [questionChoices[correctIndex]!.id] })
}

const multi = (context: QuestionContext, index: number, prompt: string, values: string[], correctIndexes: number[], explanation: string, refs: number[], vocabulary: string[], tags: string[]) => {
  const questionChoices = choices(context.questionIds[index]!, values)
  return createMultiselectQuestion({ ...base(context, index, prompt, explanation, evidence(context, ...refs), vocabulary, tags), choices: questionChoices, correctChoiceIds: correctIndexes.map((choiceIndex) => questionChoices[choiceIndex]!.id) })
}

const hot = (context: QuestionContext, index: number, prompt: string, sentenceIndexes: number[], correctIndex: number, explanation: string, vocabulary: string[], tags: string[]) => {
  const questionId = context.questionIds[index]!
  return createHotTextQuestion({
    ...base(context, index, prompt, explanation, evidence(context, ...sentenceIndexes), vocabulary, tags),
    selectableSegments: sentenceIndexes.map((sentenceIndex, segmentIndex) => ({ id: `${questionId}-segment-${segmentIndex + 1}`, text: text(context, sentenceIndex) })),
    correctSegmentIds: [`${questionId}-segment-${correctIndex + 1}`],
  })
}

const table = (context: QuestionContext, index: number, prompt: string, rowPrompts: string[], meanings: string[], correctIndexes: number[], explanation: string, refs: number[], vocabulary: string[]) => {
  const questionId = context.questionIds[index]!
  const sharedChoices = choices(`${questionId}-meaning`, meanings)
  return createTableMatchQuestion({
    ...base(context, index, prompt, explanation, evidence(context, ...refs), vocabulary, ['strategy-synthesis']),
    selectionMode: 'use_each_once',
    rows: rowPrompts.map((rowPrompt, rowIndex) => ({
      id: `${questionId}-row-${rowIndex + 1}`,
      prompt: rowPrompt,
      correctChoiceId: sharedChoices[correctIndexes[rowIndex]!]!.id,
      options: sharedChoices,
    })),
  })
}

const twoPart = (context: QuestionContext, index: number, prompt: string, partAPrompt: string, aValues: string[], aCorrect: number, partBPrompt: string, bValues: string[], bCorrect: number, explanation: string, refs: number[], vocabulary: string[]) => {
  const questionId = context.questionIds[index]!
  const partAChoices = choices(`${questionId}-a`, aValues)
  const partBChoices = choices(`${questionId}-b`, bValues)
  return createTwoPartQuestion({
    ...base(context, index, prompt, explanation, evidence(context, ...refs), vocabulary, ['two-part-evidence']),
    partAPrompt, partAChoices, partACorrectChoiceId: partAChoices[aCorrect]!.id,
    partBPrompt, partBChoices, partBCorrectChoiceId: partBChoices[bCorrect]!.id,
  })
}

const contextQuestions: ReadingQuestion[] = [
  mc(contexts.context, 0, 'What does nocturnal mean in the garden report?', ['active at night', 'hidden under soil', 'brightly colored', 'unable to fly'], 0, 'The definition and after-dark examples show that nocturnal animals are active at night.', [1, 2, 3], ['nocturnal'], ['definition-clue']),
  mc(contexts.context, 1, 'Which meaning of saturated fits the sponge?', ['completely soaked with water', 'covered with dry dust', 'light enough to float', 'cut into equal pieces'], 0, 'The rain-soaked sponge drips when lifted, showing that it is completely soaked.', [6, 9], ['saturated'], ['cause-effect-clue']),
  multi(contexts.context, 2, 'Choose two details that help explain the unfamiliar words. Select two.', ['Drowsy is restated as sleepy enough to yawn.', 'Only a small amount of dry soil could be found.', 'The students saved their notes.', 'The tubs stood beside garden beds.'], [0, 1], 'The restatement explains drowsy, and the amount detail confirms scarce.', [4, 7, 8], ['drowsy', 'scarce'], ['context-evidence']),
  hot(contexts.context, 3, 'Select the sentence that uses a contrast to explain scarce.', [4, 7, 9, 10], 1, 'Plentiful water contrasts with scarce dry soil, signaling opposite amounts.', ['scarce'], ['contrast-clue']),
  table(contexts.context, 4, 'Match each word to the meaning supported by the report.', ['nocturnal', 'drowsy', 'scarce', 'saturated'], ['active at night', 'sleepy', 'available only in a small amount', 'completely soaked'], [0, 1, 2, 3], 'Each meaning is supported by a different local context clue.', [2, 4, 7, 9], ['nocturnal', 'drowsy', 'scarce', 'saturated']),
]

const relationshipQuestions: ReadingQuestion[] = [
  mc(contexts.relationship, 0, 'Which word relationship best helps explain swift?', ['Quick is a synonym for swift.', 'Quick is an antonym for swift.', 'Quick is part of a rabbit.', 'Quick is the function of a gate.'], 0, 'Quick and swift both describe fast movement in this scene.', [2], ['swift'], ['synonym']),
  mc(contexts.relationship, 1, 'What does hinge mean in the story?', ['a jointed part that lets a gate swing', 'a young tree beside a path', 'an animal that moves quickly', 'a latch that frightens a fawn'], 0, 'The story states the hinge’s function and shows that repairing it lets the gate move.', [8, 9, 10], ['hinge'], ['object-function']),
  multi(contexts.relationship, 2, 'Choose two accurate relationship clues. Select two.', ['A sapling is a member of the tree category.', 'Bold contrasts with timid.', 'A hinge is a kind of rabbit.', 'Swift means slower than quick.'], [0, 1], 'Category membership helps with sapling, and the antonym bold helps with timid.', [3, 4, 5, 6], ['sapling', 'timid'], ['category-member', 'antonym']),
  hot(contexts.relationship, 3, 'Select the sentence that confirms timid means shy or easily frightened.', [2, 4, 6, 9], 2, 'The fawn takes one careful step and pulls back instead of acting boldly.', ['timid'], ['relationship-evidence']),
  table(contexts.relationship, 4, 'Match each target to the relationship that helps unlock it.', ['swift', 'timid', 'sapling', 'hinge'], ['synonym: quick', 'antonym: bold', 'category-member: tree', 'object-function: lets a gate swing'], [0, 1, 2, 3], 'The four relationships supply different kinds of meaning help.', [2, 4, 6, 8], ['swift', 'timid', 'sapling', 'hinge']),
]

const referenceQuestions: ReadingQuestion[] = [
  mc(contexts.reference, 0, 'Which local reference meaning fits habitat?', ['a place providing what an organism needs to live', 'a path used to travel between places', 'a holiday people honor', 'a list of questions for a walk'], 0, 'The glossary meaning fits the reeds, water, and fallen log near the pond.', [2, 3, 10], ['habitat'], ['glossary']),
  mc(contexts.reference, 1, 'Which dictionary sense of observe fits the pond directions?', ['to watch carefully and notice details', 'to honor a holiday or custom', 'to build a shelter', 'to choose a map route'], 0, 'Watching and recording without touching animals selects the careful-watching sense.', [6, 7, 11, 13], ['observe'], ['dictionary-sense']),
  multi(contexts.reference, 2, 'Choose one reference clue and one source clue that support the meaning of route. Select two.', ['The glossary says route is a path used to travel.', 'The map line runs from the garden to the pond.', 'The dictionary says observe can mean honor a holiday.', 'The final pond path is shaded.'], [0, 1], 'The glossary and mapped path work together to establish the travel-path meaning.', [4, 5, 10], ['route'], ['reference-plus-context']),
  hot(contexts.reference, 3, 'Select the sentence that shows what in contrast means in this source.', [4, 6, 8, 12], 2, 'The sentence pairs wide with narrow and sunny with shaded to show differences.', ['in contrast'], ['unknown-phrase']),
  table(contexts.reference, 4, 'Match each target to the most useful meaning tool.', ['habitat', 'route', 'observe', 'in contrast'], ['glossary definition of a living place', 'glossary definition of a travel path', 'dictionary sense plus watching context', 'opposite descriptions in nearby text'], [0, 1, 2, 3], 'The local tools and source clues are matched to the target they actually support.', [2, 4, 6, 8], ['habitat', 'route', 'observe', 'in contrast']),
]

const backgroundQuestions: ReadingQuestion[] = [
  mc(contexts.background, 0, 'What does sturdy mean in the story?', ['strong and unlikely to bend or fall', 'bright enough to guide a helper', 'covered by leaves and branches', 'finished in the planned order'], 0, 'The post stays firm during a push test, unlike the cracked, leaning post.', [5, 6, 12], ['sturdy'], ['background-confirmed']),
  mc(contexts.background, 1, 'What does carry out the plan mean here?', ['perform the planned actions', 'lift the paper map', 'carry every post at once', 'change the plan without checking it'], 0, 'The next sentence lists the steps the team performs from start to finish.', [9, 10, 14], ['carry out the plan'], ['unknown-phrase']),
  multi(contexts.background, 2, 'Choose two cases where broad knowledge helps and the story confirms it. Select two.', ['A firm post usually holds up well, and this one stays steady when pushed.', 'A visible flag can send a message, and the helper responds to it.', 'Every leafy branch is called a signal.', 'Carrying a map always means completing a plan.'], [0, 1], 'The post test confirms sturdy, and the helper’s response confirms signal.', [5, 7, 8, 12, 13], ['sturdy', 'signal'], ['background-knowledge']),
  hot(contexts.background, 3, 'Select the sentence that names the parts making up the canopy.', [2, 3, 7, 10], 1, 'The leafy upper layer formed by branches identifies the canopy’s parts and location.', ['canopy'], ['part-whole']),
  table(contexts.background, 4, 'Match each target to its meaning in the story.', ['canopy', 'sturdy', 'signal', 'carry out the plan'], ['upper layer of leaves and branches', 'strong and steady', 'a sign or action that communicates', 'perform the planned actions'], [0, 1, 2, 3], 'Each meaning fits both broad knowledge and specific story evidence.', [3, 5, 7, 9], ['canopy', 'sturdy', 'signal', 'carry out the plan']),
]

const senseQuestions: ReadingQuestion[] = [
  mc(contexts.senses, 0, 'Which meaning of bank fits the stream study?', ['land beside water', 'a place that keeps money', 'a row of switches', 'to tilt an airplane'], 0, 'The stream, grassy land, and shore details select the land-beside-water sense.', [2, 3], ['bank'], ['multiple-meaning']),
  mc(contexts.senses, 1, 'Which dictionary sense of draft fits Ana’s report?', ['an early version of writing', 'a current of cool air', 'a group chosen for a team', 'the depth of a boat'], 0, 'Ana writes the draft before revising a final copy, selecting the writing sense.', [6, 7, 8], ['draft'], ['dictionary-sense']),
  mc(contexts.senses, 2, 'In a new schedule, the sentence says, “The current meeting time is 2:00.” Which strategy best confirms that current means happening now?', ['Compare the possible senses with the complete schedule sentence.', 'Choose the water sense because it appeared in the source.', 'Split current into roots and ignore the sentence.', 'Select the longest dictionary meaning without checking context.'], 0, 'The fresh schedule context selects the happening-now sense, showing that readers must compare genuine senses with the complete sentence.', [4, 5, 13, 15], ['current'], ['transfer', 'strategy-selection']),
  multi(contexts.senses, 3, 'Choose two details that support the map meaning of scale. Select two.', ['One centimeter represents ten real meters.', 'The word appears on a map.', 'A fish has small plates on its skin.', 'A device can measure weight.'], [0, 1], 'The map setting and distance rule support the map-scale sense; the other facts name different senses.', [9, 10, 11], ['scale'], ['combined-strategy']),
  hot(contexts.senses, 4, 'Select the sentence that confirms draft means an early version of writing.', [2, 4, 6, 9], 2, 'Writing a draft before revising a final copy confirms the early-version sense.', ['draft'], ['context-evidence']),
  table(contexts.senses, 5, 'Match each word to its contextual sense.', ['bank', 'current', 'draft', 'scale'], ['land beside water', 'moving water', 'early writing version', 'map distance rule'], [0, 1, 2, 3], 'Topic, grammar, examples, and the local dictionary select one sense for each word.', [2, 4, 6, 9], ['bank', 'current', 'draft', 'scale']),
  twoPart(contexts.senses, 6, 'Use the local dictionary and the source together.', 'Which meaning of draft fits the source?', ['an early version of writing', 'a current of cool air', 'a boat depth', 'a selected group'], 0, 'Which detail best confirms that meaning?', ['Ana revises it into a final copy.', 'The class stands beside a stream.', 'A leaf moves downstream.', 'The map uses centimeters.'], 0, 'The writing sense and later revision directly support each other.', [6, 7, 8], ['draft']),
]

const figurativeQuestions: ReadingQuestion[] = [
  mc(contexts.figurative, 0, 'What does a blanket of fog mean in the poem?', ['thick fog covered the view', 'a cloth blanket lay on the trail', 'snow covered every stone', 'the group slept beside the path'], 0, 'The path is hidden until warm light thins the gray fog.', [1, 2, 4, 5], ['a blanket of fog'], ['figurative-meaning']),
  mc(contexts.figurative, 1, 'What does the idea took root mean?', ['the group accepted and developed the idea', 'the idea became a plant', 'roots blocked the trail', 'Mira forgot the idea'], 0, 'Everyone adds a useful step, and the plan begins to grow.', [7, 8, 9, 11, 12], ['the idea took root'], ['figurative-meaning']),
  mc(contexts.figurative, 2, 'A new project note says, “The plan hit a snag when the only wheel cracked.” Which strategy best confirms the phrase means the plan met a problem?', ['Combine the cracked-wheel result with the project context.', 'Picture a paper plan caught on a sharp branch.', 'Name a figurative device without checking the event.', 'Use only the familiar meaning of the word hit.'], 0, 'The cracked wheel interrupts the project, so event context confirms a problem and rejects the literal branch reading.', [13, 14, 15, 16], ['the plan hit a snag'], ['transfer', 'strategy-selection', 'literal-reading-rejection']),
  multi(contexts.figurative, 3, 'Choose two clues showing that time slipped away means time passed quickly. Select two.', ['The sun moved low beyond the pines.', 'The final loop was still unfinished.', 'The group opened its map in the morning.', 'The bridge board had washed away.'], [0, 1], 'The low sun and unfinished work show that the available day passed.', [19, 20, 21, 22], ['time slipped away'], ['figurative-context']),
  hot(contexts.figurative, 4, 'Select the line that confirms the idea was accepted and developed by the group.', [8, 10, 12, 17], 2, 'The plan begins to grow after everyone adds a step, confirming the figurative phrase.', ['the idea took root'], ['context-confirmation']),
  table(contexts.figurative, 5, 'Match each phrase to its intended meaning.', ['a blanket of fog', 'the idea took root', 'the plan hit a snag', 'time slipped away'], ['thick fog covered the view', 'the group developed an idea', 'the plan met a problem', 'time passed quickly'], [0, 1, 2, 3], 'Each meaning fits the complete stanza and rejects an impossible literal reading.', [2, 8, 13, 19], ['blanket', 'root', 'snag', 'slipped']),
  twoPart(contexts.figurative, 6, 'Interpret the phrase and confirm it with the poem.', 'What does a blanket of fog mean?', ['thick fog covered the area', 'someone dropped bedding', 'snow filled the path', 'night arrived suddenly'], 0, 'Which line best confirms that meaning?', ['until warm light thinned the gray.', 'We waited by the cedar rail,', 'Everyone added one useful step,', 'Tomorrow we will follow our map,'], 0, 'Light thinning the gray and revealing trail marks confirms that fog covered the view.', [1, 2, 4, 5], ['a blanket of fog']),
]

const combinedQuestions: ReadingQuestion[] = [
  mc(contexts.combined, 0, 'Which meaning of point fits the museum display?', ['a main idea visitors should understand', 'a sharp tip', 'a score in a game', 'an act of aiming a finger'], 0, 'The sentence defines point as an idea, and the next lines supply evidence for it.', [2, 3, 4], ['point'], ['multiple-meaning']),
  mc(contexts.combined, 1, 'Which meaning of track fits the heron sentence?', ['a line of prints left by the bird', 'a racing path', 'a music recording', 'a school subject plan'], 0, 'The damp mud and caption about prints select the animal-mark sense.', [5, 6, 7, 15], ['track'], ['background-confirmed']),
  mc(contexts.combined, 2, 'A new science procedure says, “Measure one plant every two minutes at a steady pace, without rushing.” Which strategy best confirms the phrase?', ['Combine the timing context with the thesaurus words evenly and regularly.', 'Replace the phrase with suddenly because related words are always interchangeable.', 'Use only the word pace and ignore the measurement schedule.', 'Search for a root inside steady instead of reading the sentence.'], 0, 'The repeated timing and without-rushing context agree with the related thesaurus words; related words help, but they are not automatically interchangeable in every sentence.', [8, 9, 16], ['at a steady pace'], ['transfer', 'strategy-selection', 'thesaurus']),
  multi(contexts.combined, 3, 'Choose two clues showing that words painted a picture is figurative. Select two.', ['The caption describes reeds, frogs, and a heron in vivid detail.', 'The source says no paint appeared on the words.', 'The teams measured water depth.', 'The display was placed in a library.'], [0, 1], 'Vivid details create a mental image, while the no-paint statement rejects the literal reading.', [10, 11, 16], ['words painted a picture'], ['figurative-context']),
  hot(contexts.combined, 4, 'Select the sentence that defines point as a main idea in this source.', [2, 5, 8, 10], 0, 'The sentence directly restates point as an idea the team wants visitors to understand.', ['point'], ['definition-clue']),
  table(contexts.combined, 5, 'Match each target to the meaning supported by all available clues.', ['point', 'track', 'words painted a picture', 'at a steady pace'], ['main idea', 'line of animal prints', 'created a clear mental image', 'at a regular speed'], [0, 1, 2, 3], 'Context, broad knowledge, figurative interpretation, and the local thesaurus each support one meaning.', [2, 5, 8, 10], ['point', 'track', 'painted', 'steady']),
  twoPart(contexts.combined, 6, 'Choose the contextual sense and its strongest confirmation.', 'What does track mean here?', ['a line of prints in mud', 'a racing path', 'a sound recording', 'a route for trains'], 0, 'Which detail confirms the sense?', ['The caption names the prints and where the heron walked.', 'The display stands in the library.', 'Writers revise captions without rushing.', 'The class chooses a main point.'], 0, 'The prints in damp mud and the heron’s movement select the animal-track sense.', [5, 6, 7, 15], ['track']),
]

export const grade3MeaningMazeQuestions: ReadingQuestion[] = [
  ...contextQuestions,
  ...relationshipQuestions,
  ...referenceQuestions,
  ...backgroundQuestions,
  ...senseQuestions,
  ...figurativeQuestions,
  ...combinedQuestions,
]
