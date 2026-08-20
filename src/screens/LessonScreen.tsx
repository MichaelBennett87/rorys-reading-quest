import { useMemo, useRef, useState } from 'react'

import {
  type EvidencePairLessonQuestion,
  type LessonDefinition,
  type LessonQuestion,
  type LessonResult,
  buildLessonResult,
  evaluateAnswer,
  type QuestionEvaluationResult,
} from '../domain/lesson'
import { sampleContent } from '../domain/content'
import { ChildButton } from '../components/ChildButton'
import { QuestionProgress } from '../components/lesson/QuestionProgress'
import { MultipleChoiceQuestion } from '../components/lesson/MultipleChoiceQuestion'
import { MultiselectQuestion } from '../components/lesson/MultiselectQuestion'
import { HotTextQuestion } from '../components/lesson/HotTextQuestion'
import { EvidencePairQuestion } from '../components/lesson/EvidencePairQuestion'
import { TableMatchQuestion } from '../components/lesson/TableMatchQuestion'
import { AnswerFeedback } from '../components/lesson/AnswerFeedback'
import { PassageCard } from '../components/lesson/PassageCard'
import { LessonResults } from '../components/lesson/LessonResults'
import {
  advanceActiveLessonSession,
  checkpointSubmittedQuestion,
  restoreLessonEvaluations,
  type ActiveLessonSession,
} from '../persistence'

type LessonState = 'question' | 'feedback' | 'results'

interface LessonScreenProps {
  lesson: LessonDefinition
  onBack: () => void
  session?: ActiveLessonSession | null
  onSessionCheckpoint?: (session: ActiveLessonSession) => void
  onComplete?: (result: LessonResult, completionId: string) => void
}

const emptyLessonResult: LessonResult = {
  lessonId: '',
  activityId: '',
  skillId: '',
  difficulty: 1,
  totalQuestions: 0,
  correctAnswers: 0,
  firstAttemptCorrect: 0,
  accuracy: 0,
  assistanceUsed: 0,
  questionResults: [],
  completed: true,
}

export function LessonScreen({
  lesson,
  onBack,
  session = null,
  onSessionCheckpoint,
  onComplete,
}: LessonScreenProps) {
  const restoredEvaluations = useMemo(
    () => restoreLessonEvaluations(lesson, session),
    [lesson, session],
  )
  const restoredIndex = Math.min(session?.currentQuestionIndex ?? 0, Math.max(0, lesson.questions.length - 1))
  const restoredFeedback = restoredEvaluations.find(
    (evaluation) => evaluation.questionId === lesson.questions[restoredIndex]?.questionId,
  ) ?? null
  const [step, setStep] = useState<LessonState>(restoredFeedback ? 'feedback' : 'question')
  const [currentIndex, setCurrentIndex] = useState(restoredIndex)
  const [questionEvaluations, setQuestionEvaluations] = useState<QuestionEvaluationResult[]>(restoredEvaluations)
  const [selectedChoiceId, setSelectedChoiceId] = useState('')
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>([])
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([])
  const [selectedPartAChoiceId, setSelectedPartAChoiceId] = useState('')
  const [selectedPartBChoiceId, setSelectedPartBChoiceId] = useState('')
  const [selectedMappings, setSelectedMappings] = useState<Record<string, string>>({})
  const [pendingFeedback, setPendingFeedback] = useState<QuestionEvaluationResult | null>(restoredFeedback)
  const sessionRef = useRef(session)
  const completionSentRef = useRef(false)

  const currentQuestion = lesson.questions[currentIndex]

  const submissionReady = useMemo(() => {
    if (!currentQuestion) {
      return false
    }

    switch (currentQuestion.questionType) {
      case 'MULTIPLE_CHOICE':
        return Boolean(selectedChoiceId)
      case 'MULTISELECT':
        return selectedChoiceIds.length > 0
      case 'HOT_TEXT':
        return selectedSegmentIds.length > 0
      case 'EVIDENCE_PAIR':
        return Boolean(selectedPartAChoiceId && selectedPartBChoiceId)
      case 'TABLE_MATCH': {
        const rows = currentQuestion.rows
        return rows.every((row) => typeof selectedMappings[row.id] === 'string' && selectedMappings[row.id] !== '')
      }
      default:
        return false
    }
  }, [currentQuestion, selectedChoiceId, selectedChoiceIds, selectedSegmentIds, selectedPartAChoiceId, selectedPartBChoiceId, selectedMappings])

  const result = useMemo(
    () =>
      buildLessonResult({
        lessonId: lesson.lessonId,
        activityId: lesson.activityId,
        skillId: lesson.skillId,
        difficulty: lesson.difficulty,
        questionEvaluations,
      }),
    [lesson.lessonId, lesson.activityId, lesson.skillId, lesson.difficulty, questionEvaluations],
  )

  const evidenceSnippets = useMemo(() => {
    if (!currentQuestion) {
      return []
    }
    const evidenceIds = currentQuestion.evidenceReferenceIds
    if (evidenceIds.length === 0) {
      return []
    }
    if (currentQuestion.questionType === 'TABLE_MATCH') {
      return evidenceIds
        .map((id) => {
          const optionText = currentQuestion.rows
            .flatMap((row) => row.options)
            .find((option) => option.id === id)?.text
          return optionText ? `${id}: ${optionText}` : undefined
        })
        .filter(Boolean) as string[]
    }
    if (currentQuestion.questionType === 'MULTISELECT' || currentQuestion.questionType === 'MULTIPLE_CHOICE') {
      return currentQuestion.choices
        .filter((choice) => evidenceIds.includes(choice.id))
        .map((choice) => choice.text)
    }
    if (currentQuestion.questionType === 'HOT_TEXT') {
      return currentQuestion.segments
        .filter((segment) => evidenceIds.includes(segment.id))
        .map((segment) => segment.text)
    }
    if (currentQuestion.questionType === 'EVIDENCE_PAIR') {
      const allChoices = [...currentQuestion.partAChoices, ...currentQuestion.partBChoices]
      return allChoices
        .filter((choice) => evidenceIds.includes(choice.id))
        .map((choice) => choice.text)
    }
    return evidenceIds
  }, [currentQuestion])

  const resetCurrentQuestionState = () => {
    setStep('question')
    setPendingFeedback(null)
    setSelectedChoiceId('')
    setSelectedChoiceIds([])
    setSelectedSegmentIds([])
    setSelectedPartAChoiceId('')
    setSelectedPartBChoiceId('')
    setSelectedMappings({})
  }

  if (!lesson.questions.length) {
    return (
      <section className="screen-shell">
        <header className="screen-header">
          <h1>Lesson content is unavailable</h1>
        </header>
        <section className="card">
          <p>We can’t load this quest right now. Try another unit from the shell.</p>
        </section>
        <section className="screen-actions">
          <ChildButton type="button" className="primary-action" onClick={onBack}>
            Return to Unit
          </ChildButton>
        </section>
      </section>
    )
  }

  const onSubmit = () => {
    if (!currentQuestion || !submissionReady) {
      return
    }

    const payload =
      currentQuestion.questionType === 'MULTIPLE_CHOICE'
        ? { selectedChoiceId }
        : currentQuestion.questionType === 'MULTISELECT'
          ? { selectedChoiceIds }
          : currentQuestion.questionType === 'HOT_TEXT'
            ? { selectedSegmentIds }
            : currentQuestion.questionType === 'EVIDENCE_PAIR'
              ? { partAChoiceId: selectedPartAChoiceId, partBChoiceId: selectedPartBChoiceId }
              : { selectedMappings }

    const result = evaluateAnswer(currentQuestion as LessonQuestion, {
      questionType: currentQuestion.questionType,
      payload: payload as never,
    })

    setQuestionEvaluations((prev) => [...prev, result])
    setPendingFeedback(result)
    setStep('feedback')
    if (sessionRef.current) {
      const checkpoint = checkpointSubmittedQuestion(
        sessionRef.current,
        result,
        currentIndex,
        new Date().toISOString(),
      )
      sessionRef.current = checkpoint
      onSessionCheckpoint?.(checkpoint)
    }
  }

  const onNext = () => {
    if (currentIndex + 1 >= lesson.questions.length) {
      setStep('results')
      if (sessionRef.current) {
        const checkpoint = advanceActiveLessonSession(
          sessionRef.current,
          currentIndex,
          new Date().toISOString(),
        )
        sessionRef.current = checkpoint
        onSessionCheckpoint?.(checkpoint)
      }
      return
    }

    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)
    resetCurrentQuestionState()
    if (sessionRef.current) {
      const checkpoint = advanceActiveLessonSession(
        sessionRef.current,
        nextIndex,
        new Date().toISOString(),
      )
      sessionRef.current = checkpoint
      onSessionCheckpoint?.(checkpoint)
    }
  }

  const continueFromResults = () => {
    if (completionSentRef.current) return
    completionSentRef.current = true
    if (onComplete && sessionRef.current) {
      onComplete(result, sessionRef.current.sessionId)
      return
    }
    onBack()
  }

  const toggleChoice = (choiceId: string) => {
    setSelectedChoiceIds((prev) =>
      prev.includes(choiceId) ? prev.filter((entry) => entry !== choiceId) : [...prev, choiceId],
    )
  }

  const toggleSegment = (segmentId: string) => {
    const isSelected = selectedSegmentIds.includes(segmentId)
    if (isSelected) {
      setSelectedSegmentIds((prev) => prev.filter((entry) => entry !== segmentId))
      return
    }
    setSelectedSegmentIds((prev) => [...prev, segmentId])
  }

  const updateMapping = (rowId: string, choiceId: string) => {
    setSelectedMappings((prev) => ({
      ...prev,
      [rowId]: choiceId,
    }))
  }

  return (
    <section className="screen-shell">
      <header className="screen-header">
        <h1>{lesson.lessonTitle}</h1>
        <p>{lesson.lessonObjective}</p>
      </header>
      <PassageCard
        passageText={sampleContent.passages.find((p) => p.passageIdentifier === currentQuestion.passageId)?.passageText || ''}
        heading="Reading Passage"
        evidenceSnippets={step === 'feedback' ? evidenceSnippets : []}
      />

      {step === 'results' && (
        <LessonResults
          result={questionEvaluations.length ? result : emptyLessonResult}
          onContinue={continueFromResults}
        />
      )}

      {step !== 'results' && (
        <section className="card">
          <QuestionProgress currentIndex={currentIndex} total={lesson.questions.length} />
          <h2 className="sr-only">Question area</h2>

          {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
            <MultipleChoiceQuestion
              questionId={currentQuestion.questionId}
              questionPrompt={currentQuestion.prompt}
              choices={currentQuestion.choices}
              selectedChoiceId={selectedChoiceId}
              disabled={step !== 'question'}
              onSelectChoice={setSelectedChoiceId}
            />
          )}

          {currentQuestion.questionType === 'MULTISELECT' && (
            <MultiselectQuestion
              questionId={currentQuestion.questionId}
              questionPrompt={currentQuestion.prompt}
              choices={currentQuestion.choices}
              selectedChoiceIds={selectedChoiceIds}
              disabled={step !== 'question'}
              onToggleChoice={toggleChoice}
            />
          )}

          {currentQuestion.questionType === 'HOT_TEXT' && (
            <HotTextQuestion
              questionPrompt={currentQuestion.prompt}
              allowMultiple={currentQuestion.allowMultiple}
              segments={currentQuestion.segments}
              selectedSegmentIds={selectedSegmentIds}
              disabled={step !== 'question'}
              onToggleSegment={toggleSegment}
            />
          )}

          {currentQuestion.questionType === 'EVIDENCE_PAIR' && (
            <EvidencePairQuestion
              partAPrompt={(currentQuestion as EvidencePairLessonQuestion).partAPrompt}
              partAChoices={(currentQuestion as EvidencePairLessonQuestion).partAChoices}
              partBPrompt={(currentQuestion as EvidencePairLessonQuestion).partBPrompt}
              partBChoices={(currentQuestion as EvidencePairLessonQuestion).partBChoices}
              selectedPartAChoiceId={selectedPartAChoiceId}
              selectedPartBChoiceId={selectedPartBChoiceId}
              disabled={step !== 'question'}
              onPartASelect={setSelectedPartAChoiceId}
              onPartBSelect={setSelectedPartBChoiceId}
            />
          )}

          {currentQuestion.questionType === 'TABLE_MATCH' && (
            <TableMatchQuestion
              rows={currentQuestion.rows.map((row) => ({
                id: row.id,
                prompt: row.prompt,
                options: row.options,
                selectedChoiceId: selectedMappings[row.id] ?? '',
              }))}
              disabled={step !== 'question'}
              onSelectChoice={updateMapping}
            />
          )}

          {step === 'question' && (
            <section className="screen-actions">
              <ChildButton
                type="button"
                className="primary-action"
                disabled={!submissionReady}
                onClick={onSubmit}
              >
                Submit Answer
              </ChildButton>
              <ChildButton type="button" onClick={onBack}>
                Exit Quest
              </ChildButton>
            </section>
          )}

          {step === 'feedback' && pendingFeedback && (
            <>
              <AnswerFeedback isCorrect={pendingFeedback.isCorrect} explanation={pendingFeedback.explanation} />
              <section className="screen-actions">
                <ChildButton type="button" className="primary-action" onClick={onNext}>
                  {currentIndex + 1 >= lesson.questions.length ? 'See Quest Complete' : 'Next Question'}
                </ChildButton>
              </section>
            </>
          )}
        </section>
      )}
    </section>
  )
}
