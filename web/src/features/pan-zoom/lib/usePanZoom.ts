import { useEffect, type RefObject } from "react";
import { useViewportStore } from "../model/viewportStore";
import { isInteractiveTarget } from "@/shared/lib/dom";

export function usePanZoom(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { panBy, zoomAt } = useViewportStore.getState();
    let spaceDown = false;
    let dragging = false;
    let last = { x: 0, y: 0 };

    const toLocal = (e: { clientX: number; clientY: number }) => {
      const rect = el.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(toLocal(e), Math.exp(-e.deltaY * 0.01));
      } else {
        panBy(-e.deltaX, -e.deltaY);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 1 || (e.button === 0 && spaceDown)) {
        e.preventDefault();
        dragging = true;
        last = { x: e.clientX, y: e.clientY };
        el.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      panBy(e.clientX - last.x, e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.releasePointerCapture(e.pointerId);
      el.style.cursor = spaceDown ? "grab" : "";
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || isInteractiveTarget(e.target)) return;
      e.preventDefault();
      spaceDown = true;
      if (!dragging) el.style.cursor = "grab";
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      spaceDown = false;
      if (!dragging) el.style.cursor = "";
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [ref]);
}
