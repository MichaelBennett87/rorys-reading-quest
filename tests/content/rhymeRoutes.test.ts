import { describe, expect, test } from 'vitest'

import { contentPackAudit, contentPacks } from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import { getActiveContentRegistryTotals } from '../../src/domain/content/packs/registry'
import { grade2PoetryPlanetRhymeRoutesPack, rhymeRoutesLessons, rhymeRoutesPassages, rhymeRoutesRhymeSchemeGuides } from '../../src/domain/content/packs/grade2/poetryPlanet/rhymeRoutes'
import { getLessonForUnit } from '../../src/domain/lesson'

describe('Grade 2 Poetry Planet: Rhyme Routes', () => {
  test('registers as the active poetry pack with stable registry totals', () => {
    const activePacks = contentPacks.filter((pack) => pack.manifest.packId !== 'legacy-word-forge-development-pack')

    expect(contentPacks.map((pack) => pack.manifest.packId)).toEqual([
      'g2-word-forge-variable-vowels-oo-ea',
      'g2-word-forge-variable-vowels-ou-oi-oy-ow',
      'g2-word-forge-two-syllable-open-closed',
      'g2-word-forge-consonant-le-integrated',
      'g2-word-forge-common-prefixes',
      'g2-word-forge-common-suffixes',
      'g2-word-forge-silent-letter-combinations',
      'g2-word-forge-fluency-practice-foundations',
      'g2-story-scouts-plot-structure-elements',
      'g2-story-scouts-theme-trail',
      'g2-story-scouts-perspective-portal',
      'g2-poetry-planet-rhyme-routes',
      'g2-information-detectives-text-feature-hunt',
      'g2-information-detectives-central-idea-center',
      'g2-information-detectives-purpose-path',
      'g2-information-detectives-opinion-evidence-desk',
      'g2-context-cavern-academic-word-workshop',
      'g2-context-cavern-morphology-mine',
      'g2-context-cavern-meaning-clue-chamber',
      'g2-compare-castle-wordplay-watchtower',
      'legacy-word-forge-development-pack',
    ])
    expect(activePacks).toHaveLength(20)
    expect(activePacks.reduce((sum, pack) => sum + pack.lessons.length, 0)).toBe(140)
    expect(activePacks.reduce((sum, pack) => sum + pack.passages.length, 0)).toBe(140)
    expect(activePacks.reduce((sum, pack) => sum + pack.questions.length, 0)).toBe(807)
    expect(activePacks.reduce((sum, pack) => sum + pack.passages.reduce((passageSum, passage) => passageSum + (passage.wordSupportTargets?.length ?? 0), 0), 0)).toBe(558)
    expect(new Set(contentPacks.map((pack) => pack.manifest.packId)).size).toBe(contentPacks.length)
    expect(contentPackAudit).toHaveLength(0)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 20,
      activeLessonCount: 140,
      activePassageCount: 140,
      activeQuestionCount: 807,
      activeSupportTargetCount: 558,
    })
  })

  test('covers ELA.2.R.1.4 with the expected broad patterns only after the poetry pack registers', () => {
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.1.4')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.1.4',
      expectedPatterns: ['rhyme-scheme-identification', 'rhyme-scheme-notation'],
      coveredPatterns: ['rhyme-scheme-identification', 'rhyme-scheme-notation'],
      missingPatterns: [],
      contributingPackIds: ['g2-poetry-planet-rhyme-routes'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('keeps the pack-local poem structure and rhyme guides aligned', () => {
    expect(grade2PoetryPlanetRhymeRoutesPack.manifest.packId).toBe('g2-poetry-planet-rhyme-routes')
    expect(grade2PoetryPlanetRhymeRoutesPack.lessons).toHaveLength(7)
    expect(rhymeRoutesLessons).toHaveLength(7)
    expect(rhymeRoutesPassages).toHaveLength(7)
    expect(rhymeRoutesRhymeSchemeGuides).toHaveLength(7)
    expect(grade2PoetryPlanetRhymeRoutesPack.questions).toHaveLength(41)
    expect(grade2PoetryPlanetRhymeRoutesPack.manifest.coveredPatterns).toEqual([
      'rhyme-scheme-identification',
      'rhyme-scheme-notation',
      'line-end-word-identification',
      'end-rhyme-identification',
      'rhyme-by-sound',
      'notation-starts-with-a',
      'same-rhyme-same-letter',
      'new-rhyme-next-letter',
      'uppercase-rhyme-labels',
      'whole-poem-scheme',
      'scheme-supported-by-end-words',
    ])

    expect(rhymeRoutesPassages.every((passage) => passage.contentKind === 'poem')).toBe(true)
    expect(rhymeRoutesPassages.every((passage) => passage.wordSupportTargets?.length === 4)).toBe(true)
    expect(grade2PoetryPlanetRhymeRoutesPack.passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0)).toBe(28)
    expect(rhymeRoutesPassages.every((passage) => {
      const structure = passage.poemStructure
      return Boolean(
        structure
        && structure.lines.length >= 4
        && structure.lines.length <= 8
        && structure.stanzas.length >= 1
        && structure.stanzas.length <= 2
        && structure.lines.map((line) => line.text).join('\n') === passage.passageText,
      )
    })).toBe(true)

    expect(rhymeRoutesRhymeSchemeGuides.every((guide) => {
      const passage = rhymeRoutesPassages.find((entry) => entry.passageIdentifier === guide.passageId)
      if (!passage?.poemStructure) return false
      const rhymeLabels = guide.lines.map((line) => line.rhymeLabel).join('')
      const actualEndWords = passage.poemStructure.lines.map((line) => line.text.replace(/[^\w']+$/u, '').split(' ').at(-1))

      return Boolean(
        guide.reviewStatus === 'DRAFT'
        && guide.contentVersion === 'g2-pp-rhyme-routes-r0.1.0'
        && guide.lines.length === passage.poemStructure.lines.length
        && rhymeLabels.length === passage.poemStructure.lines.length
        && guide.scheme === rhymeLabels
        && guide.lines.every((line, index) => line.endWord === actualEndWords[index]),
      )
    })).toBe(true)
  })

  test('resolves the Poetry Planet unit to Rhyme Routes', () => {
    const result = getLessonForUnit('pp-unit-1')

    expect(result.lesson?.lessonId).toBe('g2-poetry-planet-rhyme-routes-lesson-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })

  test('retains the pack coverage audit boundary and review status', () => {
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.1.1')).toEqual(expect.objectContaining({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.1.4')).toEqual(expect.objectContaining({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(grade2PoetryPlanetRhymeRoutesPack.manifest.reviewStatus).toBe('DRAFT')
  })
})
