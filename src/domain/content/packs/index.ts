import { contentPacks } from './registry'
import { buildFluencyPracticeAudit } from './fluencyPracticeAudit'

export * from './contentPackTypes'
export * from './contentPackAudit'
export * from './fluencyPracticeAudit'
export * from './legacyDevelopmentPack'
export * from './grade2/wordForge/consonantLeIntegrated'
export * from './grade2/wordForge/silentLetterCombinations'
export * from './grade2/wordForge/fluencyPracticeFoundations'
export * from './registry'

export const fluencyPracticeAudit = buildFluencyPracticeAudit(contentPacks)
