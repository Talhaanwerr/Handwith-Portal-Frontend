"use client";

/**
 * The playroom's furniture — original flat SVG, drawn only for things no
 * other game already ships (a window, an art shelf, bunting, a rug and an
 * easel). Every drawing fills its own box and
 * is placed and sized by the stylesheet, never by itself.
 *
 * All decorative: aria-hidden, never tappable.
 */

const RAINBOW = ["#F4553D", "#FFC93C", "#5FCB52", "#3DA5F4", "#9B5DE5", "#FF7EB6"] as const;

/* ── Bunting ─────────────────────────────────────────────────────────────── */

/** A point on a quadratic curve, fixed to two decimals (hydration-safe). */
function quad(t: number, a: number, c: number, b: number) {
  return Number(((1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b).toFixed(2));
}

/** Two sagging swags of flags across a 600-wide strip. */
const FLAGS = [0, 1].flatMap((swag) =>
  Array.from({ length: 7 }, (_, i) => {
    const t = (i + 0.5) / 7;
    const x = quad(t, swag * 300, swag * 300 + 150, swag * 300 + 300);
    const y = quad(t, 4, 30, 4);
    return { x, y, fill: RAINBOW[(swag * 7 + i) % RAINBOW.length] };
  })
);

export function Bunting() {
  return (
    <svg viewBox="0 0 600 56" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <path d="M0 4Q150 30 300 4T600 4" fill="none" stroke="#B98A5A" strokeWidth="2" />
      {FLAGS.map((f, i) => (
        <path
          key={i}
          d={`M${f.x - 13} ${f.y}h26l-13 22Z`}
          fill={f.fill}
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/* ── The window ──────────────────────────────────────────────────────────── */

export function WindowArt() {
  return (
    <svg viewBox="0 0 150 140" aria-hidden="true">
      <defs>
        <linearGradient id="csf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FCBFF" />
          <stop offset="1" stopColor="#D9F2FF" />
        </linearGradient>
      </defs>
      {/* frame, sky, sun, clouds, hills */}
      <rect
        x="25"
        y="14"
        width="100"
        height="96"
        rx="8"
        fill="#ffffff"
        stroke="#E4CDA8"
        strokeWidth="3"
      />
      <rect x="33" y="22" width="84" height="80" rx="4" fill="url(#csf-sky)" />
      <circle cx="98" cy="42" r="10" fill="#FFD34D" />
      <circle cx="98" cy="42" r="14" fill="#FFD34D" opacity="0.3" />
      <path d="M44 44a7 7 0 0 1 12-4 6 6 0 0 1 10 5h-22Z" fill="#ffffff" opacity="0.95" />
      <path d="M72 64a6 6 0 0 1 10-3 5 5 0 0 1 8 4H72Z" fill="#ffffff" opacity="0.9" />
      <path d="M33 86q20-16 42-2t42-6v24H33Z" fill="#8EDB77" />
      <path d="M33 94q28-12 52 0t32-2v10H33Z" fill="#5FBF55" />
      {/* mullions */}
      <rect x="73" y="22" width="4" height="80" fill="#ffffff" />
      <rect x="33" y="60" width="84" height="4" fill="#ffffff" />
      {/* sill + a small pot plant */}
      <rect
        x="17"
        y="108"
        width="116"
        height="9"
        rx="3"
        fill="#ffffff"
        stroke="#E4CDA8"
        strokeWidth="2"
      />
      <path d="M100 106h14l-2 -12h-10Z" fill="#FF8A3D" />
      <path
        d="M107 94c-6-6-6-12-1-16 3 5 3 10 1 16Zm0 0c4-7 9-9 13-7-2 5-7 7-13 7Z"
        fill="#5FCB52"
      />
      {/* curtain rod + curtains */}
      <rect x="4" y="6" width="142" height="5" rx="2.5" fill="#B0763E" />
      <circle cx="5" cy="8.5" r="4" fill="#8A5528" />
      <circle cx="145" cy="8.5" r="4" fill="#8A5528" />
      <path
        d="M8 10h28c-2 30-10 44-5 62-6 18-8 38-6 62H8Z"
        fill="#FF7EB6"
        stroke="#D44C8B"
        strokeWidth="1.6"
      />
      <path
        d="M142 10h-28c2 30 10 44 5 62 6 18 8 38 6 62h17Z"
        fill="#FF7EB6"
        stroke="#D44C8B"
        strokeWidth="1.6"
      />
      <path d="M14 70h18M118 70h18" stroke="#FFC93C" strokeWidth="4" strokeLinecap="round" />
      {[
        [16, 26],
        [26, 44],
        [15, 92],
        [22, 116],
        [134, 26],
        [124, 44],
        [135, 92],
        [128, 116],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" fill="#ffffff" opacity="0.75" />
      ))}
    </svg>
  );
}

/* ── The art shelf: a pegboard of drawings, brushes, paint pots, crayons ── */

const PEG_HOLES = Array.from({ length: 9 * 4 }, (_, i) => ({
  cx: 18 + (i % 9) * 16,
  cy: 14 + Math.floor(i / 9) * 17,
}));

const CRAYONS = [
  { x: 118, h: 26, fill: "#F4553D" },
  { x: 125, h: 30, fill: "#3DA5F4" },
  { x: 132, h: 24, fill: "#5FCB52" },
  { x: 139, h: 28, fill: "#FFC93C" },
  { x: 146, h: 22, fill: "#9B5DE5" },
] as const;

const POTS = [
  { x: 10, fill: "#F4553D" },
  { x: 40, fill: "#FFC93C" },
  { x: 70, fill: "#3DA5F4" },
] as const;

export function ArtShelf() {
  return (
    <svg viewBox="0 0 170 150" aria-hidden="true">
      {/* pegboard */}
      <rect
        x="6"
        y="2"
        width="158"
        height="80"
        rx="7"
        fill="#EBC792"
        stroke="#C8965A"
        strokeWidth="3"
      />
      {PEG_HOLES.map((h) => (
        <circle key={`${h.cx}-${h.cy}`} cx={h.cx} cy={h.cy} r="1.8" fill="#B98449" opacity="0.55" />
      ))}
      {/* a pinned drawing: sun over grass */}
      <g transform="rotate(-6 36 34)">
        <rect x="16" y="14" width="42" height="36" rx="2" fill="#ffffff" />
        <circle cx="30" cy="27" r="6" fill="#FFC93C" />
        <path
          d="M30 17v-2M30 39v-2M20 27h-2M42 27h-2"
          stroke="#FFC93C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M17 44q10-6 20 0t20 0" stroke="#5FCB52" strokeWidth="3" fill="none" />
        <circle cx="37" cy="16" r="2.6" fill="#F4553D" />
      </g>
      {/* a pinned drawing: a rainbow */}
      <g transform="rotate(5 132 32)">
        <rect x="112" y="12" width="42" height="36" rx="2" fill="#ffffff" />
        <path d="M118 42a15 15 0 0 1 30 0" stroke="#F4553D" strokeWidth="3.4" fill="none" />
        <path d="M122 42a11 11 0 0 1 22 0" stroke="#FFC93C" strokeWidth="3.4" fill="none" />
        <path d="M126 42a7 7 0 0 1 14 0" stroke="#3DA5F4" strokeWidth="3.4" fill="none" />
        <circle cx="133" cy="14" r="2.6" fill="#3DA5F4" />
      </g>
      {/* three brushes on pegs */}
      {[
        { x: 72, tip: "#9B5DE5" },
        { x: 84, tip: "#FF7EB6" },
        { x: 96, tip: "#5FCB52" },
      ].map((b) => (
        <g key={b.x}>
          <circle cx={b.x} cy="12" r="2.4" fill="#8A5528" />
          <rect x={b.x - 2.2} y="14" width="4.4" height="34" rx="2" fill="#D98A45" />
          <rect x={b.x - 2.8} y="46" width="5.6" height="7" fill="#C9CED6" />
          <path d={`M${b.x - 3} 53h6l-3 12Z`} fill={b.tip} />
        </g>
      ))}

      {/* the shelf */}
      <rect x="0" y="126" width="170" height="10" rx="3" fill="#C07A3E" />
      <rect x="0" y="134" width="170" height="3" fill="#8F5424" opacity="0.6" />
      <path d="M18 136v10l12-10ZM152 136v10l-12-10Z" fill="#8F5424" />

      {/* paint pots, each with a drip down its side */}
      {POTS.map((p) => (
        <g key={p.x}>
          <rect
            x={p.x}
            y="100"
            width="26"
            height="26"
            rx="5"
            fill="#ffffff"
            stroke="#DADDE6"
            strokeWidth="1.6"
          />
          <rect x={p.x} y="100" width="26" height="12" rx="5" fill={p.fill} />
          <path d={`M${p.x + 6} 110v6a2.4 2.4 0 0 0 4.8 0v-6Z`} fill={p.fill} />
          <rect x={p.x - 2} y="96" width="30" height="6" rx="3" fill={p.fill} opacity="0.85" />
          <ellipse cx={p.x + 13} cy="96.5" rx="10" ry="2" fill="#ffffff" opacity="0.35" />
        </g>
      ))}

      {/* a crayon cup */}
      {CRAYONS.map((c) => (
        <g key={c.x}>
          <rect x={c.x - 2.8} y={104 - c.h} width="5.6" height={c.h} fill={c.fill} />
          <path d={`M${c.x - 2.8} ${104 - c.h}l2.8 -7 2.8 7Z`} fill={c.fill} />
        </g>
      ))}
      <path d="M110 100h44l-4 26h-36Z" fill="#3DA5F4" />
      <path d="M110 100h44l-1 6h-42Z" fill="#1476C0" opacity="0.45" />
      <circle cx="132" cy="114" r="5" fill="#FFC93C" />
    </svg>
  );
}

/* ── A round braided rug ─────────────────────────────────────────────────── */

export function Rug() {
  const rings = [
    { rx: 150, ry: 30, fill: "#F4553D" },
    { rx: 132, ry: 26, fill: "#FFC93C" },
    { rx: 114, ry: 22, fill: "#3DA5F4" },
    { rx: 96, ry: 18, fill: "#5FCB52" },
    { rx: 78, ry: 14, fill: "#FFF3DA" },
  ];
  return (
    <svg viewBox="0 0 304 64" aria-hidden="true">
      <ellipse cx="152" cy="36" rx="150" ry="28" fill="#5a3310" opacity="0.14" />
      {rings.map((r) => (
        <ellipse key={r.rx} cx="152" cy="32" rx={r.rx} ry={r.ry} fill={r.fill} />
      ))}
      {rings.slice(0, 4).map((r) => (
        <ellipse
          key={`s${r.rx}`}
          cx="152"
          cy="32"
          rx={r.rx - 9}
          ry={r.ry - 2}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.45"
          strokeWidth="1.4"
          strokeDasharray="4 5"
        />
      ))}
    </svg>
  );
}

/* ── An artist's easel (the Shapes module) ────────────────────────────────────────── */

/** The easel behind one of the three big shapes. The canvas itself is the
 *  tappable tile, laid over the easel by the stylesheet so its bottom rests
 *  on the ledge drawn here at y = 104 of 170. */
export function EaselArt() {
  return (
    <svg viewBox="0 0 100 170" preserveAspectRatio="none" aria-hidden="true">
      <ellipse cx="50" cy="166" rx="40" ry="3.4" fill="#3a2410" opacity="0.16" />
      {/* back leg */}
      <path d="M50 18 58 164" stroke="#9A5D2C" strokeWidth="6" strokeLinecap="round" />
      {/* front legs */}
      <path d="M44 4 16 166" stroke="#D08A4A" strokeWidth="8" strokeLinecap="round" />
      <path d="M56 4 84 166" stroke="#D08A4A" strokeWidth="8" strokeLinecap="round" />
      <path d="M44 4 16 166M56 4 84 166" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M24 132h52" stroke="#B8733C" strokeWidth="6" strokeLinecap="round" />
      {/* top clamp */}
      <rect x="40" y="2" width="20" height="12" rx="3" fill="#B8733C" />
      {/* the ledge the canvas sits on */}
      <rect x="6" y="103" width="88" height="10" rx="3" fill="#B8733C" />
      <rect x="6" y="103" width="88" height="4" rx="2" fill="#E0A162" />
    </svg>
  );
}
