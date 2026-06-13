import React from "react";

/**
 * Returns `true` when the primary input on the current device is touch
 * (no hover, coarse pointer). Use to gate hover-driven UI like the
 * dock magnification that gets stuck on iOS Safari after a tap.
 *
 * Defaults to `false` (hover-capable) during SSR and on browsers
 * without `matchMedia`, so desktop behavior is preserved.
 */
export function useHoverCapable(): boolean {
  const query = "(hover: none) and (pointer: coarse)";
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
