import { create } from "zustand";
import type { NewElement } from "@/entities/scene";
import type { TextEditorState, ToolId } from "./types";
import type { Rect } from "@/shared/canvas";
import type { ElementPatch } from "@/entities/scene/model/sceneDoc";

type Preview = Readonly<Record<string, ElementPatch>>;

type ToolState = {
  activeTool: ToolId;
  draft: NewElement | null;
  selectedIds: string[];
  marquee: Rect | null;
  preview: Preview;
  cursor: string | null;
  setActiveTool: (id: ToolId) => void;
  setDraft: (draft: NewElement | null) => void;
  setSelection: (ids: string[]) => void;
  setMarquee: (rect: Rect | null) => void;
  setPreview: (preview: Preview) => void;
  setCursor: (cursor: string | null) => void;
  textEditor: TextEditorState | null;
  setTextEditor: (editor: TextEditorState | null) => void;
  setTextEditorValue: (text: string) => void;
};

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

export const useToolStore = create<ToolState>((set, get) => ({
  activeTool: "select",
  draft: null,
  selectedIds: [],
  marquee: null,
  preview: {},
  cursor: null,
  setActiveTool: (activeTool) => set({ activeTool }),
  setDraft: (draft) => set({ draft }),
  setSelection: (ids) => {
    if (!sameIds(get().selectedIds, ids)) set({ selectedIds: ids });
  },
  setMarquee: (marquee) => set({ marquee }),
  setPreview: (preview) => set({ preview }),
  setCursor: (cursor) => {
    if (get().cursor !== cursor) set({ cursor });
  },
  textEditor: null,
  setTextEditor: (textEditor) => set({ textEditor }),
  setTextEditorValue: (text) => {
    const editor = get().textEditor;
    if (editor) set({ textEditor: { ...editor, text } });
  },
}));
