import type { PairedTextSet } from '../../../contentPackTypes'
import { COMPARE_KEEP_CONTENT_VERSION, COMPARE_KEEP_PAIR_IDS, COMPARE_KEEP_PASSAGE_IDS } from './ids'

export const compareKeepPairedTextSets: readonly PairedTextSet[] = [
  {
    pairId: COMPARE_KEEP_PAIR_IDS.literaryProseA,
    pairTitle: 'Helping a Shared Place',
    relationshipKind: 'same-theme',
    members: [
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseA,
        label: 'Text 1',
        displayTitle: 'Garden Helpers',
        format: 'literary-prose',
      },
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseB,
        label: 'Text 2',
        displayTitle: 'Library Banner',
        format: 'literary-prose',
      },
    ],
    formatRelationship: 'same-format',
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.informationalA,
    pairTitle: 'How Seeds Travel',
    relationshipKind: 'same-topic',
    members: [
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.informationalA,
        label: 'Text 1',
        displayTitle: 'How Some Seeds Ride on Fur',
        format: 'informational',
      },
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.informationalB,
        label: 'Text 2',
        displayTitle: 'How Seeds Move in Wind and Water',
        format: 'informational',
      },
    ],
    formatRelationship: 'same-format',
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.literaryPoemA,
    pairTitle: 'Wind Changes the Path',
    relationshipKind: 'same-theme',
    members: [
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseC,
        label: 'Text 1',
        displayTitle: 'Wind Kite Walk',
        format: 'literary-prose',
      },
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.literaryPoemA,
        label: 'Text 2',
        displayTitle: 'Wind March',
        format: 'literary-poem',
      },
    ],
    formatRelationship: 'different-format',
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.informationalB,
    pairTitle: 'Weather Tools Help Us Observe',
    relationshipKind: 'same-topic',
    members: [
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.informationalC,
        label: 'Text 1',
        displayTitle: 'A Rain Gauge on the Playground',
        format: 'informational',
      },
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.informationalD,
        label: 'Text 2',
        displayTitle: 'Weather Shelters and Tools',
        format: 'informational',
      },
    ],
    formatRelationship: 'same-format',
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.literaryProseB,
    pairTitle: 'Following a Calm Plan',
    relationshipKind: 'same-theme',
    members: [
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseD,
        label: 'Text 1',
        displayTitle: 'Trail Card',
        format: 'literary-prose',
      },
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseE,
        label: 'Text 2',
        displayTitle: 'Map Parade',
        format: 'literary-prose',
      },
    ],
    formatRelationship: 'same-format',
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.informationalC,
    pairTitle: 'How Roots Help Soil',
    relationshipKind: 'same-topic',
    members: [
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.informationalE,
        label: 'Text 1',
        displayTitle: 'Roots at the Pond Edge',
        format: 'informational',
      },
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.informationalF,
        label: 'Text 2',
        displayTitle: 'Roots in a Garden Bed',
        format: 'informational',
      },
    ],
    formatRelationship: 'same-format',
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
  {
    pairId: COMPARE_KEEP_PAIR_IDS.literaryPoemB,
    pairTitle: 'Preparing for a Shared Moment',
    relationshipKind: 'same-theme',
    members: [
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseF,
        label: 'Text 1',
        displayTitle: 'Camp Lanterns',
        format: 'literary-prose',
      },
      {
        passageId: COMPARE_KEEP_PASSAGE_IDS.literaryPoemB,
        label: 'Text 2',
        displayTitle: 'Before the Show',
        format: 'literary-poem',
      },
    ],
    formatRelationship: 'different-format',
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  },
]
