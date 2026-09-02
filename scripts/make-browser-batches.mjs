#!/usr/bin/env node
/**
 * make-browser-batches.mjs — prepare paste-ready text for generating the whole
 * narration library by hand in the ElevenLabs web app.
 *
 * WHY: the free plan blocks Voice Library voices (Zara and friends) over the
 * API, but the website itself can use them. So the split of labour is: YOU
 * generate in the browser, this script prepares exactly what to paste and
 * records what came out in what order, and split-browser-audio.mjs cuts the
 * downloads back into the 588 individual clips.
 *
 * THE ORDER FILE IS THE CONTRACT. Each batch writes its clip ids, in order,
 * into batches/index.json. The splitter trusts that file absolutely — so
 * generate each batch from the .txt EXACTLY as written, in order, and do not
 * re-order, edit or merge them. If you regenerate one batch, regenerate the
 * whole batch, not part of it.
 *
 * SEPARATOR / COST TRADE-OFF: every character you paste is billed, separators
 * included. A big obvious gap between clips makes splitting reliable but eats
 * the allowance; a small one is cheap and risks two clips being cut as one.
 * --sep-mode picks the trade-off and --report shows the exact arithmetic
 * before you spend anything.
 *
 * USAGE
 *   node scripts/make-browser-batches.mjs --report
 *   node scripts/make-browser-batches.mjs
 *   node scripts/make-browser-batches.mjs --sep-mode break --max-chars 2000
 *
 * FLAGS
 *   --report          print the character arithmetic and exit (writes nothing)
 *   --max-chars <n>   per-batch cap (default 2500 — the usual free-tier limit
 *                     for one generation in the web app)
 *   --sep-mode <m>    blank | newline | dots | break   (default blank)
 *                       blank   "\n\n"                 2 chars/gap
 *                       newline "\n"                   1 char/gap  (cheapest,
 *                                                      least reliable)
 *                       dots    "\n...\n"              6 chars/gap
 *                       break   <break time="1.5s" />  ~24 chars/gap (most
 *                                                      reliable, most costly)
 *   --out <dir>       output directory (default audio-batches/)
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, "src/playlab/shared/audio/manifest.json");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d = null) => (has(f) ? (argv[argv.indexOf(f) + 1] ?? d) : d);

const REPORT = has("--report");
const MAX_CHARS = Number(val("--max-chars", "2500"));
const SEP_MODE = val("--sep-mode", "blank");
const OUT_DIR = join(ROOT, val("--out", "audio-batches"));
const INCLUDE_UNUSED = has("--include-unused");

const SEPARATORS = {
  newline: "\n",
  blank: "\n\n",
  dots: "\n...\n",
  break: '\n<break time="1.5s" />\n',
};
const SEP = SEPARATORS[SEP_MODE];
if (!SEP) {
  console.error(`Unknown --sep-mode "${SEP_MODE}". Use: ${Object.keys(SEPARATORS).join(" | ")}`);
  process.exitCode = 1;
  process.exit();
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

/** Same precedence the API generator uses, so the browser path speaks exactly
 *  what the API path would have — IPA SSML is never pasted, it would be read
 *  out as literal tags. */
function textFor(clip) {
  return clip.elevenSpeak ?? clip.speakFree ?? clip.speak ?? clip.text;
}

/**
 * Which clip ids the app can actually reach.
 *
 * Ids are built two ways in the codebase: as plain literals ("cheer-amazing")
 * and by template (`hunt-find-${l}`). So collect every template PREFIX that
 * appears in source and treat any id under one as live. That is deliberately
 * generous — it will call a clip live on a weak signal rather than skip one the
 * game needs, because a skipped clip is silence in a child's ear while a spare
 * one only costs characters.
 */
function reachableIds() {
  const files = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/[.](ts|tsx)$/.test(e.name)) files.push(p);
    }
  })(join(ROOT, "src"));
  const src = files.map((f) => readFileSync(f, "utf8")).join("\n");

  const prefixes = new Set();
  const re = /[`'"]([a-z][a-z-]*?-)\$\{/g;
  let m;
  while ((m = re.exec(src))) prefixes.add(m[1]);

  return (id) =>
    src.includes(`"${id}"`) ||
    src.includes(`'${id}'`) ||
    src.includes(`\`${id}\``) ||
    [...prefixes].some((p) => id.startsWith(p));
}

const isReachable = reachableIds();

/**
 * One entry per OUTPUT FILE, not per clip id.
 *
 * Several ids legitimately share a file — `word-a` and `treat-word-apple` both
 * resolve to /audio/words/apple.mp3 — so generating per id would pay twice to
 * write the same bytes to the same path.
 */
const seenFile = new Map();
const skippedUnused = [];
const skippedDuplicate = [];

for (const [id, clip] of Object.entries(manifest.clips)) {
  const text = textFor(clip);
  if (!INCLUDE_UNUSED && !isReachable(id)) {
    skippedUnused.push({ id, chars: text.length });
    continue;
  }
  const existing = seenFile.get(clip.file);
  if (existing) {
    existing.ids.push(id);
    skippedDuplicate.push({ id, chars: text.length });
    continue;
  }
  seenFile.set(clip.file, { ids: [id], file: clip.file, text });
}

const clips = [...seenFile.values()];

// ── batching ───────────────────────────────────────────────────────────────
const batches = [];
let current = [];
let currentChars = 0;

for (const c of clips) {
  const add = c.text.length + (current.length ? SEP.length : 0);
  if (current.length && currentChars + add > MAX_CHARS) {
    batches.push(current);
    current = [];
    currentChars = 0;
  }
  current.push(c);
  currentChars += c.text.length + (current.length > 1 ? SEP.length : 0);
}
if (current.length) batches.push(current);

const contentChars = clips.reduce((n, c) => n + c.text.length, 0);
const sepChars = batches.reduce((n, b) => n + Math.max(0, b.length - 1) * SEP.length, 0);
const totalChars = contentChars + sepChars;

// Very short lines are the ones a silence-split is most likely to swallow or
// mis-cut, so count them up front rather than discovering it after paying.
const shortClips = clips.filter((c) => c.text.length <= 3);

/**
 * A separator only marks a boundary if it does NOT also occur inside the clips.
 *
 * This is the failure that cost a full generation: "..." was chosen as the
 * separator while 188 clips already contained "..." in their own script
 * ("ah... alligator!"). Every one of those produced an internal pause identical
 * to the boundary pause, so the recording was unsplittable the moment it was
 * made — and that was only discovered after the characters were spent. Check it
 * before printing anything, and refuse rather than warn.
 */
const sepToken = SEP.trim();
const colliding = sepToken ? clips.filter((c) => c.text.includes(sepToken)) : [];
if (colliding.length) {
  console.error(
    `\n  SEPARATOR COLLISION — "${sepToken}" appears inside ${colliding.length} of ${clips.length} clips,\n` +
      `  e.g. ${colliding
        .slice(0, 3)
        .map((c) => JSON.stringify(c.text))
        .join(", ")}\n\n` +
      `  Those clips would contain a pause identical to the one separating clips,\n` +
      `  so the recording could not be split afterwards. Pick a separator that does\n` +
      `  not occur in the script:\n` +
      `      --sep-mode blank     (blank line)\n` +
      `      --sep-mode break     (<break time="1.5s" />, most reliable)\n`
  );
  process.exitCode = 1;
  process.exit();
}

console.log(`\n  clips           : ${clips.length}`);
console.log(`  batches         : ${batches.length}  (max ${MAX_CHARS} chars each)`);
console.log(
  `  separator       : ${SEP_MODE}  (${SEP.length} chars x ${clips.length - batches.length} gaps)`
);
console.log(`  content chars   : ${contentChars.toLocaleString()}`);
console.log(`  separator chars : ${sepChars.toLocaleString()}`);
console.log(`  TOTAL TO PASTE  : ${totalChars.toLocaleString()}`);
console.log(`  free allowance  : 10,000 / month`);

const headroom = 10000 - totalChars;
if (headroom < 0) {
  console.log(`  >> OVER BUDGET by ${(-headroom).toLocaleString()} chars on a fresh free month.`);
} else {
  console.log(
    `  headroom        : ${headroom.toLocaleString()} chars (before anything already used)`
  );
}

if (shortClips.length) {
  console.log(
    `\n  ${shortClips.length} clip(s) are <=3 characters ("${shortClips
      .slice(0, 6)
      .map((c) => c.text)
      .join('", "')}"...).`
  );
  console.log(`  These are the ones a silence-split most easily gets wrong — check them first.`);
}
const skippedUnusedChars = skippedUnused.reduce((n, c) => n + c.chars, 0);
const skippedDupChars = skippedDuplicate.reduce((n, c) => n + c.chars, 0);
const savedChars = skippedUnusedChars + skippedDupChars;

if (savedChars) {
  console.log(`\n  NOT generated (and why):`);
  if (skippedUnused.length) {
    console.log(
      `    ${String(skippedUnused.length).padStart(3)} clips  ${String(skippedUnusedChars).padStart(5)} chars  nothing in src/ plays them` +
        ` — e.g. ${skippedUnused
          .slice(0, 3)
          .map((c) => c.id)
          .join(", ")}`
    );
  }
  if (skippedDuplicate.length) {
    console.log(
      `    ${String(skippedDuplicate.length).padStart(3)} clips  ${String(skippedDupChars).padStart(5)} chars  share an output file with a clip already listed` +
        ` — e.g. ${skippedDuplicate
          .slice(0, 3)
          .map((c) => c.id)
          .join(", ")}`
    );
  }
  console.log(
    `    saved ${savedChars.toLocaleString()} chars of the ${(totalChars + savedChars).toLocaleString()} a naive run would cost.`
  );
  console.log(`    (--include-unused re-adds the unreferenced ones.)`);
}
console.log();

if (REPORT) {
  console.log("  --report: nothing written.\n");
  process.exit();
}

// ── write ──────────────────────────────────────────────────────────────────
// Clear only what THIS script owns — the .txt prompts and index.json.
// The directory also holds the mp3s downloaded from the browser, which are
// hand-made work that cannot be regenerated without spending quota again, so
// wiping the folder wholesale (as this once did) destroyed them.
mkdirSync(OUT_DIR, { recursive: true });
const keptAudio = [];
for (const name of readdirSync(OUT_DIR)) {
  if (/^batch-\d+\.txt$/.test(name) || name === "index.json") {
    rmSync(join(OUT_DIR, name));
  } else if (/\.mp3$/i.test(name)) {
    keptAudio.push(name);
  }
}
if (keptAudio.length) {
  console.log(
    `  kept ${keptAudio.length} downloaded mp3(s) in place — but they were cut from the\n` +
      `  PREVIOUS prompts. If the clip list changed, re-download the affected batches.\n`
  );
}

const index = {
  $comment:
    "Written by scripts/make-browser-batches.mjs. THE SPLITTER TRUSTS THIS FILE. " +
    "Generate each batch from its .txt exactly as written, in order, and save the " +
    "download as the audioFile name below. Do not reorder or edit.",
  sepMode: SEP_MODE,
  separator: SEP,
  maxChars: MAX_CHARS,
  totalChars,
  batches: [],
};

const pad = (n) => String(n).padStart(2, "0");

for (const [i, batch] of batches.entries()) {
  const name = `batch-${pad(i + 1)}`;
  const body = batch.map((c) => c.text).join(SEP);
  writeFileSync(join(OUT_DIR, `${name}.txt`), body, "utf8");
  index.batches.push({
    batch: name,
    audioFile: `${name}.mp3`,
    chars: body.length,
    count: batch.length,
    clips: batch.map((c) => ({ ids: c.ids, file: c.file, text: c.text })),
  });
}

writeFileSync(join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2) + "\n", "utf8");

const rel = relative(ROOT, OUT_DIR);
console.log(`  wrote ${batches.length} batch file(s) + index.json to ${rel}/\n`);
for (const b of index.batches) {
  console.log(
    `    ${b.batch}.txt   ${String(b.count).padStart(3)} clips  ${String(b.chars).padStart(5)} chars`
  );
}
console.log(`
  NEXT
    1. Open https://elevenlabs.io/app/speech-synthesis and pick your voice.
    2. For each batch IN ORDER: paste the whole .txt, generate, download.
    3. Save each download into ${rel}/ as batch-01.mp3, batch-02.mp3, ...
       (the audioFile name in index.json — the splitter looks for exactly that).
    4. node scripts/split-browser-audio.mjs --check
`);
