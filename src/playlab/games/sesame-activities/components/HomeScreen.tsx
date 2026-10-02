"use client";

import { motion } from "framer-motion";
import { FloatingClouds } from "@shared/components/animations/FloatingClouds";
import { StarRow } from "@shared/components/ui/StarRow";
import { playClickSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Picture } from "@games/blend-read/components/PictureArt";
import {
  BirdArt,
  BoArt,
  GlossyBall,
  PlateArt,
  RubyArt,
  StreetArt,
} from "@games/sesame-activities/components/SesameArt";
import {
  MODULE_IDS,
  MODULES,
  WELCOME_CLIP,
  type ModuleId,
} from "@games/sesame-activities/constants/content";

/** The pals' street: sky, sun, drifting clouds, a row of townhouses with
 *  trees and a lamppost, and the pavement. The home screen and the finish
 *  both stand in it. */
export function StreetWorld() {
  return (
    <>
      <span className="sa-sun" aria-hidden="true" />
      <FloatingClouds />
      <div className="sa-street" aria-hidden="true">
        <StreetArt />
      </div>
      <div className="sa-ground sa-ground--street" aria-hidden="true" />
    </>
  );
}

/** Each module's card picture: its scene in miniature. */
function CardArt({ id }: { id: ModuleId }) {
  if (id === "colours") {
    return (
      <span className="sa-card-art sa-card-art--colours" aria-hidden="true">
        <span className="sa-card-percy">
          <BirdArt happy />
        </span>
        <span className="sa-card-ball sa-card-ball--a">
          <GlossyBall colorKey="red" />
        </span>
        <span className="sa-card-ball sa-card-ball--b">
          <GlossyBall colorKey="blue" />
        </span>
      </span>
    );
  }
  return (
    <span className="sa-card-art sa-card-art--snack" aria-hidden="true">
      <span className="sa-card-pal">
        <RubyArt mood="happy" />
      </span>
      <span className="sa-card-plate">
        <PlateArt />
      </span>
      <span className="sa-card-food">
        <Picture id="cupcake" />
      </span>
    </span>
  );
}

/**
 * The home screen: the street, the big name plate, and two big module
 * cards — each one activity, played for six rounds. Best stars so far sit
 * under each card's name.
 */
export function HomeScreen({
  best,
  onPick,
}: {
  best: Record<ModuleId, number>;
  onPick: (id: ModuleId) => void;
}) {
  useSayOnEnter([WELCOME_CLIP]);

  return (
    <div className="sa-world sa-world--street sa-world--home">
      <StreetWorld />

      <div className="sa-cast sa-cast--left" aria-hidden="true">
        <RubyArt wave />
      </div>
      <div className="sa-cast sa-cast--right" aria-hidden="true">
        <BoArt mood="happy" />
      </div>

      <div className="sa-home-col">
        <motion.div
          className="sa-title-plate"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <div className="sa-title-percy" aria-hidden="true">
            <BirdArt happy />
          </div>
          <h1 className="sa-title font-rounded font-black">
            <span className="sa-title-word sa-title-word--a">Play</span>{" "}
            <span className="sa-title-word sa-title-word--b">Street</span>{" "}
            <span className="sa-title-word sa-title-word--c">Pals</span>
          </h1>
          <p className="sa-title-tag font-rounded font-bold">Pick a game to play</p>
        </motion.div>

        <div className="sa-cards">
          {MODULE_IDS.map((id, i) => (
            <motion.button
              key={id}
              className={`sa-card sa-card--${id}`}
              onClick={() => {
                playClickSound();
                // cuts the welcome off; round one's prompt queues after it
                void playClip(MODULES[id].clip);
                onPick(id);
              }}
              aria-label={`${MODULES[id].title}: ${MODULES[id].tag}`}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12 + i * 0.08, duration: 0.3 }}
              whileTap={{ scale: 0.96 }}
            >
              <CardArt id={id} />
              <span className="sa-card-text">
                <span className="sa-card-name font-rounded font-black">{MODULES[id].title}</span>
                <span className="sa-card-tag font-rounded font-bold">{MODULES[id].tag}</span>
                <span className="sa-card-stars">
                  <StarRow earned={best[id]} total={3} size={16} />
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
