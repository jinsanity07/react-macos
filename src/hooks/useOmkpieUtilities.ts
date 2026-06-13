import { useEffect, useState } from "react";
import { user } from "~/configs";
import type { LaunchpadData } from "~/types";

type UtilitiesStatusResponse = {
  utilities?: Array<{
    key?: string;
    name?: string;
    endpoint?: string;
    status?: string;
    version?: string;
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
      status: (utility.status as LaunchpadData["status"]) ?? "unknown",
      version: utility.version
    }));
};

const isOmkpieSession = (currentUserAvatar?: string) => {
  return currentUserAvatar !== undefined && currentUserAvatar !== user.avatar;
};

export function useOmkpieUtilities(currentUserAvatar?: string) {
  const [utilities, setUtilities] = useState<LaunchpadData[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadUtilities() {
      if (!isOmkpieSession(currentUserAvatar)) {
        if (!cancelled) setUtilities(buildUtilities(GUEST_UTILITY_FALLBACK));
        return;
      }

      try {
        const res = await fetch("https://o.mkpie.me/api/utilities/status", {
          credentials: "include"
        });

        if (!res.ok) {
          if (!cancelled) setUtilities([]);
          return;
        }

        const data: unknown = await res.json().catch(() => null);
        const nextUtilities =
          data &&
          typeof data === "object" &&
          Array.isArray((data as UtilitiesStatusResponse).utilities)
            ? (data as UtilitiesStatusResponse).utilities
            : [];

        if (!cancelled) setUtilities(buildUtilities(nextUtilities));
      } catch {
        if (!cancelled) setUtilities([]);
      }
    }

    loadUtilities();

    return () => {
      cancelled = true;
    };
  }, [currentUserAvatar]);

  return utilities;
}
