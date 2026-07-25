import React from "react";
import { Rnd } from "react-rnd";
import { minMarginX, minMarginY, appBarHeight } from "~/utils";

const FullIcon = ({ size }: { size: number }) => (
  <svg
    className="icon"
    viewBox="0 0 13 13"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
  >
    <path d="M9.26 12.03L.006 2.73v9.3H9.26zM2.735.012l9.3 9.3v-9.3h-9.3z" />
  </svg>
);

const ExitFullIcon = ({ size }: { size: number }) => (
  <svg
    className="icon"
    viewBox="0 0 19 19"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
  >
    <path d="M18.373 9.23L9.75.606V9.23h8.624zM.6 9.742l8.623 8.624V9.742H.599z" />
  </svg>
);

interface TrafficProps {
  id: string;
  max: boolean;
  aspectRatio?: number;
  setMax: (id: string, target?: boolean) => void;
  setMin: (id: string) => void;
  close: (id: string) => void;
}

interface WindowProps extends TrafficProps {
  title: string;
  active: boolean;
  min: boolean;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  x?: number;
  y?: number;
  z: number;
  focus: (id: string) => void;
  children: React.ReactNode;
  geometry?: AppWindowGeometry;
}

interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  externallyPositioned: boolean;
}

export interface AppWindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  revision: number;
}

const TrafficLights = ({ id, close, aspectRatio, max, setMax, setMin }: TrafficProps) => {
  const disableMax = aspectRatio !== undefined;

  const closeWindow = (e: React.MouseEvent | React.TouchEvent): void => {
    e.stopPropagation();
    close(id);
  };

  return (
    <div className="traffic-lights flex flex-row absolute left-0 space-x-2 pl-2 mt-1.5">
      <button
        className="window-btn bg-red-500 dark:bg-red-400"
        onClick={closeWindow}
        onTouchEnd={closeWindow}
        aria-label="Close window"
      >
        <span className="icon i-gg:close text-[9px]" />
      </button>
      <button
        className={`window-btn ${max ? "bg-c-400" : "bg-yellow-500 dark:bg-yellow-400"}`}
        onClick={() => setMin(id)}
        onTouchEnd={() => setMin(id)}
        disabled={max}
        aria-label="Minimize window"
      >
        <span className={`icon i-fe:minus text-[10px] ${max ? "invisible" : ""}`} />
      </button>
      <button
        className={`window-btn ${
          disableMax ? "bg-c-400" : "bg-green-500 dark:bg-green-400"
        }`}
        onClick={() => setMax(id)}
        onTouchEnd={() => setMax(id)}
        disabled={disableMax}
        aria-label={max ? "Restore window" : "Maximize window"}
      >
        {!disableMax && (max ? <ExitFullIcon size={9} /> : <FullIcon size={6} />)}
      </button>
    </div>
  );
};

const Window = (props: WindowProps) => {
  const dockSize = useStore((state) => state.dockSize);
  const { winWidth, winHeight } = useWindowSize();
  const [finishingTouchActivation, setFinishingTouchActivation] = useState(false);

  const initWidth = Math.min(winWidth, props.width || 640);
  const initHeight = Math.min(winHeight, props.height || 400);

  const [state, setState] = useState<WindowState>({
    width: initWidth,
    height: initHeight,
    // "+ winWidth" because of the boundary for windows
    x: winWidth + (winWidth - initWidth) / 2 + (props.x || 0),
    // "- minMarginY" because of the boundary for windows
    y: (winHeight - initHeight - dockSize - minMarginY) / 2 + (props.y || 0),
    externallyPositioned: false
  });

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      // Only clamp the upper bound — a previously-enlarged window should
      // keep its size when the viewport grows again.
      width: Math.min(prev.width, winWidth),
      height: Math.min(prev.height, winHeight)
    }));
  }, [winWidth, winHeight]);

  useEffect(() => {
    if (!props.geometry) return;

    setState({
      width: Math.max(1, Math.min(props.geometry.width, winWidth)),
      height: Math.max(1, Math.min(props.geometry.height, winHeight)),
      // The window boundary starts one viewport-width to the left.
      x: winWidth + props.geometry.x,
      // The window boundary itself starts immediately below the menu bar.
      y: props.geometry.y,
      externallyPositioned: true
    });
  }, [props.geometry, winWidth, winHeight]);

  const round = props.max ? "rounded-none" : "rounded-lg";
  const minimized = props.min
    ? "opacity-0 invisible transition-opacity duration-300"
    : "";
  const border = props.max ? "" : "border border-gray-500/30";
  const width = props.max ? winWidth : state.width;
  const height = props.max ? winHeight : state.height;
  const disableMax = props.aspectRatio !== undefined;
  const focusWindow = (): void => {
    if (!props.active) props.focus(props.id);
  };
  const finishTouchActivation = (event: React.TouchEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setFinishingTouchActivation(false);
  };

  const children = React.cloneElement(props.children as React.ReactElement, {
    width: width
  });

  return (
    <Rnd
      bounds="parent"
      size={{
        width: width,
        height: height
      }}
      position={{
        x: props.max
          ? winWidth // because of boundary
          : state.externallyPositioned
            ? state.x
            : Math.min(
                // "winWidth * 2" because of the boundary for windows
                winWidth * 2 - minMarginX,
                Math.max(
                  // "+ winWidth" because we add a boundary for windows
                  winWidth - state.width + minMarginX,
                  state.x
                )
              ),
        y: props.max
          ? -minMarginY // because of boundary
          : state.externallyPositioned
            ? state.y
            : Math.min(
                // "- minMarginY" because of the boundary for windows
                winHeight - minMarginY - (dockSize + 15 + minMarginY),
                Math.max(0, state.y)
              )
      }}
      onDragStop={(_e, d) => {
        setState((prev) => ({
          ...prev,
          x: d.x,
          y: d.y,
          externallyPositioned: false
        }));
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        setState((prev) => ({
          ...prev,
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          x: position.x,
          y: position.y,
          externallyPositioned: false
        }));
      }}
      minWidth={
        props.geometry
          ? Math.min(props.minWidth ?? 200, Math.max(1, props.geometry.width))
          : props.minWidth ?? 200
      }
      minHeight={
        props.geometry
          ? Math.min(props.minHeight ?? 150, Math.max(1, props.geometry.height))
          : props.minHeight ?? 150
      }
      dragHandleClassName="window-bar"
      disableDragging={props.max}
      enableResizing={!props.max}
      lockAspectRatio={props.aspectRatio}
      lockAspectRatioExtraHeight={props.aspectRatio ? appBarHeight : undefined}
      style={{ zIndex: props.z }}
      onMouseDown={focusWindow}
      onTouchStart={focusWindow}
      className={`overflow-hidden ${round} ${border} shadow-lg shadow-black/30 ${minimized}`}
      id={`window-${props.id}`}
    >
      <div
        className="window-bar relative h-6 text-center bg-c-200"
        onDoubleClick={() => !disableMax && props.setMax(props.id)}
      >
        <TrafficLights
          id={props.id}
          max={props.max}
          aspectRatio={props.aspectRatio}
          setMax={props.setMax}
          setMin={props.setMin}
          close={props.close}
        />
        <span className="font-semibold text-c-700">{props.title}</span>
      </div>
      <div className="innner-window relative w-full overflow-y-hidden">
        {children}
        {(!props.active || finishingTouchActivation) && (
          <div
            className="absolute inset-0"
            aria-hidden="true"
            data-window-activation-shield
            onPointerDown={(event) => {
              if (event.pointerType === "touch") setFinishingTouchActivation(true);
            }}
            onTouchStart={() => setFinishingTouchActivation(true)}
            onTouchEnd={finishTouchActivation}
            onTouchCancel={finishTouchActivation}
          />
        )}
      </div>
    </Rnd>
  );
};

export default Window;
