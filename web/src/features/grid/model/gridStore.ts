import { create } from "zustand";

type GridStore = {
  isVisible: boolean;
  toggleGrid: () => void;
};

export const useGridStore = create<GridStore>((set) => ({
  isVisible: true,
  toggleGrid: () =>
    set((state) => ({
      isVisible: !state.isVisible,
    })),
}));



