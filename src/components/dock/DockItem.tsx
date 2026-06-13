import React from "react";
import useRaf from "@rooks/use-raf";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue
} from "framer-motion";

// Hover effect is adopted from https://github.com/PuruVJ/macos-web/blob/main/src/components/dock/DockItem.tsx

import { useHoverCapable } from "~/hooks/useHoverCapable";

const useDockHoverAnimation = (
  mouseX: MotionValue,
  ref: React.RefObject<HTMLImageElement>,
  dockSize: number,
  dockMag: number,
  enabled: boolean
) => {
  const distanceLimit = dockSize * 6;
  const distanceInput = [
    -distanceLimit,
    -distanceLimit / (dockMag * 0.65),
    -distanceLimit / (dockMag * 0.85),
    0,
    distanceLimit / (dockMag * 0.85),
    distanceLimit / (dockMag * 0.65),
    distanceLimit
  ];
  const widthOutput = [
    dockSize,
    dockSize * (dockMag * 0.55),
    dockSize * (dockMag * 0.75),
    dockSize * dockMag,
    dockSize * (dockMag * 0.75),
    dockSize * (dockMag * 0.55),
    dockSize
  ];
  const beyondTheDistanceLimit = distanceLimit + 1;

  const distance = useMotionValue(beyondTheDistanceLimit);
  const widthPX = useSpring(useTransform(distance, distanceInput, widthOutput), {
    stiffness: 1700,
    damping: 90
  });

  const width = useTransform(widthPX, (width) => `${width / 16}rem`);

  useRaf(() => {
    // On touch-primary devices the magnification pipeline is disabled
    // outright — iOS Safari's sticky :hover state would otherwise leave
    // the last-tapped icon visually enlarged after a tap.
    if (!enabled) {
      distance.set(beyondTheDistanceLimit);
      return;
    }
    const el = ref.current;
    const mouseXVal = mouseX.get();
    if (el && mouseXVal !== null) {
      const rect = el.getBoundingClientRect();
      const imgCenterX = rect.left + rect.width / 2;
      // difference between the x coordinate value of the mouse pointer
      // and the img center x coordinate value
      const distanceDelta = mouseXVal - imgCenterX;
      distance.set(distanceDelta);
      return;
    }

    distance.set(beyondTheDistanceLimit);
  }, true);

  return { width, widthPX };
};

interface DockItemProps {
  id: string;
  title: string;
  img: string;
  mouseX: MotionValue;
  desktop: boolean;
  openApp: (id: string) => void;
  isOpen: boolean;
  link?: string;
  dockSize: number;
  dockMag: number;
}

export default function DockItem({
  id,
  title,
  img,
  mouseX,
  desktop,
  openApp,
  isOpen,
  link,
  dockSize,
  dockMag
}: DockItemProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const hoverCapable = useHoverCapable();
  const { width } = useDockHoverAnimation(
    mouseX,
    imgRef,
    dockSize,
    dockMag,
    hoverCapable
  );
  const { winWidth } = useWindowSize();
  // Disable the hover-magnify pipeline on small viewports *or* on
  // touch-primary devices, where it gets stuck after a tap.
  const motionStyle =
    !hoverCapable || winWidth < 640 ? {} : { width, willChange: "width" };

  return (
    <li
      id={`dock-${id}`}
      onClick={desktop || id === "launchpad" ? () => openApp(id) : () => {}}
      className="relative flex flex-col justify-end mb-1"
    >
      <p
        className="tooltip absolute inset-x-0 mx-auto w-max rounded-md bg-c-300/80"
        p="x-3 y-1"
        text="sm c-black"
      >
        {title}
      </p>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer">
          <motion.img
            ref={imgRef}
            src={img}
            alt={title}
            title={title}
            draggable={false}
            style={motionStyle}
          />
        </a>
      ) : (
        <motion.img
          ref={imgRef}
          src={img}
          alt={title}
          title={title}
          draggable={false}
          style={motionStyle}
        />
      )}
      <div
        className={`size-1 mx-auto rounded-full bg-c-800 ${isOpen ? "" : "invisible"}`}
      />
    </li>
  );
}
