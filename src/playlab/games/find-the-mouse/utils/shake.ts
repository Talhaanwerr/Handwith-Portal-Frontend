/** A short side-to-side shake on a wrong answer — Web Animations on the DOM
 *  node, so it costs no React render (GAME_DEV's lag rule). The element is
 *  centred by margins, never by a transform, so animating transform is free. */
export function shake(el: HTMLElement | null): void {
  el?.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-7px)" },
      { transform: "translateX(7px)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 340, easing: "ease-in-out" }
  );
}
