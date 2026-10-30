/** A viewBox: where the board's own units start and how many there are. */
export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Where a board's units sit on the stage. The board SVG letterboxes itself
 * (`xMidYMid meet`): `s` screen pixels per board unit, and the stage-relative
 * pixel where board point (vb.x, vb.y) lands.
 *
 * Measured ONCE, when a piece is picked up (and when the teaching hand
 * appears), then reused for the drop: reading layout inside the drop handler
 * would force the browser to lay the page out on the very frame the
 * celebration has to start.
 */
export interface MatFit {
  vb: ViewBox;
  s: number;
  ox: number;
  oy: number;
}

export function measureMat(
  stage: HTMLElement | null,
  svg: SVGSVGElement | null,
  vb: ViewBox
): MatFit | null {
  if (!stage || !svg) return null;
  const sr = stage.getBoundingClientRect();
  const br = svg.getBoundingClientRect();
  const s = Math.min(br.width / vb.w, br.height / vb.h);
  return {
    vb,
    s,
    ox: br.left - sr.left + (br.width - vb.w * s) / 2,
    oy: br.top - sr.top + (br.height - vb.h * s) / 2,
  };
}

/** A stage-relative point (what useDragDrop reports) in board units. */
export function toMat({ vb, s, ox, oy }: MatFit, x: number, y: number) {
  return { x: vb.x + (x - ox) / s, y: vb.y + (y - oy) / s };
}

/** The other way: a board point as stage pixels (where a celebration goes). */
export function fromMat({ vb, s, ox, oy }: MatFit, x: number, y: number) {
  return { x: ox + (x - vb.x) * s, y: oy + (y - vb.y) * s };
}

/** The centre of an element (a piece in the tray) in stage pixels. */
export function centreIn(stage: HTMLElement | null, el: Element | null) {
  if (!stage || !el) return null;
  const sr = stage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 };
}
