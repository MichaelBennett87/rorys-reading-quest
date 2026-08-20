import { grade2WordForgeVariableVowelsOoEaPack } from './grade2/wordForge/variableVowelsOoEa'
import { grade2WordForgeVariableVowelsOuOiOyOwPack } from './grade2/wordForge/variableVowelsOuOiOyOw'
import { legacyDevelopmentPack } from './legacyDevelopmentPack'
import type { ContentPack } from './contentPackTypes'
import type { ContentSample } from '../types'
import { buildBenchmarkCoverageAudit } from './benchmarkCoverageAudit'
import { buildContentPackAudit } from './contentPackAudit'

export const contentPacks: readonly ContentPack[] = [
  grade2WordForgeVariableVowelsOoEaPack,
  grade2WordForgeVariableVowelsOuOiOyOwPack,
  legacyDevelopmentPack,
]

export const sampleContent: ContentSample = aggregateSampleContent(contentPacks)

export const contentPackAudit = buildContentPackAudit(contentPacks)
export const benchmarkCoverageAudit = buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3a')

function aggregateSampleContent(packs: readonly ContentPack[]): ContentSample {
  return {
    passages: packs.flatMap((pack) => pack.passages.map((passage) => structuredClone(passage))),
    questions: packs.flatMap((pack) => pack.questions.map((question) => structuredClone(question))),
  }
}
