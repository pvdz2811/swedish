import { VOCABULARY } from '../data/vocabulary'
import { isDue, isNew, type CardState } from './srs'

/**
 * Builds today's study queue.
 *
 * This lives on its own because three screens need to agree on it: the home
 * screen's "due now" figure, the tab badge, and the review screen itself.
 * When they disagree, the app looks broken.
 */

/** Position in the seed deck, so new words arrive grouped by topic. */
const ORDER = new Map(VOCABULARY.map((w, i) => [w.id, i]))

export function startOfToday(now: Date = new Date()): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Cards met for the first time today. A card is "first met" when it has been
 * reviewed at least once, most recently today, and has not yet built up a
 * streak — which is exactly the state a card is in after its first grading.
 */
export function introducedToday(cards: CardState[], dayStart = startOfToday()): number {
  return cards.filter((c) => c.totalReviews > 0 && c.lastReviewed >= dayStart && c.reps <= 1).length
}

export interface QueueOptions {
  newPerDay: number
  now?: number
  /** Ignore the daily budget and the schedule — used by "study ahead". */
  ahead?: boolean
}

export function buildQueue(cards: CardState[], options: QueueOptions): CardState[] {
  const now = options.now ?? Date.now()

  const reviews = cards.filter((c) => !isNew(c) && isDue(c, now)).sort((a, b) => a.due - b.due)

  const fresh = cards
    .filter(isNew)
    .sort((a, b) => (ORDER.get(a.id) ?? 0) - (ORDER.get(b.id) ?? 0))

  if (!options.ahead) {
    const budget = Math.max(0, options.newPerDay - introducedToday(cards))
    return [...reviews, ...fresh.slice(0, budget)]
  }

  // Study-ahead: offer the next batch of new words regardless of the budget,
  // and if the deck is fully started, pull the soonest reviews forward.
  if (fresh.length > 0) {
    return [...reviews, ...fresh.slice(0, Math.max(options.newPerDay, 10))]
  }
  const notYetDue = cards.filter((c) => !isDue(c, now)).sort((a, b) => a.due - b.due)
  return [...reviews, ...notYetDue.slice(0, 20)]
}

/** How many cards are waiting right now, respecting the daily new-card budget. */
export function dueCount(cards: CardState[], newPerDay: number, now = Date.now()): number {
  return buildQueue(cards, { newPerDay, now }).length
}
