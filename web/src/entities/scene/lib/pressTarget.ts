import { inflateRect, pointInRect, type Point } from "@/shared/canvas";
import type { Scene, SceneElement } from "../model/types";
import { getSelectionBounds } from "./bounds";
import { hitTestScene } from "./hitTest";

export type PressTarget =
  | { kind: "outline"; element: SceneElement }
  | { kind: "selection" }
  | { kind: "empty" };

export function resolvePressTarget(
  scene: Scene,
  point: Point,
  tolerance: number,
  selectedIds: readonly string[],
): PressTarget {
  const outline = hitTestScene(scene, point, tolerance);
  if (outline) return { kind: "outline", element: outline };
  if (selectedIds.length === 0) return { kind: "empty" };

  const ids = new Set(selectedIds);
  if (hitTestScene(scene, point, tolerance, { mode: "area", ids }))
    return { kind: "selection" };

  if (selectedIds.length > 1) {
    const bounds = getSelectionBounds(
      scene.elements.filter((e) => ids.has(e.id)),
    );
    if (bounds && pointInRect(point, inflateRect(bounds, tolerance)))
      return { kind: "selection" };
  }
  return { kind: "empty" };
}
