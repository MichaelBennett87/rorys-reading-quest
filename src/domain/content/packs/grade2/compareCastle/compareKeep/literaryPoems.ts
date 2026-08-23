import type { Passage, WordSupportTarget } from '../../../../types'
import { buildPoemPassage, type PoemPassagePlan, type SentencePlan } from './textBuilders'
import { COMPARE_KEEP_PASSAGE_IDS } from './ids'

const makeSentence = (sentenceId: string, text: string): SentencePlan => ({ sentenceId, text })

const literaryPoemPlans: readonly PoemPassagePlan[] = [
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.literaryPoemA,
    sentences: [
      makeSentence('ck-lit-poem-1-s1', 'Wind marched across the field in quick, bright steps.'),
      makeSentence('ck-lit-poem-1-s2', 'It lifted leaves like paper flags.'),
      makeSentence('ck-lit-poem-1-s3', 'A kite shivered, then climbed when Tia loosened her grip.'),
      makeSentence('ck-lit-poem-1-s4', 'The grass bent low and whispered under the gust.'),
      makeSentence('ck-lit-poem-1-s5', 'Then the air softened, and the park breathed slowly again.'),
      makeSentence('ck-lit-poem-1-s6', 'Clouds drifted by in a soft gray line.'),
      makeSentence('ck-lit-poem-1-s7', 'The kite stayed high while the leaves spun below.'),
      makeSentence('ck-lit-poem-1-s8', 'Tia watched carefully and smiled at the moving sky.'),
      makeSentence('ck-lit-poem-1-s9', 'The path below grew quiet, but the wind still hummed.'),
      makeSentence('ck-lit-poem-1-s10', 'Each breeze seemed to tap the trees with tiny hands.'),
    ],
    stanzas: [
      { stanzaId: 'ck-lit-poem-1-stanza-1', lineNumbers: [1, 2, 3, 4, 5] },
      { stanzaId: 'ck-lit-poem-1-stanza-2', lineNumbers: [6, 7, 8, 9, 10] },
    ],
    supportTargetPlans: [
      { sentenceIndex: 0, surfaceWord: 'march', chunks: ['mar', 'ch'] },
      { sentenceIndex: 7, surfaceWord: 'carefully', chunks: ['care', 'fully'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.literaryPoemB,
    sentences: [
      makeSentence('ck-lit-poem-2-s1', 'Before the show, the room held a quiet, shining buzz.'),
      makeSentence('ck-lit-poem-2-s2', 'Hands checked strings, lanterns, and notes in a careful row.'),
      makeSentence('ck-lit-poem-2-s3', 'Rosa stood with her breath ready like a small drumbeat.'),
      makeSentence('ck-lit-poem-2-s4', 'Then the curtain lifted, and the first voice stepped forward.'),
      makeSentence('ck-lit-poem-2-s5', 'Shoes settled, pages turned, and the team moved together.'),
      makeSentence('ck-lit-poem-2-s6', 'A spotlight warmed the stage like morning toast.'),
      makeSentence('ck-lit-poem-2-s7', 'The audience listened, and the hall stayed still.'),
      makeSentence('ck-lit-poem-2-s8', 'One by one, the lines found their place.'),
      makeSentence('ck-lit-poem-2-s9', 'At the end, the room burst into bright applause.'),
      makeSentence('ck-lit-poem-2-s10', 'The helpers bowed, calm and proud, under the soft lights.'),
    ],
    stanzas: [
      { stanzaId: 'ck-lit-poem-2-stanza-1', lineNumbers: [1, 2, 3, 4, 5] },
      { stanzaId: 'ck-lit-poem-2-stanza-2', lineNumbers: [6, 7, 8, 9, 10] },
    ],
    supportTargetPlans: [
      { sentenceIndex: 1, surfaceWord: 'careful', chunks: ['care', 'ful'] },
      { sentenceIndex: 4, surfaceWord: 'together', chunks: ['tog', 'ether'] },
    ],
  },
]

export const compareKeepLiteraryPoems: Passage[] = literaryPoemPlans.map((plan) => buildPoemPassage(plan))
export const compareKeepLiteraryPoemSupportTargets: WordSupportTarget[] = compareKeepLiteraryPoems.flatMap((passage) => passage.wordSupportTargets ?? [])
