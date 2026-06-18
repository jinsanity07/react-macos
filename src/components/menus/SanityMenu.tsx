import React from "react";

interface SanityMenuProps {
  toggleSanityMenu: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function SanityMenu({ toggleSanityMenu, btnRef }: SanityMenuProps) {
  const sanityRef = useRef<HTMLDivElement>(null);

  useClickOutside(sanityRef, toggleSanityMenu, [btnRef]);

  return (
    <div
      className="w-96 h-166 max-w-full shadow-menu p-2.5 text-c-black bg-c-100/70 flex flex-col"
      pos="fixed top-9.5 right-0 sm:right-1.5"
      border="~ menu rounded-2xl"
      ref={sanityRef}
    >
      <div className="hstack justify-between px-1 pb-2">
        <div className="hstack space-x-2">
          <div className="cc-btn-active">
            <span className="i-carbon:document-blank text-base" />
          </div>
          <div className="font-medium leading-4">Sanity</div>
        </div>
        <div className="cc-text">Iframe</div>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-c-300/60 bg-white">
        <iframe
          title="Sanity"
          src="https://o.mkpie.me/sanity"
          className="size-full border-0"
        />
      </div>
    </div>
  );
}
