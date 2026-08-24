import { describe, expect, test } from 'vitest'
import {
  areTrackPrerequisitesSatisfied,
  curriculumTracks,
  discoverPlayableTracksForState,
  ensureProgressForPlayableTracks,
  getTrackBySkillId,
  getTrackByUnitId,
  getTracksByWorldId,
  planGlobalQuest,
} from '../src/domain/curriculum'
import { getLessonCandidates } from '../src/domain/lesson'
import type { LessonActivityCandidate } from '../src/domain/progression'
import { createDefaultQuestProgress, QUEST_PROGRESS_SCHEMA_VERSION, QUEST_PROGRESS_STORAGE_KEY } from '../src/persistence'

const NOW = '2026-08-23T12:00:00.000Z'

function createGrade3Fixture(): LessonActivityCandidate {
  return {
    lessonId: 'fixture-g3-word-analysis-lesson',
    activityId: 'fixture-g3-word-analysis-activity',
    skillId: 'g3-word-forge-word-analysis',
    gradeBand: 3,
    difficulty: 1,
    worldId: 'word-forge',
    unitId: 'g3-wg-unit-1',
    packId: 'fixture-g3-word-analysis-pack',
    benchmarkReferences: ['ELA.3.F.1.3'],
    eligiblePurposes: ['progression', 'verification', 'remediation', 'review'],
    passageQuestionKeys: ['fixture-g3-text:fixture-g3-question'],
    contentVersion: 'fixture-only-v1',
  }
}

describe('multi-grade curriculum track architecture', () => {
  test('preserves Grade 2 identity and records verified completion boundaries', () => {
    const grade2Tracks = curriculumTracks.filter((track) => track.gradeBand === 2)
    expect(grade2Tracks.map((track) => track.trackId)).toEqual([
      'g2-word-forge-foundations',
      'g2-story-scouts-prose',
      'g2-poetry-planet',
      'g2-information-detectives-reading',
      'g2-context-cavern-vocabulary',
      'g2-across-genres-reading',
    ])
    expect(grade2Tracks.map((track) => track.skillId)).toEqual([
      'g2-word-forge-word-practice',
      'g2-story-scouts-prose',
      'g2-poetry-planet-poetry',
      'g2-information-detectives-reading',
      'g2-context-cavern-vocabulary',
      'g2-across-genres-reading',
    ])
    expect(Object.fromEntries(grade2Tracks.map((track) => [track.trackId, track.completionDifficulty]))).toEqual({
      'g2-word-forge-foundations': 8,
      'g2-story-scouts-prose': 4,
      'g2-poetry-planet': 2,
      'g2-information-detectives-reading': 5,
      'g2-context-cavern-vocabulary': 4,
      'g2-across-genres-reading': 4,
    })
  })

  test('defines six immutable Grade 3 tracks with separate skills and Grade 2 prerequisites', () => {
    const grade3Tracks = curriculumTracks.filter((track) => track.gradeBand === 3)
    expect(grade3Tracks).toHaveLength(6)
    expect(new Set(grade3Tracks.map((track) => track.trackId)).size).toBe(6)
    expect(new Set(grade3Tracks.map((track) => track.skillId)).size).toBe(6)
    expect(grade3Tracks.find((track) => track.trackId === 'g3-word-forge-foundations')?.status).toBe('active')
    expect(grade3Tracks.find((track) => track.trackId === 'g3-story-scouts-prose')?.status).toBe('active')
    expect(grade3Tracks.filter((track) => !['g3-word-forge-foundations', 'g3-story-scouts-prose'].includes(track.trackId)).every((track) => track.status === 'planned_until_content_exists')).toBe(true)
    expect(grade3Tracks.every((track) => track.prerequisiteTrackIds.length === 1)).toBe(true)
    expect(grade3Tracks.every((track) => Object.isFrozen(track.unitIds) && Object.isFrozen(track.prerequisiteTrackIds))).toBe(true)
    expect(curriculumTracks.some((track) => track.gradeBand === 4)).toBe(false)
    expect(new Set(curriculumTracks.flatMap((track) => track.unitIds ?? [])).size)
      .toBe(curriculumTracks.flatMap((track) => track.unitIds ?? []).length)
  })

  test('returns shared-world tracks in deterministic Grade 2 then Grade 3 order', () => {
    expect(getTracksByWorldId('word-forge').map((track) => track.trackId)).toEqual([
      'g2-word-forge-foundations',
      'g3-word-forge-foundations',
    ])
    expect(getTrackBySkillId('g3-word-forge-word-analysis')?.trackId).toBe('g3-word-forge-foundations')
    expect(getTrackByUnitId('g3-wg-unit-1')?.trackId).toBe('g3-word-forge-foundations')
  })

  test('does not initialize Grade 3 progress without both active content and a completed prerequisite', () => {
    const fixture = createGrade3Fixture()
    const initial = createDefaultQuestProgress(NOW)
    const grade3Track = getTrackBySkillId(fixture.skillId)!

    expect(areTrackPrerequisitesSatisfied(grade3Track, initial)).toBe(false)
    expect(discoverPlayableTracksForState(initial, [fixture])).toHaveLength(0)
    expect(ensureProgressForPlayableTracks(initial, [fixture]).state.skillProgress[fixture.skillId]).toBeUndefined()

    const ready = {
      ...initial,
      skillProgress: {
        ...initial.skillProgress,
        'g2-word-forge-word-practice': {
          ...initial.skillProgress['g2-word-forge-word-practice'],
          currentDifficulty: 8,
        },
      },
    }
    expect(areTrackPrerequisitesSatisfied(grade3Track, ready)).toBe(true)
    expect(discoverPlayableTracksForState(ready, [fixture]).map(({ track }) => track.trackId))
      .toEqual(['g3-word-forge-foundations'])
    const initialized = ensureProgressForPlayableTracks(ready, [fixture]).state
    expect(initialized.skillProgress[fixture.skillId]?.currentDifficulty).toBe(1)
    expect(initialized.skillProgress['g2-word-forge-word-practice']).toEqual(ready.skillProgress['g2-word-forge-word-practice'])
  })

  test('keeps production discovery on the six active Grade 2 tracks', () => {
    const initial = createDefaultQuestProgress(NOW)
    const normalized = ensureProgressForPlayableTracks(initial, getLessonCandidates()).state
    expect(discoverPlayableTracksForState(normalized, getLessonCandidates()).map(({ track }) => track.gradeBand)).toEqual([
      2, 2, 2, 2, 2, 2,
    ])
    expect(Object.keys(normalized.skillProgress).some((skillId) => skillId.startsWith('g3-'))).toBe(false)
  })

  test('keeps Grade 2 due review above unlocked Grade 3 ordinary progression', () => {
    const fixture = createGrade3Fixture()
    const lessons = [...getLessonCandidates(), fixture]
    const progress = createDefaultQuestProgress(NOW)
    progress.skillProgress['g2-word-forge-word-practice'].currentDifficulty = 8
    progress.reviewQueue = [{
      skillId: 'g2-story-scouts-prose',
      difficulty: 1,
      reviewStep: 1,
      dueAt: NOW,
      unitId: 'ss-unit-1',
      contentVersion: lessons.find((lesson) => lesson.unitId === 'ss-unit-1')?.contentVersion,
    }]
    const plan = planGlobalQuest({ progress, availableLessons: lessons, now: NOW })
    expect(plan.purpose).toBe('review')
    expect(plan.skillId).toBe('g2-story-scouts-prose')
    expect(plan.lesson?.gradeBand).toBe(2)
  })

  test('keeps grade-affine remediation and deterministic balancing with fixture content', () => {
    const fixture = createGrade3Fixture()
    const initial = createDefaultQuestProgress(NOW)
    initial.skillProgress['g2-word-forge-word-practice'].currentDifficulty = 8
    const ready = ensureProgressForPlayableTracks(initial, [fixture]).state
    ready.skillProgress[fixture.skillId].currentLearningState = 'REMEDIATE_PREREQUISITE'
    const remediation = planGlobalQuest({ progress: ready, availableLessons: [fixture], now: NOW })
    expect(remediation.purpose).toBe('remediation')
    expect(remediation.lesson?.gradeBand).toBe(3)

    ready.skillProgress[fixture.skillId].currentLearningState = 'CHECKPOINT'
    const wordForgeGrade2 = getLessonCandidates().find((lesson) => lesson.skillId === 'g2-word-forge-word-practice' && lesson.difficulty === 8)!
    const forward = planGlobalQuest({ progress: ready, availableLessons: [wordForgeGrade2, fixture], now: NOW })
    const reversed = planGlobalQuest({ progress: ready, availableLessons: [fixture, wordForgeGrade2], now: NOW })
    expect(reversed.lesson?.lessonId).toBe(forward.lesson?.lessonId)
    expect(reversed.skillId).toBe(forward.skillId)

    const lessons = [...getLessonCandidates(), fixture]
    expect(discoverPlayableTracksForState(ready, lessons, [...curriculumTracks].reverse()).map(({ track }) => track.trackId))
      .toEqual(discoverPlayableTracksForState(ready, lessons, curriculumTracks).map(({ track }) => track.trackId))
  })

  test('preserves the persistence schema and child progress key', () => {
    expect(QUEST_PROGRESS_SCHEMA_VERSION).toBe(1)
    expect(QUEST_PROGRESS_STORAGE_KEY).toBe('rorys-reading-quest.progress.v1')
  })
})
