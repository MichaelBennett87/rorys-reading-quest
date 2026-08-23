import { useEffect, useMemo, useRef, useState } from 'react'

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
import type { WordSupportTarget } from '../domain/content'
import type { PairedTextSet } from '../domain/content/packs/contentPackTypes'
import {
  type AssistanceEvent,
  type AssistanceKind,
  type AssistanceLevel,
  createAssistanceEvent,
  summarizeAssistance,
} from '../domain/assistance'
import { ChildButton } from '../components/ChildButton'
import { QuestionProgress } from '../components/lesson/QuestionProgress'
import { MultipleChoiceQuestion } from '../components/lesson/MultipleChoiceQuestion'
import { MultiselectQuestion } from '../components/lesson/MultiselectQuestion'
import { HotTextQuestion } from '../components/lesson/HotTextQuestion'
import { EvidencePairQuestion } from '../components/lesson/EvidencePairQuestion'
import { TableMatchQuestion } from '../components/lesson/TableMatchQuestion'
import { AnswerFeedback } from '../components/lesson/AnswerFeedback'
import { LessonTextCard } from '../components/lesson/LessonTextCard'
import { PairedTextCard } from '../components/lesson/PairedTextCard'
import { LessonResults } from '../components/lesson/LessonResults'
import { FluencyPracticeScreen } from './FluencyPracticeScreen'
import { WordHelpPanel } from '../components/wordSupport'
import { resolveLessonEvidence } from '../domain/content'
import {
  advanceActiveLessonSession,
  checkpointSubmittedQuestion,
  restoreLessonEvaluations,
  type ActiveLessonSession,
} from '../persistence'
import { createSpeechService, createWordSupportSpeechRequest, type SpeechService } from '../services/speech'

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
  lessonRole: 'GUIDED_PRACTICE',
  totalQuestions: 0,
  correctAnswers: 0,
  firstAttemptCorrect: 0,
  accuracy: 0,
  assistanceUsed: 0,
  assistanceSummary: {
    totalUniqueEvents: 0,
    targetsHelped: 0,
    maximumAssistanceLevel: 0,
    visualHintUsed: false,
    spokenChunkHelpUsed: false,
    spokenWordHelpUsed: false,
    sentenceReadAloudUsed: false,
  },
  fluencyPracticeSummary: null,
  oralFluencyMeasured: false,
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
  const [assistanceEvents, setAssistanceEvents] = useState<AssistanceEvent[]>(session?.assistanceEvents ?? [])
  const [openSupportTargetId, setOpenSupportTargetId] = useState<string | null>(null)
  const [speechActive, setSpeechActive] = useState(false)
  const [speechService] = useState<SpeechService>(() => createSpeechService())
  const [practiceStarted, setPracticeStarted] = useState(
    lesson.lessonRole !== 'GUIDED_PRACTICE' || (session?.submittedQuestions.length ?? 0) > 0,
  )

  const sessionRef = useRef<ActiveLessonSession | null>(session)
  const completionSentRef = useRef(false)
  const currentQuestion = lesson.questions[currentIndex] ?? null
  const lessonPassages = useMemo(() => {
    const passageIds = lesson.passageIds.length > 0 ? lesson.passageIds : [lesson.passageId]
    return passageIds
      .map((passageId) => sampleContent.passages.find((passage) => passage.passageIdentifier === passageId))
      .filter((passage): passage is (typeof sampleContent.passages)[number] => Boolean(passage))
  }, [lesson.passageId, lesson.passageIds])
  const lessonPassagesById = useMemo(
    () => new Map(lessonPassages.map((passage) => [passage.passageIdentifier, passage] as const)),
    [lessonPassages],
  )
  const pairedContent = sampleContent as typeof sampleContent & {
    pairedTextSets?: PairedTextSet[]
  }
  const pairedTextSet = lesson.pairedTextSetId
    ? pairedContent.pairedTextSets?.find((pair) => pair.pairId === lesson.pairedTextSetId) ?? null
    : null
  const currentPassage = currentQuestion
    ? lessonPassagesById.get(currentQuestion.passageId) ?? lessonPassages[0] ?? null
    : null
  const lessonWordSupportTargets = lessonPassages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const activeSupportTarget = openSupportTargetId
    ? lessonWordSupportTargets.find((target) => target.targetId === openSupportTargetId) ?? null
    : null
  const tableMatchSelectionMode = currentQuestion.questionType === 'TABLE_MATCH'
    ? currentQuestion.selectionMode ?? 'independent'
    : 'independent'
  const speechSupported = speechService.isSupported()
  const lessonAssistanceSummary = useMemo(() => summarizeAssistance(assistanceEvents), [assistanceEvents])
  const supportLevels = useMemo(() => deriveSupportLevels(assistanceEvents), [assistanceEvents])
  const showTeachingBlock =
    lesson.lessonRole === 'GUIDED_PRACTICE' &&
    !practiceStarted &&
    (session?.submittedQuestions.length ?? 0) === 0 &&
    Boolean(lesson.teachingBlock)
  const evidenceSnippetsByPassageId = useMemo(() => {
    if (!currentQuestion) {
      return {}
    }

    const groups: Record<string, string[]> = {}
    for (const evidenceId of currentQuestion.evidenceReferenceIds) {
      const resolved = resolveLessonEvidence(lessonPassagesById, currentQuestion.passageId, evidenceId)
      if (!resolved) {
        continue
      }
      const snippet = resolved.label && resolved.label !== resolved.text ? `${resolved.label}: ${resolved.text}` : resolved.text
      groups[resolved.passageId] = [...(groups[resolved.passageId] ?? []), snippet]
    }
    return groups
  }, [currentQuestion, lessonPassagesById])
  const result = useMemo(
    () =>
      buildLessonResult({
        lessonId: lesson.lessonId,
        activityId: lesson.activityId,
        skillId: lesson.skillId,
        difficulty: lesson.difficulty,
        lessonRole: lesson.lessonRole,
        questionEvaluations,
        assistanceSummary: lessonAssistanceSummary,
      }),
    [lesson.lessonId, lesson.activityId, lesson.skillId, lesson.difficulty, lesson.lessonRole, questionEvaluations, lessonAssistanceSummary],
  )

  useEffect(() => () => {
    speechService.cancel()
  }, [speechService])

  useEffect(() => {
    speechService.cancel()
  }, [currentIndex, speechService])

  useEffect(() => {
    speechService.cancel()
  }, [step, speechService])

  if (lesson.lessonRole === 'FLUENCY_PRACTICE') {
    return (
      <FluencyPracticeScreen
        lesson={lesson}
        onBack={onBack}
        session={session}
        onSessionCheckpoint={onSessionCheckpoint}
        onComplete={onComplete}
      />
    )
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

  if (!currentQuestion) {
    return (
      <section className="screen-shell">
        <header className="screen-header">
          <h1>Lesson content is unavailable</h1>
        </header>
        <section className="card">
          <p>This quest could not restore its current question. Please return to the unit.</p>
        </section>
        <section className="screen-actions">
          <ChildButton type="button" className="primary-action" onClick={onBack}>
            Return to Unit
          </ChildButton>
        </section>
      </section>
    )
  }

  const currentPassageEvidenceSnippets = currentPassage
    ? evidenceSnippetsByPassageId[currentPassage.passageIdentifier] ?? []
    : []

  const submissionReady = (() => {
    switch (currentQuestion.questionType) {
      case 'MULTIPLE_CHOICE':
        return Boolean(selectedChoiceId)
      case 'MULTISELECT':
        return selectedChoiceIds.length > 0
      case 'HOT_TEXT':
        return selectedSegmentIds.length > 0
      case 'EVIDENCE_PAIR':
        return Boolean(selectedPartAChoiceId && selectedPartBChoiceId)
      case 'TABLE_MATCH':
        return currentQuestion.rows.every((row) => typeof selectedMappings[row.id] === 'string' && selectedMappings[row.id] !== '')
      default:
        return false
    }
  })()

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

  const persistAssistanceEvents = (nextEvents: AssistanceEvent[]) => {
    if (!sessionRef.current) return
    const nextSession: ActiveLessonSession = {
      ...sessionRef.current,
      assistanceEvents: nextEvents,
      updatedAt: new Date().toISOString(),
    }
    sessionRef.current = nextSession
    onSessionCheckpoint?.(nextSession)
  }

  const requestAssistance = (target: WordSupportTarget, level: AssistanceLevel, kind: AssistanceKind) => {
    const eventResult = createAssistanceEvent({
      sessionId: sessionRef.current?.sessionId ?? `${lesson.activityId}:preview`,
      lessonId: lesson.lessonId,
      activityId: lesson.activityId,
      questionId: currentQuestion.questionId,
      targetId: target.targetId,
      kind,
      level,
      timestamp: new Date().toISOString(),
      existingEvents: assistanceEvents,
    })

    if (eventResult.added && eventResult.event) {
      const nextEvents = [...assistanceEvents, eventResult.event]
      setAssistanceEvents(nextEvents)
      persistAssistanceEvents(nextEvents)
    }

    setOpenSupportTargetId(target.targetId)
  }

  const requestSpeech = async (target: WordSupportTarget, level: AssistanceLevel) => {
    if (!speechService.isSupported()) return
    const speak = createWordSupportSpeechRequest(target, level, speechService)
    if (!speak) return
    speechService.cancel()
    setSpeechActive(true)
    try {
      await speak()
    } finally {
      setSpeechActive(false)
    }
  }

  const onOpenSupport = (target: WordSupportTarget) => {
    speechService.cancel()
    setSpeechActive(false)
    requestAssistance(target, 1, 'PATTERN_HIGHLIGHT')
  }

  const onRequestSupportLevel = async (level: AssistanceLevel, kind: AssistanceKind) => {
    if (!activeSupportTarget) return
    requestAssistance(activeSupportTarget, level, kind)
    if (level >= 3) {
      await requestSpeech(activeSupportTarget, level)
    }
  }

  const onCloseSupport = () => {
    speechService.cancel()
    setSpeechActive(false)
    setOpenSupportTargetId(null)
  }

  const onSubmit = () => {
    if (!submissionReady) return

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

    const evaluation = evaluateAnswer(currentQuestion as LessonQuestion, {
      questionType: currentQuestion.questionType,
      payload: payload as never,
    })

    const nextEvaluations = [...questionEvaluations, evaluation]
    setQuestionEvaluations(nextEvaluations)
    setPendingFeedback(evaluation)
    setStep('feedback')
    if (sessionRef.current) {
      const checkpoint = checkpointSubmittedQuestion(
        sessionRef.current,
        evaluation,
        currentIndex,
        new Date().toISOString(),
      )
      sessionRef.current = checkpoint
      onSessionCheckpoint?.(checkpoint)
    }
  }

  const onNext = () => {
    speechService.cancel()
    setOpenSupportTargetId(null)
    setSpeechActive(false)

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
    speechService.cancel()
    setSpeechActive(false)
    if (onComplete && sessionRef.current) {
      onComplete(result, sessionRef.current.sessionId)
      return
    }
    onBack()
  }

  const toggleChoice = (choiceId: string) => {
    setSelectedChoiceIds((previous) =>
      previous.includes(choiceId) ? previous.filter((entry) => entry !== choiceId) : [...previous, choiceId],
    )
  }

  const toggleSegment = (segmentId: string) => {
    const isSelected = selectedSegmentIds.includes(segmentId)
    if (isSelected) {
      setSelectedSegmentIds((previous) => previous.filter((entry) => entry !== segmentId))
      return
    }
    setSelectedSegmentIds((previous) => [...previous, segmentId])
  }

  const updateMapping = (rowId: string, choiceId: string) => {
    setSelectedMappings((previous) => ({
      ...previous,
      [rowId]: choiceId,
    }))
  }

  return (
    <section className="screen-shell">
      <header className="screen-header">
        <h1>{lesson.lessonTitle}</h1>
        <p>{lesson.lessonObjective}</p>
      </header>
      {showTeachingBlock && lesson.teachingBlock ? (
        <section className="card teaching-block" aria-labelledby="teaching-block-heading">
          <h2 id="teaching-block-heading">{lesson.teachingBlock.title}</h2>
          <p>{lesson.teachingBlock.explanation}</p>
          <ul>
            {lesson.teachingBlock.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
          {lesson.teachingBlock.contrast && <p>{lesson.teachingBlock.contrast}</p>}
          <p>{lesson.teachingBlock.learnerCue}</p>
          <section className="screen-actions">
            <ChildButton
              type="button"
              className="primary-action"
              onClick={() => setPracticeStarted(true)}
            >
              Start Practice
            </ChildButton>
            <ChildButton type="button" onClick={onBack}>
              Exit Quest
            </ChildButton>
          </section>
        </section>
      ) : (
        <>
          {pairedTextSet && lessonPassages.length >= 2 ? (
            <PairedTextCard
              pairId={pairedTextSet.pairId}
              pairTitle={pairedTextSet.pairTitle}
              members={pairedTextSet.members}
              passages={[lessonPassages[0], lessonPassages[1]]}
              wordSupportTargets={lessonWordSupportTargets}
              evidenceSnippetsByPassageId={step === 'feedback' ? evidenceSnippetsByPassageId : {}}
              onOpenWordSupport={onOpenSupport}
              visibleWordSupport
            />
          ) : currentPassage ? (
            <LessonTextCard
              passage={currentPassage}
              heading="Reading Passage"
              wordSupportTargets={lessonWordSupportTargets}
              onOpenWordSupport={onOpenSupport}
              visibleWordSupport
              evidenceSnippets={step === 'feedback' ? currentPassageEvidenceSnippets : []}
            />
          ) : (
            <section className="card">
              <h2>Reading Passage</h2>
              <p>We can’t load this quest right now. Try another unit from the shell.</p>
            </section>
          )}
          {activeSupportTarget && (
            <WordHelpPanel
              target={activeSupportTarget}
              level={supportLevels[activeSupportTarget.targetId] ?? 0}
              speechSupported={speechSupported}
              onRequestLevel={onRequestSupportLevel}
              onStop={() => {
                speechService.cancel()
                setSpeechActive(false)
              }}
              onClose={onCloseSupport}
              speechActive={speechActive}
            />
          )}
        </>
      )}

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
                disabledChoiceIds: tableMatchSelectionMode === 'use_each_once'
                  ? currentQuestion.rows
                      .filter((otherRow) => otherRow.id !== row.id)
                      .map((otherRow) => selectedMappings[otherRow.id] ?? '')
                      .filter((choiceId): choiceId is string => Boolean(choiceId))
                  : [],
              }))}
              disabled={step !== 'question'}
              selectionMode={tableMatchSelectionMode}
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

function deriveSupportLevels(events: AssistanceEvent[]): Record<string, AssistanceLevel> {
  return events.reduce<Record<string, AssistanceLevel>>((levels, event) => {
    const current = levels[event.targetId] ?? 0
    levels[event.targetId] = Math.max(current, event.assistanceLevel) as AssistanceLevel
    return levels
  }, {})
}
