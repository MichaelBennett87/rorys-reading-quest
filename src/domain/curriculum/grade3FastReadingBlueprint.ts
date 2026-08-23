export const grade3FastReadingBlueprint = deepFreeze({
  assessedBenchmarkReferences: [
    'ELA.3.R.1.1', 'ELA.3.R.1.2', 'ELA.3.R.1.3', 'ELA.3.R.1.4',
    'ELA.3.R.2.1', 'ELA.3.R.2.2', 'ELA.3.R.2.3', 'ELA.3.R.2.4',
    'ELA.3.R.3.1', 'ELA.3.R.3.2', 'ELA.3.R.3.3', 'ELA.3.V.1.2', 'ELA.3.V.1.3',
  ],
  reportingCategories: [
    { name: 'Reading Prose and Poetry', benchmarkReferences: ['ELA.3.R.1.1', 'ELA.3.R.1.2', 'ELA.3.R.1.3', 'ELA.3.R.1.4'], targetSharePercent: { minimum: 25, maximum: 35 } },
    { name: 'Reading Informational Text', benchmarkReferences: ['ELA.3.R.2.1', 'ELA.3.R.2.2', 'ELA.3.R.2.3', 'ELA.3.R.2.4'], targetSharePercent: { minimum: 25, maximum: 35 } },
    { name: 'Reading Across Genres and Vocabulary', benchmarkReferences: ['ELA.3.R.3.1', 'ELA.3.R.3.2', 'ELA.3.R.3.3', 'ELA.3.V.1.2', 'ELA.3.V.1.3'], targetSharePercent: { minimum: 35, maximum: 50 } },
  ],
  testShape: {
    operationalItems: { minimum: 36, maximum: 40 },
    pm3FieldTestItems: { approximate: 5 },
    fictionInformationalBalance: { fictionPercent: 50, informationalPercent: 50, approximate: true },
    maximumMinutes: { PM1: 90, PM2: 90, PM3: 120 },
  },
  itemForms: [
    { officialForm: 'multiple choice', applicationSupport: 'supported', applicationType: 'multiple_choice' },
    { officialForm: 'selectable hot text', applicationSupport: 'supported', applicationType: 'hot_text' },
    { officialForm: 'multiselect', applicationSupport: 'supported', applicationType: 'multi_select' },
    { officialForm: 'evidence-based selected response', applicationSupport: 'supported_through_two_part', applicationType: 'two_part' },
    { officialForm: 'table match', applicationSupport: 'supported', applicationType: 'table_match' },
    { officialForm: 'multimedia', applicationSupport: 'deferred', applicationType: null },
  ],
  progressionEffect: 'informational_only',
  timedPracticePhase: 'Phase 9',
})

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) deepFreeze(nested)
    Object.freeze(value)
  }
  return value
}
