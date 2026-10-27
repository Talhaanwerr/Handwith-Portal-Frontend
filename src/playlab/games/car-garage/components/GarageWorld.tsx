"use client";

import { memo, useId } from "react";
import { C } from "@shared/components/construction/palette";
import { DirtGround, SiteSky, ToolShed } from "@shared/components/construction/SiteWorld";
import { ToolBox, TrafficCone } from "@shared/components/construction/SiteMaterials";

/**
 * THE GARAGE YARD — composed from the shared construction theme and drawn
 * here exactly once: the working-day sky with its sun (`SiteSky`), the tool
 * shed standing in as the workshop, the dirt yard, and in front a stack of
 * tyres, a tool box and a cone (a fence and a container were tried: behind
 * the car they read as a barricade). Calm on purpose: NOTHING here moves (no drifting clouds),
 * so the only motion on screen is the car the child is building.
 *
 * Fix the Silly Robot stands on the same theme as plain sky and dirt; this
 * yard has its own buildings and props so the two never look alike.
 */
export const GarageWorld = memo(function GarageWorld() {
  return (
    <div className="bcg-world" aria-hidden="true">
      <SiteSky />
      <div className="bcg-yard-back">
        <ToolShed className="bcg-shed" />
      </div>
      <DirtGround className="bcg-ground" />
      <span className="bcg-tyres">
        <TyreStack />
      </span>
      <ToolBox className="bcg-toolbox" />
      <TrafficCone className="bcg-cone" />
    </div>
  );
});

/** A stack of three spare tyres — the one garage prop the theme lacks. */
export function TyreStack() {
  return (
    <svg viewBox="0 0 120 120" className="pl-art" aria-hidden="true">
      {[0, 1, 2].map((i) => {
        const y = 100 - i * 30;
        return (
          <g key={i}>
            <ellipse
              cx="60"
              cy={y}
              rx="50"
              ry="17"
              fill="#252A31"
              stroke="#16191E"
              strokeWidth="3"
            />
            <rect x="10" y={y - 16} width="100" height="16" fill="#2F3640" />
            <ellipse
              cx="60"
              cy={y - 16}
              rx="50"
              ry="17"
              fill="#3A424D"
              stroke="#1E232A"
              strokeWidth="3"
            />
            <ellipse cx="60" cy={y - 16} rx="22" ry="7.5" fill="#1B1F25" />
            <path
              d={`M22 ${y - 22} Q60 ${y - 34} 98 ${y - 22}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.18"
            />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * The car lift the car is built on — a low scissor lift: a steel platform
 * with a hazard-striped edge on yellow scissor legs, and a ramp down at the
 * front so the finished car can drive off it. The platform's top is the
 * line the car's wheels stand on (y = 0 of the viewBox, 240 wide like the
 * car). Machine yellow, because a lift is a machine.
 */
export const CarLift = memo(function CarLift() {
  const hazard = `${useId().replace(/:/g, "")}-hazard`;
  const legs = [36, 120];
  return (
    <svg viewBox="0 -2 240 34" className="bcg-lift-svg" aria-hidden="true">
      <defs>
        <pattern
          id={hazard}
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="12" fill={C.YELLOW} />
          <rect x="6" width="6" height="12" fill={C.HAZARD_INK} />
        </pattern>
      </defs>
      {/* the scissor legs */}
      {legs.map((x) => (
        <g key={x} stroke={C.YELLOW_LINE} strokeWidth="2.5" strokeLinecap="round">
          <path d={`M${x} 10 L${x + 64} 28`} stroke={C.YELLOW_DEEP} strokeWidth="5" />
          <path d={`M${x} 28 L${x + 64} 10`} stroke={C.YELLOW} strokeWidth="5" />
          <circle
            cx={x + 32}
            cy="19"
            r="3.4"
            fill={C.STEEL_DEEP}
            stroke={C.STEEL_LINE}
            strokeWidth="1.5"
          />
        </g>
      ))}
      {/* the base on the ground */}
      <rect
        x="24"
        y="27"
        width="184"
        height="5"
        rx="2"
        fill={C.STEEL_DEEP}
        stroke={C.STEEL_LINE}
        strokeWidth="1.5"
      />
      {/* the ramp down from the front of the platform */}
      <path
        d="M200 1 L238 31 L200 31 Z"
        fill={C.STEEL}
        stroke={C.STEEL_LINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* the platform: steel top, hazard edge */}
      <rect
        x="10"
        y="0"
        width="194"
        height="6"
        rx="2.5"
        fill={C.CONCRETE}
        stroke={C.STEEL_LINE}
        strokeWidth="2"
      />
      <rect
        x="10"
        y="5"
        width="194"
        height="6"
        rx="2"
        fill={`url(#${hazard})`}
        stroke={C.STEEL_LINE}
        strokeWidth="2"
      />
    </svg>
  );
});
