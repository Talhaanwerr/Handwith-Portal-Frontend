import { BRICK_H, drawOrder, type Brick, type View } from "@games/brick-lab/engine/geometry";
import { BrickArt, BrickDefs, PlateArt } from "@games/brick-lab/engine/BrickArt";
import {
  HERO_HOUSE,
  HERO_PATTERN,
  HERO_SPELL,
  HERO_TOWER,
  STEP_MODELS,
} from "@games/brick-lab/constants/models";

/**
 * The Library cards for the five brick games — each its own model, drawn by
 * the same renderer the games use. Inline SVG and its own gradient ids: the
 * Library page does not load playlab.css or the game's shared gradients.
 */
function IconScene({
  bricks,
  plate,
  sky,
  plateColor,
}: {
  bricks: readonly Brick[];
  plate: { w: number; d: number };
  sky: [string, string];
  plateColor: string;
}) {
  const size = 100;
  const pitch = 0.62;
  const lv = Math.max(2, ...bricks.map((b) => b.y + 1));
  const diag = Math.hypot(plate.w, plate.d);
  const tall = lv * BRICK_H * Math.cos(pitch);
  const scale = Math.min(
    (size * 0.9) / diag,
    (size * 0.84) / (diag * Math.sin(pitch) + tall + 0.6)
  );
  const view: View = {
    yaw: -0.62,
    pitch,
    scale,
    ox: size / 2,
    oy: size / 2 + (tall * scale) / 2 + 4,
    cx: plate.w / 2,
    cz: plate.d / 2,
  };
  const id = `bki-${sky[0].slice(1)}`;
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <BrickDefs id={id} />
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky[0]} />
            <stop offset="1" stopColor={sky[1]} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${id}-sky)`} />
        <ellipse cx="50" cy="80" rx="46" ry="12" fill="#000" opacity="0.08" />
        <PlateArt w={plate.w} d={plate.d} view={view} color={plateColor} defs={id} />
        {drawOrder(bricks, view).map((b) => {
          return (
            <g key={b.id}>
              <BrickArt brick={b} view={view} defs={id} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const PLATE = { w: 8, d: 6 };

export function BrickLabIcon() {
  return (
    <IconScene
      bricks={HERO_HOUSE}
      plate={PLATE}
      sky={["#FFF4D6", "#FFD9A8"]}
      plateColor="#4CB04F"
    />
  );
}
/** Sort & Count: two sorted colour stacks beside a number tower. */
const COUNT_SORT: Brick[] = [
  { id: "r1", x: 1, z: 1, y: 0, w: 2, d: 2, color: "red" },
  { id: "r2", x: 1, z: 1, y: 1, w: 2, d: 2, color: "red" },
  { id: "b1", x: 1, z: 3, y: 0, w: 2, d: 2, color: "blue" },
  ...HERO_TOWER.map((b) => ({ ...b, x: 5, z: 2 })),
];
export function BrickCountSortIcon() {
  return (
    <IconScene
      bricks={COUNT_SORT}
      plate={PLATE}
      sky={["#E7F0FF", "#BCD3F5"]}
      plateColor="#8494A8"
    />
  );
}
export function BrickBuildStepsIcon() {
  const robot = STEP_MODELS.find((m) => m.id === "robot");
  return (
    <IconScene
      bricks={robot?.steps ?? HERO_HOUSE}
      plate={robot?.plate ?? PLATE}
      sky={["#F2ECFF", "#D7C8F7"]}
      plateColor="#8FC9EA"
    />
  );
}
export function BrickPatternWallIcon() {
  return (
    <IconScene
      bricks={HERO_PATTERN}
      plate={PLATE}
      sky={["#FFF8E1", "#FFE29A"]}
      plateColor="#F3C85A"
    />
  );
}
export function BrickSpellWordsIcon() {
  return (
    <IconScene
      bricks={HERO_SPELL}
      plate={PLATE}
      sky={["#FFEFF5", "#FFD0E0"]}
      plateColor="#F6E7C8"
    />
  );
}

const LETTERS: Brick[] = [
  { id: "f1", x: 1, z: 2, y: 0, w: 2, d: 2, color: "red", tag: "b" },
  { id: "f2", x: 3, z: 2, y: 0, w: 2, d: 2, color: "green", tag: "s" },
  { id: "f3", x: 5, z: 2, y: 0, w: 2, d: 2, color: "blue", tag: "c" },
];
export function BrickFirstSoundIcon() {
  return (
    <IconScene bricks={LETTERS} plate={PLATE} sky={["#EAF7EC", "#BFE3C4"]} plateColor="#BFE3C4" />
  );
}
const ABC: Brick[] = ["A", "B", "C"].map((l, i) => ({
  id: `a${i}`,
  x: 3,
  z: 2,
  y: i,
  w: 2,
  d: 2,
  color: (["red", "blue", "green"] as const)[i],
  tag: l,
}));
export function BrickAbcTowerIcon() {
  return <IconScene bricks={ABC} plate={PLATE} sky={["#F1ECFF", "#D7C8F7"]} plateColor="#C9B6F2" />;
}

/** Plus Tower: a red two and a blue one, stacked into three. */
const PLUS: Brick[] = [
  { id: "p1", x: 3, z: 2, y: 0, w: 2, d: 2, color: "red", tag: "1" },
  { id: "p2", x: 3, z: 2, y: 1, w: 2, d: 2, color: "red", tag: "2" },
  { id: "p3", x: 3, z: 2, y: 2, w: 2, d: 2, color: "blue", tag: "3" },
];
export function BrickPlusTowerIcon() {
  return (
    <IconScene bricks={PLUS} plate={PLATE} sky={["#FFF6DA", "#FFE29A"]} plateColor="#F3C85A" />
  );
}
