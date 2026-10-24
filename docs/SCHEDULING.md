# The loop (scheduling)

Goal: weak words keep coming back daily until they're genuinely learned, instead of the learner
blitzing through 1,000 words before seeing a miss again. All logic lives in `rate()` and `plan()` in `src/app.html`.

## States

| State | Meaning | Comes back |
|---|---|---|
| Unseen | Never rated | When the daily new-word budget introduces it |
| Learning ("weak list") | Seen but not yet strong on enough separate days | Every `ret` days (default: every day) |
| Review | Graduated | Spaced out: ~4 days, then interval × ease (≈10, ≈25…), capped at 180 |
| Mastered | Review with an interval of 21+ days | Same as review; a display label only |
| Archived | Removed by the user | Never, until unarchived |

## Rules (Standard preset)

- A rating of 4–5 (`weak3="1"` makes it 3–5) puts or keeps a word in Learning, due tomorrow.
  A 5 is also due again in 10 minutes and is re-inserted a few cards later in the same ride (`reps` times at most).
- Learning → Review after a 1–2 rating on `grad` separate days (default 2). A 1 counts double.
- In Review: 3 → slightly longer interval and lower ease; 2 → interval × ease; 1 → longer and higher ease.
  4–5 sends it back to Learning and counts a lapse (`L`). Three or more lapses mark it a "trouble word",
  which always gets its memory hook read aloud.
- Only the first rating of a calendar day moves a word's schedule forward. Later ratings that day
  (rides, practice, the words list) can only pull it closer. A word missed twice in one day waits
  for tomorrow — it never loops all day.
- `space` (0.8 / 1 / 1.3) scales Review intervals.

## Daily plan

- New words per day: `newDay` (default 15). "Learn 10 more" adds to today's budget (`P.days[d].xn`).
- New words pause when the Learning list is over `weakCap` (default 40). The gate is decided once per
  morning (`P.days[d].gate`), so graduations during the day don't flood in new words.
- A ride's queue: due Learning words first (yesterday's misses, while the learner is fresh), then due
  reviews with new words interleaved every few cards. Ride size or time limit comes from `rideLen`.

## Presets

| | Light | Standard | Intense |
|---|---|---|---|
| Weak words return | every 2 days | every day | every day |
| Counts as weak | 4–5 | 4–5 | 3–5 |
| Strong days to graduate | 2 | 2 | 3 |
| Extra looks in a ride | 1 | 2 | 2 |
| Review spacing | wider (1.3) | normal | tighter (0.8) |
| New words / day | 10 | 15 | 20 |
| Pause new words at | 25 weak | 40 | 60 |

## Invariants (tested)

1. With `ret=1`, every word whose last rating on day d was weak appears in a ride on day d+1 (`two_weeks.test.js`).
2. A word is never due more than once in the same day after its second miss.
3. Changing loop settings never reschedules existing words; it applies from the next rating.
4. `migrate()` keeps older saves working (v2 → v3: strong words with interval ≥ 4 become Review).
