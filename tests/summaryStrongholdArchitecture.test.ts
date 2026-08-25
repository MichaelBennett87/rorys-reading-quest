import { describe, expect, test } from 'vitest'

import { buildGrade3SummaryGuideAudit, type ContentPack, type Grade3SummaryGuide, type RetellGuide } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { normalizePlannedNextQuest, planGlobalQuest } from '../src/domain/curriculum'
import { getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress, type LessonActivityCandidate } from '../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress } from '../src/persistence'

const NOW = '2026-08-25T12:00:00.000Z'

describe('Summary Stronghold architecture', () => {
  test('registers the bounded ELA.3.R.3.2 patterns', () => {
    expect(getExpectedBenchmarkPatterns('ELA.3.R.3.2')).toEqual([
      'literary-summary', 'plot', 'theme', 'informational-summary', 'central-idea', 'relevant-details', 'important-vs-minor',
    ])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = { manifest: { packId: 'g3-compare-castle-summary-stronghold', contentVersion: 'g3-cg-summary-stronghold-r0.1.0' }, passages: [], lessons: [], questions: [] } as unknown as ContentPack
    expect(buildGrade3SummaryGuideAudit(pack)).toEqual([{
      code: 'missing_grade3_summary_guide', itemIdentifier: 'g3-compare-castle-summary-stronghold',
      message: 'Summary Stronghold requires authored Grade 3 summary guides.',
    }])
  })

  test('keeps summary metadata distinct from Grade 2 retell metadata and Unit 1 reviews', () => {
    const summary = { textKind: 'literary', modelSummary: 'A concise story summary.' } as Grade3SummaryGuide
    const retell = { textKind: 'literary', retellPieces: [] } as unknown as RetellGuide
    expect('modelSummary' in summary).toBe(true)
    expect('retellPieces' in summary).toBe(false)
    expect('retellPieces' in retell).toBe(true)
    const unit1 = buildReviewQueueIdentity({ skillId: 'g3-across-genres-reading', difficulty: 1, unitId: 'g3-cg-unit-1', contentVersion: 'g3-cg-figurative-fortress-r0.1.0' })
    const unit2 = buildReviewQueueIdentity({ skillId: 'g3-across-genres-reading', difficulty: 2, unitId: 'g3-cg-unit-2', contentVersion: 'g3-cg-summary-stronghold-r0.1.0' })
    expect(sameReviewQueueIdentity(unit1, unit2)).toBe(false)
  })

  test('retires the stale Unit 2 boundary and plans Summary Stronghold without altering rewards', () => {
    const source = getLessonCandidates().find((candidate) => candidate.skillId === 'g3-across-genres-reading' && candidate.unitId === 'g3-cg-unit-1' && candidate.difficulty === 1)
    if (!source) throw new Error('Figurative Fortress fixture lesson is required.')
    const summaryFixture: LessonActivityCandidate = {
      ...source, lessonId: 'g3-cg-summary-fixture-lesson', activityId: 'g3-cg-summary-fixture-activity',
      unitId: 'g3-cg-unit-2', difficulty: 2, packId: 'g3-compare-castle-summary-stronghold',
      contentVersion: 'g3-cg-summary-stronghold-r0.1.0', eligiblePurposes: ['progression', 'verification', 'review'],
    }
    const state = createDefaultQuestProgress(NOW)
    state.skillProgress['g2-across-genres-reading'] = createInitialSkillProgress('g2-across-genres-reading', 4, 3)
    state.skillProgress['g3-across-genres-reading'] = createInitialSkillProgress('g3-across-genres-reading', 2, 1)
    state.totalXp = 1000
    state.totalStars = 34
    state.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: 'g3-across-genres-reading', difficulty: 2, reason: 'Summary Stronghold was not registered.' }

    const normalized = normalizePlannedNextQuest(state, [summaryFixture])
    expect(normalized).toMatchObject({ changed: true, state: { plannedNextQuest: null, totalXp: 1000, totalStars: 34 } })
    expect(planGlobalQuest({ progress: normalized.state, availableLessons: [summaryFixture], now: NOW })).toMatchObject({
      status: 'available', purpose: 'progression', lesson: { unitId: 'g3-cg-unit-2', difficulty: 2 },
    })
  })
})
