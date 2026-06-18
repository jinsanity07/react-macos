import React from "react";
import type { WorkspaceLayoutData } from "~/types";

interface MagnetMenuProps {
  layouts: WorkspaceLayoutData[];
  applyLayout: (layoutId: string) => void;
  toggleMagnetMenu: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

const viewportPadding = 6;
const launcherGap = 6;

export default function MagnetMenu({
  layouts,
  applyLayout,
  toggleMagnetMenu,
  btnRef
}: MagnetMenuProps) {
  const magnetMenuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  useClickOutside(magnetMenuRef, toggleMagnetMenu, [btnRef]);

  useLayoutEffect(() => {
    const updatePosition = (): void => {
      const launcher = btnRef.current;
      const menu = magnetMenuRef.current;
      if (!launcher || !menu) return;

      const launcherRect = launcher.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const maxLeft = Math.max(
        viewportPadding,
        window.innerWidth - menuRect.width - viewportPadding
      );
      const maxTop = Math.max(
        viewportPadding,
        window.innerHeight - menuRect.height - viewportPadding
      );

      setPosition({
        left: Math.min(
          Math.max(launcherRect.right - menuRect.width, viewportPadding),
          maxLeft
        ),
        top: Math.min(
          Math.max(launcherRect.bottom + launcherGap, viewportPadding),
          maxTop
        )
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => window.removeEventListener("resize", updatePosition);
  }, [btnRef]);

  return (
    <div
      className="w-60 max-w-full shadow-menu p-1.5 text-c-black bg-c-100/70"
      border="~ menu rounded-2xl"
      ref={magnetMenuRef}
      style={{
        position: "fixed",
        left: position?.left ?? 0,
        top: position?.top ?? 0,
        marginLeft: 0,
        maxWidth: `calc(100vw - ${viewportPadding * 2}px)`,
        visibility: position ? "visible" : "hidden"
      }}
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
