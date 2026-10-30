"use client";

import { memo } from "react";

/**
 * THE REPAIR SHOP'S FURNITURE, in front of Number Hunt's playroom (Berry's
 * room from Color & Shape Friends, reused as it is — see NhWorlds):
 *
 *   • the workbench — Play Street Pals' wooden dining table (restated in
 *     number-groups.css as `.ng-table`), given a drawer apron so it reads as
 *     a bench; plain CSS layers, so it stretches to any screen;
 *   • the tool rack — a small pegboard on the wall with a hammer, a
 *     screwdriver, scissors and a reel of thread (a missing prop: nothing in
 *     the portal hangs tools). Decoration only; nothing here moves.
 */

export const Workbench = memo(function Workbench() {
  return (
    <div className="arp-bench" aria-hidden="true">
      <span className="arp-bench-leg arp-bench-leg--l" />
      <span className="arp-bench-leg arp-bench-leg--r" />
      <span className="arp-bench-apron">
        <span className="arp-bench-drawer">
          <span className="arp-bench-knob" />
        </span>
        <span className="arp-bench-drawer">
          <span className="arp-bench-knob" />
        </span>
      </span>
      <span className="arp-bench-top" />
    </div>
  );
});

export const ToolRack = memo(function ToolRack() {
  const holes = [];
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < 9; x++)
      holes.push(<circle key={`${x}-${y}`} cx={12 + x * 12} cy={12 + y * 16} r="1.6" />);
  return (
    <div className="arp-rack" aria-hidden="true">
      <svg viewBox="0 0 120 76" className="arp-rack-svg">
        {/* the pegboard */}
        <rect x="2" y="4" width="116" height="70" rx="7" fill="#B98552" />
        <rect x="2" y="2" width="116" height="68" rx="7" fill="#E2B57E" />
        <rect x="6" y="5" width="108" height="5" rx="2.5" fill="#F1CF9F" opacity="0.8" />
        <g fill="#B98552" opacity="0.55">
          {holes}
        </g>
        {/* a hammer */}
        <circle cx="20" cy="12" r="2.2" fill="#8C5C40" />
        <rect x="17.5" y="20" width="5" height="40" rx="2.5" fill="#C9874E" />
        <rect x="11" y="13" width="18" height="10" rx="3" fill="#9AA3B8" />
        <rect x="11" y="13" width="18" height="3.5" rx="1.75" fill="#C9CFDD" />
        {/* a screwdriver */}
        <circle cx="44" cy="12" r="2.2" fill="#8C5C40" />
        <rect x="40" y="14" width="8" height="20" rx="4" fill="#E5484D" />
        <rect x="41.5" y="16" width="2" height="15" rx="1" fill="#FFFFFF" opacity="0.4" />
        <rect x="42.6" y="34" width="2.8" height="24" rx="1.2" fill="#B8C4D0" />
        {/* scissors */}
        <circle cx="68" cy="12" r="2.2" fill="#8C5C40" />
        <path d="M66 22 L64 56 L68 34 Z M70 22 L72 56 L68 34 Z" fill="#B8C4D0" />
        <circle cx="63.5" cy="18" r="5" fill="none" stroke="#2E7FD6" strokeWidth="3" />
        <circle cx="72.5" cy="18" r="5" fill="none" stroke="#2E7FD6" strokeWidth="3" />
        {/* a reel of thread with its needle */}
        <circle cx="96" cy="12" r="2.2" fill="#8C5C40" />
        <rect x="86" y="16" width="20" height="5" rx="2" fill="#C9874E" />
        <rect x="88" y="21" width="16" height="20" rx="3" fill="#FF7EA8" />
        <path d="M88 26 L104 26 M88 31 L104 31 M88 36 L104 36" stroke="#E85A8C" strokeWidth="1.2" />
        <rect x="86" y="41" width="20" height="5" rx="2" fill="#C9874E" />
        <path d="M104 33 Q112 40 108 54" stroke="#FF7EA8" strokeWidth="1.2" fill="none" />
        <rect x="107" y="50" width="1.8" height="14" rx="0.9" fill="#9AA3B8" />
      </svg>
    </div>
  );
});
