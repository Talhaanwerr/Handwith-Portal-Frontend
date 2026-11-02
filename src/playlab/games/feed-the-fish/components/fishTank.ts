import type { Dispatch, SetStateAction } from "react";
import { unit } from "@shared/utils/hash";
import { playClickSound, playPickUpSound, playStarPop } from "@shared/audio/sfx";
import { playClip, sayAfter } from "@shared/audio/voice";
import type { FishMood } from "@games/feed-the-fish/components/FishArt";
import {
  BEDS,
  MAX_FLAKES,
  WATER,
  YUM_CLIPS,
  hungryIn,
  type FeedRoundDef,
} from "@games/feed-the-fish/constants/rounds";

/**
 * THE TANK — one round's fish and flakes, run OUTSIDE React.
 *
 * A fish's place lives here, in shares of the stage, and reaches the screen
 * as three custom properties written straight onto its element; its swim is
 * a CSS transition on transform. A flake's sinking is a CSS animation whose
 * clock this file mirrors, so a fish can be sent to where the flake WILL be
 * when it gets there. React hears only about things a child can see change:
 * a flake appears, is eaten or fades; a fish eats, is full, falls asleep.
 */

export interface FishView {
  mood: FishMood;
  bites: number;
}
export interface FlakeView {
  id: number;
  x: number;
  y0: number;
  drop: number;
  dur: number;
  fade: boolean;
}

type Task = "idle" | "chase" | "eat" | "full" | "sleep";
interface SimFish {
  x: number;
  y: number;
  dir: 1 | -1;
  task: Task;
  bites: number;
}
interface SimFlake {
  x: number;
  y0: number;
  yEnd: number;
  t0: number;
  taken: number | null;
  gone: boolean;
}

/** Where flakes land on the water, and how fast they sink (shares/s). */
const SURFACE = 0.1;
const SINK = 0.1;
/** A fish meets a flake no higher than this, clear of the pills up top. */
const MEET_Y = 0.32;
/** Each bite makes a fish this much bigger. */
export const GROW = 0.07;
/** The mouth's distance from the fish's centre, in fish widths. */
const MOUTH = 0.37;
const WANDER_MS = 2400;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The fish's width in px — the same sum as `--ftf-fw` in the stylesheet. */
export function fishWidth(w: number, h: number): number {
  return clamp(Math.min(0.21 * h, 0.19 * w), 64, 170);
}
/** Feed the Shark's sand strip, `clamp(44px, 8vh, 76px)`. */
function sandHeight(h: number): number {
  return clamp(0.08 * h, 44, 76);
}

export function initialFish(def: FeedRoundDef): FishView[] {
  const hungry = new Set(hungryIn(def));
  return def.fish.map((_, i) => ({ mood: hungry.has(i) ? "hungry" : "content", bites: 0 }));
}

interface Hooks {
  setFish: Dispatch<SetStateAction<FishView[]>>;
  setFlakes: Dispatch<SetStateAction<FlakeView[]>>;
  /** Say each bite's number (Feed the Colour Fish). */
  countBites: boolean;
}

export type Tank = ReturnType<typeof createTank>;

export function createTank(def: FeedRoundDef, hooks: Hooks) {
  const hungry = hungryIn(def);
  const fish: SimFish[] = def.fish.map((d) => ({
    x: d.at[0],
    y: d.at[1],
    dir: 1,
    task: "idle",
    bites: 0,
  }));
  const flakes = new Map<number, SimFlake>();
  const els = new Map<number, HTMLElement>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let root: HTMLElement | null = null;
  let size = { w: 1, h: 1 };
  let nextId = 1;
  let seed = 0;
  let won = false;
  let alive = false;
  /** Called once every hungry fish is asleep. */
  let onWon: () => void = () => {};

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.delete(t);
      if (alive) fn();
    }, ms);
    timers.add(t);
  };

  const write = (i: number, dur: number) => {
    const el = els.get(i);
    if (!el) return;
    const f = fish[i];
    el.style.setProperty("--ftf-d", `${dur.toFixed(2)}s`);
    el.style.setProperty("--ftf-x", `${(f.x * size.w).toFixed(1)}px`);
    el.style.setProperty("--ftf-y", `${(f.y * size.h).toFixed(1)}px`);
    el.style.setProperty("--ftf-dir", String(f.dir));
  };
  const go = (i: number, x: number, y: number, dur: number) => {
    const f = fish[i];
    if (Math.abs(x - f.x) > 0.004) f.dir = x > f.x ? 1 : -1;
    f.x = x;
    f.y = y;
    write(i, dur);
  };
  const setMood = (i: number, mood: FishMood) =>
    hooks.setFish((v) => v.map((m, j) => (j === i ? { mood, bites: fish[i].bites } : m)));

  const speed = () => 0.42 * Math.max(size.w, size.h);
  const sandY = () => (size.h - sandHeight(size.h) * 0.55) / size.h;
  const flakeY = (fl: SimFlake, t: number) =>
    Math.min(fl.yEnd, fl.y0 + (SINK * (t - fl.t0)) / 1000);

  const isHungry = (i: number) => hungry.includes(i) && fish[i].bites < def.fish[i].bites;

  /** Send fish `i` to meet flake `id` where it will be on arrival. */
  const chase = (i: number, id: number) => {
    const fl = flakes.get(id);
    if (!fl) return;
    const f = fish[i];
    fl.taken = i;
    f.task = "chase";
    const { w, h } = size;
    const fw = fishWidth(w, h) * (1 + f.bites * GROW);
    const now = performance.now();
    const dir: 1 | -1 = fl.x >= f.x ? 1 : -1;
    // never sooner than the flake reaches MEET_Y
    const deep = Math.max(0, (MEET_Y - fl.y0) / SINK - (now - fl.t0) / 1000);
    let t = Math.max(0.9, deep);
    let tx = f.x;
    let ty = f.y;
    for (let k = 0; k < 3; k++) {
      tx = clamp(fl.x - (dir * MOUTH * fw) / w, 0.03, 0.97);
      ty = flakeY(fl, now + t * 1000) - (0.04 * fw) / h;
      const swim = Math.hypot((tx - f.x) * w, (ty - f.y) * h) / speed();
      t = clamp(Math.max(swim, deep), 0.7, 3.2);
    }
    f.dir = dir;
    f.x = tx;
    f.y = ty;
    write(i, t);
    later(() => arrive(i, id), t * 1000);
  };

  /** The nearest flake still in play that nobody is after. */
  const seek = (i: number) => {
    if (!isHungry(i) || fish[i].task !== "idle") return;
    const now = performance.now();
    let best = -1;
    let bestD = Infinity;
    for (const [id, fl] of flakes) {
      if (fl.gone || fl.taken !== null) continue;
      const d = Math.hypot(fl.x - fish[i].x, flakeY(fl, now) - fish[i].y);
      if (d < bestD) {
        bestD = d;
        best = id;
      }
    }
    if (best >= 0) chase(i, best);
  };

  const removeFlake = (id: number) => {
    flakes.delete(id);
    hooks.setFlakes((v) => v.filter((x) => x.id !== id));
  };

  const arrive = (i: number, id: number) => {
    const f = fish[i];
    if (f.task !== "chase") return;
    const fl = flakes.get(id);
    if (!fl || fl.gone) {
      f.task = "idle";
      seek(i);
      return;
    }
    fl.gone = true;
    removeFlake(id);
    f.bites += 1;
    f.task = "eat";
    setMood(i, "eat");
    playPickUpSound();
    els
      .get(i)
      ?.querySelector(".ftf-fish-wiggle")
      ?.animate(
        [
          { transform: "rotate(0deg)" },
          { transform: "rotate(-10deg)" },
          { transform: "rotate(8deg)" },
          { transform: "rotate(-4deg)" },
          { transform: "rotate(0deg)" },
        ],
        { duration: 650, easing: "ease-in-out" }
      );
    if (hooks.countBites) void playClip(`number-${f.bites}`);
    later(() => {
      if (f.bites >= def.fish[i].bites) {
        full(i);
        return;
      }
      f.task = "idle";
      setMood(i, "hungry");
      seek(i);
    }, 750);
  };

  const full = (i: number) => {
    fish[i].task = "full";
    setMood(i, "full");
    playStarPop();
    void sayAfter(YUM_CLIPS[i % YUM_CLIPS.length]);
    later(() => {
      const f = fish[i];
      const { w, h } = size;
      const bx = BEDS[def.fish[i].bed];
      const by = (h - sandHeight(h) * 0.6 - fishWidth(w, h) * 0.22) / h;
      const dur = clamp(Math.hypot((bx - f.x) * w, (by - f.y) * h) / (speed() * 0.4), 2, 3.6);
      go(i, bx, by, dur);
      later(() => {
        f.task = "sleep";
        setMood(i, "asleep");
        if (!won && hungry.every((j) => fish[j].task === "sleep")) {
          won = true;
          onWon();
        }
      }, dur * 1000);
    }, 1300);
  };

  /** A flake nobody took settles on the sand, waits, then fades. */
  const settle = (id: number) => {
    later(() => {
      const fl = flakes.get(id);
      if (!fl || fl.gone || fl.taken !== null) return;
      fl.gone = true;
      hooks.setFlakes((v) => v.map((x) => (x.id === id ? { ...x, fade: true } : x)));
      later(() => removeFlake(id), 700);
    }, 2600);
  };

  /** The full fish politely swim out of a falling flake's way. */
  const dodge = (x: number) => {
    fish.forEach((f, j) => {
      if (hungry.includes(j) || f.task !== "idle" || Math.abs(f.x - x) > 0.2) return;
      const away = f.x >= x ? 1 : -1;
      let nx = clamp(x + away * 0.3, WATER.left, WATER.right);
      if (Math.abs(nx - x) < 0.15) nx = clamp(x - away * 0.3, WATER.left, WATER.right);
      go(j, nx, f.y, 1.3);
    });
  };

  /** One awake, idle fish at a time drifts to a new spot near its start. */
  const wander = () => {
    for (let k = 0; k < fish.length; k++) {
      const i = (seed + k) % fish.length;
      const f = fish[i];
      if (f.task !== "idle") continue;
      seed += k + 1;
      const [hx, hy] = def.fish[i].at;
      const x = clamp(hx + (unit(seed * 7 + i) * 2 - 1) * 0.08, WATER.left, WATER.right);
      const y = clamp(hy + (unit(seed * 13 + i) * 2 - 1) * 0.06, WATER.top, WATER.bottom);
      go(i, x, y, 3.4);
      return;
    }
  };

  return {
    /** Who to tell when the round is won; returns the undo. */
    whenWon(fn: () => void): () => void {
      onWon = fn;
      return () => {
        if (onWon === fn) onWon = () => {};
      };
    },

    /** Mount: measure, swim the fish in from the sides, start drifting. */
    attach(el: HTMLElement): () => void {
      root = el;
      alive = true;
      const measure = () => {
        size = { w: el.clientWidth || 1, h: el.clientHeight || 1 };
      };
      measure();
      def.fish.forEach((d, i) => {
        const f = fish[i];
        if (f.task === "idle" && f.bites === 0) {
          f.x = d.at[0] < 0.5 ? -0.15 : 1.15;
          f.y = d.at[1];
          f.dir = d.at[0] < 0.5 ? 1 : -1;
        }
        write(i, 0);
      });
      void el.offsetWidth; // commit the start places before the swim in
      const raf = requestAnimationFrame(() =>
        def.fish.forEach((d, i) => {
          if (fish[i].task === "idle") go(i, d.at[0], d.at[1], 1.8);
        })
      );
      const ro = new ResizeObserver(() => {
        measure();
        fish.forEach((_, i) => write(i, 0));
      });
      ro.observe(el);
      const drift = setInterval(wander, WANDER_MS);
      return () => {
        alive = false;
        root = null;
        cancelAnimationFrame(raf);
        ro.disconnect();
        clearInterval(drift);
        timers.forEach(clearTimeout);
        timers.clear();
      };
    },

    fishRef(i: number, el: HTMLElement | null) {
      if (!el) {
        els.delete(i);
        return;
      }
      els.set(i, el);
      if (alive) write(i, 0);
    },

    /** A tap in the water: a flake drops in above that point. */
    tap(clientX: number) {
      if (!root || won) return;
      let live = 0;
      for (const fl of flakes.values()) if (!fl.gone) live++;
      if (live >= MAX_FLAKES) return;
      const r = root.getBoundingClientRect();
      const x = clamp((clientX - r.left) / r.width, 0.05, 0.95);
      const id = nextId++;
      const yEnd = sandY();
      const fl: SimFlake = {
        x,
        y0: SURFACE,
        yEnd,
        t0: performance.now(),
        taken: null,
        gone: false,
      };
      flakes.set(id, fl);
      const dur = (yEnd - SURFACE) / SINK;
      hooks.setFlakes((v) => [
        ...v,
        { id, x, y0: SURFACE, drop: yEnd - SURFACE, dur, fade: false },
      ]);
      playClickSound();
      later(() => settle(id), dur * 1000);
      dodge(x);
      let best = -1;
      let bestD = Infinity;
      fish.forEach((f, i) => {
        if (!isHungry(i) || f.task !== "idle") return;
        const d = Math.hypot(f.x - x, f.y - SURFACE);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (best >= 0) chase(best, id);
    },

    /** Where the idle hand should tap: the water above a waiting fish. */
    handPoint(): { x: number; y: number } | null {
      const i = hungry.find((j) => isHungry(j) && fish[j].task === "idle");
      if (i === undefined) return null;
      return {
        x: fish[i].x * size.w,
        y: Math.max(96, (fish[i].y - 0.2) * size.h),
      };
    },
  };
}
