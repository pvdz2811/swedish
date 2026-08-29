# Svenska

A Swedish learning app for a Galaxy S25, built as an installable PWA: flashcards
with spaced repetition, grammar lessons with quizzes, and a spoken conversation
partner powered by Claude.

Vocabulary and grammar work completely offline. Only the conversation partner
and the grammar Q&A need a network connection.

## What you need

- **Node.js 20+** (already installed if you got this far)
- **An Anthropic API key** for the Talk screen — <https://console.anthropic.com/settings/keys>
- **A GitHub account**, to host the app so your phone can install it

## Running it locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. The microphone and speech synthesis both work on
`localhost` without HTTPS.

## Live site

**<https://pvdz2811.github.io/swedish/>**

Deployed from the `gh-pages` branch of this repo. To ship an update:

```bash
npm run deploy
```

That builds with the correct base path (`/swedish/`), pushes `dist/` to
`gh-pages`, and the site refreshes within a minute or two. Nothing else to do —
Pages is already configured.

The app must be served over HTTPS: Android Chrome blocks the microphone and
service workers on plain `http`, so serving from a PC over WiFi will not work.

> The repository is public because GitHub Pages does not serve private repos on
> a free account. That is safe here — the API key is entered at runtime and
> stored in the browser, never committed. Note that a Pages site is publicly
> reachable on *every* plan, so a private repo would not have made the app
> private either.

### Installing on the phone

1. Open the URL in Chrome → menu → **Add to Home screen**. It then launches
   fullscreen with its own icon.
2. Settings → Accessibility → Text-to-speech output → **install Swedish**,
   otherwise replies are read with the wrong accent.
3. Open the app, paste your API key in Settings, and allow the microphone the
   first time you tap the mic.

### On the phone, one time

- **Install the Swedish voice**, or replies will be read in the wrong accent:
  Settings → Accessibility → Text-to-speech output → install Swedish.
- **Allow the microphone** when Chrome asks, the first time you tap the mic.

## The API key

Open Settings in the app (the gear on the Home screen), paste your key and tap
**Test key**.

The key is stored in this device's IndexedDB and sent only to `api.anthropic.com`
— it is never committed and never passes through any other server. This works
because the app calls Claude directly from the browser with
`dangerouslyAllowBrowser`, which Anthropic sanctions for exactly this case: one
trusted user running a personal tool with their own key.

The tradeoff is real, so treat the key as disposable. Use a key created only for
this app, and rotate it if you share or lose the device. If this ever becomes
multi-user, the API call has to move behind a server.

Roughly 1–2 cents per exchange on Opus 5. Settings has cheaper models if you
want to talk for longer.

## How it is put together

| Path | What it holds |
| --- | --- |
| `src/data/vocabulary.ts` | 231-word beginner deck, nouns carrying their `en`/`ett` gender |
| `src/data/grammar.ts` | 11 lessons, each with sections, examples and a quiz |
| `src/data/themes.ts` | Conversation scenarios and their opening lines |
| `src/lib/srs.ts` | SM-2 scheduling, adapted to four grade buttons |
| `src/lib/queue.ts` | Builds the daily queue — the one source of truth for "due" |
| `src/lib/db.ts` | IndexedDB: cards, lesson scores, sessions, settings, streak |
| `src/lib/speech.ts` | Web Speech recognition (`sv-SE`) and synthesis |
| `src/lib/claude.ts` | Anthropic client, tutor prompt, reply parsing |
| `src/screens/` | Home, Cards, Grammar, Talk, Settings |

### Adding vocabulary

Append to `VOCABULARY` in `src/data/vocabulary.ts`. Give each entry a **new,
never-reused `id`** — that id is the IndexedDB key, so renumbering an existing
entry would silently hand its review history to a different word. New entries are
picked up on next launch without touching existing progress.

### Adding a conversation theme

Append to `THEMES` in `src/data/themes.ts`. `setting` is written as an
instruction to the tutor describing the role it should play; `opener` is the
first line it says.

## Known limits

- **Speech recognition needs a connection.** Chrome's `SpeechRecognition` runs in
  the cloud. Offline, you can still type — and flashcards and grammar are
  unaffected.
- **iOS Safari cannot do speech recognition**, so the mic is disabled there. The
  target is Chrome on Android.
- Conversations are saved locally but there is no screen to browse them yet.
