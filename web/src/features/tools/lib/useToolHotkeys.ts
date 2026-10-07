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
  KeyA: "arrow",
  KeyP: "pen",
  KeyT: "text",
};

const isGestureActive = (): boolean => {
  const { draft, marquee, preview } = useToolStore.getState();
  return draft !== null || marquee !== null || Object.keys(preview).length > 0;
};

function handleHistoryKey(e: KeyboardEvent): void {
  const isUndo = e.code === "KeyZ" && !e.shiftKey;
  const isRedo = (e.code === "KeyZ" && e.shiftKey) || e.code === "KeyY";
  if (!isUndo && !isRedo) return;

  e.preventDefault();
  if (isGestureActive()) return;
  if (isUndo) sceneApi.undo();
  else sceneApi.redo();
}

export function useToolHotkeys(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen() || isTextEditingTarget(e.target) || e.altKey) return;

      if (e.ctrlKey || e.metaKey) {
        handleHistoryKey(e);
        return;
      }
      
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
