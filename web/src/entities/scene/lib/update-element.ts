import type { Scene, SceneElement } from "../model/types";

export function updateElement<T extends SceneElement>(
  scene: Scene,
  id: string,
  updates: Partial<T>,
): Scene {
  return {
    ...scene,
    elements: scene.elements.map((element) =>
      element.id === id ? { ...element, ...updates } : element,
    ),
  };
}
