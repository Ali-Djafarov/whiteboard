import { useEffect, type RefObject } from "react";
import {
  getLocalPoint,
  screenToWorld,
  type Point,
  type Viewport,
} from "@/shared/canvas";
import { publishCursor } from "./useCollaboration";

const INTERVAL_MS = 40;

export function usePublishCursor(
  ref: RefObject<HTMLElement | null>,
  getViewport: () => Viewport,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let pending: Point | null = null;
    let lastSent = 0;
    let timer = 0;

    const flush = () => {
      timer = 0;
      if (!pending) return;
      publishCursor(pending);
      pending = null;
      lastSent = performance.now();
    };

    const onMove = (e: PointerEvent) => {
      pending = screenToWorld(getLocalPoint(e, el), getViewport());
      const wait = INTERVAL_MS - (performance.now() - lastSent);
      if (wait <= 0) flush();
      else if (!timer) timer = window.setTimeout(flush, wait);
    };

    const onVisibilityChange = () => {
      if (document.hidden) hide();
    };

    const hide = () => {
      pending = null;
      window.clearTimeout(timer);
      timer = 0;
      publishCursor(null);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearTimeout(timer);
    };
  }, [ref, getViewport]);
}
