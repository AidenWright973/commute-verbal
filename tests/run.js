// Runs every simulation against the built index.html and exits non-zero on any failure.
//   npm test            (runs `python3 build.py` first via the pretest script)
// Each test loads the app in jsdom with fake speech synthesis / recognition and a controllable clock.
const { spawnSync } = require("child_process");
const path = require("path");

const PRESETS = {
  light: { grad: 2, weak3: "0", ret: 2, reps: 1, space: 1.3, newDay: 10, weakCap: 25 },
  standard: {},
  intense: { grad: 3, weak3: "1", ret: 1, reps: 2, space: 0.8, newDay: 20, weakCap: 60 },
};

const checks = [
  ["features.test.js", {}, (o) => /^PASS/m.test(o) && !/^FAIL/m.test(o)],
  ["ride_and_loop.test.js", {}, (o) => /^PASS/m.test(o) && !/^FAIL/m.test(o)],
  ["mic_denied.test.js", {}, (o) => /note shown: true/.test(o)],
  ["voice_ride.test.js", {}, (o) => /SAY: Ride complete/.test(o) && !/TWO RECOGNIZERS/.test(o)],
  // Every word missed on day d must come back on day d+1 (standard/intense loops).
  ...["standard", "intense"].map((p) => ["two_weeks.test.js", { PRESET: JSON.stringify(PRESETS[p]), LABEL: p },
    (o) => { const m = o.match(/came back the next day: (\d+) of (\d+)/); return m && m[1] === m[2] && +m[2] > 0; }]),
];

let failed = 0;
for (const [file, env, ok] of checks) {
  const r = spawnSync("node", [path.join(__dirname, file)], { env: { ...process.env, ...env }, encoding: "utf8", timeout: 300000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const pass = ok(out);
  if (!pass) failed++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${file}${env.LABEL ? ` (${env.LABEL} loop)` : ""}`);
  if (!pass) console.log(out.split("\n").filter((l) => /FAIL|Error|came back|note shown/.test(l)).slice(0, 15).join("\n"));
}
process.exit(failed ? 1 : 0);
