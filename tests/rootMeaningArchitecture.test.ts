import { describe, expect, test } from 'vitest'

import { buildRootMeaningGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { normalizePlannedNextQuest, planGlobalQuest } from '../src/domain/curriculum'
import { getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress, selectNextLesson, type LessonActivityCandidate } from '../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress } from '../src/persistence'

const NOW = '2026-08-30T16:00:00.000Z'

function unitTwoFixture(): LessonActivityCandidate {
  const source = getLessonCandidates().find((candidate) => candidate.skillId === 'g2-context-cavern-vocabulary')
  if (!source) throw new Error('Grade 2 Context Cavern fixture lesson is required.')
  return {
    ...source,
    gradeBand: 3,
    skillId: 'g3-context-cavern-vocabulary',
    worldId: 'context-cavern',
    unitId: 'g3-cc-unit-2',
    difficulty: 2,
    lessonId: 'g3-cc-root-meaning-fixture-lesson',
    activityId: 'g3-cc-root-meaning-fixture-activity',
    packId: 'g3-context-cavern-root-meaning-vault',
    contentVersion: 'g3-cc-root-meaning-r0.1.0',
    eligiblePurposes: ['progression', 'verification', 'review'],
  }
}

function readyProgress() {
  const progress = createDefaultQuestProgress(NOW)
  progress.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 4, 3)
  progress.skillProgress['g3-context-cavern-vocabulary'] = createInitialSkillProgress('g3-context-cavern-vocabulary', 2, 1)
  progress.plannedNextQuest = {
    status: 'content_needed',
    purpose: 'progression',
    skillId: 'g3-context-cavern-vocabulary',
    difficulty: 2,
    reason: 'Stored before Root Meaning Vault existed.',
  }
  progress.totalXp = 1900
  progress.totalStars = 64
  return progress
}

describe('Grade 3 Root Meaning Vault architecture', () => {
  test('registers only the bounded ELA.3.V.1.2 benchmark patterns', () => {
    expect(getExpectedBenchmarkPatterns('ELA.3.V.1.2')).toEqual([
      'greek-roots',
      'latin-roots',
      'base-words',
      'affixes',
      'unfamiliar-word-meaning',
    ])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-context-cavern-root-meaning-vault' },
      passages: [], lessons: [], questions: [],
    } as unknown as ContentPack
    expect(buildRootMeaningGuideAudit(pack)).toEqual([{
      code: 'missing_root_meaning_guide',
      itemIdentifier: 'g3-context-cavern-root-meaning-vault',
      message: 'Root Meaning Vault requires authored root-meaning guides.',
    }])
  })

  test('keeps the unauthored Unit 2 boundary fail-closed and makes authored fixture work live', () => {
    const progress = readyProgress()
    expect(selectNextLesson({
      skillId: 'g3-context-cavern-vocabulary',
      difficulty: 2,
      purpose: 'progression',
      availableLessons: getLessonCandidates(),
      recentActivityUsage: [],
      preferredUnitId: 'g3-cc-unit-2',
      preferredContentVersion: 'g3-cc-root-meaning-r0.1.0',
    })).toMatchObject({
      status: 'content_needed',
      purpose: 'progression',
      skillId: 'g3-context-cavern-vocabulary',
      difficulty: 2,
    })

    const lesson = unitTwoFixture()
    const normalized = normalizePlannedNextQuest(progress, [lesson])
    expect(normalized).toMatchObject({ changed: true, state: { plannedNextQuest: null, totalXp: 1900, totalStars: 64 } })
    expect(planGlobalQuest({ progress: normalized.state, availableLessons: [lesson], now: NOW })).toMatchObject({
      status: 'available',
      purpose: 'progression',
      lesson: { skillId: 'g3-context-cavern-vocabulary', unitId: 'g3-cc-unit-2', difficulty: 2, contentVersion: 'g3-cc-root-meaning-r0.1.0' },
    })
  })

  test('keeps Unit 1, Unit 2, and Grade 2 review identities isolated', () => {
    const grade2 = buildReviewQueueIdentity({ skillId: 'g2-context-cavern-vocabulary', difficulty: 2, unitId: 'cc-unit-2', contentVersion: 'g2-cc-morphology-r0.1.0' })
    const unit1 = buildReviewQueueIdentity({ skillId: 'g3-context-cavern-vocabulary', difficulty: 1, unitId: 'g3-cc-unit-1', contentVersion: 'g3-cc-academic-word-r0.1.0' })
    const unit2 = buildReviewQueueIdentity({ skillId: 'g3-context-cavern-vocabulary', difficulty: 2, unitId: 'g3-cc-unit-2', contentVersion: 'g3-cc-root-meaning-r0.1.0' })
    expect(sameReviewQueueIdentity(grade2, unit2)).toBe(false)
    expect(sameReviewQueueIdentity(unit1, unit2)).toBe(false)
  })
})
