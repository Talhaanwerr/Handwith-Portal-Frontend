"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { C } from "@shared/components/construction/palette";

/**
 * THE MACHINES — the theme's heroes, all wearing the one machine yellow.
 *
 * The spec's dozens of "variants" are PROPS on single components, per the
 * portal's variant-over-duplicate rule: Excavator's arm has three poses and
 * a facing, the DumpTruck's bed tips, the Bulldozer's blade lifts, the
 * crane hangs different loads. Facing is a real mirror (scaleX) so one
 * drawing serves both directions.
 *
 * Motion is opt-in per machine (`working`), one machine per scene — the
 * site should feel alive, not busy.
 */

/** Mirrors its child when facing left. Wrapper-level, no inline styles. */
function Facing({ left, children }: { left?: boolean; children: ReactNode }) {
  return <g transform={left ? "translate(320 0) scale(-1 1)" : undefined}>{children}</g>;
}

export type ExcavatorPose = "digging" | "raised" | "parked";

/** THE EXCAVATOR — the site's flagship. Cab with window, boom + arm with
 *  hydraulic cylinders, bucket (with dirt when digging), tracks and
 *  counterweight, all present and readable at thumbnail size. */
export function Excavator({
  pose = "parked",
  facing = "right",
  working = false,
  className = "",
}: {
  pose?: ExcavatorPose;
  facing?: "left" | "right";
  working?: boolean;
  className?: string;
}) {
  // boom/arm/bucket geometry per pose (drawn facing right)
  const arm =
    pose === "digging" ? (
      <g>
        {/* boom down-forward */}
        <path
          d="M196 128 Q246 118 272 150 L258 164 Q238 138 200 146 Z"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* stick */}
        <path
          d="M262 152 L296 190 L282 200 L252 164 Z"
          fill={C.YELLOW_DEEP}
          stroke={C.YELLOW_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* hydraulic cylinder */}
        <path d="M212 122 L258 146" stroke={C.STEEL} strokeWidth="7" strokeLinecap="round" />
        <path d="M212 122 L236 134" stroke={C.STEEL_DEEP} strokeWidth="9" strokeLinecap="round" />
        {/* bucket with dirt */}
        <path
          d="M282 194 Q310 196 312 216 Q296 228 274 218 Q272 202 282 194 Z"
          fill={C.STEEL_DEEP}
          stroke={C.STEEL_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M284 198 Q300 192 306 206 Q294 200 284 204 Z"
          fill={C.DIRT}
          stroke={C.DIRT_LINE}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    ) : pose === "raised" ? (
      <g>
        <path
          d="M196 122 Q240 84 278 92 L274 110 Q244 104 204 138 Z"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M272 96 L308 118 L298 132 L264 110 Z"
          fill={C.YELLOW_DEEP}
          stroke={C.YELLOW_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M214 116 L262 100" stroke={C.STEEL} strokeWidth="7" strokeLinecap="round" />
        <path
          d="M298 126 Q322 134 318 154 Q300 158 288 142 Q288 130 298 126 Z"
          fill={C.STEEL_DEEP}
          stroke={C.STEEL_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>
    ) : (
      <g>
        <path
          d="M196 128 Q244 112 276 128 L268 146 Q242 132 202 146 Z"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M268 132 L296 162 L282 172 L258 146 Z"
          fill={C.YELLOW_DEEP}
          stroke={C.YELLOW_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M212 122 L256 132" stroke={C.STEEL} strokeWidth="7" strokeLinecap="round" />
        <path
          d="M282 166 Q306 172 306 192 Q288 200 272 188 Q272 172 282 166 Z"
          fill={C.STEEL_DEEP}
          stroke={C.STEEL_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>
    );

  const body = (
    <Facing left={facing === "left"}>
      {/* tracks */}
      <rect
        x="96"
        y="188"
        width="152"
        height="42"
        rx="21"
        fill={C.TRACK}
        stroke={C.CHARCOAL}
        strokeWidth="3.5"
      />
      <g fill={C.STEEL_DEEP}>
        <circle cx="120" cy="209" r="11" />
        <circle cx="150" cy="209" r="11" />
        <circle cx="180" cy="209" r="11" />
        <circle cx="210" cy="209" r="11" />
      </g>
      <circle cx="120" cy="209" r="4.5" fill={C.STEEL} />
      <circle cx="210" cy="209" r="4.5" fill={C.STEEL} />
      {/* slew deck + counterweight */}
      <rect
        x="88"
        y="164"
        width="150"
        height="26"
        rx="10"
        fill={C.YELLOW_DEEP}
        stroke={C.YELLOW_LINE}
        strokeWidth="3"
      />
      <path d="M88 176 Q78 176 78 166 L88 152 Z" fill={C.CHARCOAL} />
      {/* engine housing */}
      <rect
        x="92"
        y="128"
        width="70"
        height="44"
        rx="10"
        fill={C.YELLOW}
        stroke={C.YELLOW_LINE}
        strokeWidth="3.5"
      />
      <g stroke={C.YELLOW_LINE} strokeWidth="2.5" opacity="0.6">
        <path d="M102 140 h50" fill="none" />
        <path d="M102 152 h50" fill="none" />
      </g>
      {/* cab with operator window */}
      <path
        d="M158 110 h44 q10 0 10 10 v52 h-62 v-52 q0 -10 8 -10 Z"
        fill={C.YELLOW}
        stroke={C.YELLOW_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M162 118 h36 v28 h-36 Z"
        fill={C.CAB_GLASS}
        stroke={C.YELLOW_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* exhaust */}
      <rect x="98" y="112" width="9" height="20" rx="4" fill={C.CHARCOAL} />
      {arm}
    </Facing>
  );

  const art = (
    <svg
      viewBox="0 0 320 240"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A yellow excavator"
    >
      {body}
    </svg>
  );

  if (!working) return art;
  return (
    <motion.div
      className="pl-art"
      animate={{ rotate: [0, 0.6, 0, -0.4, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {art}
    </motion.div>
  );
}

/** THE DUMP TRUCK — cab, wheels, hydraulic ram, and a bed that tips. */
export function DumpTruck({
  bed = "down",
  loaded = true,
  facing = "right",
  className = "",
}: {
  bed?: "down" | "tipping";
  loaded?: boolean;
  facing?: "left" | "right";
  className?: string;
}) {
  const tipping = bed === "tipping";

  const dirtInBed = loaded && (
    <path
      d="M96 96 Q140 66 196 92 L196 104 L96 104 Z"
      fill={C.DIRT}
      stroke={C.DIRT_LINE}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  );

  return (
    <svg
      viewBox="0 0 320 200"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A yellow dump truck"
    >
      <Facing left={facing === "left"}>
        {/* falling dirt when tipping */}
        {tipping && loaded && (
          <g fill={C.DIRT} stroke={C.DIRT_LINE} strokeWidth="2">
            <circle cx="70" cy="140" r="6" />
            <circle cx="58" cy="158" r="5" />
            <circle cx="76" cy="162" r="4" />
            <path d="M46 176 Q70 162 92 176 Z" />
          </g>
        )}
        {/* bed (rotates around its rear hinge when tipping) */}
        <g transform={tipping ? "rotate(-24 200 128)" : undefined}>
          <path
            d="M88 88 h112 q10 0 10 10 v30 h-132 v-30 q0 -10 10 -10 Z"
            fill={C.YELLOW}
            stroke={C.YELLOW_LINE}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <g stroke={C.YELLOW_LINE} strokeWidth="2.5" opacity="0.6">
            <path d="M104 92 v36" fill="none" />
            <path d="M136 92 v36" fill="none" />
            <path d="M168 92 v36" fill="none" />
          </g>
          {dirtInBed}
        </g>
        {/* hydraulic ram */}
        <path d="M196 132 L172 108" stroke={C.STEEL} strokeWidth="7" strokeLinecap="round" />
        {/* chassis */}
        <rect x="72" y="128" width="176" height="18" rx="8" fill={C.CHARCOAL} />
        {/* cab */}
        <path
          d="M232 90 h34 q12 2 16 14 l8 24 v18 h-58 Z"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M238 98 h26 l8 22 h-34 Z"
          fill={C.CAB_GLASS}
          stroke={C.YELLOW_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* wheels */}
        <g>
          <circle cx="108" cy="152" r="22" fill={C.TRACK} stroke={C.CHARCOAL} strokeWidth="3.5" />
          <circle cx="156" cy="152" r="22" fill={C.TRACK} stroke={C.CHARCOAL} strokeWidth="3.5" />
          <circle cx="252" cy="152" r="22" fill={C.TRACK} stroke={C.CHARCOAL} strokeWidth="3.5" />
          <circle cx="108" cy="152" r="9" fill={C.STEEL} />
          <circle cx="156" cy="152" r="9" fill={C.STEEL} />
          <circle cx="252" cy="152" r="9" fill={C.STEEL} />
        </g>
      </Facing>
    </svg>
  );
}

/** THE BULLDOZER — big front blade (down or raised), tracks, cabin. */
export function Bulldozer({
  blade = "down",
  facing = "right",
  className = "",
}: {
  blade?: "down" | "raised";
  facing?: "left" | "right";
  className?: string;
}) {
  const raised = blade === "raised";
  return (
    <svg
      viewBox="0 0 320 200"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A yellow bulldozer"
    >
      <Facing left={facing === "left"}>
        {/* blade */}
        <g transform={raised ? "translate(0 -26) rotate(-6 262 140)" : undefined}>
          <path
            d="M250 96 q22 4 24 44 q0 22 -20 26 l-8 -4 v-62 Z"
            fill={C.STEEL}
            stroke={C.STEEL_LINE}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M250 112 q14 2 16 28"
            fill="none"
            stroke={C.STEEL_LINE}
            strokeWidth="2.5"
            opacity="0.6"
          />
        </g>
        {/* push arms */}
        <path d="M200 140 L250 132" stroke={C.YELLOW_DEEP} strokeWidth="9" strokeLinecap="round" />
        {/* body */}
        <rect
          x="86"
          y="104"
          width="128"
          height="52"
          rx="12"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3.5"
        />
        <path
          d="M118 104 v-26 q0 -8 8 -8 h48 q8 0 8 8 v26 Z"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <rect
          x="128"
          y="78"
          width="44"
          height="22"
          rx="4"
          fill={C.CAB_GLASS}
          stroke={C.YELLOW_LINE}
          strokeWidth="3"
        />
        {/* exhaust */}
        <rect x="102" y="72" width="9" height="26" rx="4" fill={C.CHARCOAL} />
        <g stroke={C.YELLOW_LINE} strokeWidth="2.5" opacity="0.6">
          <path d="M96 120 h100" fill="none" />
        </g>
        {/* tracks */}
        <rect
          x="80"
          y="146"
          width="150"
          height="40"
          rx="20"
          fill={C.TRACK}
          stroke={C.CHARCOAL}
          strokeWidth="3.5"
        />
        <g fill={C.STEEL_DEEP}>
          <circle cx="104" cy="166" r="10" />
          <circle cx="134" cy="166" r="10" />
          <circle cx="164" cy="166" r="10" />
          <circle cx="194" cy="166" r="10" />
        </g>
      </Facing>
    </svg>
  );
}

export type CraneLoad = "none" | "block" | "beam";

/** THE TOWER CRANE — tower, jib, counterweight, cable, hook, optional
 *  load. `swing` allows the one motion a crane earns. */
export function TowerCrane({
  load = "none",
  hookDrop = 0.55,
  swing = false,
  className = "",
}: {
  load?: CraneLoad;
  /** How far down the cable hangs, 0..1 of the available height. */
  hookDrop?: number;
  swing?: boolean;
  className?: string;
}) {
  const drop = 40 + Math.max(0, Math.min(1, hookDrop)) * 150;
  const hookY = 58 + drop;

  const hanging = (
    <g>
      <line x1="88" y1="58" x2="88" y2={hookY} stroke={C.STEEL_LINE} strokeWidth="3" />
      <path
        d={`M82 ${hookY} h12 l-2 10 q-4 8 -10 2 Z`}
        fill={C.STEEL_DEEP}
        stroke={C.STEEL_LINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {load === "block" && (
        <rect
          x="64"
          y={hookY + 12}
          width="48"
          height="34"
          rx="5"
          fill={C.CONCRETE}
          stroke={C.CONCRETE_DEEP}
          strokeWidth="3"
        />
      )}
      {load === "beam" && (
        <rect
          x="44"
          y={hookY + 12}
          width="88"
          height="14"
          rx="4"
          fill={C.STEEL}
          stroke={C.STEEL_LINE}
          strokeWidth="3"
        />
      )}
    </g>
  );

  return (
    <svg
      viewBox="0 0 300 320"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A tower crane"
    >
      {/* tower lattice */}
      <rect
        x="176"
        y="70"
        width="22"
        height="230"
        fill={C.YELLOW}
        stroke={C.YELLOW_LINE}
        strokeWidth="3"
      />
      <g stroke={C.YELLOW_LINE} strokeWidth="2" opacity="0.7">
        <path
          d="M176 100 L198 120 M198 100 L176 120 M176 150 L198 170 M198 150 L176 170 M176 200 L198 220 M198 200 L176 220 M176 250 L198 270 M198 250 L176 270"
          fill="none"
        />
      </g>
      {/* base */}
      <rect x="160" y="296" width="54" height="14" rx="5" fill={C.CHARCOAL} />
      {/* cab */}
      <rect
        x="168"
        y="52"
        width="38"
        height="26"
        rx="6"
        fill={C.YELLOW}
        stroke={C.YELLOW_LINE}
        strokeWidth="3"
      />
      <rect
        x="174"
        y="58"
        width="18"
        height="14"
        rx="3"
        fill={C.CAB_GLASS}
        stroke={C.YELLOW_LINE}
        strokeWidth="2"
      />
      {/* jib + counter-jib */}
      <rect
        x="40"
        y="46"
        width="230"
        height="12"
        rx="5"
        fill={C.YELLOW}
        stroke={C.YELLOW_LINE}
        strokeWidth="3"
      />
      <g stroke={C.YELLOW_LINE} strokeWidth="2" opacity="0.7">
        <path d="M60 46 L80 58 M100 46 L120 58 M140 46 L160 58" fill="none" />
      </g>
      {/* counterweight */}
      <rect
        x="242"
        y="58"
        width="30"
        height="22"
        rx="4"
        fill={C.CONCRETE_DEEP}
        stroke={C.STEEL_LINE}
        strokeWidth="3"
      />
      {/* apex ties */}
      <path
        d="M187 20 L60 46 M187 20 L250 46"
        stroke={C.STEEL_LINE}
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M182 16 h10 v30 h-10 Z"
        fill={C.YELLOW_DEEP}
        stroke={C.YELLOW_LINE}
        strokeWidth="2.5"
      />
      {/* the cable, hook and load */}
      {swing ? (
        <motion.g
          animate={{ rotate: [0, 2.2, 0, -2.2, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          /* motion parameter, not styling — the load swings from the jib
             point, the documented hinge-origin exception */
          style={{ originX: "88px", originY: "58px" }}
        >
          {hanging}
        </motion.g>
      ) : (
        hanging
      )}
    </svg>
  );
}

/** The concrete mixer truck — cab plus turning drum. */
export function MixerTruck({
  facing = "right",
  className = "",
}: {
  facing?: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A concrete mixer truck"
    >
      <Facing left={facing === "left"}>
        <rect x="72" y="128" width="176" height="18" rx="8" fill={C.CHARCOAL} />
        {/* drum */}
        <path
          d="M92 128 Q84 84 128 72 Q186 60 198 96 Q204 118 188 128 Z"
          fill={C.ORANGE}
          stroke={C.ORANGE_DEEP}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <g stroke={C.ORANGE_DEEP} strokeWidth="3" opacity="0.7">
          <path d="M104 100 Q140 84 188 96" fill="none" />
          <path d="M98 116 Q142 100 194 112" fill="none" />
        </g>
        <rect
          x="182"
          y="96"
          width="18"
          height="32"
          rx="5"
          fill={C.STEEL}
          stroke={C.STEEL_LINE}
          strokeWidth="3"
        />
        {/* cab */}
        <path
          d="M232 90 h34 q12 2 16 14 l8 24 v18 h-58 Z"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M238 98 h26 l8 22 h-34 Z"
          fill={C.CAB_GLASS}
          stroke={C.YELLOW_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <g>
          <circle cx="112" cy="152" r="22" fill={C.TRACK} stroke={C.CHARCOAL} strokeWidth="3.5" />
          <circle cx="160" cy="152" r="22" fill={C.TRACK} stroke={C.CHARCOAL} strokeWidth="3.5" />
          <circle cx="252" cy="152" r="22" fill={C.TRACK} stroke={C.CHARCOAL} strokeWidth="3.5" />
          <circle cx="112" cy="152" r="9" fill={C.STEEL} />
          <circle cx="160" cy="152" r="9" fill={C.STEEL} />
          <circle cx="252" cy="152" r="9" fill={C.STEEL} />
        </g>
      </Facing>
    </svg>
  );
}

/** The road roller — smooth drum forward, cab behind. */
export function RoadRoller({
  facing = "right",
  className = "",
}: {
  facing?: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A road roller"
    >
      <Facing left={facing === "left"}>
        {/* drum */}
        <circle cx="236" cy="146" r="40" fill={C.STEEL} stroke={C.STEEL_LINE} strokeWidth="3.5" />
        <circle cx="236" cy="146" r="16" fill={C.CONCRETE} stroke={C.STEEL_LINE} strokeWidth="3" />
        <path
          d="M196 118 h44 v56 h-10"
          fill="none"
          stroke={C.YELLOW_DEEP}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* body + cab */}
        <rect
          x="96"
          y="104"
          width="110"
          height="46"
          rx="12"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3.5"
        />
        <path
          d="M116 104 v-24 q0 -8 8 -8 h44 q8 0 8 8 v24 Z"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <rect
          x="126"
          y="80"
          width="40"
          height="20"
          rx="4"
          fill={C.CAB_GLASS}
          stroke={C.YELLOW_LINE}
          strokeWidth="3"
        />
        <circle cx="124" cy="156" r="26" fill={C.TRACK} stroke={C.CHARCOAL} strokeWidth="3.5" />
        <circle cx="124" cy="156" r="10" fill={C.STEEL} />
      </Facing>
    </svg>
  );
}
