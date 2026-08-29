import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from './db'
import { DEFAULT_MODEL, type ModelId } from './claude'

/** Model choice lives alongside the other settings but is typed separately. */
export interface AppSettings extends Settings {
  model: ModelId
}

const DEFAULTS: AppSettings = { ...DEFAULT_SETTINGS, model: DEFAULT_MODEL }

interface Ctx {
  settings: AppSettings
  update: (patch: Partial<AppSettings>) => void
  /** False until the stored settings have come back from IndexedDB. */
  ready: boolean
}

const SettingsContext = createContext<Ctx | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let live = true
    loadSettings().then((stored) => {
      if (!live) return
      setSettings({ ...DEFAULTS, ...(stored as Partial<AppSettings>) })
      setReady(true)
    })
    return () => {
      live = false
    }
  }, [])

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      // Persist in the background; the UI has already moved on.
      void saveSettings(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ settings, update, ready }), [settings, update, ready])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
