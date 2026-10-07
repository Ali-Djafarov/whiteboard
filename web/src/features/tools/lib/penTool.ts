import { simplifyPolyline, type Point } from "@/shared/canvas";
import { sceneApi, type NewElement } from "@/entities/scene";
import { useToolStore } from "../model/toolStore";
import type { Tool } from "../model/types";

const MIN_POINT_DISTANCE_PX = 2;
const SIMPLIFY_TOLERANCE_PX = 0.75;

type State =
  | { kind: "idle" }
  | { kind: "drawing"; origin: Point; points: Point[]; last: Point };

export function createPenTool(add: (element: NewElement) => unknown = sceneApi.add): Tool {
  let state: State = { kind: "idle" };
  const showDraft = (draft: NewElement | null) => useToolStore.getState().setDraft(draft);
  const draftOf = (origin: Point, points: Point[]): NewElement => ({
    type: "free-draw",
    x: origin.x,
    y: origin.y,
    points,
  });

  return {
    onPointerDown({ point }) {
      const points = [{ x: 0, y: 0 }];
      state = { kind: "drawing", origin: point, points, last: point };
      showDraft(draftOf(point, points));
      return true;
    },

    onPointerMove({ point, zoom }) {
      if (state.kind !== "drawing") return;
      const distance = Math.hypot(point.x - state.last.x, point.y - state.last.y);
      if (distance * zoom < MIN_POINT_DISTANCE_PX) return;

      state.points.push({ x: point.x - state.origin.x, y: point.y - state.origin.y });
      state.last = point;
      showDraft(draftOf(state.origin, state.points));
    },

    onPointerUp({ zoom }) {
      if (state.kind !== "drawing") return;
      const { origin, points } = state;
      state = { kind: "idle" };
      showDraft(null);

      add({
        type: "free-draw",
        x: origin.x,
        y: origin.y,
        points: simplifyPolyline(points, SIMPLIFY_TOLERANCE_PX / zoom),
      });
    },

    cancel() {
      const wasDrawing = state.kind === "drawing";
      state = { kind: "idle" };
      showDraft(null);
      return wasDrawing;
    },
  };
}