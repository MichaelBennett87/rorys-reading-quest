import type { Passage, WordSupportTarget } from '../../../../types'
import type { Grade3PoemForm, PoemFormGuide, RhymeSchemeLineGuide } from '../../../contentPackTypes'
import { POEM_FORM_PASSAGE_IDS, POEM_FORM_VERSION } from './ids'

interface SupportPlan { key: string; line: number; word: string; chunks: string[]; focus: string }
interface RhymePlan { endWord: string; rhymeKey: string; rhymeLabel: string }

export interface PoemFormRecord {
  passageId: string
  title: string
  difficulty: 0 | 1
  form: Grade3PoemForm
  formLabel: string
  lines: string[]
  stanzaLineNumbers: number[][]
  bestFeature: string
  secondFeature: string
  featureDistractors: [string, string, string]
  evidenceLineNumbers: number[]
  hotPrompt: string
  hotCorrectLine: number
  hotDistractorLines: [number, number, number]
  rhymeScheme?: string
  rhymePlans?: RhymePlan[]
  classroomSyllablePattern?: number[]
  support: SupportPlan[]
  transfer?: {
    prompt: string
    correctForm: Grade3PoemForm
    explanation: string
  }
}

const records: PoemFormRecord[] = [
  {
    passageId: POEM_FORM_PASSAGE_IDS[0], title: 'City Rain Window', difficulty: 0, form: 'free-verse', formLabel: 'Free verse',
    lines: ['Rain taps the fire escape.', 'Pigeons shake silver drops.', 'Below,', 'buses wake the street.', 'I draw a clear circle', 'on the foggy glass', 'and watch the gray day brighten.'],
    stanzaLineNumbers: [[1, 2, 3, 4, 5, 6, 7]],
    bestFeature: 'It uses intentional line breaks without a required fixed rhyme pattern.',
    secondFeature: 'Its line lengths vary, including the one-word line "Below."',
    featureDistractors: ['It has exactly three lines in a classroom 5-7-5 pattern.', 'It has five playful lines with an AABBA rhyme.', 'Every pair of neighboring lines has matching end rhyme.'],
    evidenceLineNumbers: [1, 2, 3, 4, 7],
    hotPrompt: 'Select the one-word line that creates a pause before the street scene continues.', hotCorrectLine: 3, hotDistractorLines: [1, 2, 4],
    support: [
      { key: 'pigeons', line: 2, word: 'Pigeons', chunks: ['Pi', 'geons'], focus: 'geons' },
      { key: 'silver', line: 2, word: 'silver', chunks: ['sil', 'ver'], focus: 'sil' },
      { key: 'circle', line: 5, word: 'circle', chunks: ['cir', 'cle'], focus: 'cle' },
      { key: 'brighten', line: 7, word: 'brighten', chunks: ['bright', 'en'], focus: 'bright' },
    ],
  },
  {
    passageId: POEM_FORM_PASSAGE_IDS[1], title: 'Workshop Light', difficulty: 0, form: 'rhymed-verse', formLabel: 'Rhymed verse',
    lines: ['We set our gears beside the light.', 'We test each wheel until it turns right.', 'A tiny motor starts to hum.', 'We cheer to hear its steady drum.'],
    stanzaLineNumbers: [[1, 2, 3, 4]],
    bestFeature: 'The end words light/right and hum/drum form intentional AABB rhyme.',
    secondFeature: 'The four lines are organized into two neighboring rhyme pairs.',
    featureDistractors: ['It has no required rhyme pattern and uses one-word lines.', 'It has three observational lines in a classroom 5-7-5 pattern.', 'It has five playful lines with an AABBA rhyme.'],
    evidenceLineNumbers: [1, 2, 3, 4],
    hotPrompt: 'Select the other line whose end word rhymes with "light" in line 1.', hotCorrectLine: 2, hotDistractorLines: [1, 3, 4],
    rhymeScheme: 'AABB',
    rhymePlans: [
      { endWord: 'light', rhymeKey: 'ight', rhymeLabel: 'A' }, { endWord: 'right', rhymeKey: 'ight', rhymeLabel: 'A' },
      { endWord: 'hum', rhymeKey: 'um', rhymeLabel: 'B' }, { endWord: 'drum', rhymeKey: 'um', rhymeLabel: 'B' },
    ],
    support: [
      { key: 'gears', line: 1, word: 'gears', chunks: ['g', 'ears'], focus: 'ears' },
      { key: 'wheel', line: 2, word: 'wheel', chunks: ['wh', 'eel'], focus: 'eel' },
      { key: 'motor', line: 3, word: 'motor', chunks: ['mo', 'tor'], focus: 'mo' },
      { key: 'steady', line: 4, word: 'steady', chunks: ['stead', 'y'], focus: 'stead' },
    ],
  },
  {
    passageId: POEM_FORM_PASSAGE_IDS[2], title: 'Cardinal Morning', difficulty: 1, form: 'haiku', formLabel: 'Haiku',
    lines: ['Soft snow covers grass', 'One red cardinal settles', 'Morning holds its breath'],
    stanzaLineNumbers: [[1, 2, 3]],
    bestFeature: 'This classroom haiku has three lines with an audited 5-7-5 syllable pattern.',
    secondFeature: 'It captures one quiet observation from nature.',
    featureDistractors: ['It has five playful lines with an AABBA rhyme.', 'It uses two neighboring rhyme pairs in four lines.', 'It is free verse simply because none of its end words rhyme.'],
    evidenceLineNumbers: [1, 2, 3],
    hotPrompt: 'Select the seven-syllable middle line in this classroom 5-7-5 example.', hotCorrectLine: 2, hotDistractorLines: [1, 3, 1],
    classroomSyllablePattern: [5, 7, 5],
    support: [
      { key: 'covers', line: 1, word: 'covers', chunks: ['cov', 'ers'], focus: 'cov' },
      { key: 'cardinal', line: 2, word: 'cardinal', chunks: ['car', 'di', 'nal'], focus: 'car' },
      { key: 'settles', line: 2, word: 'settles', chunks: ['set', 'tles'], focus: 'tles' },
      { key: 'morning', line: 3, word: 'Morning', chunks: ['Morn', 'ing'], focus: 'Morn' },
    ],
  },
  {
    passageId: POEM_FORM_PASSAGE_IDS[3], title: 'The Adventurous Kite', difficulty: 1, form: 'limerick', formLabel: 'Limerick',
    lines: ['There once was a bright little kite', 'That tugged at its string in delight', 'It dipped near a tree', 'Then sailed itself free', 'And danced with the clouds out of sight'],
    stanzaLineNumbers: [[1, 2, 3, 4, 5]],
    bestFeature: 'It has five playful lines whose kite/delight/sight and tree/free rhymes form AABBA.',
    secondFeature: 'The poem tells a short, playful event with a recognizable bouncing rhythm.',
    featureDistractors: ['It has three observational lines in a classroom 5-7-5 pattern.', 'It has no required fixed rhyme pattern.', 'It is any poem that happens to contain one rhyme.'],
    evidenceLineNumbers: [1, 2, 3, 4, 5],
    hotPrompt: 'Select the final line that returns to the A rhyme after the two B-rhyme lines.', hotCorrectLine: 5, hotDistractorLines: [2, 3, 4],
    rhymeScheme: 'AABBA',
    rhymePlans: [
      { endWord: 'kite', rhymeKey: 'ight', rhymeLabel: 'A' }, { endWord: 'delight', rhymeKey: 'ight', rhymeLabel: 'A' },
      { endWord: 'tree', rhymeKey: 'ee', rhymeLabel: 'B' }, { endWord: 'free', rhymeKey: 'ee', rhymeLabel: 'B' },
      { endWord: 'sight', rhymeKey: 'ight', rhymeLabel: 'A' },
    ],
    support: [
      { key: 'little', line: 1, word: 'little', chunks: ['lit', 'tle'], focus: 'tle' },
      { key: 'string', line: 2, word: 'string', chunks: ['str', 'ing'], focus: 'str' },
      { key: 'delight', line: 2, word: 'delight', chunks: ['de', 'light'], focus: 'light' },
      { key: 'clouds', line: 5, word: 'clouds', chunks: ['cl', 'ouds'], focus: 'ouds' },
    ],
  },
  {
    passageId: POEM_FORM_PASSAGE_IDS[4], title: 'The Museum Whale', difficulty: 1, form: 'free-verse', formLabel: 'Free verse',
    lines: ['Overhead,', 'a whale skeleton floats', 'above the quiet hall.', 'Its ribs curve across the lights.', 'We walk underneath.', 'Our footsteps sound small.', 'Blue shadows rock across the floor.'],
    stanzaLineNumbers: [[1, 2, 3, 4, 5, 6, 7]],
    bestFeature: 'Flexible line lengths and intentional breaks shape the poem without a required fixed rhyme pattern.',
    secondFeature: 'The one-word opening "Overhead" creates a visual pause before the whale appears.',
    featureDistractors: ['Its three lines use a classroom 5-7-5 pattern.', 'Its five lines follow AABBA.', 'Its end words form a repeating ABAB rhyme.'],
    evidenceLineNumbers: [1, 2, 3, 5, 7],
    hotPrompt: 'Select the one-word opening line that creates a pause before the whale appears.', hotCorrectLine: 1, hotDistractorLines: [2, 3, 5],
    support: [
      { key: 'skeleton', line: 2, word: 'skeleton', chunks: ['skel', 'e', 'ton'], focus: 'skel' },
      { key: 'above', line: 3, word: 'above', chunks: ['a', 'bove'], focus: 'bove' },
      { key: 'underneath', line: 5, word: 'underneath', chunks: ['under', 'neath'], focus: 'neath' },
      { key: 'shadows', line: 7, word: 'shadows', chunks: ['shad', 'ows'], focus: 'shad' },
    ],
    transfer: {
      prompt: 'A different poem has three lines, observes a quiet natural moment, and uses a common classroom 5-7-5 pattern. Which form is it?',
      correctForm: 'haiku', explanation: 'Those combined clues best support haiku; three lines alone would not be enough.',
    },
  },
  {
    passageId: POEM_FORM_PASSAGE_IDS[5], title: 'Turning the Seedlings', difficulty: 1, form: 'rhymed-verse', formLabel: 'Rhymed verse',
    lines: ['The seedlings lean toward morning sun.', 'We turn each tray beside the wall.', 'By noon their reaching work is done.', 'Now every stem stands straight and tall.'],
    stanzaLineNumbers: [[1, 2, 3, 4]],
    bestFeature: 'The end words sun/done and wall/tall create an intentional ABAB rhyme.',
    secondFeature: 'The rhyme returns on alternating lines instead of neighboring pairs.',
    featureDistractors: ['It is a limerick because any poem with rhyme is a limerick.', 'It has three lines in a classroom 5-7-5 pattern.', 'It has no required fixed rhyme pattern.'],
    evidenceLineNumbers: [1, 2, 3, 4],
    hotPrompt: 'Select the line whose end word rhymes with "sun" in line 1.', hotCorrectLine: 3, hotDistractorLines: [1, 2, 4],
    rhymeScheme: 'ABAB',
    rhymePlans: [
      { endWord: 'sun', rhymeKey: 'un', rhymeLabel: 'A' }, { endWord: 'wall', rhymeKey: 'all', rhymeLabel: 'B' },
      { endWord: 'done', rhymeKey: 'un', rhymeLabel: 'A' }, { endWord: 'tall', rhymeKey: 'all', rhymeLabel: 'B' },
    ],
    support: [
      { key: 'seedlings', line: 1, word: 'seedlings', chunks: ['seed', 'lings'], focus: 'seed' },
      { key: 'morning', line: 1, word: 'morning', chunks: ['morn', 'ing'], focus: 'morn' },
      { key: 'reaching', line: 3, word: 'reaching', chunks: ['reach', 'ing'], focus: 'reach' },
      { key: 'every', line: 4, word: 'every', chunks: ['ev', 'ery'], focus: 'ev' },
    ],
    transfer: {
      prompt: 'A different poem has five playful lines and an AABBA rhyme. Which form is it?',
      correctForm: 'limerick', explanation: 'Five playful lines plus the AABBA rhyme relationship identify a limerick.',
    },
  },
  {
    passageId: POEM_FORM_PASSAGE_IDS[6], title: 'The Crab Collection', difficulty: 1, form: 'limerick', formLabel: 'Limerick',
    lines: ['A bright little crab from the bay', 'Collected smooth shells every day', 'He stacked them too high', 'They slid with a sigh', 'So he built a wide shelf from a tray'],
    stanzaLineNumbers: [[1, 2, 3, 4, 5]],
    bestFeature: 'It has five playful lines whose bay/day/tray and high/sigh rhymes form AABBA.',
    secondFeature: 'The short, playful event has the recognizable limerick structure.',
    featureDistractors: ['It is free verse because line lengths vary.', 'It is a haiku because it describes an animal.', 'It is any rhymed verse, with no need to check line count or rhyme organization.'],
    evidenceLineNumbers: [1, 2, 3, 4, 5],
    hotPrompt: 'Select the final line that returns to the A rhyme after the two B-rhyme lines.', hotCorrectLine: 5, hotDistractorLines: [2, 3, 4],
    rhymeScheme: 'AABBA',
    rhymePlans: [
      { endWord: 'bay', rhymeKey: 'ay', rhymeLabel: 'A' }, { endWord: 'day', rhymeKey: 'ay', rhymeLabel: 'A' },
      { endWord: 'high', rhymeKey: 'igh', rhymeLabel: 'B' }, { endWord: 'sigh', rhymeKey: 'igh', rhymeLabel: 'B' },
      { endWord: 'tray', rhymeKey: 'ay', rhymeLabel: 'A' },
    ],
    support: [
      { key: 'bright', line: 1, word: 'bright', chunks: ['br', 'ight'], focus: 'ight' },
      { key: 'collected', line: 2, word: 'Collected', chunks: ['Col', 'lect', 'ed'], focus: 'lect' },
      { key: 'shells', line: 2, word: 'shells', chunks: ['sh', 'ells'], focus: 'sh' },
      { key: 'shelf', line: 5, word: 'shelf', chunks: ['sh', 'elf'], focus: 'sh' },
    ],
    transfer: {
      prompt: 'A different poem uses intentional rhyme throughout but has four lines instead of the five-line AABBA limerick structure. Which broad form fits best?',
      correctForm: 'rhymed-verse', explanation: 'Intentional rhyme identifies rhymed verse; a limerick specifically needs five lines and AABBA.',
    },
  },
]

export const poemFormRecords: readonly PoemFormRecord[] = records

export const poemFormPassages: Passage[] = records.map((record) => {
  const lines = record.lines.map((text, index) => ({
    lineId: lineId(record.passageId, index + 1), lineNumber: index + 1,
    stanzaId: stanzaId(record.passageId, stanzaNumberForLine(record.stanzaLineNumbers, index + 1)), text,
  }))
  return {
    passageIdentifier: record.passageId,
    title: record.title,
    contentKind: 'poem',
    passageText: record.lines.join('\n'),
    sentences: lines.map((line) => ({ sentenceId: line.lineId, lineNumber: line.lineNumber, stanzaId: line.stanzaId, text: line.text })),
    poemStructure: {
      lines,
      stanzas: record.stanzaLineNumbers.map((lineNumbers, index) => ({
        stanzaId: stanzaId(record.passageId, index + 1),
        lineIds: lineNumbers.map((lineNumber) => lineId(record.passageId, lineNumber)),
      })),
    },
    genre: 'poetry', gradeBand: 3, readingContext: 'Grade 3 Poetry Planet poem-form practice',
    reviewStatus: 'DRAFT', contentVersion: POEM_FORM_VERSION,
    wordSupportTargets: record.support.map((support) => buildSupportTarget(record, support)),
  }
})

export const poemFormGuides: PoemFormGuide[] = records.map((record) => ({
  poemId: record.passageId,
  form: record.form,
  lineCount: record.lines.length,
  stanzaCount: record.stanzaLineNumbers.length,
  definingFeatures: [
    {
      featureId: `${record.passageId}-feature-primary`,
      kind: record.form === 'free-verse' ? 'free-lineation' : record.form === 'haiku' ? 'syllable-pattern' : 'rhyme-pattern',
      statement: record.bestFeature,
      evidenceLineIds: record.evidenceLineNumbers.map((lineNumber) => lineId(record.passageId, lineNumber)),
    },
    {
      featureId: `${record.passageId}-feature-secondary`,
      kind: record.form === 'haiku' ? 'nature-observation' : record.form === 'limerick' ? 'playful-tone' : 'stanza-structure',
      statement: record.secondFeature,
      evidenceLineIds: record.evidenceLineNumbers.slice(0, 3).map((lineNumber) => lineId(record.passageId, lineNumber)),
    },
  ],
  nonDefiningFeatures: [...record.featureDistractors],
  ...(record.rhymeScheme ? {
    rhymeScheme: record.rhymeScheme,
    rhymeLines: record.rhymePlans?.map((plan, lineIndex): RhymeSchemeLineGuide => ({
      lineId: lineId(record.passageId, lineIndex + 1), ...plan,
    })),
  } : {}),
  ...(record.classroomSyllablePattern ? { classroomSyllablePattern: [...record.classroomSyllablePattern] } : {}),
  formExplanation: formExplanation(record),
  comparisonNotes: comparisonNotes(record),
  reviewStatus: 'DRAFT', contentVersion: POEM_FORM_VERSION,
}))

function buildSupportTarget(record: PoemFormRecord, support: SupportPlan): WordSupportTarget {
  const text = record.lines[support.line - 1]
  const index = support.word.toLowerCase().indexOf(support.focus.toLowerCase())
  return {
    targetId: `${record.passageId}-support-${support.key}`, passageId: record.passageId,
    sentenceId: lineId(record.passageId, support.line), surfaceWord: support.word,
    focusParts: index < 0 ? [{ text: support.word, emphasis: true }] : [
      { text: support.word.slice(0, index), emphasis: false },
      { text: support.word.slice(index, index + support.focus.length), emphasis: true },
      { text: support.word.slice(index + support.focus.length), emphasis: false },
    ].filter((part) => part.text.length > 0),
    displayChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    spokenChunks: support.chunks.map((chunk) => ({ displayText: chunk, speechText: chunk })),
    blendSpeechText: support.word, wholeWordSpeechText: support.word, sentenceSpeechText: text,
    reviewStatus: 'DRAFT', contentVersion: POEM_FORM_VERSION,
  }
}

function formExplanation(record: PoemFormRecord): string {
  if (record.form === 'free-verse') return 'This poem is free verse because its intentional line breaks and varied line lengths do not follow a required fixed rhyme or meter pattern. Free verse can sometimes contain rhyme.'
  if (record.form === 'rhymed-verse') return `This poem is rhymed verse because its line endings create the intentional ${record.rhymeScheme} rhyme relationship. Rhymed verse can use many rhyme organizations.`
  if (record.form === 'haiku') return 'This short observational poem is a classroom English haiku example with three lines and a common classroom 5-7-5 pattern.'
  return 'This playful five-line poem is a limerick because its end words create the common AABBA rhyme relationship and recognizable rhythm.'
}

function comparisonNotes(record: PoemFormRecord): string {
  if (record.form === 'haiku') return 'The 5-7-5 count describes this English classroom example; it is not a universal law for every haiku.'
  if (record.form === 'free-verse') return 'Unlike a poem organized around a repeating rhyme relationship, free verse has no required fixed rhyme scheme; rhyme may still appear sometimes.'
  if (record.form === 'rhymed-verse') return 'Intentional rhyme identifies this broad form, but not all rhymed verse uses the same scheme and not every rhymed poem is a limerick.'
  return 'Five lines alone do not prove a limerick; the playful effect and AABBA rhyme relationship work together.'
}

export function lineId(passageId: string, lineNumber: number): string { return `${passageId}-line-${lineNumber}` }
function stanzaId(passageId: string, number: number): string { return `${passageId}-stanza-${number}` }
function stanzaNumberForLine(stanzas: number[][], lineNumber: number): number { return stanzas.findIndex((lines) => lines.includes(lineNumber)) + 1 }
