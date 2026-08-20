import { isBrowserSpeechSupported } from './browserSpeechService'
import { createBrowserSpeechService } from './browserSpeechService'
import { createUnavailableSpeechService } from './unavailableSpeechService'
import type { SpeechService } from './speechTypes'

export function createSpeechService(): SpeechService {
  if (isBrowserSpeechSupported()) {
    return createBrowserSpeechService()
  }
  return createUnavailableSpeechService()
}
