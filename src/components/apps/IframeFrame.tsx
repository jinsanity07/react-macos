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

    const openInNewTab = React.useCallback((): void => {
      // Escape hatch for cross-origin iframes where the in-iframe session
      // can't be restored (e.g. iOS Safari ITP blocking third-party cookies,
      // or Chrome's third-party-cookie phase-out). Opening the same URL
      // in a new tab turns the iframe into a top-level navigation, so the
      // session cookie is first-party and login works normally.
      window.open(src, "_blank", "noopener,noreferrer");
    }, [src]);

    return (
      <div className="relative size-full">
        <iframe
          ref={iframeRef}
          key={refreshKey}
          className="size-full bg-[#202020]"
          src={src}
          // `allow="storage-access *"` is the Safari ITP hint that lets
          // the embedded page call `document.requestStorageAccess()` and
          // gain access to its own first-party cookies (which are normally
          // partitioned away when the iframe is cross-origin). The
          // embedded app has to call it from a user gesture, but the
          // policy is required for the call to be permitted at all.
          // `clipboard-read/write` round out the common iOS-quirk set.
          allow="storage-access *; clipboard-read; clipboard-write"
          // `no-referrer-when-downgrade` is the default; make it explicit
          // so the embedded app always gets the top-level origin as
          // referrer, which is the most permissive option.
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-1.5"
          // Banner stays out of the way of the iframe content (it doesn't
          // capture clicks, and it only covers the top-right corner).
        >
          <button
            type="button"
            onClick={openInNewTab}
            className="pointer-events-auto rounded-md bg-c-white/70 px-2 py-1 text-xs text-c-black shadow-sm backdrop-blur hover:bg-c-white"
            title="Open in a new tab — useful when sign-in doesn't work in the iframe"
          >
            Open in new tab ↗
          </button>
        </div>
      </div>
    );
  }
);

export default IframeFrame;
