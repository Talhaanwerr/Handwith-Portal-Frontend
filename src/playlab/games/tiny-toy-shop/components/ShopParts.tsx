"use client";

import { memo, type ReactNode, type Ref } from "react";
import { BoArt, RubyArt } from "@games/sesame-activities/components/SesameArt";
import { Picture } from "@games/blend-read/components/PictureArt";
import type { Customer, ToyId } from "@games/tiny-toy-shop/constants/rounds";

/**
 * TINY TOY SHOP'S PARTS — a plain, calm backdrop (one warm wall, one floor
 * band, nothing to look at), the
 * customer at the counter with a picture bubble, and the shop's one missing
 * prop, a wicker basket, drawn simply in CSS. Nothing here moves by itself.
 */

export const StreetBackdrop = memo(function StreetBackdrop() {
  return (
    <div className="tys-world tys-plain" aria-hidden="true">
      <div className="tys-plain-floor" />
    </div>
  );
});

/** The customer, cheering once served, with what they want in a bubble. */
export const ShopCustomer = memo(function ShopCustomer({
  who,
  happy,
  children,
}: {
  who: Customer;
  happy: boolean;
  children: ReactNode;
}) {
  return (
    <div className="tys-customer" aria-hidden="true">
      <div className="tys-bubble">{children}</div>
      <div className="tys-pal">
        {who === "ruby" ? (
          <RubyArt mood={happy ? "happy" : "idle"} wave={happy} />
        ) : (
          <BoArt mood={happy ? "happy" : "idle"} />
        )}
      </div>
    </div>
  );
});

/** N little toy pictures in a row: what the customer wants. */
export function ToyRow({ toy, n }: { toy: ToyId; n: number }) {
  return (
    <span className="tys-row">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="tys-row-toy">
          <Picture id={toy} />
        </span>
      ))}
    </span>
  );
}

/** The wicker basket on the counter; what is in it sits on top. */
export function Basket({
  basketRef,
  children,
}: {
  basketRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
}) {
  return (
    <div ref={basketRef} className="tys-basket">
      <span className="tys-basket-handle" aria-hidden="true" />
      <div className="tys-basket-load">{children}</div>
      <span className="tys-basket-body" aria-hidden="true" />
    </div>
  );
}
