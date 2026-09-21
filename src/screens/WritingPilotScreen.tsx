import { useEffect, useRef, useState } from 'react'
import { getWritingPilotActivity, getWritingPilotPassage, type InkStroke, type WritingPilotActivity, type WritingResponseRecord } from '../domain/writingPilot'
import type { WritingPilotController } from '../app/useWritingPilot'
import { WritingPad } from '../components/writing/WritingPad'
import { renderInkToDataUrl } from '../components/writing/writingInkCanvas'
import '../styles/writing-pilot.css'

interface WritingPilotScreenProps {
  controller: WritingPilotController
  onFinished: () => void
}

export function WritingPilotScreen({ controller, onFinished }: WritingPilotScreenProps) {
  const record = controller.pendingRecord
  const activity = record ? getWritingPilotActivity(record.activityId) : null
  const passage = activity ? getWritingPilotPassage(activity) : null
  if (!record || !activity || !passage) {
    return (
      <main className="writing-pilot-shell">
        <section className="writing-card"><h1>Writing saved</h1><p>The reading journey can continue.</p><button className="writing-primary" type="button" onClick={onFinished}>Next</button></section>
      </main>
    )
  }
  return <WritingPilotRecordScreen key={`${record.recordId}:${record.status}`} controller={controller} onFinished={onFinished} record={record} activity={activity} passage={passage} />
}

function WritingPilotRecordScreen({
  controller,
  onFinished,
  record,
  activity,
  passage,
}: WritingPilotScreenProps & {
  record: WritingResponseRecord
  activity: WritingPilotActivity
  passage: NonNullable<ReturnType<typeof getWritingPilotPassage>>
}) {
  const [strokes, setStrokes] = useState<InkStroke[]>(record?.strokes ?? [])
  const [typedDraft, setTypedDraft] = useState(record?.typedDraft ?? '')
  const [transcription, setTranscription] = useState(record?.confirmedTranscription ?? record?.rawTranscription ?? '')
  const [inputMode, setInputMode] = useState<WritingResponseRecord['inputMode']>(record?.inputMode ?? 'handwriting')
  const [busy, setBusy] = useState(false)
  const actionPendingRef = useRef(false)
  const saveDraft = controller.saveDraft
  const recordId = record.recordId
  const recordStatus = record.status

  useEffect(() => {
    if (recordStatus !== 'draft') return
    const timer = window.setTimeout(() => {
      void saveDraft(recordId, strokes, typedDraft, inputMode)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [inputMode, recordId, recordStatus, saveDraft, strokes, typedDraft])

  const visiblePassage = extractPassage(passage)

  const pending = record.status === 'recognition_pending' || record.status === 'evaluation_pending'
  const readyToCheck = typedDraft.trim().length > 0 || strokes.length > 0
  const feedbackVisible = record.status === 'feedback_ready' || record.status === 'parent_review_needed'

  const handlePrimary = async () => {
    if (actionPendingRef.current || busy || pending) return
    actionPendingRef.current = true
    setBusy(true)
    try {
      if (record.status === 'draft') {
        const saved = await controller.saveDraft(record.recordId, strokes, typedDraft, inputMode)
        if (!saved) return
        const image = typedDraft.trim() ? null : renderInkToDataUrl(strokes)
        await controller.checkWriting(record.recordId, image, { width: 1024, height: 480 })
        return
      }
      if (record.status === 'transcription_ready') {
        await controller.confirmTranscription(record.recordId, transcription)
        return
      }
      if (feedbackVisible) {
        if (await controller.finish(record.recordId)) onFinished()
      }
    } finally {
      actionPendingRef.current = false
      setBusy(false)
    }
  }

  return (
    <main className="writing-pilot-shell" data-record-status={record.status}>
      <section className="writing-reading-card" aria-labelledby="writing-source-title">
        <p className="writing-eyebrow">Read &amp; Write</p>
        <h1 id="writing-source-title">{visiblePassage.title}</h1>
        <div className="writing-passage-text">
          {visiblePassage.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}
        </div>
      </section>

      <section className="writing-card" aria-labelledby="writing-prompt">
        <p className="writing-eyebrow">One-sentence response</p>
        <h2 id="writing-prompt">{activity.prompt}</h2>

        {record.status === 'draft' && (
          <>
            <WritingPad strokes={strokes} onChange={(next) => { setInputMode(typedDraft ? 'mixed' : 'handwriting'); setStrokes(next) }} disabled={busy} />
            <details className="writing-text-alternative">
              <summary>Use a keyboard instead</summary>
              <label htmlFor="writing-typed-response">Type exactly what you want to say</label>
              <textarea
                id="writing-typed-response"
                value={typedDraft}
                maxLength={500}
                rows={4}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => { setTypedDraft(event.target.value); setInputMode(strokes.length ? 'mixed' : 'typed') }}
              />
              <p className="writing-note">Keyboard suggestions can change text, so typed spelling is not treated as untouched handwriting evidence.</p>
            </details>
          </>
        )}

        {record.status === 'transcription_ready' && (
          <div className="writing-transcription" aria-live="polite">
            <h3>Is this what you wrote?</h3>
            <textarea value={transcription} maxLength={500} rows={4} spellCheck={false} onChange={(event) => setTranscription(event.target.value)} />
            {record.recognitionUncertainties.length > 0 && <p className="writing-caution">Some writing was unclear. Please correct it before continuing.</p>}
            <button type="button" className="writing-secondary" onClick={() => void controller.rewrite(record.recordId)} disabled={busy}>Rewrite</button>
          </div>
        )}

        {feedbackVisible && (
          <div className="writing-feedback" aria-live="polite">
            {record.feedback ? <Feedback record={record} /> : (
              <>
                <h3>Your writing is saved</h3>
                <p>{record.failureReason ?? 'A grown-up can review the handwriting and response in Parent Area.'}</p>
                <p>This is not marked wrong. Your reading journey can continue.</p>
              </>
            )}
          </div>
        )}

        {pending && <p className="writing-caution" role="status">Checking the saved writing...</p>}
        {controller.technicalDetail && <p className="writing-caution" role="status">The writing could not be saved yet. Please ask a grown-up for help.</p>}

        <button
          type="button"
          className="writing-primary"
          disabled={busy || pending || (record.status === 'draft' && !readyToCheck) || (record.status === 'transcription_ready' && !transcription.trim())}
          onClick={() => void handlePrimary()}
        >
          {record.status === 'draft' ? 'Check Writing' : record.status === 'transcription_ready' ? "That's What I Wrote" : pending ? 'Checking...' : 'Next'}
        </button>
      </section>
    </main>
  )
}

function Feedback({ record }: { record: WritingResponseRecord }) {
  const feedback = record.feedback
  if (!feedback) return null
  return (
    <>
      <h3>{feedback.understood}</h3>
      <FeedbackLine label="Understanding" message={feedback.comprehension.message} />
      <FeedbackLine label="Story detail" message={feedback.supportingEvidence.message} />
      <FeedbackLine label="Spelling" message={record.spellingAssessmentSupportable ? feedback.spelling.message : 'A spelling judgment was withheld because the transcription was corrected or uncertain.'} />
      <FeedbackLine label="Grammar" message={feedback.grammar.message} />
      <FeedbackLine label="Capitalization and punctuation" message={feedback.capitalizationPunctuation.message} />
      {feedback.improvements.slice(0, 2).map((improvement) => (
        <p key={improvement.suggestionId}><strong>Try this:</strong> {improvement.explanation}</p>
      ))}
      {feedback.parentReviewRequired && <p className="writing-caution">A grown-up should review this feedback.</p>}
    </>
  )
}

function FeedbackLine({ label, message }: { label: string; message: string }) {
  return <p><strong>{label}:</strong> {message}</p>
}

function extractPassage(passage: unknown): { title: string; paragraphs: string[] } {
  const value = passage as Record<string, unknown>
  const title = firstString(value, ['title', 'passageTitle', 'heading']) ?? 'Reading passage'
  const paragraphs = collectVisibleText(value)
    .filter((text) => text !== title && text.length > 20)
  return { title, paragraphs: paragraphs.length ? paragraphs : ['The saved reading passage is available in the lesson.'] }
}

function collectVisibleText(value: unknown, key = ''): string[] {
  if (typeof value === 'string') return ['text', 'paragraph', 'content', 'lines', 'caption'].some((part) => key.toLowerCase().includes(part)) ? [value] : []
  if (Array.isArray(value)) return value.flatMap((entry) => collectVisibleText(entry, key))
  if (!value || typeof value !== 'object') return []
  return Object.entries(value as Record<string, unknown>).flatMap(([childKey, childValue]) => collectVisibleText(childValue, childKey))
}

function firstString(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) if (typeof value[key] === 'string') return value[key] as string
  return null
}
