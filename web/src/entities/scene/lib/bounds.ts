import { normalizeRect, type Rect } from "@/shared/canvas";
import { assertNever } from "@/shared/lib/assertNever";
import type { SceneElement } from "../model/types";

export const TEXT_LINE_HEIGHT = 1.2;
const TEXT_CHAR_WIDTH = 0.6;

export function getBounds(element: SceneElement): Rect {
  switch (element.type) {
    case "rectangle":
    case "ellipse":
      return normalizeRect(element);

    case "arrow": {
      const { start, end } = element;
      return {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.abs(end.x - start.x),
        height: Math.abs(end.y - start.y),
      };
    }

    case "text": {
      const lines = element.text.split("\n");
      const longest = Math.max(...lines.map((line) => line.length));
      return {
        x: element.x,
        y: element.y,
        width: longest * element.fontSize * TEXT_CHAR_WIDTH,
        height: lines.length * element.fontSize * TEXT_LINE_HEIGHT,
      };
    }

    case "free-draw": {
      if (element.points.length === 0) {
        return { x: element.x, y: element.y, width: 0, height: 0 };
      }
      const xs = element.points.map((p) => element.x + p.x);
      const ys = element.points.map((p) => element.y + p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
    }

    default:
      return assertNever(element);
  }
}