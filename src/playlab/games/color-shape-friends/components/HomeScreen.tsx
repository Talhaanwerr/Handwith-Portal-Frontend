"use client";

import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { StarRow } from "@shared/components/ui/StarRow";
import { playClickSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { ShapeGlyph } from "@games/shape-match/components/ShapeArt";
import {
  BLOCK_COLORS,
  MODULES,
  PICK_CLIP,
  WELCOME_CLIP,
  type BlockHue,
  type ModuleId,
} from "@games/color-shape-friends/constants/rounds";
import { BerryArt } from "@games/color-shape-friends/components/Friends";
import { EaselArt } from "@games/color-shape-friends/components/SceneDecor";

interface HomeScreenProps {
  best: Partial<Record<ModuleId, number>>;
  onPick: (module: ModuleId) => void;
}

function MiniCube({ hue }: { hue: BlockHue }) {
  return (
    <span
      className="csf-cube"
      style={cssVars({
        "--csf-fill": BLOCK_COLORS[hue].fill,
        "--csf-edge": BLOCK_COLORS[hue].edge,
      })}
    />
  );
}

/** Each module's card shows its own activity in miniature, drawn from the
 *  same pieces the module uses, so the picture IS the explanation. */
function Miniature({ module }: { module: ModuleId }) {
  if (module === "colors") {
    return (
      <span className="csf-mini csf-mini--colors">
        <ShapeGlyph piece={{ shape: "circle", hue: "cherry" }} />
        <ShapeGlyph piece={{ shape: "star", hue: "sky" }} />
        <ShapeGlyph piece={{ shape: "triangle", hue: "sun" }} />
        <ShapeGlyph piece={{ shape: "square", hue: "leaf" }} />
      </span>
    );
  }
  if (module === "shapes") {
    return (
      <span className="csf-mini csf-mini--shapes">
        <span className="csf-mini-easel">
          <span className="csf-easel-art">
            <EaselArt />
          </span>
          <span className="csf-mini-canvas">
            <ShapeGlyph piece={{ shape: "triangle", hue: "grape" }} />
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className="csf-mini csf-mini--sorter">
      <span className="csf-mini-board">
        {(["red", "blue", "yellow", "green"] as const).map((hue, k) => (
          <span
            key={hue}
            className="csf-mini-hole"
            style={cssVars({ "--csf-fill": BLOCK_COLORS[hue].fill })}
          >
            {k % 3 === 0 && <MiniCube hue={hue} />}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * The title screen and the game's home: the playroom, the rainbow title
 * plate (drawn by the root's HUD), Berry standing big, and three big module
 * cards — each a picture of its activity, a name and one line. Tapping a
 * card starts that module from its first round.
 */
export function HomeScreen({ best, onPick }: HomeScreenProps) {
  useSayOnEnter([WELCOME_CLIP, PICK_CLIP]);

  return (
    <div className="csf-stage csf-stage--home">
      <div className="csf-guide">
        <BerryArt mood="idle" />
      </div>

      <div className="csf-cards">
        {MODULES.map((m, i) => (
          <motion.button
            key={m.id}
            type="button"
            className={`csf-card csf-card--${m.id}`}
            onClick={() => {
              playClickSound();
              // cuts the welcome off; the first round's prompt queues after it
              void playClip(m.clip);
              onPick(m.id);
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.35, ease: "easeOut" }}
            whileTap={{ scale: 0.96 }}
            aria-label={m.aria}
          >
            <span className="csf-card-picture" aria-hidden="true">
              <Miniature module={m.id} />
            </span>
            <span className="csf-card-text">
              <span className="csf-card-name font-rounded font-black">{m.name}</span>
              <span className="csf-card-tag font-rounded font-bold">{m.tag}</span>
              {best[m.id] ? (
                <span className="csf-card-stars">
                  <StarRow earned={best[m.id] ?? 0} total={3} size={16} />
                </span>
              ) : null}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
