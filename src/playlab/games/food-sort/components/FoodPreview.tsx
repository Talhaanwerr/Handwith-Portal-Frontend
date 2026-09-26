"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { Plate } from "@games/counting-numbers/components/CountingArt";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { toRootPoint } from "@shared/utils/pointer";
import { FoodArt } from "@games/food-sort/components/FoodArt";
import { Helper } from "@games/food-sort/components/Helper";
import type { ArtId } from "@games/food-sort/constants/activities";

/** The page transition and the table's own entrance are over by now, so the
 *  hand is measured against where things finally stand. */
const MEASURE_AFTER_MS = 900;

interface Move {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/** A plate on the table, drawn with the board's own plate classes. */
function PlateOf({
  things,
  gap,
  gapRef,
}: {
  things: readonly ArtId[];
  /** The one place still empty: its silhouette. */
  gap?: ArtId;
  gapRef?: Ref<HTMLSpanElement>;
}) {
  return (
    <div className="sf-bin sf-bin--plate sf-home-plate">
      <span className="sf-plate">
        <Plate />
      </span>
      <div className="sf-slots">
        {things.map((art, i) => (
          <span key={`${art}-${i}`} className="sf-thing">
            <span className="sf-thing-art">
              <FoodArt art={art} />
            </span>
          </span>
        ))}
        {gap && (
          <span ref={gapRef} className="sf-thing">
            <span className="sf-thing-art sf-silhouette">
              <FoodArt art={gap} />
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * THE HOME SCREEN'S PICTURE OF THE GAME — the first table exactly as a child
 * will meet it: a red plate, the chef, a green plate with one shadow left on
 * it, and the last green apple waiting underneath, with the portal's guide
 * hand showing where it goes. Decorative: the Play button is the way in.
 */
export function FoodPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLSpanElement>(null);
  const toRef = useRef<HTMLSpanElement>(null);
  const [move, setMove] = useState<Move | null>(null);

  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const from = fromRef.current;
      const to = toRef.current;
      if (!stage || !from || !to) return;
      const centre = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return toRootPoint(stage, r.left + r.width / 2, r.top + r.height / 2);
      };
      const a = centre(from);
      const b = centre(to);
      setMove({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
    };
    const t = setTimeout(measure, MEASURE_AFTER_MS);
    // a rotated screen moves everything; the hand is measured again
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={stageRef} className="sf-home-table" aria-hidden="true">
      <div className="sf-home-bins">
        <PlateOf things={["apple-red", "apple-red"]} />
        <div className="sf-home-chef">
          <Helper cheer={false} />
        </div>
        <PlateOf things={["apple-green"]} gap="apple-green" gapRef={toRef} />
      </div>
      <div className="sf-home-tray">
        <span ref={fromRef} className="sf-thing sf-home-loose">
          <span className="sf-thing-art">
            <FoodArt art="apple-green" />
          </span>
        </span>
      </div>
      {move && <TeachingHand {...move} />}
    </div>
  );
}
