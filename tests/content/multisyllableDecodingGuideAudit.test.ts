import { describe, expect, test } from 'vitest'

import { getLessonCandidates } from '../../src/domain/lesson'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../../src/persistence'
import { planUnitQuest } from '../../src/domain/progression'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../../src/domain/progression/reviewQueueAffinity'
import {
  buildMultisyllableDecodingGuideAudit,
  grade3WordForgeSuffixShifterPack,
  type ContentPack,
} from '../../src/domain/content/packs'

const NOW = '2026-08-24T12:00:00.000Z'

describe('Multisyllable Mountain architecture gate', () => {
  test('returns structured missing-guide issues without affecting Suffix Shifter', () => {
    expect(buildMultisyllableDecodingGuideAudit(grade3WordForgeSuffixShifterPack)).toEqual([])
    const fixture: ContentPack = {
      ...grade3WordForgeSuffixShifterPack,
      manifest: {
        ...grade3WordForgeSuffixShifterPack.manifest,
        packId: 'g3-word-forge-multisyllable-mountain',
        unitId: 'g3-wg-unit-3',
        difficultyRange: [2, 3],
        coveredPatterns: ['multisyllabic-decoding'],
      },
      multisyllableDecodingGuides: [],
    }
    const issues = buildMultisyllableDecodingGuideAudit(fixture)
    expect(issues.some((issue) => issue.code === 'missing_multisyllable_decoding_guide')).toBe(true)
    expect(issues.some((issue) => issue.code === 'multisyllable_decoding_guide_count_mismatch')).toBe(true)
  })

  test('keeps a fixture Trail 3 checkpoint locked until Suffix Shifter is complete', () => {
    const initial = createDefaultQuestProgress(NOW)
    const suffixReady: QuestProgressV1 = {
      ...initial,
      skillProgress: {
        ...initial.skillProgress,
        'g2-word-forge-word-practice': {
          ...initial.skillProgress['g2-word-forge-word-practice'],
          currentDifficulty: 8,
        },
        'g3-word-forge-word-analysis': {
          skillId: 'g3-word-forge-word-analysis',
          currentDifficulty: 2,
          lastMasteredDifficulty: 1,
          currentLearningState: 'ADVANCE',
          qualifyingIndependentActivityIds: [],
          consecutiveUnsuccessfulAtCurrentDifficulty: 0,
          lastCompletedActivityId: null,
          recentActivityUsage: [],
          reviewStep: 0,
          nextReviewDate: null,
          lastDecisionReasonCodes: ['advanced'],
          remediationContext: null,
        },
      },
    }
    const suffixCheckpoint = getLessonCandidates().find((lesson) => (
      lesson.unitId === 'g3-wg-unit-2' && lesson.eligiblePurposes.includes('progression')
    ))
    expect(suffixCheckpoint).toBeDefined()
    if (!suffixCheckpoint) return
    const mountainFixture = {
      ...suffixCheckpoint,
      lessonId: 'fixture-multisyllable-mountain-checkpoint',
      activityId: 'fixture-multisyllable-mountain-checkpoint-activity',
      unitId: 'g3-wg-unit-3',
      difficulty: 3,
      contentVersion: 'fixture-multisyllable-mountain-r0.0.0',
    }
    const availableLessons = [...getLessonCandidates(), mountainFixture]

    expect(planUnitQuest({ selectedUnitId: 'g3-wg-unit-3', progress: suffixReady, availableLessons })).toMatchObject({
      status: 'locked',
      reason: 'Complete Suffix Shifter to unlock Multisyllable Mountain.',
    })
    suffixReady.skillProgress['g3-word-forge-word-analysis'].currentDifficulty = 3
    suffixReady.skillProgress['g3-word-forge-word-analysis'].lastMasteredDifficulty = 2
    expect(planUnitQuest({ selectedUnitId: 'g3-wg-unit-3', progress: suffixReady, availableLessons })).toMatchObject({
      status: 'available',
      lesson: { unitId: 'g3-wg-unit-3', difficulty: 3 },
    })
  })

  test('keeps Grade 2, Root Reactor, Suffix Shifter, and Mountain review identities distinct', () => {
    const identities = [
      buildReviewQueueIdentity({ skillId: 'g2-word-forge-word-practice', difficulty: 8, unitId: 'wg-unit-5', contentVersion: 'g2-wf-silent-letters-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-word-forge-word-analysis', difficulty: 1, unitId: 'g3-wg-unit-1', contentVersion: 'g3-wf-root-reactor-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-word-forge-word-analysis', difficulty: 2, unitId: 'g3-wg-unit-2', contentVersion: 'g3-wf-suffix-shifter-r0.1.0' }),
      buildReviewQueueIdentity({ skillId: 'g3-word-forge-word-analysis', difficulty: 3, unitId: 'g3-wg-unit-3', contentVersion: 'g3-wf-multisyllable-mountain-r0.1.0' }),
    ]
    expect(new Set(identities.map((identity) => JSON.stringify(identity))).size).toBe(4)
    for (let left = 0; left < identities.length; left += 1) {
      for (let right = left + 1; right < identities.length; right += 1) {
        expect(sameReviewQueueIdentity(identities[left], identities[right])).toBe(false)
      }
    }
  })
})
