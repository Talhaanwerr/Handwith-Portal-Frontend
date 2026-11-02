"use client";

import {
  createContext,
  createElement,
  useContext,
  type ComponentType,
  type ReactNode,
} from "react";
import { Teacher } from "@games/door-count/components/Teacher";

/** What the figure in the guide's corner is given: the line for its bubble,
 *  and whether to jump for joy. Key Quest's `Teacher` takes exactly this. */
export interface GuideProps {
  cheer: boolean;
  say?: string;
}

const GuideContext = createContext<ComponentType<GuideProps>>(Teacher);

/**
 * Who stands in the guide's corner — the title screen, every round, the star
 * card. The teacher, unless a game puts its own character there (Birthday
 * Party's birthday friend). The component must be stable (defined once, or
 * memoised), or the figure remounts on every render.
 */
export function GuideProvider({
  guide,
  children,
}: {
  guide?: ComponentType<GuideProps>;
  children: ReactNode;
}) {
  if (!guide) return <>{children}</>;
  return <GuideContext.Provider value={guide}>{children}</GuideContext.Provider>;
}

/** The guide itself, with its bubble — drawn in `.ng-teacher-slot`. */
export function NgGuide(props: GuideProps) {
  // the provider holds a stable component (never one made here), so this
  // never remounts the figure
  return createElement(useContext(GuideContext), props);
}
