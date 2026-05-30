import React from "react";

export interface MacActions {
  setLogin: (value: boolean | ((prevVar: boolean) => boolean)) => void;
  setCurrentUserName?: (value: string) => void;
  setCurrentUserAvatar?: (value: string) => void;
  shutMac: (e: React.MouseEvent) => void;
  restartMac: (e: React.MouseEvent) => void;
  sleepMac: (e: React.MouseEvent) => void;
  currentUserName?: string;
  currentUserAvatar?: string;
}

export {
  AppsData,
  BearMdData,
  BearData,
  LaunchpadData,
  MusicData,
  TerminalData,
  UserData,
  WallpaperData,
  WebsitesData,
  SiteSectionData,
  SiteData
} from "./configs";
