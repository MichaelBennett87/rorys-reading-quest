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
  checkpointSubmittedQuestion,
  restoreLessonEvaluations,
  type ActiveLessonSession,
} from '../persistence'
import { starsForAccuracy, xpForLesson } from '../persistence/completeQuestProgress'
import { DEFAULT_CONFIG, createSpeechService, createWordSupportSpeechRequest, type SpeechService } from '../services/speech'

type FluencyStep = 'question' | 'feedback' | 'results'

interface FluencyPracticeScreenProps {
  lesson: LessonDefinition
  onBack: () => void
  session?: ActiveLessonSession | null
  onSessionCheckpoint?: (session: ActiveLessonSession) => void
  onComplete?: (result: LessonResult, completionId: string) => void
}

export function FluencyPracticeScreen({
  lesson,
  onBack,
  session = null,
  onSessionCheckpoint,
  onComplete,
}: FluencyPracticeScreenProps) {
  const restoredEvaluations = useMemo(
    () => restoreLessonEvaluations(lesson, session),
    [lesson, session],
  )
  const restoredIndex = Math.min(session?.currentQuestionIndex ?? 0, Math.max(0, lesson.questions.length - 1))
  const restoredFeedback = restoredEvaluations.find(
    (evaluation) => evaluation.questionId === lesson.questions[restoredIndex]?.questionId,
  ) ?? null

  const [step, setStep] = useState<FluencyStep>(restoredFeedback ? 'feedback' : 'question')
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
    lesson.fluencyPracticeBlock?.practiceMode === 'independent'
      || Boolean(session?.fluencyPracticeState?.modelReadUsed
        || session?.fluencyPracticeState?.phrasePracticeCompleted
        || session?.fluencyPracticeState?.completedReadCount
        || session?.fluencyPracticeState?.reflection)
      || (session?.submittedQuestions.length ?? 0) > 0,
  )
  const [questionsStarted, setQuestionsStarted] = useState((session?.submittedQuestions.length ?? 0) > 0)
  const [fluencyState, setFluencyState] = useState(() => session?.fluencyPracticeState ?? {
    modelReadUsed: false,
    phrasePracticeCompleted: false,
    completedReadCount: 0,
    reflection: null,
  })

  const sessionRef = useRef<ActiveLessonSession | null>(session)
  const completionSentRef = useRef(false)
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
    speechService.cancel()
  }, [questionsStarted, speechService])

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
            Return to Unit
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

  const persistSession = (nextSession: ActiveLessonSession) => {
    sessionRef.current = nextSession
    onSessionCheckpoint?.(nextSession)
  }

  const persistFluencyState = (nextState: typeof fluencyState) => {
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

  const startModelRead = async () => {
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
    persistFluencyState({ ...fluencyState, phrasePracticeCompleted: true })
  }

  const readPassageAgain = () => {
    const nextCount = Math.min(3, fluencyState.completedReadCount + 1)
    persistFluencyState({ ...fluencyState, completedReadCount: nextCount })
  }

  const updateReflection = (reflection: 'smooth' | 'some_pauses' | 'try_again') => {
    persistFluencyState({ ...fluencyState, reflection })
  }

  const exitQuest = () => {
    speechService.cancel()
    setSpeechActive(false)
    onBack()
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
      persistSession(checkpoint)
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
        persistSession(checkpoint)
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
      persistSession(checkpoint)
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

  const shouldShowQuestionFlow = questionsStarted || (session?.submittedQuestions.length ?? 0) > 0

  return (
    <section className="screen-shell">
      <header className="screen-header">
        <h1>{lesson.lessonTitle}</h1>
        <p>{lesson.lessonObjective}</p>
        <p className="parent-muted-copy">Fluency Flight supports practice only. The app does not record or score oral reading.</p>
      </header>

      {!practiceStarted && lesson.teachingBlock ? (
        <section className="card teaching-block" aria-labelledby="fluency-teaching-block-heading">
          <h2 id="fluency-teaching-block-heading">{lesson.teachingBlock.title}</h2>
          <p>{lesson.teachingBlock.explanation}</p>
          <ul>
            {lesson.teachingBlock.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
          {lesson.teachingBlock.contrast && <p>{lesson.teachingBlock.contrast}</p>}
          <p>{lesson.teachingBlock.learnerCue}</p>
          <section className="screen-actions">
            <ChildButton type="button" className="primary-action" onClick={() => setPracticeStarted(true)}>
              Start Practice
            </ChildButton>
            <ChildButton type="button" onClick={exitQuest}>
              Save and Exit
            </ChildButton>
          </section>
        </section>
      ) : null}

      {practiceStarted && (
        <>
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
                <ChildButton type="button" className="primary-action" onClick={startModelRead} disabled={!speechSupported || speechActive}>
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
                <ChildButton type="button" className="primary-action" onClick={markPhrasesPracticed}>
                  I Practiced the Phrases
                </ChildButton>
              </section>
            </section>

            <section className="parent-section-stack">
              <h3>Repeated Reading</h3>
              <p>Read the passage again when you are ready. You can do this more than once, up to the practice limit.</p>
              <p>Completed reads: {fluencyState.completedReadCount} / 3</p>
              <section className="screen-actions">
                <ChildButton type="button" onClick={readPassageAgain} disabled={fluencyState.completedReadCount >= 3}>
                  {fluencyState.completedReadCount === 0 ? 'Read It Once' : 'Read It Again'}
                </ChildButton>
              </section>
            </section>

            <section className="parent-section-stack">
              <h3>Reflection</h3>
              <p>Choose the one that fits how the reading felt. This is not a score.</p>
              <section className="screen-actions">
                <ChildButton type="button" onClick={() => updateReflection('smooth')}>
                  That felt smooth.
                </ChildButton>
                <ChildButton type="button" onClick={() => updateReflection('some_pauses')}>
                  I needed a few pauses.
                </ChildButton>
                <ChildButton type="button" onClick={() => updateReflection('try_again')}>
                  I want another try.
                </ChildButton>
              </section>
            </section>

            <section className="parent-section-stack">
              <div className="parent-card-heading-row">
                <h3>Understanding Check</h3>
                <span className="parent-muted-copy">These questions check what you noticed in the passage. They are not a speaking score.</span>
              </div>
              <p>When your practice steps are ready, start the understanding check.</p>
              <section className="screen-actions">
                <ChildButton
                  type="button"
                  className="primary-action"
                  onClick={() => setQuestionsStarted(true)}
                  disabled={!practiceReady}
                >
                  Start Understanding Check
                </ChildButton>
              </section>
              {!practiceReady && (
                <p className="parent-muted-copy">
                  Finish phrase practice, rereading, and reflection to unlock the questions. Model listening is optional.
                </p>
              )}
            </section>
          </section>

          <PassageCard
            passageText={currentPassage?.passageText ?? ''}
            wordSupportTargets={passageTargets}
            onOpenWordSupport={onOpenSupport}
            visibleWordSupport={practiceStarted}
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
        </>
      )}

      {step === 'results' && (
        <section className="card lesson-results" aria-labelledby="fluency-complete-heading">
          <h2 id="fluency-complete-heading">Nice Fluency Practice!</h2>
          <p>You practiced smooth, meaningful reading with a fresh passage.</p>
          <p><strong>Practice rewards:</strong> {xpForLesson(result)} XP and {starsForAccuracy(result.accuracy)} stars</p>
          <p><strong>Understanding-check accuracy:</strong> {Math.round(result.accuracy)}%</p>
          <p><strong>Model read used:</strong> {fluencyState.modelReadUsed ? 'Yes' : 'No'}</p>
          <p><strong>Phrase practice completed:</strong> {fluencyState.phrasePracticeCompleted ? 'Yes' : 'No'}</p>
          <p><strong>Completed reads:</strong> {fluencyState.completedReadCount}</p>
          <p><strong>Reflection:</strong> {fluencyState.reflection ?? 'Not set'}</p>
          <p>This session supported modeled reading, phrase grouping, rereading, and self-monitoring. The app did not record or score oral reading.</p>
              <section className="screen-actions">
                <ChildButton type="button" className="primary-action" onClick={continueFromResults}>
                  Continue Quest
                </ChildButton>
              </section>
        </section>
      )}

      {shouldShowQuestionFlow && step !== 'results' && (
        <section className="card">
          <QuestionProgress currentIndex={currentIndex} total={lesson.questions.length} />
          <h2 className="sr-only">Understanding Check</h2>

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
              partAPrompt={(currentQuestion as never as { partAPrompt: string }).partAPrompt}
              partAChoices={(currentQuestion as never as { partAChoices: { id: string; text: string }[] }).partAChoices}
              partBPrompt={(currentQuestion as never as { partBPrompt: string }).partBPrompt}
              partBChoices={(currentQuestion as never as { partBChoices: { id: string; text: string }[] }).partBChoices}
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
              <ChildButton type="button" onClick={exitQuest}>
                Save and Exit
              </ChildButton>
            </section>
          )}

          {step === 'feedback' && pendingFeedback && (
            <>
              <AnswerFeedback isCorrect={pendingFeedback.isCorrect} explanation={pendingFeedback.explanation} />
              <section className="screen-actions">
                <ChildButton type="button" className="primary-action" onClick={onNext}>
                  {currentIndex + 1 >= lesson.questions.length ? 'See Flight Complete' : 'Next Question'}
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
