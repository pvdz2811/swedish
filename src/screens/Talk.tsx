import { useCallback, useEffect, useRef, useState } from 'react'
import { THEMES, type Theme } from '../data/themes'
import { saveSession, type Session, type StoredMessage } from '../lib/db'
import { askTutor, describeApiError } from '../lib/claude'
import {
  listen,
  speak,
  stop as stopSpeech,
  SPEECH_INPUT_SUPPORTED,
  SPEECH_OUTPUT_SUPPORTED,
  hasSwedishVoice,
  loadVoices,
} from '../lib/speech'
import { useSettings } from '../lib/useSettings'

export default function Talk() {
  const { settings } = useSettings()
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => stopSpeech, [])

  if (!theme) return <ThemePicker onPick={setTheme} hasKey={Boolean(settings.apiKey)} />
  return <Conversation theme={theme} onLeave={() => setTheme(null)} />
}

// ------------------------------------------------------------- theme picker

function ThemePicker({ onPick, hasKey }: { onPick: (t: Theme) => void; hasKey: boolean }) {
  const [free, ...rest] = THEMES
  return (
    <>
      <header className="topbar">
        <h1>Talk</h1>
      </header>
      <main className="screen">
        {!hasKey && (
          <div className="notice warn" style={{ marginBottom: 14 }}>
            The conversation partner needs an Anthropic API key. Add one in Settings (the gear on
            the Home screen) and this comes to life.
          </div>
        )}
        {!SPEECH_INPUT_SUPPORTED && (
          <div className="notice warn" style={{ marginBottom: 14 }}>
            This browser cannot listen to speech, so you can only type. Chrome on Android supports
            the microphone.
          </div>
        )}

        <p className="muted" style={{ marginBottom: 14 }}>
          Pick a scenario, or just talk about anything. Speak or type — I will reply in simple
          Swedish and correct you as we go.
        </p>

        <div className="theme-grid">
          <button className="theme-card full" onClick={() => onPick(free)}>
            <span className="glyph" aria-hidden="true">
              {free.icon}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <strong>{free.title}</strong>
              <span>{free.description}</span>
            </span>
          </button>

          {rest.map((t) => (
            <button key={t.id} className="theme-card" onClick={() => onPick(t)}>
              <span className="glyph" aria-hidden="true">
                {t.icon}
              </span>
              <strong>{t.title}</strong>
              <span>{t.description}</span>
            </button>
          ))}
        </div>
      </main>
    </>
  )
}

// -------------------------------------------------------------- conversation

function Conversation({ theme, onLeave }: { theme: Theme; onLeave: () => void }) {
  const { settings } = useSettings()

  const opener: StoredMessage = {
    role: 'assistant',
    text: theme.opener,
    at: Date.now(),
  }

  const [messages, setMessages] = useState<StoredMessage[]>([opener])
  const [draft, setDraft] = useState('')
  const [partial, setPartial] = useState('')
  const [listening, setListening] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [voiceWarning, setVoiceWarning] = useState('')

  const sessionId = useRef(crypto.randomUUID())
  const startedAt = useRef(Date.now())
  const recognition = useRef<{ stop: () => void } | null>(null)
  const abort = useRef<AbortController | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const spokeOpener = useRef(false)

  const say = useCallback(
    (text: string) => {
      if (!SPEECH_OUTPUT_SUPPORTED) return
      speak(text, {
        rate: settings.speechRate,
        voiceURI: settings.voiceURI,
        onError: setVoiceWarning,
      })
    },
    [settings.speechRate, settings.voiceURI],
  )

  // Greet out loud once. The ref guard survives StrictMode's double mount.
  useEffect(() => {
    if (spokeOpener.current) return
    spokeOpener.current = true
    void loadVoices().then(() => {
      if (!hasSwedishVoice() && SPEECH_OUTPUT_SUPPORTED) {
        setVoiceWarning(
          'No Swedish voice is installed on this device, so replies will not sound right. On Android: Settings → Accessibility → Text-to-speech → install Swedish.',
        )
      }
      if (settings.autoSpeak) say(theme.opener)
    })
  }, [settings.autoSpeak, say, theme.opener])

  useEffect(() => {
    return () => {
      recognition.current?.stop()
      abort.current?.abort()
      stopSpeech()
    }
  }, [])

  // Keep the newest message in view.
  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy, partial])

  const persist = useCallback(
    (msgs: StoredMessage[]) => {
      const session: Session = {
        id: sessionId.current,
        themeId: theme.id,
        startedAt: startedAt.current,
        updatedAt: Date.now(),
        messages: msgs,
      }
      void saveSession(session)
    },
    [theme.id],
  )

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim()
      if (!clean || busy) return

      stopSpeech()
      setError('')
      setDraft('')
      setPartial('')

      const mine: StoredMessage = { role: 'user', text: clean, at: Date.now() }
      const history = messages
      const withMine = [...history, mine]
      setMessages(withMine)
      setBusy(true)

      abort.current?.abort()
      abort.current = new AbortController()

      try {
        const reply = await askTutor({
          apiKey: settings.apiKey,
          workspaceId: settings.workspaceId,
          model: settings.model,
          theme,
          history,
          userText: clean,
          corrections: settings.corrections,
          signal: abort.current.signal,
        })

        const theirs: StoredMessage = {
          role: 'assistant',
          text: reply.swedish,
          translation: reply.english || undefined,
          correction: reply.correction ?? undefined,
          at: Date.now(),
        }
        const next = [...withMine, theirs]
        setMessages(next)
        persist(next)
        if (settings.autoSpeak) say(reply.swedish)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(describeApiError(err))
      } finally {
        setBusy(false)
      }
    },
    [busy, messages, settings, theme, persist, say],
  )

  const toggleMic = useCallback(() => {
    if (listening) {
      recognition.current?.stop()
      return
    }
    // Recording and speaking at once would feed the tutor its own voice.
    stopSpeech()
    setError('')
    setPartial('')
    setListening(true)
    recognition.current = listen({
      onPartial: setPartial,
      onFinal: (text) => void send(text),
      onError: setError,
      onEnd: () => {
        setListening(false)
        setPartial('')
        recognition.current = null
      },
    })
  }, [listening, send])

  return (
    <div className="talk">
      <header className="topbar">
        <button className="btn ghost" style={{ padding: '6px 10px' }} onClick={onLeave}>
          ‹ Themes
        </button>
        <h1 style={{ fontSize: 15 }}>
          {theme.icon} {theme.title}
        </h1>
      </header>

      <div className="chat" ref={chatRef}>
        {!settings.apiKey && (
          <div className="notice warn">
            No API key set, so I cannot reply yet. Add one in Settings.
          </div>
        )}
        {voiceWarning && <div className="notice warn">{voiceWarning}</div>}

        {messages.map((m, i) => (
          <MessageRow
            key={`${m.at}-${i}`}
            message={m}
            showTranslation={settings.showTranslations}
            onSpeak={() => say(m.text)}
          />
        ))}

        {busy && (
          <div className="typing" aria-label="Tutor is replying">
            <i />
            <i />
            <i />
          </div>
        )}

        {error && <div className="notice error">{error}</div>}
      </div>

      <div className="composer">
        {theme.phrases.length > 0 && (
          <div className="phrase-strip">
            {theme.phrases.map((p) => (
              <button
                key={p.sv}
                className="phrase-chip"
                title={p.en}
                onClick={() => setDraft(p.sv)}
              >
                {p.sv}
              </button>
            ))}
          </div>
        )}

        <div className="listening-strip">
          {listening ? partial || 'Lyssnar… speak Swedish now' : ''}
        </div>

        <div className="composer-row">
          <textarea
            rows={1}
            value={draft}
            placeholder="Skriv på svenska…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send(draft)
              }
            }}
          />
          {draft.trim() ? (
            <button
              className="mic"
              onClick={() => void send(draft)}
              disabled={busy}
              aria-label="Send"
            >
              ➤
            </button>
          ) : (
            <button
              className={`mic${listening ? ' recording' : ''}`}
              onClick={toggleMic}
              disabled={busy || !SPEECH_INPUT_SUPPORTED}
              aria-label={listening ? 'Stop recording' : 'Start recording'}
            >
              {listening ? '■' : '🎤'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageRow({
  message,
  showTranslation,
  onSpeak,
}: {
  message: StoredMessage
  showTranslation: boolean
  onSpeak: () => void
}) {
  const [reveal, setReveal] = useState(false)
  const mine = message.role === 'user'
  const showGloss = message.translation && (showTranslation || reveal)

  return (
    <>
      <div className={`bubble-row${mine ? ' right' : ''}`}>
        <div className={`bubble ${mine ? 'me' : 'tutor'}`}>
          {message.text}
          {showGloss && <div className="gloss">{message.translation}</div>}
        </div>
        {!mine && (
          <div className="bubble-tools">
            {SPEECH_OUTPUT_SUPPORTED && (
              <button className="tool-btn" onClick={onSpeak}>
                🔊 Play
              </button>
            )}
            {message.translation && !showTranslation && (
              <button className="tool-btn" onClick={() => setReveal((r) => !r)}>
                {reveal ? 'Hide' : 'Translate'}
              </button>
            )}
          </div>
        )}
      </div>

      {message.correction && (
        <div className="correction">
          <span className="tag">Correction</span>
          {message.correction}
        </div>
      )}
    </>
  )
}
