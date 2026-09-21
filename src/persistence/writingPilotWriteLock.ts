import { WRITING_PILOT_STORAGE_KEY } from './writingPilotStore'

const WRITING_PILOT_LOCK_NAME = `${WRITING_PILOT_STORAGE_KEY}.authoritative-write`
const WRITING_PILOT_LOCK_TIMEOUT_MS = 8_000

interface LockManagerLike {
  request<T>(
    name: string,
    options: { mode: 'exclusive'; signal: AbortSignal },
    callback: () => Promise<T> | T,
  ): Promise<T>
}

export type WritingPilotLockResult<T> =
  | { status: 'acquired'; value: T }
  | { status: 'unavailable'; reason: 'missing_capability' | 'timeout' | 'request_failed'; technicalDetail: string }

export async function runWithWritingPilotWriteLock<T>(operation: () => Promise<T> | T): Promise<WritingPilotLockResult<T>> {
  const manager = typeof navigator === 'undefined'
    ? null
    : (navigator as Navigator & { locks?: LockManagerLike }).locks ?? null
  if (!manager || typeof manager.request !== 'function') {
    return { status: 'unavailable', reason: 'missing_capability', technicalDetail: 'Web Locks are unavailable for writing storage.' }
  }
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), WRITING_PILOT_LOCK_TIMEOUT_MS)
  try {
    return {
      status: 'acquired',
      value: await manager.request(WRITING_PILOT_LOCK_NAME, { mode: 'exclusive', signal: controller.signal }, operation),
    }
  } catch (error) {
    return {
      status: 'unavailable',
      reason: controller.signal.aborted ? 'timeout' : 'request_failed',
      technicalDetail: controller.signal.aborted
        ? 'Writing storage coordination timed out.'
        : error instanceof Error ? error.message : String(error),
    }
  } finally {
    globalThis.clearTimeout(timeout)
  }
}
