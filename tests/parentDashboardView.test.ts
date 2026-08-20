import { describe, expect, test } from 'vitest'

import {
  formatAssistanceLevel,
  formatBenchmarkReferences,
  formatParentDate,
  formatPercent,
  formatTrailLabel,
  resolveFriendlySkillName,
} from '../src/screens/parent/parentDashboardView'

describe('parent dashboard presentation helpers', () => {
  test('formats no-data and numeric percentages deterministically', () => {
    expect(formatPercent(null)).toMatch(/No practice data/i)
    expect(formatPercent(72.4)).toBe('72.4%')
  })

  test('formats trail labels deterministically', () => {
    expect(formatTrailLabel(0)).toBe('Building Block Trail')
    expect(formatTrailLabel(2)).toBe('Trail 2')
  })

  test('formats assistance levels with readable labels and falls back safely', () => {
    expect(formatAssistanceLevel(1)).toBe('Pattern clue')
    expect(formatAssistanceLevel(2)).toBe('Word chunks')
    expect(formatAssistanceLevel(3)).toBe('Heard the parts')
    expect(formatAssistanceLevel(4)).toBe('Blended the parts')
    expect(formatAssistanceLevel(5)).toBe('Heard the word')
    expect(formatAssistanceLevel(6)).toBe('Heard the sentence')
    expect(formatAssistanceLevel(99)).toBe('Unknown support level')
  })

  test('formats dates deterministically and handles missing dates safely', () => {
    expect(formatParentDate('2026-08-20T12:00:00.000Z')).toBe('Aug 20, 2026')
    expect(formatParentDate(null)).toBe('Not scheduled')
  })

  test('resolves friendly skill names and leaves inputs unchanged', () => {
    const input = { skillId: 'g2-word-forge-word-practice' }
    const snapshot = structuredClone(input)

    expect(resolveFriendlySkillName(input.skillId)).toBe('Word Forge')
    expect(resolveFriendlySkillName('retired-skill-id')).toBe('Archived skill')
    expect(input).toEqual(snapshot)
  })

  test('formats benchmark references deterministically', () => {
    expect(formatBenchmarkReferences([])).toBe('Archived benchmark')
    expect(formatBenchmarkReferences(['ELA.2.F.1.3c'])).toBe('ELA.2.F.1.3c')
    expect(formatBenchmarkReferences(['ELA.2.F.1.3c', 'ELA.2.F.1.3b'])).toBe('ELA.2.F.1.3b · ELA.2.F.1.3c')
  })
})
