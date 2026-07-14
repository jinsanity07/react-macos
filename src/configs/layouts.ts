import type { WorkspaceLayoutData } from "~/types";

const workspaceLayouts: WorkspaceLayoutData[] = [
  {
    id: "stacked-time-asana-deltek",
    label: "[time,asana] + deltek",
    arrangement: "stacked-left",
    slots: [{ appId: "ownpie" }, { appId: "asana" }, { appId: "deltekpro" }]
  },
  {
    id: "time-work-out",
    label: "time->work+out",
    arrangement: "equal-columns",
    slots: [{ appId: "ownpie" }, { appId: "deltekpro" }, { appId: "joglog" }]
  },
  {
    id: "time-asana-deltek",
    label: "time->asana+deltek",
    arrangement: "equal-columns",
    slots: [{ appId: "ownpie" }, { appId: "asana" }, { appId: "deltekpro" }]
  }
];

export default workspaceLayouts;
