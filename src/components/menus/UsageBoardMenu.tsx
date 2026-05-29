import React from "react";

interface UsageBoardMenuProps {
  toggleUsageBoard: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function UsageBoardMenu({
  toggleUsageBoard,
  btnRef
}: UsageBoardMenuProps) {
  const usageBoardRef = useRef<HTMLDivElement>(null);

  useClickOutside(usageBoardRef, toggleUsageBoard, [btnRef]);

  return (
    <div
      className="w-80 h-96 max-w-full shadow-menu p-2.5 text-c-black bg-c-100/70 flex flex-col"
      pos="fixed top-9.5 right-0 sm:right-1.5"
      border="~ menu rounded-2xl"
      ref={usageBoardRef}
    >
      <div className="hstack justify-between px-1 pb-2">
        <div className="hstack space-x-2">
          <div className="cc-btn-active">
            <span className="i-carbon:dashboard text-base" />
          </div>
          <div className="font-medium leading-4">Usage Board</div>
        </div>
        <div className="cc-text">Plugin</div>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-c-300/60 bg-white">
        <iframe
          title="Usage Board"
          src="https://o.mkpie.me/app/usageboard/"
          className="size-full border-0"
        />
      </div>
    </div>
  );
}
