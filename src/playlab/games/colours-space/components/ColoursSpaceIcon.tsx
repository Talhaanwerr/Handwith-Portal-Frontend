import { McSceneIcon } from "@games/magic-colours/components/McSceneIcon";

/** The Library card for Paint My Ride: Space: the game's own rocket, half
 *  coloured in, in its scene (see McSceneIcon). */
export function ColoursSpaceIcon() {
  return (
    <McSceneIcon
      vehicle="rocket"
      done={["nose", "fins", "window"]}
      scene="space"
      uid="colours-space-icon"
    />
  );
}
