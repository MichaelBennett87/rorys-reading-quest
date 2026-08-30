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
import { planUnitQuest } from '../src/domain/progression'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../src/persistence'
import { demoWorlds } from '../src/data/demoWorlds'
import { UnitSelectScreen } from '../src/screens/UnitSelectScreen'

const NOW = '2026-08-23T12:00:00.000Z'

afterEach(cleanup)

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

  test('builds four implemented, one supportive-practice, and eleven planned DRAFT rows without mutating Grade 2 coverage', () => {
    const grade2Before = buildGrade2CoverageSnapshot()
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows).toHaveLength(16)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(14)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(2)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(0)
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.F.1.3')).toMatchObject({
      coverageStatus: 'implemented',
      contributingPackIds: ['g3-word-forge-multisyllable-mountain', 'g3-word-forge-root-reactor', 'g3-word-forge-suffix-shifter'],
      coveredPatterns: ['greek-latin-root-decoding', 'affix-decoding', 'derivational-suffix-decoding', 'part-of-speech-change', 'multisyllabic-decoding'],
      missingPatterns: [],
    })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.F.1.4')).toMatchObject({
      coverageStatus: 'supportive_practice',
      contributingPackIds: ['g3-word-forge-fluency-flight'],
      coveredPatterns: ['accuracy-practice', 'automaticity-practice', 'phrasing-practice', 'expression-practice', 'no-oral-measurement'],
      missingPatterns: [],
    })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.1')).toMatchObject({
      coverageStatus: 'implemented',
      contributingPackIds: ['g3-story-scouts-character-arc-camp'],
      coveredPatterns: ['character-development', 'plot-linked-change', 'actions-dialogue-thoughts', 'beginning-middle-end-development', 'text-evidence'],
      missingPatterns: [],
      reviewStatus: 'DRAFT',
    })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.2')).toMatchObject({
      coverageStatus: 'implemented',
      contributingPackIds: ['g3-story-scouts-theme-development-trail'],
      coveredPatterns: ['theme', 'theme-development', 'supporting-details', 'plot-theme-connection'],
      missingPatterns: [],
      reviewStatus: 'DRAFT',
    })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned').every((row) => row.notes.includes('Roadmap only; no active Grade 3 content yet.'))).toBe(true)
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

  test('preserves Grade 2 totals while registering Grade 3 Word Forge and both Story Scouts packs', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40,
      activeLessonCount: 280,
      activePassageCount: 294,
      activeQuestionCount: 1614,
      activeSupportTargetCount: 1111,
    })
    expect(getActiveContentPacks().filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(getActiveContentPacks().filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(18)
    expect(lessonCatalog.filter((lesson) => lesson.selectionStatus === 'active' && lesson.gradeBand === 2)).toHaveLength(154)
    expect(lessonCatalog.filter((lesson) => lesson.selectionStatus === 'active' && lesson.gradeBand === 3)).toHaveLength(126)
    expect(getLessonCandidates().filter((lesson) => lesson.gradeBand === 2)).toHaveLength(154)
    expect(getLessonCandidates().filter((lesson) => lesson.gradeBand === 3)).toHaveLength(126)
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

  test('reveals Root Reactor production content only through its chapter gate', () => {
    const initial = createDefaultQuestProgress(NOW)
    expect(buildDashboardSnapshot({ progress: initial, now: NOW }).skillSummaries.some((skill) => skill.skillId.startsWith('g3-'))).toBe(false)
    const productionLessons = getLessonCandidates()
    const lockedWorlds = deriveWorldsForProgress(demoWorlds, initial, productionLessons)
    const lockedWordForge = lockedWorlds.find((world) => world.id === 'word-forge')!
    expect(lockedWordForge.units.find((unit) => unit.id === 'g3-wg-unit-1')?.state).toBe('locked')
    expect(initial.skillProgress['g3-word-forge-word-analysis']).toBeUndefined()
    expect(planUnitQuest({ selectedUnitId: 'g3-wg-unit-1', progress: initial, availableLessons: productionLessons })).toMatchObject({
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
    const readyWorlds = deriveWorldsForProgress(demoWorlds, ready, productionLessons)
    const readyWordForge = readyWorlds.find((world) => world.id === 'word-forge')!
    expect(readyWordForge.units.find((unit) => unit.id === 'g3-wg-unit-1')?.state).toBe('available')
    expect(readyWordForge.units.find((unit) => unit.id === 'g3-wg-unit-2')?.state).toBe('locked')
    expect(ready.skillProgress['g3-word-forge-word-analysis']).toBeUndefined()
    expect(planUnitQuest({ selectedUnitId: 'g3-wg-unit-1', progress: ready, availableLessons: productionLessons })).toMatchObject({
      status: 'available',
      unitId: 'g3-wg-unit-1',
    })

    const remediation: QuestProgressV1 = {
      ...ready,
      skillProgress: {
        ...ready.skillProgress,
        'g3-word-forge-word-analysis': {
          skillId: 'g3-word-forge-word-analysis',
          currentDifficulty: 0,
          lastMasteredDifficulty: 0,
          currentLearningState: 'REMEDIATE_PREREQUISITE',
          qualifyingIndependentActivityIds: [],
          consecutiveUnsuccessfulAtCurrentDifficulty: 2,
          lastCompletedActivityId: null,
          recentActivityUsage: [],
          reviewStep: 0,
          nextReviewDate: null,
          lastDecisionReasonCodes: ['consecutive_unsuccessful_results'],
          remediationContext: {
            originalSkillId: 'g3-word-forge-word-analysis',
            originalDifficulty: 1,
            remediationSkillId: 'g3-word-forge-word-analysis',
            remediationDifficulty: 0,
            reason: 'last_mastered_difficulty',
          },
        },
      },
    }
    const remediationRoot = deriveWorldsForProgress(demoWorlds, remediation, productionLessons)
      .find((world) => world.id === 'word-forge')
      ?.units.find((unit) => unit.id === 'g3-wg-unit-1')
    expect(remediationRoot).toMatchObject({ state: 'available', difficultyLabel: 'Power-Up Mission' })

    render(<UnitSelectScreen world={readyWordForge} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByRole('heading', { name: 'Grade 3 Word Analysis' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Grade 2 Chapter' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Root Reactor/i }).hasAttribute('disabled')).toBe(false)

    const suffixReady: QuestProgressV1 = {
      ...ready,
      skillProgress: {
        ...ready.skillProgress,
        'g3-word-forge-word-analysis': {
          skillId: 'g3-word-forge-word-analysis',
          currentDifficulty: 2,
          lastMasteredDifficulty: 1,
          currentLearningState: 'ADVANCE',
          qualifyingIndependentActivityIds: [],
          consecutiveUnsuccessfulAtCurrentDifficulty: 0,
          lastCompletedActivityId: null,
          recentActivityUsage: [],
          reviewStep: 0,
          nextReviewDate: null,
          lastDecisionReasonCodes: ['advanced'],
          remediationContext: null,
        },
      },
    }
    const suffixWordForge = deriveWorldsForProgress(demoWorlds, suffixReady, productionLessons)
      .find((world) => world.id === 'word-forge')!
    expect(suffixWordForge.units.find((unit) => unit.id === 'g3-wg-unit-1')?.state).toBe('complete')
    expect(suffixWordForge.units.find((unit) => unit.id === 'g3-wg-unit-2')).toMatchObject({ state: 'available', difficultyLabel: 'Trail 2' })
    expect(suffixWordForge.units.find((unit) => unit.id === 'g3-wg-unit-3')?.state).toBe('locked')
    expect(planUnitQuest({ selectedUnitId: 'g3-wg-unit-2', progress: suffixReady, availableLessons: productionLessons })).toMatchObject({
      status: 'available',
      unitId: 'g3-wg-unit-2',
      lesson: { difficulty: 2 },
    })

    cleanup()
    render(<UnitSelectScreen world={suffixWordForge} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByRole('button', { name: /Suffix Shifter/i }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByText('Trail 2')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Multisyllable Mountain/i }).hasAttribute('disabled')).toBe(true)

    const mountainReady: QuestProgressV1 = {
      ...suffixReady,
      skillProgress: {
        ...suffixReady.skillProgress,
        'g3-word-forge-word-analysis': {
          ...suffixReady.skillProgress['g3-word-forge-word-analysis'],
          currentDifficulty: 3,
          lastMasteredDifficulty: 2,
        },
      },
    }
    const mountainWordForge = deriveWorldsForProgress(demoWorlds, mountainReady, productionLessons)
      .find((world) => world.id === 'word-forge')!
    expect(mountainWordForge.units.find((unit) => unit.id === 'g3-wg-unit-2')?.state).toBe('complete')
    expect(mountainWordForge.units.find((unit) => unit.id === 'g3-wg-unit-3')).toMatchObject({ state: 'available', difficultyLabel: 'Trail 3' })
    expect(mountainWordForge.units.find((unit) => unit.id === 'g3-wg-unit-4')?.state).toBe('locked')
    expect(planUnitQuest({ selectedUnitId: 'g3-wg-unit-3', progress: mountainReady, availableLessons: productionLessons })).toMatchObject({
      status: 'available',
      unitId: 'g3-wg-unit-3',
      lesson: { difficulty: 3 },
    })

    cleanup()
    render(<UnitSelectScreen world={mountainWordForge} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByRole('button', { name: /Multisyllable Mountain/i }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByText('Trail 3')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Fluency Flight Grade 3/i }).hasAttribute('disabled')).toBe(true)

    const fluencyReady: QuestProgressV1 = {
      ...mountainReady,
      skillProgress: {
        ...mountainReady.skillProgress,
        'g3-word-forge-word-analysis': {
          ...mountainReady.skillProgress['g3-word-forge-word-analysis'],
          currentDifficulty: 4,
          lastMasteredDifficulty: 3,
        },
      },
    }
    const fluencyWordForge = deriveWorldsForProgress(demoWorlds, fluencyReady, productionLessons)
      .find((world) => world.id === 'word-forge')!
    expect(fluencyWordForge.units.find((unit) => unit.id === 'g3-wg-unit-3')?.state).toBe('complete')
    expect(fluencyWordForge.units.find((unit) => unit.id === 'g3-wg-unit-4')).toMatchObject({ state: 'available', difficultyLabel: 'Trail 4' })
    expect(planUnitQuest({ selectedUnitId: 'g3-wg-unit-4', progress: fluencyReady, availableLessons: productionLessons })).toMatchObject({
      status: 'available',
      unitId: 'g3-wg-unit-4',
      lesson: { difficulty: 4 },
    })

    cleanup()
    render(<UnitSelectScreen world={fluencyWordForge} onBack={() => undefined} onSelectUnit={() => undefined} />)
    expect(screen.getByRole('button', { name: /Fluency Flight Grade 3/i }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByText('Trail 4')).toBeTruthy()

    const chapterComplete: QuestProgressV1 = {
      ...fluencyReady,
      skillProgress: {
        ...fluencyReady.skillProgress,
        'g3-word-forge-word-analysis': {
          ...fluencyReady.skillProgress['g3-word-forge-word-analysis'],
          currentDifficulty: 5,
          currentLearningState: 'FLUENCY_PRACTICE',
        },
      },
    }
    const completeWordForge = deriveWorldsForProgress(demoWorlds, chapterComplete, productionLessons)
      .find((world) => world.id === 'word-forge')!
    expect(completeWordForge.units.find((unit) => unit.id === 'g3-wg-unit-4')?.state).toBe('complete')
  })
})
