import type { AuthorOpinionGuide } from '../../../contentPackTypes'
import { opinionEvidenceDeskContentVersion, opinionEvidenceDeskPassageIds, opinionEvidenceDeskSentenceIds } from './ids'

export const authorOpinionGuides: AuthorOpinionGuide[] = [
  {
    passageId: opinionEvidenceDeskPassageIds.shadedRestSpots.passageId,
    topicLabel: 'shaded rest spots',
    opinions: [
      {
        opinionId: 'shaded-rest-spots-opinion',
        opinionStatement: 'The nature center should add more shaded rest spots.',
        opinionSentenceId: opinionEvidenceDeskSentenceIds.shadedRestSpots[5],
        supportingEvidenceIds: [
          opinionEvidenceDeskSentenceIds.shadedRestSpots[2],
          opinionEvidenceDeskSentenceIds.shadedRestSpots[3],
        ],
        evidenceConnectionStatement:
          'The cooler bench and the longer visits support the opinion because they show why the author wants more shaded rest spots.',
      },
    ],
    factEvidenceIds: [
      opinionEvidenceDeskSentenceIds.shadedRestSpots[0],
      opinionEvidenceDeskSentenceIds.shadedRestSpots[1],
      opinionEvidenceDeskSentenceIds.shadedRestSpots[2],
    ],
    otherDetailIds: [opinionEvidenceDeskSentenceIds.shadedRestSpots[4]],
    reviewStatus: 'DRAFT',
    contentVersion: opinionEvidenceDeskContentVersion,
  },
  {
    passageId: opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId,
    topicLabel: 'native flowers',
    opinions: [
      {
        opinionId: 'native-flower-beds-opinion-flowers',
        opinionStatement: 'The garden should include more native flowers.',
        opinionSentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[4],
        supportingEvidenceIds: [
          opinionEvidenceDeskSentenceIds.nativeFlowerBeds[1],
          opinionEvidenceDeskSentenceIds.nativeFlowerBeds[2],
        ],
        evidenceConnectionStatement:
          'The bee visits and the morning sun facts support the opinion because they show why the native flowers fit the garden well.',
      },
      {
        opinionId: 'native-flower-beds-opinion-layout',
        opinionStatement: 'The taller plants should stay at the back so the shorter plants get sun.',
        opinionSentenceId: opinionEvidenceDeskSentenceIds.nativeFlowerBeds[5],
        supportingEvidenceIds: [
          opinionEvidenceDeskSentenceIds.nativeFlowerBeds[3],
          opinionEvidenceDeskSentenceIds.nativeFlowerBeds[7],
        ],
        evidenceConnectionStatement:
          'The shadows and the shady-bed details support the opinion because they show why the taller plants should stay in back.',
      },
    ],
    factEvidenceIds: [
      opinionEvidenceDeskSentenceIds.nativeFlowerBeds[0],
      opinionEvidenceDeskSentenceIds.nativeFlowerBeds[1],
      opinionEvidenceDeskSentenceIds.nativeFlowerBeds[2],
    ],
    otherDetailIds: [opinionEvidenceDeskSentenceIds.nativeFlowerBeds[6]],
    reviewStatus: 'DRAFT',
    contentVersion: opinionEvidenceDeskContentVersion,
  },
  {
    passageId: opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId,
    topicLabel: 'trail map symbols',
    opinions: [
      {
        opinionId: 'clear-trail-symbols-opinion',
        opinionStatement: 'The trail map should use clearer symbols so visitors can find places quickly.',
        opinionSentenceId: opinionEvidenceDeskSentenceIds.clearTrailSymbols[5],
        supportingEvidenceIds: [
          opinionEvidenceDeskSentenceIds.clearTrailSymbols[1],
          opinionEvidenceDeskSentenceIds.clearTrailSymbols[3],
        ],
        evidenceConnectionStatement:
          'The confusing pause and the map key support the opinion because they show why clearer symbols would help visitors.',
      },
    ],
    factEvidenceIds: [
      opinionEvidenceDeskSentenceIds.clearTrailSymbols[0],
      opinionEvidenceDeskSentenceIds.clearTrailSymbols[2],
      opinionEvidenceDeskSentenceIds.clearTrailSymbols[6],
    ],
    otherDetailIds: [opinionEvidenceDeskSentenceIds.clearTrailSymbols[4]],
    reviewStatus: 'DRAFT',
    contentVersion: opinionEvidenceDeskContentVersion,
  },
  {
    passageId: opinionEvidenceDeskPassageIds.reusableContainers.passageId,
    topicLabel: 'reusable containers',
    opinions: [
      {
        opinionId: 'reusable-containers-opinion',
        opinionStatement: 'The class should use reusable containers for the school event.',
        opinionSentenceId: opinionEvidenceDeskSentenceIds.reusableContainers[3],
        supportingEvidenceIds: [
          opinionEvidenceDeskSentenceIds.reusableContainers[1],
          opinionEvidenceDeskSentenceIds.reusableContainers[2],
        ],
        evidenceConnectionStatement:
          'The wash-and-use-again boxes and the fewer wrappers support the opinion because they show why reusable containers are a good choice.',
      },
    ],
    factEvidenceIds: [
      opinionEvidenceDeskSentenceIds.reusableContainers[0],
      opinionEvidenceDeskSentenceIds.reusableContainers[1],
      opinionEvidenceDeskSentenceIds.reusableContainers[6],
    ],
    otherDetailIds: [opinionEvidenceDeskSentenceIds.reusableContainers[4]],
    reviewStatus: 'DRAFT',
    contentVersion: opinionEvidenceDeskContentVersion,
  },
  {
    passageId: opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId,
    topicLabel: 'bird-friendly plants',
    opinions: [
      {
        opinionId: 'bird-friendly-plants-opinion-shrubs',
        opinionStatement: 'The observation area should include more berry shrubs.',
        opinionSentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[3],
        supportingEvidenceIds: [
          opinionEvidenceDeskSentenceIds.birdFriendlyPlants[1],
          opinionEvidenceDeskSentenceIds.birdFriendlyPlants[6],
          opinionEvidenceDeskSentenceIds.birdFriendlyPlants[7],
        ],
        evidenceConnectionStatement:
          'The bird visits and the food-and-shelter details support the opinion because they show why more berry shrubs would help the birds.',
      },
      {
        opinionId: 'bird-friendly-plants-opinion-water',
        opinionStatement: 'The area should also place one water dish under the tree.',
        opinionSentenceId: opinionEvidenceDeskSentenceIds.birdFriendlyPlants[4],
        supportingEvidenceIds: [
          opinionEvidenceDeskSentenceIds.birdFriendlyPlants[0],
          opinionEvidenceDeskSentenceIds.birdFriendlyPlants[2],
          opinionEvidenceDeskSentenceIds.birdFriendlyPlants[8],
        ],
        evidenceConnectionStatement:
          'The birds drinking under the tree and the mapped shady spot support the opinion because they show why the water dish belongs there.',
      },
    ],
    factEvidenceIds: [
      opinionEvidenceDeskSentenceIds.birdFriendlyPlants[1],
      opinionEvidenceDeskSentenceIds.birdFriendlyPlants[2],
      opinionEvidenceDeskSentenceIds.birdFriendlyPlants[6],
    ],
    otherDetailIds: [opinionEvidenceDeskSentenceIds.birdFriendlyPlants[9]],
    reviewStatus: 'DRAFT',
    contentVersion: opinionEvidenceDeskContentVersion,
  },
  {
    passageId: opinionEvidenceDeskPassageIds.compostSortingSigns.passageId,
    topicLabel: 'compost sorting signs',
    opinions: [
      {
        opinionId: 'compost-sorting-signs-opinion',
        opinionStatement: 'The class should keep the sorting signs near the bin.',
        opinionSentenceId: opinionEvidenceDeskSentenceIds.compostSortingSigns[6],
        supportingEvidenceIds: [
          opinionEvidenceDeskSentenceIds.compostSortingSigns[1],
          opinionEvidenceDeskSentenceIds.compostSortingSigns[4],
          opinionEvidenceDeskSentenceIds.compostSortingSigns[7],
        ],
        evidenceConnectionStatement:
          'The mistake, change, and chart details support the opinion because they show why the signs should stay near the bin.',
      },
    ],
    factEvidenceIds: [
      opinionEvidenceDeskSentenceIds.compostSortingSigns[0],
      opinionEvidenceDeskSentenceIds.compostSortingSigns[2],
      opinionEvidenceDeskSentenceIds.compostSortingSigns[4],
    ],
    otherDetailIds: [opinionEvidenceDeskSentenceIds.compostSortingSigns[9]],
    reviewStatus: 'DRAFT',
    contentVersion: opinionEvidenceDeskContentVersion,
  },
  {
    passageId: opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId,
    topicLabel: 'rain barrels',
    opinions: [
      {
        opinionId: 'rain-barrel-plan-opinion',
        opinionStatement: 'The gardeners should add a rain barrel by the shed.',
        opinionSentenceId: opinionEvidenceDeskSentenceIds.rainBarrelPlan[3],
        supportingEvidenceIds: [
          opinionEvidenceDeskSentenceIds.rainBarrelPlan[1],
          opinionEvidenceDeskSentenceIds.rainBarrelPlan[2],
          opinionEvidenceDeskSentenceIds.rainBarrelPlan[4],
        ],
        evidenceConnectionStatement:
          'The rainwater, dry-soil, and water-use details support the opinion because they show why the gardeners should add a rain barrel.',
      },
    ],
    factEvidenceIds: [
      opinionEvidenceDeskSentenceIds.rainBarrelPlan[0],
      opinionEvidenceDeskSentenceIds.rainBarrelPlan[1],
      opinionEvidenceDeskSentenceIds.rainBarrelPlan[6],
    ],
    otherDetailIds: [
      opinionEvidenceDeskSentenceIds.rainBarrelPlan[7],
      opinionEvidenceDeskSentenceIds.rainBarrelPlan[8],
    ],
    reviewStatus: 'DRAFT',
    contentVersion: opinionEvidenceDeskContentVersion,
  },
]
