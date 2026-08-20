import { describe, expect, test } from 'vitest'

import { createAssistanceEvent, mapAssistanceToCheckpoint, summarizeAssistance } from '../../src/domain/assistance'

const events = [
  createAssistanceEvent({
    sessionId: 'session-a',
    lessonId: 'lesson-a',
    activityId: 'activity-a',
    questionId: 'question-a',
    targetId: 'target-a',
    kind: 'PATTERN_HIGHLIGHT',
    level: 1,
    timestamp: '2026-08-20T12:00:00.000Z',
    existingEvents: [],
  }).event!,
  createAssistanceEvent({
    sessionId: 'session-a',
    lessonId: 'lesson-a',
    activityId: 'activity-a',
    questionId: 'question-a',
    targetId: 'target-a',
    kind: 'SPEAK_CHUNKS',
    level: 3,
    timestamp: '2026-08-20T12:00:01.000Z',
    existingEvents: [],
  }).event!,
  createAssistanceEvent({
    sessionId: 'session-a',
    lessonId: 'lesson-a',
    activityId: 'activity-a',
    questionId: 'question-a',
    targetId: 'target-b',
    kind: 'SPEAK_WORD',
    level: 5,
    timestamp: '2026-08-20T12:00:02.000Z',
    existingEvents: [],
  }).event!,
  createAssistanceEvent({
    sessionId: 'session-a',
    lessonId: 'lesson-a',
    activityId: 'activity-a',
    questionId: 'question-a',
    targetId: 'target-b',
    kind: 'SPEAK_SENTENCE',
    level: 6,
    timestamp: '2026-08-20T12:00:03.000Z',
    existingEvents: [],
  }).event!,
]

describe('assistance domain helpers', () => {
  test('creates stable unique assistance identities', () => {
    const duplicate = createAssistanceEvent({
      sessionId: 'session-a',
      lessonId: 'lesson-a',
      activityId: 'activity-a',
      questionId: 'question-a',
      targetId: 'target-a',
      kind: 'PATTERN_HIGHLIGHT',
      level: 1,
      timestamp: '2026-08-20T12:00:04.000Z',
      existingEvents: events,
    })
    expect(duplicate.added).toBe(false)
    expect(duplicate.duplicateIdentity).toBe(true)
  })

  test('summarizes assistance and maps it for progression', () => {
    const summary = summarizeAssistance(events)
    expect(summary.totalUniqueEvents).toBe(4)
    expect(summary.targetsHelped).toBe(2)
    expect(summary.maximumAssistanceLevel).toBe(6)
    expect(summary.visualHintUsed).toBe(true)
    expect(summary.spokenChunkHelpUsed).toBe(true)
    expect(summary.spokenWordHelpUsed).toBe(true)
    expect(summary.sentenceReadAloudUsed).toBe(true)

    const checkpoint = mapAssistanceToCheckpoint(events)
    expect(checkpoint).toEqual({
      hintsUsed: 1,
      majorHintsUsed: 2,
      sentenceReadAloudUsed: true,
    })
  })
})
