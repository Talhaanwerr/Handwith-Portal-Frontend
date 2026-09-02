#!/usr/bin/env node
/**
 * cut-from-timestamps.mjs — cut a batch recording using a TRANSCRIPT as the
 * source of truth for where each clip starts.
 *
 * Every earlier approach tried to infer boundaries from the audio alone and got
 * them wrong, because the pauses between clips and the pauses inside clips are
 * the same length. A transcript removes the guessing entirely: it says which
 * words occur when, so the boundaries are read rather than deduced.
 *
 * TWO PROBLEMS THE TRANSCRIPT ALONE DOES NOT SOLVE, both handled here:
 *
 * 1. NOTATION DRIFT. Transcript tools change format partway through — this one
 *    emits "0:98" (raw seconds) and later "2:18" (minutes:seconds), so a naive
 *    parse jumps backwards. Each timestamp is therefore resolved to the smallest
 *    reading that still runs forward, which repairs the switch without needing
 *    to know where it happened.
 *
 * 2. REPEATED TIMES. At one-second resolution neighbours can share a stamp —
 *    "ih" and "igloo!" both land on 0:43. A run of equal stamps is spread
 *    evenly up to the next distinct time so no clip ends up empty.
 *
 * USAGE
 *   node scripts/cut-from-timestamps.mjs --batch batch-01 --plan
 *   node scripts/cut-from-timestamps.mjs --batch batch-01 --stage
 *
 * FLAGS
 *   --batch <name>     which batch (needs audio-batches/<name>.timestamps.txt)
 *   --plan             report the mapping and exit, writing nothing
 *   --stage            write to audio-batches/staged/ (default; use --live to
 *                      write straight into public/)
 *   --live             write into public/audio (backs originals up first)
 *   --pad <s>          extra audio kept either side of each cut (default 0)
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  statSync,
  renameSync,
} from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, join, relative } from "node:path";

const run = promisify(execFile);
const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");
const BACKUP_DIR = join(ROOT, "audio-backup");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d = null) => (has(f) ? (argv[argv.indexOf(f) + 1] ?? d) : d);

const BATCH = val("--batch", "batch-01");
const PLAN = has("--plan");
const LIMIT = val("--limit") ? Number(val("--limit")) : null;
const LIVE = has("--live");
const PAD = Number(val("--pad", "0"));
const BATCH_DIR = join(ROOT, val("--out", "audio-batches"));

const rel = (p) => relative(ROOT, p).split(/[\\/]/).join("/");

/**
 * Resolve "M:S" against the time already reached.
 *
 * Three readings are plausible for a given pair — M*60+S, M*100+S, or the raw
 * seconds — and which is right changes partway through the file. Taking the
 * smallest reading that does not go backwards repairs the switch automatically:
 * a real M:SS time wins while the sequence is dense, and the raw-seconds reading
 * takes over exactly when M:SS would rewind.
 */
function parseTime(str, prev) {
  const m = String(str)
    .trim()
    .match(/^(\d+):(\d+)$/);
  if (!m) return null;
  const a = Number(m[1]),
    b = Number(m[2]);
  const options = [a * 60 + b, a * 100 + b, b].filter((v) => v >= prev).sort((x, y) => x - y);
  return options.length ? options[0] : Math.max(prev, a * 60 + b);
}

async function duration(file) {
  const { stdout } = await run(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { windowsHide: true }
  );
  return Number(String(stdout).trim());
}

function backup(outPath) {
  if (!existsSync(outPath)) return false;
  const dest = join(BACKUP_DIR, relative(PUBLIC_DIR, outPath));
  if (existsSync(dest)) return false;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(outPath, dest);
  return true;
}

async function cut(src, start, end, dest, doBackup) {
  const tmp = `${dest}.part`;
  mkdirSync(dirname(dest), { recursive: true });
  await run(
    "ffmpeg",
    [
      "-y",
      "-i",
      src,
      "-ss",
      String(Math.max(0, start - PAD)),
      "-to",
      String(end + PAD),
      "-c:a",
      "libmp3lame",
      "-q:a",
      "2",
      "-f",
      "mp3",
      tmp,
    ],
    { windowsHide: true }
  );
  if (!existsSync(tmp) || statSync(tmp).size === 0) throw new Error("ffmpeg produced no audio");
  if (doBackup) backup(dest);
  renameSync(tmp, dest);
}

async function main() {
  const tsPath = join(BATCH_DIR, `${BATCH}.timestamps.txt`);
  if (!existsSync(tsPath)) {
    console.error(`No ${rel(tsPath)}`);
    process.exitCode = 1;
    return;
  }
  const index = JSON.parse(readFileSync(join(BATCH_DIR, "index.json"), "utf8"));
  const batch = index.batches.find((b) => b.batch === BATCH);
  if (!batch) {
    console.error(`No batch "${BATCH}" in index.json`);
    process.exitCode = 1;
    return;
  }
  const audio = join(BATCH_DIR, batch.audioFile);
  if (!existsSync(audio)) {
    console.error(`No ${rel(audio)}`);
    process.exitCode = 1;
    return;
  }

  // Transcript lines, in order.
  const lines = readFileSync(tsPath, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  let prev = 0;
  const anchors = [];
  for (const line of lines) {
    const m = line.match(/^(\d+:\d+)\s+(.*)$/);
    if (!m) continue;
    const t = parseTime(m[1], prev);
    prev = t;
    anchors.push({ t, text: m[2] });
  }

  console.log(`\n  ${BATCH}`);
  console.log(`    transcript lines : ${anchors.length}`);
  console.log(`    script clips     : ${batch.count}`);

  if (anchors.length !== batch.count) {
    console.error(
      `    MISMATCH — the transcript has ${anchors.length} lines but the script has ` +
        `${batch.count} clips. They must correspond one-to-one.`
    );
    process.exitCode = 1;
    return;
  }

  const total = await duration(audio);
  console.log(`    audio            : ${total.toFixed(1)}s`);

  // A timestamp marks where its clip ENDS, not where it starts. So each clip
  // runs from the previous timestamp up to its own, and the first runs from the
  // top of the file: A. = 0-1s, ah = 1-3s, apple! = 3-4s. Reading them as start
  // times shifts every clip one place and cuts each one off mid-word.
  const times = anchors.map((a) => a.t);

  // Equal neighbours ("ih" and "igloo!" both at 0:43) would leave the earlier one
  // with no length at all, so a run of identical stamps is spread back across the
  // space since the last distinct time.
  const ends = times.slice();
  for (let i = 0; i < times.length;) {
    let j = i;
    while (j + 1 < times.length && times[j + 1] === times[i]) j++;
    if (j > i) {
      const prev = i > 0 ? times[i - 1] : 0;
      const span = (times[i] - prev) / (j - i + 1);
      for (let k = i; k <= j; k++) ends[k] = prev + span * (k - i + 1);
    }
    i = j + 1;
  }

  const starts = ends.map((_, i) => (i === 0 ? 0 : ends[i - 1]));
  ends[ends.length - 1] = Math.max(ends[ends.length - 1], total);

  const dupes = times.length - new Set(times).size;
  if (dupes) console.log(`    repeated timestamps spread evenly: ${dupes}`);

  console.log(`\n    first 6 and last 3 cuts:`);
  const show = [
    ...anchors.slice(0, 6).keys(),
    ...[anchors.length - 3, anchors.length - 2, anchors.length - 1],
  ];
  for (const i of show) {
    const c = batch.clips[i];
    console.log(
      `      ${String(i + 1).padStart(3)}  ${starts[i].toFixed(2)}-${ends[i].toFixed(2)}s  ` +
        `${(c.ids?.[0] ?? c.id).padEnd(22)} ${JSON.stringify(anchors[i].text)}`
    );
  }

  // The transcript and the script must actually be describing the same thing.
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const disagree = batch.clips.filter((c, i) => norm(c.text) !== norm(anchors[i].text));
  if (disagree.length) {
    console.log(`\n    NOTE: ${disagree.length} line(s) differ in wording from the script`);
    for (const c of disagree.slice(0, 5)) {
      const i = batch.clips.indexOf(c);
      console.log(
        `      ${i + 1}: script ${JSON.stringify(c.text)} vs transcript ${JSON.stringify(anchors[i].text)}`
      );
    }
    console.log(`      (position is what matters — this is only a spelling difference check)`);
  }

  if (PLAN) {
    console.log(`\n  --plan: nothing written.\n`);
    return;
  }

  const root = LIVE ? PUBLIC_DIR : join(BATCH_DIR, "staged");
  let wrote = 0;
  const map = [];
  const todo = LIMIT ? batch.clips.slice(0, LIMIT) : batch.clips;
  for (const [i, c] of todo.entries()) {
    const dest = join(root, c.file.replace(/^\//, ""));
    try {
      await cut(audio, starts[i], ends[i], dest, LIVE);
      wrote++;
      map.push({
        n: i + 1,
        id: c.ids?.[0] ?? c.id,
        file: c.file.replace(/^\//, ""),
        text: c.text,
        start: +starts[i].toFixed(2),
        end: +ends[i].toFixed(2),
      });
    } catch (err) {
      console.error(`    FAIL ${c.ids?.[0] ?? c.id}: ${err.message}`);
    }
  }

  writeFileSync(join(BATCH_DIR, `${BATCH}.cuts.json`), JSON.stringify(map, null, 2) + "\n", "utf8");
  console.log(`\n  ${LIVE ? "wrote" : "staged"} ${wrote} clip(s) -> ${rel(root)}`);
  console.log(`  cut map: ${rel(join(BATCH_DIR, `${BATCH}.cuts.json`))}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
