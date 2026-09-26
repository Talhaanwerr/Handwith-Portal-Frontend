#!/usr/bin/env node
/**
 * generate-elevenlabs-audio.mjs — regenerate portal narration with ElevenLabs.
 *
 * WHY THIS EXISTS: every spoken line in the portal comes from
 * src/playlab/shared/audio/manifest.json, which is the SINGLE SOURCE OF TRUTH —
 * the games read their on-screen text from the same entry they play the audio
 * from, so a clip can never drift from the words on screen. This generator
 * keeps that rule: it speaks the manifest, it never invents a line.
 *
 * SAFETY MODEL (this script overwrites real assets, so read this):
 *   · Nothing is overwritten until the original is copied to audio-backup/.
 *     The backup mirrors public/audio/ and is written ONCE per file — re-runs
 *     never clobber a good backup with a bad regeneration.
 *   · --restore puts every backed-up file back and exits.
 *   · Default mode SKIPS clips whose mp3 already exists. Replacing the existing
 *     library is an explicit --force.
 *   · --dry-run prints the plan and the character cost without calling the API.
 *
 * USAGE
 *   node scripts/generate-elevenlabs-audio.mjs --list-voices
 *   node scripts/generate-elevenlabs-audio.mjs --quota
 *   node scripts/generate-elevenlabs-audio.mjs --dry-run --force
 *   node scripts/generate-elevenlabs-audio.mjs --only phonics-a
 *   node scripts/generate-elevenlabs-audio.mjs --family cheer --force
 *   node scripts/generate-elevenlabs-audio.mjs --force            (full replace)
 *   node scripts/generate-elevenlabs-audio.mjs --restore
 *
 * FLAGS
 *   --list-voices     list the account's voices (id + name) and exit
 *   --quota           show character quota/usage and exit
 *   --only <id>       one clip id
 *   --family <prefix> every clip id starting with prefix (e.g. "phonics")
 *   --limit <n>       stop after n clips (good for a listen-test)
 *   --force           regenerate clips whose file already exists
 *   --dry-run         plan + cost only, no API calls, no writes
 *   --restore         restore every file from audio-backup/ and exit
 *   --voice <id>      override the manifest's voice id for this run
 *   --voice-name <n>  pick the voice by NAME (e.g. "Zara"), resolved at runtime
 *   --concurrency <n> parallel requests (default 2, free-tier friendly)
 *   --yes             skip the confirmation prompt for large runs
 *
 * FREE TIER: the whole library is ~8.4k characters against a 10k/month
 * allowance, so a full replace fits — but only once, with little room to
 * iterate. The run refuses to start if the remaining quota is too small
 * (rather than dying half-done), so prefer regenerating a family at a time
 * while tuning, and keep the full --force run for when the tone is settled.
 *
 * AUTH: set ELEVENLABS_API_KEY in .env.local (gitignored) or the environment.
 * The key is never printed, never written to disk, and never sent anywhere but
 * api.elevenlabs.io.
 */
import {
  readFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { createInterface } from "node:readline/promises";

/** Abort sentinel: the message is already printed at the throw site. */
class Fail extends Error {}

const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, "src/playlab/shared/audio/manifest.json");
const PUBLIC_DIR = join(ROOT, "public");
const BACKUP_DIR = join(ROOT, "audio-backup");
const API = "https://api.elevenlabs.io/v1";

// ── args ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d = null) => (has(f) ? (argv[argv.indexOf(f) + 1] ?? d) : d);

const FORCE = has("--force");
const DRY = has("--dry-run");
const YES = has("--yes");
const ONLY = val("--only");
const FAMILY = val("--family");
const LIMIT = val("--limit") ? Number(val("--limit")) : null;
const VOICE_OVERRIDE = val("--voice");
// Free plans allow very few concurrent requests; 2 keeps the whole run inside
// that budget instead of eating retries. Raise it on a paid plan.
const CONCURRENCY = Math.max(1, Number(val("--concurrency", "2")));

// ── env ────────────────────────────────────────────────────────────────────

/** Read KEY=value from .env.local without pulling in a dependency. Values may
 *  be quoted; everything after the first "=" is the value. */
function loadEnvLocal() {
  for (const name of [".env.local", ".env"]) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    for (const raw of readFileSync(p, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}
loadEnvLocal();

const API_KEY = process.env.ELEVENLABS_API_KEY;

function requireKey() {
  if (API_KEY) return;
  console.error(
    [
      "",
      "  ELEVENLABS_API_KEY is not set.",
      "",
      "  Add it to .env.local (already gitignored — the key never reaches git):",
      "",
      "      ELEVENLABS_API_KEY=your_key_here",
      "",
      "  Get one at https://elevenlabs.io/app/settings/api-keys",
      "",
    ].join("\n")
  );
  throw new Fail();
}

// ── manifest ───────────────────────────────────────────────────────────────
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const CFG = manifest.elevenLabs ?? {};
// An unset field in the manifest is the empty string, which is NOT nullish —
// so normalise before ?? chains, or a blank voiceId silently wins over a real
// voiceName and the run reports no voice at all.
const clean = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);

let VOICE_ID = clean(VOICE_OVERRIDE) ?? clean(CFG.voiceId);
const MODEL_ID = clean(CFG.modelId) ?? "eleven_multilingual_v2";
const OUTPUT_FORMAT = clean(CFG.outputFormat) ?? "mp3_44100_128";
const VOICE_NAME = clean(val("--voice-name")) ?? clean(CFG.voiceName);

/**
 * Tone is chosen PER CLIP FAMILY, not once for the whole library.
 *
 * The brief is an excited, warm, teaching voice — but those three pull in
 * different directions and the clips do different jobs, so one global setting
 * would have to compromise all of them:
 *
 *   · TEACHING clips (phonics, letter names, numbers) must be the SAME every
 *     time a child hears them. Low stability makes ElevenLabs re-interpret a
 *     line on each render, which is exactly wrong for "b says buh" — so these
 *     run stable and plain. Warmth comes from the voice; precision comes from
 *     here.
 *   · CHEERS are pure delight and carry no information, so they get the most
 *     expressive settings in the file.
 *   · PROMPTS and vocabulary sit in between: warm and lively, still clear.
 *
 * `style` above ~0.5 starts trading intelligibility for drama, which is a bad
 * bargain for a child still decoding the words.
 */
const TONE_DEFAULTS = {
  teaching: { stability: 0.62, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
  cheer: { stability: 0.38, similarity_boost: 0.8, style: 0.55, use_speaker_boost: true },
  warm: { stability: 0.45, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true },
};

/** Longest prefix wins, so "treat-sound-" can differ from "treat-". */
const TONE_RULES = CFG.toneRules ?? {
  "phonics-": "teaching",
  "letter-": "teaching",
  "number-": "teaching",
  "treat-sound-": "teaching",
  "cheer-": "cheer",
  "magnet-excellent": "cheer",
};

const TONES = { ...TONE_DEFAULTS, ...(CFG.tones ?? {}) };
const DEFAULT_TONE = CFG.defaultTone ?? "warm";

function toneFor(id) {
  let best = null;
  for (const prefix of Object.keys(TONE_RULES)) {
    if (id.startsWith(prefix) && (!best || prefix.length > best.length)) best = prefix;
  }
  return best ? TONE_RULES[best] : DEFAULT_TONE;
}

function settingsFor(id) {
  return TONES[toneFor(id)] ?? TONES[DEFAULT_TONE] ?? TONE_DEFAULTS.warm;
}

/**
 * The words ElevenLabs should actually say.
 *
 * `ssml` is deliberately IGNORED: the manifest's <phoneme> tags carry exact IPA
 * for the 26 phonics clips, and the ElevenLabs TTS endpoint does not honour
 * inline phoneme SSML — passing it through would make the narrator read the
 * tags aloud. `speakFree` exists for exactly this case (it is the plain
 * respelling the non-IPA Edge path uses), so it wins for those clips, and
 * `elevenSpeak` lets any single clip be tuned by ear without touching code.
 */
function textFor(clip) {
  return clip.elevenSpeak ?? clip.speakFree ?? clip.speak ?? clip.text;
}

function sourceField(clip) {
  if (clip.elevenSpeak) return "elevenSpeak";
  if (clip.speakFree) return "speakFree";
  if (clip.speak) return "speak";
  return "text";
}

// ── selection ──────────────────────────────────────────────────────────────
function selectClips() {
  let entries = Object.entries(manifest.clips);
  if (ONLY) {
    entries = entries.filter(([id]) => id === ONLY);
    if (!entries.length) {
      console.error(`No clip "${ONLY}" in the manifest.`);
      throw new Fail();
    }
  }
  if (FAMILY) {
    entries = entries.filter(([id]) => id.startsWith(FAMILY));
    if (!entries.length) {
      console.error(`No clips starting with "${FAMILY}".`);
      throw new Fail();
    }
  }
  const planned = [];
  let skipped = 0;
  for (const [id, clip] of entries) {
    // An aliased clip is the same words as one we already have; it borrows
    // that recording at play time and must never be generated, or we would
    // pay ElevenLabs twice for one line.
    if (clip.alias) {
      skipped++;
      continue;
    }
    const out = join(PUBLIC_DIR, clip.file);
    if (!FORCE && existsSync(out)) {
      skipped++;
      continue;
    }
    planned.push({ id, clip, out });
    if (LIMIT && planned.length >= LIMIT) break;
  }
  return { planned, skipped };
}

// ── backup / restore ───────────────────────────────────────────────────────

/** Copy the CURRENT file aside before it is overwritten — once. An existing
 *  backup is never replaced, so a second run cannot bury the original under a
 *  regeneration the user has not approved yet. */
function backup(outPath) {
  if (!existsSync(outPath)) return false;
  const rel = relative(PUBLIC_DIR, outPath);
  const dest = join(BACKUP_DIR, rel);
  if (existsSync(dest)) return false;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(outPath, dest);
  return true;
}

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

async function restore() {
  if (!existsSync(BACKUP_DIR)) {
    console.error(`Nothing to restore — ${relative(ROOT, BACKUP_DIR)}/ does not exist.`);
    throw new Fail();
  }
  const files = await walk(BACKUP_DIR);
  let n = 0;
  for (const f of files) {
    const rel = relative(BACKUP_DIR, f);
    const dest = join(PUBLIC_DIR, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(f, dest);
    n++;
  }
  console.log(`Restored ${n} file(s) from ${relative(ROOT, BACKUP_DIR)}/ into public/.`);
  console.log("The backup folder was left in place; delete it yourself when you are happy.");
}

// ── api ────────────────────────────────────────────────────────────────────
async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "xi-api-key": API_KEY, ...(init.headers ?? {}) },
  });
  return res;
}

async function accountVoices() {
  const res = await api("/voices");
  if (!res.ok) throw new Error(`${res.status} ${await safeText(res)}`);
  const { voices = [] } = await res.json();
  return voices;
}

function describe(v) {
  const labels = Object.values(v.labels ?? {})
    .filter(Boolean)
    .join(", ");
  return `${String(v.voice_id).padEnd(24)} ${v.name}${labels ? `  — ${labels}` : ""}`;
}

async function listVoices() {
  requireKey();
  let voices;
  try {
    voices = await accountVoices();
  } catch (e) {
    console.error(`Could not list voices: ${e.message}`);
    throw new Fail();
  }
  console.log(`\n${voices.length} voice(s) on this account:\n`);
  for (const v of voices) console.log(`  ${describe(v)}`);
  console.log(
    `\nSet one in manifest.json → "elevenLabs": { "voiceName": "Zara" } (resolved by\n` +
      `name at run time) or "voiceId": "...". A voice from the ElevenLabs Voice\n` +
      `Library must be ADDED to your account before the API can use it.\n`
  );
}

/**
 * Turn a voice NAME into an id.
 *
 * Names are what a person actually knows ("Zara"); ids are opaque. The API can
 * only speak with voices attached to THIS account, so a Voice Library voice
 * that has not been added yet resolves to nothing — and that is a much more
 * useful thing to say than a bare 404 from the synth call. Matching is
 * case-insensitive, exact first, then prefix, so "Zara" finds "Zara" without
 * also silently picking "Zarathustra".
 */
async function resolveVoiceName(name) {
  const voices = await accountVoices();
  const want = name.trim().toLowerCase();
  const exact = voices.filter((v) => v.name?.trim().toLowerCase() === want);
  const partial = voices.filter((v) => v.name?.trim().toLowerCase().startsWith(want));
  const hits = exact.length ? exact : partial;

  if (hits.length === 1) return hits[0];
  if (hits.length > 1) {
    console.error(`\n  "${name}" is ambiguous — ${hits.length} matches:\n`);
    for (const v of hits) console.error(`    ${describe(v)}`);
    console.error(`\n  Use --voice <id> to pick one.\n`);
    throw new Fail();
  }

  console.error(`\n  No voice named "${name}" on this account.\n`);
  if (voices.length) {
    console.error("  Available:");
    for (const v of voices) console.error(`    ${describe(v)}`);
  }
  console.error(
    `\n  If "${name}" is a Voice Library voice, open it at\n` +
      `  https://elevenlabs.io/app/voice-library and click "Add to my voices"\n` +
      `  first — the API can only use voices attached to your account.\n`
  );
  throw new Fail();
}

async function fetchQuota() {
  const res = await api("/user/subscription");
  if (!res.ok) throw new Error(`${res.status} ${await safeText(res)}`);
  const s = await res.json();
  const used = s.character_count ?? 0;
  const limit = s.character_limit ?? 0;
  return { tier: s.tier ?? "?", used, limit, remaining: Math.max(0, limit - used), raw: s };
}

function printQuota(q) {
  console.log(`\n  tier:       ${q.tier}`);
  console.log(`  characters: ${q.used.toLocaleString()} / ${q.limit.toLocaleString()} used`);
  console.log(`  remaining:  ${q.remaining.toLocaleString()}`);
  if (q.raw.next_character_count_reset_unix) {
    const d = new Date(q.raw.next_character_count_reset_unix * 1000);
    console.log(`  resets:     ${d.toISOString().slice(0, 10)}`);
  }
  console.log();
}

async function quota() {
  requireKey();
  try {
    printQuota(await fetchQuota());
  } catch (e) {
    console.error(`Could not read quota: ${e.message}`);
    throw new Fail();
  }
}

async function safeText(res) {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "(no body)";
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** One clip. Retries 429/5xx with backoff; verifies the body really is audio
 *  and non-empty before it is allowed to replace anything on disk. */
async function synth(text, voiceSettings, attempt = 0) {
  const res = await api(`/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: voiceSettings }),
  });

  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 4) throw new Error(`${res.status} after ${attempt} retries`);
    const wait = Number(res.headers.get("retry-after")) * 1000 || 2 ** attempt * 1000;
    await sleep(wait);
    return synth(text, voiceSettings, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${await safeText(res)}`);

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error("empty response body");
  // mp3 frames start with an ID3 tag or a frame sync (0xFF 0xEx/0xFx)
  const isMp3 =
    buf.subarray(0, 3).toString("latin1") === "ID3" ||
    (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0);
  if (!isMp3)
    throw new Error(`response was not mp3 (starts with ${buf.subarray(0, 8).toString("hex")})`);
  return buf;
}

async function confirm(question) {
  if (YES) return true;
  if (!process.stdin.isTTY) {
    console.error("Not a TTY — re-run with --yes to confirm non-interactively.");
    return false;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const a = (await rl.question(`${question} [y/N] `)).trim().toLowerCase();
  rl.close();
  return a === "y" || a === "yes";
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  if (has("--restore")) return restore();
  if (has("--list-voices")) return listVoices();
  if (has("--quota")) return quota();

  const { planned, skipped } = selectClips();
  const chars = planned.reduce((n, p) => n + textFor(p.clip).length, 0);

  console.log(`\n  manifest clips : ${Object.keys(manifest.clips).length}`);
  console.log(`  to generate    : ${planned.length}`);
  console.log(`  skipped (exist): ${skipped}${FORCE ? "" : "   (use --force to replace)"}`);
  console.log(`  characters     : ${chars.toLocaleString()}`);
  console.log(`  voice / model  : ${VOICE_ID ?? VOICE_NAME ?? "(none set)"} / ${MODEL_ID}`);
  console.log(`  format         : ${OUTPUT_FORMAT}`);
  console.log(`  backup dir     : ${relative(ROOT, BACKUP_DIR)}/`);

  const byTone = {};
  for (const p of planned) (byTone[toneFor(p.id)] ??= []).push(p);
  console.log(`  tone split     :`);
  for (const [name, list] of Object.entries(byTone)) {
    const s = TONES[name] ?? TONE_DEFAULTS.warm;
    console.log(
      `                   ${String(list.length).padStart(3)} ${name.padEnd(9)}` +
        ` stability ${s.stability}  style ${s.style}`
    );
  }
  console.log();

  if (!planned.length) {
    console.log("  Nothing to do.\n");
    return;
  }

  // Phonics are the clips most likely to come back wrong, because their IPA is
  // dropped — surface exactly what will be spoken so it can be judged by eye
  // before a single credit is spent.
  const phonics = planned.filter((p) => p.id.startsWith("phonics-"));
  if (phonics.length) {
    console.log(`  ${phonics.length} phonics clip(s) — IPA is NOT sent; these words are:`);
    for (const p of phonics.slice(0, 8)) {
      console.log(`    ${p.id.padEnd(12)} "${textFor(p.clip)}"   (from ${sourceField(p.clip)})`);
    }
    if (phonics.length > 8) console.log(`    … and ${phonics.length - 8} more`);
    console.log('  Listen to these first — respell via "elevenSpeak" in the manifest.\n');
  }

  if (DRY) {
    console.log("  --dry-run: no API calls made, nothing written.\n");
    return;
  }

  requireKey();

  // A name is friendlier to configure than an opaque id, so resolve it here —
  // and fail with the list of real voices rather than a 404 from the synth call.
  if (!VOICE_ID && VOICE_NAME) {
    const v = await resolveVoiceName(VOICE_NAME);
    VOICE_ID = v.voice_id;
    console.log(`  resolved voice : "${v.name}" → ${VOICE_ID}\n`);
  }
  if (!VOICE_ID) {
    console.error(
      'No voice. Run --list-voices, then set manifest "elevenLabs".voiceName (or\n' +
        "pass --voice-name <name> / --voice <id>).\n"
    );
    throw new Fail();
  }

  // PREFLIGHT. On the free tier the monthly allowance is close to the size of
  // this library, so a run that starts optimistically can die two-thirds of the
  // way through with a pile of half-replaced audio. Check first and refuse.
  let q = null;
  try {
    q = await fetchQuota();
    printQuota(q);
  } catch (e) {
    console.warn(`  (could not read quota: ${e.message} — continuing)\n`);
  }
  if (q && chars > q.remaining) {
    console.error(
      `  NOT ENOUGH CHARACTERS: this run needs ${chars.toLocaleString()} but only ` +
        `${q.remaining.toLocaleString()} remain on the "${q.tier}" plan.\n\n` +
        `  Options:\n` +
        `    · regenerate one family at a time  (--family cheer --force)\n` +
        `    · cap this run                     (--limit 100 --force)\n` +
        `    · wait for the monthly reset, or upgrade the plan\n`
    );
    throw new Fail();
  }

  if (
    planned.length > 25 &&
    !(await confirm(`Generate ${planned.length} clips (${chars.toLocaleString()} chars)?`))
  ) {
    console.log("Aborted.");
    return;
  }

  let made = 0,
    failed = 0,
    backed = 0;
  const failures = [];
  let cursor = 0;

  async function worker() {
    for (;;) {
      const i = cursor++;
      if (i >= planned.length) return;
      const { id, clip, out } = planned[i];
      const text = textFor(clip);
      const tone = toneFor(id);
      try {
        const buf = await synth(text, settingsFor(id));
        mkdirSync(dirname(out), { recursive: true });
        if (backup(out)) backed++;
        writeFileSync(out, buf);
        made++;
        const kb = (statSync(out).size / 1024).toFixed(0);
        console.log(
          `  ok   ${String(made + failed).padStart(3)}/${planned.length}  ${id.padEnd(26)} ${tone.padEnd(9)} ${kb}kb  "${text.slice(0, 34)}"`
        );
      } catch (err) {
        failed++;
        failures.push(`${id} (${clip.file}): ${err.message}`);
        console.error(
          `  FAIL ${String(made + failed).padStart(3)}/${planned.length}  ${id}: ${err.message}`
        );
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, planned.length) }, worker));

  console.log(`\n  generated ${made}, failed ${failed}, originals backed up ${backed}`);
  console.log(`  backups in ${relative(ROOT, BACKUP_DIR)}/ — restore with --restore\n`);
  if (failures.length) {
    console.error("Failed clips:\n  " + failures.join("\n  ") + "\n");
    process.exitCode = 1;
  }
}

main().catch((e) => {
  if (!(e instanceof Fail)) console.error(e);
  // exitCode, never process.exit(): exiting hard while fetch handles are still
  // open trips a libuv assertion on Windows and buries the real message.
  process.exitCode = 1;
});
