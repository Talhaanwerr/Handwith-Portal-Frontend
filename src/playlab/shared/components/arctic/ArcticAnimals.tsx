"use client";

import { useId } from "react";
import { A } from "@shared/components/arctic/palette";

/**
 * THE ARCTIC ANIMALS — soft, rounded and friendly (small eyes, gentle
 * smiles; nothing documentary, nothing sticker-cartoonish). Pose props
 * change the DRAWING, never start an animation — the portal's character
 * convention: stillness by default, and a consumer that wants idle motion
 * wraps the wrapper.
 */

export type BearPose = "standing" | "sitting" | "waving";

/** The polar bear — the theme's biggest friend. */
export function PolarBear({
  pose = "sitting",
  cub = false,
  className = "",
}: {
  pose?: BearPose;
  cub?: boolean;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-bear`;
  return (
    <svg
      viewBox="0 0 220 180"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A friendly polar bear"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.BEAR} />
          <stop offset="1" stopColor={A.BEAR_SHADE} />
        </linearGradient>
      </defs>

      {pose === "standing" ? (
        // long low body on four legs
        <g>
          <path
            d="M34 120 Q30 74 84 68 Q150 60 176 84 Q192 98 186 122 Q182 140 160 140 L60 140 Q36 140 34 120 Z"
            fill={`url(#${gid})`}
            stroke={A.BEAR_LINE}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <g fill={`url(#${gid})`} stroke={A.BEAR_LINE} strokeWidth="3">
            <rect x="52" y="130" width="20" height="28" rx="9" />
            <rect x="96" y="132" width="20" height="26" rx="9" />
            <rect x="140" y="130" width="20" height="28" rx="9" />
          </g>
        </g>
      ) : (
        // seated pear body (waving shares it, with a raised arm)
        <g>
          <path
            d="M56 158 Q42 100 86 78 Q128 60 158 92 Q182 118 172 158 Z"
            fill={`url(#${gid})`}
            stroke={A.BEAR_LINE}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <ellipse cx="114" cy="132" rx="30" ry="24" fill={A.WHITE} opacity="0.65" />
          {/* forepaws */}
          {pose === "waving" ? (
            <>
              <path
                d="M66 118 Q44 100 46 74 Q62 78 76 98 Q82 110 66 118 Z"
                fill={`url(#${gid})`}
                stroke={A.BEAR_LINE}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <ellipse
                cx="146"
                cy="150"
                rx="16"
                ry="10"
                fill={`url(#${gid})`}
                stroke={A.BEAR_LINE}
                strokeWidth="3"
              />
            </>
          ) : (
            <>
              <ellipse
                cx="82"
                cy="150"
                rx="16"
                ry="10"
                fill={`url(#${gid})`}
                stroke={A.BEAR_LINE}
                strokeWidth="3"
              />
              <ellipse
                cx="146"
                cy="150"
                rx="16"
                ry="10"
                fill={`url(#${gid})`}
                stroke={A.BEAR_LINE}
                strokeWidth="3"
              />
            </>
          )}
        </g>
      )}

      {/* head — shared by every pose, placed for each */}
      <g transform={pose === "standing" ? "translate(160 52)" : "translate(96 34)"}>
        <circle
          cx="30"
          cy="30"
          r="28"
          fill={`url(#${gid})`}
          stroke={A.BEAR_LINE}
          strokeWidth="3.5"
        />
        <circle cx="10" cy="8" r="9" fill={`url(#${gid})`} stroke={A.BEAR_LINE} strokeWidth="3" />
        <circle cx="50" cy="8" r="9" fill={`url(#${gid})`} stroke={A.BEAR_LINE} strokeWidth="3" />
        <ellipse cx="30" cy="40" rx="12" ry="9" fill={A.WHITE} />
        <ellipse cx="30" cy="36" rx="5" ry="4" fill={A.INK} />
        <path
          d="M25 45 q5 4 10 0"
          fill="none"
          stroke={A.INK}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="18" cy="26" r="3" fill={A.INK} />
        <circle cx="42" cy="26" r="3" fill={A.INK} />
      </g>

      {cub && (
        <g transform="translate(4 108) scale(0.42)">
          <path
            d="M56 158 Q42 100 86 78 Q128 60 158 92 Q182 118 172 158 Z"
            fill={`url(#${gid})`}
            stroke={A.BEAR_LINE}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <g transform="translate(96 34)">
            <circle
              cx="30"
              cy="30"
              r="28"
              fill={`url(#${gid})`}
              stroke={A.BEAR_LINE}
              strokeWidth="5"
            />
            <circle
              cx="10"
              cy="8"
              r="9"
              fill={`url(#${gid})`}
              stroke={A.BEAR_LINE}
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="8"
              r="9"
              fill={`url(#${gid})`}
              stroke={A.BEAR_LINE}
              strokeWidth="4"
            />
            <ellipse cx="30" cy="38" rx="10" ry="7" fill={A.WHITE} />
            <ellipse cx="30" cy="35" rx="4.5" ry="3.5" fill={A.INK} />
            <circle cx="18" cy="26" r="3" fill={A.INK} />
            <circle cx="42" cy="26" r="3" fill={A.INK} />
          </g>
        </g>
      )}
    </svg>
  );
}

export type PenguinPose = "standing" | "sliding" | "chick";

/** The penguin — upright, sliding on its belly, or a fluffy chick. */
export function Penguin({
  pose = "standing",
  className = "",
}: {
  pose?: PenguinPose;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-peng`;
  const body = pose === "chick" ? A.OWL_MARK : A.PENGUIN_INK;
  const line = pose === "chick" ? A.SNOW_LINE : A.PENGUIN_DEEP;

  if (pose === "sliding") {
    return (
      <svg
        viewBox="0 0 180 90"
        className={`pl-art ${className}`}
        role="img"
        aria-label="A penguin sliding on its belly"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={A.PENGUIN_INK} />
            <stop offset="1" stopColor={A.PENGUIN_DEEP} />
          </linearGradient>
        </defs>
        <path
          d="M18 62 Q30 30 84 30 Q140 30 158 54 Q166 66 150 70 L34 74 Q18 72 18 62 Z"
          fill={`url(#${gid})`}
          stroke={A.PENGUIN_DEEP}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M44 62 Q90 46 140 60 L138 68 L44 70 Z" fill={A.WHITE} />
        <path
          d="M64 34 Q84 18 104 34 Q86 40 64 34 Z"
          fill={`url(#${gid})`}
          stroke={A.PENGUIN_DEEP}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="150" cy="44" r="4" fill={A.WHITE} />
        <circle cx="151" cy="44" r="2" fill={A.INK} />
        <path
          d="M160 50 L174 54 L160 58 Z"
          fill={A.CARROT}
          stroke={A.FIRE_DEEP}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <ellipse cx="88" cy="80" rx="66" ry="6" fill={A.ICE_CORE} opacity="0.15" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 120 160"
      className={`pl-art ${className}`}
      role="img"
      aria-label={pose === "chick" ? "A penguin chick" : "A penguin"}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={body} />
          <stop offset="1" stopColor={line} />
        </linearGradient>
      </defs>
      {/* body */}
      <path
        d="M28 108 Q24 44 60 40 Q96 44 92 108 Q90 142 60 144 Q30 142 28 108 Z"
        fill={`url(#${gid})`}
        stroke={line}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* belly */}
      <path d="M42 100 Q40 62 60 60 Q80 62 78 100 Q76 130 60 132 Q44 130 42 100 Z" fill={A.WHITE} />
      {/* flippers */}
      <path
        d="M28 78 Q10 92 16 114 Q30 106 34 88 Z"
        fill={`url(#${gid})`}
        stroke={line}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M92 78 Q110 92 104 114 Q90 106 86 88 Z"
        fill={`url(#${gid})`}
        stroke={line}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* face */}
      <circle cx="50" cy="66" r="4.5" fill={pose === "chick" ? A.INK : A.WHITE} />
      <circle cx="70" cy="66" r="4.5" fill={pose === "chick" ? A.INK : A.WHITE} />
      {pose !== "chick" && (
        <>
          <circle cx="51" cy="67" r="2.2" fill={A.INK} />
          <circle cx="71" cy="67" r="2.2" fill={A.INK} />
        </>
      )}
      <path
        d="M54 76 L60 84 L66 76 Z"
        fill={A.CARROT}
        stroke={A.FIRE_DEEP}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* feet */}
      <path
        d="M44 144 L38 152 L54 152 Z"
        fill={A.CARROT}
        stroke={A.FIRE_DEEP}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M76 144 L66 152 L82 152 Z"
        fill={A.CARROT}
        stroke={A.FIRE_DEEP}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {pose === "chick" && (
        // downy tufts
        <g stroke={A.SNOW_LINE} strokeWidth="2.5" strokeLinecap="round">
          <path d="M52 42 q2 -8 8 -10" fill="none" />
          <path d="M64 42 q0 -8 6 -12" fill="none" />
        </g>
      )}
    </svg>
  );
}

export type FoxPose = "sitting" | "curled";

/** The arctic fox — white on white, drawn by its shadows. */
export function ArcticFox({
  pose = "sitting",
  className = "",
}: {
  pose?: FoxPose;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-fox`;

  if (pose === "curled") {
    return (
      <svg
        viewBox="0 0 160 100"
        className={`pl-art ${className}`}
        role="img"
        aria-label="An arctic fox curled up asleep"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={A.FOX} />
            <stop offset="1" stopColor={A.FOX_SHADE} />
          </linearGradient>
        </defs>
        <path
          d="M20 66 Q18 26 78 22 Q140 26 140 62 Q140 88 80 88 Q22 88 20 66 Z"
          fill={`url(#${gid})`}
          stroke={A.FOX_LINE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* tail wrapping around */}
        <path
          d="M132 66 Q148 74 138 86 Q112 96 84 88 Q116 84 132 66 Z"
          fill={A.FOX_SHADE}
          stroke={A.FOX_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* tucked head */}
        <g transform="translate(34 34)">
          <path
            d="M4 26 Q2 6 24 4 Q44 6 44 24 Q44 38 24 38 Q6 38 4 26 Z"
            fill={`url(#${gid})`}
            stroke={A.FOX_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M8 8 L2 -6 L18 2 Z"
            fill={A.FOX}
            stroke={A.FOX_LINE}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M32 6 L38 -8 L46 6 Z"
            fill={A.FOX}
            stroke={A.FOX_LINE}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M14 24 q4 3 8 0"
            fill="none"
            stroke={A.INK}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="10" cy="28" r="2.6" fill={A.INK} />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 140 150"
      className={`pl-art ${className}`}
      role="img"
      aria-label="An arctic fox sitting"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.FOX} />
          <stop offset="1" stopColor={A.FOX_SHADE} />
        </linearGradient>
      </defs>
      {/* haunches */}
      <path
        d="M30 138 Q22 92 52 78 Q88 66 104 96 Q116 118 108 138 Z"
        fill={`url(#${gid})`}
        stroke={A.FOX_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* tail sweeping forward */}
      <path
        d="M104 126 Q136 116 132 88 Q116 92 104 108 Q98 120 104 126 Z"
        fill={A.FOX_SHADE}
        stroke={A.FOX_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* chest + forelegs */}
      <path
        d="M52 138 Q48 104 62 96 Q76 104 74 138 Z"
        fill={A.WHITE}
        stroke={A.FOX_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* head */}
      <g transform="translate(30 12)">
        <path
          d="M6 40 Q4 14 32 12 Q60 14 58 40 Q58 58 32 58 Q6 58 6 40 Z"
          fill={`url(#${gid})`}
          stroke={A.FOX_LINE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 18 L4 -4 L26 8 Z"
          fill={A.FOX}
          stroke={A.FOX_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M38 8 L48 -6 L58 16 Z"
          fill={A.FOX}
          stroke={A.FOX_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M12 14 L9 3 L20 10 Z" fill={A.SCARF} opacity="0.35" />
        <circle cx="22" cy="34" r="3" fill={A.INK} />
        <circle cx="44" cy="34" r="3" fill={A.INK} />
        <ellipse cx="33" cy="44" rx="4" ry="3" fill={A.INK} />
        <path
          d="M28 50 q5 4 10 0"
          fill="none"
          stroke={A.INK}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** The seal — round and content on its ice, or a white-coated pup. */
export function ArcticSeal({ pup = false, className = "" }: { pup?: boolean; className?: string }) {
  const uid = useId();
  const gid = `${uid}-seal`;
  const body = pup ? A.FOX : A.SEAL;
  const deep = pup ? A.FOX_SHADE : A.SEAL_DEEP;
  const line = pup ? A.FOX_LINE : A.SEAL_DEEP;

  return (
    <svg
      viewBox="0 0 200 110"
      className={`pl-art ${className}`}
      role="img"
      aria-label={pup ? "A baby seal" : "A seal resting on the ice"}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={body} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      {/* body — a soft banana curve, chest up */}
      <path
        d="M18 84 Q28 44 78 40 Q136 36 168 62 Q186 76 176 92 Q168 100 148 98 L44 98 Q20 98 18 84 Z"
        fill={`url(#${gid})`}
        stroke={line}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <ellipse cx="96" cy="84" rx="44" ry="16" fill={A.WHITE} opacity={pup ? 0.7 : 0.35} />
      {/* tail flippers */}
      <path
        d="M172 78 Q192 66 196 50 Q184 54 176 64 Q186 60 190 48 Q176 52 168 66 Z"
        fill={`url(#${gid})`}
        stroke={line}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* fore flipper */}
      <path
        d="M84 92 Q92 102 110 100 Q102 88 88 88 Z"
        fill={deep}
        stroke={line}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* head */}
      <g transform="translate(18 30)">
        <circle cx="30" cy="30" r="26" fill={`url(#${gid})`} stroke={line} strokeWidth="3.5" />
        <circle cx="20" cy="26" r="3.4" fill={A.INK} />
        <circle cx="42" cy="26" r="3.4" fill={A.INK} />
        <ellipse cx="31" cy="36" rx="4.5" ry="3.5" fill={A.INK} />
        <path
          d="M25 42 q6 4 12 0"
          fill="none"
          stroke={A.INK}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <g stroke={line} strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
          <path d="M12 34 L2 32" fill="none" />
          <path d="M12 38 L3 40" fill="none" />
          <path d="M50 34 L60 32" fill="none" />
          <path d="M50 38 L59 40" fill="none" />
        </g>
      </g>
    </svg>
  );
}
