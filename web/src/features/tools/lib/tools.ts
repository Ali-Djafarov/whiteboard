import { useToolStore } from "../model/toolStore";
import type { Tool, ToolId } from "../model/types";
import { createSelectTool } from "./selectTool";
import { createShapeTool } from "./shapeTool";

export const tools: Record<ToolId, Tool> = {
  select: createSelectTool(),
  rectangle: createShapeTool("rectangle"),
  ellipse: createShapeTool("ellipse"),
};

export function activateTool(id: ToolId): void {
  const { activeTool, setActiveTool, setSelection } = useToolStore.getState();
  if (activeTool === id) return;
  tools[activeTool].cancel();
  if (id !== "select") setSelection([]); 
  setActiveTool(id);
}
