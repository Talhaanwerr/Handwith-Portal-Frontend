/**
 * The Library card's scene for Fix the Silly Robot — the robot on the calm
 * building site, three dots on his tummy screen, his left arm off and lying
 * on the dirt with its matching dot card. Inline SVG only: the Library page
 * does not load playlab.css. Nothing moves.
 */
export function SillyRobotIcon() {
  const dice3: [number, number][] = [
    [-6, -6],
    [0, 0],
    [6, 6],
  ];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="srb-ic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2F8FD0" />
            <stop offset="1" stopColor="#B9E2F4" />
          </linearGradient>
        </defs>
        {/* sky, a cloud, the dirt */}
        <rect width="100" height="100" fill="url(#srb-ic-sky)" />
        <ellipse cx="22" cy="18" rx="12" ry="5" fill="#FFFFFF" opacity="0.9" />
        <ellipse cx="30" cy="15" rx="8" ry="5" fill="#FFFFFF" opacity="0.9" />
        <rect y="74" width="100" height="26" fill="#C98B52" />
        <rect y="74" width="100" height="3" fill="#A86E3C" />

        {/* the robot */}
        <g transform="translate(10 4) scale(0.72)">
          <ellipse cx="50" cy="119" rx="34" ry="4.5" fill="rgba(60,40,20,0.25)" />
          <rect x="31" y="86" width="14" height="24" rx="5" fill="#B8C4D0" />
          <rect x="28" y="106" width="21" height="12" rx="5" fill="#8494A6" />
          <rect x="55" y="86" width="14" height="24" rx="5" fill="#B8C4D0" />
          <rect x="52" y="106" width="21" height="12" rx="5" fill="#8494A6" />
          <rect x="78" y="46" width="14" height="30" rx="7" fill="#B8C4D0" />
          <circle cx="85" cy="77" r="5" fill="#8494A6" />
          <rect x="22" y="40" width="56" height="48" rx="11" fill="#6FC3F0" />
          <rect x="30" y="45" width="40" height="38" rx="7" fill="#3D8FC9" />
          <rect x="32" y="47" width="36" height="34" rx="6" fill="#1E3550" />
          {dice3.map(([dx, dy], i) => (
            <circle key={i} cx={50 + dx * 1.6} cy={64 + dy * 1.6} r="3.6" fill="#7CF0C8" />
          ))}
          <rect x="7" y="45" width="16" height="36" rx="6" fill="rgba(255,255,255,0.45)" />
          <rect
            x="7"
            y="45"
            width="16"
            height="36"
            rx="6"
            fill="none"
            stroke="#F2C94C"
            strokeWidth="2.4"
            strokeDasharray="4 3"
          />
          <rect x="48" y="5" width="4" height="8" fill="#8494A6" />
          <circle cx="50" cy="5" r="4.5" fill="#E5484D" />
          <rect x="29" y="11" width="42" height="27" rx="9" fill="#B8C4D0" />
          <circle cx="41" cy="23" r="4.8" fill="#FFFFFF" />
          <circle cx="59" cy="23" r="4.8" fill="#FFFFFF" />
          <circle cx="41.6" cy="23.6" r="2.8" fill="#2BB585" />
          <circle cx="59.6" cy="23.6" r="2.8" fill="#2BB585" />
          <path
            d="M42 30.5 Q50 36 58 30.5"
            fill="none"
            stroke="#2B3A4A"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>

        {/* the lost arm on the dirt, with its dot card */}
        <g transform="rotate(-70 80 82)">
          <rect x="73" y="70" width="10" height="22" rx="5" fill="#B8C4D0" />
          <circle cx="78" cy="93" r="4" fill="#8494A6" />
        </g>
        <rect
          x="70"
          y="52"
          width="22"
          height="22"
          rx="4"
          fill="#FFFFFF"
          stroke="#FFD466"
          strokeWidth="1.8"
        />
        {dice3.map(([dx, dy], i) => (
          <circle key={i} cx={81 + dx} cy={63 + dy} r="2.6" fill="#2E7FD6" />
        ))}
      </svg>
    </div>
  );
}
