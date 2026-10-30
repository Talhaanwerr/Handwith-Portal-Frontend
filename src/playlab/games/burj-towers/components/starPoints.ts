/** A five-pointed star's points around (cx, cy), `r` to its tips — for the
 *  title-card miniatures and the Library icon (plain SVG). */
export function starPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 10 }, (_, k) => {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const d = k % 2 === 0 ? r : r * 0.45;
    return `${(cx + d * Math.cos(a)).toFixed(2)},${(cy + d * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}
