export interface AssessmentIdService {
  isSupported(): boolean
  createAssessmentId(): AssessmentIdCreationResult
}

export interface AssessmentIdCreationSuccess {
  status: 'created'
  assessmentId: string
}

export interface AssessmentIdCreationFailure {
  status: 'unavailable'
  reason: string
}

export type AssessmentIdCreationResult = AssessmentIdCreationSuccess | AssessmentIdCreationFailure

export interface BrowserAssessmentCryptoLike {
  randomUUID?: () => string
  getRandomValues<T extends ArrayBufferView>(array: T): T
}
