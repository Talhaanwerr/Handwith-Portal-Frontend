"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { P } from "@shared/components/pirate/palette";
import { PirateFlagMotif } from "@shared/components/pirate/PirateFlag";

/**
 * THE PIRATE SHIP — the theme's hero asset.
 *
 * Drawn with real ship anatomy so it reads as a SHIP and not a decorated
 * boat: curved bow with a bowsprit, planked hull with portholes, railed
 * deck, foremast and mainmast with set sails, rigging lines, a crow's nest,
 * a raised captain's cabin at the stern, the helm beside it, an anchor at
 * the bow and the flag at the maintop. Every colour is from the shared
 * pirate palette; every outline is a darker shade of its fill.
 *
 * Scales from a card thumbnail to a full-screen hero: sized by its parent
 * (width 100%), geometry lives in one 420×360 viewBox, and detail is drawn
 * with a handful of layered paths rather than filigree that melts at small
 * sizes.
 *
 * `bob` adds the one animation a ship at anchor is allowed: a slow, gentle
 * rise and roll. Off by default — stillness is the default everywhere in
 * this portal.
 */
export function PirateShip({ bob = false, className = "" }: { bob?: boolean; className?: string }) {
  const uid = useId();
  const hullId = `${uid}-hull`;
  const sailId = `${uid}-sail`;

  const art = (
    <svg
      viewBox="0 0 420 360"
      className={`pp-art ${className}`}
      role="img"
      aria-label="A friendly pirate sailing ship"
    >
      <defs>
        <linearGradient id={hullId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.WOOD_LIGHT} />
          <stop offset="0.55" stopColor={P.WOOD} />
          <stop offset="1" stopColor={P.WOOD_DEEP} />
        </linearGradient>
        <linearGradient id={sailId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={P.SAIL} />
          <stop offset="1" stopColor={P.SAIL_SHADE} />
        </linearGradient>
      </defs>

      {/* ── rigging (behind masts and sails) ── */}
      <g stroke={P.ROPE_DEEP} strokeWidth="2" strokeLinecap="round" opacity="0.9">
        <path d="M150 62 L96 208" fill="none" />
        <path d="M150 62 L204 200" fill="none" />
        <path d="M268 30 L206 204" fill="none" />
        <path d="M268 30 L330 210" fill="none" />
        <path d="M268 96 L150 120" fill="none" />
      </g>

      {/* ── foremast ── */}
      <rect
        x="145"
        y="58"
        width="10"
        height="160"
        rx="5"
        fill={P.WOOD_DEEP}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      {/* fore sail */}
      <path
        d="M152 78 Q210 96 208 168 L152 168 Q166 122 152 78 Z"
        fill={`url(#${sailId})`}
        stroke={P.PARCH_EDGE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* fore yard */}
      <rect
        x="126"
        y="72"
        width="52"
        height="7"
        rx="3.5"
        fill={P.WOOD}
        stroke={P.WOOD_LINE}
        strokeWidth="2"
      />

      {/* ── mainmast ── */}
      <rect
        x="262"
        y="26"
        width="12"
        height="196"
        rx="6"
        fill={P.WOOD_DEEP}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      {/* main sail */}
      <path
        d="M256 96 Q188 118 190 196 L256 196 Q240 144 256 96 Z"
        fill={`url(#${sailId})`}
        stroke={P.PARCH_EDGE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M280 90 Q344 112 342 192 L280 192 Q296 140 280 90 Z"
        fill={`url(#${sailId})`}
        stroke={P.PARCH_EDGE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* main yard */}
      <rect
        x="236"
        y="86"
        width="64"
        height="8"
        rx="4"
        fill={P.WOOD}
        stroke={P.WOOD_LINE}
        strokeWidth="2"
      />

      {/* crow's nest */}
      <path
        d="M252 60 h32 l-4 18 h-24 Z"
        fill={P.WOOD}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect
        x="250"
        y="54"
        width="36"
        height="8"
        rx="4"
        fill={P.WOOD_LIGHT}
        stroke={P.WOOD_LINE}
        strokeWidth="2"
      />

      {/* the flag at the maintop — the shared motif, not a copy */}
      <g transform="translate(272 4)">
        <rect x="-3" y="0" width="6" height="30" rx="3" fill={P.WOOD_DEEP} />
        <PirateFlagMotif width={64} />
      </g>

      {/* ── captain's cabin (raised stern structure) ── */}
      <g>
        <path
          d="M318 178 h58 q8 0 8 8 v36 h-70 v-38 q0 -6 4 -6 Z"
          fill={P.WOOD}
          stroke={P.WOOD_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect
          x="318"
          y="172"
          width="70"
          height="10"
          rx="5"
          fill={P.WOOD_GOLD}
          stroke={P.WOOD_LINE}
          strokeWidth="2.5"
        />
        {/* cabin window */}
        <circle cx="352" cy="202" r="10" fill={P.SKY} stroke={P.WOOD_GOLD} strokeWidth="3.5" />
      </g>

      {/* ── deck & railing ── */}
      <rect
        x="86"
        y="214"
        width="300"
        height="10"
        rx="5"
        fill={P.WOOD_LIGHT}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      <g stroke={P.WOOD_LINE} strokeWidth="2">
        <line x1="106" y1="206" x2="106" y2="214" />
        <line x1="136" y1="206" x2="136" y2="214" />
        <line x1="166" y1="206" x2="166" y2="214" />
        <line x1="196" y1="206" x2="196" y2="214" />
        <line x1="226" y1="206" x2="226" y2="214" />
      </g>
      <rect
        x="98"
        y="202"
        width="140"
        height="6"
        rx="3"
        fill={P.WOOD_GOLD}
        stroke={P.WOOD_LINE}
        strokeWidth="2"
      />

      {/* ── helm (beside the cabin) ── */}
      <g transform="translate(300 196)">
        <circle r="15" fill="none" stroke={P.WOOD_DEEP} strokeWidth="5" />
        <g stroke={P.WOOD_DEEP} strokeWidth="4" strokeLinecap="round">
          <line x1="-19" y1="0" x2="19" y2="0" />
          <line x1="0" y1="-19" x2="0" y2="19" />
          <line x1="-13.5" y1="-13.5" x2="13.5" y2="13.5" />
          <line x1="-13.5" y1="13.5" x2="13.5" y2="-13.5" />
        </g>
        <circle r="5" fill={P.WOOD_GOLD} stroke={P.WOOD_LINE} strokeWidth="2" />
      </g>

      {/* ── hull: bow sweeping up at the left, stern squared at the right ── */}
      <path
        d="M62 224
           Q56 250 84 286
           Q140 316 230 316
           Q330 316 366 282
           Q386 258 384 224
           L316 232 L230 236 L140 232 Z"
        fill={`url(#${hullId})`}
        stroke={P.WOOD_LINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* bow rising above the deck line */}
      <path
        d="M62 224 Q66 200 92 186 L104 202 Q84 212 86 224 Z"
        fill={P.WOOD}
        stroke={P.WOOD_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* bowsprit */}
      <rect
        x="70"
        y="176"
        width="74"
        height="8"
        rx="4"
        transform="rotate(-18 70 180)"
        fill={P.WOOD_DEEP}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      {/* gold trim along the gunwale */}
      <path
        d="M66 236 Q220 262 380 234"
        fill="none"
        stroke={P.WOOD_GOLD}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* plank lines */}
      <g stroke={P.WOOD_LINE} strokeWidth="2" opacity="0.45">
        <path d="M78 262 Q220 288 372 258" fill="none" />
        <path d="M96 286 Q222 306 352 282" fill="none" />
      </g>
      {/* portholes */}
      <g>
        <circle cx="150" cy="270" r="9" fill={P.SKY} stroke={P.WOOD_GOLD} strokeWidth="3.5" />
        <circle cx="216" cy="276" r="9" fill={P.SKY} stroke={P.WOOD_GOLD} strokeWidth="3.5" />
        <circle cx="282" cy="272" r="9" fill={P.SKY} stroke={P.WOOD_GOLD} strokeWidth="3.5" />
      </g>

      {/* ── anchor at the bow (the shared drawing, small) ── */}
      <g transform="translate(96 250) scale(0.34)">
        <AnchorShape />
      </g>
    </svg>
  );

  if (!bob) return art;
  return (
    <motion.div
      className="pp-motion"
      animate={{ y: [0, -7, 0], rotate: [0, 0.8, 0, -0.8, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="false"
    >
      {art}
    </motion.div>
  );
}

/** The anchor's raw geometry, shared by the standalone PirateAnchor and the
 *  ship (drawn once, mounted twice — never copied). Centred on 0,0 in a
 *  ~120-unit space. */
export function AnchorShape() {
  return (
    <g stroke={P.IRON_DEEP} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="0" cy="-44" r="12" fill="none" strokeWidth="9" />
      <line x1="0" y1="-32" x2="0" y2="34" strokeWidth="11" stroke={P.IRON} />
      <line x1="0" y1="-32" x2="0" y2="34" strokeWidth="5" stroke={P.IRON_DEEP} opacity="0.35" />
      <line x1="-22" y1="-12" x2="22" y2="-12" strokeWidth="9" stroke={P.IRON} />
      <path d="M0 34 Q-4 52 -34 46 L-26 28 Q-12 40 0 34" fill={P.IRON} strokeWidth="5" />
      <path d="M0 34 Q4 52 34 46 L26 28 Q12 40 0 34" fill={P.IRON} strokeWidth="5" />
    </g>
  );
}
