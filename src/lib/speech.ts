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

/**
 * Android TTS engines disagree about which combination of utterance fields
 * they will accept. Setting `voice` to an object from a stale `getVoices()`
 * list, or a non-default `rate`, is enough to make some of them fail outright
 * with `synthesis-failed` while a plainer utterance works fine.
 *
 * Rather than guess, the app can try each of these and keep whichever speaks.
 */
export interface SpeechStrategy {
  id: string
  label: string
  /** Pin utterance.voice to a specific Swedish voice object. */
  useVoice: boolean
  /** Tag the utterance as sv-SE. */
  setLang: boolean
  /** Apply the user's slowed speaking rate. */
  applyRate: boolean
}

export const STRATEGIES: SpeechStrategy[] = [
  { id: 'voice-rate', label: 'Swedish voice, slowed', useVoice: true, setLang: true, applyRate: true },
  { id: 'voice', label: 'Swedish voice, normal speed', useVoice: true, setLang: true, applyRate: false },
  { id: 'lang-rate', label: 'Language tag only, slowed', useVoice: false, setLang: true, applyRate: true },
  { id: 'lang', label: 'Language tag only, normal speed', useVoice: false, setLang: true, applyRate: false },
  { id: 'bare', label: 'No voice or language set', useVoice: false, setLang: false, applyRate: false },
]

export const DEFAULT_STRATEGY = STRATEGIES[0].id

let activeStrategy: SpeechStrategy = STRATEGIES[0]

export function setSpeechStrategy(id: string): void {
  activeStrategy = STRATEGIES.find((s) => s.id === id) ?? STRATEGIES[0]
}

function buildUtterance(
  text: string,
  strategy: SpeechStrategy,
  rate: number,
  voiceURI: string,
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)
  if (strategy.setLang) utterance.lang = 'sv-SE'
  if (strategy.applyRate) utterance.rate = rate
  if (strategy.useVoice) {
    const voice = pickVoice(voiceURI)
    if (voice) utterance.voice = voice
  }
  return utterance
}

export interface SpeakOptions {
  rate?: number
  voiceURI?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (message: string) => void
}

/**
 * Android Chrome will not synthesise anything until `speak()` has run once
 * inside a real user gesture. Every line this app speaks arrives from an async
 * callback — a resolved voice list, or an API reply — so none of them qualify.
 * Priming once on the first touch unlocks the engine for the rest of the visit.
 */
let primed = false

const GESTURES = ['pointerdown', 'touchend', 'keydown'] as const

export function primeSpeechOnFirstGesture(): void {
  if (!SPEECH_OUTPUT_SUPPORTED || primed) return

  const prime = () => {
    if (primed) return
    primed = true
    try {
      // Real text at full volume: some Android engines reject a whitespace-only
      // utterance or one at volume 0, and a rejected prime wedges the queue.
      // "Hej" is short enough to be unobtrusive if it does play.
      const warmup = new SpeechSynthesisUtterance('hej')
      warmup.volume = 0.01
      speechSynthesis.speak(warmup)
    } catch {
      /* nothing useful to do — the real speak() will report any failure */
    }
    for (const type of GESTURES) document.removeEventListener(type, prime)
  }

  for (const type of GESTURES) document.addEventListener(type, prime, { passive: true })
}

/** Speaks Swedish text. Cancels anything already being spoken. */
export function speak(text: string, options: SpeakOptions = {}): void {
  if (!SPEECH_OUTPUT_SUPPORTED || !text.trim()) {
    options.onEnd?.()
    return
  }

  const wasBusy = speechSynthesis.speaking || speechSynthesis.pending
  // Only cancel when there is genuinely something to cancel. Calling cancel()
  // on an idle Android engine can leave it wedged so nothing speaks again.
  if (wasBusy) stop()
  // A stray pause() with no matching resume() also wedges it, silently.
  if (speechSynthesis.paused) speechSynthesis.resume()

  const voice = pickVoice(options.voiceURI ?? '')

  const attempt = (retriesLeft: number) => {
    const utterance = buildUtterance(
      text,
      activeStrategy,
      options.rate ?? 0.85,
      options.voiceURI ?? '',
    )

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
      if (event.error === 'interrupted' || event.error === 'canceled') {
        options.onEnd?.()
        return
      }
      // Android's engine often fails the first utterance after being idle or
      // cancelled, then works on a second attempt a moment later.
      if (event.error === 'synthesis-failed' && retriesLeft > 0) {
        setTimeout(() => attempt(retriesLeft - 1), 250)
        return
      }
      options.onError?.(
        voice
          ? `Could not speak (${event.error}). Tap Play to try again.`
          : 'No Swedish voice is installed. On Android: Settings → Accessibility → Text-to-speech → install Swedish.',
      )
      options.onEnd?.()
    }

    speechSynthesis.speak(utterance)
  }

  // cancel() followed by speak() in the same tick drops the utterance on
  // Android, so give the engine a moment to actually stop first.
  if (wasBusy) setTimeout(() => attempt(1), 150)
  else attempt(1)
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

// ------------------------------------------------------------- diagnostics

export interface StrategyOutcome {
  id: string
  label: string
  /** 'spoke' means audio actually started. Anything else is the failure reason. */
  outcome: string
  ok: boolean
}

export interface SpeechReport {
  supported: boolean
  totalVoices: number
  swedishVoices: string[]
  /** Chrome only exposes speechSynthesis reliably in some display modes. */
  standalone: boolean
  userAgent: string
  results: StrategyOutcome[]
  /** First strategy that produced audio, if any. */
  winner: string | null
}

/** One thing to try. `strategy` is null for probes that are not about Swedish. */
interface Probe {
  id: string
  label: string
  /** What to do to the engine before speaking. */
  pre: 'nothing' | 'resume' | 'cancel' | 'cancel-wait'
  text: string
  strategy: SpeechStrategy | null
  /** Overrides applied when `strategy` is null. */
  lang?: string
  volume?: number
}

/** Which strategy id this probe proves, if it succeeds. */
const PROBES: Probe[] = [
  // Is synthesis capable of anything at all right now, in any language?
  { id: 'bare', label: 'Plain English, nothing set', pre: 'nothing', text: 'hello', strategy: null },
  { id: 'bare', label: 'Plain English after resume()', pre: 'resume', text: 'hello', strategy: null },
  { id: 'bare', label: 'Plain English after cancel()', pre: 'cancel', text: 'hello', strategy: null },
  {
    id: 'bare',
    label: 'Plain English after cancel() + pause',
    pre: 'cancel-wait',
    text: 'hello',
    strategy: null,
  },
  { id: 'bare', label: 'English at low volume', pre: 'nothing', text: 'hello', strategy: null, volume: 0.05 },
  // Android reports its voice as sv_SE; the web standard uses sv-SE.
  { id: 'lang', label: 'Swedish tagged sv-SE', pre: 'nothing', text: 'hej', strategy: null, lang: 'sv-SE' },
  { id: 'lang', label: 'Swedish tagged sv_SE (Android style)', pre: 'nothing', text: 'hej', strategy: null, lang: 'sv_SE' },
  // The original five.
  ...STRATEGIES.map((s) => ({
    id: s.id,
    label: s.label,
    pre: 'nothing' as const,
    text: 'hej hej',
    strategy: s,
  })),
]

interface ProbeOutcome {
  outcome: string
  state: string
}

/** Tries one probe and resolves with what happened. Never rejects. */
function runProbe(probe: Probe, rate: number, voiceURI: string): Promise<ProbeOutcome> {
  return new Promise((resolve) => {
    const state = `speaking=${speechSynthesis.speaking} pending=${speechSynthesis.pending} paused=${speechSynthesis.paused}`

    const go = () => {
      let settled = false
      const finish = (outcome: string) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve({ outcome, state })
      }

      let utterance: SpeechSynthesisUtterance
      if (probe.strategy) {
        utterance = buildUtterance(probe.text, probe.strategy, rate, voiceURI)
      } else {
        utterance = new SpeechSynthesisUtterance(probe.text)
        if (probe.lang) utterance.lang = probe.lang
      }
      if (probe.volume !== undefined) utterance.volume = probe.volume

      utterance.onstart = () => finish('SPOKE')
      utterance.onerror = (event) => finish(event.error || 'error')
      utterance.onend = () => finish('ended without starting')

      const timer = setTimeout(() => finish('timed out, silent'), 5000)

      try {
        speechSynthesis.speak(utterance)
      } catch (err) {
        finish(err instanceof Error ? err.message : 'threw')
      }
    }

    switch (probe.pre) {
      case 'resume':
        speechSynthesis.resume()
        go()
        break
      case 'cancel':
        speechSynthesis.cancel()
        go()
        break
      case 'cancel-wait':
        speechSynthesis.cancel()
        setTimeout(go, 400)
        break
      default:
        go()
    }
  })
}

/**
 * Works through every probe so a device that refuses one shape of utterance can
 * tell us which shape it does accept — or prove that synthesis is dead in this
 * context entirely, which is itself the answer.
 */
export async function diagnoseSpeech(rate: number, voiceURI: string): Promise<SpeechReport> {
  const voices = await loadVoices()
  const report: SpeechReport = {
    supported: SPEECH_OUTPUT_SUPPORTED,
    totalVoices: voices.length,
    swedishVoices: swedishVoices(voices).map(
      (v) => `${v.name} [${v.lang}]${v.localService ? ' on-device' : ' network'}`,
    ),
    standalone:
      typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches,
    userAgent: navigator.userAgent,
    results: [],
    winner: null,
  }

  if (!SPEECH_OUTPUT_SUPPORTED) return report

  for (const probe of PROBES) {
    const { outcome, state } = await runProbe(probe, rate, voiceURI)
    const ok = outcome === 'SPOKE'
    report.results.push({
      id: probe.id,
      label: probe.label,
      outcome: `${outcome}   (${state})`,
      ok,
    })
    // Only adopt a strategy that actually speaks Swedish properly.
    if (ok && !report.winner && probe.id !== 'bare') report.winner = probe.id
    try {
      speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, 500))
  }

  return report
}

/** True if the engine produced audio for anything at all during the probe run. */
export function anythingSpoke(report: SpeechReport): boolean {
  return report.results.some((r) => r.ok)
}
