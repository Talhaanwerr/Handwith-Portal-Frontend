# PlayLab game development

Games live inside the Handwith Portal frontend. Kids open them from Super Admin **Library** (`/super-admin/library`). Clicking a card goes to `/play/<game-id>` (full screen, no sidebar).

This file is the source of truth for **where code, CSS, and assets go**. Ignore older comments that mention `src/games/`, `src/app/games/`, or a separate PlayLab app — those paths are gone.

---

## Paste this at the start of every Claude prompt

```
Read Handwith-Portal-Frontend/src/playlab/GAME_DEV.md (or src/playlab/GAME_DEV.md if the repo root is the frontend) and follow it before writing any code.

Stay inside PlayLab game files. Do not change portal auth, backend, next.config, global html/body CSS, or import playlab base.css.

Task: <describe the game or the change>
```

If you only have the frontend folder open, the path is `src/playlab/GAME_DEV.md`.

---

## Do not touch

- Backend (`Handwith-Portal-Backend`)
- Auth, login, cookies, API client, `proxy.ts`
- Super Admin pages other than Library wiring listed below
- `src/playlab/shared/styles/base.css` — **never import it**. It sets `html, body { overflow: hidden }` and breaks portal scroll
- `src/app/globals.css` unless you are adding a **shared PlayLab color token** that several games need (ask first)
- New npm packages (framer-motion and howler are already installed)

---

## Folders

```
Handwith-Portal-Frontend/
├── public/games/<game-id>/     ← images, photos (URL = /games/<game-id>/...)
├── public/audio/               ← shared audio files if a game needs them
└── src/
    ├── playlab/
    │   ├── GAME_DEV.md         ← this file
    │   ├── playlab.css         ← import each game's CSS here
    │   ├── shared/             ← reuse only; do not fork per game
    │   └── games/<game-id>/    ← YOUR game lives here
    ├── constants/games.ts      ← Library card list (required)
    ├── features/super-admin/library/GamePlayer.tsx  ← loader map (required)
    └── app/(play)/play/[gameId]/page.tsx            ← already dynamic; do not add a new page
```

**Aliases** (use these, not long relative paths):

| Alias         | Folder                                                 |
| ------------- | ------------------------------------------------------ |
| `@games/...`  | `src/playlab/games/...`                                |
| `@shared/...` | `src/playlab/shared/...`                               |
| `@/...`       | `src/...` (portal only; games should rarely need this) |

---

## New game checklist

Copy the shape of `src/playlab/games/magnet-match/` (clean, typical size).

`<game-id>` = kebab-case, URL-safe, unique. Example: `star-catch`. Then the play URL is `/play/star-catch`.

### 1. Game folder

Create:

```
src/playlab/games/<game-id>/
  <PascalCase>Game.tsx      ← root client component, named export
  styles/<game-id>.css
  store/...Store.ts         ← optional zustand (or local state)
  constants/
  components/
```

Root component **must**:

- start with `"use client"`
- wrap screens in `GameStage` from `@shared/components/game/GameStage`
- call `useGameSession(...)` from `@shared/hooks/useGameSession`
- send “back to library” through `PORTAL_ROUTE` from `@shared/constants/routes` (`router.push(PORTAL_ROUTE)`). Never hardcode `/super-admin/library` in random buttons
- use `framer-motion` `PAGE_TRANSITION` from `@shared/constants/transitions` like the other games

Export name examples already in the repo:

| game-id          | export                |
| ---------------- | --------------------- |
| `letter-tracing` | `LetterTracingGame`   |
| `jungle-spy`     | `JungleSpyGame`       |
| `letter-hunt`    | `LetterHuntGame`      |
| `magnet-match`   | `MagnetMatchGame`     |
| `dino-dig`       | `AlphabetDinoDigGame` |
| `feed-the-shark` | `FeedTheSharkGame`    |

### 2. CSS

- Put **all game-specific CSS** in `src/playlab/games/<game-id>/styles/<game-id>.css`
- Add one line to `src/playlab/playlab.css`:

```css
@import "./games/<game-id>/styles/<game-id>.css";
```

- Do **not** import that CSS from `globals.css` or the Super Admin layout
- Do **not** use `html` / `body` selectors
- Prefer classes scoped to the game (prefix with the game id, e.g. `.star-catch-board`)
- Shared look: Tailwind tokens already on the PlayLab `@theme` in `src/app/globals.css` (`font-rounded`, `bg-mint`, `bg-lavender`, …)

`playlab.css` is imported only by `src/app/(play)/layout.tsx`. That layout wraps the game in `.pl-shell` (full viewport, overflow hidden). Do not copy that shell into the game.

### 3. Images / audio files

| What               | Where                        | URL in code                 |
| ------------------ | ---------------------------- | --------------------------- |
| Game images        | `public/games/<game-id>/...` | `/games/<game-id>/file.png` |
| Shared audio files | `public/audio/...`           | `/audio/file.mp3`           |

Most SFX are generated in code via `@shared/audio/sfx`. Voice lines: `@shared/audio/voice` — every clip is listed in `src/playlab/shared/audio/manifest.json` and plays its MP3 from `public/audio/`. Browser speech is **off**: a clip with no recording is silent, so add and record every line before shipping. Do not invent a second audio system.

### 4. Wire it into Library (required — game will not show/load without this)

**A.** Card on `/super-admin/library` — `src/constants/games.ts`:

```ts
{
  id: "<game-id>",
  title: "Visible title",
  description: "One short line",
  glyph: "⭐",
  route: "/play/<game-id>",
  colors: { bg: "#...", border: "#...", text: "#..." },
}
```

`id` must match the folder name and the `GamePlayer` loader key.

**B.** Loader — `src/features/super-admin/library/GamePlayer.tsx`, add to `GAME_LOADERS`:

```ts
"<game-id>": () =>
  import("@games/<game-id>/<PascalCase>Game").then((m) => m.<ExportedName>),
```

Do **not** use `next/dynamic` with `ssr: false` (Next.js 16 rejects it here). Follow the existing `React.lazy` + `Suspense` map in `GamePlayer.tsx`.

**C.** Keep `src/playlab/games/registry.ts` in sync with the same `id` / title / colors. Library does **not** read this file, but it must not drift.

**D.** Card icon — add a scene to `GAME_SCENE_ICONS` in `src/playlab/shared/components/icons/GameSceneIcons.tsx` (otherwise the card falls back to the emoji `glyph`). Build it from the game's own art, and use inline `style` for any new colour: the Library page does not load `playlab.css`.

You do **not** add `src/app/play/<game-id>/page.tsx`. One dynamic route already exists: `src/app/(play)/play/[gameId]/page.tsx`.

---

## Shared code (reuse, don’t duplicate)

| Need                                            | Use                                                            |
| ----------------------------------------------- | -------------------------------------------------------------- |
| Full-screen stage + rotate prompt               | `@shared/components/game/GameStage`                            |
| Music, audio init, browser back inside the game | `@shared/hooks/useGameSession`                                 |
| Exit to Library                                 | `PORTAL_ROUTE` from `@shared/constants/routes`                 |
| Buttons, progress, stars, start options         | `@shared/components/ui/*`                                      |
| Celebration overlay / sparkles                  | `@shared/components/game/*`, `@shared/components/animations/*` |
| Click / correct / wrong SFX                     | `@shared/audio/sfx`                                            |
| Spoken clips                                    | `@shared/audio/voice`                                          |
| Shuffle / pointer helpers                       | `@shared/utils/*`                                              |

Change `src/playlab/shared/` only when **every** game should get the change. A one-game helper stays in that game’s folder.

More shared pieces the newer games are built from:

| Need                                         | Use                                                        |
| -------------------------------------------- | ---------------------------------------------------------- |
| Back / Back to Games pills                   | `NavPillButton` from `@shared/components/ui/NavPillButton` |
| Difficulty / module picker                   | `ChoiceScreen` from `@shared/components/game/ChoiceScreen` |
| Drag and drop                                | `useDragDrop` from `@shared/hooks/useDragDrop`             |
| The guide hand that shows the first move     | `TeachingHand` from `@shared/components/game/TeachingHand` |
| Mid-game cheer (dim, confetti, figure rises) | `FigureBreak` from `@shared/components/game/FigureBreak`   |
| Spoken instructions when a screen opens      | `useSayOnEnter` from `@shared/hooks/useSayOnEnter`         |
| Praise words                                 | `cheerFor(seed)` from `@shared/audio/cheers`               |
| Checking saved progress on load              | `@shared/utils/persisted` in the store's `merge`           |
| Pictures                                     | `Picture` from `@games/blend-read/components/PictureArt`   |
| Worlds                                       | `@shared/components/construction`, `arctic`, `pirate`      |

---

## Be wary of — lessons from the last games

Every point below is a bug that actually shipped or nearly shipped. Read this before building.

### Things that break silently

- **Class prefixes are global.** Every game's CSS loads on every play page. `fs-` is Feed the Shark's and `mm-` is Magnet Match's; reusing them painted another game's rules onto new boards. Grep `src/playlab` for a prefix before choosing it. Shared class names (e.g. `.dc-teacher*`) must be restated under your game's wrapper, never bare.
- **Same specificity, later rule wins.** A rule early in your file loses to a shared rule written later (e.g. `.mz-board`, `.mz-number`). If a style "does nothing", check this first; use two classes.
- **Do not use `<AnimatePresence mode="wait">` for the screen router.** A second screen change while one screen is still leaving can leave the old screen on show for good. Let screens cross-fade (no `mode`) and give the exit `pointerEvents: "none"`:
  ```ts
  const SCREEN = {
    ...PAGE_TRANSITION,
    exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
  };
  ```
- **A spring takes exactly two keyframes.** `animate={{ scale: [0.6, 1.1, 1] }}` with `type: "spring"` throws at runtime, and only when that screen opens. Use a tween for three or more keyframes.
- **Validate saved progress.** A stale saved level id crashed Blend & Seek. Every persisted store needs a `merge` that checks ids and numbers.

### Lag

- **No React render per finger move or per tap across the whole board.** 36 animated tiles re-rendering per tap cost ~2 s per tap on a slow phone. Memoise tiles, make them plain buttons, and run shakes with `el.animate(...)`.
- **Drag with `useDragDrop`**; it moves the ghost by CSS variables with no render per move. Taps must never count as drops, and a drop only counts if the thing moved.
- **Animate only `transform` and `opacity`.** Confetti animating `top` stalled win screens. No `filter` on moving things, no `will-change`.
- Known open issue: SFX are synthesised on the main thread (`shared/audio/sfx.ts`), so a win frame can still stall briefly on slow phones.

### Layout

- **Check five screens**: phone sideways 568 × 320 (the hardest), phone upright 320 × 568, a tall phone, a tablet, a desktop.
- **Size from the smaller side**, e.g. `min(100dvh - …, 100vw - …)`, and keep tap targets at 44–48 px or more on the 568 × 320 phone.
- **The pinned pills own the top corners.** Reserve ~68 px at the top; nothing tappable underneath them.
- **Move animated figures with margins or `left`/`bottom`, never a centring `transform`** — Framer overwrites it, and a photo with `mix-blend-mode` shows a white box.

### Game logic

- **Make level data check itself.** Derive answers from the data (never store them twice) and write a check that proves every level is solvable and fair — Math Maze's `checkMaze`, Sorting Food's `checkActivity`.
- **Wrong answers:** a wrong choice stays crossed out and cannot be tapped again; a right answer tapped too early only shakes.
- **No `Math.random` at render time.** Use a deterministic hash or generate content ahead of time.
- **Back goes to the game's home or picker**, not to the previous level. Use the pill navigation, never `CornerControls`' ✕ and pause.

### Audio

- **Screen text comes from `clipText(id)`**, never typed a second time; praise comes from `cheerFor()`, never a private list.
- **Object words** come from `public/audio/names/` (`name-*` clips). Candy ABC's `treats/word-*` files are mis-cut, and the alphabet `words/` files start with a letter sound.
- **Letter names** (`letters/`) and **letter sounds** (`phonics/`) are different recordings. Never alias one to the other.

### Before you call it done

1. `npx tsc --noEmit -p tsconfig.json` — an error only in `.next/dev/types/validator.ts` is dev-server noise; delete that file.
2. `npx eslint src/playlab` and `npx prettier --check "src/playlab/**/*.{ts,tsx,css}"`.
3. `npx next build`.
4. Play it end to end at all five screen sizes, including a slowed-down phone.
5. Commit the game **together with** anything it imports from other uncommitted games — the games borrow from each other, and a partial commit breaks the build.

---

## Editing an existing game

Stay in `src/playlab/games/<that-game-id>/` plus its CSS import in `playlab.css` if you add a new stylesheet (prefer one CSS file per game).

Do not restyle the Library grid unless the task is the Library card. Cards are `src/features/super-admin/library/GameCard.tsx` + `src/constants/games.ts`.

---

## How to run and open a game

From `Handwith-Portal-Frontend`:

```bash
npm run dev
```

App: `http://localhost:3007`  
Library: `http://localhost:3007/super-admin/library`  
Game: `http://localhost:3007/play/<game-id>`

Log in as super-admin first. The play route is full-screen; “exit” must go to Library via `PORTAL_ROUTE`.
