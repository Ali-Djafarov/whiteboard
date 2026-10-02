import type { Scene } from "../model/types";

export function removeElement(scene: Scene, id: string): Scene {
  return {
    ...scene,
    elements: scene.elements.filter((element) => element.id !== id),
  };
}
