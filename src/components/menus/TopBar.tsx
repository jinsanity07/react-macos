import React from "react";
import { format } from "date-fns";
import { isFullScreen } from "~/utils";
import { music, workspaceLayouts } from "~/configs";
import type { MacActions } from "~/types";
import UsageBoardMenu from "./UsageBoardMenu";
import SanityMenu from "./SanityMenu";
import MagnetMenu from "./MagnetMenu";

interface TopBarItemProps {
  hideOnMobile?: boolean;
  forceHover?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

const TopBarItem = forwardRef(
  (props: TopBarItemProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const hide = props.hideOnMobile ? "hidden sm:inline-flex" : "inline-flex";
    const bg = props.forceHover
      ? "bg-gray-100/30 dark:bg-gray-400/40"
      : "hover:(bg-gray-100/30 dark:bg-gray-400/40)";

    return (
      <div
        ref={ref}
        className={`hstack space-x-1 h-6 px-1 cursor-default rounded ${hide} ${bg} ${
          props.className || ""
        }`}
        onClick={props.onClick}
        onMouseEnter={props.onMouseEnter}
      >
        {props.children}
      </div>
    );
  }
);

const CCMIcon = ({ size }: { size: number }) => {
  return (
    <svg
      viewBox="0 0 29 29"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M7.5,13h14a5.5,5.5,0,0,0,0-11H7.5a5.5,5.5,0,0,0,0,11Zm0-9h14a3.5,3.5,0,0,1,0,7H7.5a3.5,3.5,0,0,1,0-7Zm0,6A2.5,2.5,0,1,0,5,7.5,2.5,2.5,0,0,0,7.5,10Zm14,6H7.5a5.5,5.5,0,0,0,0,11h14a5.5,5.5,0,0,0,0-11Zm1.43439,8a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,22.93439,24Z" />
    </svg>
  );
};

const UsageBoardIcon = ({ size }: { size: number }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-13Zm1.5.5v12h13V6h-13Zm2 2h2v2h-2V8Zm0 3h2v2h-2v-2Zm0 3h2v2h-2v-2Zm4-6h5v2h-5V8Zm0 3h5v2h-5v-2Zm0 3h5v2h-5v-2Z" />
    </svg>
  );
};

const MagnetIcon = ({ size }: { size: number }) => {
  return (
    <svg
      viewBox="0 0 18 18"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3.5 2h3v3h-3zM11.5 2h3v3h-3z" />
      <path
        d="M5 4v5a4 4 0 0 0 8 0V4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
    </svg>
  );
};

interface TopBarProps extends MacActions {
  title: string;
  activeUtility?: {
    id?: string;
    title: string;
    src: string;
    version: string;
  } | null;
  refreshUtility?: () => void;
  openUtilityInNewTab?: (src: string) => void;
  refreshIframeApp?: (id: string) => void;
  openIframeAppInNewTab?: (src: string) => void;
  setSpotlightBtnRef: (value: React.RefObject<HTMLDivElement>) => void;
  hide: boolean;
  toggleSpotlight: () => void;
  toggleAboutThisMac: () => void;
  applyWorkspaceLayout: (layoutId: string) => void;
}

interface TopBarState {
  date: Date;
  showControlCenter: boolean;
  showMagnetMenu: boolean;
  showUsageBoard: boolean;
  showSanityMenu: boolean;
  showWifiMenu: boolean;
  showAppleMenu: boolean;
  showUtilityMenu: boolean;
}

const TopBar = (props: TopBarProps) => {
  const appleBtnRef = useRef<HTMLDivElement>(null);
  const usageBoardBtnRef = useRef<HTMLDivElement>(null);
  const controlCenterBtnRef = useRef<HTMLDivElement>(null);
  const magnetMenuBtnRef = useRef<HTMLDivElement>(null);
  const wifiBtnRef = useRef<HTMLDivElement>(null);
  const spotlightBtnRef = useRef<HTMLDivElement>(null);
  const sanityBtnRef = useRef<HTMLDivElement>(null);
  const utilityMenuBtnRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<TopBarState>({
    date: new Date(),
    showControlCenter: false,
    showMagnetMenu: false,
    showUsageBoard: false,
    showSanityMenu: false,
    showWifiMenu: false,
    showAppleMenu: false,
    showUtilityMenu: false
  });

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [audio, audioState, controls, audioRef] = useAudio({
    src: music.audio,
    autoReplay: true
  });
  const { winWidth, winHeight } = useWindowSize();

  const { volume, wifi } = useStore((state) => ({
    volume: state.volume,
    wifi: state.wifi
  }));
  const { toggleFullScreen, setVolume, setBrightness } = useStore((state) => ({
    toggleFullScreen: state.toggleFullScreen,
    setVolume: state.setVolume,
    setBrightness: state.setBrightness
  }));

  useInterval(() => {
    setState({
      ...state,
      date: new Date()
    });
  }, 60 * 1000);

  useEffect(() => {
    props.setSpotlightBtnRef(spotlightBtnRef);
    controls.volume(volume / 100);
  }, []);

  useEffect(() => {
    const isFull = isFullScreen();
    toggleFullScreen(isFull);
  }, [winWidth, winHeight]);

  // Auto-close the utility menu if the focused utility disappears.
  useEffect(() => {
    if (!props.activeUtility && state.showUtilityMenu) {
      setState((prev) => ({ ...prev, showUtilityMenu: false }));
    }
  }, [props.activeUtility, state.showUtilityMenu]);

  const setAudioVolume = (value: number): void => {
    setVolume(value);
    controls.volume(value / 100);
  };

  const setSiteBrightness = (value: number): void => {
    setBrightness(value);
  };

  const toggleControlCenter = (): void => {
    setState({
      ...state,
      showControlCenter: !state.showControlCenter
    });
  };

  const toggleMagnetMenu = (): void => {
    setState((prev) => ({
      ...prev,
      showMagnetMenu: !prev.showMagnetMenu
    }));
  };

  const toggleUsageBoard = (): void => {
    setState({
      ...state,
      showUsageBoard: !state.showUsageBoard
    });
  };

  const toggleSanityMenu = (): void => {
    setState({
      ...state,
      showSanityMenu: !state.showSanityMenu
    });
  };

  const toggleAppleMenu = (): void => {
    setState({
      ...state,
      showAppleMenu: !state.showAppleMenu
    });
  };

  const toggleUtilityMenu = (): void => {
    setState((prev) => ({
      ...prev,
      showUtilityMenu: !prev.showUtilityMenu
    }));
  };

  const openAboutThisMac = (): void => {
    if (state.showAppleMenu) toggleAppleMenu();
    props.toggleAboutThisMac();
  };

  const toggleWifiMenu = (): void => {
    setState({
      ...state,
      showWifiMenu: !state.showWifiMenu
    });
  };

  const logout = (): void => {
    controls.pause();
    props.setLogin(false);
  };

  const shut = (e: React.MouseEvent<HTMLLIElement>): void => {
    controls.pause();
    props.shutMac(e);
  };

  const restart = (e: React.MouseEvent<HTMLLIElement>): void => {
    controls.pause();
    props.restartMac(e);
  };

  const sleep = (e: React.MouseEvent<HTMLLIElement>): void => {
    controls.pause();
    props.sleepMac(e);
  };

  return (
    <div
      className={`w-full h-8 px-2 fixed top-0 hstack justify-between ${
        props.hide ? "z-0" : "z-20"
      } text-sm text-white bg-gray-700/10 backdrop-blur-2xl shadow transition`}
    >
      <div className="hstack space-x-1">
        <TopBarItem
          className="px-2"
          forceHover={state.showAppleMenu}
          onClick={toggleAppleMenu}
          ref={appleBtnRef}
        >
          <span className="i-ri:apple-fill text-base" />
        </TopBarItem>
        {props.activeUtility && (
          <TopBarItem
            className="font-semibold px-2"
            forceHover={state.showUtilityMenu}
            onClick={toggleUtilityMenu}
            ref={utilityMenuBtnRef}
          >
            {props.activeUtility.title}
          </TopBarItem>
        )}
        {!props.activeUtility && (
          <TopBarItem
            className="font-semibold px-2"
            onMouseEnter={() => {
              if (state.showAppleMenu) toggleAppleMenu();
            }}
          >
            {props.title}
          </TopBarItem>
        )}
      </div>

      {/* Open this when clicking on Apple logo */}
      {state.showAppleMenu && (
        <AppleMenu
          logout={logout}
          shut={shut}
          restart={restart}
          sleep={sleep}
          aboutThisMac={openAboutThisMac}
          toggleAppleMenu={toggleAppleMenu}
          btnRef={appleBtnRef}
          currentUserName={props.currentUserName}
        />
      )}

      {/* Open this when clicking the focused utility's app-name button */}
      {state.showUtilityMenu && props.activeUtility && (
        <UtilityMenu
          title={props.activeUtility.title}
          src={props.activeUtility.src}
          version={props.activeUtility.version}
          onOpenInNewTab={
            props.activeUtility.id && props.openIframeAppInNewTab
              ? () => props.openIframeAppInNewTab?.(props.activeUtility!.src)
              : () => props.openUtilityInNewTab?.(props.activeUtility!.src)
          }
          onRefresh={() => {
            if (props.activeUtility?.id) {
              props.refreshIframeApp?.(props.activeUtility.id);
            } else {
              props.refreshUtility?.();
            }
            toggleUtilityMenu();
          }}
          onClose={toggleUtilityMenu}
          btnRef={utilityMenuBtnRef}
        />
      )}

      <div className="hstack flex-row justify-end space-x-2">
        <TopBarItem
          forceHover={state.showMagnetMenu}
          onClick={toggleMagnetMenu}
          ref={magnetMenuBtnRef}
        >
          <span title="Magnet workspace layouts">
            <MagnetIcon size={17} />
          </span>
        </TopBarItem>
        <TopBarItem hideOnMobile={true}>
          <Battery />
        </TopBarItem>
        <TopBarItem
          hideOnMobile={true}
          forceHover={state.showWifiMenu}
          onClick={toggleWifiMenu}
          ref={wifiBtnRef}
        >
          {wifi ? (
            <span className="i-material-symbols:wifi text-lg" />
          ) : (
            <span className="i-material-symbols:wifi-off text-lg" />
          )}
        </TopBarItem>
        <TopBarItem ref={spotlightBtnRef} onClick={props.toggleSpotlight}>
          <span className="i-bx:search text-[17px]" />
        </TopBarItem>
        <TopBarItem
          forceHover={state.showUsageBoard}
          onClick={toggleUsageBoard}
          ref={usageBoardBtnRef}
        >
          <UsageBoardIcon size={16} />
        </TopBarItem>
        <TopBarItem
          forceHover={state.showControlCenter}
          onClick={toggleControlCenter}
          ref={controlCenterBtnRef}
        >
          <CCMIcon size={16} />
        </TopBarItem>

        {state.showMagnetMenu && (
          <MagnetMenu
            layouts={workspaceLayouts}
            applyLayout={props.applyWorkspaceLayout}
            toggleMagnetMenu={toggleMagnetMenu}
            btnRef={magnetMenuBtnRef}
          />
        )}

        {/* Open this when clicking on Wifi button */}
        {state.showWifiMenu && (
          <WifiMenu toggleWifiMenu={toggleWifiMenu} btnRef={wifiBtnRef} />
        )}

        {/* Open this when clicking on Control Center button */}
        {state.showControlCenter && (
          <ControlCenterMenu
            playing={audioState.playing}
            toggleAudio={controls.toggle}
            setVolume={setAudioVolume}
            setBrightness={setSiteBrightness}
            toggleControlCenter={toggleControlCenter}
            btnRef={controlCenterBtnRef}
          />
        )}

        {state.showUsageBoard && (
          <UsageBoardMenu toggleUsageBoard={toggleUsageBoard} btnRef={usageBoardBtnRef} />
        )}

        {state.showSanityMenu && (
          <SanityMenu toggleSanityMenu={toggleSanityMenu} btnRef={sanityBtnRef} />
        )}

        <TopBarItem
          forceHover={state.showSanityMenu}
          onClick={toggleSanityMenu}
          ref={sanityBtnRef}
        >
          <span>{format(state.date, "eee MMM d")}</span>
          <span>{format(state.date, "h:mm aa")}</span>
        </TopBarItem>
      </div>
    </div>
  );
};

export default TopBar;
