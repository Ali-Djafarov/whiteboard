import { create } from "zustand";
import type { NewElement } from "@/entities/scene";
import type { ToolId } from "./types";

type ToolState = {
  activeTool: ToolId;
  draft: NewElement | null;
  setActiveTool: (id: ToolId) => void;
  setDraft: (draft: NewElement | null) => void;
};

export const useToolStore = create<ToolState>((set) => ({
  activeTool: "rectangle",
  draft: null,
  setActiveTool: (activeTool) => set({ activeTool }),
  setDraft: (draft) => set({ draft }),
}));