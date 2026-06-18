import React from "react";
import type { WorkspaceLayoutData } from "~/types";

interface MagnetMenuProps {
  layouts: WorkspaceLayoutData[];
  applyLayout: (layoutId: string) => void;
  toggleMagnetMenu: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function MagnetMenu({
  layouts,
  applyLayout,
  toggleMagnetMenu,
  btnRef
}: MagnetMenuProps) {
  const magnetMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(magnetMenuRef, toggleMagnetMenu, [btnRef]);

  return (
    <div
      className="w-60 max-w-full shadow-menu p-1.5 text-c-black bg-c-100/70"
      pos="fixed top-9.5 right-0 sm:right-1.5"
      border="~ menu rounded-2xl"
      ref={magnetMenuRef}
    >
      <div className="px-2.5 pb-1 pt-1.5 text-xs font-medium text-c-500">
        Workspace Layouts
      </div>
      <ul>
        {layouts.map((layout) => (
          <li key={layout.id}>
            <button
              type="button"
              className="w-full rounded-lg px-2.5 py-1.5 text-left hover:bg-blue-500 hover:text-white"
              onClick={() => {
                applyLayout(layout.id);
                toggleMagnetMenu();
              }}
            >
              {layout.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
