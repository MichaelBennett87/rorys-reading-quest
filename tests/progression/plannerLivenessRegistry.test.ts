import { describe, expect, test } from 'vitest'

import type { LessonPurpose, LessonResult } from '../../src/domain/lesson'
import { getLessonCandidates } from '../../src/domain/lesson'
import { getActiveContentRegistryTotals } from '../../src/domain/content/packs'
import { curriculumTracks } from '../../src/domain/curriculum'
import {
  applyLessonResult,
  createInitialSkillProgress,
  selectNextLesson,
  selectNextLessonWithDiagnostics,
  type AppliedLessonProgression,
  type LessonActivityCandidate,
  type RecentLessonActivityUsage,
  type SkillProgressState,
} from '../../src/domain/progression'

const NOW = '2026-08-27T21:00:00.000Z'
const allLessons = getLessonCandidates()

function usage(
  lesson: LessonActivityCandidate,
  index: number,
  completedAt = new Date(Date.parse(NOW) - (200 - index) * 60_000).toISOString(),
  activityId = lesson.activityId,
  passageQuestionKeys = lesson.passageQuestionKeys,
): RecentLessonActivityUsage {
  return {
    lessonId: lesson.lessonId,
    activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    passageQuestionKeys: [...passageQuestionKeys],
    contentVersion: lesson.contentVersion,
    completedAt,
  }
}

function fixtureCandidate(
  activityId: string,
  difficulty: number,
  eligiblePurposes: LessonPurpose[],
): LessonActivityCandidate {
  return {
    lessonId: 'lesson-' + activityId,
    activityId,
    skillId: 'fixture-live-skill',
    gradeBand: 2,
    difficulty,
    worldId: 'story-scouts',
    unitId: 'fixture-live-unit',
    packId: 'fixture-live-pack',
    benchmarkReferences: ['ELA.2.R.1.1'],
    eligiblePurposes,
    passageQuestionKeys: ['passage-' + activityId + '::question-' + activityId],
    contentVersion: 'fixture-live-v1',
  }
}

function lessonResult(
  lesson: LessonActivityCandidate,
  accuracy: number,
  assisted = false,
): LessonResult {
  const totalQuestions = 10
  const correctAnswers = Math.floor((accuracy / 100) * totalQuestions)
  return {
    lessonId: lesson.lessonId,
    activityId: lesson.activityId,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    lessonRole: 'CHECKPOINT',
    totalQuestions,
    correctAnswers,
    firstAttemptCorrect: correctAnswers,
    accuracy,
    assistanceUsed: assisted ? 1 : 0,
    assistanceSummary: {
      totalUniqueEvents: assisted ? 1 : 0,
      targetsHelped: assisted ? 1 : 0,
      maximumAssistanceLevel: assisted ? 1 : 0,
      visualHintUsed: assisted,
      spokenChunkHelpUsed: false,
      spokenWordHelpUsed: false,
      sentenceReadAloudUsed: false,
    },
    fluencyPracticeSummary: null,
    oralFluencyMeasured: false,
    questionResults: Array.from({ length: totalQuestions }, (_, index) => ({
      questionId: 'fixture-question-' + String(index + 1),
      isCorrect: index < correctAnswers,
      isFirstAttemptCorrect: index < correctAnswers,
      submittedAnswer: index < correctAnswers ? 'correct' : 'incorrect',
      correctAnswer: 'correct',
      explanation: 'Fixture explanation.',
      evidenceReference: [],
    })),
    completed: true,
  }
}

function apply(
  progress: SkillProgressState,
  lesson: LessonActivityCandidate,
  availableLessons: LessonActivityCandidate[],
  accuracy: number,
  assisted = false,
): AppliedLessonProgression {
  const result = applyLessonResult({
    progress,
    lessonResult: lessonResult(lesson, accuracy, assisted),
    availableLessons,
    completedAt: NOW,
  })
  if (result.status !== 'applied') throw new Error(result.reason)
  return result
}

describe('production-registry planner liveness audit', () => {
  test('returns AVAILABLE for all 160 authored active-track combinations after freshness exhaustion', () => {
    const activeTracks = curriculumTracks.filter((track) => track.status === 'active')
    const trackBySkillId = new Map(activeTracks.map((track) => [track.skillId, track] as const))
    const combinations = new Map<string, {
      skillId: string
      difficulty: number
      purpose: LessonPurpose
      lessons: LessonActivityCandidate[]
    }>()

    for (const lesson of allLessons) {
      const track = trackBySkillId.get(lesson.skillId)
      if (!track || lesson.difficulty >= track.completionDifficulty) continue
      for (const purpose of lesson.eligiblePurposes) {
        const key = [lesson.skillId, lesson.difficulty, purpose].join('|')
        const entry = combinations.get(key) ?? {
          skillId: lesson.skillId,
          difficulty: lesson.difficulty,
          purpose,
          lessons: [],
        }
        entry.lessons.push(lesson)
        combinations.set(key, entry)
      }
    }

    expect(combinations.size).toBe(160)
    expect([...new Set([...combinations.values()].map((entry) => entry.skillId))].sort()).toEqual([
      'g2-across-genres-reading',
      'g2-context-cavern-vocabulary',
      'g2-information-detectives-reading',
      'g2-poetry-planet-poetry',
      'g2-story-scouts-prose',
      'g2-word-forge-word-practice',
      'g3-across-genres-reading',
      'g3-information-detectives-reading',
      'g3-poetry-planet-poetry',
      'g3-story-scouts-prose',
      'g3-word-forge-word-analysis',
    ])

    for (const [key, entry] of combinations) {
      const result = selectNextLessonWithDiagnostics({
        skillId: entry.skillId,
        difficulty: entry.difficulty,
        purpose: entry.purpose,
        availableLessons: allLessons,
        recentActivityUsage: entry.lessons.map((lesson, index) => usage(lesson, index)),
      })
      if (result.plan.status !== 'available') {
        throw new Error(key + ' incorrectly returned content-needed: ' + result.plan.reason)
      }
      expect(result.compatibleCandidateCount, key).toBe(entry.lessons.length)
      expect(['recycled', 'sole_candidate_repeat'], key).toContain(result.selection?.selectionMode)
    }

    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 36,
      activeLessonCount: 252,
      activePassageCount: 259,
      activeQuestionCount: 1450,
      activeSupportTargetCount: 999,
    })
  })

  test('avoids immediate repetition and is deterministic across candidate insertion order', () => {
    const story = allLessons.filter((lesson) => (
      lesson.skillId === 'g2-story-scouts-prose'
      && lesson.difficulty === 1
      && lesson.eligiblePurposes.includes('progression')
    ))
    const [activityA, activityB, activityC] = story
    const history = [
      usage(activityA, 0, '2026-08-27T20:00:00.000Z'),
      usage(activityB, 1, '2026-08-27T20:01:00.000Z'),
      usage(activityC, 2, '2026-08-27T20:02:00.000Z'),
      usage(activityA, 3, '2026-08-27T20:03:00.000Z'),
    ]

    const forward = selectNextLessonWithDiagnostics({
      skillId: activityA.skillId,
      difficulty: 1,
      purpose: 'progression',
      availableLessons: story,
      recentActivityUsage: history,
    })
    const reversed = selectNextLessonWithDiagnostics({
      skillId: activityA.skillId,
      difficulty: 1,
      purpose: 'progression',
      availableLessons: [...story].reverse(),
      recentActivityUsage: history,
    })
    expect(forward.plan).toMatchObject({ status: 'available', lesson: { activityId: activityB.activityId } })
    expect(reversed.plan).toEqual(forward.plan)
    expect(forward.selection).toMatchObject({ selectionMode: 'recycled', priorUseCount: 1 })

    const sole = selectNextLessonWithDiagnostics({
      skillId: activityA.skillId,
      difficulty: 1,
      purpose: 'progression',
      availableLessons: [activityA],
      recentActivityUsage: [usage(activityA, 0)],
    })
    expect(sole.plan.status).toBe('available')
    expect(sole.selection?.selectionMode).toBe('sole_candidate_repeat')
  })

  test('prefers no overlap, then lower overlap, but never dead-ends when every passage overlaps', () => {
    const story = allLessons.filter((lesson) => (
      lesson.skillId === 'g2-story-scouts-prose'
      && lesson.difficulty === 1
      && lesson.eligiblePurposes.includes('progression')
    ))
    const [activityA, activityB] = story
    const noOverlap = selectNextLessonWithDiagnostics({
      skillId: activityA.skillId,
      difficulty: 1,
      purpose: 'progression',
      availableLessons: [activityA, activityB],
      recentActivityUsage: [usage(
        activityA,
        0,
        NOW,
        activityA.activityId + '-historical-alias',
        activityA.passageQuestionKeys,
      )],
    })
    expect(noOverlap.plan).toMatchObject({ status: 'available', lesson: { activityId: activityB.activityId } })
    expect(noOverlap.selection?.selectionMode).toBe('fresh')

    const highOverlap = {
      ...activityA,
      activityId: activityA.activityId + '-high-overlap',
      passageQuestionKeys: ['shared::one', 'shared::two'],
    }
    const lowOverlap = {
      ...activityB,
      activityId: activityB.activityId + '-low-overlap',
      passageQuestionKeys: ['shared::one'],
    }
    const overlapHistory = [usage(
      activityA,
      0,
      NOW,
      'historical-overlap',
      ['shared::one', 'shared::two'],
    )]
    const lowerOverlap = selectNextLessonWithDiagnostics({
      skillId: activityA.skillId,
      difficulty: 1,
      purpose: 'progression',
      availableLessons: [highOverlap, lowOverlap],
      recentActivityUsage: overlapHistory,
    })
    expect(lowerOverlap.plan).toMatchObject({ status: 'available', lesson: { activityId: lowOverlap.activityId } })
    expect(lowerOverlap.selection).toMatchObject({ selectionMode: 'fresh_with_overlap', overlapCount: 1 })

    const allOverlap = selectNextLesson({
      skillId: activityA.skillId,
      difficulty: 1,
      purpose: 'progression',
      availableLessons: [highOverlap],
      recentActivityUsage: overlapHistory,
    })
    expect(allOverlap.status).toBe('available')
  })

  test('keeps repeated low work live through recycling and advances only on two distinct strong proofs', () => {
    const checkpointA = fixtureCandidate('checkpoint-a', 1, ['progression', 'verification'])
    const checkpointB = fixtureCandidate('checkpoint-b', 1, ['progression', 'verification'])
    const checkpointC = fixtureCandidate('checkpoint-c', 1, ['progression', 'verification'])
    const guidanceA = fixtureCandidate('guidance-a', 1, ['remediation'])
    const guidanceB = fixtureCandidate('guidance-b', 1, ['remediation'])
    const rebuildA = fixtureCandidate('rebuild-a', 0, ['remediation', 'verification'])
    const rebuildB = fixtureCandidate('rebuild-b', 0, ['remediation', 'verification'])
    const candidates = [checkpointA, checkpointB, checkpointC, guidanceA, guidanceB, rebuildA, rebuildB]
    let progress = createInitialSkillProgress('fixture-live-skill', 1, 0)
    progress.recentActivityUsage = candidates.map((lesson, index) => usage(lesson, index))

    const firstLow = apply(progress, checkpointA, candidates, 60)
    expect(firstLow.decision.decisionState).toBe('GUIDED_PRACTICE')
    expect(firstLow.nextQuest).toMatchObject({ status: 'available', purpose: 'remediation', lesson: { difficulty: 1 } })
    if (firstLow.nextQuest.status !== 'available') throw new Error('First low result must remain live.')

    const secondLow = apply(firstLow.progress, firstLow.nextQuest.lesson, candidates, 60)
    expect(secondLow.decision.decisionState).toBe('REMEDIATE_PREREQUISITE')
    expect(secondLow.nextQuest).toMatchObject({ status: 'available', purpose: 'remediation', lesson: { difficulty: 0 } })
    if (secondLow.nextQuest.status !== 'available') throw new Error('Second low result must reach rebuilding.')

    const firstRebuild = apply(secondLow.progress, secondLow.nextQuest.lesson, candidates, 90)
    expect(firstRebuild.decision.decisionState).toBe('VERIFY_MASTERY')
    expect(firstRebuild.nextQuest).toMatchObject({ status: 'available', purpose: 'verification', lesson: { difficulty: 0 } })
    if (firstRebuild.nextQuest.status !== 'available') throw new Error('Rebuilding verification must remain live.')

    const secondRebuild = apply(firstRebuild.progress, firstRebuild.nextQuest.lesson, candidates, 90)
    expect(secondRebuild.decision.decisionState).toBe('ADVANCE')
    expect(secondRebuild.progress).toMatchObject({
      currentDifficulty: 1,
      currentLearningState: 'CHECKPOINT',
      remediationContext: null,
    })
    expect(secondRebuild.nextQuest.status).toBe('available')

    const firstProof = apply(secondRebuild.progress, checkpointA, candidates, 90)
    expect(firstProof.decision.decisionState).toBe('VERIFY_MASTERY')
    expect(firstProof.progress.qualifyingIndependentActivityIds).toEqual([checkpointA.activityId])

    const duplicateProof = apply(firstProof.progress, checkpointA, candidates, 90)
    expect(duplicateProof.decision.reasonCodes).toContain('duplicate_activity_not_counted')
    expect(duplicateProof.progress.qualifyingIndependentActivityIds).toEqual([checkpointA.activityId])

    const secondProof = apply(duplicateProof.progress, checkpointB, candidates, 90)
    expect(secondProof.decision.decisionState).toBe('ADVANCE')
    expect(secondProof.progress.currentDifficulty).toBe(2)
    expect(secondProof.progress.lastMasteredDifficulty).toBe(1)
    expect(secondProof.progress.qualifyingIndependentActivityIds).toEqual([])
    expect(secondProof.nextQuest.status).toBe('content_needed')
  })

  test('assisted strong work stays live without qualifying, then later independent work can advance', () => {
    const checkpointA = fixtureCandidate('assisted-checkpoint-a', 1, ['progression', 'verification'])
    const checkpointB = fixtureCandidate('assisted-checkpoint-b', 1, ['progression', 'verification'])
    const candidates = [checkpointA, checkpointB]
    const initial = createInitialSkillProgress('fixture-live-skill', 1, 0)
    initial.recentActivityUsage = candidates.map((lesson, index) => usage(lesson, index))

    const assisted = apply(initial, checkpointA, candidates, 90, true)
    expect(assisted.decision.reasonCodes).toContain('assistance_observed')
    expect(assisted.progress.qualifyingIndependentActivityIds).toEqual([])
    expect(assisted.nextQuest.status).toBe('available')

    const independentFirst = apply(assisted.progress, checkpointA, candidates, 90)
    expect(independentFirst.decision.decisionState).toBe('VERIFY_MASTERY')
    expect(independentFirst.progress.qualifyingIndependentActivityIds).toEqual([checkpointA.activityId])
    const independentSecond = apply(independentFirst.progress, checkpointB, candidates, 90)
    expect(independentSecond.decision.decisionState).toBe('ADVANCE')
    expect(independentSecond.progress.currentDifficulty).toBe(2)
  })
})
