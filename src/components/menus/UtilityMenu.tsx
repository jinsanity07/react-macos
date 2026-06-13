import React from "react";
import { MenuItem, MenuItemGroup } from "./base";

interface UtilityMenuProps {
  title: string;
  src: string;
  version: string;
  onOpenInNewTab: (src: string) => void;
  onRefresh: () => void;
  onClose: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function UtilityMenu({
  title,
  src,
  version,
  onOpenInNewTab,
  onRefresh,
  onClose,
  btnRef
}: UtilityMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, onClose, [btnRef]);

  return (
    <div className="menu-box left-2 w-56 top-7" ref={ref}>
      <MenuItemGroup>
        <MenuItem onClick={() => onOpenInNewTab(src)}>Open in New Tab</MenuItem>
        <MenuItem onClick={onRefresh}>Refresh Page</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem>Version {version}</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup border={false}>
        <MenuItem onClick={onClose}>Close {title}</MenuItem>
      </MenuItemGroup>
    </div>
  );
}
