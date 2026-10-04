import { inflateRect, normalizeRect, type Rect } from "@/shared/canvas";
import type { SceneElement } from "../model/types";
import { getBounds } from "./bounds";

const COLOR = "#6366f1";
const PADDING_PX = 6;

export function drawSelection(
  ctx: CanvasRenderingContext2D,
  elements: readonly SceneElement[],
  zoom: number,
): void {
  ctx.save();
  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([]);
  for (const element of elements) {
    const box = inflateRect(getBounds(element), PADDING_PX / zoom);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }
  ctx.restore();
}

export function drawMarquee(ctx: CanvasRenderingContext2D, rect: Rect, zoom: number): void {
  const { x, y, width, height } = normalizeRect(rect);
  ctx.save();
  ctx.fillStyle = "rgba(99, 102, 241, 0.08)";
  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 1 / zoom;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}