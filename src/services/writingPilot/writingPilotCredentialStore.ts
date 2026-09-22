export interface WritingPilotCredentialStore {
  load(endpointId: string): Promise<string | null>
  save(endpointId: string, token: string): Promise<void>
  clear(endpointId: string): Promise<void>
}

const DATABASE_NAME = 'rorys-reading-quest-private-credentials'
const STORE_NAME = 'writing-service-installations'
const DATABASE_VERSION = 1

export function createIndexedDbWritingPilotCredentialStore(
  indexedDb: IDBFactory | undefined = globalThis.indexedDB,
): WritingPilotCredentialStore {
  const transact = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) => {
    if (!indexedDb) throw new Error('Private browser credential storage is unavailable.')
    const database = await openDatabase(indexedDb)
    try {
      const transaction = database.transaction(STORE_NAME, mode)
      const request = action(transaction.objectStore(STORE_NAME))
      const value = await requestResult(request)
      await transactionDone(transaction)
      return value
    } finally {
      database.close()
    }
  }

  return {
    async load(endpointId) {
      const value = await transact<unknown>('readonly', (store) => store.get(endpointId))
      return typeof value === 'string' && value.length >= 32 ? value : null
    },
    async save(endpointId, token) {
      if (!endpointId || token.length < 32) throw new Error('Installation authorization is invalid.')
      await transact<IDBValidKey>('readwrite', (store) => store.put(token, endpointId))
    },
    async clear(endpointId) {
      await transact<undefined>('readwrite', (store) => store.delete(endpointId))
    },
  }
}

function openDatabase(indexedDb: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDb.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Private browser credential storage could not be opened.'))
    request.onblocked = () => reject(new Error('Private browser credential storage is blocked.'))
  })
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Private browser credential operation failed.'))
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('Private browser credential transaction failed.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Private browser credential transaction was aborted.'))
  })
}
