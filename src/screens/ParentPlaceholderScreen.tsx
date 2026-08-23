import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'

import { ChildButton } from '../components/ChildButton'
import { buildDashboardSnapshot } from '../domain/dashboard'
import {
  createAssessmentRecord,
  deleteAssessmentRecord,
  parseAssessmentForm,
  type AssessmentFormValues,
  updateAssessmentRecord,
} from '../domain/assessment'
import { sampleContent } from '../domain/content'
import type { QuestProgressV1 } from '../persistence'
import {
  createLocalStorageParentAccessStore,
  createLocalStorageParentRecordsStore,
  getBrowserLocalStorage,
  type ParentAccessLoadResult,
  type ParentRecordsLoadResult,
  type ParentRecordsState,
} from '../persistence'
import { createBrowserAssessmentIdService, type AssessmentIdService } from '../services/assessmentId'
import { createBrowserParentPinService, type ParentPinRecord, type ParentPinService } from '../services/parentAccess'
import { createBrowserPrintService, type PrintService } from '../services/printing'
import { ParentDashboardScreen } from './parent/ParentDashboardScreen'
import type { ParentAssessmentMutationResult } from './parent/parentAssessmentActions'

interface ParentPlaceholderScreenProps {
  progress: QuestProgressV1
  onBack: () => void
}

export function ParentPlaceholderScreen({ progress, onBack }: ParentPlaceholderScreenProps) {
  const [now] = useState(() => new Date().toISOString())
  const [pinService] = useState<ParentPinService>(() => createBrowserParentPinService())
  const [assessmentIdService] = useState<AssessmentIdService>(() => createBrowserAssessmentIdService())
  const [printService] = useState<PrintService>(() => createBrowserPrintService())
  const [accessStore] = useState(() => createLocalStorageParentAccessStore(getBrowserLocalStorage()))
  const [recordsStore] = useState(() => createLocalStorageParentRecordsStore(getBrowserLocalStorage(), () => now))
  const [accessLoad] = useState<ParentAccessLoadResult>(() => accessStore.load())
  const [recordsLoad] = useState<ParentRecordsLoadResult>(() => recordsStore.load(now))
  const [accessRecord, setAccessRecord] = useState<ParentPinRecord | null>(accessLoad.state)
  const [recordsState, setRecordsState] = useState<ParentRecordsState>(recordsLoad.state)
  const [unlocked, setUnlocked] = useState(false)
  const [setupPin, setSetupPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [unlockPin, setUnlockPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [setupMessage, setSetupMessage] = useState<string | null>(null)
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null)
  const [storageNotice, setStorageNotice] = useState<string | null>(composeStorageNotice(accessLoad, recordsLoad))
  const headingRef = useRef<HTMLHeadingElement>(null)
  const setupPinRef = useRef<HTMLInputElement>(null)
  const confirmPinRef = useRef<HTMLInputElement>(null)
  const unlockPinRef = useRef<HTMLInputElement>(null)

  const dashboard = useMemo(() => buildDashboardSnapshot({ progress, now, content: sampleContent }), [progress, now])
  const pinUnavailable = !pinService.isSupported()
  const hasStoredPin = Boolean(accessRecord)
  const showSetup = !pinUnavailable && !hasStoredPin
  const showUnlock = !pinUnavailable && hasStoredPin && !unlocked
  const showFoundation = !pinUnavailable && unlocked

  useEffect(() => {
    if (pinUnavailable) {
      headingRef.current?.focus()
      return
    }
    if (showFoundation) {
      headingRef.current?.focus()
      return
    }
    if (showUnlock) {
      unlockPinRef.current?.focus()
      return
    }
    if (showSetup) {
      setupPinRef.current?.focus()
    }
  }, [pinUnavailable, showFoundation, showUnlock, showSetup])

  const handleSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSetupMessage(null)
    setUnlockMessage(null)
    const result = await pinService.setupPin({ pin: setupPin, confirmPin }, now)
    if (result.status !== 'created') {
      setSetupMessage(result.reason)
      return
    }

    setAccessRecord(result.record)
    const saveResult = accessStore.save(result.record)
    if (saveResult.status !== 'saved') {
      setStorageNotice('Parent PIN was created for this session, but this browser could not save it.')
    }
    setUnlocked(true)
    setSetupPin('')
    setConfirmPin('')
    setSetupMessage(null)
  }

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accessRecord) {
      setUnlockMessage('Set up a local PIN first.')
      return
    }
    const result = await pinService.verifyPin(unlockPin, accessRecord)
    if (result.status !== 'created') {
      setUnlockMessage(result.reason)
      return
    }
    setUnlocked(true)
    setUnlockPin('')
    setUnlockMessage(null)
  }

  const handleLock = () => {
    setUnlocked(false)
    setUnlockPin('')
    setSetupPin('')
    setConfirmPin('')
    setSetupMessage(null)
    setUnlockMessage(null)
  }

  const handleBackToQuest = () => {
    handleLock()
    onBack()
  }

  const createAssessment = (values: AssessmentFormValues): ParentAssessmentMutationResult => {
    const parsed = parseAssessmentForm(values, now)
    if (parsed.status !== 'valid') {
      return {
        status: 'invalid',
        message: 'Please fix the highlighted fields.',
        fieldErrors: parsed.errors,
        records: recordsState.officialAssessments,
      }
    }
    const idResult = assessmentIdService.createAssessmentId()
    if (idResult.status !== 'created') {
      return {
        status: 'unavailable',
        message: idResult.reason,
        fieldErrors: [],
        records: recordsState.officialAssessments,
      }
    }
    const mutation = createAssessmentRecord({
      records: recordsState.officialAssessments,
      parsedForm: parsed.value,
      assessmentId: idResult.assessmentId,
      now,
    })
    if (mutation.status !== 'saved') {
      return {
        status: 'invalid',
        message: mutation.message,
        fieldErrors: [],
        records: mutation.records,
        record: mutation.record,
      }
    }
    const nextState: ParentRecordsState = {
      ...recordsState,
      officialAssessments: mutation.records,
      updatedAt: now,
    }
    const saveResult = recordsStore.save(nextState)
    if (saveResult.status !== 'saved') {
      setStorageNotice('This assessment could not be saved in this browser. No existing records were changed.')
      return {
        status: 'storage_error',
        message: 'This assessment could not be saved in this browser. No existing records were changed.',
        fieldErrors: [],
        records: recordsState.officialAssessments,
        record: mutation.record,
      }
    }
    setRecordsState(saveResult.state)
    return {
      status: 'saved',
      message: 'Assessment saved.',
      fieldErrors: [],
      records: saveResult.state.officialAssessments,
      record: mutation.record,
    }
  }

  const updateAssessment = (assessmentId: string, values: AssessmentFormValues): ParentAssessmentMutationResult => {
    const parsed = parseAssessmentForm(values, now)
    if (parsed.status !== 'valid') {
      return {
        status: 'invalid',
        message: 'Please fix the highlighted fields.',
        fieldErrors: parsed.errors,
        records: recordsState.officialAssessments,
      }
    }
    const mutation = updateAssessmentRecord({
      records: recordsState.officialAssessments,
      assessmentId,
      parsedForm: parsed.value,
      now,
    })
    if (mutation.status !== 'saved') {
      return {
        status: mutation.status,
        message: mutation.message,
        fieldErrors: [],
        records: mutation.records,
        record: mutation.record,
      }
    }
    const nextState: ParentRecordsState = {
      ...recordsState,
      officialAssessments: mutation.records,
      updatedAt: now,
    }
    const saveResult = recordsStore.save(nextState)
    if (saveResult.status !== 'saved') {
      setStorageNotice('This assessment could not be saved in this browser. No existing records were changed.')
      return {
        status: 'storage_error',
        message: 'This assessment could not be saved in this browser. No existing records were changed.',
        fieldErrors: [],
        records: recordsState.officialAssessments,
        record: mutation.record,
      }
    }
    setRecordsState(saveResult.state)
    return {
      status: 'saved',
      message: 'Assessment updated.',
      fieldErrors: [],
      records: saveResult.state.officialAssessments,
      record: mutation.record,
    }
  }

  const deleteAssessment = (assessmentId: string): ParentAssessmentMutationResult => {
    const mutation = deleteAssessmentRecord({
      records: recordsState.officialAssessments,
      assessmentId,
      now,
    })
    if (mutation.status !== 'saved') {
      return {
        status: mutation.status,
        message: mutation.message,
        fieldErrors: [],
        records: mutation.records,
        record: mutation.record,
      }
    }
    const nextState: ParentRecordsState = {
      ...recordsState,
      officialAssessments: mutation.records,
      updatedAt: now,
    }
    const saveResult = recordsStore.save(nextState)
    if (saveResult.status !== 'saved') {
      setStorageNotice('This assessment could not be deleted in this browser. The record remains unchanged.')
      return {
        status: 'storage_error',
        message: 'This assessment could not be deleted in this browser. The record remains unchanged.',
        fieldErrors: [],
        records: recordsState.officialAssessments,
        record: mutation.record,
      }
    }
    setRecordsState(saveResult.state)
    return {
      status: 'saved',
      message: 'Assessment deleted.',
      fieldErrors: [],
      records: saveResult.state.officialAssessments,
      record: mutation.record,
    }
  }

  if (pinUnavailable) {
    return (
      <section className="screen-shell parent-access-shell" aria-labelledby="parent-area-title">
        <header className="screen-header">
          <h1 id="parent-area-title" ref={headingRef} tabIndex={-1}>Parent Area</h1>
          <p>Secure local PIN setup is not available in this browser.</p>
        </header>
        <section className="card parent-access-card">
          <p>The child quest can still run normally on this device.</p>
        </section>
        <section className="screen-actions">
          <ChildButton type="button" className="primary-action" onClick={handleBackToQuest}>
            Back to Quest
          </ChildButton>
        </section>
      </section>
    )
  }

  if (showFoundation) {
    return (
      <ParentDashboardScreen
        progress={progress}
        dashboard={dashboard}
        recordsState={recordsState}
        storageNotice={storageNotice}
        printService={printService}
        onCreateAssessment={createAssessment}
        onUpdateAssessment={updateAssessment}
        onDeleteAssessment={deleteAssessment}
        onLock={handleLock}
        onBackToQuest={handleBackToQuest}
      />
    )
  }

  if (showUnlock) {
    return (
      <section className="screen-shell parent-access-shell" aria-labelledby="parent-area-title">
        <header className="screen-header">
          <h1 id="parent-area-title" ref={headingRef} tabIndex={-1}>Unlock Parent Area</h1>
          <p>Enter the local PIN to open the parent summary.</p>
        </header>
        <form className="card parent-access-card parent-pin-form" onSubmit={handleUnlock}>
          <label htmlFor="parent-pin">Parent PIN</label>
          <input
            ref={unlockPinRef}
            id="parent-pin"
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            autoComplete="current-password"
            value={unlockPin}
            onChange={(event) => setUnlockPin(event.target.value)}
            aria-invalid={unlockMessage ? 'true' : undefined}
            aria-describedby={unlockMessage ? 'parent-pin-message' : undefined}
          />
          <ChildButton
            type="button"
            className="secondary-action pin-visibility-toggle"
            aria-pressed={showPin}
            onClick={() => setShowPin((visible) => !visible)}
          >
            {showPin ? 'Hide PIN' : 'Show PIN'}
          </ChildButton>
          {unlockMessage && <p id="parent-pin-message" role="alert">{unlockMessage}</p>}
          {storageNotice && <p role="status">{storageNotice}</p>}
          <section className="screen-actions">
            <ChildButton type="submit" className="primary-action">Unlock</ChildButton>
            <ChildButton type="button" className="secondary-action" onClick={handleBackToQuest}>Back to Quest</ChildButton>
          </section>
        </form>
      </section>
    )
  }

  return (
    <section className="screen-shell parent-access-shell" aria-labelledby="parent-area-title">
      <header className="screen-header">
        <h1 id="parent-area-title" ref={headingRef} tabIndex={-1}>Set Up Parent Area</h1>
        <p>Create a local PIN to open the parent summary later.</p>
      </header>
      <form className="card parent-access-card parent-pin-form" onSubmit={handleSetup}>
        <label htmlFor="parent-pin-new">Create Parent PIN</label>
        <input
          ref={setupPinRef}
          id="parent-pin-new"
          type={showPin ? 'text' : 'password'}
          inputMode="numeric"
          autoComplete="new-password"
          value={setupPin}
          onChange={(event) => setSetupPin(event.target.value)}
          aria-invalid={setupMessage ? 'true' : undefined}
          aria-describedby={setupMessage ? 'parent-setup-message' : undefined}
        />
        <label htmlFor="parent-pin-confirm">Confirm Parent PIN</label>
        <input
          ref={confirmPinRef}
          id="parent-pin-confirm"
          type={showPin ? 'text' : 'password'}
          inputMode="numeric"
          autoComplete="new-password"
          value={confirmPin}
          onChange={(event) => setConfirmPin(event.target.value)}
        />
        <ChildButton
          type="button"
          className="secondary-action pin-visibility-toggle"
          aria-pressed={showPin}
          onClick={() => setShowPin((visible) => !visible)}
        >
          {showPin ? 'Hide PIN' : 'Show PIN'}
        </ChildButton>
        {setupMessage && <p id="parent-setup-message" role="alert">{setupMessage}</p>}
        {storageNotice && <p role="status">{storageNotice}</p>}
        <section className="screen-actions">
          <ChildButton type="submit" className="primary-action">Create Parent PIN</ChildButton>
          <ChildButton type="button" className="secondary-action" onClick={handleBackToQuest}>Back to Quest</ChildButton>
        </section>
      </form>
    </section>
  )
}

function composeStorageNotice(accessLoad: ParentAccessLoadResult, recordsLoad: ParentRecordsLoadResult): string | null {
  const notices: string[] = []
  if (accessLoad.status === 'invalid_json' || accessLoad.status === 'unsupported_version' || accessLoad.status === 'invalid_state') {
    notices.push('Parent PIN data could not be restored and a fresh PIN can be set up.')
  }
  if (accessLoad.status === 'storage_error' || recordsLoad.status === 'storage_error') {
    notices.push('Parent storage is temporarily unavailable, so local changes may not save.')
  }
  if (recordsLoad.status === 'invalid_json' || recordsLoad.status === 'unsupported_version' || recordsLoad.status === 'invalid_state') {
    notices.push('Parent assessment records could not be restored, but child progress is safe.')
  }
  return notices.length > 0 ? notices.join(' ') : null
}
