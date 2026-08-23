import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import {
  buildGrade2CoverageSnapshot,
  buildGrade3CoverageSnapshot,
  curriculumTracks,
  deriveWorldsForProgress,
  grade2BenchmarkInventory,
  grade3BenchmarkInventory,
  grade3FastReadingBlueprint,
  getSequentialWorldRoadmapByTrackId,
  getSequentialWorldRoadmapByWorldId,
  getSequentialWorldRoadmapsByWorldId,
  getTrackByUnitId,
  sequentialWorldRoadmaps,
} from '../src/domain/curriculum'
import { buildContentPackAudit, contentPacks, getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import type { ContentPack } from '../src/domain/content/packs'
import { buildDashboardSnapshot } from '../src/domain/dashboard'
import { getLessonCandidates, lessonCatalog } from '../src/domain/lesson'
import type { LessonActivityCandidate } from '../src/domain/progression'
import { planUnitQuest } from '../src/domain/progression'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../src/persistence'
import { demoWorlds } from '../src/data/demoWorlds'
import { UnitSelectScreen } from '../src/screens/UnitSelectScreen'

const NOW = '2026-08-23T12:00:00.000Z'

afterEach(cleanup)

function grade3Fixture(): LessonActivityCandidate {
  return {
    lessonId: 'fixture-grade3-root-reactor',
    activityId: 'fixture-grade3-root-reactor-a',
    skillId: 'g3-word-forge-word-analysis',
    gradeBand: 3,
    difficulty: 1,
    worldId: 'word-forge',
    unitId: 'g3-wg-unit-1',
    packId: 'fixture-grade3-root-reactor-pack',
    benchmarkReferences: ['ELA.3.F.1.3'],
    eligiblePurposes: ['progression', 'verification', 'review'],
    passageQuestionKeys: ['fixture-grade3-root::fixture-question'],
    contentVersion: 'fixture-only-v1',
  }
}

describe('Grade 3 standards and FAST planning foundation', () => {
  test('defines exactly sixteen immutable planned benchmark rows with required coverage intent', () => {
    expect(grade3BenchmarkInventory).toHaveLength(16)
    expect(new Set(grade3BenchmarkInventory.map((entry) => entry.benchmarkReference)).size).toBe(16)
    expect(grade3BenchmarkInventory.every((entry) => entry.gradeBand === 3)).toBe(true)
    expect(grade3BenchmarkInventory.filter((entry) => entry.intendedCoverageKind === 'benchmark')).toHaveLength(14)
    expect(grade3BenchmarkInventory.filter((entry) => entry.intendedCoverageKind === 'supportive_practice').map((entry) => entry.benchmarkReference)).toEqual([
      'ELA.3.F.1.4', 'ELA.3.V.1.1',
    ])
    expect(grade3BenchmarkInventory.filter((entry) => entry.assessmentScope === 'fast_reading')).toHaveLength(13)
    expect(grade3BenchmarkInventory.filter((entry) => entry.assessmentScope === 'instructional_only')).toHaveLength(3)
    expect(grade3BenchmarkInventory.filter((entry) => entry.benchmarkReference === 'ELA.3.F.1.3')).toHaveLength(1)
    expect(grade3BenchmarkInventory.find((entry) => entry.benchmarkReference === 'ELA.3.F.1.3')?.expectedPatterns).toEqual([
      'greek-latin-root-decoding', 'affix-decoding', 'derivational-suffix-decoding', 'part-of-speech-change', 'multisyllabic-decoding',
    ])
    expect(grade3BenchmarkInventory.every((entry) => (
      curriculumTracks.some((track) => track.worldId === entry.worldId)
      && entry.unitIds.every((unitId) => getTrackByUnitId(unitId)?.gradeBand === 3)
      && entry.plannedPhase.length > 0
      && Object.isFrozen(entry.unitIds)
      && Object.isFrozen(entry.expectedPatterns)
    ))).toBe(true)
  })

  test('builds sixteen DRAFT roadmap-only coverage rows without mutating Grade 2 coverage', () => {
    const grade2Before = buildGrade2CoverageSnapshot()
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows).toHaveLength(16)
    expect(snapshot.rows.every((row) => row.coverageStatus === 'planned')).toBe(true)
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
    expect(snapshot.rows.every((row) => row.contributingPackIds.length === 0)).toBe(true)
    expect(snapshot.rows.every((row) => row.notes.includes('Roadmap only; no active Grade 3 content yet.'))).toBe(true)
    expect(buildGrade2CoverageSnapshot()).toEqual(grade2Before)
    expect(grade2BenchmarkInventory).toHaveLength(20)
  })

  test('records the FAST blueprint as immutable informational metadata', () => {
    expect(grade3FastReadingBlueprint.assessedBenchmarkReferences).toHaveLength(13)
    expect(grade3FastReadingBlueprint.reportingCategories.map((category) => category.targetSharePercent)).toEqual([
      { minimum: 25, maximum: 35 },
      { minimum: 25, maximum: 35 },
      { minimum: 35, maximum: 50 },
    ])
    expect(grade3FastReadingBlueprint.testShape.operationalItems).toEqual({ minimum: 36, maximum: 40 })
    expect(grade3FastReadingBlueprint.testShape.pm3FieldTestItems.approximate).toBe(5)
    expect(grade3FastReadingBlueprint.testShape.fictionInformationalBalance).toEqual({ fictionPercent: 50, informationalPercent: 50, approximate: true })
    expect(grade3FastReadingBlueprint.testShape.maximumMinutes).toEqual({ PM1: 90, PM2: 90, PM3: 120 })
    expect(grade3FastReadingBlueprint.itemForms.filter((form) => form.applicationSupport === 'supported')).toHaveLength(4)
    expect(grade3FastReadingBlueprint.itemForms.find((form) => form.officialForm === 'evidence-based selected response')?.applicationType).toBe('two_part')
    expect(grade3FastReadingBlueprint.itemForms.find((form) => form.officialForm === 'multimedia')?.applicationSupport).toBe('deferred')
    expect(grade3FastReadingBlueprint.progressionEffect).toBe('informational_only')
    expect(Object.isFrozen(grade3FastReadingBlueprint)).toBe(true)
    expect(Object.isFrozen(grade3FastReadingBlueprint.reportingCategories[0].benchmarkReferences)).toBe(true)
  })
})

describe('Grade 3 planned roadmaps and production freeze', () => {
  test('defines six Grade 3 roadmaps and eighteen unique planned units with exact ownership', () => {
    const grade3Roadmaps = sequentialWorldRoadmaps.filter((roadmap) => roadmap.gradeBand === 3)
    expect(grade3Roadmaps).toHaveLength(6)
    expect(Object.fromEntries(grade3Roadmaps.map((roadmap) => [roadmap.trackId, roadmap.units.length]))).toEqual({
      'g3-word-forge-foundations': 4,
      'g3-story-scouts-prose': 3,
      'g3-poetry-planet': 1,
      'g3-information-detectives-reading': 4,
      'g3-context-cavern-vocabulary': 3,
      'g3-across-genres-reading': 3,
    })
    const units = grade3Roadmaps.flatMap((roadmap) => roadmap.units)
    expect(units).toHaveLength(18)
    expect(new Set(units.map((unit) => unit.unitId)).size).toBe(18)
    expect(units.every((unit) => getTrackByUnitId(unit.unitId)?.gradeBand === 3 && unit.benchmarkReference?.startsWith('ELA.3.') && unit.plannedPhase?.startsWith('7'))).toBe(true)
    expect(getSequentialWorldRoadmapsByWorldId('information-detectives').map((roadmap) => roadmap.gradeBand)).toEqual([2, 3])
    expect(getSequentialWorldRoadmapByWorldId('information-detectives')?.trackId).toBe('g2-information-detectives-reading')
    expect(getSequentialWorldRoadmapByTrackId('g3-information-detectives-reading')?.chapterTitle).toBe('Grade 3 Informational Analysis')
  })

  test('keeps production totals frozen and all production lesson metadata on Grade 2', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 22,
      activeLessonCount: 154,
      activePassageCount: 161,
      activeQuestionCount: 889,
      activeSupportTargetCount: 614,
    })
    expect(getActiveContentPacks().some((pack) => pack.manifest.gradeBand === 3)).toBe(false)
    expect(lessonCatalog.filter((lesson) => lesson.selectionStatus === 'active')).toHaveLength(154)
    expect(lessonCatalog.every((lesson) => lesson.gradeBand === 2)).toBe(true)
    expect(getLessonCandidates().every((lesson) => lesson.gradeBand === 2)).toBe(true)
    expect(buildContentPackAudit(contentPacks)).toEqual([])
  })

  test('rejects passage and question grade bands that contradict their pack', () => {
    const source = contentPacks[0]
    const mismatched: ContentPack = {
      ...source,
      passages: source.passages.map((passage, index) => index === 0 ? { ...passage, gradeBand: 3 } : passage),
      questions: source.questions.map((question, index) => index === 0 ? { ...question, gradeBand: 3 } : question),
    }
    const wrongGradeIssues = buildContentPackAudit([mismatched]).filter((issue) => issue.code === 'wrong_grade_band')
    expect(wrongGradeIssues.map((issue) => issue.itemIdentifier)).toEqual([
      source.passages[0].passageIdentifier,
      source.questions[0].questionIdentifier,
    ])
  })

  test('keeps empty Grade 3 metadata invisible and reveals fixture content only through its chapter gate', () => {
    const initial = createDefaultQuestProgress(NOW)
    expect(buildDashboardSnapshot({ progress: initial, now: NOW }).skillSummaries.some((skill) => skill.skillId.startsWith('g3-'))).toBe(false)
    const productionWorlds = deriveWorldsForProgress(demoWorlds, initial, getLessonCandidates())
    expect(productionWorlds.flatMap((world) => world.units).some((unit) => unit.gradeBand === 3)).toBe(false)

    const fixtureLessons = [...getLessonCandidates(), grade3Fixture()]
    const lockedWorlds = deriveWorldsForProgress(demoWorlds, initial, fixtureLessons)
    const lockedWordForge = lockedWorlds.find((world) => world.id === 'word-forge')!
    expect(lockedWordForge.units.find((unit) => unit.id === 'g3-wg-unit-1')?.state).toBe('locked')
    expect(initial.skillProgress['g3-word-forge-word-analysis']).toBeUndefined()
    expect(planUnitQuest({ selectedUnitId: 'g3-wg-unit-1', progress: initial, availableLessons: fixtureLessons })).toMatchObject({
      status: 'locked',
      unitId: 'g3-wg-unit-1',
    })

    const ready: QuestProgressV1 = {
      ...initial,
      skillProgress: {
        ...initial.skillProgress,
        'g2-word-forge-word-practice': {
          ...initial.skillProgress['g2-word-forge-word-practice'],
          currentDifficulty: 8,
        },
      },
    }
    const readyWorlds = deriveWorldsForProgress(demoWorlds, ready, fixtureLessons)
    const readyWordForge = readyWorlds.find((world) => world.id === 'word-forge')!
    expect(readyWordForge.units.find((unit) => unit.id === 'g3-wg-unit-1')?.state).toBe('available')
    expect(readyWordForge.units.find((unit) => unit.id === 'g3-wg-unit-2')?.state).toBe('locked')
    expect(ready.skillProgress['g3-word-forge-word-analysis']).toBeUndefined()
    expect(planUnitQuest({ selectedUnitId: 'g3-wg-unit-1', progress: ready, availableLessons: fixtureLessons })).toMatchObject({
      status: 'available',
      unitId: 'g3-wg-unit-1',
    })

    render(<UnitSelectScreen world={readyWordForge} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByRole('heading', { name: 'Grade 3 Word Analysis' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Grade 2 Chapter' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Root Reactor/i }).hasAttribute('disabled')).toBe(false)
  })
})
