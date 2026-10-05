import {
  rectBetween,
  normalizeRect,
  type Point,
  pointInRect,
  inflateRect,
} from "@/shared/canvas";
import {
  elementsInRect,
  hitTestScene,
  sceneApi,
  useSceneStore,
  type Scene,
  type SceneElement,
} from "@/entities/scene";
import { useToolStore } from "../model/toolStore";
import type { Tool } from "../model/types";
import { getMovePatch } from "@/entities/scene/lib/getMovePatch";
import {
  hitTestAnyElement,
  hitTestMoveScene,
} from "@/entities/scene/lib/hitTest";
import { getSelectionBounds } from "@/entities/scene/lib/bounds";

const HIT_TOLERANCE_PX = 6;

type State =
  | { kind: "idle" }
  | { kind: "marquee"; origin: Point; base: string[] }
  | {
      kind: "moving";
      origin: Point;
      elements: SceneElement[];
    };

export function createSelectTool(
  getScene: () => Scene = () => useSceneStore.getState().scene,
): Tool {
  let state: State = { kind: "idle" };
  const store = () => useToolStore.getState();

  return {
    onPointerDown({ point, zoom, shiftKey }) {
      const scene = getScene();
      const current = store().selectedIds;
      const tolerance = HIT_TOLERANCE_PX / zoom;
      const hit = hitTestScene(scene, point, HIT_TOLERANCE_PX / zoom);

      if (shiftKey) {
        if (!hit) return true;

        const nextSelection = current.includes(hit.id)
          ? current.filter((id) => id !== hit.id)
          : [...current, hit.id];

        store().setSelection(nextSelection);

        return true;
      }

      if (hit) {
        const nextSelection = current.includes(hit.id) ? current : [hit.id];
        store().setSelection(nextSelection);
        const selectedElements = scene.elements.filter((element) =>
          nextSelection.includes(element.id),
        );
        state = {
          kind: "moving",
          origin: point,
          elements: selectedElements,
        };
        return true;
      }

      const moveHit = hitTestMoveScene(scene, point, tolerance, current);
      if (moveHit) {
        const selectedElements = scene.elements.filter((element) =>
          current.includes(element.id),
        );
        state = {
          kind: "moving",
          origin: point,
          elements: selectedElements,
        };
        return true;
      }

      const anyHit = hitTestAnyElement(scene, point, tolerance);

      if (anyHit) {
        return true;
      }

      if (current.length > 0) {
        const selectedElements = scene.elements.filter((element) =>
          current.includes(element.id),
        );
        const selectionBounds = getSelectionBounds(selectedElements);

        if (
          selectionBounds &&
          pointInRect(point, inflateRect(selectionBounds, tolerance))
        ) {
          state = {
            kind: "moving",
            origin: point,
            elements: selectedElements,
          };
          return true;
        }
      }
      state = {
        kind: "marquee",
        origin: point,
        base: [],
      };

      store().setSelection([]);
      return true;
    },

    onPointerMove({ point }) {
      if (state.kind === "moving") {
        const dx = point.x - state.origin.x;
        const dy = point.y - state.origin.y;

        for (const element of state.elements) {
          sceneApi.update(element.id, getMovePatch(element, dx, dy));
        }

        return;
      }

      if (state.kind !== "marquee") return;
      const rect = normalizeRect(rectBetween(state.origin, point));
      const inside = elementsInRect(getScene(), rect).map((e) => e.id);
      store().setMarquee(rect);
      store().setSelection([...new Set([...state.base, ...inside])]);
    },

    onPointerUp() {
      if (state.kind === "moving") {
        state = { kind: "idle" };
        return;
      }

      if (state.kind !== "marquee") return;
      state = { kind: "idle" };
      store().setMarquee(null);
    },

    cancel() {
      if (state.kind !== "marquee") return false;
      store().setSelection(state.base);
      store().setMarquee(null);
      state = { kind: "idle" };
      return true;
    },
    isMoveTarget({ point, zoom }) {
      const scene = getScene();
      const selectedIds = store().selectedIds;
      const tolerance = HIT_TOLERANCE_PX / zoom;
      const boundaryHit = hitTestScene(scene, point, tolerance);

      if (boundaryHit) {
        return true;
      }

      const moveHit = hitTestMoveScene(scene, point, tolerance, selectedIds);
      if (moveHit) {
        return true;
      }

      const anyHit = hitTestAnyElement(scene, point, tolerance);
      if (anyHit) {
        return false;
      }
      if (selectedIds.length > 0) {
        const selectedElements = scene.elements.filter((element) =>
          selectedIds.includes(element.id),
        );

        const selectionBounds = getSelectionBounds(selectedElements);
        if (
          selectionBounds &&
          pointInRect(point, inflateRect(selectionBounds, tolerance))
        ) {
          return true;
        }
      }

      return false;
    },
  };
}
