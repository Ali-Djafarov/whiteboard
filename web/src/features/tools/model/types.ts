import type { Point } from "@/shared/canvas";

export type ToolId =
  "select" | "rectangle" | "ellipse" | "arrow" | "pen" | "text";

export type ToolContext = { point: Point; zoom: number; shiftKey: boolean };

export type Tool = {
  onPointerDown(ctx: ToolContext): boolean;
  onPointerMove(ctx: ToolContext): void;
  onPointerUp(ctx: ToolContext): void;
  cancel(): boolean;
};

export type TextEditorState = {
  session: number;
  id: string | null;
  x: number;
  y: number;
  fontSize: number;
  initialText: string;
  text: string;
};
