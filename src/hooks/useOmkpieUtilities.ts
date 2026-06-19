import { useEffect, useState } from "react";
import { user } from "~/configs";
import type { LaunchpadData } from "~/types";

type UtilityStatus = {
  key?: string;
  name?: string;
  endpoint?: string;
  status?: string;
  version?: string;
  runtime?: string;
  pid?: number | null;
  port?: number | null;
  active_by_default?: boolean;
  auto_launch_on_open?: boolean;
  last_error?: string | null;
  restart_count?: number;
  started_at?: number | null;
  log_path?: string | null;
};

type UtilitiesStatusResponse = {
  server_version?: string;
  utilities?: UtilityStatus[];
};

export const GUEST_UTILITY_FALLBACK: NonNullable<UtilitiesStatusResponse["utilities"]> = [
  {
    key: "gasana",
    name: "Asana",
    version: "0.0.2",
    endpoint: "/app/gasana",
    status: "stopped",
    runtime: "subprocess",
    pid: null,
    port: null,
    active_by_default: false,
    auto_launch_on_open: true,
    last_error: null,
    restart_count: 0,
    started_at: null,
    log_path: null
  },
  {
    key: "caizheng",
    name: "Cai Zheng Paystub",
    version: "0.0.1",
    endpoint: "/app/caizheng",
    status: "stopped",
    runtime: "subprocess",
    pid: null,
    port: null,
    active_by_default: false,
    auto_launch_on_open: true,
    last_error: null,
    restart_count: 0,
    started_at: null,
    log_path: null
  },
  {
    key: "jiji",
    name: "Jiji",
    version: "0.0.1",
    endpoint: "/app/jiji",
    status: "stopped",
    runtime: "subprocess",
    pid: null,
    port: null,
    active_by_default: false,
    auto_launch_on_open: true,
    last_error: null,
    restart_count: 0,
    started_at: null,
    log_path: null
  },
  {
    key: "joglog",
    name: "Jog🏃🏻Log",
    version: "0.0.2",
    endpoint: "/app/joglog",
    status: "running",
    runtime: "in_process",
    pid: null,
    port: null,
    active_by_default: true,
    auto_launch_on_open: true,
    last_error: null,
    restart_count: 0,
    started_at: null,
    log_path: null
  },
  {
    key: "drive_search",
    name: "Local Drive Search",
    version: "0.0.2",
    endpoint: "/app/drive-search",
    status: "stopped",
    runtime: "subprocess",
    pid: null,
    port: null,
    active_by_default: false,
    auto_launch_on_open: true,
    last_error: null,
    restart_count: 0,
    started_at: null,
    log_path: null
  },
  {
    key: "ownpie",
    name: "Own Pie",
    version: "0.0.1",
    endpoint: "/app/ownpie",
    status: "running",
    runtime: "in_process",
    pid: null,
    port: null,
    active_by_default: true,
    auto_launch_on_open: true,
    last_error: null,
    restart_count: 0,
    started_at: null,
    log_path: null
  },
  {
    key: "sigbot",
    name: "Sigbot",
    version: "0.0.1",
    endpoint: "/sigbot/gradio",
    status: "stopped",
    runtime: "subprocess",
    pid: null,
    port: null,
    active_by_default: false,
    auto_launch_on_open: true,
    last_error: null,
    restart_count: 0,
    started_at: null,
    log_path: null
  },
  {
    key: "usageboard",
    name: "UsageBoard",
    version: "0.0.2",
    endpoint: "/app/usageboard",
    status: "running",
    runtime: "subprocess",
    pid: null,
    port: null,
    active_by_default: false,
    auto_launch_on_open: true,
    last_error: null,
    restart_count: 0,
    started_at: null,
    log_path: null
  },
  {
    key: "workspace_connectivity",
    name: "Workspace Connectivity",
    version: "0.1.0",
    endpoint: "/app/workspace-connectivity",
    status: "stopped",
    runtime: "subprocess",
    pid: null,
    port: null,
    active_by_default: false,
    auto_launch_on_open: true,
    last_error: null,
    restart_count: 0,
    started_at: null,
    log_path: null
  }
];

export const getUtilityIcon = (status?: string) => {
  if (status === "running") return "img/icons/launchpad/flint.png";
  return "img/icons/launchpad/gungnir.png";
};

export const buildUtilities = (utilities: UtilitiesStatusResponse["utilities"] = []) => {
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

export const isOmkpieSession = (currentUserAvatar?: string) => {
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
