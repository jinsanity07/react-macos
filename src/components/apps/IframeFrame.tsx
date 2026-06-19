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
          // Reassign the iframe's `src` attribute to its current value.
          // This is the only cross-origin-safe way to reload a child
          // frame from the parent: calling
          // `iframe.contentWindow.location.reload()` is blocked by the
          // same-origin policy when the embedded page is hosted on a
          // different origin (e.g. the magnet-laid-out apps - Own Pie /
          // Asana / Deltek Pro / Jog-log all live on o.mkpie.me while
          // this shell is served from jinsanity07.github.io), and would
          // throw a `SecurityError` that the previous catch silently
          // swallowed, leaving the user with a frozen page. Reading
          // `src` from the live DOM node (not the React prop) ensures we
          // refresh the *currently rendered* document, which can drift
          // from the prop across remounts.
          try {
            const node = iframeRef.current;
            if (node) node.src = node.src;
          } catch {
            // Setting `src` is attribute-level and cannot throw under
            // the same-origin policy; this catch is defensive only.
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
    );
  }
);

export default IframeFrame;
