import type { TextFeatureGuide } from '../../../contentPackTypes'
import { TEXT_FEATURE_HUNT_CONTENT_VERSION, TEXT_FEATURE_HUNT_FEATURE_IDS, TEXT_FEATURE_HUNT_PASSAGE_IDS, TEXT_FEATURE_HUNT_PASSAGE_KEYS, textFeatureHuntSentenceId } from './ids'

export const textFeatureHuntTextFeatureGuides: readonly TextFeatureGuide[] = [
  {
    passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.feederWatch,
    featureContributions: [
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.title,
        featureKind: 'title',
        contributionStatement: 'The title previews that the passage is about counting birds at a feeder.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.headingCount,
        featureKind: 'heading',
        contributionStatement: 'The first heading tells the reader this section is about counting the visitors.',
        relatedSentenceIds: [
          textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 1),
          textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 2),
        ],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.graph,
        featureKind: 'graph',
        contributionStatement: 'The graph organizes the bird counts so the reader can compare which bird appears most often.',
        relatedSentenceIds: [
          textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 2),
          textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 3),
        ],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.caption,
        featureKind: 'caption',
        contributionStatement: 'The caption explains what the tallest blue bar means for the bird count.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 3)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.headingMeaning,
        featureKind: 'heading',
        contributionStatement: 'The second heading points the reader to the word that helps explain the graph details.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 4)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.feederWatch.glossary,
        featureKind: 'glossary',
        contributionStatement: 'The glossary defines observe so the reader understands the careful watching in the passage.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.feederWatch, 4)],
      },
    ],
    combinedFeatureExplanation: 'Together, the title, graph, caption, heading, and glossary help the reader understand bird counts and the word observe.',
    reviewStatus: 'DRAFT',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
  },
  {
    passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.gardenGrid,
    featureContributions: [
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.title,
        featureKind: 'title',
        contributionStatement: 'The title previews that the passage will help readers find places in the garden.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.headingMap,
        featureKind: 'heading',
        contributionStatement: 'The first heading tells the reader to look for places on the map.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.map,
        featureKind: 'map',
        contributionStatement: 'The map shows where the bean bed, compost bin, and watering shelf are located.',
        relatedSentenceIds: [
          textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 1),
          textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 2),
        ],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.caption,
        featureKind: 'caption',
        contributionStatement: 'The caption adds the detail that readers should start near the sunny corner.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 3)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.headingWord,
        featureKind: 'heading',
        contributionStatement: 'The second heading tells the reader to study the plant picture closely.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 4)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.gardenGrid.illustration,
        featureKind: 'illustration',
        contributionStatement: 'The illustration helps the reader picture the bean plant and its trellis support.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.gardenGrid, 4)],
      },
    ],
    combinedFeatureExplanation: 'The map and illustration work with the headings to help readers locate parts of the garden and picture the bean plant.',
    reviewStatus: 'DRAFT',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
  },
  {
    passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.rainGauge,
    featureContributions: [
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.title,
        featureKind: 'title',
        contributionStatement: 'The title previews that the passage is about rain notes from a storm.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.headingGraph,
        featureKind: 'heading',
        contributionStatement: 'The first heading tells the reader this section is about measuring the storm.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.graph,
        featureKind: 'graph',
        contributionStatement: 'The graph organizes the rainfall amounts so the reader can compare the days.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 2)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.caption,
        featureKind: 'caption',
        contributionStatement: 'The caption explains that taller bars mean more rain on that day.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 3)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.headingGlossary,
        featureKind: 'heading',
        contributionStatement: 'The second heading tells the reader that a glossary word will help explain the measurement.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 4)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.rainGauge.glossary,
        featureKind: 'glossary',
        contributionStatement: 'The glossary defines millimeter so the reader understands the rain measurement.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.rainGauge, 4)],
      },
    ],
    combinedFeatureExplanation: 'The title, graph, caption, and glossary help readers understand how the class measured rain after the storm.',
    reviewStatus: 'DRAFT',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
  },
  {
    passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.trailMap,
    featureContributions: [
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.title,
        featureKind: 'title',
        contributionStatement: 'The title previews a trail at a nature center.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.headingMap,
        featureKind: 'heading',
        contributionStatement: 'The first heading tells the reader to read the map carefully.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.map,
        featureKind: 'map',
        contributionStatement: 'The map shows where the pond, oak tree, and overlook are on the trail.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 2)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.caption,
        featureKind: 'caption',
        contributionStatement: 'The caption adds the detail that the dashed line marks the walking route.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 3)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.headingIllustration,
        featureKind: 'heading',
        contributionStatement: 'The second heading tells the reader to look closely at the picture details.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 4)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.trailMap.illustration,
        featureKind: 'illustration',
        contributionStatement: 'The illustration helps the reader picture the trail sign and pond reeds.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.trailMap, 4)],
      },
    ],
    combinedFeatureExplanation: 'The map, caption, and illustration help readers follow the trail and understand the route word.',
    reviewStatus: 'DRAFT',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
  },
  {
    passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.moonNotes,
    featureContributions: [
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.title,
        featureKind: 'title',
        contributionStatement: 'The title previews a log of moon shapes across the week.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.headingGraph,
        featureKind: 'heading',
        contributionStatement: 'The first heading tells the reader the passage is organized by nights.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.graph,
        featureKind: 'graph',
        contributionStatement: 'The graph organizes the moon shapes so the reader can compare the changes across the week.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 2)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.caption,
        featureKind: 'caption',
        contributionStatement: 'The caption explains what the tallest bar means in the moon graph.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 3)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.headingGlossary,
        featureKind: 'heading',
        contributionStatement: 'The second heading points the reader toward the word that explains careful watching.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 4)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.moonNotes.glossary,
        featureKind: 'glossary',
        contributionStatement: 'The glossary defines observe so the reader knows the careful-watching meaning.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.moonNotes, 4)],
      },
    ],
    combinedFeatureExplanation: 'The title, graph, caption, and glossary help readers follow moon changes and understand the word observe.',
    reviewStatus: 'DRAFT',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
  },
  {
    passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.recycleSort,
    featureContributions: [
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.title,
        featureKind: 'title',
        contributionStatement: 'The title previews the sorting work the class does after lunch.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.headingGraph,
        featureKind: 'heading',
        contributionStatement: 'The first heading tells the reader the section will count the bins.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.graph,
        featureKind: 'graph',
        contributionStatement: 'The graph organizes the recycling counts so the reader can compare which bin filled fastest.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 2)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.caption,
        featureKind: 'caption',
        contributionStatement: 'The caption points to the tallest bar and names the paper bin.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 3)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.headingIllustration,
        featureKind: 'heading',
        contributionStatement: 'The second heading tells the reader to study the labels in the picture.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 4)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.recycleSort.illustration,
        featureKind: 'illustration',
        contributionStatement: 'The illustration helps the reader picture the bin lids, arrows, and helper gloves.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.recycleSort, 4)],
      },
    ],
    combinedFeatureExplanation: 'The graph, caption, and illustration help readers understand how the class sorted the recycling bins.',
    reviewStatus: 'DRAFT',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
  },
  {
    passageId: TEXT_FEATURE_HUNT_PASSAGE_IDS.compostChange,
    featureContributions: [
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.title,
        featureKind: 'title',
        contributionStatement: 'The title previews how compost changes in the garden.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.headingMap,
        featureKind: 'heading',
        contributionStatement: 'The first heading tells the reader this section is about where the compost stays.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 1)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.map,
        featureKind: 'map',
        contributionStatement: 'The map shows where the compost bin sits beside the herb bed and hose hook.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 2)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.caption,
        featureKind: 'caption',
        contributionStatement: 'The caption explains that the shaded spot keeps the bin cool.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 3)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.headingIllustration,
        featureKind: 'heading',
        contributionStatement: 'The second heading points the reader toward the word that explains the garden change.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 4)],
      },
      {
        featureId: TEXT_FEATURE_HUNT_FEATURE_IDS.compostChange.glossary,
        featureKind: 'glossary',
        contributionStatement: 'The glossary defines compost so the reader understands the material in the bin.',
        relatedSentenceIds: [textFeatureHuntSentenceId(TEXT_FEATURE_HUNT_PASSAGE_KEYS.compostChange, 4)],
      },
    ],
    combinedFeatureExplanation: 'The map, caption, and glossary help readers understand where compost stays and what compost means.',
    reviewStatus: 'DRAFT',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
  },
]

