import { validateContent } from '../content/validateContent'
import { sampleContent, type ContentSample } from '../content'
import type { LessonChoice, LessonCatalogEntry, LessonDefinition } from './lessonTypes'
import {
  type EvidencePairLessonQuestion,
  type HotTextLessonQuestion,
  type LessonQuestion,
  type MultipleChoiceLessonQuestion,
  type MultiselectLessonQuestion,
  type TableMatchLessonQuestion,
} from './lessonTypes'

const lessonCatalog: LessonCatalogEntry[] = [
  {
    lessonId: 'lesson-word-forge-vowel-voyage',
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'act-word-forge-vowel-voyage',
    passageIdentifier: ['passage-word-forge-bridge-a', 'passage-word-forge-bridge-b'] as string[],
    questionIdentifiers: [
      'q-word-forge-vowel-voyage-a-1',
      'q-word-forge-vowel-voyage-a-2',
      'q-word-forge-vowel-voyage-a-3',
      'q-word-forge-vowel-voyage-b-1',
      'q-word-forge-vowel-voyage-b-2',
      'q-word-forge-vowel-voyage-a-4',
      'q-word-forge-vowel-voyage-b-4',
      'q-word-forge-vowel-voyage-b-5',
      'q-word-forge-vowel-voyage-a-5',
      'q-word-forge-vowel-voyage-a-6',
    ],
    lessonTitle: 'Vowel Voyage',
    lessonObjective: 'Collect clues from two short passages and prove each choice with text.',
  } as LessonCatalogEntry,
]

interface LessonCatalogResult {
  lesson?: LessonDefinition
  errors: string[]
}

export function getLessonForUnit(unitId: string): LessonCatalogResult {
  const lessonEntry = lessonCatalog.find((entry) => entry.unitId === unitId)
  if (!lessonEntry) {
    return {
      errors: ['No lesson content assigned to this unit.'],
    }
  }

  const validationErrors = validateContent(sampleContent)
  if (validationErrors.length > 0) {
    return {
      errors: validationErrors.map((error) => `${error.code}: ${error.message}`),
    }
  }

  const foundQuestions = lessonEntry.questionIdentifiers
    .map((questionId) => sampleContent.questions.find((question) => question.questionIdentifier === questionId))
    .filter((question): question is NonNullable<typeof question> => Boolean(question))

  const missingQuestions = lessonEntry.questionIdentifiers.filter((questionId) => {
    return !sampleContent.questions.some((question) => question.questionIdentifier === questionId)
  })
  if (missingQuestions.length > 0) {
    return {
      errors: missingQuestions.map((missing) => `Missing referenced question ${missing}`),
    }
  }

  const foundPassages = lessonEntry.passageIdentifier
    .map((passageId) => sampleContent.passages.find((passage) => passage.passageIdentifier === passageId))
    .filter((passage): passage is NonNullable<typeof passage> => Boolean(passage))

  if (foundPassages.length !== lessonEntry.passageIdentifier.length) {
    return {
      errors: ['Lesson references unknown passage content.'],
    }
  }

  const lessonQuestions = foundQuestions
    .map((question) => toLessonQuestion(question))
    .filter((question): question is LessonQuestion => question !== null)

  if (lessonQuestions.length !== lessonEntry.questionIdentifiers.length) {
    return {
      errors: ['Lesson contains malformed questions for this unit.'],
    }
  }

  return {
    lesson: {
      lessonId: lessonEntry.lessonId,
      activityId: lessonEntry.activityId,
      passageId: lessonEntry.passageIdentifier[0],
      skillId: foundQuestions[0]?.skillIdentifier ?? 'unknown',
      difficulty: foundQuestions[0]?.difficulty ?? 1,
      unitId: lessonEntry.unitId,
      worldId: lessonEntry.worldId,
      lessonTitle: lessonEntry.lessonTitle,
      lessonObjective: lessonEntry.lessonObjective,
      questionCount: lessonQuestions.length,
      questions: lessonQuestions,
    },
    errors: [],
  }
}

function toLessonQuestion(raw: ContentSample['questions'][number]): LessonQuestion | null {
  if (!raw.explanation) {
    return null
  }
  const base = {
    questionId: raw.questionIdentifier,
    lessonId: raw.lessonIdentifier ?? '',
    activityId: raw.activityIdentifier,
    passageId: raw.passageIdentifier,
    skillId: raw.skillIdentifier,
    difficulty: raw.difficulty,
    prompt: raw.prompt,
    explanation: raw.explanation,
    evidenceReferenceIds: raw.evidenceReferenceIds ?? [],
  }

  if (!raw.questionContent) {
    return null
  }

  switch (raw.questionType) {
    case 'multiple_choice': {
      const question = raw.questionContent
      if (question.type !== 'multiple_choice') {
        return null
      }
      const mapped = toChoiceList(question.choices)
      const multipleChoice: MultipleChoiceLessonQuestion = {
        ...base,
        questionType: 'MULTIPLE_CHOICE',
        choices: mapped,
        correctChoiceIds: [...question.correctChoiceIds],
      }
      return multipleChoice
    }
    case 'multi_select': {
      const question = raw.questionContent
      if (question.type !== 'multi_select') {
        return null
      }
      const mapped = toChoiceList(question.choices)
      const multiselect: MultiselectLessonQuestion = {
        ...base,
        questionType: 'MULTISELECT',
        choices: mapped,
        correctChoiceIds: [...question.correctChoiceIds],
      }
      return multiselect
    }
    case 'hot_text': {
      const question = raw.questionContent
      if (question.type !== 'hot_text') {
        return null
      }
      const mapped = toChoiceList(question.selectableSegments)
      const hotText: HotTextLessonQuestion = {
        ...base,
        questionType: 'HOT_TEXT',
        segments: mapped,
        correctSegmentIds: [...question.correctSegmentIds],
        allowMultiple: question.correctSegmentIds.length > 1,
      }
      return hotText
    }
    case 'two_part': {
      const question = raw.questionContent
      if (question.type !== 'two_part') {
        return null
      }
      const evidencePair: EvidencePairLessonQuestion = {
        ...base,
        questionType: 'EVIDENCE_PAIR',
        partAPrompt: question.partAPrompt,
        partAChoices: toChoiceList(question.partAChoices),
        partACorrectChoiceId: question.partACorrectChoiceId,
        partBPrompt: question.partBPrompt,
        partBChoices: toChoiceList(question.partBChoices),
        partBCorrectChoiceId: question.partBCorrectChoiceId,
      }
      return evidencePair
    }
    case 'table_match': {
      const question = raw.questionContent
      if (question.type !== 'table_match') {
        return null
      }
      const tableMatch: TableMatchLessonQuestion = {
        ...base,
        questionType: 'TABLE_MATCH',
        rows: question.rows.map((row) => ({
          id: row.id,
          prompt: row.prompt,
          correctChoiceId: row.correctChoiceId,
          options: toChoiceList(row.options),
        })),
      }
      return tableMatch
    }
    default:
      return null
  }
}

function toChoiceList(values: Array<{ id: string; text: string }>): LessonChoice[] {
  return values.map((value) => ({ id: value.id.trim(), text: value.text }))
}
