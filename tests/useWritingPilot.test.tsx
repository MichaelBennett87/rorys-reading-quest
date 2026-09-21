import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getLessonById } from '../src/domain/lesson'
import { writingPilotActivities, type WritingServiceAuthority } from '../src/domain/writingPilot'
import { useWritingPilot } from '../src/app/useWritingPilot'
import type { WritingPilotClient } from '../src/services/writingPilot'

const fixedNow = new Date('2026-09-21T12:00:00.000Z')

beforeEach(() => {
  localStorage.clear()
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: { request: async (_name: string, _options: unknown, callback: () => unknown) => callback() },
  })
})

describe('useWritingPilot', () => {
  it('keeps the pilot off by default and never mutates reading progress or calls a service on the local parent-review path', async () => {
    const client = clientStub()
    localStorage.setItem('rorys-reading-quest.progress.v1', '{"reading":"bytes-stay-identical"}')
    const { result } = renderHook(() => useWritingPilot({ client, now: () => fixedNow }))
    expect(result.current.state.settings.enabled).toBe(false)
    expect(result.current.pendingRecord).toBeNull()

    await act(async () => { expect(await result.current.enablePilot()).toBe(true) })
    const activity = writingPilotActivities[0]
    const lesson = getLessonById(activity.triggerLessonId).lesson
    if (!lesson) throw new Error('Writing trigger lesson is unavailable.')
    await act(async () => {
      expect(await result.current.scheduleAfterReading({ lesson, purpose: 'progression', sourceCompletionId: 'reading-completion-1' })).toBe(true)
    })
    const recordId = result.current.pendingRecord?.recordId
    if (!recordId) throw new Error('Pending writing record was not created.')
    await act(async () => {
      expect(await result.current.saveDraft(recordId, [], 'Tia got the wrappers first.', 'typed')).toBe(true)
      expect(await result.current.checkWriting(recordId, null, { width: 100, height: 50 })).toBe(true)
    })
    await waitFor(() => expect(result.current.pendingRecord?.status).toBe('transcription_ready'))
    await act(async () => {
      expect(await result.current.confirmTranscription(recordId, 'Tia got the wrappers first.')).toBe(true)
    })
    expect(result.current.pendingRecord?.status).toBe('parent_review_needed')
    expect(client.transcribe).not.toHaveBeenCalled()
    expect(client.evaluate).not.toHaveBeenCalled()
    expect(localStorage.getItem('rorys-reading-quest.progress.v1')).toBe('{"reading":"bytes-stay-identical"}')
  })

  it('uses service authorization separately from parent enablement and rejects a late response after ink changes', async () => {
    let resolveRecognition!: (value: Awaited<ReturnType<WritingPilotClient['transcribe']>>) => void
    const transcribe = vi.fn(() => new Promise<Awaited<ReturnType<WritingPilotClient['transcribe']>>>((resolve) => { resolveRecognition = resolve }))
    const client = clientStub({ transcribe })
    const { result } = renderHook(() => useWritingPilot({ client, now: () => fixedNow }))
    await act(async () => { await result.current.enablePilot() })
    await act(async () => { expect((await result.current.authorizeExternal('private-code')).ok).toBe(true) })
    const activity = writingPilotActivities[0]
    const lesson = getLessonById(activity.triggerLessonId).lesson
    if (!lesson) throw new Error('Writing trigger lesson is unavailable.')
    await act(async () => { await result.current.scheduleAfterReading({ lesson, purpose: 'progression', sourceCompletionId: 'completion-2' }) })
    const recordId = result.current.pendingRecord?.recordId
    if (!recordId) throw new Error('Pending writing record was not created.')
    const firstStroke = [{ strokeId: 'one', pointerType: 'pen' as const, points: [{ x: 0.1, y: 0.2, pressure: 0.5, elapsedMs: 0 }] }]
    await act(async () => { await result.current.saveDraft(recordId, firstStroke, '', 'handwriting') })
    let request!: Promise<boolean>
    act(() => { request = result.current.checkWriting(recordId, 'data:image/png;base64,AAAA', { width: 100, height: 50 }) })
    await waitFor(() => expect(transcribe).toHaveBeenCalledTimes(1))
    const replacement = [{ strokeId: 'two', pointerType: 'pen' as const, points: [{ x: 0.3, y: 0.4, pressure: 0.5, elapsedMs: 0 }] }]
    await act(async () => { await result.current.saveDraft(recordId, replacement, '', 'handwriting') })
    resolveRecognition({ status: 'ok', value: { rawTranscription: 'stale words', uncertainties: [], spellingAssessmentSupportable: true, provider: 'mocked' } })
    await act(async () => { await request })
    expect(result.current.pendingRecord?.status).toBe('draft')
    expect(result.current.pendingRecord?.rawTranscription).toBeNull()
    expect(result.current.pendingRecord?.strokes[0].strokeId).toBe('two')
  })
})

function clientStub(overrides: Partial<WritingPilotClient> = {}): WritingPilotClient & { transcribe: ReturnType<typeof vi.fn>; evaluate: ReturnType<typeof vi.fn> } {
  const authority: WritingServiceAuthority = {
    status: 'authorized',
    installationId: 'test-installation',
    endpointId: 'test-service',
    retentionControl: 'approved_zero_data_retention',
    approvedAt: fixedNow.toISOString(),
    expiresAt: '2026-10-01T00:00:00.000Z',
    budgetLimitMicros: 1_000_000,
    budgetRemainingMicros: 900_000,
  }
  return {
    endpointId: 'test-service',
    activate: vi.fn(async () => ({ status: 'ok' as const, value: authority })),
    revoke: vi.fn(async () => ({ status: 'ok' as const, value: { revoked: true as const } })),
    transcribe: vi.fn(async () => ({ status: 'error' as const, code: 'unavailable' as const, message: 'off', retryable: false })),
    evaluate: vi.fn(async () => ({ status: 'error' as const, code: 'unavailable' as const, message: 'off', retryable: false })),
    ...overrides,
  } as WritingPilotClient & { transcribe: ReturnType<typeof vi.fn>; evaluate: ReturnType<typeof vi.fn> }
}
