import { describe, expect, test } from 'vitest'

import {
  contentPackAudit,
  contentPacks,
  resolvePassageEvidence,
  sampleContent,
  validateContent,
} from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import { getActiveContentRegistryTotals } from '../../src/domain/content/packs/registry'
import { grade2CompareCastleWordplayWatchtowerPack } from '../../src/domain/content/packs/grade2/compareCastle/wordplayWatchtower'

const WORDPLAY_VERSION = 'g2-cg-wordplay-r0.1.0'
const WORDPLAY_PACK_ID = 'g2-compare-castle-wordplay-watchtower'
const RETELL_PACK_ID = 'g2-compare-castle-retell-hall'

describe('Grade 2 Compare Castle Wordplay Watchtower pack', () => {
  test('registers the active Compare Castle pack and updates registry totals', () => {
    const activePackIds = contentPacks
      .filter((pack) => !pack.manifest.packId.startsWith('legacy-'))
      .map((pack) => pack.manifest.packId)

    expect(contentPacks.some((pack) => pack.manifest.packId === WORDPLAY_PACK_ID)).toBe(true)
    expect(activePackIds.at(-10)).toBe(WORDPLAY_PACK_ID)
    expect(activePackIds.at(-9)).toBe(RETELL_PACK_ID)
    expect(activePackIds.at(-8)).toBe('g2-compare-castle-compare-keep')
    expect(activePackIds.at(-7)).toBe('g3-word-forge-root-reactor')
    expect(activePackIds.at(-6)).toBe('g3-word-forge-suffix-shifter')
    expect(activePackIds.at(-5)).toBe('g3-word-forge-multisyllable-mountain')
    expect(activePackIds.at(-4)).toBe('g3-word-forge-fluency-flight')
    expect(activePackIds.at(-3)).toBe('g3-story-scouts-character-arc-camp')
    expect(activePackIds.at(-2)).toBe('g3-story-scouts-theme-development-trail')
    expect(activePackIds.at(-1)).toBe('g3-story-scouts-perspective-portal')
    expect(grade2CompareCastleWordplayWatchtowerPack.manifest).toEqual(expect.objectContaining({
      packId: WORDPLAY_PACK_ID,
      packTitle: 'Grade 2 Compare Castle: Wordplay Watchtower',
      worldId: 'compare-castle',
      unitId: 'cg-unit-1',
      primarySkillId: 'g2-across-genres-reading',
      benchmarkReferences: ['ELA.2.R.3.1'],
      coverageKind: 'benchmark',
      reviewStatus: 'DRAFT',
      contentVersion: WORDPLAY_VERSION,
      difficultyRange: [0, 1],
    }))
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 29,
      activeLessonCount: 203,
      activePassageCount: 210,
      activeQuestionCount: 1163,
      activeSupportTargetCount: 803,
    })
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.3.1')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.3.1',
      expectedPatterns: ['similes', 'idioms', 'alliteration'],
      coveredPatterns: ['similes', 'idioms', 'alliteration'],
      missingPatterns: [],
      contributingPackIds: [WORDPLAY_PACK_ID],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(validateContent(sampleContent)).toHaveLength(0)
    expect(contentPackAudit).toHaveLength(0)
  })

  test('keeps seven authored texts, twenty-eight targets, and forty-one questions bounded and DRAFT', () => {
    const pack = grade2CompareCastleWordplayWatchtowerPack
    const questionTypeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})
    const guidePassageIds = new Set(pack.wordplayGuides?.map((guide) => guide.passageId))
    const targetIds = new Set<string>()
    const observedLikeSimiles: string[] = []
    const observedAsSimiles: string[] = []
    const observedIdioms = new Set<string>()
    const observedAlliterationSounds = new Set<string>()

    expect(pack.passages).toHaveLength(7)
    expect(pack.passages.filter((passage) => passage.contentKind === 'prose')).toHaveLength(5)
    expect(pack.passages.filter((passage) => passage.contentKind === 'poem')).toHaveLength(2)
    expect(pack.lessons).toHaveLength(7)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 0)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(pack.wordplayGuides).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(questionTypeCounts).toEqual({
      multiple_choice: 17,
      multi_select: 7,
      hot_text: 7,
      table_match: 7,
      two_part: 3,
    })
    expect(pack.passages.every((passage) => passage.reviewStatus === 'DRAFT' && passage.contentVersion === WORDPLAY_VERSION)).toBe(true)
    expect(pack.lessons.every((lesson) => lesson.selectionStatus === 'active' && lesson.contentVersion === WORDPLAY_VERSION)).toBe(true)
    expect(pack.questions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === WORDPLAY_VERSION)).toBe(true)
    expect(pack.wordplayGuides?.every((guide) => guide.reviewStatus === 'DRAFT' && guide.contentVersion === WORDPLAY_VERSION)).toBe(true)
    expect(pack.passages.every((passage) => passage.wordSupportTargets?.length === 4)).toBe(true)

    for (const passage of pack.passages) {
      expect(guidePassageIds.has(passage.passageIdentifier)).toBe(true)
      const guide = pack.wordplayGuides?.find((entry) => entry.passageId === passage.passageIdentifier)
      expect(guide).toBeTruthy()
      expect(guide?.targets).toHaveLength(4)
      expect(new Set((guide?.targets ?? []).map((target) => target.targetId)).size).toBe(4)

      for (const target of guide?.targets ?? []) {
        expect(target.targetId).toMatch(/\S/)
        expect(target.expressionText).toMatch(/\S/)
        expect(target.explanationStatement).toMatch(/\S/)
        expect(resolvePassageEvidence(passage, target.sentenceId)).toBeTruthy()
        expect(resolvePassageEvidence(passage, target.sentenceId)?.text.toLowerCase()).toContain(target.expressionText.toLowerCase())
        expect(targetIds.has(target.targetId)).toBe(false)
        targetIds.add(target.targetId)

        if (target.kind === 'simile') {
          expect(target.figurativeComparison).toBe(true)
          expect(target.signalWord).toMatch(/^(like|as)$/)
          expect(target.comparisonSubject).toMatch(/\S/)
          expect(target.comparisonObject).toMatch(/\S/)
          expect(target.sharedQuality).toMatch(/\S/)
          if (target.signalWord === 'like') observedLikeSimiles.push(target.targetId)
          if (target.signalWord === 'as') observedAsSimiles.push(target.targetId)
        }

        if (target.kind === 'idiom') {
          expect(target.nonliteral).toBe(true)
          expect(target.intendedMeaning).toMatch(/\S/)
          expect(target.literalReading).toMatch(/\S/)
          expect(target.contextEvidenceIds.length).toBeGreaterThan(0)
          observedIdioms.add(target.expressionText.toLowerCase())
        }

        if (target.kind === 'alliteration') {
          expect(target.soundExplanation).toMatch(/\S/)
          expect(target.repeatedInitialSound).toMatch(/\S/)
          expect(target.alliterativeWords.length).toBeGreaterThanOrEqual(3)
          const sound = target.repeatedInitialSound.toLowerCase()
          observedAlliterationSounds.add(sound)
          for (const alliterativeWord of target.alliterativeWords) {
            expect(alliterativeWord.word).toMatch(/\S/)
            expect(alliterativeWord.initialSound.toLowerCase()).toBe(sound)
            expect(resolvePassageEvidence(passage, target.sentenceId)?.text.toLowerCase()).toContain(alliterativeWord.word.toLowerCase())
          }
        }
      }

      for (const supportTarget of passage.wordSupportTargets ?? []) {
        expect(supportTarget.reviewStatus).toBe('DRAFT')
        expect(supportTarget.contentVersion).toBe(WORDPLAY_VERSION)
        expect(passage.sentences?.some((sentence) => sentence.sentenceId === supportTarget.sentenceId)).toBe(true)
      }
    }

    expect(observedLikeSimiles.length).toBeGreaterThanOrEqual(4)
    expect(observedAsSimiles.length).toBeGreaterThanOrEqual(4)
    expect(observedIdioms.size).toBeGreaterThanOrEqual(7)
    expect(observedAlliterationSounds.size).toBeGreaterThanOrEqual(5)
    expect(targetIds.size).toBe(28)
  })
})
