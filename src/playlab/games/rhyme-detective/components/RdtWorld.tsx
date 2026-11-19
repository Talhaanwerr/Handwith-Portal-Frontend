"use client";

import { memo } from "react";
import type { Scene } from "@games/rhyme-detective/constants/rounds";

/**
 * The walls of Rhyme Detective's two rooms, filling the stage, kept plain so
 * the pictures stand out: a soft lavender bedroom wall or a warm cream
 * kitchen wall, and (`floor`) a plain wooden or tiled floor. Calm: nothing
 * moves, no furniture.
 */
export const RdtWorld = memo(function RdtWorld({
  scene,
  floor = false,
}: {
  scene: Scene;
  floor?: boolean;
}) {
  return (
    <div className={`rdt-world rdt-world--${scene}`} aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        {scene === "bedroom" ? (
          <>
            <rect width="1600" height="1000" fill="#D9C8EE" />
            {floor && (
              <>
                <rect y="760" width="1600" height="240" fill="#E3A865" />
                <rect y="748" width="1600" height="18" fill="#FFFFFF" />
                {[820, 880, 940].map((y) => (
                  <rect key={y} y={y} width="1600" height="4" fill="#C98A48" />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <rect width="1600" height="1000" fill="#FFF3DC" />
            {floor && (
              <>
                <rect y="760" width="1600" height="240" fill="#F3E3C8" />
                <rect y="748" width="1600" height="18" fill="#8C5A3B" />
              </>
            )}
          </>
        )}
      </svg>
    </div>
  );
});
