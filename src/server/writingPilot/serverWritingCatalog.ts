import { getWritingPilotActivity, getWritingPilotPassage } from '../../domain/writingPilot'

export interface ServerWritingRubric {
  rubricVersion: string
  requiredIdeas: string[]
  relevantEvidence: Array<{ evidenceId: string; description: string }>
  acceptableParaphrases: string[]
  contradictionsOrOmissions: string[]
  validResponseExamples: string[]
  mechanicsSeparatedExamples: string[]
}

const rubrics: Record<string, ServerWritingRubric> = {
  'rw-rubric-tia-r1': rubric('rw-rubric-tia-r1', ['Tia acted before the wind could scatter the light wrappers.'], ['The wind was starting to lift light trash.'], ['She picked up the light pieces first so they would not blow away.'], ['Claims she chose them because they were heaviest.']),
  'rw-rubric-tia-r2': rubric('rw-rubric-tia-r2', ['The neighbors worked together to collect and sort the trash.'], ['Neighbors followed Tia’s plan and cleared the sidewalk.'], ['They shared jobs and removed the litter.'], ['Claims one person solved the problem alone.']),
  'rw-rubric-bridge-r1': rubric('rw-rubric-bridge-r1', ['Carlos used a brace to support the weak beam.'], ['The bridge sagged or wobbled before the brace was added.'], ['He wanted to make the weak part steadier.'], ['Says the brace was decoration.']),
  'rw-rubric-bridge-r2': rubric('rw-rubric-bridge-r2', ['The repaired bridge stayed steady during the story’s test.'], ['Carlos and Emmi tested the bridge after adding the brace.'], ['It held steady when they tested it.'], ['Says they never tested the repair.']),
  'rw-rubric-jalen-r1': rubric('rw-rubric-jalen-r1', ['Jalen recognized that Mara’s plan could fix the bent marker safely or effectively.'], ['Mara proposed a different approach after Jalen’s first effort did not work.'], ['He listened because her idea could solve the problem.'], ['Claims he ignored Mara.']),
  'rw-rubric-jalen-r2': rubric('rw-rubric-jalen-r2', ['Jalen changed from insisting on his own approach to listening and working with Mara.'], ['His first effort contrasts with his later cooperation.'], ['He learned to accept help and try a teammate’s idea.'], ['Claims his behavior never changed.']),
}

export function resolveServerWritingTask(input: { activityId: string; sourceContentVersion: string; rubricVersion: string }) {
  const activity = getWritingPilotActivity(input.activityId)
  if (!activity || activity.sourceContentVersion !== input.sourceContentVersion || activity.rubricVersion !== input.rubricVersion) return null
  const passage = getWritingPilotPassage(activity)
  const rubric = rubrics[input.rubricVersion]
  if (!passage || !rubric) return null
  return { activity, passageTitle: passageTitle(passage), passageText: passageText(passage), rubric }
}

function rubric(version: string, requiredIdeas: string[], evidence: string[], paraphrases: string[], contradictions: string[]): ServerWritingRubric {
  return {
    rubricVersion: version,
    requiredIdeas,
    relevantEvidence: evidence.map((description, index) => ({ evidenceId: `${version}-e${index + 1}`, description })),
    acceptableParaphrases: paraphrases,
    contradictionsOrOmissions: contradictions,
    validResponseExamples: paraphrases,
    mechanicsSeparatedExamples: paraphrases.map((example) => example.toLowerCase().replace(/[.?!]$/, '')),
  }
}

function passageTitle(passage: unknown): string {
  const value = passage as Record<string, unknown>
  for (const key of ['title', 'passageTitle', 'heading']) if (typeof value[key] === 'string') return value[key] as string
  return 'Reading passage'
}

function passageText(value: unknown, key = ''): string {
  if (typeof value === 'string') return ['text', 'paragraph', 'content', 'lines', 'caption'].some((part) => key.toLowerCase().includes(part)) ? value : ''
  if (Array.isArray(value)) return value.map((entry) => passageText(entry, key)).filter(Boolean).join('\n')
  if (!value || typeof value !== 'object') return ''
  return Object.entries(value as Record<string, unknown>).map(([childKey, child]) => passageText(child, childKey)).filter(Boolean).join('\n')
}
