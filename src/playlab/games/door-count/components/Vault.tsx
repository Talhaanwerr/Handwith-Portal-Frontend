"use client";

import { motion } from "framer-motion";
import { Key, VaultDoor } from "@games/door-count/components/DoorArt";
import { LEVELS_PER_CORRIDOR } from "@games/door-count/constants/levels";
import { Ripple } from "@shared/components/game/Ripple";
import { cssVars } from "@shared/styles/cssVars";

/**
 * PROGRESS, WITHOUT A PROGRESS BAR.
 *
 * A steel vault set into the corridor wall. Every door the child gets right
 * throws a key, the vault swings open to take it, clangs shut, and one more
 * of the four lamps on its face comes on. Four lamps lit unlocks the double
 * door at the end of the corridor.
 *
 * It tells a child the same three things a bar would — how much is done, how
 * much is left, and that something happens at the end — while being part of
 * the world rather than a strip of interface laid over it. And it is a
 * reward: you do not fill a bar, you put treasure away.
 */

interface VaultProps {
  /** How many keys are inside, 0 to LEVELS_PER_CORRIDOR. */
  keys: number;
  /** The door is standing open, waiting for a key. */
  open: boolean;
  /** A key has just gone in: the whole vault takes the light for a moment. */
  flash?: boolean;
  /**
   * Hands back the mouth of the vault, so the game can fly a key to exactly
   * the right place.
   */
  mouthRef?: (el: HTMLElement | null) => void;
}

const LAMPS = Array.from({ length: LEVELS_PER_CORRIDOR }, (_, i) => i);

export function Vault({ keys, open, flash, mouthRef }: VaultProps) {
  return (
    <div
      className="dc-vault"
      data-open={open ? "yes" : undefined}
      data-flash={flash ? "yes" : undefined}
      role="status"
      aria-label={`${keys} of ${LEVELS_PER_CORRIDOR} keys in the vault`}
    >
      <div className="dc-vault-body" aria-hidden="true">
        {/* the dark inside, and the point a flying key aims for */}
        <div className="dc-vault-inside">
          <span className="dc-vault-mouth" ref={mouthRef} />
        </div>

        <motion.div
          className="dc-vault-door"
          animate={{ rotateY: open ? -108 : 0 }}
          transition={{ duration: 0.45, ease: [0.3, 0.7, 0.2, 1] }}
        >
          <VaultDoor />
        </motion.div>

        {/* the clang of it shutting on a key */}
        {flash && (
          <div className="dc-vault-shock">
            <Ripple count={1} size="70%" />
          </div>
        )}
      </div>

      <div className="dc-vault-lamps" aria-hidden="true">
        {LAMPS.map((i) => (
          <span key={i} className="dc-vault-lamp" data-on={i < keys ? "yes" : undefined}>
            <Key />
          </span>
        ))}
      </div>
    </div>
  );
}

export interface KeyFlight {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  /** Where the middle of the corridor is, for the eruption. */
  midX: number;
  midY: number;
}

/**
 * THE KEY.
 *
 * It does not simply travel. It ERUPTS out of the door the child just opened,
 * flies at the screen and fills it, turns over once while the whole corridor
 * waits — and only then shrinks away into the vault. Three acts in one
 * animation, so there is nothing to synchronise:
 *
 *   0.00 → 0.22   out of the doorway and into the middle of the screen, huge
 *   0.22 → 0.50   held there, turning
 *   0.50 → 1.00   away to the vault, shrinking into its mouth
 */
export function FlyingKey({ flight, onArrive }: { flight: KeyFlight; onArrive: () => void }) {
  const { fromX, fromY, toX, toY, midX, midY } = flight;

  return (
    <>
      <motion.span
        className="dc-flying-key"
        initial={{ left: fromX, top: fromY, scale: 0.3, rotate: -40, opacity: 0 }}
        animate={{
          left: [fromX, midX, midX, toX],
          top: [fromY, midY, midY, toY],
          scale: [0.3, 4.6, 4.6, 0.5],
          rotate: [-40, 0, 360, 640],
          opacity: [0, 1, 1, 1],
        }}
        transition={{
          duration: 1.6,
          times: [0, 0.22, 0.5, 1],
          ease: ["backOut", "linear", "easeInOut"],
        }}
        onAnimationComplete={onArrive}
        aria-hidden="true"
      >
        <Key />
      </motion.span>

      {/* the shockwave the eruption makes, out of the middle of the screen */}
      <span
        className="dc-erupt pl-at"
        style={cssVars({ "--pl-x": `${midX}px`, "--pl-y": `${midY}px` })}
        aria-hidden="true"
      >
        <Ripple count={2} delay={0.2} gap={0.14} size="46vmin" />
      </span>
    </>
  );
}
