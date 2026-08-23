import type { CentralIdeaGuide } from '../../../contentPackTypes'
import { centralIdeaCenterContentVersion, centralIdeaCenterFeatureIds, centralIdeaCenterPassageIds, centralIdeaCenterSentenceIds } from './ids'

export const centralIdeaCenterGuides: CentralIdeaGuide[] = [
  {
    passageId: centralIdeaCenterPassageIds.rainGardenHelpers.passageId,
    topicLabel: 'rain gardens',
    centralIdeaStatement: 'A rain garden helps water soak in and gives plants a safer place to grow.',
    centralIdeaMode: 'stated',
    explicitCentralIdeaSentenceId: centralIdeaCenterSentenceIds.rainGardenHelpers[7],
    relevantEvidenceIds: [
      centralIdeaCenterSentenceIds.rainGardenHelpers[0],
      centralIdeaCenterSentenceIds.rainGardenHelpers[1],
      centralIdeaCenterSentenceIds.rainGardenHelpers[4],
      centralIdeaCenterSentenceIds.rainGardenHelpers[7],
    ],
    otherEvidenceIds: [
      centralIdeaCenterSentenceIds.rainGardenHelpers[2],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: centralIdeaCenterContentVersion,
  },
  {
    passageId: centralIdeaCenterPassageIds.quietShelterSpaces.passageId,
    topicLabel: 'animal shelters',
    centralIdeaStatement: 'A quiet shelter helps animals feel safe and settle in.',
    centralIdeaMode: 'inferred',
    relevantEvidenceIds: [
      centralIdeaCenterSentenceIds.quietShelterSpaces[0],
      centralIdeaCenterSentenceIds.quietShelterSpaces[1],
      centralIdeaCenterSentenceIds.quietShelterSpaces[3],
      centralIdeaCenterSentenceIds.quietShelterSpaces[7],
    ],
    otherEvidenceIds: [
      centralIdeaCenterSentenceIds.quietShelterSpaces[2],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: centralIdeaCenterContentVersion,
  },
  {
    passageId: centralIdeaCenterPassageIds.pollinatorPatchCounts.passageId,
    topicLabel: 'pollinator gardens',
    centralIdeaStatement: 'A pollinator garden gives insects places to find food and rest.',
    centralIdeaMode: 'stated',
    explicitCentralIdeaSentenceId: centralIdeaCenterSentenceIds.pollinatorPatchCounts[7],
    relevantEvidenceIds: [
      centralIdeaCenterSentenceIds.pollinatorPatchCounts[0],
      centralIdeaCenterSentenceIds.pollinatorPatchCounts[1],
      centralIdeaCenterFeatureIds.pollinatorPatchCounts.caption,
      centralIdeaCenterSentenceIds.pollinatorPatchCounts[7],
    ],
    otherEvidenceIds: [
      centralIdeaCenterSentenceIds.pollinatorPatchCounts[3],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: centralIdeaCenterContentVersion,
  },
  {
    passageId: centralIdeaCenterPassageIds.weatherStationNotes.passageId,
    topicLabel: 'weather stations',
    centralIdeaStatement: 'A weather station helps the class learn about weather by using tools and notes.',
    centralIdeaMode: 'inferred',
    relevantEvidenceIds: [
      centralIdeaCenterSentenceIds.weatherStationNotes[0],
      centralIdeaCenterSentenceIds.weatherStationNotes[2],
      centralIdeaCenterSentenceIds.weatherStationNotes[4],
      centralIdeaCenterSentenceIds.weatherStationNotes[7],
    ],
    otherEvidenceIds: [
      centralIdeaCenterSentenceIds.weatherStationNotes[1],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: centralIdeaCenterContentVersion,
  },
  {
    passageId: centralIdeaCenterPassageIds.seedTravelRoutes.passageId,
    topicLabel: 'seed travel',
    centralIdeaStatement: 'Different seeds travel in different ways so plants can grow in new places.',
    centralIdeaMode: 'inferred',
    relevantEvidenceIds: [
      centralIdeaCenterSentenceIds.seedTravelRoutes[0],
      centralIdeaCenterSentenceIds.seedTravelRoutes[1],
      centralIdeaCenterSentenceIds.seedTravelRoutes[3],
      centralIdeaCenterSentenceIds.seedTravelRoutes[9],
    ],
    otherEvidenceIds: [
      centralIdeaCenterSentenceIds.seedTravelRoutes[5],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: centralIdeaCenterContentVersion,
  },
  {
    passageId: centralIdeaCenterPassageIds.compostChangeStory.passageId,
    topicLabel: 'compost piles',
    centralIdeaStatement: 'A compost pile changes scraps and leaves into material that helps soil.',
    centralIdeaMode: 'inferred',
    relevantEvidenceIds: [
      centralIdeaCenterSentenceIds.compostChangeStory[0],
      centralIdeaCenterSentenceIds.compostChangeStory[1],
      centralIdeaCenterSentenceIds.compostChangeStory[3],
      centralIdeaCenterSentenceIds.compostChangeStory[7],
    ],
    otherEvidenceIds: [
      centralIdeaCenterSentenceIds.compostChangeStory[8],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: centralIdeaCenterContentVersion,
  },
  {
    passageId: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId,
    topicLabel: 'trail markers',
    centralIdeaStatement: 'Trail markers help visitors stay on the right path and reach the end safely.',
    centralIdeaMode: 'stated',
    explicitCentralIdeaSentenceId: centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[9],
    relevantEvidenceIds: [
      centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[0],
      centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[1],
      centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[3],
      centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[9],
    ],
    otherEvidenceIds: [
      centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[2],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: centralIdeaCenterContentVersion,
  },
]
