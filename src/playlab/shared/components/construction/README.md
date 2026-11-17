# Construction Site — shared theme

Reusable visual foundation for construction-themed games. **No gameplay lives
here.** Third consumer of the shared-theme architecture (pirate → arctic → this).

## What exists

Only the pieces a game uses are kept (unused art was removed on 16 Nov 2026; it is in git history if a new game needs it).

| Piece              | File                | Exports                                                                                                                             |
| ------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Machines           | `SiteVehicles.tsx`  | `Excavator` (`pose: digging\|raised\|parked`, `facing`, `working?`), `TowerCrane` (`load: none\|block\|beam`, `hookDrop`, `swing?`) |
| World & structures | `SiteWorld.tsx`     | `SiteSky`, `DirtGround`, `HouseBuild` (`stage: 1..4`), `Scaffolding` (`ladder?`), `ToolShed`                                        |
| Materials & safety | `SiteMaterials.tsx` | `BrickStack` (`rows: 1..4`), `TrafficCone`, `ToolBox`                                                                               |
| Crew               | `SiteCrew.tsx`      | `SiteWorker` (`pose: standing\|thumbsup\|blueprint\|carrying` — always hard-hatted and vested)                                      |
| Art palette        | `palette.ts`        | `C` — every illustration colour                                                                                                     |

## Deliberate REUSE, not redrawn

- **Clouds**: `ArcticCloud` from `shared/components/arctic/` — clouds are clouds.
- **Wooden crates, barrels, rope coils, lantern, wooden sign**: the pirate set
  (`shared/components/pirate/`) — wood-and-brass belongs to every world, and
  the wood colours are the SAME family across all three themes.
- **Celebration**: the shared `Confetti` + `CelebrationOverlay`, as everywhere.

## UI treatment

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
