import { describe, expect, it } from 'vitest'
import {
  getWritingPilotActivity,
  getWritingPilotPassage,
  validateWritingPilotCatalog,
  writingPilotActivities,
} from '../src/domain/writingPilot'

describe('Read & Write supplemental catalog', () => {
  it('contains six DRAFT activities over exactly three existing passages', () => {
    expect(validateWritingPilotCatalog()).toEqual([])
    expect(writingPilotActivities).toHaveLength(6)
    expect(new Set(writingPilotActivities.map((activity) => activity.sourcePassageId)).size).toBe(3)
    expect(writingPilotActivities.every((activity) => activity.reviewStatus === 'DRAFT')).toBe(true)
  })

  it('keeps every prompt source-bound and outside the scored question registry', () => {
    for (const activity of writingPilotActivities) {
      expect(activity.prompt).toMatch(/one sentence/i)
      expect(activity.prompt).toMatch(/detail|evidence/i)
      expect(getWritingPilotPassage(activity)).not.toBeNull()
      expect(getWritingPilotActivity(activity.activityId)).toEqual(activity)
    }
    expect(writingPilotActivities.map((activity) => activity.activityId)).toEqual([
      'rw-g2-tia-wrappers-reason',
      'rw-g2-tia-solution',
      'rw-g2-bridge-brace-reason',
      'rw-g2-bridge-proof',
      'rw-g3-jalen-new-plan',
      'rw-g3-jalen-change',
    ])
  })
})
