import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { ReferenceMaterialCard } from '../src/components/lesson/ReferenceMaterialCard'
import { buildMeaningMazeGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { getLessonCandidates } from '../src/domain/lesson'
import { selectNextLesson, type LessonActivityCandidate } from '../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress } from '../src/persistence'

afterEach(cleanup)

describe('Grade 3 Meaning Maze architecture', () => {
  test('registers exactly the bounded ELA.3.V.1.3 benchmark patterns', () => {
    expect(getExpectedBenchmarkPatterns('ELA.3.V.1.3')).toEqual([
      'context-clues', 'figurative-language', 'word-relationships', 'reference-materials',
      'background-knowledge', 'multiple-meaning-words', 'unknown-words', 'unknown-phrases',
    ])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = { manifest: { packId: 'g3-context-cavern-meaning-maze' }, passages: [], lessons: [], questions: [] } as unknown as ContentPack
    expect(buildMeaningMazeGuideAudit(pack)).toEqual([{
      code: 'missing_meaning_maze_guide',
      itemIdentifier: 'g3-context-cavern-meaning-maze',
      message: 'Meaning Maze requires authored meaning-strategy guides.',
    }])
  })

  test('keeps the Unit 3 boundary fail-closed until compatible authored work exists', () => {
    const source = getLessonCandidates().find((candidate) => candidate.skillId === 'g2-context-cavern-vocabulary')!
    const fixture: LessonActivityCandidate = {
      ...source,
      gradeBand: 3,
      skillId: 'g3-context-cavern-vocabulary',
      worldId: 'context-cavern',
      unitId: 'g3-cc-unit-3',
      difficulty: 3,
      lessonId: 'g3-cc-meaning-maze-fixture',
      activityId: 'g3-cc-meaning-maze-fixture-activity',
      packId: 'g3-context-cavern-meaning-maze',
      contentVersion: 'g3-cc-meaning-maze-r0.1.0',
      eligiblePurposes: ['progression', 'verification', 'review'],
    }
    const request = {
      skillId: 'g3-context-cavern-vocabulary', difficulty: 3, purpose: 'progression' as const,
      recentActivityUsage: [], preferredUnitId: 'g3-cc-unit-3', preferredContentVersion: 'g3-cc-meaning-maze-r0.1.0',
    }
    expect(selectNextLesson({ ...request, availableLessons: [] })).toMatchObject({ status: 'content_needed', difficulty: 3 })
    expect(selectNextLesson({ ...request, availableLessons: [fixture] })).toMatchObject({ status: 'available', lesson: { unitId: 'g3-cc-unit-3', difficulty: 3 } })
  })

  test('renders local reference senses accessibly and keeps identities isolated from persistence', () => {
    render(<ReferenceMaterialCard feature={{
      featureId: 'dictionary-current', kind: 'reference', referenceKind: 'dictionary', headword: 'current',
      senses: [
        { senseId: 'current-flow', meaning: 'moving water', partOfSpeech: 'noun', selectedForContext: true },
        { senseId: 'current-now', meaning: 'happening now', partOfSpeech: 'adjective', selectedForContext: false },
      ],
    }} />)
    expect(screen.getByRole('heading', { name: 'Dictionary', level: 4 })).toBeTruthy()
    expect(screen.getByText('current')).toBeTruthy()
    expect(screen.getByRole('list', { name: 'current meanings' })).toBeTruthy()

    const unit2 = buildReviewQueueIdentity({ skillId: 'g3-context-cavern-vocabulary', difficulty: 2, unitId: 'g3-cc-unit-2', contentVersion: 'g3-cc-root-meaning-r0.1.0' })
    const unit3 = buildReviewQueueIdentity({ skillId: 'g3-context-cavern-vocabulary', difficulty: 3, unitId: 'g3-cc-unit-3', contentVersion: 'g3-cc-meaning-maze-r0.1.0' })
    expect(sameReviewQueueIdentity(unit2, unit3)).toBe(false)
    const stored = JSON.stringify(createDefaultQuestProgress('2026-08-30T20:00:00.000Z'))
    expect(stored).not.toContain('meaningMazeGuides')
    expect(stored).not.toContain('referenceEntries')
  })
})
