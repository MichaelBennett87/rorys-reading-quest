import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks, buildActiveQuestionTruthInventory, buildBlindQuestionTruthProjection } from '../../src/domain/content'
import { buildContentPackAudit, buildGrade3FluencyPracticeAudit } from '../../src/domain/content/packs'
import {
  grade3WordForgeFluencyFlightLessons,
  grade3WordForgeFluencyFlightPack,
  grade3WordForgeFluencyFlightPassages,
} from '../../src/domain/content/packs/grade3/wordForge/fluencyFlight'
import { createDefaultQuestProgress } from '../../src/persistence'

const PACK_ID = 'g3-word-forge-fluency-flight'
const VERSION = 'g3-wf-fluency-flight-r0.1.0'

describe('Grade 3 Fluency Flight authored pack', () => {
  test('uses the established seven-lesson supportive-practice shape', () => {
    const pack = grade3WordForgeFluencyFlightPack
    const typeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})
    const supportTargets = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])

    expect(pack.manifest).toMatchObject({
      packId: PACK_ID,
      contentVersion: VERSION,
      gradeBand: 3,
      worldId: 'word-forge',
      unitId: 'g3-wg-unit-4',
      primarySkillId: 'g3-word-forge-word-analysis',
      benchmarkReferences: [],
      supportingBenchmarkReferences: ['ELA.3.F.1.4'],
      coverageKind: 'supportive_practice',
      reviewStatus: 'DRAFT',
    })
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(28)
    expect(supportTargets).toHaveLength(21)
    expect(typeCounts).toEqual({ multiple_choice: 14, multi_select: 5, hot_text: 5, table_match: 4 })
    expect(pack.lessons.filter((lesson) => lesson.fluencyPracticeBlock?.practiceMode === 'guided')).toHaveLength(4)
    expect(pack.lessons.filter((lesson) => lesson.fluencyPracticeBlock?.practiceMode === 'independent')).toHaveLength(3)
    expect(pack.lessons.every((lesson) => lesson.lessonRole === 'FLUENCY_PRACTICE' && lesson.difficulty === 4)).toBe(true)
    expect(pack.lessons.every((lesson) => lesson.questionIdentifiers.length === 4)).toBe(true)
  })

  test('keeps guided teaching separate from independent practice and oral measurement', () => {
    const guided = grade3WordForgeFluencyFlightLessons.filter((lesson) => lesson.fluencyPracticeBlock?.practiceMode === 'guided')
    const independent = grade3WordForgeFluencyFlightLessons.filter((lesson) => lesson.fluencyPracticeBlock?.practiceMode === 'independent')
    expect(guided.every((lesson) => lesson.teachingBlock !== undefined)).toBe(true)
    expect(independent.every((lesson) => lesson.teachingBlock === undefined)).toBe(true)
    for (const lesson of grade3WordForgeFluencyFlightLessons) {
      expect(lesson.fluencyPracticeBlock).toMatchObject({
        modelReadingAvailable: true,
        oralReadingMeasured: false,
        timerUsed: false,
        microphoneUsed: false,
      })
      expect(lesson.fluencyPracticeBlock?.phraseGroups.length).toBeGreaterThan(0)
      expect(lesson.fluencyPracticeBlock?.expressionCues.length).toBeGreaterThan(0)
    }
  })

  test('reconstructs every passage from its visible phrase groups', () => {
    for (const lesson of grade3WordForgeFluencyFlightLessons) {
      const passage = grade3WordForgeFluencyFlightPassages.find((candidate) => candidate.passageIdentifier === lesson.passageIdentifiers[0])
      expect(passage).toBeDefined()
      expect(lesson.fluencyPracticeBlock?.phraseGroups.map((group) => group.text).join(' ')).toBe(passage?.passageText)
    }
  })

  test('provides exactly three safe word-help targets for every passage', () => {
    for (const passage of grade3WordForgeFluencyFlightPassages) {
      expect(passage.wordSupportTargets).toHaveLength(3)
      for (const target of passage.wordSupportTargets ?? []) {
        const sentence = passage.sentences?.find((candidate) => candidate.sentenceId === target.sentenceId)
        expect(sentence).toBeDefined()
        expect(sentence?.text.toLocaleLowerCase()).toContain(target.surfaceWord.toLocaleLowerCase())
        expect(target.sentenceSpeechText).toBe(sentence?.text)
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('').toLocaleLowerCase())
          .toBe(target.surfaceWord.toLocaleLowerCase())
        expect(target.contentVersion).toBe(VERSION)
        expect(target.reviewStatus).toBe('DRAFT')
      }
    }
  })

  test('passes content, semantic, ownership, and blind-projection audits before registration', () => {
    const pack = grade3WordForgeFluencyFlightPack
    expect(buildContentPackAudit([pack])).toEqual([])
    expect(buildGrade3FluencyPracticeAudit([pack])).toMatchObject({
      supportingBenchmarkReference: 'ELA.3.F.1.4',
      supportStatus: 'supportive_practice',
      missingSupportComponents: [],
      oralReadingMeasured: false,
    })
    expect(auditSemanticQuestionPacks([pack])).toMatchObject({ reviewedPackCount: 1, reviewedLessonCount: 7, reviewedCount: 28, issues: [] })
    const inventory = buildActiveQuestionTruthInventory([pack])
    expect(inventory.issues).toEqual([])
    expect(inventory.records).toHaveLength(28)
    expect(buildBlindQuestionTruthProjection([pack])).toHaveLength(28)
    expect(pack.questions.every((question) => (
      question.gradeBand === 3
      && question.benchmarkReference === 'ELA.3.F.1.4'
      && question.skillIdentifier === 'g3-word-forge-word-analysis'
      && question.reportingCategory === 'Foundational Skills Bridge'
      && question.reviewStatus === 'DRAFT'
      && question.contentVersion === VERSION
      && (question.explanation ?? '').trim().length > 0
    ))).toBe(true)
  })

  test('claims only supportive fluency knowledge and never oral measurement', () => {
    const manifest = grade3WordForgeFluencyFlightPack.manifest
    expect(manifest.coveredPatterns).toEqual([
      'accuracy-practice',
      'automaticity-practice',
      'phrasing-practice',
      'expression-practice',
      'no-oral-measurement',
    ])
    expect(manifest.benchmarkReferences).toEqual([])
    expect(manifest.supportingBenchmarkReferences).toEqual(['ELA.3.F.1.4'])
    expect(manifest.partialBenchmarkCoverage).toContain('does not record audio')
    expect(manifest.partialBenchmarkCoverage).toContain('does not')
  })

  test('keeps fluency guides and authored content out of persistence', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T12:00:00.000Z'))
    expect(serialized).not.toContain('fluencyPracticeBlock')
    expect(serialized).not.toContain('phraseGroups')
    expect(serialized).not.toContain('expressionCues')
    expect(serialized).not.toContain('Morning Above the Marsh')
  })
})
