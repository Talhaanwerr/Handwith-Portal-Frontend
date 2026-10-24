"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cssVars } from "@shared/styles/cssVars";
import { useElementSize } from "@shared/hooks/useElementSize";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { playClickSound, playPickUpSound, playSnapSound, playThudSound } from "@shared/audio/sfx";
import {
  BRICK_H,
  STUD_H,
  drawOrder,
  pts,
  project,
  type Brick,
  type BrickKind,
  type View,
} from "./geometry";
import { BrickArt, LooseBrick, PlateArt, footprint } from "./BrickArt";
import { snapBuzz } from "./feel";
import {
  fits,
  isFree,
  landingAt,
  newBrickId,
  occupancy,
  type Landing,
  type Plate,
  type Spot,
} from "./world";

/**
 * BRICK ENGINE — the board every brick game plays on.
 *
 * It owns everything that makes building feel like building:
 *  • drag a brick out of the tray; over the plate it LIFTS INTO PLACE —
 *    shown hovering, already aligned to the studs, over a ghost of where it
 *    will land (green when it fits, red when it cannot) — and on release it
 *    drops the last few millimetres and clicks on;
 *  • pick a placed brick up again and move it, or drag it off the plate to
 *    take it away; a brick with another brick on top will not come out;
 *  • tap a placed brick for its two tools: turn it, take it off;
 *  • turn the whole plate (buttons, or drag the empty sky), tilt the camera
 *    between a high and a low view, zoom in and out;
 *  • tap a tray brick (no drag) and it places itself — a must for children
 *    whose hands find dragging hard.
 *
 * The games add their rules through three hooks: `snap` (where a held brick
 * must go — a tower's top, a pattern's next slot), `accept` (whether this
 * brick may go there — the right colour?) and `onPlaced`. The board stays
 * controlled: the game owns the list of bricks.
 *
 * Performance: no React render per finger move. The floating brick moves by
 * a CSS variable; the board renders only when the landing CELL changes.
 */

export interface SnapResult {
  spot: Spot;
  ok: boolean;
}

export interface BrickBoardProps {
  plate: Plate;
  bricks: readonly Brick[];
  onChange: (next: Brick[]) => void;
  tray: readonly BrickKind[];
  /** Override where a held brick lands. Return null for "not over the board". */
  /** `via` says why: a finger dragging (`free` is where it would land on
   *  its own, null off the plate), a tap on the tray, or the idle hand asking
   *  where to point. */
  snap?: (
    kind: BrickKind,
    free: Landing | null,
    bricks: readonly Brick[],
    via: "drag" | "tap" | "hand"
  ) => SnapResult | null;
  /** A last word on a drop: false sends the brick back with a soft bump. */
  accept?: (brick: Brick, bricks: readonly Brick[]) => boolean;
  onPlaced?: (brick: Brick, next: readonly Brick[]) => void;
  onRejected?: (brick: Brick) => void;
  onRemoved?: (brick: Brick) => void;
  /** Tapping a placed brick takes it off (Take Away Tower) instead of
   *  showing the turn / remove tools. */
  tapRemoves?: boolean;
  /** No tray at all — the scene takes the whole screen (Take Away Tower). */
  noTray?: boolean;
  /** A last word on taking a brick off: false keeps it on, with a bump. */
  canRemove?: (brick: Brick, bricks: readonly Brick[]) => boolean;
  /** Lift, move, turn and remove placed bricks. Default true. */
  editable?: boolean;
  /** Translucent bricks showing what to build (Build Steps). */
  hints?: readonly Brick[];
  /** Glowing outlines on the plate: "build here". */
  marks?: readonly Spot[];
  /** How many levels of height the camera must keep in frame. */
  levels?: number;
  plateColor?: string;
  /** Freeze input (during a celebration). */
  locked?: boolean;
  /** Tray index the idle hand demonstrates; omit for no hand. */
  handFrom?: number;
  /** Extra controls rendered in the tray strip (colour swatches). */
  trayExtra?: ReactNode;
  /** Draw a label over each tray brick (the colour's name, a count). */
  trayLabel?: (kind: BrickKind, i: number) => ReactNode;
  /** Shown over the scene (counters, targets). */
  children?: ReactNode;
  initialYaw?: number;
  /** Pixels at the top of the scene kept clear for the pills and HUD cards. */
  topInset?: number;
  /** For a big picture card: the strip to keep clear as a function of the
   *  scene height. Replaces topInset and its 20 % ceiling (60 % here). */
  topInsetFor?: (sceneHeight: number, sceneWidth: number) => number;
}

const PITCH_HIGH = 0.72;
const PITCH_LOW = 0.48;
const LIFT = 0.55;
const DRAG_PX = 8;

type Drag =
  | {
      mode: "brick";
      kind: BrickKind;
      /** Present when an existing brick was lifted. */
      from: Brick | null;
      trayIndex: number;
      pointerId: number;
      sx: number;
      sy: number;
      started: boolean;
    }
  | { mode: "orbit"; pointerId: number; sx: number; yaw0: number };

const spotKey = (s: Spot | null, ok: boolean) =>
  s ? `${s.x},${s.z},${s.y},${s.w},${s.d},${ok ? 1 : 0}` : "";

export const BrickBoard = memo(function BrickBoard({
  plate,
  bricks,
  onChange,
  tray,
  snap,
  accept,
  onPlaced,
  onRejected,
  onRemoved,
  tapRemoves = false,
  noTray = false,
  canRemove,
  editable = true,
  hints,
  marks,
  levels = 4,
  plateColor,
  locked = false,
  handFrom,
  trayExtra,
  trayLabel,
  children,
  initialYaw = -0.62,
  topInset = 64,
  topInsetFor,
}: BrickBoardProps) {
  const [sceneRef, size] = useElementSize<HTMLDivElement>();
  // Shadows fall on the plate only; the clip path needs a page-unique id.
  const clipId = `bk-clip-${useId().replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const heldRef = useRef<HTMLDivElement>(null);
  const trayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [yaw, setYaw] = useState(initialYaw);
  const [high, setHigh] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [turned, setTurned] = useState(false);
  const [held, setHeld] = useState<{ kind: BrickKind; fromId: string | null } | null>(null);
  const [landing, setLanding] = useState<SnapResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dropped, setDropped] = useState<{ id: string; n: number } | null>(null);
  const [bump, setBump] = useState<{ x: number; y: number; n: number } | null>(null);
  /** The ring of "click" that spreads round a brick's foot as it snaps on. */
  const [ring, setRing] = useState<{ x: number; y: number; s: number; n: number } | null>(null);

  const pitch = high ? PITCH_HIGH : PITCH_LOW;

  /* ── The camera ───────────────────────────────────────────────────── */
  // Keep room for what is built (and what the hints will build) plus a
  // little headroom, up to `levels`: the camera eases out as a build grows.
  // A number, so adding a brick at the same height re-renders nothing else.
  const top = Math.max(-1, ...bricks.map((b) => b.y), ...(hints ?? []).map((b) => b.y));
  const room = Math.min(levels, Math.max(2, top + 2.5));
  // On a short screen the HUD cards shrink, so the reserved strip does too.
  const inset = topInsetFor
    ? Math.min(topInsetFor(size.h, size.w), size.h * 0.6)
    : Math.min(topInset, size.h * 0.2);
  const view: View = useMemo(() => {
    const diag = Math.hypot(plate.w, plate.d);
    const tall = room * BRICK_H * Math.cos(pitch);
    const fitW = (size.w * 0.9) / diag;
    const fitH = ((size.h - inset) * 0.9) / (diag * Math.sin(pitch) + tall + 0.6);
    const scale = Math.max(4, Math.min(fitW, fitH) * zoom);
    return {
      yaw,
      pitch,
      scale,
      ox: size.w / 2,
      oy: inset + (size.h - inset) / 2 + (tall * scale) / 2,
      cx: plate.w / 2,
      cz: plate.d / 2,
    };
  }, [size.w, size.h, plate.w, plate.d, room, pitch, yaw, zoom, inset]);

  const viewRef = useRef(view);
  const bricksRef = useRef(bricks);
  useEffect(() => {
    viewRef.current = view;
    bricksRef.current = bricks;
  });

  // Soft contact shadows: a wide faint footprint under a tighter dark one —
  // softness without a blur filter, which re-rasterised every frame of a turn.
  const shadowMarkup = useMemo(
    () =>
      bricks
        .map(
          (b) =>
            `<polygon class="bk-shadow-wide" points="${pts(footprint(view, b, 0.22))}"/>` +
            `<polygon points="${pts(footprint(view, b, 0))}"/>`
        )
        .join(""),
    [bricks, view]
  );
  // Which studs are hidden under another brick, per brick and for the plate.
  const covers = useMemo(() => {
    const occ = occupancy(bricks);
    const per = new Map<string, string>();
    const plateCells: string[] = [];
    for (const b of bricks) {
      const list: string[] = [];
      for (let i = 0; i < b.w; i++)
        for (let j = 0; j < b.d; j++) {
          const c = `${b.x + i},${b.z + j}`;
          if (occ.has(`${c},${b.y + 1}`)) list.push(c);
          if (b.y === 0) plateCells.push(c);
        }
      per.set(b.id, list.join("|"));
    }
    return { per, plate: plateCells.sort().join("|") };
  }, [bricks]);
  const ordered = useMemo(() => drawOrder(bricks, view), [bricks, view]);
  const hintOrder = useMemo(() => (hints ? drawOrder(hints, view) : []), [hints, view]);

  const kindAt = useCallback(
    (k: BrickKind): BrickKind => (turned ? { ...k, w: k.d, d: k.w } : k),
    [turned]
  );

  /* ── Smooth quarter turns ─────────────────────────────────────────── */
  const spin = useRef<number | null>(null);
  const turnView = useCallback((dir: 1 | -1) => {
    playClickSound();
    // The selected brick's glow is a filter: drop it rather than repaint it
    // every frame of the turn.
    setSelected(null);
    if (spin.current) cancelAnimationFrame(spin.current);
    const from = viewRef.current.yaw;
    const to = from + (dir * Math.PI) / 2;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 420);
      const e = 1 - Math.pow(1 - k, 3);
      setYaw(from + (to - from) * e);
      spin.current = k < 1 ? requestAnimationFrame(step) : null;
    };
    spin.current = requestAnimationFrame(step);
  }, []);
  useEffect(() => () => (spin.current ? cancelAnimationFrame(spin.current) : undefined), []);

  /* ── Where a held brick would go ──────────────────────────────────── */
  const resolve = useCallback(
    (kind: BrickKind, px: number, py: number, skip: string | null): SnapResult | null => {
      const all = bricksRef.current;
      const rest = skip ? all.filter((b) => b.id !== skip) : all;
      const free = landingAt(viewRef.current, plate, rest, kind, px, py);
      if (snap) return snap(kind, free, rest, "drag");
      return free;
    },
    [plate, snap]
  );

  const drag = useRef<Drag | null>(null);
  const lastKey = useRef("");

  const scenePoint = (e: { clientX: number; clientY: number }) => {
    const r = sceneRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  };
  const rootPoint = (e: { clientX: number; clientY: number }) => {
    const r = rootRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  };

  const moveHeld = (e: { clientX: number; clientY: number }) => {
    const p = rootPoint(e);
    heldRef.current?.style.setProperty("--bk-hx", `${p.x}px`);
    heldRef.current?.style.setProperty("--bk-hy", `${p.y}px`);
  };

  /** The finger sits under the brick, not on it, so it never hides it. */
  const liftPx = () => Math.max(18, viewRef.current.scale * 0.9);

  const updateLanding = (
    kind: BrickKind,
    e: { clientX: number; clientY: number },
    skip: string | null
  ) => {
    const p = scenePoint(e);
    const res = resolve(kind, p.x, p.y - liftPx(), skip);
    const key = spotKey(res?.spot ?? null, res?.ok ?? false);
    if (key !== lastKey.current) {
      lastKey.current = key;
      setLanding(res);
    }
  };

  /* ── Committing a drop ────────────────────────────────────────────── */
  const commit = useCallback(
    (kind: BrickKind, res: SnapResult | null, from: Brick | null) => {
      const all = bricksRef.current;
      const rest = from ? all.filter((b) => b.id !== from.id) : all;
      if (!res || !res.ok) {
        if (from && !res) {
          // Lifted off the plate altogether: it is taken away.
          if (editable) {
            if (canRemove && !canRemove(from, all)) {
              playThudSound();
              onRejected?.(from);
              return;
            }
            onChange(rest as Brick[]);
            onRemoved?.(from);
            playPickUpSound();
          }
        } else if (res && !res.ok) {
          playThudSound();
        }
        return;
      }
      const brick: Brick = {
        id: from?.id ?? newBrickId(),
        color: kind.color,
        tag: kind.tag,
        w: res.spot.w,
        d: res.spot.d,
        x: res.spot.x,
        z: res.spot.z,
        y: res.spot.y,
      };
      if (accept && !accept(brick, rest)) {
        playThudSound();
        const p = project(
          viewRef.current,
          brick.x + brick.w / 2,
          (brick.y + 1) * BRICK_H,
          brick.z + brick.d / 2
        );
        setBump((b) => ({ x: p.x, y: p.y, n: (b?.n ?? 0) + 1 }));
        onRejected?.(brick);
        return;
      }
      const next = [...rest, brick];
      onChange(next);
      playSnapSound();
      setDropped((d) => ({ id: brick.id, n: (d?.n ?? 0) + 1 }));
      snapBuzz();
      const at = project(
        viewRef.current,
        brick.x + brick.w / 2,
        brick.y * BRICK_H,
        brick.z + brick.d / 2
      );
      setRing((r) => ({ x: at.x, y: at.y, s: Math.max(brick.w, brick.d), n: (r?.n ?? 0) + 1 }));
      onPlaced?.(brick, next);
    },
    [accept, canRemove, editable, onChange, onPlaced, onRejected, onRemoved]
  );

  /** Tap-to-place: the snap target if the game has one, otherwise the free
   *  spot nearest the middle of the plate, as low as it will go. */
  const tapPlace = useCallback(
    (kind: BrickKind) => {
      const all = bricksRef.current;
      let res: SnapResult | null = null;
      if (snap) {
        res = snap(kind, null, all, "tap");
      } else {
        const occ = occupancy(all);
        let best: Spot | null = null;
        let bestD = Infinity;
        for (let y = 0; y < 30 && !best; y++) {
          for (let x = 0; x + kind.w <= plate.w; x++) {
            for (let z = 0; z + kind.d <= plate.d; z++) {
              const s = { x, z, y, w: kind.w, d: kind.d };
              if (!fits(occ, plate, s)) continue;
              const dd = Math.hypot(x + kind.w / 2 - plate.w / 2, z + kind.d / 2 - plate.d / 2);
              if (dd < bestD) {
                bestD = dd;
                best = s;
              }
            }
          }
        }
        res = best ? { spot: best, ok: true } : null;
      }
      if (!res || !res.ok) {
        playThudSound();
        return;
      }
      commit(kind, res, null);
    },
    [commit, plate, snap]
  );

  /* ── Pointer plumbing ─────────────────────────────────────────────── */
  const endDrag = useCallback(() => {
    drag.current = null;
    lastKey.current = "";
    setHeld(null);
    setLanding(null);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      if (d.mode === "orbit") {
        setYaw(d.yaw0 + (e.clientX - d.sx) * 0.011);
        return;
      }
      if (!d.started) {
        if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < DRAG_PX) return;
        if (d.from && !isFree(bricksRef.current, d.from)) {
          // Something is resting on it: it will not come out.
          playThudSound();
          const p = project(
            viewRef.current,
            d.from.x + d.from.w / 2,
            (d.from.y + 1) * BRICK_H,
            d.from.z + d.from.d / 2
          );
          setBump((b) => ({ x: p.x, y: p.y, n: (b?.n ?? 0) + 1 }));
          drag.current = null;
          return;
        }
        d.started = true;
        playPickUpSound();
        setSelected(null);
        setHeld({ kind: d.kind, fromId: d.from?.id ?? null });
      }
      moveHeld(e);
      updateLanding(d.kind, e, d.from?.id ?? null);
    };
    const onUp = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      if (d.mode === "orbit") {
        drag.current = null;
        return;
      }
      if (!d.started) {
        // A tap, not a drag.
        drag.current = null;
        if (d.from && tapRemoves) {
          // Take it off: the same as lifting it off the plate.
          if (!isFree(bricksRef.current, d.from)) {
            playThudSound();
            const p = project(
              viewRef.current,
              d.from.x + d.from.w / 2,
              (d.from.y + 1) * BRICK_H,
              d.from.z + d.from.d / 2
            );
            setBump((b) => ({ x: p.x, y: p.y, n: (b?.n ?? 0) + 1 }));
            return;
          }
          commit(d.kind, null, d.from);
        } else if (d.from) {
          playClickSound();
          setSelected((s) => (s === d.from?.id ? null : (d.from?.id ?? null)));
        } else {
          tapPlace(d.kind);
        }
        return;
      }
      const p = scenePoint(e);
      const res = resolve(d.kind, p.x, p.y - liftPx(), d.from?.id ?? null);
      commit(d.kind, res, d.from);
      endDrag();
    };
    const onCancel = (e: PointerEvent) => {
      if (drag.current && e.pointerId === drag.current.pointerId) endDrag();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "r" || e.key === "R") && drag.current?.mode === "brick") {
        const d = drag.current;
        d.kind = { ...d.kind, w: d.kind.d, d: d.kind.w };
        setHeld((h) => (h ? { ...h, kind: d.kind } : h));
        lastKey.current = "";
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
    };
    // The handlers read live values through refs; rebinding per render is
    // only needed when the rule callbacks change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit, endDrag, resolve, tapPlace]);

  const startTray = (e: ReactPointerEvent, i: number) => {
    if (locked || drag.current) return;
    e.preventDefault();
    const kind = kindAt(tray[i]);
    drag.current = {
      mode: "brick",
      kind,
      from: null,
      trayIndex: i,
      pointerId: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      started: false,
    };
    moveHeld(e);
  };

  const startBrick = (e: ReactPointerEvent, b: Brick) => {
    if (locked || drag.current) return;
    e.stopPropagation();
    if (!editable) return;
    drag.current = {
      mode: "brick",
      kind: { w: b.w, d: b.d, color: b.color, tag: b.tag },
      from: b,
      trayIndex: -1,
      pointerId: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      started: false,
    };
    moveHeld(e);
  };

  const startOrbit = (e: ReactPointerEvent) => {
    if (drag.current) return;
    setSelected(null);
    drag.current = {
      mode: "orbit",
      pointerId: e.pointerId,
      sx: e.clientX,
      yaw0: viewRef.current.yaw,
    };
  };

  /* ── Selected-brick tools ─────────────────────────────────────────── */
  const sel = selected ? bricks.find((b) => b.id === selected) : undefined;
  const turnSelected = () => {
    if (!sel) return;
    const rest = bricks.filter((b) => b.id !== sel.id);
    const cx = sel.x + sel.w / 2;
    const cz = sel.z + sel.d / 2;
    const spot = {
      x: Math.round(cx - sel.d / 2),
      z: Math.round(cz - sel.w / 2),
      y: sel.y,
      w: sel.d,
      d: sel.w,
    };
    const blocked = !isFree(bricks, sel) || !fits(occupancy(rest), plate, spot);
    if (blocked) {
      playThudSound();
      return;
    }
    const turnedBrick = { ...sel, ...spot };
    if (accept && !accept(turnedBrick, rest)) {
      playThudSound();
      return;
    }
    onChange([...rest, turnedBrick]);
    playSnapSound();
    setDropped((d) => ({ id: sel.id, n: (d?.n ?? 0) + 1 }));
  };
  const removeSelected = () => {
    if (!sel) return;
    if (!isFree(bricks, sel)) {
      playThudSound();
      return;
    }
    onChange(bricks.filter((b) => b.id !== sel.id));
    onRemoved?.(sel);
    playClickSound();
    setSelected(null);
  };
  const selAt = sel
    ? project(view, sel.x + sel.w / 2, (sel.y + 1) * BRICK_H + STUD_H, sel.z + sel.d / 2)
    : null;

  /* ── The idle hand: tray brick → where it goes ────────────────────── */
  const idle = useIdleHand(!locked && !held && handFrom !== undefined, bricks.length);
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  // Measured after paint, from the tray button and the target's place on screen.
  useEffect(() => {
    if (!idle || handFrom === undefined || !tray[handFrom]) return;
    const raf = requestAnimationFrame(() => {
      const btn = trayRefs.current[handFrom];
      const root = rootRef.current?.getBoundingClientRect();
      const scene = sceneRef.current?.getBoundingClientRect();
      const target = snap?.(kindAt(tray[handFrom]), null, bricksRef.current, "hand");
      if (!btn || !root || !scene || !target) return;
      const br = btn.getBoundingClientRect();
      const t = project(
        viewRef.current,
        target.spot.x + target.spot.w / 2,
        (target.spot.y + 1) * BRICK_H,
        target.spot.z + target.spot.d / 2
      );
      setHand({
        fx: br.left + br.width / 2 - root.left,
        fy: br.top + br.height / 2 - root.top,
        tx: t.x + scene.left - root.left,
        ty: t.y + scene.top - root.top,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [idle, handFrom, tray, snap, kindAt, sceneRef]);

  const liftH = LIFT * BRICK_H * Math.cos(view.pitch) * view.scale;
  const floating = held && !(landing && landing.ok);

  return (
    <div ref={rootRef} className={`bk-board ${locked ? "bk-board--locked" : ""}`}>
      <div ref={sceneRef} className="bk-scene" onPointerDown={startOrbit}>
        <svg
          className="bk-svg"
          viewBox={`0 0 ${Math.max(1, size.w)} ${Math.max(1, size.h)}`}
          aria-label="Building plate"
          role="img"
        >
          <PlateArt w={plate.w} d={plate.d} view={view} color={plateColor} covered={covers.plate} />

          {/* Soft shadows under every brick, one blur for all of them. */}
          <clipPath id={clipId}>
            <polygon
              points={pts([
                project(view, 0, 0, 0),
                project(view, plate.w, 0, 0),
                project(view, plate.w, 0, plate.d),
                project(view, 0, 0, plate.d),
              ])}
            />
          </clipPath>
          <g
            className="bk-shadows"
            clipPath={`url(#${clipId})`}
            dangerouslySetInnerHTML={{ __html: shadowMarkup }}
          />

          {marks?.map((m, i) => {
            const h = m.y * BRICK_H + 0.02;
            const corners = [
              project(view, m.x, h, m.z),
              project(view, m.x + m.w, h, m.z),
              project(view, m.x + m.w, h, m.z + m.d),
              project(view, m.x, h, m.z + m.d),
            ];
            return <polygon key={`m${i}`} points={pts(corners)} className="bk-mark" />;
          })}

          {ordered.map((b) => (
            <g
              key={b.id}
              className={`bk-brick ${b.id === selected ? "bk-brick--selected" : ""} ${
                held?.fromId === b.id ? "bk-brick--lifted" : ""
              } ${dropped?.id === b.id ? `bk-drop bk-drop--${dropped.n % 2}` : ""}`}
              style={cssVars({ "--bk-lift": `${-liftH}px` })}
              onPointerDown={(e) => startBrick(e, b)}
            >
              <BrickArt brick={b} view={view} covered={covers.per.get(b.id)} />
            </g>
          ))}

          {hintOrder.map((b) => (
            <BrickArt key={`h-${b.id}`} brick={b} view={view} tone="hint" />
          ))}

          {landing && held && (
            <g className="bk-landing">
              <BrickArt
                brick={{ ...landing.spot, color: held.kind.color }}
                view={view}
                tone={landing.ok ? "ghost-ok" : "ghost-bad"}
              />
              {landing.ok && (
                <g className="bk-hover">
                  <BrickArt
                    brick={{ ...landing.spot, color: held.kind.color, tag: held.kind.tag }}
                    view={view}
                    lift={LIFT * BRICK_H}
                  />
                </g>
              )}
            </g>
          )}

          {ring && (
            <ellipse
              key={`ring${ring.n}`}
              className="bk-snapring"
              cx={ring.x}
              cy={ring.y}
              rx={view.scale * ring.s * 0.75}
              ry={view.scale * ring.s * 0.75 * Math.sin(view.pitch)}
            />
          )}
          {bump && (
            <ellipse
              key={`bump${bump.n}`}
              className="bk-bump"
              cx={bump.x}
              cy={bump.y}
              rx={view.scale * 1.2}
              ry={view.scale * 1.2 * Math.sin(view.pitch)}
            />
          )}
        </svg>
        <div className="bk-overlay" onPointerDown={(e) => e.stopPropagation()}>
          {children}
        </div>

        {sel && selAt && !held && (
          <div
            className="bk-tools"
            style={cssVars({ "--bk-tx": `${selAt.x}px`, "--bk-ty": `${selAt.y}px` })}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button className="bk-tool" onClick={turnSelected} aria-label="Turn this brick">
              <TurnIcon />
            </button>
            <button
              className="bk-tool bk-tool--off"
              onClick={removeSelected}
              aria-label="Take this brick off"
            >
              <OffIcon />
            </button>
          </div>
        )}

        <div className="bk-cam" onPointerDown={(e) => e.stopPropagation()}>
          <button
            className="bk-cam-btn"
            onClick={() => turnView(1)}
            aria-label="Turn the plate left"
          >
            <ArrowIcon flip={false} />
          </button>
          <button
            className="bk-cam-btn"
            onClick={() => turnView(-1)}
            aria-label="Turn the plate right"
          >
            <ArrowIcon flip />
          </button>
          <button
            className="bk-cam-btn"
            onClick={() => {
              playClickSound();
              setHigh((h) => !h);
            }}
            aria-label={high ? "Look from lower down" : "Look from higher up"}
          >
            <EyeIcon high={high} />
          </button>
          <button
            className="bk-cam-btn"
            onClick={() => {
              playClickSound();
              setZoom((z) => (z >= 1.3 ? 0.85 : z + 0.225));
            }}
            aria-label="Zoom"
          >
            <ZoomIcon />
          </button>
        </div>
      </div>

      {!noTray && (
        <div className="bk-tray" onPointerDown={(e) => e.stopPropagation()}>
          <button
            className={`bk-tray-turn ${turned ? "bk-tray-turn--on" : ""}`}
            onClick={() => {
              playClickSound();
              setTurned((t) => !t);
            }}
            aria-label="Turn the tray bricks"
          >
            <TurnIcon />
          </button>
          {trayExtra}
          <div className="bk-tray-row">
            {tray.map((k, i) => {
              const kk = kindAt(k);
              return (
                <button
                  key={`${k.w}x${k.d}-${k.color}-${i}`}
                  ref={(el) => {
                    trayRefs.current[i] = el;
                  }}
                  className={`bk-tray-item ${kk.color === "white" ? "bk-tray-item--white" : ""}`}
                  onPointerDown={(e) => startTray(e, i)}
                  aria-label={
                    k.tag ? `Letter ${k.tag} brick` : `${k.color} brick, ${k.w} by ${k.d}`
                  }
                >
                  <LooseBrick w={kk.w} d={kk.d} color={kk.color} tag={kk.tag} size={96} />
                  {trayLabel?.(k, i)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        ref={heldRef}
        className={`bk-held ${floating ? "" : "bk-held--hidden"}`}
        style={cssVars({
          "--bk-hs": `${held ? Math.max(held.kind.w, held.kind.d, 2) * 1.5 * view.scale : 0}px`,
        })}
      >
        {held && (
          <LooseBrick
            w={held.kind.w}
            d={held.kind.d}
            color={held.kind.color}
            tag={held.kind.tag}
            size={Math.round(Math.max(held.kind.w, held.kind.d, 2) * 1.5 * view.scale)}
            yaw={view.yaw}
            pitch={view.pitch}
          />
        )}
      </div>

      {idle && hand && <TeachingHand {...hand} />}
    </div>
  );
});

/* ── Icons ─────────────────────────────────────────────────────────── */

function TurnIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M19 12a7 7 0 1 1-2.05-4.95"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M19.5 3.5v4.5H15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function OffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M6 7h12M9.5 7V5h5v2M8 7l.8 12h6.4L16 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ArrowIcon({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      className={flip ? "bk-flip" : undefined}
    >
      <path
        d="M5 13.5c2.2-4.6 9.8-6 14 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M4 8.5l1 5.2 5-1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function EyeIcon({ high }: { high: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d={high ? "M3 16l9-9 9 9" : "M3 12h18"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy={high ? 7 : 12} r="2.6" fill="currentColor" />
    </svg>
  );
}
function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path
        d="M15 15l5 5M10.5 8v5M8 10.5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
