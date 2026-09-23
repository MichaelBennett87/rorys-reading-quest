import { useState } from 'react'
import type { WritingPilotController } from '../../app/useWritingPilot'
import {
  getWritingPilotActivity,
  WRITING_PILOT_RECORD_LIMIT,
  WRITING_PILOT_RETENTION_DAYS,
  type WritingParentJudgment,
  type WritingParentReviewReason,
  type WritingResponseRecord,
} from '../../domain/writingPilot'
import { InkPreview } from '../../components/writing/WritingPad'
import '../../styles/writing-pilot.css'

export function WritingReviewView({ controller }: { controller: WritingPilotController }) {
  const [activationCode, setActivationCode] = useState('')
  const [message, setMessage] = useState('')
  const settings = controller.state.settings
  const pendingCount = controller.state.records.filter((record) => record.parentReviewReason && !record.parentReviewedAt).length
  const records = [...controller.state.records].sort(parentReviewOrder)
  const activate = async () => {
    const result = await controller.authorizeExternal(activationCode)
    setActivationCode('')
    setMessage(result.message)
  }

  return (
    <section className="parent-writing-review" aria-labelledby="writing-review-title">
      <header>
        <p className="parent-dashboard__eyebrow">Private pilot</p>
        <h2 id="writing-review-title">Writing Review</h2>
        <p>Read &amp; Write is supplemental practice. It never changes reading mastery, reviews, XP, or stars.</p>
        <p className="parent-writing-count" role="status"><strong>{pendingCount}</strong> {pendingCount === 1 ? 'response needs' : 'responses need'} a grown-up review.</p>
      </header>

      <article className="parent-dashboard__card parent-writing-consent">
        <h3>Parent enablement and notice</h3>
        <p>When free protected processing is activated, cropped handwriting and confirmed response text leave this browser for transcription and bounded feedback through Cloudflare Workers AI. The processor receives only the selected passage task, not the learner's progress history, PIN, assessments, name, school, or address.</p>
        <p>Writing stays only in this browser for up to {WRITING_PILOT_RETENTION_DAYS} days, with at most {WRITING_PILOT_RECORD_LIMIT} records. Cloudflare processing can be unavailable or mistaken; the response then stays here for local parent review.</p>
        <p>No email, phone alert, cloud inbox, or cross-device copy is created. You can disable external processing or delete saved writing below.</p>
        <p>Enabling here supports this parent-provisioned private pilot; it is not anonymous public child onboarding or a general legal-consent system.</p>
        {!settings.enabled ? (
          <button type="button" onClick={() => void controller.enablePilot()}>I understand - enable local Read &amp; Write</button>
        ) : (
          <button type="button" onClick={() => void controller.disablePilot()}>Disable Read &amp; Write</button>
        )}
      </article>

      {settings.enabled && (
        <article className="parent-dashboard__card">
          <h3>Free protected processing</h3>
          {settings.externalProcessingEnabled && settings.serviceAuthority ? (
            <>
              <p><strong>Authorized installation:</strong> {settings.serviceAuthority.installationId}</p>
              <p><strong>Provider:</strong> Cloudflare Workers AI direct binding</p>
              <p><strong>Model:</strong> {settings.serviceAuthority.model}</p>
              <p><strong>Application allowance:</strong> {settings.serviceAuthority.dailyApplicationNeuronsRemaining.toLocaleString()} of {settings.serviceAuthority.dailyApplicationNeuronLimit.toLocaleString()} estimated neurons remaining at activation</p>
              <p><strong>Provider reset:</strong> {new Date(settings.serviceAuthority.quotaResetsAt).toLocaleString()} (00:00 UTC boundary)</p>
              <p><strong>Paid spending allowed:</strong> $0</p>
              {settings.quotaPauseUntil && <p><strong>Automatic checking paused until:</strong> {new Date(settings.quotaPauseUntil).toLocaleString()}</p>}
              <button type="button" onClick={() => void controller.disableExternal()}>Disable external processing</button>
            </>
          ) : (
            <>
              <p>External transcription and AI feedback remain off until a reviewed free-only Worker issues a one-time parent-provisioned activation code. Local writing and parent review still work.</p>
              <label htmlFor="writing-activation-code">Private activation code</label>
              <input id="writing-activation-code" type="password" autoComplete="off" value={activationCode} onChange={(event) => setActivationCode(event.target.value)} />
              <button type="button" disabled={!activationCode.trim()} onClick={() => void activate()}>Authorize protected processing</button>
            </>
          )}
          {message && <p role="status">{message}</p>}
        </article>
      )}

      {pendingCount >= WRITING_PILOT_RECORD_LIMIT && (
        <p className="writing-caution" role="status">The local review queue is full. New supplemental writing pauses while ordinary reading continues.</p>
      )}

      <div className="parent-writing-records">
        {records.length === 0 && <p>No writing responses are saved on this browser.</p>}
        {records.map((record) => {
          const activity = getWritingPilotActivity(record.activityId)
          return (
            <article key={record.recordId} className="parent-dashboard__card parent-writing-record">
              <header>
                <h3>{activity?.title ?? 'Read & Write response'}</h3>
                <p>{activity?.prompt}</p>
                <p><strong>Status:</strong> {record.status.replaceAll('_', ' ')} · <strong>Source version:</strong> {record.sourceContentVersion}</p>
                <p><strong>Review reason:</strong> {reviewReasonLabel(record.parentReviewReason)}</p>
                <p><strong>Local retention:</strong> expires {new Date(record.expiresAt).toLocaleString()}</p>
              </header>
              <InkPreview strokes={record.strokes} />
              <p><strong>Raw machine transcription:</strong> {record.rawTranscription ?? 'Not available'}</p>
              <ParentCorrection recordId={record.recordId} initial={record.confirmedTranscription ?? record.rawTranscription ?? ''} onSave={controller.correctTranscription} />
              {record.recognitionUncertainties.length > 0 && (
                <div><strong>Recognition uncertainty:</strong>{record.recognitionUncertainties.map((entry, index) => <p key={index}>{entry.text}: {entry.reason}</p>)}</div>
              )}
              {record.feedback ? (
                <div className="parent-writing-feedback">
                  <p><strong>Understanding:</strong> {record.feedback.comprehension.message}</p>
                  <p><strong>Evidence:</strong> {record.feedback.supportingEvidence.message}</p>
                  <p><strong>Spelling:</strong> {record.spellingAssessmentSupportable ? record.feedback.spelling.message : 'Withheld after transcription correction or uncertainty.'}</p>
                  <p><strong>Grammar:</strong> {record.feedback.grammar.message}</p>
                  <p><strong>Capitalization/punctuation:</strong> {record.feedback.capitalizationPunctuation.message}</p>
                  {record.feedback.improvements.map((suggestion) => (
                    <div key={suggestion.suggestionId} className="parent-writing-suggestion">
                      <p>{suggestion.explanation}</p>
                      <button type="button" onClick={() => void controller.setSuggestionDisposition(record.recordId, suggestion.suggestionId, 'accepted')}>Accept</button>
                      <button type="button" onClick={() => void controller.setSuggestionDisposition(record.recordId, suggestion.suggestionId, 'dismissed')}>Dismiss</button>
                      <span>{record.suggestionDispositions[suggestion.suggestionId]}</span>
                    </div>
                  ))}
                </div>
              ) : <p>No AI feedback is stored. Parent review can continue without an external request.</p>}
              <ParentJudgmentForm record={record} onSave={controller.recordParentJudgment} />
              <p><strong>Provenance:</strong> {provenanceLabel(record)}</p>
              <div className="parent-writing-actions">
                <button type="button" onClick={() => void controller.markReviewed(record.recordId)}>Mark reviewed</button>
                <button type="button" onClick={() => void controller.deleteRecord(record.recordId)}>Delete response</button>
              </div>
            </article>
          )
        })}
      </div>
      {records.length > 0 && <button type="button" className="parent-writing-delete-all" onClick={() => void controller.deleteAllRecords()}>Delete all saved writing</button>}
    </section>
  )
}

function ParentCorrection({ recordId, initial, onSave }: { recordId: string; initial: string; onSave: (recordId: string, text: string) => Promise<boolean> }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="parent-writing-correction">
      <label htmlFor={`parent-transcription-${recordId}`}>Confirmed or parent-corrected transcription</label>
      <textarea id={`parent-transcription-${recordId}`} rows={3} maxLength={500} value={value} onChange={(event) => setValue(event.target.value)} />
      <button type="button" disabled={!value.trim()} onClick={() => void onSave(recordId, value)}>Save parent correction</button>
    </div>
  )
}

function ParentJudgmentForm({ record, onSave }: {
  record: WritingResponseRecord
  onSave: (recordId: string, judgment: Omit<WritingParentJudgment, 'recordedAt'>) => Promise<boolean>
}) {
  const existing = record.parentJudgment
  const [comprehension, setComprehension] = useState<WritingParentJudgment['comprehension']>(existing?.comprehension ?? 'not_recorded')
  const [spellingObservations, setSpellingObservations] = useState(existing?.spellingObservations ?? '')
  const [grammarPunctuationObservations, setGrammarPunctuationObservations] = useState(existing?.grammarPunctuationObservations ?? '')
  const [correction, setCorrection] = useState(existing?.correction ?? '')
  return (
    <fieldset className="parent-writing-judgment">
      <legend>Parent advisory review</legend>
      <label htmlFor={`parent-comprehension-${record.recordId}`}>Comprehension</label>
      <select id={`parent-comprehension-${record.recordId}`} value={comprehension} onChange={(event) => setComprehension(event.target.value as WritingParentJudgment['comprehension'])}>
        <option value="not_recorded">Not recorded</option>
        <option value="meets">Understood the passage</option>
        <option value="partly_meets">Partly understood</option>
        <option value="needs_support">Needs support</option>
      </select>
      <label htmlFor={`parent-spelling-${record.recordId}`}>Spelling observations</label>
      <textarea id={`parent-spelling-${record.recordId}`} rows={2} maxLength={500} value={spellingObservations} onChange={(event) => setSpellingObservations(event.target.value)} />
      <label htmlFor={`parent-grammar-${record.recordId}`}>Grammar and punctuation observations</label>
      <textarea id={`parent-grammar-${record.recordId}`} rows={2} maxLength={500} value={grammarPunctuationObservations} onChange={(event) => setGrammarPunctuationObservations(event.target.value)} />
      <label htmlFor={`parent-correction-${record.recordId}`}>Optional brief correction</label>
      <textarea id={`parent-correction-${record.recordId}`} rows={2} maxLength={500} value={correction} onChange={(event) => setCorrection(event.target.value)} />
      <button type="button" onClick={() => void onSave(record.recordId, { comprehension, spellingObservations, grammarPunctuationObservations, correction })}>Save parent review</button>
    </fieldset>
  )
}

function parentReviewOrder(left: WritingResponseRecord, right: WritingResponseRecord): number {
  const leftPending = Boolean(left.parentReviewReason && !left.parentReviewedAt)
  const rightPending = Boolean(right.parentReviewReason && !right.parentReviewedAt)
  if (leftPending !== rightPending) return leftPending ? -1 : 1
  return leftPending ? left.createdAt.localeCompare(right.createdAt) : right.updatedAt.localeCompare(left.updatedAt)
}

function reviewReasonLabel(reason: WritingParentReviewReason | null | undefined): string {
  const labels: Record<WritingParentReviewReason, string> = {
    external_not_activated: 'Automatic checking was not activated',
    provider_daily_quota: 'Cloudflare free daily allowance was exhausted',
    application_daily_quota: 'RRQ conservative daily allowance was exhausted',
    temporarily_unavailable: 'Free checking was temporarily unavailable',
    authorization_required: 'Installation authorization needs attention',
    safety_review_required: 'Automatic feedback was withheld for parent review',
    recognition_uncertain: 'Recognition uncertainty could affect meaning',
    invalid_provider_output: 'Automatic output did not pass validation',
    request_outcome_unknown: 'The provider outcome was unknown and was not retried',
    local_save_failed: 'Local saving needs attention',
  }
  return reason ? labels[reason] : 'No manual-review fallback recorded'
}

function provenanceLabel(record: WritingResponseRecord): string {
  const provider = record.feedbackProvenance === 'cloudflare_workers_ai'
    ? 'Cloudflare Workers AI generated'
    : record.feedbackProvenance === 'mocked'
      ? 'Controlled test provider generated'
      : record.feedbackProvenance === 'openai'
        ? 'Legacy provider generated'
        : 'No external feedback'
  return record.parentJudgment ? `${provider}; parent advisory review recorded separately` : `${provider}; parent review remains available`
}
