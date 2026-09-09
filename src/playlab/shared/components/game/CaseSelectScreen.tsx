"use client";

import { ChoiceScreen, type Choice, type ChoiceScreenProps } from "./ChoiceScreen";

/** The two letter cases a game can be played in. Games' own LetterCase types
 *  are the same string union, so they interoperate without casts. */
export type SelectableCase = "upper" | "lower";

/** Everything ChoiceScreen needs except the choices themselves. */
type CaseSelectScreenProps = Omit<ChoiceScreenProps<SelectableCase>, "options">;

const CASE_OPTIONS: readonly Choice<SelectableCase>[] = [
  {
    value: "upper",
    preview: "ABC",
    label: "BIG LETTERS",
    aria: "Play with big letters",
    variant: "upper",
  },
  {
    value: "lower",
    preview: "abc",
    label: "small letters",
    aria: "Play with small letters",
    variant: "lower",
  },
];

/**
 * BIG LETTERS / small letters — the ONE case picker.
 *
 * Space ABC, Ocean ABC and dino-dig each grew their own copy of this screen;
 * this is the shared version so no fourth copy ever exists (Ocean Hunt is
 * its first consumer, and the three copies can migrate here when touched).
 *
 * The screen itself is ChoiceScreen — this file is now just the two options
 * and their names, because Pirate Match's difficulty picker asks a different
 * question through exactly the same plates.
 */
export function CaseSelectScreen(props: CaseSelectScreenProps) {
  return <ChoiceScreen<SelectableCase> {...props} options={CASE_OPTIONS} />;
}
