import { describe, expect, test } from 'vitest'

import { normalizePlannedNextQuest, planGlobalQuest } from '../src/domain/curriculum'
import { getTrackBySkillId } from '../src/domain/curriculum'
import { buildFigurativeLanguageGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress, type LessonActivityCandidate } from '../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress } from '../src/persistence'

const NOW = '2026-08-25T09:00:00.000Z'

describe('Figurative Fortress architecture', () => {
  test('preserves the Across-Genre track while Context Cavern activation is explicit', () => {
    expect(getTrackBySkillId('g3-across-genres-reading')).toMatchObject({
      trackId: 'g3-across-genres-reading', worldId: 'compare-castle', gradeBand: 3,
      entryUnitId: 'g3-cg-unit-1', completionDifficulty: 4,
      prerequisiteTrackIds: ['g2-across-genres-reading'], status: 'active',
    })
    expect(getTrackBySkillId('g3-context-cavern-vocabulary')?.status).toBe('active')
    expect(getExpectedBenchmarkPatterns('ELA.3.R.3.1')).toEqual(['metaphors', 'personification', 'hyperbole', 'figurative-meaning', 'literal-vs-nonliteral'])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-compare-castle-figurative-fortress', contentVersion: 'g3-cg-figurative-fortress-r0.1.0' },
      passages: [], lessons: [], questions: [],
    } as unknown as ContentPack
    expect(buildFigurativeLanguageGuideAudit(pack)).toEqual([{
      code: 'missing_figurative_language_guide', itemIdentifier: 'g3-compare-castle-figurative-fortress',
      message: 'Figurative Fortress requires authored figurative-language guides.',
    }])
  })

  test('keeps Grade 2 and Grade 3 Compare Castle review identities separate', () => {
    const grade2 = buildReviewQueueIdentity({ skillId: 'g2-across-genres-reading', difficulty: 1, unitId: 'cg-unit-1', contentVersion: 'g2-cg-wordplay-r0.1.0' })
    const grade3 = buildReviewQueueIdentity({ skillId: 'g3-across-genres-reading', difficulty: 1, unitId: 'g3-cg-unit-1', contentVersion: 'g3-cg-figurative-fortress-r0.1.0' })
    expect(sameReviewQueueIdentity(grade2, grade3)).toBe(false)
  })

  test('releases the Phase 7C boundary without initializing unavailable Context Cavern content', () => {
    const source = getLessonCandidates().find((candidate) => candidate.skillId === 'g2-across-genres-reading' && candidate.difficulty === 1)
    if (!source) throw new Error('Grade 2 Across-Genre fixture lesson is required.')
    const figurativeFixture: LessonActivityCandidate = {
      ...source, lessonId: 'g3-cg-figurative-fixture-lesson', activityId: 'g3-cg-figurative-fixture-activity',
      skillId: 'g3-across-genres-reading', worldId: 'compare-castle', unitId: 'g3-cg-unit-1', difficulty: 1,
      gradeBand: 3, packId: 'g3-compare-castle-figurative-fortress', contentVersion: 'g3-cg-figurative-fortress-r0.1.0',
      eligiblePurposes: ['progression', 'verification', 'review'],
    }
    const state = createDefaultQuestProgress(NOW)
    for (const [skillId, difficulty] of [
      ['g2-word-forge-word-practice', 8], ['g2-story-scouts-prose', 4], ['g2-poetry-planet-poetry', 2],
      ['g2-information-detectives-reading', 5], ['g2-context-cavern-vocabulary', 4], ['g2-across-genres-reading', 4],
      ['g3-word-forge-word-analysis', 5], ['g3-story-scouts-prose', 4], ['g3-poetry-planet-poetry', 2],
      ['g3-information-detectives-reading', 5],
    ] as const) state.skillProgress[skillId] = createInitialSkillProgress(skillId, difficulty, difficulty - 1)
    state.totalXp = 900
    state.totalStars = 30
    state.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: 'g3-information-detectives-reading', difficulty: 5, reason: 'Phase 7D content was not registered.' }

    const normalized = normalizePlannedNextQuest(state, [figurativeFixture])
    expect(normalized).toMatchObject({ changed: true, state: { plannedNextQuest: null, totalXp: 900, totalStars: 30 } })
    const plan = planGlobalQuest({ progress: normalized.state, availableLessons: [figurativeFixture], now: NOW })
    expect(plan).toMatchObject({ status: 'available', purpose: 'progression', lesson: { skillId: 'g3-across-genres-reading', unitId: 'g3-cg-unit-1' } })
    expect(normalized.state.skillProgress['g3-context-cavern-vocabulary']).toBeUndefined()
  })
})
