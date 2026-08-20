import { createInitialSkillProgress } from '../domain/progression'
import type { QuestProgressV1 } from './questProgressTypes'

export const DEFAULT_SKILL_ID = 'g2-word-forge-word-practice'

export function createDefaultQuestProgress(timestamp: string): QuestProgressV1 {
  return {
    schemaVersion: 1,
    learnerId: 'local-learner',
    totalXp: 120,
    totalStars: 8,
    completedSessionCount: 0,
    skillProgress: {
      [DEFAULT_SKILL_ID]: createInitialSkillProgress(DEFAULT_SKILL_ID, 1, 0),
    },
    completedAttempts: [],
    recentActivityUsage: {},
    reviewQueue: [],
    activeLessonSession: null,
    plannedNextQuest: null,
    lastProgressionOutcome: null,
    metadata: { createdAt: timestamp, updatedAt: timestamp },
  }
}
