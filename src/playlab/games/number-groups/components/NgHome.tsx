"use client";

import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { cssVars } from "@shared/styles/cssVars";
import { playClickSound } from "@shared/audio/sfx";
import { clipText, playClip, stopVoice } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Teacher } from "@games/door-count/components/Teacher";
import type { ModuleInfo } from "@games/number-groups/constants/kit";

/**
 * THE TITLE SCREEN — Pond Numbers' home: the game's name on a plate, the
 * teacher at the side, and the game's two modules as two big picture cards
 * side by side (stacked when upright) — each its scene in miniature, its name
 * and the best stars so far.
 */
export function NgHome<Id extends string>({
  title,
  welcomeClip,
  modules,
  Mini,
  world,
  best,
  onPick,
  onExitPortal,
}: {
  title: string;
  /** Said as the screen lands, before "Pick one!". */
  welcomeClip: string;
  modules: readonly ModuleInfo<Id>[];
  Mini: ComponentType<{ id: Id }>;
  world: ReactNode;
  best: Partial<Record<Id, number>>;
  onPick: (m: Id) => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter([welcomeClip, "mouse-pick-one"]);

  return (
    <div className="ng-screen ng-home">
      {world}

      <div className="ng-teacher-slot ng-teacher-slot--home" aria-hidden="true">
        <Teacher cheer={false} say={clipText("mouse-pick-one")} />
      </div>

      <div className="ng-home-col">
        <motion.div
          className="ng-title-plate"
          initial={{ y: -22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 18 }}
        >
          <h1 className="ng-title font-rounded font-black">{title}</h1>
        </motion.div>

        <div className="ng-modes">
          {modules.map((m, i) => (
            <motion.button
              key={m.id}
              type="button"
              className="ng-mode"
              data-module={m.id}
              style={cssVars({ "--ng-accent": m.accent, "--ng-edge": m.edge })}
              onClick={() => {
                playClickSound();
                // drop the welcome still queued, then name the module; the
                // round's prompt queues after it
                stopVoice();
                void playClip(m.clip);
                onPick(m.id);
              }}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 + i * 0.08, type: "spring", stiffness: 220, damping: 19 }}
              whileTap={{ scale: 0.96 }}
              aria-label={`${m.name}: ${m.tag}`}
            >
              <span className="ng-mode-pic">
                <Mini id={m.id} />
              </span>
              <span className="ng-mode-name font-rounded font-black">{m.name}</span>
              <span className="ng-mode-stars">
                <StarRow earned={best[m.id] ?? 0} total={3} />
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="jungle"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />
    </div>
  );
}
