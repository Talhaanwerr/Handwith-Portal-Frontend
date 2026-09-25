"use client";

/**
 * THE CLASSROOM — the one backdrop every screen of this game sits in front
 * of, redrawn after the user's reference photo: warm cream walls and a
 * recessed-light ceiling, a shuttered window on the left, a green chalkboard
 * in an orange wood frame at the centre with a bookshelf (and its globe) on
 * one side and a corkboard on the other, a teacher's desk with a small
 * telescope and a potted plant in front of it, and an orange door closing
 * the room off on the right. It is a single full-bleed SVG rather than the
 * corridor's `--u` container-query rig (see Key Quest / Leo's Puzzles):
 * nothing here needs pixel-exact flight paths, so `preserveAspectRatio="xMidYMax
 * slice"` — the SVG equivalent of `background-size: cover; background-position:
 * bottom center` — is enough to keep the floor anchored at the bottom of any
 * aspect ratio while the walls crop evenly at the sides. Every prop is flat
 * shapes in the portal's own illustration style (see AnimalArt/DoorArt),
 * never a photo, so it never fights the word card and picture grid sitting
 * in front of it.
 */

interface ClassroomSceneProps {
  /** Hide the chalkboard and the teacher's desk — the two props that sit
   *  where the word card and picture grid also want to be. The play screen
   *  asks for this so nothing behind the game competes with it; the title,
   *  level menu and "Well Done" screens keep the full room. */
  bare?: boolean;
}

export function ClassroomScene({ bare = false }: ClassroomSceneProps) {
  return (
    <svg
      className="br-scene"
      viewBox="0 0 400 225"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      {/* ── ceiling ── */}
      <rect x="0" y="0" width="400" height="20" fill="#EFDCC2" />
      <rect x="14" y="6" width="60" height="7" rx="3" fill="#D8BFA0" />
      <rect x="94" y="6" width="60" height="7" rx="3" fill="#D8BFA0" />
      <rect x="174" y="6" width="60" height="7" rx="3" fill="#D8BFA0" />
      <rect x="254" y="6" width="60" height="7" rx="3" fill="#D8BFA0" />
      <rect x="334" y="6" width="52" height="7" rx="3" fill="#D8BFA0" />

      {/* ── walls, a soft corner perspective ── */}
      <rect x="0" y="20" width="400" height="148" fill="#FBE9D6" />
      <path d="M0 20 L120 20 L104 168 L0 168 Z" fill="#F6DEC4" />
      <path d="M400 20 L280 20 L296 168 L400 168 Z" fill="#F0D2AE" />

      {/* ── window, far left ── */}
      <g>
        <rect x="16" y="34" width="62" height="76" rx="4" fill="#D9722E" />
        <rect x="24" y="42" width="46" height="60" fill="#DCEEFF" />
        <path d="M24 42 L70 42 M47 42 L47 102" stroke="#D9722E" strokeWidth="3" />
        {/* blind slats */}
        {[50, 58, 66, 74, 82, 90, 98].map((y) => (
          <rect key={y} x="26" y={y} width="42" height="3.4" fill="#FBF3E4" opacity="0.88" />
        ))}
      </g>

      {/* ── bookshelf + globe, left of the board ── */}
      <g>
        <rect
          x="94"
          y="86"
          width="46"
          height="82"
          fill="#A8683C"
          stroke="#7A4A26"
          strokeWidth="2"
        />
        <rect x="99" y="92" width="36" height="20" fill="#8B5A2E" />
        <rect x="99" y="118" width="36" height="20" fill="#8B5A2E" />
        <rect x="99" y="144" width="36" height="20" fill="#8B5A2E" />
        {/* books, top shelf */}
        <rect x="101" y="96" width="6" height="14" fill="#5B8AD6" />
        <rect x="108" y="94" width="6" height="16" fill="#E05A6E" />
        <rect x="115" y="97" width="6" height="13" fill="#5FAF3A" />
        <rect x="122" y="95" width="6" height="15" fill="#F0A32E" />
        {/* books, middle shelf */}
        <rect x="101" y="122" width="7" height="14" fill="#B06AD6" />
        <rect x="109" y="120" width="6" height="16" fill="#5B8AD6" />
        <rect x="116" y="123" width="14" height="13" fill="#8B6F47" />
        {/* the globe, standing on the shelf top */}
        <rect x="112" y="80" width="4" height="8" fill="#6B4B33" />
        <circle cx="114" cy="72" r="10" fill="#5B8AD6" stroke="#3F6FBF" strokeWidth="1.6" />
        <path
          d="M106 68 Q114 64 122 68 M105 74 Q114 78 123 74"
          stroke="#5FAF3A"
          strokeWidth="2.2"
          fill="none"
        />
        <ellipse
          cx="114"
          cy="72"
          rx="10"
          ry="3.4"
          fill="none"
          stroke="#3F6FBF"
          strokeWidth="1.2"
          opacity="0.7"
        />
      </g>

      {/* ── the chalkboard, centred — hidden on the play screen (`bare`) so it
           never sits behind the word card ── */}
      {!bare && (
        <g>
          <rect x="150" y="42" width="140" height="76" rx="4" fill="#C9731A" />
          <rect x="158" y="48" width="124" height="62" rx="2" fill="#2F6B4F" />
          {/* chalk doodles — decorative, not meant to be read */}
          <g stroke="#F4EFE2" strokeWidth="1.6" fill="none" opacity="0.85" strokeLinecap="round">
            <path d="M170 62 Q182 54 194 62 Q186 68 178 70" />
            <path d="M206 58 L224 58 L215 76 Z" />
            <path d="M238 90 Q250 68 264 90" />
            <path d="M168 96 L186 96 M172 90 L172 102" />
          </g>
          <circle cx="252" cy="66" r="2" fill="#F4EFE2" opacity="0.85" />
          <circle cx="258" cy="72" r="1.4" fill="#F4EFE2" opacity="0.7" />
          {/* chalk tray with a stub of chalk and a corner ruler */}
          <rect x="158" y="110" width="124" height="6" fill="#A8571A" />
          <rect x="196" y="106" width="10" height="4" rx="1.5" fill="#F4EFE2" />
          <path d="M262 106 L282 106 L282 118 Z" fill="#5B8AD6" opacity="0.85" />
        </g>
      )}

      {/* ── corkboard, right of the board ── */}
      <g>
        <rect x="300" y="50" width="52" height="58" rx="3" fill="#C9731A" />
        <rect x="305" y="55" width="42" height="48" fill="#D9B27C" />
        <rect
          x="311"
          y="61"
          width="12"
          height="12"
          rx="1.5"
          fill="#F0A6D8"
          transform="rotate(-6 317 67)"
        />
        <rect
          x="327"
          y="59"
          width="12"
          height="12"
          rx="1.5"
          fill="#8FC2E8"
          transform="rotate(5 333 65)"
        />
        <rect
          x="313"
          y="79"
          width="12"
          height="12"
          rx="1.5"
          fill="#F6C544"
          transform="rotate(4 319 85)"
        />
        <rect
          x="329"
          y="81"
          width="10"
          height="10"
          rx="1.5"
          fill="#8FD6A8"
          transform="rotate(-5 334 86)"
        />
      </g>

      {/* ── the door, far right ── */}
      <g>
        <rect x="356" y="30" width="34" height="138" fill="#B85A20" />
        <rect x="356" y="30" width="34" height="138" fill="none" stroke="#8A4212" strokeWidth="2" />
        <rect x="362" y="40" width="22" height="34" rx="2" fill="#DCEEFF" opacity="0.8" />
        <rect x="362" y="82" width="22" height="70" rx="2" fill="#A8481A" opacity="0.4" />
        <circle cx="382" cy="102" r="2.6" fill="#F6C544" />
      </g>

      {/* ── skirting where the walls meet the floor ── */}
      <rect x="0" y="160" width="400" height="8" fill="#8A6A3E" opacity="0.35" />

      {/* ── the floor, warm wood ── */}
      <rect x="0" y="168" width="400" height="57" fill="#D98A4A" />
      <path d="M0 168 L104 168 L64 225 L0 225 Z" fill="#CC7D3E" />
      <path d="M400 168 L296 168 L332 225 L400 225 Z" fill="#C06E33" />
      <g stroke="#B8703A" strokeWidth="1.4" opacity="0.55">
        <path d="M40 168 L24 225 M120 168 L112 225 M200 168 L200 225 M280 168 L288 225 M360 168 L376 225" />
      </g>

      {/* ── the teacher's desk, standing on the floor — also hidden when
           `bare`, same reason as the chalkboard above ── */}
      {!bare && (
        <g>
          <rect
            x="220"
            y="150"
            width="94"
            height="40"
            rx="3"
            fill="#C9731A"
            stroke="#8A4212"
            strokeWidth="2"
          />
          <rect x="220" y="150" width="94" height="10" fill="#DCA25E" />
          <rect x="230" y="190" width="8" height="18" fill="#8A4212" />
          <rect x="296" y="190" width="8" height="18" fill="#8A4212" />

          {/* the potted plant, left end of the desk */}
          <path
            d="M244 150 Q240 134 246 124 M248 150 Q252 132 248 120 M252 150 Q258 136 260 126"
            stroke="#3D8A28"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M238 150 L258 150 L255 138 L241 138 Z"
            fill="#C9584A"
            stroke="#A8402F"
            strokeWidth="1.6"
          />

          {/* the telescope, centred on the desk */}
          <path
            d="M280 150 L280 158 M272 158 L288 158"
            stroke="#6B7583"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="270"
            y="118"
            width="34"
            height="9"
            rx="4"
            fill="#3D3D5C"
            transform="rotate(-24 287 122)"
          />
          <circle cx="271" cy="132" r="4" fill="#8A96A5" />

          {/* a small cup, right end of the desk */}
          <rect
            x="296"
            y="140"
            width="10"
            height="10"
            rx="2"
            fill="#5B8AD6"
            stroke="#3F6FBF"
            strokeWidth="1.4"
          />
        </g>
      )}
    </svg>
  );
}
