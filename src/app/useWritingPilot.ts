import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LessonDefinition, LessonPurpose } from '../domain/lesson'
import {
  WRITING_PILOT_NOTICE_VERSION,
  WRITING_PILOT_RECORD_LIMIT,
  WRITING_PILOT_RETENTION_DAYS,
  getWritingPilotActivity,
  selectWritingActivityAfterLesson,
  type InkStroke,
  type WritingParentJudgment,
  type WritingParentReviewReason,
  type WritingPilotConsentRecord,
  type WritingPilotSettings,
  type WritingPilotStateV1,
  type WritingResponseRecord,
} from '../domain/writingPilot'
import {
  WRITING_PILOT_STORAGE_KEY,
  createLocalStorageWritingPilotStore,
  isWritingParentReviewQueueFull,
  normalizeInkStrokes,
  runWithWritingPilotWriteLock,
  type WritingPilotStorageStatus,
} from '../persistence'
import { createWritingPilotClient, type WritingPilotClient } from '../services/writingPilot'

type CommitResult<T> =
  | { status: 'saved'; value: T; state: WritingPilotStateV1 }
  | { status: 'unchanged'; value: T; state: WritingPilotStateV1 }
  | { status: 'blocked'; state: WritingPilotStateV1; detail: string }

export interface WritingPilotController {
  state: WritingPilotStateV1
  storageStatus: WritingPilotStorageStatus
  technicalDetail: string | null
  pendingRecord: WritingResponseRecord | null
  enablePilot(): Promise<boolean>
  disablePilot(): Promise<boolean>
  authorizeExternal(activationCode: string): Promise<{ ok: boolean; message: string }>
  disableExternal(): Promise<boolean>
  scheduleAfterReading(input: {
    lesson: LessonDefinition
    purpose: LessonPurpose
    sourceCompletionId: string
  }): Promise<boolean>
  saveDraft(recordId: string, strokes: readonly InkStroke[], typedDraft: string, inputMode: WritingResponseRecord['inputMode']): Promise<boolean>
  checkWriting(recordId: string, imageDataUrl: string | null, layout: { width: number; height: number }): Promise<boolean>
  confirmTranscription(recordId: string, confirmedText: string): Promise<boolean>
  rewrite(recordId: string): Promise<boolean>
  finish(recordId: string): Promise<boolean>
  correctTranscription(recordId: string, correctedText: string): Promise<boolean>
  setSuggestionDisposition(recordId: string, suggestionId: string, disposition: 'accepted' | 'dismissed'): Promise<boolean>
  recordParentJudgment(recordId: string, judgment: Omit<WritingParentJudgment, 'recordedAt'>): Promise<boolean>
  markReviewed(recordId: string): Promise<boolean>
  deleteRecord(recordId: string): Promise<boolean>
  deleteAllRecords(): Promise<boolean>
}

interface UseWritingPilotOptions {
  client?: WritingPilotClient
  now?: () => Date
}

export function useWritingPilot(options: UseWritingPilotOptions = {}): WritingPilotController {
  const [now] = useState(() => options.now ?? (() => new Date()))
  const client = useMemo(() => options.client ?? createWritingPilotClient(), [options.client])
  const store = useMemo(() => createLocalStorageWritingPilotStore(resolveLocalStorage(), () => now().toISOString()), [now])
  const initial = useMemo(() => store.load(now().toISOString()), [now, store])
  const [state, setState] = useState(initial.state)
  const [storageStatus, setStorageStatus] = useState<WritingPilotStorageStatus>(initial.status)
  const [technicalDetail, setTechnicalDetail] = useState<string | null>(initial.technicalDetail ?? null)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== WRITING_PILOT_STORAGE_KEY) return
      const loaded = store.load(now().toISOString())
      setState(loaded.state)
      setStorageStatus(loaded.status)
      setTechnicalDetail(loaded.technicalDetail ?? null)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [now, store])

  const commit = useCallback(async <T,>(producer: (current: WritingPilotStateV1) => { next: WritingPilotStateV1; value: T } | { next: null; value: T }): Promise<CommitResult<T>> => {
    const locked = await runWithWritingPilotWriteLock(() => {
      const loaded = store.load(now().toISOString())
      if (!['loaded', 'empty'].includes(loaded.status)) {
        return { kind: 'blocked' as const, state: loaded.state, detail: loaded.technicalDetail ?? loaded.status }
      }
      const proposal = producer(loaded.state)
      if (proposal.next === null) return { kind: 'unchanged' as const, state: loaded.state, value: proposal.value }
      const saved = store.save(proposal.next, loaded.state.revision)
      if (saved.status !== 'saved') {
        return { kind: 'blocked' as const, state: saved.state, detail: saved.technicalDetail ?? saved.status }
      }
      return { kind: 'saved' as const, state: saved.state, value: proposal.value }
    })
    if (locked.status !== 'acquired') {
      const detail = locked.technicalDetail
      setStorageStatus('unavailable')
      setTechnicalDetail(detail)
      return { status: 'blocked', state: stateRef.current, detail }
    }
    const result = locked.value
    if (result.kind !== 'unchanged' || result.state.revision !== stateRef.current.revision) {
      setState(result.state)
      stateRef.current = result.state
    }
    if (result.kind === 'blocked') {
      setStorageStatus('storage_error')
      setTechnicalDetail(result.detail)
      return { status: 'blocked', state: result.state, detail: result.detail }
    }
    setStorageStatus(result.kind === 'saved' ? 'saved' : 'loaded')
    setTechnicalDetail(null)
    return { status: result.kind, state: result.state, value: result.value }
  }, [now, store])

  const enablePilot = useCallback(async () => {
    const acceptedAt = now().toISOString()
    const consent: WritingPilotConsentRecord = {
      noticeVersion: WRITING_PILOT_NOTICE_VERSION,
      acceptedAt,
      disclosures: [
        'ink_and_confirmed_text_may_leave_device',
        'processor_and_purpose_disclosed',
        'retention_and_deletion_disclosed',
        'ai_feedback_can_be_wrong',
      ],
    }
    const result = await commit((current) => ({
      next: { ...current, settings: { ...current.settings, enabled: true, consent, quotaPauseReason: null, quotaPauseUntil: null } },
      value: true,
    }))
    return result.status === 'saved'
  }, [commit, now])

  const disablePilot = useCallback(async () => {
    if (stateRef.current.settings.externalProcessingEnabled) await client.revoke()
    const result = await commit((current) => ({
      next: {
        ...current,
        settings: { ...current.settings, enabled: false, externalProcessingEnabled: false, serviceAuthority: null, quotaPauseReason: null, quotaPauseUntil: null },
        pendingRecordId: null,
      },
      value: true,
    }))
    return result.status === 'saved'
  }, [client, commit])

  const authorizeExternal = useCallback(async (activationCode: string) => {
    const consent = stateRef.current.settings.consent
    if (!stateRef.current.settings.enabled || !consent) return { ok: false, message: 'Enable the pilot and accept the parent notice first.' }
    const result = await client.activate(activationCode.trim(), consent.noticeVersion)
    if (result.status !== 'ok') return { ok: false, message: result.message }
    const saved = await commit((current) => ({
      next: {
        ...current,
        settings: { ...current.settings, externalProcessingEnabled: true, serviceAuthority: result.value, quotaPauseReason: null, quotaPauseUntil: null },
      },
      value: true,
    }))
    if (saved.status !== 'saved') await client.revoke()
    return saved.status === 'saved'
      ? { ok: true, message: 'Protected writing processing is authorized for this installation.' }
      : { ok: false, message: 'Authorization was not saved on this device.' }
  }, [client, commit])

  const disableExternal = useCallback(async () => {
    if (stateRef.current.settings.externalProcessingEnabled) await client.revoke()
    const result = await commit((current) => ({
      next: { ...current, settings: { ...current.settings, externalProcessingEnabled: false, serviceAuthority: null, quotaPauseReason: null, quotaPauseUntil: null } },
      value: true,
    }))
    return result.status === 'saved'
  }, [client, commit])

  const scheduleAfterReading = useCallback(async (input: { lesson: LessonDefinition; purpose: LessonPurpose; sourceCompletionId: string }) => {
    const result = await commit((current) => {
      if (!current.settings.enabled || current.pendingRecordId || isWritingParentReviewQueueFull(current)) return { next: null, value: false }
      const activity = selectWritingActivityAfterLesson({
        lesson: input.lesson,
        purpose: input.purpose,
        offeredActivityIds: current.offeredActivityIds,
      })
      if (!activity) return { next: null, value: false }
      const createdAt = now().toISOString()
      const recordId = createId('writing')
      const record: WritingResponseRecord = {
        recordId,
        submissionId: createId('submission'),
        activityId: activity.activityId,
        sourcePassageId: activity.sourcePassageId,
        sourceContentVersion: activity.sourceContentVersion,
        rubricVersion: activity.rubricVersion,
        sourceCompletionId: input.sourceCompletionId,
        inputMode: 'handwriting',
        status: 'draft',
        inkRevision: 0,
        strokes: [],
        typedDraft: '',
        rawTranscription: null,
        recognitionUncertainties: [],
        confirmedTranscription: null,
        transcriptionConfirmedBy: null,
        spellingAssessmentSupportable: true,
        feedback: null,
        feedbackProvenance: 'none',
        suggestionDispositions: {},
        requests: [],
        parentReviewEvents: [],
        parentReviewReason: null,
        parentJudgment: null,
        parentReviewedAt: null,
        failureReason: null,
        createdAt,
        updatedAt: createdAt,
        expiresAt: new Date(now().getTime() + WRITING_PILOT_RETENTION_DAYS * 86_400_000).toISOString(),
      }
      const records = makeRoomForWritingRecord(current.records)
      if (!records) return { next: null, value: false }
      return {
        next: {
          ...current,
          records: [...records, record],
          pendingRecordId: recordId,
          offeredActivityIds: [...current.offeredActivityIds, activity.activityId],
        },
        value: true,
      }
    })
    return result.status === 'saved' && result.value
  }, [commit, now])

  const saveDraft = useCallback(async (recordId: string, strokes: readonly InkStroke[], typedDraft: string, inputMode: WritingResponseRecord['inputMode']) => {
    const normalizedStrokes = normalizeInkStrokes(strokes)
    const boundedDraft = typedDraft.slice(0, 500)
    const result = await commit((current) => updateRecord(current, recordId, (record) => {
      const same = JSON.stringify(record.strokes) === JSON.stringify(normalizedStrokes)
        && record.typedDraft === boundedDraft
        && record.inputMode === inputMode
      if (same) return null
      const changedAt = now().toISOString()
      return {
        ...record,
        inputMode,
        status: 'draft',
        inkRevision: record.inkRevision + 1,
        strokes: normalizedStrokes,
        typedDraft: boundedDraft,
        rawTranscription: null,
        recognitionUncertainties: [],
        confirmedTranscription: null,
        transcriptionConfirmedBy: null,
        spellingAssessmentSupportable: inputMode === 'handwriting',
        feedback: null,
        feedbackProvenance: 'none',
        parentReviewReason: null,
        parentJudgment: null,
        parentReviewedAt: null,
        requests: record.requests.map((request) => request.status === 'pending'
          ? { ...request, status: 'superseded' as const, resolvedAt: changedAt, outcomeCode: 'ink_changed' }
          : request),
        failureReason: null,
        updatedAt: changedAt,
      }
    }))
    return result.status === 'saved' || result.status === 'unchanged'
  }, [commit, now])

  const checkWriting = useCallback(async (recordId: string, imageDataUrl: string | null, layout: { width: number; height: number }) => {
    const currentRecord = stateRef.current.records.find((record) => record.recordId === recordId)
    if (!currentRecord) return false
    if (currentRecord.typedDraft.trim()) {
      const result = await commit((current) => updateRecord(current, recordId, (record) => ({
        ...record,
        status: 'transcription_ready',
        rawTranscription: record.typedDraft.trim(),
        recognitionUncertainties: [],
        spellingAssessmentSupportable: false,
        failureReason: null,
        updatedAt: now().toISOString(),
      })))
      return result.status === 'saved'
    }
    if (!imageDataUrl || currentRecord.strokes.length === 0) return false
    if (!externalIsUsable(stateRef.current, now())) {
      const result = await commit((current) => updateRecord(current, recordId, (record) => ({
        ...record,
        status: 'parent_review_needed',
        parentReviewReason: pausedReason(current.settings, now()) ?? 'external_not_activated',
        failureReason: parentReviewMessage(pausedReason(current.settings, now()) ?? 'external_not_activated'),
        updatedAt: now().toISOString(),
      })))
      return result.status === 'saved'
    }
    const requestId = createId('recognition')
    const prepared = await commit((current) => updateRecordWithValue(current, recordId, (record) => ({
      record: {
        ...record,
        status: 'recognition_pending',
        failureReason: null,
        requests: [...record.requests, {
          requestId,
          kind: 'recognition',
          inkRevision: record.inkRevision,
          status: 'pending',
          startedAt: now().toISOString(),
          resolvedAt: null,
          outcomeCode: null,
        }],
        updatedAt: now().toISOString(),
      },
      value: {
        inkRevision: record.inkRevision,
        submissionId: record.submissionId,
        activityId: record.activityId,
        sourceContentVersion: record.sourceContentVersion,
      },
    })))
    if (prepared.status !== 'saved') return false
    const response = await client.transcribe({
      requestId,
      submissionId: prepared.value.submissionId,
      activityId: prepared.value.activityId,
      sourceContentVersion: prepared.value.sourceContentVersion,
      inkRevision: prepared.value.inkRevision,
      imageDataUrl,
      layout,
    })
    const fallback = response.status === 'error' ? parentReviewFallback(response.code) : null
    const applied = await commit((current) => updateRecord(current, recordId, (record) => {
      const request = record.requests.find((entry) => entry.requestId === requestId)
      if (!request || request.status !== 'pending' || request.inkRevision !== record.inkRevision) return null
      const resolvedAt = now().toISOString()
      const requests = record.requests.map((entry) => entry.requestId === requestId
        ? { ...entry, status: response.status === 'ok' ? 'completed' as const : response.code === 'timeout_unknown' ? 'unknown' as const : 'failed' as const, resolvedAt, outcomeCode: response.status === 'ok' ? 'recognized' : response.code }
        : entry)
      if (response.status !== 'ok') {
        if (!fallback) return null
        return { ...record, status: 'parent_review_needed', requests, parentReviewReason: fallback.reason, failureReason: fallback.message, updatedAt: resolvedAt }
      }
      return {
        ...record,
        status: 'transcription_ready',
        rawTranscription: response.value.rawTranscription,
        recognitionUncertainties: response.value.uncertainties,
        spellingAssessmentSupportable: response.value.spellingAssessmentSupportable,
        feedbackProvenance: response.value.provider,
        requests,
        parentReviewReason: null,
        failureReason: null,
        updatedAt: resolvedAt,
      }
    }, fallback ? { settings: settingsAfterFailure(current.settings, fallback.reason, now()) } : {}))
    return applied.status === 'saved'
  }, [client, commit, now])

  const confirmTranscription = useCallback(async (recordId: string, confirmedText: string) => {
    const boundedText = confirmedText.trim().slice(0, 500)
    if (!boundedText) return false
    const preparation = await commit((current) => updateRecordWithValue(current, recordId, (record) => {
      if (!record.rawTranscription) return null
      const corrected = boundedText !== record.rawTranscription.trim()
      const meaningUncertain = record.recognitionUncertainties.some((entry) => entry.affectsMeaning)
      const canEvaluate = externalIsUsable(current, now()) && !meaningUncertain
      const requestId = canEvaluate ? createId('evaluation') : null
      const recognitionRequestId = record.inputMode === 'typed'
        ? null
        : [...record.requests].reverse().find((request) => (
            request.kind === 'recognition'
            && request.status === 'completed'
            && request.inkRevision === record.inkRevision
          ))?.requestId ?? null
      const updatedAt = now().toISOString()
      return {
        record: {
          ...record,
          status: canEvaluate ? 'evaluation_pending' : 'parent_review_needed',
          confirmedTranscription: boundedText,
          transcriptionConfirmedBy: 'learner',
          spellingAssessmentSupportable: corrected ? false : record.spellingAssessmentSupportable,
          requests: requestId ? [...record.requests, {
            requestId,
            kind: 'evaluation',
            inkRevision: record.inkRevision,
            status: 'pending',
            startedAt: updatedAt,
            resolvedAt: null,
            outcomeCode: null,
          }] : record.requests,
          parentReviewReason: meaningUncertain
            ? 'recognition_uncertain'
            : canEvaluate ? null : pausedReason(current.settings, now()) ?? 'external_not_activated',
          failureReason: meaningUncertain
            ? parentReviewMessage('recognition_uncertain')
            : canEvaluate ? null : parentReviewMessage(pausedReason(current.settings, now()) ?? 'external_not_activated'),
          updatedAt,
        },
        value: requestId ? {
          requestId,
          inkRevision: record.inkRevision,
          activityId: record.activityId,
          sourceContentVersion: record.sourceContentVersion,
          rubricVersion: record.rubricVersion,
          submissionId: record.submissionId,
          recognitionRequestId,
          inputMode: record.inputMode,
          transcriptionConfirmedBy: 'learner' as const,
        } : null,
      }
    }))
    if (preparation.status !== 'saved') return false
    if (!preparation.value) return true
    const response = await client.evaluate({ ...preparation.value, confirmedText: boundedText })
    const fallback = response.status === 'error' ? parentReviewFallback(response.code) : null
    const applied = await commit((current) => updateRecord(current, recordId, (record) => {
      const request = record.requests.find((entry) => entry.requestId === preparation.value?.requestId)
      if (!request || request.status !== 'pending' || request.inkRevision !== record.inkRevision || record.confirmedTranscription !== boundedText) return null
      const resolvedAt = now().toISOString()
      const requests = record.requests.map((entry) => entry.requestId === request.requestId
        ? { ...entry, status: response.status === 'ok' ? 'completed' as const : response.code === 'timeout_unknown' ? 'unknown' as const : 'failed' as const, resolvedAt, outcomeCode: response.status === 'ok' ? 'evaluated' : response.code }
        : entry)
      if (response.status !== 'ok') {
        if (!fallback) return null
        return { ...record, status: 'parent_review_needed', requests, parentReviewReason: fallback.reason, failureReason: fallback.message, updatedAt: resolvedAt }
      }
      return {
        ...record,
        status: response.value.feedback.parentReviewRequired ? 'parent_review_needed' : 'feedback_ready',
        feedback: response.value.feedback,
        feedbackProvenance: response.value.provider,
        requests,
        parentReviewReason: response.value.feedback.parentReviewRequired ? 'safety_review_required' : null,
        failureReason: response.value.feedback.parentReviewRequired ? parentReviewMessage('safety_review_required') : null,
        updatedAt: resolvedAt,
      }
    }, fallback ? { settings: settingsAfterFailure(current.settings, fallback.reason, now()) } : {}))
    return applied.status === 'saved'
  }, [client, commit, now])

  const rewrite = useCallback(async (recordId: string) => {
    const result = await commit((current) => updateRecord(current, recordId, (record) => ({
      ...record,
      status: 'draft',
      rawTranscription: null,
      recognitionUncertainties: [],
      confirmedTranscription: null,
      transcriptionConfirmedBy: null,
      feedback: null,
      feedbackProvenance: 'none',
      parentReviewReason: null,
      parentJudgment: null,
      parentReviewedAt: null,
      failureReason: null,
      updatedAt: now().toISOString(),
    })))
    return result.status === 'saved'
  }, [commit, now])

  const finish = useCallback(async (recordId: string) => {
    const result = await commit((current) => updateRecord(current, recordId, (record) => ({
      ...record,
      status: 'completed',
      updatedAt: now().toISOString(),
    }), { pendingRecordId: current.pendingRecordId === recordId ? null : current.pendingRecordId }))
    return result.status === 'saved'
  }, [commit, now])

  const correctTranscription = useCallback(async (recordId: string, correctedText: string) => {
    const text = correctedText.trim().slice(0, 500)
    if (!text) return false
    const result = await commit((current) => updateRecord(current, recordId, (record) => ({
      ...record,
      confirmedTranscription: text,
      transcriptionConfirmedBy: 'parent',
      spellingAssessmentSupportable: false,
      status: record.status === 'completed' ? 'completed' : 'parent_review_needed',
      parentReviewEvents: [...record.parentReviewEvents, {
        eventId: createId('parent-event'),
        kind: 'transcription_corrected',
        suggestionId: null,
        occurredAt: now().toISOString(),
      }],
      updatedAt: now().toISOString(),
    })))
    return result.status === 'saved'
  }, [commit, now])

  const setSuggestionDisposition = useCallback(async (recordId: string, suggestionId: string, disposition: 'accepted' | 'dismissed') => {
    const result = await commit((current) => updateRecord(current, recordId, (record) => {
      if (!record.feedback?.improvements.some((entry) => entry.suggestionId === suggestionId)) return null
      return {
        ...record,
        suggestionDispositions: { ...record.suggestionDispositions, [suggestionId]: disposition },
        parentReviewEvents: [...record.parentReviewEvents, {
          eventId: createId('parent-event'),
          kind: disposition === 'accepted' ? 'suggestion_accepted' : 'suggestion_dismissed',
          suggestionId,
          occurredAt: now().toISOString(),
        }],
        updatedAt: now().toISOString(),
      }
    }))
    return result.status === 'saved'
  }, [commit, now])

  const markReviewed = useCallback(async (recordId: string) => {
    const result = await commit((current) => updateRecord(current, recordId, (record) => ({
      ...record,
      parentReviewedAt: now().toISOString(),
      parentReviewEvents: [...record.parentReviewEvents, {
        eventId: createId('parent-event'),
        kind: 'marked_reviewed',
        suggestionId: null,
        occurredAt: now().toISOString(),
      }],
      updatedAt: now().toISOString(),
    })))
    return result.status === 'saved'
  }, [commit, now])

  const recordParentJudgment = useCallback(async (recordId: string, judgment: Omit<WritingParentJudgment, 'recordedAt'>) => {
    const recordedAt = now().toISOString()
    const bounded: WritingParentJudgment = {
      comprehension: judgment.comprehension,
      spellingObservations: judgment.spellingObservations.trim().slice(0, 500),
      grammarPunctuationObservations: judgment.grammarPunctuationObservations.trim().slice(0, 500),
      correction: judgment.correction.trim().slice(0, 500),
      recordedAt,
    }
    const result = await commit((current) => updateRecord(current, recordId, (record) => ({
      ...record,
      parentJudgment: bounded,
      parentReviewEvents: [...record.parentReviewEvents, {
        eventId: createId('parent-event'),
        kind: 'parent_judgment_recorded',
        suggestionId: null,
        occurredAt: recordedAt,
      }],
      updatedAt: recordedAt,
    })))
    return result.status === 'saved'
  }, [commit, now])

  const deleteRecord = useCallback(async (recordId: string) => {
    const result = await commit((current) => ({
      next: {
        ...current,
        records: current.records.filter((record) => record.recordId !== recordId),
        pendingRecordId: current.pendingRecordId === recordId ? null : current.pendingRecordId,
      },
      value: true,
    }))
    return result.status === 'saved'
  }, [commit])

  const deleteAllRecords = useCallback(async () => {
    const result = await commit((current) => ({
      next: { ...current, records: [], pendingRecordId: null, offeredActivityIds: [] },
      value: true,
    }))
    return result.status === 'saved'
  }, [commit])

  const pendingRecord = state.pendingRecordId
    ? state.records.find((record) => record.recordId === state.pendingRecordId) ?? null
    : null

  return {
    state,
    storageStatus,
    technicalDetail,
    pendingRecord,
    enablePilot,
    disablePilot,
    authorizeExternal,
    disableExternal,
    scheduleAfterReading,
    saveDraft,
    checkWriting,
    confirmTranscription,
    rewrite,
    finish,
    correctTranscription,
    setSuggestionDisposition,
    recordParentJudgment,
    markReviewed,
    deleteRecord,
    deleteAllRecords,
  }
}

function updateRecord<T = boolean>(
  current: WritingPilotStateV1,
  recordId: string,
  updater: (record: WritingResponseRecord) => WritingResponseRecord | null,
  statePatch: Partial<WritingPilotStateV1> = {},
): { next: WritingPilotStateV1 | null; value: T } {
  const index = current.records.findIndex((record) => record.recordId === recordId)
  if (index < 0) return { next: null, value: false as T }
  const updated = updater(current.records[index])
  if (!updated) return { next: null, value: false as T }
  const records = [...current.records]
  records[index] = updated
  return { next: { ...current, ...statePatch, records }, value: true as T }
}

function updateRecordWithValue<T>(
  current: WritingPilotStateV1,
  recordId: string,
  updater: (record: WritingResponseRecord) => { record: WritingResponseRecord; value: T } | null,
): { next: WritingPilotStateV1 | null; value: T } {
  const index = current.records.findIndex((record) => record.recordId === recordId)
  const fallback = null as T
  if (index < 0) return { next: null, value: fallback }
  const updated = updater(current.records[index])
  if (!updated) return { next: null, value: fallback }
  const records = [...current.records]
  records[index] = updated.record
  return { next: { ...current, records }, value: updated.value }
}

function externalIsUsable(state: WritingPilotStateV1, now: Date): boolean {
  const authority = state.settings.serviceAuthority
  const pauseUntil = state.settings.quotaPauseUntil ? Date.parse(state.settings.quotaPauseUntil) : Number.NaN
  return state.settings.enabled
    && state.settings.externalProcessingEnabled
    && authority?.status === 'authorized'
    && authority.authMode === 'installation_bearer_v1'
    && authority.provider === 'cloudflare_workers_ai'
    && authority.retentionControl === 'cloudflare_workers_ai_no_training'
    && authority.quotaPolicy === 'cloudflare_free_only_v1'
    && authority.actualPaidSpendingMicros === 0
    && authority.dailyApplicationNeuronsRemaining > 0
    && (!Number.isFinite(pauseUntil) || pauseUntil <= now.getTime())
    && Number.isFinite(Date.parse(authority.expiresAt))
    && Date.parse(authority.expiresAt) > now.getTime()
}

function makeRoomForWritingRecord(records: WritingResponseRecord[]): WritingResponseRecord[] | null {
  if (records.length < WRITING_PILOT_RECORD_LIMIT) return records
  const removable = records.findIndex((record) => record.parentReviewedAt !== null || (record.status === 'completed' && !record.parentReviewReason))
  if (removable < 0) return null
  return records.filter((_, index) => index !== removable)
}

function pausedReason(settings: WritingPilotSettings, now: Date): WritingParentReviewReason | null {
  if (!settings.quotaPauseUntil || Date.parse(settings.quotaPauseUntil) <= now.getTime()) return null
  return settings.quotaPauseReason === 'provider_daily_quota'
    ? 'provider_daily_quota'
    : settings.quotaPauseReason === 'application_daily_quota' ? 'application_daily_quota' : null
}

function settingsAfterFailure(settings: WritingPilotSettings, reason: WritingParentReviewReason, now: Date): WritingPilotSettings {
  if (reason !== 'provider_daily_quota' && reason !== 'application_daily_quota') return settings
  const quotaPauseReason = reason === 'provider_daily_quota' ? 'provider_daily_quota' : 'application_daily_quota'
  return { ...settings, quotaPauseReason, quotaPauseUntil: nextUtcMidnight(now).toISOString() }
}

function nextUtcMidnight(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
}

function parentReviewFallback(code: string): { reason: WritingParentReviewReason; message: string } {
  const reason: WritingParentReviewReason = code === 'quota_exhausted'
    ? 'provider_daily_quota'
    : code === 'application_quota_exhausted' || code === 'budget_exhausted'
      ? 'application_daily_quota'
      : code === 'unauthorized' || code === 'consent_required'
        ? 'authorization_required'
        : code === 'parent_review_required' || code === 'provider_refused'
          ? 'safety_review_required'
          : code === 'invalid_response'
            ? 'invalid_provider_output'
            : code === 'timeout_unknown'
              ? 'request_outcome_unknown'
              : 'temporarily_unavailable'
  return { reason, message: parentReviewMessage(reason) }
}

function parentReviewMessage(reason: WritingParentReviewReason): string {
  if (reason === 'provider_daily_quota' || reason === 'application_daily_quota') {
    return 'Free AI checking is finished for today. Your writing is saved for a grown-up to check.'
  }
  if (reason === 'recognition_uncertain') return 'Some writing was unclear. Your writing is saved for a grown-up to check.'
  if (reason === 'safety_review_required') return 'Automatic feedback was withheld. Your writing is saved for a grown-up to check.'
  if (reason === 'authorization_required' || reason === 'external_not_activated') {
    return 'Automatic checking is not active. Your writing is saved for a grown-up to check.'
  }
  return 'Automatic checking is unavailable. Your writing is saved for a grown-up to check.'
}

function createId(prefix: string): string {
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${id}`
}

function resolveLocalStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function getPendingWritingActivity(controller: WritingPilotController) {
  return controller.pendingRecord ? getWritingPilotActivity(controller.pendingRecord.activityId) : null
}
