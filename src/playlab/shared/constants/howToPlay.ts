/**
 * The "How to Play" lines for every game: one or two short, concrete lines
 * that say what the child actually does. Shown by HowToPlay before a game
 * mounts (see GamePlayer). Keep each game to two lines at most.
 */
/** A game's lines: one list for the whole game, or one list per module. */
export type HowToPlayEntry =
  | readonly string[]
  | { default: readonly string[]; modules: Readonly<Record<string, readonly string[]>> };

export const HOW_TO_PLAY: Readonly<Record<string, HowToPlayEntry>> = {
  "animal-repair": {
    default: [
      "Look carefully at the toy animal on the screen.",
      "Then fix its parts so the toy is whole again.",
    ],
    modules: {
      missing: [
        "Look closely to find the part that is missing from the toy.",
        "Then drag that part back onto the toy where it belongs.",
      ],
      silly: [
        "Look at the toy and tap the silly part that does not belong.",
        "Then drag the right part onto the toy to fix it.",
      ],
    },
  },
  "birthday-party": {
    default: [
      "Look at the party and the friends who are waiting there.",
      "Count what you see, then place the right number where it goes.",
    ],
    modules: {
      each: [
        "Look at each friend at the party, who needs one cupcake.",
        "Drag one cupcake to each friend until everyone has one.",
      ],
      candles: [
        "Count how many candles the birthday cake needs.",
        "Then drag that many candles onto the cake.",
      ],
    },
  },
  "blend-read": [
    "Tap each letter to hear the sound that it makes.",
    "Then tap the picture that matches the word you built.",
  ],
  "brick-abc-tower": {
    default: [
      "Look at the letters at the top and find the next one.",
      "Drag that letter brick on top to build the tower.",
    ],
    modules: {
      three: [
        "Find the next letter to build a tower of 3 letters.",
        "Drag it on top: A, B, C, then D, E, F.",
      ],
      five: [
        "Find the next letter to build a tower of 5 letters.",
        "Drag it on top: A to E, then F to J, and so on.",
      ],
      ten: [
        "Find the next letter to build a tower of 10 letters.",
        "Drag it on top: A to J, then K to T, then U to Z.",
      ],
    },
  },
  "brick-build-steps": [
    "Look carefully at the model that you are going to build.",
    "Then drag the right brick onto the shadow where it fits.",
  ],
  "brick-count-sort": {
    default: [
      "Look at the bricks on the screen and count them carefully.",
      "Then tap or drag the bricks to finish the round.",
    ],
    modules: {
      sort: [
        "Look at the colour of each brick that you see.",
        "Then drag it into the crate that has the same colour.",
      ],
      tower: [
        "Count the bricks one by one as you stack them up.",
        "Then tap That's it! when you have reached the number.",
      ],
    },
  },
  "brick-first-sound": [
    "Look at the picture and think about the word it shows.",
    "Then drag the first letter of the word onto the plate.",
  ],
  "brick-lab": {
    default: [
      "Pick a design that you would like to build.",
      "Then build it with colourful bricks on the plate.",
    ],
    modules: {
      copy: [
        "Look carefully at the design, then build the very same one.",
        "Tap That's it! when you are done to check your work.",
      ],
      free: [
        "Pick a colour and a brick that you would like to use.",
        "Then drag bricks onto the plate to build anything you like.",
      ],
    },
  },
  "brick-pattern-wall": [
    "Look carefully at the pattern of colours in the wall.",
    "Then drag the next brick in the pattern to finish it.",
  ],
  "brick-plus-tower": [
    "Look at the sum and think about how many bricks it needs.",
    "Then drag bricks on to build the tower to match.",
  ],
  "brick-spell-words": [
    "Look at the picture and think of the word it shows.",
    "Then drag letter bricks on, one by one, to spell it.",
  ],
  "car-garage": {
    default: [
      "Look at the car in the garage and see what it needs.",
      "Then drag the parts onto the car to fix it up.",
    ],
    modules: {
      build: [
        "Look at the next car part that is waiting to be added.",
        "Then drag it onto the car where it belongs.",
      ],
      missing: [
        "Look closely to find the part that is missing from the car.",
        "Then drag the part that fits into the empty spot.",
      ],
    },
  },
  "car-wash": [
    "Look at the muddy car that needs a good wash.",
    "Then rub the car with your finger to wash it clean.",
  ],
  "color-paint": [
    "Listen and tap the crayon that the voice asks for.",
    "Then paint the picture with your finger using that colour.",
  ],
  "color-shape-friends": {
    default: [
      "Listen carefully to what Berry asks you to find.",
      "Then tap the right colour or shape to help Berry.",
    ],
    modules: {
      colors: [
        "Look at the colour that Berry is holding up.",
        "Then tap the tile that has the very same colour.",
      ],
      shapes: [
        "Look at the shape that Berry is holding up.",
        "Then tap the easel that shows the very same shape.",
      ],
      sorter: [
        "Tap a block to pick it up and look at its colour.",
        "Then tap the hole that has the same colour.",
      ],
    },
  },
  "counting-numbers": [
    "Count the things that you can see on the screen.",
    "Then tap or drag the right number to show how many.",
  ],
  "cvc-match": {
    default: [
      "Look at the pictures and read the words next to them.",
      "Then drag each word onto the picture that it matches.",
    ],
    modules: {
      a: [
        "Read the short a words and look at each picture.",
        "Then drag each word onto the picture that it matches.",
      ],
      e: [
        "Read the short e words and look at each picture.",
        "Then drag each word onto the picture that it matches.",
      ],
      i: [
        "Read the short i words and look at each picture.",
        "Then drag each word onto the picture that it matches.",
      ],
      o: [
        "Read the short o words and look at each picture.",
        "Then drag each word onto the picture that it matches.",
      ],
      u: [
        "Read the short u words and look at each picture.",
        "Then drag each word onto the picture that it matches.",
      ],
    },
  },
  "dino-dig": {
    default: [
      "Listen carefully for the letter that the dino needs.",
      "Then choose the right letter to help the dino.",
    ],
    modules: {
      feed: [
        "Listen for the letter that the dino asks for.",
        "Then tap the matching stone to feed the hungry dino.",
      ],
      stones: [
        "Look for the next letter in the alphabet order.",
        "Then drag it into the gap to build the bridge.",
      ],
    },
  },
  "door-count": {
    default: [
      "Look carefully at all of the doors on the screen.",
      "Then tap the right door to find the answer.",
    ],
    modules: {
      count: [
        "Listen for the number that you need to find.",
        "Then tap the door that shows that many things.",
      ],
      compare: [
        "Listen to find out if you need more or fewer.",
        "Then tap the door that has more or fewer things.",
      ],
    },
  },
  "feed-the-fish": [
    "Look at the hungry fish swimming in the water.",
    "Then tap the water to drop some food for them.",
  ],
  "feed-the-shark": {
    default: [
      "Look at the little letter fish swimming around.",
      "Then drag each fish to its big letter shark.",
    ],
    modules: {
      one: [
        "Drag the little fish over to its big letter shark.",
        "Feed both sharks, one fish at a time, to finish the round.",
      ],
      both: [
        "Two little fish swim around at the same time.",
        "Drag each fish to its own big letter shark.",
      ],
    },
  },
  "find-another-way": {
    default: [
      "Look carefully at the path in front of the bunny.",
      "Then help the bunny find a way to get home.",
    ],
    modules: {
      blocked: [
        "Look closely, because the path is blocked.",
        "Then tap another way for the bunny to go home.",
      ],
      look: [
        "Look carefully at all of the paths that you can see.",
        "Then tap the path that is open for the bunny.",
      ],
    },
  },
  "find-my-baby": {
    default: [
      "Look carefully around the picture to find the baby.",
      "Then tap the place where you think it is.",
    ],
    modules: {
      prints: [
        "Follow the footprints with your eyes across the picture.",
        "Then tap the place where the baby is hiding.",
      ],
      colour: [
        "Look at the colour of the mummy animal.",
        "Then tap the baby that has the matching colour.",
      ],
    },
  },
  "find-the-mouse": {
    default: [
      "Look at the cheese with all of its little holes.",
      "Then tap the answer that you find.",
    ],
    modules: {
      peek: [
        "Watch carefully to see which hole the mouse peeks out of.",
        "Then tap that hole to find the mouse.",
      ],
      count: [
        "Count how many mice are poking out of the cheese.",
        "Then tap the number that you counted.",
      ],
    },
  },
  "food-sort": {
    default: [
      "Look carefully at all of the foods on the screen.",
      "Then drag each one to the plate where it belongs.",
    ],
    modules: {
      colours: [
        "Look at the colour of each food that you see.",
        "Then drag it to the plate that has the matching colour.",
      ],
      shapes: [
        "Look carefully at the shape of each one.",
        "Then drag it to the place where it fits.",
      ],
      sizes: [
        "Look at each food and decide if it is big or small.",
        "Then drag it to the place where it belongs.",
      ],
      kitchen: [
        "Look carefully at each thing that you find in the kitchen.",
        "Then drag it to the place where it belongs.",
      ],
    },
  },
  "jigsaw-fun": [
    "Drag each puzzle piece onto the board, one at a time.",
    "Fit all of the pieces together to finish the picture.",
  ],
  "jungle-spy": [
    "Listen carefully for the hidden letter that you need to find.",
    "Then tap every bubble that has that letter inside.",
  ],
  "letter-hunt": {
    default: [
      "Listen for the letter that Penny asks you to find.",
      "Then tap each matching letter that you can see.",
    ],
    modules: {
      free: [
        "Listen for the letter that Penny asks you to find.",
        "Then tap it as soon as you spot it.",
      ],
      "five-star": [
        "Listen for the letter that Penny asks you to find.",
        "Then tap all five of them to earn your stars.",
      ],
    },
  },
  "letter-tracing": {
    default: [
      "Pick a letter that you would like to trace.",
      "Then trace it slowly with your finger.",
    ],
    modules: {
      uppercase: [
        "Pick a big letter that you would like to trace.",
        "Then trace it slowly with your finger.",
      ],
      lowercase: [
        "Pick a small letter that you would like to trace.",
        "Then trace it slowly with your finger.",
      ],
      numbers: [
        "Pick a number that you would like to trace.",
        "Then trace it slowly with your finger.",
      ],
      sequencing: [
        "Look at the empty spaces that are waiting for letters.",
        "Then drag the letters into the right order to fill them.",
      ],
    },
  },
  "letter-treats": [
    "Pick a letter that you would like to try.",
    "Then tap the picture that starts with that letter.",
  ],
  "magic-flower": [
    "Look carefully at the magic flower on the screen.",
    "Then tap and drag on it to watch it grow.",
  ],
  "magnet-match": [
    "Look at the gray letters that are waiting on the screen.",
    "Then drag each magnet onto the letter that matches it.",
  ],
  "math-maze": {
    default: [
      "Tap the numbers in the right order, one by one.",
      "Follow them along the maze all the way to the prize.",
    ],
    modules: {
      "one-five": [
        "Tap the numbers in order from 1 up to 5.",
        "Follow them along the maze all the way to the prize.",
      ],
      "one-ten": [
        "Tap the numbers in order from 1 up to 10.",
        "Follow them along the maze all the way to the prize.",
      ],
      "count-down": [
        "Tap the numbers in order while counting down.",
        "Follow them along the maze all the way to the prize.",
      ],
      twos: [
        "Tap the numbers in order while counting by twos.",
        "Follow them along the maze all the way to the prize.",
      ],
    },
  },
  "number-groups": {
    default: [
      "Count the things in each group that you see.",
      "Then match each number to the group it belongs with.",
    ],
    modules: {
      plates: [
        "Listen carefully for the number that you need to find.",
        "Then tap the plate that has that many things on it.",
      ],
      cards: [
        "Count the things that you see on each card.",
        "Then drag each number onto the card that matches.",
      ],
    },
  },
  "number-hunt": {
    default: [
      "Look and find the number that you are asked for.",
      "Then match each group to the number that fits it.",
    ],
    modules: {
      find: [
        "Listen carefully for the number that you need to find.",
        "Then tap everything that is wearing that number.",
      ],
      boxes: [
        "Count the things that you see on each card.",
        "Then drag the card to the box that shows its number.",
      ],
    },
  },
  "number-match": [
    "Count the things that you see on each card.",
    "Then drag each number under the card that it matches.",
  ],
  "number-safari": {
    default: [
      "Count the animals you see, then tap the number that tells how many.",
      "If a number is missing, drag it into the gap.",
    ],
    modules: {
      easy: [
        "Count the animals you see, then tap the number that tells how many.",
        "If a number is missing, drag it into the gap.",
      ],
      medium: [
        "Count the animals you see, then tap the number that tells how many.",
        "If a number is missing, drag it into the gap.",
      ],
      hard: [
        "Count the animals you see, then tap the number that tells how many.",
        "If a number is missing, drag it into the gap.",
      ],
    },
  },
  "number-train": {
    default: [
      "Drag the carriages onto the train in the right number order.",
      "Or tap the carriage that is missing from the train.",
    ],
    modules: {
      build: [
        "Look carefully at the numbers on the carriages.",
        "Then drag each one onto the train in the right order.",
      ],
      missing: [
        "Look closely to find the empty spot in the train.",
        "Then tap the carriage that has the missing number.",
      ],
    },
  },
  "ocean-abc": {
    default: [
      "Choose big or small letters, and then pick a letter.",
      "Then build it, pop it, or trace it.",
    ],
    modules: {
      combined: [
        "Choose a letter to start playing.",
        "Then build the letter, pop its bubbles, and trace it.",
      ],
      build: [
        "Choose a letter to start playing.",
        "Then drag the pieces together to build the letter.",
      ],
      pop: [
        "Choose a letter to start playing.",
        "Then tap the bubbles with that letter to pop them.",
      ],
      trace: [
        "Choose a letter to start playing.",
        "Then trace the letter slowly with your finger.",
      ],
    },
  },
  "ocean-hunt": [
    "Look carefully at the row of letters on the screen.",
    "Then drag the missing letter into the empty bubble.",
  ],
  "on-off": [
    "Listen to hear if you should put it ON or take it OFF.",
    "Then drag the thing onto its shadow.",
  ],
  "pirate-match": [
    "Look at the letter and the pictures next to it.",
    "Then drag each letter to the picture that it matches.",
  ],
  "pond-numbers": {
    default: [
      "Count the dots or the frogs that you can see.",
      "Then tap the number that shows how many there are.",
    ],
    modules: {
      quick: [
        "Look quickly at the dots when they show up.",
        "Then tap the number of dots that you saw.",
      ],
      more: [
        "Count the frogs that are sitting on the log.",
        "Then one more hops on, so tap how many there are now.",
      ],
    },
  },
  "rocket-countdown": {
    default: [
      "Look carefully at the rocket on the screen.",
      "Then tap to count and watch it blast off.",
    ],
    modules: {
      count: [
        "Tap the stars in order, counting down from the biggest number to 1.",
        "Then the rocket blasts off.",
      ],
      fuel: [
        "Count how many stars the rocket needs.",
        "Then put in that many star cells to fuel it.",
      ],
    },
  },
  "sesame-activities": {
    default: [
      "Look at the ball or the snack that Percy has or wants.",
      "Then tap the matching ball or snack.",
    ],
    modules: {
      colours: [
        "Look carefully at the ball that Percy is holding.",
        "Then tap the ball that has the same colour.",
      ],
      snack: ["Listen to hear which food the pal wants.", "Then tap the plate that has that food."],
    },
  },
  "shadow-match": {
    default: [
      "Look carefully at the picture and the shadows.",
      "Then drag the picture to its shadow, or tap one.",
    ],
    modules: {
      find: [
        "Look carefully at the big picture on the screen.",
        "Then drag it onto its own matching shadow.",
      ],
      size: [
        "Look carefully at the two shadows on the screen.",
        "Then tap the big one or the small one, as asked.",
      ],
    },
  },
  "shape-match": [
    "Match the shapes first, and then fit in the missing pieces.",
    "Drag each piece to the place where it belongs.",
  ],
  "silly-robot": {
    default: [
      "Look carefully at the dots on the silly robot.",
      "Then find the part that has the matching dots.",
    ],
    modules: {
      fix: [
        "Look carefully at the dots on the robot's tummy.",
        "Then tap the part that has the same dots.",
      ],
      peek: [
        "Watch carefully as the robot's dots flash on the screen.",
        "Then tap the number of dots that you saw.",
      ],
    },
  },
  "sock-case": [
    "Look carefully at all of the socks on the screen.",
    "Then drag the matching sock, or tap the odd one.",
  ],
  "sort-it": {
    default: [
      "Look carefully at each thing on the screen.",
      "Then drag it to the board that it belongs on.",
    ],
    modules: {
      size: [
        "Look carefully at the size of each thing.",
        "Then drag it to the BIG board or the SMALL board.",
      ],
      home: [
        "Look carefully at each thing and think about where it lives.",
        "Then drag it to the board where it lives.",
      ],
    },
  },
  "sort-two-ways": {
    default: [
      "Drag each thing into the tray where it belongs.",
      "Then sort the very same things in another way.",
    ],
    modules: {
      shapes: [
        "Drag each shape into the tray where it belongs.",
        "Then sort the shapes a second time in a new way.",
      ],
      animals: [
        "Drag each animal into the tray where it belongs.",
        "Then sort the animals a second time in a new way.",
      ],
      sweets: [
        "Drag each sweet into the tray where it belongs.",
        "Then sort the sweets a second time in a new way.",
      ],
    },
  },
  "space-letters": [
    "Drag the pieces one by one into the shape of the letter.",
    "Build the whole letter to finish and win.",
  ],
  "tangram-town": {
    default: [
      "Drag each shape onto the picture where it fits.",
      "Fit all seven shapes to finish the picture.",
    ],
    modules: {
      easy: [
        "Drag each shape to the spot with its matching colour.",
        "Fit all seven shapes to finish the picture.",
      ],
      medium: [
        "Drag each shape onto its outline on the picture.",
        "Fit all seven shapes to finish the picture.",
      ],
      hard: [
        "Look carefully at the shadow picture on the screen.",
        "Then drag the seven shapes to fill it up.",
      ],
    },
  },
  "teddy-seesaw": {
    default: [
      "Look carefully at the bears on the seesaw.",
      "Then tap or add bears to make it match.",
    ],
    modules: {
      tip: ["Count the bears that are sitting on each side.", "Then tap the side that goes down."],
      balance: [
        "Count the bears on each side of the seesaw.",
        "Then tap + or - to make the seesaw level.",
      ],
    },
  },
  "tiny-toy-shop": {
    default: [
      "Look carefully at all of the toys in the shop.",
      "Count them, and then tap your answer.",
    ],
    modules: {
      pick: ["Listen carefully to hear the number that you need.", "Then tap that many toys."],
      add: ["Count the toys in the two little groups.", "Then tap the total number of toys."],
    },
  },
  "whats-inside": [
    "Look carefully at the treasure chest on the screen.",
    "Then tap the toy inside, or the right chest.",
  ],
  "word-quiz": [
    "Look carefully at the picture on the screen.",
    "Then tap the word that matches the picture.",
  ],
  "your-turn": [
    "Look at your friend who is waiting for you.",
    "Then drag the ball to roll it to your friend.",
  ],
};

/** The lines to show for a game (and the module the child picked, if any). */
export function howToPlayFor(gameId: string, moduleId?: string): readonly string[] | undefined {
  const e = HOW_TO_PLAY[gameId];
  if (!e) return undefined;
  if (Array.isArray(e)) return e;
  const entry = e as {
    default: readonly string[];
    modules: Readonly<Record<string, readonly string[]>>;
  };
  return (moduleId && entry.modules[moduleId]) || entry.default;
}

/**
 * Games that open the card from their own start button (useHowToPlay().gate).
 * Every other game still shows it before the game mounts, so no game is ever
 * without it while the rest are wired up.
 */
export const GATED_GAMES: ReadonlySet<string> = new Set<string>([
  "animal-repair",
  "birthday-party",
  "blend-read",
  "brick-abc-tower",
  "brick-build-steps",
  "brick-count-sort",
  "brick-first-sound",
  "brick-lab",
  "brick-pattern-wall",
  "brick-plus-tower",
  "brick-spell-words",
  "car-garage",
  "color-paint",
  "color-shape-friends",
  "counting-numbers",
  "cvc-match",
  "dino-dig",
  "door-count",
  "feed-the-shark",
  "find-another-way",
  "find-my-baby",
  "find-the-mouse",
  "food-sort",
  "jigsaw-fun",
  "jungle-spy",
  "letter-hunt",
  "letter-tracing",
  "letter-treats",
  "magnet-match",
  "math-maze",
  "number-groups",
  "number-hunt",
  "number-match",
  "number-safari",
  "number-train",
  "ocean-abc",
  "ocean-hunt",
  "on-off",
  "pirate-match",
  "pond-numbers",
  "rocket-countdown",
  "sesame-activities",
  "shadow-match",
  "shape-match",
  "silly-robot",
  "sock-case",
  "sort-it",
  "sort-two-ways",
  "space-letters",
  "tangram-town",
  "teddy-seesaw",
  "tiny-toy-shop",
  "word-quiz",
]);
