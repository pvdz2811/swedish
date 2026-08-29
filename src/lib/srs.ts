/**
 * SM-2 spaced repetition, lightly adapted.
 *
 * The classic algorithm grades recall 0–5. Four buttons is the practical
 * number for a phone screen, so the UI grades map onto the SM-2 scale below.
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy'

/** Maps a button to the SM-2 quality score it stands for. */
const QUALITY: Record<Grade, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
}

export interface CardState {
  /** Matches Word.id. */
  id: string
  /** Consecutive successful reviews. Reset to 0 on a lapse. */
  reps: number
  /** SM-2 easiness factor. Never drops below 1.3. */
  ease: number
  /** Current interval in days. 0 means "still being learned". */
  interval: number
  /** Epoch ms at which the card becomes due. */
  due: number
  /** How many times this card has been forgotten after being learned. */
  lapses: number
  /** Epoch ms of the last review, or 0 if never reviewed. */
  lastReviewed: number
  /** Total reviews ever, including lapses. Used for statistics only. */
  totalReviews: number
}

const MINUTE = 60_000
const DAY = 86_400_000

export function newCard(id: string): CardState {
  return {
    id,
    reps: 0,
    ease: 2.5,
    interval: 0,
    due: 0, // due immediately — a brand new card is always ready to learn
    lapses: 0,
    lastReviewed: 0,
    totalReviews: 0,
  }
}

/**
 * Applies a grade and returns the updated state.
 * `now` is injected so the scheduling is testable and so a single review
 * session uses one consistent clock.
 */
export function review(card: CardState, grade: Grade, now: number = Date.now()): CardState {
  const q = QUALITY[grade]
  const next: CardState = {
    ...card,
    lastReviewed: now,
    totalReviews: card.totalReviews + 1,
  }

  // The easiness factor moves on every review, including failures.
  next.ease = Math.max(1.3, card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))

  if (q < 3) {
    // Forgotten. Send it back to the start of the learning queue and show it
    // again in a few minutes rather than waiting a whole day.
    next.reps = 0
    next.interval = 0
    next.lapses = card.lapses + 1
    next.due = now + 5 * MINUTE
    return next
  }

  // A card graded "hard" on its very first pass has not been learned yet.
  // Sending it a full day away would be optimistic; bring it back this session.
  if (grade === 'hard' && card.reps === 0) {
    next.reps = 0
    next.interval = 0
    next.due = now + 10 * MINUTE
    return next
  }

  next.reps = card.reps + 1
  if (next.reps === 1) {
    next.interval = grade === 'easy' ? 4 : 1
  } else if (next.reps === 2) {
    next.interval = grade === 'easy' ? 10 : 6
  } else {
    next.interval = Math.round(card.interval * next.ease)
  }

  // "Hard" should not stretch the interval as far as "good" would.
  if (grade === 'hard') {
    next.interval = Math.max(1, Math.round(next.interval * 0.6))
  }

  next.due = now + next.interval * DAY
  return next
}

export function isDue(card: CardState, now: number = Date.now()): boolean {
  return card.due <= now
}

/** A card that has never been graded successfully is still "new" to the learner. */
export function isNew(card: CardState): boolean {
  return card.totalReviews === 0
}

export interface DeckStats {
  total: number
  new: number
  due: number
  learning: number
  mature: number
}

/** A card is "mature" once its interval passes three weeks. */
export const MATURE_DAYS = 21

export function deckStats(cards: CardState[], now: number = Date.now()): DeckStats {
  let fresh = 0
  let due = 0
  let learning = 0
  let mature = 0
  for (const c of cards) {
    if (isNew(c)) fresh++
    else if (c.interval >= MATURE_DAYS) mature++
    else learning++
    if (isDue(c, now)) due++
  }
  return { total: cards.length, new: fresh, due, learning, mature }
}

/** Human-readable preview of when each button would schedule the card. */
export function intervalPreview(card: CardState, grade: Grade): string {
  // Scheduling from time zero makes `due` read directly as a delay.
  const next = review(card, grade, 0)
  const days = next.interval
  if (days < 1) return `${Math.round(next.due / 60_000)} min`
  if (days === 1) return '1 day'
  if (days < 30) return `${days} days`
  const months = Math.round(days / 30)
  if (months < 12) return `${months} mo`
  return `${(days / 365).toFixed(1)} yr`
}
