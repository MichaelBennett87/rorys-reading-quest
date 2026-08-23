import { describe, expect, it } from 'vitest'
import {
  auditSemanticQuestionPacks,
  contentPackAudit,
  contentPacks,
} from '../../src/domain/content'

function activePack(packId: string) {
  const pack = contentPacks.find((candidate) => candidate.manifest.packId === packId)
  expect(pack, `Missing active pack ${packId}`).toBeDefined()
  return pack!
}

describe('GPT-5.6 Sol Grade 2 curricular corrections', () => {
  it('preserves the frozen Grade 2 inventory and structural audits', () => {
    const activePacks = contentPacks.filter((pack) => pack.manifest.gradeBand === 2 && !pack.manifest.packId.startsWith('legacy-'))
    expect({
      activePackCount: activePacks.length,
      activeLessonCount: activePacks.reduce((sum, pack) => sum + pack.lessons.filter((lesson) => lesson.selectionStatus === 'active').length, 0),
      activePassageCount: activePacks.reduce((sum, pack) => sum + pack.passages.length, 0),
      activeQuestionCount: activePacks.reduce((sum, pack) => sum + pack.questions.length, 0),
      activeSupportTargetCount: activePacks.reduce(
        (sum, pack) => sum + pack.passages.reduce(
          (passageSum, passage) => passageSum + (passage.wordSupportTargets?.length ?? 0),
          0,
        ),
        0,
      ),
    }).toEqual({
      activePackCount: 22,
      activeLessonCount: 154,
      activePassageCount: 161,
      activeQuestionCount: 889,
      activeSupportTargetCount: 614,
    })
    expect(contentPackAudit).toEqual([])
    expect(auditSemanticQuestionPacks(activePacks)).toMatchObject({
      reviewedPackCount: 22,
      reviewedLessonCount: 154,
      reviewedCount: 889,
      issues: [],
    })
  })

  it('measures author purpose instead of relabeling central ideas', () => {
    const pack = activePack('g2-information-detectives-purpose-path')
    const directPurposeQuestions = pack.questions.filter((question) =>
      question.prompt === 'Why did the author most likely write this passage?')

    expect(directPurposeQuestions).toHaveLength(7)
    for (const question of directPurposeQuestions) {
      const content = question.questionContent
      expect(content?.type).toBe('multiple_choice')
      if (!content || content.type !== 'multiple_choice') continue
      const correctText = content.choices.find((choice) =>
        content.correctChoiceIds.includes(choice.id))?.text
      expect(correctText).toMatch(/^To (describe|explain|teach)/)
      expect(question.explanation).toContain('author wrote this passage')
    }

    expect(pack.authorPurposeGuides?.map((guide) => guide.topicLabel)).toEqual([
      'rain gardens',
      'animal shelters',
      'pollinator gardens',
      'weather observations',
      'seed travel',
      'compost piles',
      'trail markers',
    ])
  })

  it('keeps authored rhyme labels aligned with distinct line endings', () => {
    const pack = activePack('g2-poetry-planet-rhyme-routes')
    const visibleText = pack.passages.flatMap((passage) => passage.sentences ?? []).map((sentence) => sentence.text)

    expect(visibleText).toContain('With a grin, she checked each label on the side.')
    expect(visibleText).toContain('With a spin, the cart rolled on a gentle ride.')
    expect(visibleText).toContain('The bridge crew brought bright boards from school to the site.')
    expect(visibleText).toContain('Then Tess set the hammer beside a stool.')
    expect(visibleText).toContain('She watched the slow cotton clouds change pace.')
    expect(visibleText).toContain('Then Omar held the chart up high.')
    expect(visibleText).toContain('They saw the clouds move across the sky.')
    expect(visibleText).not.toContain('By noon, a small green sprout stood near.')
  })

  it('keeps the informational checkpoint on one defensible root topic', () => {
    const pack = activePack('g2-compare-castle-compare-keep')
    const pair = pack.pairedTextSets?.find((candidate) => candidate.pairId === 'ck-pair-6-pond-habitat')
    const guide = pack.pairedTextComparisonGuides?.find((candidate) => candidate.pairId === pair?.pairId)

    expect(pair).toMatchObject({
      pairTitle: 'How Roots Help Soil',
      relationshipKind: 'same-topic',
    })
    expect(pair?.members.map((member) => member.displayTitle)).toEqual([
      'Roots at the Pond Edge',
      'Roots in a Garden Bed',
    ])
    expect(guide?.sharedTopicOrThemeStatement).toBe(
      'Both texts explain how plant roots support plants and help soil stay in place.',
    )
    expect(pack.questions.some((question) => question.answerChoices.includes('Even a small shower can give the class a useful result.'))).toBe(false)
  })

  it('removes malformed perspective and stale cross-text wording', () => {
    const perspective = activePack('g2-story-scouts-perspective-portal')
    const wording = perspective.questions
      .flatMap((question) => [question.prompt, question.explanation, ...question.answerChoices])
      .join(' ')
      .toLowerCase()

    expect(wording).not.toContain('maya thinks maya thinks')
    expect(wording).not.toContain('thinks the situation needs maya thinks')

    const wordplay = activePack('g2-compare-castle-wordplay-watchtower')
    const checkpointWording = wordplay.questions
      .filter((question) => question.lessonIdentifier?.includes('checkpoint'))
      .flatMap((question) => [question.prompt, question.explanation, ...question.answerChoices])
      .join(' ')

    expect(checkpointWording).toContain('Brave builders balanced')
    expect(checkpointWording).toContain('Path markers pointed')
  })
})
