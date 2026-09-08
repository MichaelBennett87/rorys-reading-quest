import { describe, expect, it } from 'vitest'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

const pack = getActiveContentPacks().find(
  (candidate) => candidate.manifest.packId === 'g2-compare-castle-compare-keep',
)

function question(questionIdentifier: string) {
  const found = pack?.questions.find(
    (candidate) => candidate.questionIdentifier === questionIdentifier,
  )

  expect(found).toBeDefined()
  return found!
}

describe('Compare Keep answer-uniqueness corrections from blind batch 75', () => {
  it('gives the formerly subjective detail question an observable distinction', () => {
    expect(question('ck-q-checkpoint-b-3')).toMatchObject({
      prompt:
        'Which detail describes the room before the show, rather than an action the helpers take?',
      explanation:
        'The quiet, shining buzz describes the room before the show. The other details describe actions by helpers or performers.',
      correctAnswers: ['quiet-buzz'],
    })
  })

  it('keeps only one preparation action selectable in the hot-text item', () => {
    expect(question('ck-q-checkpoint-b-5').questionContent).toMatchObject({
      type: 'hot_text',
      selectableSegments: [
        {
          id: 'seg-1',
          text: 'They gathered the materials before the sky turned purple.',
        },
        {
          id: 'seg-2',
          text: 'By dusk, the camp circle looked ready for stories, snacks, and songs.',
        },
        {
          id: 'seg-3',
          text: 'The room held a quiet, shining buzz.',
        },
      ],
      correctSegmentIds: ['seg-1'],
    })
  })

  it('uses direct preparation evidence from both texts in the two-part item', () => {
    expect(question('ck-q-checkpoint-b-7')).toMatchObject({
      evidenceReference: 'ck-lit-prose-6-camp-lanterns::ck-lit-prose-6-s2',
      evidenceReferenceIds: [
        'ck-lit-prose-6-camp-lanterns::ck-lit-prose-6-s2',
        'ck-lit-poem-2-before-the-show::ck-lit-poem-2-s2',
      ],
      questionContent: {
        type: 'two_part',
        partBCorrectChoiceId: 'prep-lines',
        partBChoices: expect.arrayContaining([
          {
            id: 'prep-lines',
            text: 'They gathered the materials before the sky turned purple. / Hands checked strings, lanterns, and notes in a careful row.',
          },
        ]),
      },
    })
  })
})
