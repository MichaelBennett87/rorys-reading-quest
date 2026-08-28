import { describe, expect, test } from 'vitest'

import type { LessonActivityCandidate, RecentLessonActivityUsage } from '../../src/domain/progression'
import { selectNextLesson, selectNextLessonWithDiagnostics } from '../../src/domain/progression'

const candidates: LessonActivityCandidate[] = [
  {
    lessonId: 'lesson-b', activityId: 'activity-b', skillId: 'skill-a', gradeBand: 2, difficulty: 1,
    worldId: 'word-forge', unitId: 'wg-unit-1', packId: 'pack-a', benchmarkReferences: ['ELA.2.F.1.3a'],
    eligiblePurposes: ['progression'], passageQuestionKeys: ['passage-b::question-b'], contentVersion: 'v1',
  },
  {
    lessonId: 'lesson-a', activityId: 'activity-a', skillId: 'skill-a', gradeBand: 2, difficulty: 1,
    worldId: 'word-forge', unitId: 'wg-unit-1', packId: 'pack-a', benchmarkReferences: ['ELA.2.F.1.3a'],
    eligiblePurposes: ['progression'], passageQuestionKeys: ['passage-a::question-a'], contentVersion: 'v1',
  },
]

const usage = (candidate: LessonActivityCandidate): RecentLessonActivityUsage => ({
  ...candidate,
  completedAt: '2026-08-20T12:00:00.000Z',
})

describe('selectNextLesson', () => {
  test('is deterministic and excludes the most recent activity', () => {
    const first = selectNextLesson({
      skillId: 'skill-a', difficulty: 1, purpose: 'progression', availableLessons: candidates,
      recentActivityUsage: [],
    })
    expect(first.status).toBe('available')
    if (first.status === 'available') expect(first.lesson.activityId).toBe('activity-a')

    const next = selectNextLesson({
      skillId: 'skill-a', difficulty: 1, purpose: 'progression', availableLessons: candidates,
      recentActivityUsage: [usage(candidates[1])],
    })
    expect(next.status).toBe('available')
    if (next.status === 'available') expect(next.lesson.activityId).toBe('activity-b')
  })

  test('keeps a new activity available when passage overlap is the only remaining option', () => {
    const repeatedPair = { ...candidates[0], activityId: 'activity-c' }
    const selected = selectNextLessonWithDiagnostics({
      skillId: 'skill-a', difficulty: 1, purpose: 'progression', availableLessons: [repeatedPair],
      recentActivityUsage: [usage(candidates[0])],
    })
    expect(selected.plan.status).toBe('available')
    expect(selected.selection).toMatchObject({ selectionMode: 'fresh_with_overlap', overlapCount: 1 })
  })

  test('recycles a compatible lesson and permits a sole immediate repeat without returning content-needed', () => {
    const selected = selectNextLessonWithDiagnostics({
      skillId: 'skill-a', difficulty: 1, purpose: 'progression', availableLessons: candidates,
      recentActivityUsage: candidates.map(usage),
    })
    expect(selected.plan.status).toBe('available')
    expect(selected.selection?.selectionMode).toBe('recycled')

    const sole = selectNextLessonWithDiagnostics({
      skillId: 'skill-a', difficulty: 1, purpose: 'progression', availableLessons: [candidates[0]],
      recentActivityUsage: [usage(candidates[0])],
    })
    expect(sole.plan.status).toBe('available')
    expect(sole.selection?.selectionMode).toBe('sole_candidate_repeat')
  })
})
