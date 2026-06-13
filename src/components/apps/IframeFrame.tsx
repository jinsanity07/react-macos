import React from "react";

interface IframeFrameProps {
  src: string;
  title: string;
  /**
   * Bumping this number forces the iframe to remount with a fresh document.
   * Retained for backward compatibility with existing call sites; the
   * per-app menu's "Refresh Page" action now calls `reload()` on the
   * existing iframe (preserving cookies/storage) instead of bumping this.
   */
  refreshKey: number;
}

export interface IframeFrameHandle {
  /**
   * Reload the iframe's current document in place — same browsing
   * context, so cookies/storage/session survive. This is the standard
   * browser Cmd+R semantic, and what the per-app "Refresh Page" menu
   * should do (the prior `key={refreshKey}` remount destroyed the
   * context and bounced logged-in users back to the login screen).
   */
  reload: () => void;
}

const IframeFrame = React.forwardRef<IframeFrameHandle, IframeFrameProps>(
  function IframeFrame({ src, title, refreshKey }, ref) {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    React.useImperativeHandle(
      ref,
      () => ({
        reload: (): void => {
          // Same-origin / cross-origin safe: setting `location.reload` is
          // callable in both cases. If the parent page is cross-origin
          // and the browser blocks the call, the catch is a no-op for
          // the user (and the iframe is unreachable from the parent
          // anyway, which is the desired isolation).
          try {
            iframeRef.current?.contentWindow?.location.reload();
          } catch {
            // Cross-origin iframe — nothing the parent can do.
          }
        }
      }),
      []
    );

    return (
      <iframe
        ref={iframeRef}
        key={refreshKey}
        className="size-full bg-[#202020]"
        src={src}
        title={title}
      />
    );
  }
);

export default IframeFrame;
