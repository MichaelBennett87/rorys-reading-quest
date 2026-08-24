import type { Passage, WordSupportTarget } from '../../../../types'
import type {
  DerivationalSuffixGuide,
  DerivationalSuffixTarget,
  DerivationalWordRole,
  RootSyllableChunk,
} from '../../../contentPackTypes'
import { suffixShifterContentVersion, suffixShifterPassageIds } from './ids'

interface TargetSpec {
  baseWord: string
  derivedWord: string
  suffix: string
  sentence: number
  baseWordRole: DerivationalWordRole
  derivedWordRole: DerivationalWordRole
  readingChunks: Array<[string, string]>
  explanation: string
}

interface PassageSpec {
  passageId: string
  context: string
  sentences: string[]
  targets: TargetSpec[]
}

export interface SuffixShifterPassageArtifact {
  passage: Passage
  guide: DerivationalSuffixGuide
  targets: DerivationalSuffixTarget[]
}

const passageSpecs: PassageSpec[] = [
  {
    passageId: suffixShifterPassageIds.workshopTeam,
    context: 'Read about a team preparing an invention workshop for younger visitors.',
    sentences: [
      'The invention club prepared a workshop where families could test simple machines and read clear labels beside every station.',
      'Maya showed kindness when she paused her own work to help a younger visitor fasten two cardboard wheels.',
      'A helper carried a tray of safe tools from the supply table to the building area.',
      'The helpful picture card showed each step without crowding the page with extra details.',
      'Maya quickly checked every moving part before the doors opened for the afternoon group.',
      'The team noticed that suffixes changed how the base words worked, while reading chunks helped them pronounce each complete word.',
      'They reread every sentence to confirm that the new word fit its job in the workshop story.',
    ],
    targets: [
      target('kind', 'kindness', 'ness', 2, 'adjective', 'noun', [['kind', 'kynd'], ['ness', 'ness']], 'Adding -ness to the adjective kind builds the noun kindness.'),
      target('help', 'helper', 'er', 3, 'verb', 'noun', [['help', 'help'], ['er', 'er']], 'Adding -er to the verb help builds the noun helper, which names a person who helps.'),
      target('help', 'helpful', 'ful', 4, 'noun', 'adjective', [['help', 'help'], ['ful', 'fuhl']], 'Adding -ful to the noun help builds the adjective helpful.'),
      target('quick', 'quickly', 'ly', 5, 'adjective', 'adverb', [['quick', 'kwik'], ['ly', 'lee']], 'Adding -ly to the adjective quick builds the adverb quickly.'),
    ],
  },
  {
    passageId: suffixShifterPassageIds.natureCenter,
    context: 'Read about a nature-center team preparing a gentle evening exhibit.',
    sentences: [
      'At the nature center, volunteers prepared an evening room where visitors could observe insects without disturbing them.',
      'As darkness filled the windows, low lamps kept the walking path easy to see.',
      'A simple treatment protected the wooden display frame from damp air near the pond.',
      'A careful guide checked each screen before placing a moth inside the viewing space.',
      'The harmless moth rested on a branch while families studied the soft pattern on its wings.',
      'The guide marked each base word and suffix, then divided the longer words into comfortable reading chunks.',
      'Those two views helped the volunteers read accurately and notice how each suffix changed a word job.',
    ],
    targets: [
      target('dark', 'darkness', 'ness', 2, 'adjective', 'noun', [['dark', 'dark'], ['ness', 'ness']], 'Adding -ness to the adjective dark builds the noun darkness.'),
      target('treat', 'treatment', 'ment', 3, 'verb', 'noun', [['treat', 'treet'], ['ment', 'ment']], 'Adding -ment to the verb treat builds the noun treatment.'),
      target('care', 'careful', 'ful', 4, 'noun', 'adjective', [['care', 'kair'], ['ful', 'fuhl']], 'Adding -ful to the noun care builds the adjective careful.'),
      target('harm', 'harmless', 'less', 5, 'noun', 'adjective', [['harm', 'harm'], ['less', 'less']], 'Adding -less to the noun harm builds the adjective harmless.'),
    ],
  },
  {
    passageId: suffixShifterPassageIds.artProject,
    context: 'Read about a community art team finishing a hallway mural.',
    sentences: [
      'A community art team designed a hallway mural that showed neighborhood gardens in every season.',
      'The final payment covered paint, brushes, and sturdy cloths for cleaning the work area.',
      'One painter outlined the largest tree while another volunteer mixed a warm shade of green.',
      'A playful border connected the four seasonal scenes without hiding the smaller student drawings.',
      'The team worked softly near a classroom so their voices would not interrupt a reading group.',
      'Before hanging the mural, the artists separated each target into a base and suffix and then practiced its reading chunks.',
      'They used the surrounding sentence to check whether each derived word named, described, or told how an action happened.',
    ],
    targets: [
      target('pay', 'payment', 'ment', 2, 'verb', 'noun', [['pay', 'pay'], ['ment', 'ment']], 'Adding -ment to the verb pay builds the noun payment.'),
      target('paint', 'painter', 'er', 3, 'verb', 'noun', [['paint', 'paynt'], ['er', 'er']], 'Adding -er to the verb paint builds the noun painter, which names a person who paints.'),
      target('play', 'playful', 'ful', 4, 'noun', 'adjective', [['play', 'play'], ['ful', 'fuhl']], 'Adding -ful to the noun play builds the adjective playful.'),
      target('soft', 'softly', 'ly', 5, 'adjective', 'adverb', [['soft', 'soft'], ['ly', 'lee']], 'Adding -ly to the adjective soft builds the adverb softly.'),
    ],
  },
  {
    passageId: suffixShifterPassageIds.schoolNewsroom,
    context: 'Read about students preparing a school newspaper display.',
    sentences: [
      'The school newspaper team created a display about how reporters turn notes into clear articles for their readers.',
      'Their enjoyment grew when the principal chose two student stories for the front page.',
      'Each reader could follow the short captions and find the matching photograph beside an article.',
      'A foldable sign stood on the table and opened into three panels about planning, revising, and publishing.',
      'A cloudy sky delayed the outdoor interview, so the reporters used the time to check punctuation indoors.',
      'The editor reminded everyone that a suffix can change a word role, but it does not create an absolute rule for every English word.',
      'Students marked the transparent base and suffix before reading each complete word in its sentence.',
    ],
    targets: [
      target('enjoy', 'enjoyment', 'ment', 2, 'verb', 'noun', [['en', 'en'], ['joy', 'joy'], ['ment', 'ment']], 'Adding -ment to the verb enjoy builds the noun enjoyment.'),
      target('read', 'reader', 'er', 3, 'verb', 'noun', [['read', 'reed'], ['er', 'er']], 'Adding -er to the verb read builds the noun reader, which names a person who reads.'),
      target('fold', 'foldable', 'able', 4, 'verb', 'adjective', [['fold', 'fohld'], ['a', 'uh'], ['ble', 'buhl']], 'Adding -able to the verb fold builds the adjective foldable.'),
      target('cloud', 'cloudy', 'y', 5, 'noun', 'adjective', [['cloud', 'klowd'], ['y', 'ee']], 'Adding -y to the noun cloud builds the adjective cloudy.'),
    ],
  },
  {
    passageId: suffixShifterPassageIds.makerShowcase,
    context: 'Read about a maker showcase with supplies, models, and careful lighting.',
    sentences: [
      'On showcase morning, the maker club arranged inventions along a wide table and left a clear path for visitors.',
      'A shipment of batteries, craft sticks, and tape arrived before the first class entered the room.',
      'A colorful robot model waved one cardboard arm whenever someone pressed a blue button.',
      'The students knew a careless wire placement could block a wheel, so they checked every connection twice.',
      'Small lamps shone brightly above the labels without making the screen difficult to read.',
      'At each station, students found the base and suffix, named the new word job in that sentence, and practiced the reading chunks.',
      'Their final check showed that the suffix clues supported decoding without replacing careful reading of the whole word.',
    ],
    targets: [
      target('ship', 'shipment', 'ment', 2, 'verb', 'noun', [['ship', 'ship'], ['ment', 'ment']], 'Adding -ment to the verb ship builds the noun shipment.'),
      target('color', 'colorful', 'ful', 3, 'noun', 'adjective', [['col', 'kuhl'], ['or', 'er'], ['ful', 'fuhl']], 'Adding -ful to the noun color builds the adjective colorful.'),
      target('care', 'careless', 'less', 4, 'noun', 'adjective', [['care', 'kair'], ['less', 'less']], 'Adding -less to the noun care builds the adjective careless.'),
      target('bright', 'brightly', 'ly', 5, 'adjective', 'adverb', [['bright', 'bryt'], ['ly', 'lee']], 'Adding -ly to the adjective bright builds the adverb brightly.'),
    ],
  },
  {
    passageId: suffixShifterPassageIds.natureNight,
    context: 'Read about a nighttime nature walk using safe models and quiet observation.',
    sentences: [
      'A nature guide led families along a short evening trail with signs about plants and animals active after sunset.',
      'The softness of moss surprised visitors who touched only the approved sample on the learning table.',
      'A fearless guide calmly lifted a model owl so everyone could inspect its wide wings.',
      'The guide warned that the thin clay shell was breakable and should remain on its padded stand.',
      'A mechanical snail moved slowly across a board while children compared its path with a trail map.',
      'Families used each sentence to decide whether the derived word named an idea, described something, or told how an action happened.',
      'They also compared the base-plus-suffix boundary with the reading chunks before blending the complete word.',
    ],
    targets: [
      target('soft', 'softness', 'ness', 2, 'adjective', 'noun', [['soft', 'soft'], ['ness', 'ness']], 'Adding -ness to the adjective soft builds the noun softness.'),
      target('fear', 'fearless', 'less', 3, 'noun', 'adjective', [['fear', 'feer'], ['less', 'less']], 'Adding -less to the noun fear builds the adjective fearless.'),
      target('break', 'breakable', 'able', 4, 'verb', 'adjective', [['break', 'brayk'], ['a', 'uh'], ['ble', 'buhl']], 'Adding -able to the verb break builds the adjective breakable.'),
      target('slow', 'slowly', 'ly', 5, 'adjective', 'adverb', [['slow', 'sloh'], ['ly', 'lee']], 'Adding -ly to the adjective slow builds the adverb slowly.'),
    ],
  },
  {
    passageId: suffixShifterPassageIds.weatherGarden,
    context: 'Read about a weather station and garden-design project.',
    sentences: [
      'Students planned a small weather station beside the school garden so classes could compare daily conditions.',
      'A moment of stillness helped the group hear the first drops tap against the metal rain gauge.',
      'The washable chart could be wiped clean after students recorded the temperature with water-based markers.',
      'A rainy afternoon gave the team useful data about puddles forming near the garden path.',
      'A dusty sensor cover needed a gentle cloth before the final equipment check.',
      'The class separated each transparent base from its suffix and noticed that several new words described a noun.',
      'They read the authored chunks, blended the complete words, and returned to each sentence to confirm the word job.',
    ],
    targets: [
      target('still', 'stillness', 'ness', 2, 'adjective', 'noun', [['still', 'still'], ['ness', 'ness']], 'Adding -ness to the adjective still builds the noun stillness.'),
      target('wash', 'washable', 'able', 3, 'verb', 'adjective', [['wash', 'wosh'], ['a', 'uh'], ['ble', 'buhl']], 'Adding -able to the verb wash builds the adjective washable.'),
      target('rain', 'rainy', 'y', 4, 'noun', 'adjective', [['rain', 'rayn'], ['y', 'ee']], 'Adding -y to the noun rain builds the adjective rainy.'),
      target('dust', 'dusty', 'y', 5, 'noun', 'adjective', [['dust', 'dust'], ['y', 'ee']], 'Adding -y to the noun dust builds the adjective dusty.'),
    ],
  },
]

function target(
  baseWord: string,
  derivedWord: string,
  suffix: string,
  sentence: number,
  baseWordRole: DerivationalWordRole,
  derivedWordRole: DerivationalWordRole,
  readingChunks: TargetSpec['readingChunks'],
  explanation: string,
): TargetSpec {
  return { baseWord, derivedWord, suffix, sentence, baseWordRole, derivedWordRole, readingChunks, explanation }
}

function buildArtifact(spec: PassageSpec): SuffixShifterPassageArtifact {
  const sentenceIds = spec.sentences.map((_, index) => `${spec.passageId}-sentence-${index + 1}`)
  const targets: DerivationalSuffixTarget[] = spec.targets.map((item) => ({
    targetId: `${spec.passageId}-target-${item.derivedWord}`,
    sentenceId: sentenceIds[item.sentence - 1],
    baseWord: item.baseWord,
    derivedWord: item.derivedWord,
    suffix: item.suffix,
    baseWordRole: item.baseWordRole,
    derivedWordRole: item.derivedWordRole,
    morphologicalChunks: [
      { text: item.baseWord, role: 'base' },
      { text: item.suffix, role: 'suffix' },
    ],
    readingChunks: item.readingChunks.map(([displayText, speechText]): RootSyllableChunk => ({ displayText, speechText })),
    transformationExplanation: item.explanation,
  }))
  const sentenceTextById = new Map(sentenceIds.map((id, index) => [id, spec.sentences[index]] as const))
  const supportTargets: WordSupportTarget[] = targets.map((item) => ({
    targetId: item.targetId,
    passageId: spec.passageId,
    sentenceId: item.sentenceId,
    surfaceWord: item.derivedWord,
    focusParts: item.morphologicalChunks.map((chunk) => ({ text: chunk.text, emphasis: chunk.role === 'suffix' })),
    displayChunks: item.readingChunks.map((chunk) => ({ ...chunk })),
    spokenChunks: item.readingChunks.map((chunk) => ({ ...chunk })),
    blendSpeechText: item.readingChunks.map((chunk) => chunk.speechText).join(' - '),
    wholeWordSpeechText: item.derivedWord,
    sentenceSpeechText: sentenceTextById.get(item.sentenceId) ?? '',
    reviewStatus: 'DRAFT',
    contentVersion: suffixShifterContentVersion,
  }))
  return {
    passage: {
      passageIdentifier: spec.passageId,
      gradeBand: 3,
      passageText: spec.sentences.join(' '),
      contentKind: 'prose',
      sentences: spec.sentences.map((text, index) => ({ sentenceId: sentenceIds[index], text })),
      readingContext: spec.context,
      contentVersion: suffixShifterContentVersion,
      reviewStatus: 'DRAFT',
      wordSupportTargets: supportTargets,
    },
    guide: {
      passageId: spec.passageId,
      targets,
      reviewStatus: 'DRAFT',
      contentVersion: suffixShifterContentVersion,
    },
    targets,
  }
}

export const suffixShifterPassageArtifacts = passageSpecs.map(buildArtifact)
export const suffixShifterPassages = suffixShifterPassageArtifacts.map((artifact) => artifact.passage)
export const suffixShifterGuides = suffixShifterPassageArtifacts.map((artifact) => artifact.guide)
export const suffixShifterTargets = suffixShifterPassageArtifacts.flatMap((artifact) => artifact.targets)
export const suffixShifterSupportTargets = suffixShifterPassages.flatMap((passage) => passage.wordSupportTargets ?? [])

export function getSuffixShifterArtifact(passageId: string): SuffixShifterPassageArtifact {
  const artifact = suffixShifterPassageArtifacts.find((candidate) => candidate.passage.passageIdentifier === passageId)
  if (!artifact) throw new Error(`Unknown Suffix Shifter passage: ${passageId}`)
  return artifact
}
