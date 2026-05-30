/// <reference types="vite/client" />

declare global {
  const __APP_VERSION__: string;
}

import type { AttributifyAttributes } from "unocss/dist/preset-attributify";

declare module "react" {
  /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
  interface HTMLAttributes<T> extends AttributifyAttributes {}
}
