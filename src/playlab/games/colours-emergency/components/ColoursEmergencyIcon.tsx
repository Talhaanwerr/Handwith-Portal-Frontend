import { McSceneIcon } from "@games/magic-colours/components/McSceneIcon";

/** The Library card for Paint My Ride: Emergency: the game's own fire engine, half
 *  coloured in, in its scene (see McSceneIcon). */
export function ColoursEmergencyIcon() {
  return (
    <McSceneIcon
      vehicle="fire-engine"
      done={["body", "window", "ladder"]}
      scene="road"
      uid="colours-emergency-icon"
    />
  );
}
