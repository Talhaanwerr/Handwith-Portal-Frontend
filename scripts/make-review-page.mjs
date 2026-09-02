#!/usr/bin/env node
/**
 * make-review-page.mjs — one page listing every assembled clip, its filename,
 * what it should say, and a player.
 *
 * The point is to make a wrong clip obvious at a glance rather than something
 * you have to go hunting for: the filename and the expected words sit next to
 * the play button, so checking is listen-and-compare with no cross-referencing.
 * Marking one wrong builds a copyable list, so the result of a review session is
 * a thing that can be acted on rather than a memory.
 *
 * USAGE
 *   node scripts/make-review-page.mjs                     all staged batches
 *   node scripts/make-review-page.mjs --batch batch-01
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const val = (f, d = null) => (argv.includes(f) ? (argv[argv.indexOf(f) + 1] ?? d) : d);
const ONE = val("--batch");
const BATCH_DIR = join(ROOT, val("--out", "audio-batches"));
const SUBDIR = val("--dir", "assembled");
const STAGED = join(BATCH_DIR, SUBDIR);

const index = JSON.parse(readFileSync(join(BATCH_DIR, "index.json"), "utf8"));
let batches = index.batches;
if (ONE) batches = batches.filter((b) => b.batch === ONE);

const rows = [];
for (const b of batches) {
  for (const c of b.clips) {
    const src = c.file.replace(/^\//, "");
    if (!existsSync(join(STAGED, src))) continue;
    rows.push({ batch: b.batch, id: c.ids?.[0] ?? c.id, file: src, text: c.text });
  }
}

const html = `<!doctype html>
<meta charset="utf-8">
<title>Audio check</title>
<style>
  :root{color-scheme:light dark;--bg:#fff;--fg:#111;--mut:#666;--line:#e3e3e3;--bad:#c0392b;--badbg:#fdeeec;--ok:#1a7f5a}
  @media(prefers-color-scheme:dark){:root{--bg:#131519;--fg:#e8e8e8;--mut:#9aa0a6;--line:#2a2e35;--badbg:#3a1f1c}}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}
  header{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:14px 20px;z-index:5}
  h1{margin:0 0 2px;font-size:17px}
  .sub{color:var(--mut);font-size:13px}
  .wrap{max-width:900px;margin:0 auto;padding:0 20px 60px}
  .bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px}
  button{font:inherit;padding:6px 12px;border-radius:7px;border:1px solid var(--line);background:transparent;color:var(--fg);cursor:pointer}
  button:hover{border-color:var(--mut)}
  .row{display:grid;grid-template-columns:44px 1fr 220px auto;gap:12px;align-items:center;
       padding:9px 8px;border-bottom:1px solid var(--line)}
  .row.bad{background:var(--badbg)}
  .n{color:var(--mut);font:12px ui-monospace,monospace;text-align:right}
  .say{font-weight:600}
  .fn{color:var(--mut);font:12px ui-monospace,monospace;overflow-wrap:anywhere}
  audio{height:32px;width:210px}
  .mark{border-color:var(--line);color:var(--mut);padding:5px 10px;font-size:13px}
  .row.bad .mark{border-color:var(--bad);color:var(--bad);font-weight:600}
  #out{position:fixed;right:16px;bottom:16px;max-width:340px;background:var(--bg);
       border:1px solid var(--line);border-radius:10px;padding:12px;font:12px ui-monospace,monospace;
       max-height:40vh;overflow:auto;display:none}
  #out.show{display:block}
  h2{font-size:13px;color:var(--mut);margin:22px 0 6px;text-transform:uppercase;letter-spacing:.05em}
</style>
<header>
  <h1>Audio check — ${rows.length} clips</h1>
  <div class="sub">Play each one. If it does not match the words shown, click <b>Wrong</b>.</div>
  <div class="bar">
    <button onclick="playAll()">Play all in order</button>
    <button onclick="stopAll()">Stop</button>
    <button onclick="showList()">Show wrong list</button>
    <span class="sub" id="count"></span>
  </div>
</header>
<div class="wrap" id="list"></div>
<div id="out"></div>
<script>
const ROWS = ${JSON.stringify(rows)};
const bad = new Set();
const list = document.getElementById('list');
let lastGroup = '';
ROWS.forEach((r, i) => {
  const g = r.file.split('/').slice(0, -1).join('/');
  if (g !== lastGroup) {
    lastGroup = g;
    const h = document.createElement('h2');
    h.textContent = g;
    list.appendChild(h);
  }
  const d = document.createElement('div');
  d.className = 'row';
  d.id = 'r' + i;
  d.innerHTML =
    '<div class="n">' + (i + 1) + '</div>' +
    '<div><div class="say"></div><div class="fn">' + r.file + '</div></div>' +
    '<div><audio controls preload="none" src="' + SUBDIR + '/' + r.file + '"></audio></div>' +
    '<div><button class="mark" onclick="mark(' + i + ')">Wrong</button></div>';
  d.querySelector('.say').textContent = r.text;
  list.appendChild(d);
});
function mark(i){
  const el = document.getElementById('r'+i);
  if (bad.has(i)) { bad.delete(i); el.classList.remove('bad'); el.querySelector('.mark').textContent='Wrong'; }
  else { bad.add(i); el.classList.add('bad'); el.querySelector('.mark').textContent='WRONG'; }
  document.getElementById('count').textContent = bad.size ? bad.size + ' marked wrong' : '';
  showList();
}
function showList(){
  const o = document.getElementById('out');
  if (!bad.size) { o.classList.remove('show'); return; }
  const ids = [...bad].sort((a,b)=>a-b).map(i => (i+1) + '  ' + ROWS[i].id + '  ' + ROWS[i].file);
  o.classList.add('show');
  o.textContent = 'WRONG (' + bad.size + '):\\n' + ids.join('\\n');
}
let seq = null;
function playAll(){
  stopAll();
  let i = 0;
  const els = [...document.querySelectorAll('audio')];
  const next = () => {
    if (i >= els.length) return;
    const a = els[i++];
    a.scrollIntoView({block:'center', behavior:'smooth'});
    a.play().catch(()=>{});
    a.onended = next;
    seq = a;
  };
  next();
}
function stopAll(){
  document.querySelectorAll('audio').forEach(a => { a.pause(); a.onended = null; });
  seq = null;
}
</script>`;

const out = join(BATCH_DIR, "check.html");
writeFileSync(out, html, "utf8");
console.log(`\n  ${rows.length} clips`);
console.log(`  ${relative(ROOT, out).split(/[\\/]/).join("/")}\n`);
