import { inflateRect, normalizeRect, type Rect } from "@/shared/canvas";
import type { ArrowElement, SceneElement } from "../model/types";
import { getBounds, getSelectionBounds } from "./bounds";
import { getHandlePoints, HANDLE_IDS, HANDLE_SIZE_PX, SELECTION_PADDING_PX } from "./handles";

const COLOR = "#6366f1";

export function drawSelection(
  ctx: CanvasRenderingContext2D,
  elements: readonly SceneElement[],
  zoom: number,
): void {
  if (elements.length === 0) return;
  ctx.save();
  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 1 / zoom;

  if (elements.length > 1) {
    ctx.setLineDash([]);

    for (const element of elements) {
      const box = inflateRect(getBounds(element), SELECTION_PADDING_PX / zoom);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
  }

  const selectionBounds = getSelectionBounds(elements);

  if (selectionBounds) {
    const box = inflateRect(selectionBounds, SELECTION_PADDING_PX / zoom);

    ctx.setLineDash(elements.length > 1 ? [6 / zoom, 4 / zoom] : []);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }
  ctx.restore();
}

export function drawMarquee(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  zoom: number,
): void {
  const { x, y, width, height } = normalizeRect(rect);
  ctx.save();
  ctx.fillStyle = "rgba(99, 102, 241, 0.08)";
  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 1 / zoom;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

export function drawHandles(ctx: CanvasRenderingContext2D, bounds: Rect, zoom: number): void {
  const size = HANDLE_SIZE_PX / zoom;
  const points = getHandlePoints(bounds, zoom);
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([]);
  for (const id of HANDLE_IDS) {
    const p = points[id];
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
  }
  ctx.restore();
}

export function drawArrowHandles(
  ctx: CanvasRenderingContext2D,
  arrow: ArrowElement,
  zoom: number,
): void {
  const radius = HANDLE_SIZE_PX / 2 / zoom;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([]);
  for (const p of [arrow.start, arrow.end]) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}