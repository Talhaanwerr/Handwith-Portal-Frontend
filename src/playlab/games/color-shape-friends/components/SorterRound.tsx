"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { playClickSound, playIncorrectSound, playSnapSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import {
  BLOCK_COLORS,
  SORTER_BOARDS,
  SORTER_FITS_CLIP,
  SORTER_HOW_CLIP,
  SORTER_PROMPT_CLIP,
  SORTER_WRONG_CLIP,
  blockClipFor,
  type BlockHue,
  type BlockPiece,
  type BlockSlot,
  type SorterBoard,
} from "@games/color-shape-friends/constants/rounds";
import { BerryArt } from "@games/color-shape-friends/components/Friends";

interface SorterRoundProps {
  board: SorterBoard;
  onMiss: () => void;
  onSolved: () => void;
}

const NEXT_MS = 1100;

/** One painted wooden cube — the face, a bevel and a shine, all CSS. */
function Cube({ hue }: { hue: BlockHue }) {
  const paint = BLOCK_COLORS[hue];
  return (
    <span
      className="csf-cube"
      style={cssVars({ "--csf-fill": paint.fill, "--csf-edge": paint.edge })}
      aria-hidden="true"
    />
  );
}

/**
 * One board of the Sorter module: a wooden sorter board with a dark hole for
 * each block, every hole ringed in its own paint, and the blocks waiting in
 * an open toy box. TAP a block to lift it, then TAP the hole with the
 * matching ring and it drops in snugly.
 *
 * Tap-to-place, no drag, so no pointer tracking at all. A wrong hole shakes
 * and counts as a miss, but nothing is crossed out — the lifted block stays
 * lifted and the child just tries another hole (Sort It's rule for a
 * mismatched drop). Mounted fresh per board by the root.
 */
export function SorterRound({ board, onMiss, onSolved }: SorterRoundProps) {
  /** slot id → the block placed in it. */
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [shakeSlot, setShakeSlot] = useState<string | null>(null);
  const schedule = useScheduler();

  const placedBlockIds = useMemo(() => new Set(Object.values(placed)), [placed]);
  const allPlaced = Object.keys(placed).length >= board.slots.length;

  // the how-to line only on the first board; later boards just ask
  useSayOnEnter(
    board.id === SORTER_BOARDS[0].id ? [SORTER_PROMPT_CLIP, SORTER_HOW_CLIP] : [SORTER_PROMPT_CLIP]
  );

  const tapBlock = useCallback(
    (block: BlockPiece) => {
      if (placedBlockIds.has(block.id)) return;
      playClickSound();
      // "Red block!" when it is lifted; putting it back down says nothing
      if (selected !== block.id) void playClip(blockClipFor(block.hue));
      setSelected((cur) => (cur === block.id ? null : block.id));
    },
    [placedBlockIds, selected]
  );

  const tapSlot = useCallback(
    (slot: BlockSlot) => {
      if (placed[slot.id] || !selected) return;
      const block = board.blocks.find((b) => b.id === selected);
      if (!block) return;

      if (block.hue === slot.hue) {
        playSnapSound();
        void playClip(SORTER_FITS_CLIP);
        setSelected(null);
        const next = { ...placed, [slot.id]: block.id };
        setPlaced(next);
        if (Object.keys(next).length >= board.slots.length) schedule(onSolved, NEXT_MS);
      } else {
        playIncorrectSound();
        void playClip(SORTER_WRONG_CLIP);
        onMiss();
        setShakeSlot(slot.id);
        schedule(() => setShakeSlot(null), 420);
      }
    },
    [board, placed, selected, schedule, onSolved, onMiss]
  );

  return (
    <div className="csf-stage csf-stage--sorter">
      <div className="csf-guide">
        <BerryArt mood={allPlaced ? "cheer" : selected ? "point" : "idle"} />
      </div>

      <div className={`csf-sorter ${selected ? "csf-sorter--armed" : ""}`}>
        <div className="csf-sorter-face">
          <span className="csf-screw csf-screw--tl" aria-hidden="true" />
          <span className="csf-screw csf-screw--tr" aria-hidden="true" />
          <span className="csf-screw csf-screw--bl" aria-hidden="true" />
          <span className="csf-screw csf-screw--br" aria-hidden="true" />
          <div className="csf-sorter-grid">
            {board.slots.map((slot) => {
              const blockId = placed[slot.id];
              const block = blockId ? board.blocks.find((b) => b.id === blockId) : undefined;
              const paint = BLOCK_COLORS[slot.hue];
              return (
                <motion.button
                  key={slot.id}
                  type="button"
                  className={`csf-slot ${block ? "csf-slot--full" : ""}`}
                  style={cssVars({ "--csf-fill": paint.fill, "--csf-edge": paint.edge })}
                  onClick={() => tapSlot(slot)}
                  animate={shakeSlot === slot.id ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.36 }}
                  aria-label={block ? `${slot.hue} hole, filled` : `${slot.hue} hole`}
                >
                  <span className="csf-slot-hole" aria-hidden="true" />
                  {block && (
                    <motion.span
                      className="csf-slot-block"
                      initial={{ y: -26, scale: 1.15, opacity: 0 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 20 }}
                    >
                      <Cube hue={block.hue} />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="csf-sorter-feet" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>

      <div className="csf-toybox">
        <div className="csf-toybox-lid" aria-hidden="true" />
        <div className="csf-toybox-inside">
          {board.blocks.map((block) => {
            const used = placedBlockIds.has(block.id);
            const isSelected = selected === block.id;
            return (
              <button
                key={block.id}
                type="button"
                className={`csf-block ${used ? "csf-block--used" : ""} ${
                  isSelected ? "csf-block--selected" : ""
                }`}
                onClick={() => tapBlock(block)}
                disabled={used}
                aria-pressed={isSelected}
                aria-label={`${block.hue} block`}
              >
                <Cube hue={block.hue} />
              </button>
            );
          })}
        </div>
        <div className="csf-toybox-front" aria-hidden="true">
          <span className="csf-toybox-star" />
        </div>
      </div>
    </div>
  );
}
