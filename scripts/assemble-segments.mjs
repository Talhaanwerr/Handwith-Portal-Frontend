#!/usr/bin/env node
/**
 * assemble-segments.mjs — rebuild the individual clips from a batch recording
 * by DROPPING silence and MERGING each clip's own fragments.
 *
 * WHY THIS WORKS WHERE BOUNDARY-GUESSING FAILED
 *
 * Earlier attempts tried to pick which silences were "real" boundaries, and
 * could not: the separator pauses and the pauses inside clips are the same
 * length, so no threshold or ranking separated them. Listening to the raw cuts
 * showed the actual shape of the problem — the cuts themselves were RIGHT, there
 * were just too many of them:
 *
 *   seg-1 "A."   seg-2 "ah"   seg-3 "apple!"   seg-4 (silence)   seg-5 "B." ...
 *
 * So the excess is two known, separable things:
 *   1. SILENT segments — the gap between two adjacent pauses. Detectable by mean
 *      volume: silence sits near -48dB, speech near -16dB, no overlap.
 *   2. FRAGMENTS — one clip cut at its own punctuation. "Find the A! A is for
 *      Ant!" becomes two pieces. How many pieces each clip breaks into is not a
 *      guess: it is written in the script, as the number of sentence breaks the
 *      text contains.
 *
 * Remove (1), then walk the script consuming 1 + breaks(clip) segments per clip,
 * and the arithmetic either closes exactly or it does not. When it closes, every
 * boundary is accounted for and the result is verifiable rather than hopeful.
 *
 * USAGE
 *   node scripts/assemble-segments.mjs --batch batch-01 --plan
 *   node scripts/assemble-segments.mjs --batch batch-01 --stage
 *   node scripts/assemble-segments.mjs --batch batch-01          (write to public/)
 *
 * FLAGS
 *   --plan             report the arithmetic and exit, writing nothing
 *   --stage            write to audio-batches/staged/ instead of public/
 *   --batch <name>     one batch (default: all with audio present)
 *   --silence <dB>     mean volume at or below which a segment is silence (-40)
 *   --min-silence <s>  detector gap length (0.15)
 *   --threshold <dB>   detector noise floor (-40)
 *   --pad <s>          padding kept around each cut (0.06)
 */
import {
  readFileSync,
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

const PLAN = has("--plan");
const STAGE = has("--stage");
const ONE = val("--batch");
const SILENCE_DB = Number(val("--silence", "-40"));
const MIN_SIL = val("--min-silence", "0.15");
const THRESHOLD = val("--threshold", "-40");
const PAD = Number(val("--pad", "0.06"));
const BATCH_DIR = join(ROOT, val("--out", "audio-batches"));

const rel = (p) => relative(ROOT, p).split(/[\\/]/).join("/");

/** Sentence breaks INSIDE a clip — how many extra pieces it will arrive in. */
const breaksIn = (t) => Math.max(0, t.split(/[.!?]+/).filter((p) => p.trim()).length - 1);

async function duration(file) {
  const { stdout } = await run(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { windowsHide: true }
  );
  return Number(String(stdout).trim());
}

async function detect(file) {
  const total = await duration(file);
  let err = "";
  try {
    const r = await run(
      "ffmpeg",
      ["-i", file, "-af", `silencedetect=noise=${THRESHOLD}dB:d=${MIN_SIL}`, "-f", "null", "-"],
      { windowsHide: true, maxBuffer: 64 * 1024 * 1024 }
    );
    err = String(r.stderr ?? "");
  } catch (e) {
    err = String(e.stderr ?? "");
  }
  const sil = [];
  const re = /silence_start:\s*(-?[\d.]+)|silence_end:\s*(-?[\d.]+)/g;
  let m,
    pend = null;
  while ((m = re.exec(err))) {
    if (m[1] !== undefined) pend = Number(m[1]);
    else if (pend !== null) {
      sil.push([pend, Number(m[2])]);
      pend = null;
    }
  }
  if (pend !== null) sil.push([pend, total]);

  const segs = [];
  let cursor = 0;
  for (const [s, e] of sil) {
    if (s - cursor > 0.08) segs.push([cursor, s]);
    cursor = e;
  }
  if (total - cursor > 0.08) segs.push([cursor, total]);
  return { segs, total };
}

/** Mean loudness of one time range, used to tell silence from speech. */
async function meanVolume(file, start, end) {
  let err = "";
  try {
    const r = await run(
      "ffmpeg",
      ["-ss", String(start), "-to", String(end), "-i", file, "-af", "volumedetect", "-f", "null", "-"],
      { windowsHide: true, maxBuffer: 16 * 1024 * 1024 }
    );
    err = String(r.stderr ?? "");
  } catch (e) {
    err = String(e.stderr ?? "");
  }
  const m = err.match(/mean_volume:\s*(-?[\d.]+) dB/);
  return m ? Number(m[1]) : -99;
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
  const indexPath = join(BATCH_DIR, "index.json");
  if (!existsSync(indexPath)) {
    console.error(`No ${rel(indexPath)} — run make-browser-batches.mjs first.`);
    process.exitCode = 1;
    return;
  }
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  let batches = index.batches.filter((b) => existsSync(join(BATCH_DIR, b.audioFile)));
  if (ONE) batches = batches.filter((b) => b.batch === ONE);
  if (!batches.length) {
    console.error(ONE ? `No batch "${ONE}" with audio.` : "No batch audio found.");
    process.exitCode = 1;
    return;
  }

  let totalWrote = 0,
    failedBatches = 0;

  for (const b of batches) {
    const audio = join(BATCH_DIR, b.audioFile);
    const { segs } = await detect(audio);

    // Classify every segment as speech or silence by its own loudness.
    const kept = [];
    let dropped = 0;
    for (const [s, e] of segs) {
      const v = await meanVolume(audio, s, e);
      if (v > SILENCE_DB) kept.push([s, e]);
      else dropped++;
    }

    const wantPieces = b.clips.reduce((n, c) => n + 1 + breaksIn(c.text), 0);
    console.log(`\n  ${b.batch}`);
    console.log(`    segments detected : ${segs.length}`);
    console.log(`    silent, dropped   : ${dropped}`);
    console.log(`    speech segments   : ${kept.length}`);
    console.log(`    script expects    : ${wantPieces}  (${b.count} clips + ${wantPieces - b.count} internal breaks)`);

    if (kept.length !== wantPieces) {
      const diff = kept.length - wantPieces;
      console.error(
        `    MISMATCH by ${diff > 0 ? "+" : ""}${diff} — refusing to write.\n` +
          `    ${diff > 0 ? "Too many pieces: raise --silence (e.g. -35) to drop more near-silent bits." : "Too few: lower --silence (e.g. -45), or --min-silence 0.12 to cut finer."}`
      );
      failedBatches++;
      continue;
    }

    console.log(`    EXACT MATCH — every piece accounted for.`);
    if (PLAN) continue;

    // Merge: clip i owns the next (1 + breaks) pieces, start of first to end of last.
    const root = STAGE ? join(BATCH_DIR, "staged") : PUBLIC_DIR;
    let p = 0,
      wrote = 0;
    for (const c of b.clips) {
      const take = 1 + breaksIn(c.text);
      const start = kept[p][0];
      const end = kept[p + take - 1][1];
      p += take;
      const dest = join(root, c.file.replace(/^\//, ""));
      try {
        await cut(audio, start, end, dest, !STAGE);
        wrote++;
      } catch (err) {
        console.error(`    FAIL ${c.ids?.[0] ?? c.id}: ${err.message}`);
      }
    }
    totalWrote += wrote;
    console.log(`    ${STAGE ? "staged" : "wrote"} ${wrote} clip(s) -> ${rel(root)}`);
  }

  if (PLAN) {
    console.log(`\n  --plan: nothing written.\n`);
    return;
  }
  console.log(`\n  ${STAGE ? "staged" : "wrote"} ${totalWrote} clip(s); ${failedBatches} batch(es) refused.\n`);
  if (failedBatches) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
