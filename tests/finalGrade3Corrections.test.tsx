import { readFileSync } from 'node:fs'

import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { getActiveContentPacks } from '../src/domain/content/packs/registry'
import type { ReadingQuestion } from '../src/domain/content/types'
import { ProgressionOutcomeScreen } from '../src/screens/ProgressionOutcomeScreen'

const packs = getActiveContentPacks()
const grade3Packs = packs.filter((pack) => pack.manifest.gradeBand === 3)
const questions = grade3Packs.flatMap((pack) => pack.questions)

function question(id: string): ReadingQuestion {
  const found = questions.find((candidate) => candidate.questionIdentifier === id)
  if (!found) throw new Error(`Missing Grade 3 question ${id}.`)
  return found
}

function pack(title: string) {
  const found = grade3Packs.find((candidate) => candidate.manifest.packTitle.includes(title))
  if (!found) throw new Error(`Missing Grade 3 pack ${title}.`)
  return found
}

function visiblePayload(id: string): string {
  return JSON.stringify(question(id).questionContent)
}

describe('confirmed Phase 7D7 corrections', () => {
  test('removes generated placeholders and plural/article grammar defects', () => {
    const visibleText = JSON.stringify(questions)
    expect(visibleText).not.toMatch(/\bnot [123]\b/)
    expect(visibleText).not.toContain('a adjective')
    expect(visibleText).not.toContain('a open syllable')
    expect(visibleText).not.toContain('an silent-e syllable')
    expect(visibleText).not.toContain('How does Nia and Omar')
    expect(visibleText).not.toContain('Nia and Omar develops')
    expect(visibleText).not.toContain('Nia and Omar does differently')
  })

  test('uses genuine definitions and accurate informational evidence', () => {
    for (const title of ['Central Idea Engine', 'Purpose Development Path', 'Claim and Evidence Court']) {
      const definitions = pack(title).passages.flatMap((passage) => passage.informationalStructure?.features.flatMap((feature) => (
        feature.kind === 'glossary' ? feature.entries.map((entry) => entry.definition) : []
      )) ?? [])
      expect(definitions).toHaveLength(7)
      expect(definitions.every((definition) => !definition.includes('useful word from'))).toBe(true)
    }

    expect(JSON.stringify(pack('Central Idea Engine').passages)).not.toContain('sunlight is moving through the system')
    expect(question('g3-id-pd-q7-4').evidenceReferenceIds ?? []).toContain('g3-id-pd-passage-7-sentence-10')
    expect(question('g3-id-pd-q7-7').evidenceReferenceIds ?? []).toContain('g3-id-pd-passage-7-sentence-10')
    expect(visiblePayload('g3-id-ce-q2-3')).not.toContain('equal test groups')
    expect(visiblePayload('g3-id-ce-q5-4')).not.toContain('plain identical labels')
  })

  test('keeps perspective, summary, author comparison, and poem evidence unambiguous', () => {
    expect(visiblePayload('g3-ss-pp3-q6-2')).not.toContain('lantern light is blocked')
    expect(visiblePayload('g3-ss-pp3-q6-6')).not.toContain('lantern light is blocked')
    expect(visiblePayload('g3-ss-pp3-q7-4')).not.toContain('full platform could reopen')
    expect(JSON.stringify(pack('Summary Stronghold'))).not.toContain('one corner slightly bent')
    expect(visiblePayload('g3-cg-al-q6-7')).not.toContain('""')
    for (const id of ['g3-pp-pfo-q5-3', 'g3-pp-pfo-q6-3', 'g3-pp-pfo-q7-3']) {
      expect(question(id).prompt).toMatch(/^Compare the displayed poem/)
      expect(question(id).evidenceReferenceIds?.length ?? 0).toBeGreaterThan(2)
    }
  })

  test('separates learner-readable display chunks from accurate spoken chunks', () => {
    const mountainSupport = pack('Multisyllable Mountain').passages.flatMap((passage) => passage.wordSupportTargets ?? [])
    const prototype = mountainSupport.find((target) => target.surfaceWord === 'prototype')
    expect(prototype?.spokenChunks.map((chunk) => chunk.speechText)).toContain('tuh')

    const poemSupport = pack('Poem Form Observatory').passages.flatMap((passage) => passage.wordSupportTargets ?? [])
    const gears = poemSupport.find((target) => target.surfaceWord.toLowerCase() === 'gears')
    const steady = poemSupport.find((target) => target.surfaceWord.toLowerCase() === 'steady')
    expect(gears?.displayChunks.map((chunk) => chunk.displayText)).toEqual(['g', 'ears'])
    expect(gears?.spokenChunks).toEqual([{ displayText: 'gears', speechText: 'gears' }])
    expect(steady?.spokenChunks.map((chunk) => chunk.speechText)).toEqual(['sted', 'ee'])
  })

  test('keeps directions safe and learner-facing lesson titles coherent', () => {
    expect(JSON.stringify(pack('Structure Station').passages)).toContain('with an adult’s help')
    expect(question('g3-id-ss-q7-5').prompt).toContain('signal word')
    expect(pack('Figurative Fortress').lessons.map((lesson) => lesson.lessonTitle)).toContain('Figurative Fortress Checkpoint: Saturday Garden Signals')
  })

  test('presents terminal curriculum completion without claiming learner mastery', () => {
    render(<ProgressionOutcomeScreen
      outcome={{
        kind: 'CONTENT_NEEDED', earnedXp: 0, earnedStars: 0, currentDifficulty: 4, completionId: 'complete',
        nextQuest: { status: 'content_needed', purpose: 'progression', skillId: 'unknown', difficulty: 1, reason: 'All tracks complete.' },
      }}
      onContinueJourney={() => undefined}
      onBackHome={() => undefined}
    />)

    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Grade 3 Journey Complete!' }))
    expect(screen.getByText(/Curriculum completion is not the same as learner mastery/)).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Back Home' })).toBeTruthy()
  })

  test('preserves independent ledger decisions instead of deriving them from authored keys', () => {
    const generator = readFileSync('scripts/generate-question-truth-ledgers.mjs', 'utf8')
    expect(generator).toContain('prior.independentlySolvedAnswerIds')
    expect(generator).toContain('No preserved independent-review decision exists')
    expect(generator).not.toContain('const independentlySolvedAnswerIds = getAnswerIds(record.authoredCorrectAnswerRepresentation)')
    expect(generator).not.toContain("finalStatus: 'PASS'")
  })
})
