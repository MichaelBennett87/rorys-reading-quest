import type { ContentReviewStatus, PoemLine, PoemStanza, PoemStructure, Passage, WordSupportTarget } from '../../../../types'
import type { RhymeSchemeGuide, RhymeSchemeLineGuide } from '../../../contentPackTypes'
import {
  poetryLineId,
  poetryPassageId,
  poetryStanzaId,
  poetrySupportTargetId,
  RHYME_ROUTES_CONTENT_VERSION,
  RHYME_ROUTES_POEM_KEYS,
} from './ids'

interface PoemLineDefinition {
  lineNumber: number
  stanzaNumber: number
  text: string
  endWord: string
  rhymeKey: string
  rhymeLabel: string
}

interface PoemSupportTargetDefinition {
  targetKey: string
  lineNumber: number
  surfaceWord: string
  split: [string, string]
}

interface PoemDefinition {
  key: string
  title: string
  readingContext: string
  scheme: string
  lines: PoemLineDefinition[]
  stanzaLineNumbers: number[][]
  supportTargets: PoemSupportTargetDefinition[]
}

const REVIEW_STATUS: ContentReviewStatus = 'DRAFT'

const poemDefinitions: PoemDefinition[] = [
  {
    key: RHYME_ROUTES_POEM_KEYS.kiteDay,
    title: 'The Kite and the Day',
    readingContext: 'Poetry Planet rhyme routes',
    scheme: 'AABB',
    lines: [
      { lineNumber: 1, stanzaNumber: 1, text: 'I tied the kite for the day.', endWord: 'day', rhymeKey: 'ay-day', rhymeLabel: 'A' },
      { lineNumber: 2, stanzaNumber: 1, text: 'Then I sent it up to play.', endWord: 'play', rhymeKey: 'ay-day', rhymeLabel: 'A' },
      { lineNumber: 3, stanzaNumber: 1, text: 'I held the string in my hand.', endWord: 'hand', rhymeKey: 'and-hand', rhymeLabel: 'B' },
      { lineNumber: 4, stanzaNumber: 1, text: 'The kite danced high over the land.', endWord: 'land', rhymeKey: 'and-hand', rhymeLabel: 'B' },
    ],
    stanzaLineNumbers: [[1, 2, 3, 4]],
    supportTargets: [
      { targetKey: 'day', lineNumber: 1, surfaceWord: 'day', split: ['d', 'ay'] },
      { targetKey: 'play', lineNumber: 2, surfaceWord: 'play', split: ['pl', 'ay'] },
      { targetKey: 'hand', lineNumber: 3, surfaceWord: 'hand', split: ['h', 'and'] },
      { targetKey: 'land', lineNumber: 4, surfaceWord: 'land', split: ['l', 'and'] },
    ],
  },
  {
    key: RHYME_ROUTES_POEM_KEYS.gardenCare,
    title: 'Nia and the Garden',
    readingContext: 'Poetry Planet rhyme routes',
    scheme: 'AABBCC',
    lines: [
      { lineNumber: 1, stanzaNumber: 1, text: 'At dawn, the garden looked bare.', endWord: 'bare', rhymeKey: 'are-bare', rhymeLabel: 'A' },
      { lineNumber: 2, stanzaNumber: 1, text: 'Nia planted seeds with steady care.', endWord: 'care', rhymeKey: 'are-bare', rhymeLabel: 'A' },
      { lineNumber: 3, stanzaNumber: 1, text: 'She pressed each seed into the dirt.', endWord: 'dirt', rhymeKey: 'irt-dirt', rhymeLabel: 'B' },
      { lineNumber: 4, stanzaNumber: 2, text: 'Then she watered gently, not to hurt.', endWord: 'hurt', rhymeKey: 'irt-dirt', rhymeLabel: 'B' },
      { lineNumber: 5, stanzaNumber: 2, text: 'After some days, a small green sprout stood near.', endWord: 'near', rhymeKey: 'ear-near', rhymeLabel: 'C' },
      { lineNumber: 6, stanzaNumber: 2, text: 'Nia smiled because the sign was clear.', endWord: 'clear', rhymeKey: 'ear-near', rhymeLabel: 'C' },
    ],
    stanzaLineNumbers: [[1, 2, 3], [4, 5, 6]],
    supportTargets: [
      { targetKey: 'care', lineNumber: 2, surfaceWord: 'care', split: ['c', 'are'] },
      { targetKey: 'hurt', lineNumber: 4, surfaceWord: 'hurt', split: ['h', 'urt'] },
      { targetKey: 'near', lineNumber: 5, surfaceWord: 'near', split: ['n', 'ear'] },
      { targetKey: 'clear', lineNumber: 6, surfaceWord: 'clear', split: ['cl', 'ear'] },
    ],
  },
  {
    key: RHYME_ROUTES_POEM_KEYS.recycleSpin,
    title: 'The Recycle Bin',
    readingContext: 'Poetry Planet rhyme routes',
    scheme: 'ABAB',
    lines: [
      { lineNumber: 1, stanzaNumber: 1, text: 'Mara set the cans beside the bin.', endWord: 'bin', rhymeKey: 'in-bin', rhymeLabel: 'A' },
      { lineNumber: 2, stanzaNumber: 1, text: 'With a grin, she checked each label on the side.', endWord: 'side', rhymeKey: 'ide-side', rhymeLabel: 'B' },
      { lineNumber: 3, stanzaNumber: 1, text: 'She stacked the jars beside the tin.', endWord: 'tin', rhymeKey: 'in-bin', rhymeLabel: 'A' },
      { lineNumber: 4, stanzaNumber: 1, text: 'With a spin, the cart rolled on a gentle ride.', endWord: 'ride', rhymeKey: 'ide-side', rhymeLabel: 'B' },
    ],
    stanzaLineNumbers: [[1, 2, 3, 4]],
    supportTargets: [
      { targetKey: 'bin', lineNumber: 1, surfaceWord: 'bin', split: ['b', 'in'] },
      { targetKey: 'grin', lineNumber: 2, surfaceWord: 'grin', split: ['gr', 'in'] },
      { targetKey: 'tin', lineNumber: 3, surfaceWord: 'tin', split: ['t', 'in'] },
      { targetKey: 'spin', lineNumber: 4, surfaceWord: 'spin', split: ['sp', 'in'] },
    ],
  },
  {
    key: RHYME_ROUTES_POEM_KEYS.bridgeTool,
    title: 'Bridge Crew Notes',
    readingContext: 'Poetry Planet rhyme routes',
    scheme: 'ABCB',
    lines: [
      { lineNumber: 1, stanzaNumber: 1, text: 'The bridge crew brought bright boards from school to the site.', endWord: 'site', rhymeKey: 'ite-site', rhymeLabel: 'A' },
      { lineNumber: 2, stanzaNumber: 1, text: 'Tess checked each plank with a careful tool.', endWord: 'tool', rhymeKey: 'ool-tool', rhymeLabel: 'B' },
      { lineNumber: 3, stanzaNumber: 1, text: 'She marked the safe spots in a neat row.', endWord: 'row', rhymeKey: 'ow-row', rhymeLabel: 'C' },
      { lineNumber: 4, stanzaNumber: 1, text: 'Then Tess set the hammer beside a stool.', endWord: 'stool', rhymeKey: 'ool-tool', rhymeLabel: 'B' },
    ],
    stanzaLineNumbers: [[1, 2, 3, 4]],
    supportTargets: [
      { targetKey: 'school', lineNumber: 1, surfaceWord: 'school', split: ['sch', 'ool'] },
      { targetKey: 'tool', lineNumber: 2, surfaceWord: 'tool', split: ['t', 'ool'] },
      { targetKey: 'row', lineNumber: 3, surfaceWord: 'row', split: ['r', 'ow'] },
      { targetKey: 'hammer', lineNumber: 4, surfaceWord: 'hammer', split: ['ham', 'mer'] },
    ],
  },
  {
    key: RHYME_ROUTES_POEM_KEYS.helpGate,
    title: 'Help at the Gate',
    readingContext: 'Poetry Planet rhyme routes',
    scheme: 'AABB',
    lines: [
      { lineNumber: 1, stanzaNumber: 1, text: 'Ari forgot the map by the gate.', endWord: 'gate', rhymeKey: 'ate-gate', rhymeLabel: 'A' },
      { lineNumber: 2, stanzaNumber: 1, text: 'So Bea came back to help him wait.', endWord: 'wait', rhymeKey: 'ate-gate', rhymeLabel: 'A' },
      { lineNumber: 3, stanzaNumber: 1, text: 'They found the sign and fixed the rope.', endWord: 'rope', rhymeKey: 'ope-rope', rhymeLabel: 'B' },
      { lineNumber: 4, stanzaNumber: 1, text: 'Then both kids smiled with fresh new hope.', endWord: 'hope', rhymeKey: 'ope-rope', rhymeLabel: 'B' },
    ],
    stanzaLineNumbers: [[1, 2, 3, 4]],
    supportTargets: [
      { targetKey: 'gate', lineNumber: 1, surfaceWord: 'gate', split: ['g', 'ate'] },
      { targetKey: 'wait', lineNumber: 2, surfaceWord: 'wait', split: ['w', 'ait'] },
      { targetKey: 'rope', lineNumber: 3, surfaceWord: 'rope', split: ['r', 'ope'] },
      { targetKey: 'hope', lineNumber: 4, surfaceWord: 'hope', split: ['h', 'ope'] },
    ],
  },
  {
    key: RHYME_ROUTES_POEM_KEYS.weatherNotes,
    title: 'Weather Notes',
    readingContext: 'Poetry Planet rhyme routes',
    scheme: 'ABABCDCD',
    lines: [
      { lineNumber: 1, stanzaNumber: 1, text: 'Lena set the cups in a row.', endWord: 'row', rhymeKey: 'ow-row', rhymeLabel: 'A' },
      { lineNumber: 2, stanzaNumber: 1, text: 'She watched the slow cotton clouds change pace.', endWord: 'pace', rhymeKey: 'ace-pace', rhymeLabel: 'B' },
      { lineNumber: 3, stanzaNumber: 1, text: 'A fan made the paper flags blow.', endWord: 'blow', rhymeKey: 'ow-row', rhymeLabel: 'A' },
      { lineNumber: 4, stanzaNumber: 1, text: 'She nodded when each flag stayed in place.', endWord: 'place', rhymeKey: 'ace-pace', rhymeLabel: 'B' },
      { lineNumber: 5, stanzaNumber: 2, text: 'Then Omar held the chart up high.', endWord: 'high', rhymeKey: 'igh-high', rhymeLabel: 'C' },
      { lineNumber: 6, stanzaNumber: 2, text: 'He pointed to the bright red light.', endWord: 'light', rhymeKey: 'ight-light', rhymeLabel: 'D' },
      { lineNumber: 7, stanzaNumber: 2, text: 'They saw the clouds move across the sky.', endWord: 'sky', rhymeKey: 'igh-high', rhymeLabel: 'C' },
      { lineNumber: 8, stanzaNumber: 2, text: 'And wrote their notes by night.', endWord: 'night', rhymeKey: 'ight-light', rhymeLabel: 'D' },
    ],
    stanzaLineNumbers: [[1, 2, 3, 4], [5, 6, 7, 8]],
    supportTargets: [
      { targetKey: 'row', lineNumber: 1, surfaceWord: 'row', split: ['r', 'ow'] },
      { targetKey: 'slow', lineNumber: 2, surfaceWord: 'slow', split: ['sl', 'ow'] },
      { targetKey: 'light', lineNumber: 6, surfaceWord: 'light', split: ['l', 'ight'] },
      { targetKey: 'night', lineNumber: 8, surfaceWord: 'night', split: ['n', 'ight'] },
    ],
  },
  {
    key: RHYME_ROUTES_POEM_KEYS.stagePage,
    title: 'Stage Page',
    readingContext: 'Poetry Planet rhyme routes',
    scheme: 'ABCB',
    lines: [
      { lineNumber: 1, stanzaNumber: 1, text: 'Noah carried props across the stage for the show.', endWord: 'show', rhymeKey: 'ow-show', rhymeLabel: 'A' },
      { lineNumber: 2, stanzaNumber: 1, text: 'Iris read the plan on a page.', endWord: 'page', rhymeKey: 'age-page', rhymeLabel: 'B' },
      { lineNumber: 3, stanzaNumber: 2, text: 'She lined the costumes by the door.', endWord: 'door', rhymeKey: 'oor-door', rhymeLabel: 'C' },
      { lineNumber: 4, stanzaNumber: 2, text: 'Then Noah checked the props once more on the page.', endWord: 'page', rhymeKey: 'age-page', rhymeLabel: 'B' },
    ],
    stanzaLineNumbers: [[1, 2], [3, 4]],
    supportTargets: [
      { targetKey: 'stage', lineNumber: 1, surfaceWord: 'stage', split: ['st', 'age'] },
      { targetKey: 'page', lineNumber: 2, surfaceWord: 'page', split: ['p', 'age'] },
      { targetKey: 'door', lineNumber: 3, surfaceWord: 'door', split: ['d', 'oor'] },
      { targetKey: 'props', lineNumber: 4, surfaceWord: 'props', split: ['pr', 'ops'] },
    ],
  },
]

export interface RhymeRoutesPoemDefinition extends PoemDefinition {
  passageId: string
}

function buildSupportTarget(
  passageId: string,
  sentenceId: string,
  targetKey: string,
  surfaceWord: string,
  split: [string, string],
  sentenceText: string,
): WordSupportTarget {
  const [left, right] = split
  return {
    targetId: poetrySupportTargetId(passageId.replace(/^.*-passage-/, ''), targetKey),
    passageId,
    sentenceId,
    surfaceWord,
    focusParts: [
      { text: left, emphasis: false },
      { text: right, emphasis: true },
    ],
    displayChunks: [
      { displayText: left, speechText: left },
      { displayText: right, speechText: right },
    ],
    spokenChunks: [
      { displayText: left, speechText: left },
      { displayText: right, speechText: right },
    ],
    blendSpeechText: `${left}-${right}`,
    wholeWordSpeechText: surfaceWord,
    sentenceSpeechText: sentenceText,
    reviewStatus: REVIEW_STATUS,
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
  }
}

function toPassage(definition: PoemDefinition): Passage {
  const passageId = poetryPassageId(definition.key)
  const lines = definition.lines.map((line) => {
    const stanzaId = poetryStanzaId(definition.key, line.stanzaNumber)
    return {
      lineId: poetryLineId(definition.key, line.lineNumber),
      lineNumber: line.lineNumber,
      stanzaId,
      text: line.text,
    } satisfies PoemLine
  })
  const stanzas = definition.stanzaLineNumbers.map((lineNumbers, index) => ({
    stanzaId: poetryStanzaId(definition.key, index + 1),
    lineIds: lineNumbers.map((lineNumber) => poetryLineId(definition.key, lineNumber)),
  }) satisfies PoemStanza)

  return {
    passageIdentifier: passageId,
    gradeBand: 2,
    passageText: lines.map((line) => line.text).join('\n'),
    contentKind: 'poem',
    sentences: lines.map((line) => ({
      sentenceId: line.lineId,
      lineNumber: line.lineNumber,
      stanzaId: line.stanzaId,
      text: line.text,
    })),
    poemStructure: {
      lines,
      stanzas,
    } satisfies PoemStructure,
    readingContext: definition.readingContext,
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
    reviewStatus: REVIEW_STATUS,
    wordSupportTargets: definition.supportTargets.map((target) => {
      const line = lines.find((entry) => entry.lineNumber === target.lineNumber)!
      return buildSupportTarget(
        passageId,
        line.lineId,
        target.targetKey,
        target.surfaceWord,
        target.split,
        line.text,
      )
    }),
  }
}

function toRhymeSchemeGuide(definition: PoemDefinition): RhymeSchemeGuide {
  const lines = definition.lines.map((line) => {
    const lineId = poetryLineId(definition.key, line.lineNumber)
    return {
      lineId,
      endWord: line.endWord,
      rhymeKey: line.rhymeKey,
      rhymeLabel: line.rhymeLabel,
    } satisfies RhymeSchemeLineGuide
  })

  return {
    passageId: poetryPassageId(definition.key),
    scheme: definition.scheme,
    lines,
    reviewStatus: REVIEW_STATUS,
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
  }
}

export const rhymeRoutesPoemDefinitions: readonly RhymeRoutesPoemDefinition[] = poemDefinitions.map((definition) => ({
  ...definition,
  passageId: poetryPassageId(definition.key),
}))

export const rhymeRoutesPassages = rhymeRoutesPoemDefinitions.map((definition) => toPassage(definition))

export const rhymeRoutesRhymeSchemeGuides = rhymeRoutesPoemDefinitions.map((definition) => toRhymeSchemeGuide(definition))
