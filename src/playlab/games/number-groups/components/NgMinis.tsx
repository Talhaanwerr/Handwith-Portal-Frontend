"use client";

import { PlateArt } from "@games/sesame-activities/components/SesameArt";
import { VOCAB_ART } from "@games/letter-treats/components/candy-world/VocabArt";
import { Chip, ThingArt } from "@games/number-match/components/MatchArt";
import { GroupFace } from "@games/number-groups/components/GroupFace";
import type { ModuleId } from "@games/number-groups/constants/rounds";

const Apple = VOCAB_ART.apple;

/**
 * Each Count & Match module in miniature, for its card on the title screen
 * and the star card — built from the module's own pieces, so a child who
 * can't read the names still sees what each one is: a plate of apples, a
 * number card with its number.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "plates")
    return (
      <span className="ng-mini ng-mini--plates" aria-hidden="true">
        <span className="ng-mini-dish">
          <PlateArt />
        </span>
        <span className="ng-pile" data-n={3}>
          {[1, 2, 3].map((k) => (
            <span key={k} className="ng-fruit" data-at={`${k}-of-3`}>
              <Apple />
            </span>
          ))}
        </span>
      </span>
    );
  return (
    <span className="ng-mini" aria-hidden="true">
      <span className="ng-mini-ncard">
        <span className="ng-mini-ncard-group">
          <GroupFace count={3} art={<ThingArt thing="flower" />} />
        </span>
        <span className="ng-mini-ncard-chip">
          <Chip value={3} big />
        </span>
      </span>
    </span>
  );
}
