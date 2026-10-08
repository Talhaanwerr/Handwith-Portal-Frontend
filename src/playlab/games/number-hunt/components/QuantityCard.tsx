"use client";

import { memo } from "react";
import { Item } from "@games/door-count/components/DoorArt";
import { DotFace } from "@games/pond-numbers/components/PondArt";
import { GroupFace } from "@games/number-groups/components/GroupFace";
import { DOT_PURPLE, type GroupLook } from "@games/number-hunt/constants/rounds";

/**
 * A QUANTITY CARD — a white card with a group on it, laid out as the face of
 * a die, so a count also reads as a shape: Key Quest's chunky books and
 * balls in the first rounds, Pond Numbers' dot card (in purple) after.
 * Group Boxes' pieces, and its home-card miniature.
 */
export const QuantityCard = memo(function QuantityCard({
  look,
  count,
}: {
  look: GroupLook;
  count: number;
}) {
  if (look === "dots")
    return (
      <span className="nh-qcard nh-qcard--dots">
        <DotFace count={count} color={DOT_PURPLE} />
      </span>
    );
  return (
    <span className="nh-qcard">
      <span className="nh-qcard-face">
        <GroupFace count={count} art={<Item theme={look} />} />
      </span>
    </span>
  );
});
