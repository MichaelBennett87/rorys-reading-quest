import { describe, expect, test } from 'vitest'

import { getLessonCandidates } from '../../src/domain/lesson'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../../src/persistence'
import { planUnitQuest } from '../../src/domain/progression'
import {
  buildDerivationalSuffixGuideAudit,
  grade3WordForgeRootReactorPack,
  type ContentPack,
} from '../../src/domain/content/packs'

const NOW = '2026-08-24T12:00:00.000Z'

describe('Suffix Shifter architecture gate', () => {
  test('returns structured missing-guide issues without affecting Root Reactor', () => {
    expect(buildDerivationalSuffixGuideAudit(grade3WordForgeRootReactorPack)).toEqual([])
    const fixture: ContentPack = {
      ...grade3WordForgeRootReactorPack,
      manifest: {
        ...grade3WordForgeRootReactorPack.manifest,
        packId: 'g3-word-forge-suffix-shifter',
        unitId: 'g3-wg-unit-2',
        coveredPatterns: ['derivational-suffix-decoding', 'part-of-speech-change'],
      },
      derivationalSuffixGuides: [],
    }
    const issues = buildDerivationalSuffixGuideAudit(fixture)
    expect(issues.some((issue) => issue.code === 'missing_derivational_suffix_guide')).toBe(true)
    expect(issues.some((issue) => issue.code === 'derivational_suffix_guide_count_mismatch')).toBe(true)
  })

  test('keeps a fixture Suffix Shifter checkpoint locked until Root Reactor is complete', () => {
    const initial = createDefaultQuestProgress(NOW)
    const readyForGrade3: QuestProgressV1 = {
      ...initial,
      skillProgress: {
        ...initial.skillProgress,
        'g2-word-forge-word-practice': {
          ...initial.skillProgress['g2-word-forge-word-practice'],
          currentDifficulty: 8,
        },
      },
    }
    const rootCheckpoint = getLessonCandidates().find((lesson) => (
      lesson.unitId === 'g3-wg-unit-1' && lesson.eligiblePurposes.includes('progression')
    ))
    expect(rootCheckpoint).toBeDefined()
    if (!rootCheckpoint) return
    const suffixFixture = {
      ...rootCheckpoint,
      lessonId: 'fixture-suffix-shifter-checkpoint',
      activityId: 'fixture-suffix-shifter-checkpoint-activity',
      unitId: 'g3-wg-unit-2',
      difficulty: 2,
      contentVersion: 'fixture-suffix-shifter-r0.0.0',
    }
    expect(planUnitQuest({
      selectedUnitId: 'g3-wg-unit-2',
      progress: readyForGrade3,
      availableLessons: [...getLessonCandidates(), suffixFixture],
    })).toMatchObject({
      status: 'locked',
      reason: 'Complete Root Reactor to unlock Suffix Shifter.',
    })
  })
})
