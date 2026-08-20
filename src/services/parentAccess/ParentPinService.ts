import type { BrowserCryptoLike, ParentPinService } from './parentAccessTypes'

export interface ParentPinServiceConfig {
  hashIterations: number
  saltLength: number
}

export const DEFAULT_PARENT_PIN_CONFIG: ParentPinServiceConfig = {
  hashIterations: 60000,
  saltLength: 16,
}

export function createBrowserParentPinService(
  cryptoLike: BrowserCryptoLike | null = typeof globalThis !== 'undefined'
    ? (globalThis.crypto as unknown as BrowserCryptoLike | null)
    : null,
  config: ParentPinServiceConfig = DEFAULT_PARENT_PIN_CONFIG,
): ParentPinService {
  if (!cryptoLike?.subtle) {
    return createUnavailableParentPinService('Secure local PIN setup is not available in this browser.')
  }

  return {
    isSupported: () => true,
    async setupPin(input, now = new Date().toISOString()) {
      const validation = validatePinInput(input.pin, input.confirmPin)
      if (validation) {
        return { status: 'invalid_input', reason: validation }
      }
      try {
        const salt = new Uint8Array(config.saltLength)
        cryptoLike.getRandomValues(salt)
        const hash = await derivePinHash(cryptoLike, input.pin, salt, config.hashIterations)
        return {
          status: 'created',
          record: {
            schemaVersion: 1,
            pinHash: encodeBytes(hash),
            pinSalt: encodeBytes(salt),
            hashAlgorithm: 'PBKDF2-SHA-256',
            hashIterations: config.hashIterations,
            createdAt: now,
            updatedAt: now,
          },
        }
      } catch (error) {
        return { status: 'unavailable', reason: error instanceof Error ? error.message : String(error) }
      }
    },
    async verifyPin(pin, record) {
      const validation = validatePin(pin)
      if (validation) return { status: 'invalid_input', reason: validation }
      try {
        const salt = decodeBytes(record.pinSalt)
        const expected = decodeBytes(record.pinHash)
        const actual = await derivePinHash(cryptoLike, pin, salt, record.hashIterations)
        return compareBytes(actual, expected)
          ? { status: 'created', record }
          : { status: 'incorrect', reason: 'The PIN did not match.' }
      } catch {
        return { status: 'unavailable', reason: 'Secure local PIN setup is not available in this browser.' }
      }
    },
  }
}

export function createUnavailableParentPinService(reason: string): ParentPinService {
  return {
    isSupported: () => false,
    async setupPin() {
      return { status: 'unavailable', reason }
    },
    async verifyPin() {
      return { status: 'unavailable', reason }
    },
  }
}

async function derivePinHash(
  cryptoLike: BrowserCryptoLike,
  pin: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const key = await cryptoLike.subtle!.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await cryptoLike.subtle!.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt.buffer.slice(0) as ArrayBuffer,
      iterations,
    },
    key,
    256,
  )
  return new Uint8Array(bits)
}

function validatePinInput(pin: string, confirmPin: string): string | null {
  const pinError = validatePin(pin)
  if (pinError) return pinError
  if (pin !== confirmPin) return 'PIN confirmation does not match.'
  return null
}

function validatePin(pin: string): string | null {
  if (!/^\d+$/.test(pin)) return 'PIN must contain digits only.'
  if (pin.length < 4) return 'PIN must be at least 4 digits.'
  if (pin.length > 8) return 'PIN must be at most 8 digits.'
  return null
}

function compareBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index]
  }
  return mismatch === 0
}

function encodeBytes(bytes: Uint8Array): string {
  return toBase64(bytes)
}

function decodeBytes(encoded: string): Uint8Array {
  return Uint8Array.from(atobCompat(encoded), (char) => char.charCodeAt(0))
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoaCompat(binary)
}

function btoaCompat(value: string): string {
  if (typeof btoa === 'function') return btoa(value)
  return Buffer.from(value, 'binary').toString('base64')
}

function atobCompat(value: string): string {
  if (typeof atob === 'function') return atob(value)
  return Buffer.from(value, 'base64').toString('binary')
}
