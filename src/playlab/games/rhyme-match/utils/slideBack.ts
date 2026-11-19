import { centreIn } from "@games/number-groups/components/NgKit";

/**
 * A picture dropped in the wrong place slides home from where the finger let
 * go — Web Animations on the DOM node, so it costs no React render. `at` is
 * the release point in the stage's coordinates (useDragDrop's DropInfo). The
 * piece is placed by flex and margins, never a transform, so animating the
 * transform is free. Shared by Rhyme Match and Rhyme Houses.
 */
export function slideBack(
  root: HTMLElement | null,
  el: HTMLElement | null | undefined,
  at: { x: number; y: number }
): void {
  if (!root || !el) return;
  const home = centreIn(root, el);
  const dx = at.x - home.x;
  const dy = at.y - home.y;
  el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
    duration: 380,
    easing: "cubic-bezier(0.2, 0.8, 0.3, 1)",
  });
}
