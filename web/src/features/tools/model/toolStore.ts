import { create } from "zustand";
import type { NewElement } from "@/entities/scene";
import type { ToolId } from "./types";
import type { Rect } from "@/shared/canvas";

type ToolState = {
  activeTool: ToolId;
  draft: NewElement | null;
  selectedIds: string[];
  marquee: Rect | null;
  setActiveTool: (id: ToolId) => void;
  setDraft: (draft: NewElement | null) => void;
  setSelection: (ids: string[]) => void;
  setMarquee: (rect: Rect | null) => void;
};

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

export const useToolStore = create<ToolState>((set, get) => ({
  activeTool: "select",
  draft: null,
  selectedIds: [],
  marquee: null,
  setActiveTool: (activeTool) => set({ activeTool }),
  setDraft: (draft) => set({ draft }),
  setSelection: (ids) => {
    if (!sameIds(get().selectedIds, ids)) set({ selectedIds: ids });
  },
  setMarquee: (marquee) => set({ marquee }),
}));
