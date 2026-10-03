import { useEffect, useRef, type RefObject } from "react";
import { useViewportStore } from "../model/viewportStore";
import { isInteractiveTarget } from "@/shared/lib/dom";
import { getLocalPoint } from "@/shared/canvas/pointer";

export function usePanZoom(ref: RefObject<HTMLElement | null>) {
  const spaceDown = useRef(false);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { panBy, zoomAt } = useViewportStore.getState();


    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const dx = e.deltaX * k;
      const dy = e.deltaY * k;
      if (e.ctrlKey || e.metaKey) {
         const zoomDelta = Math.max(-40, Math.min(40, dy));
         zoomAt(getLocalPoint(e, el), Math.exp(-zoomDelta * 0.01));
      } else {
        panBy(-dx, -dy);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || isInteractiveTarget(e.target)) return;
      e.preventDefault();
      spaceDown.current = true;
      if (!dragging.current) el.style.cursor = "grab";
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      spaceDown.current = false;
      if (!dragging.current) el.style.cursor = "";
    };

    const onBlur = () => {
      spaceDown.current = false;
      if (!dragging.current) el.style.cursor = "";
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [ref]);

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button === 1 || (e.button === 0 && spaceDown.current)) {
      e.preventDefault();
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.cursor = "grabbing";
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    useViewportStore
      .getState()
      .panBy(e.clientX - last.current.x, e.clientY - last.current.y);
    last.current = { x: e.clientX, y: e.clientY };
  };

  const endDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    e.currentTarget.style.cursor = spaceDown.current ? "grab" : "";
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}