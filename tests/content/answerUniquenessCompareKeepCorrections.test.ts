import { describe, expect, it } from 'vitest'

import { compareKeepPrerequisiteQuestions } from '../../src/domain/content/packs/grade2/compareCastle/compareKeep/questionsPrerequisite'
import { compareKeepGuidedQuestions } from '../../src/domain/content/packs/grade2/compareCastle/compareKeep/questionsGuided'
import { compareKeepCheckpointQuestions } from '../../src/domain/content/packs/grade2/compareCastle/compareKeep/questionsCheckpoint'

describe('Compare Keep answer uniqueness corrections', () => {
  it('states the shared problem-solving fact without a false story-order claim', () => {
    const question = JSON.stringify(compareKeepPrerequisiteQuestions[1])

    expect(question).toContain('Helpers solve a problem in a shared space.')
    expect(question).toContain('Each story shows two helpers solving a problem in a shared school space.')
    expect(question).toContain('ck-lit-prose-2-s5')
    expect(question).not.toContain('The text starts with a problem that needs help.')
    expect(question).not.toContain('Each story starts with a problem that needs careful help.')
  })

  it('narrows the seed Hot Text item to the new-soil outcome', () => {
    const question = compareKeepPrerequisiteQuestions[8]

    expect(question.prompt).toBe('Select the sentence in Text 1 that tells what happens when a seed reaches new soil.')
    expect(question.explanation).toContain('rubs off near soil and starts a new plant home')
  })

  it('uses two genuinely shared wind details and maps the rising kite to both texts', () => {
    const comparison = JSON.stringify(compareKeepGuidedQuestions[2])
    const table = JSON.stringify(compareKeepGuidedQuestions[4])

    expect(comparison).toContain('Gray clouds drift over the field.')
    expect(comparison).toContain('ck-lit-prose-3-s5')
    expect(comparison).toContain('ck-lit-poem-1-s6')
    expect(comparison).not.toContain('The wind becomes calmer at the end.')
    expect(table).toContain('ck-lit-prose-3-s4')
    expect(table).toContain('ck-lit-poem-1-s3')
    expect(table).toContain('"prompt":"A kite rises when the wind helps.","correctChoiceId":"both"')
  })

  it('keeps only two central route-plan details in the literary checkpoint multiselect', () => {
    const item = compareKeepCheckpointQuestions[3]
    const question = JSON.stringify(item)

    expect(item.prompt).toBe('Choose the two details that show each route plan helps a group start or finish on time.')
    expect(question).toContain('A few balloons bumped together in the breeze.')
    expect(question).toContain('The class starting on time and the parade moving in order')
    expect(question).not.toContain('The card slipped behind the notebook during line-up.')
  })

  it('asks for the active gathering step rather than any prepared state', () => {
    const questions = JSON.stringify(compareKeepCheckpointQuestions)

    expect(questions).toContain('Select the line in Text 1 that shows the campers gathering materials before the event.')
    expect(questions).toContain('gathering materials before the sky turns purple shows the preparation action')
    expect(questions).not.toContain('Select the line in Text 1 that shows the preparation.')
  })
})
