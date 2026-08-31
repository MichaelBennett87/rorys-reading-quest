import type { Passage, WordSupportTarget } from '../../../../types'
import type {
  MultisyllableDecodingGuide,
  MultisyllableDecodingTarget,
  MultisyllableMorphologicalHint,
  MultisyllablePatternLabel,
  RootSyllableChunk,
} from '../../../contentPackTypes'
import { multisyllableMountainContentVersion, multisyllableMountainPassageIds } from './ids'

interface ChunkSpec {
  displayText: string
  speechText: string
  pattern: MultisyllablePatternLabel
}

interface TargetSpec {
  word: string
  sentence: number
  chunks: ChunkSpec[]
  hints?: MultisyllableMorphologicalHint[]
  focusChunkIndex: number
}

interface PassageSpec {
  passageId: string
  context: string
  sentences: string[]
  targets: TargetSpec[]
}

export interface MultisyllableMountainPassageArtifact {
  passage: Passage
  guide: MultisyllableDecodingGuide
  targets: MultisyllableDecodingTarget[]
}

const c = (displayText: string, speechText: string, pattern: MultisyllablePatternLabel): ChunkSpec => ({ displayText, speechText, pattern })
const hint = (text: string, kind: MultisyllableMorphologicalHint['kind']): MultisyllableMorphologicalHint => ({ text, kind })

const passageSpecs: PassageSpec[] = [
  {
    passageId: multisyllableMountainPassageIds.trailStation,
    context: 'Read about a science station beside a mountain trail.',
    sentences: [
      'A class hiked to a small science station beside a safe mountain trail and unpacked tools for an afternoon study.',
      'Before sunset, the students recorded the length of each shadow beside the station fence.',
      'A wheeled robot carried a covered thermometer across a smooth section of the path.',
      'Bright sunshine warmed one side of a dark rock while the shaded side stayed cool.',
      'During a lakeside picnic, the class compared notes and marked the reading chunks in several longer words.',
      'They used compound boundaries, open syllables, closed syllables, and silent-e clues as flexible reading strategies.',
      'After reading each chunk, they blended the whole word and reread its sentence to make sure it fit.',
    ],
    targets: [
      target('sunset', 2, [c('sun', 'sun', 'closed'), c('set', 'set', 'closed')], 0, [hint('sun', 'compound-part'), hint('set', 'compound-part')]),
      target('robot', 3, [c('ro', 'roh', 'open'), c('bot', 'bot', 'closed')], 0),
      target('sunshine', 4, [c('sun', 'sun', 'closed'), c('shine', 'shyne', 'vowel-consonant-e')], 1, [hint('sun', 'compound-part'), hint('shine', 'compound-part')]),
      target('lakeside', 5, [c('lake', 'layk', 'vowel-consonant-e'), c('side', 'syd', 'vowel-consonant-e')], 0, [hint('lake', 'compound-part'), hint('side', 'compound-part')]),
    ],
  },
  {
    passageId: multisyllableMountainPassageIds.weatherTrip,
    context: 'Read about a class collecting weather observations on a short field trip.',
    sentences: [
      'A class visited a hilltop weather station to compare wind, clouds, and rainfall during one changing morning.',
      'Each student packed a raincoat because gray clouds were moving toward the hill.',
      'Nora clipped a paper chart to a board and wrote the first temperature beside the time.',
      'The forecast predicted a short shower followed by clearing skies near noon.',
      'The group felt hopeful when a bright strip of blue appeared above the western trees.',
      'They noticed that vowel teams, r-controlled chunks, silent-e chunks, and meaningful endings could all support decoding.',
      'No single split worked for every word, so the students checked their chunks by reading each complete sentence.',
    ],
    targets: [
      target('raincoat', 2, [c('rain', 'rayn', 'vowel-team'), c('coat', 'koht', 'vowel-team')], 0, [hint('rain', 'compound-part'), hint('coat', 'compound-part')]),
      target('paper', 3, [c('pa', 'pay', 'open'), c('per', 'per', 'r-controlled')], 1),
      target('forecast', 4, [c('fore', 'for', 'r-controlled'), c('cast', 'cast', 'closed')], 0, [hint('fore', 'compound-part'), hint('cast', 'compound-part')]),
      target('hopeful', 5, [c('hope', 'hope', 'vowel-consonant-e'), c('ful', 'fuhl', 'closed')], 0, [hint('hope', 'base'), hint('ful', 'suffix')]),
    ],
  },
  {
    passageId: multisyllableMountainPassageIds.gardenProject,
    context: 'Read about students planning and caring for a community garden.',
    sentences: [
      'Students helped a neighborhood team plan a garden with vegetables, flowers, and a path wide enough for a wagon.',
      'A small radio played quiet music while volunteers carried soil to the warm brick wall.',
      'One tall sunflower marked the corner between the herb bed and the tool shelf.',
      'The gardener showed the class how to loosen soil without disturbing a young root.',
      'After checking the beds, the group began replanting two seedlings that had outgrown their small pots.',
      'The readers compared meaningful parts such as re, plant, and ing with the syllable chunks used for pronunciation.',
      'They stayed flexible, blended every chunk, and reread each garden sentence as a final check.',
    ],
    targets: [
      target('radio', 2, [c('ra', 'ray', 'open'), c('di', 'dee', 'open'), c('o', 'oh', 'open')], 1),
      target('sunflower', 3, [c('sun', 'sun', 'closed'), c('flow', 'flow', 'vowel-team'), c('er', 'er', 'r-controlled')], 1, [hint('sun', 'compound-part'), hint('flower', 'compound-part')]),
      target('gardener', 4, [c('gar', 'gar', 'r-controlled'), c('den', 'den', 'closed'), c('er', 'er', 'r-controlled')], 0, [hint('garden', 'base'), hint('er', 'suffix')]),
      target('replanting', 5, [c('re', 'ree', 'open'), c('plant', 'plant', 'closed'), c('ing', 'ing', 'closed')], 0, [hint('re', 'prefix'), hint('plant', 'base'), hint('ing', 'suffix')]),
    ],
  },
  {
    passageId: multisyllableMountainPassageIds.wildlifeCenter,
    context: 'Read about a wildlife center preparing quiet spaces for recovering animals.',
    sentences: [
      'A wildlife center invited students to observe how trained workers prepare safe spaces for animals that need rest.',
      'The first animal was a raven resting in a covered pen near the back wall.',
      'A wooden shelter gave the rabbit a quiet place away from the busy hallway.',
      'A fearless worker calmly carried a padded box while another worker opened the gate.',
      'A turtle preparing to hibernate rested beneath dry leaves in a cool enclosure.',
      'The class used open, closed, vowel-team, r-controlled, and silent-e chunks to read each longer word.',
      'They blended the chunks and returned to the sentence instead of depending on one rigid division rule.',
    ],
    targets: [
      target('raven', 2, [c('ra', 'ray', 'open'), c('ven', 'ven', 'closed')], 0),
      target('shelter', 3, [c('shel', 'shel', 'closed'), c('ter', 'ter', 'r-controlled')], 1),
      target('fearless', 4, [c('fear', 'feer', 'vowel-team'), c('less', 'less', 'closed')], 0, [hint('fear', 'base'), hint('less', 'suffix')]),
      target('hibernate', 5, [c('hi', 'hy', 'open'), c('ber', 'ber', 'r-controlled'), c('nate', 'nayt', 'vowel-consonant-e')], 2),
    ],
  },
  {
    passageId: multisyllableMountainPassageIds.museumExpedition,
    context: 'Read about a museum expedition through an exhibit about Earth history.',
    sentences: [
      'The adventure club entered a museum gallery where each room presented clues about Earth long ago.',
      'A dinosaur model stretched above the first walkway, with its tail pointing toward a fossil display.',
      'A bright timeline showed when several plants and animals appeared in the exhibit story.',
      'Beside the model, a title card explained how museum workers protect fragile fossil pieces.',
      'At a sand table, students used soft brushes to uncover a copy of a buried shell.',
      'They treated compound parts and prefixes as helpful meaning boundaries, then chose different chunks for comfortable reading when needed.',
      'The group tested each whole word in its sentence and changed a split if the pronunciation did not sound right.',
    ],
    targets: [
      target('dinosaur', 2, [c('di', 'dye', 'open'), c('no', 'noh', 'open'), c('saur', 'sor', 'r-controlled')], 0),
      target('timeline', 3, [c('time', 'tyme', 'vowel-consonant-e'), c('line', 'lyne', 'vowel-consonant-e')], 0, [hint('time', 'compound-part'), hint('line', 'compound-part')]),
      target('title', 4, [c('ti', 'tye', 'open'), c('tle', 'tuhl', 'consonant-le')], 1),
      target('uncover', 5, [c('un', 'un', 'closed'), c('cov', 'kuhv', 'closed'), c('er', 'er', 'r-controlled')], 0, [hint('un', 'prefix'), hint('cover', 'base')]),
    ],
  },
  {
    passageId: multisyllableMountainPassageIds.engineeringChallenge,
    context: 'Read about a team testing models during an engineering challenge.',
    sentences: [
      'Teams gathered in the maker room for an engineering challenge that required careful planning and safe materials.',
      'One group tested a prototype bridge built from folded card and narrow wooden strips.',
      'A worktable held rulers, clips, tape, and trays that kept each team organized.',
      'When one support bent, the builders chose to rebuild that section with a wider base.',
      'A magnetic block held two small pieces in place while the glue dried.',
      'Readers used meaningful boundaries when they helped, but they also divided table into ta and ble for pronunciation.',
      'Each team read the complete target word in context before deciding that its chunks worked.',
    ],
    targets: [
      target('prototype', 2, [c('pro', 'proh', 'open'), c('to', 'tuh', 'open'), c('type', 'type', 'vowel-consonant-e')], 2),
      target('worktable', 3, [c('work', 'work', 'r-controlled'), c('ta', 'tay', 'open'), c('ble', 'buhl', 'consonant-le')], 2, [hint('work', 'compound-part'), hint('table', 'compound-part')]),
      target('rebuild', 4, [c('re', 'ree', 'open'), c('build', 'build', 'vowel-team')], 0, [hint('re', 'prefix'), hint('build', 'base')]),
      target('magnetic', 5, [c('mag', 'mag', 'closed'), c('net', 'net', 'closed'), c('ic', 'ik', 'closed')], 0),
    ],
  },
  {
    passageId: multisyllableMountainPassageIds.adventureClub,
    context: 'Read about an adventure club preparing a safe outdoor course.',
    sentences: [
      'The school adventure club designed a short outdoor course where teams could practice map reading and careful movement.',
      'A student trailblazer carried the first marker and checked that the route stayed on the approved path.',
      'The group crossed a campground where families had packed their tents before breakfast.',
      'After checking the map, the trailblazer began returning toward the starting field with the team.',
      'A stable wooden step allowed students to cross one low beam while keeping both hands free.',
      'Compound boundaries and the prefix re helped with meaning, while reading chunks such as bla and zer supported pronunciation.',
      'The students blended each target, reread the sentence, and adjusted any chunking that did not produce the intended word.',
    ],
    targets: [
      target('trailblazer', 2, [c('trail', 'trayl', 'vowel-team'), c('bla', 'blay', 'open'), c('zer', 'zer', 'r-controlled')], 0, [hint('trail', 'compound-part'), hint('blazer', 'compound-part')]),
      target('campground', 3, [c('camp', 'camp', 'closed'), c('ground', 'ground', 'vowel-team')], 1, [hint('camp', 'compound-part'), hint('ground', 'compound-part')]),
      target('returning', 4, [c('re', 'ree', 'open'), c('turn', 'turn', 'r-controlled'), c('ing', 'ing', 'closed')], 0, [hint('re', 'prefix'), hint('turn', 'base'), hint('ing', 'suffix')]),
      target('stable', 5, [c('sta', 'stay', 'open'), c('ble', 'buhl', 'consonant-le')], 1),
    ],
  },
]

function target(
  word: string,
  sentence: number,
  chunks: ChunkSpec[],
  focusChunkIndex: number,
  hints: MultisyllableMorphologicalHint[] = [],
): TargetSpec {
  return { word, sentence, chunks, hints, focusChunkIndex }
}

function buildArtifact(spec: PassageSpec): MultisyllableMountainPassageArtifact {
  const sentenceIds = spec.sentences.map((_, index) => `${spec.passageId}-sentence-${index + 1}`)
  const targets: MultisyllableDecodingTarget[] = spec.targets.map((item) => ({
    targetId: `${spec.passageId}-target-${item.word}`,
    surfaceWord: item.word,
    sourceSentenceId: sentenceIds[item.sentence - 1],
    syllableCount: item.chunks.length,
    pronunciationChunks: item.chunks.map(({ displayText, speechText }): RootSyllableChunk => ({ displayText, speechText })),
    syllablePatterns: item.chunks.map((chunk) => chunk.pattern),
    morphologicalHints: (item.hints ?? []).map((entry) => ({ ...entry })),
    decodingSteps: [
      `Notice ${item.chunks[item.focusChunkIndex].displayText} as a useful reading clue.`,
      `Read ${item.chunks.map((chunk) => chunk.displayText).join(' | ')} one chunk at a time.`,
      `Blend the chunks into ${item.word}.`,
      'Reread the source sentence to confirm the word fits.',
    ],
    wholeWordSpeechText: item.word,
    reviewStatus: 'DRAFT',
    contentVersion: multisyllableMountainContentVersion,
  }))
  const sentenceTextById = new Map(sentenceIds.map((id, index) => [id, spec.sentences[index]] as const))
  const supportTargets: WordSupportTarget[] = targets.map((item, targetIndex) => ({
    targetId: item.targetId,
    passageId: spec.passageId,
    sentenceId: item.sourceSentenceId,
    surfaceWord: item.surfaceWord,
    focusParts: item.pronunciationChunks.map((chunk, chunkIndex) => ({ text: chunk.displayText, emphasis: chunkIndex === spec.targets[targetIndex].focusChunkIndex })),
    displayChunks: item.pronunciationChunks.map((chunk) => ({ ...chunk })),
    spokenChunks: item.pronunciationChunks.map((chunk) => ({ ...chunk })),
    blendSpeechText: item.pronunciationChunks.map((chunk) => chunk.speechText).join(' - '),
    wholeWordSpeechText: item.wholeWordSpeechText,
    sentenceSpeechText: sentenceTextById.get(item.sourceSentenceId) ?? '',
    reviewStatus: 'DRAFT',
    contentVersion: multisyllableMountainContentVersion,
  }))
  return {
    passage: {
      passageIdentifier: spec.passageId,
      gradeBand: 3,
      passageText: spec.sentences.join(' '),
      contentKind: 'prose',
      sentences: spec.sentences.map((text, index) => ({ sentenceId: sentenceIds[index], text })),
      readingContext: spec.context,
      contentVersion: multisyllableMountainContentVersion,
      reviewStatus: 'DRAFT',
      wordSupportTargets: supportTargets,
    },
    guide: {
      passageId: spec.passageId,
      targets,
      reviewStatus: 'DRAFT',
      contentVersion: multisyllableMountainContentVersion,
    },
    targets,
  }
}

export const multisyllableMountainPassageArtifacts = passageSpecs.map(buildArtifact)
export const multisyllableMountainPassages = multisyllableMountainPassageArtifacts.map((artifact) => artifact.passage)
export const multisyllableMountainGuides = multisyllableMountainPassageArtifacts.map((artifact) => artifact.guide)
export const multisyllableMountainTargets = multisyllableMountainPassageArtifacts.flatMap((artifact) => artifact.targets)
export const multisyllableMountainSupportTargets = multisyllableMountainPassages.flatMap((passage) => passage.wordSupportTargets ?? [])

export function getMultisyllableMountainArtifact(passageId: string): MultisyllableMountainPassageArtifact {
  const artifact = multisyllableMountainPassageArtifacts.find((candidate) => candidate.passage.passageIdentifier === passageId)
  if (!artifact) throw new Error(`Unknown Multisyllable Mountain passage: ${passageId}`)
  return artifact
}
