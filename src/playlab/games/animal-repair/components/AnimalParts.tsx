"use client";

import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { F, PALETTE, Spec, Shade } from "@games/letter-treats/components/candy-world/CandyDefs";
import {
  PARTS,
  type AnimalId,
  type Kind,
  type PartId,
} from "@games/animal-repair/constants/rounds";

/**
 * THE SOFT TOYS — a genuinely missing prop, drawn here. Candy ABC's animals
 * (`VOCAB_ART`) are single drawings, so none of them can lose an ear; these
 * six are drawn in the same language (100-unit-style soft silhouettes, the
 * lit `F.*` gradients of `CandyDefs`, a specular on the head, a shadow pool)
 * but built from SEPARATE parts on ONE shared skeleton: a round head over a
 * round sitting body, the same ear place, nose place, tail place and mane
 * place on every toy. So a bunny's ears fit a cat, a lion's tail fits a
 * mouse — the silly mix-ups — and a missing part leaves a dashed outline
 * of itself where it goes.
 *
 * Toy units: the viewBox is 120 × 140. Every part is drawn in toy units at
 * its place; a loose part in the kit is the same drawing cropped to its own
 * box. The gradients come from `CandyDefs`, mounted once by the game root.
 */

export const TOY_W = 120;
export const TOY_H = 140;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Where each place is on the toy — the drop target when a part is missing
 *  and the tap target for a part in phase one of a mix-up. Generous: every
 *  one is ≥ 48 px on a 568 × 320 phone. */
export const SLOT_BOX: Record<Kind, Box> = {
  ears: { x: 20, y: 0, w: 80, h: 46 },
  nose: { x: 40, y: 52, w: 40, h: 46 },
  tail: { x: 82, y: 82, w: 38, h: 56 },
  mane: { x: 14, y: 12, w: 92, h: 92 },
};

/** A box on the toy as percentages of the toy's own frame (for HTML laid
 *  over the drawing: the drop gap, the tap targets). */
export function slotVars(b: Box) {
  return cssVars({
    "--arp-x": `${(b.x / TOY_W) * 100}%`,
    "--arp-y": `${(b.y / TOY_H) * 100}%`,
    "--arp-w": `${(b.w / TOY_W) * 100}%`,
    "--arp-h": `${(b.h / TOY_H) * 100}%`,
  });
}

/* ── Paint ────────────────────────────────────────────────────────────────── */

const INK = PALETTE.ink;

/** Each toy's plush: its fur, its tummy and feet pads, the inside of its ears. */
const FUR: Record<AnimalId, { fur: string; belly: string; inner: string }> = {
  bunny: { fur: F.white, belly: F.pinkLight, inner: F.pink },
  elephant: { fur: F.blue, belly: F.sky, inner: F.pink },
  cat: { fur: F.lavender, belly: F.lavenderLight, inner: F.pink },
  mouse: { fur: F.grey, belly: F.cream, inner: F.pink },
  lion: { fur: F.yellow, belly: F.cream, inner: F.orangeDeep },
};

/* ── Geometry helpers (run once, at load) ─────────────────────────────────── */

type Pt = readonly [number, number];

function cubicAt(p: readonly Pt[], t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
    a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1],
  ];
}

/**
 * A tapered tail: a filled ribbon round a centre line, `w0` wide at the toy
 * (where it hides in the body) and `w1` at its rounded tip. Filled, not
 * stroked, so its dashed outline reads as the outline of a tail.
 */
function ribbon(line: readonly Pt[], w0: number, w1: number): string {
  const n = line.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  line.forEach((p, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(n - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
  });
  const f = (q: Pt) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  const r = (w1 / 2).toFixed(1);
  return [
    `M${f(left[0])}`,
    ...left.slice(1).map((q) => `L${f(q)}`),
    `A${r} ${r} 0 0 0 ${f(right[n - 1])}`,
    ...right
      .slice(0, -1)
      .reverse()
      .map((q) => `L${f(q)}`),
    "Z",
  ].join(" ");
}

function sampleCubic(p: readonly Pt[], steps = 22): Pt[] {
  return Array.from({ length: steps + 1 }, (_, i) => cubicAt(p, i / steps));
}

const CAT_TAIL = ribbon(
  sampleCubic([
    [80, 118],
    [108, 126],
    [116, 100],
    [104, 86],
  ]),
  10,
  7.5
);
const MOUSE_TAIL = ribbon(
  sampleCubic([
    [80, 122],
    [110, 136],
    [121, 108],
    [106, 99],
  ]),
  3.8,
  2
);
const LION_TAIL = ribbon(
  sampleCubic([
    [80, 120],
    [108, 132],
    [115, 108],
    [108, 96],
  ]),
  4.4,
  3.2
);
/** The lion's mane: two rings of soft tufts round the head. */
const MANE_OUTER = Array.from({ length: 14 }, (_, i): Pt => {
  const a = (i / 14) * Math.PI * 2;
  return [60 + 31 * Math.cos(a), 58 + 31 * Math.sin(a)];
});
const MANE_INNER = Array.from({ length: 14 }, (_, i): Pt => {
  const a = ((i + 0.5) / 14) * Math.PI * 2;
  return [60 + 28 * Math.cos(a), 58 + 28 * Math.sin(a)];
});

/* ── The parts ────────────────────────────────────────────────────────────── */

interface PartDraw {
  /** The part's own box in toy units — a loose part is drawn cropped to it. */
  box: Box;
  /** The part, in its owner's plush. */
  art: () => ReactNode;
  /** Its silhouette, for the dashed outline of a missing part (painted by
   *  `.arp-ghost` in the stylesheet). */
  ghost: () => ReactNode;
}

const BunnyEarShapes = () => (
  <>
    <ellipse cx="47" cy="22" rx="8.5" ry="19" transform="rotate(-12 47 22)" />
    <ellipse cx="73" cy="22" rx="8.5" ry="19" transform="rotate(12 73 22)" />
  </>
);
const CAT_EAR_L = "M34 46 L37 17 L57 34 Z";
const CAT_EAR_R = "M86 46 L83 17 L63 34 Z";
const TRUNK =
  "M51 62 Q48 80 53 92 Q57 101 66 97 Q72 94 68 87 Q63 90 61 86 Q59 78 69 62 Q60 58 51 62 Z";

const PART_DRAW: Record<PartId, PartDraw> = {
  "bunny-ears": {
    box: { x: 36, y: 2, w: 48, h: 40 },
    art: () => (
      <>
        <g fill={FUR.bunny.fur}>
          <BunnyEarShapes />
        </g>
        <ellipse
          cx="47"
          cy="24"
          rx="4.2"
          ry="13"
          transform="rotate(-12 47 24)"
          fill={FUR.bunny.inner}
          opacity="0.75"
        />
        <ellipse
          cx="73"
          cy="24"
          rx="4.2"
          ry="13"
          transform="rotate(12 73 24)"
          fill={FUR.bunny.inner}
          opacity="0.75"
        />
      </>
    ),
    ghost: () => <BunnyEarShapes />,
  },
  "cat-ears": {
    box: { x: 30, y: 13, w: 60, h: 37 },
    art: () => (
      <>
        <path
          d={`${CAT_EAR_L} ${CAT_EAR_R}`}
          fill={FUR.cat.fur}
          stroke={FUR.cat.fur}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M39 40 L40.5 25 L51 34 Z M81 40 L79.5 25 L69 34 Z"
          fill={FUR.cat.inner}
          opacity="0.7"
        />
      </>
    ),
    ghost: () => <path d={`${CAT_EAR_L} ${CAT_EAR_R}`} />,
  },
  "mouse-ears": {
    box: { x: 22, y: 18, w: 76, h: 30 },
    art: () => (
      <>
        <circle cx="37" cy="33" r="14" fill={FUR.mouse.fur} />
        <circle cx="83" cy="33" r="14" fill={FUR.mouse.fur} />
        <circle cx="37" cy="33" r="8.5" fill={FUR.mouse.inner} opacity="0.8" />
        <circle cx="83" cy="33" r="8.5" fill={FUR.mouse.inner} opacity="0.8" />
        <Spec x={32} y={26} rx={3.5} ry={2.4} />
      </>
    ),
    ghost: () => (
      <>
        <circle cx="37" cy="33" r="14" />
        <circle cx="83" cy="33" r="14" />
      </>
    ),
  },
  "lion-mane": {
    box: { x: 16, y: 14, w: 88, h: 88 },
    art: () => (
      <>
        {MANE_INNER.map(([x, y], i) => (
          <circle key={`i${i}`} cx={x} cy={y} r="9" fill={F.orangeDeep} />
        ))}
        {MANE_OUTER.map(([x, y], i) => (
          <circle key={`o${i}`} cx={x} cy={y} r="11.5" fill={F.orange} />
        ))}
      </>
    ),
    ghost: () => <circle cx="60" cy="58" r="42" />,
  },
  "elephant-trunk": {
    box: { x: 46, y: 58, w: 28, h: 44 },
    art: () => (
      <>
        <path d={TRUNK} fill={FUR.elephant.fur} />
        <path
          d="M52.5 74 Q57 76.5 61.5 74.5 M53.5 82 Q57.5 84.5 62 82.5"
          stroke={PALETTE.blueDeep}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
        <Spec x={54} y={68} rx={2.4} ry={4} rotate={0} />
      </>
    ),
    ghost: () => <path d={TRUNK} />,
  },
  "cat-tail": {
    box: { x: 77, y: 81, w: 41, h: 44 },
    art: () => (
      <>
        <path d={CAT_TAIL} fill={FUR.cat.fur} />
        <path
          d="M104 104 Q109 102 111 98 M106 94 Q109 93 110 90"
          stroke={PALETTE.lavenderDeep}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </>
    ),
    ghost: () => <path d={CAT_TAIL} />,
  },
  "mouse-tail": {
    box: { x: 78, y: 96, w: 43, h: 34 },
    art: () => <path d={MOUSE_TAIL} fill={FUR.mouse.inner} />,
    ghost: () => <path d={MOUSE_TAIL} />,
  },
  "bunny-tail": {
    box: { x: 81, y: 107, w: 24, h: 25 },
    art: () => (
      <>
        <g fill={FUR.bunny.fur}>
          <circle cx="93" cy="120" r="9.5" />
          <circle cx="99" cy="114" r="5" />
          <circle cx="100" cy="124" r="5" />
          <circle cx="88" cy="112.5" r="4.5" />
          <circle cx="90" cy="127" r="4.5" />
        </g>
        <Spec x={91} y={115} rx={3.4} ry={2.4} />
      </>
    ),
    ghost: () => <circle cx="94" cy="119.5" r="11" />,
  },
  "lion-tail": {
    box: { x: 78, y: 84, w: 39, h: 46 },
    art: () => (
      <>
        <path d={LION_TAIL} fill={FUR.lion.fur} />
        <g fill={F.orange}>
          <circle cx="108" cy="92" r="5.6" />
          <circle cx="104.5" cy="89" r="3.6" />
          <circle cx="111.5" cy="89" r="3.6" />
          <circle cx="108" cy="86.5" r="3.4" />
        </g>
      </>
    ),
    ghost: () => (
      <>
        <path d={LION_TAIL} />
        <circle cx="108" cy="90" r="6.8" />
      </>
    ),
  },
};

/* ── The toy ──────────────────────────────────────────────────────────────── */

export type Mood = "sad" | "puzzled" | "happy";

const Eye = ({ x, y }: { x: number; y: number }) => (
  <g className="arp-eye">
    <circle cx={x} cy={y} r="3.7" fill={INK} />
    <circle cx={x + 1.3} cy={y - 1.3} r="1.3" fill="#FFFFFF" />
  </g>
);

/** The ears, muzzles and noses that never come off. */
function FixedBehind({ animal }: { animal: AnimalId }) {
  const c = FUR[animal];
  if (animal === "elephant")
    return (
      <>
        <circle cx="26" cy="58" r="18" fill={c.fur} />
        <circle cx="94" cy="58" r="18" fill={c.fur} />
        <circle cx="24" cy="59" r="10" fill={c.inner} opacity="0.55" />
        <circle cx="96" cy="59" r="10" fill={c.inner} opacity="0.55" />
      </>
    );
  if (animal === "lion")
    return (
      <>
        <circle cx="40" cy="33" r="7.5" fill={c.fur} />
        <circle cx="80" cy="33" r="7.5" fill={c.fur} />
        <circle cx="40" cy="33" r="3.8" fill={c.inner} opacity="0.6" />
        <circle cx="80" cy="33" r="3.8" fill={c.inner} opacity="0.6" />
      </>
    );
  return null;
}

function FixedFace({ animal }: { animal: AnimalId }) {
  const whiskers = (
    <path
      d="M48 68 L35 65.5 M48 71.5 L35 74 M72 68 L85 65.5 M72 71.5 L85 74"
      stroke={INK}
      strokeWidth="1.3"
      strokeLinecap="round"
      opacity="0.45"
    />
  );
  if (animal === "bunny") return <path d="M56.5 64 L60 68 L63.5 64 Z" fill={F.pink} />;
  if (animal === "cat")
    return (
      <>
        {whiskers}
        <path d="M56.5 64 L60 68 L63.5 64 Z" fill={F.pink} />
      </>
    );
  if (animal === "mouse")
    return (
      <>
        {whiskers}
        <circle cx="60" cy="66" r="3.4" fill={F.pinkDeep} />
      </>
    );
  if (animal === "lion")
    return (
      <>
        <ellipse cx="60" cy="70" rx="11" ry="7.5" fill={F.cream} />
        <path d="M55.5 64.5 Q60 62.5 64.5 64.5 Q62.5 69 60 69 Q57.5 69 55.5 64.5 Z" fill={INK} />
      </>
    );
  return null;
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === "happy")
    return (
      <>
        <path d="M51 76 Q60 89 69 76 Q60 80 51 76 Z" fill={INK} />
        <path d="M55.5 81 Q60 86.5 64.5 81 Q60 82.8 55.5 81 Z" fill={F.pink} />
      </>
    );
  const d =
    mood === "sad" ? "M53 82 Q60 75.5 67 82" : "M53.5 79.5 Q56.8 76.8 60 79.5 Q63.2 82.2 66.5 79.5";
  return <path d={d} stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />;
}

function Brows({ mood }: { mood: Mood }) {
  if (mood === "happy") return null;
  const d =
    mood === "sad"
      ? "M43 49.5 L53 46.5 M67 46.5 L77 49.5"
      : "M43.5 47 Q48 43 53 46.5 M67 48 L77 48";
  return (
    <path d={d} stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
  );
}

/** Sparkles round a toy that has come alive (stylesheet keyframes). */
const SPARKLES = [
  { x: "6%", y: "18%" },
  { x: "84%", y: "10%" },
  { x: "90%", y: "56%" },
  { x: "2%", y: "62%" },
] as const;

/**
 * One toy on the bench. `wear` is what sits in each place that comes off (a
 * part, or nothing); `gap` draws the dashed outline of the part that belongs
 * in an empty place; `mood` is its face (sad while broken, puzzled in a silly
 * part, happy — blinking, wiggling, sparkling — once fixed). `fresh` pops a
 * just-fixed part on; `popOff` boings a silly part away. `register` hands
 * out each worn part's group, so a tap can wiggle it without a render.
 */
export const ToyAnimal = memo(function ToyAnimal({
  animal,
  wear,
  gap = null,
  mood,
  fresh = null,
  popOff = null,
  register,
}: {
  animal: AnimalId;
  wear: Partial<Record<Kind, PartId | null>>;
  gap?: { kind: Kind; part: PartId } | null;
  mood: Mood;
  fresh?: Kind | null;
  popOff?: Kind | null;
  register?: (kind: Kind, el: SVGGElement | null) => void;
}) {
  const c = FUR[animal];

  const slot = (kind: Kind) => {
    if (gap?.kind === kind)
      return (
        <g key={`gap-${gap.part}`} className="arp-ghost">
          {PART_DRAW[gap.part].ghost()}
        </g>
      );
    const p = wear[kind];
    if (!p) return null;
    if (popOff === kind)
      return (
        <motion.g
          key={`pop-${p}`}
          className="arp-slot"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: [0, 8, 20, 34],
            y: [0, -30, -22, 46],
            rotate: [0, -16, 24, 80],
            opacity: [1, 1, 1, 0],
          }}
          transition={{ duration: 0.75, times: [0, 0.32, 0.55, 1], ease: "easeOut" }}
        >
          {PART_DRAW[p].art()}
        </motion.g>
      );
    if (fresh === kind)
      return (
        <motion.g
          key={`in-${p}`}
          className="arp-slot"
          initial={{ scale: 0.45, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 13 }}
        >
          {PART_DRAW[p].art()}
        </motion.g>
      );
    return (
      <g key={p} ref={(el) => register?.(kind, el)} className="arp-slot" data-slot={kind}>
        {PART_DRAW[p].art()}
      </g>
    );
  };

  return (
    <motion.div
      className={`arp-toy ${mood === "happy" ? "is-happy" : ""}`}
      animate={
        mood === "happy"
          ? { rotate: [0, -6, 6, -4, 4, 0], y: [0, -12, 0, -7, 0, 0] }
          : { rotate: 0, y: 0 }
      }
      transition={{ duration: 1.1, ease: "easeInOut" }}
    >
      <svg viewBox={`0 0 ${TOY_W} ${TOY_H}`} className="arp-toy-svg" aria-hidden="true">
        <Shade x={60} y={137} rx={38} ry={4.5} />
        {slot("tail")}
        {/* the sitting body: tummy, a stitched seam, paws and feet */}
        <ellipse cx="60" cy="110" rx="32" ry="25" fill={c.fur} />
        <ellipse cx="60" cy="114" rx="18" ry="14" fill={c.belly} />
        <path
          d="M60 101 L60 127"
          stroke="rgba(90,60,90,0.28)"
          strokeWidth="1.2"
          strokeDasharray="2 2.2"
        />
        <Spec x={45} y={98} rx={6} ry={4} />
        <ellipse cx="31" cy="106" rx="7.5" ry="11.5" transform="rotate(28 31 106)" fill={c.fur} />
        <ellipse cx="89" cy="106" rx="7.5" ry="11.5" transform="rotate(-28 89 106)" fill={c.fur} />
        <ellipse cx="45" cy="132" rx="11" ry="6.5" fill={c.fur} />
        <ellipse cx="75" cy="132" rx="11" ry="6.5" fill={c.fur} />
        <ellipse cx="45" cy="133" rx="6" ry="3.4" fill={c.belly} />
        <ellipse cx="75" cy="133" rx="6" ry="3.4" fill={c.belly} />
        {slot("mane")}
        <FixedBehind animal={animal} />
        {slot("ears")}
        {/* the head and face */}
        <circle cx="60" cy="58" r="30" fill={c.fur} />
        <Spec x={47} y={41} rx={9} ry={6} />
        <FixedFace animal={animal} />
        <circle cx="40" cy="68" r="4.8" fill={F.pink} opacity={mood === "happy" ? 0.8 : 0.4} />
        <circle cx="80" cy="68" r="4.8" fill={F.pink} opacity={mood === "happy" ? 0.8 : 0.4} />
        <Eye x={49} y={55} />
        <Eye x={71} y={55} />
        <Brows mood={mood} />
        <Mouth mood={mood} />
        {slot("nose")}
      </svg>
      {mood === "happy" &&
        SPARKLES.map((s, i) => (
          <span
            key={i}
            className="arp-sparkle pl-at"
            style={cssVars({ "--pl-x": s.x, "--pl-y": s.y, "--arp-d": `${0.15 + i * 0.18}s` })}
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20">
              <path d="M10 0 Q11.6 8.4 20 10 Q11.6 11.6 10 20 Q8.4 11.6 0 10 Q8.4 8.4 10 0 Z" />
            </svg>
          </span>
        ))}
    </motion.div>
  );
});

/** A loose part, drawn cropped to its own box. */
export const PartSvg = memo(function PartSvg({ id }: { id: PartId }) {
  const b = PART_DRAW[id].box;
  return (
    <svg viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`} className="arp-part" aria-hidden="true">
      {PART_DRAW[id].art()}
    </svg>
  );
});

/** A loose part on its card — what lies in the kit and what the finger carries. */
export const PartCard = memo(function PartCard({ id }: { id: PartId }) {
  return (
    <span className="arp-card">
      <span className="arp-card-face" />
      <span className="arp-card-pic">
        <PartSvg id={id} />
      </span>
    </span>
  );
});

/** What a toy wears when whole, with some places changed. */
export function wearing(
  own: Partial<Record<Kind, PartId>>,
  change: Partial<Record<Kind, PartId | null>> = {}
): Partial<Record<Kind, PartId | null>> {
  return { ...own, ...change };
}

/** Read out for screen readers: what a part is. */
export const partName = (id: PartId) => PARTS[id].name;
