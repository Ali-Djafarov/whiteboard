import { useToolStore } from "../model/toolStore";
import type { Tool, ToolId } from "../model/types";
import { createArrowTool } from "./arrowTool";
import { createPenTool } from "./penTool";
import { createSelectTool } from "./selectTool";
import { createShapeTool } from "./shapeTool";
import { createTextTool } from "./textTool";

export const tools: Record<ToolId, Tool> = {
  select: createSelectTool(),
  rectangle: createShapeTool("rectangle"),
  ellipse: createShapeTool("ellipse"),
  arrow: createArrowTool(),
  pen: createPenTool(),
text: createTextTool(),
};

export function activateTool(id: ToolId): void {
  const { activeTool, setActiveTool, setSelection } = useToolStore.getState();
  if (activeTool === id) return;
  tools[activeTool].cancel();
  if (id !== "select") setSelection([]);
  setActiveTool(id);
}
