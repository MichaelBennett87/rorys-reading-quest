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
import { FluencyPracticeScreen } from './FluencyPracticeScreen'
import { WordHelpPanel } from '../components/wordSupport'
import { resolveLessonEvidence } from '../domain/content'
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
import { createSpeechService, createWordSupportSpeechRequest, type SpeechService } from '../services/speech'

type LessonState = 'question' | 'feedback'

interface LessonScreenProps {
  lesson: LessonDefinition
  onBack: () => void
  session?: ActiveLessonSession | null
  onSessionCheckpoint?: (
    session: ActiveLessonSession,
  ) => ActiveSessionCheckpointResponse | void | Promise<ActiveSessionCheckpointResponse | void>
  onComplete?: (result: LessonResult, completionId: string, expectedCheckpointRevision: number) => void | Promise<void>
  storageNotice?: string
}

export function LessonScreen({
  lesson,
  onBack,
  session = null,
  onSessionCheckpoint,
  onComplete,
  storageNotice,
}: LessonScreenProps) {
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

  const [step, setStep] = useState<LessonState>(restoredFeedback ? 'feedback' : 'question')
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

  const sessionRef = useRef<ActiveLessonSession | null>(session)
  const completionSentRef = useRef(false)
  const actionLockedRef = useRef(false)
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
  const showTeachingBlock = lesson.lessonRole === 'GUIDED_PRACTICE' && Boolean(lesson.teachingBlock)
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

  useEffect(() => {
    actionLockedRef.current = false
  }, [currentIndex, step])

  useEffect(() => {
    if (lesson.lessonRole === 'FLUENCY_PRACTICE') {
      return
    }

    let stableScrollY = window.scrollY
    let viewportWidth = window.innerWidth
    let viewportHeight = window.innerHeight
    let zeroScrollTimer: number | null = null
    let firstRestoreFrame: number | null = null
    let secondRestoreFrame: number | null = null
    let restoringViewport = false

    const viewportChanged = () => (
      window.innerWidth !== viewportWidth || window.innerHeight !== viewportHeight
    )

    const clearZeroScrollTimer = () => {
      if (zeroScrollTimer !== null) {
        window.clearTimeout(zeroScrollTimer)
        zeroScrollTimer = null
      }
    }

    const scheduleViewportRestore = () => {
      if (!viewportChanged()) {
        return
      }

      clearZeroScrollTimer()
      restoringViewport = true
      const targetScrollY = stableScrollY

      if (firstRestoreFrame !== null) {
        window.cancelAnimationFrame(firstRestoreFrame)
      }
      if (secondRestoreFrame !== null) {
        window.cancelAnimationFrame(secondRestoreFrame)
      }

      firstRestoreFrame = window.requestAnimationFrame(() => {
        secondRestoreFrame = window.requestAnimationFrame(() => {
          const maximumScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
          if (targetScrollY > 0 && maximumScrollY > 0) {
            window.scrollTo({
              top: Math.min(targetScrollY, maximumScrollY),
              behavior: 'auto',
            })
          }

          viewportWidth = window.innerWidth
          viewportHeight = window.innerHeight
          stableScrollY = window.scrollY
          restoringViewport = false
          firstRestoreFrame = null
          secondRestoreFrame = null
        })
      })
    }

    const handleScroll = () => {
      if (restoringViewport) {
        return
      }
      if (viewportChanged()) {
        scheduleViewportRestore()
        return
      }

      if (window.scrollY > 0) {
        clearZeroScrollTimer()
        stableScrollY = window.scrollY
        return
      }

      clearZeroScrollTimer()
      zeroScrollTimer = window.setTimeout(() => {
        if (!viewportChanged() && !restoringViewport) {
          stableScrollY = 0
        }
        zeroScrollTimer = null
      }, 250)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', scheduleViewportRestore)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', scheduleViewportRestore)
      clearZeroScrollTimer()
      if (firstRestoreFrame !== null) {
        window.cancelAnimationFrame(firstRestoreFrame)
      }
      if (secondRestoreFrame !== null) {
        window.cancelAnimationFrame(secondRestoreFrame)
      }
    }
  }, [currentQuestion?.questionId, lesson.lessonRole, session?.sessionId])

  if (lesson.lessonRole === 'FLUENCY_PRACTICE') {
    return (
      <FluencyPracticeScreen
        lesson={lesson}
        onBack={onBack}
        session={session}
        onSessionCheckpoint={onSessionCheckpoint}
        onComplete={onComplete}
        storageNotice={storageNotice}
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
          <p>We can’t load this reading right now.</p>
        </section>
        <section className="screen-actions">
          <ChildButton type="button" className="primary-action" onClick={onBack}>
            Retry
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
          <p>This reading could not restore its current question safely.</p>
        </section>
        <section className="screen-actions">
          <ChildButton type="button" className="primary-action" onClick={onBack}>
            Retry
          </ChildButton>
        </section>
      </section>
    )
  }

  const currentPassageEvidenceSnippets = currentPassage
    ? evidenceSnippetsByPassageId[currentPassage.passageIdentifier] ?? []
    : []
  const feedbackSubmittedAnswer = step === 'feedback' ? pendingFeedback?.submittedAnswer : null
  const displayedSelectedChoiceId = typeof feedbackSubmittedAnswer === 'string'
    ? feedbackSubmittedAnswer
    : selectedChoiceId
  const displayedSelectedChoiceIds = Array.isArray(feedbackSubmittedAnswer)
    ? feedbackSubmittedAnswer.map(String)
    : selectedChoiceIds
  const displayedSelectedSegmentIds = Array.isArray(feedbackSubmittedAnswer)
    ? feedbackSubmittedAnswer.map(String)
    : selectedSegmentIds
  const feedbackPairAnswer = isStringRecord(feedbackSubmittedAnswer) ? feedbackSubmittedAnswer : null
  const displayedPartAChoiceId = feedbackPairAnswer?.partA ?? selectedPartAChoiceId
  const displayedPartBChoiceId = feedbackPairAnswer?.partB ?? selectedPartBChoiceId
  const displayedMappings = isStringRecord(feedbackSubmittedAnswer) && !('partA' in feedbackSubmittedAnswer)
    ? feedbackSubmittedAnswer
    : selectedMappings

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

  const adoptCheckpointResponse = (
    proposed: ActiveLessonSession,
    response: ActiveSessionCheckpointResponse | void,
  ) => {
    if (!response) {
      sessionRef.current = {
        ...proposed,
        checkpointRevision: getActiveLessonCheckpointRevision(proposed) + 1,
      }
      return
    }
    sessionRef.current = response.session
  }

  const persistSession = (nextSession: ActiveLessonSession) => {
    const response = onSessionCheckpoint?.(nextSession)
    if (!response || !(response instanceof Promise)) {
      adoptCheckpointResponse(nextSession, response as ActiveSessionCheckpointResponse | void)
      return
    }
    setCheckpointPending(true)
    void response.then((resolved: ActiveSessionCheckpointResponse | void) => {
      adoptCheckpointResponse(nextSession, resolved)
    }).finally(() => {
      setCheckpointPending(false)
    })
  }

  const persistAssistanceEvents = (nextEvents: AssistanceEvent[]) => {
    if (!sessionRef.current) return
    const nextSession: ActiveLessonSession = {
      ...sessionRef.current,
      assistanceEvents: nextEvents,
      updatedAt: new Date().toISOString(),
    }
    persistSession(nextSession)
  }

  const persistDraft = (answer: string | string[] | Record<string, string>) => {
    if (!sessionRef.current) return
    const checkpoint = checkpointQuestionDraft(
      sessionRef.current,
      currentQuestion.questionId,
      answer,
      new Date().toISOString(),
    )
    persistSession(checkpoint)
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
        <section className="question-first-reading" aria-label="Reading material">
          {showTeachingBlock && lesson.teachingBlock && (
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
            </section>
          )}
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
              heading={lesson.lessonTitle}
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
        </section>

        <section className="card question-first-question" aria-label="Current question">
          <QuestionProgress currentIndex={currentIndex} total={lesson.questions.length} />
          <h2 className="sr-only">Question area</h2>

          {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
            <MultipleChoiceQuestion
              questionId={currentQuestion.questionId}
              questionPrompt={currentQuestion.prompt}
              choices={currentQuestion.choices}
              selectedChoiceId={displayedSelectedChoiceId}
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
              selectedChoiceIds={displayedSelectedChoiceIds}
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
              selectedSegmentIds={displayedSelectedSegmentIds}
              disabled={step !== 'question' || checkpointPending}
              submitted={step === 'feedback'}
              correctSegmentIds={currentQuestion.correctSegmentIds}
              onToggleSegment={(segmentId) => toggleSegment(segmentId, currentQuestion.allowMultiple)}
            />
          )}

          {currentQuestion.questionType === 'EVIDENCE_PAIR' && (
            <EvidencePairQuestion
              partAPrompt={(currentQuestion as EvidencePairLessonQuestion).partAPrompt}
              partAChoices={(currentQuestion as EvidencePairLessonQuestion).partAChoices}
              partBPrompt={(currentQuestion as EvidencePairLessonQuestion).partBPrompt}
              partBChoices={(currentQuestion as EvidencePairLessonQuestion).partBChoices}
              selectedPartAChoiceId={displayedPartAChoiceId}
              selectedPartBChoiceId={displayedPartBChoiceId}
              disabled={step !== 'question' || checkpointPending}
              submitted={step === 'feedback'}
              partACorrectChoiceId={(currentQuestion as EvidencePairLessonQuestion).partACorrectChoiceId}
              partBCorrectChoiceId={(currentQuestion as EvidencePairLessonQuestion).partBCorrectChoiceId}
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
                selectedChoiceId: displayedMappings[row.id] ?? '',
                correctChoiceId: row.correctChoiceId,
                disabledChoiceIds: tableMatchSelectionMode === 'use_each_once'
                  ? currentQuestion.rows
                      .filter((otherRow) => otherRow.id !== row.id)
                      .map((otherRow) => selectedMappings[otherRow.id] ?? '')
                      .filter((choiceId): choiceId is string => Boolean(choiceId))
                  : [],
              }))}
              disabled={step !== 'question' || checkpointPending}
              submitted={step === 'feedback'}
              selectionMode={tableMatchSelectionMode}
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
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value as Record<string, unknown>).every((entry) => typeof entry === 'string')
}
