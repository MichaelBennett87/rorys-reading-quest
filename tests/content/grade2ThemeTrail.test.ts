import { describe, expect, it } from 'vitest'
import { benchmarkCoverageAudit, contentPackAudit, contentPacks, sampleContent, validateContent } from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import { getExpectedBenchmarkPatterns } from '../../src/domain/content/packs/benchmarkPatternCatalog'
import { grade2StoryScoutsThemeTrailPack } from '../../src/domain/content/packs/grade2/storyScouts/themeTrail'

describe('Grade 2 Story Scouts Theme Trail pack', () => {
  it('registers the authored Theme Trail pack with DRAFT benchmark coverage', () => {
    expect(contentPacks.some((pack) => pack.manifest.packId === grade2StoryScoutsThemeTrailPack.manifest.packId)).toBe(true)
    expect(grade2StoryScoutsThemeTrailPack.manifest.packId).toBe('g2-story-scouts-theme-trail')
    expect(grade2StoryScoutsThemeTrailPack.manifest.contentVersion).toBe('g2-ss-theme-r0.1.0')
    expect(grade2StoryScoutsThemeTrailPack.manifest.benchmarkReferences).toEqual(['ELA.2.R.1.2'])
    expect(grade2StoryScoutsThemeTrailPack.manifest.coverageKind).toBe('benchmark')
  })

  it('keeps the Theme Trail pack bounded and fully authored', () => {
    expect(grade2StoryScoutsThemeTrailPack.passages).toHaveLength(7)
    expect(grade2StoryScoutsThemeTrailPack.questions).toHaveLength(41)
    expect(grade2StoryScoutsThemeTrailPack.lessons).toHaveLength(7)
    expect(grade2StoryScoutsThemeTrailPack.themeGuides).toHaveLength(7)

    expect(grade2StoryScoutsThemeTrailPack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(4)
    expect(grade2StoryScoutsThemeTrailPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(grade2StoryScoutsThemeTrailPack.lessons.filter((lesson) => lesson.difficulty === 1)).toHaveLength(2)
    expect(grade2StoryScoutsThemeTrailPack.lessons.filter((lesson) => lesson.difficulty === 2)).toHaveLength(5)

    expect(grade2StoryScoutsThemeTrailPack.questions.filter((question) => question.questionType === 'multiple_choice')).toHaveLength(17)
    expect(grade2StoryScoutsThemeTrailPack.questions.filter((question) => question.questionType === 'multi_select')).toHaveLength(7)
    expect(grade2StoryScoutsThemeTrailPack.questions.filter((question) => question.questionType === 'hot_text')).toHaveLength(7)
    expect(grade2StoryScoutsThemeTrailPack.questions.filter((question) => question.questionType === 'table_match')).toHaveLength(7)
    expect(grade2StoryScoutsThemeTrailPack.questions.filter((question) => question.questionType === 'two_part')).toHaveLength(3)

    expect(grade2StoryScoutsThemeTrailPack.passages.every((passage) => passage.reviewStatus === 'DRAFT')).toBe(true)
    expect(grade2StoryScoutsThemeTrailPack.questions.every((question) => question.reviewStatus === 'DRAFT')).toBe(true)
    expect(grade2StoryScoutsThemeTrailPack.lessons.every((lesson) => lesson.contentVersion === 'g2-ss-theme-r0.1.0')).toBe(true)
    expect(grade2StoryScoutsThemeTrailPack.passages.every((passage) => passage.contentVersion === 'g2-ss-theme-r0.1.0')).toBe(true)
    expect(grade2StoryScoutsThemeTrailPack.questions.every((question) => question.contentVersion === 'g2-ss-theme-r0.1.0')).toBe(true)
    expect(grade2StoryScoutsThemeTrailPack.themeGuides?.every((guide) => guide.reviewStatus === 'DRAFT' && guide.contentVersion === 'g2-ss-theme-r0.1.0')).toBe(true)
    expect(grade2StoryScoutsThemeTrailPack.passages.every((passage) => passage.wordSupportTargets?.length === 4)).toBe(true)
    expect(grade2StoryScoutsThemeTrailPack.passages.every((passage) => passage.wordSupportTargets?.every((target) => target.reviewStatus === 'DRAFT' && target.contentVersion === 'g2-ss-theme-r0.1.0'))).toBe(true)
  })

  it('reports authored benchmark and content audits without blocking issues', () => {
    expect(contentPackAudit).toHaveLength(0)
    expect(validateContent(sampleContent)).toHaveLength(0)
    expect(benchmarkCoverageAudit).toEqual(expect.objectContaining({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))

    const themeTrailCoverage = buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.1.2')

    expect(themeTrailCoverage).toEqual(expect.objectContaining({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      expectedPatterns: ['theme-identification', 'theme-explanation'],
      coveredPatterns: ['theme-identification', 'theme-explanation'],
      missingPatterns: [],
    }))
    expect(themeTrailCoverage.contributingPackIds).toContain('g2-story-scouts-theme-trail')
    expect(getExpectedBenchmarkPatterns('ELA.2.R.1.1')).toEqual([
      'plot-structure',
      'setting',
      'characters',
      'sequence-of-events',
    ])
    expect(getExpectedBenchmarkPatterns('ELA.2.R.1.2')).toEqual([
      'theme-identification',
      'theme-explanation',
    ])
  })
})
