import { useEffect } from "react";
import { isTextEditingTarget } from "@/shared/lib/dom";
import { useToolStore } from "../model/toolStore";
import type { ToolId } from "../model/types";
import { activateTool, tools } from "./tools";

const KEY_TO_TOOL: Record<string, ToolId> = {
  KeyV: "select",
  KeyR: "rectangle",
  KeyO: "ellipse",
};

export function useToolHotkeys(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTextEditingTarget(e.target)) return;

      if (e.code === "Escape") {
        tools[useToolStore.getState().activeTool].cancel();
        return;
      }

      const id = KEY_TO_TOOL[e.code];
      if (id) activateTool(id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}