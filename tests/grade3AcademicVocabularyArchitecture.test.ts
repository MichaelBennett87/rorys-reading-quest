import { describe, expect, test } from 'vitest'

import { buildGrade3AcademicVocabularyGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import {
  areTrackPrerequisitesSatisfied,
  ensureProgressForPlayableTracks,
  getTrackByTrackId,
  normalizePlannedNextQuest,
  planGlobalQuest,
} from '../src/domain/curriculum'
import { getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress, type LessonActivityCandidate } from '../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../src/domain/progression/reviewQueueAffinity'
import { createDefaultQuestProgress } from '../src/persistence'

const NOW = '2026-08-30T14:00:00.000Z'

function fixtureCandidate(): LessonActivityCandidate {
  const source = getLessonCandidates().find((candidate) => candidate.skillId === 'g2-context-cavern-vocabulary')
  if (!source) throw new Error('Grade 2 Context Cavern fixture lesson is required.')
  return {
    ...source,
    gradeBand: 3,
    skillId: 'g3-context-cavern-vocabulary',
    worldId: 'context-cavern',
    unitId: 'g3-cc-unit-1',
    difficulty: 1,
    lessonId: 'g3-cc-academic-word-fixture-lesson',
    activityId: 'g3-cc-academic-word-fixture-activity',
    packId: 'g3-context-cavern-academic-word-workshop',
    contentVersion: 'g3-cc-academic-word-r0.1.0',
    eligiblePurposes: ['progression', 'verification', 'review'],
  }
}

describe('Grade 3 Academic Word Workshop architecture', () => {
  test('registers only the bounded ELA.3.V.1.1 supportive-practice patterns', () => {
    expect(getExpectedBenchmarkPatterns('ELA.3.V.1.1')).toEqual([
      'grade-level-academic-vocabulary',
      'appropriate-use',
      'speaking-writing-support',
      'no-open-response-scoring',
    ])
    expect(getTrackByTrackId('g3-context-cavern-vocabulary')).toMatchObject({
      status: 'active',
      entryUnitId: 'g3-cc-unit-1',
      initialDifficulty: 1,
      initialLastMasteredDifficulty: 0,
      completionDifficulty: 4,
      prerequisiteTrackIds: ['g2-context-cavern-vocabulary'],
    })
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-context-cavern-academic-word-workshop' },
      passages: [], lessons: [], questions: [],
    } as unknown as ContentPack
    expect(buildGrade3AcademicVocabularyGuideAudit(pack)).toEqual([{
      code: 'missing_grade3_academic_vocabulary_guide',
      itemIdentifier: 'g3-context-cavern-academic-word-workshop',
      message: 'Academic Word Workshop Grade 3 requires authored Grade 3 academic-vocabulary guides.',
    }])
  })

  test('does not initialize before the Grade 2 prerequisite and initializes exactly once after readiness', () => {
    const track = getTrackByTrackId('g3-context-cavern-vocabulary')!
    const lesson = fixtureCandidate()
    const locked = createDefaultQuestProgress(NOW)
    expect(areTrackPrerequisitesSatisfied(track, locked)).toBe(false)
    expect(ensureProgressForPlayableTracks(locked, [lesson])).toMatchObject({ changed: false })
    expect(locked.skillProgress['g3-context-cavern-vocabulary']).toBeUndefined()

    const ready = createDefaultQuestProgress(NOW)
    ready.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 4, 3)
    ready.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: 'g3-context-cavern-vocabulary', difficulty: 1, reason: 'Old Grade 3 Context Cavern boundary.' }
    ready.totalXp = 1500
    ready.totalStars = 50
    const ensured = ensureProgressForPlayableTracks(ready, [lesson])
    expect(ensured).toMatchObject({
      changed: true,
      state: {
        totalXp: 1500,
        totalStars: 50,
        skillProgress: { 'g3-context-cavern-vocabulary': { currentDifficulty: 1, lastMasteredDifficulty: 0 } },
      },
    })
    const repeated = ensureProgressForPlayableTracks(ensured.state, [lesson])
    expect(repeated.changed).toBe(false)
    const normalized = normalizePlannedNextQuest(repeated.state, [lesson])
    expect(normalized).toMatchObject({ changed: true, state: { plannedNextQuest: null, totalXp: 1500, totalStars: 50 } })
    expect(planGlobalQuest({ progress: normalized.state, availableLessons: [lesson], now: NOW })).toMatchObject({
      status: 'available',
      purpose: 'progression',
      lesson: { skillId: 'g3-context-cavern-vocabulary', unitId: 'g3-cc-unit-1', difficulty: 1 },
    })
  })

  test('keeps Grade 2 and Grade 3 Context Cavern review ownership isolated', () => {
    const grade2 = buildReviewQueueIdentity({ skillId: 'g2-context-cavern-vocabulary', difficulty: 1, unitId: 'cc-unit-1', contentVersion: 'g2-cc-academic-word-r0.1.0' })
    const grade3 = buildReviewQueueIdentity({ skillId: 'g3-context-cavern-vocabulary', difficulty: 1, unitId: 'g3-cc-unit-1', contentVersion: 'g3-cc-academic-word-r0.1.0' })
    expect(sameReviewQueueIdentity(grade2, grade3)).toBe(false)
  })
})
