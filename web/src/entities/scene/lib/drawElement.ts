import { normalizeRect } from "@/shared/canvas/geometry";
import { assertNever } from "@/shared/lib/assertNever";
import type { SceneElement } from "../model/types";

export function drawElement(
  ctx: CanvasRenderingContext2D,
  element: SceneElement,
): void {
  const { x, y, width, height } = normalizeRect(element);

  switch (element.type) {
    case "rectangle":
      ctx.strokeRect(x, y, width, height);
      break;
    case "ellipse":
      ctx.beginPath();
      ctx.ellipse(
        x + width / 2,
        y + height / 2,
        width / 2,
        height / 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      break;
    default:
      assertNever(element);
  }
}
