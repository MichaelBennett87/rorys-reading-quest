import type {
  ContextClueKind,
  MeaningMazeGuide,
  MeaningMazeReferenceEntry,
  MeaningMazeStrategyKind,
  MeaningMazeTarget,
  MeaningMazeTargetForm,
  MeaningMazeChallengeKind,
  WordRelationshipKind,
} from '../../../contentPackTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import type { InformationalFeature, InformationalSection } from '../../../../informationalTypes'
import {
  grade3MeaningMazeContentVersion,
  grade3MeaningMazePassageIds,
} from './ids'

type PassageKey = keyof typeof grade3MeaningMazePassageIds
type SourceKind = 'informational' | 'prose' | 'poem'

type TargetPlan = {
  targetText: string
  targetForm: MeaningMazeTargetForm
  challengeKind: MeaningMazeChallengeKind
  sentenceIndex: number
  intendedMeaning: string
  primaryStrategy: MeaningMazeStrategyKind
  secondaryStrategies: MeaningMazeStrategyKind[]
  contextSentenceIndexes: number[]
  contextClueKind?: ContextClueKind
  relationshipKind?: WordRelationshipKind
  relatedWords?: string[]
  referenceEntryIds?: string[]
  backgroundKnowledgeStatement?: string
  alternateMeanings?: {
    senseId: string
    meaning: string
    partOfSpeech?: string
    selectedForContext: boolean
  }[]
  literalReading?: string
  strategyExplanation: string
  confirmationStatement: string
}

type ReferencePlan =
  | (MeaningMazeReferenceEntry & { visibleKind: 'glossary'; kind: 'glossary' })
  | (MeaningMazeReferenceEntry & { visibleKind: 'reference'; kind: 'dictionary' | 'thesaurus' })

type SupportPlan = {
  word: string
  sentenceIndex: number
  chunks: string[]
}

type SourcePlan = {
  key: PassageKey
  sourceKind: SourceKind
  title: string
  readingContext: string
  sectionHeadings?: [string, string]
  firstSectionSentenceCount?: number
  stanzaEnds?: number[]
  sentences: string[]
  targets: TargetPlan[]
  references?: ReferencePlan[]
  supports: SupportPlan[]
}

export type MeaningMazeArtifact = {
  passage: Passage
  guide: MeaningMazeGuide
  sentenceIds: string[]
}

export const meaningMazeSentenceId = (passageId: string, oneBasedIndex: number): string =>
  `${passageId}-sentence-${oneBasedIndex}`

const targetId = (passageId: string, index: number) => `${passageId}-target-${index + 1}`

function makeSupportTarget(
  passageId: string,
  sentenceId: string,
  sentenceText: string,
  plan: SupportPlan,
): WordSupportTarget {
  return {
    targetId: `${passageId}-support-${plan.word.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    passageId,
    sentenceId,
    surfaceWord: plan.word,
    focusParts: plan.chunks.map((text, index) => ({ text, emphasis: index === 0 })),
    displayChunks: plan.chunks.map((text) => ({ displayText: text, speechText: text })),
    spokenChunks: plan.chunks.map((text) => ({ displayText: text, speechText: text })),
    blendSpeechText: plan.word,
    wholeWordSpeechText: plan.word,
    sentenceSpeechText: sentenceText,
    reviewStatus: 'DRAFT',
    contentVersion: grade3MeaningMazeContentVersion,
  }
}

function buildInformationalStructure(plan: SourcePlan, passageId: string, sentenceIds: string[]) {
  const sectionOneId = `${passageId}-section-1`
  const sectionTwoId = `${passageId}-section-2`
  const titleFeatureId = `${passageId}-title`
  const headingOneId = `${passageId}-heading-1`
  const headingTwoId = `${passageId}-heading-2`
  const visibleFeatureId = (entry: ReferencePlan) => entry.visibleKind === 'glossary'
    ? `${entry.referenceId}-feature`
    : entry.referenceId
  const referenceFeatureIds = (plan.references ?? []).map(visibleFeatureId)
  const features: InformationalFeature[] = [
    { featureId: titleFeatureId, kind: 'title', text: plan.title },
    { featureId: headingOneId, kind: 'heading', sectionId: sectionOneId, text: plan.sectionHeadings![0] },
    { featureId: headingTwoId, kind: 'heading', sectionId: sectionTwoId, text: plan.sectionHeadings![1] },
    ...(plan.references ?? []).map((entry): InformationalFeature => {
      if (entry.visibleKind === 'glossary') {
        const selectedSense = entry.senses.find((sense) => sense.selectedForContext) ?? entry.senses[0]
        return {
          featureId: visibleFeatureId(entry),
          kind: 'glossary',
          entries: [{
            entryId: entry.referenceId,
            term: entry.headword,
            definition: selectedSense?.meaning ?? '',
          }],
        }
      }
      return {
        featureId: entry.referenceId,
        kind: 'reference',
        referenceKind: entry.kind,
        headword: entry.headword,
        senses: entry.senses.map((sense) => ({
          senseId: sense.senseId,
          meaning: sense.meaning,
          partOfSpeech: sense.partOfSpeech,
          selectedForContext: sense.selectedForContext,
        })),
        relatedWords: entry.relatedWords ? [...entry.relatedWords] : undefined,
      }
    }),
  ]
  const split = plan.firstSectionSentenceCount!
  const sections: InformationalSection[] = [
    {
      sectionId: sectionOneId,
      headingFeatureId: headingOneId,
      sentenceIds: sentenceIds.slice(0, split),
      featureIds: [],
    },
    {
      sectionId: sectionTwoId,
      headingFeatureId: headingTwoId,
      sentenceIds: sentenceIds.slice(split),
      featureIds: referenceFeatureIds,
    },
  ]
  return { titleFeatureId, sections, features }
}

function buildPoemStructure(plan: SourcePlan, passageId: string, sentenceIds: string[]) {
  const stanzaEnds = plan.stanzaEnds!
  const stanzas = stanzaEnds.map((end, stanzaIndex) => {
    const start = stanzaIndex === 0 ? 1 : stanzaEnds[stanzaIndex - 1]! + 1
    const stanzaId = `${passageId}-stanza-${stanzaIndex + 1}`
    return { stanzaId, lineIds: sentenceIds.slice(start - 1, end) }
  })
  return {
    lines: plan.sentences.map((text, index) => ({
      lineId: sentenceIds[index]!,
      lineNumber: index + 1,
      stanzaId: stanzas.find((stanza) => stanza.lineIds.includes(sentenceIds[index]!))!.stanzaId,
      text,
    })),
    stanzas,
  }
}

function buildArtifact(plan: SourcePlan): MeaningMazeArtifact {
  const passageId = grade3MeaningMazePassageIds[plan.key]
  const sentenceIds = plan.sentences.map((_, index) => meaningMazeSentenceId(passageId, index + 1))
  const sentences = plan.sentences.map((text, index) => ({
    sentenceId: sentenceIds[index]!,
    lineNumber: plan.sourceKind === 'poem' ? index + 1 : undefined,
    stanzaId: plan.sourceKind === 'poem'
      ? `${passageId}-stanza-${plan.stanzaEnds!.findIndex((end) => index + 1 <= end) + 1}`
      : undefined,
    text,
  }))
  const passage: Passage = {
    passageIdentifier: passageId,
    gradeBand: 3,
    contentKind: plan.sourceKind,
    passageText: plan.sourceKind === 'poem' ? plan.sentences.join('\n') : plan.sentences.join(' '),
    sentences,
    informationalStructure: plan.sourceKind === 'informational'
      ? buildInformationalStructure(plan, passageId, sentenceIds)
      : undefined,
    poemStructure: plan.sourceKind === 'poem'
      ? buildPoemStructure(plan, passageId, sentenceIds)
      : undefined,
    readingContext: plan.readingContext,
    contentVersion: grade3MeaningMazeContentVersion,
    reviewStatus: 'DRAFT',
    wordSupportTargets: plan.supports.map((support) => makeSupportTarget(
      passageId,
      sentenceIds[support.sentenceIndex]!,
      plan.sentences[support.sentenceIndex]!,
      support,
    )),
  }

  const guide: MeaningMazeGuide = {
    passageId,
    targets: plan.targets.map((target, index): MeaningMazeTarget => ({
      targetId: targetId(passageId, index),
      targetText: target.targetText,
      targetForm: target.targetForm,
      challengeKind: target.challengeKind,
      sourceEvidenceIds: [sentenceIds[target.sentenceIndex]!],
      intendedMeaning: target.intendedMeaning,
      primaryStrategy: target.primaryStrategy,
      secondaryStrategies: [...target.secondaryStrategies],
      contextEvidenceIds: target.contextSentenceIndexes.map((sentenceIndex) => sentenceIds[sentenceIndex]!),
      contextClueKind: target.contextClueKind,
      relationshipKind: target.relationshipKind,
      relatedWords: target.relatedWords ? [...target.relatedWords] : undefined,
      referenceEntryIds: target.referenceEntryIds ? [...target.referenceEntryIds] : undefined,
      backgroundKnowledgeStatement: target.backgroundKnowledgeStatement,
      alternateMeanings: target.alternateMeanings?.map((sense) => ({
        ...sense,
        evidenceIds: [sentenceIds[target.sentenceIndex]!],
      })),
      literalReading: target.literalReading,
      strategyExplanation: target.strategyExplanation,
      confirmationStatement: target.confirmationStatement,
    })),
    referenceEntries: (plan.references ?? []).map((entry) => ({
      referenceId: entry.referenceId,
      kind: entry.kind,
      headword: entry.headword,
      senses: entry.senses.map((sense) => ({ ...sense, evidenceIds: [...sense.evidenceIds] })),
      relatedWords: entry.relatedWords ? [...entry.relatedWords] : undefined,
    })),
    strategySummary: 'Read the full word or phrase, gather useful context and relationship clues, consult any local reference card, add broad background knowledge only when the text supports it, and confirm that the chosen meaning fits the complete source.',
    reviewStatus: 'DRAFT',
    contentVersion: grade3MeaningMazeContentVersion,
  }

  return { passage, guide, sentenceIds }
}

const sourcePlans: readonly SourcePlan[] = [
  {
    key: 'contextClueCompass',
    sourceKind: 'informational',
    title: 'A Night Garden Survey',
    readingContext: 'A nature club uses several kinds of context clues to understand unfamiliar words in a garden report.',
    sectionHeadings: ['Watching After Sunset', 'Clues in the Report'],
    firstSectionSentenceCount: 6,
    sentences: [
      'A nature club visited a community garden after sunset to observe animals that are active at night.',
      'The report called these animals nocturnal, meaning they rest during much of the day and move about after dark.',
      'A small moth circled a white flower while a bat crossed above the tool shed.',
      'After the late visit, the students felt drowsy; they were sleepy enough to yawn on the walk home.',
      'They saved their notes and returned the next morning to check the soil and plants.',
      'Rain had filled the shallow tubs beside the garden beds.',
      'Water was plentiful in the tubs, but dry soil was scarce beneath the wide leaves.',
      'Only a small amount of loose, dry soil could be found there.',
      'One sponge was saturated because it had soaked up so much rain that water dripped when Maya lifted it.',
      'The students compared each unfamiliar word with the complete sentence and nearby details.',
      'A definition unlocked nocturnal, a restatement clarified drowsy, and a contrast explained scarce.',
      'The result of soaking in rain helped the group understand saturated without guessing from one word alone.',
    ],
    targets: [
      {
        targetText: 'nocturnal', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 1,
        intendedMeaning: 'active at night', primaryStrategy: 'context-clue', secondaryStrategies: ['background-knowledge'],
        contextSentenceIndexes: [0, 1, 2], contextClueKind: 'definition',
        strategyExplanation: 'The sentence directly explains what nocturnal animals do and when they do it.',
        confirmationStatement: 'The moth and bat moving after sunset confirm that nocturnal means active at night.',
      },
      {
        targetText: 'drowsy', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 3,
        intendedMeaning: 'sleepy', primaryStrategy: 'context-clue', secondaryStrategies: ['background-knowledge'],
        contextSentenceIndexes: [3], contextClueKind: 'restatement',
        strategyExplanation: 'The phrase after the semicolon restates drowsy as sleepy enough to yawn.',
        confirmationStatement: 'Yawning after a late visit confirms the sleepy meaning.',
      },
      {
        targetText: 'scarce', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 6,
        intendedMeaning: 'hard to find or available only in a small amount', primaryStrategy: 'context-clue', secondaryStrategies: ['word-relationship'],
        contextSentenceIndexes: [6, 7], contextClueKind: 'contrast', relationshipKind: 'antonym', relatedWords: ['plentiful'],
        strategyExplanation: 'The contrast between plentiful water and scarce dry soil signals opposite amounts.',
        confirmationStatement: 'The next sentence says only a small amount could be found.',
      },
      {
        targetText: 'saturated', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 8,
        intendedMeaning: 'soaked completely with liquid', primaryStrategy: 'context-clue', secondaryStrategies: ['background-knowledge'],
        contextSentenceIndexes: [5, 8], contextClueKind: 'cause-effect',
        strategyExplanation: 'Soaking up rain caused the sponge to drip, revealing the meaning.',
        confirmationStatement: 'A dripping sponge after heavy rain is completely soaked.',
      },
    ],
    supports: [
      { word: 'nocturnal', sentenceIndex: 1, chunks: ['noc', 'tur', 'nal'] },
      { word: 'drowsy', sentenceIndex: 3, chunks: ['drow', 'sy'] },
      { word: 'scarce', sentenceIndex: 6, chunks: ['scarce'] },
      { word: 'saturated', sentenceIndex: 8, chunks: ['sat', 'ur', 'at', 'ed'] },
    ],
  },
  {
    key: 'relationshipRopes',
    sourceKind: 'prose',
    title: 'The Gate on the Garden Trail',
    readingContext: 'A short story uses word relationships to help a reader understand four unfamiliar words.',
    sentences: [
      'Leah and Omar followed a garden trail toward a small gate that had blown open in the wind.',
      'A swift rabbit, quick enough to cross the path in a blink, darted under the fence.',
      'Omar hurried ahead, but Leah stopped beside a young maple tree.',
      'The sapling was a tree only as tall as Leah, with a thin trunk that bent in the breeze.',
      'A timid fawn stood behind it and watched the open gate.',
      'The fawn was not bold like the rabbit; it took one careful step and then pulled back.',
      'Leah whispered, "Let us close the gate slowly so we do not frighten it."',
      'The lower hinge, the metal part that lets the gate swing, had twisted sideways.',
      'Omar held the gate steady while Leah slipped the hinge back onto its pin.',
      'When the gate moved smoothly again, they latched it and stepped away.',
      'The fawn waited, then followed its mother toward the trees instead of the road.',
      'Omar noticed that quick helped explain swift, while not bold pointed toward timid.',
      'He also saw that a sapling belongs to the tree category and a hinge has the job of letting a gate swing.',
      'The relationships did not give every detail, but the story confirmed each meaning.',
    ],
    targets: [
      {
        targetText: 'swift', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 1,
        intendedMeaning: 'moving very quickly', primaryStrategy: 'word-relationship', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [1], relationshipKind: 'synonym', relatedWords: ['quick'],
        strategyExplanation: 'Quick is a near synonym that explains swift in this action.',
        confirmationStatement: 'Crossing the path in a blink confirms fast movement.',
      },
      {
        targetText: 'timid', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 4,
        intendedMeaning: 'shy or easily frightened', primaryStrategy: 'word-relationship', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [4, 5], relationshipKind: 'antonym', relatedWords: ['bold'],
        strategyExplanation: 'The contrast with bold helps identify timid as cautious and fearful.',
        confirmationStatement: 'The fawn steps back instead of approaching the gate.',
      },
      {
        targetText: 'sapling', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 3,
        intendedMeaning: 'a young tree', primaryStrategy: 'word-relationship', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [2, 3], relationshipKind: 'category-member', relatedWords: ['tree'],
        strategyExplanation: 'Sapling names a member of the larger tree category.',
        confirmationStatement: 'The thin trunk and short height match a young tree.',
      },
      {
        targetText: 'hinge', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 7,
        intendedMeaning: 'a jointed part that lets a gate or door swing', primaryStrategy: 'word-relationship', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [7, 8, 9], relationshipKind: 'object-function', relatedWords: ['swing'],
        strategyExplanation: 'The object-function relationship explains what a hinge does.',
        confirmationStatement: 'Repairing the hinge lets the gate move smoothly again.',
      },
    ],
    supports: [
      { word: 'swift', sentenceIndex: 1, chunks: ['swift'] },
      { word: 'sapling', sentenceIndex: 3, chunks: ['sap', 'ling'] },
      { word: 'timid', sentenceIndex: 4, chunks: ['tim', 'id'] },
      { word: 'hinge', sentenceIndex: 7, chunks: ['hinge'] },
    ],
  },
  {
    key: 'referenceToolRoom',
    sourceKind: 'informational',
    title: 'Planning a Pond Walk',
    readingContext: 'Students use local glossary and dictionary cards to prepare directions for a pond observation walk.',
    sectionHeadings: ['Preparing the Route', 'Using the Local Reference Cards'],
    firstSectionSentenceCount: 7,
    sentences: [
      'A class planned a short pond walk to study where animals live and how people can observe them safely.',
      'Their guide called the pond-edge habitat a place that provides the food, water, shelter, and space an organism needs.',
      'The students marked reeds, shallow water, and a fallen log as parts of that habitat.',
      'Next, they drew a route from the school garden to the pond platform.',
      'The route was the path the group would follow, not every trail shown on the map.',
      'At the platform, students would observe quietly by watching and recording without touching nests or animals.',
      'They practiced writing one fact they could see and one question they still had.',
      'The garden path was wide and sunny; in contrast, the final pond path was narrow and shaded.',
      'The words in contrast signaled that the writer was pointing out a difference between the two path sections.',
      'A local glossary card confirmed habitat and route without opening another website.',
      'A dictionary card offered two senses of observe, and the sentence selected the sense meaning to watch carefully.',
      'The class checked each reference meaning against the complete directions.',
      'They rejected the sense meaning to celebrate a holiday because no holiday was discussed.',
      'Using both the reference card and source context kept the directions clear.',
    ],
    references: [
      {
        referenceId: 'g3-cc-mm-reference-tool-room-glossary-habitat', visibleKind: 'glossary', kind: 'glossary', headword: 'habitat',
        senses: [{ senseId: 'habitat-place', meaning: 'a place that provides what an organism needs to live', partOfSpeech: 'noun', selectedForContext: true, evidenceIds: ['g3-cc-mm-reference-tool-room-glossary-habitat'] }],
      },
      {
        referenceId: 'g3-cc-mm-reference-tool-room-glossary-route', visibleKind: 'glossary', kind: 'glossary', headword: 'route',
        senses: [{ senseId: 'route-path', meaning: 'a path or way used to travel from one place to another', partOfSpeech: 'noun', selectedForContext: true, evidenceIds: ['g3-cc-mm-reference-tool-room-glossary-route'] }],
      },
      {
        referenceId: 'g3-cc-mm-reference-tool-room-dictionary-observe', visibleKind: 'reference', kind: 'dictionary', headword: 'observe',
        senses: [
          { senseId: 'observe-watch', meaning: 'to watch carefully and notice details', partOfSpeech: 'verb', selectedForContext: true, evidenceIds: ['g3-cc-mm-reference-tool-room-dictionary-observe'] },
          { senseId: 'observe-custom', meaning: 'to honor or follow a holiday or custom', partOfSpeech: 'verb', selectedForContext: false, evidenceIds: ['g3-cc-mm-reference-tool-room-dictionary-observe'] },
        ],
      },
    ],
    targets: [
      {
        targetText: 'habitat', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 1,
        intendedMeaning: 'a place that provides what an organism needs to live', primaryStrategy: 'reference-material', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [1, 2], referenceEntryIds: ['g3-cc-mm-reference-tool-room-glossary-habitat'],
        strategyExplanation: 'The local glossary gives a concise meaning, and the source lists matching habitat parts.',
        confirmationStatement: 'Reeds, water, and a log can provide resources and shelter near the pond.',
      },
      {
        targetText: 'route', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 3,
        intendedMeaning: 'a path used to travel from one place to another', primaryStrategy: 'reference-material', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [3, 4], referenceEntryIds: ['g3-cc-mm-reference-tool-room-glossary-route'],
        strategyExplanation: 'The glossary meaning fits the line drawn from the garden to the pond.',
        confirmationStatement: 'The map line shows the path the class will follow.',
      },
      {
        targetText: 'observe', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 5,
        intendedMeaning: 'to watch carefully and notice details', primaryStrategy: 'reference-material', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [5, 6, 10, 12], referenceEntryIds: ['g3-cc-mm-reference-tool-room-dictionary-observe'],
        strategyExplanation: 'The dictionary offers two senses; watching and recording select the careful-watching sense.',
        confirmationStatement: 'The students watch, record, and avoid touching animals.',
      },
      {
        targetText: 'in contrast', targetForm: 'phrase', challengeKind: 'unfamiliar', sentenceIndex: 7,
        intendedMeaning: 'used to introduce how something differs from what came before', primaryStrategy: 'combined', secondaryStrategies: ['context-clue', 'word-relationship'],
        contextSentenceIndexes: [7, 8], contextClueKind: 'contrast', relationshipKind: 'antonym', relatedWords: ['wide', 'narrow', 'sunny', 'shaded'],
        strategyExplanation: 'The phrase links two opposite descriptions, so context and antonym pairs work together.',
        confirmationStatement: 'Wide contrasts with narrow, and sunny contrasts with shaded.',
      },
    ],
    supports: [
      { word: 'habitat', sentenceIndex: 1, chunks: ['hab', 'i', 'tat'] },
      { word: 'route', sentenceIndex: 3, chunks: ['route'] },
      { word: 'observe', sentenceIndex: 5, chunks: ['ob', 'serve'] },
      { word: 'contrast', sentenceIndex: 7, chunks: ['con', 'trast'] },
    ],
  },
  {
    key: 'backgroundKnowledgeBridge',
    sourceKind: 'prose',
    title: 'The Trail Marker Plan',
    readingContext: 'A trail team uses broad everyday knowledge together with story details to understand unfamiliar words and a planning phrase.',
    sentences: [
      'Nia and Eli volunteered to replace faded trail markers in a small nature park.',
      'They carried a map, wooden arrows, safe paint, and a list of turns checked by a park guide.',
      'The first old arrow hung beneath the canopy, the leafy upper layer formed by branches overhead.',
      'Drops still fell from those leaves even though the morning rain had stopped.',
      'Eli chose a sturdy post that stayed firm when he pushed it gently from both sides.',
      'A thin cracked post nearby leaned toward the path, so the team did not use it.',
      'At a fork, Nia raised a bright flag as a signal that showed the next helper where to stop.',
      'The helper saw the flag, paused, and brought the paint box to the correct turn.',
      'The guide asked the team to carry out the plan by following each mapped step from start to finish.',
      'They checked the arrow direction, painted the symbol, waited for it to dry, and recorded the location.',
      'Nia knew that branches and leaves can form a cover above a trail, but the sentence also named the canopy as an upper layer.',
      'Eli knew firm materials often hold up better, and the push test confirmed that sturdy meant strong and steady.',
      'People use visible signs to send information, while the flag action confirmed the meaning of signal.',
      'The sequence of completed steps showed that carry out the plan meant to do the plan, not lift a paper map.',
      'By joining broad knowledge with story evidence, the team understood each meaning without depending on private experience.',
    ],
    targets: [
      {
        targetText: 'canopy', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 2,
        intendedMeaning: 'the upper layer of leaves and branches in a forest or group of trees', primaryStrategy: 'word-relationship', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [2, 3, 10], relationshipKind: 'part-whole', relatedWords: ['leaves', 'branches', 'trees'],
        strategyExplanation: 'Leaves and branches are parts that make up the canopy above the trail.',
        confirmationStatement: 'Drops fall from the overhead leaves after rain.',
      },
      {
        targetText: 'sturdy', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 4,
        intendedMeaning: 'strong and not likely to bend or fall', primaryStrategy: 'background-knowledge', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [4, 5, 11], backgroundKnowledgeStatement: 'A strong support stays steady when it is pushed gently.',
        strategyExplanation: 'Broad knowledge about strong supports helps, while the push test and cracked-post contrast confirm it.',
        confirmationStatement: 'The chosen post stays firm; the rejected post is cracked and leaning.',
      },
      {
        targetText: 'signal', targetForm: 'word', challengeKind: 'unfamiliar', sentenceIndex: 6,
        intendedMeaning: 'a sign, sound, or action that communicates information', primaryStrategy: 'background-knowledge', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [6, 7, 12], backgroundKnowledgeStatement: 'People often use visible signs or actions to send a simple message.',
        strategyExplanation: 'The familiar idea of a sign helps, and the helper responding to the flag confirms the message.',
        confirmationStatement: 'The flag tells the helper where to stop and bring supplies.',
      },
      {
        targetText: 'carry out the plan', targetForm: 'phrase', challengeKind: 'unfamiliar', sentenceIndex: 8,
        intendedMeaning: 'to perform or complete the planned actions', primaryStrategy: 'combined', secondaryStrategies: ['context-clue', 'background-knowledge'],
        contextSentenceIndexes: [8, 9, 13], backgroundKnowledgeStatement: 'A plan guides actions that people then do in order.',
        strategyExplanation: 'Background knowledge about plans combines with the listed completed steps.',
        confirmationStatement: 'The team follows the mapped steps instead of physically carrying the plan.',
      },
    ],
    supports: [
      { word: 'canopy', sentenceIndex: 2, chunks: ['can', 'o', 'py'] },
      { word: 'sturdy', sentenceIndex: 4, chunks: ['stur', 'dy'] },
      { word: 'signal', sentenceIndex: 6, chunks: ['sig', 'nal'] },
      { word: 'mapped', sentenceIndex: 8, chunks: ['mapped'] },
    ],
  },
  {
    key: 'moreThanOneDoor',
    sourceKind: 'informational',
    title: 'Four Words with More Than One Door',
    readingContext: 'An informational text shows how context and a local dictionary select one sense of a multiple-meaning word.',
    sectionHeadings: ['One Word, Several Senses', 'Checking the Complete Context'],
    firstSectionSentenceCount: 8,
    sentences: [
      'Some words open more than one meaning door, so readers must choose the sense that fits the full context.',
      'During a stream study, the class stood on the grassy bank beside the water and recorded insects near the shore.',
      'No money was stored there, and the sentence about a stream selected the land-beside-water sense of bank.',
      'The current carried a floating leaf downstream past three marked stones.',
      'Other examples of current can mean happening now or a flow of electricity, but water movement fits this investigation.',
      'Back in class, Ana wrote a draft of the group report before revising the final copy.',
      'A local dictionary card defined this noun sense as an early version of a piece of writing.',
      'The card also listed a current of air as a different sense, so the class still checked the report sentence.',
      'On a map, the students used a scale showing that one centimeter represented ten meters beside the stream.',
      'A fish scale or a device for weighing would not explain how map distance represents real distance.',
      'Examples in the section helped the readers reject those other senses.',
      'The words bank, current, draft, and scale each had genuine alternate meanings.',
      'A familiar meaning was not automatically the correct one.',
      'The students combined grammar, nearby details, and the topic of the section.',
      'They chose a sense only when it fit every important clue instead of one nearby word.',
      'This careful check made the science report and map directions accurate.',
    ],
    references: [
      {
        referenceId: 'g3-cc-mm-more-than-one-door-dictionary-draft', visibleKind: 'reference', kind: 'dictionary', headword: 'draft',
        senses: [
          { senseId: 'draft-writing', meaning: 'an early version of a piece of writing', partOfSpeech: 'noun', selectedForContext: true, evidenceIds: ['g3-cc-mm-more-than-one-door-dictionary-draft'] },
          { senseId: 'draft-air', meaning: 'a current of cool air moving through a space', partOfSpeech: 'noun', selectedForContext: false, evidenceIds: ['g3-cc-mm-more-than-one-door-dictionary-draft'] },
        ],
      },
    ],
    targets: [
      {
        targetText: 'bank', targetForm: 'word', challengeKind: 'multiple-meaning', sentenceIndex: 1,
        intendedMeaning: 'land beside a body of water', primaryStrategy: 'combined', secondaryStrategies: ['context-clue', 'background-knowledge'],
        contextSentenceIndexes: [1, 2], backgroundKnowledgeStatement: 'Streams have edges made of land, while financial banks hold money.',
        alternateMeanings: [
          { senseId: 'bank-water', meaning: 'land beside water', partOfSpeech: 'noun', selectedForContext: true },
          { senseId: 'bank-money', meaning: 'a place that keeps and manages money', partOfSpeech: 'noun', selectedForContext: false },
        ],
        strategyExplanation: 'The stream topic and the contrast with money select the shore meaning.',
        confirmationStatement: 'The class stands beside water and records insects near the shore.',
      },
      {
        targetText: 'current', targetForm: 'word', challengeKind: 'multiple-meaning', sentenceIndex: 3,
        intendedMeaning: 'a steady movement of water in one direction', primaryStrategy: 'context-clue', secondaryStrategies: ['background-knowledge'],
        contextSentenceIndexes: [3, 4], contextClueKind: 'example',
        alternateMeanings: [
          { senseId: 'current-water', meaning: 'a steady movement of water', partOfSpeech: 'noun', selectedForContext: true },
          { senseId: 'current-now', meaning: 'happening now', partOfSpeech: 'adjective', selectedForContext: false },
          { senseId: 'current-electric', meaning: 'a flow of electricity', partOfSpeech: 'noun', selectedForContext: false },
        ],
        strategyExplanation: 'The floating leaf moving downstream is an example of a water current.',
        confirmationStatement: 'The current carries a leaf past marked stones.',
      },
      {
        targetText: 'draft', targetForm: 'word', challengeKind: 'multiple-meaning', sentenceIndex: 5,
        intendedMeaning: 'an early version of a piece of writing', primaryStrategy: 'reference-material', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [5, 6, 7], referenceEntryIds: ['g3-cc-mm-more-than-one-door-dictionary-draft'],
        alternateMeanings: [
          { senseId: 'draft-writing', meaning: 'an early version of a piece of writing', partOfSpeech: 'noun', selectedForContext: true },
          { senseId: 'draft-air', meaning: 'a current of cool air', partOfSpeech: 'noun', selectedForContext: false },
        ],
        strategyExplanation: 'The dictionary gives two senses, while revising a final copy selects the writing sense.',
        confirmationStatement: 'Ana writes the draft before revising the final report.',
      },
      {
        targetText: 'scale', targetForm: 'word', challengeKind: 'multiple-meaning', sentenceIndex: 8,
        intendedMeaning: 'a map rule showing how a measured distance represents a real distance', primaryStrategy: 'combined', secondaryStrategies: ['context-clue', 'background-knowledge'],
        contextSentenceIndexes: [8, 9, 10],
        backgroundKnowledgeStatement: 'Maps often use a distance rule, while fish coverings and weighing devices are different familiar senses of scale.',
        alternateMeanings: [
          { senseId: 'scale-map', meaning: 'a map rule connecting map distance to real distance', partOfSpeech: 'noun', selectedForContext: true },
          { senseId: 'scale-fish', meaning: 'one of the small plates covering a fish', partOfSpeech: 'noun', selectedForContext: false },
          { senseId: 'scale-weigh', meaning: 'a device used to measure weight', partOfSpeech: 'noun', selectedForContext: false },
        ],
        strategyExplanation: 'The map topic and one-centimeter-to-ten-meters example select the distance rule.',
        confirmationStatement: 'The scale connects a map measurement to real stream distance.',
      },
    ],
    supports: [
      { word: 'bank', sentenceIndex: 1, chunks: ['bank'] },
      { word: 'current', sentenceIndex: 3, chunks: ['cur', 'rent'] },
      { word: 'draft', sentenceIndex: 5, chunks: ['draft'] },
      { word: 'scale', sentenceIndex: 8, chunks: ['scale'] },
    ],
  },
  {
    key: 'figurativePhrasePaths',
    sourceKind: 'poem',
    title: 'The Map We Made Together',
    readingContext: 'A poem provides context for interpreting four figurative phrases without asking learners to name a device.',
    stanzaEnds: [6, 12, 18, 24],
    sentences: [
      'Morning hid the path from sight,',
      'a blanket of fog covered every stone.',
      'We waited by the cedar rail,',
      'until warm light thinned the gray.',
      'Soon trail marks showed again,',
      'and we opened our map.',
      'Mira shared a careful thought,',
      'and the idea took root in our group.',
      'We would mark each turn with string,',
      'then check the route on our return.',
      'Everyone added one useful step,',
      'so the plan began to grow.',
      'At the creek the plan hit a snag:',
      'one bridge board had washed away.',
      'We stopped instead of stepping across,',
      'and drew a safe detour uphill.',
      'The trouble slowed our feet,',
      'but it did not end the work.',
      'As we measured, time slipped away;',
      'the sun moved low beyond the pines.',
      'We packed the string and notes,',
      'with the final loop still unfinished.',
      'Tomorrow we will follow our map,',
      'and finish the path together.',
    ],
    targets: [
      {
        targetText: 'a blanket of fog', targetForm: 'phrase', challengeKind: 'figurative', sentenceIndex: 1,
        intendedMeaning: 'thick fog covered the area', primaryStrategy: 'background-knowledge', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [0, 1, 3, 4], backgroundKnowledgeStatement: 'A blanket covers what lies beneath it, and thick fog can hide a view.',
        literalReading: 'A cloth blanket lay over the trail.',
        strategyExplanation: 'Broad knowledge about covering combines with lines saying the path was hidden and later reappeared.',
        confirmationStatement: 'Warm light thins the gray and trail marks show again, so fog rather than cloth covered the view.',
      },
      {
        targetText: 'the idea took root', targetForm: 'phrase', challengeKind: 'figurative', sentenceIndex: 7,
        intendedMeaning: 'the group accepted the idea and began developing it', primaryStrategy: 'combined', secondaryStrategies: ['context-clue', 'background-knowledge'],
        contextSentenceIndexes: [6, 7, 8, 10, 11], backgroundKnowledgeStatement: 'Roots help a plant begin and grow; an accepted idea can also develop.',
        literalReading: 'The idea grew plant roots.',
        strategyExplanation: 'The growth image and the group adding steps together reveal the figurative meaning.',
        confirmationStatement: 'Everyone adds a step and the plan begins to grow.',
      },
      {
        targetText: 'the plan hit a snag', targetForm: 'phrase', challengeKind: 'figurative', sentenceIndex: 12,
        intendedMeaning: 'the plan met an unexpected problem', primaryStrategy: 'combined', secondaryStrategies: ['context-clue', 'word-relationship'],
        contextSentenceIndexes: [12, 13, 14, 15], relationshipKind: 'synonym', relatedWords: ['trouble', 'problem'],
        literalReading: 'The plan bumped into a sharp branch or knot.',
        strategyExplanation: 'The colon introduces the washed-away board as the problem, and trouble restates snag.',
        confirmationStatement: 'The missing bridge board forces the group to stop and make a detour.',
      },
      {
        targetText: 'time slipped away', targetForm: 'phrase', challengeKind: 'figurative', sentenceIndex: 18,
        intendedMeaning: 'time passed quickly without the group noticing enough of it', primaryStrategy: 'combined', secondaryStrategies: ['context-clue', 'background-knowledge'],
        contextSentenceIndexes: [18, 19, 20, 21], backgroundKnowledgeStatement: 'A lowering sun signals that much of the day has passed.',
        literalReading: 'Time was an object that slid out of someone’s hands.',
        strategyExplanation: 'The low sun and unfinished work show that the available time passed quickly.',
        confirmationStatement: 'The group packs up with work unfinished because the sun is already low.',
      },
    ],
    supports: [
      { word: 'blanket', sentenceIndex: 1, chunks: ['blan', 'ket'] },
      { word: 'root', sentenceIndex: 7, chunks: ['root'] },
      { word: 'snag', sentenceIndex: 12, chunks: ['snag'] },
      { word: 'slipped', sentenceIndex: 18, chunks: ['slipped'] },
    ],
  },
  {
    key: 'unknownWordsPhrases',
    sourceKind: 'informational',
    title: 'Turning Field Notes into a Museum Display',
    readingContext: 'A project guide combines context, a thesaurus card, broad knowledge, and multiple-meaning sense selection.',
    sectionHeadings: ['Following the Research Trail', 'Explaining the Display'],
    firstSectionSentenceCount: 9,
    sentences: [
      'A class turned field notes from a wetland walk into a small museum display for the library.',
      'Each team made one main point, an idea it wanted visitors to understand about the wetland.',
      'One display point was that shallow water gives young frogs places to hide among plants.',
      'The students supported that idea with a sketch, a measured water depth, and an observation note.',
      'Another team followed the track of a heron across damp mud.',
      'In this sentence, track meant a line of prints left by the bird, not a racing path or a music recording.',
      'Students used broad knowledge that feet can leave marks, and the damp-mud detail confirmed the sense.',
      'Writers revised their captions at a steady pace, moving at a regular speed without rushing.',
      'A local thesaurus card connected at a steady pace with evenly and regularly, but not suddenly.',
      'For the final panel, precise words painted a picture of reeds bending, frogs splashing, and a heron lifting into the air.',
      'No paint appeared on the words; the detailed language helped visitors imagine the scene clearly.',
      'The team checked every phrase against the whole section rather than choosing a meaning from one familiar word.',
      'They also compared each main point with the evidence placed beneath it.',
      'A point about wetland shelter needed evidence about shelter, not an unrelated fact about the library.',
      'The bird track caption named the prints and explained where the heron walked.',
      'The pace phrase described how the writers worked, while the painted-picture phrase described the effect of vivid language.',
      'Combining strategies helped the display stay accurate, clear, and inviting.',
    ],
    references: [
      {
        referenceId: 'g3-cc-mm-unknown-words-phrases-thesaurus-steady-pace', visibleKind: 'reference', kind: 'thesaurus', headword: 'at a steady pace',
        senses: [{ senseId: 'steady-pace-regular', meaning: 'at a regular, even speed', selectedForContext: true, evidenceIds: ['g3-cc-mm-unknown-words-phrases-thesaurus-steady-pace'] }],
        relatedWords: ['evenly', 'regularly'],
      },
    ],
    targets: [
      {
        targetText: 'point', targetForm: 'word', challengeKind: 'multiple-meaning', sentenceIndex: 1,
        intendedMeaning: 'a main idea someone wants to communicate', primaryStrategy: 'context-clue', secondaryStrategies: ['word-relationship'],
        contextSentenceIndexes: [1, 2, 3, 12, 13], contextClueKind: 'definition',
        alternateMeanings: [
          { senseId: 'point-idea', meaning: 'a main idea or message', partOfSpeech: 'noun', selectedForContext: true },
          { senseId: 'point-tip', meaning: 'a sharp end', partOfSpeech: 'noun', selectedForContext: false },
          { senseId: 'point-show', meaning: 'to direct attention with a finger', partOfSpeech: 'verb', selectedForContext: false },
        ],
        strategyExplanation: 'The sentence directly restates point as an idea visitors should understand.',
        confirmationStatement: 'The following sentence states the wetland idea and the team supports it with evidence.',
      },
      {
        targetText: 'track', targetForm: 'word', challengeKind: 'multiple-meaning', sentenceIndex: 4,
        intendedMeaning: 'a line of footprints or marks left by an animal', primaryStrategy: 'background-knowledge', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [4, 5, 6, 14], backgroundKnowledgeStatement: 'Feet can leave prints in soft, damp ground.',
        alternateMeanings: [
          { senseId: 'track-prints', meaning: 'a line of footprints or marks', partOfSpeech: 'noun', selectedForContext: true },
          { senseId: 'track-race', meaning: 'a prepared path for racing', partOfSpeech: 'noun', selectedForContext: false },
          { senseId: 'track-recording', meaning: 'one recorded song or sound selection', partOfSpeech: 'noun', selectedForContext: false },
        ],
        strategyExplanation: 'Knowledge about footprints helps, and damp mud plus the bird’s path confirms it.',
        confirmationStatement: 'The caption names prints and explains where the heron walked.',
      },
      {
        targetText: 'words painted a picture', targetForm: 'phrase', challengeKind: 'figurative', sentenceIndex: 9,
        intendedMeaning: 'the words created a clear image in the reader’s mind', primaryStrategy: 'combined', secondaryStrategies: ['context-clue', 'background-knowledge'],
        contextSentenceIndexes: [9, 10, 15], backgroundKnowledgeStatement: 'Pictures show scenes visually, while detailed language can help a reader imagine a scene.',
        literalReading: 'Written words used paint to make a physical picture.',
        strategyExplanation: 'The vivid examples and the statement that no paint appeared reject the literal reading.',
        confirmationStatement: 'The detailed language helps visitors imagine reeds, frogs, and a heron.',
      },
      {
        targetText: 'at a steady pace', targetForm: 'phrase', challengeKind: 'unfamiliar', sentenceIndex: 7,
        intendedMeaning: 'at a regular, even speed', primaryStrategy: 'reference-material', secondaryStrategies: ['context-clue'],
        contextSentenceIndexes: [7, 8, 15], referenceEntryIds: ['g3-cc-mm-unknown-words-phrases-thesaurus-steady-pace'],
        strategyExplanation: 'The thesaurus card supplies related words, and the source says the writers did not rush.',
        confirmationStatement: 'Evenly and regularly fit the writing work, while suddenly does not.',
      },
    ],
    supports: [
      { word: 'point', sentenceIndex: 1, chunks: ['point'] },
      { word: 'track', sentenceIndex: 4, chunks: ['track'] },
      { word: 'steady', sentenceIndex: 7, chunks: ['stead', 'y'] },
      { word: 'painted', sentenceIndex: 9, chunks: ['paint', 'ed'] },
    ],
  },
]

export const grade3MeaningMazeArtifacts = {
  contextClueCompass: buildArtifact(sourcePlans[0]),
  relationshipRopes: buildArtifact(sourcePlans[1]),
  referenceToolRoom: buildArtifact(sourcePlans[2]),
  backgroundKnowledgeBridge: buildArtifact(sourcePlans[3]),
  moreThanOneDoor: buildArtifact(sourcePlans[4]),
  figurativePhrasePaths: buildArtifact(sourcePlans[5]),
  unknownWordsPhrases: buildArtifact(sourcePlans[6]),
} as const

export const grade3MeaningMazePassages = Object.values(grade3MeaningMazeArtifacts).map((artifact) => artifact.passage)
export const grade3MeaningMazeGuides = Object.values(grade3MeaningMazeArtifacts).map((artifact) => artifact.guide)
