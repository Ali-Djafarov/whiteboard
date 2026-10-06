import {
  normalizeRect,
  rectBetween,
  type Point,
  type Rect,
} from "@/shared/canvas";
import {
  elementsInRect,
  getMovePatch,
  getSelectionBounds,
  hitTestArrowHandle,
  hitTestHandle,
  rectTransform,
  resizeRect,
  resolvePressTarget,
  scaleElementPatch,
  sceneApi,
  useSceneStore,
  type ArrowElement,
  type ArrowEnd,
  type ElementPatch,
  type HandleId,
  type Scene,
  type SceneElement,
} from "@/entities/scene";
import { useToolStore } from "../model/toolStore";
import type { Tool } from "../model/types";

const HIT_TOLERANCE_PX = 6;
const DRAG_THRESHOLD_PX = 3;
const MIN_RESIZE_PX = 4;

const HANDLE_CURSORS: Record<HandleId, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
};

type Patches = Readonly<Record<string, ElementPatch>>;

type ResizeTarget = { elements: SceneElement[]; bounds: Rect };

type State =
  | { kind: "idle" }
  | { kind: "marquee"; origin: Point; base: string[] }
  | {
      kind: "moving";
      origin: Point;
      elements: SceneElement[];
      pressedId: string | null;
      moved: boolean;
    }
  | {
      kind: "resizing";
      handle: HandleId;
      origin: Point;
      start: Rect;
      elements: SceneElement[];
    }
  | {
      kind: "editing-arrow";
      arrow: ArrowElement;
      end: ArrowEnd;
      origin: Point;
    };

export function createSelectTool(
  getScene: () => Scene = () => useSceneStore.getState().scene,
  commit: (patches: Patches) => void = sceneApi.updateMany,
): Tool {
  let state: State = { kind: "idle" };
  const store = () => useToolStore.getState();

  const getSingleArrow = (scene: Scene): ArrowElement | null => {
    const { selectedIds } = store();
    const [id] = selectedIds;
    if (selectedIds.length !== 1 || id === undefined) return null;
    const element = scene.elements.find((e) => e.id === id);
    return element?.type === "arrow" ? element : null;
  };

  const getResizeTarget = (scene: Scene): ResizeTarget | null => {
    if (getSingleArrow(scene)) return null;
    const ids = new Set(store().selectedIds);
    if (ids.size === 0) return null;
    const elements = scene.elements.filter((e) => ids.has(e.id));
    const bounds = getSelectionBounds(elements);
    return bounds ? { elements, bounds } : null;
  };

  const movePatches = (
    elements: readonly SceneElement[],
    dx: number,
    dy: number,
  ): Patches => {
    const patches: Record<string, ElementPatch> = {};
    for (const element of elements)
      patches[element.id] = getMovePatch(element, dx, dy);
    return patches;
  };

  const resizePatches = (
    s: Extract<State, { kind: "resizing" }>,
    point: Point,
    zoom: number,
  ): Patches => {
    const next = resizeRect(
      s.start,
      s.handle,
      point.x - s.origin.x,
      point.y - s.origin.y,
      MIN_RESIZE_PX / zoom,
    );
    const transform = rectTransform(s.start, next);
    const patches: Record<string, ElementPatch> = {};
    for (const element of s.elements)
      patches[element.id] = scaleElementPatch(element, transform);
    return patches;
  };

  const arrowPatches = (
    s: Extract<State, { kind: "editing-arrow" }>,
    point: Point,
  ): Patches => {
    const moved = {
      x: s.arrow[s.end].x + point.x - s.origin.x,
      y: s.arrow[s.end].y + point.y - s.origin.y,
    };
    return {
      [s.arrow.id]: s.end === "start" ? { start: moved } : { end: moved },
    };
  };

  const hoverCursor = (point: Point, zoom: number): string | null => {
    const scene = getScene();

    const arrow = getSingleArrow(scene);
    if (arrow && hitTestArrowHandle(arrow, point, zoom)) return "crosshair";

    const target = getResizeTarget(scene);
    if (target) {
      const handle = hitTestHandle(target.bounds, point, zoom);
      if (handle) return HANDLE_CURSORS[handle];
    }

    const press = resolvePressTarget(
      scene,
      point,
      HIT_TOLERANCE_PX / zoom,
      store().selectedIds,
    );
    return press.kind === "empty" ? null : "move";
  };

  return {
    onPointerDown({ point, zoom, shiftKey }) {
      const scene = getScene();
      const current = store().selectedIds;

      const arrow = getSingleArrow(scene);
      if (arrow) {
        const end = hitTestArrowHandle(arrow, point, zoom);
        if (end) {
          state = { kind: "editing-arrow", arrow, end, origin: point };
          store().setCursor("crosshair");
          return true;
        }
      }

      const resizeTarget = getResizeTarget(scene);
      if (resizeTarget) {
        const handle = hitTestHandle(resizeTarget.bounds, point, zoom);
        if (handle) {
          state = {
            kind: "resizing",
            handle,
            origin: point,
            start: resizeTarget.bounds,
            elements: resizeTarget.elements,
          };
          store().setCursor(HANDLE_CURSORS[handle]);
          return true;
        }
      }

      const target = resolvePressTarget(
        scene,
        point,
        HIT_TOLERANCE_PX / zoom,
        current,
      );

      if (shiftKey) {
        if (target.kind === "outline") {
          const id = target.element.id;
          store().setSelection(
            current.includes(id)
              ? current.filter((x) => x !== id)
              : [...current, id],
          );
        } else if (target.kind === "empty") {
          state = { kind: "marquee", origin: point, base: current };
        }
        return true;
      }

      if (target.kind === "outline") {
        const id = target.element.id;
        const wasSelected = current.includes(id);
        const ids = wasSelected ? current : [id];
        store().setSelection(ids);
        state = {
          kind: "moving",
          origin: point,
          elements: scene.elements.filter((e) => ids.includes(e.id)),
          pressedId: wasSelected ? id : null,
          moved: false,
        };
        return true;
      }

      if (target.kind === "selection") {
        state = {
          kind: "moving",
          origin: point,
          elements: scene.elements.filter((e) => current.includes(e.id)),
          pressedId: null,
          moved: false,
        };
        return true;
      }

      state = { kind: "marquee", origin: point, base: [] };
      store().setSelection([]);
      return true;
    },

    onPointerMove({ point, zoom }) {
      switch (state.kind) {
        case "idle":
          store().setCursor(hoverCursor(point, zoom));
          return;

        case "marquee": {
          const rect = normalizeRect(rectBetween(state.origin, point));
          const inside = elementsInRect(getScene(), rect).map((e) => e.id);
          store().setMarquee(rect);
          store().setSelection([...new Set([...state.base, ...inside])]);
          return;
        }

        case "moving": {
          const dx = point.x - state.origin.x;
          const dy = point.y - state.origin.y;
          if (!state.moved && Math.hypot(dx, dy) * zoom < DRAG_THRESHOLD_PX)
            return;
          state.moved = true;
          store().setCursor("move");
          store().setPreview(movePatches(state.elements, dx, dy));
          return;
        }

        case "resizing":
          store().setPreview(resizePatches(state, point, zoom));
          return;

        case "editing-arrow":
          store().setPreview(arrowPatches(state, point));
          return;
      }
    },

    onPointerUp({ point, zoom }) {
      const s = state;
      state = { kind: "idle" };

      switch (s.kind) {
        case "idle":
          return;
        case "marquee":
          store().setMarquee(null);
          return;
        case "moving":
          if (s.moved) {
            commit(
              movePatches(
                s.elements,
                point.x - s.origin.x,
                point.y - s.origin.y,
              ),
            );
          } else if (s.pressedId && s.elements.length > 1) {
            store().setSelection([s.pressedId]);
          }
          break;
        case "resizing":
          if (point.x !== s.origin.x || point.y !== s.origin.y) {
            commit(resizePatches(s, point, zoom));
          }
          break;
        case "editing-arrow":
          if (point.x !== s.origin.x || point.y !== s.origin.y)
            commit(arrowPatches(s, point));
          break;
      }

      store().setPreview({});
      store().setCursor(null);
    },

    cancel() {
      const s = state;
      state = { kind: "idle" };

      switch (s.kind) {
        case "idle":
          return false;
        case "marquee":
          store().setSelection(s.base);
          store().setMarquee(null);
          return true;
        case "moving":
        case "resizing":
        case "editing-arrow":
          store().setPreview({});
          store().setCursor(null);
          return true;
      }
    },
  };
}
