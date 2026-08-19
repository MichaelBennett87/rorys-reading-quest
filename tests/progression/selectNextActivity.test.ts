import { describe, expect, test } from 'vitest'

import { selectNextActivity } from '../../src/domain/progression/selectNextActivity'
import { sampleContent } from '../../src/domain/content/sampleContent'

const targetActivities = sampleContent.questions
    .filter((q) => q.skillIdentifier === 'g2-word-forge-word-practice' && q.difficulty === 1)
  .map((q) => ({
    activityIdentifier: q.activityIdentifier,
    skillIdentifier: q.skillIdentifier,
    difficulty: q.difficulty,
    passageIdentifier: q.passageIdentifier,
    questionIdentifier: q.questionIdentifier,
  }))

describe('selectNextActivity', () => {
  test('excludes recently used activities', () => {
    const decision = selectNextActivity({
      skillIdentifier: 'g2-word-forge-word-practice',
      difficulty: 1,
      availableActivities: targetActivities,
      recentActivityUsage: [
        { ...targetActivities[0], },
      ],
    })

    expect(decision.status).toBe('selected')
    expect(decision.activity?.activityIdentifier).not.toBe(targetActivities[0].activityIdentifier)
  })

  test('does not immediately repeat same passage-question combination', () => {
    const decision = selectNextActivity({
      skillIdentifier: 'g2-word-forge-word-practice',
      difficulty: 1,
      availableActivities: targetActivities,
      recentActivityUsage: [
        {
          activityIdentifier: 'act-other',
          skillIdentifier: 'g2-word-forge-vowel-patterns',
          difficulty: 1,
          passageIdentifier: targetActivities[1].passageIdentifier,
          questionIdentifier: targetActivities[1].questionIdentifier,
        },
        { ...targetActivities[1] },
      ],
    })

    expect(decision.status).toBe('selected')
    expect(decision.activity?.activityIdentifier).not.toBe(targetActivities[1].activityIdentifier)
  })

  test('reports when no fresh variant is available', () => {
    const decision = selectNextActivity({
      skillIdentifier: 'g2-word-forge-word-practice',
      difficulty: 1,
      availableActivities: targetActivities,
      recentActivityUsage: targetActivities,
    })

    expect(decision.status).toBe('unavailable')
    expect(decision.reason).toContain('No fresh eligible variant')
    expect(decision.nextDeterministicFallbackActivityIdentifier).toBe(targetActivities[0].activityIdentifier)
  })
})
