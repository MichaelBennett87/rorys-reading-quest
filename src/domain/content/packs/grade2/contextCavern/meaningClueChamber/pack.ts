import type {
  ContentPack,
  ContentPackLesson,
  MeaningClueGuide,
  MeaningClueTarget,
} from '../../../contentPackTypes'
import type { Passage, ReadingQuestion, WordSupportTarget } from '../../../../types'
import type {
  InformationalFeature,
  InformationalHeadingFeature,
  InformationalSection,
  InformationalTitleFeature,
} from '../../../../informationalTypes'
import {
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
  createTwoPartQuestion,
  lessonChoice as choice,
} from './questionFactories'
import {
  contextCavernMeaningClueChamberContentVersion,
  contextCavernMeaningClueChamberLessonIds,
  contextCavernMeaningClueChamberPackId,
  contextCavernMeaningClueChamberPassageIds,
  contextCavernMeaningClueChamberPrimarySkillId,
  contextCavernMeaningClueChamberQuestionIds,
  contextCavernMeaningClueChamberSentenceIds,
  contextCavernMeaningClueChamberUnitId,
  contextCavernMeaningClueChamberWorldId,
} from './ids'

const MEANING_CLUE_TAGS = [
  'context-clues',
  'word-relationships',
  'reference-materials',
  'background-knowledge',
  'context-definition',
  'context-restatement',
  'context-example',
  'context-contrast',
  'context-cause-effect',
  'relationship-synonym',
  'relationship-antonym',
  'relationship-category-member',
  'relationship-part-whole',
  'relationship-object-function',
  'glossary-reference',
  'reference-definition-selection',
  'background-knowledge-connection',
  'unknown-word-meaning',
  'strategy-selection',
  'meaning-confirmation',
] as const

type Sentence = {
  sentenceId: string
  text: string
}

type TargetPlan = {
  word: string
  sentenceIndex: number
  splitIndex: number
  childFriendlyMeaning: string
  primaryStrategy: MeaningClueTarget['primaryStrategy']
  clueEvidenceIds: string[]
  strategyExplanation: string
  contextClueKind?: MeaningClueTarget['contextClueKind']
  relationshipKind?: MeaningClueTarget['relationshipKind']
  relatedWords?: string[]
  glossaryEntryId?: string
  backgroundKnowledgeStatement?: string
}

type PassagePlan = {
  key: keyof typeof contextCavernMeaningClueChamberPassageIds
  passageId: string
  title: string
  readingContext: string
  sectionSentenceIds: string[][]
  sectionHeadings: [string, string] | [string, string, string]
  sentences: Sentence[]
  glossaryEntries: {
    entryId: string
    term: string
    definition: string
  }[]
  targetPlans: readonly TargetPlan[]
}

type PassageArtifact = {
  passage: Passage
  guide: MeaningClueGuide
  targets: TargetArtifact[]
}

type TargetArtifact = TargetPlan & {
  sentenceId: string
  sentenceText: string
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
  sentenceText: string,
  sentenceId: string,
  surfaceWord: string,
  splitIndex: number,
): WordSupportTarget {
  const first = surfaceWord.slice(0, splitIndex)
  const second = surfaceWord.slice(splitIndex)
  return {
    targetId: `${passageId}-${sentenceId}-${surfaceWord}`,
    passageId,
    sentenceId,
    surfaceWord,
    focusParts: [
      { text: first, emphasis: false },
      { text: second, emphasis: true },
    ],
    displayChunks: [
      { displayText: first, speechText: first },
      { displayText: second, speechText: second },
    ],
    spokenChunks: [
      { displayText: first, speechText: first },
      { displayText: second, speechText: second },
    ],
    blendSpeechText: surfaceWord,
    wholeWordSpeechText: surfaceWord,
    sentenceSpeechText: sentenceText,
    reviewStatus: 'DRAFT',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
  }
}

function rotate<T>(items: readonly T[], startIndex: number): T[] {
  const normalized = startIndex % items.length
  return [...items.slice(normalized), ...items.slice(0, normalized)]
}

function buildPassageArtifact(plan: PassagePlan): PassageArtifact {
  const sentenceByIndex = plan.sentences
  const sentenceById = new Map(sentenceByIndex.map((sentence) => [sentence.sentenceId, sentence] as const))
  const titleFeatureId = contextCavernMeaningClueChamberPassageIds[plan.key].titleFeatureId
  const headingIds = contextCavernMeaningClueChamberPassageIds[plan.key].headingFeatureIds
  const glossaryFeatureId = `${plan.passageId}-glossary`
  const targetArtifacts = plan.targetPlans.map((targetPlan) => {
    const sentence = sentenceByIndex[targetPlan.sentenceIndex]
    return {
      ...targetPlan,
      sentenceId: sentence.sentenceId,
      sentenceText: sentence.text,
    } satisfies TargetArtifact
  })

  const passage: Passage = {
    passageIdentifier: plan.passageId,
    gradeBand: 2,
    contentKind: 'informational',
    passageText: sentenceByIndex.map((sentence) => sentence.text).join(' '),
    sentences: sentenceByIndex.map((sentence) => ({ ...sentence })),
    informationalStructure: {
      titleFeatureId,
      sections: plan.sectionSentenceIds.map((sectionSentenceIds, index) => ({
        sectionId: `${plan.passageId}-section-${index + 1}`,
        headingFeatureId: headingIds[index],
        sentenceIds: [...sectionSentenceIds],
        featureIds: [],
      })) satisfies InformationalSection[],
      features: [
        createTitle(titleFeatureId, plan.title),
        ...headingIds.map((headingId, index) =>
          createHeading(headingId, `${plan.passageId}-section-${index + 1}`, plan.sectionHeadings[index]!),
        ),
        {
          featureId: glossaryFeatureId,
          kind: 'glossary',
          entries: plan.glossaryEntries.map((entry) => ({ ...entry })),
        },
      ] satisfies InformationalFeature[],
    },
    readingContext: plan.readingContext,
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    reviewStatus: 'DRAFT',
    wordSupportTargets: targetArtifacts.map((target) =>
      makeSupportTarget(
        plan.passageId,
        sentenceById.get(target.sentenceId)!.text,
        target.sentenceId,
        target.word,
        target.splitIndex,
      ),
    ),
  }

  const guide: MeaningClueGuide = {
    passageId: plan.passageId,
    targets: targetArtifacts.map((target) => ({
      targetId: `${plan.passageId}-${target.word}`,
      word: target.word,
      sentenceId: target.sentenceId,
      childFriendlyMeaning: target.childFriendlyMeaning,
      primaryStrategy: target.primaryStrategy,
      clueEvidenceIds: [...target.clueEvidenceIds],
      strategyExplanation: target.strategyExplanation,
      contextClueKind: target.contextClueKind,
      relationshipKind: target.relationshipKind,
      relatedWords: target.relatedWords ? [...target.relatedWords] : undefined,
      glossaryEntryId: target.glossaryEntryId,
      backgroundKnowledgeStatement: target.backgroundKnowledgeStatement,
    })),
    reviewStatus: 'DRAFT',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
  }

  return { passage, guide, targets: targetArtifacts }
}

const PASSAGE_PLANS: readonly PassagePlan[] = [
  {
    key: 'pondHabitat',
    passageId: contextCavernMeaningClueChamberPassageIds.pondHabitat.passageId,
    title: 'A Pond Habitat for Frogs',
    readingContext: 'A nature walk note about a pond habitat and the places frogs use for shelter.',
    sectionHeadings: ['After the Rain', 'Safe Places by the Water'],
    sectionSentenceIds: [
      [
        contextCavernMeaningClueChamberSentenceIds.pondHabitat[0],
        contextCavernMeaningClueChamberSentenceIds.pondHabitat[1],
        contextCavernMeaningClueChamberSentenceIds.pondHabitat[2],
        contextCavernMeaningClueChamberSentenceIds.pondHabitat[3],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.pondHabitat[4],
        contextCavernMeaningClueChamberSentenceIds.pondHabitat[5],
        contextCavernMeaningClueChamberSentenceIds.pondHabitat[6],
      ],
    ],
    sentences: [
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.pondHabitat[0], text: 'After the rain, the pond bank stayed damp under the willow branches.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.pondHabitat[1], text: 'Damp means slightly wet, not soaked through.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.pondHabitat[2], text: 'A small cluster of stones made a safe doorway for a frog burrow.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.pondHabitat[3], text: 'A habitat is the place where an animal lives, and the glossary gives that meaning.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.pondHabitat[4], text: 'Frogs use the burrow to rest when the sun is hot.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.pondHabitat[5], text: 'Shade near the water keeps the little shelter cooler.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.pondHabitat[6], text: 'The quiet pond edge gives the frogs room to hide and rest.' },
    ],
    glossaryEntries: [
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.pondHabitat.passageId}-glossary-habitat`,
        term: 'habitat',
        definition: 'The place where an animal lives.',
      },
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.pondHabitat.passageId}-glossary-cluster`,
        term: 'cluster',
        definition: 'A small group of things close together.',
      },
    ],
    targetPlans: [
      {
        word: 'damp',
        sentenceIndex: 1,
        splitIndex: 2,
        childFriendlyMeaning: 'Damp means slightly wet, not soaked through.',
        primaryStrategy: 'context-clue',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.pondHabitat[1]],
        strategyExplanation: 'The sentence gives the meaning directly, so the context clue is a definition clue.',
        contextClueKind: 'definition',
      },
      {
        word: 'cluster',
        sentenceIndex: 2,
        splitIndex: 4,
        childFriendlyMeaning: 'A cluster is a small group of things close together.',
        primaryStrategy: 'word-relationship',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.pondHabitat[2]],
        strategyExplanation: 'The sentence shows cluster as a small group of stones, so the word belongs with group words.',
        relationshipKind: 'category-member',
        relatedWords: ['group', 'bunch'],
      },
      {
        word: 'habitat',
        sentenceIndex: 3,
        splitIndex: 4,
        childFriendlyMeaning: 'A habitat is the place where an animal lives.',
        primaryStrategy: 'reference-material',
        clueEvidenceIds: [
          `${contextCavernMeaningClueChamberPassageIds.pondHabitat.passageId}-glossary-habitat`,
        ],
        strategyExplanation: 'The glossary gives the exact meaning, so the reference material is the best help.',
        glossaryEntryId: `${contextCavernMeaningClueChamberPassageIds.pondHabitat.passageId}-glossary-habitat`,
      },
      {
        word: 'burrow',
        sentenceIndex: 4,
        splitIndex: 3,
        childFriendlyMeaning: 'A burrow is a hole or tunnel that an animal uses as a safe place.',
        primaryStrategy: 'background-knowledge',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.pondHabitat[4]],
        strategyExplanation: 'Many learners already know burrows are safe places for animals, and that knowledge fits the sentence.',
        backgroundKnowledgeStatement: 'Animals often use burrows as safe places to rest or hide.',
      },
    ],
  },
  {
    key: 'birdNestSupport',
    passageId: contextCavernMeaningClueChamberPassageIds.birdNestSupport.passageId,
    title: 'Bird Nests Need Strong Support',
    readingContext: 'A bird-watch note about nests, shelter, and what helps eggs stay safe.',
    sectionHeadings: ['A Nest in the Wind', 'Safe and Strong'],
    sectionSentenceIds: [
      [
        contextCavernMeaningClueChamberSentenceIds.birdNestSupport[0],
        contextCavernMeaningClueChamberSentenceIds.birdNestSupport[1],
        contextCavernMeaningClueChamberSentenceIds.birdNestSupport[2],
        contextCavernMeaningClueChamberSentenceIds.birdNestSupport[3],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.birdNestSupport[4],
        contextCavernMeaningClueChamberSentenceIds.birdNestSupport[5],
        contextCavernMeaningClueChamberSentenceIds.birdNestSupport[6],
      ],
    ],
    sentences: [
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.birdNestSupport[0], text: 'The nest basket looked fragile after the wind bent the twigs.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.birdNestSupport[1], text: 'Fragile means easy to break or hurt.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.birdNestSupport[2], text: 'The stronger tray was sturdy, not weak like the basket.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.birdNestSupport[3], text: 'A shelter is a safe place that protects, and the glossary says so.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.birdNestSupport[4], text: 'Bird parents protect the eggs by sitting close during the storm.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.birdNestSupport[5], text: 'The helper moved the basket carefully from the rain.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.birdNestSupport[6], text: 'The safe nest stayed dry under the porch roof.' },
    ],
    glossaryEntries: [
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.birdNestSupport.passageId}-glossary-shelter`,
        term: 'shelter',
        definition: 'A safe place that protects someone or something.',
      },
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.birdNestSupport.passageId}-glossary-sturdy`,
        term: 'sturdy',
        definition: 'Strong and not easy to break.',
      },
    ],
    targetPlans: [
      {
        word: 'fragile',
        sentenceIndex: 1,
        splitIndex: 3,
        childFriendlyMeaning: 'Fragile means easy to break or hurt.',
        primaryStrategy: 'context-clue',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.birdNestSupport[1]],
        strategyExplanation: 'The sentence restates fragile in simple words, so it is a restatement clue.',
        contextClueKind: 'restatement',
      },
      {
        word: 'sturdy',
        sentenceIndex: 2,
        splitIndex: 3,
        childFriendlyMeaning: 'Sturdy means strong and not easy to break.',
        primaryStrategy: 'word-relationship',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.birdNestSupport[2]],
        strategyExplanation: 'Sturdy is the opposite of fragile, so the sentence uses an antonym relationship.',
        relationshipKind: 'antonym',
        relatedWords: ['fragile', 'weak'],
      },
      {
        word: 'shelter',
        sentenceIndex: 3,
        splitIndex: 3,
        childFriendlyMeaning: 'A shelter is a safe place that protects someone or something.',
        primaryStrategy: 'reference-material',
        clueEvidenceIds: [
          `${contextCavernMeaningClueChamberPassageIds.birdNestSupport.passageId}-glossary-shelter`,
        ],
        strategyExplanation: 'The glossary gives the clearest meaning, so the reference material solves the word.',
        glossaryEntryId: `${contextCavernMeaningClueChamberPassageIds.birdNestSupport.passageId}-glossary-shelter`,
      },
      {
        word: 'protect',
        sentenceIndex: 4,
        splitIndex: 4,
        childFriendlyMeaning: 'Protect means keep safe from harm.',
        primaryStrategy: 'background-knowledge',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.birdNestSupport[4]],
        strategyExplanation: 'Children can use what they already know about keeping things safe to understand protect here.',
        backgroundKnowledgeStatement: 'Things that protect keep someone or something safe.',
      },
    ],
  },
  {
    key: 'waterFilterStation',
    passageId: contextCavernMeaningClueChamberPassageIds.waterFilterStation.passageId,
    title: 'A Water Filter at the Station',
    readingContext: 'A science station note about water, sponges, and what happens on the tray.',
    sectionHeadings: ['The Water Station', 'What the Tools Do'],
    sectionSentenceIds: [
      [
        contextCavernMeaningClueChamberSentenceIds.waterFilterStation[0],
        contextCavernMeaningClueChamberSentenceIds.waterFilterStation[1],
        contextCavernMeaningClueChamberSentenceIds.waterFilterStation[2],
        contextCavernMeaningClueChamberSentenceIds.waterFilterStation[3],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.waterFilterStation[4],
        contextCavernMeaningClueChamberSentenceIds.waterFilterStation[5],
        contextCavernMeaningClueChamberSentenceIds.waterFilterStation[6],
      ],
    ],
    sentences: [
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.waterFilterStation[0], text: 'The class poured muddy water into a simple filter.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.waterFilterStation[1], text: 'A filter is a tool that removes small bits from water.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.waterFilterStation[2], text: 'The sponge absorbed the extra water from the tray.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.waterFilterStation[3], text: 'Absorb means soak up.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.waterFilterStation[4], text: 'The water stayed on the surface of the tray until the sponge touched it.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.waterFilterStation[5], text: 'After the seed got a little moisture, a sprout began to grow.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.waterFilterStation[6], text: 'The damp towel showed how much water the sponge had taken in.' },
    ],
    glossaryEntries: [
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.waterFilterStation.passageId}-glossary-filter`,
        term: 'filter',
        definition: 'A tool that removes small bits from water or air.',
      },
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.waterFilterStation.passageId}-glossary-surface`,
        term: 'surface',
        definition: 'The top part of something.',
      },
    ],
    targetPlans: [
      {
        word: 'absorb',
        sentenceIndex: 2,
        splitIndex: 3,
        childFriendlyMeaning: 'Absorb means soak up.',
        primaryStrategy: 'context-clue',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.waterFilterStation[2], contextCavernMeaningClueChamberSentenceIds.waterFilterStation[3]],
        strategyExplanation: 'The example of the sponge soaking up water shows what absorb means.',
        contextClueKind: 'example',
      },
      {
        word: 'surface',
        sentenceIndex: 4,
        splitIndex: 3,
        childFriendlyMeaning: 'The surface is the top part of something.',
        primaryStrategy: 'word-relationship',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.waterFilterStation[4]],
        strategyExplanation: 'Surface names the top part of the tray, so the word and part belong together.',
        relationshipKind: 'part-whole',
        relatedWords: ['top', 'outside'],
      },
      {
        word: 'filter',
        sentenceIndex: 0,
        splitIndex: 3,
        childFriendlyMeaning: 'A filter is a tool that removes small bits from water or air.',
        primaryStrategy: 'reference-material',
        clueEvidenceIds: [
          `${contextCavernMeaningClueChamberPassageIds.waterFilterStation.passageId}-glossary-filter`,
        ],
        strategyExplanation: 'The glossary gives the exact meaning, so the reference material is the best help.',
        glossaryEntryId: `${contextCavernMeaningClueChamberPassageIds.waterFilterStation.passageId}-glossary-filter`,
      },
      {
        word: 'sprout',
        sentenceIndex: 5,
        splitIndex: 3,
        childFriendlyMeaning: 'A sprout is a very young plant that has just begun to grow.',
        primaryStrategy: 'background-knowledge',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.waterFilterStation[5]],
        strategyExplanation: 'Learners can use what they already know about seeds and water to understand sprout.',
        backgroundKnowledgeStatement: 'Seeds can grow into sprouts when they get enough water and care.',
      },
    ],
  },
  {
    key: 'weatherNotesShade',
    passageId: contextCavernMeaningClueChamberPassageIds.weatherNotesShade.passageId,
    title: 'Weather Notes in the Shade',
    readingContext: 'A weather chart note about clouds, light, and what happens when the wind changes.',
    sectionHeadings: ['Cloudy Morning', 'Weather Changes'],
    sectionSentenceIds: [
      [
        contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[0],
        contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[1],
        contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[2],
        contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[3],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[4],
        contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[5],
        contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[6],
      ],
    ],
    sentences: [
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[0], text: 'On the cloudy morning, the yard looked dim.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[1], text: 'Dim means not very bright.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[2], text: 'The balloon seemed to glide, or float, above the fence.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[3], text: 'The class gathered weather notes in the chart.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[4], text: 'Gather means bring things together in one place, and the glossary explains it.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[5], text: 'The balloon drifted slowly above the fence.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[6], text: 'The dark shade under the tree helped the class watch the sky.' },
    ],
    glossaryEntries: [
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.weatherNotesShade.passageId}-glossary-gather`,
        term: 'gather',
        definition: 'Bring things together in one place.',
      },
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.weatherNotesShade.passageId}-glossary-drift`,
        term: 'drift',
        definition: 'Move slowly through the air or water.',
      },
    ],
    targetPlans: [
      {
        word: 'dim',
        sentenceIndex: 1,
        splitIndex: 2,
        childFriendlyMeaning: 'Dim means not very bright.',
        primaryStrategy: 'context-clue',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[0], contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[1]],
        strategyExplanation: 'The contrast with bright light helps show what dim means.',
        contextClueKind: 'contrast',
      },
      {
        word: 'glide',
        sentenceIndex: 2,
        splitIndex: 2,
        childFriendlyMeaning: 'Glide means move smoothly and easily.',
        primaryStrategy: 'word-relationship',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[2]],
        strategyExplanation: 'Glide and float mean almost the same thing here, so the relation is a synonym.',
        relationshipKind: 'synonym',
        relatedWords: ['float', 'drift'],
      },
      {
        word: 'gather',
        sentenceIndex: 3,
        splitIndex: 3,
        childFriendlyMeaning: 'Gather means bring things together in one place.',
        primaryStrategy: 'reference-material',
        clueEvidenceIds: [
          `${contextCavernMeaningClueChamberPassageIds.weatherNotesShade.passageId}-glossary-gather`,
        ],
        strategyExplanation: 'The glossary gives the exact meaning, so the reference material solves the word.',
        glossaryEntryId: `${contextCavernMeaningClueChamberPassageIds.weatherNotesShade.passageId}-glossary-gather`,
      },
      {
        word: 'drift',
        sentenceIndex: 5,
        splitIndex: 2,
        childFriendlyMeaning: 'Drift means move slowly through the air or water.',
        primaryStrategy: 'background-knowledge',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.weatherNotesShade[5]],
        strategyExplanation: 'Learners can use what they know about wind and floating objects to understand drift.',
        backgroundKnowledgeStatement: 'Wind can carry light things slowly through the air.',
      },
    ],
  },
  {
    key: 'seedTravelGround',
    passageId: contextCavernMeaningClueChamberPassageIds.seedTravelGround.passageId,
    title: 'Seeds Move to New Ground',
    readingContext: 'A garden note about seeds, soil depth, and how plants begin in one place and move to another.',
    sectionHeadings: ['A Small Patch', 'Moving Through Seasons', 'Growing Downward'],
    sectionSentenceIds: [
      [
        contextCavernMeaningClueChamberSentenceIds.seedTravelGround[0],
        contextCavernMeaningClueChamberSentenceIds.seedTravelGround[1],
        contextCavernMeaningClueChamberSentenceIds.seedTravelGround[2],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.seedTravelGround[3],
        contextCavernMeaningClueChamberSentenceIds.seedTravelGround[4],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.seedTravelGround[5],
        contextCavernMeaningClueChamberSentenceIds.seedTravelGround[6],
      ],
    ],
    sentences: [
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.seedTravelGround[0], text: 'Some seeds landed in a shallow patch of soil near the creek.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.seedTravelGround[1], text: 'Shallow means not deep.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.seedTravelGround[2], text: 'Because the patch was shallow, the roots reached the water quickly.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.seedTravelGround[3], text: 'Migrate means move from one place to another during a season.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.seedTravelGround[4], text: 'The geese migrate when the weather turns cold.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.seedTravelGround[5], text: 'The hollow log gave the tiny plants a warm place to start.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.seedTravelGround[6], text: 'Deep soil under the field gave roots more room to grow.' },
    ],
    glossaryEntries: [
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.seedTravelGround.passageId}-glossary-migrate`,
        term: 'migrate',
        definition: 'Move from one place to another during a season.',
      },
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.seedTravelGround.passageId}-glossary-shallow`,
        term: 'shallow',
        definition: 'Not deep.',
      },
    ],
    targetPlans: [
      {
        word: 'shallow',
        sentenceIndex: 2,
        splitIndex: 3,
        childFriendlyMeaning: 'Shallow means not deep.',
        primaryStrategy: 'context-clue',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.seedTravelGround[0], contextCavernMeaningClueChamberSentenceIds.seedTravelGround[2]],
        strategyExplanation: 'The result in the sentence shows why shallow matters, so the clue uses cause and effect.',
        contextClueKind: 'cause-effect',
      },
      {
        word: 'deep',
        sentenceIndex: 6,
        splitIndex: 2,
        childFriendlyMeaning: 'Deep means far down or having a lot of depth.',
        primaryStrategy: 'word-relationship',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.seedTravelGround[6]],
        strategyExplanation: 'Deep is the opposite of shallow, so the sentence uses an antonym relationship.',
        relationshipKind: 'antonym',
        relatedWords: ['shallow', 'wide'],
      },
      {
        word: 'migrate',
        sentenceIndex: 3,
        splitIndex: 3,
        childFriendlyMeaning: 'Migrate means move from one place to another during a season.',
        primaryStrategy: 'reference-material',
        clueEvidenceIds: [
          `${contextCavernMeaningClueChamberPassageIds.seedTravelGround.passageId}-glossary-migrate`,
        ],
        strategyExplanation: 'The glossary gives the exact meaning, so the reference material is the best help.',
        glossaryEntryId: `${contextCavernMeaningClueChamberPassageIds.seedTravelGround.passageId}-glossary-migrate`,
      },
      {
        word: 'hollow',
        sentenceIndex: 5,
        splitIndex: 3,
        childFriendlyMeaning: 'Hollow means empty inside.',
        primaryStrategy: 'background-knowledge',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.seedTravelGround[5]],
        strategyExplanation: 'Learners can use what they know about empty spaces in logs to understand hollow.',
        backgroundKnowledgeStatement: 'A hollow place has an empty space inside it.',
      },
    ],
  },
  {
    key: 'trailMapHelpers',
    passageId: contextCavernMeaningClueChamberPassageIds.trailMapHelpers.passageId,
    title: 'A Trail Map Helps Hikers',
    readingContext: 'A trail map note about directions, markers, and where hikers stop along the path.',
    sectionHeadings: ['A Narrow Path', 'Top of the Trail', 'Map Markers'],
    sectionSentenceIds: [
      [
        contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[0],
        contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[1],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[2],
        contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[3],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[4],
        contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[5],
        contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[6],
      ],
    ],
    sentences: [
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[0], text: 'The hikers moved along a narrow path beside the creek, not the wide path near the field.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[1], text: 'Narrow means not wide.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[2], text: 'The map shows the surface where the trail begins.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[3], text: 'The surface is the top part of a thing, and the glossary says so.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[4], text: 'A marker on the trail points to the rest stop.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[5], text: 'The hikers settled down for a break when they reached the marker.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[6], text: 'The helper arrow on the map showed the next turn.' },
    ],
    glossaryEntries: [
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.trailMapHelpers.passageId}-glossary-surface`,
        term: 'surface',
        definition: 'The top part of something.',
      },
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.trailMapHelpers.passageId}-glossary-marker`,
        term: 'marker',
        definition: 'A sign or object that points to a place or shows where something is.',
      },
    ],
    targetPlans: [
      {
        word: 'narrow',
        sentenceIndex: 1,
        splitIndex: 3,
        childFriendlyMeaning: 'Narrow means not wide.',
        primaryStrategy: 'context-clue',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[0], contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[1]],
        strategyExplanation: 'The sentence compares narrow with wide, so the contrast clue helps most.',
        contextClueKind: 'contrast',
      },
      {
        word: 'marker',
        sentenceIndex: 4,
        splitIndex: 3,
        childFriendlyMeaning: 'A marker is a sign or object that points to a place or shows where something is.',
        primaryStrategy: 'word-relationship',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[4]],
        strategyExplanation: 'A marker does the job of pointing to a place, so the relation is object and function.',
        relationshipKind: 'object-function',
        relatedWords: ['points', 'shows'],
      },
      {
        word: 'surface',
        sentenceIndex: 2,
        splitIndex: 3,
        childFriendlyMeaning: 'The surface is the top part of something.',
        primaryStrategy: 'reference-material',
        clueEvidenceIds: [
          `${contextCavernMeaningClueChamberPassageIds.trailMapHelpers.passageId}-glossary-surface`,
        ],
        strategyExplanation: 'The glossary gives the exact meaning, so the reference material is the best help.',
        glossaryEntryId: `${contextCavernMeaningClueChamberPassageIds.trailMapHelpers.passageId}-glossary-surface`,
      },
      {
        word: 'settled',
        sentenceIndex: 5,
        splitIndex: 4,
        childFriendlyMeaning: 'Settled means stopped moving and got comfortable.',
        primaryStrategy: 'background-knowledge',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.trailMapHelpers[5]],
        strategyExplanation: 'Learners can use what they know about resting to understand settled.',
        backgroundKnowledgeStatement: 'When people stop walking for a break, they settle down.',
      },
    ],
  },
  {
    key: 'compostPileChange',
    passageId: contextCavernMeaningClueChamberPassageIds.compostPileChange.passageId,
    title: 'Compost Can Help the Soil',
    readingContext: 'A garden note about compost, weather, and how small changes help soil later.',
    sectionHeadings: ['A Dry Week', 'A Small Group', 'What the Pile Becomes'],
    sectionSentenceIds: [
      [
        contextCavernMeaningClueChamberSentenceIds.compostPileChange[0],
        contextCavernMeaningClueChamberSentenceIds.compostPileChange[1],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.compostPileChange[2],
        contextCavernMeaningClueChamberSentenceIds.compostPileChange[3],
      ],
      [
        contextCavernMeaningClueChamberSentenceIds.compostPileChange[4],
        contextCavernMeaningClueChamberSentenceIds.compostPileChange[5],
        contextCavernMeaningClueChamberSentenceIds.compostPileChange[6],
      ],
    ],
    sentences: [
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.compostPileChange[0], text: 'The compost pile looked scarce after the dry week.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.compostPileChange[1], text: 'Scarce means not enough.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.compostPileChange[2], text: 'The scraps gathered into a cluster near the fence.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.compostPileChange[3], text: 'A cluster is a small group of things close together, and the glossary explains it.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.compostPileChange[4], text: 'The birds migrate when the season changes, but the compost stays in one place.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.compostPileChange[5], text: 'The old compost pile gives the soil a better home later.' },
      { sentenceId: contextCavernMeaningClueChamberSentenceIds.compostPileChange[6], text: 'The cool season helps the pile change little by little.' },
    ],
    glossaryEntries: [
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.compostPileChange.passageId}-glossary-compost`,
        term: 'compost',
        definition: 'Rotten plant scraps that can help soil.',
      },
      {
        entryId: `${contextCavernMeaningClueChamberPassageIds.compostPileChange.passageId}-glossary-cluster`,
        term: 'cluster',
        definition: 'A small group of things close together.',
      },
    ],
    targetPlans: [
      {
        word: 'scarce',
        sentenceIndex: 1,
        splitIndex: 3,
        childFriendlyMeaning: 'Scarce means not enough.',
        primaryStrategy: 'context-clue',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.compostPileChange[0], contextCavernMeaningClueChamberSentenceIds.compostPileChange[1]],
        strategyExplanation: 'The sentence gives the meaning directly, so the context clue is a definition clue.',
        contextClueKind: 'definition',
      },
      {
        word: 'cluster',
        sentenceIndex: 3,
        splitIndex: 4,
        childFriendlyMeaning: 'A cluster is a small group of things close together.',
        primaryStrategy: 'word-relationship',
        clueEvidenceIds: [
          contextCavernMeaningClueChamberSentenceIds.compostPileChange[2],
          contextCavernMeaningClueChamberSentenceIds.compostPileChange[3],
        ],
        strategyExplanation: 'Cluster means a group, so the word belongs with category and member words.',
        relationshipKind: 'category-member',
        relatedWords: ['group', 'bunch'],
      },
      {
        word: 'compost',
        sentenceIndex: 5,
        splitIndex: 4,
        childFriendlyMeaning: 'Compost is rotten plant scraps that can help soil.',
        primaryStrategy: 'reference-material',
        clueEvidenceIds: [
          `${contextCavernMeaningClueChamberPassageIds.compostPileChange.passageId}-glossary-compost`,
        ],
        strategyExplanation: 'The glossary gives the exact meaning, so the reference material is the best help.',
        glossaryEntryId: `${contextCavernMeaningClueChamberPassageIds.compostPileChange.passageId}-glossary-compost`,
      },
      {
        word: 'season',
        sentenceIndex: 6,
        splitIndex: 3,
        childFriendlyMeaning: 'A season is part of the year with similar weather.',
        primaryStrategy: 'background-knowledge',
        clueEvidenceIds: [contextCavernMeaningClueChamberSentenceIds.compostPileChange[6]],
        strategyExplanation: 'Learners can use what they know about weather changes through the year to understand season.',
        backgroundKnowledgeStatement: 'The year has seasons with different weather patterns.',
      },
    ],
  },
]

const passageArtifacts = PASSAGE_PLANS.map((plan) => buildPassageArtifact(plan))
const passageArtifactByKey = new Map(PASSAGE_PLANS.map((plan, index) => [plan.key, passageArtifacts[index]] as const))

function getArtifact(key: keyof typeof contextCavernMeaningClueChamberPassageIds): PassageArtifact {
  return passageArtifactByKey.get(key)!
}

function buildMeaningChoiceQuestion(
  lessonId: string,
  questionId: string,
  passage: Passage,
  target: TargetArtifact,
  distractorTargets: readonly TargetArtifact[],
  prompt: string,
  explanation: string,
  difficulty: 2 | 3,
  correctChoiceIndex: number,
): ReadingQuestion {
  const choices = rotate([
    choice(`${questionId}-choice-1`, target.childFriendlyMeaning),
    choice(`${questionId}-choice-2`, distractorTargets[0].childFriendlyMeaning),
    choice(`${questionId}-choice-3`, distractorTargets[1].childFriendlyMeaning),
    choice(`${questionId}-choice-4`, distractorTargets[2].childFriendlyMeaning),
  ], correctChoiceIndex)
  const correctChoiceId = choices.find((item) => item.text === target.childFriendlyMeaning)!.id

  return createMultipleChoiceQuestion({
    benchmarkReference: 'ELA.2.V.1.3',
    skillIdentifier: contextCavernMeaningClueChamberPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: target.clueEvidenceIds[0],
    evidenceReferenceIds: [...target.clueEvidenceIds],
    targetVocabulary: [target.word],
    soundOutChunks: [target.word],
    tags: [...MEANING_CLUE_TAGS],
    choices,
    correctChoiceIds: [correctChoiceId],
  })
}

function buildStrategyQuestion(
  lessonId: string,
  questionId: string,
  passage: Passage,
  target: TargetArtifact,
  prompt: string,
  explanation: string,
  difficulty: 2 | 3,
  correctChoiceIndex: number,
): ReadingQuestion {
  const choices = rotate([
    choice(`${questionId}-choice-1`, 'context clues'),
    choice(`${questionId}-choice-2`, 'word relationship'),
    choice(`${questionId}-choice-3`, 'glossary'),
    choice(`${questionId}-choice-4`, 'background knowledge'),
  ], correctChoiceIndex)
  const correctChoiceId = choices.find((item) =>
    (target.primaryStrategy === 'context-clue' && item.text === 'context clues')
    || (target.primaryStrategy === 'word-relationship' && item.text === 'word relationship')
    || (target.primaryStrategy === 'reference-material' && item.text === 'glossary')
    || (target.primaryStrategy === 'background-knowledge' && item.text === 'background knowledge'),
  )!.id

  return createMultipleChoiceQuestion({
    benchmarkReference: 'ELA.2.V.1.3',
    skillIdentifier: contextCavernMeaningClueChamberPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: target.clueEvidenceIds[0],
    evidenceReferenceIds: [...target.clueEvidenceIds],
    targetVocabulary: [target.word],
    soundOutChunks: [target.word],
    tags: [...MEANING_CLUE_TAGS],
    choices,
    correctChoiceIds: [correctChoiceId],
  })
}

function buildMultiselectClueQuestion(
  lessonId: string,
  questionId: string,
  passage: Passage,
  target: TargetArtifact,
  clues: readonly string[],
  prompt: string,
  explanation: string,
  difficulty: 2 | 3,
): ReadingQuestion {
  const choices = clues.map((clue, index) => choice(`${questionId}-choice-${index + 1}`, clue))
  return createMultiselectQuestion({
    benchmarkReference: 'ELA.2.V.1.3',
    skillIdentifier: contextCavernMeaningClueChamberPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: target.clueEvidenceIds[0],
    evidenceReferenceIds: [...target.clueEvidenceIds],
    targetVocabulary: [target.word],
    soundOutChunks: [target.word],
    tags: [...MEANING_CLUE_TAGS],
    choices,
    correctChoiceIds: [choices[0].id, choices[1].id],
  })
}

function buildHotTextQuestionForSentence(
  lessonId: string,
  questionId: string,
  passage: Passage,
  target: TargetArtifact,
  prompt: string,
  explanation: string,
  difficulty: 2 | 3,
): ReadingQuestion {
  const passageSentences = passage.sentences ?? []
  const distractors = passageSentences
    .filter((sentence) => sentence.sentenceId !== target.sentenceId)
    .slice(0, 3)
  const selectableSegments = rotate([
    { id: `${questionId}-segment-1`, text: target.sentenceText },
    { id: `${questionId}-segment-2`, text: distractors[0]?.text ?? target.sentenceText },
    { id: `${questionId}-segment-3`, text: distractors[1]?.text ?? target.sentenceText },
    { id: `${questionId}-segment-4`, text: distractors[2]?.text ?? target.sentenceText },
  ], 1)
  const correctSegmentId = selectableSegments.find((segment) => segment.text === target.sentenceText)!.id

  return createHotTextQuestion({
    benchmarkReference: 'ELA.2.V.1.3',
    skillIdentifier: contextCavernMeaningClueChamberPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: target.sentenceId,
    evidenceReferenceIds: [...target.clueEvidenceIds],
    targetVocabulary: [target.word],
    soundOutChunks: [target.word],
    tags: [...MEANING_CLUE_TAGS],
    selectableSegments,
    correctSegmentIds: [correctSegmentId],
  })
}

function buildTableMatchQuestionForTargets(
  lessonId: string,
  questionId: string,
  passage: Passage,
  targets: readonly TargetArtifact[],
  prompt: string,
  explanation: string,
  difficulty: 2 | 3,
): ReadingQuestion {
  const words = targets.map((target) => target.word)
  const meanings = targets.map((target) => target.childFriendlyMeaning)
  const rows = targets.map((target, index) => {
    const options = rotate(
      meanings.map((meaning, meaningIndex) => choice(`${questionId}-row-${index + 1}-${meaningIndex + 1}`, meaning)),
      index,
    )
    return {
      id: `${questionId}-row-${index + 1}`,
      prompt: target.word,
      correctChoiceId: options.find((option) => option.text === target.childFriendlyMeaning)!.id,
      options,
    }
  })

  return createTableMatchQuestion({
    benchmarkReference: 'ELA.2.V.1.3',
    skillIdentifier: contextCavernMeaningClueChamberPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt,
    explanation,
    evidenceReference: targets[0].sentenceId,
    evidenceReferenceIds: targets.flatMap((target) => target.clueEvidenceIds),
    targetVocabulary: words,
    soundOutChunks: words,
    tags: [...MEANING_CLUE_TAGS],
    rows,
  })
}

function buildTwoPartQuestionForTarget(
  lessonId: string,
  questionId: string,
  passage: Passage,
  target: TargetArtifact,
  explanation: string,
  difficulty: 2 | 3,
): ReadingQuestion {
  const partAChoices = rotate([
    choice(`${questionId}-part-a-1`, target.childFriendlyMeaning),
    choice(`${questionId}-part-a-2`, 'the topic of the passage'),
    choice(`${questionId}-part-a-3`, 'a random detail'),
    choice(`${questionId}-part-a-4`, 'a made-up meaning'),
  ], 1)
  const partBChoices = rotate([
    choice(`${questionId}-part-b-1`, target.sentenceText),
    choice(`${questionId}-part-b-2`, 'the title alone'),
    choice(`${questionId}-part-b-3`, 'an unrelated sentence'),
    choice(`${questionId}-part-b-4`, 'a different word in the glossary'),
  ], 0)

  return createTwoPartQuestion({
    benchmarkReference: 'ELA.2.V.1.3',
    skillIdentifier: contextCavernMeaningClueChamberPrimarySkillId,
    reportingCategory: 'Vocabulary',
    genre: 'informational',
    gradeBand: 2,
    estimatedReadingLevel: 'Grade 2',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    reviewStatus: 'DRAFT',
    difficulty,
    passageIdentifier: passage.passageIdentifier,
    lessonIdentifier: lessonId,
    questionIdentifier: questionId,
    prompt: `Show how the clue helps with ${target.word}.`,
    explanation,
    evidenceReference: target.sentenceId,
    evidenceReferenceIds: [...target.clueEvidenceIds],
    targetVocabulary: [target.word],
    soundOutChunks: [target.word],
    tags: [...MEANING_CLUE_TAGS],
    partAPrompt: `Part A: What does ${target.word} mean?`,
    partAChoices,
    partACorrectChoiceId: partAChoices.find((item) => item.text === target.childFriendlyMeaning)!.id,
    partBPrompt: 'Part B: Which sentence or clue best supports that meaning?',
    partBChoices,
    partBCorrectChoiceId: partBChoices.find((item) => item.text === target.sentenceText)!.id,
  })
}

function buildFiveQuestionLesson(lessonId: string, questionIds: readonly string[], artifact: PassageArtifact, difficulty: 2 | 3): ReadingQuestion[] {
  const [contextTarget, relationTarget, referenceTarget, backgroundTarget] = artifact.targets
  return [
    buildMeaningChoiceQuestion(
      lessonId,
      questionIds[0],
      artifact.passage,
      contextTarget,
      [relationTarget, referenceTarget, backgroundTarget],
      `What does ${contextTarget.word} mean in this passage?`,
      contextTarget.strategyExplanation,
      difficulty,
      0,
    ),
    buildStrategyQuestion(
      lessonId,
      questionIds[1],
      artifact.passage,
      referenceTarget,
      `Which strategy helps most with ${referenceTarget.word}?`,
      referenceTarget.strategyExplanation,
      difficulty,
      2,
    ),
    buildMultiselectClueQuestion(
      lessonId,
      questionIds[2],
      artifact.passage,
      contextTarget,
      [contextTarget.clueEvidenceIds[0], contextTarget.sentenceText, relationTarget.sentenceText, referenceTarget.sentenceText],
      `Choose two clues that help explain ${contextTarget.word}.`,
      contextTarget.strategyExplanation,
      difficulty,
    ),
    buildHotTextQuestionForSentence(
      lessonId,
      questionIds[3],
      artifact.passage,
      referenceTarget,
      `Select the sentence that best helps with ${referenceTarget.word}.`,
      referenceTarget.strategyExplanation,
      difficulty,
    ),
    buildTableMatchQuestionForTargets(
      lessonId,
      questionIds[4],
      artifact.passage,
      [contextTarget, relationTarget, referenceTarget, backgroundTarget],
      'Match each word to its meaning.',
      'The meanings match the clues and reference tools in the passage.',
      difficulty,
    ),
  ]
}

function buildCheckpointQuestions(
  lessonId: string,
  questionIds: readonly string[],
  artifact: PassageArtifact,
  difficulty: 2 | 3,
): ReadingQuestion[] {
  const [contextTarget, relationTarget, referenceTarget, backgroundTarget] = artifact.targets
  return [
    buildMeaningChoiceQuestion(
      lessonId,
      questionIds[0],
      artifact.passage,
      contextTarget,
      [relationTarget, referenceTarget, backgroundTarget],
      `What does ${contextTarget.word} mean in this passage?`,
      contextTarget.strategyExplanation,
      difficulty,
      1,
    ),
    buildStrategyQuestion(
      lessonId,
      questionIds[1],
      artifact.passage,
      relationTarget,
      `Which strategy helps most with ${relationTarget.word}?`,
      relationTarget.strategyExplanation,
      difficulty,
      0,
    ),
    buildMeaningChoiceQuestion(
      lessonId,
      questionIds[2],
      artifact.passage,
      referenceTarget,
      [contextTarget, relationTarget, backgroundTarget],
      `According to the glossary, what does ${referenceTarget.word} mean?`,
      referenceTarget.strategyExplanation,
      difficulty,
      2,
    ),
    buildMultiselectClueQuestion(
      lessonId,
      questionIds[3],
      artifact.passage,
      backgroundTarget,
      [backgroundTarget.clueEvidenceIds[0], contextTarget.sentenceText, relationTarget.sentenceText, referenceTarget.sentenceText],
      `Choose two clues that help explain ${backgroundTarget.word}.`,
      backgroundTarget.strategyExplanation,
      difficulty,
    ),
    buildHotTextQuestionForSentence(
      lessonId,
      questionIds[4],
      artifact.passage,
      relationTarget,
      `Select the sentence that best helps with ${relationTarget.word}.`,
      relationTarget.strategyExplanation,
      difficulty,
    ),
    buildTableMatchQuestionForTargets(
      lessonId,
      questionIds[5],
      artifact.passage,
      [contextTarget, relationTarget, referenceTarget, backgroundTarget],
      'Match each word to its meaning.',
      'The meanings match the clues and reference tools in the passage.',
      difficulty,
    ),
    buildTwoPartQuestionForTarget(
      lessonId,
      questionIds[6],
      artifact.passage,
      backgroundTarget,
      backgroundTarget.strategyExplanation,
      difficulty,
    ),
  ]
}

const prereqFindTheClueAroundTheWordArtifact = getArtifact('pondHabitat')
const prereqConnectWordsAndReferenceToolsArtifact = getArtifact('birdNestSupport')
const guidedContextCluesAndWordRelationshipsArtifact = getArtifact('waterFilterStation')
const guidedGlossariesAndBackgroundKnowledgeArtifact = getArtifact('weatherNotesShade')
const checkpointAArtifact = getArtifact('seedTravelGround')
const checkpointBArtifact = getArtifact('trailMapHelpers')
const checkpointCArtifact = getArtifact('compostPileChange')

const meaningClueQuestions = [
  ...buildFiveQuestionLesson(
    contextCavernMeaningClueChamberLessonIds.prereqFindTheClueAroundTheWord,
    contextCavernMeaningClueChamberQuestionIds.prereqFindTheClueAroundTheWord,
    prereqFindTheClueAroundTheWordArtifact,
    2,
  ),
  ...buildFiveQuestionLesson(
    contextCavernMeaningClueChamberLessonIds.prereqConnectWordsAndReferenceTools,
    contextCavernMeaningClueChamberQuestionIds.prereqConnectWordsAndReferenceTools,
    prereqConnectWordsAndReferenceToolsArtifact,
    2,
  ),
  ...buildFiveQuestionLesson(
    contextCavernMeaningClueChamberLessonIds.guidedContextCluesAndWordRelationships,
    contextCavernMeaningClueChamberQuestionIds.guidedContextCluesAndWordRelationships,
    guidedContextCluesAndWordRelationshipsArtifact,
    3,
  ),
  ...buildFiveQuestionLesson(
    contextCavernMeaningClueChamberLessonIds.guidedGlossariesAndBackgroundKnowledge,
    contextCavernMeaningClueChamberQuestionIds.guidedGlossariesAndBackgroundKnowledge,
    guidedGlossariesAndBackgroundKnowledgeArtifact,
    3,
  ),
  ...buildCheckpointQuestions(
    contextCavernMeaningClueChamberLessonIds.checkpointA,
    contextCavernMeaningClueChamberQuestionIds.checkpointA,
    checkpointAArtifact,
    3,
  ),
  ...buildCheckpointQuestions(
    contextCavernMeaningClueChamberLessonIds.checkpointB,
    contextCavernMeaningClueChamberQuestionIds.checkpointB,
    checkpointBArtifact,
    3,
  ),
  ...buildCheckpointQuestions(
    contextCavernMeaningClueChamberLessonIds.checkpointC,
    contextCavernMeaningClueChamberQuestionIds.checkpointC,
    checkpointCArtifact,
    3,
  ),
]

const meaningClueLessons: ContentPackLesson[] = [
  {
    lessonId: contextCavernMeaningClueChamberLessonIds.prereqFindTheClueAroundTheWord,
    worldId: contextCavernMeaningClueChamberWorldId,
    unitId: contextCavernMeaningClueChamberUnitId,
    activityId: 'activity-cc-meaning-clues-prereq-find-the-clue-around-the-word',
    difficulty: 2,
    passageIdentifiers: [prereqFindTheClueAroundTheWordArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernMeaningClueChamberQuestionIds.prereqFindTheClueAroundTheWord,
    lessonTitle: 'Find the Clue Around the Word',
    lessonObjective: 'Find the strongest clue that helps explain an unknown word.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Read the whole sentence first',
      explanation:
        'Context clues can be words or sentences near an unknown word. A glossary can also help. Read the clue, name the strategy, and check whether the meaning fits the sentence.',
      examples: [
        'A definition clue tells the meaning directly.',
        'A restatement clue says the same idea in simpler words.',
        'A glossary entry can give the meaning right away.',
      ],
      contrast: 'Do not guess from the unknown word alone. Use the sentence, the clue, or the glossary entry.',
      learnerCue: 'Ask which clue does the best job of helping you explain the word.',
    },
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernMeaningClueChamberLessonIds.prereqConnectWordsAndReferenceTools,
    worldId: contextCavernMeaningClueChamberWorldId,
    unitId: contextCavernMeaningClueChamberUnitId,
    activityId: 'activity-cc-meaning-clues-prereq-connect-words-and-reference-tools',
    difficulty: 2,
    passageIdentifiers: [prereqConnectWordsAndReferenceToolsArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernMeaningClueChamberQuestionIds.prereqConnectWordsAndReferenceTools,
    lessonTitle: 'Connect Words and Reference Tools',
    lessonObjective: 'Match word relationships, glossaries, and background knowledge to the right meaning.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Different words need different help',
      explanation:
        'Some words are best solved by a glossary. Some are best solved by a relationship, like a synonym or antonym. Some are best solved by background knowledge that learners already have.',
      examples: [
        'A glossary entry can define shelter.',
        'An antonym can help with sturdy and fragile.',
        'Background knowledge can help with protect and burrow.',
      ],
      contrast: 'One strategy is not always enough. Choose the strategy that fits the word best.',
      learnerCue: 'Name the strategy before you name the meaning.',
    },
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernMeaningClueChamberLessonIds.guidedContextCluesAndWordRelationships,
    worldId: contextCavernMeaningClueChamberWorldId,
    unitId: contextCavernMeaningClueChamberUnitId,
    activityId: 'activity-cc-meaning-clues-guided-context-clues-and-word-relationships',
    difficulty: 3,
    passageIdentifiers: [guidedContextCluesAndWordRelationshipsArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernMeaningClueChamberQuestionIds.guidedContextCluesAndWordRelationships,
    lessonTitle: 'Context Clues and Word Relationships',
    lessonObjective: 'Use context clues and word relationships to determine an unknown meaning.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Look for nearby words that do the work',
      explanation:
        'A context clue can be a definition, restatement, example, contrast, or cause-and-effect clue. A word relationship can be a synonym, antonym, category-member link, part-whole link, or object-function link.',
      examples: [
        'Dim is shown by a contrast with bright.',
        'Glide is shown by a synonym like float.',
        'Gather is explained by a glossary entry.',
      ],
      contrast: 'Do not use the wrong clue type just because it is nearby.',
      learnerCue: 'Find the clue type that matches the word and sentence.',
    },
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernMeaningClueChamberLessonIds.guidedGlossariesAndBackgroundKnowledge,
    worldId: contextCavernMeaningClueChamberWorldId,
    unitId: contextCavernMeaningClueChamberUnitId,
    activityId: 'activity-cc-meaning-clues-guided-glossaries-and-background-knowledge',
    difficulty: 3,
    passageIdentifiers: [guidedGlossariesAndBackgroundKnowledgeArtifact.passage.passageIdentifier],
    questionIdentifiers: contextCavernMeaningClueChamberQuestionIds.guidedGlossariesAndBackgroundKnowledge,
    lessonTitle: 'Glossaries and Background Knowledge',
    lessonObjective: 'Use a glossary and background knowledge to confirm the best meaning.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'A glossary and what you already know can help',
      explanation:
        'A glossary can give the exact meaning of a word. Background knowledge can also help when the word fits a familiar idea, like seasons, water, or trail markers.',
      examples: [
        'The glossary can explain surface and compost.',
        'Background knowledge can help with drift and settled.',
        'The chosen meaning should still fit the sentence.',
      ],
      contrast: 'Do not let a clue that only sounds close mislead you.',
      learnerCue: 'Reread the sentence after you choose the meaning.',
    },
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: contextCavernMeaningClueChamberLessonIds.checkpointA,
    worldId: contextCavernMeaningClueChamberWorldId,
    unitId: contextCavernMeaningClueChamberUnitId,
    activityId: 'activity-cc-meaning-clues-checkpoint-a',
    difficulty: 3,
    passageIdentifiers: [
      checkpointAArtifact.passage.passageIdentifier,
      prereqFindTheClueAroundTheWordArtifact.passage.passageIdentifier,
      guidedContextCluesAndWordRelationshipsArtifact.passage.passageIdentifier,
    ],
    questionIdentifiers: contextCavernMeaningClueChamberQuestionIds.checkpointA,
    lessonTitle: 'Meaning Clue Chamber Checkpoint A',
    lessonObjective: 'Show how context clues, relationships, glossaries, and background knowledge work together.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: contextCavernMeaningClueChamberLessonIds.checkpointB,
    worldId: contextCavernMeaningClueChamberWorldId,
    unitId: contextCavernMeaningClueChamberUnitId,
    activityId: 'activity-cc-meaning-clues-checkpoint-b',
    difficulty: 3,
    passageIdentifiers: [
      checkpointBArtifact.passage.passageIdentifier,
      prereqConnectWordsAndReferenceToolsArtifact.passage.passageIdentifier,
      guidedGlossariesAndBackgroundKnowledgeArtifact.passage.passageIdentifier,
    ],
    questionIdentifiers: contextCavernMeaningClueChamberQuestionIds.checkpointB,
    lessonTitle: 'Meaning Clue Chamber Checkpoint B',
    lessonObjective: 'Show how context clues, relationships, glossaries, and background knowledge work together.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: contextCavernMeaningClueChamberLessonIds.checkpointC,
    worldId: contextCavernMeaningClueChamberWorldId,
    unitId: contextCavernMeaningClueChamberUnitId,
    activityId: 'activity-cc-meaning-clues-checkpoint-c',
    difficulty: 3,
    passageIdentifiers: [
      checkpointCArtifact.passage.passageIdentifier,
      guidedContextCluesAndWordRelationshipsArtifact.passage.passageIdentifier,
      guidedGlossariesAndBackgroundKnowledgeArtifact.passage.passageIdentifier,
    ],
    questionIdentifiers: contextCavernMeaningClueChamberQuestionIds.checkpointC,
    lessonTitle: 'Meaning Clue Chamber Checkpoint C',
    lessonObjective: 'Show how context clues, relationships, glossaries, and background knowledge work together.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]

export const meaningClueChamberPassages = passageArtifacts.map((artifact) => artifact.passage)
export const meaningClueChamberMeaningClueGuides = passageArtifacts.map((artifact) => artifact.guide)
export const meaningClueChamberSupportTargets = meaningClueChamberPassages.flatMap((passage) => passage.wordSupportTargets ?? [])
export const meaningClueChamberQuestions = meaningClueQuestions
export const meaningClueChamberLessons = meaningClueLessons

export const grade2ContextCavernMeaningClueChamberPack: ContentPack = {
  manifest: {
    packId: contextCavernMeaningClueChamberPackId,
    packTitle: 'Grade 2 Context Cavern: Meaning Clue Chamber',
    gradeBand: 2,
    worldId: contextCavernMeaningClueChamberWorldId,
    unitId: contextCavernMeaningClueChamberUnitId,
    primarySkillId: contextCavernMeaningClueChamberPrimarySkillId,
    benchmarkReferences: ['ELA.2.V.1.3'],
    partialBenchmarkCoverage:
      'Grade 2 use of context clues, word relationships, glossary reference tools, and background knowledge to determine unknown word meaning, without figurative language, multiple meanings, or cross-genre comparison.',
    coverageKind: 'benchmark',
    difficultyRange: [2, 3],
    contentVersion: contextCavernMeaningClueChamberContentVersion,
    reviewStatus: 'DRAFT',
    coveredPatterns: [...MEANING_CLUE_TAGS],
    passageIds: meaningClueChamberPassages.map((passage) => passage.passageIdentifier),
    questionIds: meaningClueChamberQuestions.map((question) => question.questionIdentifier),
    lessonIds: meaningClueChamberLessons.map((lesson) => lesson.lessonId),
  },
  passages: meaningClueChamberPassages,
  questions: meaningClueChamberQuestions,
  lessons: meaningClueChamberLessons,
  meaningClueGuides: meaningClueChamberMeaningClueGuides,
}

export { passageArtifacts as meaningClueChamberPassageArtifacts }
