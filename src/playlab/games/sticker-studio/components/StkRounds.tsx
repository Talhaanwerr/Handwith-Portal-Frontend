"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { playClickSound, playPickUpSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { cssVars } from "@shared/styles/cssVars";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { usePlayPage } from "@games/number-groups/components/usePlayPage";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { usePageHand } from "@games/word-lesson/components/usePage";
import { LessonWorld } from "@games/word-lesson/components/LessonWorld";
import { RymWorld } from "@games/rhyme-match/components/RymWorld";
import { RrkWorld } from "@games/rhyme-rocket/components/RrkWorld";
import { RyhWorld } from "@games/rhyme-families/components/RyhWorld";
import { RynWorld } from "@games/rhyme-or-not/components/RynWorld";
import {
  ASKED,
  FREE,
  IN,
  LESSONS,
  MAX_STICKERS,
  PUT,
  TRY,
  picOf,
  pictureOf,
  savePicture,
  sayOf,
  type ModuleId,
  type Placed,
} from "@games/sticker-studio/constants/rounds";

const ENTER = { type: "spring", stiffness: 240, damping: 17 } as const;

/** Each lesson's scene: a world another game already draws. */
export function StkWorld({ id }: { id: ModuleId }): ReactNode {
  switch (id) {
    case "garden":
      return <RymWorld />;
    case "space":
      return <RrkWorld />;
    case "farm":
      return <LessonWorld scene="barn" />;
    case "park":
      return <LessonWorld scene="park" />;
    case "street":
      return <RyhWorld />;
    default:
      return <RynWorld />;
  }
}

/** A sticker's picture. */
function Pic({ sticker }: { sticker: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={picOf(sticker)} alt="" className="stk-pic" draggable={false} />;
}

/** The stickers offered on an asked page: the asked one and two others, the
 *  asked one in a place that changes from page to page. */
function trayFor(stickers: readonly string[], round: number): string[] {
  const out = [stickers[round], stickers[(round + 2) % 6], stickers[(round + 4) % 6]];
  for (let k = 0; k < round % 3; k++) out.push(out.shift() as string);
  return out;
}

/**
 * A page of picture-making. On an ASKED page one sticker is named and must be
 * dragged onto the scene (anywhere); on the FREE page any sticker can be
 * added, as many times as the child likes, and Done finishes the picture.
 * Tapping a sticker says its name. Nothing is ever wrong on the free page.
 */
function StickerPage(props: RoundProps & { id: ModuleId }) {
  const { id, round } = props;
  const lesson = LESSONS[id];
  const free = round >= ASKED;
  const asked = free ? null : lesson.stickers[round];
  const tray = useMemo(
    () => (free ? [...lesson.stickers] : trayFor(lesson.stickers, round)),
    [free, lesson.stickers, round]
  );
  const [picture, setPicture] = useState<Placed[]>(() => pictureOf(id, round));
  const pictureRef = useRef(picture);
  const [added, setAdded] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const trayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<string, HTMLElement>());
  const cast = useMemo(
    () =>
      lesson.stickers.slice(0, 3).map((s) => (
        <span key={s} className="ng-cast">
          <Pic sticker={s} />
        </span>
      )),
    [lesson.stickers]
  );
  const [intro] = useState(() => (asked ? [PUT, sayOf(asked), IN] : [FREE]));
  const p = usePlayPage({ ...props, intro, cast });

  const { dragging, over, start, ghostRef } = useDragDrop<number, string>({
    root: p.stageRef,
    targets,
    slopPx: 24,
    onDrop: (k, target, info) => {
      if (p.isSolved()) return;
      p.act();
      const sticker = tray[k];
      if (!info.moved) {
        void playClip(sayOf(sticker));
        return;
      }
      const root = p.stageRef.current;
      const canvas = canvasRef.current;
      if (target === null || !root || !canvas) {
        slideBack(root, trayRefs.current[k], info);
        return;
      }
      if (asked && sticker !== asked) {
        slideBack(root, trayRefs.current[k], info);
        p.miss();
        void playClip(TRY);
        return;
      }
      if (pictureRef.current.length >= MAX_STICKERS) return;
      // where the finger let go, as a fraction of the scene
      const a = root.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      const x = Math.min(0.94, Math.max(0.06, (info.x - (c.left - a.left)) / c.width));
      const y = Math.min(0.9, Math.max(0.1, (info.y - (c.top - a.top)) / c.height));
      const next = [...pictureRef.current, { sticker, x, y }];
      pictureRef.current = next;
      savePicture(id, next);
      setPicture(next);
      setAdded((n) => n + 1);
      playStarPop();
      void playClip(sayOf(sticker));
      if (asked) {
        p.burst(canvas);
        p.finish(canvas);
      }
    },
  });
  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, k: number) => {
      if (p.isSolved()) return;
      p.act();
      if (start(e, k)) playPickUpSound();
    },
    [p, start]
  );
  const registerCanvas = useCallback((el: HTMLDivElement | null) => {
    canvasRef.current = el;
    if (el) targets.current.set("canvas", el);
    else targets.current.delete("canvas");
  }, []);
  const finishPicture = useCallback(() => {
    if (p.isSolved()) return;
    p.act();
    playClickSound();
    p.burst(doneRef.current);
    p.finish(canvasRef.current);
  }, [p]);

  const from = useCallback(() => trayRefs.current[asked ? tray.indexOf(asked) : 0], [asked, tray]);
  const to = useCallback(() => canvasRef.current, []);
  const hand = usePageHand({
    armed: p.ready && !p.solved && dragging === null && (asked !== null || added === 0),
    resetKey: `stk-${added}`,
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from,
    to,
  });

  const say = asked
    ? `${clipText(PUT)} ${clipText(sayOf(asked)) || asked} ${clipText(IN)}`
    : clipText(FREE);

  return (
    <NgStage
      stageRef={p.stageRef}
      playClass={`stk-play ${free ? "stk-play--free" : "stk-play--add"}`}
      world={<StkWorld id={id} />}
      round={round}
      solved={p.solved}
      say={p.say(say)}
      title={props.title}
      onHome={props.onHome}
      onExitPortal={props.onExitPortal}
      overlay={
        <>
          {p.overlay}
          {dragging !== null && (
            <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
              <span className="ng-carried stk-carried">
                <Pic sticker={tray[dragging]} />
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div
        className="stk-board"
        style={cssVars({ "--stk-accent": lesson.accent, "--stk-edge": lesson.edge })}
      >
        <div
          ref={registerCanvas}
          className={`stk-canvas ${over === "canvas" ? "is-lit" : ""}`}
          aria-label="your picture"
        >
          {picture.map((s, i) => (
            <span
              // stickers repeat: a sticker's place in the picture is its identity
              key={`${s.sticker}-${i}`}
              className="stk-placed"
              style={cssVars({ "--px": String(s.x), "--py": String(s.y) })}
            >
              <Pic sticker={s.sticker} />
            </span>
          ))}
        </div>
        <div className="stk-tray">
          {tray.map((s, k) => (
            <div
              key={s}
              ref={(el) => {
                trayRefs.current[k] = el;
              }}
              className={`stk-slot stk-drag touch-none ${dragging === k ? "is-away" : ""}`}
              onPointerDown={(e) => pick(e, k)}
              role="button"
              aria-label={`${s} — drag it into your picture`}
            >
              <motion.span
                className="stk-in"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...ENTER, delay: 0.15 + k * 0.08 }}
              >
                <span
                  className={`stk-card ${
                    asked === s && p.misses >= 1 && !p.solved ? "is-hint" : ""
                  }`}
                >
                  <Pic sticker={s} />
                </span>
              </motion.span>
            </div>
          ))}
          {free && (
            <button
              type="button"
              ref={doneRef}
              className={`stk-done font-rounded font-black ${added > 0 ? "" : "is-waiting"}`}
              onClick={finishPicture}
              disabled={added === 0}
            >
              Done <span aria-hidden="true">✓</span>
            </button>
          )}
        </div>
      </div>
    </NgStage>
  );
}

/** A lesson's round component, made ONCE per lesson at module level. */
export function makeRound(id: ModuleId) {
  return function StkRound(props: RoundProps) {
    return <StickerPage {...props} id={id} />;
  };
}
