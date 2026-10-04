import { normalizeRect, type Point } from "@/shared/canvas";
import { assertNever } from "@/shared/lib/assertNever";
import type { NewElement } from "../model/sceneDoc";

const ARROW_HEAD = 14;

function drawArrow(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
): void {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  for (const side of [-1, 1]) {
    const a = angle + Math.PI + side * (Math.PI / 6);
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x + ARROW_HEAD * Math.cos(a),
      end.y + ARROW_HEAD * Math.sin(a),
    );
  }
  ctx.stroke();
}

export function drawElement(
  ctx: CanvasRenderingContext2D,
  element: NewElement,
): void {
  switch (element.type) {
    case "rectangle": {
      const { x, y, width, height } = normalizeRect(element);
      ctx.strokeRect(x, y, width, height);
      break;
    }
    case "ellipse": {
      const { x, y, width, height } = normalizeRect(element);
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
    }
    case "arrow":
      drawArrow(ctx, element.start, element.end);
      break;
    case "text": {
      ctx.save();
      ctx.font = `${element.fontSize}px system-ui, sans-serif`;
      ctx.textBaseline = "top";
      element.text.split("\n").forEach((line, i) => {
        ctx.fillText(line, element.x, element.y + i * element.fontSize * 1.2);
      });
      ctx.restore();
      break;
    }
    case "free-draw": {
      const [first, ...rest] = element.points;
      if (!first) break;
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(element.x + first.x, element.y + first.y);
      if (rest.length === 0)
        ctx.lineTo(element.x + first.x, element.y + first.y);
      for (const p of rest) ctx.lineTo(element.x + p.x, element.y + p.y);
      ctx.stroke();
      ctx.restore();
      break;
    }
    default:
      assertNever(element);
  }
}
