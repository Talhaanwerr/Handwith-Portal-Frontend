# Pirate World — shared theme

Reusable visual foundation for pirate-themed games. **No gameplay lives here.**

## What exists

| Piece          | File                     | Exports                                                                                                                                                                 |
| -------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ship (hero)    | `PirateShip.tsx`         | `PirateShip` (`bob?`), `AnchorShape` (raw geometry)                                                                                                                     |
| Flag           | `PirateFlag.tsx`         | `PirateFlag` (`flutter?`), `PirateFlagMotif` (cloth only — the ship mounts this)                                                                                        |
| Ocean & island | `PirateOcean.tsx`        | `PirateOcean` (`drift?`), `IslandMound`, `PalmTree`, `ShoreRocks`, `Seashells`                                                                                          |
| Treasure       | `PirateTreasure.tsx`     | `TreasureChest` (`state: closed\|open`), `GoldCoin`, `CoinStack`, `CoinPile`                                                                                            |
| Map & parrot   | `PirateMapAndParrot.tsx` | `TreasureMap`, `PirateParrot` (`mood: idle\|happy\|celebrating`)                                                                                                        |
| Nautical props | `PirateNautical.tsx`     | `PirateCompass`, `PirateSpyglass`, `PirateHelm`, `PirateAnchor`, `PirateBarrel` (`stacked?`), `RopeCoil`, `PirateLantern`, `WoodenSign`, `MessageBottle`, `TreasureGem` |
| Art palette    | `palette.ts`             | `P` — every illustration colour (art direction, per tokens.ts rule)                                                                                                     |

## UI treatment

- Chrome tokens: the `pirate` family in `shared/styles/tokens.ts` → `bg-pirate-*` utilities + `var(--color-pirate-*)`.
- Surfaces & scoped paint: `shared/styles/pirate.css` — `pp-panel-wood`, `pp-panel-parchment`, `pp-trim-gold`, `pp-pill`, `pp-progress-fill`; put `pp-world` on a screen root to paint the shared case plates.
- `NavPillButton` accepts `tone="pirate"`.

## Rules

- Size the **wrapper**, never the SVG (`pp-art` fills its parent).
- Celebration = the existing shared `Confetti` + sparkle canvas next to an open `TreasureChest`. **No new particle systems.**
- Stillness is the default: `bob`/`flutter`/`drift` are opt-in, one moving thing per scene.
- Illustration colours come from `palette.ts` only; UI chrome from the `pirate` tokens only.
