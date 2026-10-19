/**
 * A tiny buzz in the hand when a brick clicks on — the "tactile" half of a
 * real snap, on phones and tablets that can vibrate. Silently nothing
 * elsewhere (desktops, iOS Safari).
 */
export function snapBuzz(): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(14);
  } catch {
    // not allowed here — the sound still plays
  }
}
