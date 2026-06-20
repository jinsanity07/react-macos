export interface AppsData {
  id: string;
  title: string;
  desktop: boolean;
  /** Whether the app should appear in the Dock. Defaults to true. */
  dock?: boolean;
  img: string;
  show?: boolean;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number;
  x?: number;
  y?: number;
  content?: JSX.Element;
  link?: string;
  /**
   * When set, the desktop app renders a single iframe with this src
   * (instead of `content`) and is eligible for the per-app menu in the
   * top bar (Open in New Tab / Refresh / Version).
   */
  iframeSrc?: string;
  /**
   * Display version when `iframeSrc` is set. The runtime resolves the
   * real version from `/api/utilities/status` by matching the src's
   * pathname to a utility `endpoint`; this field is the static fallback
   * when the API is unreachable or the src isn't an omkpie endpoint.
   * Defaults to `0.0.1`.
   */
  iframeVersion?: string;
}
