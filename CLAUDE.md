# Commute Verbal

Hands-free GRE vocabulary trainer built for a train/car commute. The app speaks a word, pauses for recall,
reads the definition, an example and a memory hook, then listens for a spoken 1–5 rating
(1 = nailed it, 5 = blank) and schedules the word with a spaced-repetition "loop".

- Live app: https://aidenwright973.github.io/commute-verbal/ (GitHub Pages, `main` branch, repo root)
- Owner uses it from an iPhone Home Screen icon, in Safari, often hands-free while driving.
- 1,112 words (GregMat's GRE list, in his original order; definitions/examples/hooks written fresh).

## Layout

```
src/app.html        The whole app: markup, CSS and JS in one file. Contains __DATA__ once.
data/words.json     [word, definition, example, memory hook] × 1112, one entry per line, GregMat order.
build.py            src/app.html + data/words.json → index.html  (stdlib only)
index.html          BUILT OUTPUT that GitHub Pages serves. Never edit by hand.
tests/              jsdom simulations of the real app (see Testing)
docs/SCHEDULING.md  The loop algorithm in plain terms, plus its invariants
docs/NATIVE_PLAN.md Plan for a native iOS (Expo) version and App Store launch
```

## Commands

```
python3 build.py      # rebuild index.html after any change to src/ or data/
npm install           # once, for the test dependency (jsdom)
npm test              # builds, then runs every simulation; must be all PASS before pushing
git push              # deploys: GitHub Pages republishes in ~1 minute
```

Always run `npm test` before committing. Commit `index.html` together with the source change that produced it.

## How src/app.html is organised

The script is split by banner comments, in this order:
settings → progress store → scheduling → speech out → audio cues → speech in → ride engine →
today plan card → practice → words list → progress → settings → loop + ride length → tabs & refresh.

Key state and functions:
- `S` settings object, saved to localStorage `cv2_settings`. Loop keys: `grad`, `weak3`, `ret`, `reps`,
  `space`, `newDay`, `weakCap`; presets in `PRESETS`. Ride length `rideLen` is `"20"`, `"all"`, `"t20"` (minutes) or a custom number string.
- `P` progress, saved to localStorage `cv2_progress`. `P.w[word] = {r, h, due, iv, ef, g, gr, L, a, s, t}`
  (last rating, rating history string, due timestamp, interval days, ease, strong-day count while learning,
  graduated flag, lapses, archived, starred, last rated). `P.days["YYYY-MM-DD"] = {n, ms, r[5], nw, xn, gate, cap}`.
  `migrate()` upgrades older saves; keep it backward compatible — the owner has real progress on his phone.
- `rate(word, r)` is the only place scheduling happens. `plan()` decides what's due today; `buildRide()` builds the queue.
- Ride engine: `start/stop/loop/playCard/getRating/applyRating/finish`. Every async chain checks the `tok`
  token so pausing/skipping cancels in-flight speech and listening.
- Speech in: `listen()` wraps webkitSpeechRecognition. Only ONE recognizer may run at a time (`killRec()`);
  overlapping recognizers make iOS stop hearing the user. `parseCmd()` maps speech to 1–5 or a command.
- Backup code = base64 of `JSON.stringify(P)`; restore merges per word (newest `t` wins).
- When published as a Claude artifact, `initCloud()` syncs `P` through the artifact `db` capability.
  On GitHub Pages `window.claude` is undefined and the app uses localStorage only.

## Conventions

- Vanilla JS, no framework, no runtime dependencies, no bundler. Keep it a single self-contained page.
- Colors are CSS custom properties on `:root`, redefined in the two dark-mode blocks. Never hard-code a color in a component rule.
- Render user-visible data with `textContent` (or `esc()`), never raw `innerHTML` with word data.
- Mobile first (390px wide). Respect `env(safe-area-inset-*)`. Buttons ≥ 44px tall.
- Copy is plain and direct. The owner prefers minimal, non-flashy formatting.
- Anything that changes scheduling must keep the invariants in docs/SCHEDULING.md and keep `two_weeks.test.js` passing.

## Platform gotchas (learned the hard way)

- iOS Safari: speech recognition needs Settings → General → Keyboard → Enable Dictation, and the first
  `recognition.start()` must happen inside a tap (that's what `micCheck()` is for).
- The microphone is always blocked when the page runs inside the claude.ai artifact iframe. Voice answers only work from the GitHub Pages URL.
- iOS stops web audio and speech when the phone locks. The app requests a screen wake lock; a native app is the real fix.
- Safari Home Screen icons keep separate localStorage from Safari tabs — tell users to always open from one place.
- Some Premium iOS voices are not exposed to web pages. `vScore()` ranks the voices that are.

## Testing

`tests/run.js` runs each simulation in jsdom with fake speechSynthesis/SpeechRecognition and, where needed, a fake clock:
- `features.test.js`: tap ratings, star/archive, search, filters, practice, progress, backup/reset/restore, settings, migration.
- `ride_and_loop.test.js`: ride length picker (words, all, custom, timed ride that stops on time), loop presets.
- `voice_ride.test.js`: a full hands-free ride driven by scripted speech (numbers, repeat, star, mumbling, skip, pause/resume).
- `mic_denied.test.js`: denied microphone shows the fix-it note instead of failing silently.
- `two_weeks.test.js`: 14 simulated days with a learner model. Every word missed on day d must come back on day d+1.

For visual checks, screenshot with Playwright at 390×844 in light and dark.
