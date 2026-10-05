import type { ElementPatch } from "../model/sceneDoc";
import type { SceneElement } from "../model/types";

export function getMovePatch(
  element: SceneElement,
  dx: number,
  dy: number,
): ElementPatch {
  switch (element.type) {
    case "rectangle":
    case "ellipse":
    case "text":
    case "free-draw":
      return {
        x: element.x + dx,
        y: element.y + dy,
      };

    case "arrow":
      return {
        start: {
          x: element.start.x + dx,
          y: element.start.y + dy,
        },
        end: {
          x: element.end.x + dx,
          y: element.end.y + dy,
        },
      };
  }
}
