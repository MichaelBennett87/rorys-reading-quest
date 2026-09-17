import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { createServer } from 'vite'

export async function generateBrowserFixtures(outputPath) {
  const vite = await createServer({
    configFile: resolve('vite.config.ts'),
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true },
  })
  try {
    const lessonModule = await vite.ssrLoadModule('/src/domain/lesson/index.ts')
    const contentModule = await vite.ssrLoadModule('/src/domain/content/packs/index.ts')
    const curriculumModule = await vite.ssrLoadModule('/src/domain/curriculum/index.ts')
    const progressionModule = await vite.ssrLoadModule('/src/domain/progression/index.ts')
    const persistenceModule = await vite.ssrLoadModule('/src/persistence/index.ts')

    const lessons = lessonModule.lessonCatalog.filter((entry) => entry.selectionStatus === 'active').map((entry) => {
      const result = lessonModule.getLessonById(entry.lessonId)
      if (!result.lesson) throw new Error(`${entry.lessonId}: ${result.errors.join('; ')}`)
      const lesson = result.lesson
      const pack = contentModule.contentPacks.find((candidate) => candidate.lessons.some((item) => item.lessonId === lesson.lessonId))
      if (!pack) throw new Error(`${lesson.lessonId}: active pack ownership was not found.`)
      const passages = lesson.passageIds.map((passageId) => pack.passages.find((passage) => passage.passageIdentifier === passageId)).filter(Boolean)
      const sourceKinds = deriveSourceKinds(pack, lesson, passages)
      return {
        lessonId: lesson.lessonId,
        activityId: lesson.activityId,
        skillId: lesson.skillId,
        unitId: lesson.unitId,
        difficulty: lesson.difficulty,
        contentVersion: lesson.contentVersion,
        lessonRole: lesson.lessonRole,
        selectionStatus: lesson.selectionStatus,
        hasTeachingBlock: Boolean(lesson.teachingBlock),
        lessonTitle: lesson.lessonTitle,
        pairedTextSetId: lesson.pairedTextSetId ?? null,
        sourceKinds,
        questions: lesson.questions.map(serializeQuestion),
      }
    })

    const now = new Date().toISOString()
    const complete = persistenceModule.createDefaultQuestProgress(now)
    for (const track of curriculumModule.curriculumTracks) {
      complete.skillProgress[track.skillId] = progressionModule.createInitialSkillProgress(
        track.skillId,
        track.completionDifficulty,
        track.completionDifficulty - 1,
      )
    }
    complete.activeLessonSession = null
    complete.plannedNextQuest = {
      status: 'content_needed',
      purpose: 'progression',
      skillId: 'g3-word-forge-word-analysis',
      difficulty: 5,
      reason: 'All authored curriculum is complete.',
    }

    const resolvedLessons = new Map(lessons.map((lesson) => [lesson.lessonId, lesson]))
    const makeFixture = (candidate) => buildFixture(
      candidate,
      lessonModule,
      progressionModule,
      persistenceModule,
      curriculumModule.curriculumTracks,
      now,
    )
    const questionTypes = Object.fromEntries([
      'MULTIPLE_CHOICE',
      'MULTISELECT',
      'HOT_TEXT',
      'EVIDENCE_PAIR',
      'TABLE_MATCH',
    ].map((questionType) => {
      const candidate = chooseQuestionFixture(lessons, questionType)
      return [questionType, makeFixture(candidate)]
    }))

    const contentForms = {
      prose: makeFixture(chooseContentFixture(lessons, 'prose')),
      poem: makeFixture(chooseContentFixture(lessons, 'poem')),
      informational: makeFixture(chooseContentFixture(lessons, 'informational')),
      paired: makeFixture(chooseContentFixture(lessons, 'paired')),
      localReference: makeFixture(chooseContentFixture(lessons, 'local-reference')),
      guidedInstruction: makeFixture(chooseRoleFixture(lessons, 'GUIDED_PRACTICE')),
      fluency: makeFixture(chooseRoleFixture(lessons, 'FLUENCY_PRACTICE')),
      wordHelp: makeFixture(chooseContentFixture(lessons, 'word-help')),
    }

    const output = {
      generatedAt: now,
      lessons,
      completionTemplate: {
        curriculumOrder: curriculumModule.curriculumTracks.map((track) => ({
          trackId: track.trackId,
          skillId: track.skillId,
          gradeBand: track.gradeBand,
          completionDifficulty: track.completionDifficulty,
        })),
        complete,
      },
      representatives: { questionTypes, contentForms },
    }
    for (const fixture of [...Object.values(questionTypes), ...Object.values(contentForms)]) {
      if (!resolvedLessons.has(fixture.lessonId)) throw new Error(`Representative lesson is outside the active catalog: ${fixture.lessonId}`)
    }
    const resolvedOutput = resolve(outputPath)
    mkdirSync(dirname(resolvedOutput), { recursive: true })
    writeFileSync(resolvedOutput, `${JSON.stringify(output, null, 2)}\n`)
    return {
      outputPath: resolvedOutput,
      lessonCount: lessons.length,
      questionCount: lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0),
      representativeCount: Object.keys(questionTypes).length + Object.keys(contentForms).length,
    }
  } finally {
    await vite.close()
  }
}

function serializeQuestion(question) {
  const base = { questionId: question.questionId, questionType: question.questionType, prompt: question.prompt }
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
    case 'MULTISELECT':
      return { ...base, choices: question.choices, correctIds: question.correctChoiceIds }
    case 'HOT_TEXT':
      return { ...base, choices: question.segments, correctIds: question.correctSegmentIds, allowMultiple: question.allowMultiple }
    case 'EVIDENCE_PAIR':
      return {
        ...base,
        partA: { prompt: question.partAPrompt, choices: question.partAChoices, correctIds: [question.partACorrectChoiceId] },
        partB: { prompt: question.partBPrompt, choices: question.partBChoices, correctIds: [question.partBCorrectChoiceId] },
      }
    case 'TABLE_MATCH':
      return {
        ...base,
        rows: question.rows.map((row) => ({ id: row.id, prompt: row.prompt, choices: row.options, correctId: row.correctChoiceId })),
      }
    default:
      throw new Error(`Unsupported question type: ${question.questionType}`)
  }
}

function deriveSourceKinds(pack, lesson, passages) {
  const passageIds = new Set(lesson.passageIds)
  const kinds = []
  if (lesson.skillId.includes('story-scouts')) kinds.push('prose')
  if (lesson.pairedTextSetId) kinds.push('paired')
  if ((pack.rhymeSchemeGuides ?? []).some((guide) => passageIds.has(guide.passageId))
    || (pack.poemFormGuides ?? []).some((guide) => passageIds.has(guide.poemId))) kinds.push('poem')
  if ((pack.textFeatureGuides ?? []).some((guide) => passageIds.has(guide.passageId))
    || (pack.informationalStructureGuides ?? []).some((guide) => passageIds.has(guide.passageId))) kinds.push('informational')
  if ((pack.meaningMazeGuides ?? []).some((guide) => passageIds.has(guide.passageId) && guide.referenceEntries.length > 0)) kinds.push('local-reference')
  if (passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) > 0)) kinds.push('word-help')
  return [...new Set(kinds)]
}

function chooseQuestionFixture(lessons, questionType) {
  const candidates = lessons.flatMap((lesson) => lesson.questions.map((question, questionIndex) => ({ lesson, question, questionIndex })))
    .filter((candidate) => candidate.lesson.selectionStatus === 'active')
    .filter((candidate) => candidate.question.questionType === questionType)
    .filter((candidate) => questionType !== 'HOT_TEXT' || candidate.question.allowMultiple === false)
    .sort((left, right) => scoreCandidate(right.lesson) - scoreCandidate(left.lesson))
  if (candidates.length === 0) throw new Error(`No active ${questionType} question is available for native acceptance.`)
  return candidates[0]
}

function chooseContentFixture(lessons, sourceKind) {
  const candidate = lessons
    .filter((lesson) => lesson.selectionStatus === 'active' && lesson.sourceKinds.includes(sourceKind))
    .sort((left, right) => scoreCandidate(right) - scoreCandidate(left))[0]
  if (!candidate) throw new Error(`No active ${sourceKind} lesson is available for native acceptance.`)
  return { lesson: candidate, question: candidate.questions[0], questionIndex: 0 }
}

function chooseRoleFixture(lessons, role) {
  const candidate = lessons
    .filter((lesson) => lesson.selectionStatus === 'active' && lesson.lessonRole === role)
    .filter((lesson) => role !== 'GUIDED_PRACTICE' || (lesson.hasTeachingBlock && lesson.difficulty >= 1))
    .sort((left, right) => scoreCandidate(right) - scoreCandidate(left))[0]
  if (!candidate) throw new Error(`No active ${role} lesson is available for native acceptance.`)
  return { lesson: candidate, question: candidate.questions[0], questionIndex: 0 }
}

function scoreCandidate(lesson) {
  return (lesson.skillId.startsWith('g2-') ? 100 : 0)
    + (lesson.lessonRole === 'CHECKPOINT' ? 20 : 0)
    + (lesson.sourceKinds.length * 2)
}

function buildFixture(candidate, lessonModule, progressionModule, persistenceModule, curriculumTracks, timestamp) {
  const resolved = lessonModule.getLessonById(candidate.lesson.lessonId)
  if (!resolved.lesson) throw new Error(`${candidate.lesson.lessonId}: ${resolved.errors.join('; ')}`)
  const lesson = resolved.lesson
  const state = persistenceModule.createDefaultQuestProgress(timestamp)
  const targetTrack = curriculumTracks.find((track) => track.skillId === lesson.skillId)
  for (const track of curriculumTracks) {
    if (!targetTrack || track.curriculumOrder >= targetTrack.curriculumOrder) continue
    state.skillProgress[track.skillId] = progressionModule.createInitialSkillProgress(
      track.skillId,
      track.completionDifficulty,
      track.completionDifficulty - 1,
    )
  }
  state.skillProgress[lesson.skillId] = progressionModule.createInitialSkillProgress(
    lesson.skillId,
    lesson.difficulty,
    Math.max(0, lesson.difficulty - 1),
  )
  let session = persistenceModule.createActiveLessonSession(
    lesson,
    `browser-fixture:${lesson.lessonId}:${candidate.question.questionId}`,
    timestamp,
    { purpose: lesson.eligiblePurposes.includes('progression') ? 'progression' : lesson.eligiblePurposes[0] },
  )
  for (let index = 0; index < candidate.questionIndex; index += 1) {
    const evaluation = lessonModule.evaluateAnswer(lesson.questions[index], canonicalSubmission(lesson.questions[index]))
    session = persistenceModule.checkpointSubmittedQuestion(session, evaluation, index, timestamp)
    session = persistenceModule.advanceActiveLessonSession(session, index + 1, timestamp)
  }
  state.activeLessonSession = session
  state.plannedNextQuest = null
  state.metadata.updatedAt = timestamp
  return {
    lessonId: lesson.lessonId,
    questionId: candidate.question.questionId,
    questionType: candidate.question.questionType,
    sourceKinds: candidate.lesson.sourceKinds,
    lessonRole: lesson.lessonRole,
    state,
  }
}

function canonicalSubmission(question) {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
      return { questionType: question.questionType, payload: { selectedChoiceId: question.correctChoiceIds[0] } }
    case 'MULTISELECT':
      return { questionType: question.questionType, payload: { selectedChoiceIds: [...question.correctChoiceIds] } }
    case 'HOT_TEXT':
      return { questionType: question.questionType, payload: { selectedSegmentIds: [...question.correctSegmentIds] } }
    case 'EVIDENCE_PAIR':
      return { questionType: question.questionType, payload: { partAChoiceId: question.partACorrectChoiceId, partBChoiceId: question.partBCorrectChoiceId } }
    case 'TABLE_MATCH':
      return { questionType: question.questionType, payload: { selectedMappings: Object.fromEntries(question.rows.map((row) => [row.id, row.correctChoiceId])) } }
    default:
      throw new Error(`Unsupported question type: ${question.questionType}`)
  }
}
