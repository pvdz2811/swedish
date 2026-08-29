/**
 * Wrappers around the two Web Speech APIs.
 *
 * Both are supported by Chrome on Android, which is what this app targets.
 * Recognition is cloud-backed by Google, so it needs a network connection;
 * synthesis runs on-device once the Swedish voice data is installed.
 */

// The DOM lib does not ship SpeechRecognition types, so declare the slice we use.
interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}
interface SpeechRecognitionResult {
  readonly length: number
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}
interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function recognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export const SPEECH_INPUT_SUPPORTED = recognitionCtor() !== null
export const SPEECH_OUTPUT_SUPPORTED =
  typeof window !== 'undefined' && 'speechSynthesis' in window

export type ListenState = 'idle' | 'listening' | 'error'

export interface ListenHandlers {
  /** Fires repeatedly with the best guess so far, so the UI can show live text. */
  onPartial?: (text: string) => void
  /** Fires once with the settled transcript. */
  onFinal: (text: string) => void
  onError?: (message: string) => void
  onEnd?: () => void
}

/** Turns the API's terse error codes into something a user can act on. */
function describeError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was blocked. Allow it in your browser settings for this site.'
    case 'no-speech':
      return "I didn't hear anything. Tap the microphone and try again."
    case 'audio-capture':
      return 'No microphone was found.'
    case 'network':
      return 'Speech recognition needs a network connection — it runs in the cloud.'
    case 'aborted':
      return '' // user-initiated stop; not worth reporting
    case 'language-not-supported':
      return 'Swedish speech recognition is not available in this browser.'
    default:
      return `Speech recognition failed (${code}).`
  }
}

/**
 * A single dictation attempt. Returns a handle so the caller can stop early.
 * Only one should be active at a time.
 */
export function listen(handlers: ListenHandlers): { stop: () => void } {
  const Ctor = recognitionCtor()
  if (!Ctor) {
    handlers.onError?.('This browser cannot do speech recognition. Chrome on Android works.')
    handlers.onEnd?.()
    return { stop: () => {} }
  }

  const rec = new Ctor()
  rec.lang = 'sv-SE'
  rec.interimResults = true
  rec.continuous = false
  rec.maxAlternatives = 1

  let settled = false
  let best = ''

  rec.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const text = result[0].transcript
      if (result.isFinal) {
        best += text
      } else {
        interim += text
      }
    }
    handlers.onPartial?.((best + interim).trim())
  }

  rec.onerror = (event) => {
    const message = describeError(event.error)
    if (message) handlers.onError?.(message)
  }

  rec.onend = () => {
    if (!settled) {
      settled = true
      const text = best.trim()
      if (text) handlers.onFinal(text)
    }
    handlers.onEnd?.()
  }

  try {
    rec.start()
  } catch {
    // start() throws if a previous recognition is still winding down.
    handlers.onError?.('Still finishing the last recording — try again in a moment.')
    handlers.onEnd?.()
  }

  return {
    stop: () => {
      try {
        rec.stop()
      } catch {
        /* already stopped */
      }
    },
  }
}

// --------------------------------------------------------------------- speaking

let voiceCache: SpeechSynthesisVoice[] = []

/**
 * Voices load asynchronously and the list is empty on first call in most
 * browsers, so this waits for the voiceschanged event once.
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!SPEECH_OUTPUT_SUPPORTED) return Promise.resolve([])
  const immediate = speechSynthesis.getVoices()
  if (immediate.length) {
    voiceCache = immediate
    return Promise.resolve(immediate)
  }
  return new Promise((resolve) => {
    const done = () => {
      voiceCache = speechSynthesis.getVoices()
      resolve(voiceCache)
    }
    speechSynthesis.addEventListener('voiceschanged', done, { once: true })
    // Some browsers never fire the event if there is genuinely nothing to load.
    setTimeout(done, 1500)
  })
}

export function swedishVoices(voices: SpeechSynthesisVoice[] = voiceCache): SpeechSynthesisVoice[] {
  return voices.filter((v) => v.lang.toLowerCase().startsWith('sv'))
}

function pickVoice(preferredURI: string): SpeechSynthesisVoice | null {
  const swedish = swedishVoices()
  if (preferredURI) {
    const exact = swedish.find((v) => v.voiceURI === preferredURI)
    if (exact) return exact
  }
  // Prefer a local voice — it works offline and starts instantly.
  return swedish.find((v) => v.localService) ?? swedish[0] ?? null
}

/**
 * Chrome cuts synthesis off after roughly 15 seconds unless it is nudged.
 * This keeper pings pause/resume while an utterance is in flight.
 */
let keepAlive: ReturnType<typeof setInterval> | null = null

function startKeepAlive() {
  stopKeepAlive()
  keepAlive = setInterval(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      speechSynthesis.resume()
    }
  }, 10_000)
}

function stopKeepAlive() {
  if (keepAlive) {
    clearInterval(keepAlive)
    keepAlive = null
  }
}

export interface SpeakOptions {
  rate?: number
  voiceURI?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (message: string) => void
}

/** Speaks Swedish text. Cancels anything already being spoken. */
export function speak(text: string, options: SpeakOptions = {}): void {
  if (!SPEECH_OUTPUT_SUPPORTED || !text.trim()) {
    options.onEnd?.()
    return
  }
  stop()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'sv-SE'
  utterance.rate = options.rate ?? 0.85
  utterance.pitch = 1

  const voice = pickVoice(options.voiceURI ?? '')
  if (voice) utterance.voice = voice

  utterance.onstart = () => {
    startKeepAlive()
    options.onStart?.()
  }
  utterance.onend = () => {
    stopKeepAlive()
    options.onEnd?.()
  }
  utterance.onerror = (event) => {
    stopKeepAlive()
    // 'interrupted' and 'canceled' are what we cause ourselves via stop().
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      options.onError?.(
        voice
          ? `Could not speak (${event.error}).`
          : 'No Swedish voice is installed. On Android: Settings → Accessibility → Text-to-speech → install Swedish.',
      )
    }
    options.onEnd?.()
  }

  speechSynthesis.speak(utterance)
}

export function stop(): void {
  if (!SPEECH_OUTPUT_SUPPORTED) return
  stopKeepAlive()
  speechSynthesis.cancel()
}

/** True when a Swedish voice is actually available to speak with. */
export function hasSwedishVoice(): boolean {
  return swedishVoices().length > 0
}
