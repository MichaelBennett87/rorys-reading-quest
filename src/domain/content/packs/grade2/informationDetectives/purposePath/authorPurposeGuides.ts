import type { AuthorPurposeGuide } from '../../../contentPackTypes'
import { purposePathContentVersion, purposePathFeatureIds, purposePathPassageIds, purposePathSentenceIds } from './ids'

export const authorPurposeGuides: AuthorPurposeGuide[] = [
  {
    passageId: purposePathPassageIds.rainGaugeReadings.passageId,
    topicLabel: 'rain gardens',
    purposeKind: 'explain-how',
    specificPurposeStatement: 'To explain how a rain garden catches water and helps it soak into soil.',
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
    topicLabel: 'animal shelters',
    purposeKind: 'describe',
    specificPurposeStatement: 'To describe how a calm shelter helps animals rest and feel safe.',
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
    topicLabel: 'pollinator gardens',
    purposeKind: 'teach-about',
    specificPurposeStatement: 'To teach readers how sunny and shady garden rows support pollinators in different ways.',
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
    topicLabel: 'weather observations',
    purposeKind: 'explain-how',
    specificPurposeStatement: 'To explain how weather tools and notes help a class observe changes.',
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
    topicLabel: 'seed travel',
    purposeKind: 'explain-process',
    specificPurposeStatement: 'To explain several ways seeds travel to new places.',
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
    topicLabel: 'compost piles',
    purposeKind: 'explain-process',
    specificPurposeStatement: 'To explain how scraps and leaves change into compost that helps soil.',
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
    topicLabel: 'trail markers',
    purposeKind: 'explain-process',
    specificPurposeStatement: 'To explain how trail markers and maps help visitors follow a path safely.',
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


