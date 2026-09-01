import { useCallback, useEffect, useRef, useState } from 'react'
import { GEOGRAPHY, HISTORY, type CultureTopic } from '../data/culture'
import { allLessonProgress, recordLessonResult, type LessonProgress } from '../lib/db'

const PASS_MARK = 0.6

export default function Culture() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [progress, setProgress] = useState<Map<string, LessonProgress>>(new Map())

  const refresh = useCallback(async () => {
    const rows = await allLessonProgress()
    setProgress(new Map(rows.map((r) => [r.id, r])))
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const topic = openId
    ? [...GEOGRAPHY, ...HISTORY].find((t) => t.id === openId)
    : null

  if (topic) {
    return (
      <TopicView
        topic={topic}
        onBack={() => {
          setOpenId(null)
          void refresh()
        }}
      />
    )
  }

  const group = (title: string, blurb: string, topics: CultureTopic[]) => (
    <section key={title}>
      <div className="section-title">{title}</div>
      <p className="muted" style={{ margin: '-4px 2px 10px' }}>
        {blurb}
      </p>
      {topics.map((t) => {
        const p = progress.get(t.id)
        const passed = (p?.bestScore ?? 0) >= PASS_MARK
        return (
          <button key={t.id} className="nav-card" onClick={() => setOpenId(t.id)}>
            <span className="glyph" aria-hidden="true">
              {passed ? '✅' : t.icon}
            </span>
            <span className="body">
              <strong>{t.title}</strong>
              <span className="muted">{t.summary}</span>
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
    </section>
  )

  return (
    <>
      <header className="topbar">
        <h1>Culture</h1>
      </header>
      <main className="screen">
        {group('Geography', 'The places, and what makes each of them itself.', GEOGRAPHY)}
        {group('History', 'The turning points that still shape the country.', HISTORY)}
      </main>
    </>
  )
}

// ---------------------------------------------------------------- topic view

function TopicView({ topic, onBack }: { topic: CultureTopic; onBack: () => void }) {
  const [quizOpen, setQuizOpen] = useState(false)

  if (quizOpen) {
    return <Quiz topic={topic} onDone={onBack} onBack={() => setQuizOpen(false)} />
  }

  return (
    <>
      <header className="topbar">
        <button className="btn ghost" style={{ padding: '6px 10px' }} onClick={onBack}>
          ‹ Back
        </button>
        <h1 style={{ fontSize: 15 }}>{topic.title}</h1>
      </header>
      <main className="screen">
        <div className="lesson-body">
          {topic.sections.map((s) => (
            <section key={s.heading}>
              <h3>{s.heading}</h3>
              <p>{s.body}</p>
              {s.facts && s.facts.length > 0 && (
                <div className="facts">
                  {s.facts.map((f) => (
                    <div className="fact" key={f.label}>
                      <span className="fact-label">{f.label}</span>
                      <span className="fact-value">{f.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <button
          className="btn primary wide"
          style={{ marginTop: 26 }}
          onClick={() => setQuizOpen(true)}
        >
          Take the quiz ({topic.quiz.length} questions)
        </button>
      </main>
    </>
  )
}

// --------------------------------------------------------------------- quiz

function Quiz({
  topic,
  onDone,
  onBack,
}: {
  topic: CultureTopic
  onDone: () => void
  onBack: () => void
}) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  const recorded = useRef(false)

  const q = topic.quiz[index]
  const last = index === topic.quiz.length - 1

  const next = async () => {
    if (last) {
      setFinished(true)
      if (!recorded.current) {
        recorded.current = true
        await recordLessonResult(topic.id, correct / topic.quiz.length)
      }
    } else {
      setIndex((i) => i + 1)
      setPicked(null)
    }
  }

  if (finished) {
    const score = correct / topic.quiz.length
    return (
      <>
        <header className="topbar">
          <h1 style={{ fontSize: 15 }}>{topic.title}</h1>
        </header>
        <main className="screen">
          <div className="empty">
            <div className="big">{score >= PASS_MARK ? '🎉' : '📚'}</div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>
              {correct} / {topic.quiz.length}
            </h2>
            <p className="muted">
              {score >= PASS_MARK
                ? 'Passed. Reread it any time — the facts stick better on a second pass.'
                : 'Not quite. Read it through once more and try again.'}
            </p>
            <button className="btn primary wide" style={{ marginTop: 22 }} onClick={onDone}>
              Back to Culture
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
          ‹ Read
        </button>
        <h1 style={{ fontSize: 15 }}>
          Question {index + 1} of {topic.quiz.length}
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
