/**
 * Each letter gets its own material — gold, ice, coral, pearl — the way the
 * reference gives A a golden treatment and B an icy one.
 *
 * Six materials rotating across the alphabet, not twenty-six: the LETTER is
 * what has to be recognised, the material is only delight, and neighbouring
 * letters simply need to look different from one another. Same reasoning as
 * Letter Treats' six candy flavours.
 *
 * These are art direction for one game's drawing, so they live here as a
 * named local palette rather than in tokens.ts — the convention tokens.ts
 * sets out for illustration colour.
 */

export interface Material {
  id: string;
  /** Body of the letter — a vertical gradient, light end first. */
  from: string;
  to: string;
  /** The letter's outline. */
  rim: string;
  /** Seam between two pieces. */
  cut: string;
  /** Glow behind the finished letter. */
  glow: string;
}

export const MATERIALS: readonly Material[] = [
  { id: "gold", from: "#FFE07A", to: "#F2A93B", rim: "#C97B1E", cut: "#E8B94D", glow: "#FFD93D" },
  { id: "ice", from: "#E4F4FF", to: "#8FC9F0", rim: "#3F87C4", cut: "#BFE2F7", glow: "#9FD9FF" },
  { id: "coral", from: "#FFC1B0", to: "#FF8B6A", rim: "#D1543A", cut: "#FFA894", glow: "#FF9E86" },
  { id: "pearl", from: "#FFFFFF", to: "#D9DFF0", rim: "#8792B8", cut: "#EDF1FA", glow: "#E8EEFF" },
  { id: "kelp", from: "#CFF0B8", to: "#6FBF6A", rim: "#3D8A46", cut: "#A9E094", glow: "#8FE07A" },
  {
    id: "amethyst",
    from: "#E3D2FF",
    to: "#A882E8",
    rim: "#6E4BB0",
    cut: "#C9A9F5",
    glow: "#C3A0FF",
  },
];

/** The material for a letter — stable per letter, so a child always meets the
 *  same "golden A" and never a different one on a replay. */
export function materialFor(letter: string): Material {
  const index = Math.max(0, letter.toUpperCase().charCodeAt(0) - 65);
  return MATERIALS[index % MATERIALS.length];
}
