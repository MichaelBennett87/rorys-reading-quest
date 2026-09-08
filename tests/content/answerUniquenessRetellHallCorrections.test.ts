import { describe, expect, it } from 'vitest'

import { retellHallPrerequisiteQuestions } from '../../src/domain/content/packs/grade2/compareCastle/retellHall/questionsPrerequisite'
import { retellHallGuidedQuestions } from '../../src/domain/content/packs/grade2/compareCastle/retellHall/questionsGuided'
import { retellHallCheckpointQuestions } from '../../src/domain/content/packs/grade2/compareCastle/retellHall/questionsCheckpoint'

describe('Retell Hall answer uniqueness corrections', () => {
  it('gives the seed-detail question one visible relevance criterion', () => {
    const question = retellHallPrerequisiteQuestions[6]

    expect(question.prompt).toBe('Which detail tells how wind carries seeds?')
    expect(question.explanation).toContain('light seeds can ride on the wind')
  })

  it('keeps exactly two defensible details in the choose-two item', () => {
    const question = JSON.stringify(retellHallPrerequisiteQuestions[7])

    expect(question).toContain('Some light seeds ride gently on the wind and float far away.')
    expect(question).toContain('Tiny hooks cling to animal fur.')
    expect(question).toContain('Every seed travels in the same way.')
    expect(question).not.toContain('Each move helps a plant begin in a new spot.')
  })

  it('states the source-order contract for every numbered table row', () => {
    const question = JSON.stringify(retellHallPrerequisiteQuestions[9])

    expect(question).toContain('Build the retell in source order.')
    expect(question).toContain('First relevant detail')
    expect(question).toContain('Second relevant detail')
    expect(question).toContain('Third relevant detail')
    expect(question).toContain('wind, animal-fur, and water details in source order')
  })

  it('gives the guided ending and rain-gauge questions one defensible response', () => {
    const literaryEnding = JSON.stringify(retellHallGuidedQuestions[3])
    const rainDetail = retellHallGuidedQuestions[6]
    const rainSelection = JSON.stringify(retellHallGuidedQuestions[7])
    const rainJob = retellHallGuidedQuestions[8]

    expect(literaryEnding).not.toContain('Soon, the truck crossed the bridge without a shake.')
    expect(rainDetail.prompt).toBe('Which detail tells how the marked lines help measure rain?')
    expect(rainSelection).toContain('A flower bed may need water on a dry day.')
    expect(rainSelection).not.toContain('The number helps people compare one storm with another.')
    expect(rainJob.prompt).toBe("Select the sentence that states the rain gauge's main job.")
  })

  it('distinguishes problem resolution from a literal final sentence', () => {
    const muralEnding = JSON.stringify(retellHallPrerequisiteQuestions[3])
    const posterEnding = JSON.stringify(retellHallCheckpointQuestions[4])

    expect(muralEnding).toContain('Select the sentence that shows the mural work is complete.')
    expect(muralEnding).toContain('A red eraser waited on the sill, but it did not matter to the plan.')
    expect(posterEnding).toContain('Select the sentence that shows the poster problem has been solved.')
    expect(posterEnding).toContain('A clock ticked softly above the shelves.')
    expect(posterEnding).toContain('The poster hangs neatly, showing that the curled-corner problem has been solved.')
  })

  it('states source order for the guided informational table', () => {
    const question = JSON.stringify(retellHallGuidedQuestions[9])

    expect(question).toContain('Build the retell in source order.')
    expect(question).toContain('First relevant detail')
    expect(question).toContain('Second relevant detail')
    expect(question).toContain('Third relevant detail')
    expect(question).toContain('cup, marked-lines, and notebook details in source order')
  })

  it('makes the checkpoint chronology and literary retell roles explicit', () => {
    const chronology = retellHallCheckpointQuestions[2]
    const literaryTable = JSON.stringify(retellHallCheckpointQuestions[5])

    expect(chronology.prompt).toBe('Which event happens immediately after the poster curls?')
    expect(literaryTable).toContain('Build the retell in source order.')
    expect(literaryTable).toContain('The poster needs to stay up, but one corner curls like a ribbon.')
    expect(literaryTable).toContain('First important event')
    expect(literaryTable).toContain('Second important event')
  })

  it('makes the habitat focus and source-order table mapping unique', () => {
    const topLayer = retellHallCheckpointQuestions[8]
    const habitatTable = JSON.stringify(retellHallCheckpointQuestions[12])

    expect(topLayer.prompt).toBe('Which detail tells how birds use the top layer?')
    expect(habitatTable).toContain('Build the retell in source order.')
    expect(habitatTable).toContain('top, middle, and ground details in source order')
    expect(habitatTable).toContain('First relevant detail')
    expect(habitatTable).toContain('Second relevant detail')
    expect(habitatTable).toContain('Third relevant detail')
  })

  it('separates search events from the ending in checkpoint C', () => {
    const searchEvents = retellHallCheckpointQuestions[17]
    const ending = JSON.stringify(retellHallCheckpointQuestions[18])
    const table = JSON.stringify(retellHallCheckpointQuestions[19])

    expect(searchEvents.prompt).toBe('Choose two search events that help the friends find the card.')
    expect(ending).not.toContain('The leader gave a thankful wave.')
    expect(table).toContain('Build the retell in source order.')
    expect(table).toContain('First important event')
    expect(table).toContain('Second important event')
    expect(table).toContain('find the card tucked beside the sign')
    expect(table).not.toContain('tuck the card beside the sign')
  })
})
