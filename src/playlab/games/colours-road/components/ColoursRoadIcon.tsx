import { McSceneIcon } from "@games/magic-colours/components/McSceneIcon";

/** The Library card for Paint My Ride: On the Road: the game's own taxi, half
 *  coloured in, in its scene (see McSceneIcon). */
export function ColoursRoadIcon() {
  return (
    <McSceneIcon vehicle="taxi" done={["body", "window"]} scene="road" uid="colours-road-icon" />
  );
}
