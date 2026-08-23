import type { InformationalTextStructure } from '../../../../informationalTypes'
import type { Passage, WordSupportTarget } from '../../../../types'
import { RETELL_HALL_CONTENT_VERSION, RETELL_HALL_PASSAGE_IDS } from './ids'

type SentencePlan = {
  sentenceId: string
  text: string
}

type SupportTargetPlan = {
  sentenceIndex: number
  surfaceWord: string
  chunks: [string, string]
}

type LiteraryPassagePlan = {
  kind: 'literary'
  passageId: string
  readingContext: string
  sentences: SentencePlan[]
  supportTargetPlans: SupportTargetPlan[]
}

type InformationalPassagePlan = {
  kind: 'informational'
  passageId: string
  readingContext: string
  titleFeatureId: string
  titleText: string
  sections: {
    sectionId: string
    headingFeatureId: string
    headingText: string
    sentenceIndexes: number[]
  }[]
  sentences: SentencePlan[]
  supportTargetPlans: SupportTargetPlan[]
}

export type RetellHallPassagePlan = LiteraryPassagePlan | InformationalPassagePlan

const readingContext = 'Compare Castle Retell Hall'

const makeSentence = (sentenceId: string, text: string): SentencePlan => ({ sentenceId, text })

function createSupportTarget(
  passageId: string,
  sentence: SentencePlan,
  surfaceWord: string,
  chunks: [string, string],
): WordSupportTarget {
  return {
    targetId: `${passageId}-support-${surfaceWord.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    passageId,
    sentenceId: sentence.sentenceId,
    surfaceWord,
    focusParts: [
      { text: chunks[0], emphasis: true },
      { text: chunks[1], emphasis: false },
    ],
    displayChunks: [
      { displayText: chunks[0], speechText: chunks[0] },
      { displayText: chunks[1], speechText: chunks[1] },
    ],
    spokenChunks: [
      { displayText: chunks[0], speechText: chunks[0] },
      { displayText: chunks[1], speechText: chunks[1] },
    ],
    blendSpeechText: surfaceWord,
    wholeWordSpeechText: surfaceWord,
    sentenceSpeechText: sentence.text,
    reviewStatus: 'DRAFT',
    contentVersion: RETELL_HALL_CONTENT_VERSION,
  }
}

function buildLiteraryPassage(plan: LiteraryPassagePlan): Passage {
  return {
    passageIdentifier: plan.passageId,
    gradeBand: 2,
    contentKind: 'prose',
    passageText: plan.sentences.map((sentence) => sentence.text).join(' '),
    sentences: plan.sentences.map((sentence, index) => ({
      sentenceId: sentence.sentenceId,
      lineNumber: index + 1,
      text: sentence.text,
    })),
    readingContext: plan.readingContext,
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: plan.supportTargetPlans.map((target) =>
      createSupportTarget(
        plan.passageId,
        plan.sentences[target.sentenceIndex],
        target.surfaceWord,
        target.chunks,
      ),
    ),
  }
}

function buildInformationalStructure(plan: InformationalPassagePlan): InformationalTextStructure {
  return {
    titleFeatureId: plan.titleFeatureId,
    features: [
      {
        featureId: plan.titleFeatureId,
        kind: 'title',
        text: plan.titleText,
      },
      ...plan.sections.map((section) => ({
        featureId: section.headingFeatureId,
        kind: 'heading' as const,
        sectionId: section.sectionId,
        text: section.headingText,
      })),
    ],
    sections: plan.sections.map((section) => ({
      sectionId: section.sectionId,
      headingFeatureId: section.headingFeatureId,
      sentenceIds: section.sentenceIndexes.map((index) => plan.sentences[index].sentenceId),
      featureIds: [section.headingFeatureId],
    })),
  }
}

function buildInformationalPassage(plan: InformationalPassagePlan): Passage {
  return {
    passageIdentifier: plan.passageId,
    gradeBand: 2,
    contentKind: 'informational',
    passageText: plan.sentences.map((sentence) => sentence.text).join(' '),
    sentences: plan.sentences.map((sentence, index) => ({
      sentenceId: sentence.sentenceId,
      lineNumber: index + 1,
      text: sentence.text,
    })),
    informationalStructure: buildInformationalStructure(plan),
    readingContext: plan.readingContext,
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: plan.supportTargetPlans.map((target) =>
      createSupportTarget(
        plan.passageId,
        plan.sentences[target.sentenceIndex],
        target.surfaceWord,
        target.chunks,
      ),
    ),
  }
}

export const retellHallPassagePlans: readonly RetellHallPassagePlan[] = [
  {
    kind: 'literary',
    passageId: RETELL_HALL_PASSAGE_IDS.literaryMuralLabel,
    readingContext,
    sentences: [
      makeSentence('g2-cg-retell-mural-label-sentence-1', 'At dawn, Maya and Eli hurried into the art room beside the library.'),
      makeSentence('g2-cg-retell-mural-label-sentence-2', 'Their class mural needed a final label before visitors arrived.'),
      makeSentence('g2-cg-retell-mural-label-sentence-3', 'Maya spread the bright cards carefully across the table.'),
      makeSentence('g2-cg-retell-mural-label-sentence-4', 'Eli noticed that one corner of the sign had curled like a leaf.'),
      makeSentence('g2-cg-retell-mural-label-sentence-5', 'They taped the corner flat and checked the picture again.'),
      makeSentence('g2-cg-retell-mural-label-sentence-6', 'The children moved the paint jars into an organized line.'),
      makeSentence('g2-cg-retell-mural-label-sentence-7', 'At last, the mural shone with a neat title and a warm smile.'),
      makeSentence('g2-cg-retell-mural-label-sentence-8', 'A red eraser waited on the sill, but it did not matter to the plan.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 2, surfaceWord: 'carefully', chunks: ['care', 'fully'] },
      { sentenceIndex: 1, surfaceWord: 'final', chunks: ['fi', 'nal'] },
      { sentenceIndex: 5, surfaceWord: 'organized', chunks: ['organ', 'ized'] },
      { sentenceIndex: 1, surfaceWord: 'visitors', chunks: ['visit', 'ors'] },
    ],
  },
  {
    kind: 'literary',
    passageId: RETELL_HALL_PASSAGE_IDS.literaryBridgeRepair,
    readingContext,
    sentences: [
      makeSentence('g2-cg-retell-bridge-repair-sentence-1', 'In the science corner, Jada and Omar tested a model bridge on a blue mat.'),
      makeSentence('g2-cg-retell-bridge-repair-sentence-2', 'The bridge wobbled when the toy truck rolled across it.'),
      makeSentence('g2-cg-retell-bridge-repair-sentence-3', 'Jada added a support beam, and Omar held the pieces steady.'),
      makeSentence('g2-cg-retell-bridge-repair-sentence-4', 'They worked carefully so the glue would stay neat.'),
      makeSentence('g2-cg-retell-bridge-repair-sentence-5', 'The bridge grew stronger after they connected the last cardboard strip.'),
      makeSentence('g2-cg-retell-bridge-repair-sentence-6', 'A pencil rolled off the table, but the friends ignored it.'),
      makeSentence('g2-cg-retell-bridge-repair-sentence-7', 'Soon, the truck crossed the bridge without a shake.'),
      makeSentence('g2-cg-retell-bridge-repair-sentence-8', 'They smiled because the model was ready for the class display.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 3, surfaceWord: 'carefully', chunks: ['care', 'fully'] },
      { sentenceIndex: 2, surfaceWord: 'support', chunks: ['sup', 'port'] },
      { sentenceIndex: 4, surfaceWord: 'connected', chunks: ['connect', 'ed'] },
      { sentenceIndex: 4, surfaceWord: 'stronger', chunks: ['strong', 'er'] },
    ],
  },
  {
    kind: 'literary',
    passageId: RETELL_HALL_PASSAGE_IDS.literaryLibraryStoryNight,
    readingContext,
    sentences: [
      makeSentence('g2-cg-retell-library-story-night-sentence-1', 'Noa and Priya set up the story-night table in the library hall.'),
      makeSentence('g2-cg-retell-library-story-night-sentence-2', 'They wanted the poster to stay up before the families arrived.'),
      makeSentence('g2-cg-retell-library-story-night-sentence-3', 'One corner of the poster curled like a ribbon in a breeze.'),
      makeSentence('g2-cg-retell-library-story-night-sentence-4', 'Noa pressed it flat while Priya found the tape roll.'),
      makeSentence('g2-cg-retell-library-story-night-sentence-5', 'The friends arranged the name cards in an organized row.'),
      makeSentence('g2-cg-retell-library-story-night-sentence-6', 'A basket of stickers sat nearby, but it was not part of the plan.'),
      makeSentence('g2-cg-retell-library-story-night-sentence-7', 'Then they checked the lights and moved the chair backs into a straight line.'),
      makeSentence('g2-cg-retell-library-story-night-sentence-8', 'At last, the poster hung neatly, and the story-night sign looked bright.'),
      makeSentence('g2-cg-retell-library-story-night-sentence-9', 'The children smiled when the first visitors walked in.'),
      makeSentence('g2-cg-retell-library-story-night-sentence-10', 'A clock ticked softly above the shelves.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 4, surfaceWord: 'organized', chunks: ['organ', 'ized'] },
      { sentenceIndex: 5, surfaceWord: 'nearby', chunks: ['near', 'by'] },
      { sentenceIndex: 6, surfaceWord: 'straight', chunks: ['stra', 'ight'] },
      { sentenceIndex: 8, surfaceWord: 'visitors', chunks: ['visit', 'ors'] },
    ],
  },
  {
    kind: 'literary',
    passageId: RETELL_HALL_PASSAGE_IDS.literaryMapCardSearch,
    readingContext,
    sentences: [
      makeSentence('g2-cg-retell-map-card-search-sentence-1', 'Luis and Hana started a nature walk in the small park behind the school.'),
      makeSentence('g2-cg-retell-map-card-search-sentence-2', 'Their map card slipped from the folder before the group line moved.'),
      makeSentence('g2-cg-retell-map-card-search-sentence-3', 'Luis looked under a bench while Hana checked the path markers.'),
      makeSentence('g2-cg-retell-map-card-search-sentence-4', 'They followed the painted arrows to the information sign.'),
      makeSentence('g2-cg-retell-map-card-search-sentence-5', 'The card was tucked beside the sign, safe and dry.'),
      makeSentence('g2-cg-retell-map-card-search-sentence-6', 'A red glove lay near the fountain, but no one needed it.'),
      makeSentence('g2-cg-retell-map-card-search-sentence-7', 'The friends placed the card back in the folder.'),
      makeSentence('g2-cg-retell-map-card-search-sentence-8', 'Then they led the walkers along the trail in the right sequence.'),
      makeSentence('g2-cg-retell-map-card-search-sentence-9', 'At the end, everyone reached the garden gate on time.'),
      makeSentence('g2-cg-retell-map-card-search-sentence-10', 'The leader gave a thankful wave.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 7, surfaceWord: 'sequence', chunks: ['se', 'quence'] },
      { sentenceIndex: 3, surfaceWord: 'painted', chunks: ['paint', 'ed'] },
      { sentenceIndex: 4, surfaceWord: 'tucked', chunks: ['tuck', 'ed'] },
      { sentenceIndex: 9, surfaceWord: 'thankful', chunks: ['thank', 'ful'] },
    ],
  },
  {
    kind: 'informational',
    passageId: RETELL_HALL_PASSAGE_IDS.informationalSeedTravel,
    readingContext,
    titleFeatureId: 'g2-cg-retell-seed-travel-title',
    titleText: 'Seeds on the Move',
    sections: [
      {
        sectionId: 'g2-cg-retell-seed-travel-section-1',
        headingFeatureId: 'g2-cg-retell-seed-travel-heading-1',
        headingText: 'How Seeds Move',
        sentenceIndexes: [0, 1, 2],
      },
      {
        sectionId: 'g2-cg-retell-seed-travel-section-2',
        headingFeatureId: 'g2-cg-retell-seed-travel-heading-2',
        headingText: 'Water Helps Too',
        sentenceIndexes: [3, 4, 5],
      },
    ],
    sentences: [
      makeSentence('g2-cg-retell-seed-travel-sentence-1', 'Seeds travel to new places in several ways.'),
      makeSentence('g2-cg-retell-seed-travel-sentence-2', 'Some light seeds ride gently on the wind and float far away.'),
      makeSentence('g2-cg-retell-seed-travel-sentence-3', 'Tiny hooks cling to animal fur.'),
      makeSentence('g2-cg-retell-seed-travel-sentence-4', 'Water can carry seeds along streams and puddles.'),
      makeSentence('g2-cg-retell-seed-travel-sentence-5', 'A gardener may notice a seed packet in a pocket, but that detail is less important.'),
      makeSentence('g2-cg-retell-seed-travel-sentence-6', 'Each move helps a plant begin in a new spot.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 0, surfaceWord: 'several', chunks: ['se', 'veral'] },
      { sentenceIndex: 1, surfaceWord: 'gently', chunks: ['gent', 'ly'] },
      { sentenceIndex: 2, surfaceWord: 'cling', chunks: ['cl', 'ing'] },
      { sentenceIndex: 3, surfaceWord: 'carry', chunks: ['car', 'ry'] },
    ],
  },
  {
    kind: 'informational',
    passageId: RETELL_HALL_PASSAGE_IDS.informationalRainGaugeNotes,
    readingContext,
    titleFeatureId: 'g2-cg-retell-rain-gauge-title',
    titleText: 'Rain Gauge Notes',
    sections: [
      {
        sectionId: 'g2-cg-retell-rain-gauge-section-1',
        headingFeatureId: 'g2-cg-retell-rain-gauge-heading-1',
        headingText: 'How It Works',
        sentenceIndexes: [0, 1, 2],
      },
      {
        sectionId: 'g2-cg-retell-rain-gauge-section-2',
        headingFeatureId: 'g2-cg-retell-rain-gauge-heading-2',
        headingText: 'Why the Reading Matters',
        sentenceIndexes: [3, 4, 5],
      },
    ],
    sentences: [
      makeSentence('g2-cg-retell-rain-gauge-sentence-1', 'A rain gauge helps people measure how much rain falls.'),
      makeSentence('g2-cg-retell-rain-gauge-sentence-2', 'The cup catches drops one after another.'),
      makeSentence('g2-cg-retell-rain-gauge-sentence-3', 'Marked lines show the amount.'),
      makeSentence('g2-cg-retell-rain-gauge-sentence-4', 'A notebook records the reading after the storm.'),
      makeSentence('g2-cg-retell-rain-gauge-sentence-5', 'The gauge may stand beside a flower bed, but that detail is less important.'),
      makeSentence('g2-cg-retell-rain-gauge-sentence-6', 'The number helps people compare one storm with another.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 0, surfaceWord: 'measure', chunks: ['mea', 'sure'] },
      { sentenceIndex: 2, surfaceWord: 'marked', chunks: ['mark', 'ed'] },
      { sentenceIndex: 3, surfaceWord: 'reading', chunks: ['read', 'ing'] },
      { sentenceIndex: 2, surfaceWord: 'amount', chunks: ['a', 'mount'] },
    ],
  },
  {
    kind: 'informational',
    passageId: RETELL_HALL_PASSAGE_IDS.informationalBirdLayers,
    readingContext,
    titleFeatureId: 'g2-cg-retell-bird-layers-title',
    titleText: 'Birds in a Layered Habitat',
    sections: [
      {
        sectionId: 'g2-cg-retell-bird-layers-section-1',
        headingFeatureId: 'g2-cg-retell-bird-layers-heading-1',
        headingText: 'Top Layer',
        sentenceIndexes: [0, 1],
      },
      {
        sectionId: 'g2-cg-retell-bird-layers-section-2',
        headingFeatureId: 'g2-cg-retell-bird-layers-heading-2',
        headingText: 'Middle Layer',
        sentenceIndexes: [2],
      },
      {
        sectionId: 'g2-cg-retell-bird-layers-section-3',
        headingFeatureId: 'g2-cg-retell-bird-layers-heading-3',
        headingText: 'Ground Layer',
        sentenceIndexes: [3, 4, 5],
      },
    ],
    sentences: [
      makeSentence('g2-cg-retell-bird-layers-sentence-1', 'Birds use different layers of a habitat for food and shelter.'),
      makeSentence('g2-cg-retell-bird-layers-sentence-2', 'In the top layer, some birds rest high in the branches.'),
      makeSentence('g2-cg-retell-bird-layers-sentence-3', 'In the middle layer, others hide in shrubs and look for insects.'),
      makeSentence('g2-cg-retell-bird-layers-sentence-4', 'On the ground, some birds search for seeds and crumbs.'),
      makeSentence('g2-cg-retell-bird-layers-sentence-5', 'A path marker stands near the trail, but it is only a small extra detail.'),
      makeSentence('g2-cg-retell-bird-layers-sentence-6', 'Each layer gives birds a helpful place to live.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 0, surfaceWord: 'layers', chunks: ['lay', 'ers'] },
      { sentenceIndex: 0, surfaceWord: 'shelter', chunks: ['shel', 'ter'] },
      { sentenceIndex: 5, surfaceWord: 'helpful', chunks: ['help', 'ful'] },
      { sentenceIndex: 3, surfaceWord: 'ground', chunks: ['gro', 'und'] },
    ],
  },
] as const

export const retellHallPassages: readonly Passage[] = retellHallPassagePlans.map((plan) =>
  plan.kind === 'literary'
    ? buildLiteraryPassage(plan)
    : buildInformationalPassage(plan),
)

export const retellHallPassageMap = new Map(retellHallPassagePlans.map((plan) => [plan.passageId, plan] as const))

export function getRetellHallPassagePlan(passageId: string): RetellHallPassagePlan {
  const plan = retellHallPassageMap.get(passageId)
  if (!plan) {
    throw new Error(`Unknown Retell Hall passage: ${passageId}`)
  }
  return plan
}

export const retellHallSupportTargets: readonly WordSupportTarget[] = retellHallPassages.flatMap((passage) => passage.wordSupportTargets ?? [])
