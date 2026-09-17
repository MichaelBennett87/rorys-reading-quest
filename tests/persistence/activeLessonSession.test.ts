import { describe, expect, test } from 'vitest'

import { evaluateAnswer, getLessonById } from '../../src/domain/lesson'
import {
  checkpointSubmittedQuestion,
  createActiveLessonSession,
} from '../../src/persistence'

describe('active lesson submitted-question checkpoints', () => {
  test('keeps the first scored submission immutable across delayed duplicate actions', () => {
    const lesson = getLessonById('g2-story-scouts-plot-structure-elements-lesson-checkpoint-a').lesson
    expect(lesson).toBeDefined()
    const question = lesson!.questions[0]
    expect(question.questionType).toBe('MULTIPLE_CHOICE')
    if (question.questionType !== 'MULTIPLE_CHOICE') return

    const correctChoiceId = question.correctChoiceIds[0]
    const incorrectChoiceId = question.choices.find((choice) => choice.id !== correctChoiceId)?.id
    expect(correctChoiceId).toBeTruthy()
    expect(incorrectChoiceId).toBeTruthy()

    const session = createActiveLessonSession(
      lesson!,
      'session-rapid-touch',
      '2026-09-17T12:00:00.000Z',
    )
    const correctEvaluation = evaluateAnswer(question, {
      questionType: 'MULTIPLE_CHOICE',
      payload: { selectedChoiceId: correctChoiceId },
    })
    const accepted = checkpointSubmittedQuestion(
      session,
      correctEvaluation,
      0,
      '2026-09-17T12:00:01.000Z',
    )

    const duplicate = checkpointSubmittedQuestion(
      accepted,
      correctEvaluation,
      0,
      '2026-09-17T12:00:02.000Z',
    )
    expect(duplicate).toBe(accepted)
    expect(duplicate.submittedQuestions).toHaveLength(1)
    expect(duplicate.updatedAt).toBe('2026-09-17T12:00:01.000Z')

    const conflictingEvaluation = evaluateAnswer(question, {
      questionType: 'MULTIPLE_CHOICE',
      payload: { selectedChoiceId: incorrectChoiceId! },
    })
    const conflictingDuplicate = checkpointSubmittedQuestion(
      accepted,
      conflictingEvaluation,
      0,
      '2026-09-17T12:00:03.000Z',
    )
    expect(conflictingDuplicate).toBe(accepted)
    expect(conflictingDuplicate.submittedQuestions[0]).toEqual(accepted.submittedQuestions[0])
  })
})
