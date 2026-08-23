import { contentPacks, sampleContent } from '../content/packs'
import { validateContent } from '../content/validateContent'
import type { LessonActivityCandidate } from '../progression/skillProgressTypes'
import type { LessonCatalogEntry, LessonChoice, LessonDefinition, LessonQuestion } from './lessonTypes'
import {
  type EvidencePairLessonQuestion,
  type HotTextLessonQuestion,
  type MultipleChoiceLessonQuestion,
  type MultiselectLessonQuestion,
  type TableMatchLessonQuestion,
} from './lessonTypes'

export const lessonCatalog: readonly LessonCatalogEntry[] = contentPacks.flatMap((pack) =>
  pack.lessons.map((lesson) => ({
    lessonId: lesson.lessonId,
    packId: pack.manifest.packId,
    worldId: lesson.worldId,
    unitId: lesson.unitId,
    activityId: lesson.activityId,
    passageIdentifier: [...lesson.passageIdentifiers],
    pairedTextSetId: lesson.pairedTextSetId,
    questionIdentifiers: [...lesson.questionIdentifiers],
    lessonTitle: lesson.lessonTitle,
    lessonObjective: lesson.lessonObjective,
    lessonRole: lesson.lessonRole,
    selectionStatus: lesson.selectionStatus,
    teachingBlock: lesson.teachingBlock ? { ...lesson.teachingBlock, examples: [...lesson.teachingBlock.examples] } : undefined,
    contentVersion: lesson.contentVersion,
    eligiblePurposes: [...lesson.eligiblePurposes],
    benchmarkReferences: [...pack.manifest.benchmarkReferences],
  })),
)

export interface LessonCatalogMetadata {
  lessonId: string
  packId: string
  worldId: string
  unitId: string
  activityId: string
  contentVersion: string
  benchmarkReferences: string[]
  lessonRole: LessonCatalogEntry['lessonRole']
  selectionStatus: LessonCatalogEntry['selectionStatus']
  eligiblePurposes: LessonCatalogEntry['eligiblePurposes']
  passageIds: string[]
  pairedTextSetId?: string
}

export interface LessonCatalogResult {
  lesson?: LessonDefinition
  errors: string[]
}

export function getLessonCatalogMetadata(lessonId: string): LessonCatalogMetadata | null {
  const entry = lessonCatalog.find((candidate) => candidate.lessonId === lessonId)
  if (!entry) return null
  return {
    lessonId: entry.lessonId,
    packId: entry.packId,
    worldId: entry.worldId,
    unitId: entry.unitId,
    activityId: entry.activityId,
    contentVersion: entry.contentVersion,
    benchmarkReferences: [...entry.benchmarkReferences],
    lessonRole: entry.lessonRole,
    selectionStatus: entry.selectionStatus,
    eligiblePurposes: [...entry.eligiblePurposes],
    passageIds: [...entry.passageIdentifier],
    pairedTextSetId: entry.pairedTextSetId,
  }
}

export function getLessonUnitId(lessonId: string): string | null {
  return getLessonCatalogMetadata(lessonId)?.unitId ?? null
}

export function getLessonWorldId(lessonId: string): string | null {
  return getLessonCatalogMetadata(lessonId)?.worldId ?? null
}

export function getLessonForUnit(unitId: string): LessonCatalogResult {
  const entry = lessonCatalog.find(
    (candidate) =>
      candidate.unitId === unitId &&
      candidate.selectionStatus === 'active' &&
      candidate.eligiblePurposes.includes('progression'),
  )
  return entry ? buildLesson(entry) : { errors: ['No lesson content assigned to this unit.'] }
}

export function getLessonById(lessonId: string): LessonCatalogResult {
  const entry = lessonCatalog.find((candidate) => candidate.lessonId === lessonId)
  return entry ? buildLesson(entry) : { errors: ['No lesson content assigned to this lesson ID.'] }
}

export function getLessonCandidates(): LessonActivityCandidate[] {
  return lessonCatalog.flatMap((entry) => {
    if (entry.selectionStatus !== 'active') return []
    const questions = entry.questionIdentifiers
      .map((questionId) => sampleContent.questions.find((question) => question.questionIdentifier === questionId))
      .filter((question): question is typeof sampleContent.questions[number] => Boolean(question))
    const firstQuestion = questions[0]
    if (!firstQuestion || questions.some((question) => (
      question.skillIdentifier !== firstQuestion.skillIdentifier || question.difficulty !== firstQuestion.difficulty
    ))) {
      return []
    }
    return [{
      lessonId: entry.lessonId,
      activityId: entry.activityId,
      skillId: firstQuestion.skillIdentifier,
      difficulty: firstQuestion.difficulty,
      worldId: entry.worldId,
      unitId: entry.unitId,
      packId: entry.packId,
      benchmarkReferences: [...entry.benchmarkReferences],
      eligiblePurposes: [...entry.eligiblePurposes],
      passageQuestionKeys: entry.passageIdentifier.flatMap((passageId) =>
        questions.map((question) => `${passageId}::${question.questionIdentifier}`),
      ),
      contentVersion: entry.contentVersion,
    }]
  })
}

function buildLesson(entry: LessonCatalogEntry): LessonCatalogResult {
  const validationErrors = validateContent(sampleContent)
  if (validationErrors.length > 0) {
    return { errors: validationErrors.map((error) => `${error.code}: ${error.message}`) }
  }

  const foundQuestions = entry.questionIdentifiers
    .map((questionId) => sampleContent.questions.find((question) => question.questionIdentifier === questionId))
    .filter((question): question is typeof sampleContent.questions[number] => Boolean(question))
  if (foundQuestions.length !== entry.questionIdentifiers.length) {
    return { errors: ['Lesson references unknown question content.'] }
  }
  const firstQuestion = foundQuestions[0]
  if (!firstQuestion || foundQuestions.some((question) => (
    question.skillIdentifier !== firstQuestion.skillIdentifier || question.difficulty !== firstQuestion.difficulty
  ))) {
    return { errors: ['Lesson questions must share one skill and one difficulty.'] }
  }

  const foundPassages = entry.passageIdentifier
    .map((passageId) => sampleContent.passages.find((passage) => passage.passageIdentifier === passageId))
    .filter((passage): passage is typeof sampleContent.passages[number] => Boolean(passage))
  if (foundPassages.length !== entry.passageIdentifier.length) {
    return { errors: ['Lesson references unknown passage content.'] }
  }

  const questions = foundQuestions
    .map((question) => toLessonQuestion(question, entry.lessonId))
    .filter((question): question is LessonQuestion => question !== null)
  if (questions.length !== entry.questionIdentifiers.length) {
    return { errors: ['Lesson contains malformed questions for this unit.'] }
  }

  return {
    lesson: {
      lessonId: entry.lessonId,
      activityId: entry.activityId,
      passageId: entry.passageIdentifier[0],
      passageIds: [...entry.passageIdentifier],
      pairedTextSetId: entry.pairedTextSetId,
      skillId: firstQuestion.skillIdentifier,
      difficulty: firstQuestion.difficulty,
      unitId: entry.unitId,
      worldId: entry.worldId,
      lessonTitle: entry.lessonTitle,
      lessonObjective: entry.lessonObjective,
      lessonRole: entry.lessonRole,
      selectionStatus: entry.selectionStatus,
      teachingBlock: entry.teachingBlock ? { ...entry.teachingBlock, examples: [...entry.teachingBlock.examples] } : undefined,
      questionCount: questions.length,
      questions,
      contentVersion: entry.contentVersion,
      eligiblePurposes: [...entry.eligiblePurposes],
    },
    errors: [],
  }
}

function toLessonQuestion(raw: typeof sampleContent.questions[number], lessonId: string): LessonQuestion | null {
  if (!raw.explanation || !raw.questionContent) return null
  const base = {
    questionId: raw.questionIdentifier,
    lessonId,
    activityId: raw.activityIdentifier,
    passageId: raw.passageIdentifier,
    skillId: raw.skillIdentifier,
    difficulty: raw.difficulty,
    prompt: raw.prompt,
    explanation: raw.explanation,
    evidenceReferenceIds: raw.evidenceReferenceIds ?? [],
  }

  switch (raw.questionType) {
    case 'multiple_choice': {
      if (raw.questionContent.type !== 'multiple_choice') return null
      const question: MultipleChoiceLessonQuestion = {
        ...base,
        questionType: 'MULTIPLE_CHOICE',
        choices: toChoiceList(raw.questionContent.choices),
        correctChoiceIds: [...raw.questionContent.correctChoiceIds],
      }
      return question
    }
    case 'multi_select': {
      if (raw.questionContent.type !== 'multi_select') return null
      const question: MultiselectLessonQuestion = {
        ...base,
        questionType: 'MULTISELECT',
        choices: toChoiceList(raw.questionContent.choices),
        correctChoiceIds: [...raw.questionContent.correctChoiceIds],
      }
      return question
    }
    case 'hot_text': {
      if (raw.questionContent.type !== 'hot_text') return null
      const question: HotTextLessonQuestion = {
        ...base,
        questionType: 'HOT_TEXT',
        segments: toChoiceList(raw.questionContent.selectableSegments),
        correctSegmentIds: [...raw.questionContent.correctSegmentIds],
        allowMultiple: raw.questionContent.correctSegmentIds.length > 1,
      }
      return question
    }
    case 'two_part': {
      if (raw.questionContent.type !== 'two_part') return null
      const question: EvidencePairLessonQuestion = {
        ...base,
        questionType: 'EVIDENCE_PAIR',
        partAPrompt: raw.questionContent.partAPrompt,
        partAChoices: toChoiceList(raw.questionContent.partAChoices),
        partACorrectChoiceId: raw.questionContent.partACorrectChoiceId,
        partBPrompt: raw.questionContent.partBPrompt,
        partBChoices: toChoiceList(raw.questionContent.partBChoices),
        partBCorrectChoiceId: raw.questionContent.partBCorrectChoiceId,
      }
      return question
    }
    case 'table_match': {
      if (raw.questionContent.type !== 'table_match') return null
      const question: TableMatchLessonQuestion = {
        ...base,
        questionType: 'TABLE_MATCH',
        selectionMode: raw.questionContent.selectionMode ?? 'independent',
        rows: raw.questionContent.rows.map((row) => ({
          id: row.id,
          prompt: row.prompt,
          correctChoiceId: row.correctChoiceId,
          options: toChoiceList(row.options),
        })),
      }
      return question
    }
    default:
      return null
  }
}

function toChoiceList(values: Array<{ id: string; text: string }>): LessonChoice[] {
  return values.map((value) => ({ id: value.id.trim(), text: value.text }))
}
