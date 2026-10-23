"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PlayApi } from "@games/brick-lab/engine/BrickShell";
import { LooseBrick } from "@games/brick-lab/engine/BrickArt";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import { snapBuzz } from "@games/brick-lab/engine/feel";
import { COLORS, shade, type BrickColor } from "@games/brick-lab/engine/geometry";
import { FACTORY_ROUNDS } from "@games/brick-lab/constants/models";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { playClip, playSequence } from "@shared/audio/voice";
import { useAfterVoice } from "@shared/hooks/useAfterVoice";
import { playPickUpSound, playSnapSound, playStarPop, playThudSound } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";

/**
 * COLOR SORT module — the belt rolls in one brick at a time; the child drags
 * it into the crate of the same colour. Two crates, then three, then four.
 * A brick in the wrong crate bumps back out and the voice names its colour
 * ("That one is red."), so every miss is a lesson, never a buzzer.
 */
interface Item {
  i: number;
  color: BrickColor;
  w: number;
  d: number;
}

export function ColorSort({ api }: { api: PlayApi }) {
  const [ri, setRi] = useState(0);
  const [bi, setBi] = useState(0);
  const [filled, setFilled] = useState<Record<string, Item[]>>({});
  const [won, setWon] = useState(false);
  const round = FACTORY_ROUNDS[ri];
  const item: Item | null = bi < round.belt.length ? { i: bi, ...round.belt[bi] } : null;

  const root = useRef<HTMLDivElement>(null);
  const brickEl = useRef<HTMLButtonElement>(null);
  const targets = useRef(new Map<BrickColor, HTMLElement>());
  const { thenAfter } = useAfterVoice();

  // Each brick is named as it rolls in.
  useEffect(() => {
    if (!item) return;
    const clip = COLORS[item.color].clip;
    const lines = bi === 0 ? ["brick-factory-drag"] : [];
    if (clip) lines.push(clip);
    const t = setTimeout(() => void playSequence(lines, 150), bi === 0 ? 700 : 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri, bi]);

  const onDrop = useCallback(
    (it: Item, bin: BrickColor | null) => {
      if (!bin) return;
      const el = targets.current.get(bin);
      if (bin !== it.color) {
        playThudSound();
        el?.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-8px)" },
            { transform: "translateX(7px)" },
            { transform: "translateX(-4px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 380, easing: "ease-out" }
        );
        void playClip(COLORS[it.color].is ?? "brick-factory-match");
        return;
      }
      playSnapSound();
      snapBuzz();
      el?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.07)" }, { transform: "scale(1)" }],
        {
          duration: 320,
          easing: "ease-out",
        }
      );
      setFilled((f) => ({ ...f, [bin]: [...(f[bin] ?? []), it] }));
      const last = it.i + 1 >= round.belt.length;
      if (!last) {
        setBi(it.i + 1);
        return;
      }
      setBi(it.i + 1);
      setWon(true);
      playStarPop();
      thenAfter([cheerFor(ri + 2), "instr-sort-done"], () => {
        setWon(false);
        setFilled({});
        setBi(0);
        if (ri + 1 >= FACTORY_ROUNDS.length) api.finish();
        else setRi(ri + 1);
      });
    },
    [api, ri, round.belt.length, thenAfter]
  );

  const { dragging, over, start, ghostRef, tookClick } = useDragDrop<Item, BrickColor>({
    root,
    targets,
    slopPx: 28,
    onDrop,
  });

  // The idle hand: belt brick → its crate.
  const idle = useIdleHand(!won && !!item && !dragging, `${ri}-${bi}`);
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const handColor = item?.color;
  useEffect(() => {
    if (!idle || !handColor) return;
    const raf = requestAnimationFrame(() => {
      const r = root.current?.getBoundingClientRect();
      const a = brickEl.current?.getBoundingClientRect();
      const b = targets.current.get(handColor)?.getBoundingClientRect();
      if (!r || !a || !b) return;
      setHand({
        fx: a.left + a.width / 2 - r.left,
        fy: a.top + a.height / 2 - r.top,
        tx: b.left + b.width / 2 - r.left,
        ty: b.top + b.height * 0.35 - r.top,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [idle, handColor]);

  return (
    <div ref={root} className="bk-factory">
      <div
        className="bk-factory-progress"
        aria-label={`Brick ${Math.min(bi + 1, round.belt.length)} of ${round.belt.length}`}
      >
        {round.belt.map((b, i) => (
          <span key={i} className={`bk-pip bk-c--${b.color} ${i < bi ? "bk-pip--on" : ""}`} />
        ))}
      </div>

      <div className="bk-belt-wrap">
        <div className="bk-hopper" aria-hidden="true">
          <span className="bk-hopper-mouth" />
          <span className="bk-hopper-light" />
        </div>
        <div key={`belt-${ri}-${bi}`} className="bk-belt bk-belt--run" aria-hidden="true">
          <span className="bk-belt-top" />
          <span className="bk-belt-rollers" />
        </div>
        {item && (
          <motion.button
            key={`${ri}-${item.i}`}
            ref={brickEl}
            className={`bk-belt-brick ${dragging ? "bk-belt-brick--away" : ""}`}
            initial={{ x: "-38vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "tween", duration: 0.85, ease: "easeOut" }}
            onPointerDown={(e) => {
              if (won) return;
              if (start(e, item)) playPickUpSound();
            }}
            onClick={() => {
              if (tookClick()) return;
              const clip = COLORS[item.color].clip;
              if (clip) void playClip(clip);
            }}
            aria-label={`${COLORS[item.color].name} brick. Drag it to the ${COLORS[item.color].name} crate.`}
          >
            <LooseBrick w={item.w} d={item.d} color={item.color} size={150} />
          </motion.button>
        )}
      </div>

      <div className="bk-bins">
        {round.bins.map((c) => (
          <Crate
            key={c}
            color={c}
            items={filled[c] ?? []}
            lit={over === c}
            register={(el) => {
              if (el) targets.current.set(c, el);
              else targets.current.delete(c);
            }}
          />
        ))}
      </div>

      {dragging && (
        <div ref={ghostRef} className="pl-drag-ghost bk-factory-ghost">
          <LooseBrick w={dragging.w} d={dragging.d} color={dragging.color} size={130} />
        </div>
      )}
      {idle && hand && <TeachingHand {...hand} />}
      <RoundDots total={FACTORY_ROUNDS.length} at={ri} />
      {won && <RoundWin label="Everything is sorted!" />}
    </div>
  );
}

/** An open crate in its colour, with the bricks it has caught inside. */
const Crate = memo(function Crate({
  color,
  items,
  lit,
  register,
}: {
  color: BrickColor;
  items: readonly Item[];
  lit: boolean;
  register: (el: HTMLElement | null) => void;
}) {
  const hex = COLORS[color].hex;
  return (
    <div
      ref={register}
      className={`bk-crate ${lit ? "bk-crate--lit" : ""}`}
      aria-label={`${COLORS[color].name} crate, ${items.length} bricks`}
    >
      <svg viewBox="0 0 200 150" className="bk-crate-back" aria-hidden="true">
        <polygon points="18,38 182,38 164,14 36,14" fill={shade(hex, 0.45)} />
        <polygon points="36,14 164,14 164,30 36,30" fill={shade(hex, 0.35)} />
      </svg>
      <div className="bk-crate-load" aria-hidden="true">
        {items.slice(-4).map((it, k) => (
          <span key={it.i} className={`bk-crate-brick bk-crate-brick--${k}`}>
            <LooseBrick w={it.w} d={it.d} color={it.color} size={70} />
          </span>
        ))}
      </div>
      <svg viewBox="0 0 200 150" className="bk-crate-front" aria-hidden="true">
        <polygon
          points="18,38 182,38 172,140 28,140"
          fill={hex}
          stroke={shade(hex, 0.6)}
          strokeWidth="2"
        />
        <polygon points="18,38 182,38 172,140 28,140" fill="url(#bk-side)" />
        <rect
          x="14"
          y="32"
          width="172"
          height="12"
          rx="5"
          fill={shade(hex, 1.18)}
          stroke={shade(hex, 0.62)}
          strokeWidth="1.5"
        />
        <rect x="62" y="68" width="76" height="40" rx="10" fill="#fff" opacity="0.92" />
        <text x="100" y="97" textAnchor="middle" className="bk-crate-count">
          {items.length}
        </text>
      </svg>
    </div>
  );
});
