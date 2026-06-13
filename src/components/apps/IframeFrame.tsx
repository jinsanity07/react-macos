interface IframeFrameProps {
  src: string;
  title: string;
  /**
   * Bumping this number forces the iframe to remount with a fresh document
   * (used by the per-app Utility/Iframe menu's "Refresh Page" item).
   */
  refreshKey: number;
}

export default function IframeFrame({ src, title, refreshKey }: IframeFrameProps) {
  return (
    <iframe key={refreshKey} className="size-full bg-[#202020]" src={src} title={title} />
  );
}
