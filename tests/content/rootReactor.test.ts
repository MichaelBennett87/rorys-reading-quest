import { describe, expect, test } from 'vitest'

import {
  auditSemanticQuestionPacks,
  contentPackAudit,
  contentPacks,
} from '../../src/domain/content'
import {
  buildRootDecodingGuideAudit,
  getActiveContentPacks,
  getActiveContentRegistryTotals,
} from '../../src/domain/content/packs'
import {
  buildGrade2CoverageSnapshot,
  buildGrade3CoverageSnapshot,
  curriculumTracks,
} from '../../src/domain/curriculum'
import { createDefaultQuestProgress } from '../../src/persistence'

const PACK_ID = 'g3-word-forge-root-reactor'
const CONTENT_VERSION = 'g3-wf-root-reactor-r0.1.0'
const REQUIRED_WORDS = [
  'telephone', 'telescope', 'geography', 'geology', 'photograph', 'photocopy',
  'autograph', 'graphic', 'biology', 'biography', 'microscope', 'microphone',
  'transport', 'export', 'tractor', 'retract', 'erupt', 'disrupt', 'transform',
  'uniform', 'bicycle', 'biplane', 'triangle', 'tripod', 'submarine', 'subway',
  'transfer', 'transplant',
] as const

function rootPack() {
  const pack = contentPacks.find((candidate) => candidate.manifest.packId === PACK_ID)
  expect(pack).toBeDefined()
  return pack!
}

describe('Grade 3 Root Reactor production pack', () => {
  test('registers one bounded Grade 3 pack while preserving the frozen Grade 2 slice', () => {
    const active = getActiveContentPacks()
    const grade2 = active.filter((pack) => pack.manifest.gradeBand === 2)
    const grade3 = active.filter((pack) => pack.manifest.gradeBand === 3)

    expect(grade2).toHaveLength(22)
    expect(grade2.reduce((sum, pack) => sum + pack.lessons.length, 0)).toBe(154)
    expect(grade2.reduce((sum, pack) => sum + pack.passages.length, 0)).toBe(161)
    expect(grade2.reduce((sum, pack) => sum + pack.questions.length, 0)).toBe(889)
    expect(grade2.reduce((sum, pack) => sum + pack.passages.flatMap((passage) => passage.wordSupportTargets ?? []).length, 0)).toBe(614)
    expect(grade3.map((pack) => pack.manifest.packId)).toEqual([PACK_ID, 'g3-word-forge-suffix-shifter', 'g3-word-forge-multisyllable-mountain', 'g3-word-forge-fluency-flight', 'g3-story-scouts-character-arc-camp', 'g3-story-scouts-theme-development-trail', 'g3-story-scouts-perspective-portal', 'g3-poetry-planet-poem-form-observatory', 'g3-information-detectives-structure-station', 'g3-information-detectives-central-idea-engine'])
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 32,
      activeLessonCount: 224,
      activePassageCount: 231,
      activeQuestionCount: 1286,
      activeSupportTargetCount: 887,
    })
  })

  test('keeps exact pack, lesson, passage, question, and support inventories', () => {
    const pack = rootPack()
    const questionTypes = pack.questions.reduce<Record<string, number>>((counts, question) => {
      const type = question.questionContent?.type ?? 'missing'
      counts[type] = (counts[type] ?? 0) + 1
      return counts
    }, {})

    expect(pack.manifest).toMatchObject({
      packId: PACK_ID,
      contentVersion: CONTENT_VERSION,
      gradeBand: 3,
      worldId: 'word-forge',
      unitId: 'g3-wg-unit-1',
      primarySkillId: 'g3-word-forge-word-analysis',
      benchmarkReferences: ['ELA.3.F.1.3'],
      reviewStatus: 'DRAFT',
    })
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(questionTypes).toEqual({
      multiple_choice: 17,
      multi_select: 7,
      hot_text: 7,
      table_match: 7,
      two_part: 3,
    })
    expect(pack.questions.every((question) => (
      question.gradeBand === 3
      && question.skillIdentifier === 'g3-word-forge-word-analysis'
      && question.reportingCategory === 'Foundational Skills Bridge'
      && question.benchmarkReference === 'ELA.3.F.1.3'
      && question.contentVersion === CONTENT_VERSION
      && question.reviewStatus === 'DRAFT'
      && (question.explanation?.trim().length ?? 0) > 0
    ))).toBe(true)
  })

  test('keeps all twenty-eight root guides internally aligned with Word Help', () => {
    const pack = rootPack()
    const guides = pack.rootDecodingGuides ?? []
    const targets = guides.flatMap((guide) => guide.targets)
    const supportTargets = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])

    expect(guides).toHaveLength(7)
    expect(guides.every((guide) => guide.targets.length === 4)).toBe(true)
    expect(targets).toHaveLength(28)
    expect(targets.map((target) => target.surfaceWord).sort()).toEqual([...REQUIRED_WORDS].sort())
    expect(new Set(targets.map((target) => target.targetId)).size).toBe(28)
    expect(targets.filter((target) => target.primaryPart.kind !== 'prefix' && target.primaryPart.origin === 'Greek')).toHaveLength(12)
    expect(targets.filter((target) => target.primaryPart.kind !== 'prefix' && target.primaryPart.origin === 'Latin')).toHaveLength(8)
    expect(targets.filter((target) => target.primaryPart.kind === 'prefix')).toHaveLength(8)

    for (const target of targets) {
      expect(target.morphologicalChunks.map((chunk) => chunk.text).join('')).toBe(target.surfaceWord)
      expect(target.syllableChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
      expect(target.syllableChunks.every((chunk) => chunk.speechText.trim().length > 0)).toBe(true)
      const support = supportTargets.find((candidate) => candidate.targetId === target.targetId)
      expect(support).toBeDefined()
      expect(support?.surfaceWord).toBe(target.surfaceWord)
      expect(support?.sentenceId).toBe(target.sentenceId)
      expect(support?.displayChunks.map((chunk) => chunk.displayText)).toEqual(target.syllableChunks.map((chunk) => chunk.displayText))
      expect(support?.spokenChunks.map((chunk) => chunk.speechText)).toEqual(target.syllableChunks.map((chunk) => chunk.speechText))
    }

    expect(buildRootDecodingGuideAudit(pack)).toEqual([])
    expect(contentPackAudit).toEqual([])
  })

  test('reports implemented DRAFT F.1.3 coverage and preserves every other benchmark boundary', () => {
    const grade2Before = buildGrade2CoverageSnapshot()
    const snapshot = buildGrade3CoverageSnapshot()
    const f13 = snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.F.1.3')

    expect(f13).toMatchObject({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      contributingPackIds: ['g3-word-forge-multisyllable-mountain', PACK_ID, 'g3-word-forge-suffix-shifter'],
      coveredPatterns: ['greek-latin-root-decoding', 'affix-decoding', 'derivational-suffix-decoding', 'part-of-speech-change', 'multisyllabic-decoding'],
      missingPatterns: [],
    })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'partial')).toHaveLength(0)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(8)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(7)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.V.1.2')?.coverageStatus).toBe('planned')
    expect(buildGrade2CoverageSnapshot()).toEqual(grade2Before)
  })

  test('preserves Grade 3 Word Forge while Story Scouts activation remains content-gated', () => {
    expect(curriculumTracks.find((track) => track.trackId === 'g3-word-forge-foundations')?.status).toBe('active')
    expect(curriculumTracks.find((track) => track.trackId === 'g3-story-scouts-prose')?.status).toBe('active')
    expect(curriculumTracks.find((track) => track.trackId === 'g3-poetry-planet')?.status).toBe('active')
    expect(curriculumTracks.find((track) => track.trackId === 'g3-information-detectives-reading')?.status).toBe('active')
    expect(curriculumTracks.filter((track) => track.gradeBand === 3 && !['g3-word-forge-foundations', 'g3-story-scouts-prose', 'g3-poetry-planet', 'g3-information-detectives-reading'].includes(track.trackId)).every((track) => track.status === 'planned_until_content_exists')).toBe(true)
    expect(auditSemanticQuestionPacks(getActiveContentPacks())).toMatchObject({
      reviewedPackCount: 32,
      reviewedLessonCount: 224,
      reviewedCount: 1286,
      issues: [],
    })
  })

  test('does not persist authored root guide data', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-23T12:00:00.000Z'))
    expect(serialized).not.toContain('rootDecodingGuides')
    expect(serialized).not.toContain('meaningSupportStatement')
    expect(serialized).not.toContain('telephone')
  })
})
