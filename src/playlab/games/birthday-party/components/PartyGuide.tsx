"use client";

import { createContext, memo, useContext, type Ref } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GuideProps } from "@games/number-groups/components/NgGuide";
import { AgeBadge, BirthdayFriend } from "@games/birthday-party/components/PartyArt";
import type { FriendId } from "@games/birthday-party/constants/rounds";

/** Two hops, the second smaller — the teacher's jump, in the friend's own
 *  height. Keyframes, so a tween; a spring takes only two. */
const HOP = { y: ["0%", "-16%", "0%", "-8%", "0%"] };
const BREATHE = { y: ["0%", "-2%", "0%"] };

/**
 * THE BIRTHDAY FRIEND AS THE GUIDE — big, in the teacher's corner, saying
 * the teacher's lines in the teacher's bubble (the `dc-teacher*` classes, so
 * the kit's slot places the bubble exactly as it places his). In Candles on
 * the Cake the friend wears their age badge.
 */
function PartyGuideFigure({
  who,
  age,
  badgeRef,
  cheer,
  say,
}: GuideProps & { who: FriendId; age?: number; badgeRef?: Ref<HTMLSpanElement> }) {
  const timing = cheer
    ? { duration: 1.1, ease: "easeOut" as const }
    : { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const };
  return (
    <div className="dc-teacher bdc-guide">
      <AnimatePresence>
        {say && (
          <motion.span
            className="dc-teacher-says bdc-guide-says font-rounded font-black"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            {say}
          </motion.span>
        )}
      </AnimatePresence>
      <span className="dc-teacher-shadow" aria-hidden="true" />
      <motion.span className="bdc-guide-fig" animate={cheer ? HOP : BREATHE} transition={timing}>
        <BirthdayFriend who={who} happy={cheer} />
        {age !== undefined && (
          <span ref={badgeRef} className="bdc-guide-badge">
            <AgeBadge age={age} />
          </span>
        )}
      </motion.span>
    </div>
  );
}

/** The guide on the title screen, in One for Each and on the star card: Bo. */
export const BoGuide = memo(function BoGuide(props: GuideProps) {
  return <PartyGuideFigure {...props} who="bo" />;
});

/** This round's birthday friend, their age, and the badge to bounce. */
export interface CandleGuest {
  who: FriendId;
  age: number;
  badgeRef: Ref<HTMLSpanElement>;
}
export const CandleGuestContext = createContext<CandleGuest | null>(null);

/** The guide in Candles on the Cake: whoever's birthday it is, with the badge. */
export const CandleGuide = memo(function CandleGuide(props: GuideProps) {
  const guest = useContext(CandleGuestContext);
  if (!guest) return <PartyGuideFigure {...props} who="bo" />;
  return <PartyGuideFigure {...props} {...guest} />;
});
