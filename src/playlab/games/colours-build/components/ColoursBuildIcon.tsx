import { McSceneIcon } from "@games/magic-colours/components/McSceneIcon";

/** The Library card for Paint My Ride: Construction: the game's own digger, half
 *  coloured in, in its scene (see McSceneIcon). */
export function ColoursBuildIcon() {
  return (
    <McSceneIcon
      vehicle="digger"
      done={["body", "arm", "tracks"]}
      scene="site"
      uid="colours-build-icon"
    />
  );
}
