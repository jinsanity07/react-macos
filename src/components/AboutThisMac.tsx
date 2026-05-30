import React from "react";
import { motion } from "framer-motion";

interface AboutThisMacProps {
  onClose: () => void;
}

const formatVersion = (version: string) => `Mojave ${version}`;

const TrafficLight = ({ className }: { className: string }) => (
  <span className={`window-btn ${className}`} />
);

export default function AboutThisMac({ onClose }: AboutThisMacProps) {
  const dark = useStore((state) => state.dark);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-30 flex items-start justify-center backdrop-blur-[2px] pt-10 sm:pt-14 ${
        dark ? "bg-black/18" : "bg-black/10"
      }`}
      onMouseDown={onClose}
    >
      <motion.div
        ref={panelRef}
        onMouseDown={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="font-avenir relative w-[min(84vw,392px)] overflow-hidden rounded-[18px] border border-black/10 bg-[#e7e7e7] text-[#4a4a4a] shadow-[0_16px_36px_rgba(0,0,0,0.22)] dark:border-white/10 dark:bg-[#1f1f1f] dark:text-[#e3e3e3] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)]"
      >
        <div className="absolute left-0 top-0 h-10 w-full bg-gradient-to-b from-white/60 to-transparent dark:from-white/5" />
        <div className="relative flex items-center gap-2 px-4 pt-4">
          <button
            aria-label="Close"
            onClick={onClose}
            className="window-btn bg-[#ff5f57]"
          />
          <TrafficLight className="bg-[#febc2e]" />
          <TrafficLight className="bg-[#28c840]" />
        </div>

        <div className="px-5 pb-5 pt-2 sm:px-7">
          <div className="mx-auto mb-4 flex w-full max-w-[268px] flex-col items-center">
            <div className="mb-5 mt-2 w-[79%] max-w-[215px]">
              <img
                src="/img/ui/macbook-pro.png"
                alt="MacBook"
                className="mx-auto block w-full h-auto select-none"
                style={{
                  filter: dark ? "brightness(0.95)" : "none",
                  transformOrigin: "center bottom"
                }}
              />
            </div>

            <div className="text-center">
              <div className="text-[2rem] font-semibold leading-none tracking-[-0.03em] text-[#464646] dark:text-[#f1f1f1]">
                MacBook Pro
              </div>
              <div className="mt-1.5 text-[0.95rem] text-[#a4a4a4] dark:text-[#a7a7a7]">
                16-inch, 2021
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-[300px] grid-cols-[88px_1fr] gap-x-3.5 gap-y-0.5 text-[0.92rem] leading-6 sm:max-w-[318px]">
            <div className="text-right text-[#4a4a4a] dark:text-[#cccccc]">Chip</div>
            <div className="text-[#666] dark:text-[#d6d6d6]">Apple M1 Pro</div>
            <div className="text-right text-[#4a4a4a] dark:text-[#cccccc]">Memory</div>
            <div className="text-[#666] dark:text-[#d6d6d6]">16 GB</div>
            <div className="text-right text-[#4a4a4a] dark:text-[#cccccc]">
              Startup disk
            </div>
            <div className="text-[#666] dark:text-[#d6d6d6]">Macintosh HD</div>
            <div className="text-right text-[#4a4a4a] dark:text-[#cccccc]">
              Serial number
            </div>
            <div className="font-medium tracking-wide text-[#111] dark:text-[#f1f1f1]">
              X02YZ1ZYZX
            </div>
            <div className="text-right text-[#4a4a4a] dark:text-[#cccccc]">macOS</div>
            <div className="text-[#666] dark:text-[#d6d6d6]">
              {formatVersion(__APP_VERSION__)}
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() =>
                window.open(
                  "https://jinsanity07git.github.io/blog/",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="rounded-xl border border-black/5 bg-[#d4d4d4] px-5.5 py-1 text-[0.95rem] leading-6 text-[#4a4a4a] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:bg-[#cfcfcf] dark:border-white/10 dark:bg-[#2d2d2d] dark:text-[#f1f1f1] dark:hover:bg-[#373737]"
            >
              More Info...
            </button>
          </div>

          <div className="mt-5 text-center text-[0.78rem] leading-4 text-[#a3a3a3] dark:text-[#8d8d8d]">
            <a
              className="underline decoration-1 underline-offset-2"
              href="https://www.apple.com/macos/"
              target="_blank"
              rel="noreferrer"
            >
              Regulatory Certification
            </a>
            <div className="mt-0.5">™ and © 2026 playground-macos.</div>
            <div>All Rights Reserved.</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
