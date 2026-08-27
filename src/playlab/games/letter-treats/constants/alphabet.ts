/**
 * The ENTIRE content of Letter Treats - 26 letters, one row each.
 *
 * Both modules read from this list, so there is exactly one implementation of
 * Alphabet Learn and one of Candy Bakery; adding or correcting a word is a
 * data edit here and nothing else. No per-letter screens exist anywhere.
 *
 * `sound` is the phonic spelling, matching the `speak` values already used by
 * phonics-* in shared/audio/manifest.json so the two never drift apart.
 *
 * `initial: false` marks a word that CONTAINS the letter's sound without
 * beginning with it. Only X needs this today - English has almost no words
 * starting with /ks/, so fox, box and six are taught as ending sounds while
 * xylophone and x-ray are taught as initial ones. The practice round reads
 * this flag rather than assuming every word starts with its letter.
 */

export interface TreatWord {
  /** asset + audio key: lowercase, no spaces */
  id: string;
  /** what the child sees written */
  label: string;
  /** does the word BEGIN with this letter's sound? */
  initial: boolean;
}

export interface TreatLetter {
  letter: string;
  lower: string;
  /** phonic sound spelling, e.g. "buh" */
  sound: string;
  vocabulary: TreatWord[];
}

export const TREAT_ALPHABET: readonly TreatLetter[] = [
  {
    letter: "A",
    lower: "a",
    sound: "ah",
    vocabulary: [
      { id: "ant", label: "Ant", initial: true },
      { id: "apple", label: "Apple", initial: true },
      { id: "alligator", label: "Alligator", initial: true },
      { id: "astronaut", label: "Astronaut", initial: true },
      { id: "anchor", label: "Anchor", initial: true },
    ],
  },
  {
    letter: "B",
    lower: "b",
    sound: "buh",
    vocabulary: [
      { id: "ball", label: "Ball", initial: true },
      { id: "banana", label: "Banana", initial: true },
      { id: "bear", label: "Bear", initial: true },
      { id: "bus", label: "Bus", initial: true },
      { id: "butterfly", label: "Butterfly", initial: true },
    ],
  },
  {
    letter: "C",
    lower: "c",
    sound: "kuh",
    vocabulary: [
      { id: "cat", label: "Cat", initial: true },
      { id: "car", label: "Car", initial: true },
      { id: "cake", label: "Cake", initial: true },
      { id: "cup", label: "Cup", initial: true },
      { id: "cow", label: "Cow", initial: true },
    ],
  },
  {
    letter: "D",
    lower: "d",
    sound: "duh",
    vocabulary: [
      { id: "dog", label: "Dog", initial: true },
      { id: "duck", label: "Duck", initial: true },
      { id: "drum", label: "Drum", initial: true },
      { id: "doll", label: "Doll", initial: true },
      { id: "door", label: "Door", initial: true },
    ],
  },
  {
    letter: "E",
    lower: "e",
    sound: "eh",
    vocabulary: [
      { id: "elephant", label: "Elephant", initial: true },
      { id: "egg", label: "Egg", initial: true },
      { id: "envelope", label: "Envelope", initial: true },
      { id: "eye", label: "Eye", initial: true },
      { id: "engine", label: "Engine", initial: true },
    ],
  },
  {
    letter: "F",
    lower: "f",
    sound: "ff",
    vocabulary: [
      { id: "fish", label: "Fish", initial: true },
      { id: "fan", label: "Fan", initial: true },
      { id: "frog", label: "Frog", initial: true },
      { id: "flag", label: "Flag", initial: true },
      { id: "flower", label: "Flower", initial: true },
    ],
  },
  {
    letter: "G",
    lower: "g",
    sound: "guh",
    vocabulary: [
      { id: "goat", label: "Goat", initial: true },
      { id: "guitar", label: "Guitar", initial: true },
      { id: "grapes", label: "Grapes", initial: true },
      { id: "giraffe", label: "Giraffe", initial: true },
      { id: "globe", label: "Globe", initial: true },
    ],
  },
  {
    letter: "H",
    lower: "h",
    sound: "huh",
    vocabulary: [
      { id: "hat", label: "Hat", initial: true },
      { id: "hen", label: "Hen", initial: true },
      { id: "house", label: "House", initial: true },
      { id: "hand", label: "Hand", initial: true },
      { id: "heart", label: "Heart", initial: true },
    ],
  },
  {
    letter: "I",
    lower: "i",
    sound: "ih",
    vocabulary: [
      { id: "igloo", label: "Igloo", initial: true },
      { id: "icecream", label: "Ice Cream", initial: true },
      { id: "insect", label: "Insect", initial: true },
      { id: "ink", label: "Ink", initial: true },
      { id: "iron", label: "Iron", initial: true },
    ],
  },
  {
    letter: "J",
    lower: "j",
    sound: "juh",
    vocabulary: [
      { id: "jar", label: "Jar", initial: true },
      { id: "jelly", label: "Jelly", initial: true },
      { id: "juice", label: "Juice", initial: true },
      { id: "jacket", label: "Jacket", initial: true },
      { id: "jet", label: "Jet", initial: true },
    ],
  },
  {
    letter: "K",
    lower: "k",
    sound: "kuh",
    vocabulary: [
      { id: "kite", label: "Kite", initial: true },
      { id: "key", label: "Key", initial: true },
      { id: "kangaroo", label: "Kangaroo", initial: true },
      { id: "king", label: "King", initial: true },
      { id: "kettle", label: "Kettle", initial: true },
    ],
  },
  {
    letter: "L",
    lower: "l",
    sound: "ll",
    vocabulary: [
      { id: "lion", label: "Lion", initial: true },
      { id: "leaf", label: "Leaf", initial: true },
      { id: "lamp", label: "Lamp", initial: true },
      { id: "ladder", label: "Ladder", initial: true },
      { id: "lemon", label: "Lemon", initial: true },
    ],
  },
  {
    letter: "M",
    lower: "m",
    sound: "mm",
    vocabulary: [
      { id: "monkey", label: "Monkey", initial: true },
      { id: "milk", label: "Milk", initial: true },
      { id: "moon", label: "Moon", initial: true },
      { id: "mouse", label: "Mouse", initial: true },
      { id: "mountain", label: "Mountain", initial: true },
    ],
  },
  {
    letter: "N",
    lower: "n",
    sound: "nn",
    vocabulary: [
      { id: "nest", label: "Nest", initial: true },
      { id: "nose", label: "Nose", initial: true },
      { id: "nail", label: "Nail", initial: true },
      { id: "net", label: "Net", initial: true },
      { id: "nut", label: "Nut", initial: true },
    ],
  },
  {
    letter: "O",
    lower: "o",
    sound: "o",
    vocabulary: [
      { id: "orange", label: "Orange", initial: true },
      { id: "octopus", label: "Octopus", initial: true },
      { id: "owl", label: "Owl", initial: true },
      { id: "ocean", label: "Ocean", initial: true },
      { id: "ox", label: "Ox", initial: true },
    ],
  },
  {
    letter: "P",
    lower: "p",
    sound: "puh",
    vocabulary: [
      { id: "pig", label: "Pig", initial: true },
      { id: "pen", label: "Pen", initial: true },
      { id: "pizza", label: "Pizza", initial: true },
      { id: "panda", label: "Panda", initial: true },
      { id: "pineapple", label: "Pineapple", initial: true },
    ],
  },
  {
    letter: "Q",
    lower: "q",
    sound: "kwuh",
    vocabulary: [
      { id: "queen", label: "Queen", initial: true },
      { id: "quilt", label: "Quilt", initial: true },
      { id: "quail", label: "Quail", initial: true },
      { id: "quokka", label: "Quokka", initial: true },
      { id: "question", label: "Question", initial: true },
    ],
  },
  {
    letter: "R",
    lower: "r",
    sound: "rr",
    vocabulary: [
      { id: "rabbit", label: "Rabbit", initial: true },
      { id: "rain", label: "Rain", initial: true },
      { id: "robot", label: "Robot", initial: true },
      { id: "ring", label: "Ring", initial: true },
      { id: "rocket", label: "Rocket", initial: true },
    ],
  },
  {
    letter: "S",
    lower: "s",
    sound: "ss",
    vocabulary: [
      { id: "sun", label: "Sun", initial: true },
      { id: "snake", label: "Snake", initial: true },
      { id: "star", label: "Star", initial: true },
      { id: "shoe", label: "Shoe", initial: true },
      { id: "soup", label: "Soup", initial: true },
    ],
  },
  {
    letter: "T",
    lower: "t",
    sound: "tuh",
    vocabulary: [
      { id: "tiger", label: "Tiger", initial: true },
      { id: "tree", label: "Tree", initial: true },
      { id: "turtle", label: "Turtle", initial: true },
      { id: "train", label: "Train", initial: true },
      { id: "tooth", label: "Tooth", initial: true },
    ],
  },
  {
    letter: "U",
    lower: "u",
    sound: "uh",
    vocabulary: [
      { id: "umbrella", label: "Umbrella", initial: true },
      { id: "uniform", label: "Uniform", initial: true },
      { id: "urchin", label: "Urchin", initial: true },
      { id: "ukulele", label: "Ukulele", initial: true },
      { id: "up", label: "Up", initial: true },
    ],
  },
  {
    letter: "V",
    lower: "v",
    sound: "vv",
    vocabulary: [
      { id: "van", label: "Van", initial: true },
      { id: "violin", label: "Violin", initial: true },
      { id: "volcano", label: "Volcano", initial: true },
      { id: "vest", label: "Vest", initial: true },
      { id: "vase", label: "Vase", initial: true },
    ],
  },
  {
    letter: "W",
    lower: "w",
    sound: "wuh",
    vocabulary: [
      { id: "whale", label: "Whale", initial: true },
      { id: "watch", label: "Watch", initial: true },
      { id: "wind", label: "Wind", initial: true },
      { id: "water", label: "Water", initial: true },
      { id: "wagon", label: "Wagon", initial: true },
    ],
  },
  {
    letter: "X",
    lower: "x",
    sound: "ks",
    vocabulary: [
      { id: "xylophone", label: "Xylophone", initial: true },
      { id: "xray", label: "X-ray", initial: true },
      { id: "fox", label: "Fox", initial: false },
      { id: "box", label: "Box", initial: false },
      { id: "six", label: "Six", initial: false },
    ],
  },
  {
    letter: "Y",
    lower: "y",
    sound: "yuh",
    vocabulary: [
      { id: "yoyo", label: "Yo-yo", initial: true },
      { id: "yak", label: "Yak", initial: true },
      { id: "yacht", label: "Yacht", initial: true },
      { id: "yarn", label: "Yarn", initial: true },
      { id: "yellow", label: "Yellow", initial: true },
    ],
  },
  {
    letter: "Z",
    lower: "z",
    sound: "zz",
    vocabulary: [
      { id: "zebra", label: "Zebra", initial: true },
      { id: "zoo", label: "Zoo", initial: true },
      { id: "zip", label: "Zip", initial: true },
      { id: "zipper", label: "Zipper", initial: true },
      { id: "zucchini", label: "Zucchini", initial: true },
    ],
  },
];

/** Letters in canonical order - the progression list. */
export const TREAT_LETTERS: readonly string[] = TREAT_ALPHABET.map((l) => l.letter);

/** One letter's row. Falls back to A so a bad id can never crash a screen. */
export function letterData(letter: string): TreatLetter {
  return TREAT_ALPHABET.find((l) => l.letter === letter.toUpperCase()) ?? TREAT_ALPHABET[0];
}

/** Every distinct vocabulary word - used by the audio manifest generator so
 *  clip ids and content can never fall out of step. */
export const ALL_TREAT_WORDS: readonly string[] = Array.from(
  new Set(TREAT_ALPHABET.flatMap((l) => l.vocabulary.map((v) => v.id)))
).sort();
