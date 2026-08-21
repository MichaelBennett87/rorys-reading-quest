import { describe, expect, test } from 'vitest'

import { contentPackAudit, contentPacks, sampleContent } from '../../src/domain/content'
import { validateContent } from '../../src/domain/content/validateContent'

const STORY_MAP_PACK_ID = 'g2-story-scouts-plot-structure-elements'

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

describe('grade 2 story scouts story map pack', () => {
  test('matches the authored Story Map inventory and structure', () => {
    const pack = contentPacks.find((entry) => entry.manifest.packId === STORY_MAP_PACK_ID)
    expect(pack).toBeDefined()
    const storyMapPack = pack!

    expect(storyMapPack.manifest).toEqual(expect.objectContaining({
      packId: STORY_MAP_PACK_ID,
      packTitle: 'Grade 2 Story Scouts: Story Map',
      gradeBand: 2,
      worldId: 'story-scouts',
      unitId: 'ss-unit-1',
      primarySkillId: 'g2-story-scouts-prose',
      benchmarkReferences: ['ELA.2.R.1.1'],
      partialBenchmarkCoverage: 'Story Map coverage of plot structure, setting, characters, and sequence of events',
      difficultyRange: [0, 1],
      contentVersion: 'g2-ss-plot-elements-r0.1.0',
      reviewStatus: 'DRAFT',
      coveredPatterns: [
        'plot-structure',
        'setting',
        'characters',
        'sequence-of-events',
        'plot-beginning-middle-end',
        'plot-problem-resolution',
        'setting-where',
        'setting-when',
        'character-traits',
        'character-feelings',
        'character-behaviors',
        'event-sequencing',
      ],
    }))

    expect(storyMapPack.lessons).toHaveLength(7)
    expect(storyMapPack.passages).toHaveLength(7)
    expect(storyMapPack.questions).toHaveLength(41)

    expect(storyMapPack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(4)
    expect(storyMapPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(storyMapPack.lessons.filter((lesson) => lesson.difficulty === 0)).toHaveLength(2)
    expect(storyMapPack.lessons.filter((lesson) => lesson.difficulty === 1)).toHaveLength(5)

    expect(storyMapPack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE').every((lesson) => lesson.teachingBlock)).toBe(true)
    expect(storyMapPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT').every((lesson) => !lesson.teachingBlock)).toBe(true)

    expect(storyMapPack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE').every((lesson) => lesson.eligiblePurposes.includes('remediation') && lesson.eligiblePurposes.includes('review'))).toBe(true)
    expect(storyMapPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT').every((lesson) => lesson.eligiblePurposes.includes('progression') && lesson.eligiblePurposes.includes('verification') && lesson.eligiblePurposes.includes('review'))).toBe(true)

    expect(storyMapPack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE').map((lesson) => lesson.questionIdentifiers.length)).toEqual([5, 5, 5, 5])
    expect(storyMapPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT').map((lesson) => lesson.questionIdentifiers.length)).toEqual([7, 7, 7])

    expect(storyMapPack.questions.map((question) => question.questionType).filter((type) => type === 'multiple_choice')).toHaveLength(17)
    expect(storyMapPack.questions.map((question) => question.questionType).filter((type) => type === 'multi_select')).toHaveLength(7)
    expect(storyMapPack.questions.map((question) => question.questionType).filter((type) => type === 'hot_text')).toHaveLength(7)
    expect(storyMapPack.questions.map((question) => question.questionType).filter((type) => type === 'table_match')).toHaveLength(7)
    expect(storyMapPack.questions.map((question) => question.questionType).filter((type) => type === 'two_part')).toHaveLength(3)

    expect(storyMapPack.questions.every((question) => question.gradeBand === 2)).toBe(true)
    expect(storyMapPack.questions.every((question) => question.benchmarkReference === 'ELA.2.R.1.1')).toBe(true)
    expect(storyMapPack.questions.every((question) => question.skillIdentifier === 'g2-story-scouts-prose')).toBe(true)
    expect(storyMapPack.questions.every((question) => question.reportingCategory === 'Reading Prose and Poetry')).toBe(true)
    expect(storyMapPack.questions.every((question) => question.reviewStatus === 'DRAFT')).toBe(true)
    expect(storyMapPack.questions.every((question) => question.contentVersion === 'g2-ss-plot-elements-r0.1.0')).toBe(true)
    expect(storyMapPack.questions.every((question) => question.explanation && question.evidenceReference)).toBe(true)
    expect(storyMapPack.questions.every((question) => question.correctAnswers.length > 0)).toBe(true)
    expect(new Set(storyMapPack.questions.map((question) => question.questionIdentifier)).size).toBe(storyMapPack.questions.length)

    expect(storyMapPack.passages.every((passage) => passage.reviewStatus === 'DRAFT')).toBe(true)
    expect(storyMapPack.passages.every((passage) => passage.contentVersion === 'g2-ss-plot-elements-r0.1.0')).toBe(true)
    expect(new Set(storyMapPack.passages.map((passage) => passage.passageIdentifier)).size).toBe(storyMapPack.passages.length)
    expect(storyMapPack.passages.every((passage) => (passage.wordSupportTargets ?? []).length === 4)).toBe(true)
    expect(storyMapPack.passages.flatMap((passage) => passage.wordSupportTargets ?? []).length).toBe(28)

    for (const passage of storyMapPack.passages) {
      for (const target of passage.wordSupportTargets ?? []) {
        const focusWord = target.focusParts.map((part) => part.text).join('')
        const displayWord = target.displayChunks.map((chunk) => chunk.displayText).join('')
        expect(normalize(focusWord)).toBe(normalize(target.surfaceWord))
        expect(normalize(displayWord)).toBe(normalize(target.surfaceWord))
        expect(target.reviewStatus).toBe('DRAFT')
        expect(target.contentVersion).toBe('g2-ss-plot-elements-r0.1.0')
        const sentenceText = (passage.sentences ?? []).map((sentence) => sentence.text).join(' ')
        expect(normalize(`${passage.passageText} ${sentenceText}`)).toContain(normalize(target.surfaceWord))
      }
    }
  })

  test('passes the global content validation and content-pack audit', () => {
    expect(contentPackAudit).toHaveLength(0)
    expect(validateContent(sampleContent)).toHaveLength(0)
  })
})
