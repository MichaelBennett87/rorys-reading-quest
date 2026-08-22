import type { AuthorPurposeGuide } from '../../../contentPackTypes'
import { purposePathContentVersion, purposePathFeatureIds, purposePathPassageIds, purposePathSentenceIds } from './ids'

export const authorPurposeGuides: AuthorPurposeGuide[] = [
  {
    passageId: purposePathPassageIds.rainGaugeReadings.passageId,
    topicLabel: 'rain gauges',
    purposeKind: 'explain-how',
    specificPurposeStatement: 'To explain how a rain gauge helps people measure rainfall.',
    purposeEvidenceIds: [
      purposePathSentenceIds.rainGaugeReadings[0],
      purposePathSentenceIds.rainGaugeReadings[1],
      purposePathSentenceIds.rainGaugeReadings[3],
      purposePathSentenceIds.rainGaugeReadings[5],
    ],
    secondaryDetailIds: [
      purposePathSentenceIds.rainGaugeReadings[2],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: purposePathContentVersion,
  },
  {
    passageId: purposePathPassageIds.nestBuilderNotes.passageId,
    topicLabel: 'bird nests',
    purposeKind: 'describe',
    specificPurposeStatement: 'To describe how birds build nests that keep young birds warm and safe.',
    purposeEvidenceIds: [
      purposePathSentenceIds.nestBuilderNotes[0],
      purposePathSentenceIds.nestBuilderNotes[1],
      purposePathSentenceIds.nestBuilderNotes[2],
      purposePathSentenceIds.nestBuilderNotes[6],
    ],
    secondaryDetailIds: [
      purposePathSentenceIds.nestBuilderNotes[3],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: purposePathContentVersion,
  },
  {
    passageId: purposePathPassageIds.beePollenPath.passageId,
    topicLabel: 'bees and pollen',
    purposeKind: 'teach-about',
    specificPurposeStatement: 'To teach readers how bees carry pollen from flower to flower.',
    purposeEvidenceIds: [
      purposePathSentenceIds.beePollenPath[0],
      purposePathSentenceIds.beePollenPath[1],
      purposePathSentenceIds.beePollenPath[2],
      purposePathSentenceIds.beePollenPath[7],
    ],
    secondaryDetailIds: [
      purposePathFeatureIds.beePollenPath.caption,
    ],
    reviewStatus: 'DRAFT',
    contentVersion: purposePathContentVersion,
  },
  {
    passageId: purposePathPassageIds.trailMarkerSystem.passageId,
    topicLabel: 'trail markers',
    purposeKind: 'explain-process',
    specificPurposeStatement: 'To explain how trail markers and maps help visitors follow a path safely.',
    purposeEvidenceIds: [
      purposePathSentenceIds.trailMarkerSystem[0],
      purposePathSentenceIds.trailMarkerSystem[1],
      purposePathSentenceIds.trailMarkerSystem[3],
      purposePathSentenceIds.trailMarkerSystem[6],
    ],
    secondaryDetailIds: [
      purposePathSentenceIds.trailMarkerSystem[5],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: purposePathContentVersion,
  },
  {
    passageId: purposePathPassageIds.shadeGardenStudy.passageId,
    topicLabel: 'shade in a garden',
    purposeKind: 'explain-why',
    specificPurposeStatement: 'To explain why shade helps a garden stay moist and calm for plants.',
    purposeEvidenceIds: [
      purposePathSentenceIds.shadeGardenStudy[0],
      purposePathSentenceIds.shadeGardenStudy[1],
      purposePathSentenceIds.shadeGardenStudy[4],
      purposePathSentenceIds.shadeGardenStudy[6],
    ],
    secondaryDetailIds: [
      purposePathSentenceIds.shadeGardenStudy[2],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: purposePathContentVersion,
  },
  {
    passageId: purposePathPassageIds.recyclingSortStation.passageId,
    topicLabel: 'recycling stations',
    purposeKind: 'provide-facts',
    specificPurposeStatement: 'To provide facts about how a recycling station sorts materials for reuse.',
    purposeEvidenceIds: [
      purposePathSentenceIds.recyclingSortStation[0],
      purposePathSentenceIds.recyclingSortStation[1],
      purposePathSentenceIds.recyclingSortStation[3],
      purposePathSentenceIds.recyclingSortStation[7],
    ],
    secondaryDetailIds: [
      purposePathSentenceIds.recyclingSortStation[8],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: purposePathContentVersion,
  },
  {
    passageId: purposePathPassageIds.compostChangeNotes.passageId,
    topicLabel: 'compost piles',
    purposeKind: 'explain-process',
    specificPurposeStatement: 'To explain how a compost pile changes scraps and leaves into useful soil.',
    purposeEvidenceIds: [
      purposePathSentenceIds.compostChangeNotes[0],
      purposePathSentenceIds.compostChangeNotes[1],
      purposePathSentenceIds.compostChangeNotes[2],
      purposePathSentenceIds.compostChangeNotes[6],
    ],
    secondaryDetailIds: [
      purposePathSentenceIds.compostChangeNotes[4],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: purposePathContentVersion,
  },
]


