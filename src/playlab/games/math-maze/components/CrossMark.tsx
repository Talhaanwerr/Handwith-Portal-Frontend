/** The red cross on a wrong number — the same one Blend & Seek puts on a
 *  wrong picture. Fills its box; `.mz-cross` places it on the tile. */
export function CrossMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 8 L32 32 M32 8 L8 32" stroke="#E0413F" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
