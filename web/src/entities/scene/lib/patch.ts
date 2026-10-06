import type { ElementPatch } from "../model/sceneDoc";
import type { SceneElement } from "../model/types";

export function applyPatch(
  element: SceneElement,
  patch: ElementPatch,
): SceneElement {
  return { ...element, ...patch } as SceneElement;
}
