import type { ThemeGuide } from '../../../contentPackTypes'
import {
  THEME_TRAIL_CONTENT_VERSION,
  THEME_TRAIL_PASSAGE_KEYS,
  THEME_TRAIL_PASSAGE_IDS,
  themeTrailSentenceId,
} from './ids'

function themeGuide(spec: Omit<ThemeGuide, 'reviewStatus' | 'contentVersion'>): ThemeGuide {
  return {
    ...spec,
    reviewStatus: 'DRAFT',
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
  }
}

export const themeTrailThemeGuides: ThemeGuide[] = [
  themeGuide({
    passageId: THEME_TRAIL_PASSAGE_IDS.gardenHelp,
    topicLabel: 'asking for help',
    bestSupportedTheme: 'Asking for help can make a hard task easier.',
    supportingSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.gardenHelp, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.gardenHelp, 4),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.gardenHelp, 5),
    ],
    characterActionSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.gardenHelp, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.gardenHelp, 4),
    ],
    importantEventSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.gardenHelp, 4),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.gardenHelp, 5),
    ],
    outcomeSentenceId: themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.gardenHelp, 5),
    topicDistractor: 'fixing the welcome sign',
    summaryDistractor: 'Tia fixed the welcome sign before the seed swap began.',
  }),
  themeGuide({
    passageId: THEME_TRAIL_PASSAGE_IDS.libraryPause,
    topicLabel: 'sorting books',
    bestSupportedTheme: 'Being patient can help someone notice important details.',
    supportingSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.libraryPause, 2),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.libraryPause, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.libraryPause, 4),
    ],
    characterActionSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.libraryPause, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.libraryPause, 4),
    ],
    importantEventSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.libraryPause, 4),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.libraryPause, 5),
    ],
    outcomeSentenceId: themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.libraryPause, 5),
    topicDistractor: 'the rainy afternoon at the library',
    summaryDistractor: 'Nia sorted books at the library after school.',
  }),
  themeGuide({
    passageId: THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
    topicLabel: 'telling the truth',
    bestSupportedTheme: 'Telling the truth helps people solve problems together.',
    supportingSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.hallwayTruth, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.hallwayTruth, 4),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.hallwayTruth, 5),
    ],
    characterActionSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.hallwayTruth, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.hallwayTruth, 4),
    ],
    importantEventSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.hallwayTruth, 4),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.hallwayTruth, 5),
    ],
    outcomeSentenceId: themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.hallwayTruth, 5),
    topicDistractor: 'the paint jar spill',
    summaryDistractor: 'Marco found a paint jar and helped fix the mural.',
  }),
  themeGuide({
    passageId: THEME_TRAIL_PASSAGE_IDS.springFair,
    topicLabel: 'getting ready for the fair',
    bestSupportedTheme: 'Preparing carefully can prevent a larger problem.',
    supportingSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.springFair, 2),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.springFair, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.springFair, 4),
    ],
    characterActionSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.springFair, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.springFair, 4),
    ],
    importantEventSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.springFair, 4),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.springFair, 5),
    ],
    outcomeSentenceId: themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.springFair, 5),
    topicDistractor: 'the spring fair plans',
    summaryDistractor: 'Lila packed the seed table before the rain came.',
  }),
  themeGuide({
    passageId: THEME_TRAIL_PASSAGE_IDS.modelBridge,
    topicLabel: 'building a model bridge',
    bestSupportedTheme: 'Working together lets people use different strengths.',
    supportingSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.modelBridge, 2),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.modelBridge, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.modelBridge, 5),
    ],
    characterActionSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.modelBridge, 2),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.modelBridge, 4),
    ],
    importantEventSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.modelBridge, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.modelBridge, 5),
    ],
    outcomeSentenceId: themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.modelBridge, 5),
    topicDistractor: 'the science club table',
    summaryDistractor: 'Omar and Jun built a bridge and smiled at the end.',
  }),
  themeGuide({
    passageId: THEME_TRAIL_PASSAGE_IDS.birdhousePlan,
    topicLabel: 'hanging a birdhouse',
    bestSupportedTheme: 'Trying a new plan can help when the first plan does not work.',
    supportingSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.birdhousePlan, 2),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.birdhousePlan, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.birdhousePlan, 5),
    ],
    characterActionSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.birdhousePlan, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.birdhousePlan, 4),
    ],
    importantEventSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.birdhousePlan, 2),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.birdhousePlan, 4),
    ],
    outcomeSentenceId: themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.birdhousePlan, 5),
    topicDistractor: 'the windy afternoon at the garden',
    summaryDistractor: 'Ava hung a birdhouse after changing her plan.',
  }),
  themeGuide({
    passageId: THEME_TRAIL_PASSAGE_IDS.bookSwapTrust,
    topicLabel: 'returning a library book',
    bestSupportedTheme: 'Taking responsibility can help rebuild trust.',
    supportingSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust, 4),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust, 5),
    ],
    characterActionSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust, 3),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust, 4),
    ],
    importantEventSentenceIds: [
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust, 4),
      themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust, 5),
    ],
    outcomeSentenceId: themeTrailSentenceId(THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust, 5),
    topicDistractor: 'the classroom book swap',
    summaryDistractor: 'Eli returned a book and helped sort the shelf.',
  }),
]
