export type SpeechKind =
  | 'PATTERN'
  | 'CHUNKS'
  | 'BLEND'
  | 'WORD'
  | 'SENTENCE'

export interface SpeakStep {
  text: string
  rate: number
  pauseAfterMs?: number
}

export interface SpeechService {
  isSupported(): boolean
  speakText(text: string, options?: Partial<SpeakStep>): Promise<void>
  speakSequence(steps: SpeakStep[]): Promise<void>
  cancel(): void
}

export interface SpeechServiceConfig {
  chunkSequenceRate: number
  blendRate: number
  wordRate: number
  sentenceRate: number
}
