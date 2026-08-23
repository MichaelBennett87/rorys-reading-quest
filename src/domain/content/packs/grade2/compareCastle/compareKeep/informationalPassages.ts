import type { Passage, WordSupportTarget } from '../../../../types'
import { buildInformationalPassage, type InformationalPassagePlan, type SentencePlan } from './textBuilders'
import { COMPARE_KEEP_PASSAGE_IDS } from './ids'

const makeSentence = (sentenceId: string, text: string): SentencePlan => ({ sentenceId, text })

const informationalPlans: readonly InformationalPassagePlan[] = [
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.informationalA,
    titleFeatureId: 'ck-info-1-title',
    titleText: 'How Some Seeds Ride on Fur',
    sections: [
      {
        sectionId: 'ck-info-1-section-1',
        headingFeatureId: 'ck-info-1-head-1',
        headingText: 'Clinging to animals',
        sentenceIndexes: [0, 1, 2],
      },
      {
        sectionId: 'ck-info-1-section-2',
        headingFeatureId: 'ck-info-1-head-2',
        headingText: 'Moving to a new place',
        sentenceIndexes: [3, 4, 5],
      },
    ],
    sentences: [
      makeSentence('ck-info-1-s1', 'Some seeds travel when they cling to fur, feathers, or clothing.'),
      makeSentence('ck-info-1-s2', 'Their hooks or sticky coats catch on a walking animal.'),
      makeSentence('ck-info-1-s3', 'The animal does not plan the trip, but the seed still gets a ride.'),
      makeSentence('ck-info-1-s4', 'Later, the seed rubs off near soil and starts a new plant home.'),
      makeSentence('ck-info-1-s5', 'This process helps plants spread without growing beside the parent plant.'),
      makeSentence('ck-info-1-s6', 'A single seed can make a long trip without using wind or water.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 0, surfaceWord: 'cling', chunks: ['cli', 'ng'] },
      { sentenceIndex: 4, surfaceWord: 'process', chunks: ['pro', 'cess'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.informationalB,
    titleFeatureId: 'ck-info-2-title',
    titleText: 'How Seeds Move in Wind and Water',
    sections: [
      {
        sectionId: 'ck-info-2-section-1',
        headingFeatureId: 'ck-info-2-head-1',
        headingText: 'Wind carries light seeds',
        sentenceIndexes: [0, 1, 2],
      },
      {
        sectionId: 'ck-info-2-section-2',
        headingFeatureId: 'ck-info-2-head-2',
        headingText: 'Water moves floating seeds',
        sentenceIndexes: [3, 4, 5],
      },
    ],
    sentences: [
      makeSentence('ck-info-2-s1', 'Some seeds travel when the wind lifts their fluffy parts.'),
      makeSentence('ck-info-2-s2', 'A breeze can carry the seeds across a field or over a fence.'),
      makeSentence('ck-info-2-s3', 'Other seeds float in water after rain or a stream wash.'),
      makeSentence('ck-info-2-s4', 'The moving water pushes them to a new bank or shore.'),
      makeSentence('ck-info-2-s5', 'Each travel method helps the plant find fresh soil.'),
      makeSentence('ck-info-2-s6', 'These tiny travelers do not move the same way, but both can spread plants.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 0, surfaceWord: 'wind', chunks: ['w', 'ind'] },
      { sentenceIndex: 4, surfaceWord: 'fresh', chunks: ['fre', 'sh'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.informationalC,
    titleFeatureId: 'ck-info-3-title',
    titleText: 'A Rain Gauge on the Playground',
    sections: [
      {
        sectionId: 'ck-info-3-section-1',
        headingFeatureId: 'ck-info-3-head-1',
        headingText: 'Setting up the gauge',
        sentenceIndexes: [0, 1, 2],
      },
      {
        sectionId: 'ck-info-3-section-2',
        headingFeatureId: 'ck-info-3-head-2',
        headingText: 'Reading the water line',
        sentenceIndexes: [3, 4, 5],
      },
    ],
    sentences: [
      makeSentence('ck-info-3-s1', 'A rain gauge is a clear cup that helps people measure how much rain falls.'),
      makeSentence('ck-info-3-s2', 'The cup must stay on level ground so the reading stays fair.'),
      makeSentence('ck-info-3-s3', 'A helper checks it after the storm and writes down the amount.'),
      makeSentence('ck-info-3-s4', 'The water line shows whether the day had a little rain or a lot of rain.'),
      makeSentence('ck-info-3-s5', 'The observation helps the class notice patterns in the weather.'),
      makeSentence('ck-info-3-s6', 'Even a small shower can give the class a useful result.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 0, surfaceWord: 'measure', chunks: ['mea', 'sure'] },
      { sentenceIndex: 4, surfaceWord: 'observation', chunks: ['obser', 'vation'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.informationalD,
    titleFeatureId: 'ck-info-4-title',
    titleText: 'Weather Shelters and Tools',
    sections: [
      {
        sectionId: 'ck-info-4-section-1',
        headingFeatureId: 'ck-info-4-head-1',
        headingText: 'A small weather shelter',
        sentenceIndexes: [0, 1, 2],
      },
      {
        sectionId: 'ck-info-4-section-2',
        headingFeatureId: 'ck-info-4-head-2',
        headingText: 'Notes from each tool',
        sentenceIndexes: [3, 4, 5],
      },
    ],
    sentences: [
      makeSentence('ck-info-4-s1', 'A weather shelter protects tools from sun, rain, and wind.'),
      makeSentence('ck-info-4-s2', 'Inside the shelter, a teacher keeps notebooks and pencils dry.'),
      makeSentence('ck-info-4-s3', 'A wind sock hangs nearby so the class can see the breeze move.'),
      makeSentence('ck-info-4-s4', 'The class gathered careful notes after each observation.'),
      makeSentence('ck-info-4-s5', 'Those notes help the students compare one day with the next.'),
      makeSentence('ck-info-4-s6', 'The shelter and the sock work together to keep weather study organized.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 0, surfaceWord: 'shelter', chunks: ['shel', 'ter'] },
      { sentenceIndex: 3, surfaceWord: 'organized', chunks: ['organ', 'ized'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.informationalE,
    titleFeatureId: 'ck-info-5-title',
    titleText: 'Pond Layers and Living Things',
    sections: [
      {
        sectionId: 'ck-info-5-section-1',
        headingFeatureId: 'ck-info-5-head-1',
        headingText: 'Near the water edge',
        sentenceIndexes: [0, 1, 2],
      },
      {
        sectionId: 'ck-info-5-section-2',
        headingFeatureId: 'ck-info-5-head-2',
        headingText: 'Roots beside the pond',
        sentenceIndexes: [3, 4, 5],
      },
    ],
    sentences: [
      makeSentence('ck-info-5-s1', 'Reeds and other pond plants grow along shallow, muddy edges.'),
      makeSentence('ck-info-5-s2', 'Their roots spread through the wet soil near the bank.'),
      makeSentence('ck-info-5-s3', 'The plants give shelter to small animals near the bank.'),
      makeSentence('ck-info-5-s4', 'Their roots help the muddy soil stay in place when water moves.'),
      makeSentence('ck-info-5-s5', 'This support keeps the soil from drifting away.'),
      makeSentence('ck-info-5-s6', 'Pond-edge roots help plants, animals, and soil stay supported.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 2, surfaceWord: 'shelter', chunks: ['shel', 'ter'] },
      { sentenceIndex: 4, surfaceWord: 'drifting', chunks: ['drift', 'ing'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.informationalF,
    titleFeatureId: 'ck-info-6-title',
    titleText: 'Roots in a Garden Bed',
    sections: [
      {
        sectionId: 'ck-info-6-section-1',
        headingFeatureId: 'ck-info-6-head-1',
        headingText: 'What roots do underground',
        sentenceIndexes: [0, 1, 2],
      },
      {
        sectionId: 'ck-info-6-section-2',
        headingFeatureId: 'ck-info-6-head-2',
        headingText: 'Why the soil stays strong',
        sentenceIndexes: [3, 4, 5],
      },
    ],
    sentences: [
      makeSentence('ck-info-6-s1', 'Plant roots push into soil and spread in many directions.'),
      makeSentence('ck-info-6-s2', 'The roots gather water and hold the plant steady.'),
      makeSentence('ck-info-6-s3', 'They also help the soil stay in place after heavy rain.'),
      makeSentence('ck-info-6-s4', 'Without roots, the ground can move and wash away more quickly.'),
      makeSentence('ck-info-6-s5', 'The plant uses this hidden support to keep growing upright.'),
      makeSentence('ck-info-6-s6', 'Garden roots help both the plant and the soil stay steady.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 1, surfaceWord: 'gather', chunks: ['gath', 'er'] },
      { sentenceIndex: 4, surfaceWord: 'support', chunks: ['sup', 'port'] },
    ],
  },
]

export const compareKeepInformationalPassages: Passage[] = informationalPlans.map((plan) => buildInformationalPassage(plan))
export const compareKeepInformationalStructures = compareKeepInformationalPassages.map((passage) => passage.informationalStructure!)
export const compareKeepInformationalSupportTargets: WordSupportTarget[] = compareKeepInformationalPassages.flatMap((passage) => passage.wordSupportTargets ?? [])
