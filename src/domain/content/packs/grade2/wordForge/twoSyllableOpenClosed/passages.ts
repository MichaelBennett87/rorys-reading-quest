import type { Passage, WordSupportChunk, WordSupportPart } from '../../../../types'
import { TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION, TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS } from './ids'

const draftStatus = 'DRAFT' as const

interface SentenceSpec {
  sentenceId: string
  text: string
}

interface TargetSpec {
  targetId: string
  sentenceId: string
  surfaceWord: string
  firstChunk: string
  secondChunk: string
  spokenFirst?: string
  spokenSecond?: string
}

interface PassageSpec {
  passageIdentifier: string
  readingContext: string
  sentences: SentenceSpec[]
  targets: TargetSpec[]
}

function sentence(sentenceId: string, text: string): SentenceSpec {
  return { sentenceId, text }
}

function chunk(displayText: string, speechText: string = displayText): WordSupportChunk {
  return { displayText, speechText }
}

function part(text: string, emphasis = false): WordSupportPart {
  return { text, emphasis }
}

function buildPassage(spec: PassageSpec): Passage {
  const sentenceLookup = new Map(spec.sentences.map((entry) => [entry.sentenceId, entry.text]))
  return {
    passageIdentifier: spec.passageIdentifier,
    gradeBand: 2,
    passageText: spec.sentences.map((entry) => entry.text).join(' '),
    sentences: spec.sentences,
    readingContext: spec.readingContext,
    contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
    reviewStatus: draftStatus,
    wordSupportTargets: spec.targets.map((target) => {
      const sentenceText = sentenceLookup.get(target.sentenceId) ?? ''
      return {
        targetId: target.targetId,
        passageId: spec.passageIdentifier,
        sentenceId: target.sentenceId,
        surfaceWord: target.surfaceWord,
        focusParts: [part(target.firstChunk, true), part(target.secondChunk)],
        displayChunks: [chunk(target.firstChunk), chunk(target.secondChunk)],
        spokenChunks: [
          chunk(target.spokenFirst ?? target.firstChunk),
          chunk(target.spokenSecond ?? target.secondChunk),
        ],
        blendSpeechText: target.surfaceWord,
        wholeWordSpeechText: target.surfaceWord,
        sentenceSpeechText: sentenceText,
        reviewStatus: draftStatus,
        contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
      }
    }),
  }
}

const passages: PassageSpec[] = [
  {
    passageIdentifier: TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.rabbitHabitat,
    readingContext: 'Rabbit habitat word study with closed syllables.',
    sentences: [
      sentence('rabbit-habitat-1', 'The rabbit sat in a basket near the cabin.'),
      sentence('rabbit-habitat-2', 'A kitten slept on a napkin by the window.'),
      sentence('rabbit-habitat-3', 'Mia checked a magnet and a helmet before lunch.'),
      sentence('rabbit-habitat-4', 'They packed a picnic at sunset.'),
    ],
    targets: [
      { targetId: 'g2-syllable-summit-p1-rabbit', sentenceId: 'rabbit-habitat-1', surfaceWord: 'rabbit', firstChunk: 'rab', secondChunk: 'bit' },
      { targetId: 'g2-syllable-summit-p1-basket', sentenceId: 'rabbit-habitat-1', surfaceWord: 'basket', firstChunk: 'bas', secondChunk: 'ket' },
      { targetId: 'g2-syllable-summit-p1-kitten', sentenceId: 'rabbit-habitat-2', surfaceWord: 'kitten', firstChunk: 'kit', secondChunk: 'ten' },
      { targetId: 'g2-syllable-summit-p1-napkin', sentenceId: 'rabbit-habitat-2', surfaceWord: 'napkin', firstChunk: 'nap', secondChunk: 'kin' },
    ],
  },
  {
    passageIdentifier: TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.robotExhibit,
    readingContext: 'Robot exhibit word study with open syllables.',
    sentences: [
      sentence('robot-exhibit-1', 'The robot stood on an open stage at the exhibit.'),
      sentence('robot-exhibit-2', 'A pilot played music while the model spun.'),
      sentence('robot-exhibit-3', 'The photo card showed a zero beside a solar unit.'),
      sentence('robot-exhibit-4', 'The class watched the robot roll slowly.'),
    ],
    targets: [
      { targetId: 'g2-syllable-summit-p2-robot', sentenceId: 'robot-exhibit-1', surfaceWord: 'robot', firstChunk: 'ro', secondChunk: 'bot' },
      { targetId: 'g2-syllable-summit-p2-pilot', sentenceId: 'robot-exhibit-2', surfaceWord: 'pilot', firstChunk: 'pi', secondChunk: 'lot' },
      { targetId: 'g2-syllable-summit-p2-music', sentenceId: 'robot-exhibit-2', surfaceWord: 'music', firstChunk: 'mu', secondChunk: 'sic' },
      { targetId: 'g2-syllable-summit-p2-zero', sentenceId: 'robot-exhibit-3', surfaceWord: 'zero', firstChunk: 'ze', secondChunk: 'ro' },
    ],
  },
  {
    passageIdentifier: TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.picnicPlanning,
    readingContext: 'Picnic planning word study with closed syllables.',
    sentences: [
      sentence('picnic-planning-1', 'The picnic team spread a blanket by the sunset tree.'),
      sentence('picnic-planning-2', 'They packed a basket, a napkin, and a magnet chart.'),
      sentence('picnic-planning-3', 'A helmet rested on a chair near the lunch plan.'),
      sentence('picnic-planning-4', 'The rabbit waited near the gate.'),
    ],
    targets: [
      { targetId: 'g2-syllable-summit-p3-picnic', sentenceId: 'picnic-planning-1', surfaceWord: 'picnic', firstChunk: 'pic', secondChunk: 'nic' },
      { targetId: 'g2-syllable-summit-p3-sunset', sentenceId: 'picnic-planning-1', surfaceWord: 'sunset', firstChunk: 'sun', secondChunk: 'set' },
      { targetId: 'g2-syllable-summit-p3-magnet', sentenceId: 'picnic-planning-2', surfaceWord: 'magnet', firstChunk: 'mag', secondChunk: 'net' },
      { targetId: 'g2-syllable-summit-p3-helmet', sentenceId: 'picnic-planning-3', surfaceWord: 'helmet', firstChunk: 'hel', secondChunk: 'met' },
    ],
  },
  {
    passageIdentifier: TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.musicRoom,
    readingContext: 'Music room word study with open syllables.',
    sentences: [
      sentence('music-room-1', 'In the music room, the robot kept a steady beat.'),
      sentence('music-room-2', 'The tulip poster hung near a solo chair.'),
      sentence('music-room-3', 'A photo of the zero sign stayed on the wall.'),
      sentence('music-room-4', 'The pilot brought a model plane.'),
    ],
    targets: [
      { targetId: 'g2-syllable-summit-p4-music', sentenceId: 'music-room-1', surfaceWord: 'music', firstChunk: 'mu', secondChunk: 'sic' },
      { targetId: 'g2-syllable-summit-p4-tulip', sentenceId: 'music-room-2', surfaceWord: 'tulip', firstChunk: 'tu', secondChunk: 'lip' },
      { targetId: 'g2-syllable-summit-p4-solo', sentenceId: 'music-room-2', surfaceWord: 'solo', firstChunk: 'so', secondChunk: 'lo' },
      { targetId: 'g2-syllable-summit-p4-photo', sentenceId: 'music-room-3', surfaceWord: 'photo', firstChunk: 'pho', secondChunk: 'to' },
    ],
  },
  {
    passageIdentifier: TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.tulipGarden,
    readingContext: 'Tulip garden word study with mixed syllables.',
    sentences: [
      sentence('tulip-garden-1', 'At the tulip garden, the pilot read a map by the open gate.'),
      sentence('tulip-garden-2', 'The rabbit hid beside a basket of seeds.'),
      sentence('tulip-garden-3', 'A magnet held the photo card on the board.'),
      sentence('tulip-garden-4', 'The team wrote a note about the sunset.'),
    ],
    targets: [
      { targetId: 'g2-syllable-summit-p5-tulip', sentenceId: 'tulip-garden-1', surfaceWord: 'tulip', firstChunk: 'tu', secondChunk: 'lip' },
      { targetId: 'g2-syllable-summit-p5-pilot', sentenceId: 'tulip-garden-1', surfaceWord: 'pilot', firstChunk: 'pi', secondChunk: 'lot' },
      { targetId: 'g2-syllable-summit-p5-magnet', sentenceId: 'tulip-garden-3', surfaceWord: 'magnet', firstChunk: 'mag', secondChunk: 'net' },
      { targetId: 'g2-syllable-summit-p5-sunset', sentenceId: 'tulip-garden-4', surfaceWord: 'sunset', firstChunk: 'sun', secondChunk: 'set' },
    ],
  },
  {
    passageIdentifier: TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.pilotWeatherLog,
    readingContext: 'Pilot weather log word study with mixed syllables.',
    sentences: [
      sentence('pilot-weather-log-1', 'The pilot wrote a weather log in the cabin.'),
      sentence('pilot-weather-log-2', 'A robot checked the model plane and the music timer.'),
      sentence('pilot-weather-log-3', 'The photo showed a zero on the board.'),
      sentence('pilot-weather-log-4', 'A kitten sat on the napkin near the basket.'),
    ],
    targets: [
      { targetId: 'g2-syllable-summit-p6-pilot', sentenceId: 'pilot-weather-log-1', surfaceWord: 'pilot', firstChunk: 'pi', secondChunk: 'lot' },
      { targetId: 'g2-syllable-summit-p6-robot', sentenceId: 'pilot-weather-log-2', surfaceWord: 'robot', firstChunk: 'ro', secondChunk: 'bot' },
      { targetId: 'g2-syllable-summit-p6-photo', sentenceId: 'pilot-weather-log-3', surfaceWord: 'photo', firstChunk: 'pho', secondChunk: 'to' },
      { targetId: 'g2-syllable-summit-p6-napkin', sentenceId: 'pilot-weather-log-4', surfaceWord: 'napkin', firstChunk: 'nap', secondChunk: 'kin' },
    ],
  },
  {
    passageIdentifier: TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.photoDisplay,
    readingContext: 'Photo display word study with mixed syllables.',
    sentences: [
      sentence('photo-display-1', 'The photo display opened beside the music room.'),
      sentence('photo-display-2', 'A robot and a tulip shared the stage.'),
      sentence('photo-display-3', 'The rabbit and the basket stayed by the wall.'),
      sentence('photo-display-4', 'The class clapped for the solo turn.'),
    ],
    targets: [
      { targetId: 'g2-syllable-summit-p7-photo', sentenceId: 'photo-display-1', surfaceWord: 'photo', firstChunk: 'pho', secondChunk: 'to' },
      { targetId: 'g2-syllable-summit-p7-robot', sentenceId: 'photo-display-2', surfaceWord: 'robot', firstChunk: 'ro', secondChunk: 'bot' },
      { targetId: 'g2-syllable-summit-p7-rabbit', sentenceId: 'photo-display-3', surfaceWord: 'rabbit', firstChunk: 'rab', secondChunk: 'bit' },
      { targetId: 'g2-syllable-summit-p7-solo', sentenceId: 'photo-display-4', surfaceWord: 'solo', firstChunk: 'so', secondChunk: 'lo' },
    ],
  },
]

export const grade2WordForgeTwoSyllableOpenClosedPassages = passages.map(buildPassage)
