/**
 * Word Site — fifty CVC words, grouped the way they are taught.
 *
 * The modules are the five short VOWEL SOUNDS, not five difficulty levels:
 * a child working on "a" does cat, hat, bag, map together, which is how every
 * phonics scheme in use sequences this. Picking a module is picking a sound to
 * practise, so a child can come back to the game five times and meet a
 * different set each time without anything getting harder.
 *
 * Every word has a Twemoji picture — ten of them already shipped with Blend &
 * Seek, the other forty were taken from the same set into this game's own
 * icon folder. See `WordPicture`.
 */

export type CvcWord = string;

export interface Module {
  id: string;
  /** What the plate says — the sound this module practises. */
  label: string;
  /** The vowel, big, on the plate. */
  preview: string;
  /** For the plate's assistive label. */
  aria: string;
  /** Every word in the module, in teaching order. */
  words: readonly CvcWord[];
}

export const MODULES: readonly Module[] = [
  {
    id: "a",
    label: "a words",
    preview: "a",
    aria: "The short a sound — cat, hat, bag",
    words: ["cat", "hat", "bag", "cap", "can", "pan", "map", "rat", "van", "jar", "gas", "ham"],
  },
  {
    id: "e",
    label: "e words",
    preview: "e",
    aria: "The short e sound — bed, hen, net",
    words: ["bed", "hen", "net", "pen", "web", "jet", "egg", "leg", "gem", "ten", "red", "bed"],
  },
  {
    id: "i",
    label: "i words",
    preview: "i",
    aria: "The short i sound — pin, lip, six",
    words: ["lip", "pin", "six", "kid", "bin", "zip", "lip", "pin"],
  },
  {
    id: "o",
    label: "o words",
    preview: "o",
    aria: "The short o sound — dog, box, pot",
    words: ["dog", "fox", "box", "log", "pot", "top", "cob", "hot", "dot", "fog", "dog", "box"],
  },
  {
    id: "u",
    label: "u words",
    preview: "u",
    aria: "The short u sound — bus, cup, sun",
    words: ["bus", "cup", "sun", "bug", "nut", "hug", "tub", "pup", "mug", "sub", "cup", "bug"],
  },
];

/** How many pictures are on a board at once — the reference's four. */
export const PER_BOARD = 4;

export interface Board {
  id: string;
  /** The four pictures, left to right. */
  pictures: readonly CvcWord[];
  /** The same four words along the bottom, in a different order — the answer
   *  must never be "the one directly below". */
  words: readonly CvcWord[];
}

/**
 * A module's words, cut into boards of four.
 *
 * The words row is the pictures row rotated by two, which is a deterministic
 * shuffle: no `Math.random` at render (the portal's rule), the same board
 * every time, and never a word sitting under its own picture.
 */
export function boardsFor(module: Module): Board[] {
  const boards: Board[] = [];
  for (let i = 0; i + PER_BOARD <= module.words.length; i += PER_BOARD) {
    const pictures = module.words.slice(i, i + PER_BOARD);
    boards.push({
      id: `${module.id}-${i / PER_BOARD + 1}`,
      pictures,
      words: [...pictures.slice(2), ...pictures.slice(0, 2)],
    });
  }
  return boards;
}

export function moduleById(id: string): Module {
  return MODULES.find((m) => m.id === id) ?? MODULES[0];
}

/** Three stars for a clean board, two after a slip or two, one for finishing —
 *  the portal's rule: finishing always counts. */
export function starsFor(misses: number): number {
  if (misses === 0) return 3;
  if (misses <= 2) return 2;
  return 1;
}
