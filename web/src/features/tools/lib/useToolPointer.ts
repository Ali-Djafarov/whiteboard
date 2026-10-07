import { type RefObject } from "react";
import { getLocalPoint } from "@/shared/canvas";
import { screenToWorld, type Viewport } from "@/shared/canvas";
import { useToolStore } from "../model/toolStore";
import type { ToolContext } from "../model/types";
import { tools } from "./tools";
import { beginTextEditing } from "./textEditing";

type PointerEvent = React.PointerEvent<HTMLElement>;

export function useToolPointer(
  ref: RefObject<HTMLElement | null>,
  getViewport: () => Viewport,
) {
  const toContext = (e: PointerEvent): ToolContext | null => {
    const el = ref.current;
    if (!el) return null;
    const viewport = getViewport();
    return {
      point: screenToWorld(getLocalPoint(e, el), viewport),
      zoom: viewport.zoom,
      shiftKey: e.shiftKey,
    };
  };

  const activeTool = () => tools[useToolStore.getState().activeTool];

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const ctx = toContext(e);
    if (!ctx) return;
    if (activeTool().onPointerDown(ctx))
      e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    const ctx = toContext(e);
    if (ctx) activeTool().onPointerMove(ctx);
  };

  const onPointerUp = (e: PointerEvent) => {
    const ctx = toContext(e);
    if (!ctx) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    activeTool().onPointerUp(ctx);
  };

  const onPointerCancel = () => activeTool().cancel();

  const onDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (useToolStore.getState().activeTool !== "select") return;
    const el = ref.current;
    if (!el) return;
    const viewport = getViewport();
    const point = screenToWorld(getLocalPoint(e, el), viewport);
    beginTextEditing(point, viewport.zoom, { createOverShapes: false });
  };
  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onDoubleClick,
  };
}
