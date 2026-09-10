import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { useQuestProgress } from '../src/app/useQuestProgress'
import { contentPacks } from '../src/domain/content'
import {
  curriculumTracks,
  discoverJourneyEligibleTracksForState,
  ensureProgressForPlayableTracks,
  planGlobalQuest,
  reconcileDeferredWordStudySession,
} from '../src/domain/curriculum'
import { getLessonById, getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress, evaluateCheckpoint } from '../src/domain/progression'
import {
  QUEST_PROGRESS_STORAGE_KEY,
  createActiveLessonSession,
  createDefaultQuestProgress,
  type QuestProgressV1,
} from '../src/persistence'

const NOW = '2026-09-10T12:00:00.000Z'
const STORY_SKILL = 'g2-story-scouts-prose'
const WORD_FORGE_SKILL = 'g2-word-forge-word-practice'
const STORY_MAP_PACK_ID = 'g2-story-scouts-plot-structure-elements'

afterEach(() => {
  window.localStorage.removeItem(QUEST_PROGRESS_STORAGE_KEY)
})

function getWordForgeSession() {
  const candidate = getLessonCandidates().find((lesson) => lesson.skillId === WORD_FORGE_SKILL)
  if (!candidate) throw new Error('Expected an authored Grade 2 Word Forge lesson.')
  const lesson = getLessonById(candidate.lessonId).lesson
  if (!lesson) throw new Error('Expected the Word Forge lesson to resolve.')
  return createActiveLessonSession(lesson, 'deferred-word-forge-session', NOW, { purpose: 'progression' })
}

function completeTrack(state: QuestProgressV1, skillId: string) {
  const track = curriculumTracks.find((entry) => entry.skillId === skillId)
  if (!track) throw new Error(`Missing curriculum track ${skillId}.`)
  state.skillProgress[skillId] = createInitialSkillProgress(
    skillId,
    track.completionDifficulty,
    track.completionDifficulty - 1,
  )
}

describe('comprehension-first journey policy', () => {
  test('uses one authoritative comprehension-first track order and opens Story Scouts for a new learner', () => {
    expect(curriculumTracks.map((track) => track.skillId)).toEqual([
      'g2-story-scouts-prose',
      'g2-information-detectives-reading',
      'g3-story-scouts-prose',
      'g3-information-detectives-reading',
      'g2-poetry-planet-poetry',
      'g3-poetry-planet-poetry',
      'g2-across-genres-reading',
      'g3-across-genres-reading',
      'g2-context-cavern-vocabulary',
      'g3-context-cavern-vocabulary',
      'g2-word-forge-word-practice',
      'g3-word-forge-word-analysis',
    ])

    const lessons = getLessonCandidates()
    const progress = createDefaultQuestProgress(NOW)
    expect(discoverJourneyEligibleTracksForState(progress, lessons).map(({ track }) => track.skillId)).toEqual([
      STORY_SKILL,
    ])
    const plan = planGlobalQuest({ progress, availableLessons: lessons, now: NOW })
    expect(plan).toMatchObject({
      status: 'available',
      purpose: 'progression',
      skillId: STORY_SKILL,
      unitId: 'ss-unit-1',
      difficulty: 1,
    })
    expect(getLessonById(plan.lesson!.lessonId).lesson?.lessonRole).toBe('CHECKPOINT')
  })

  test('suspends one incompatible Word Forge session without changing earned state', () => {
    const lessons = getLessonCandidates()
    const progress = ensureProgressForPlayableTracks(createDefaultQuestProgress(NOW), lessons).state
    const session = getWordForgeSession()
    progress.activeLessonSession = { ...session, currentQuestionIndex: 2 }
    progress.totalXp = 345
    progress.totalStars = 17
    progress.completedSessionCount = 4
    progress.plannedNextQuest = {
      status: 'available',
      purpose: 'progression',
      lesson: lessons.find((lesson) => lesson.lessonId === session.lessonId)!,
    }
    const wordForgeBefore = structuredClone(progress.skillProgress[WORD_FORGE_SKILL])

    const reconciled = reconcileDeferredWordStudySession(progress, lessons)

    expect(reconciled.changed).toBe(true)
    expect(reconciled.state.activeLessonSession).toBeNull()
    expect(reconciled.state.deferredWordStudySession).toMatchObject({
      sessionId: session.sessionId,
      lessonId: session.lessonId,
      currentQuestionIndex: 2,
    })
    expect(reconciled.state.plannedNextQuest).toBeNull()
    expect(reconciled.state.skillProgress[WORD_FORGE_SKILL]).toEqual(wordForgeBefore)
    expect(reconciled.state).toMatchObject({ totalXp: 345, totalStars: 17, completedSessionCount: 4 })
  })

  test('persists Word Forge suspension once and resumes the same Story Scouts session after restart', () => {
    const seed = createDefaultQuestProgress(NOW)
    seed.activeLessonSession = getWordForgeSession()
    seed.totalXp = 90
    seed.totalStars = 5
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(seed))

    const firstVisit = renderHook(() => useQuestProgress())
    expect(firstVisit.result.current.progress.activeLessonSession).toBeNull()
    expect(firstVisit.result.current.progress.deferredWordStudySession?.sessionId).toBe('deferred-word-forge-session')
    const firstLaunch = firstVisit.result.current.prepareJourneyLaunch()
    if (firstLaunch.status !== 'start') throw new Error('Expected Story Scouts to start after deferral.')
    expect(firstLaunch.lesson.skillId).toBe(STORY_SKILL)
    expect(firstVisit.result.current.progress).toMatchObject({ totalXp: 90, totalStars: 5 })
    const storySessionId = firstLaunch.session.sessionId
    firstVisit.unmount()

    const secondVisit = renderHook(() => useQuestProgress())
    const resumed = secondVisit.result.current.prepareJourneyLaunch()
    if (resumed.status !== 'resume') throw new Error('Expected the persisted Story Scouts session to resume.')
    expect(resumed.session.sessionId).toBe(storySessionId)
    expect(resumed.lesson.skillId).toBe(STORY_SKILL)
    expect(secondVisit.result.current.progress.deferredWordStudySession?.sessionId).toBe('deferred-word-forge-session')
  })

  test('restores the deferred Word Forge session only when its later stage becomes eligible', () => {
    const lessons = getLessonCandidates()
    const progress = createDefaultQuestProgress(NOW)
    progress.deferredWordStudySession = getWordForgeSession()
    const wordForgeTrack = curriculumTracks.find((track) => track.skillId === WORD_FORGE_SKILL)!
    for (const track of curriculumTracks.filter((entry) => entry.curriculumOrder < wordForgeTrack.curriculumOrder)) {
      completeTrack(progress, track.skillId)
    }

    const reconciled = reconcileDeferredWordStudySession(progress, lessons)
    expect(reconciled.changed).toBe(true)
    expect(reconciled.state.deferredWordStudySession).toBeNull()
    expect(reconciled.state.activeLessonSession?.sessionId).toBe('deferred-word-forge-session')
    expect(planGlobalQuest({ progress: reconciled.state, availableLessons: lessons, now: NOW })).toMatchObject({
      status: 'available',
      purpose: 'progression',
      skillId: WORD_FORGE_SKILL,
    })
  })

  test('allows Grade 3 Story Scouts after its comprehension prerequisite while Word Forge remains unfinished', () => {
    const lessons = getLessonCandidates()
    const progress = createDefaultQuestProgress(NOW)
    completeTrack(progress, 'g2-story-scouts-prose')
    completeTrack(progress, 'g2-information-detectives-reading')
    const wordForgeBefore = structuredClone(progress.skillProgress[WORD_FORGE_SKILL])

    const plan = planGlobalQuest({ progress, availableLessons: lessons, now: NOW })
    expect(plan).toMatchObject({ status: 'available', skillId: 'g3-story-scouts-prose' })
    expect(progress.skillProgress[WORD_FORGE_SKILL]).toEqual(wordForgeBefore)
  })

  test('keeps each opening checkpoint on one two-paragraph story with six passage-dependent questions', () => {
    const pack = contentPacks.find((entry) => entry.manifest.packId === STORY_MAP_PACK_ID)
    if (!pack) throw new Error('Expected the Story Map pack.')
    const checkpoints = pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
    expect(checkpoints).toHaveLength(3)

    for (const lesson of checkpoints) {
      expect(lesson.passageIdentifiers).toHaveLength(1)
      expect(lesson.questionIdentifiers).toHaveLength(6)
      const passage = pack.passages.find((entry) => entry.passageIdentifier === lesson.passageIdentifiers[0])
      expect(passage?.passageText.split(/\n\n/)).toHaveLength(2)
      const questions = lesson.questionIdentifiers.map((questionId) => (
        pack.questions.find((entry) => entry.questionIdentifier === questionId)!
      ))
      expect(questions.every((question) => question.passageIdentifier === lesson.passageIdentifiers[0])).toBe(true)
      expect(questions.every((question) => !/spelling|vowel|syllable|letter sound|word part/i.test(question.prompt))).toBe(true)
    }
  })

  test('does not round five correct answers out of six into the 85 percent strong threshold', () => {
    const decision = evaluateCheckpoint({
      accuracy: 5 / 6,
      firstAttemptAccuracy: 5 / 6,
      hintsUsed: 0,
      majorHintsUsed: 0,
      sentenceReadAloudUsed: false,
      consecutiveUnsuccessfulAtCurrentDifficulty: 0,
      priorIndependentSuccessCount: 1,
      currentDifficulty: 1,
      lastMasteredDifficulty: 0,
      relevantPrerequisite: null,
      currentLearningState: 'VERIFY_MASTERY',
      activityId: 'story-map-checkpoint-b',
      priorQualifyingIndependentActivityIds: ['story-map-checkpoint-a'],
    })

    expect(decision.decisionState).not.toBe('ADVANCE')
    expect(decision.reasonCodes).not.toContain('independent_evidence')
  })
})
