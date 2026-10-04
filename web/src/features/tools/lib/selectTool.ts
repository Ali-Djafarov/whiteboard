import { rectBetween, normalizeRect, type Point } from "@/shared/canvas";
import {
  elementsInRect,
  hitTestScene,
  useSceneStore,
  type Scene,
} from "@/entities/scene";
import { useToolStore } from "../model/toolStore";
import type { Tool } from "../model/types";

const HIT_TOLERANCE_PX = 6;

type State =
  { kind: "idle" } | { kind: "marquee"; origin: Point; base: string[] };

export function createSelectTool(
  getScene: () => Scene = () => useSceneStore.getState().scene,
): Tool {
  let state: State = { kind: "idle" };
  const store = () => useToolStore.getState();

  return {
    onPointerDown({ point, zoom, shiftKey }) {
      const current = store().selectedIds;
      const hit = hitTestScene(getScene(), point, HIT_TOLERANCE_PX / zoom);

      if (hit) {
        if (shiftKey) {
          store().setSelection(
            current.includes(hit.id)
              ? current.filter((id) => id !== hit.id)
              : [...current, hit.id],
          );
        } else {
          store().setSelection([hit.id]);
        }
        return true;
      }

      const base = shiftKey ? current : [];
      state = { kind: "marquee", origin: point, base };
      store().setSelection(base);
      return true;
    },

    onPointerMove({ point }) {
      if (state.kind !== "marquee") return;
      const rect = normalizeRect(rectBetween(state.origin, point));
      const inside = elementsInRect(getScene(), rect).map((e) => e.id);
      store().setMarquee(rect);
      store().setSelection([...new Set([...state.base, ...inside])]);
    },

    onPointerUp() {
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
  };
}
