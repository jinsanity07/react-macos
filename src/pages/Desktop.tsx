import React from "react";
import { apps, wallpapers, workspaceLayouts } from "~/configs";
import { useOmkpieUtilities, useOmkpieUtilityVersion } from "~/hooks/useOmkpieUtilities";
import { appBarHeight, minMarginY } from "~/utils";
import type { MacActions } from "~/types";
import AboutThisMac from "~/components/AboutThisMac";
import type { AppWindowGeometry } from "~/components/AppWindow";
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
  windowGeometries: {
    [id: string]: AppWindowGeometry | undefined;
  };
  activeLayoutId: string | null;
  layoutRevision: number;
}

export default function Desktop(props: MacActions) {
  const { utilities: dynamicLaunchpadApps } = useOmkpieUtilities(props.currentUserAvatar);
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
    iframeAppRefreshKeys: {},
    windowGeometries: {},
    activeLayoutId: null,
    layoutRevision: 0
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
  const dockSize = useStore((state) => state.dockSize);
  const { winWidth, winHeight } = useWindowSize();

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

    setState((prev) => ({ ...prev, showApps, appsZ, maxApps, minApps }));
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
    setState((prev) => ({
      ...prev,
      aboutThisMac: !prev.aboutThisMac
    }));
  };

  const openUtility = (title: string, src: string, version?: string): void => {
    setState((prev) => {
      const nextZ = prev.maxZ + 1;

      return {
        ...prev,
        utilityWindow: {
          title,
          src,
          version: version ?? "0.0.1",
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
    setState((prev) => {
      const nextTarget = target === undefined ? !prev.maxApps[id] : target;
      return {
        ...prev,
        maxApps: { ...prev.maxApps, [id]: nextTarget },
        hideDockAndTopbar: nextTarget
      };
    });
  };

  const setAppMin = (id: string, target?: boolean): void => {
    setState((prev) => {
      const nextTarget = target === undefined ? !prev.minApps[id] : target;
      return {
        ...prev,
        minApps: { ...prev.minApps, [id]: nextTarget }
      };
    });
  };

  const minimizeApp = (id: string): void => {
    setWindowPosition(id);

    // get the corrosponding dock icon's position
    let r = document.querySelector(`#dock-${id}`) as HTMLElement;
    if (!r) {
      setAppMin(id, true);
      return;
    }
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
    setState((prev) => ({
      ...prev,
      showApps: { ...prev.showApps, [id]: false },
      hideDockAndTopbar: false
    }));
  };

  const openApp = (id: string): void => {
    const currentApp = apps.find((app) => app.id === id);
    if (currentApp === undefined) {
      throw new TypeError(`App ${id} is undefined.`);
    }

    // Pre-compute the DOM side-effect target: was this app minimized
    // before this click? The CSS transform depends on the *previous*
    // minApps[id], which is exactly what the closure-snapshot `state`
    // read below captures.
    const wasMinimized = state.minApps[id];

    setState((prev) => {
      const nextZ = prev.maxZ + 1;
      return {
        ...prev,
        showApps: { ...prev.showApps, [id]: true },
        appsZ: { ...prev.appsZ, [id]: nextZ },
        maxZ: nextZ,
        minApps: {
          ...prev.minApps,
          [id]: wasMinimized ? false : prev.minApps[id]
        },
        currentTitle: currentApp.title
      };
    });

    // If the app was previously minimized, restore its last window
    // position via a CSS transform (matches the original behavior).
    if (wasMinimized) {
      const r = document.querySelector(`#window-${id}`) as HTMLElement;
      r.style.transform = `translate(${r.style.getPropertyValue(
        "--window-transform-x"
      )}, ${r.style.getPropertyValue("--window-transform-y")}) scale(1)`;
      r.style.transition = "ease-in 0.3s";
    }
  };

  const applyWorkspaceLayout = (layoutId: string): void => {
    const layout = workspaceLayouts.find((item) => item.id === layoutId);
    if (!layout) return;

    const layoutApps = layout.slots.flatMap((slot) => {
      const app = apps.find((item) => item.id === slot.appId && item.desktop);
      return app ? [app] : [];
    });
    if (layoutApps.length === 0) return;

    setState((prev) => {
      const revision = prev.layoutRevision + 1;
      const workspaceHeight = Math.max(1, winHeight - minMarginY - (dockSize + 15 + 4));
      const workspaceWidth = Math.max(1, winWidth);
      const columnWidth = workspaceWidth / layoutApps.length;
      const equalColumnGeometries = layoutApps.map((_app, index) => ({
        x: index * columnWidth,
        y: 0,
        width: columnWidth,
        height: workspaceHeight
      }));
      const leftHalfWidth = workspaceWidth / 2;
      const cascadeOffset = Math.min(72, Math.max(48, workspaceWidth * 0.05));
      const stackedWindowWidth = Math.max(1, leftHalfWidth - cascadeOffset);
      const stackedWindowHeight = Math.max(1, workspaceHeight - appBarHeight);
      const layoutGeometries =
        layout.arrangement === "stacked-left" && layoutApps.length === 3
          ? [
              {
                x: 0,
                y: 0,
                width: stackedWindowWidth,
                height: stackedWindowHeight
              },
              {
                x: cascadeOffset,
                y: appBarHeight,
                width: stackedWindowWidth,
                height: stackedWindowHeight
              },
              {
                x: leftHalfWidth,
                y: 0,
                width: workspaceWidth - leftHalfWidth,
                height: workspaceHeight
              }
            ]
          : equalColumnGeometries;
      const showApps = { ...prev.showApps };
      const appsZ = { ...prev.appsZ };
      const maxApps = { ...prev.maxApps };
      const minApps = { ...prev.minApps };
      const windowGeometries = { ...prev.windowGeometries };
      let nextZ = prev.maxZ;

      layoutApps.forEach((app, index) => {
        nextZ += 1;
        showApps[app.id] = true;
        appsZ[app.id] = nextZ;
        maxApps[app.id] = false;
        minApps[app.id] = false;
        windowGeometries[app.id] = {
          ...layoutGeometries[index],
          revision
        };
      });

      return {
        ...prev,
        showApps,
        appsZ,
        maxApps,
        minApps,
        windowGeometries,
        maxZ: nextZ,
        currentTitle: layoutApps[layoutApps.length - 1].title,
        hideDockAndTopbar: false,
        activeLayoutId: layout.id,
        layoutRevision: revision
      };
    });
  };

  useEffect(() => {
    if (!state.activeLayoutId) return;
    applyWorkspaceLayout(state.activeLayoutId);
  }, [winWidth, winHeight, dockSize]);

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
          geometry: state.windowGeometries[app.id],
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

  // Resolves the live `/api/utilities/status` version for a given iframe
  // src by matching its pathname against the `endpoint` field. Used by
  // the dock-iframe `activeUtility` branch below so the top-bar menu
  // reports the same version Launchpad / Spotlight show for dynamic
  // utility windows.
  const iframeApp = (() => {
    const focused = state.currentTitle;
    if (!focused) return null;
    const app = apps.find((a) => a.title === focused && a.iframeSrc);
    if (!app || !app.iframeSrc) return null;
    return app;
  })();
  const iframeAppLiveVersion = useOmkpieUtilityVersion(
    iframeApp?.iframeSrc,
    props.currentUserAvatar
  );
  const iframeAppVersion = iframeApp
    ? iframeAppLiveVersion ?? iframeApp.iframeVersion ?? "0.0.1"
    : undefined;

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
            : iframeApp && iframeAppVersion
              ? {
                  id: iframeApp.id,
                  title: iframeApp.title,
                  src: iframeApp.iframeSrc as string,
                  version: iframeAppVersion
                }
              : null
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
        applyWorkspaceLayout={applyWorkspaceLayout}
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
        dynamicPortfolioApps={dynamicLaunchpadApps}
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
