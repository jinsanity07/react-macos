import { wallpapers, launchpadApps, user } from "~/configs";
import type { LaunchpadData } from "~/types";

interface LaunchpadProps {
  show: boolean;
  toggleLaunchpad: (target: boolean) => void;
  currentUserAvatar?: string;
  openUtility: (title: string, src: string) => void;
}

const placeholderText = "Search";

type UtilitiesStatusResponse = {
  utilities?: Array<{
    key?: string;
    name?: string;
    endpoint?: string;
    status?: string;
  }>;
};

const GUEST_UTILITY_FALLBACK: NonNullable<UtilitiesStatusResponse["utilities"]> = [
  {
    key: "gasana",
    name: "Asana",
    endpoint: "/app/gasana",
    status: "stopped"
  },
  {
    key: "caizheng",
    name: "Cai Zheng Paystub",
    endpoint: "/app/caizheng",
    status: "stopped"
  },
  {
    key: "jiji",
    name: "Jiji",
    endpoint: "/app/jiji",
    status: "stopped"
  },
  {
    key: "joglog",
    name: "Jog🏃🏻Log",
    endpoint: "/app/joglog",
    status: "running"
  },
  {
    key: "drive_search",
    name: "Local Drive Search",
    endpoint: "/app/drive-search",
    status: "stopped"
  },
  {
    key: "ownpie",
    name: "Own Pie",
    endpoint: "/app/ownpie",
    status: "running"
  },
  {
    key: "sigbot",
    name: "Sigbot",
    endpoint: "/sigbot/gradio",
    status: "stopped"
  },
  {
    key: "usageboard",
    name: "UsageBoard",
    endpoint: "/app/usageboard",
    status: "running"
  },
  {
    key: "workspace_connectivity",
    name: "Workspace Connectivity",
    endpoint: "/app/workspace-connectivity",
    status: "stopped"
  }
];

const isOmkpieSession = (currentUserAvatar?: string) => {
  return currentUserAvatar !== undefined && currentUserAvatar !== user.avatar;
};

const getUtilityIcon = (status?: string) => {
  if (status === "running") return "img/icons/launchpad/flint.png";
  return "img/icons/launchpad/gungnir.png";
};

const buildUtilities = (utilities: UtilitiesStatusResponse["utilities"] = []) => {
  return utilities
    .filter((utility) => utility.key && utility.name && utility.endpoint)
    .map((utility) => ({
      id: `utility-${utility.key}`,
      title: utility.name as string,
      img: getUtilityIcon(utility.status),
      link: `https://o.mkpie.me${utility.endpoint}`,
      status: (utility.status as LaunchpadData["status"]) ?? "unknown"
    }));
};

export default function Launchpad({
  show,
  toggleLaunchpad,
  currentUserAvatar,
  openUtility
}: LaunchpadProps) {
  const dark = useStore((state) => state.dark);

  const [searchText, setSearchText] = useState("");
  const [focus, setFocus] = useState(false);
  const [remoteApps, setRemoteApps] = useState<LaunchpadData[]>([]);

  const mergeLaunchpadItems = () => {
    const items = [...remoteApps, ...launchpadApps];
    return items.filter(
      (item, index, self) => index === self.findIndex((v) => v.id === item.id)
    );
  };

  useEffect(() => {
    let cancelled = false;

    async function loadUtilities() {
      if (!isOmkpieSession(currentUserAvatar)) {
        if (!cancelled) setRemoteApps(buildUtilities(GUEST_UTILITY_FALLBACK));
        return;
      }

      try {
        const res = await fetch("https://o.mkpie.me/api/utilities/status", {
          credentials: "include"
        });

        if (!res.ok) {
          if (!cancelled) setRemoteApps([]);
          return;
        }

        const data: unknown = await res.json().catch(() => null);
        const utilities =
          data &&
          typeof data === "object" &&
          Array.isArray((data as UtilitiesStatusResponse).utilities)
            ? (data as UtilitiesStatusResponse).utilities
            : [];

        if (!cancelled) setRemoteApps(buildUtilities(utilities));
      } catch {
        if (!cancelled) setRemoteApps([]);
      }
    }

    loadUtilities();

    return () => {
      cancelled = true;
    };
  }, [currentUserAvatar]);

  const search = () => {
    const items = mergeLaunchpadItems();

    if (searchText === "") return items;
    const text = searchText.toLowerCase();
    const list = items.filter((item) => {
      return (
        item.title.toLowerCase().includes(text) || item.id.toLowerCase().includes(text)
      );
    });
    return list;
  };

  const close = show ? "" : "opacity-0 invisible transition-opacity duration-200";

  return (
    <div
      className={`${close} z-30 transform scale-110 size-full fixed overflow-hidden bg-center bg-cover`}
      id="launchpad"
      style={{
        backgroundImage: `url(${dark ? wallpapers.night : wallpapers.day})`
      }}
      onClick={() => toggleLaunchpad(false)}
    >
      <div className="size-full absolute bg-gray-900/20 backdrop-blur-2xl">
        <div
          className="mx-auto flex h-7 w-64 mt-5 bg-gray-200/10"
          border="1 rounded-md gray-200/30"
          onClick={(e) => e.stopPropagation()}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        >
          <div
            className={`${
              focus ? "w-6 duration-200" : "w-26 delay-250"
            } hstack justify-end`}
          >
            <span className="i-bx:search ml-1 text-white" />
          </div>
          <input
            className="flex-1 min-w-0 no-outline bg-transparent px-1 text-sm text-white"
            placeholder={placeholderText}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div
          className="max-w-[1100px] mx-auto mt-8 w-full px-4 sm:px-10"
          grid="~ flow-row cols-4 sm:cols-7"
        >
          {search().map((app) => (
            <div key={`launchpad-${app.id}`} h="32 sm:36" flex="~ col">
              <button
                className="w-14 sm:w-20 mx-auto"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  if (app.id.startsWith("utility-")) {
                    openUtility(app.title, app.link);
                    toggleLaunchpad(false);
                    return;
                  }

                  window.open(app.link);
                }}
              >
                <img src={app.img} alt={app.title} title={app.title} />
              </button>
              <span m="t-2 x-auto" text="white xs sm:sm">
                {app.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
