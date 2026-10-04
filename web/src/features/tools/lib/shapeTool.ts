import { normalizeRect, type Point, type Rect } from "@/shared/canvas";
import { sceneApi, type NewElement } from "@/entities/scene";
import { useToolStore } from "../model/toolStore";
import type { Tool } from "../model/types";

const MIN_SIZE_PX = 4;

type ShapeType = "rectangle" | "ellipse";
type State = { kind: "idle" } | { kind: "drawing"; origin: Point };

const rectBetween = (a: Point, b: Point): Rect => ({
  x: a.x,
  y: a.y,
  width: b.x - a.x,
  height: b.y - a.y,
});

export function createShapeTool(
  type: ShapeType,
  add: (element: NewElement) => unknown = sceneApi.add,
): Tool {
  let state: State = { kind: "idle" };

  const setDraft = (draft: NewElement | null) => useToolStore.getState().setDraft(draft);

  return {
    onPointerDown({ point }) {
      state = { kind: "drawing", origin: point };
      setDraft({ type, ...rectBetween(point, point) });
      return true;
    },

    onPointerMove({ point }) {
      if (state.kind !== "drawing") return;
      setDraft({ type, ...rectBetween(state.origin, point) });
    },

    onPointerUp({ point, zoom }) {
      if (state.kind !== "drawing") return;
      const rect = rectBetween(state.origin, point);
      state = { kind: "idle" };
      setDraft(null);
      if (Math.max(Math.abs(rect.width), Math.abs(rect.height)) * zoom < MIN_SIZE_PX) return;
      add({ type, ...normalizeRect(rect) });
    },

    cancel() {
      state = { kind: "idle" };
      setDraft(null);
    },
  };
}