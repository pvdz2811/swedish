import Anthropic from '@anthropic-ai/sdk'
import type { Theme } from '../data/themes'
import type { StoredMessage } from './db'

/**
 * The key lives in this device's IndexedDB and is sent only to api.anthropic.com.
 * Anthropic's guidance allows `dangerouslyAllowBrowser` for exactly this shape of
 * app: a single trusted user running a personal tool with their own key. If this
 * ever grows a second user, the call belongs behind a server instead.
 */
export const MODELS = [
  {
    id: 'claude-opus-5',
    label: 'Opus 5',
    hint: 'Best Swedish and the sharpest corrections. Roughly 1–2 cents per exchange.',
  },
  {
    id: 'claude-sonnet-5',
    label: 'Sonnet 5',
    hint: 'Clearly cheaper, still very good for everyday conversation.',
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Haiku 4.5',
    hint: 'Cheapest and fastest. Simpler Swedish, blunter corrections.',
  },
] as const

export type ModelId = (typeof MODELS)[number]['id']
export const DEFAULT_MODEL: ModelId = 'claude-opus-5'

/**
 * Server-side refusal fallback. A Swedish tutor will essentially never trip a
 * safety classifier, but if it ever does, this reroutes instead of failing.
 * Disabled automatically if the account does not have the beta.
 */
const FALLBACK_BETA = 'server-side-fallback-2026-07-01'
let fallbacksUnavailable = false

function client(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export class MissingKeyError extends Error {
  constructor() {
    super('No API key set yet. Add one in Settings.')
    this.name = 'MissingKeyError'
  }
}

export function looksLikeKey(key: string): boolean {
  return /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(key.trim())
}

interface CallOptions {
  apiKey: string
  model: ModelId
  system: string
  messages: Anthropic.MessageParam[]
  maxTokens: number
  signal?: AbortSignal
}

interface CallResult {
  text: string
  refused: boolean
}

/**
 * One request, with the refusal fallback when it is available.
 * Effort is pinned low: these are short conversational turns, and latency is
 * felt directly because the reply gets spoken aloud.
 */
async function call(options: CallOptions): Promise<CallResult> {
  if (!options.apiKey) throw new MissingKeyError()
  const anthropic = client(options.apiKey)

  const shared = {
    model: options.model,
    max_tokens: options.maxTokens,
    system: options.system,
    messages: options.messages,
    output_config: { effort: 'low' as const },
  }

  const send = async (withFallbacks: boolean) => {
    if (withFallbacks) {
      return anthropic.beta.messages.create(
        { ...shared, betas: [FALLBACK_BETA], fallbacks: 'default' },
        { signal: options.signal },
      )
    }
    return anthropic.messages.create(shared, { signal: options.signal })
  }

  let response: Awaited<ReturnType<typeof send>>
  try {
    response = await send(!fallbacksUnavailable)
  } catch (err) {
    // If this account does not have the fallback beta, stop asking for it and
    // retry once on the stable endpoint rather than killing the conversation.
    if (!fallbacksUnavailable && err instanceof Anthropic.BadRequestError) {
      fallbacksUnavailable = true
      response = await send(false)
    } else {
      throw err
    }
  }

  const text = response.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n')
    .trim()

  return { text, refused: response.stop_reason === 'refusal' }
}

// ------------------------------------------------------------------- prompting

const TUTOR_RULES = `You are a warm, patient Swedish conversation partner for an absolute beginner whose native language is English. They have just started and know only a few hundred words.

HOW TO SPEAK
- Reply in Swedish, in one or two short sentences. Never more than three.
- Use simple present-tense Swedish and high-frequency vocabulary. Short main clauses.
- Always end your turn with a question, so the learner has something easy to answer.
- Never switch to English in your Swedish line, even if the learner writes in English. If they write in English, reply in simple Swedish to what they meant.
- Stay in character for the scenario, but keep it moving. Do not stall on one exchange.

OUTPUT FORMAT
Reply with exactly these three lines and nothing else. No preamble, no markdown, no blank lines.

SV: <your Swedish reply>
EN: <a plain English translation of your Swedish reply>
FIX: <feedback on the learner's Swedish, or a single hyphen>

THE FIX LINE
- If the learner's last message had a mistake worth correcting, give the corrected Swedish followed by a very short reason in English. Example: FIX: "Jag är hungrig" - "jag" needs the verb "är" here.
- Correct at most one thing per turn, and always the most important one. Ignore typos and missing capitals.
- If the learner wrote good Swedish, or wrote in English, or this is the opening turn, write exactly: FIX: -
- Never put the correction in the SV line. It belongs only on the FIX line.`

function systemPrompt(theme: Theme, corrections: boolean): string {
  const parts = [TUTOR_RULES, `\nSCENARIO\n${theme.setting}`]
  if (!corrections) {
    parts.push('\nThe learner has turned corrections off. Always write exactly: FIX: -')
  }
  return parts.join('\n')
}

export interface TutorReply {
  swedish: string
  english: string
  correction: string | null
}

/** Parses the three-line contract, tolerating a model that drifts from it. */
export function parseReply(raw: string): TutorReply {
  const text = raw.trim()
  const grab = (tag: string): string => {
    const match = text.match(new RegExp(`^${tag}:[ \\t]*(.*)$`, 'mi'))
    return match ? match[1].trim() : ''
  }

  const swedish = grab('SV')
  const english = grab('EN')
  const fix = grab('FIX')

  return {
    // If the format broke entirely, fall back to the first line rather than
    // showing the learner an empty bubble.
    swedish: swedish || text.split('\n')[0]?.trim() || text,
    english,
    correction: !fix || fix === '-' || fix === '—' ? null : fix,
  }
}

/**
 * Replays only what was actually said. Sending our own EN/FIX scaffolding back
 * would teach the model to treat that formatting as conversational content.
 */
function toApiMessages(history: StoredMessage[]): Anthropic.MessageParam[] {
  return history.map((m) => ({ role: m.role, content: m.text }))
}

/** Keeps the request bounded on a long conversation without losing the thread. */
const MAX_HISTORY_TURNS = 24

export interface TutorRequest {
  apiKey: string
  model: ModelId
  theme: Theme
  history: StoredMessage[]
  userText: string
  corrections: boolean
  signal?: AbortSignal
}

export async function askTutor(req: TutorRequest): Promise<TutorReply> {
  const trimmed = req.history.slice(-MAX_HISTORY_TURNS)
  const { text, refused } = await call({
    apiKey: req.apiKey,
    model: req.model,
    system: systemPrompt(req.theme, req.corrections),
    messages: [...toApiMessages(trimmed), { role: 'user', content: req.userText }],
    maxTokens: 400,
    signal: req.signal,
  })

  if (refused) {
    throw new Error('The model declined to answer that one. Try rephrasing.')
  }
  return parseReply(text)
}

// ------------------------------------------------------------- grammar helper

const GRAMMAR_SYSTEM = `You are a Swedish grammar tutor answering a complete beginner whose native language is English.

- Answer in English. Keep it under 150 words.
- Lead with the direct answer in one sentence, then explain it.
- Give two or three short Swedish examples, each with its English translation.
- If the question rests on a false assumption about Swedish, say so plainly.
- Use plain prose and short example lines. No markdown headings, no bullet symbols, no bold.
- If the question is not about Swedish, say that you only cover Swedish.`

export async function askGrammar(
  apiKey: string,
  model: ModelId,
  question: string,
  signal?: AbortSignal,
): Promise<string> {
  const { text, refused } = await call({
    apiKey,
    model,
    system: GRAMMAR_SYSTEM,
    messages: [{ role: 'user', content: question }],
    maxTokens: 800,
    signal,
  })
  if (refused) return 'I could not answer that one. Try asking it a different way.'
  return text
}

/** Verifies a key works, so Settings can confirm it rather than failing later. */
export async function testKey(apiKey: string, model: ModelId): Promise<void> {
  await call({
    apiKey,
    model,
    system: 'Reply with the single word: ok',
    messages: [{ role: 'user', content: 'ping' }],
    maxTokens: 16,
  })
}

/** Turns SDK errors into something worth showing a user. */
export function describeApiError(err: unknown): string {
  if (err instanceof MissingKeyError) return err.message
  if (err instanceof Anthropic.AuthenticationError)
    return 'That API key was rejected. Check it in Settings.'
  if (err instanceof Anthropic.PermissionDeniedError)
    return 'This key does not have access to that model. Try another model in Settings.'
  if (err instanceof Anthropic.RateLimitError)
    return 'Rate limited by the API. Wait a few seconds and try again.'
  if (err instanceof Anthropic.NotFoundError)
    return 'That model was not found. Pick another one in Settings.'
  if (err instanceof Anthropic.APIConnectionError)
    return 'Could not reach the API. Check your connection.'
  if (err instanceof Anthropic.APIError) return `API error: ${err.message}`
  if (err instanceof Error) return err.message
  return 'Something went wrong.'
}
