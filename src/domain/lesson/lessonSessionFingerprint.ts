import type { ContentPack } from '../content/packs/contentPackTypes'

const LEGACY_SESSION_FINGERPRINT_REQUIRED_PACK_IDS = new Set([
  'g2-compare-castle-compare-keep',
  'g2-compare-castle-retell-hall',
  'g2-compare-castle-wordplay-watchtower',
  'g2-context-cavern-academic-word-workshop',
  'g2-context-cavern-meaning-clue-chamber',
  'g2-context-cavern-morphology-mine',
  'g2-information-detectives-central-idea-center',
  'g2-information-detectives-opinion-evidence-desk',
  'g2-information-detectives-purpose-path',
  'g2-information-detectives-text-feature-hunt',
  'g2-poetry-planet-rhyme-routes',
  'g2-story-scouts-perspective-portal',
  'g2-story-scouts-plot-structure-elements',
  'g2-story-scouts-theme-trail',
  'g2-word-forge-common-prefixes',
  'g2-word-forge-common-suffixes',
  'g2-word-forge-consonant-le-integrated',
  'g2-word-forge-fluency-practice-foundations',
  'g2-word-forge-silent-letter-combinations',
  'g2-word-forge-two-syllable-open-closed',
  'g2-word-forge-variable-vowels-oo-ea',
  'g2-word-forge-variable-vowels-ou-oi-oy-ow',
  'g3-compare-castle-summary-stronghold',
  'g3-context-cavern-meaning-maze',
  'g3-information-detectives-central-idea-engine',
  'g3-information-detectives-purpose-development-path',
  'g3-information-detectives-structure-station',
  'g3-poetry-planet-poem-form-observatory',
  'g3-story-scouts-character-arc-camp',
  'g3-story-scouts-theme-development-trail',
  'g3-word-forge-multisyllable-mountain',
  'g3-word-forge-suffix-shifter',
])

export function buildPackSessionContentFingerprint(pack: ContentPack): string {
  const serialized = stableStringify(pack)
  return `lesson-session-v1-${fnv1a(serialized, 0x811c9dc5)}${fnv1a(serialized, 0x9e3779b9)}`
}

export function requiresLegacySessionContentFingerprint(packId: string): boolean {
  return LEGACY_SESSION_FINGERPRINT_REQUIRED_PACK_IDS.has(packId)
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
    return `{${entries.join(',')}}`
  }
  return value === undefined ? 'undefined' : JSON.stringify(value)
}

function fnv1a(value: string, seed: number): string {
  let hash = seed >>> 0
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
