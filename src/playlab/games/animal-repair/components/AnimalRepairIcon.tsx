/**
 * The Library card's scene for Silly Animal Repair Shop: Berry's room (the
 * dotted wall, the mint wainscot, the wooden floor), the workbench, and on it
 * a soft toy bunny who has lost her ears — their dashed outline on her head —
 * with the ears waiting on a card beside her. Inline SVG and flat colours
 * only: the Library page loads neither playlab.css nor Candy ABC's
 * gradients. Nothing moves.
 */
export function AnimalRepairIcon() {
  const ink = "#3D3D5C";
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <pattern id="arp-ic-dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.9" fill="#F3DDB3" />
          </pattern>
        </defs>
        {/* the room */}
        <rect width="100" height="100" fill="#FFF3DC" />
        <rect width="100" height="56" fill="url(#arp-ic-dots)" />
        <rect y="48" width="100" height="10" fill="#8FD3C1" />
        <rect y="48" width="100" height="1.6" fill="#FFFFFF" />
        <rect y="58" width="100" height="42" fill="#D9A066" />
        {/* the tool rack */}
        <rect x="62" y="8" width="32" height="22" rx="3" fill="#E2B57E" />
        <rect x="67" y="12" width="3" height="14" rx="1.5" fill="#C9874E" />
        <rect x="64" y="10" width="9" height="5" rx="1.5" fill="#9AA3B8" />
        <rect x="78" y="11" width="4" height="9" rx="2" fill="#E5484D" />
        <rect x="79.3" y="20" width="1.4" height="8" fill="#B8C4D0" />
        <rect x="86" y="13" width="6" height="9" rx="1.5" fill="#FF7EA8" />
        {/* the workbench */}
        <rect x="2" y="76" width="96" height="8" rx="2.5" fill="#9B6238" />
        <rect x="2" y="74" width="96" height="7" rx="2.5" fill="#E6B07A" />
        <rect x="8" y="81" width="84" height="8" rx="1.5" fill="#C98A55" />
        <rect x="10" y="89" width="4" height="11" fill="#9B6238" />
        <rect x="86" y="89" width="4" height="11" fill="#9B6238" />
        {/* the bunny: no ears, their outline dashed on her head */}
        <ellipse cx="34" cy="76" rx="20" ry="2.6" fill="rgba(60,40,20,0.2)" />
        <g fill="rgba(255,255,255,0.7)" stroke="#E39A2D" strokeWidth="1.3" strokeDasharray="3 2.2">
          <ellipse cx="28" cy="20" rx="5" ry="11.5" transform="rotate(-12 28 20)" />
          <ellipse cx="40" cy="20" rx="5" ry="11.5" transform="rotate(12 40 20)" />
        </g>
        <ellipse cx="34" cy="62" rx="16" ry="13" fill="#F1EEF6" />
        <ellipse cx="34" cy="65" rx="9" ry="7.5" fill="#FFD3E4" />
        <ellipse cx="26" cy="74" rx="6" ry="3.4" fill="#F1EEF6" />
        <ellipse cx="42" cy="74" rx="6" ry="3.4" fill="#F1EEF6" />
        <circle cx="34" cy="40" r="15" fill="#FFFFFF" />
        <circle cx="34" cy="40" r="15" fill="none" stroke="#E6DFF0" strokeWidth="1.2" />
        <circle cx="28.5" cy="38.5" r="2" fill={ink} />
        <circle cx="39.5" cy="38.5" r="2" fill={ink} />
        <path
          d="M23.5 35 L28.5 33.5 M34.5 33.5 L39.5 35"
          stroke={ink}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path d="M32 43 L34 45 L36 43 Z" fill="#FF9EC4" />
        <path
          d="M30.5 49 Q34 46 37.5 49"
          stroke={ink}
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
        {/* the ears, waiting on their card */}
        <rect x="60" y="46" width="28" height="28" rx="5" fill="#E0A93A" />
        <rect
          x="60"
          y="44"
          width="28"
          height="28"
          rx="5"
          fill="#FFFFFF"
          stroke="#FFD466"
          strokeWidth="1.8"
        />
        <ellipse cx="69" cy="58" rx="4.4" ry="10" transform="rotate(-12 69 58)" fill="#F1EEF6" />
        <ellipse cx="79" cy="58" rx="4.4" ry="10" transform="rotate(12 79 58)" fill="#F1EEF6" />
        <ellipse cx="69" cy="59" rx="2.2" ry="6.6" transform="rotate(-12 69 59)" fill="#FF9EC4" />
        <ellipse cx="79" cy="59" rx="2.2" ry="6.6" transform="rotate(12 79 59)" fill="#FF9EC4" />
      </svg>
    </div>
  );
}
