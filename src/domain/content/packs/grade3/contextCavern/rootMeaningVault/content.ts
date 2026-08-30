import type {
  MeaningPartKind,
  MeaningPartOrigin,
  RootMeaningGuide,
  RootMeaningPrimaryFamily,
} from '../../../contentPackTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import type {
  InformationalFeature,
  InformationalHeadingFeature,
  InformationalSection,
  InformationalTitleFeature,
} from '../../../../informationalTypes'
import { rootMeaningVaultContentVersion, rootMeaningVaultPassageIds } from './ids'

export const rootMeaningWords = [
  'thermometer', 'thermal', 'polygon', 'monorail', 'astronaut', 'biology', 'telegram',
  'portable', 'import', 'predict', 'visible', 'audible', 'inspect', 'aqueduct',
  'preview', 'reread', 'miscount', 'unclear', 'preheat', 'disconnect', 'nonfiction',
  'hopeful', 'careless', 'washable', 'kindness', 'agreement', 'refillable', 'readable',
] as const

export type RootMeaningWord = typeof rootMeaningWords[number]

type PartSpec = {
  surface: string
  kind: MeaningPartKind
  origin: MeaningPartOrigin
  meaning: string
  contribution: string
  contributes?: boolean
  canonical?: string
}

type RootWordInfo = {
  family: RootMeaningPrimaryFamily
  parts: readonly PartSpec[]
  combinedPartClue: string
  inferredMeaning: string
  distractors: readonly [string, string, string]
  pronunciationChunks: readonly { displayText: string; speechText: string }[]
}

const p = (
  surface: string,
  kind: MeaningPartKind,
  origin: MeaningPartOrigin,
  meaning: string,
  contribution: string,
  contributes = true,
  canonical?: string,
): PartSpec => ({ surface, kind, origin, meaning, contribution, contributes, canonical })

export const rootMeaningWordInfo: Record<RootMeaningWord, RootWordInfo> = {
  thermometer: {
    family: 'greek-root',
    parts: [p('therm', 'root', 'Greek', 'heat', 'points to temperature or heat'), p('o', 'connector', 'Greek', 'joins the roots', 'joins the two roots without adding meaning', false), p('meter', 'root', 'Greek', 'measure', 'shows that the tool measures')],
    combinedPartClue: 'a tool that measures heat or temperature', inferredMeaning: 'a tool that measures temperature',
    distractors: ['a shape with many angles', 'a train that uses one rail', 'a message sent far away'],
    pronunciationChunks: [{ displayText: 'ther', speechText: 'thur' }, { displayText: 'mom', speechText: 'mom' }, { displayText: 'e', speechText: 'uh' }, { displayText: 'ter', speechText: 'tur' }],
  },
  thermal: {
    family: 'greek-root', parts: [p('therm', 'root', 'Greek', 'heat', 'points to heat'), p('al', 'suffix', 'Latin', 'related to', 'shows that the word describes something related to heat')],
    combinedPartClue: 'related to heat', inferredMeaning: 'related to heat',
    distractors: ['able to be heard', 'sent a long distance', 'made with many angles'],
    pronunciationChunks: [{ displayText: 'ther', speechText: 'thur' }, { displayText: 'mal', speechText: 'mul' }],
  },
  polygon: {
    family: 'greek-root', parts: [p('poly', 'root', 'Greek', 'many', 'shows there are many'), p('gon', 'root', 'Greek', 'angle', 'shows the shape has angles')],
    combinedPartClue: 'a shape with many angles', inferredMeaning: 'a flat shape with many angles',
    distractors: ['a tool that measures heat', 'a railway using one rail', 'the study of living things'],
    pronunciationChunks: [{ displayText: 'pol', speechText: 'pol' }, { displayText: 'y', speechText: 'ee' }, { displayText: 'gon', speechText: 'gon' }],
  },
  monorail: {
    family: 'greek-root', parts: [p('mono', 'root', 'Greek', 'one', 'shows that the railway uses one'), p('rail', 'base', 'English', 'rail', 'names the rail that supports the train')],
    combinedPartClue: 'a railway that uses one rail', inferredMeaning: 'a railway that uses one rail',
    distractors: ['a study of stars', 'a tool that measures distance', 'a shape with many sides'],
    pronunciationChunks: [{ displayText: 'mon', speechText: 'mon' }, { displayText: 'o', speechText: 'oh' }, { displayText: 'rail', speechText: 'rail' }],
  },
  astronaut: {
    family: 'greek-root', parts: [p('astro', 'root', 'Greek', 'star', 'points to space or stars'), p('naut', 'root', 'Greek', 'traveler or sailor', 'names a traveler')],
    combinedPartClue: 'a traveler among the stars', inferredMeaning: 'a traveler who goes into space',
    distractors: ['a scientist who studies plants only', 'a written message sent nearby', 'a sound that cannot be heard'],
    pronunciationChunks: [{ displayText: 'as', speechText: 'as' }, { displayText: 'tro', speechText: 'truh' }, { displayText: 'naut', speechText: 'nawt' }],
  },
  biology: {
    family: 'greek-root', parts: [p('bio', 'root', 'Greek', 'life', 'points to living things'), p('logy', 'root', 'Greek', 'study', 'shows that the subject is a field of study')],
    combinedPartClue: 'the study of life', inferredMeaning: 'the study of living things',
    distractors: ['the study of distant messages', 'a trip through outer space', 'a sound that can be heard'],
    pronunciationChunks: [{ displayText: 'bi', speechText: 'by' }, { displayText: 'ol', speechText: 'ol' }, { displayText: 'o', speechText: 'uh' }, { displayText: 'gy', speechText: 'jee' }],
  },
  telegram: {
    family: 'greek-root', parts: [p('tele', 'root', 'Greek', 'far', 'shows that the message travels far'), p('gram', 'root', 'Greek', 'written message', 'names the written message')],
    combinedPartClue: 'a written message sent far away', inferredMeaning: 'a written message sent over a distance',
    distractors: ['a traveler who goes into space', 'the study of living things', 'a sound that can be heard'],
    pronunciationChunks: [{ displayText: 'tel', speechText: 'tel' }, { displayText: 'e', speechText: 'uh' }, { displayText: 'gram', speechText: 'gram' }],
  },
  portable: {
    family: 'latin-root', parts: [p('port', 'root', 'Latin', 'carry', 'shows that the object can be carried'), p('able', 'suffix', 'Latin', 'can be', 'shows that carrying is possible')],
    combinedPartClue: 'can be carried', inferredMeaning: 'able to be carried',
    distractors: ['carried into a country', 'able to be seen', 'said before an event'],
    pronunciationChunks: [{ displayText: 'por', speechText: 'por' }, { displayText: 'ta', speechText: 'tuh' }, { displayText: 'ble', speechText: 'bul' }],
  },
  import: {
    family: 'latin-root', parts: [p('im', 'prefix', 'Latin', 'into', 'shows movement into a place'), p('port', 'root', 'Latin', 'carry', 'shows that goods are carried')],
    combinedPartClue: 'carry goods into a place', inferredMeaning: 'to carry goods into a place',
    distractors: ['to carry an object by hand', 'to look closely at something', 'to say what happened before'],
    pronunciationChunks: [{ displayText: 'im', speechText: 'im' }, { displayText: 'port', speechText: 'port' }],
  },
  predict: {
    family: 'latin-root', parts: [p('pre', 'prefix', 'Latin', 'before', 'shows that the statement comes before the event'), p('dict', 'root', 'Latin', 'say', 'points to saying what may happen')],
    combinedPartClue: 'say what may happen before', inferredMeaning: 'to say what may happen before it happens',
    distractors: ['to carry something into a place', 'to make something easy to see', 'to check a tool after using it'],
    pronunciationChunks: [{ displayText: 'pre', speechText: 'prih' }, { displayText: 'dict', speechText: 'dikt' }],
  },
  visible: {
    family: 'latin-root', parts: [p('vis', 'root', 'Latin', 'see', 'points to seeing'), p('ible', 'suffix', 'Latin', 'can be', 'shows that seeing is possible')],
    combinedPartClue: 'can be seen', inferredMeaning: 'able to be seen',
    distractors: ['able to be heard', 'able to be carried', 'able to be predicted'],
    pronunciationChunks: [{ displayText: 'vis', speechText: 'viz' }, { displayText: 'i', speechText: 'uh' }, { displayText: 'ble', speechText: 'bul' }],
  },
  audible: {
    family: 'latin-root', parts: [p('aud', 'root', 'Latin', 'hear', 'points to hearing'), p('ible', 'suffix', 'Latin', 'can be', 'shows that hearing is possible')],
    combinedPartClue: 'can be heard', inferredMeaning: 'able to be heard',
    distractors: ['able to be seen', 'written from far away', 'a traveler among stars'],
    pronunciationChunks: [{ displayText: 'au', speechText: 'aw' }, { displayText: 'di', speechText: 'duh' }, { displayText: 'ble', speechText: 'bul' }],
  },
  inspect: {
    family: 'latin-root', parts: [p('in', 'prefix', 'Latin', 'into', 'points to looking into the details'), p('spect', 'root', 'Latin', 'look', 'names the careful looking')],
    combinedPartClue: 'look closely into something', inferredMeaning: 'to look closely at something',
    distractors: ['to carry water across land', 'to fill a container again', 'to make writing easy to read'],
    pronunciationChunks: [{ displayText: 'in', speechText: 'in' }, { displayText: 'spect', speechText: 'spekt' }],
  },
  aqueduct: {
    family: 'latin-root', parts: [p('aque', 'root', 'Latin', 'water', 'names what moves through the structure', true, 'aqua'), p('duct', 'root', 'Latin', 'lead or carry', 'shows that the structure carries something')],
    combinedPartClue: 'a structure that carries water', inferredMeaning: 'a structure that carries water',
    distractors: ['a tool that checks water', 'a bottle that can be filled again', 'a page that is easy to read'],
    pronunciationChunks: [{ displayText: 'aq', speechText: 'ak' }, { displayText: 'ue', speechText: 'wuh' }, { displayText: 'duct', speechText: 'dukt' }],
  },
  preview: {
    family: 'english-prefix-base', parts: [p('pre', 'prefix', 'Latin', 'before', 'shows the looking happens before'), p('view', 'base', 'English', 'look at', 'names the act of looking')],
    combinedPartClue: 'look at something before', inferredMeaning: 'a look at something before it begins',
    distractors: ['to look at something again', 'to count something wrongly', 'not easy to understand'],
    pronunciationChunks: [{ displayText: 'pre', speechText: 'pree' }, { displayText: 'view', speechText: 'vyoo' }],
  },
  reread: {
    family: 'english-prefix-base', parts: [p('re', 'prefix', 'Latin', 'again', 'shows that reading happens again'), p('read', 'base', 'English', 'read', 'names the reading action')],
    combinedPartClue: 'read again', inferredMeaning: 'to read again',
    distractors: ['to look before an event', 'to count in a wrong way', 'to make directions less clear'],
    pronunciationChunks: [{ displayText: 're', speechText: 'ree' }, { displayText: 'read', speechText: 'reed' }],
  },
  miscount: {
    family: 'english-prefix-base', parts: [p('mis', 'prefix', 'English', 'wrongly', 'shows that the counting is incorrect'), p('count', 'base', 'English', 'count', 'names the counting action')],
    combinedPartClue: 'count wrongly', inferredMeaning: 'to count something wrongly',
    distractors: ['to count one more time', 'to look before counting', 'to explain a count clearly'],
    pronunciationChunks: [{ displayText: 'mis', speechText: 'mis' }, { displayText: 'count', speechText: 'kownt' }],
  },
  unclear: {
    family: 'english-prefix-base', parts: [p('un', 'prefix', 'English', 'not', 'changes clear to not clear'), p('clear', 'base', 'English', 'easy to understand', 'names the quality that is missing')],
    combinedPartClue: 'not clear', inferredMeaning: 'not easy to understand',
    distractors: ['easy to understand after reading again', 'counted in the wrong way', 'seen before an event starts'],
    pronunciationChunks: [{ displayText: 'un', speechText: 'un' }, { displayText: 'clear', speechText: 'kleer' }],
  },
  preheat: {
    family: 'english-prefix-base', parts: [p('pre', 'prefix', 'Latin', 'before', 'shows that heating happens first'), p('heat', 'base', 'English', 'make hot', 'names the heating action')],
    combinedPartClue: 'make hot before using', inferredMeaning: 'to heat something before using it',
    distractors: ['to cool something after using it', 'to remove a connection', 'to read factual writing'],
    pronunciationChunks: [{ displayText: 'pre', speechText: 'pree' }, { displayText: 'heat', speechText: 'heet' }],
  },
  disconnect: {
    family: 'english-prefix-base', parts: [p('dis', 'prefix', 'Latin', 'apart', 'shows that connected parts move apart'), p('connect', 'base', 'English', 'join', 'names the link that is removed')],
    combinedPartClue: 'take apart a connection', inferredMeaning: 'to separate something that was connected',
    distractors: ['to join two parts firmly', 'to heat a tool before use', 'to agree about a shared plan'],
    pronunciationChunks: [{ displayText: 'dis', speechText: 'dis' }, { displayText: 'con', speechText: 'kuh' }, { displayText: 'nect', speechText: 'nekt' }],
  },
  nonfiction: {
    family: 'english-prefix-base', parts: [p('non', 'prefix', 'Latin', 'not', 'shows that the writing is not fiction'), p('fiction', 'base', 'English', 'made-up writing', 'names the kind of writing being ruled out')],
    combinedPartClue: 'writing that is not made-up fiction', inferredMeaning: 'writing about real information rather than made-up events',
    distractors: ['writing that has no clear structure', 'a story that must be read again', 'a group that reaches the same decision'],
    pronunciationChunks: [{ displayText: 'non', speechText: 'non' }, { displayText: 'fic', speechText: 'fik' }, { displayText: 'tion', speechText: 'shun' }],
  },
  hopeful: {
    family: 'english-base-suffix', parts: [p('hope', 'base', 'English', 'hope', 'names the positive feeling'), p('ful', 'suffix', 'English', 'full of or having', 'shows that someone has hope')],
    combinedPartClue: 'having hope', inferredMeaning: 'feeling or showing hope',
    distractors: ['without enough care', 'able to be washed', 'the quality of being kind'],
    pronunciationChunks: [{ displayText: 'hope', speechText: 'hohp' }, { displayText: 'ful', speechText: 'ful' }],
  },
  careless: {
    family: 'english-base-suffix', parts: [p('care', 'base', 'English', 'care', 'names careful attention'), p('less', 'suffix', 'English', 'without', 'shows that care is missing')],
    combinedPartClue: 'without care', inferredMeaning: 'without enough care',
    distractors: ['full of hope', 'able to be cleaned', 'showing a kind quality'],
    pronunciationChunks: [{ displayText: 'care', speechText: 'kair' }, { displayText: 'less', speechText: 'less' }],
  },
  washable: {
    family: 'english-base-suffix', parts: [p('wash', 'base', 'English', 'clean with water', 'names the cleaning action'), p('able', 'suffix', 'Latin', 'can be', 'shows that washing is possible')],
    combinedPartClue: 'can be washed', inferredMeaning: 'able to be washed',
    distractors: ['without careful attention', 'full of hope', 'the state of being kind'],
    pronunciationChunks: [{ displayText: 'wash', speechText: 'wosh' }, { displayText: 'a', speechText: 'uh' }, { displayText: 'ble', speechText: 'bul' }],
  },
  kindness: {
    family: 'english-base-suffix', parts: [p('kind', 'base', 'English', 'caring', 'names the caring quality'), p('ness', 'suffix', 'English', 'state or quality', 'turns kind into the quality of being kind')],
    combinedPartClue: 'the quality of being kind', inferredMeaning: 'the quality of being kind',
    distractors: ['an object that can be washed', 'an action done without care', 'a feeling that is full of hope'],
    pronunciationChunks: [{ displayText: 'kind', speechText: 'kynd' }, { displayText: 'ness', speechText: 'ness' }],
  },
  agreement: {
    family: 'english-base-suffix', parts: [p('agree', 'base', 'English', 'share the same view', 'names the action of agreeing'), p('ment', 'suffix', 'Latin', 'state, result, or action', 'names the result of agreeing')],
    combinedPartClue: 'the result of agreeing', inferredMeaning: 'a shared decision or state of agreeing',
    distractors: ['writing that is not fictional', 'a tool heated before use', 'a cord separated from a device'],
    pronunciationChunks: [{ displayText: 'a', speechText: 'uh' }, { displayText: 'gree', speechText: 'gree' }, { displayText: 'ment', speechText: 'ment' }],
  },
  refillable: {
    family: 'english-base-suffix', parts: [p('refill', 'base', 'English', 'fill again', 'names filling the container again'), p('able', 'suffix', 'Latin', 'can be', 'shows that refilling is possible')],
    combinedPartClue: 'can be filled again', inferredMeaning: 'able to be filled again',
    distractors: ['able to be looked at closely', 'able to carry water across land', 'able to be read easily'],
    pronunciationChunks: [{ displayText: 're', speechText: 'ree' }, { displayText: 'fill', speechText: 'fil' }, { displayText: 'a', speechText: 'uh' }, { displayText: 'ble', speechText: 'bul' }],
  },
  readable: {
    family: 'english-base-suffix', parts: [p('read', 'base', 'English', 'read', 'names the reading action'), p('able', 'suffix', 'Latin', 'can be', 'shows that reading is possible')],
    combinedPartClue: 'can be read', inferredMeaning: 'able to be read easily',
    distractors: ['able to be filled again', 'able to carry water', 'able to be inspected closely'],
    pronunciationChunks: [{ displayText: 'read', speechText: 'reed' }, { displayText: 'a', speechText: 'uh' }, { displayText: 'ble', speechText: 'bul' }],
  },
}

type PassageKey = keyof typeof rootMeaningVaultPassageIds

type PassagePlan = {
  key: PassageKey
  title: string
  contentKind: 'prose' | 'informational'
  readingContext: string
  sectionHeadings: readonly [string, string]
  firstSectionSentenceCount: number
  sentences: readonly string[]
  targets: readonly { word: RootMeaningWord; sentenceIndex: number; contextEvidenceIndexes: readonly number[] }[]
}

export type RootMeaningArtifact = {
  passage: Passage
  guide: RootMeaningGuide
  sentenceIds: string[]
  targetSentenceIds: Record<RootMeaningWord, string | undefined>
}

const createTitle = (featureId: string, text: string): InformationalTitleFeature => ({ featureId, kind: 'title', text })
const createHeading = (featureId: string, sectionId: string, text: string): InformationalHeadingFeature => ({ featureId, kind: 'heading', sectionId, text })

function makeSupportTarget(passageId: string, sentenceId: string, sentenceText: string, word: RootMeaningWord): WordSupportTarget {
  const info = rootMeaningWordInfo[word]
  return {
    targetId: `${passageId}-${word}-support`,
    passageId,
    sentenceId,
    surfaceWord: word,
    focusParts: info.parts.map((candidate) => ({ text: candidate.surface, emphasis: candidate.contributes !== false })),
    displayChunks: info.pronunciationChunks.map((chunk) => ({ ...chunk })),
    spokenChunks: info.pronunciationChunks.map((chunk) => ({ ...chunk })),
    blendSpeechText: word,
    wholeWordSpeechText: word,
    sentenceSpeechText: sentenceText,
    reviewStatus: 'DRAFT',
    contentVersion: rootMeaningVaultContentVersion,
  }
}

function buildInformationalStructure(plan: PassagePlan, sentenceIds: string[]) {
  const passageId = rootMeaningVaultPassageIds[plan.key]
  const titleFeatureId = `${passageId}-title`
  const section1 = `${passageId}-section-1`
  const section2 = `${passageId}-section-2`
  const heading1 = `${passageId}-heading-1`
  const heading2 = `${passageId}-heading-2`
  const features: InformationalFeature[] = [
    createTitle(titleFeatureId, plan.title),
    createHeading(heading1, section1, plan.sectionHeadings[0]),
    createHeading(heading2, section2, plan.sectionHeadings[1]),
  ]
  const sections: InformationalSection[] = [
    { sectionId: section1, headingFeatureId: heading1, sentenceIds: sentenceIds.slice(0, plan.firstSectionSentenceCount), featureIds: [] },
    { sectionId: section2, headingFeatureId: heading2, sentenceIds: sentenceIds.slice(plan.firstSectionSentenceCount), featureIds: [] },
  ]
  return { titleFeatureId, sections, features }
}

function buildArtifact(plan: PassagePlan): RootMeaningArtifact {
  const passageId = rootMeaningVaultPassageIds[plan.key]
  const sentenceIds = plan.sentences.map((_, index) => `${passageId}-sentence-${index + 1}`)
  const sentences = plan.sentences.map((text, index) => ({ sentenceId: sentenceIds[index], text }))
  const passage: Passage = {
    passageIdentifier: passageId,
    gradeBand: 3,
    contentKind: plan.contentKind,
    passageText: plan.sentences.join(' '),
    sentences,
    ...(plan.contentKind === 'informational' ? { informationalStructure: buildInformationalStructure(plan, sentenceIds) } : {}),
    readingContext: plan.readingContext,
    contentVersion: rootMeaningVaultContentVersion,
    reviewStatus: 'DRAFT',
    wordSupportTargets: plan.targets.map(({ word, sentenceIndex }) => makeSupportTarget(passageId, sentenceIds[sentenceIndex], plan.sentences[sentenceIndex], word)),
  }
  const targetSentenceIds = Object.fromEntries(plan.targets.map(({ word, sentenceIndex }) => [word, sentenceIds[sentenceIndex]])) as Record<RootMeaningWord, string | undefined>
  const guide: RootMeaningGuide = {
    passageId,
    targets: plan.targets.map(({ word, sentenceIndex, contextEvidenceIndexes }) => {
      const info = rootMeaningWordInfo[word]
      return {
        targetId: `${passageId}-${word}`,
        surfaceWord: word,
        sourceSentenceId: sentenceIds[sentenceIndex],
        primaryFamily: info.family,
        parts: info.parts.map((candidate, index) => ({
          partId: `${passageId}-${word}-part-${index + 1}`,
          kind: candidate.kind,
          surfaceForm: candidate.surface,
          ...(candidate.canonical ? { canonicalForm: candidate.canonical } : {}),
          origin: candidate.origin,
          commonMeaning: candidate.meaning,
          contextualContribution: candidate.contribution,
          contributesMeaning: candidate.contributes !== false,
        })),
        combinedPartClue: info.combinedPartClue,
        inferredMeaning: info.inferredMeaning,
        contextEvidenceIds: contextEvidenceIndexes.map((index) => sentenceIds[index]),
        contextConfirmationStatement: `The surrounding details confirm that ${word} means ${info.inferredMeaning}.`,
        transparentComposition: true,
      }
    }),
    wordPartStrategyStatement: 'Meaningful roots, bases, prefixes, and suffixes often provide a useful clue to a word meaning.',
    contextConfirmationStatement: 'The surrounding sentence or section confirms or refines the meaning suggested by the word parts.',
    reviewStatus: 'DRAFT',
    contentVersion: rootMeaningVaultContentVersion,
  }
  return { passage, guide, sentenceIds, targetSentenceIds }
}

const passagePlans: readonly PassagePlan[] = [
  {
    key: 'prefixClues', title: 'The Labels Before Opening', contentKind: 'prose',
    readingContext: 'A museum helper uses prefixes and context to repair mixed-up exhibit labels.',
    sectionHeadings: ['An early look', 'A clearer plan'], firstSectionSentenceCount: 5,
    sentences: [
      'Mina arrived early to help her aunt prepare a small transportation exhibit at the community museum.',
      'Her aunt offered a preview of the rooms before the doors opened, so Mina could see each station ahead of the visitors.',
      'The early look showed Mina where the model boats, trains, and bicycles belonged.',
      'At the train case, Mina had to reread a label because its first sentence did not match the picture.',
      'Reading the sentence again helped her notice that two labels had been switched.',
      'Next, Mina discovered that she had made a miscount when she listed eight model wheels even though only seven were in the tray.',
      'She counted each wheel again, found the wrong total, and corrected the list.',
      'One direction for the bicycle display was unclear, and Mina could not tell whether the sign belonged above or beside the case.',
      'Her aunt rewrote the direction with a precise location, and the new sentence was easy to understand.',
      'By opening time, Mina had used each word part and each surrounding detail to repair the exhibit without guessing from letters alone.',
    ],
    targets: [
      { word: 'preview', sentenceIndex: 1, contextEvidenceIndexes: [1, 2] },
      { word: 'reread', sentenceIndex: 3, contextEvidenceIndexes: [3, 4] },
      { word: 'miscount', sentenceIndex: 5, contextEvidenceIndexes: [5, 6] },
      { word: 'unclear', sentenceIndex: 7, contextEvidenceIndexes: [7, 8] },
    ],
  },
  {
    key: 'suffixClues', title: 'Words for a Care Kit', contentKind: 'informational',
    readingContext: 'A project note explains how suffixes help describe materials and helpful choices.',
    sectionHeadings: ['Choosing materials', 'Choosing actions'], firstSectionSentenceCount: 5,
    sentences: [
      'A community care kit can hold simple supplies for cleaning a park table after an outdoor event.',
      'The planning team felt hopeful because several families had offered safe materials and time for the project.',
      'Their smiles and steady planning showed that they expected the work to go well.',
      'The team avoided careless packing, since tossing open bottles into a bag without checking the caps could cause a spill.',
      'A careful helper checked every lid and placed wet items in a separate pocket.',
      'They chose a washable cloth that could be cleaned with water and used again at the next event.',
      'The cloth label explained how to wash it safely after each use.',
      'The final supply was kindness: each helper listened, shared a task, and thanked the people who brought materials.',
      'Those caring actions showed the quality of being kind rather than naming a single object.',
      'The suffixes in the four target words point toward having hope, lacking care, being able to be washed, and showing a quality.',
    ],
    targets: [
      { word: 'hopeful', sentenceIndex: 1, contextEvidenceIndexes: [1, 2] },
      { word: 'careless', sentenceIndex: 3, contextEvidenceIndexes: [3, 4] },
      { word: 'washable', sentenceIndex: 5, contextEvidenceIndexes: [5, 6] },
      { word: 'kindness', sentenceIndex: 7, contextEvidenceIndexes: [7, 8] },
    ],
  },
  {
    key: 'greekRoots', title: 'The Science Fair Transit Model', contentKind: 'prose',
    readingContext: 'Two friends use transparent Greek roots while preparing a science fair transportation model.',
    sectionHeadings: ['Testing the station', 'Explaining the model'], firstSectionSentenceCount: 6,
    sentences: [
      'Jonah and Priya built a small transit station for the science fair, with a weather shelter beside a raised track.',
      'Priya placed a thermometer inside the shelter so the team could measure the temperature during each test.',
      'The numbered scale changed as the air warmed, confirming that the tool measured heat rather than distance.',
      'Jonah added a thermal cover over one wall because the material was designed to slow the movement of heat.',
      'When sunlight reached the model, the covered wall stayed cooler than the uncovered wall.',
      'For the station roof, Priya cut a polygon with six straight sides and six angles.',
      'She traced every corner before fastening the many-angled shape above the platform.',
      'The raised track held a tiny monorail that balanced on one central rail instead of two separate rails.',
      'Jonah rolled the train along that single support and checked that it did not tip.',
      'At first, he wanted to split thermometer wherever he heard a beat, but Priya pointed to the meaning parts therm, o, and meter.',
      'They noted that the letter o joins the two Greek roots but does not add a separate meaning.',
      'Their display explained that meaning parts help build a hypothesis while the model and sentences confirm the word meaning.',
    ],
    targets: [
      { word: 'thermometer', sentenceIndex: 1, contextEvidenceIndexes: [1, 2, 9, 10] },
      { word: 'thermal', sentenceIndex: 3, contextEvidenceIndexes: [3, 4] },
      { word: 'polygon', sentenceIndex: 5, contextEvidenceIndexes: [5, 6] },
      { word: 'monorail', sentenceIndex: 7, contextEvidenceIndexes: [7, 8] },
    ],
  },
  {
    key: 'latinRoots', title: 'Tools That Travel and Tell', contentKind: 'informational',
    readingContext: 'An exhibit guide uses transparent Latin roots to explain carrying, saying, and seeing.',
    sectionHeadings: ['Carrying tools', 'Seeing what comes next'], firstSectionSentenceCount: 6,
    sentences: [
      'Field researchers choose tools that can move safely from one study site to another.',
      'A portable weather sensor is light enough to be carried in a small case and set up beside a stream.',
      'Its handle folds down, so one researcher can carry the complete tool without a cart.',
      'Teams sometimes import replacement parts, which means the parts are carried into their region from another place.',
      'A shipping record shows where each part began and when it entered the local supply room.',
      'Before collecting data, researchers predict what may happen by saying a possible result before the test begins.',
      'They write the prediction first and compare it with the measurements afterward.',
      'Bright markings keep each number visible even when the sensor stands in a shaded area.',
      'Because the numbers can be seen clearly, the team can copy them without moving the sensor.',
      'The root port provides a carrying clue in portable and import, but the prefix changes how the carrying happens.',
      'The roots dict and vis point toward saying and seeing, while context narrows each clue to the meaning used here.',
      'Researchers reject letter splits that do not carry meaning, even if those letters happen to form another familiar string.',
    ],
    targets: [
      { word: 'portable', sentenceIndex: 1, contextEvidenceIndexes: [1, 2, 9] },
      { word: 'import', sentenceIndex: 3, contextEvidenceIndexes: [3, 4, 9] },
      { word: 'predict', sentenceIndex: 5, contextEvidenceIndexes: [5, 6, 10] },
      { word: 'visible', sentenceIndex: 7, contextEvidenceIndexes: [7, 8, 10] },
    ],
  },
  {
    key: 'buildMeaning', title: 'The Warm-Up Plan', contentKind: 'prose',
    readingContext: 'A club team uses English bases and affixes to follow a safe warm-air paper-spiral demonstration plan.',
    sectionHeadings: ['A mixed-up start', 'A shared solution'], firstSectionSentenceCount: 7,
    sentences: [
      'The family science club planned a demonstration showing how warm air can move a paper spiral.',
      'Before anyone arrived, Mr. Chen reminded the team to preheat the small demonstration oven so it would be warm before the spiral test.',
      'The temperature light had to turn green before the tray could be placed inside.',
      'After the warm-up, Elena would disconnect the power cord by separating it from the outlet before moving the oven.',
      'She pointed to the joined plug and outlet, then showed the safe moment when the two connected parts would come apart.',
      'Mateo opened a nonfiction book about heat because the group needed real information rather than a made-up adventure.',
      'The book included diagrams, observations, and explanations from classroom investigations.',
      'The team reached an agreement about the order of the demonstration after everyone accepted the same three-step plan.',
      'They wrote their shared decision on a card and placed it beside the materials.',
      'A last-minute question made Mateo pause: Did pre in preheat really mean before, or was it just a matching group of letters?',
      'The instruction to warm the oven before the test confirmed that pre was a meaningful prefix in this word.',
      'Elena also checked that non changed fiction to not fiction and that dis changed connect toward separation.',
      'Each word-part hypothesis matched both the written plan and the actions the team completed.',
      'When the paper spiral turned above the warm air, the team could explain the demonstration without making a universal claim about every word.',
    ],
    targets: [
      { word: 'preheat', sentenceIndex: 1, contextEvidenceIndexes: [1, 2, 9, 10] },
      { word: 'disconnect', sentenceIndex: 3, contextEvidenceIndexes: [3, 4, 11] },
      { word: 'nonfiction', sentenceIndex: 5, contextEvidenceIndexes: [5, 6, 11] },
      { word: 'agreement', sentenceIndex: 7, contextEvidenceIndexes: [7, 8] },
    ],
  },
  {
    key: 'rootsAcrossSubjects', title: 'Messages Across Distance', contentKind: 'informational',
    readingContext: 'A museum note connects Greek and Latin roots across space science, life science, communication, and sound.',
    sectionHeadings: ['Travelers and studies', 'Messages and sounds'], firstSectionSentenceCount: 7,
    sentences: [
      'A science museum gallery shows how people study living things, travel through space, and send messages across long distances.',
      'An astronaut is a traveler who journeys into space, far beyond the air where people normally live.',
      'A training photograph shows the space traveler practicing inside a model capsule before launch.',
      'The biology table focuses on the study of living things such as moss, insects, and seeds.',
      'Visitors compare the living samples and record how each one grows or responds to light.',
      'A communication case displays a telegram, a written message that people once sent across a distance.',
      'The same Greek root tele appears in telephone, another word connected with communicating from far away.',
      'At the sound station, a soft bell remains audible because visitors can still hear it from the marked listening spot.',
      'When a wall panel closes, the bell becomes too faint to hear, which confirms the meaning used in the open test.',
      'The gallery labels explain that astro and naut build a star-traveler clue for the space traveler.',
      'They also show that bio and logy form a life-study clue for the science field.',
      'Tele and gram form a far-written-message clue, while aud and ible form a can-be-heard clue.',
      'A pronunciation display divides astronaut into readable sound chunks, but the meaning display separately marks astro and naut.',
      'Visitors use both displays for different jobs and check each meaning against the examples in the gallery.',
    ],
    targets: [
      { word: 'astronaut', sentenceIndex: 1, contextEvidenceIndexes: [1, 2, 9, 12] },
      { word: 'biology', sentenceIndex: 3, contextEvidenceIndexes: [3, 4, 10] },
      { word: 'telegram', sentenceIndex: 5, contextEvidenceIndexes: [5, 6, 11] },
      { word: 'audible', sentenceIndex: 7, contextEvidenceIndexes: [7, 8, 11] },
    ],
  },
  {
    key: 'unfamiliarWord', title: 'A Water-Saving School Plan', contentKind: 'informational',
    readingContext: 'A school design note uses roots, bases, and suffixes to explain a water-saving system.',
    sectionHeadings: ['Checking the old system', 'Improving the new system'], firstSectionSentenceCount: 7,
    sentences: [
      'A school design team studied how water moved from a rain barrel to raised garden beds.',
      'Before changing the system, students inspect each hose by looking closely for cracks, loose rings, and blocked openings.',
      'Their careful look reveals one split near a connector and two leaves stuck inside a tube.',
      'The team studies a drawing of an aqueduct, a channel-like structure built to carry water from one place to another.',
      'Arrows on the drawing show water entering at the higher end and traveling toward a lower garden.',
      'For the new system, students choose a refillable container that can be filled with collected rainwater again after it becomes empty.',
      'A wide cap makes the repeated filling safe and keeps dirt from entering the container.',
      'They rewrite each label in large, readable letters so every direction can be read easily from the path.',
      'A visitor tests the labels from several steps away and reads every instruction without asking for help.',
      'The Latin parts in inspect suggest looking into details, and the crack-checking context confirms a careful examination.',
      'The roots aqua and duct suggest water being carried, which matches the arrows and channel in the drawing.',
      'The base refill and suffix able suggest that repeated filling is possible for the chosen container.',
      'The base read and suffix able suggest that reading is possible, while the distance test confirms that the letters are easy to read.',
      'The team rejects false splits such as re plus adable because those pieces do not build the meaning shown by the label test.',
    ],
    targets: [
      { word: 'inspect', sentenceIndex: 1, contextEvidenceIndexes: [1, 2, 9] },
      { word: 'aqueduct', sentenceIndex: 3, contextEvidenceIndexes: [3, 4, 10] },
      { word: 'refillable', sentenceIndex: 5, contextEvidenceIndexes: [5, 6, 11] },
      { word: 'readable', sentenceIndex: 7, contextEvidenceIndexes: [7, 8, 12, 13] },
    ],
  },
]

const built = passagePlans.map(buildArtifact)

export const rootMeaningArtifacts = Object.fromEntries(passagePlans.map((plan, index) => [plan.key, built[index]])) as Record<PassageKey, RootMeaningArtifact>
export const rootMeaningVaultPassages = built.map((artifact) => artifact.passage)
export const rootMeaningGuides = built.map((artifact) => artifact.guide)
