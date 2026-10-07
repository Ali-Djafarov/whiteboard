import { normalizeRect, type Point } from "@/shared/canvas";
import { assertNever } from "@/shared/lib/assertNever";
import type { NewElement } from "../model/sceneDoc";
import { textFont } from "./textMetrics";
import { TEXT_LINE_HEIGHT } from "./bounds";

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
      ctx.font = textFont(element.fontSize);
      ctx.fillStyle = "#000000";
      ctx.textBaseline = "top";
      element.text.split("\n").forEach((line, i) => {
        ctx.fillText(
          line,
          element.x,
          element.y + i * element.fontSize * TEXT_LINE_HEIGHT,
        );
      });
      ctx.restore();
      break;
    }
    case "free-draw": {
      const points = element.points.map((p) => ({
        x: element.x + p.x,
        y: element.y + p.y,
      }));
      const [first] = points;
      if (!first) break;

      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      if (points.length === 1) ctx.lineTo(first.x, first.y);

      for (let i = 1; i < points.length - 1; i++) {
        const p = points[i];
        const next = points[i + 1];
        if (!p || !next) continue;
        ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
      }
      const last = points[points.length - 1];
      if (last && points.length > 1) ctx.lineTo(last.x, last.y);

      ctx.stroke();
      ctx.restore();
      break;
    }
    default:
      assertNever(element);
  }
}
