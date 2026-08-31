# Construction Site — shared theme

Reusable visual foundation for construction-themed games. **No gameplay lives
here.** Third consumer of the shared-theme architecture (pirate → arctic → this).

## What exists

| Piece              | File                | Exports                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Machines           | `SiteVehicles.tsx`  | `Excavator` (`pose: digging\|raised\|parked`, `facing`, `working?`), `DumpTruck` (`bed: down\|tipping`, `loaded?`, `facing`), `Bulldozer` (`blade: down\|raised`, `facing`), `TowerCrane` (`load: none\|block\|beam`, `hookDrop`, `swing?`), `MixerTruck`, `RoadRoller`                                                                                                                      |
| World & structures | `SiteWorld.tsx`     | `SiteSky`, `DirtGround`, `TrackMarks` (`turning?`), `SiteHole`, `HouseBuild` (`stage: 1..4` — foundation → walls → roof frame → roofed), `Scaffolding` (`ladder?`), `SiteLadder`, `SiteFence`, `ShippingContainer`, `ToolShed`                                                                                                                                                               |
| Materials & safety | `SiteMaterials.tsx` | `BrickStack` (`rows: 1..4`), `BlockStack` (`count: 1..3`), `PlankStack`, `PipeStack`, `CementBags`, `MaterialPile` (`kind: dirt\|sand\|gravel`), `TrafficCone`, `Barricade`, `SiteSign` (`kind: dig\|hardhat\|slow\|crane` — symbols, no text), `WarningTape`, `SiteLight` (`blink?`), `ToolBox`, `SiteHammer`, `SiteWrench`, `SiteShovel`, `Wheelbarrow` (`loaded?`), `Blueprint` (`open?`) |
| Crew               | `SiteCrew.tsx`      | `SiteWorker` (`pose: standing\|thumbsup\|blueprint\|carrying` — always hard-hatted and vested), `HardHat`                                                                                                                                                                                                                                                                                    |
| Art palette        | `palette.ts`        | `C` — every illustration colour (art direction, per tokens.ts rule)                                                                                                                                                                                                                                                                                                                          |

## Deliberate REUSE, not redrawn

- **Clouds**: `ArcticCloud` from `shared/components/arctic/` — clouds are clouds.
- **Wooden crates, barrels, rope coils, lantern, wooden sign**: the pirate set
  (`shared/components/pirate/`) — wood-and-brass belongs to every world, and
  the wood colours are the SAME family across all three themes.
- **Celebration**: the shared `Confetti` + `CelebrationOverlay`, as everywhere.

## UI treatment

- Chrome tokens: the `builder` family in `shared/styles/tokens.ts`.
- Surfaces & scoped paint: `shared/styles/construction.css` — `ct-panel-steel`,
  `ct-panel-paper` (blueprint-paper reading surface), `ct-trim-hazard`,
  `ct-pill`, `ct-progress-fill` (dirt → machine yellow); put `ct-world` on a
  screen root to paint the shared case plates. Paint is LITERAL hexes plus
  utility fallbacks (`text-builder-ink` etc.) per the never-depend-on-the-
  token-pipeline policy.
- `NavPillButton` accepts `tone="builder"`.

## Rules

- **Machine yellow belongs ONLY to machines** — that exclusivity is what makes
  them instantly recognisable. Safety orange marks the "careful here" layer.
- Size the **wrapper**, never the SVG (`pl-art`).
- Stillness is the default: `working`/`swing`/`blink` are opt-in, one moving
  machine per scene at most.
- Variant props over duplicate files: poses, stages, counts, kinds and
  `facing` mirrors — never a second copy of a vehicle.
- Strong silhouettes, outlines as darker shades of their fill, never black.
- Illustration colours from `palette.ts` only; UI chrome from
  `construction.css`/tokens only.
