import { QUEST_PROGRESS_STORAGE_KEY } from './questProgressTypes'

const PROGRESS_WRITE_LOCK_NAME = `${QUEST_PROGRESS_STORAGE_KEY}.authoritative-write`
const PROGRESS_WRITE_LOCK_TIMEOUT_MS = 8_000

interface LockManagerLike {
  request<T>(
    name: string,
    options: { mode: 'exclusive'; signal: AbortSignal },
    callback: () => Promise<T> | T,
  ): Promise<T>
}

export type ProgressWriteLockResult<T> =
  | { status: 'acquired'; value: T }
  | { status: 'unavailable'; technicalDetail: string }

export async function runWithProgressWriteLock<T>(
  operation: () => Promise<T> | T,
): Promise<ProgressWriteLockResult<T>> {
  const lockManager = getLockManager()
  if (!lockManager) {
    return {
      status: 'unavailable',
      technicalDetail: 'This browser cannot coordinate reading progress safely between open pages.',
    }
  }

  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), PROGRESS_WRITE_LOCK_TIMEOUT_MS)
  try {
    const value = await lockManager.request(
      PROGRESS_WRITE_LOCK_NAME,
      { mode: 'exclusive', signal: controller.signal },
      operation,
    )
    return { status: 'acquired', value }
  } catch (error) {
    return {
      status: 'unavailable',
      technicalDetail: error instanceof Error ? error.message : String(error),
    }
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

function getLockManager(): LockManagerLike | null {
  if (typeof navigator === 'undefined') return null
  const candidate = (navigator as Navigator & { locks?: LockManagerLike }).locks
  return candidate && typeof candidate.request === 'function' ? candidate : null
}
