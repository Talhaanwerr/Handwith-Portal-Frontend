#!/usr/bin/env node
/**
 * generate-treat-audio.mjs - creates every Candy ABC ("treat-*") clip with
 * Edge TTS.
 *
 * WHY THIS EXISTS: the game needs ~400 generated voice lines. They are made
 * from the SAME manifest the game reads, so a clip id can never drift from
 * the line it speaks. The voice settings come from the manifest's own
 * `edgeVoice` block, which is how every existing free-path clip in this
 * project was made - so new clips match the ones already in public/audio.
 *
 * HOW EDGE TTS IS INVOKED: `pip install edge-tts` installs a Python module
 * (`edge_tts`) and, depending on the platform, MAYBE an `edge-tts` launcher
 * on PATH. On Windows the launcher is usually not on PATH, which made the old
 * `execFile("edge-tts", ...)` fail with `spawn edge-tts ENOENT` even though
 * TTS itself worked. So the generator now probes, once, for a runner that
 * actually responds to `--version`, in this order:
 *
 *   python  -m edge_tts     (Windows' python launcher)
 *   python3 -m edge_tts
 *   py -3   -m edge_tts
 *   edge-tts                (the launcher, where it IS on PATH)
 *
 * No shell is involved (execFile), so spaces, apostrophes and punctuation in
 * the spoken lines are passed as real arguments on every platform.
 *
 *   node scripts/generate-treat-audio.mjs                 all missing clips
 *   node scripts/generate-treat-audio.mjs --test          one clip, then stop
 *   node scripts/generate-treat-audio.mjs --only treat-word-ant
 *   node scripts/generate-treat-audio.mjs --force         regenerate existing
 *
 * Re-runnable: a clip whose file already exists is skipped unless --force.
 * A clip is only counted as generated when its file exists and is non-empty
 * after the process exits.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, access, stat, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const run = promisify(execFile);
const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");
const TEST = argv.includes("--test");
const ONLY = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;
const ROOT = process.cwd();

const manifest = JSON.parse(readFileSync(join(ROOT, "src/playlab/shared/audio/manifest.json"), "utf8"));
const { name: voice, rate, pitch } = manifest.edgeVoice;

// ── find a working Edge TTS runner ─────────────────────────────────────────

const CANDIDATES = [
  { cmd: "python", pre: ["-m", "edge_tts"] },
  { cmd: "python3", pre: ["-m", "edge_tts"] },
  { cmd: "py", pre: ["-3", "-m", "edge_tts"] },
  { cmd: "edge-tts", pre: [] },
];

async function findRunner() {
  const tried = [];
  for (const c of CANDIDATES) {
    try {
      const { stdout, stderr } = await run(c.cmd, [...c.pre, "--version"], { windowsHide: true });
      const version = `${stdout}${stderr}`.trim().split(/\r?\n/)[0];
      return { ...c, version };
    } catch (err) {
      tried.push(`${[c.cmd, ...c.pre].join(" ")}: ${firstLine(err)}`);
    }
  }
  console.error("No working Edge TTS runner found. Tried:\n  " + tried.join("\n  "));
  console.error('\nInstall it with `pip install edge-tts`, then check `python -m edge_tts --version`.');
  process.exit(1);
}

function firstLine(err) {
  const text = (err.stderr && String(err.stderr).trim()) || err.message || String(err);
  return text.split(/\r?\n/).filter(Boolean).pop() ?? text;
}

// ── generate ───────────────────────────────────────────────────────────────

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Generate one clip. Resolves true only when the output file exists and is
 *  non-empty afterwards; a zero-byte file (Edge TTS can leave one behind on a
 *  network error) is removed so the next run retries it. */
async function generate(runner, id, clip, out) {
  const args = [
    ...runner.pre,
    "--voice",
    voice,
    `--rate=${rate}`,
    `--pitch=${pitch}`,
    "--text",
    clip.speak ?? clip.text,
    "--write-media",
    out,
  ];
  try {
    await run(runner.cmd, args, { windowsHide: true, timeout: 60_000 });
  } catch (err) {
    throw new Error(firstLine(err));
  }
  let size = 0;
  try {
    size = (await stat(out)).size;
  } catch {
    throw new Error("process exited but no file was written");
  }
  if (size === 0) {
    await unlink(out).catch(() => {});
    throw new Error("process exited but the file is empty (removed; will retry next run)");
  }
  return size;
}

const runner = await findRunner();

let clips = Object.entries(manifest.clips).filter(([id]) => id.startsWith("treat-"));
if (ONLY) {
  clips = clips.filter(([id]) => id === ONLY);
  if (!clips.length) {
    console.error(`No clip "${ONLY}" in the manifest.`);
    process.exit(1);
  }
}


let made = 0,
  skipped = 0,
  failed = 0;
const failures = [];

for (const [id, clip] of clips) {
  const out = join(ROOT, "public", clip.file);
  if (!FORCE && (await exists(out))) {
    skipped++;
    continue;
  }
  await mkdir(dirname(out), { recursive: true });
  try {
    const size = await generate(runner, id, clip, out);
    made++;
    if (TEST) {
      break;
    }
  } catch (err) {
    failed++;
    failures.push(`${id} (${clip.file}): ${err.message}`);
    console.error(`  FAILED ${id}: ${err.message}`);
    if (TEST) break;
  }
}

if (failures.length) {
  console.error("\nFailed clips:\n  " + failures.join("\n  "));
  process.exitCode = 1;
}
