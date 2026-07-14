export interface WorkspaceLayoutSlot {
  appId: string;
}

export interface WorkspaceLayoutData {
  id: string;
  label: string;
  arrangement: "equal-columns" | "stacked-left";
  slots: WorkspaceLayoutSlot[];
}
