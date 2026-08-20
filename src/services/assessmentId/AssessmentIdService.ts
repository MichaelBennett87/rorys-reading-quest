import type { AssessmentIdService, BrowserAssessmentCryptoLike } from './assessmentIdTypes'

const DEFAULT_PREFIX = 'assessment-'

export function createBrowserAssessmentIdService(
  cryptoLike: BrowserAssessmentCryptoLike | null = typeof globalThis !== 'undefined'
    ? (globalThis.crypto as unknown as BrowserAssessmentCryptoLike | null)
    : null,
): AssessmentIdService {
  if (!cryptoLike) {
    return createUnavailableAssessmentIdService('Secure local record creation is not available in this browser.')
  }

  return {
    isSupported: () => true,
    createAssessmentId() {
      try {
        if (typeof cryptoLike.randomUUID === 'function') {
          return { status: 'created', assessmentId: `${DEFAULT_PREFIX}${cryptoLike.randomUUID()}` }
        }
        const bytes = new Uint8Array(16)
        cryptoLike.getRandomValues(bytes)
        return { status: 'created', assessmentId: `${DEFAULT_PREFIX}${toHex(bytes)}` }
      } catch {
        return { status: 'unavailable', reason: 'Secure local record creation is not available in this browser.' }
      }
    },
  }
}

export function createUnavailableAssessmentIdService(reason: string): AssessmentIdService {
  return {
    isSupported: () => false,
    createAssessmentId() {
      return { status: 'unavailable', reason }
    },
  }
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
