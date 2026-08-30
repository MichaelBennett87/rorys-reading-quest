import type {
  AcademicSubjectContext,
  Grade3AcademicPartOfSpeech,
  Grade3AcademicVocabularyGuide,
} from '../../../contentPackTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import type {
  InformationalFeature,
  InformationalHeadingFeature,
  InformationalSection,
  InformationalTitleFeature,
} from '../../../../informationalTypes'
import {
  grade3AcademicWordWorkshopContentVersion,
  grade3AcademicWordWorkshopPassageIds,
} from './ids'

export const grade3AcademicWords = [
  'analyze', 'evidence', 'conclude', 'accurate',
  'estimate', 'represent', 'determine', 'justify',
  'infer', 'interpret', 'summarize', 'support',
  'revise', 'clarify', 'organize', 'structure',
  'contrast', 'relationship', 'relevant', 'respond',
  'investigate', 'method', 'process', 'factor',
  'classify', 'select', 'demonstrate', 'outcome',
] as const

export type Grade3AcademicWord = typeof grade3AcademicWords[number]

type PronunciationChunk = {
  displayText: string
  speechText: string
}

type WordInfo = {
  partOfSpeech: Grade3AcademicPartOfSpeech
  focusChunkIndex: number
  childFriendlyMeaning: string
  subjectContexts: readonly AcademicSubjectContext[]
  speakingFrame: string
  writingFrame: string
  appropriateUseExamples: readonly [string, string]
  inappropriateUseExample: string
  inappropriateUseReason: string
  precisionNote: string
  chunks: readonly PronunciationChunk[]
}

export const grade3AcademicWordInfo: Record<Grade3AcademicWord, WordInfo> = {
  analyze: {
    partOfSpeech: 'verb',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'to study parts or details closely so you can understand something',
    subjectContexts: ['science', 'mathematics', 'reading'],
    speakingFrame: 'Let us analyze ___ to find ___.',
    writingFrame: 'I analyze the information by ___.',
    appropriateUseExamples: ['We analyze the chart to find a pattern.', 'Readers analyze details before explaining an idea.'],
    inappropriateUseExample: 'We analyze the ruler so it becomes longer.',
    inappropriateUseReason: 'Studying a ruler does not make the ruler longer.',
    precisionNote: 'Investigate means gather information; analyze means study the information closely.',
    chunks: [{ displayText: 'an', speechText: 'an' }, { displayText: 'a', speechText: 'uh' }, { displayText: 'lyze', speechText: 'lyze' }],
  },
  evidence: {
    partOfSpeech: 'noun',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'information you can point to when explaining why an idea makes sense',
    subjectContexts: ['science', 'reading', 'social-studies'],
    speakingFrame: 'My evidence is ___, which shows ___.',
    writingFrame: 'The evidence supports the idea that ___.',
    appropriateUseExamples: ['The measurements are evidence for our conclusion.', 'The quoted detail is evidence from the text.'],
    inappropriateUseExample: 'My evidence is the blue border, although the question asks about plant growth.',
    inappropriateUseReason: 'A decorative border does not support an answer about plant growth.',
    precisionNote: 'Evidence is information; support describes what useful evidence does for an idea.',
    chunks: [{ displayText: 'ev', speechText: 'ev' }, { displayText: 'i', speechText: 'ih' }, { displayText: 'dence', speechText: 'duhns' }],
  },
  conclude: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to decide what makes sense after considering information',
    subjectContexts: ['science', 'reading', 'mathematics'],
    speakingFrame: 'I conclude that ___ because ___.',
    writingFrame: 'After reviewing the information, I conclude ___.',
    appropriateUseExamples: ['We conclude that shade slowed the melting.', 'Readers conclude that the character changed after checking the ending.'],
    inappropriateUseExample: 'I conclude before I look at any results.',
    inappropriateUseReason: 'A conclusion should come after information has been considered.',
    precisionNote: 'Infer finds an unstated idea from clues; conclude states a decision after considering information.',
    chunks: [{ displayText: 'con', speechText: 'kuhn' }, { displayText: 'clude', speechText: 'klood' }],
  },
  accurate: {
    partOfSpeech: 'adjective',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'correct and free from a mistake that matters for the task',
    subjectContexts: ['science', 'mathematics', 'writing'],
    speakingFrame: 'This answer is accurate because ___.',
    writingFrame: 'I checked that the ___ was accurate.',
    appropriateUseExamples: ['The accurate table copies every measurement correctly.', 'An accurate summary keeps the source meaning.'],
    inappropriateUseExample: 'An estimate is accurate only if it matches the exact count perfectly.',
    inappropriateUseReason: 'A reasonable estimate can be accurate without being exact.',
    precisionNote: 'Accurate means correct for the task; relevant means connected to the question.',
    chunks: [{ displayText: 'ac', speechText: 'ak' }, { displayText: 'cu', speechText: 'yuh' }, { displayText: 'rate', speechText: 'rut' }],
  },
  estimate: {
    partOfSpeech: 'verb',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'to make a reasonable approximate answer before finding the exact one',
    subjectContexts: ['mathematics', 'science', 'engineering'],
    speakingFrame: 'I estimate that there are about ___.',
    writingFrame: 'Before counting, I estimate ___.',
    appropriateUseExamples: ['We estimate the jar holds about 100 buttons.', 'Engineers estimate how much material a model may need.'],
    inappropriateUseExample: 'I estimate the exact total after counting every object twice.',
    inappropriateUseReason: 'After an exact count is known, the answer is determined rather than estimated.',
    precisionNote: 'Estimate gives an approximate answer; determine finds an answer by checking information.',
    chunks: [{ displayText: 'es', speechText: 'es' }, { displayText: 'ti', speechText: 'tuh' }, { displayText: 'mate', speechText: 'mate' }],
  },
  represent: {
    partOfSpeech: 'verb',
    focusChunkIndex: 2,
    childFriendlyMeaning: 'to show or stand for something in another form',
    subjectContexts: ['mathematics', 'science', 'social-studies'],
    speakingFrame: 'Each ___ will represent ___.',
    writingFrame: 'The symbols represent ___.',
    appropriateUseExamples: ['Each square can represent five books.', 'Blue lines represent rivers on the map.'],
    inappropriateUseExample: 'Rulers represent desks by making the desks shorter.',
    inappropriateUseReason: 'A ruler measures the desk; it does not stand for the desk in another form.',
    precisionNote: 'Represent means show something in another form, not simply describe it.',
    chunks: [{ displayText: 'rep', speechText: 'rep' }, { displayText: 're', speechText: 'rih' }, { displayText: 'sent', speechText: 'zent' }],
  },
  determine: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to find out by checking information or using a method',
    subjectContexts: ['mathematics', 'science', 'reading'],
    speakingFrame: 'We determine ___ by ___.',
    writingFrame: 'I used ___ to determine ___.',
    appropriateUseExamples: ['We determine the total by adding the groups.', 'Readers determine the setting by checking story details.'],
    inappropriateUseExample: 'I determine one poster from the available choices because I like its color.',
    inappropriateUseReason: 'Choosing from available options calls for select, not determine.',
    precisionNote: 'Determine finds out; select chooses from available options.',
    chunks: [{ displayText: 'de', speechText: 'dih' }, { displayText: 'ter', speechText: 'tur' }, { displayText: 'mine', speechText: 'min' }],
  },
  justify: {
    partOfSpeech: 'verb',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'to explain why an answer or choice makes sense using reasons or evidence',
    subjectContexts: ['mathematics', 'reading', 'engineering'],
    speakingFrame: 'I can justify my choice with ___.',
    writingFrame: 'I justify the answer by showing ___.',
    appropriateUseExamples: ['Use the equal groups to justify your answer.', 'The details justify choosing the stronger bridge design.'],
    inappropriateUseExample: 'I justify the answer by saying it again with no reason.',
    inappropriateUseReason: 'Repeating an answer without a reason or evidence does not justify it.',
    precisionNote: 'Explain tells how or why; justify specifically uses reasons or evidence to defend an answer.',
    chunks: [{ displayText: 'jus', speechText: 'jus' }, { displayText: 'ti', speechText: 'tuh' }, { displayText: 'fy', speechText: 'fy' }],
  },
  infer: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to figure out an unstated idea from clues and what you know',
    subjectContexts: ['reading', 'science', 'social-studies'],
    speakingFrame: 'I infer ___ from the detail ___.',
    writingFrame: 'From these clues, I infer ___.',
    appropriateUseExamples: ['I infer that the character is worried from her actions.', 'Scientists infer that an animal visited from the tracks.'],
    inappropriateUseExample: 'I infer the title by copying the title exactly.',
    inappropriateUseReason: 'Copying a stated title does not require an inference.',
    precisionNote: 'Infer finds an unstated idea; conclude states a decision after considering information.',
    chunks: [{ displayText: 'in', speechText: 'in' }, { displayText: 'fer', speechText: 'fur' }],
  },
  interpret: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to explain what information, a text, or a display means',
    subjectContexts: ['reading', 'mathematics', 'social-studies'],
    speakingFrame: 'I interpret the ___ to mean ___.',
    writingFrame: 'I interpret the information as ___.',
    appropriateUseExamples: ['We interpret the graph to mean that rainfall increased.', 'Readers interpret the repeated image as a sign of hope.'],
    inappropriateUseExample: 'I interpret the ruler by using it to cut paper.',
    inappropriateUseReason: 'Cutting paper does not explain what information means.',
    precisionNote: 'Analyze studies details; interpret explains the meaning those details communicate.',
    chunks: [{ displayText: 'in', speechText: 'in' }, { displayText: 'ter', speechText: 'tur' }, { displayText: 'pret', speechText: 'prit' }],
  },
  summarize: {
    partOfSpeech: 'verb',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'to tell the most important ideas briefly',
    subjectContexts: ['reading', 'science', 'social-studies'],
    speakingFrame: 'I can summarize the main ideas by saying ___.',
    writingFrame: 'To summarize the text, I will include ___.',
    appropriateUseExamples: ['We summarize the article with its central idea and key details.', 'Scientists summarize the main results of an investigation.'],
    inappropriateUseExample: 'I summarize the chapter by listing every sentence in order.',
    inappropriateUseReason: 'A summary keeps important ideas instead of repeating every detail.',
    precisionNote: 'Analyze studies details; summarize compresses the most important information.',
    chunks: [{ displayText: 'sum', speechText: 'sum' }, { displayText: 'ma', speechText: 'muh' }, { displayText: 'rize', speechText: 'rize' }],
  },
  support: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to make an idea stronger with facts, examples, or reasons',
    subjectContexts: ['reading', 'science', 'writing'],
    speakingFrame: 'This detail can support the idea that ___.',
    writingFrame: 'I support my explanation with ___.',
    appropriateUseExamples: ['Two details support the central idea.', 'The measurements support our conclusion.'],
    inappropriateUseExample: 'A page number cannot support a rainfall claim when it gives no rainfall information.',
    inappropriateUseReason: 'Information supports an idea only when it is connected and useful.',
    precisionNote: 'Evidence is the information; support is what useful information does for an idea.',
    chunks: [{ displayText: 'sup', speechText: 'suh' }, { displayText: 'port', speechText: 'port' }],
  },
  revise: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to change writing or an idea so it becomes clearer or stronger',
    subjectContexts: ['writing', 'reading', 'project-presentation'],
    speakingFrame: 'I will revise ___ by ___.',
    writingFrame: 'I revise the explanation to ___.',
    appropriateUseExamples: ['We revise the paragraph by adding a clear reason.', 'The team will revise its plan after testing the model.'],
    inappropriateUseExample: 'I revise the sentence by reading it again without changing anything.',
    inappropriateUseReason: 'Revising requires a purposeful change.',
    precisionNote: 'Clarify makes meaning easier to understand; revise is the broader act of improving the work.',
    chunks: [{ displayText: 're', speechText: 'rih' }, { displayText: 'vise', speechText: 'vize' }],
  },
  clarify: {
    partOfSpeech: 'verb',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'to make an idea easier to understand',
    subjectContexts: ['writing', 'mathematics', 'project-presentation'],
    speakingFrame: 'I can clarify my idea by ___.',
    writingFrame: 'I use this detail to clarify ___.',
    appropriateUseExamples: ['A label can clarify what each part of a diagram shows.', 'I clarify my reason by naming the evidence.'],
    inappropriateUseExample: 'I clarify the directions by removing the step everyone needs.',
    inappropriateUseReason: 'Removing a necessary step makes the directions less clear.',
    precisionNote: 'Revise means improve through change; clarify names the specific goal of making meaning clearer.',
    chunks: [{ displayText: 'clar', speechText: 'clair' }, { displayText: 'i', speechText: 'uh' }, { displayText: 'fy', speechText: 'fy' }],
  },
  organize: {
    partOfSpeech: 'verb',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'to put ideas or objects into a useful order or groups',
    subjectContexts: ['writing', 'science', 'project-presentation'],
    speakingFrame: 'I organize ___ by ___.',
    writingFrame: 'I organize the information in ___.',
    appropriateUseExamples: ['We organize the notes by topic.', 'Scientists organize measurements in a table.'],
    inappropriateUseExample: 'I organize the steps by placing them in a random order each time.',
    inappropriateUseReason: 'A random order does not create a useful arrangement.',
    precisionNote: 'Organize is broad; classify specifically groups items by shared features.',
    chunks: [{ displayText: 'or', speechText: 'or' }, { displayText: 'ga', speechText: 'guh' }, { displayText: 'nize', speechText: 'nize' }],
  },
  structure: {
    partOfSpeech: 'noun',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'the way parts are arranged and connected',
    subjectContexts: ['writing', 'reading', 'engineering'],
    speakingFrame: 'The structure of ___ has ___ first and ___ next.',
    writingFrame: 'The structure of my report includes ___.',
    appropriateUseExamples: ['The report structure has an opening, reasons, and a closing.', 'The bridge structure connects the deck to two supports.'],
    inappropriateUseExample: 'The structure is the red pencil I used to write the title.',
    inappropriateUseReason: 'A pencil is a tool, not the arrangement of a report or design.',
    precisionNote: 'Organize is the action; structure is the resulting arrangement of connected parts.',
    chunks: [{ displayText: 'struc', speechText: 'struk' }, { displayText: 'ture', speechText: 'chur' }],
  },
  contrast: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to show how two things are different',
    subjectContexts: ['social-studies', 'reading', 'science'],
    speakingFrame: 'I contrast ___ with ___ by explaining ___.',
    writingFrame: 'I contrast ___ with ___ by showing ___.',
    appropriateUseExamples: ['We contrast the two maps by naming how the borders changed.', "Readers contrast the characters' choices."],
    inappropriateUseExample: 'I contrast the two plans by listing only what they share.',
    inappropriateUseReason: 'Contrast focuses on differences, not similarities alone.',
    precisionNote: 'Compare can include similarities and differences; contrast focuses on differences.',
    chunks: [{ displayText: 'con', speechText: 'kuhn' }, { displayText: 'trast', speechText: 'trast' }],
  },
  relationship: {
    partOfSpeech: 'noun',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'a connection between ideas, events, or amounts',
    subjectContexts: ['social-studies', 'mathematics', 'science'],
    speakingFrame: 'The relationship between ___ and ___ is ___.',
    writingFrame: 'The graph shows a relationship between ___.',
    appropriateUseExamples: ['The timeline shows a relationship between the storm and the road closing.', 'The graph shows a relationship between hours and distance.'],
    inappropriateUseExample: 'A relationship between two events always proves that one caused the other.',
    inappropriateUseReason: 'A connection does not always prove cause and effect.',
    precisionNote: 'A relationship is a connection; it does not automatically prove that one thing caused another.',
    chunks: [{ displayText: 're', speechText: 'ree' }, { displayText: 'la', speechText: 'lay' }, { displayText: 'tion', speechText: 'shun' }, { displayText: 'ship', speechText: 'ship' }],
  },
  relevant: {
    partOfSpeech: 'adjective',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'directly connected to the question and useful for answering it',
    subjectContexts: ['reading', 'social-studies', 'science'],
    speakingFrame: 'This detail is relevant because ___.',
    writingFrame: 'I included the relevant fact that ___.',
    appropriateUseExamples: ['The rainfall total is relevant to a question about flooding.', 'A date is relevant when explaining the order of events.'],
    inappropriateUseExample: 'The map border is relevant to the question about why the town moved, although it gives no information about the move.',
    inappropriateUseReason: 'A decorative border does not help answer why the town moved.',
    precisionNote: 'Relevant means useful for this question; accurate means correct.',
    chunks: [{ displayText: 'rel', speechText: 'rel' }, { displayText: 'e', speechText: 'uh' }, { displayText: 'vant', speechText: 'vunt' }],
  },
  respond: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to answer or react in a way that fits what was asked',
    subjectContexts: ['reading', 'writing', 'social-studies'],
    speakingFrame: 'I will respond to the question by ___.',
    writingFrame: 'In my paragraph, I respond to ___.',
    appropriateUseExamples: ['Students respond to the source question with evidence.', 'The team will respond to feedback by revising the plan.'],
    inappropriateUseExample: 'I respond to a question about causes by writing an unrelated weather fact.',
    inappropriateUseReason: 'A response should address what was asked.',
    precisionNote: 'Respond means answer or react; summarize means briefly state the most important ideas.',
    chunks: [{ displayText: 're', speechText: 'rih' }, { displayText: 'spond', speechText: 'spond' }],
  },
  investigate: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to ask questions and gather information to learn more',
    subjectContexts: ['science', 'engineering', 'social-studies'],
    speakingFrame: 'We will investigate whether ___.',
    writingFrame: 'Our team will investigate ___ by ___.',
    appropriateUseExamples: ['Engineers investigate which paper shape holds the most weight.', 'Historians investigate a question by examining sources.'],
    inappropriateUseExample: 'We investigate which design works best by choosing one before any test.',
    inappropriateUseReason: 'An investigation gathers information instead of deciding before testing.',
    precisionNote: 'Investigate gathers information; analyze studies the information already gathered.',
    chunks: [{ displayText: 'in', speechText: 'in' }, { displayText: 'ves', speechText: 'ves' }, { displayText: 'ti', speechText: 'tuh' }, { displayText: 'gate', speechText: 'gate' }],
  },
  method: {
    partOfSpeech: 'noun',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'a chosen way to do a task',
    subjectContexts: ['science', 'engineering', 'mathematics'],
    speakingFrame: 'Our method was to ___.',
    writingFrame: 'The method we used was ___.',
    appropriateUseExamples: ['Our method was to test one bridge at a time.', 'Repeated addition is one method for finding the total.'],
    inappropriateUseExample: 'The method is every change that happened from seed to flower.',
    inappropriateUseReason: 'A series of changes is a process, not a chosen way to complete a task.',
    precisionNote: 'A method is a chosen way; a process is a series of steps or changes.',
    chunks: [{ displayText: 'meth', speechText: 'meth' }, { displayText: 'od', speechText: 'ud' }],
  },
  process: {
    partOfSpeech: 'noun',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'a series of steps or changes that happen in an order',
    subjectContexts: ['science', 'engineering', 'writing'],
    speakingFrame: 'The process begins with ___ and ends with ___.',
    writingFrame: 'I explained each step in the process.',
    appropriateUseExamples: ['The design process includes planning, testing, and improving.', 'Plant growth is a process with connected changes over time.'],
    inappropriateUseExample: 'The process is the single ruler our team chose to measure with.',
    inappropriateUseReason: 'One chosen tool is not a series of ordered steps or changes.',
    precisionNote: 'A process is the ordered series; a method is one chosen way to do the work.',
    chunks: [{ displayText: 'proc', speechText: 'prah' }, { displayText: 'ess', speechText: 'sess' }],
  },
  factor: {
    partOfSpeech: 'noun',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'one thing that can affect a result',
    subjectContexts: ['science', 'engineering', 'project-presentation'],
    speakingFrame: 'One factor that affected the outcome was ___.',
    writingFrame: 'We kept the factor of ___ the same.',
    appropriateUseExamples: ['Wind was one factor that affected the paper model.', 'Time can be a factor when choosing a method.'],
    inappropriateUseExample: 'The title is a factor that changed how much weight the bridge held.',
    inappropriateUseReason: 'A title does not affect the bridge strength.',
    precisionNote: 'A factor may affect a result, but one observation does not automatically prove it caused the result.',
    chunks: [{ displayText: 'fac', speechText: 'fak' }, { displayText: 'tor', speechText: 'tur' }],
  },
  classify: {
    partOfSpeech: 'verb',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'to put things into groups using shared features',
    subjectContexts: ['science', 'mathematics', 'project-presentation'],
    speakingFrame: 'I classify the items by ___.',
    writingFrame: 'We classify each example according to ___.',
    appropriateUseExamples: ['Students classify rocks by visible features.', 'The team will classify survey answers by topic.'],
    inappropriateUseExample: 'I classify the cards by putting each one into a random pile.',
    inappropriateUseReason: 'Classification uses a stated shared feature, not random placement.',
    precisionNote: 'Organize makes a useful arrangement; classify specifically groups by shared features.',
    chunks: [{ displayText: 'clas', speechText: 'clas' }, { displayText: 'si', speechText: 'suh' }, { displayText: 'fy', speechText: 'fy' }],
  },
  select: {
    partOfSpeech: 'verb',
    focusChunkIndex: 1,
    childFriendlyMeaning: 'to choose carefully from available options',
    subjectContexts: ['project-presentation', 'writing', 'engineering'],
    speakingFrame: 'I select ___ because ___.',
    writingFrame: 'We select the example that best shows ___.',
    appropriateUseExamples: ['Select the chart that makes the pattern clear.', 'The team will select one material after comparing the tests.'],
    inappropriateUseExample: 'I select the exact total by adding the numbers.',
    inappropriateUseReason: 'Adding finds or determines a total; it does not choose among options.',
    precisionNote: 'Select chooses from options; determine finds an answer by checking information.',
    chunks: [{ displayText: 'se', speechText: 'suh' }, { displayText: 'lect', speechText: 'lekt' }],
  },
  demonstrate: {
    partOfSpeech: 'verb',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'to show something clearly with an action, example, model, or evidence',
    subjectContexts: ['project-presentation', 'mathematics', 'science'],
    speakingFrame: 'I will demonstrate how ___.',
    writingFrame: 'The model can demonstrate ___.',
    appropriateUseExamples: ['A model can demonstrate how water moves downhill.', 'Counters demonstrate why the equation is true.'],
    inappropriateUseExample: 'A blank page cannot demonstrate every step of the process.',
    inappropriateUseReason: 'A blank page does not show the steps clearly.',
    precisionNote: 'Demonstrate shows clearly; justify explains why a choice or answer makes sense.',
    chunks: [{ displayText: 'dem', speechText: 'dem' }, { displayText: 'on', speechText: 'un' }, { displayText: 'strate', speechText: 'strate' }],
  },
  outcome: {
    partOfSpeech: 'noun',
    focusChunkIndex: 0,
    childFriendlyMeaning: 'what happens at the end of an action or process',
    subjectContexts: ['science', 'engineering', 'project-presentation'],
    speakingFrame: 'The outcome was ___ because ___.',
    writingFrame: 'The project outcome showed ___.',
    appropriateUseExamples: ['The outcome was a stronger bridge after revision.', 'The experiment outcome matched the prediction.'],
    inappropriateUseExample: 'The outcome is the first step we plan to try tomorrow.',
    inappropriateUseReason: 'An outcome is a result, not a step planned before the work.',
    precisionNote: 'Outcome and result both name what happens after the work.',
    chunks: [{ displayText: 'out', speechText: 'out' }, { displayText: 'come', speechText: 'kum' }],
  },
}

type PassageKey = keyof typeof grade3AcademicWordWorkshopPassageIds

type PassagePlan = {
  key: PassageKey
  title: string
  readingContext: string
  sectionHeadings: readonly [string, string]
  firstSectionSentenceCount: number
  sentences: readonly string[]
  targets: readonly { word: Grade3AcademicWord; sentenceIndex: number }[]
}

export type Grade3AcademicVocabularyArtifact = {
  passage: Passage
  guide: Grade3AcademicVocabularyGuide
  sentenceIds: string[]
  targetSentenceIds: Record<string, string>
}

const createTitle = (featureId: string, text: string): InformationalTitleFeature => ({ featureId, kind: 'title', text })
const createHeading = (featureId: string, sectionId: string, text: string): InformationalHeadingFeature => ({
  featureId,
  kind: 'heading',
  sectionId,
  text,
})

function makeSupportTarget(
  passageId: string,
  sentenceId: string,
  sentenceText: string,
  word: Grade3AcademicWord,
): WordSupportTarget {
  const chunks = grade3AcademicWordInfo[word].chunks
  return {
    targetId: `${passageId}-${word}`,
    passageId,
    sentenceId,
    surfaceWord: word,
    focusParts: chunks.map((chunk, index) => ({
      text: chunk.displayText,
      emphasis: index === grade3AcademicWordInfo[word].focusChunkIndex,
    })),
    displayChunks: chunks.map((chunk) => ({ ...chunk })),
    spokenChunks: chunks.map((chunk) => ({ ...chunk })),
    blendSpeechText: word,
    wholeWordSpeechText: word,
    sentenceSpeechText: sentenceText,
    reviewStatus: 'DRAFT',
    contentVersion: grade3AcademicWordWorkshopContentVersion,
  }
}

function buildArtifact(plan: PassagePlan): Grade3AcademicVocabularyArtifact {
  const passageId = grade3AcademicWordWorkshopPassageIds[plan.key]
  const sentenceIds = plan.sentences.map((_, index) => `${passageId}-sentence-${index + 1}`)
  const sentences = plan.sentences.map((text, index) => ({ sentenceId: sentenceIds[index], text }))
  const titleFeatureId = `${passageId}-title`
  const firstSectionId = `${passageId}-section-1`
  const secondSectionId = `${passageId}-section-2`
  const firstHeadingId = `${passageId}-heading-1`
  const secondHeadingId = `${passageId}-heading-2`
  const features: InformationalFeature[] = [
    createTitle(titleFeatureId, plan.title),
    createHeading(firstHeadingId, firstSectionId, plan.sectionHeadings[0]),
    createHeading(secondHeadingId, secondSectionId, plan.sectionHeadings[1]),
  ]
  const sections: InformationalSection[] = [
    {
      sectionId: firstSectionId,
      headingFeatureId: firstHeadingId,
      sentenceIds: sentenceIds.slice(0, plan.firstSectionSentenceCount),
      featureIds: [],
    },
    {
      sectionId: secondSectionId,
      headingFeatureId: secondHeadingId,
      sentenceIds: sentenceIds.slice(plan.firstSectionSentenceCount),
      featureIds: [],
    },
  ]
  const targetSentenceIds = Object.fromEntries(
    plan.targets.map(({ word, sentenceIndex }) => [word, sentenceIds[sentenceIndex]]),
  )

  const passage: Passage = {
    passageIdentifier: passageId,
    gradeBand: 3,
    contentKind: 'informational',
    passageText: plan.sentences.join(' '),
    sentences,
    informationalStructure: { titleFeatureId, sections, features },
    readingContext: plan.readingContext,
    contentVersion: grade3AcademicWordWorkshopContentVersion,
    reviewStatus: 'DRAFT',
    wordSupportTargets: plan.targets.map(({ word, sentenceIndex }) =>
      makeSupportTarget(passageId, sentenceIds[sentenceIndex], plan.sentences[sentenceIndex], word),
    ),
  }

  const guide: Grade3AcademicVocabularyGuide = {
    passageId,
    targets: plan.targets.map(({ word, sentenceIndex }) => {
      const info = grade3AcademicWordInfo[word]
      return {
        targetId: `${passageId}-${word}`,
        word,
        partOfSpeech: info.partOfSpeech,
        childFriendlyMeaning: info.childFriendlyMeaning,
        sourceSentenceIds: [sentenceIds[sentenceIndex]],
        subjectContexts: [...info.subjectContexts],
        speakingFrame: info.speakingFrame,
        writingFrame: info.writingFrame,
        appropriateUseExamples: [...info.appropriateUseExamples],
        inappropriateUseExample: info.inappropriateUseExample,
        inappropriateUseReason: info.inappropriateUseReason,
        precisionNote: info.precisionNote,
      }
    }),
    supportivePracticeOnly: true,
    openResponseScoring: false,
    oralScoring: false,
    reviewStatus: 'DRAFT',
    contentVersion: grade3AcademicWordWorkshopContentVersion,
  }

  return { passage, guide, sentenceIds, targetSentenceIds }
}

const passagePlans: readonly PassagePlan[] = [
  {
    key: 'scienceInvestigation',
    title: 'Which Towel Holds More Water?',
    readingContext: 'A science team uses careful measurements and academic words to discuss a fair test.',
    sectionHeadings: ['Collecting Careful Information', 'Thinking With Evidence'],
    firstSectionSentenceCount: 6,
    sentences: [
      'Mina and her science team tested two kinds of paper towel to learn which one held more water.',
      'They cut equal-sized squares and poured the same amount of water into each tray.',
      'One student timed every trial while another recorded the amount left in the tray.',
      'The group repeated each test three times so one unusual result would not decide the answer.',
      'After the trials, the team used a table to analyze the measurements for a pattern.',
      'They noticed that the folded towel held more water in every trial.',
      'Mina said, "Our evidence is the set of measurements from all three trials."',
      'Her partner checked each number and made sure every amount used the same unit.',
      'An accurate table copies each measurement correctly and labels the unit clearly.',
      'The students conclude that the folded towel held more water because its measurements were highest each time.',
      'During discussion, each partner used the table to support the group answer.',
      'In their written note, they explained the result without adding a guess from outside the test.',
    ],
    targets: [
      { word: 'analyze', sentenceIndex: 4 },
      { word: 'evidence', sentenceIndex: 6 },
      { word: 'conclude', sentenceIndex: 9 },
      { word: 'accurate', sentenceIndex: 8 },
    ],
  },
  {
    key: 'mathematicsModel',
    title: 'Planning Seats for Family Night',
    readingContext: 'A math team uses a model, an estimate, and exact calculations to plan rows of chairs.',
    sectionHeadings: ['Making a Reasonable Plan', 'Checking and Explaining'],
    firstSectionSentenceCount: 6,
    sentences: [
      'A class planned rows of chairs for family night using a grid drawn on poster paper.',
      'Before counting every square, Luis said, "I estimate that about sixty chairs will fit."',
      'His estimate was reasonable because the grid had a little more than fifty spaces.',
      'The team placed a counter on each usable square and left the aisle squares empty.',
      'On their key, one counter would represent one chair in the room.',
      'They organized the counters into six equal rows and recorded each row total.',
      'Next, the students used multiplication to determine that fifty-four chairs would fit.',
      'They checked the answer by adding the six row totals and got the same number.',
      'Luis could justify the plan by pointing to the counters, the equation, and the open aisles.',
      'During a partner talk, he explained why the exact total differed from his estimate.',
      'In writing, the team described how the model represented the real room.',
      'Their final plan kept the walkway clear and showed every counted chair.',
    ],
    targets: [
      { word: 'estimate', sentenceIndex: 1 },
      { word: 'represent', sentenceIndex: 4 },
      { word: 'determine', sentenceIndex: 6 },
      { word: 'justify', sentenceIndex: 8 },
    ],
  },
  {
    key: 'readingDiscussion',
    title: 'A Discussion About the Hidden Note',
    readingContext: 'Readers use clues and precise academic words to discuss a short story without retelling every detail.',
    sectionHeadings: ['Reading the Clues', 'Sharing a Clear Idea'],
    firstSectionSentenceCount: 7,
    sentences: [
      'The reading group discussed a story in which Nia found a damp note beside an empty bird feeder.',
      'The note said only, "Meet me where the sunflowers lean after the rain."',
      'Earlier, the story showed Nia and her cousin building a small shelter near the garden.',
      'Nia packed dry seeds, hurried outside, and smiled when she saw fresh footprints.',
      'From those clues, students infer that Nia expects her cousin to be near the shelter.',
      'No sentence states that idea directly, so the group must connect several details.',
      'One reader warned that an inference still needs evidence from the story.',
      'The group then tried to interpret why the author repeated images of rain and leaning flowers.',
      'They explained that those images guide Nia and create a quiet, hopeful mood.',
      'Next, partners had to summarize the scene using only the problem, key actions, and result.',
      "They left out the color of Nia's cloth bag because it did not change the main events.",
      'Two details support the idea that Nia trusts her cousin to return.',
      'During speaking practice, each student used a sentence frame to name a clue and an inference.',
      'In writing, they connected one quoted detail to the idea it supported.',
    ],
    targets: [
      { word: 'infer', sentenceIndex: 4 },
      { word: 'interpret', sentenceIndex: 7 },
      { word: 'summarize', sentenceIndex: 9 },
      { word: 'support', sentenceIndex: 11 },
    ],
  },
  {
    key: 'writingRevision',
    title: 'Improving a Playground Proposal',
    readingContext: 'A writing team improves a proposal by arranging ideas and making each reason easy to understand.',
    sectionHeadings: ['Finding What Needs Work', 'Making Purposeful Changes'],
    firstSectionSentenceCount: 7,
    sentences: [
      'A student team drafted a proposal for adding a shaded reading bench near the playground.',
      'Their first draft listed facts, costs, and reasons in the order the students remembered them.',
      'A partner said the main request was hard to find and one reason lacked evidence.',
      'The writers decided to revise the proposal instead of changing only spelling marks.',
      'They moved the request to the opening and added a measured drawing of the space.',
      'To clarify why shade mattered, they explained that students could read there on sunny days.',
      'They also replaced the vague phrase "it will be good" with a specific benefit.',
      'Next, the team used headings to organize the request, evidence, cost, and closing.',
      'That order helped readers follow one idea before moving to the next.',
      'The structure of the new proposal included an opening claim, two supported reasons, and a closing request.',
      'During a conference, one writer explained how the structure guided the reader.',
      'Another writer used a speaking frame to clarify which evidence supported the cost estimate.',
      'The group read the revised proposal aloud and checked that every detail was relevant.',
      'Their final copy was clearer, shorter, and easier for the school committee to discuss.',
    ],
    targets: [
      { word: 'revise', sentenceIndex: 3 },
      { word: 'clarify', sentenceIndex: 5 },
      { word: 'organize', sentenceIndex: 7 },
      { word: 'structure', sentenceIndex: 9 },
    ],
  },
  {
    key: 'engineeringInvestigation',
    title: 'Testing a Paper Bridge',
    readingContext: 'An engineering team investigates bridge designs and explains how a method, a process, and test factors differ.',
    sectionHeadings: ['Planning a Fair Test', 'Using Results to Improve'],
    firstSectionSentenceCount: 8,
    sentences: [
      'An engineering club wanted to build a paper bridge that could hold a cup of counters.',
      'The students decided to investigate whether a flat strip or a folded strip would hold more weight.',
      'Before testing, they drew both designs and predicted which shape would be stronger.',
      'Their method was to place one counter at a time in the center until the bridge bent.',
      'A method is the chosen way a team carries out a task or test.',
      'The team kept the paper size, counter type, and space between books the same.',
      'Keeping those details steady helped the students analyze one design difference fairly.',
      'They recorded three trials for each bridge and checked that the table was accurate.',
      'The full design process included planning, building, testing, studying evidence, and revising.',
      'A process contains connected steps, while a method describes the chosen way to do one part.',
      'The fold shape was one factor that could affect how much weight the bridge held.',
      'The students did not claim the fold was the only factor that could matter.',
      'They determined an average for each design and used it to justify the next change.',
      'During discussion, Amari said, "Our evidence supports testing a double fold next."',
      'In the written plan, the team clarified which step they would repeat and which factor they would change.',
      'A second test produced a stronger bridge, but the team still reported every trial.',
      'The club concluded that careful methods make engineering results easier to explain.',
    ],
    targets: [
      { word: 'investigate', sentenceIndex: 1 },
      { word: 'method', sentenceIndex: 3 },
      { word: 'process', sentenceIndex: 8 },
      { word: 'factor', sentenceIndex: 10 },
    ],
  },
  {
    key: 'sourceDiscussion',
    title: 'Two Maps of a Growing Town',
    readingContext: 'A social studies group compares two maps and chooses information that answers a source question.',
    sectionHeadings: ['Reading Two Sources', 'Answering With Precision'],
    firstSectionSentenceCount: 8,
    sentences: [
      'A social studies class studied maps of the same river town from two different years.',
      'The older map showed a market, a ferry dock, and homes clustered beside the river.',
      'The newer map showed a bridge, a school, and several streets farther from the water.',
      'Students were asked how transportation and settlement changed over time.',
      'To contrast the maps, they named differences in river crossings and building locations.',
      'They did not list matching compass roses because those features did not answer the change question.',
      'One student noticed a relationship between the new bridge and streets built on both sides of the river.',
      'The class agreed that this connection was visible, but the maps alone did not prove why every family moved.',
      'A relevant detail directly helps answer the source question.',
      'The bridge and street locations were relevant, while the decorative border was not.',
      'Partners had to respond to the question with evidence from both maps.',
      'One speaker said, "I contrast the ferry crossing with the later bridge crossing."',
      'A writer used dates and map labels to support the same response.',
      'The group revised one sentence to clarify that a relationship is not always a proven cause.',
      'They organized the paragraph by describing the older map before the newer map.',
      'Finally, students summarized the main change without copying every map label.',
      'Their response stayed accurate because it included only information the sources showed.',
    ],
    targets: [
      { word: 'contrast', sentenceIndex: 4 },
      { word: 'relationship', sentenceIndex: 6 },
      { word: 'relevant', sentenceIndex: 8 },
      { word: 'respond', sentenceIndex: 10 },
    ],
  },
  {
    key: 'projectPresentation',
    title: 'Sharing the School Garden Survey',
    readingContext: 'A project team sorts survey information, chooses evidence, and presents the outcome of its work.',
    sectionHeadings: ['Preparing the Information', 'Showing What the Team Learned'],
    firstSectionSentenceCount: 9,
    sentences: [
      'A project team surveyed students about plants they wanted in a small school garden.',
      'The survey included choices for herbs, flowers, vegetables, and plants for pollinators.',
      'First, the team decided to classify the answers by plant purpose rather than by paper color.',
      'A clear rule helped every student place the same kind of answer in the same group.',
      'Next, the team counted each group and used a bar graph to represent the totals.',
      'Members had to select the two survey results most relevant to their planting proposal.',
      'They chose the most requested group and a result showing strong interest in pollinator plants.',
      'The team did not select a funny doodle because it was unrelated to the survey question.',
      'They organized the talk so the question, method, evidence, and recommendation appeared in order.',
      'For the presentation, a model garden would demonstrate how taller plants could stand behind shorter ones.',
      'The graph would demonstrate which plant groups students requested most often.',
      'One speaker used the frame, "This evidence supports our selection because ___."',
      'Another student explained the relationship between the survey outcome and the proposed garden plan.',
      'The outcome of the project was a clear recommendation supported by the classified results.',
      'The team clarified that an outcome is what happens after the work, not the first planned step.',
      'During questions, students responded by pointing to accurate totals instead of guessing.',
      'Their written summary described the process without listing every individual survey mark.',
      'By using precise academic words, the group made its reasoning easier to follow across subjects.',
    ],
    targets: [
      { word: 'classify', sentenceIndex: 2 },
      { word: 'select', sentenceIndex: 5 },
      { word: 'demonstrate', sentenceIndex: 9 },
      { word: 'outcome', sentenceIndex: 13 },
    ],
  },
]

export const grade3AcademicVocabularyArtifacts = {
  scienceInvestigation: buildArtifact(passagePlans[0]),
  mathematicsModel: buildArtifact(passagePlans[1]),
  readingDiscussion: buildArtifact(passagePlans[2]),
  writingRevision: buildArtifact(passagePlans[3]),
  engineeringInvestigation: buildArtifact(passagePlans[4]),
  sourceDiscussion: buildArtifact(passagePlans[5]),
  projectPresentation: buildArtifact(passagePlans[6]),
} as const

export const grade3AcademicWordWorkshopPassages = Object.values(grade3AcademicVocabularyArtifacts).map((artifact) => artifact.passage)
export const grade3AcademicVocabularyGuides = Object.values(grade3AcademicVocabularyArtifacts).map((artifact) => artifact.guide)
