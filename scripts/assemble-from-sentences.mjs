#!/usr/bin/env node
/**
 * assemble-from-sentences.mjs — build the game's clips from externally split,
 * one-sentence-per-file segments.
 *
 * The recording was split by hand into one file per SENTENCE (186 of them for
 * batch-01), which is a finer grain than the game uses: 27 of its clips are two
 * sentences long ("Find the A! A is for Ant!"). This joins those back together
 * and files every clip under its real manifest path.
 *
 * WHY SENTENCES ARE THE RIGHT UNIT TO RECEIVE
 *
 * Every automated attempt to cut this recording failed on the same thing: the
 * pause between two clips and the pause inside one clip are the same length, so
 * no measurement separates them. A sentence-level split sidesteps that entirely
 * — every boundary is a real sentence end, and which sentences belong to which
 * clip is read from the manifest rather than guessed from audio.
 *
 * MISSING SEGMENTS are expected: a splitter routinely drops the very shortest
 * utterances ("A.", "eh"). Those are cut directly from the source recording
 * using explicit times, so a gap in the numbering never becomes a missing clip.
 *
 * USAGE
 *   node scripts/assemble-from-sentences.mjs --plan
 *   node scripts/assemble-from-sentences.mjs
 *   node scripts/assemble-from-sentences.mjs --live
 *
 * FLAGS
 *   --plan     report what would be built, write nothing
 *   --live     write into public/audio (originals backed up); default is staged
 *   --in <dir> folder of segment files (default audio-batches/pairs10)
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  rmSync,
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
const BATCH_DIR = join(ROOT, "audio-batches");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d = null) => (has(f) ? (argv[argv.indexOf(f) + 1] ?? d) : d);

const PLAN = has("--plan");
const LIVE = has("--live");
const IN_DIR = join(ROOT, val("--in", "audio-batches/pairs10"));
const SRC = join(BATCH_DIR, "batch-01.mp3");
const TMP = join(BATCH_DIR, ".tmp-assemble");

const rel = (p) => relative(ROOT, p).split(/[\\/]/).join("/");

/**
 * The segment files are numbered from 2, not 1 — so "segment N" holds sentence
 * N-1. This was discovered the honest way: mapping N->N put "apple!" in
 * letter-b's file, one position late. OFFSET corrects it.
 */
const OFFSET = Number(val("--offset", "-1"));

/** Sentences with no segment file even after the offset, recovered by cutting
 *  the source recording at known times (from the reviewed transcript). */
const RECOVER = {
  13: { start: 19, end: 22, text: "E." },
  186: { start: 364, end: 367.1, text: "ah... alligator!" },
};

function backup(outPath) {
  if (!existsSync(outPath)) return false;
  const dest = join(BACKUP_DIR, relative(PUBLIC_DIR, outPath));
  if (existsSync(dest)) return false;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(outPath, dest);
  return true;
}

async function cutFromSource(start, end, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  await run(
    "ffmpeg",
    ["-y", "-i", SRC, "-ss", String(start), "-to", String(end),
     "-c:a", "libmp3lame", "-q:a", "2", "-f", "mp3", dest],
    { windowsHide: true }
  );
}

/** Join several segment files into one clip, re-encoding so the result is a
 *  single clean stream rather than concatenated frames. */
async function joinInto(sources, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  if (sources.length === 1) {
    await run(
      "ffmpeg",
      ["-y", "-i", sources[0], "-c:a", "libmp3lame", "-q:a", "2", "-f", "mp3", dest],
      { windowsHide: true }
    );
    return;
  }
  mkdirSync(TMP, { recursive: true });
  const listFile = join(TMP, "concat.txt");
  writeFileSync(listFile, sources.map((s) => `file '${s.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"), "utf8");
  await run(
    "ffmpeg",
    ["-y", "-f", "concat", "-safe", "0", "-i", listFile,
     "-c:a", "libmp3lame", "-q:a", "2", "-f", "mp3", dest],
    { windowsHide: true }
  );
}

async function main() {
  const sentencesPath = join(BATCH_DIR, "batch-01.sentences.json");
  if (!existsSync(sentencesPath)) {
    console.error(`No ${rel(sentencesPath)}`);
    process.exitCode = 1;
    return;
  }
  const sentences = JSON.parse(readFileSync(sentencesPath, "utf8"));

  // seq -> segment file
  const seg = new Map();
  for (const f of readdirSync(IN_DIR).filter((f) => f.toLowerCase().endsWith(".mp3"))) {
    const m = f.match(/segment\s*(\d+)/i) || f.match(/(\d+)\s*\.mp3$/i);
    if (m) seg.set(Number(m[1]) + OFFSET, join(IN_DIR, f));
  }

  // Group sentences back into the clips the game actually plays.
  const clips = new Map();
  for (const s of sentences) {
    if (!clips.has(s.file)) clips.set(s.file, { file: s.file, id: s.id, parts: [] });
    clips.get(s.file).parts.push(s);
  }

  const missing = sentences.filter((s) => !seg.has(s.seq) && !RECOVER[s.seq]);
  const recovering = sentences.filter((s) => !seg.has(s.seq) && RECOVER[s.seq]);

  console.log(`\n  sentences        : ${sentences.length}`);
  console.log(`  segment files    : ${seg.size}`);
  console.log(`  clips to build   : ${clips.size}`);
  console.log(`  recovered by cut : ${recovering.length}${recovering.length ? " (" + recovering.map((s) => "#" + s.seq + " " + JSON.stringify(s.text)).join(", ") + ")" : ""}`);
  if (missing.length) {
    console.error(`  MISSING, no source: ${missing.map((s) => "#" + s.seq).join(", ")}`);
    console.error(`  Add those files or extend RECOVER with their times.`);
    process.exitCode = 1;
    return;
  }

  const joins = [...clips.values()].filter((c) => c.parts.length > 1);
  console.log(`  clips joined from 2 sentences: ${joins.length}`);

  if (PLAN) {
    console.log(`\n  examples:`);
    for (const c of joins.slice(0, 3)) {
      console.log(`    ${c.id.padEnd(16)} <- #${c.parts.map((p) => p.seq).join(" + #")}  ${c.parts.map((p) => JSON.stringify(p.text)).join(" ")}`);
    }
    console.log(`\n  --plan: nothing written.\n`);
    return;
  }

  const root = LIVE ? PUBLIC_DIR : join(BATCH_DIR, "assembled");
  if (!LIVE && existsSync(root)) rmSync(root, { recursive: true });
  mkdirSync(TMP, { recursive: true });

  let wrote = 0;
  const failures = [];
  for (const c of clips.values()) {
    const dest = join(root, c.file.replace(/^\//, ""));
    try {
      const sources = [];
      for (const p of c.parts) {
        if (seg.has(p.seq)) sources.push(seg.get(p.seq));
        else {
          const r = RECOVER[p.seq];
          const tmp = join(TMP, `recover-${p.seq}.mp3`);
          await cutFromSource(r.start, r.end, tmp);
          sources.push(tmp);
        }
      }
      const tmpOut = `${dest}.part`;
      await joinInto(sources, tmpOut);
      if (!existsSync(tmpOut) || statSync(tmpOut).size === 0) throw new Error("no audio produced");
      if (LIVE) backup(dest);
      renameSync(tmpOut, dest);
      wrote++;
    } catch (err) {
      failures.push(`${c.id}: ${err.message}`);
    }
  }

  rmSync(TMP, { recursive: true, force: true });
  console.log(`\n  ${LIVE ? "wrote" : "assembled"} ${wrote}/${clips.size} clip(s) -> ${rel(root)}`);
  if (failures.length) {
    console.error(`  failures:\n    ` + failures.join("\n    "));
    process.exitCode = 1;
  }
  console.log();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
