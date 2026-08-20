export interface ParentPinRecord {
  schemaVersion: 1
  pinHash: string
  pinSalt: string
  hashAlgorithm: 'PBKDF2-SHA-256'
  hashIterations: number
  createdAt: string
  updatedAt: string
}

export interface ParentPinSetupInput {
  pin: string
  confirmPin: string
}

export interface ParentPinSetupSuccess {
  status: 'created'
  record: ParentPinRecord
}

export interface ParentPinFailure {
  status: 'invalid_input' | 'incorrect' | 'unavailable'
  reason: string
}

export type ParentPinSetupResult = ParentPinSetupSuccess | ParentPinFailure
export type ParentPinVerificationResult = ParentPinSetupSuccess | ParentPinFailure

export interface ParentPinService {
  isSupported(): boolean
  setupPin(input: ParentPinSetupInput, now?: string): Promise<ParentPinSetupResult>
  verifyPin(pin: string, record: ParentPinRecord): Promise<ParentPinVerificationResult>
}

export interface BrowserCryptoLike {
  getRandomValues<T extends ArrayBufferView>(array: T): T
  subtle?: {
    importKey(
      format: 'raw',
      keyData: BufferSource,
      algorithm: AlgorithmIdentifier,
      extractable: boolean,
      keyUsages: KeyUsage[],
    ): Promise<CryptoKey>
    deriveBits(
      algorithm: Pbkdf2Params,
      baseKey: CryptoKey,
      length: number,
    ): Promise<ArrayBuffer>
  }
}
