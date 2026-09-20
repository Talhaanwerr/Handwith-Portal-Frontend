"use client";

/**
 * The props of Space ABC's celebration — a little rocket and a star — in the
 * scene's own palette (see SpaceScene).
 */

/** A small rocket, nose UP at rest; the celebration turns it to face the way
 *  it flies. */
export function Rocket() {
  return (
    <svg viewBox="0 0 40 72" className="h-full w-full" aria-hidden="true">
      {/* flame */}
      <path d="M14 56 Q20 74 26 56 Z" fill="#FFB347" />
      <path d="M17 56 Q20 66 23 56 Z" fill="#FFE07A" />
      {/* fins */}
      <path d="M8 40 L14 30 L14 54 Z" fill="#C97B6A" />
      <path d="M32 40 L26 30 L26 54 Z" fill="#C97B6A" />
      {/* body */}
      <path d="M14 22 Q20 2 26 22 V54 H14 Z" fill="#EDF2FF" />
      <path d="M20 4 Q26 12 26 22 H14 Q14 12 20 4 Z" fill="#C97B6A" />
      {/* window */}
      <circle cx="20" cy="32" r="5" fill="#16224A" />
      <circle cx="20" cy="32" r="3" fill="#5B7FFF" />
      <circle cx="18.6" cy="30.6" r="1" fill="#DCE8FF" />
    </svg>
  );
}

/** A four-point star, thrown by the galaxy burst. */
export function Star() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      <path d="M20 2 Q22 17 38 20 Q22 23 20 38 Q18 23 2 20 Q18 17 20 2 Z" fill="#DCE8FF" />
      <circle cx="20" cy="20" r="3" fill="#FFFFFF" />
    </svg>
  );
}
