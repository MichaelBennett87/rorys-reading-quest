import { useEffect, useMemo, useRef, useState } from 'react'

import {
  type AssistanceEvent,
  type AssistanceKind,
  type AssistanceLevel,
  createAssistanceEvent,
  summarizeAssistance,
} from '../domain/assistance'
import {
  type LessonDefinition,
  type LessonQuestion,
  type LessonResult,
  buildLessonResult,
  evaluateAnswer,
  type QuestionEvaluationResult,
} from '../domain/lesson'
import { sampleContent } from '../domain/content'
import type { WordSupportTarget } from '../domain/content'
import { ChildButton } from '../components/ChildButton'
import { QuestionProgress } from '../components/lesson/QuestionProgress'
import { MultipleChoiceQuestion } from '../components/lesson/MultipleChoiceQuestion'
import { MultiselectQuestion } from '../components/lesson/MultiselectQuestion'
import { HotTextQuestion } from '../components/lesson/HotTextQuestion'
import { EvidencePairQuestion } from '../components/lesson/EvidencePairQuestion'
import { TableMatchQuestion } from '../components/lesson/TableMatchQuestion'
import { AnswerFeedback } from '../components/lesson/AnswerFeedback'
import { PassageCard } from '../components/lesson/PassageCard'
import { WordHelpPanel } from '../components/wordSupport'
import {
  advanceActiveLessonSession,
  checkpointQuestionDraft,
  checkpointSubmittedQuestion,
  restoreLessonDraftAnswer,
  restoreLessonEvaluations,
  getActiveLessonCheckpointRevision,
  type ActiveLessonSession,
  type ActiveSessionCheckpointResponse,
} from '../persistence'
import { DEFAULT_CONFIG, createSpeechService, createWordSupportSpeechRequest, type SpeechService } from '../services/speech'

type FluencyStep = 'question' | 'feedback'

interface FluencyPracticeScreenProps {
  lesson: LessonDefinition
  onBack: () => void
  session?: ActiveLessonSession | null
  onSessionCheckpoint?: (
    session: ActiveLessonSession,
  ) => ActiveSessionCheckpointResponse | void | Promise<ActiveSessionCheckpointResponse | void>
  onComplete?: (result: LessonResult, completionId: string, expectedCheckpointRevision: number) => void | Promise<void>
  storageNotice?: string
}

export function FluencyPracticeScreen({
  lesson,
  onBack,
  session = null,
  onSessionCheckpoint,
  onComplete,
  storageNotice,
}: FluencyPracticeScreenProps) {
  const restoredEvaluations = useMemo(
    () => restoreLessonEvaluations(lesson, session),
    [lesson, session],
  )
  const restoredIndex = Math.min(session?.currentQuestionIndex ?? 0, Math.max(0, lesson.questions.length - 1))
  const restoredFeedback = restoredEvaluations.find(
    (evaluation) => evaluation.questionId === lesson.questions[restoredIndex]?.questionId,
  ) ?? null
  const restoredDraft = useMemo(
    () => restoreLessonDraftAnswer(lesson, session, restoredIndex),
    [lesson, session, restoredIndex],
  )
  const restoredDraftList = Array.isArray(restoredDraft) ? restoredDraft.map(String) : []
  const restoredDraftRecord = isStringRecord(restoredDraft) ? restoredDraft : null

  const [step, setStep] = useState<FluencyStep>(restoredFeedback ? 'feedback' : 'question')
  const [currentIndex, setCurrentIndex] = useState(restoredIndex)
  const [questionEvaluations, setQuestionEvaluations] = useState<QuestionEvaluationResult[]>(restoredEvaluations)
  const [selectedChoiceId, setSelectedChoiceId] = useState(typeof restoredDraft === 'string' ? restoredDraft : '')
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>(restoredDraftList)
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>(restoredDraftList)
  const [selectedPartAChoiceId, setSelectedPartAChoiceId] = useState(restoredDraftRecord?.partA ?? '')
  const [selectedPartBChoiceId, setSelectedPartBChoiceId] = useState(restoredDraftRecord?.partB ?? '')
  const [selectedMappings, setSelectedMappings] = useState<Record<string, string>>(restoredDraftRecord ?? {})
  const [pendingFeedback, setPendingFeedback] = useState<QuestionEvaluationResult | null>(restoredFeedback)
  const [assistanceEvents, setAssistanceEvents] = useState<AssistanceEvent[]>(session?.assistanceEvents ?? [])
  const [openSupportTargetId, setOpenSupportTargetId] = useState<string | null>(null)
  const [speechActive, setSpeechActive] = useState(false)
  const [checkpointPending, setCheckpointPending] = useState(false)
  const [speechService] = useState<SpeechService>(() => createSpeechService())
  const [fluencyState, setFluencyState] = useState(() => session?.fluencyPracticeState ?? {
    modelReadUsed: false,
    phrasePracticeCompleted: false,
    completedReadCount: 0,
    reflection: null,
  })

  const sessionRef = useRef<ActiveLessonSession | null>(session)
  const completionSentRef = useRef(false)
  const actionLockedRef = useRef(false)
  const currentQuestion = lesson.questions[currentIndex] ?? null
  const currentPassage = useMemo(
    () => sampleContent.passages.find((passage) => passage.passageIdentifier === lesson.passageId) ?? null,
    [lesson.passageId],
  )
  const passageTargets = currentPassage?.wordSupportTargets ?? []
  const activeSupportTarget = openSupportTargetId
    ? passageTargets.find((target) => target.targetId === openSupportTargetId) ?? null
    : null
  const speechSupported = speechService.isSupported()
  const lessonAssistanceSummary = useMemo(() => summarizeAssistance(assistanceEvents), [assistanceEvents])
  const supportLevels = useMemo(() => deriveSupportLevels(assistanceEvents), [assistanceEvents])
  const currentPassageTitle = lesson.fluencyPracticeBlock?.title ?? lesson.lessonTitle
  const practiceReady = Boolean(
    fluencyState.phrasePracticeCompleted
    && fluencyState.completedReadCount >= (lesson.fluencyPracticeBlock?.requiredReadCount ?? 1)
    && fluencyState.reflection
    && fluencyState.reflection !== 'try_again'
  )
  const result = useMemo(
    () => buildLessonResult({
      lessonId: lesson.lessonId,
      activityId: lesson.activityId,
      skillId: lesson.skillId,
      difficulty: lesson.difficulty,
      lessonRole: lesson.lessonRole,
      questionEvaluations,
      assistanceSummary: lessonAssistanceSummary,
      fluencyPracticeSummary: {
        modelReadUsed: fluencyState.modelReadUsed,
        phrasePracticeCompleted: fluencyState.phrasePracticeCompleted,
        completedReadCount: fluencyState.completedReadCount,
        reflection: fluencyState.reflection,
        oralReadingMeasured: false,
        timerUsed: false,
        microphoneUsed: false,
      },
    }),
    [lesson.lessonId, lesson.activityId, lesson.skillId, lesson.difficulty, lesson.lessonRole, questionEvaluations, lessonAssistanceSummary, fluencyState],
  )

  useEffect(() => () => {
    speechService.cancel()
  }, [speechService])

  useEffect(() => {
    speechService.cancel()
  }, [currentIndex, speechService])

  useEffect(() => {
    actionLockedRef.current = false
  }, [currentIndex, step])

  if (!lesson.questions.length || !currentQuestion) {
    return (
      <section className="screen-shell">
        <header className="screen-header">
          <h1>Lesson content is unavailable</h1>
        </header>
        <section className="card">
          <p>This fluency practice could not load the current passage.</p>
        </section>
        <section className="screen-actions">
          <ChildButton type="button" className="primary-action" onClick={onBack}>
            Retry
          </ChildButton>
        </section>
      </section>
    )
  }

  const evidenceSnippets = (() => {
    const evidenceIds = currentQuestion.evidenceReferenceIds
    if (evidenceIds.length === 0) return []
    if (currentQuestion.questionType === 'TABLE_MATCH') {
      return evidenceIds
        .map((id) => {
          const optionText = currentQuestion.rows.flatMap((row) => row.options).find((option) => option.id === id)?.text
          return optionText ? `${id}: ${optionText}` : undefined
        })
        .filter((entry): entry is string => Boolean(entry))
    }
    if (currentQuestion.questionType === 'MULTISELECT' || currentQuestion.questionType === 'MULTIPLE_CHOICE') {
      return currentQuestion.choices.filter((choice) => evidenceIds.includes(choice.id)).map((choice) => choice.text)
    }
    if (currentQuestion.questionType === 'HOT_TEXT') {
      return currentQuestion.segments.filter((segment) => evidenceIds.includes(segment.id)).map((segment) => segment.text)
    }
    if (currentQuestion.questionType === 'EVIDENCE_PAIR') {
      const allChoices = [...currentQuestion.partAChoices, ...currentQuestion.partBChoices]
      return allChoices.filter((choice) => evidenceIds.includes(choice.id)).map((choice) => choice.text)
    }
    return evidenceIds
  })()

  const submissionReady = practiceReady && (() => {
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

  const persistSession = (nextSession: ActiveLessonSession) => {
    const response = onSessionCheckpoint?.(nextSession)
    if (!response || !(response instanceof Promise)) {
      sessionRef.current = response
        ? response.session
        : { ...nextSession, checkpointRevision: getActiveLessonCheckpointRevision(nextSession) + 1 }
      return
    }
    setCheckpointPending(true)
    void response.then((resolved: ActiveSessionCheckpointResponse | void) => {
      sessionRef.current = resolved
        ? resolved.session
        : { ...nextSession, checkpointRevision: getActiveLessonCheckpointRevision(nextSession) + 1 }
    }).finally(() => setCheckpointPending(false))
  }

  const persistDraft = (answer: string | string[] | Record<string, string>) => {
    if (!sessionRef.current) return
    persistSession(checkpointQuestionDraft(
      sessionRef.current,
      currentQuestion.questionId,
      answer,
      new Date().toISOString(),
    ))
  }

  const persistFluencyState = (nextState: typeof fluencyState) => {
    if (checkpointPending) return
    setFluencyState(nextState)
    if (!sessionRef.current) return
    persistSession({
      ...sessionRef.current,
      fluencyPracticeState: nextState,
      updatedAt: new Date().toISOString(),
    })
  }

  const persistAssistanceEvents = (nextEvents: AssistanceEvent[]) => {
    if (!sessionRef.current) return
    persistSession({
      ...sessionRef.current,
      assistanceEvents: nextEvents,
      updatedAt: new Date().toISOString(),
    })
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
    if (checkpointPending) return
    speechService.cancel()
    setSpeechActive(false)
    requestAssistance(target, 1, 'PATTERN_HIGHLIGHT')
  }

  const onRequestSupportLevel = async (level: AssistanceLevel, kind: AssistanceKind) => {
    if (!activeSupportTarget || checkpointPending) return
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

  const startModelRead = async () => {
    if (checkpointPending) return
    const nextState = { ...fluencyState, modelReadUsed: true }
    persistFluencyState(nextState)
    speechService.cancel()
    setSpeechActive(true)
    try {
      await speechService.speakSequence(
        lesson.fluencyPracticeBlock?.phraseGroups.map((phrase) => ({
          text: phrase.text,
          rate: DEFAULT_CONFIG.sentenceRate,
        })) ?? [],
      )
    } finally {
      setSpeechActive(false)
    }
  }

  const markPhrasesPracticed = () => {
    if (checkpointPending) return
    persistFluencyState({ ...fluencyState, phrasePracticeCompleted: true })
  }

  const readPassageAgain = () => {
    if (checkpointPending) return
    const nextCount = Math.min(3, fluencyState.completedReadCount + 1)
    persistFluencyState({ ...fluencyState, completedReadCount: nextCount })
  }

  const updateReflection = (reflection: 'smooth' | 'some_pauses' | 'try_again') => {
    if (checkpointPending) return
    persistFluencyState({ ...fluencyState, reflection })
  }

  const onSubmit = () => {
    if (!submissionReady || actionLockedRef.current || checkpointPending) return
    actionLockedRef.current = true

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
      persistSession(checkpoint)
    }
  }

  const onNext = () => {
    if (actionLockedRef.current || checkpointPending) return
    actionLockedRef.current = true
    speechService.cancel()
    setOpenSupportTargetId(null)
    setSpeechActive(false)

    if (currentIndex + 1 >= lesson.questions.length) {
      if (completionSentRef.current) return
      completionSentRef.current = true
      if (onComplete && sessionRef.current) {
        const completionSession = sessionRef.current
        const completion = onComplete(
          result,
          completionSession.sessionId,
          getActiveLessonCheckpointRevision(completionSession),
        )
        if (completion && typeof (completion as Promise<unknown>).then === 'function') {
          setCheckpointPending(true)
          void completion.finally(() => setCheckpointPending(false))
        }
        return
      }
      onBack()
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
      persistSession(checkpoint)
    }
  }

  const toggleChoice = (choiceId: string) => {
    if (checkpointPending) return
    const next = selectedChoiceIds.includes(choiceId)
      ? selectedChoiceIds.filter((entry) => entry !== choiceId)
      : [...selectedChoiceIds, choiceId]
    setSelectedChoiceIds(next)
    persistDraft(next)
  }

  const toggleSegment = (segmentId: string, allowMultiple: boolean) => {
    if (checkpointPending) return
    if (!allowMultiple) {
      setSelectedSegmentIds([segmentId])
      persistDraft([segmentId])
      return
    }
    const isSelected = selectedSegmentIds.includes(segmentId)
    if (isSelected) {
      const next = selectedSegmentIds.filter((entry) => entry !== segmentId)
      setSelectedSegmentIds(next)
      persistDraft(next)
      return
    }
    const next = [...selectedSegmentIds, segmentId]
    setSelectedSegmentIds(next)
    persistDraft(next)
  }

  const updateMapping = (rowId: string, choiceId: string) => {
    if (checkpointPending) return
    const next = {
      ...selectedMappings,
      [rowId]: choiceId,
    }
    setSelectedMappings(next)
    persistDraft(next)
  }

  return (
    <main className={`screen-shell child-experience lesson-screen question-first-shell world-theme-${lesson.worldId}`} data-appearance="dark" data-world={lesson.worldId}>
      <header className="question-first-header">
        <h1>Rory's Reading Quest</h1>
      </header>
      {storageNotice && <p className="storage-notice" role="status">{storageNotice}</p>}
      <div className="question-first-workspace">
        <section className="question-first-reading" aria-label="Reading and fluency practice">
          {lesson.teachingBlock && (
            <section className="card teaching-block" aria-labelledby="fluency-teaching-block-heading">
              <h2 id="fluency-teaching-block-heading">{lesson.teachingBlock.title}</h2>
              <p>{lesson.teachingBlock.explanation}</p>
              <ul>
                {lesson.teachingBlock.examples.map((example) => <li key={example}>{example}</li>)}
              </ul>
              {lesson.teachingBlock.contrast && <p>{lesson.teachingBlock.contrast}</p>}
              <p>{lesson.teachingBlock.learnerCue}</p>
            </section>
          )}
          <section className="card" aria-labelledby="fluency-preview-heading">
            <h2 id="fluency-preview-heading">Passage Preview</h2>
            <p><strong>Practice goal:</strong> {lesson.fluencyPracticeBlock?.learnerCue ?? 'Read smoothly, listen carefully, and check your understanding.'}</p>
            <p><strong>Passage:</strong> {currentPassageTitle}</p>
            <p><strong>Supported words:</strong> {passageTargets.map((target) => target.surfaceWord).join(', ')}</p>
            <p className="parent-muted-copy">No score. No timer. No microphone.</p>
          </section>

          <section className="card" aria-labelledby="fluency-practice-controls-heading">
            <h2 id="fluency-practice-controls-heading">Practice Steps</h2>
            <section className="parent-section-stack">
              <div className="parent-card-heading-row">
                <h3>Hear a Model Read</h3>
                {speechActive && <span className="parent-muted-copy">Voice is speaking</span>}
              </div>
              <p>Choose this only when you want to hear the passage read aloud. It is optional.</p>
              <section className="screen-actions">
                <ChildButton type="button" onClick={startModelRead} disabled={!speechSupported || speechActive || checkpointPending}>
                  Hear a Model Read
                </ChildButton>
                <ChildButton type="button" onClick={() => {
                  speechService.cancel()
                  setSpeechActive(false)
                }} disabled={!speechActive}>
                  Stop Voice
                </ChildButton>
              </section>
            </section>

            <section className="parent-section-stack">
              <h3>Practice by Phrases</h3>
              <p>Read each phrase group smoothly. The cues can help you pause or show expression.</p>
              <ul className="fluency-phrase-list">
                {(lesson.fluencyPracticeBlock?.phraseGroups ?? []).map((phraseGroup) => (
                  <li key={phraseGroup.phraseId} className="fluency-phrase-row">
                    <span aria-label={phraseGroup.cue ? `${phraseGroup.text}. ${phraseGroup.cue}` : phraseGroup.text}>
                      {phraseGroup.text}
                    </span>
                    {phraseGroup.cue && <span className="parent-muted-copy">{phraseGroup.cue}</span>}
                  </li>
                ))}
              </ul>
              <section className="screen-actions">
                <ChildButton type="button" onClick={markPhrasesPracticed} disabled={checkpointPending}>
                  I Practiced the Phrases
                </ChildButton>
              </section>
            </section>

            <section className="parent-section-stack">
              <h3>Repeated Reading</h3>
              <p>Read the passage again when you are ready. You can do this more than once, up to the practice limit.</p>
              <p>Completed reads: {fluencyState.completedReadCount} / 3</p>
              <section className="screen-actions">
                <ChildButton type="button" onClick={readPassageAgain} disabled={fluencyState.completedReadCount >= 3 || checkpointPending}>
                  {fluencyState.completedReadCount === 0 ? 'Read It Once' : 'Read It Again'}
                </ChildButton>
              </section>
            </section>

            <section className="parent-section-stack">
              <h3>Reflection</h3>
              <p>Choose the one that fits how the reading felt. This is not a score.</p>
              <section className="screen-actions">
                <ChildButton type="button" onClick={() => updateReflection('smooth')} disabled={checkpointPending}>
                  That felt smooth.
                </ChildButton>
                <ChildButton type="button" onClick={() => updateReflection('some_pauses')} disabled={checkpointPending}>
                  I needed a few pauses.
                </ChildButton>
                <ChildButton type="button" onClick={() => updateReflection('try_again')} disabled={checkpointPending}>
                  I want another try.
                </ChildButton>
              </section>
            </section>

            {!practiceReady && (
              <p className="parent-muted-copy" role="status">
                Finish phrase practice, rereading, and reflection to check your answer. Model listening is optional.
              </p>
            )}
          </section>

          <PassageCard
            passageText={currentPassage?.passageText ?? ''}
            wordSupportTargets={passageTargets}
            onOpenWordSupport={onOpenSupport}
            visibleWordSupport
            heading="Reading Passage"
            evidenceSnippets={step === 'feedback' ? evidenceSnippets : []}
          />
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
        </section>
        <section className="card question-first-question" aria-label="Current question">
          <QuestionProgress currentIndex={currentIndex} total={lesson.questions.length} />
          <h2 className="sr-only">Understanding Check</h2>

          {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
            <MultipleChoiceQuestion
              questionId={currentQuestion.questionId}
              questionPrompt={currentQuestion.prompt}
              choices={currentQuestion.choices}
              selectedChoiceId={selectedChoiceId}
              disabled={step !== 'question' || checkpointPending}
              submitted={step === 'feedback'}
              correctChoiceIds={currentQuestion.correctChoiceIds}
              onSelectChoice={(choiceId) => {
                if (checkpointPending) return
                setSelectedChoiceId(choiceId)
                persistDraft(choiceId)
              }}
            />
          )}

          {currentQuestion.questionType === 'MULTISELECT' && (
            <MultiselectQuestion
              questionId={currentQuestion.questionId}
              questionPrompt={currentQuestion.prompt}
              choices={currentQuestion.choices}
              selectedChoiceIds={selectedChoiceIds}
              disabled={step !== 'question' || checkpointPending}
              submitted={step === 'feedback'}
              correctChoiceIds={currentQuestion.correctChoiceIds}
              onToggleChoice={toggleChoice}
            />
          )}

          {currentQuestion.questionType === 'HOT_TEXT' && (
            <HotTextQuestion
              questionPrompt={currentQuestion.prompt}
              allowMultiple={currentQuestion.allowMultiple}
              segments={currentQuestion.segments}
              selectedSegmentIds={selectedSegmentIds}
              disabled={step !== 'question' || checkpointPending}
              submitted={step === 'feedback'}
              correctSegmentIds={currentQuestion.correctSegmentIds}
              onToggleSegment={(segmentId) => toggleSegment(segmentId, currentQuestion.allowMultiple)}
            />
          )}

          {currentQuestion.questionType === 'EVIDENCE_PAIR' && (
            <EvidencePairQuestion
              partAPrompt={(currentQuestion as never as { partAPrompt: string }).partAPrompt}
              partAChoices={(currentQuestion as never as { partAChoices: { id: string; text: string }[] }).partAChoices}
              partBPrompt={(currentQuestion as never as { partBPrompt: string }).partBPrompt}
              partBChoices={(currentQuestion as never as { partBChoices: { id: string; text: string }[] }).partBChoices}
              selectedPartAChoiceId={selectedPartAChoiceId}
              selectedPartBChoiceId={selectedPartBChoiceId}
              disabled={step !== 'question' || checkpointPending}
              submitted={step === 'feedback'}
              partACorrectChoiceId={currentQuestion.partACorrectChoiceId}
              partBCorrectChoiceId={currentQuestion.partBCorrectChoiceId}
              onPartASelect={(choiceId) => {
                if (checkpointPending) return
                setSelectedPartAChoiceId(choiceId)
                persistDraft({ partA: choiceId, partB: selectedPartBChoiceId })
              }}
              onPartBSelect={(choiceId) => {
                if (checkpointPending) return
                setSelectedPartBChoiceId(choiceId)
                persistDraft({ partA: selectedPartAChoiceId, partB: choiceId })
              }}
            />
          )}

          {currentQuestion.questionType === 'TABLE_MATCH' && (
            <TableMatchQuestion
              rows={currentQuestion.rows.map((row) => ({
                id: row.id,
                prompt: row.prompt,
                options: row.options,
                selectedChoiceId: selectedMappings[row.id] ?? '',
                correctChoiceId: row.correctChoiceId,
              }))}
              disabled={step !== 'question' || checkpointPending}
              submitted={step === 'feedback'}
              onSelectChoice={updateMapping}
            />
          )}

          {step === 'question' && (
            <section className="screen-actions question-primary-action" aria-label="Question action">
              <ChildButton
                type="button"
                className="primary-action"
                disabled={!submissionReady || checkpointPending}
                onClick={onSubmit}
              >
                Check Answer
              </ChildButton>
            </section>
          )}

          {step === 'feedback' && pendingFeedback && (
            <>
              <AnswerFeedback isCorrect={pendingFeedback.isCorrect} explanation={pendingFeedback.explanation} />
              <section className="screen-actions question-primary-action" aria-label="Question action">
                <ChildButton type="button" className="primary-action" disabled={checkpointPending} onClick={onNext}>
                  Next
                </ChildButton>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function deriveSupportLevels(events: AssistanceEvent[]): Record<string, AssistanceLevel> {
  return events.reduce<Record<string, AssistanceLevel>>((levels, event) => {
    const current = levels[event.targetId] ?? 0
    levels[event.targetId] = Math.max(current, event.assistanceLevel) as AssistanceLevel
    return levels
  }, {})
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && Object.values(value).every((entry) => typeof entry === 'string')
}
