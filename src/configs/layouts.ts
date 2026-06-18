import type { WorkspaceLayoutData } from "~/types";

const workspaceLayouts: WorkspaceLayoutData[] = [
  {
    id: "time-work-out",
    label: "time->work+out",
    slots: [{ appId: "ownpie" }, { appId: "deltekpro" }, { appId: "joglog" }]
  },
  {
    id: "time-asana-deltek",
    label: "time->asana+deltek",
    slots: [{ appId: "ownpie" }, { appId: "asana" }, { appId: "deltekpro" }]
  }
];

export default workspaceLayouts;
