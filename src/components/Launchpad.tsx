import { wallpapers, launchpadApps } from "~/configs";
import type { LaunchpadData } from "~/types";

interface LaunchpadProps {
  show: boolean;
  toggleLaunchpad: (target: boolean) => void;
  currentUserAvatar?: string;
  openUtility: (title: string, src: string, version?: string) => void;
  // Provided by Desktop — the dynamic utilities are fetched once in the
  // parent (which already does so for Spotlight) and passed down so we
  // don't fire a second request to /api/utilities/status.
  dynamicPortfolioApps?: LaunchpadData[];
}

const placeholderText = "Search";

export default function Launchpad({
  show,
  toggleLaunchpad,
  openUtility,
  dynamicPortfolioApps = []
}: LaunchpadProps) {
  const dark = useStore((state) => state.dark);

  const [searchText, setSearchText] = useState("");

  const mergeLaunchpadItems = (): LaunchpadData[] => {
    const items = [...dynamicPortfolioApps, ...launchpadApps];
    return items.filter(
      (item, index, self) => index === self.findIndex((v) => v.id === item.id)
    );
  };

  const search = () => {
    const items = mergeLaunchpadItems();

    if (searchText === "") return items;
    const text = searchText.toLowerCase();
    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(text) || item.id.toLowerCase().includes(text)
      );
    });
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
        >
          <div className="hstack justify-end w-6">
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
                    openUtility(app.title, app.link, app.version);
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
