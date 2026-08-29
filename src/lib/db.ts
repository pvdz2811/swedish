import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { newCard, type CardState } from './srs'
import { VOCABULARY } from '../data/vocabulary'

export interface LessonProgress {
  id: string
  /** Epoch ms of the first time the quiz was passed. */
  completedAt: number
  /** Best quiz score as a fraction 0–1. */
  bestScore: number
  attempts: number
}

export interface StoredMessage {
  role: 'user' | 'assistant'
  /** What was actually said, in Swedish. */
  text: string
  /** The tutor's English gloss of its own Swedish, if it gave one. */
  translation?: string
  /** A correction of the learner's previous turn, if the tutor offered one. */
  correction?: string
  at: number
}

export interface Session {
  id: string
  themeId: string
  startedAt: number
  updatedAt: number
  messages: StoredMessage[]
}

export interface Settings {
  /** Anthropic API key. Stored on this device only — never transmitted anywhere but api.anthropic.com. */
  apiKey: string
  /**
   * Only needed for account-wide ("identity-linked") keys, which can reach more
   * than one workspace and so must say which one to bill. Blank for keys that
   * were created inside a single workspace.
   */
  workspaceId: string
  /** Voice URI of the preferred Swedish TTS voice, or '' for the browser default. */
  voiceURI: string
  /** Playback rate for spoken Swedish. Beginners usually want this below 1. */
  speechRate: number
  /**
   * Which shape of utterance this device's TTS engine accepts. Android engines
   * vary; Settings can probe them and store whichever one actually speaks.
   */
  speechStrategy: string
  /** Speak the tutor's replies aloud automatically. */
  autoSpeak: boolean
  /** Show the English gloss under the tutor's Swedish without tapping. */
  showTranslations: boolean
  /** Correct the learner's Swedish as the conversation goes. */
  corrections: boolean
  /** New cards to introduce per day. */
  newPerDay: number
  /** Which direction flashcards are asked in. */
  cardDirection: 'sv-en' | 'en-sv' | 'mixed'
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  workspaceId: '',
  voiceURI: '',
  speechRate: 0.85,
  speechStrategy: 'voice-rate',
  autoSpeak: true,
  showTranslations: true,
  corrections: true,
  newPerDay: 10,
  cardDirection: 'mixed',
}

interface SvenskaDB extends DBSchema {
  cards: { key: string; value: CardState }
  lessons: { key: string; value: LessonProgress }
  sessions: { key: string; value: Session; indexes: { updatedAt: number } }
  meta: { key: string; value: unknown }
}

const DB_NAME = 'svenska'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<SvenskaDB>> | null = null

function db(): Promise<IDBPDatabase<SvenskaDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SvenskaDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        database.createObjectStore('cards', { keyPath: 'id' })
        database.createObjectStore('lessons', { keyPath: 'id' })
        const sessions = database.createObjectStore('sessions', { keyPath: 'id' })
        sessions.createIndex('updatedAt', 'updatedAt')
        database.createObjectStore('meta')
      },
    })
  }
  return dbPromise
}

// ----------------------------------------------------------------------- cards

/**
 * Makes sure every word in the seed deck has a card row.
 * Safe to call on every launch — words added to the deck in a later release
 * get picked up here, and existing progress is left untouched.
 */
export async function ensureCards(): Promise<void> {
  const database = await db()
  const existing = new Set(await database.getAllKeys('cards'))
  const missing = VOCABULARY.filter((w) => !existing.has(w.id))
  if (missing.length === 0) return
  const tx = database.transaction('cards', 'readwrite')
  await Promise.all([...missing.map((w) => tx.store.put(newCard(w.id))), tx.done])
}

export async function allCards(): Promise<CardState[]> {
  return (await db()).getAll('cards')
}

export async function getCard(id: string): Promise<CardState | undefined> {
  return (await db()).get('cards', id)
}

export async function saveCard(card: CardState): Promise<void> {
  await (await db()).put('cards', card)
}

export async function resetAllCards(): Promise<void> {
  const database = await db()
  const tx = database.transaction('cards', 'readwrite')
  await tx.store.clear()
  await tx.done
  await ensureCards()
}

// --------------------------------------------------------------------- lessons

export async function allLessonProgress(): Promise<LessonProgress[]> {
  return (await db()).getAll('lessons')
}

export async function recordLessonResult(id: string, score: number): Promise<void> {
  const database = await db()
  const prev = await database.get('lessons', id)
  await database.put('lessons', {
    id,
    completedAt: prev?.completedAt ?? Date.now(),
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    attempts: (prev?.attempts ?? 0) + 1,
  })
}

// -------------------------------------------------------------------- sessions

export async function saveSession(session: Session): Promise<void> {
  await (await db()).put('sessions', session)
}

export async function recentSessions(limit = 20): Promise<Session[]> {
  const database = await db()
  const all = await database.getAllFromIndex('sessions', 'updatedAt')
  return all.reverse().slice(0, limit)
}

export async function getSession(id: string): Promise<Session | undefined> {
  return (await db()).get('sessions', id)
}

export async function deleteSession(id: string): Promise<void> {
  await (await db()).delete('sessions', id)
}

// -------------------------------------------------------------------- settings

/**
 * Settings live in IndexedDB alongside everything else so there is exactly one
 * place to clear when the user wants their data gone.
 */
export async function loadSettings(): Promise<Settings> {
  const stored = (await (await db()).get('meta', 'settings')) as Partial<Settings> | undefined
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await (await db()).put('meta', settings, 'settings')
}

// ------------------------------------------------------------------ daily log

/** Reviews completed per calendar day, keyed 'YYYY-MM-DD', for the streak counter. */
export type DailyLog = Record<string, number>

export function todayKey(now: Date = new Date()): string {
  // Local date, not UTC — a study streak should follow the learner's own midnight.
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function loadDailyLog(): Promise<DailyLog> {
  return ((await (await db()).get('meta', 'dailyLog')) as DailyLog | undefined) ?? {}
}

export async function bumpDailyLog(count = 1): Promise<DailyLog> {
  const database = await db()
  const log = ((await database.get('meta', 'dailyLog')) as DailyLog | undefined) ?? {}
  const key = todayKey()
  log[key] = (log[key] ?? 0) + count
  await database.put('meta', log, 'dailyLog')
  return log
}

/** Consecutive days up to and including today (or yesterday, if today is untouched). */
export function streakFrom(log: DailyLog, now: Date = new Date()): number {
  let streak = 0
  const cursor = new Date(now)
  // A streak survives until the end of today, so start counting from yesterday
  // if nothing has been reviewed yet today.
  if (!log[todayKey(cursor)]) cursor.setDate(cursor.getDate() - 1)
  while (log[todayKey(cursor)]) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// ----------------------------------------------------------------------- wipe

export async function eraseEverything(): Promise<void> {
  const database = await db()
  await Promise.all(
    (['cards', 'lessons', 'sessions', 'meta'] as const).map(async (name) => {
      const tx = database.transaction(name, 'readwrite')
      await tx.store.clear()
      await tx.done
    }),
  )
}
