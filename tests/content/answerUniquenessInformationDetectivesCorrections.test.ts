import { describe, expect, test } from 'vitest'

import { grade2InformationDetectivesCentralIdeaCenterPack } from '../../src/domain/content/packs/grade2/informationDetectives/centralIdeaCenter'
import { centralIdeaCenterSentenceIds } from '../../src/domain/content/packs/grade2/informationDetectives/centralIdeaCenter/ids'
import { grade2InformationDetectivesTextFeatureHuntPack } from '../../src/domain/content/packs/grade2/informationDetectives/textFeatureHunt'

function requireQuestion<T extends { questionIdentifier: string }>(pack: { questions: T[] }, questionId: string): T {
  const question = pack.questions.find((entry) => entry.questionIdentifier === questionId)
  expect(question, questionId).toBeDefined()
  return question!
}

describe('answer-uniqueness corrections for Grade 2 Information Detectives', () => {
  test('distinguishes overlapping map, caption, and illustration contributions', () => {
    const gardenMap = requireQuestion(
      grade2InformationDetectivesTextFeatureHuntPack,
      'g2-information-detectives-text-feature-hunt-building-block-b-mc-2',
    )
    expect(gardenMap.prompt).toContain('different grid positions')

    const trailFeatures = requireQuestion(
      grade2InformationDetectivesTextFeatureHuntPack,
      'g2-information-detectives-text-feature-hunt-guided-b-ms-1',
    )
    expect(trailFeatures.prompt).toContain('dashed route between the pond, oak tree, and overlook')

    const compostMap = requireQuestion(
      grade2InformationDetectivesTextFeatureHuntPack,
      'g2-information-detectives-text-feature-hunt-checkpoint-c-mc-3',
    )
    expect(compostMap.prompt).toContain('beside both the herb bed and the hose hook')

    const compostDetails = requireQuestion(
      grade2InformationDetectivesTextFeatureHuntPack,
      'g2-information-detectives-text-feature-hunt-checkpoint-c-ms-1',
    )
    expect(compostDetails.prompt).toContain('one tells where the compost bin sits')
    expect(compostDetails.prompt).toContain('one explains why that spot helps the compost')

    const compostTable = requireQuestion(
      grade2InformationDetectivesTextFeatureHuntPack,
      'g2-information-detectives-text-feature-hunt-checkpoint-c-tm-1',
    )
    const compostContent = compostTable.questionContent
    expect(compostContent?.type).toBe('table_match')
    if (compostContent?.type !== 'table_match') {
      throw new Error('Expected a table-match question')
    }
    const mapRow = compostContent.rows.find((row) => row.id === 'row-map')
    expect(mapRow?.options.map((option) => option.text)).toEqual([
      'Names the topic of the whole text',
      'Shows the bin beside the herb bed and hose hook',
      'Explains how shade slows the change inside the bin',
      'Defines compost',
    ])
    expect(mapRow?.correctChoiceId).toBe('option-map-2')
  })

  test('states exactly what the moon and recycling graphs measure', () => {
    const moonQuestion = requireQuestion(
      grade2InformationDetectivesTextFeatureHuntPack,
      'g2-information-detectives-text-feature-hunt-checkpoint-a-ep-1',
    )
    const moonPassage = grade2InformationDetectivesTextFeatureHuntPack.passages.find(
      (passage) => passage.passageIdentifier === moonQuestion.passageIdentifier,
    )
    expect(moonPassage?.passageText).toContain('counts how many nights the class saw each moon shape')
    expect(moonPassage?.passageText).not.toContain('which moon shape the class saw each night')
    const moonGraph = moonPassage?.informationalStructure?.features.find((feature) => feature.kind === 'graph')
    expect(moonGraph?.title).toBe('Moon Shape Graph')

    const moonHeadingQuestion = requireQuestion(
      grade2InformationDetectivesTextFeatureHuntPack,
      'g2-information-detectives-text-feature-hunt-checkpoint-a-mc-2',
    )
    expect(moonHeadingQuestion.prompt).toContain('Moon Shape Counts')
    expect(moonHeadingQuestion.prompt).not.toContain('Night by Night')

    const moonGraphQuestion = requireQuestion(
      grade2InformationDetectivesTextFeatureHuntPack,
      'g2-information-detectives-text-feature-hunt-checkpoint-a-mc-3',
    )
    const moonGraphContent = moonGraphQuestion.questionContent
    expect(moonGraphContent?.type).toBe('multiple_choice')
    if (moonGraphContent?.type !== 'multiple_choice') {
      throw new Error('Expected a multiple-choice question')
    }
    expect(moonGraphContent.choices.find((choice) => choice.id === 'choice-a')?.text).toBe(
      'Compare how many nights each moon shape was seen.',
    )
    expect(moonGraphContent.correctChoiceIds).toEqual(['choice-a'])

    const recyclingQuestion = requireQuestion(
      grade2InformationDetectivesTextFeatureHuntPack,
      'g2-information-detectives-text-feature-hunt-checkpoint-b-ms-1',
    )
    const recyclingPassage = grade2InformationDetectivesTextFeatureHuntPack.passages.find(
      (passage) => passage.passageIdentifier === recyclingQuestion.passageIdentifier,
    )
    expect(recyclingPassage?.passageText).toContain('shows how many bags went into each bin')
    expect(recyclingPassage?.passageText).not.toContain('filled fastest')
    expect(recyclingQuestion.prompt).toContain('one tells what the graph counts')
    expect(recyclingQuestion.prompt).toContain('one explains what its tallest bar means')
  })

  test('limits the rain-garden multiselect to catch-and-hold evidence', () => {
    const question = requireQuestion(
      grade2InformationDetectivesCentralIdeaCenterPack,
      'lesson-central-idea-topic-vs-central-idea-q-3',
    )
    expect(question.prompt).toBe(
      'Choose the two details that directly explain how the rain garden first catches and holds rainwater.',
    )
    const content = question.questionContent
    expect(content?.type).toBe('multi_select')
    if (content?.type !== 'multi_select') {
      throw new Error('Expected a multiselect question')
    }
    expect(content.correctChoiceIds).toEqual(['bed-catches-rain', 'soil-holds-water'])
  })

  test('gives weather observations one exact saved-for-later response set', () => {
    const question = requireQuestion(
      grade2InformationDetectivesCentralIdeaCenterPack,
      'lesson-central-idea-put-important-details-together-q-3',
    )
    expect(question.prompt).toContain('saves weather observations to check later')
    const content = question.questionContent
    expect(content?.type).toBe('multi_select')
    if (content?.type !== 'multi_select') {
      throw new Error('Expected a multiselect question')
    }
    expect(content.correctChoiceIds).toEqual(['weather-chart', 'weather-clouds'])
  })

  test('uses source-bound criteria for every flagged checkpoint detail slot', () => {
    const expectations = [
      ['lesson-central-idea-checkpoint-a-q-3', 'traveling on an animal'],
      ['lesson-central-idea-checkpoint-a-q-4', 'through the air or on an animal'],
      ['lesson-central-idea-checkpoint-b-q-3', 'materials at the beginning'],
      ['lesson-central-idea-checkpoint-b-q-5', 'names the composting process'],
      ['lesson-central-idea-checkpoint-c-q-3', 'basic job of the bright trail markers'],
      ['lesson-central-idea-checkpoint-c-q-4', 'hazard being marked'],
    ] as const

    for (const [questionId, promptText] of expectations) {
      const question = requireQuestion(grade2InformationDetectivesCentralIdeaCenterPack, questionId)
      expect(question.prompt, questionId).toContain(promptText)
      expect(question.prompt, questionId).not.toMatch(/\bbest\b|most relevant/i)
    }

    const twoPartExpectations = [
      ['lesson-central-idea-checkpoint-a-q-7', 'wind-based example'],
      ['lesson-central-idea-checkpoint-b-q-7', 'materials that change'],
      ['lesson-central-idea-checkpoint-c-q-7', 'at a path choice'],
    ] as const

    for (const [questionId, promptText] of twoPartExpectations) {
      const question = requireQuestion(grade2InformationDetectivesCentralIdeaCenterPack, questionId)
      const content = question.questionContent
      expect(content?.type, questionId).toBe('two_part')
      if (content?.type !== 'two_part') throw new Error(`Expected ${questionId} to be a two-part question`)
      expect(content.partBPrompt, questionId).toContain(promptText)
      expect(content.partBPrompt, questionId).not.toMatch(/\bbest\b|most relevant/i)
    }

    const seed = requireQuestion(
      grade2InformationDetectivesCentralIdeaCenterPack,
      'lesson-central-idea-checkpoint-a-q-3',
    )
    expect(seed.evidenceReferenceIds).toContain(centralIdeaCenterSentenceIds.seedTravelRoutes[3])

    const compost = requireQuestion(
      grade2InformationDetectivesCentralIdeaCenterPack,
      'lesson-central-idea-checkpoint-b-q-3',
    )
    expect(compost.evidenceReferenceIds).toContain(centralIdeaCenterSentenceIds.compostChangeStory[0])

    const trail = requireQuestion(
      grade2InformationDetectivesCentralIdeaCenterPack,
      'lesson-central-idea-checkpoint-c-q-4',
    )
    expect(trail.evidenceReferenceIds).toContain(centralIdeaCenterSentenceIds.trailMarkersGuideTheWay[3])
  })
})
