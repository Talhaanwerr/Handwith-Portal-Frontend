/** What `NgShell` hands every round of every module, in both games. Rounds
 *  are remounted per round (keyed by module and round). */
export interface RoundProps {
  round: number;
  /** The game's name, for the Back pill's label. */
  title: string;
  onDone: () => void;
  onMiss: () => void;
  onHome: () => void;
  onExitPortal: () => void;
}
