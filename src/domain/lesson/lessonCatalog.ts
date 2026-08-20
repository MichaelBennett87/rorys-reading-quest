import { sampleContent, type ContentSample } from '../content'
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

export const lessonCatalog: readonly LessonCatalogEntry[] = [
  {
    lessonId: 'lesson-word-forge-vowel-voyage-a',
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-trail-1-a',
    passageIdentifier: ['passage-word-forge-bridge-a'],
    questionIdentifiers: [
      'q-word-forge-vowel-voyage-a-1',
      'q-word-forge-vowel-voyage-a-2',
      'q-word-forge-vowel-voyage-a-3',
      'q-word-forge-vowel-voyage-a-4',
    ],
    lessonTitle: 'Vowel Voyage: Kite Clues',
    lessonObjective: 'Collect clues from a short kite passage and prove each choice with text.',
    contentVersion: 'r0.1.0',
    eligiblePurposes: ['progression', 'verification', 'remediation', 'review'],
  },
  {
    lessonId: 'lesson-word-forge-vowel-voyage-b',
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-trail-1-b',
    passageIdentifier: ['passage-word-forge-bridge-b'],
    questionIdentifiers: [
      'q-word-forge-vowel-voyage-b-2',
      'q-word-forge-vowel-voyage-b-4',
      'q-word-forge-vowel-voyage-b-5',
    ],
    lessonTitle: 'Vowel Voyage: Seed Clues',
    lessonObjective: 'Use details from a short seed passage to explain careful steps.',
    contentVersion: 'r0.1.0',
    eligiblePurposes: ['progression', 'verification', 'remediation', 'review'],
  },
  {
    lessonId: 'lesson-word-forge-vowel-voyage-c',
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-trail-1-c',
    passageIdentifier: ['passage-word-forge-bridge-a'],
    questionIdentifiers: [
      'q-word-forge-vowel-voyage-a-5',
      'q-word-forge-vowel-voyage-a-6',
    ],
    lessonTitle: 'Vowel Voyage: Team Clues',
    lessonObjective: 'Find what happened and connect a team lesson to passage evidence.',
    contentVersion: 'r0.1.0',
    eligiblePurposes: ['progression', 'verification', 'remediation', 'review'],
  },
  {
    lessonId: 'lesson-word-forge-building-block',
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-trail-0-a',
    passageIdentifier: ['passage-word-forge-bridge-b'],
    questionIdentifiers: ['q-word-forge-vowel-voyage-b-1'],
    lessonTitle: 'Building Block: Careful Clues',
    lessonObjective: 'Practice finding one clear detail before returning to the trail.',
    contentVersion: 'r0.1.0',
    eligiblePurposes: ['remediation', 'review'],
  },
]

export interface LessonCatalogResult {
  lesson?: LessonDefinition
  errors: string[]
}

export function getLessonForUnit(unitId: string): LessonCatalogResult {
  const entry = lessonCatalog.find(
    (candidate) => candidate.unitId === unitId && candidate.eligiblePurposes.includes('progression'),
  )
  return entry ? buildLesson(entry) : { errors: ['No lesson content assigned to this unit.'] }
}

export function getLessonById(lessonId: string): LessonCatalogResult {
  const entry = lessonCatalog.find((candidate) => candidate.lessonId === lessonId)
  return entry ? buildLesson(entry) : { errors: ['No lesson content assigned to this lesson ID.'] }
}

export function getLessonCandidates(): LessonActivityCandidate[] {
  return lessonCatalog.flatMap((entry) => {
    const questions = entry.questionIdentifiers
      .map((questionId) => sampleContent.questions.find((question) => question.questionIdentifier === questionId))
      .filter((question): question is ContentSample['questions'][number] => Boolean(question))
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
      eligiblePurposes: [...entry.eligiblePurposes],
      passageQuestionKeys: questions.map(
        (question) => `${question.passageIdentifier}::${question.questionIdentifier}`,
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
    .filter((question): question is ContentSample['questions'][number] => Boolean(question))
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
    .filter((passage): passage is ContentSample['passages'][number] => Boolean(passage))
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
      skillId: firstQuestion.skillIdentifier,
      difficulty: firstQuestion.difficulty,
      unitId: entry.unitId,
      worldId: entry.worldId,
      lessonTitle: entry.lessonTitle,
      lessonObjective: entry.lessonObjective,
      questionCount: questions.length,
      questions,
      contentVersion: entry.contentVersion,
      eligiblePurposes: [...entry.eligiblePurposes],
    },
    errors: [],
  }
}

function toLessonQuestion(raw: ContentSample['questions'][number], lessonId: string): LessonQuestion | null {
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
