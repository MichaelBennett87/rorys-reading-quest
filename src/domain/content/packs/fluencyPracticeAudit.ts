import type { ContentPack } from './contentPackTypes'

export interface FluencyPracticeAuditIssue {
  code:
    | 'missing_supporting_benchmark_reference'
    | 'missing_support_component'
    | 'support_component_mismatch'
    | 'measurement_limitation_missing'
  message: string
  itemIdentifier: string
}

export interface FluencyPracticeAudit {
  supportingBenchmarkReference: 'ELA.2.F.1.4'
  expectedSupportComponents: string[]
  providedSupportComponents: string[]
  missingSupportComponents: string[]
  contributingPackIds: string[]
  supportStatus: 'partial' | 'supportive_practice'
  reviewStatus: 'DRAFT' | 'REVIEWED' | 'APPROVED'
  oralReadingMeasured: false
  timerUsed: false
  microphoneUsed: false
  issues: FluencyPracticeAuditIssue[]
}

const EXPECTED_SUPPORT_COMPONENTS = [
  'model-reading',
  'phrase-cued-reading',
  'punctuation-pauses',
  'question-expression',
  'exclamation-expression',
  'dialogue-expression',
  'repeated-reading',
  'self-monitoring',
  'understanding-check',
]

export function buildFluencyPracticeAudit(packs: readonly ContentPack[]): FluencyPracticeAudit {
  const contributingPacks = packs.filter((pack) => (
    pack.manifest.coverageKind === 'supportive_practice'
    && pack.manifest.supportingBenchmarkReferences?.includes('ELA.2.F.1.4')
  ))
  const providedSupportComponents = new Set<string>()
  const issues: FluencyPracticeAuditIssue[] = []

  for (const pack of contributingPacks) {
    for (const component of pack.manifest.coveredSupportComponents ?? []) {
      providedSupportComponents.add(component)
    }
    if (!pack.manifest.partialBenchmarkCoverage.trim()) {
      issues.push({
        code: 'measurement_limitation_missing',
        message: 'Supportive practice packs must explain their measurement limitation.',
        itemIdentifier: pack.manifest.packId,
      })
    }
  }

  const missingSupportComponents = EXPECTED_SUPPORT_COMPONENTS.filter((component) => !providedSupportComponents.has(component))
  for (const component of missingSupportComponents) {
    issues.push({
      code: 'missing_support_component',
      message: `Missing fluency support component: ${component}.`,
      itemIdentifier: 'ELA.2.F.1.4',
    })
  }

  return {
    supportingBenchmarkReference: 'ELA.2.F.1.4',
    expectedSupportComponents: [...EXPECTED_SUPPORT_COMPONENTS],
    providedSupportComponents: [...providedSupportComponents].sort((left, right) => left.localeCompare(right)),
    missingSupportComponents,
    contributingPackIds: contributingPacks.map((pack) => pack.manifest.packId),
    supportStatus: missingSupportComponents.length === 0 ? 'supportive_practice' : 'partial',
    reviewStatus: 'DRAFT',
    oralReadingMeasured: false,
    timerUsed: false,
    microphoneUsed: false,
    issues,
  }
}
