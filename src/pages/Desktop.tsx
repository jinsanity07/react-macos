import React from "react";
import { apps, wallpapers } from "~/configs";
import { useOmkpieUtilities } from "~/hooks/useOmkpieUtilities";
import { minMarginY } from "~/utils";
import type { MacActions } from "~/types";
import AboutThisMac from "~/components/AboutThisMac";
import type { SpotlightHandle } from "~/components/Spotlight";
import IframeFrame, { type IframeFrameHandle } from "~/components/apps/IframeFrame";

interface DesktopState {
  showApps: {
    [key: string]: boolean;
  };
  appsZ: {
    [key: string]: number;
  };
  maxApps: {
    [key: string]: boolean;
  };
  minApps: {
    [key: string]: boolean;
  };
  maxZ: number;
  showLaunchpad: boolean;
  currentTitle: string;
  hideDockAndTopbar: boolean;
  spotlight: boolean;
  aboutThisMac: boolean;
  utilityWindow: {
    title: string;
    src: string;
    version: string;
    refreshKey: number;
    z: number;
    max: boolean;
    min: boolean;
  } | null;
  iframeAppRefreshKeys: {
    [id: string]: number;
  };
}

export default function Desktop(props: MacActions) {
  const dynamicLaunchpadApps = useOmkpieUtilities(props.currentUserAvatar);
  const [state, setState] = useState({
    showApps: {},
    appsZ: {},
    maxApps: {},
    minApps: {},
    maxZ: 2,
    showLaunchpad: false,
    currentTitle: "Finder",
    hideDockAndTopbar: false,
    spotlight: false,
    aboutThisMac: false,
    utilityWindow: null,
    iframeAppRefreshKeys: {}
  } as DesktopState);

  const [spotlightBtnRef, setSpotlightBtnRef] =
    useState<React.RefObject<HTMLDivElement> | null>(null);
  const spotlightRef = useRef<SpotlightHandle | null>(null);
  const spotlightOpenRef = useRef(false);

  // Live handles to currently mounted iframes, so the per-app menu's
  // "Refresh Page" can call `.reload()` on them instead of remounting
  // (which would destroy the browsing context and log the user out).
  const utilityIframeRef = useRef<IframeFrameHandle | null>(null);
  const iframeAppHandlesRef = useRef<Map<string, IframeFrameHandle>>(new Map());

  const { dark, brightness } = useStore((state) => ({
    dark: state.dark,
    brightness: state.brightness
  }));

  const getAppsData = (): void => {
    let showApps = {},
      appsZ = {},
      maxApps = {},
      minApps = {};

    apps.forEach((app) => {
      showApps = {
        ...showApps,
        [app.id]: !!app.show
      };
      appsZ = {
        ...appsZ,
        [app.id]: 2
      };
      maxApps = {
        ...maxApps,
        [app.id]: false
      };
      minApps = {
        ...minApps,
        [app.id]: false
      };
    });

    setState({ ...state, showApps, appsZ, maxApps, minApps });
  };

  useEffect(() => {
    getAppsData();
  }, []);

  useEffect(() => {
    spotlightOpenRef.current = state.spotlight;
  }, [state.spotlight]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isPrimarySpotlightHotkey =
        event.ctrlKey &&
        !event.shiftKey &&
        event.code === "Space" &&
        !event.altKey &&
        !event.metaKey;
      const isFallbackSpotlightHotkey =
        event.ctrlKey &&
        event.shiftKey &&
        event.code === "Space" &&
        !event.altKey &&
        !event.metaKey;

      if (!isPrimarySpotlightHotkey && !isFallbackSpotlightHotkey) return;

      event.preventDefault();

      if (spotlightOpenRef.current) {
        spotlightRef.current?.focusSearch();
        return;
      }

      setState((prev) => ({
        ...prev,
        spotlight: true
      }));
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  const toggleLaunchpad = (target: boolean): void => {
    const r = document.querySelector(`#launchpad`) as HTMLElement;
    if (target) {
      r.style.transform = "scale(1)";
      r.style.transition = "ease-in 0.2s";
    } else {
      r.style.transform = "scale(1.1)";
      r.style.transition = "ease-out 0.2s";
    }

    setState((prev) => ({
      ...prev,
      showLaunchpad: target
    }));
  };

  const toggleSpotlight = (): void => {
    setState((prev) => ({
      ...prev,
      spotlight: !prev.spotlight
    }));
  };

  const toggleAboutThisMac = (): void => {
    setState({ ...state, aboutThisMac: !state.aboutThisMac });
  };

  const openUtility = (title: string, src: string, version?: string): void => {
    setState((prev) => {
      const nextZ = prev.maxZ + 1;

      return {
        ...prev,
        utilityWindow: {
          title,
          src,
          version: version ?? "v0.0.1",
          refreshKey: 0,
          z: nextZ,
          max: false,
          min: false
        },
        maxZ: nextZ,
        showLaunchpad: false,
        spotlight: false,
        hideDockAndTopbar: false,
        currentTitle: title
      };
    });
  };

  const refreshUtility = (): void => {
    utilityIframeRef.current?.reload();
  };

  const openUtilityInNewTab = (src: string): void => {
    window.open(src, "_blank", "noopener,noreferrer");
  };

  const refreshIframeApp = (id: string): void => {
    iframeAppHandlesRef.current.get(id)?.reload();
  };

  const openIframeAppInNewTab = (src: string): void => {
    window.open(src, "_blank", "noopener,noreferrer");
  };

  const focusIframeApp = (id: string): void => {
    setState((prev) => {
      const app = apps.find((a) => a.id === id);
      if (!app || !app.iframeSrc) return prev;
      const nextZ = prev.maxZ + 1;

      return {
        ...prev,
        appsZ: { ...prev.appsZ, [id]: nextZ },
        maxZ: nextZ,
        currentTitle: app.title
      };
    });
  };

  const closeUtilityWindow = (): void => {
    setState((prev) => ({
      ...prev,
      utilityWindow: null,
      currentTitle: "Finder",
      hideDockAndTopbar: false
    }));
  };

  const setUtilityMax = (id: string, target?: boolean): void => {
    setState((prev) => {
      if (!prev.utilityWindow) return prev;
      const nextTarget = target === undefined ? !prev.utilityWindow.max : target;

      return {
        ...prev,
        utilityWindow: {
          ...prev.utilityWindow,
          max: nextTarget,
          min: false
        },
        hideDockAndTopbar: nextTarget
      };
    });
  };

  const setUtilityMin = (_id: string): void => {
    setState((prev) => {
      if (!prev.utilityWindow) return prev;

      return {
        ...prev,
        utilityWindow: {
          ...prev.utilityWindow,
          min: !prev.utilityWindow.min,
          max: false
        },
        hideDockAndTopbar: false
      };
    });
  };

  const focusUtilityWindow = (_id: string): void => {
    setState((prev) => {
      if (!prev.utilityWindow) return prev;
      const nextZ = prev.maxZ + 1;

      return {
        ...prev,
        maxZ: nextZ,
        currentTitle: prev.utilityWindow.title,
        utilityWindow: {
          ...prev.utilityWindow,
          z: nextZ
        }
      };
    });
  };

  const setWindowPosition = (id: string): void => {
    const r = document.querySelector(`#window-${id}`) as HTMLElement;
    const rect = r.getBoundingClientRect();
    r.style.setProperty(
      "--window-transform-x",
      // "+ window.innerWidth" because of the boundary for windows
      (window.innerWidth + rect.x).toFixed(1).toString() + "px"
    );
    r.style.setProperty(
      "--window-transform-y",
      // "- minMarginY" because of the boundary for windows
      (rect.y - minMarginY).toFixed(1).toString() + "px"
    );
  };

  const setAppMax = (id: string, target?: boolean): void => {
    const maxApps = state.maxApps;
    if (target === undefined) target = !maxApps[id];
    maxApps[id] = target;
    setState({
      ...state,
      maxApps: maxApps,
      hideDockAndTopbar: target
    });
  };

  const setAppMin = (id: string, target?: boolean): void => {
    const minApps = state.minApps;
    if (target === undefined) target = !minApps[id];
    minApps[id] = target;
    setState({
      ...state,
      minApps: minApps
    });
  };

  const minimizeApp = (id: string): void => {
    setWindowPosition(id);

    // get the corrosponding dock icon's position
    let r = document.querySelector(`#dock-${id}`) as HTMLElement;
    const dockAppRect = r.getBoundingClientRect();

    r = document.querySelector(`#window-${id}`) as HTMLElement;
    // const appRect = r.getBoundingClientRect();
    const posY = window.innerHeight - r.offsetHeight / 2 - minMarginY;
    // "+ window.innerWidth" because of the boundary for windows
    const posX = window.innerWidth + dockAppRect.x - r.offsetWidth / 2 + 25;

    // translate the window to that position
    r.style.transform = `translate(${posX}px, ${posY}px) scale(0.2)`;
    r.style.transition = "ease-out 0.3s";

    // add it to the minimized app list
    setAppMin(id, true);
  };

  const closeApp = (id: string): void => {
    setAppMax(id, false);
    const showApps = state.showApps;
    showApps[id] = false;
    setState({
      ...state,
      showApps: showApps,
      hideDockAndTopbar: false
    });
  };

  const openApp = (id: string): void => {
    // add it to the shown app list
    const showApps = state.showApps;
    showApps[id] = true;

    // move to the top (use a maximum z-index)
    const appsZ = state.appsZ;
    const maxZ = state.maxZ + 1;
    appsZ[id] = maxZ;

    // get the title of the currently opened app
    const currentApp = apps.find((app) => {
      return app.id === id;
    });
    if (currentApp === undefined) {
      throw new TypeError(`App ${id} is undefined.`);
    }

    setState({
      ...state,
      showApps: showApps,
      appsZ: appsZ,
      maxZ: maxZ,
      currentTitle: currentApp.title
    });

    const minApps = state.minApps;
    // if the app has already been shown but minimized
    if (minApps[id]) {
      // move to window's last position
      const r = document.querySelector(`#window-${id}`) as HTMLElement;
      r.style.transform = `translate(${r.style.getPropertyValue(
        "--window-transform-x"
      )}, ${r.style.getPropertyValue("--window-transform-y")}) scale(1)`;
      r.style.transition = "ease-in 0.3s";
      // remove it from the minimized app list
      minApps[id] = false;
      setState({ ...state, minApps });
    }
  };

  const renderAppWindows = () => {
    const windows = apps.map((app) => {
      if (app.desktop && state.showApps[app.id]) {
        const props = {
          id: app.id,
          title: app.title,
          width: app.width,
          height: app.height,
          minWidth: app.minWidth,
          minHeight: app.minHeight,
          aspectRatio: app.aspectRatio,
          x: app.x,
          y: app.y,
          z: state.appsZ[app.id],
          max: state.maxApps[app.id],
          min: state.minApps[app.id],
          close: closeApp,
          setMax: setAppMax,
          setMin: minimizeApp,
          focus: openApp
        };

        return (
          <AppWindow key={`desktop-app-${app.id}`} {...props}>
            {app.iframeSrc ? (
              <IframeFrame
                ref={(handle) => {
                  if (handle) {
                    iframeAppHandlesRef.current.set(app.id, handle);
                  } else {
                    iframeAppHandlesRef.current.delete(app.id);
                  }
                }}
                src={app.iframeSrc}
                title={app.title}
                refreshKey={state.iframeAppRefreshKeys[app.id] ?? 0}
              />
            ) : (
              app.content
            )}
          </AppWindow>
        );
      } else {
        return <div key={`desktop-app-${app.id}`} />;
      }
    });

    if (state.utilityWindow) {
      windows.push(
        <AppWindow
          key="desktop-app-utility"
          id="utility-window"
          title={state.utilityWindow.title}
          width={1024}
          height={700}
          max={state.utilityWindow.max}
          min={state.utilityWindow.min}
          z={state.utilityWindow.z}
          close={closeUtilityWindow}
          setMax={setUtilityMax}
          setMin={setUtilityMin}
          focus={focusUtilityWindow}
        >
          <IframeFrame
            ref={utilityIframeRef}
            src={state.utilityWindow.src}
            title={state.utilityWindow.title}
            refreshKey={state.utilityWindow.refreshKey}
          />
        </AppWindow>
      );
    }

    return windows;
  };

  return (
    <div
      className="size-full overflow-hidden bg-center bg-cover"
      style={{
        backgroundImage: `url(${dark ? wallpapers.night : wallpapers.day})`,
        filter: `brightness( ${(brightness as number) * 0.7 + 50}% )`
      }}
    >
      {/* Top Menu Bar */}
      <TopBar
        title={state.currentTitle}
        activeUtility={
          state.utilityWindow
            ? {
                title: state.utilityWindow.title,
                src: state.utilityWindow.src,
                version: state.utilityWindow.version
              }
            : (() => {
                const focused = state.currentTitle;
                if (!focused) return null;
                const app = apps.find((a) => a.title === focused && a.iframeSrc);
                if (!app || !app.iframeSrc) return null;
                return {
                  id: app.id,
                  title: app.title,
                  src: app.iframeSrc,
                  version: `v${app.iframeVersion ?? "0.0.1"}`
                };
              })()
        }
        refreshUtility={refreshUtility}
        openUtilityInNewTab={openUtilityInNewTab}
        refreshIframeApp={refreshIframeApp}
        openIframeAppInNewTab={openIframeAppInNewTab}
        setLogin={props.setLogin}
        currentUserName={props.currentUserName}
        shutMac={props.shutMac}
        sleepMac={props.sleepMac}
        restartMac={props.restartMac}
        toggleSpotlight={toggleSpotlight}
        toggleAboutThisMac={toggleAboutThisMac}
        hide={state.hideDockAndTopbar}
        setSpotlightBtnRef={setSpotlightBtnRef}
      />

      {state.aboutThisMac && <AboutThisMac onClose={toggleAboutThisMac} />}

      {/* Desktop Apps */}
      <div className="window-bound z-10 absolute" style={{ top: minMarginY }}>
        {renderAppWindows()}
      </div>

      {/* Spotlight */}
      {state.spotlight && (
        <Spotlight
          ref={spotlightRef}
          openApp={openApp}
          toggleLaunchpad={toggleLaunchpad}
          toggleSpotlight={toggleSpotlight}
          btnRef={spotlightBtnRef as React.RefObject<HTMLDivElement>}
          dynamicPortfolioApps={dynamicLaunchpadApps}
          openUtility={openUtility}
        />
      )}

      {/* Launchpad */}
      <Launchpad
        show={state.showLaunchpad}
        toggleLaunchpad={toggleLaunchpad}
        currentUserAvatar={props.currentUserAvatar}
        openUtility={openUtility}
      />

      {/* Dock */}
      <Dock
        open={openApp}
        showApps={state.showApps}
        showLaunchpad={state.showLaunchpad}
        toggleLaunchpad={toggleLaunchpad}
        hide={state.hideDockAndTopbar}
      />
    </div>
  );
}
