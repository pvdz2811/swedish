import { useCallback, useEffect, useState } from 'react'
import Home from './screens/Home'
import Cards from './screens/Cards'
import Grammar from './screens/Grammar'
import Culture from './screens/Culture'
import Talk from './screens/Talk'
import SettingsScreen from './screens/Settings'
import { allCards, ensureCards } from './lib/db'
import { dueCount } from './lib/queue'
import { loadVoices, primeSpeechOnFirstGesture } from './lib/speech'
import { useSettings } from './lib/useSettings'

export type Tab = 'home' | 'cards' | 'grammar' | 'culture' | 'talk' | 'settings'

const TABS: { id: Tab; label: string; glyph: string }[] = [
  { id: 'home', label: 'Home', glyph: '🏠' },
  { id: 'cards', label: 'Cards', glyph: '🃏' },
  { id: 'grammar', label: 'Grammar', glyph: '📖' },
  { id: 'culture', label: 'Culture', glyph: '🏛️' },
  { id: 'talk', label: 'Talk', glyph: '🎙️' },
]

export default function App() {
  const { settings, ready } = useSettings()
  const [tab, setTab] = useState<Tab>('home')
  const [due, setDue] = useState(0)
  const [seeded, setSeeded] = useState(false)

  const refreshDue = useCallback(async () => {
    const cards = await allCards()
    setDue(dueCount(cards, settings.newPerDay))
  }, [settings.newPerDay])

  useEffect(() => {
    let live = true
    ;(async () => {
      await ensureCards()
      // Warm the voice list early — the first getVoices() call is usually empty.
      void loadVoices()
      // Unlock Android's speech engine on the very first tap, wherever it lands.
      primeSpeechOnFirstGesture()
      if (live) setSeeded(true)
    })()
    return () => {
      live = false
    }
  }, [])

  // Recount whenever the deck is seeded, the tab changes, or the budget moves.
  const booted = seeded && ready
  useEffect(() => {
    if (booted) void refreshDue()
  }, [tab, booted, refreshDue])

  if (!booted) {
    return (
      <div className="app">
        <div className="empty" style={{ margin: 'auto' }}>
          <div className="big">🇸🇪</div>
          <p className="muted">Laddar…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {tab === 'home' && <Home go={setTab} dueCount={due} />}
      {tab === 'cards' && <Cards onReviewed={refreshDue} />}
      {tab === 'grammar' && <Grammar />}
      {tab === 'culture' && <Culture />}
      {tab === 'talk' && <Talk />}
      {tab === 'settings' && <SettingsScreen onBack={() => setTab('home')} />}

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span className="glyph" aria-hidden="true">
              {t.glyph}
            </span>
            {t.id === 'cards' && due > 0 && (
              <span className="badge">{due > 99 ? '99+' : due}</span>
            )}
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
