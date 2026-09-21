import { useState } from 'react'
import type { WritingPilotController } from '../../app/useWritingPilot'
import { getWritingPilotActivity, WRITING_PILOT_RECORD_LIMIT, WRITING_PILOT_RETENTION_DAYS } from '../../domain/writingPilot'
import { InkPreview } from '../../components/writing/WritingPad'
import '../../styles/writing-pilot.css'

export function WritingReviewView({ controller }: { controller: WritingPilotController }) {
  const [activationCode, setActivationCode] = useState('')
  const [message, setMessage] = useState('')
  const settings = controller.state.settings

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
      </header>

      <article className="parent-dashboard__card parent-writing-consent">
        <h3>Parent enablement and notice</h3>
        <p>When protected processing is activated, cropped handwriting and confirmed response text leave this browser for transcription and bounded feedback. The processor receives only the selected passage task, not the learner's progress history, PIN, assessments, name, school, or address.</p>
        <p>Writing stays in this browser for up to {WRITING_PILOT_RETENTION_DAYS} days, with at most {WRITING_PILOT_RECORD_LIMIT} records. You can disable processing or delete saved writing below. AI feedback can be mistaken.</p>
        <p>Enabling here supports this parent-provisioned private pilot; it is not a public child-onboarding or legal-consent system.</p>
        {!settings.enabled ? (
          <button type="button" onClick={() => void controller.enablePilot()}>I understand — enable local Read &amp; Write</button>
        ) : (
          <button type="button" onClick={() => void controller.disablePilot()}>Disable Read &amp; Write</button>
        )}
      </article>

      {settings.enabled && (
        <article className="parent-dashboard__card">
          <h3>Protected external processing</h3>
          {settings.externalProcessingEnabled && settings.serviceAuthority ? (
            <>
              <p><strong>Authorized installation:</strong> {settings.serviceAuthority.installationId}</p>
              <p><strong>Finite budget remaining:</strong> ${(settings.serviceAuthority.budgetRemainingMicros / 1_000_000).toFixed(2)}</p>
              <button type="button" onClick={() => void controller.disableExternal()}>Disable external processing</button>
            </>
          ) : (
            <>
              <p>External transcription and AI feedback remain off until a reviewed service issues a parent-provisioned activation code. The local writing and parent-review path still works.</p>
              <label htmlFor="writing-activation-code">Private activation code</label>
              <input id="writing-activation-code" type="password" autoComplete="off" value={activationCode} onChange={(event) => setActivationCode(event.target.value)} />
              <button type="button" disabled={!activationCode.trim()} onClick={() => void activate()}>Authorize protected processing</button>
            </>
          )}
          {message && <p role="status">{message}</p>}
        </article>
      )}

      <div className="parent-writing-records">
        {controller.state.records.length === 0 && <p>No writing responses are saved on this browser.</p>}
        {[...controller.state.records].reverse().map((record) => {
          const activity = getWritingPilotActivity(record.activityId)
          return (
            <article key={record.recordId} className="parent-dashboard__card parent-writing-record">
              <header>
                <h3>{activity?.title ?? 'Read & Write response'}</h3>
                <p>{activity?.prompt}</p>
                <p><strong>Status:</strong> {record.status.replaceAll('_', ' ')} · <strong>Source version:</strong> {record.sourceContentVersion}</p>
              </header>
              <InkPreview strokes={record.strokes} />
              <p><strong>Raw transcription:</strong> {record.rawTranscription ?? 'Not available'}</p>
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
              <p><strong>Provenance:</strong> {record.feedbackProvenance === 'none' ? 'No external feedback' : `${record.feedbackProvenance} generated; parent review remains advisory`}</p>
              <div className="parent-writing-actions">
                <button type="button" onClick={() => void controller.markReviewed(record.recordId)}>Mark reviewed</button>
                <button type="button" onClick={() => void controller.deleteRecord(record.recordId)}>Delete response</button>
              </div>
            </article>
          )
        })}
      </div>
      {controller.state.records.length > 0 && <button type="button" className="parent-writing-delete-all" onClick={() => void controller.deleteAllRecords()}>Delete all saved writing</button>}
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
