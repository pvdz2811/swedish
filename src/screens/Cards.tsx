import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VOCABULARY, type Word } from '../data/vocabulary'
import { allCards, bumpDailyLog, saveCard } from '../lib/db'
import { buildQueue } from '../lib/queue'
import { intervalPreview, isNew, review, type CardState, type Grade } from '../lib/srs'
import { speak, stop as stopSpeech, SPEECH_OUTPUT_SUPPORTED } from '../lib/speech'
import { useSettings } from '../lib/useSettings'

const WORDS: Map<string, Word> = new Map(VOCABULARY.map((w) => [w.id, w]))

const GRADES: { id: Grade; label: string; cls: string }[] = [
  { id: 'again', label: 'Again', cls: 'again' },
  { id: 'hard', label: 'Hard', cls: 'hard' },
  { id: 'good', label: 'Good', cls: 'good' },
  { id: 'easy', label: 'Easy', cls: 'easy' },
]

/** Stable pseudo-random bit from a card id, so "mixed" is not jittery on re-render. */
function hashBit(id: string, salt: number): boolean {
  let h = salt
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return (h & 1) === 0
}

/** Swedish side of a noun card reads better with its article attached. */
function svFace(word: Word): string {
  return word.article ? `${word.article} ${word.sv}` : word.sv
}

export default function Cards({ onReviewed }: { onReviewed: () => void }) {
  const { settings } = useSettings()
  const [queue, setQueue] = useState<CardState[] | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [studyAhead, setStudyAhead] = useState(false)
  const built = useRef(false)

  const build = useCallback(
    async (ahead: boolean) => {
      const cards = await allCards()
      setQueue(buildQueue(cards, { newPerDay: settings.newPerDay, ahead }))
      setRevealed(false)
    },
    [settings.newPerDay],
  )

  useEffect(() => {
    if (built.current) return
    built.current = true
    void build(false)
  }, [build])

  useEffect(() => stopSpeech, [])

  const card = queue?.[0] ?? null
  const word = card ? WORDS.get(card.id) : undefined

  // Which way round to ask this card.
  const askSwedishFirst = useMemo(() => {
    if (!card) return true
    if (settings.cardDirection === 'sv-en') return true
    if (settings.cardDirection === 'en-sv') return false
    return hashBit(card.id, card.totalReviews)
  }, [card, settings.cardDirection])

  const say = useCallback(
    (text: string) => {
      if (!SPEECH_OUTPUT_SUPPORTED) return
      speak(text, {
        rate: settings.speechRate,
        voiceURI: settings.voiceURI,
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      })
    },
    [settings.speechRate, settings.voiceURI],
  )

  const reveal = useCallback(() => {
    setRevealed(true)
    if (settings.autoSpeak && word) say(word.sv)
  }, [settings.autoSpeak, word, say])

  const grade = useCallback(
    async (g: Grade) => {
      if (!card) return
      stopSpeech()
      setSpeaking(false)
      const updated = review(card, g)
      await saveCard(updated)
      await bumpDailyLog(1)
      setDone((n) => n + 1)
      onReviewed()

      setQueue((prev) => {
        if (!prev) return prev
        const rest = prev.slice(1)
        // A forgotten card comes back later in the same session.
        return g === 'again' ? [...rest, updated] : rest
      })
      setRevealed(false)
    },
    [card, onReviewed],
  )

  if (queue === null) {
    return (
      <>
        <header className="topbar">
          <h1>Flashcards</h1>
        </header>
        <main className="screen">
          <p className="muted">Loading deck…</p>
        </main>
      </>
    )
  }

  if (!card || !word) {
    return (
      <>
        <header className="topbar">
          <h1>Flashcards</h1>
        </header>
        <main className="screen">
          <div className="empty">
            <div className="big">✅</div>
            <h2 style={{ fontSize: 19, marginBottom: 6 }}>
              {done > 0 ? 'Session complete' : 'Nothing due right now'}
            </h2>
            <p className="muted">
              {done > 0
                ? `You reviewed ${done} card${done === 1 ? '' : 's'}. Come back later and the next batch will be waiting.`
                : `You have already met your ${settings.newPerDay} new words for today. Reviews will appear as they come due.`}
            </p>
            <button
              className="btn wide"
              style={{ marginTop: 20 }}
              onClick={() => {
                setStudyAhead(true)
                setDone(0)
                void build(true)
              }}
              disabled={studyAhead && done === 0}
            >
              Study ahead anyway
            </button>
          </div>
        </main>
      </>
    )
  }

  const front = askSwedishFirst ? svFace(word) : word.en
  const back = askSwedishFirst ? word.en : svFace(word)

  return (
    <>
      <header className="topbar">
        <h1>Flashcards</h1>
        <div className="spacer" />
        <span className="pill">{queue.length} left</span>
      </header>

      <main className="screen">
        <div className="review-head">
          <span className="pill accent">{word.topic}</span>
          <span className="faint">
            {isNew(card) ? 'New word' : `Seen ${card.totalReviews}×`} · {done} done
          </span>
        </div>

        <div className="flashcard">
          <div className="prompt-label">{askSwedishFirst ? 'Svenska' : 'English'}</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <div className="term">{front}</div>
            {askSwedishFirst && SPEECH_OUTPUT_SUPPORTED && (
              <button
                className={`speak-btn${speaking ? ' speaking' : ''}`}
                onClick={() => say(word.sv)}
                aria-label="Play pronunciation"
              >
                🔊
              </button>
            )}
          </div>

          {revealed && (
            <>
              <div className="divider-soft" />
              <div className="row" style={{ justifyContent: 'center' }}>
                <div className="answer">{back}</div>
                {!askSwedishFirst && SPEECH_OUTPUT_SUPPORTED && (
                  <button
                    className={`speak-btn${speaking ? ' speaking' : ''}`}
                    onClick={() => say(word.sv)}
                    aria-label="Play pronunciation"
                  >
                    🔊
                  </button>
                )}
              </div>
              {word.forms && <div className="forms">{word.forms}</div>}
              {word.example && (
                <div className="example">
                  <div className="sv">{word.example}</div>
                  {word.exampleEn && <div>{word.exampleEn}</div>}
                </div>
              )}
            </>
          )}
        </div>

        {!revealed ? (
          <button className="btn primary wide" style={{ marginTop: 14 }} onClick={reveal}>
            Show answer
          </button>
        ) : (
          <div className="grade-grid">
            {GRADES.map((g) => (
              <button key={g.id} className={`grade ${g.cls}`} onClick={() => void grade(g.id)}>
                <strong>{g.label}</strong>
                <span>{intervalPreview(card, g.id)}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
