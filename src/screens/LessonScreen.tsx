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
import { InformationalTextCard } from '../components/lesson/InformationalTextCard'
import { PassageCard } from '../components/lesson/PassageCard'
import { PoemCard } from '../components/lesson/PoemCard'
import { LessonResults } from '../components/lesson/LessonResults'
import { FluencyPracticeScreen } from './FluencyPracticeScreen'
import { WordHelpPanel } from '../components/wordSupport'
import { resolvePassageEvidence } from '../domain/content'
import {
  advanceActiveLessonSession,
  checkpointSubmittedQuestion,
  restoreLessonEvaluations,
  type ActiveLessonSession,
} from '../persistence'
import { DEFAULT_CONFIG, createSpeechService, type SpeechService, type SpeakStep } from '../services/speech'

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
  const currentPassage = currentQuestion
    ? sampleContent.passages.find((passage) => passage.passageIdentifier === currentQuestion.passageId) ?? null
    : null
  const passageTargets = currentPassage?.wordSupportTargets ?? []
  const activeSupportTarget = openSupportTargetId
    ? passageTargets.find((target) => target.targetId === openSupportTargetId) ?? null
    : null
  const speechSupported = speechService.isSupported()
  const lessonAssistanceSummary = useMemo(() => summarizeAssistance(assistanceEvents), [assistanceEvents])
  const supportLevels = useMemo(() => deriveSupportLevels(assistanceEvents), [assistanceEvents])
  const showTeachingBlock =
    lesson.lessonRole === 'GUIDED_PRACTICE' &&
    !practiceStarted &&
    (session?.submittedQuestions.length ?? 0) === 0 &&
    Boolean(lesson.teachingBlock)
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

  const evidenceSnippets = (() => {
    const evidenceIds = currentQuestion.evidenceReferenceIds
    if (evidenceIds.length === 0) {
      return []
    }
    const sentenceLookup = new Map(
      currentPassage?.sentences?.map((sentence) => [sentence.sentenceId, sentence.text] as const) ?? [],
    )
    return evidenceIds
      .map((id) => {
        const resolved = currentPassage ? resolvePassageEvidence(currentPassage, id) : undefined
        if (resolved) {
          return resolved.label && resolved.label !== resolved.text ? `${resolved.label}: ${resolved.text}` : resolved.text
        }
        if (currentQuestion.questionType === 'TABLE_MATCH') {
          const optionText = currentQuestion.rows
            .flatMap((row) => row.options)
            .find((option) => option.id === id)?.text
          const sentenceText = sentenceLookup.get(id)
          return optionText ? `${id}: ${optionText}` : sentenceText ? `${id}: ${sentenceText}` : undefined
        }
        if (currentQuestion.questionType === 'MULTISELECT' || currentQuestion.questionType === 'MULTIPLE_CHOICE') {
          const choiceText = currentQuestion.choices.find((choice) => choice.id === id)?.text
          const sentenceText = sentenceLookup.get(id)
          return choiceText ?? sentenceText ?? undefined
        }
        if (currentQuestion.questionType === 'HOT_TEXT') {
          const segmentText = currentQuestion.segments.find((segment) => segment.id === id)?.text
          const sentenceText = sentenceLookup.get(id)
          return segmentText ?? sentenceText ?? undefined
        }
        if (currentQuestion.questionType === 'EVIDENCE_PAIR') {
          const allChoices = [...currentQuestion.partAChoices, ...currentQuestion.partBChoices]
          const choiceText = allChoices.find((choice) => choice.id === id)?.text
          const sentenceText = sentenceLookup.get(id)
          return choiceText ?? sentenceText ?? undefined
        }
        const sentenceText = sentenceLookup.get(id)
        return sentenceText ? `${id}: ${sentenceText}` : id
      })
      .filter((entry): entry is string => Boolean(entry))
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
    const speak = createSpeechRequest(target, level, speechService)
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
          {currentPassage?.contentKind === 'poem' && currentPassage.poemStructure ? (
            <PoemCard
              poemText={currentPassage.passageText}
              poemStructure={currentPassage.poemStructure}
              wordSupportTargets={passageTargets}
              onOpenWordSupport={onOpenSupport}
              visibleWordSupport
              heading="Reading Poem"
              evidenceSnippets={step === 'feedback' ? evidenceSnippets : []}
            />
          ) : currentPassage?.contentKind === 'informational' && currentPassage.informationalStructure ? (
            <InformationalTextCard
              passage={currentPassage}
              wordSupportTargets={passageTargets}
              onOpenWordSupport={onOpenSupport}
              visibleWordSupport
              heading="Reading Passage"
              evidenceSnippets={step === 'feedback' ? evidenceSnippets : []}
            />
          ) : (
            <PassageCard
              passageText={currentPassage?.passageText ?? ''}
              wordSupportTargets={passageTargets}
              onOpenWordSupport={onOpenSupport}
              visibleWordSupport
              heading="Reading Passage"
              evidenceSnippets={step === 'feedback' ? evidenceSnippets : []}
            />
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

function deriveSupportLevels(events: AssistanceEvent[]): Record<string, AssistanceLevel> {
  return events.reduce<Record<string, AssistanceLevel>>((levels, event) => {
    const current = levels[event.targetId] ?? 0
    levels[event.targetId] = Math.max(current, event.assistanceLevel) as AssistanceLevel
    return levels
  }, {})
}

function createSpeechRequest(
  target: WordSupportTarget,
  level: AssistanceLevel,
  speechService: SpeechService,
): (() => Promise<void>) | null {
  const speakSequence = () => speechService.speakSequence(target.spokenChunks.map((chunk): SpeakStep => ({
    text: chunk.speechText,
    rate: DEFAULT_CONFIG.chunkSequenceRate,
  })))

  const requests: Record<AssistanceLevel, (() => Promise<void>) | null> = {
    1: null,
    2: null,
    3: speakSequence,
    4: () => speechService.speakText(target.blendSpeechText, { rate: DEFAULT_CONFIG.blendRate }),
    5: () => speechService.speakText(target.wholeWordSpeechText, { rate: DEFAULT_CONFIG.wordRate }),
    6: () => speechService.speakText(target.sentenceSpeechText, { rate: DEFAULT_CONFIG.sentenceRate }),
  }

  return requests[level]
}
