export const RETELL_HALL_BROAD_PATTERNS = ['literary-retell', 'informational-retell'] as const

export const RETELL_HALL_COVERED_PATTERNS = [
  'literary-retell',
  'informational-retell',
  'structured-retell',
  'retell-important-vs-minor',
  'retell-use-each-once',
  'literary-main-characters',
  'literary-setting',
  'literary-problem',
  'literary-important-events',
  'literary-resolution',
  'literary-logical-sequence',
  'literary-retell-completeness',
  'informational-central-idea',
  'informational-relevant-details',
  'informational-details-across-sections',
  'informational-retell-order',
  'informational-retell-completeness',
] as const

export const RETELL_HALL_LITERARY_QUESTION_TAGS = [
  'literary-retell',
  'structured-retell',
  'retell-important-vs-minor',
  'retell-use-each-once',
  'literary-main-characters',
  'literary-setting',
  'literary-problem',
  'literary-important-events',
  'literary-resolution',
  'literary-logical-sequence',
  'literary-retell-completeness',
] as const

export const RETELL_HALL_INFORMATIONAL_QUESTION_TAGS = [
  'informational-retell',
  'structured-retell',
  'retell-important-vs-minor',
  'retell-use-each-once',
  'informational-central-idea',
  'informational-relevant-details',
  'informational-details-across-sections',
  'informational-retell-order',
  'informational-retell-completeness',
] as const

export const RETELL_HALL_CHECKPOINT_LITERARY_TAGS = [
  ...RETELL_HALL_LITERARY_QUESTION_TAGS,
  'literary-retell-completeness',
] as const

export const RETELL_HALL_CHECKPOINT_INFORMATIONAL_TAGS = [
  ...RETELL_HALL_INFORMATIONAL_QUESTION_TAGS,
  'informational-retell-completeness',
] as const
