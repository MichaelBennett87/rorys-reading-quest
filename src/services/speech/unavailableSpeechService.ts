import type { SpeechService, SpeakStep } from './speechTypes'

export function createUnavailableSpeechService(): SpeechService {
  return {
    isSupported: () => false,
    cancel: () => {},
    speakText: () => Promise.resolve(),
    speakSequence: (steps: SpeakStep[]) => {
      void steps
      return Promise.resolve()
    },
  }
}
