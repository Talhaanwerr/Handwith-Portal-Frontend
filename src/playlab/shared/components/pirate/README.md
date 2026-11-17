# Pirate World — shared theme

Reusable visual foundation for pirate-themed games. **No gameplay lives here.**

## What exists

Only the pieces a game uses are kept (unused art was removed on 16 Nov 2026; it is in git history if a new game needs it).

| Piece          | File                     | Exports                                                                          |
| -------------- | ------------------------ | -------------------------------------------------------------------------------- |
| Ship (hero)    | `PirateShip.tsx`         | `PirateShip` (`bob?`), `AnchorShape` (raw geometry)                              |
| Flag           | `PirateFlag.tsx`         | `PirateFlag` (`flutter?`), `PirateFlagMotif` (cloth only — the ship mounts this) |
| Ocean & island | `PirateOcean.tsx`        | `PirateOcean` (`drift?`), `IslandMound`, `PalmTree`                              |
| Treasure       | `PirateTreasure.tsx`     | `TreasureChest` (`state: closed\|open`), `GoldCoin`                              |
| Parrot         | `PirateMapAndParrot.tsx` | `PirateParrot` (`mood: idle\|happy\|celebrating`)                                |
| Nautical props | `PirateNautical.tsx`     | `TreasureGem`                                                                    |
| Art palette    | `palette.ts`             | `P` — every illustration colour                                                  |

## UI treatment

- Surfaces & scoped paint: `shared/styles/pirate.css` — `pp-panel-wood`, `pp-panel-parchment`, `pp-trim-gold`, `pp-pill`, `pp-progress-fill`; put `pp-world` on a screen root to paint the shared case plates.
- `NavPillButton` accepts `tone="pirate"`.

## Rules

- Size the **wrapper**, never the SVG (`pp-art` fills its parent).
- Celebration = the existing shared `Confetti` + sparkle canvas next to an open `TreasureChest`. **No new particle systems.**
- Stillness is the default: `bob`/`flutter`/`drift` are opt-in, one moving thing per scene.
- Illustration colours come from `palette.ts` only; UI chrome from `pirate.css` only.
