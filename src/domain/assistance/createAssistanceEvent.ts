import type { AssistanceEvent, AssistanceInput } from './assistanceTypes'

export interface CreateAssistanceEventResult {
  event: AssistanceEvent | null
  added: boolean
  duplicateIdentity: boolean
}

const DELIMITER = '::'

export function makeAssistanceEventId(
  sessionId: string,
  targetId: string,
  assistanceKind: AssistanceEvent['assistanceKind'],
): string {
  return `${sessionId}${DELIMITER}${targetId}${DELIMITER}${assistanceKind}`
}

export function createAssistanceEvent(input: AssistanceInput): CreateAssistanceEventResult {
  const eventId = makeAssistanceEventId(input.sessionId, input.targetId, input.kind)
  const existing = input.existingEvents.some((entry) => entry.eventId === eventId)
  if (existing) {
    return {
      event: null,
      added: false,
      duplicateIdentity: true,
    }
  }

  return {
    event: {
      eventId,
      sessionId: input.sessionId,
      lessonId: input.lessonId,
      activityId: input.activityId,
      questionId: input.questionId,
      targetId: input.targetId,
      assistanceKind: input.kind,
      assistanceLevel: input.level,
      occurredAt: input.timestamp,
    },
    added: true,
    duplicateIdentity: false,
  }
}
