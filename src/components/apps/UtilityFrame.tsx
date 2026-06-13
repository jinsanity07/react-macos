interface UtilityFrameProps {
  src: string;
  title: string;
  /**
   * Bumping this number forces the iframe to remount with a fresh document
   * (used by the Utility menu's "Refresh Page" item).
   */
  refreshKey: number;
}

export default function UtilityFrame({ src, title, refreshKey }: UtilityFrameProps) {
  return (
    <iframe key={refreshKey} className="size-full bg-[#202020]" src={src} title={title} />
  );
}
