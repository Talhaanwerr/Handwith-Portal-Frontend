import { McSceneIcon } from "@games/magic-colours/components/McSceneIcon";

/** The Library card for Paint My Ride: Sea: the game's own boat, half
 *  coloured in, in its scene (see McSceneIcon). */
export function ColoursSeaIcon() {
  return (
    <McSceneIcon
      vehicle="boat"
      done={["front-sail", "flag", "hull"]}
      scene="sea"
      uid="colours-sea-icon"
    />
  );
}
