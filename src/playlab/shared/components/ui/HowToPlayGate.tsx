"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { HowToPlay } from "@shared/components/ui/HowToPlay";
import { howToPlayFor } from "@shared/constants/howToPlay";

interface HowToPlayApi {
  /**
   * Call this from the handler that STARTS play (the Play button, or a module
   * card): instead of starting, the shared "How to Play" card opens, and
   * `start` runs only when the child presses Play (or closes the card). Pass
   * `moduleId` for a game with several modules, so the card can describe the
   * one that was picked. Outside a provider it just starts.
   */
  gate: (start: () => void, moduleId?: string) => void;
}

const Ctx = createContext<HowToPlayApi>({ gate: (start) => start() });

export const useHowToPlay = (): HowToPlayApi => useContext(Ctx);

interface Pending {
  start: () => void;
  steps: readonly string[];
}

/**
 * Hosts the "How to Play" card for one game. The game sits behind it, still
 * on its title screen (which is silent), so nothing plays or moves until the
 * child presses Play.
 */
export function HowToPlayProvider({
  gameId,
  title,
  children,
}: {
  gameId: string;
  title?: string;
  children: ReactNode;
}) {
  const [pending, setPending] = useState<Pending | null>(null);
  const open = useRef(false);

  const gate = useCallback(
    (start: () => void, moduleId?: string) => {
      const steps = howToPlayFor(gameId, moduleId);
      if (!steps || open.current) {
        if (!steps) start();
        return;
      }
      open.current = true;
      setPending({ start, steps });
    },
    [gameId]
  );

  const finish = useCallback(() => {
    if (!open.current) return; // a double tap on Play must start once
    const p = pending;
    open.current = false;
    setPending(null);
    p?.start();
  }, [pending]);

  const api = useMemo(() => ({ gate }), [gate]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {pending && (
        <div className="htp-scrim">
          <HowToPlay gameTitle={title} steps={pending.steps} onPlay={finish} onClose={finish} />
        </div>
      )}
    </Ctx.Provider>
  );
}
