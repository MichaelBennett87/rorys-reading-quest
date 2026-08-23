import type { Passage, WordSupportTarget } from '../../../../types'
import { buildProsePassage, type ProsePassagePlan, type SentencePlan } from './textBuilders'
import { COMPARE_KEEP_PASSAGE_IDS } from './ids'

const makeSentence = (sentenceId: string, text: string): SentencePlan => ({ sentenceId, text })

const literaryProsePlans: readonly ProsePassagePlan[] = [
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseA,
    sentences: [
      makeSentence('ck-lit-prose-1-s1', 'At the school garden, Mina and Jalen found a tilted plant sign after a windy afternoon.'),
      makeSentence('ck-lit-prose-1-s2', 'The sign bent like a sleepy spoon beside the bean patch.'),
      makeSentence('ck-lit-prose-1-s3', 'Mina held the post while Jalen fetched fresh string from the supply box.'),
      makeSentence('ck-lit-prose-1-s4', 'They worked carefully so the carrots would still have room to grow.'),
      makeSentence('ck-lit-prose-1-s5', 'Jalen gave the post a small push, and the sign stood straight again.'),
      makeSentence('ck-lit-prose-1-s6', 'By the end of lunch, the garden looked neat, and the beans had their marker back.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 3, surfaceWord: 'carefully', chunks: ['care', 'fully'] },
      { sentenceIndex: 5, surfaceWord: 'straight', chunks: ['stra', 'ight'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseB,
    sentences: [
      makeSentence('ck-lit-prose-2-s1', 'In the library hall, Nora and Felix spread paper stars across a long table for family night.'),
      makeSentence('ck-lit-prose-2-s2', 'The stars glittered like tiny windows in a night sky poster.'),
      makeSentence('ck-lit-prose-2-s3', 'Nora taped the corners while Felix clipped the banner string.'),
      makeSentence('ck-lit-prose-2-s4', 'They stayed together so the banner would not slip before visitors arrived.'),
      makeSentence('ck-lit-prose-2-s5', 'A loose edge flicked in the air, but Nora smoothed it down with one calm hand.'),
      makeSentence('ck-lit-prose-2-s6', 'When the doors opened, the banner hung steady above the book cart.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 3, surfaceWord: 'together', chunks: ['tog', 'ether'] },
      { sentenceIndex: 5, surfaceWord: 'steady', chunks: ['stead', 'y'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseC,
    sentences: [
      makeSentence('ck-lit-prose-3-s1', 'On a blustery afternoon, Tia and her brother Quinn walked to the park with a bright kite.'),
      makeSentence('ck-lit-prose-3-s2', 'The wind pulled the kite string like a quick tug on a ribbon.'),
      makeSentence('ck-lit-prose-3-s3', 'Tia laughed when the kite bumped a tree branch and wobbled low.'),
      makeSentence('ck-lit-prose-3-s4', 'Quinn kept the string carefully loose, then carefully tight, until the kite rose.'),
      makeSentence('ck-lit-prose-3-s5', 'A gray cloud drifted over the field, but the children stayed calm.'),
      makeSentence('ck-lit-prose-3-s6', 'Soon the kite floated above the playground, and the two children waved from below.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 3, surfaceWord: 'carefully', chunks: ['care', 'fully'] },
      { sentenceIndex: 4, surfaceWord: 'drifted', chunks: ['drift', 'ed'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseD,
    sentences: [
      makeSentence('ck-lit-prose-4-s1', 'Before the class nature walk, Eli checked his pocket and found the missing trail card at last.'),
      makeSentence('ck-lit-prose-4-s2', 'The card had slipped behind his notebook during morning line-up.'),
      makeSentence('ck-lit-prose-4-s3', 'He showed it to Ms. Rivera, who nodded with a relieved smile.'),
      makeSentence('ck-lit-prose-4-s4', 'Eli had discovered the card by following the small clues in his backpack.'),
      makeSentence('ck-lit-prose-4-s5', 'The class could start on time because he had found the one card that set the route.'),
      makeSentence('ck-lit-prose-4-s6', 'Eli tucked the card into a clear sleeve so it would stay safe for the rest of the day.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 3, surfaceWord: 'discovered', chunks: ['dis', 'covered'] },
      { sentenceIndex: 4, surfaceWord: 'route', chunks: ['ro', 'ute'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseE,
    sentences: [
      makeSentence('ck-lit-prose-5-s1', 'At the front of the school, the parade team spread a map across two folding chairs.'),
      makeSentence('ck-lit-prose-5-s2', 'Each group traced its part of the path with a pencil and a careful finger.'),
      makeSentence('ck-lit-prose-5-s3', 'The route began by the library door and ended near the big oak tree.'),
      makeSentence('ck-lit-prose-5-s4', 'The leaders checked the sequence again so no group would miss a turn.'),
      makeSentence('ck-lit-prose-5-s5', 'A few balloons bumped together in the breeze, but the map kept the plan calm.'),
      makeSentence('ck-lit-prose-5-s6', 'When the whistle blew, the parade moved in the right order from start to finish.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 3, surfaceWord: 'sequence', chunks: ['se', 'quence'] },
      { sentenceIndex: 3, surfaceWord: 'careful', chunks: ['care', 'ful'] },
    ],
  },
  {
    passageId: COMPARE_KEEP_PASSAGE_IDS.literaryProseF,
    sentences: [
      makeSentence('ck-lit-prose-6-s1', 'At camp, Rosa and Leo sorted lanterns, cups, and blankets onto one long picnic table.'),
      makeSentence('ck-lit-prose-6-s2', 'They gathered the materials before the sky turned purple.'),
      makeSentence('ck-lit-prose-6-s3', 'Rosa counted the blankets while Leo lined up the lanterns in a row.'),
      makeSentence('ck-lit-prose-6-s4', 'They worked carefully so each camper would have a bright spot to sit.'),
      makeSentence('ck-lit-prose-6-s5', 'A helper brought an extra lantern, and the table plan grew even better.'),
      makeSentence('ck-lit-prose-6-s6', 'By dusk, the camp circle looked ready for stories, snacks, and songs.'),
    ],
    supportTargetPlans: [
      { sentenceIndex: 1, surfaceWord: 'gathered', chunks: ['gath', 'ered'] },
      { sentenceIndex: 3, surfaceWord: 'carefully', chunks: ['care', 'fully'] },
    ],
  },
]

export const compareKeepLiteraryPassages: Passage[] = literaryProsePlans.map((plan) => buildProsePassage(plan))
export const compareKeepLiterarySupportTargets: WordSupportTarget[] = compareKeepLiteraryPassages.flatMap((passage) => passage.wordSupportTargets ?? [])
