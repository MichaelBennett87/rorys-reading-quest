import { describe, expect, test } from 'vitest'

import { normalizePlannedNextQuest, planGlobalQuest } from '../src/domain/curriculum'
import { buildAuthorClaimGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { getLessonCandidates } from '../src/domain/lesson'
import { getSequentialWorldRoadmapByTrackId, getTrackBySkillId } from '../src/domain/curriculum'
import { createInitialSkillProgress, type LessonActivityCandidate } from '../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress } from '../src/persistence'

const NOW = '2026-08-25T06:00:00.000Z'

describe('Claim and Evidence Court architecture', () => {
  test('activates the reserved fourth Information Detectives unit without changing track completion', () => {
    expect(getTrackBySkillId('g3-information-detectives-reading')).toMatchObject({
      trackId: 'g3-information-detectives-reading', worldId: 'information-detectives', gradeBand: 3,
      entryUnitId: 'g3-id-unit-1', completionDifficulty: 5, prerequisiteTrackIds: ['g2-information-detectives-reading'], status: 'active',
    })
    const units = getSequentialWorldRoadmapByTrackId('g3-information-detectives-reading')?.units ?? []
    expect(units[3]).toMatchObject({ unitId: 'g3-id-unit-4', title: 'Claim and Evidence Court', activeDifficulty: 4, completionDifficulty: 5, plannedPhase: '7C4' })
    expect(getExpectedBenchmarkPatterns('ELA.3.R.2.4')).toEqual(['author-claim', 'reasons', 'evidence', 'claim-evidence-connection'])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-information-detectives-claim-evidence-court', contentVersion: 'g3-id-claim-evidence-r0.1.0' },
      passages: [], lessons: [],
    } as unknown as ContentPack
    expect(buildAuthorClaimGuideAudit(pack)).toEqual([{
      code: 'missing_author_claim_guide', itemIdentifier: 'g3-information-detectives-claim-evidence-court',
      message: 'Claim and Evidence Court requires authored claim-and-evidence guides.',
    }])
  })

  test('keeps all four Grade 3 informational review identities separate', () => {
    const identities = [
      buildReviewQueueIdentity({ skillId: 'g3-information-detectives-reading', difficulty: 1, unitId: 'g3-id-unit-1', contentVersion: 'g3-id-structure-station-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-information-detectives-reading', difficulty: 2, unitId: 'g3-id-unit-2', contentVersion: 'g3-id-central-idea-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-information-detectives-reading', difficulty: 3, unitId: 'g3-id-unit-3', contentVersion: 'g3-id-purpose-development-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-information-detectives-reading', difficulty: 4, unitId: 'g3-id-unit-4', contentVersion: 'g3-id-claim-evidence-r0.1.0' }),
    ]
    for (let left = 0; left < identities.length; left += 1) {
      for (let right = left + 1; right < identities.length; right += 1) expect(sameReviewQueueIdentity(identities[left], identities[right])).toBe(false)
    }
  })

  test('new Unit 4 registration releases stale content-needed without changing earned history', () => {
    const source = getLessonCandidates().find((candidate) => candidate.unitId === 'g3-id-unit-3' && candidate.difficulty === 3)
    if (!source) throw new Error('Unit 3 fixture lesson is required.')
    const unit4Fixture: LessonActivityCandidate = {
      ...source, lessonId: 'g3-id-claim-fixture-lesson', activityId: 'g3-id-claim-fixture-activity',
      unitId: 'g3-id-unit-4', difficulty: 4, packId: 'g3-information-detectives-claim-evidence-court',
      contentVersion: 'g3-id-claim-evidence-r0.1.0', eligiblePurposes: ['progression', 'verification', 'review'],
    }
    const state = createDefaultQuestProgress(NOW)
    for (const [skillId, difficulty] of [
      ['g2-word-forge-word-practice', 8], ['g2-story-scouts-prose', 4], ['g2-poetry-planet-poetry', 2],
      ['g2-information-detectives-reading', 5], ['g2-context-cavern-vocabulary', 4], ['g2-across-genres-reading', 4],
      ['g3-word-forge-word-analysis', 5], ['g3-story-scouts-prose', 4], ['g3-poetry-planet-poetry', 2],
    ] as const) state.skillProgress[skillId] = createInitialSkillProgress(skillId, difficulty, difficulty - 1)
    state.skillProgress['g3-information-detectives-reading'] = createInitialSkillProgress('g3-information-detectives-reading', 4, 3)
    state.totalXp = 840
    state.totalStars = 28
    state.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: 'g3-information-detectives-reading', difficulty: 4, reason: 'Unit 4 was not registered.' }

    const normalized = normalizePlannedNextQuest(state, [unit4Fixture])
    expect(normalized).toMatchObject({ changed: true, state: { plannedNextQuest: null, totalXp: 840, totalStars: 28, completedAttempts: [] } })
    expect(planGlobalQuest({ progress: normalized.state, availableLessons: [unit4Fixture], now: NOW })).toMatchObject({
      status: 'available', purpose: 'progression', lesson: { unitId: 'g3-id-unit-4', difficulty: 4, contentVersion: 'g3-id-claim-evidence-r0.1.0' },
    })
  })
})
