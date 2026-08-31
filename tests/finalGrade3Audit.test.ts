import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

import {
  auditSemanticQuestionPacks,
  buildActiveQuestionTruthInventory,
  contentPackAudit,
  contentPacks,
  grade3FluencyPracticeAudit,
  sampleContent,
  validateContent,
} from '../src/domain/content'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs/registry'
import {
  buildGrade2CoverageSnapshot,
  buildGrade3CoverageSnapshot,
  curriculumTracks,
  grade2BenchmarkInventory,
  grade3BenchmarkInventory,
} from '../src/domain/curriculum'
import {
  PARENT_ACCESS_SCHEMA_VERSION,
  PARENT_ACCESS_STORAGE_KEY,
  PARENT_RECORDS_SCHEMA_VERSION,
  PARENT_RECORDS_STORAGE_KEY,
  QUEST_PROGRESS_SCHEMA_VERSION,
  QUEST_PROGRESS_STORAGE_KEY,
} from '../src/persistence'

interface LedgerRecord {
  questionId: string
  packId: string
  contentFingerprint: string
  finalStatus: string
}

const ledgerModules = import.meta.glob(
  '../docs/content/question-truth-ledger/*.json',
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

const activePacks = getActiveContentPacks()
const grade2Packs = activePacks.filter((pack) => pack.manifest.gradeBand === 2)
const grade3Packs = activePacks.filter((pack) => pack.manifest.gradeBand === 3)

describe('final Grade 3 repository audit', () => {
  test('freezes the active curriculum inventory and every cross-pack identifier', () => {
    const lessons = activePacks.flatMap((pack) => pack.lessons)
    const passages = activePacks.flatMap((pack) => pack.passages)
    const questions = activePacks.flatMap((pack) => pack.questions)
    const pairs = activePacks.flatMap((pack) => pack.pairedTextSets ?? [])
    const supportTargets = passages.flatMap((passage) => passage.wordSupportTargets ?? [])

    expect(contentPacks).toHaveLength(41)
    expect(activePacks).toHaveLength(40)
    expect(contentPacks.filter((pack) => pack.manifest.packId.startsWith('legacy-'))).toHaveLength(1)
    expect(grade2Packs).toHaveLength(22)
    expect(grade3Packs).toHaveLength(18)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40,
      activeLessonCount: 280,
      activePassageCount: 294,
      activeQuestionCount: 1614,
      activeSupportTargetCount: 1111,
    })
    expect(registryCounts(grade2Packs)).toEqual({ lessons: 154, passages: 161, questions: 889, supportTargets: 614 })
    expect(registryCounts(grade3Packs)).toEqual({ lessons: 126, passages: 133, questions: 725, supportTargets: 497 })

    expectUnique(activePacks.map((pack) => pack.manifest.packId))
    expectUnique(activePacks.map((pack) => pack.manifest.contentVersion))
    expectUnique(lessons.map((lesson) => lesson.lessonId))
    expectUnique(lessons.map((lesson) => lesson.activityId))
    expectUnique(passages.map((passage) => passage.passageIdentifier))
    expectUnique(pairs.map((pair) => pair.pairId))
    expectUnique(questions.map((question) => question.questionIdentifier))
    expectUnique(supportTargets.map((target) => target.targetId))
    expect(activePacks.some((pack) => pack.manifest.gradeBand === 4)).toBe(false)
    expect(questions.some((question) => question.gradeBand === 4)).toBe(false)
    expect(contentPackAudit, JSON.stringify(contentPackAudit, null, 2)).toEqual([])
    expect(validateContent(sampleContent)).toEqual([])
    expect(auditSemanticQuestionPacks(activePacks).issues).toEqual([])
  })

  test('derives complete DRAFT coverage for all sixteen Grade 3 inventory rows', () => {
    const snapshot = buildGrade3CoverageSnapshot()
    const statusCounts = countBy(snapshot.rows.map((row) => row.coverageStatus))

    expect(grade3BenchmarkInventory).toHaveLength(16)
    expectUnique(grade3BenchmarkInventory.map((entry) => entry.benchmarkReference))
    expect(grade3BenchmarkInventory.filter((entry) => entry.intendedCoverageKind === 'benchmark')).toHaveLength(14)
    expect(grade3BenchmarkInventory.filter((entry) => entry.intendedCoverageKind === 'supportive_practice').map((entry) => entry.benchmarkReference)).toEqual([
      'ELA.3.F.1.4',
      'ELA.3.V.1.1',
    ])
    expect(snapshot.rows).toHaveLength(16)
    expect(statusCounts).toEqual({ implemented: 14, supportive_practice: 2 })
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
    expect(snapshot.rows.every((row) => row.contributingPackIds.length > 0)).toBe(true)
    expect(snapshot.rows.every((row) => row.coveredPatterns.length === row.expectedPatterns.length)).toBe(true)
    expect(snapshot.rows.every((row) => row.missingPatterns.length === 0)).toBe(true)
    expect(snapshot.rows.every((row) => row.notes.some((note) => !/learner mastery/i.test(note) || /does not claim learner mastery/i.test(note)))).toBe(true)
  })

  test('keeps every Grade 3 pack internally versioned, DRAFT, and role-safe', () => {
    for (const pack of grade3Packs) {
      const { contentVersion, reviewStatus, unitId } = pack.manifest
      expect(reviewStatus, pack.manifest.packId).toBe('DRAFT')
      expect(pack.passages.every((passage) => passage.reviewStatus === 'DRAFT' && passage.contentVersion === contentVersion)).toBe(true)
      expect(pack.questions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === contentVersion && question.gradeBand === 3)).toBe(true)
      expect(pack.lessons.every((lesson) => lesson.contentVersion === contentVersion && lesson.unitId === unitId && lesson.selectionStatus === 'active')).toBe(true)
      expect(pack.passages.flatMap((passage) => passage.wordSupportTargets ?? []).every((target) => target.reviewStatus === 'DRAFT' && target.contentVersion === contentVersion)).toBe(true)
      expect((pack.pairedTextSets ?? []).every((pair) => pair.reviewStatus === 'DRAFT' && pair.contentVersion === contentVersion)).toBe(true)

      for (const [property, value] of Object.entries(pack)) {
        if (!property.endsWith('Guides') || !Array.isArray(value)) continue
        expect(value.every((guide) => guide.reviewStatus === 'DRAFT' && guide.contentVersion === contentVersion), `${pack.manifest.packId}:${property}`).toBe(true)
      }
      for (const lesson of pack.lessons) {
        if (lesson.lessonRole === 'GUIDED_PRACTICE') expect(lesson.teachingBlock, lesson.lessonId).toBeDefined()
        if (lesson.lessonRole === 'CHECKPOINT') expect(lesson.teachingBlock, lesson.lessonId).toBeUndefined()
      }
    }
  })

  test('preserves the frozen Grade 2 registry and coverage snapshot', () => {
    const snapshot = buildGrade2CoverageSnapshot()
    expect(grade2BenchmarkInventory).toHaveLength(20)
    expect(snapshot.rows).toHaveLength(20)
    expect(countBy(snapshot.rows.map((row) => row.coverageStatus))).toEqual({ implemented: 19, supportive_practice: 1 })
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
    expect(snapshot.rows.every((row) => row.missingPatterns.length === 0)).toBe(true)
  })

  test('keeps exactly six ordered, domain-prerequisite Grade 3 tracks and no Grade 4 track', () => {
    const grade3Tracks = curriculumTracks.filter((track) => track.gradeBand === 3)
    expect(grade3Tracks.map((track) => ({
      trackId: track.trackId,
      order: track.curriculumOrder,
      prerequisite: track.prerequisiteTrackIds[0],
    }))).toEqual([
      { trackId: 'g3-word-forge-foundations', order: 110, prerequisite: 'g2-word-forge-foundations' },
      { trackId: 'g3-story-scouts-prose', order: 120, prerequisite: 'g2-story-scouts-prose' },
      { trackId: 'g3-poetry-planet', order: 130, prerequisite: 'g2-poetry-planet' },
      { trackId: 'g3-information-detectives-reading', order: 140, prerequisite: 'g2-information-detectives-reading' },
      { trackId: 'g3-context-cavern-vocabulary', order: 150, prerequisite: 'g2-context-cavern-vocabulary' },
      { trackId: 'g3-across-genres-reading', order: 160, prerequisite: 'g2-across-genres-reading' },
    ])
    expectUnique(grade3Tracks.map((track) => track.trackId))
    expectUnique(grade3Tracks.map((track) => track.skillId))
    expect(curriculumTracks.some((track) => track.gradeBand === 4)).toBe(false)
  })

  test('reconciles one current PASS truth record per active question', () => {
    const inventory = buildActiveQuestionTruthInventory(activePacks)
    const activeById = new Map(inventory.records.map((record) => [record.questionId, record] as const))
    const ledgerRecords = Object.values(ledgerModules).flatMap((raw) => JSON.parse(raw) as LedgerRecord[])

    expect(inventory.issues).toEqual([])
    expect(inventory.records).toHaveLength(1614)
    expect(Object.keys(ledgerModules)).toHaveLength(40)
    expect(ledgerRecords).toHaveLength(1614)
    expectUnique(ledgerRecords.map((record) => record.questionId))
    expect(ledgerRecords.every((record) => record.finalStatus === 'PASS')).toBe(true)
    expect(ledgerRecords.map((record) => record.questionId).sort()).toEqual([...activeById.keys()].sort())
    expect(ledgerRecords.every((record) => activeById.get(record.questionId)?.contentFingerprint === record.contentFingerprint)).toBe(true)
  })

  test('preserves fluency measurement limits, schema v1, storage keys, and terminal completion copy', () => {
    expect(grade3FluencyPracticeAudit).toEqual(expect.objectContaining({
      supportingBenchmarkReference: 'ELA.3.F.1.4',
      missingSupportComponents: [],
      contributingPackIds: ['g3-word-forge-fluency-flight'],
      supportStatus: 'supportive_practice',
      reviewStatus: 'DRAFT',
      oralReadingMeasured: false,
      timerUsed: false,
      microphoneUsed: false,
      issues: [],
    }))
    expect([QUEST_PROGRESS_SCHEMA_VERSION, PARENT_ACCESS_SCHEMA_VERSION, PARENT_RECORDS_SCHEMA_VERSION]).toEqual([1, 1, 1])
    expect([QUEST_PROGRESS_STORAGE_KEY, PARENT_ACCESS_STORAGE_KEY, PARENT_RECORDS_STORAGE_KEY]).toEqual([
      'rorys-reading-quest.progress.v1',
      'rorys-reading-quest.parent-access.v1',
      'rorys-reading-quest.parent-records.v1',
    ])
    const completionScreen = readFileSync('src/screens/ProgressionOutcomeScreen.tsx', 'utf8')
    expect(completionScreen).toContain('Grade 3 Journey Complete!')
    expect(completionScreen).toContain('Curriculum completion is not the same as learner mastery.')
  })
})

function registryCounts(packs: typeof activePacks) {
  const passages = packs.flatMap((pack) => pack.passages)
  return {
    lessons: packs.reduce((sum, pack) => sum + pack.lessons.length, 0),
    passages: passages.length,
    questions: packs.reduce((sum, pack) => sum + pack.questions.length, 0),
    supportTargets: passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0),
  }
}

function expectUnique(values: readonly string[]): void {
  expect(new Set(values).size).toBe(values.length)
}

function countBy(values: readonly string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1
    return counts
  }, {})
}
