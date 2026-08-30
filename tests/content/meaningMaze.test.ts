import { describe, expect, it } from 'vitest'
import { buildContentPackAudit } from '../../src/domain/content/packs/contentPackAudit'
import { buildMeaningMazeGuideAudit } from '../../src/domain/content/packs/meaningMazeGuideAudit'
import {
  grade3ContextCavernMeaningMazePack,
  grade3MeaningMazeGuides,
} from '../../src/domain/content/packs/grade3/contextCavern/meaningMaze'

describe('Grade 3 Meaning Maze authored pack', () => {
  it('has the exact source, lesson, target, support, and question inventory', () => {
    const pack = grade3ContextCavernMeaningMazePack
    const allTargets = grade3MeaningMazeGuides.flatMap((guide) => guide.targets)
    const sourceKinds = pack.passages.map((passage) => passage.contentKind)
    const typeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})

    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(sourceKinds.filter((kind) => kind === 'informational')).toHaveLength(4)
    expect(sourceKinds.filter((kind) => kind === 'prose')).toHaveLength(2)
    expect(sourceKinds.filter((kind) => kind === 'poem')).toHaveLength(1)
    expect(grade3MeaningMazeGuides).toHaveLength(7)
    expect(allTargets).toHaveLength(28)
    expect(new Set(allTargets.map((target) => target.targetId)).size).toBe(28)
    expect(pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(pack.questions).toHaveLength(41)
    expect(typeCounts.multiple_choice).toBe(17)
    expect(typeCounts.multi_select).toBe(7)
    expect(typeCounts.hot_text).toBe(7)
    expect(typeCounts.table_match).toBe(7)
    expect(typeCounts.two_part).toBe(3)
  })

  it('matches every required target and strategy distribution', () => {
    const targets = grade3MeaningMazeGuides.flatMap((guide) => guide.targets)
    const count = (key: string, value: string) => targets.filter((target) => String(target[key as keyof typeof target]) === value).length

    expect(count('targetForm', 'word')).toBe(20)
    expect(count('targetForm', 'phrase')).toBe(8)
    expect(targets.filter((target) => target.targetForm === 'word' && target.challengeKind === 'unfamiliar')).toHaveLength(14)
    expect(targets.filter((target) => target.targetForm === 'word' && target.challengeKind === 'multiple-meaning')).toHaveLength(6)
    expect(targets.filter((target) => target.targetForm === 'phrase' && target.challengeKind === 'figurative')).toHaveLength(5)
    expect(targets.filter((target) => target.targetForm === 'phrase' && target.challengeKind === 'unfamiliar')).toHaveLength(3)
    expect(count('primaryStrategy', 'context-clue')).toBe(6)
    expect(count('primaryStrategy', 'word-relationship')).toBe(5)
    expect(count('primaryStrategy', 'reference-material')).toBe(5)
    expect(count('primaryStrategy', 'background-knowledge')).toBe(4)
    expect(count('primaryStrategy', 'combined')).toBe(8)
  })

  it('keeps every local reference source-owned and learner-visible', () => {
    const pack = grade3ContextCavernMeaningMazePack
    const referenceEntries = grade3MeaningMazeGuides.flatMap((guide) => guide.referenceEntries)
    const referenceKinds = referenceEntries.filter((entry) =>
      grade3MeaningMazeGuides.some((guide) => guide.targets.some((target) =>
        target.primaryStrategy === 'reference-material' && target.referenceEntryIds?.includes(entry.referenceId),
      )),
    ).reduce<Record<string, number>>((counts, entry) => {
      counts[entry.kind] = (counts[entry.kind] ?? 0) + 1
      return counts
    }, {})

    expect(referenceKinds.glossary).toBe(2)
    expect(referenceKinds.dictionary).toBe(2)
    expect(referenceKinds.thesaurus).toBe(1)
    for (const guide of grade3MeaningMazeGuides) {
      const passage = pack.passages.find((candidate) => candidate.passageIdentifier === guide.passageId)!
      const visibleReferenceIds = new Set(passage.informationalStructure?.features.flatMap((feature) => {
        if (feature.kind === 'glossary') return feature.entries.map((entry) => entry.entryId)
        return feature.kind === 'reference' ? [feature.featureId] : []
      }) ?? [])
      for (const entry of guide.referenceEntries) expect(visibleReferenceIds.has(entry.referenceId)).toBe(true)
    }
  })

  it('passes the permanent pack and semantic guide audits', () => {
    expect(buildMeaningMazeGuideAudit(grade3ContextCavernMeaningMazePack)).toEqual([])
    expect(buildContentPackAudit([grade3ContextCavernMeaningMazePack])).toEqual([])
  })
})
