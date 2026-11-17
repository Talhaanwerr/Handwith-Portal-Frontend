import { wordSrc } from "@games/rhyme-or-not/constants/words";

/**
 * The Library card's scene for Rhyme Train Station: a peach sky under the
 * red scalloped canopy, a navy engine pulling a teal carriage with the moon
 * on its door, and a passenger holding a spoon waiting on the platform.
 * Inline SVG and images only (the Library page does not load playlab.css).
 * Nothing moves.
 */
export function RhymeTrainIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#FFD2AE" />
        <path d="M0 44 Q30 32 60 40 T100 38 V60 H0 Z" fill="#B898D2" />
        <rect width="100" height="12" fill="#C9372C" />
        {[0, 12, 24, 36, 48, 60, 72, 84, 96].map((x) => (
          <path key={x} d={`M${x} 12 a6 6 0 0 0 12 0 Z`} fill="#FFF1DA" />
        ))}
        <rect y="60" width="100" height="40" fill="#CDB49E" />
        <rect y="60" width="100" height="3" fill="#FFD23D" />
        {/* the rails */}
        <rect y="57" width="100" height="2" fill="#5A5D78" />
        {/* the engine */}
        <rect x="6" y="38" width="22" height="16" rx="7" fill="#2B3A6B" />
        <rect x="10" y="28" width="6" height="12" fill="#26304F" />
        <rect x="24" y="30" width="12" height="24" rx="2" fill="#E2553F" />
        <circle cx="13" cy="55" r="4" fill="#E2553F" stroke="#26304F" strokeWidth="1.5" />
        <circle cx="30" cy="55" r="4.5" fill="#E2553F" stroke="#26304F" strokeWidth="1.5" />
        {/* the carriage */}
        <rect x="40" y="22" width="44" height="4" rx="2" fill="#3C3F5A" />
        <rect x="41" y="26" width="42" height="28" rx="3" fill="#2FA3A0" />
        <rect x="52" y="29" width="20" height="21" rx="3" fill="#FFF1DA" />
        <image href={wordSrc("moon")} x="53" y="30" width="18" height="19" />
        <circle cx="49" cy="55" r="4" fill="#E2553F" stroke="#3C3F5A" strokeWidth="1.5" />
        <circle cx="76" cy="55" r="4" fill="#E2553F" stroke="#3C3F5A" strokeWidth="1.5" />
        {/* a passenger with a spoon */}
        <circle cx="66" cy="70" r="7" fill="#FFB37A" />
        <path d="M59 69 Q66 58 73 69 Z" fill="#7B4FD6" />
        <rect
          x="58"
          y="75"
          width="16"
          height="16"
          rx="3"
          fill="#FFFFFF"
          stroke="#F0C9A8"
          strokeWidth="1.2"
        />
        <image href={wordSrc("spoon")} x="59" y="76" width="14" height="14" />
      </svg>
    </div>
  );
}
