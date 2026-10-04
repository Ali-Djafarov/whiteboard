import {
  distanceToSegment,
  inflateRect,
  normalizeRect,
  pointInRect,
  rectContainsRect,
  type Point,
  type Rect,
} from "@/shared/canvas";
import { assertNever } from "@/shared/lib/assertNever";
import type { Scene, SceneElement } from "../model/types";
import { getBounds } from "./bounds";

export function hitTestElement(
  element: SceneElement,
  point: Point,
  tolerance: number,
): boolean {
  switch (element.type) {
    case "rectangle": {
      const rect = normalizeRect(element);
      if (!pointInRect(point, inflateRect(rect, tolerance))) return false;
      const inner = inflateRect(rect, -tolerance);
      return (
        inner.width <= 0 || inner.height <= 0 || !pointInRect(point, inner)
      );
    }

    case "ellipse": {
      const rect = normalizeRect(element);
      const a = rect.width / 2;
      const b = rect.height / 2;
      if (a <= 0 || b <= 0)
        return pointInRect(point, inflateRect(rect, tolerance));
      const d = Math.hypot(
        (point.x - (rect.x + a)) / a,
        (point.y - (rect.y + b)) / b,
      );
      return Math.abs(d - 1) * Math.min(a, b) <= tolerance;
    }

    case "arrow":
      return distanceToSegment(point, element.start, element.end) <= tolerance;

    case "text":
      return pointInRect(point, inflateRect(getBounds(element), tolerance));

    case "free-draw": {
      const absolute = element.points.map((p) => ({
        x: element.x + p.x,
        y: element.y + p.y,
      }));
      const [first] = absolute;
      if (!first) return false;
      if (absolute.length === 1)
        return distanceToSegment(point, first, first) <= tolerance;
      return absolute.some(
        (p, i) =>
          i > 0 &&
          distanceToSegment(point, absolute[i - 1] ?? p, p) <= tolerance,
      );
    }

    default:
      return assertNever(element);
  }
}

export function hitTestScene(
  scene: Scene,
  point: Point,
  tolerance: number,
): SceneElement | null {
  for (let i = scene.elements.length - 1; i >= 0; i--) {
    const element = scene.elements[i];
    if (element && hitTestElement(element, point, tolerance)) return element;
  }
  return null;
}

export function elementsInRect(scene: Scene, rect: Rect): SceneElement[] {
  return scene.elements.filter((element) =>
    rectContainsRect(rect, getBounds(element)),
  );
}
