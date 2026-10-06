import { inflateRect, type Point, type Rect } from "@/shared/canvas";
import type { ArrowElement } from "../model/types";

export type HandleId = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
export type ArrowEnd = "start" | "end";

export const HANDLE_IDS: readonly HandleId[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];
export const SELECTION_PADDING_PX = 6;
export const HANDLE_SIZE_PX = 8;
const HANDLE_HIT_PX = 12;

export function getHandlePoints(
  bounds: Rect,
  zoom: number,
): Record<HandleId, Point> {
  const box = inflateRect(bounds, SELECTION_PADDING_PX / zoom);
  const right = box.x + box.width;
  const bottom = box.y + box.height;
  const midX = box.x + box.width / 2;
  const midY = box.y + box.height / 2;
  return {
    nw: { x: box.x, y: box.y },
    n: { x: midX, y: box.y },
    ne: { x: right, y: box.y },
    e: { x: right, y: midY },
    se: { x: right, y: bottom },
    s: { x: midX, y: bottom },
    sw: { x: box.x, y: bottom },
    w: { x: box.x, y: midY },
  };
}

export function hitTestHandle(
  bounds: Rect,
  point: Point,
  zoom: number,
): HandleId | null {
  const points = getHandlePoints(bounds, zoom);
  const half = HANDLE_HIT_PX / 2 / zoom;
  for (const id of HANDLE_IDS) {
    const p = points[id];
    if (Math.abs(point.x - p.x) <= half && Math.abs(point.y - p.y) <= half)
      return id;
  }
  return null;
}

export function resizeRect(
  original: Rect,
  handle: HandleId,
  dx: number,
  dy: number,
  minSize = 0,
): Rect {
  let left = original.x;
  let right = original.x + original.width;
  let top = original.y;
  let bottom = original.y + original.height;

  if (handle.includes("w")) left += dx;
  if (handle.includes("e")) right += dx;
  if (handle.includes("n")) top += dy;
  if (handle.includes("s")) bottom += dy;

  if (minSize > 0) {
    if (handle.includes("w") || handle.includes("e")) {
      const width = right - left;
      if (Math.abs(width) < minSize) {
        const signed = width < 0 ? -minSize : minSize;
        if (handle.includes("w")) left = right - signed;
        else right = left + signed;
      }
    }
    if (handle.includes("n") || handle.includes("s")) {
      const height = bottom - top;
      if (Math.abs(height) < minSize) {
        const signed = height < 0 ? -minSize : minSize;
        if (handle.includes("n")) top = bottom - signed;
        else bottom = top + signed;
      }
    }
  }

  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function hitTestArrowHandle(
  arrow: ArrowElement,
  point: Point,
  zoom: number,
): ArrowEnd | null {
  const radius = HANDLE_HIT_PX / 2 / zoom;
  for (const end of ["end", "start"] as const) {
    const p = arrow[end];
    if (Math.hypot(point.x - p.x, point.y - p.y) <= radius) return end;
  }
  return null;
}
