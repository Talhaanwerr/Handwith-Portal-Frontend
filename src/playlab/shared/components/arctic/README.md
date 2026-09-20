# Arctic World — shared theme

Reusable visual foundation for arctic/ice-themed games. **No gameplay lives here.**
Second consumer of the shared-theme architecture the Pirate World established.

## What exists

| Piece       | File                | Exports                                                                                                                                                                                                                                               |
| ----------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sky system  | `ArcticSky.tsx`     | `ArcticSky` (`moon?`), `ArcticAurora` (`shimmer?`), `ArcticCloud`, `Snowfall` (`count?`)                                                                                                                                                              |
| Land & ice  | `ArcticLand.tsx`    | `SnowGround`, `Iceberg` (`variant: tall\|flat\|jagged\|round`), `IceCliff`, `FrozenLake` (`cracked?`), `FloatingIce`, `SnowMound`, `ArcticRock` (`variant: flat\|jagged\|buried`), `Icicles`, `IceCrystal` (`cluster?`), `Igloo` (`glow?`), `IceCave` |
| Animals     | `ArcticAnimals.tsx` | `PolarBear` (`pose: standing\|sitting\|waving`, `cub?`), `Penguin` (`pose: standing\|sliding\|chick`), `ArcticFox` (`pose: sitting\|curled`), `ArcticSeal` (`pup?`)                                                                                   |
| More life   | `ArcticLife.tsx`    | `SnowyOwl`, `Narwhal`, `ArcticHare`, `OrcaFin`, `WhaleTail`, `Footprints` (`kind: penguin\|bear\|boots`)                                                                                                                                              |
| Camp        | `ArcticCamp.tsx`    | `ArcticTent` (`glow?`), `Campfire` (`lit?`, `flicker?`), `ArcticSled`, `Snowman`, `ArcticPine` (`small?`)                                                                                                                                             |
| Art palette | `palette.ts`        | `A` — every illustration colour (art direction, per tokens.ts rule)                                                                                                                                                                                   |

## Deliberate REUSE, not redrawn

The expedition kit already exists in `shared/components/pirate/` — wood-and-brass
belongs to both worlds. Reach for: `PirateCompass`, `TreasureMap`, `RopeCoil`,
`PirateLantern`, `WoodenSign`, `PirateBarrel` (as a supply crate). Sled and camp
wood use the SAME wood colours. Celebration = the shared `Confetti` + sparkle
canvas, as everywhere.

## UI treatment

- Chrome tokens: the `arctic` family in `shared/styles/tokens.ts` → `bg-arctic-*` + `text-arctic-ink` etc.
- Surfaces & scoped paint: `shared/styles/arctic.css` — `ac-panel-frost`, `ac-panel-ice`, `ac-trim-ice`, `ac-pill`, `ac-progress-fill`; put `ac-world` on a screen root to paint the shared case plates. Paint uses LITERAL hexes (the pirate lesson: paint never depends on the token-var pipeline).
- `NavPillButton` accepts `tone="arctic"`.

## Rules

- Size the **wrapper**, never the SVG (`pl-art` fills its parent; the shared class lives in utilities.css).
- Stillness is the default: `shimmer`/`flicker` are opt-in; `Snowfall` is the theme's one ambient layer — use it alone.
- Variant props over duplicate files: a shoreline of `Iceberg`s with mixed `variant`s never looks copy-pasted.
- Warmth (glow, fire, scarf, wood) appears ONLY at human things — that contrast is the coziness.
- Illustration colours from `palette.ts` only; UI chrome from `arctic.css`/tokens only.
