import { useEffect } from "react";
import { useToolStore } from "../model/toolStore";
import type { ToolId } from "../model/types";
import { activateTool, tools } from "./tools";
import { sceneApi } from "@/entities/scene";
import { isModalOpen, isTextEditingTarget } from "@/shared/lib/dom";

const KEY_TO_TOOL: Record<string, ToolId> = {
  KeyV: "select",
  KeyR: "rectangle",
  KeyO: "ellipse",
};

export function useToolHotkeys(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen()) return;
      if (e.ctrlKey || e.metaKey || e.altKey || isTextEditingTarget(e.target))
        return;
      const { activeTool, selectedIds, setSelection } = useToolStore.getState();

      if (e.code === "Escape") {
        if (tools[activeTool].cancel()) {
          e.preventDefault();
        } else if (selectedIds.length > 0) {
          setSelection([]);
          e.preventDefault();
        }
        return;
      }

      if (e.code === "Delete" || e.code === "Backspace") {
        if (selectedIds.length === 0) return;
        e.preventDefault();
        sceneApi.removeMany(selectedIds);
        setSelection([]);
        return;
      }

      const id = KEY_TO_TOOL[e.code];
      if (id) activateTool(id);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
}
