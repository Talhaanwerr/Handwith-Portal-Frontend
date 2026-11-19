"use client";

import { memo } from "react";
import type { SceneId } from "@games/word-lesson/constants/lesson";

/** One word's picture (Fluent 3D), filling its box. */
export const WlPic = memo(function WlPic({ src, dark = false }: { src: string; dark?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={`wl-pic ${dark ? "wl-pic--dark" : ""} ${src.endsWith(".jpg") ? "wl-pic--photo" : ""}`}
      draggable={false}
      aria-hidden="true"
    />
  );
});

/**
 * PAGE SIX's container, one per room: the barn (Animals), a wicker basket
 * (Food), a cupboard (At Home), a red wagon (Out and About) and a wardrobe
 * (Clothes). Drawn in two layers so a thing put away sits IN it: `back` is
 * behind the thing, `front` (the basket's and the wagon's sides) in front.
 */
export const BoxBack = memo(function BoxBack({ scene }: { scene: SceneId }) {
  return (
    <svg className="wl-box-svg" viewBox="0 0 200 200" aria-hidden="true">
      {scene === "barn" && (
        <>
          <path d="M8 78 L100 14 L192 78 Z" fill="#B8323B" />
          <rect x="20" y="72" width="160" height="122" fill="#D9414A" />
          <path d="M8 78 L100 14 L192 78" fill="none" stroke="#FFFFFF" strokeWidth="8" />
          <rect x="52" y="92" width="96" height="102" fill="#FFFFFF" />
          <rect x="60" y="100" width="80" height="94" fill="#5E1A20" />
          <rect
            x="24"
            y="96"
            width="30"
            height="96"
            fill="#C2363F"
            stroke="#FFFFFF"
            strokeWidth="4"
          />
          <rect
            x="146"
            y="96"
            width="30"
            height="96"
            fill="#C2363F"
            stroke="#FFFFFF"
            strokeWidth="4"
          />
        </>
      )}
      {scene === "kitchen" && (
        <>
          <path
            d="M36 100 Q36 18 100 18 Q164 18 164 100"
            fill="none"
            stroke="#A8692F"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <ellipse cx="100" cy="104" rx="84" ry="22" fill="#6B3E19" />
        </>
      )}
      {scene === "living" && (
        <>
          <rect x="14" y="16" width="172" height="178" rx="12" fill="#B06F33" />
          <rect x="28" y="30" width="144" height="150" rx="6" fill="#5A3417" />
          <rect x="28" y="104" width="144" height="10" fill="#B06F33" />
          <path d="M14 22 L-2 34 V176 L14 188 Z" fill="#C98A4B" />
          <path d="M186 22 L202 34 V176 L186 188 Z" fill="#C98A4B" />
        </>
      )}
      {scene === "park" && <ellipse cx="100" cy="98" rx="84" ry="18" fill="#7D1F23" />}
      {scene === "bedroom" && (
        <>
          <rect x="22" y="10" width="156" height="184" rx="12" fill="#8E5BC7" />
          <rect x="36" y="24" width="128" height="160" rx="6" fill="#4B2A70" />
          <rect x="40" y="46" width="120" height="8" rx="4" fill="#D9C4F2" />
          <path d="M22 16 L4 28 V180 L22 190 Z" fill="#B98AD9" />
          <path d="M178 16 L196 28 V180 L178 190 Z" fill="#B98AD9" />
        </>
      )}
    </svg>
  );
});

export const BoxFront = memo(function BoxFront({ scene }: { scene: SceneId }) {
  if (scene === "kitchen")
    return (
      <svg className="wl-box-svg wl-box-front" viewBox="0 0 200 200" aria-hidden="true">
        <path d="M16 104 Q100 132 184 104 L166 186 Q100 200 34 186 Z" fill="#D69A4E" />
        <g stroke="#B47A35" strokeWidth="5" fill="none">
          <path d="M22 130 Q100 152 178 130" />
          <path d="M28 156 Q100 176 172 156" />
          <path d="M70 116 L72 192 M100 120 V196 M130 116 L128 192" />
        </g>
        <path d="M16 104 Q100 132 184 104" stroke="#B47A35" strokeWidth="9" fill="none" />
      </svg>
    );
  if (scene === "park")
    return (
      <svg className="wl-box-svg wl-box-front" viewBox="0 0 200 200" aria-hidden="true">
        <path
          d="M8 156 Q-14 140 6 128"
          stroke="#3A3F55"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M14 98 Q100 118 186 98 L176 160 H24 Z" fill="#E8414B" />
        <path d="M14 98 Q100 118 186 98" stroke="#B8323B" strokeWidth="8" fill="none" />
        <rect x="32" y="128" width="136" height="10" rx="5" fill="#FFFFFF" opacity="0.6" />
        <circle cx="52" cy="170" r="22" fill="#3A3F55" />
        <circle cx="52" cy="170" r="9" fill="#C9CEDB" />
        <circle cx="148" cy="170" r="22" fill="#3A3F55" />
        <circle cx="148" cy="170" r="9" fill="#C9CEDB" />
      </svg>
    );
  return null;
});

/**
 * PAGE FIVE's hiding spots, one kind per room: a hay bale (Animals), a crate
 * (Food), a sofa cushion (At Home), a bush (Out and About), a pillow
 * (Clothes). A corner of what hides behind each peeks out above it.
 */
export const Cover = memo(function Cover({ scene, index }: { scene: SceneId; index: number }) {
  return (
    <svg className="wl-cover-svg" viewBox="0 0 200 140" aria-hidden="true">
      {scene === "barn" && (
        <>
          <rect x="6" y="14" width="188" height="120" rx="26" fill="#F2C94C" />
          <g stroke="#D9A82E" strokeWidth="5" strokeLinecap="round">
            <path d="M24 40 H80 M110 34 H176 M30 70 H150 M40 104 H96 M124 100 H178" />
          </g>
          <rect x="50" y="14" width="14" height="120" fill="#B5652E" />
          <rect x="136" y="14" width="14" height="120" fill="#B5652E" />
        </>
      )}
      {scene === "kitchen" && (
        <>
          <rect x="6" y="14" width="188" height="120" rx="10" fill="#D69A4E" />
          <g fill="#B47A35">
            <rect x="6" y="46" width="188" height="10" />
            <rect x="6" y="88" width="188" height="10" />
          </g>
          <rect
            x="6"
            y="14"
            width="188"
            height="120"
            rx="10"
            fill="none"
            stroke="#9A5F27"
            strokeWidth="8"
          />
          <rect x="74" y="58" width="52" height="26" rx="8" fill="#9A5F27" />
        </>
      )}
      {scene === "living" && (
        <>
          <rect
            x="8"
            y="16"
            width="184"
            height="118"
            rx="40"
            fill={index === 1 ? "#F7C548" : "#F28C8C"}
          />
          <path
            d="M40 40 Q100 56 160 40 M40 112 Q100 96 160 112"
            stroke="#FFFFFF"
            strokeOpacity="0.5"
            strokeWidth="6"
            fill="none"
          />
          <circle cx="100" cy="76" r="10" fill="#FFFFFF" opacity="0.8" />
        </>
      )}
      {scene === "park" && (
        <>
          <circle cx="50" cy="84" r="50" fill="#4E9E3A" />
          <circle cx="150" cy="84" r="50" fill="#4E9E3A" />
          <circle cx="100" cy="64" r="58" fill="#5FAE45" />
          <rect x="10" y="84" width="180" height="56" rx="24" fill="#5FAE45" />
          <circle cx="72" cy="58" r="8" fill="#E8414B" />
          <circle cx="140" cy="88" r="8" fill="#E8414B" />
          <circle cx="44" cy="104" r="8" fill="#E8414B" />
        </>
      )}
      {scene === "bedroom" && (
        <>
          <path
            d="M14 30 Q100 6 186 30 Q200 80 186 128 Q100 146 14 128 Q0 80 14 30 Z"
            fill={index === 1 ? "#FFF6DD" : "#BFE6FF"}
          />
          <path
            d="M30 46 Q100 30 170 46 M30 112 Q100 126 170 112"
            stroke="#8E5BC7"
            strokeOpacity="0.3"
            strokeWidth="6"
            fill="none"
          />
        </>
      )}
    </svg>
  );
});
