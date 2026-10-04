import type { Point } from "@/shared/canvas";

export type ToolId = "select" | "rectangle" | "ellipse";

export type ToolContext = { point: Point; zoom: number };

export type Tool = {
  onPointerDown(ctx: ToolContext): boolean;
  onPointerMove(ctx: ToolContext): void;
  onPointerUp(ctx: ToolContext): void;
  cancel(): void;
};