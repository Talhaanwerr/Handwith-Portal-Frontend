"use client";
import { StarRow } from "@shared/components/ui/StarRow";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useJungleStore } from "@games/jungle-spy/store/jungleStore";
import { animalFor, JUNGLE_ANIMALS, animalPhotoPath } from "@games/jungle-spy/constants/animals";
import { AnimalDisplay } from "@games/jungle-spy/components/AnimalDisplay";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { CelebrationMotif } from "@shared/components/game/CelebrationMotif";
import { GardenScene } from "@shared/components/animations/GardenScene";
import { HomeEnvironment } from "@shared/components/animations/HomeEnvironment";
import { unit } from "@shared/utils/hash";
import { useElementSize } from "@shared/hooks/useElementSize";
import { cssVars } from "@shared/styles/cssVars";
import { JungleBackdrop } from "@games/jungle-spy/components/JungleScreens";
import { shuffle } from "@shared/utils/random";
import { scatter } from "@shared/utils/scatter";
import {
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playFanfare,
} from "@shared/audio/sfx";
import { playClip, preloadClips, clipText, stopVoice } from "@shared/audio/voice";

/** Age-5 tuning: big, well-spaced letters; no failure states. Always exactly
 *  5 copies of the target to find (that is what the 5 stars count), among as
 *  many decoys as the measured play area comfortably holds — see bubbleCount. */
const TARGET_COUNT = 5;

/** How long act one of the celebration — the animal, its name, the friends
 *  arriving — holds before it clears and the secret door takes the screen.
 *  Long enough to read the name and see the last friend land; short enough
 *  that the door still feels like part of the same moment. */
const DOOR_AFTER_MS = 1600;

/**
 * The friends who tumble out of the canopy when a letter is found.
 *
 * A fixed, familiar handful rather than all 26: these are the faces already on
 * the splash and the letter map, so the celebration is peopled by animals the
 * child recognises rather than by generic confetti.
 *
 * Built ONCE at module load — the elements are static, and rebuilding seven
 * SVGs on every render of a screen that is already animating would be work for
 * nothing.
 */
/**
 * WHO ANSWERS THE CALL, and from where.
 *
 * When a letter is found the animal calls out and its friends pop into the
 * scene to join in — each from its own edge, so they arrive from all around
 * the clearing rather than appearing in a row. They hold for a beat and go.
 *
 * Positions are hand-placed percentages down the two sides, clear of the
 * centre column where the star animal, the heading and the door live.
 */
const CALLED_FRIENDS: readonly {
  key: string;
  x: string;
  y: string;
  delay: number;
  flip?: boolean;
}[] = [
  { key: "monkey", x: "12%", y: "26%", delay: 0.35 },
  { key: "giraffe", x: "86%", y: "22%", delay: 0.5, flip: true },
  { key: "frog", x: "20%", y: "68%", delay: 0.65 },
  { key: "zebra", x: "80%", y: "64%", delay: 0.8, flip: true },
  { key: "lion", x: "8%", y: "47%", delay: 0.95 },
  { key: "turtle", x: "90%", y: "44%", delay: 1.1, flip: true },
];

const FALLING_FRIENDS: readonly ReactNode[] = (
  ["monkey", "frog", "lion", "elephant", "giraffe", "zebra", "turtle"] as const
)
  .map((key) => {
    const Art = ANIMAL_ART[key];
    return Art ? <Art key={key} /> : null;
  })
  .filter(Boolean);

/**
 * The cast that falls with the leaves: the jungle's friends, PLUS the letter
 * the child has just mastered, in the palette's colours.
 *
 * Raining the letter itself is the point — the shower is not decoration, it is
 * the thing they just learned, over and over, in the colours it wore on the
 * board. Memoised per letter so the elements are built once a round rather
 * than on every frame of an already-animating screen.
 */
function useFallingCast(glyph: string): readonly ReactNode[] {
  return useMemo(
    () => [
      ...FALLING_FRIENDS,
      ...LETTER_COLORS.slice(0, 4).map((color) => (
        <span
          key={`glyph-${color}`}
          className="jsp-win-fall-letter font-rounded font-black"
          style={cssVars({ "--pl-color": color })}
        >
          {glyph}
        </span>
      )),
    ],
    [glyph]
  );
}

/** A small drawing of an animal, for the buttons that lead to it. */
function AnimalIcon({ art }: { art: string }) {
  const Art = ANIMAL_ART[art];
  return Art ? <Art /> : null;
}

/** ── Board layout ─────────────────────────────────────────────────────────
 *
 *  The board is laid out in PIXELS against the measured play area, then
 *  stored as percentages. Percentages alone are not enough: a 13%-of-width
 *  gap is 250px on a desktop and 45px on a phone, so a single set of percent
 *  numbers cannot keep letters both spread out AND non-overlapping on every
 *  screen. Working in pixels makes spacing mean the same thing everywhere;
 *  storing percentages means the board still reflows if the window changes.
 *
 *  Three things scale with the measured area:
 *    - the letter size (the CSS clamp used to be viewport-based, which on a
 *      short wide screen sized letters off the viewport HEIGHT while they
 *      were being spaced by container WIDTH — the two disagreed),
 *    - the spacing between letters, which is a multiple of the letter size,
 *    - how many letters the board holds, so a big screen fills out to its
 *      edges instead of leaving the sides empty.
 */
interface PlayArea {
  /** play-area size in CSS px */
  w: number;
  h: number;
  /** the animal's occupied box in px, relative to the play area */
  keep: { left: number; top: number; right: number; bottom: number };
}

/** Letter size tiers as a fraction of the play area's SHORT side, so letters
 *  stay in proportion whatever the aspect ratio. Bounded: never too small to
 *  tap, never comically large on a big display. */
const FONT_TIERS = [0.115, 0.096, 0.08, 0.065] as const;
const FONT_MIN = 30;
const FONT_MAX = 104;

function letterFontPx(tier: number, play: PlayArea): number {
  const base = Math.min(play.w, play.h);
  return Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, FONT_TIERS[tier] * base)));
}

/**
 * THE GRID — the answer to "why is that part of the screen empty?"
 *
 * The board used to be a hand-placed map of percent slots, mirrored three
 * ways. Designed once at one aspect ratio, then measured against a real phone
 * with the animal's real box carved out of it, the solver dropped and nudged
 * slots until the letters bunched in some regions and left others bare — the
 * lopsided, half-empty boards on both desktop and mobile.
 *
 * Now the play area is split into the four BANDS around the animal — above it,
 * left of it, right of it, below it — and each band is filled with its own
 * lattice of equal cells, packed to that band's width and height, with one
 * letter per cell jittered off-centre so it reads as a scatter rather than a
 * spreadsheet. Coverage is even BY CONSTRUCTION: every band gets letters
 * whenever it has room for one, so a phone shows letters down BOTH sides of
 * the animal rather than whichever edge cell happened to survive a hole
 * punched in a single grid. Nothing is rolled at render.
 *
 * EVERY ROUND LOOKS DIFFERENT, and none of them is random: the lattice has
 * four looks (straight rows, two brick offsets, staggered columns), the
 * letter and the round together pick one, and the jitter is a fixed hash of
 * the same two. A replay of A is a new arrangement; a resize mid-round lays
 * the SAME arrangement over the new shape (see respread).
 */

/** The four looks of the lattice. 0 straight rows · 1 brick, odd rows on the
 *  half-step · 2 brick, even rows on the half-step · 3 odd columns on the
 *  half-step. */
type Lattice = 0 | 1 | 2 | 3;
/** How far a letter may sit off its cell's centre, as a share of the cell —
 *  generous, or a band one row deep reads as a ruled line of letters. */
const CELL_JITTER = 0.5;
/** A band only one line deep zigzags instead: alternate letters sit this far
 *  above and below the line (a share of the cell), so even a short landscape
 *  phone, where every band is one line, never looks like a table. */
const CELL_ZIGZAG = 0.22;
/** Clear space kept between two letters. */
const CELL_GAP = 8;
/** Clear space kept around the animal and its name. */
const ANIMAL_PAD = 12;
/** Each letter owns about twice its own box of free area — the density at
 *  which a board is busy enough to hunt through and still tappable. */
const LETTER_ROOM = 2;
/** Cells are made about a third more numerous than the board needs, so the
 *  part-cells each band loses to rounding and the brick rows' missing
 *  end-cells cost the board nothing; the spread order picks the best of them. */
const CELL_SURPLUS = 1.35;
/** Strides to walk the cells in — the first co-prime with the count wins —
 *  so the first N cells are spread over the board rather than its top rows. */
const STRIDES = [7, 5, 11, 13, 3, 17, 19, 2] as const;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** The letter and the round together choose the board's look and its jitter,
 *  so consecutive rounds — and replays — never look the same. */
function seedFor(target: string, round: number): number {
  return target.toUpperCase().charCodeAt(0) * 131 + round * 17;
}
function latticeFor(target: string, round: number): Lattice {
  return (Math.abs(target.toUpperCase().charCodeAt(0) - 65 + round) % 4) as Lattice;
}

/** The play area not taken by the animal, px². */
function freeArea(play: PlayArea): number {
  const { keep } = play;
  const keepArea = Math.max(0, keep.right - keep.left) * Math.max(0, keep.bottom - keep.top);
  return Math.max(1, play.w * play.h - keepArea);
}

/** The typical letter box on this play area, across the four size tiers. */
function typicalPx(play: PlayArea): number {
  return FONT_TIERS.reduce((sum, _, t) => sum + bubblePx(t, play), 0) / FONT_TIERS.length;
}

/** How many letters this play area holds: as many as fit with room to
 *  breathe, from the area left around the animal and the size the letters
 *  come out at here — so a phone on its side, with small letters and a wide
 *  board, gets the thirty it has room for and a desktop is not a wall. */
function bubbleCap(play: PlayArea): number {
  const box = typicalPx(play) + CELL_GAP;
  const fit = Math.round(freeArea(play) / (box * box * LETTER_ROOM));
  return Math.min(44, Math.max(12, fit));
}

/** The cell centres of one look of the lattice, in cell units. A staggered
 *  line sits on the midpoints between its neighbours' centres, so it has one
 *  fewer cell — that is what makes it a brick pattern rather than a shift. A
 *  single line cannot stagger (it would lose every other cell), so a one-
 *  column or one-row band is always straight. */
function lattice(cols: number, rows: number, look: Lattice): { cx: number; cy: number }[] {
  if (look === 3 && rows > 1) {
    return Array.from({ length: cols }, (_, c) => c).flatMap((c) => {
      const staggered = c % 2 === 1;
      return Array.from({ length: staggered ? rows - 1 : rows }, (_, r) => ({
        cx: c + 0.5,
        cy: staggered ? r + 1 : r + 0.5,
      }));
    });
  }
  const brick = cols > 1 && (look === 1 || look === 2);
  return Array.from({ length: rows }, (_, r) => r).flatMap((r) => {
    const staggered = brick && (look === 1 ? r % 2 === 1 : r % 2 === 0);
    return Array.from({ length: staggered ? cols - 1 : cols }, (_, c) => ({
      cx: staggered ? c + 1 : c + 0.5,
      cy: r + 0.5,
    }));
  });
}

/** A rectangle of the play area, px. */
interface Band {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The four bands around the animal — above, left, right, below — clipped to
 *  the play area. A band the animal leaves no room for comes back empty. */
function bandsAround(play: PlayArea): Band[] {
  const { keep, w, h } = play;
  const top = Math.min(Math.max(keep.top, 0), h);
  const bottom = Math.min(Math.max(keep.bottom, 0), h);
  const left = Math.min(Math.max(keep.left, 0), w);
  const right = Math.min(Math.max(keep.right, 0), w);
  return [
    { x: 0, y: 0, w, h: top },
    { x: 0, y: top, w: left, h: bottom - top },
    { x: right, y: top, w: w - right, h: bottom - top },
    { x: 0, y: bottom, w, h: h - bottom },
  ];
}

function within(v: number, lo: number, hi: number): number {
  return hi < lo ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v));
}

/**
 * Seats for up to `cap` letters covering the WHOLE play area, clear of the
 * animal — percent coordinates for the shared solver, in an order any prefix
 * of which still spans the board.
 */
function gridSlots(play: PlayArea, cap: number, seed: number, look: Lattice): [number, number][] {
  const typical = typicalPx(play);
  // A cell holds a typical letter with room to jitter; bigger still when the
  // board is sparse, so the letters spread out to fill the screen. The solver
  // settles the odd pair of big neighbours the jitter brings together.
  const cell = Math.max(
    typical * 1.25 + CELL_GAP,
    Math.sqrt(freeArea(play) / (cap * CELL_SURPLUS))
  );
  /** The least a band needs to hold one letter. */
  const minBox = typical + CELL_GAP;
  const half = typical / 2;

  const cells = bandsAround(play).flatMap((band, b) => {
    // Packed to the BAND: a strip beside the animal narrower than a cell but
    // wide enough for a letter still gets its column, which is what keeps
    // both sides of the picture peopled on a phone.
    const cols = band.w >= minBox ? Math.max(1, Math.floor(band.w / cell)) : 0;
    const rows = band.h >= minBox ? Math.max(1, Math.floor(band.h / cell)) : 0;
    if (!cols || !rows) return [];
    const cellW = band.w / cols;
    const cellH = band.h / rows;
    return lattice(cols, rows, look).map(({ cx, cy }, i) => {
      // its own lane of the hash per band, so bands never share a jitter
      const n = b * 1000 + i;
      const jx = (unit(seed + n * 2) - 0.5) * CELL_JITTER;
      const jy = (unit(seed + n * 2 + 1) - 0.5) * CELL_JITTER;
      // a band one line deep zigzags, alternate letters up and down (or, one
      // column wide, left and right), so it never reads as a ruled line
      const zigY = rows === 1 ? (Math.floor(cx) % 2 ? CELL_ZIGZAG : -CELL_ZIGZAG) : 0;
      const zigX = cols === 1 ? (Math.floor(cy) % 2 ? CELL_ZIGZAG : -CELL_ZIGZAG) : 0;
      // jittered, but the whole letter stays inside its band
      return {
        x: band.x + within((cx + jx + zigX) * cellW, half, band.w - half),
        y: band.y + within((cy + jy + zigY) * cellH, half, band.h - half),
      };
    });
  });

  const n = cells.length;
  const stride = STRIDES.find((s) => gcd(s, n) === 1) ?? 1;
  return cells.map((_, k): [number, number] => {
    const c = cells[(k * stride) % n];
    return [(c.x / play.w) * 100, (c.y / play.h) * 100];
  });
}

interface Bubble {
  id: number;
  letter: string; // display letter (case follows mode)
  isTarget: boolean;
  /** Centre in PX relative to the play area, solved clear of the animal. */
  x: number;
  y: number;
  popped: boolean;
  /** four size tiers — playful variety; tap area stays comfortable */
  size: 0 | 1 | 2 | 3;
  /** The tap box in px the solver reserved — what the button renders at. */
  px: number;
  color: string;
}

/**
 * The jungle's letter palette — bright and varied, because this board is a
 * scene to explore rather than a test to pass.
 *
 * Colour is assigned by SLOT, never by whether a letter is a target, so it
 * stays decoration and never becomes a clue: the five copies of the target
 * wear five different colours, exactly as the decoys do, and no hue is worth
 * hunting for. (Ocean ABC's pop stage is the opposite case and stays single-
 * colour — there the target used to wear the letter's own material colour,
 * which really did give the answer away.)
 */
const LETTER_COLORS = [
  "#E85D9E", // pink
  "#2BB3A3", // teal
  "#F2913D", // orange
  "#7C4DBE", // purple
  "#6FBF44", // green
  "#4D9EE8", // blue
  "#E8B33D", // golden
  "#E86A6A", // coral
] as const;

/** The bubble's full tap box for a size tier — the glyph plus its padding.
 *  The placement solver needs a real pixel box, and `min-h-[48px]` plus
 *  `p-1.5` is what the button actually occupies. */
function bubblePx(tier: number, play: PlayArea): number {
  return Math.max(48, letterFontPx(tier, play) + 12);
}

/**
 * Seat the letters, then deal identities onto the seats.
 *
 * `play.keep` — the animal's MEASURED box — is honoured twice over: the grid
 * leaves out every cell the picture touches, and the solver is told the box
 * too, so nothing can land on the picture at any size.
 */
function buildBubbles(
  target: string,
  letterCase: "upper" | "lower",
  play: PlayArea,
  round: number
): Bubble[] {
  const cap = bubbleCap(play);
  const slots = gridSlots(play, cap, seedFor(target, round), latticeFor(target, round));
  // Size is tied to the SEAT, not to the letter, so a target is never
  // predictably the big one — the tier for seat i is i % 4, as before.
  const sizes = slots.map((_, i) => bubblePx(i % 4, play));

  const placed = scatter(
    slots,
    sizes,
    { w: play.w, h: play.h, keep: [play.keep] },
    {
      max: cap,
      // Never fewer than the targets plus a few decoys, or there is nothing to
      // hunt through; the solver falls back to a fitted grid if it must.
      min: Math.min(cap, TARGET_COUNT + 3),
    }
  );

  const total = placed.length;
  const targets = Math.min(TARGET_COUNT, total);
  const pool = shuffle(JUNGLE_ANIMALS.map((a) => a.letter).filter((l) => l !== target));
  // Decoys go round the pool again once it runs out — a big screen holds
  // more letters than the alphabet has others, and a repeated decoy is what
  // makes a board a hunt rather than an inventory.
  const decoys = Array.from(
    { length: Math.max(0, total - targets) },
    (_, i) => pool[i % pool.length]
  );
  // Only the ASSIGNMENT is shuffled — which letter lands in which seat.
  const letters = shuffle([
    ...Array.from({ length: targets }, () => ({ letter: target, isTarget: true })),
    ...decoys.map((l) => ({ letter: l, isTarget: false })),
  ]);

  return letters.map((l, i) => ({
    id: i,
    letter: letterCase === "lower" ? l.letter.toLowerCase() : l.letter,
    isTarget: l.isTarget,
    popped: false,
    size: (placed[i].slot >= 0 ? placed[i].slot % 4 : i % 4) as 0 | 1 | 2 | 3,
    // Keyed on the SEAT, not on the letter or on isTarget, so the five copies
    // of the target wear five different colours and no hue is a clue.
    color: LETTER_COLORS[(placed[i].slot >= 0 ? placed[i].slot : i) % LETTER_COLORS.length],
    x: placed[i].x,
    y: placed[i].y,
    px: placed[i].size,
  }));
}

/**
 * Re-seat the SAME bubbles against a changed play area, keeping every
 * identity and every pop. This used to be a deliberate no-op on the grounds
 * that fixed percentages "simply resolve against the new box" — true for the
 * percentages, but the animal's px box does not scale with them, so after a
 * rotation the letters could sit on the picture even when they had not before.
 */
function respread(bubbles: Bubble[], play: PlayArea, target: string, round: number): Bubble[] {
  if (!bubbles.length) return bubbles;
  // The SAME look and seed the board was built from, laid over the new shape.
  const slots = gridSlots(play, bubbles.length, seedFor(target, round), latticeFor(target, round));
  const sizes = bubbles.map((b) => bubblePx(b.size, play));
  const placed = scatter(
    slots,
    sizes,
    { w: play.w, h: play.h, keep: [play.keep] },
    {
      max: bubbles.length,
      min: bubbles.length,
    }
  );
  if (placed.length < bubbles.length) return bubbles;
  return bubbles.map((b, i) => ({ ...b, x: placed[i].x, y: placed[i].y, px: placed[i].size }));
}

export function JungleLevel() {
  const router = useRouter();
  const store = useJungleStore();
  const { currentLetter, letterCase, markFound, setScreen, advance } = store;
  /** Last animal of the RUN the child is actually playing — not "every animal
   *  in the game is found". A fresh Start-from-A run ends at Z even when the
   *  child had already found everything before starting it, which is why this
   *  can no longer be derived from `found`. */
  const run = store.run;
  const runComplete = !run || run.index >= run.queue.length - 1;
  const animal = animalFor(currentLetter);
  const display = letterCase === "lower" ? currentLetter.toLowerCase() : currentLetter;
  /** Animals plus this letter, for the celebration's shower. */
  const fallingCast = useFallingCast(display);

  /** The animal waiting behind the secret door — the next letter of the run.
   *  Null on the last round, where the door has nowhere to lead. */
  const nextAnimal = useMemo(() => {
    if (!run || runComplete) return null;
    const nextLetter = run.queue[run.index + 1];
    return nextLetter ? { ...animalFor(nextLetter), letter: nextLetter } : null;
  }, [run, runComplete]);

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const levelKey = `${currentLetter}|${letterCase}|${round}`;
  const [sessionKey, setSessionKey] = useState(levelKey);
  const [won, setWon] = useState(false);
  /** The celebration's SECOND ACT. Act one is the animal, its name and the
   *  friends; after a beat they clear away and the secret door takes the
   *  centre of the screen. Reset with `won`, in the same render-phase block. */
  const [doorOpen, setDoorOpen] = useState(false);
  if (sessionKey !== levelKey) {
    setSessionKey(levelKey);
    setWon(false);
    setDoorOpen(false);
  }

  // Act one plays for DOOR_AFTER_MS, then the door takes over. A timer rather
  // than an animation callback, so the hand-off happens at the same moment
  // whatever the child's device manages to render.
  useEffect(() => {
    if (!won) return;
    const t = setTimeout(() => setDoorOpen(true), DOOR_AFTER_MS);
    return () => clearTimeout(t);
  }, [won]);

  // The board is scattered against the MEASURED play area and the animal's
  // MEASURED box, so it fills whatever screen it is on and never covers the
  // picture. Measured in a layout effect (before paint) and re-measured on
  // resize, so an orientation flip re-scatters into the new shape.
  const playRef = useRef<HTMLDivElement>(null);
  const animalRef = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState<PlayArea | null>(null);
  useLayoutEffect(() => {
    const el = playRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      // The animal's LAYOUT box, from offsets — never getBoundingClientRect.
      // The picture springs in from scale 0.6, and this runs before that
      // spring has moved, so a client rect here is the picture at 60% and the
      // letters land on the 40% it grows into (they sat on the tentacles and
      // the name). Offsets ignore transforms. The element is pinned at
      // (50%, 55%) and centred by translate, so its box straddles its offset
      // point; a little padding keeps the letters off its edges.
      const a = animalRef.current;
      const keep = a
        ? {
            left: a.offsetLeft - a.offsetWidth / 2 - ANIMAL_PAD,
            top: a.offsetTop - a.offsetHeight / 2 - ANIMAL_PAD,
            right: a.offsetLeft + a.offsetWidth / 2 + ANIMAL_PAD,
            bottom: a.offsetTop + a.offsetHeight / 2 + ANIMAL_PAD,
          }
        : {
            left: w * 0.36,
            top: h * 0.3,
            right: w * 0.64,
            bottom: h * 0.8,
          };
      setPlay({ w, h, keep });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /** A coarse fingerprint of the play area: changes on a real resize or an
   *  orientation flip, not on every sub-pixel reflow. */
  const layoutKey = play ? `${Math.round(play.w / 40)}x${Math.round(play.h / 40)}` : null;
  const boardKey = `${currentLetter}|${letterCase}|${round}`;
  const builtRef = useRef<{ board: string; layout: string } | null>(null);
  // Measured from the actual rendered root — NOT window.innerWidth/height via
  // position:fixed, which breaks (confetti bunches to one side) inside any
  // transformed Framer Motion ancestor. This matches the tracing game's
  // reliable CelebrationScreen pattern.
  const [rootRef, dims] = useElementSize();

  const targetsLeft = useMemo(
    () => (bubbles.length ? bubbles.filter((b) => b.isTarget && !b.popped).length : TARGET_COUNT),
    [bubbles]
  );
  const targetsTotal = useMemo(
    () => (bubbles.length ? bubbles.filter((b) => b.isTarget).length : TARGET_COUNT),
    [bubbles]
  );

  // A fresh board for a new letter / replay, and a re-scatter (progress kept)
  // when the play area itself changes shape.
  useEffect(() => {
    if (!play || !layoutKey) return;
    const prev = builtRef.current;
    if (prev?.board === boardKey && prev.layout === layoutKey) return;
    if (prev?.board === boardKey) {
      builtRef.current = { board: boardKey, layout: layoutKey };
      setBubbles((current) =>
        current.length ? respread(current, play, currentLetter, round) : current
      );
      return;
    }
    builtRef.current = { board: boardKey, layout: layoutKey };
    setBubbles(buildBubbles(currentLetter, letterCase, play, round));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardKey, layoutKey, play]);

  // Fresh board + the pre-generated intro sentence on letter change / replay;
  // preload everything this level needs (same clip system as letter tracing)
  useEffect(() => {
    const l = currentLetter.toLowerCase();
    preloadClips([
      `jungle-find-${l}`,
      `letter-${l}`,
      "instr-try-again",
      "cheer-great-job",
      "instr-again",
      "instr-next",
    ]);
    const t = setTimeout(() => void playClip(`jungle-find-${l}`), 350);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, [currentLetter, letterCase, round]);

  const tapBubble = useCallback(
    (b: Bubble) => {
      if (won || b.popped) return;
      if (b.isTarget) {
        playCorrectSound();
        void playClip(`letter-${currentLetter.toLowerCase()}`);
        setBubbles((prev) => {
          const next = prev.map((p) => (p.id === b.id ? { ...p, popped: true } : p));
          if (next.every((p) => !p.isTarget || p.popped)) {
            // Level complete
            setTimeout(() => {
              setWon(true);
              markFound(currentLetter);
              // warm the next letter's photo while the child celebrates
              const idx = JUNGLE_ANIMALS.findIndex((a) => a.letter === currentLetter);
              const nxt = JUNGLE_ANIMALS[(idx + 1) % JUNGLE_ANIMALS.length];
              new Image().src = animalPhotoPath(nxt.art);
              void playClip("cheer-great-job").then(() => playFanfare());
            }, 350);
          }
          return next;
        });
      } else {
        // Never a failure — a gentle wiggle and a friendly nudge
        playIncorrectSound();
        setShakeId(b.id);
        setTimeout(() => setShakeId(null), 500);
        void playClip("instr-try-again");
      }
    },
    [won, currentLetter, markFound]
  );

  const goNext = useCallback(() => {
    stopVoice(); // never let the cheer keep talking into the next level
    void playClip("instr-next");
    // Walk the RUN the child started, NOT the found list. Consulting `found`
    // here is precisely what made "Start from A" skip animals already found:
    // a fresh run deliberately contains them.
    setRound((r) => r + 1); // fresh keys — the win overlay and board fully reset
    if (!advance()) setScreen("complete");
  }, [advance, setScreen]);

  const playAgain = useCallback(() => {
    void playClip("instr-again");
    setRound((r) => r + 1);
  }, []);

  return (
    <div
      ref={rootRef}
      className="bg-wash-mint relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-3"
    >
      <JungleBackdrop />

      {/* Top bar */}
      <div className="relative z-10 flex w-full max-w-2xl items-center justify-between gap-2">
        <button
          onClick={() => {
            playClickSound();
            router.back();
          }}
          className="shadow-soft flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2"
          aria-label="Back to the letter grid"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="#3DAA72"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-rounded text-jungle text-xs font-bold">Letters</span>
        </button>

        <div className="shadow-soft flex items-center gap-2 rounded-full bg-white/80 px-4 py-2">
          <span className="font-rounded text-plum/70 text-sm font-bold">I spy the letter</span>
          <span className="font-rounded text-jungle text-2xl font-black">{display}</span>
        </div>

        {/* spacer balances the back button so the title stays centered */}
        <div className="min-h-[44px] w-[84px]" aria-hidden="true" />
      </div>

      {/* Collected stars — the shared gold-star row every game uses */}
      <div
        className="shadow-soft relative z-10 mt-2 flex items-center justify-center rounded-2xl bg-white/85 px-4 py-1.5"
        role="status"
      >
        <StarRow earned={targetsTotal - targetsLeft} total={targetsTotal} />
      </div>

      {/* Play area — FULL WIDTH on purpose. It used to be capped at max-w-3xl
          (768px), so on any wider screen the letters could only ever be
          scattered inside a centred 768px column and the sides of the screen
          stayed empty however many letters were added. */}
      <div ref={playRef} className="relative z-10 mt-1 w-full flex-1">
        {/* Animal center */}
        {/* anchored at (50%, 55%) — the SAME point ANIMAL_KEEP_OUT excludes,
            so a scattered letter can never land on top of the picture */}
        <div
          ref={animalRef}
          className="pointer-events-none absolute top-[55%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            aria-label={animal.name}
            role="img"
          >
            {/* The animal itself is the visual — no frame, no mount, no card.
                object-contain inside keeps the whole animal and its true
                proportions; the silhouette drop-shadow comes from .jsp-animal */}
            <div className="jsp-animal flex items-center justify-center">
              <AnimalDisplay art={animal.art} />
            </div>
            <p className="jsp-animal-name font-rounded text-plum/80 shadow-soft mt-1.5 rounded-full bg-white/85 px-3 py-0.5 text-center font-black">
              {animal.name}
            </p>
          </motion.div>
        </div>

        {/* Letter bubbles */}
        <AnimatePresence>
          {bubbles.map(
            (b) =>
              !b.popped && (
                <motion.button
                  key={`${round}-${b.id}`}
                  onClick={() => tapBubble(b)}
                  className="jsp-bubble pl-at absolute flex items-center justify-center p-1.5"
                  // px centres solved clear of the animal's measured box, and
                  // the exact tap box the solver reserved — so what is drawn
                  // and what was collision-tested are the same rectangle.
                  style={cssVars({
                    "--pl-x": `${b.x}px`,
                    "--pl-y": `${b.y}px`,
                    "--pl-size": `${b.px}px`,
                  })}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    shakeId === b.id
                      ? { scale: 1, opacity: 1, x: [-6, 6, -5, 5, -3, 3, 0] }
                      : { scale: 1, opacity: 1, x: 0 }
                  }
                  exit={{ scale: 1.5, opacity: 0 }}
                  // `x` gets its OWN tween. A spring can only interpolate
                  // between two values, so pointing one at the seven-keyframe
                  // wrong-tap shake threw "Only two keyframes currently
                  // supported with spring and inertia animations" the moment a
                  // child tapped a wrong letter. Scale and opacity keep the
                  // spring; the shake is a tween, which is what every other
                  // shake in the portal already uses.
                  transition={{
                    scale: { type: "spring", stiffness: 320, damping: 18 },
                    opacity: { type: "spring", stiffness: 320, damping: 18 },
                    x: { type: "tween", duration: 0.4, ease: "easeInOut" },
                  }}
                  aria-label={`Letter ${b.letter}`}
                >
                  <span
                    className="pl-glyph pl-tint font-rounded leading-none font-black drop-shadow-sm"
                    style={cssVars({
                      "--pl-color": b.color,
                      // Derived from the box the solver actually reserved, not
                      // recomputed from the tier: if the grid fallback had to
                      // shrink a bubble, the glyph shrinks with it instead of
                      // spilling out of its own button.
                      "--pl-font-size": `${Math.max(24, b.px - 12)}px`,
                    })}
                  >
                    {b.letter}
                  </span>
                </motion.button>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Win overlay */}
      <AnimatePresence>
        {won && (
          <CelebrationOverlay
            tintClassName="jsp-win-tint"
            gapClassName="gap-4"
            blur="3px"
            size={dims}
            sparkles={false}
          >
            {/* THE GARDEN. The celebration is set in Letter Tracing's garden —
                the full scene, birds and butterflies included — rather than
                on a wash over the board. A light veil on top keeps the door
                and the words legible over it. */}
            <div className="jsp-win-garden" aria-hidden="true">
              <GardenScene />
              <HomeEnvironment />
            </div>

            {/* The jungle's own celebration: leaves AND animals tumbling down
                through the canopy while the star of the round jumps for joy.
                The generic sparkle confetti is switched off above — a jungle
                that rains its own cast has no use for it, and both layers at
                once was just noise. */}
            <CelebrationMotif motif="leaf" count={38} extras={fallingCast} extraEvery={4} />

            {/* NEW — a sunburst behind the animal, turning slowly. It makes
                the animal the hero of the screen rather than one more thing
                on a tinted sheet, and it reads instantly at any size. */}
            {/* Clipped by its own wrapper: the disc is far wider than the
                screen, and unclipped it widened the overlay's scroll area. */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              aria-hidden="true"
            >
              <motion.span
                className="jsp-win-rays"
                initial={{ scale: 0.4, opacity: 0, rotate: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 360 }}
                transition={{
                  scale: { type: "spring", stiffness: 180, damping: 18 },
                  opacity: { duration: 0.5 },
                  rotate: { duration: 26, repeat: Infinity, ease: "linear" },
                }}
              />
            </div>

            {/* A LEAP, not a bob: it springs up, tips side to side at the top,
                and lands. The idle float this replaced was the same motion the
                animal already makes while the child is still hunting, so
                finding it looked like nothing had happened. */}
            {/* ACT ONE — the animal, its name, and the friends it calls. Holds
                for DOOR_AFTER_MS, then the whole act clears away together so
                the door can take the centre of the screen. */}
            <AnimatePresence>
              {!doorOpen && (
                <motion.div
                  key="act-one"
                  className="jsp-win-act"
                  exit={{ opacity: 0, scale: 0.6, y: -40 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    className="jsp-animal jsp-win-photo relative z-10"
                    initial={{ scale: 0.5, y: 20, rotate: 0 }}
                    animate={{
                      scale: [0.5, 1.12, 1],
                      y: [20, -34, 0, -18, 0],
                      rotate: [0, -8, 8, -4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: [0.22, 1, 0.36, 1],
                      times: [0, 0.3, 0.55, 0.8, 1],
                    }}
                  >
                    <AnimalDisplay art={animal.art} />
                  </motion.div>
                  {/* THE ANIMAL CALLS ITS FRIENDS.
                They pop in from around the edges of the clearing, bob once and
                stay for the rest of the celebration. Staggered arrivals make it
                read as a gathering rather than as six things appearing. */}
                  {CALLED_FRIENDS.map((f) => {
                    const Art = ANIMAL_ART[f.key];
                    if (!Art) return null;
                    return (
                      <motion.div
                        key={f.key}
                        className={`jsp-win-friend ${f.flip ? "is-flipped" : ""}`}
                        style={cssVars({ "--pl-x": f.x, "--pl-y": f.y })}
                        aria-hidden="true"
                        initial={{ scale: 0, opacity: 0, y: 18 }}
                        animate={{ scale: 1, opacity: 1, y: [18, -8, 0] }}
                        transition={{
                          delay: f.delay,
                          scale: { type: "spring", stiffness: 340, damping: 15, delay: f.delay },
                          opacity: { duration: 0.25, delay: f.delay },
                          y: { duration: 0.6, delay: f.delay, ease: "easeOut" },
                        }}
                      >
                        <Art />
                      </motion.div>
                    );
                  })}

                  <h2 className="jsp-win-heading font-rounded text-plum relative z-10 font-black">
                    {clipText("cheer-great-job")}
                  </h2>
                  <p className="font-rounded text-plum/60 text-base font-semibold">
                    You found every {display}! {display} is for {animal.name}.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* THE SECRET DOOR.
                A spy passage opens in golden light with the NEXT animal already
                waiting inside, and going through it IS the way on — so the
                transition is something the child chooses to step into rather
                than a button labelled "Next". It only appears when there is
                somewhere to go; the last round keeps a plain Finish. */}
            {/* ACT TWO — only once act one has cleared, so the door has the
                centre of the screen to itself rather than fighting the
                animal for it. */}
            {doorOpen && nextAnimal ? (
              <motion.div
                key="act-two"
                className="jsp-win-actions relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* THE DOOR OPENS.
                    Two heavy panels swing apart on their outer hinges, golden
                    light floods out, and the next animal is standing inside —
                    the real photograph, the same one they will meet on the next
                    screen. The whole frame is the Next button, so going on is
                    stepping through the door rather than pressing a label. */}
                <motion.button
                  onClick={goNext}
                  className="jsp-door"
                  aria-label={`Go through the secret door to ${nextAnimal.name}`}
                  initial={{ scale: 0.3, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 1.15, type: "spring", stiffness: 190, damping: 17 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* the passage behind the doors */}
                  <span className="jsp-door-well" aria-hidden="true">
                    <motion.span
                      className="jsp-door-light"
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: [0, 1, 0.75, 1], scale: 1 }}
                      transition={{ delay: 1.75, duration: 1.6, ease: "easeOut" }}
                    />
                    {/* who is waiting on the other side — the real photo */}
                    <motion.span
                      className="jsp-door-peek"
                      initial={{ y: 26, opacity: 0, scale: 0.7 }}
                      animate={{ y: [26, -6, 0], opacity: 1, scale: 1 }}
                      transition={{ delay: 2.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <AnimalDisplay art={nextAnimal.art} />
                    </motion.span>
                  </span>

                  {/* the two panels, swinging open on their outer edges */}
                  <motion.span
                    className="jsp-door-panel jsp-door-panel--l"
                    aria-hidden="true"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -105 }}
                    transition={{ delay: 1.7, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.span
                    className="jsp-door-panel jsp-door-panel--r"
                    aria-hidden="true"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: 105 }}
                    transition={{ delay: 1.7, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  />

                  {/* who is waiting: the letter on the arch, the name below */}
                  <span className="jsp-door-badge font-rounded font-black" aria-hidden="true">
                    {letterCase === "lower" ? nextAnimal.letter.toLowerCase() : nextAnimal.letter}
                  </span>
                  <span className="jsp-door-label font-rounded font-black">{nextAnimal.name}</span>
                </motion.button>

                {/* The way back and the way on, side by side under the door
                    and BIG — the two obvious things to tap. Each wears its
                    animal: Again the one just found, Next the one waiting
                    behind the door. */}
                <div className="jsp-win-buttons">
                  <button
                    onClick={playAgain}
                    className="jsp-win-btn jsp-win-btn--again font-rounded font-black"
                    aria-label={`Play ${animal.name} again`}
                  >
                    <span className="jsp-win-btn-art" aria-hidden="true">
                      <AnimalIcon art={animal.art} />
                    </span>
                    <span>Again</span>
                  </button>
                  <button
                    onClick={goNext}
                    className="jsp-win-btn jsp-win-btn--next font-rounded font-black"
                    aria-label={`Next: ${nextAnimal.name}`}
                  >
                    <span>Next</span>
                    <span className="jsp-win-btn-art" aria-hidden="true">
                      <AnimalIcon art={nextAnimal.art} />
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : doorOpen ? (
              // Last round: nothing behind a door, so Again and Finish — but
              // still only once act one has cleared.
              <div className="jsp-win-actions relative z-10">
                <div className="jsp-win-buttons">
                  <button
                    onClick={playAgain}
                    className="jsp-win-btn jsp-win-btn--again font-rounded font-black"
                    aria-label={`Play ${animal.name} again`}
                  >
                    <span className="jsp-win-btn-art" aria-hidden="true">
                      <AnimalIcon art={animal.art} />
                    </span>
                    <span>Again</span>
                  </button>
                  <button
                    onClick={goNext}
                    className="jsp-win-btn jsp-win-btn--next font-rounded font-black"
                    aria-label="Finish and see every animal"
                  >
                    <span>Finish!</span>
                  </button>
                </div>
              </div>
            ) : null}
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
