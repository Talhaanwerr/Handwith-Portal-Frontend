"use client";

import { Picture } from "@games/blend-read/components/PictureArt";
import { Shadow } from "@games/shadow-match/components/Shadow";
import type { ModuleId } from "@games/shadow-match/constants/rounds";

/** Each module in miniature: a train over its shadow; a small and a big snake shadow. */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "find")
    return (
      <span className="ng-mini" aria-hidden="true">
        <span className="shm-mini-pic">
          <Picture id="train" />
        </span>
        <span className="shm-mini-shadow">
          <Shadow id="train" />
        </span>
      </span>
    );
  return (
    <span className="ng-mini" aria-hidden="true">
      <span className="shm-mini-short">
        <Shadow id="snake" size={0.5} />
      </span>
      <span className="shm-mini-long">
        <Shadow id="snake" />
      </span>
    </span>
  );
}
