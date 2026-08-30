import { evaluateAnswer } from './evaluateAnswer'
import type { LessonQuestion, LessonQuestionSubmission } from './lessonTypes'

export interface NamedQuestionSubmission {
  label: string
  submission: LessonQuestionSubmission
}

export interface QuestionGradingContractIssue {
  questionId: string
  code:
    | 'canonical_rejected'
    | 'canonical_equivalent_rejected'
    | 'adversarial_accepted'
    | 'explanation_mismatch'
    | 'question_mutated'
  message: string
}

export interface QuestionGradingContractResult {
  questionId: string
  canonicalSubmissionCount: number
  canonicalEquivalentSubmissionCount: number
  adversarialSubmissionCount: number
  assertionCount: number
  issues: QuestionGradingContractIssue[]
}

export function buildCanonicalSubmission(question: LessonQuestion): LessonQuestionSubmission {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
      return submission('MULTIPLE_CHOICE', { selectedChoiceId: question.correctChoiceIds[0] ?? '' })
    case 'MULTISELECT':
      return submission('MULTISELECT', { selectedChoiceIds: [...question.correctChoiceIds] })
    case 'HOT_TEXT':
      return submission('HOT_TEXT', { selectedSegmentIds: [...question.correctSegmentIds] })
    case 'EVIDENCE_PAIR':
      return submission('EVIDENCE_PAIR', {
        partAChoiceId: question.partACorrectChoiceId,
        partBChoiceId: question.partBCorrectChoiceId,
      })
    case 'TABLE_MATCH':
      return submission('TABLE_MATCH', {
        selectedMappings: Object.fromEntries(question.rows.map((row) => [row.id, row.correctChoiceId])),
      })
  }
}

export function buildCanonicalEquivalentSubmissions(question: LessonQuestion): NamedQuestionSubmission[] {
  if (question.questionType === 'MULTISELECT' && question.correctChoiceIds.length > 1) {
    return [{
      label: 'reversed canonical multiselect order',
      submission: submission('MULTISELECT', { selectedChoiceIds: [...question.correctChoiceIds].reverse() }),
    }]
  }
  if (question.questionType === 'HOT_TEXT' && question.correctSegmentIds.length > 1) {
    return [{
      label: 'reversed canonical hot-text order',
      submission: submission('HOT_TEXT', { selectedSegmentIds: [...question.correctSegmentIds].reverse() }),
    }]
  }
  if (question.questionType === 'TABLE_MATCH' && question.rows.length > 1) {
    return [{
      label: 'reversed canonical table row insertion order',
      submission: submission('TABLE_MATCH', {
        selectedMappings: Object.fromEntries(
          [...question.rows].reverse().map((row) => [row.id, row.correctChoiceId]),
        ),
      }),
    }]
  }
  return []
}

export function generateAdversarialSubmissions(question: LessonQuestion): NamedQuestionSubmission[] {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
      return uniqueSubmissions([
        ...question.choices
          .filter((choice) => !question.correctChoiceIds.includes(choice.id))
          .map((choice) => named(`non-key choice ${choice.id}`, submission('MULTIPLE_CHOICE', { selectedChoiceId: choice.id }))),
        named('empty choice', submission('MULTIPLE_CHOICE', { selectedChoiceId: '' })),
        named('unknown choice', submission('MULTIPLE_CHOICE', { selectedChoiceId: '__unknown-choice__' })),
        mismatchedQuestionTypeSubmission(question),
      ])
    case 'MULTISELECT':
      return uniqueSubmissions([
        ...generateSetAdversaries(
          question.choices.map((choice) => choice.id),
          question.correctChoiceIds,
          (selectedChoiceIds) => submission('MULTISELECT', { selectedChoiceIds }),
        ),
        mismatchedQuestionTypeSubmission(question),
      ])
    case 'HOT_TEXT':
      return uniqueSubmissions([
        ...generateSetAdversaries(
          question.segments.map((segment) => segment.id),
          question.correctSegmentIds,
          (selectedSegmentIds) => submission('HOT_TEXT', { selectedSegmentIds }),
        ),
        mismatchedQuestionTypeSubmission(question),
      ])
    case 'EVIDENCE_PAIR': {
      const pairs = question.partAChoices.flatMap((partA) => (
        question.partBChoices.map((partB) => ({ partA, partB }))
      ))
      return uniqueSubmissions([
        ...pairs
        .filter(({ partA, partB }) => (
          partA.id !== question.partACorrectChoiceId || partB.id !== question.partBCorrectChoiceId
        ))
        .map(({ partA, partB }) => named(
          `Part A ${partA.id} with Part B ${partB.id}`,
          submission('EVIDENCE_PAIR', { partAChoiceId: partA.id, partBChoiceId: partB.id }),
        )),
        mismatchedQuestionTypeSubmission(question),
      ])
    }
    case 'TABLE_MATCH': {
      const canonical = Object.fromEntries(question.rows.map((row) => [row.id, row.correctChoiceId]))
      const mutations: NamedQuestionSubmission[] = []
      for (const row of question.rows) {
        for (const option of row.options.filter((candidate) => candidate.id !== row.correctChoiceId)) {
          mutations.push(named(
            `row ${row.id} mapped to ${option.id}`,
            submission('TABLE_MATCH', { selectedMappings: { ...canonical, [row.id]: option.id } }),
          ))
        }
        const missing = { ...canonical }
        delete missing[row.id]
        mutations.push(named(
          `row ${row.id} missing`,
          submission('TABLE_MATCH', { selectedMappings: missing }),
        ))
        mutations.push(named(
          `row ${row.id} uses unknown option`,
          submission('TABLE_MATCH', { selectedMappings: { ...canonical, [row.id]: '__unknown-option__' } }),
        ))
      }
      mutations.push(named(
        'canonical rows plus unknown row',
        submission('TABLE_MATCH', {
          selectedMappings: { ...canonical, '__unknown-row__': '__unknown-option__' },
        }),
      ))
      mutations.push(mismatchedQuestionTypeSubmission(question))
      return uniqueSubmissions(mutations)
    }
  }
}

function mismatchedQuestionTypeSubmission(question: LessonQuestion): NamedQuestionSubmission {
  const canonical = buildCanonicalSubmission(question)
  const alternateType = question.questionType === 'MULTIPLE_CHOICE' ? 'MULTISELECT' : 'MULTIPLE_CHOICE'
  return named('canonical payload with mismatched question type', {
    ...canonical,
    questionType: alternateType,
  })
}

export function assertQuestionGradingContract(question: LessonQuestion): QuestionGradingContractResult {
  const before = JSON.stringify(question)
  const issues: QuestionGradingContractIssue[] = []
  const canonical = buildCanonicalSubmission(question)
  const canonicalResult = evaluateAnswer(question, canonical)
  if (!canonicalResult.isCorrect) {
    issues.push(issue(question, 'canonical_rejected', 'The canonical authored submission was rejected.'))
  }
  if (canonicalResult.explanation !== question.explanation) {
    issues.push(issue(question, 'explanation_mismatch', 'The evaluator returned an explanation from another question.'))
  }

  const equivalents = buildCanonicalEquivalentSubmissions(question)
  for (const candidate of equivalents) {
    if (!evaluateAnswer(question, candidate.submission).isCorrect) {
      issues.push(issue(question, 'canonical_equivalent_rejected', `${candidate.label} was rejected.`))
    }
  }

  const adversarial = generateAdversarialSubmissions(question)
  for (const candidate of adversarial) {
    if (evaluateAnswer(question, candidate.submission).isCorrect) {
      issues.push(issue(question, 'adversarial_accepted', `${candidate.label} was accepted.`))
    }
  }

  if (JSON.stringify(question) !== before) {
    issues.push(issue(question, 'question_mutated', 'Evaluation mutated the authored question.'))
  }

  return {
    questionId: question.questionId,
    canonicalSubmissionCount: 1,
    canonicalEquivalentSubmissionCount: equivalents.length,
    adversarialSubmissionCount: adversarial.length,
    assertionCount: 3 + equivalents.length + adversarial.length,
    issues,
  }
}

function generateSetAdversaries(
  visibleIds: string[],
  correctIds: string[],
  createSubmission: (ids: string[]) => LessonQuestionSubmission,
): NamedQuestionSubmission[] {
  const canonicalKey = setKey(correctIds)
  if (visibleIds.length <= 8) {
    const combinations: NamedQuestionSubmission[] = []
    const count = 2 ** visibleIds.length
    for (let mask = 0; mask < count; mask += 1) {
      const ids = visibleIds.filter((_, index) => (mask & (1 << index)) !== 0)
      if (setKey(ids) === canonicalKey) continue
      combinations.push(named(`visible subset ${mask}`, createSubmission(ids)))
    }
    return combinations
  }

  const correctSet = new Set(correctIds)
  const mutations: NamedQuestionSubmission[] = [named('empty set', createSubmission([]))]
  for (const id of visibleIds) mutations.push(named(`single choice ${id}`, createSubmission([id])))
  for (const id of correctIds) {
    mutations.push(named(`missing required ${id}`, createSubmission(correctIds.filter((candidate) => candidate !== id))))
  }
  for (const id of visibleIds.filter((candidate) => !correctSet.has(candidate))) {
    mutations.push(named(`extra choice ${id}`, createSubmission([...correctIds, id])))
    for (const required of correctIds) {
      mutations.push(named(
        `replace ${required} with ${id}`,
        createSubmission([...correctIds.filter((candidate) => candidate !== required), id]),
      ))
    }
  }
  return uniqueSubmissions(mutations)
}

function submission(
  questionType: LessonQuestionSubmission['questionType'],
  payload: LessonQuestionSubmission['payload'],
): LessonQuestionSubmission {
  return { questionType, payload } as LessonQuestionSubmission
}

function named(label: string, value: LessonQuestionSubmission): NamedQuestionSubmission {
  return { label, submission: value }
}

function uniqueSubmissions(values: NamedQuestionSubmission[]): NamedQuestionSubmission[] {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = JSON.stringify(value.submission)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function setKey(values: string[]): string {
  return [...new Set(values)].sort().join('\u0000')
}

function issue(
  question: LessonQuestion,
  code: QuestionGradingContractIssue['code'],
  message: string,
): QuestionGradingContractIssue {
  return { questionId: question.questionId, code, message }
}
