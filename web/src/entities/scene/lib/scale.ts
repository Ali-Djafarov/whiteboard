import type { Rect } from "@/shared/canvas";
import { assertNever } from "@/shared/lib/assertNever";
import type { ElementPatch } from "../model/sceneDoc";
import type { SceneElement } from "../model/types";
import { getBounds } from "./bounds";

export type Transform = { sx: number; sy: number; tx: number; ty: number };

const MIN_FONT_SIZE = 1;

export function rectTransform(from: Rect, to: Rect): Transform {
  const sx = from.width === 0 ? 1 : to.width / from.width;
  const sy = from.height === 0 ? 1 : to.height / from.height;
  return {
    sx,
    sy,
    tx: from.width === 0 ? 0 : to.x - from.x * sx,
    ty: from.height === 0 ? 0 : to.y - from.y * sy,
  };
}

const mapX = (t: Transform, x: number) => t.sx * x + t.tx;
const mapY = (t: Transform, y: number) => t.sy * y + t.ty;

export function scaleElementPatch(
  element: SceneElement,
  t: Transform,
): ElementPatch {
  switch (element.type) {
    case "rectangle":
    case "ellipse":
    case "text": {
      const b = getBounds(element);
      const x1 = mapX(t, b.x);
      const x2 = mapX(t, b.x + b.width);
      const y1 = mapY(t, b.y);
      const y2 = mapY(t, b.y + b.height);
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);

      if (element.type === "text") {
        const fontSize = element.fontSize * Math.sqrt(Math.abs(t.sx * t.sy));
        return { x, y, fontSize: Math.max(MIN_FONT_SIZE, fontSize) };
      }
      return { x, y, width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };
    }

    case "arrow":
      return {
        start: { x: mapX(t, element.start.x), y: mapY(t, element.start.y) },
        end: { x: mapX(t, element.end.x), y: mapY(t, element.end.y) },
      };

    case "free-draw":
      return {
        x: mapX(t, element.x),
        y: mapY(t, element.y),
        points: element.points.map((p) => ({ x: p.x * t.sx, y: p.y * t.sy })),
      };

    default:
      return assertNever(element);
  }
}
