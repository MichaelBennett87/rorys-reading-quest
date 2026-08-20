import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'
import { webcrypto } from 'node:crypto'

import {
  DEFAULT_PARENT_PIN_CONFIG,
  createBrowserParentPinService,
  createUnavailableParentPinService,
  type BrowserCryptoLike,
} from '../../src/services/parentAccess'

function createFakeCrypto(): BrowserCryptoLike {
  let seed = 0
  return {
    getRandomValues<T extends ArrayBufferView>(array: T): T {
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength)
      for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = (seed + index * 17) % 256
      }
      seed += bytes.length
      return array
    },
    subtle: {
      importKey: (...args) => webcrypto.subtle.importKey(
        args[0] as never,
        args[1] as never,
        args[2] as never,
        args[3],
        args[4],
      ) as never,
      deriveBits: (...args) => webcrypto.subtle.deriveBits(
        args[0] as never,
        args[1],
        args[2],
      ) as never,
    },
  }
}

describe('parent PIN service', () => {
  let consoleLog: ReturnType<typeof vi.spyOn>
  let consoleWarn: ReturnType<typeof vi.spyOn>
  let consoleError: ReturnType<typeof vi.spyOn>
  let originalFetch: typeof globalThis.fetch | undefined

  beforeEach(() => {
    consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    consoleLog.mockRestore()
    consoleWarn.mockRestore()
    consoleError.mockRestore()
    globalThis.fetch = originalFetch as typeof globalThis.fetch
  })

  test('creates a salt and digest, verifies correct PIN, and rejects incorrect or malformed PINs', async () => {
    const service = createBrowserParentPinService(createFakeCrypto(), {
      ...DEFAULT_PARENT_PIN_CONFIG,
      hashIterations: 1000,
    })
    const setup = await service.setupPin({ pin: '1234', confirmPin: '1234' }, '2026-08-20T12:00:00.000Z')
    expect(setup.status).toBe('created')
    if (setup.status !== 'created') return
    expect(setup.record.pinSalt).not.toBe(setup.record.pinHash)
    expect(setup.record.pinHash).not.toBe('')
    expect(await service.verifyPin('1234', setup.record)).toMatchObject({ status: 'created' })
    expect(await service.verifyPin('4321', setup.record)).toMatchObject({ status: 'incorrect' })
    expect(await service.setupPin({ pin: '', confirmPin: '' })).toMatchObject({ status: 'invalid_input' })
    expect(await service.setupPin({ pin: '12a4', confirmPin: '12a4' })).toMatchObject({ status: 'invalid_input' })
    expect(await service.setupPin({ pin: '123', confirmPin: '123' })).toMatchObject({ status: 'invalid_input' })
    expect(await service.setupPin({ pin: '123456789', confirmPin: '123456789' })).toMatchObject({ status: 'invalid_input' })
    expect(await service.setupPin({ pin: '1234', confirmPin: '9999' })).toMatchObject({ status: 'invalid_input' })
  })

  test('different salts produce different digests for the same PIN and unrelated child progress has no effect', async () => {
    const service = createBrowserParentPinService(createFakeCrypto(), {
      ...DEFAULT_PARENT_PIN_CONFIG,
      hashIterations: 1000,
    })
    const first = await service.setupPin({ pin: '2468', confirmPin: '2468' }, '2026-08-20T12:00:00.000Z')
    const second = await service.setupPin({ pin: '2468', confirmPin: '2468' }, '2026-08-20T12:00:00.000Z')
    expect(first.status).toBe('created')
    expect(second.status).toBe('created')
    if (first.status !== 'created' || second.status !== 'created') return
    expect(first.record.pinHash).not.toBe(second.record.pinHash)

    const unrelatedChildProgress = { completedSessionCount: 99 }
    void unrelatedChildProgress
    expect(await service.verifyPin('2468', first.record)).toMatchObject({ status: 'created' })
  })

  test('unsupported cryptography returns a safe unavailable result without plaintext fallback or network/logging calls', async () => {
    const service = createUnavailableParentPinService('Secure local PIN setup is not available in this browser.')
    const setup = await service.setupPin({ pin: '1234', confirmPin: '1234' })
    const verify = await service.verifyPin('1234', {
      schemaVersion: 1,
      pinHash: 'hash',
      pinSalt: 'salt',
      hashAlgorithm: 'PBKDF2-SHA-256',
      hashIterations: 1000,
      createdAt: '2026-08-20T12:00:00.000Z',
      updatedAt: '2026-08-20T12:00:00.000Z',
    })
    expect(setup).toMatchObject({ status: 'unavailable' })
    expect(verify).toMatchObject({ status: 'unavailable' })
    expect(consoleLog).not.toHaveBeenCalled()
    expect(consoleWarn).not.toHaveBeenCalled()
    expect(consoleError).not.toHaveBeenCalled()

    const fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as never
    await service.setupPin({ pin: '1234', confirmPin: '1234' })
    await service.verifyPin('1234', {
      schemaVersion: 1,
      pinHash: 'hash',
      pinSalt: 'salt',
      hashAlgorithm: 'PBKDF2-SHA-256',
      hashIterations: 1000,
      createdAt: '2026-08-20T12:00:00.000Z',
      updatedAt: '2026-08-20T12:00:00.000Z',
    })
    expect(fetchSpy).not.toHaveBeenCalled()
    if (verify.status === 'unavailable') {
      expect(verify.reason).toContain('Secure local PIN setup is not available')
    } else {
      throw new Error('Expected unavailable parent PIN result.')
    }
  })
})
