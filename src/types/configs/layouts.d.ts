export interface WorkspaceLayoutSlot {
  appId: string;
}

export interface WorkspaceLayoutData {
  id: string;
  label: string;
  slots: WorkspaceLayoutSlot[];
}
