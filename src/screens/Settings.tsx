import { useEffect, useState } from 'react'
import { useSettings } from '../lib/useSettings'
import {
  MODELS,
  describeApiError,
  isWorkspaceIdRequired,
  looksLikeKey,
  testKey,
  type ModelId,
} from '../lib/claude'
import {
  anythingSpoke,
  diagnoseSpeech,
  loadVoices,
  speak,
  swedishVoices,
  SPEECH_INPUT_SUPPORTED,
  SPEECH_OUTPUT_SUPPORTED,
  type SpeechReport,
} from '../lib/speech'
import { eraseEverything, resetAllCards } from '../lib/db'
import { VOCABULARY } from '../data/vocabulary'

const SAMPLE = 'Hej! Jag heter Sara och jag bor i Göteborg. Vad gör du idag?'

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, update } = useSettings()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [confirmWipe, setConfirmWipe] = useState(false)
  const [diagnosing, setDiagnosing] = useState(false)
  const [report, setReport] = useState<SpeechReport | null>(null)
  // Shown on demand, or automatically once the API says it is required.
  const [showWorkspace, setShowWorkspace] = useState(Boolean(settings.workspaceId))

  useEffect(() => {
    void loadVoices().then((all) => setVoices(swedishVoices(all)))
  }, [])

  const runTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      await testKey(
        { apiKey: settings.apiKey, workspaceId: settings.workspaceId },
        settings.model,
      )
      setTestResult({ ok: true, message: 'Key works. The conversation partner is ready.' })
    } catch (err) {
      setTestResult({ ok: false, message: describeApiError(err) })
      // Surface the workspace field only once it turns out to be needed, so the
      // common case stays a single box to fill in.
      if (isWorkspaceIdRequired(err)) setShowWorkspace(true)
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <header className="topbar">
        <button className="btn ghost" style={{ padding: '6px 10px' }} onClick={onBack}>
          ‹ Back
        </button>
        <h1 style={{ fontSize: 15 }}>Settings</h1>
      </header>

      <main className="screen">
        {/* ------------------------------------------------------------ API */}
        <div className="section-title">Conversation partner</div>
        <div className="card">
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="key">Anthropic API key</label>
            <input
              id="key"
              type={showKey ? 'text' : 'password'}
              value={settings.apiKey}
              placeholder="sk-ant-…"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(e) => {
                update({ apiKey: e.target.value.trim() })
                setTestResult(null)
              }}
            />
            <div className="hint">
              Stored only in this browser on this device, and sent only to api.anthropic.com. Get a
              key at{' '}
              <a
                className="link"
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
              >
                console.anthropic.com
              </a>
              . Because it lives in the browser, treat this key as disposable — do not reuse a key
              you rely on elsewhere, and rotate it if you share this device.
            </div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => setShowKey((s) => !s)}>
              {showKey ? 'Hide' : 'Show'}
            </button>
            <button
              className="btn primary"
              disabled={!settings.apiKey || testing}
              onClick={() => void runTest()}
            >
              {testing ? 'Testing…' : 'Test key'}
            </button>
          </div>

          {settings.apiKey && !looksLikeKey(settings.apiKey) && (
            <div className="notice warn" style={{ marginTop: 12 }}>
              That does not look like an Anthropic key — they start with <code>sk-ant-</code>.
            </div>
          )}

          {testResult && (
            <div
              className={`notice ${testResult.ok ? 'warn' : 'error'}`}
              style={
                testResult.ok
                  ? { marginTop: 12, background: 'var(--good-soft)', borderColor: 'var(--good)' }
                  : { marginTop: 12 }
              }
            >
              {testResult.message}
            </div>
          )}

          {showWorkspace ? (
            <div className="field">
              <label htmlFor="ws">Workspace ID</label>
              <input
                id="ws"
                type="text"
                value={settings.workspaceId}
                placeholder="wrkspc_…"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                onChange={(e) => {
                  update({ workspaceId: e.target.value.trim() })
                  setTestResult(null)
                }}
              />
              <div className="hint">
                Only needed for a key made against your account rather than one workspace. Find it
                in the Console under{' '}
                <a
                  className="link"
                  href="https://console.anthropic.com/settings/workspaces"
                  target="_blank"
                  rel="noreferrer"
                >
                  Settings → Workspaces
                </a>
                : open a workspace and copy the <code>wrkspc_…</code> id from the address bar.
                Leave blank if your key already belongs to a single workspace.
              </div>
            </div>
          ) : (
            <button
              className="link"
              style={{ marginTop: 12, fontSize: 13 }}
              onClick={() => setShowWorkspace(true)}
            >
              Add a Workspace ID
            </button>
          )}

          <div className="field">
            <label htmlFor="model">Model</label>
            <select
              id="model"
              value={settings.model}
              onChange={(e) => {
                update({ model: e.target.value as ModelId })
                setTestResult(null)
              }}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <div className="hint">{MODELS.find((m) => m.id === settings.model)?.hint}</div>
          </div>

          <Toggle
            label="Correct my Swedish"
            hint="Adds one short correction under the reply when you make a mistake."
            value={settings.corrections}
            onChange={(v) => update({ corrections: v })}
          />
          <Toggle
            label="Always show translations"
            hint="Off means you tap Translate to reveal the English."
            value={settings.showTranslations}
            onChange={(v) => update({ showTranslations: v })}
          />
        </div>

        {/* ---------------------------------------------------------- speech */}
        <div className="section-title">Speech</div>
        <div className="card">
          {!SPEECH_OUTPUT_SUPPORTED && (
            <div className="notice warn">This browser cannot speak text aloud.</div>
          )}
          {SPEECH_OUTPUT_SUPPORTED && voices.length === 0 && (
            <div className="notice warn">
              No Swedish voice found on this device. On Android: Settings → Accessibility →
              Text-to-speech output → install the Swedish language pack, then reopen this app.
            </div>
          )}

          {voices.length > 0 && (
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="voice">Swedish voice</label>
              <select
                id="voice"
                value={settings.voiceURI}
                onChange={(e) => update({ voiceURI: e.target.value })}
              >
                <option value="">Automatic</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} {v.localService ? '(on device)' : '(online)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label htmlFor="rate">Speaking speed — {settings.speechRate.toFixed(2)}×</label>
            <input
              id="rate"
              type="range"
              min={0.5}
              max={1.3}
              step={0.05}
              value={settings.speechRate}
              onChange={(e) => update({ speechRate: Number(e.target.value) })}
            />
            <div className="hint">
              Native pace is 1.0. Beginners usually follow 0.8–0.9 far better.
            </div>
          </div>

          <button
            className="btn wide"
            disabled={!SPEECH_OUTPUT_SUPPORTED}
            onClick={() =>
              speak(SAMPLE, { rate: settings.speechRate, voiceURI: settings.voiceURI })
            }
          >
            🔊 Play a sample
          </button>

          <Toggle
            label="Speak replies automatically"
            hint="Reads the tutor's Swedish aloud as soon as it arrives."
            value={settings.autoSpeak}
            onChange={(v) => update({ autoSpeak: v })}
          />

          <button
            className="btn wide"
            style={{ marginTop: 12 }}
            disabled={!SPEECH_OUTPUT_SUPPORTED || diagnosing}
            onClick={async () => {
              setDiagnosing(true)
              setReport(null)
              try {
                const result = await diagnoseSpeech(settings.speechRate, settings.voiceURI)
                setReport(result)
                if (result.winner && result.winner !== settings.speechStrategy) {
                  // Adopt whatever this device actually accepts.
                  update({ speechStrategy: result.winner })
                } else if (!anythingSpoke(result)) {
                  // Synthesis is dead here. Stop trying on every reply, which
                  // would otherwise put an error under each one.
                  update({ autoSpeak: false })
                }
              } finally {
                setDiagnosing(false)
              }
            }}
          >
            {diagnosing ? 'Testing each method…' : '🩺 Diagnose speech problems'}
          </button>
          <div className="hint">
            Plays a short phrase five different ways and keeps whichever one your phone accepts.
            Takes about half a minute — turn the volume up.
          </div>

          {report && <SpeechDiagnostics report={report} />}

          {!SPEECH_INPUT_SUPPORTED && (
            <div className="notice warn" style={{ marginTop: 12 }}>
              Speech recognition is unavailable here, so the microphone is disabled. Chrome on
              Android supports it. Note that recognition runs in the cloud and needs a connection.
            </div>
          )}
        </div>

        {/* --------------------------------------------------------- studying */}
        <div className="section-title">Flashcards</div>
        <div className="card">
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="new">New words per day — {settings.newPerDay}</label>
            <input
              id="new"
              type="range"
              min={0}
              max={40}
              step={5}
              value={settings.newPerDay}
              onChange={(e) => update({ newPerDay: Number(e.target.value) })}
            />
            <div className="hint">
              Ten a day gets you through all {VOCABULARY.length} words in about {Math.ceil(VOCABULARY.length / 10)}{' '}
              weeks of steady practice. Reviews are scheduled on top of this.
            </div>
          </div>

          <div className="field">
            <label htmlFor="dir">Ask cards</label>
            <select
              id="dir"
              value={settings.cardDirection}
              onChange={(e) =>
                update({ cardDirection: e.target.value as typeof settings.cardDirection })
              }
            >
              <option value="mixed">Both directions (recommended)</option>
              <option value="sv-en">Swedish → English (recognition)</option>
              <option value="en-sv">English → Swedish (recall)</option>
            </select>
            <div className="hint">
              Recall is harder than recognition, and it is the one that makes words available when
              you speak.
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ data */}
        <div className="section-title">Data</div>
        <div className="card">
          <p className="muted">
            Everything — progress, settings and your API key — is stored only in this browser.
            Nothing is uploaded, and clearing your browser data for this site removes all of it.
          </p>

          <button
            className="btn wide"
            style={{ marginTop: 14 }}
            onClick={() => {
              if (confirm('Reset all flashcard progress? Your settings and API key are kept.')) {
                void resetAllCards()
              }
            }}
          >
            Reset flashcard progress
          </button>

          {!confirmWipe ? (
            <button
              className="btn danger wide"
              style={{ marginTop: 10 }}
              onClick={() => setConfirmWipe(true)}
            >
              Erase everything
            </button>
          ) : (
            <div className="notice error" style={{ marginTop: 10 }}>
              This deletes card progress, lesson scores, saved conversations, your settings and
              your API key. It cannot be undone.
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn" onClick={() => setConfirmWipe(false)}>
                  Cancel
                </button>
                <button
                  className="btn danger"
                  onClick={async () => {
                    await eraseEverything()
                    location.reload()
                  }}
                >
                  Erase everything
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="faint" style={{ textAlign: 'center', marginTop: 24 }}>
          Svenska · {VOCABULARY.length} words · built for a Galaxy S25
        </p>
      </main>
    </>
  )
}

function SpeechDiagnostics({ report }: { report: SpeechReport }) {
  const summary = [
    `supported: ${report.supported}`,
    `voices: ${report.totalVoices} (${report.swedishVoices.length} Swedish)`,
    ...report.swedishVoices.map((v) => `  · ${v}`),
    `installed as app: ${report.standalone}`,
    '',
    ...report.results.map((r) => `${r.ok ? 'WORKS' : 'fails'}  ${r.label} — ${r.outcome}`),
    '',
    report.winner ? `now using: ${report.winner}` : 'nothing worked',
    '',
    report.userAgent,
  ].join('\n')

  return (
    <div style={{ marginTop: 14 }}>
      <div
        className={`notice ${report.winner ? 'warn' : 'error'}`}
        style={
          report.winner
            ? { background: 'var(--good-soft)', borderColor: 'var(--good)' }
            : undefined
        }
      >
        {report.winner
          ? 'Found a method that works — the app has switched to it. Try Play a sample above.'
          : anythingSpoke(report)
            ? 'The engine works, but not for Swedish. Copy the details below and send them to me.'
            : 'Nothing spoke at all, not even plain English, so this is your phone\'s text-to-speech engine refusing the browser rather than anything in the app. Spoken replies have been switched off so they stop erroring under every message — everything else still works, and you can turn them back on here once the engine is fixed.'}
      </div>

      <pre
        style={{
          marginTop: 10,
          padding: 12,
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 11.5,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowX: 'auto',
        }}
      >
        {summary}
      </pre>

      <button
        className="btn wide"
        style={{ marginTop: 8 }}
        onClick={() => void navigator.clipboard?.writeText(summary)}
      >
        Copy details
      </button>
    </div>
  )
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="toggle-row">
      <div>
        <div className="t-label">{label}</div>
        <div className="t-hint">{hint}</div>
      </div>
      <button
        className={`switch${value ? ' on' : ''}`}
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
      >
        <span className="knob" />
      </button>
    </div>
  )
}
