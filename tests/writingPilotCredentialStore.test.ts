import { describe, expect, it } from 'vitest'
import { createIndexedDbWritingPilotCredentialStore } from '../src/services/writingPilot'

describe('private writing installation credential store', () => {
  it('subscribes to transaction completion before WebKit can finish the request', async () => {
    const store = createIndexedDbWritingPilotCredentialStore(new FastCompletingIndexedDb() as unknown as IDBFactory)
    await within(store.save('endpoint', 'private-installation-token-1234567890'))
    expect(await within(store.load('endpoint'))).toBe('private-installation-token-1234567890')
    await within(store.clear('endpoint'))
    expect(await within(store.load('endpoint'))).toBeNull()
  })
})

class FastCompletingIndexedDb {
  private readonly values = new Map<IDBValidKey, unknown>()

  open() {
    const database = {
      objectStoreNames: { contains: () => true },
      createObjectStore: () => undefined,
      close: () => undefined,
      transaction: () => this.transaction(),
    }
    const request = requestLike<IDBDatabase>(database as unknown as IDBDatabase)
    queueMicrotask(() => request.onsuccess?.(new Event('success')))
    return request
  }

  private transaction() {
    const transaction = {
      error: null,
      oncomplete: null as ((event: Event) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      onabort: null as ((event: Event) => void) | null,
      objectStore: () => ({
        get: (key: IDBValidKey) => this.finish(transaction, this.values.get(key)),
        put: (value: unknown, key: IDBValidKey) => {
          this.values.set(key, value)
          return this.finish(transaction, key)
        },
        delete: (key: IDBValidKey) => {
          this.values.delete(key)
          return this.finish(transaction, undefined)
        },
      }),
    }
    return transaction
  }

  private finish<T>(transaction: { oncomplete: ((event: Event) => void) | null }, value: T) {
    const request = requestLike(value)
    queueMicrotask(() => {
      request.onsuccess?.(new Event('success'))
      transaction.oncomplete?.(new Event('complete'))
    })
    return request
  }
}

function requestLike<T>(result: T) {
  return {
    result,
    error: null,
    onsuccess: null as ((event: Event) => void) | null,
    onerror: null as ((event: Event) => void) | null,
    onupgradeneeded: null as ((event: Event) => void) | null,
    onblocked: null as ((event: Event) => void) | null,
  }
}

async function within<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_resolve, reject) => setTimeout(() => reject(new Error('IndexedDB transaction completion was missed.')), 500)),
  ])
}
