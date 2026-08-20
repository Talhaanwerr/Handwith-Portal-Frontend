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

Most SFX are generated in code via `@shared/audio/sfx` (`playClickSound`, `playCorrectSound`, …). Voice lines: `@shared/audio/voice`. Do not invent a second audio system.

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
