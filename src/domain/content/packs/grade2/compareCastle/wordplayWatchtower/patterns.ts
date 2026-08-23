export const WORDPLAY_WATCHTOWER_BROAD_PATTERNS = [
  'similes',
  'idioms',
  'alliteration',
] as const

export const WORDPLAY_WATCHTOWER_DETAILED_PATTERNS = [
  'simile-identification',
  'simile-comparison',
  'simile-shared-quality',
  'literal-like-as-distinction',
  'idiom-identification',
  'idiom-meaning-in-context',
  'literal-vs-nonliteral',
  'alliteration-identification',
  'repeated-beginning-sound',
  'sound-not-letter',
  'wordplay-explanation',
  'prose-wordplay',
  'poetry-wordplay',
] as const

export const WORDPLAY_WATCHTOWER_QUESTION_TAGS = [
  ...WORDPLAY_WATCHTOWER_BROAD_PATTERNS,
  ...WORDPLAY_WATCHTOWER_DETAILED_PATTERNS,
] as const
