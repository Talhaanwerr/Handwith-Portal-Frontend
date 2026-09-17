/**
 * THE PICTURE ON THE MORE & LESS DOOR — more is a tall stack going up, less
 * is one block going down.
 *
 * The home screen's doors stand open on a picture of what is inside them: the
 * counting door on things to count, this one on the two words it teaches. The
 * game itself never asks a child to choose between these two — the answer is
 * always a door — so this is the only place they are drawn.
 */
export function WordArt({ word }: { word: "more" | "less" }) {
  const more = word === "more";
  return (
    <svg viewBox="0 0 60 60" className="dc-art" aria-hidden="true">
      {more ? (
        <>
          <rect x="10" y="40" width="16" height="12" rx="2" fill="#2F8F4F" />
          <rect x="10" y="27" width="16" height="12" rx="2" fill="#3FA862" />
          <rect x="10" y="14" width="16" height="12" rx="2" fill="#57C47D" />
          <path
            d="M42 48 L42 18 M42 18 L34 27 M42 18 L50 27"
            stroke="#2F8F4F"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <rect x="10" y="40" width="16" height="12" rx="2" fill="#D98A28" />
          <path
            d="M42 14 L42 44 M42 44 L34 35 M42 44 L50 35"
            stroke="#C9721A"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
