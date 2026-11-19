import { McSceneIcon } from "@games/magic-colours/components/McSceneIcon";

/** The Library card for Paint My Ride: Sky: the game's own plane, half
 *  coloured in, in its scene (see McSceneIcon). */
export function ColoursSkyIcon() {
  return (
    <McSceneIcon
      vehicle="plane"
      done={["tail", "nose", "window"]}
      scene="sky"
      uid="colours-sky-icon"
    />
  );
}
