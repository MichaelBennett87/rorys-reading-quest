import type { PairedTextComparisonGuide, PairedTextComparisonPoint } from '../../../contentPackTypes'
import { createScopedEvidenceReference } from '../../../../evidence'
import { COMPARE_KEEP_CONTENT_VERSION, COMPARE_KEEP_PAIR_IDS, COMPARE_KEEP_PASSAGE_IDS } from './ids'

function point(
  pointId: string,
  dimension: PairedTextComparisonPoint['dimension'],
  statement: string,
  text1EvidenceIds: string[],
  text2EvidenceIds: string[],
  importanceExplanation: string,
): PairedTextComparisonPoint {
  return {
    pointId,
    dimension,
    statement,
    text1EvidenceIds,
    text2EvidenceIds,
    importanceExplanation,
  }
}

const a1 = COMPARE_KEEP_PASSAGE_IDS.literaryProseA
const a2 = COMPARE_KEEP_PASSAGE_IDS.literaryProseB
const b1 = COMPARE_KEEP_PASSAGE_IDS.informationalA
const b2 = COMPARE_KEEP_PASSAGE_IDS.informationalB
const c1 = COMPARE_KEEP_PASSAGE_IDS.literaryProseC
const c2 = COMPARE_KEEP_PASSAGE_IDS.literaryPoemA
const d1 = COMPARE_KEEP_PASSAGE_IDS.informationalC
const d2 = COMPARE_KEEP_PASSAGE_IDS.informationalD
const e1 = COMPARE_KEEP_PASSAGE_IDS.literaryProseD
const e2 = COMPARE_KEEP_PASSAGE_IDS.literaryProseE
const f1 = COMPARE_KEEP_PASSAGE_IDS.informationalE
const f2 = COMPARE_KEEP_PASSAGE_IDS.informationalF
const g1 = COMPARE_KEEP_PASSAGE_IDS.literaryProseF
const g2 = COMPARE_KEEP_PASSAGE_IDS.literaryPoemB

export const compareKeepComparisonGuides: readonly PairedTextComparisonGuide[] = [
  {
    pairId: COMPARE_KEEP_PAIR_IDS.literaryProseA,
    relationshipKind: 'same-theme',
    sharedTopicOrThemeStatement: 'Both texts show that careful teamwork can help a shared space get ready again.',
    importantSimilarities: [
      point(
        'ck-guide-1-sim-1',
        'character',
        'In both texts, two helpers work together on the same job.',
        [createScopedEvidenceReference(a1, 'ck-lit-prose-1-s1'), createScopedEvidenceReference(a1, 'ck-lit-prose-1-s3')],
        [createScopedEvidenceReference(a2, 'ck-lit-prose-2-s1'), createScopedEvidenceReference(a2, 'ck-lit-prose-2-s3')],
        'The shared helpers matter because the reader sees teamwork in both texts.',
      ),
      point(
        'ck-guide-1-sim-2',
        'event-sequence',
        'Both texts begin with a problem and end with the space ready for use.',
        [createScopedEvidenceReference(a1, 'ck-lit-prose-1-s1'), createScopedEvidenceReference(a1, 'ck-lit-prose-1-s6')],
        [createScopedEvidenceReference(a2, 'ck-lit-prose-2-s1'), createScopedEvidenceReference(a2, 'ck-lit-prose-2-s6')],
        'The start-to-finish order matters because it shows how each pair of events solves the problem.',
      ),
    ],
    importantDifferences: [
      point(
        'ck-guide-1-diff-1',
        'setting',
        'Text 1 happens in a garden, while Text 2 happens in a library hall.',
        [createScopedEvidenceReference(a1, 'ck-lit-prose-1-s1')],
        [createScopedEvidenceReference(a2, 'ck-lit-prose-2-s1')],
        'The setting matters because the places help the reader tell the stories apart.',
      ),
      point(
        'ck-guide-1-diff-2',
        'important-detail',
        'Text 1 uses string and a plant sign, while Text 2 uses paper stars and a banner string.',
        [createScopedEvidenceReference(a1, 'ck-lit-prose-1-s3'), createScopedEvidenceReference(a1, 'ck-lit-prose-1-s5')],
        [createScopedEvidenceReference(a2, 'ck-lit-prose-2-s3'), createScopedEvidenceReference(a2, 'ck-lit-prose-2-s5')],
        'The tools matter because they show how each helper solves the problem in a different way.',
      ),
    ],
    text1OtherDetailIds: [createScopedEvidenceReference(a1, 'ck-lit-prose-1-s2')],
    text2OtherDetailIds: [createScopedEvidenceReference(a2, 'ck-lit-prose-2-s2')],
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.informationalA,
    relationshipKind: 'same-topic',
    sharedTopicOrThemeStatement: 'Both texts explain ways seeds move to new places so plants can spread.',
    importantSimilarities: [
      point(
        'ck-guide-2-sim-1',
        'central-idea',
        'Both texts explain that seeds travel away from the parent plant.',
        [createScopedEvidenceReference(b1, 'ck-info-1-s1'), createScopedEvidenceReference(b1, 'ck-info-1-s5')],
        [createScopedEvidenceReference(b2, 'ck-info-2-s1'), createScopedEvidenceReference(b2, 'ck-info-2-s5')],
        'The central idea matters because it tells the reader what both texts are mostly about.',
      ),
      point(
        'ck-guide-2-sim-2',
        'process',
        'Both texts say the travel method helps seeds reach fresh soil.',
        [createScopedEvidenceReference(b1, 'ck-info-1-s4'), createScopedEvidenceReference(b1, 'ck-info-1-s5')],
        [createScopedEvidenceReference(b2, 'ck-info-2-s4'), createScopedEvidenceReference(b2, 'ck-info-2-s5')],
        'The process matters because it explains why the travel method helps the plant.',
      ),
    ],
    importantDifferences: [
      point(
        'ck-guide-2-diff-1',
        'important-detail',
        'Text 1 shows seeds clinging to fur or clothes, while Text 2 shows seeds moving with wind or water.',
        [createScopedEvidenceReference(b1, 'ck-info-1-s1'), createScopedEvidenceReference(b1, 'ck-info-1-s2')],
        [createScopedEvidenceReference(b2, 'ck-info-2-s1'), createScopedEvidenceReference(b2, 'ck-info-2-s3')],
        'This difference matters because it names the different ways seeds travel.',
      ),
      point(
        'ck-guide-2-diff-2',
        'process',
        'Text 1 explains a seed rubbing off later, while Text 2 explains wind lifting light seeds and water pushing floating seeds.',
        [createScopedEvidenceReference(b1, 'ck-info-1-s3'), createScopedEvidenceReference(b1, 'ck-info-1-s4')],
        [createScopedEvidenceReference(b2, 'ck-info-2-s2'), createScopedEvidenceReference(b2, 'ck-info-2-s4')],
        'The process details matter because they show how each seed begins and ends its trip.',
      ),
    ],
    text1OtherDetailIds: [createScopedEvidenceReference(b1, 'ck-info-1-s6')],
    text2OtherDetailIds: [createScopedEvidenceReference(b2, 'ck-info-2-s6')],
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.literaryPoemA,
    relationshipKind: 'same-theme',
    sharedTopicOrThemeStatement: 'Both texts show how wind changes what happens outdoors.',
    importantSimilarities: [
      point(
        'ck-guide-3-sim-1',
        'event-sequence',
        'Both texts move from a strong wind to a calmer ending.',
        [createScopedEvidenceReference(c1, 'ck-lit-prose-3-s1'), createScopedEvidenceReference(c1, 'ck-lit-prose-3-s6')],
        [createScopedEvidenceReference(c2, 'ck-lit-poem-1-s1'), createScopedEvidenceReference(c2, 'ck-lit-poem-1-s5')],
        'The sequence matters because it shows change from wind to calm.',
      ),
      point(
        'ck-guide-3-sim-2',
        'character',
        'Both texts include Tia as someone who notices the wind.',
        [createScopedEvidenceReference(c1, 'ck-lit-prose-3-s1'), createScopedEvidenceReference(c1, 'ck-lit-prose-3-s4')],
        [createScopedEvidenceReference(c2, 'ck-lit-poem-1-s3'), createScopedEvidenceReference(c2, 'ck-lit-poem-1-s8')],
        'The character matters because Tia helps the reader connect the two texts.',
      ),
    ],
    importantDifferences: [
      point(
        'ck-guide-3-diff-1',
        'setting',
        'Text 1 is a story about a kite walk in a park, while Text 2 is a poem that describes the wind and leaves more broadly.',
        [createScopedEvidenceReference(c1, 'ck-lit-prose-3-s1'), createScopedEvidenceReference(c1, 'ck-lit-prose-3-s3')],
        [createScopedEvidenceReference(c2, 'ck-lit-poem-1-s1'), createScopedEvidenceReference(c2, 'ck-lit-poem-1-s2')],
        'The setting difference matters because it shows where each text focuses the reader.',
      ),
      point(
        'ck-guide-3-diff-2',
        'important-detail',
        'Text 1 focuses on the kite and the brother helping, while Text 2 focuses on leaves, grass, and the wind itself.',
        [createScopedEvidenceReference(c1, 'ck-lit-prose-3-s4'), createScopedEvidenceReference(c1, 'ck-lit-prose-3-s6')],
        [createScopedEvidenceReference(c2, 'ck-lit-poem-1-s2'), createScopedEvidenceReference(c2, 'ck-lit-poem-1-s4')],
        'The detail difference matters because it shows what each text wants the reader to notice most.',
      ),
    ],
    text1OtherDetailIds: [createScopedEvidenceReference(c1, 'ck-lit-prose-3-s2')],
    text2OtherDetailIds: [createScopedEvidenceReference(c2, 'ck-lit-poem-1-s6')],
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.informationalB,
    relationshipKind: 'same-topic',
    sharedTopicOrThemeStatement: 'Both texts explain tools that help a class observe the weather.',
    importantSimilarities: [
      point(
        'ck-guide-4-sim-1',
        'central-idea',
        'Both texts say weather tools help students notice what the day is doing.',
        [createScopedEvidenceReference(d1, 'ck-info-3-s1'), createScopedEvidenceReference(d1, 'ck-info-3-s5')],
        [createScopedEvidenceReference(d2, 'ck-info-4-s1'), createScopedEvidenceReference(d2, 'ck-info-4-s5')],
        'The central idea matters because it explains why the tools are useful.',
      ),
      point(
        'ck-guide-4-sim-2',
        'process',
        'Both texts show a process where students collect notes or readings and compare them later.',
        [createScopedEvidenceReference(d1, 'ck-info-3-s3'), createScopedEvidenceReference(d1, 'ck-info-3-s5')],
        [createScopedEvidenceReference(d2, 'ck-info-4-s4'), createScopedEvidenceReference(d2, 'ck-info-4-s5')],
        'The process matters because it shows how students use the tools to learn.',
      ),
    ],
    importantDifferences: [
      point(
        'ck-guide-4-diff-1',
        'important-detail',
        'Text 1 measures rain with a clear cup, while Text 2 uses a weather shelter and a wind sock.',
        [createScopedEvidenceReference(d1, 'ck-info-3-s1'), createScopedEvidenceReference(d1, 'ck-info-3-s4')],
        [createScopedEvidenceReference(d2, 'ck-info-4-s1'), createScopedEvidenceReference(d2, 'ck-info-4-s3')],
        'The tools matter because they show different kinds of weather evidence.',
      ),
      point(
        'ck-guide-4-diff-2',
        'process',
        'Text 1 focuses on measuring the water line after a storm, while Text 2 focuses on keeping notes dry and watching the breeze.',
        [createScopedEvidenceReference(d1, 'ck-info-3-s2'), createScopedEvidenceReference(d1, 'ck-info-3-s4')],
        [createScopedEvidenceReference(d2, 'ck-info-4-s2'), createScopedEvidenceReference(d2, 'ck-info-4-s4')],
        'The process difference matters because it shows how each tool helps in a different way.',
      ),
    ],
    text1OtherDetailIds: [createScopedEvidenceReference(d1, 'ck-info-3-s6')],
    text2OtherDetailIds: [createScopedEvidenceReference(d2, 'ck-info-4-s6')],
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.literaryProseB,
    relationshipKind: 'same-theme',
    sharedTopicOrThemeStatement: 'Both texts show children staying calm while they follow a plan that helps a group succeed.',
    importantSimilarities: [
      point(
        'ck-guide-5-sim-1',
        'character',
        'Both texts have helpers who keep working until the plan is ready.',
        [createScopedEvidenceReference(e1, 'ck-lit-prose-4-s3'), createScopedEvidenceReference(e1, 'ck-lit-prose-4-s6')],
        [createScopedEvidenceReference(e2, 'ck-lit-prose-5-s2'), createScopedEvidenceReference(e2, 'ck-lit-prose-5-s4')],
        'The helpers matter because they show the shared calm work in both stories.',
      ),
      point(
        'ck-guide-5-sim-2',
        'event-sequence',
        'Both texts begin with a problem or plan and end with the group ready to move forward.',
        [createScopedEvidenceReference(e1, 'ck-lit-prose-4-s1'), createScopedEvidenceReference(e1, 'ck-lit-prose-4-s5')],
        [createScopedEvidenceReference(e2, 'ck-lit-prose-5-s1'), createScopedEvidenceReference(e2, 'ck-lit-prose-5-s6')],
        'The sequence matters because it shows the reader how each story reaches a clear ending.',
      ),
      point(
        'ck-guide-5-sim-3',
        'important-detail',
        'Both texts use a map or card to keep the route in order.',
        [createScopedEvidenceReference(e1, 'ck-lit-prose-4-s4'), createScopedEvidenceReference(e1, 'ck-lit-prose-4-s5')],
        [createScopedEvidenceReference(e2, 'ck-lit-prose-5-s1'), createScopedEvidenceReference(e2, 'ck-lit-prose-5-s4')],
        'The route detail matters because it is the piece that helps the group stay on track.',
      ),
    ],
    importantDifferences: [
      point(
        'ck-guide-5-diff-1',
        'setting',
        'Text 1 happens before a nature walk, while Text 2 happens before a school parade.',
        [createScopedEvidenceReference(e1, 'ck-lit-prose-4-s1')],
        [createScopedEvidenceReference(e2, 'ck-lit-prose-5-s1')],
        'The setting difference matters because it shows two different group events.',
      ),
      point(
        'ck-guide-5-diff-2',
        'character',
        'Text 1 focuses on Eli and Ms. Rivera, while Text 2 focuses on a parade team working as a group.',
        [createScopedEvidenceReference(e1, 'ck-lit-prose-4-s3')],
        [createScopedEvidenceReference(e2, 'ck-lit-prose-5-s2')],
        'The character difference matters because one text centers one student while the other centers a team.',
      ),
      point(
        'ck-guide-5-diff-3',
        'important-detail',
        'Text 1 finds a lost trail card, while Text 2 checks a map so the parade can stay in order.',
        [createScopedEvidenceReference(e1, 'ck-lit-prose-4-s4'), createScopedEvidenceReference(e1, 'ck-lit-prose-4-s5')],
        [createScopedEvidenceReference(e2, 'ck-lit-prose-5-s3'), createScopedEvidenceReference(e2, 'ck-lit-prose-5-s6')],
        'This detail difference matters because it shows each story’s main challenge.',
      ),
    ],
    text1OtherDetailIds: [createScopedEvidenceReference(e1, 'ck-lit-prose-4-s2')],
    text2OtherDetailIds: [createScopedEvidenceReference(e2, 'ck-lit-prose-5-s5')],
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.informationalC,
    relationshipKind: 'same-topic',
    sharedTopicOrThemeStatement: 'Both texts explain how parts of a pond or roots help living things stay supported.',
    importantSimilarities: [
      point(
        'ck-guide-6-sim-1',
        'central-idea',
        'Both texts explain that a living place stays healthy when its parts work together.',
        [createScopedEvidenceReference(f1, 'ck-info-5-s3'), createScopedEvidenceReference(f1, 'ck-info-5-s5')],
        [createScopedEvidenceReference(f2, 'ck-info-6-s2'), createScopedEvidenceReference(f2, 'ck-info-6-s5')],
        'The central idea matters because it tells the reader what both texts are mostly about.',
      ),
      point(
        'ck-guide-6-sim-2',
        'important-detail',
        'Both texts mention a way that something stays in place instead of drifting away.',
        [createScopedEvidenceReference(f1, 'ck-info-5-s3'), createScopedEvidenceReference(f1, 'ck-info-5-s5')],
        [createScopedEvidenceReference(f2, 'ck-info-6-s2'), createScopedEvidenceReference(f2, 'ck-info-6-s5')],
        'This detail matters because it shows the reader how the habitat or soil is protected.',
      ),
      point(
        'ck-guide-6-sim-3',
        'process',
        'Both texts describe a process that helps the whole area keep working well.',
        [createScopedEvidenceReference(f1, 'ck-info-5-s3'), createScopedEvidenceReference(f1, 'ck-info-5-s4')],
        [createScopedEvidenceReference(f2, 'ck-info-6-s2'), createScopedEvidenceReference(f2, 'ck-info-6-s5')],
        'The process matters because it explains how each place supports living things.',
      ),
    ],
    importantDifferences: [
      point(
        'ck-guide-6-diff-1',
        'important-detail',
        'Text 1 focuses on pond layers and animals near the bank, while Text 2 focuses on roots and soil underground.',
        [createScopedEvidenceReference(f1, 'ck-info-5-s1'), createScopedEvidenceReference(f1, 'ck-info-5-s2')],
        [createScopedEvidenceReference(f2, 'ck-info-6-s1'), createScopedEvidenceReference(f2, 'ck-info-6-s2')],
        'The detail difference matters because it shows two different parts of the habitat system.',
      ),
      point(
        'ck-guide-6-diff-2',
        'process',
        'Text 1 explains water and plants in the pond, while Text 2 explains roots holding soil after rain.',
        [createScopedEvidenceReference(f1, 'ck-info-5-s4'), createScopedEvidenceReference(f1, 'ck-info-5-s5')],
        [createScopedEvidenceReference(f2, 'ck-info-6-s3'), createScopedEvidenceReference(f2, 'ck-info-6-s4')],
        'The process difference matters because each text shows support in a different way.',
      ),
      point(
        'ck-guide-6-diff-3',
        'setting',
        'Text 1 stays in the pond, while Text 2 moves underground into the soil.',
        [createScopedEvidenceReference(f1, 'ck-info-5-s1')],
        [createScopedEvidenceReference(f2, 'ck-info-6-s1')],
        'The setting difference matters because the reader sees where each support system works.',
      ),
    ],
    text1OtherDetailIds: [createScopedEvidenceReference(f1, 'ck-info-5-s6')],
    text2OtherDetailIds: [createScopedEvidenceReference(f2, 'ck-info-6-s6')],
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.literaryPoemB,
    relationshipKind: 'same-theme',
    sharedTopicOrThemeStatement: 'Both texts show a group getting ready for a shared event with care and teamwork.',
    importantSimilarities: [
      point(
        'ck-guide-7-sim-1',
        'character',
        'Both texts show helpers working together before the event begins.',
        [createScopedEvidenceReference(g1, 'ck-lit-prose-6-s1'), createScopedEvidenceReference(g1, 'ck-lit-prose-6-s4')],
        [createScopedEvidenceReference(g2, 'ck-lit-poem-2-s1'), createScopedEvidenceReference(g2, 'ck-lit-poem-2-s5')],
        'The helpers matter because they show teamwork before the final moment.',
      ),
      point(
        'ck-guide-7-sim-2',
        'event-sequence',
        'Both texts move from getting ready to the event feeling ready and calm.',
        [createScopedEvidenceReference(g1, 'ck-lit-prose-6-s2'), createScopedEvidenceReference(g1, 'ck-lit-prose-6-s6')],
        [createScopedEvidenceReference(g2, 'ck-lit-poem-2-s4'), createScopedEvidenceReference(g2, 'ck-lit-poem-2-s10')],
        'The sequence matters because it shows the reader how the preparation ends well.',
      ),
      point(
        'ck-guide-7-sim-3',
        'important-detail',
        'Both texts focus on careful setup rather than rushing.',
        [createScopedEvidenceReference(g1, 'ck-lit-prose-6-s3'), createScopedEvidenceReference(g1, 'ck-lit-prose-6-s4')],
        [createScopedEvidenceReference(g2, 'ck-lit-poem-2-s2'), createScopedEvidenceReference(g2, 'ck-lit-poem-2-s8')],
        'This detail matters because it shows what the helpers value most.',
      ),
    ],
    importantDifferences: [
      point(
        'ck-guide-7-diff-1',
        'setting',
        'Text 1 happens at camp, while Text 2 happens in a hall with a stage.',
        [createScopedEvidenceReference(g1, 'ck-lit-prose-6-s1')],
        [createScopedEvidenceReference(g2, 'ck-lit-poem-2-s4')],
        'The setting difference matters because it shows two different event places.',
      ),
      point(
        'ck-guide-7-diff-2',
        'important-detail',
        'Text 1 uses lanterns and blankets, while Text 2 uses strings, notes, and a spotlight.',
        [createScopedEvidenceReference(g1, 'ck-lit-prose-6-s1'), createScopedEvidenceReference(g1, 'ck-lit-prose-6-s4')],
        [createScopedEvidenceReference(g2, 'ck-lit-poem-2-s2'), createScopedEvidenceReference(g2, 'ck-lit-poem-2-s6')],
        'The detail difference matters because each text names different tools for getting ready.',
      ),
      point(
        'ck-guide-7-diff-3',
        'character',
        'Text 1 centers Rosa and Leo, while Text 2 centers a stage helper named Rosa and a larger group on the stage.',
        [createScopedEvidenceReference(g1, 'ck-lit-prose-6-s3')],
        [createScopedEvidenceReference(g2, 'ck-lit-poem-2-s3'), createScopedEvidenceReference(g2, 'ck-lit-poem-2-s5')],
        'The character difference matters because the reader sees one small group and one stage performance group.',
      ),
    ],
    text1OtherDetailIds: [createScopedEvidenceReference(g1, 'ck-lit-prose-6-s5')],
    text2OtherDetailIds: [createScopedEvidenceReference(g2, 'ck-lit-poem-2-s7')],
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
]
