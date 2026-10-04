import { create } from "zustand";
import {
  panBy as panViewport,
  zoomAt as zoomViewport,
  type Point,
  type Viewport,
} from "@/shared/canvas";
import { prefersReducedMotion } from "@/shared/lib/dom";
import { createZoomAnimator } from "../lib/zoomAnimator";

type ViewportState = {
  viewport: Viewport;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (point: Point, factor: number) => void;
  zoomAtSmooth: (point: Point, factor: number) => void;
};

export const useViewportStore = create<ViewportState>((set, get) => {
  const animator = createZoomAnimator({
    getViewport: () => get().viewport,
    setViewport: (viewport) => set({ viewport }),
  });

  const zoomNow = (point: Point, factor: number) => {
    animator.stop();
    set((s) => ({ viewport: zoomViewport(s.viewport, point, factor) }));
  };

  return {
    viewport: { offsetX: 0, offsetY: 0, zoom: 1 },

    panBy: (dx, dy) => {
      animator.stop();
      set((s) => ({ viewport: panViewport(s.viewport, dx, dy) }));
    },
    zoomAt: zoomNow,
    zoomAtSmooth: (point, factor) => {
      if (prefersReducedMotion()) {
        zoomNow(point, factor);
        return;
      }
      animator.zoomAt(point, factor);
    },
  };
});
