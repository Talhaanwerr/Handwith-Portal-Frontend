"use client";

import {
  CANDY,
  Cloud,
  CandyGround,
  CandyCastle,
  CottonCandyTree,
  LollipopTree,
  GumdropTree,
  Peppermint,
  Gumdrop,
  CandyFlower,
  Cupcake,
  CandyMushroom,
  Sparkle,
  RainbowArc,
} from "./CandyArt";

/**
 * CandyWorld — the environment behind every screen of the game.
 *
 * Layer order, back to front (each is its own absolutely positioned band):
 *
 *   sky          the `.lt-wash` gradient on the screen itself (in CSS)
 *   atmosphere   rainbow arc, sun-glow and drifting sparkles
 *   clouds       three silhouettes, distant ones lighter and smaller
 *   far          castle on the horizon
 *   ground       far / mid / near hills + the winding path (one SVG)
 *   mid          smaller trees and landmarks standing on the mid hills
 *   near         the big trees and sweets that frame the play area
 *
 * Composition rule: the central safe zone (roughly the middle 60% of the
 * width and the middle 55% of the height) contains nothing but sky, soft
 * hill tops and the path. Every tree, landmark and sweet sits in the outer
 * bands, and the CSS moves them between portrait and landscape so they never
 * drift behind the letter.
 *
 * All placement and sizing lives in letter-treats.css (`.ltw-*`); this file
 * only decides WHAT exists and in which layer.
 */
export type WorldVariant = "full" | "soft" | "calm";

/**
 * Three densities of the same world:
 *   full  splash - everything
 *   soft  alphabet set - sky, clouds, rainbow, hills, castle and the two big
 *         framing trees; none of the small sweets, so the letter grid is the
 *         only busy thing on the screen
 *   calm  letter + challenge - pastel gradients only, no shapes
 */
export function CandyWorld({ variant = "full" }: { variant?: WorldVariant }) {
  if (variant === "calm") {
    // gameplay: the pastel sky gradient (the screen's lt-wash) plus two very
    // soft colour pools - no shapes at all
    return (
      <div className="ltw-world pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="ltw-calm-pool ltw-calm-pool--a" />
        <div className="ltw-calm-pool ltw-calm-pool--b" />
      </div>
    );
  }
  const soft = variant === "soft";
  return (
    <div className="ltw-world pointer-events-none absolute inset-0" aria-hidden="true">
      {/* ── atmosphere ── */}
      <div className="ltw-layer ltw-atmosphere">
        <div className="ltw-glow" />
        <div className="ltw-rainbow">
          <RainbowArc />
        </div>
        {SPARKLES.map((s, i) => (
          <div key={i} className={`ltw-sparkle ltw-sparkle-${i + 1}`}>
            <Sparkle color={s} />
          </div>
        ))}
      </div>

      {/* ── clouds ── */}
      <div className="ltw-layer ltw-clouds">
        <div className="ltw-cloud ltw-cloud-1">
          <Cloud shape={0} />
        </div>
        <div className="ltw-cloud ltw-cloud-2">
          <Cloud shape={1} />
        </div>
        <div className="ltw-cloud ltw-cloud-3">
          <Cloud shape={2} />
        </div>
        <div className="ltw-cloud ltw-cloud-4">
          <Cloud shape={1} tint="#F4ECFF" />
        </div>
        <div className="ltw-cloud ltw-cloud-5">
          <Cloud shape={0} tint="#FFF1F7" />
        </div>
        <div className="ltw-cloud ltw-cloud-6">
          <Cloud shape={2} />
        </div>
      </div>

      {/* ── ground: hills + path ── */}
      <div className="ltw-layer ltw-ground">
        <CandyGround />
      </div>

      {/* ── far: castle stands on the far-hill line, where the path ends ── */}
      <div className="ltw-layer">
        <div className="ltw-castle">
          <CandyCastle />
        </div>
      </div>

      {/* ── midground: small, lighter, standing on the mid hills ── */}
      {!soft && (
        <div className="ltw-layer ltw-mid">
          <div className="ltw-item ltw-mid-tree-1 ltw-sway">
            <CottonCandyTree color={CANDY.lavender} shade={CANDY.lavenderDeep} />
          </div>
          <div className="ltw-item ltw-mid-tree-2">
            <GumdropTree color={CANDY.peach} shade={CANDY.peachDeep} />
          </div>
          <div className="ltw-item ltw-mid-lolli-1 ltw-sway-slow">
            <LollipopTree a={CANDY.turquoise} />
          </div>
          <div className="ltw-item ltw-mid-tree-3 ltw-sway">
            <CottonCandyTree color={CANDY.sky} shade={CANDY.turquoise} />
          </div>
          <div className="ltw-item ltw-mid-lolli-2">
            <LollipopTree a={CANDY.purple} />
          </div>
          <div className="ltw-item ltw-mid-pepper">
            <Peppermint />
          </div>
          <div className="ltw-item ltw-mid-cupcake">
            <Cupcake frosting={CANDY.mint} cup={CANDY.peach} />
          </div>
        </div>
      )}

      {/* ── foreground: large, strong silhouettes at the edges ── */}
      <div className={`ltw-layer ltw-near ${soft ? "ltw-near--soft" : ""}`}>
        <div className="ltw-item ltw-near-tree-l ltw-sway-slow">
          <CottonCandyTree />
        </div>
        <div className="ltw-item ltw-near-lolli-l">
          <LollipopTree />
        </div>
        <div className="ltw-item ltw-near-tree-r ltw-sway-slow">
          <GumdropTree />
        </div>
        <div className="ltw-item ltw-near-lolli-r">
          <LollipopTree a={CANDY.purple} b={CANDY.vanilla} />
        </div>
        <div className="ltw-item ltw-near-pepper-r">
          <Peppermint color={CANDY.pinkDeep} />
        </div>

        <div className="ltw-item ltw-drop-1">
          <Gumdrop color={CANDY.purple} />
        </div>
        <div className="ltw-item ltw-drop-2">
          <Gumdrop color={CANDY.turquoise} />
        </div>
        <div className="ltw-item ltw-drop-3">
          <Gumdrop color={CANDY.strawberry} />
        </div>
        <div className="ltw-item ltw-drop-4">
          <Gumdrop color={CANDY.vanilla} />
        </div>

        <div className="ltw-item ltw-flower-1 ltw-sway">
          <CandyFlower />
        </div>
        <div className="ltw-item ltw-flower-2 ltw-sway-slow">
          <CandyFlower petal={CANDY.lavender} />
        </div>
        <div className="ltw-item ltw-flower-3 ltw-sway">
          <CandyFlower petal={CANDY.sky} center={CANDY.strawberry} />
        </div>
        <div className="ltw-item ltw-mushroom">
          <CandyMushroom />
        </div>
        <div className="ltw-item ltw-cupcake">
          <Cupcake />
        </div>
      </div>
    </div>
  );
}

const SPARKLES = [
  CANDY.white,
  CANDY.vanilla,
  CANDY.white,
  CANDY.pinkLight,
  CANDY.white,
  CANDY.cyan,
  CANDY.white,
  CANDY.lavenderLight,
] as const;
