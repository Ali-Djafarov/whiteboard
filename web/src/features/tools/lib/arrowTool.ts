import { snapAngle, type Point } from "@/shared/canvas";
import { sceneApi, type NewElement } from "@/entities/scene";
import { useToolStore } from "../model/toolStore";
import type { Tool } from "../model/types";

const MIN_LENGTH_PX = 4;
const SNAP_STEP_DEGREES = 15;

type State = { kind: "idle" } | { kind: "drawing"; origin: Point };

export function createArrowTool(
  add: (element: NewElement) => unknown = sceneApi.add,
): Tool {
  let state: State = { kind: "idle" };

  const showDraft = (draft: NewElement | null) =>
    useToolStore.getState().setDraft(draft);
  const endPoint = (origin: Point, point: Point, shiftKey: boolean): Point =>
    shiftKey ? snapAngle(origin, point, SNAP_STEP_DEGREES) : point;

  return {
    onPointerDown({ point }) {
      state = { kind: "drawing", origin: point };
      showDraft({ type: "arrow", start: point, end: point });
      return true;
    },

    onPointerMove({ point, shiftKey }) {
      if (state.kind !== "drawing") return;
      showDraft({
        type: "arrow",
        start: state.origin,
        end: endPoint(state.origin, point, shiftKey),
      });
    },

    onPointerUp({ point, zoom, shiftKey }) {
      if (state.kind !== "drawing") return;
      const start = state.origin;
      const end = endPoint(start, point, shiftKey);
      state = { kind: "idle" };
      showDraft(null);

      if (Math.hypot(end.x - start.x, end.y - start.y) * zoom < MIN_LENGTH_PX)
        return;

      add({ type: "arrow", start, end });
    },

    cancel() {
      const wasDrawing = state.kind === "drawing";
      state = { kind: "idle" };
      showDraft(null);
      return wasDrawing;
    },
  };
}
