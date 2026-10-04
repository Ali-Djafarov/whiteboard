import { useToolStore } from "../model/toolStore";
import type { Tool, ToolId } from "../model/types";
import { createShapeTool } from "./shapeTool";

const idleTool: Tool = {
  onPointerDown: () => false,
  onPointerMove() {},
  onPointerUp() {},
  cancel() {},
};

export const tools: Record<ToolId, Tool> = {
  select: idleTool,
  rectangle: createShapeTool("rectangle"),
  ellipse: createShapeTool("ellipse"),
};

export function activateTool(id: ToolId): void {
  const { activeTool, setActiveTool } = useToolStore.getState();
  if (activeTool === id) return;
  // смена инструмента посреди жеста не должна оставлять черновик
  tools[activeTool].cancel(); 
  setActiveTool(id);
}