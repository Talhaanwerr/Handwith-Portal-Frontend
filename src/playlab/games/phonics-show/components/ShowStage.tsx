"use client";

import { memo, type ReactNode } from "react";
import { ClassroomScene } from "@games/blend-read/components/ClassroomScene";
import { Bunting } from "@games/color-shape-friends/components/SceneDecor";
import { animalPhoto } from "@games/blend-read/components/PictureArt";
import { fluentSrc } from "@shared/constants/fluent3d";

/**
 * THE STUDIO — mixed from rooms the portal already has. The walls, window
 * and wooden floor are Blend & Seek's calm classroom (this is a phonics
 * game), the flags along the top are Rainbow Shapes' bunting, and only the
 * two things a game show cannot do without are this game's own: red curtains
 * at the sides and a soft spotlight on the middle of the stage. All still —
 * nothing behind the letters moves. Memoised: no question can change it.
 */
export const ShowStage = memo(function ShowStage() {
  return (
    <div className="pgs-stage" aria-hidden="true">
      <ClassroomScene calm />
      <div className="pgs-spot" />
      <div className="pgs-bunting">
        <Bunting />
      </div>
      <span className="pgs-curtain pgs-curtain--l" />
      <span className="pgs-curtain pgs-curtain--r" />
    </div>
  );
});

/**
 * The lit sign: a deep-blue screen in a gold frame studded with bulbs — the
 * show's one signature prop. Anything can go on the screen: the title on the
 * splash, the picture during a question.
 */
export function LitSign({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`pgs-sign ${className}`}>
      <span className="pgs-sign-bulbs" aria-hidden="true" />
      <div className="pgs-sign-screen">{children}</div>
    </div>
  );
}

/**
 * The picture for a word: a real photo for an animal (Jungle Spy's and the
 * word games'), otherwise the portal's Fluent 3D picture.
 */
export function ShowPicture({ word }: { word: string }) {
  const src = animalPhoto(word) ?? fluentSrc(word);
  if (!src) return null;
  const photo = animalPhoto(word) !== null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={`pgs-pic ${photo ? "pgs-pic--photo" : ""}`}
      draggable={false}
      aria-hidden="true"
    />
  );
}
