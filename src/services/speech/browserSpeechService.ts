import type { SpeechService, SpeechServiceConfig, SpeakStep } from './speechTypes'

const DEFAULT_CONFIG: SpeechServiceConfig = {
  chunkSequenceRate: 0.75,
  blendRate: 0.7,
  wordRate: 0.9,
  sentenceRate: 0.95,
}

export function isBrowserSpeechSupported(): boolean {
  return typeof window !== 'undefined'
    && typeof window.speechSynthesis !== 'undefined'
    && typeof window.SpeechSynthesisUtterance === 'function'
}

export function createBrowserSpeechService(config: Partial<SpeechServiceConfig> = {}): SpeechService {
  const options: SpeechServiceConfig = { ...DEFAULT_CONFIG, ...config }

  return {
    isSupported: () => isBrowserSpeechSupported(),
    cancel: () => {
      if (!isBrowserSpeechSupported()) return
      window.speechSynthesis.cancel()
    },
    speakText: (text, step) => {
      return new Promise((resolve) => {
        if (!isBrowserSpeechSupported() || !text.trim()) {
          resolve()
          return
        }
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = (step?.rate ?? options.wordRate) as number
        utterance.lang = preferEnglishVoice()
        const cleanup = () => resolve()
        utterance.onend = cleanup
        utterance.onerror = cleanup
        cancelInProgress(utterance)
        window.speechSynthesis.speak(utterance)
      })
    },
    speakSequence: (steps: SpeakStep[]) => {
      return steps.reduce<Promise<void>>(
        (chain, step) => chain.then(() => {
          if (!step.text.trim()) return Promise.resolve()
          return new Promise((resolve) => {
            if (!isBrowserSpeechSupported()) {
              resolve()
              return
            }
            const utterance = new SpeechSynthesisUtterance(step.text)
            utterance.rate = step.rate
            utterance.lang = preferEnglishVoice()
            const cleanup = () => {
              if (step.pauseAfterMs && step.pauseAfterMs > 0) {
                window.setTimeout(resolve, step.pauseAfterMs)
                return
              }
              resolve()
            }
            utterance.onend = cleanup
            utterance.onerror = cleanup
            cancelInProgress(utterance)
            window.speechSynthesis.speak(utterance)
          })
        }),
        Promise.resolve(),
      )
    },
  }

  function cancelInProgress(utterance: SpeechSynthesisUtterance) {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel()
    }
    void utterance
  }

  function preferEnglishVoice(): string {
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find((voice) => voice.lang.toLowerCase().startsWith('en'))
    return preferred?.lang ?? 'en-US'
  }
}

export { DEFAULT_CONFIG }
