import { describe, expect, test } from 'vitest'

import { buildGrade3AuthorComparisonGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { normalizePlannedNextQuest, planGlobalQuest } from '../src/domain/curriculum'
import { getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress, type LessonActivityCandidate } from '../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress } from '../src/persistence'

const NOW = '2026-08-30T12:00:00.000Z'

describe('Author Lens Tower architecture', () => {
  test('registers only the bounded ELA.3.R.3.3 presentation-comparison patterns', () => {
    expect(getExpectedBenchmarkPatterns('ELA.3.R.3.3')).toEqual([
      'two-author-comparison', 'same-topic-or-theme', 'presentation-similarity', 'presentation-difference', 'evidence-from-both-texts',
    ])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-compare-castle-author-lens-tower', contentVersion: 'g3-cg-author-lens-r0.1.0' },
      passages: [], lessons: [], questions: [], pairedTextSets: [],
    } as unknown as ContentPack
    expect(buildGrade3AuthorComparisonGuideAudit(pack)).toEqual([{
      code: 'missing_author_comparison_guide', itemIdentifier: 'g3-compare-castle-author-lens-tower',
      message: 'Author Lens Tower requires authored Grade 3 author-comparison guides.',
    }])
  })

  test('keeps all three Grade 3 Compare Castle review identities isolated', () => {
    const figurative = buildReviewQueueIdentity({ skillId: 'g3-across-genres-reading', difficulty: 1, unitId: 'g3-cg-unit-1', contentVersion: 'g3-cg-figurative-fortress-r0.1.0' })
    const summary = buildReviewQueueIdentity({ skillId: 'g3-across-genres-reading', difficulty: 2, unitId: 'g3-cg-unit-2', contentVersion: 'g3-cg-summary-stronghold-r0.1.0' })
    const authorLens = buildReviewQueueIdentity({ skillId: 'g3-across-genres-reading', difficulty: 3, unitId: 'g3-cg-unit-3', contentVersion: 'g3-cg-author-lens-r0.1.0' })
    expect(sameReviewQueueIdentity(figurative, authorLens)).toBe(false)
    expect(sameReviewQueueIdentity(summary, authorLens)).toBe(false)
  })

  test('retires a stale Unit 3 boundary without changing rewards or bypassing the current track', () => {
    const source = getLessonCandidates().find((candidate) => candidate.skillId === 'g3-across-genres-reading' && candidate.unitId === 'g3-cg-unit-2' && candidate.difficulty === 2)
    if (!source) throw new Error('Summary Stronghold fixture lesson is required.')
    const fixture: LessonActivityCandidate = {
      ...source,
      lessonId: 'g3-cg-author-lens-fixture-lesson', activityId: 'g3-cg-author-lens-fixture-activity',
      unitId: 'g3-cg-unit-3', difficulty: 3, packId: 'g3-compare-castle-author-lens-tower',
      contentVersion: 'g3-cg-author-lens-r0.1.0', eligiblePurposes: ['progression', 'verification', 'review'],
    }
    const state = createDefaultQuestProgress(NOW)
    state.skillProgress['g2-across-genres-reading'] = createInitialSkillProgress('g2-across-genres-reading', 4, 3)
    state.skillProgress['g3-across-genres-reading'] = createInitialSkillProgress('g3-across-genres-reading', 3, 2)
    state.totalXp = 1400
    state.totalStars = 46
    state.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: 'g3-across-genres-reading', difficulty: 3, reason: 'Author Lens Tower was not registered.' }

    const normalized = normalizePlannedNextQuest(state, [fixture])
    expect(normalized).toMatchObject({ changed: true, state: { plannedNextQuest: null, totalXp: 1400, totalStars: 46 } })
    expect(planGlobalQuest({ progress: normalized.state, availableLessons: [fixture], now: NOW })).toMatchObject({
      status: 'available', purpose: 'progression', lesson: { unitId: 'g3-cg-unit-3', difficulty: 3 },
    })
  })
})
