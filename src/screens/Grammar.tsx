import { useCallback, useEffect, useRef, useState } from 'react'
import { LESSONS, type Lesson } from '../data/grammar'
import { allLessonProgress, recordLessonResult, type LessonProgress } from '../lib/db'
import { speak, stop as stopSpeech, SPEECH_OUTPUT_SUPPORTED } from '../lib/speech'
import { useSettings } from '../lib/useSettings'
import { askGrammar, describeApiError } from '../lib/claude'

const PASS_MARK = 0.6

export default function Grammar() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [progress, setProgress] = useState<Map<string, LessonProgress>>(new Map())

  const refresh = useCallback(async () => {
    const rows = await allLessonProgress()
    setProgress(new Map(rows.map((r) => [r.id, r])))
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => stopSpeech, [])

  if (asking) return <AskPanel onBack={() => setAsking(false)} />

  const lesson = openId ? LESSONS.find((l) => l.id === openId) : null
  if (lesson) {
    return (
      <LessonView
        lesson={lesson}
        onBack={() => {
          setOpenId(null)
          void refresh()
        }}
      />
    )
  }

  return (
    <>
      <header className="topbar">
        <h1>Grammar</h1>
      </header>
      <main className="screen">
        <button className="nav-card" onClick={() => setAsking(true)}>
          <span className="glyph" aria-hidden="true">
            💡
          </span>
          <span className="body">
            <strong>Ask a question</strong>
            <span className="muted">Anything about Swedish grammar, answered in English</span>
          </span>
          <span className="chev" aria-hidden="true">
            ›
          </span>
        </button>

        <div className="section-title">Lessons</div>
        {LESSONS.map((l) => {
          const p = progress.get(l.id)
          const passed = (p?.bestScore ?? 0) >= PASS_MARK
          return (
            <button key={l.id} className="nav-card" onClick={() => setOpenId(l.id)}>
              <span className="glyph" aria-hidden="true">
                {passed ? '✅' : l.level === 1 ? '①' : l.level === 2 ? '②' : '③'}
              </span>
              <span className="body">
                <strong>{l.title}</strong>
                <span className="muted">{l.summary}</span>
                {p && (
                  <span className="faint" style={{ display: 'block', marginTop: 4 }}>
                    Best score {Math.round(p.bestScore * 100)}% over {p.attempts} attempt
                    {p.attempts === 1 ? '' : 's'}
                  </span>
                )}
              </span>
              <span className="chev" aria-hidden="true">
                ›
              </span>
            </button>
          )
        })}
      </main>
    </>
  )
}

// --------------------------------------------------------------- lesson view

function LessonView({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) {
  const { settings } = useSettings()
  const [quizOpen, setQuizOpen] = useState(false)

  const say = (text: string) =>
    speak(text, { rate: settings.speechRate, voiceURI: settings.voiceURI })

  if (quizOpen) {
    return <Quiz lesson={lesson} onDone={onBack} onBack={() => setQuizOpen(false)} />
  }

  return (
    <>
      <header className="topbar">
        <button className="btn ghost" style={{ padding: '6px 10px' }} onClick={onBack}>
          ‹ Back
        </button>
        <h1 style={{ fontSize: 15 }}>{lesson.title}</h1>
      </header>
      <main className="screen">
        <div className="lesson-body">
          {lesson.sections.map((s) => (
            <section key={s.heading}>
              <h3>{s.heading}</h3>
              <p>{s.body}</p>
              {s.examples?.map((ex) => (
                <div className="ex" key={ex.sv}>
                  <div className="sv">
                    <span>{ex.sv}</span>
                    {SPEECH_OUTPUT_SUPPORTED && (
                      <button
                        className="mini-speak"
                        onClick={() => say(ex.sv)}
                        aria-label={`Play ${ex.sv}`}
                      >
                        🔊
                      </button>
                    )}
                  </div>
                  <div className="en">{ex.en}</div>
                  {ex.note && <div className="note">{ex.note}</div>}
                </div>
              ))}
            </section>
          ))}
        </div>

        <button
          className="btn primary wide"
          style={{ marginTop: 26 }}
          onClick={() => setQuizOpen(true)}
        >
          Take the quiz ({lesson.quiz.length} questions)
        </button>
      </main>
    </>
  )
}

// --------------------------------------------------------------------- quiz

function Quiz({
  lesson,
  onDone,
  onBack,
}: {
  lesson: Lesson
  onDone: () => void
  onBack: () => void
}) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  const recorded = useRef(false)

  const q = lesson.quiz[index]
  const last = index === lesson.quiz.length - 1

  const next = async () => {
    if (last) {
      setFinished(true)
      if (!recorded.current) {
        recorded.current = true
        await recordLessonResult(lesson.id, correct / lesson.quiz.length)
      }
    } else {
      setIndex((i) => i + 1)
      setPicked(null)
    }
  }

  if (finished) {
    const score = correct / lesson.quiz.length
    return (
      <>
        <header className="topbar">
          <h1 style={{ fontSize: 15 }}>{lesson.title}</h1>
        </header>
        <main className="screen">
          <div className="empty">
            <div className="big">{score >= PASS_MARK ? '🎉' : '📚'}</div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>
              {correct} / {lesson.quiz.length}
            </h2>
            <p className="muted">
              {score >= PASS_MARK
                ? 'Passed. This lesson is marked as done — reread it any time.'
                : 'Not quite. Read the lesson through once more and try again.'}
            </p>
            <button className="btn primary wide" style={{ marginTop: 22 }} onClick={onDone}>
              Back to lessons
            </button>
            <button
              className="btn wide"
              style={{ marginTop: 10 }}
              onClick={() => {
                setIndex(0)
                setPicked(null)
                setCorrect(0)
                setFinished(false)
                recorded.current = false
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <header className="topbar">
        <button className="btn ghost" style={{ padding: '6px 10px' }} onClick={onBack}>
          ‹ Lesson
        </button>
        <h1 style={{ fontSize: 15 }}>
          Question {index + 1} of {lesson.quiz.length}
        </h1>
      </header>
      <main className="screen">
        <div className="card">
          <p style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.45 }}>{q.prompt}</p>

          {q.options.map((opt, i) => {
            let cls = 'quiz-option'
            if (picked !== null) {
              if (i === q.answer) cls += ' correct'
              else if (i === picked) cls += ' wrong'
              else cls += ' dim'
            }
            return (
              <button
                key={opt}
                className={cls}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(i)
                  if (i === q.answer) setCorrect((c) => c + 1)
                }}
              >
                {opt}
              </button>
            )
          })}

          {picked !== null && <div className="explain">{q.explanation}</div>}
        </div>

        {picked !== null && (
          <button className="btn primary wide" style={{ marginTop: 14 }} onClick={() => void next()}>
            {last ? 'See result' : 'Next question'}
          </button>
        )}
      </main>
    </>
  )
}

// ------------------------------------------------------------------ ask panel

const SUGGESTIONS = [
  'When do I use "en" and when "ett"?',
  'What is the difference between "tycker om" and "gillar"?',
  'Why is it "Idag äter jag" and not "Idag jag äter"?',
  'How do I make a Swedish noun plural?',
]

function AskPanel({ onBack }: { onBack: () => void }) {
  const { settings } = useSettings()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const abort = useRef<AbortController | null>(null)

  useEffect(() => () => abort.current?.abort(), [])

  const ask = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError('')
    setAnswer('')
    abort.current?.abort()
    abort.current = new AbortController()
    try {
      const reply = await askGrammar(
        settings.apiKey,
        settings.model,
        trimmed,
        abort.current.signal,
      )
      setAnswer(reply)
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        setError(describeApiError(err))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <header className="topbar">
        <button className="btn ghost" style={{ padding: '6px 10px' }} onClick={onBack}>
          ‹ Back
        </button>
        <h1 style={{ fontSize: 15 }}>Ask about grammar</h1>
      </header>
      <main className="screen">
        {!settings.apiKey && (
          <div className="notice warn" style={{ marginBottom: 14 }}>
            This needs an Anthropic API key. Add one in Settings — the lessons above work without
            it.
          </div>
        )}

        <div className="field" style={{ marginTop: 0 }}>
          <textarea
            rows={3}
            value={question}
            placeholder="e.g. Why does the adjective change in 'det stora huset'?"
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <button
          className="btn primary wide"
          style={{ marginTop: 10 }}
          disabled={busy || !question.trim() || !settings.apiKey}
          onClick={() => void ask(question)}
        >
          {busy ? 'Thinking…' : 'Ask'}
        </button>

        {error && (
          <div className="notice error" style={{ marginTop: 14 }}>
            {error}
          </div>
        )}

        {answer && (
          <div className="card" style={{ marginTop: 14, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {answer}
          </div>
        )}

        {!answer && !busy && (
          <>
            <div className="section-title">Try one of these</div>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="quiz-option"
                disabled={!settings.apiKey}
                onClick={() => {
                  setQuestion(s)
                  void ask(s)
                }}
              >
                {s}
              </button>
            ))}
          </>
        )}
      </main>
    </>
  )
}
