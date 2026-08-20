import type { AssistanceEvent, AssistanceSummary } from './assistanceTypes'

const VISUAL_LEVELS = new Set<number>([1, 2])
const MAJOR_LEVELS = new Set<number>([3, 4, 5])

export function summarizeAssistance(events: readonly AssistanceEvent[]): AssistanceSummary {
  const unique = dedupeAssistanceEvents(events)
  const levels = unique.map((event) => event.assistanceLevel)
  const maxLevel = Math.max(0, ...levels)
  const targetsHelped = new Set(unique.map((event) => event.targetId)).size

  return {
    totalUniqueEvents: unique.length,
    targetsHelped,
    maximumAssistanceLevel: maxLevel as AssistanceSummary['maximumAssistanceLevel'],
    visualHintUsed: unique.some((event) => VISUAL_LEVELS.has(event.assistanceLevel)),
    spokenChunkHelpUsed: unique.some((event) => event.assistanceKind === 'SPEAK_CHUNKS'),
    spokenWordHelpUsed: unique.some((event) => ['SPEAK_BLEND', 'SPEAK_WORD'].includes(event.assistanceKind)),
    sentenceReadAloudUsed: unique.some((event) => event.assistanceKind === 'SPEAK_SENTENCE'),
  }
}

export function mapAssistanceToCheckpoint(
  events: readonly AssistanceEvent[],
): { hintsUsed: number; majorHintsUsed: number; sentenceReadAloudUsed: boolean } {
  const unique = dedupeAssistanceEvents(events)
  const uniqueLevels = new Set(unique.map((event) => `${event.targetId}:${event.assistanceLevel}`))
  let hintsUsed = 0
  let majorHintsUsed = 0

  for (const eventKey of uniqueLevels) {
    const level = Number(eventKey.split(':')[1]) as 1 | 2 | 3 | 4 | 5 | 6
    if (VISUAL_LEVELS.has(level)) hintsUsed += 1
    if (MAJOR_LEVELS.has(level)) majorHintsUsed += 1
  }

  return {
    hintsUsed,
    majorHintsUsed,
    sentenceReadAloudUsed: unique.some((event) => event.assistanceKind === 'SPEAK_SENTENCE'),
  }
}

function dedupeAssistanceEvents(events: readonly AssistanceEvent[]): AssistanceEvent[] {
  const map = new Map<string, AssistanceEvent>()
  for (const event of events) {
    const key = `${event.sessionId}::${event.targetId}::${event.assistanceKind}`
    if (!map.has(key)) map.set(key, event)
  }
  return [...map.values()]
}
