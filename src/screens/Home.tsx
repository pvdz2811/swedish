import { useEffect, useState } from 'react'
import type { Tab } from '../App'
import { allCards, allLessonProgress, loadDailyLog, streakFrom, todayKey } from '../lib/db'
import { deckStats, type DeckStats } from '../lib/srs'
import { LESSONS } from '../data/grammar'
import { GEOGRAPHY, HISTORY } from '../data/culture'
import { useSettings } from '../lib/useSettings'

function greeting(hour: number): string {
  if (hour < 5) return 'God natt'
  if (hour < 10) return 'God morgon'
  if (hour < 18) return 'Hej'
  return 'God kväll'
}

export default function Home({ go, dueCount }: { go: (t: Tab) => void; dueCount: number }) {
  const { settings } = useSettings()
  const [stats, setStats] = useState<DeckStats | null>(null)
  const [streak, setStreak] = useState(0)
  const [reviewedToday, setReviewedToday] = useState(0)
  const [lessonsDone, setLessonsDone] = useState(0)

  useEffect(() => {
    let live = true
    ;(async () => {
      const [cards, log, lessons] = await Promise.all([
        allCards(),
        loadDailyLog(),
        allLessonProgress(),
      ])
      if (!live) return
      setStats(deckStats(cards))
      setStreak(streakFrom(log))
      setReviewedToday(log[todayKey()] ?? 0)
      setLessonsDone(lessons.filter((l) => l.bestScore >= 0.6).length)
    })()
    return () => {
      live = false
    }
  }, [])

  const learned = stats ? stats.total - stats.new : 0
  const pct = stats && stats.total ? Math.round((learned / stats.total) * 100) : 0

  return (
    <>
      <header className="topbar">
        <h1>Svenska</h1>
        <div className="spacer" />
        <button className="speak-btn" onClick={() => go('settings')} aria-label="Settings">
          ⚙️
        </button>
      </header>

      <main className="screen">
        <section className="hero">
          <h2>{greeting(new Date().getHours())}!</h2>
          <p>
            {streak > 0
              ? `${streak} day${streak === 1 ? '' : 's'} in a row. ${reviewedToday} card${reviewedToday === 1 ? '' : 's'} reviewed today.`
              : 'Let us get a streak going — even five cards counts.'}
          </p>
        </section>

        <div className="section-title">Your deck</div>
        <div className="stat-grid">
          <div className="stat">
            <div className="n" style={{ color: dueCount > 0 ? 'var(--accent)' : undefined }}>
              {dueCount}
            </div>
            <div className="l">Due now</div>
          </div>
          <div className="stat">
            <div className="n">{learned}</div>
            <div className="l">Started</div>
          </div>
          <div className="stat">
            <div className="n">{stats?.mature ?? 0}</div>
            <div className="l">Solid</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="row">
            <strong style={{ fontSize: 14.5 }}>Vocabulary progress</strong>
            <div className="spacer" style={{ flex: 1 }} />
            <span className="pill accent">{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="faint" style={{ marginTop: 8 }}>
            {learned} of {stats?.total ?? 0} words started · {lessonsDone} of {LESSONS.length} grammar
            lessons passed
          </p>
        </div>

        <div className="section-title">Practise</div>

        <button className="nav-card" onClick={() => go('cards')}>
          <span className="glyph" aria-hidden="true">
            🃏
          </span>
          <span className="body">
            <strong>Flashcards</strong>
            <span className="muted">
              {dueCount > 0
                ? `${dueCount} card${dueCount === 1 ? '' : 's'} ready for review`
                : 'Nothing due — start some new words'}
            </span>
          </span>
          <span className="chev" aria-hidden="true">
            ›
          </span>
        </button>

        <button className="nav-card" onClick={() => go('grammar')}>
          <span className="glyph" aria-hidden="true">
            📖
          </span>
          <span className="body">
            <strong>Grammar</strong>
            <span className="muted">
              {LESSONS.length} lessons, each with a short quiz
            </span>
          </span>
          <span className="chev" aria-hidden="true">
            ›
          </span>
        </button>

        <button className="nav-card" onClick={() => go('culture')}>
          <span className="glyph" aria-hidden="true">
            🏛️
          </span>
          <span className="body">
            <strong>Culture</strong>
            <span className="muted">
              {GEOGRAPHY.length} places and {HISTORY.length} eras, each with a quiz
            </span>
          </span>
          <span className="chev" aria-hidden="true">
            ›
          </span>
        </button>

        <button className="nav-card" onClick={() => go('talk')}>
          <span className="glyph" aria-hidden="true">
            🎙️
          </span>
          <span className="body">
            <strong>Talk</strong>
            <span className="muted">
              {settings.apiKey
                ? 'Speak Swedish out loud, free or by theme'
                : 'Needs an API key — tap to set it up'}
            </span>
          </span>
          <span className="chev" aria-hidden="true">
            ›
          </span>
        </button>

        {!settings.apiKey && (
          <div className="notice warn" style={{ marginTop: 14 }}>
            Flashcards and grammar work offline right now. The conversation partner needs an
            Anthropic API key —{' '}
            <button className="link" onClick={() => go('settings')}>
              add one in Settings
            </button>
            .
          </div>
        )}
      </main>
    </>
  )
}
