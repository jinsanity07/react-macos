import type { WorkspaceLayoutData } from "~/types";

const workspaceLayouts: WorkspaceLayoutData[] = [
  {
    id: "time-work-out",
    label: "time->work+out",
    slots: [{ appId: "ownpie" }, { appId: "deltekpro" }, { appId: "joglog" }]
  }
];

export default workspaceLayouts;
