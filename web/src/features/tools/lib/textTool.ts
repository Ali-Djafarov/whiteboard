import type { Point } from "@/shared/canvas";
import type { Tool } from "../model/types";
import { beginTextEditing } from "./textEditing";

const CLICK_TOLERANCE_PX = 3;

type State = { kind: "idle" } | { kind: "pressing"; origin: Point };

export function createTextTool(begin: typeof beginTextEditing = beginTextEditing): Tool {
  let state: State = { kind: "idle" };

  return {
    onPointerDown({ point }) {
      state = { kind: "pressing", origin: point };
      return true;
    },

    onPointerMove() {},

    onPointerUp({ point, zoom }) {
      if (state.kind !== "pressing") return;
      const { origin } = state;
      state = { kind: "idle" };
      if (Math.hypot(point.x - origin.x, point.y - origin.y) * zoom > CLICK_TOLERANCE_PX) return;
      begin(origin, zoom, { createOverShapes: true });
    },

    cancel() {
      const wasPressing = state.kind === "pressing";
      state = { kind: "idle" };
      return wasPressing;
    },
  };
}