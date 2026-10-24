# Native iOS version (plan)

Why: the web app can't keep audio running with the phone locked, can't use CarPlay, and mic access is
fragile in Safari. A native app fixes all three and could be sold on the App Store.

## Stack

- Expo (React Native, TypeScript). Build and submit with EAS Build / EAS Submit, so no Mac is required.
- Port, don't redesign: reuse the scheduling (`rate`, `plan`, `buildRide`), the 1–5 + command grammar
  (`parseCmd`) and the screen structure (Today, Practice, Words, Progress, Settings) from `src/app.html`.
  Put scheduling in a pure TypeScript module with unit tests that mirror docs/SCHEDULING.md.
- Audio: pre-generate one MP3 per word (word; definition; example; hook) with a neural TTS voice and
  bundle or download them. Play through an audio library with background mode enabled so it keeps
  going on the lock screen; add lock-screen / AirPods controls.
- Speech in: iOS on-device speech recognition through a React Native speech module. Keep "one recognizer at a time".
- Storage: on-device (SQLite or MMKV). Import the web app's backup code so existing progress carries over.
- Later: CarPlay audio app support, iCloud sync, Siri shortcut "Start my vocab ride".

## Before charging money

- Do NOT use GregMat's name, his group structure or his exact list in the paid app. Build an original
  high-frequency GRE list (the definitions, examples and hooks in data/words.json were written fresh and
  can be reused). Get a lawyer's view if it earns real money.
- Positioning: "hands-free vocab for your commute", not another flashcard app.
- Pricing idea: free first few sets, then a one-time unlock or short subscription. Apple Small Business
  Program commission is 15%; developer account is $99/year.
- Validate first: TestFlight with a handful of GRE takers; launch only if they keep using it past week two.

## Milestones

1. Expo skeleton + scheduling module with tests ported from tests/two_weeks.test.js.
2. Ride screen with pre-generated audio and background playback.
3. Voice ratings and commands.
4. Today / Practice / Words / Progress / Settings screens.
5. Backup-code import, TestFlight build.
