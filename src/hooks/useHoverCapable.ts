import React from "react";

/**
 * Returns `true` when the device's primary input is a fine pointer with
 * hover capability (e.g. desktop with a mouse). Returns `false` on
 * touch-first devices — phones, tablets, and *tablets with a trackpad
 * attached* (iPadOS reports `hover: hover` for the trackpad but
 * `any-hover: none` because the primary input is still touch).
 *
 * Use to gate hover-driven UI like the dock magnification, which gets
 * stuck on iPadOS trackpad mode when the prior `(hover: none) and
 * (pointer: coarse)` query let the magnification pipeline run.
 *
 * Defaults to `true` (hover-capable) during SSR and on browsers without
 * `matchMedia`, so desktop behavior is preserved.
 */
export function useHoverCapable(): boolean {
  // (any-hover: none) — no pointing device supports hover (the right
  // check for "is this device touch-first?" — covers iPad with trackpad
  // where the trackpad reports hover:hover but the *primary* input does
  // not). Combined with (any-pointer: coarse) — at least one input is a
  // coarse pointer. Together these are the right media queries for
  // "should hover-driven UI be disabled?".
  const query = "(any-hover: none) and (any-pointer: coarse)";
  const [isTouch, setIsTouch] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = (): void => setIsTouch(mql.matches);
    update();
    // Safari < 14 used addListener/removeListener; modern browsers use addEventListener.
    if (mql.addEventListener) {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  return !isTouch;
}
