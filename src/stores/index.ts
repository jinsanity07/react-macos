import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createDockSlice, type DockSlice } from "./slices/dock";
import { createSystemSlice, type SystemSlice } from "./slices/system";
import { createUserSlice, type UserSlice } from "./slices/user";

export const useStore = create<DockSlice & SystemSlice & UserSlice>()(
  persist(
    (...a) => ({
      ...createDockSlice(...a),
      ...createSystemSlice(...a),
      ...createUserSlice(...a)
    }),
    {
      name: "omkpie-user",
      storage: createJSONStorage(() => localStorage),
      // Only FaceTime snapshots should outlive the tab — theme, dock size,
      // wifi, etc. stay session-ephemeral.
      partialize: (state) => ({ faceTimeImages: state.faceTimeImages }),
      version: 1
    }
  )
);
