import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'

import { ChildButton } from '../components/ChildButton'
import { buildDashboardSnapshot } from '../domain/dashboard'
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
import { createBrowserParentPinService, type ParentPinRecord, type ParentPinService } from '../services/parentAccess'
import { ParentDashboardScreen } from './parent/ParentDashboardScreen'

interface ParentPlaceholderScreenProps {
  progress: QuestProgressV1
  onBack: () => void
}

export function ParentPlaceholderScreen({ progress, onBack }: ParentPlaceholderScreenProps) {
  const [now] = useState(() => new Date().toISOString())
  const [pinService] = useState<ParentPinService>(() => createBrowserParentPinService())
  const [accessStore] = useState(() => createLocalStorageParentAccessStore(getBrowserLocalStorage()))
  const [recordsStore] = useState(() => createLocalStorageParentRecordsStore(getBrowserLocalStorage(), () => now))
  const [accessLoad] = useState<ParentAccessLoadResult>(() => accessStore.load())
  const [recordsLoad] = useState<ParentRecordsLoadResult>(() => recordsStore.load(now))
  const [accessRecord, setAccessRecord] = useState<ParentPinRecord | null>(accessLoad.state)
  const [recordsState] = useState<ParentRecordsState>(recordsLoad.state)
  const [unlocked, setUnlocked] = useState(false)
  const [setupPin, setSetupPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [unlockPin, setUnlockPin] = useState('')
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

  if (pinUnavailable) {
    return (
      <section className="screen-shell" aria-labelledby="parent-area-title">
        <header className="screen-header">
          <h1 id="parent-area-title" ref={headingRef} tabIndex={-1}>Parent Area</h1>
          <p>Secure local PIN setup is not available in this browser.</p>
        </header>
        <section className="card">
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
        onLock={handleLock}
        onBackToQuest={handleBackToQuest}
      />
    )
  }

  if (showUnlock) {
    return (
      <section className="screen-shell" aria-labelledby="parent-area-title">
        <header className="screen-header">
          <h1 id="parent-area-title" ref={headingRef} tabIndex={-1}>Unlock Parent Area</h1>
          <p>Enter the local PIN to open the parent summary.</p>
        </header>
        <form className="card" onSubmit={handleUnlock}>
          <label htmlFor="parent-pin">Parent PIN</label>
          <input
            ref={unlockPinRef}
            id="parent-pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={unlockPin}
            onChange={(event) => setUnlockPin(event.target.value)}
            aria-invalid={unlockMessage ? 'true' : undefined}
            aria-describedby={unlockMessage ? 'parent-pin-message' : undefined}
          />
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
    <section className="screen-shell" aria-labelledby="parent-area-title">
      <header className="screen-header">
        <h1 id="parent-area-title" ref={headingRef} tabIndex={-1}>Set Up Parent Area</h1>
        <p>Create a local PIN to open the parent summary later.</p>
      </header>
      <form className="card" onSubmit={handleSetup}>
        <label htmlFor="parent-pin-new">Create Parent PIN</label>
        <input
          ref={setupPinRef}
          id="parent-pin-new"
          type="password"
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
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          value={confirmPin}
          onChange={(event) => setConfirmPin(event.target.value)}
        />
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
