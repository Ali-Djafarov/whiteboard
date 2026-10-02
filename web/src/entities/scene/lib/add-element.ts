import type { Scene, SceneElement } from "../model/types";

export function addElement(scene: Scene, element: SceneElement): Scene {
  return {
    ...scene,
    elements: [...scene.elements, element],
  };
}
