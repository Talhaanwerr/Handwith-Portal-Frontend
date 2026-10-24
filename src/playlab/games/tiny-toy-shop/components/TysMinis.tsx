"use client";

import { Picture } from "@games/blend-read/components/PictureArt";
import { Basket } from "@games/tiny-toy-shop/components/ShopParts";
import type { ModuleId } from "@games/tiny-toy-shop/constants/rounds";

/**
 * Each Tiny Toy Shop module in miniature, for its home card and the star
 * card: two teddies in the basket; a ball + a ball.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "pick")
    return (
      <span className="ng-mini tys-mini" aria-hidden="true">
        <Basket>
          <span className="tys-load-toy">
            <Picture id="bear" />
          </span>
          <span className="tys-load-toy">
            <Picture id="bear" />
          </span>
        </Basket>
      </span>
    );
  const left = 1;
  const right = 1;
  return (
    <span className="ng-mini tys-mini tys-mini--add" aria-hidden="true">
      {Array.from({ length: left }, (_, i) => (
        <span key={`l${i}`} className="tys-mini-toy">
          <Picture id="ball" />
        </span>
      ))}
      <span className="tys-plus font-rounded font-black">+</span>
      {Array.from({ length: right }, (_, i) => (
        <span key={`r${i}`} className="tys-mini-toy">
          <Picture id="ball" />
        </span>
      ))}
    </span>
  );
}
