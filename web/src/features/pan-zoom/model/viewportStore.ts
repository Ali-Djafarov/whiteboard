import { create } from "zustand";
import { panBy, zoomAt, type Viewport } from "@/shared/canvas/viewport";
import type { Point } from "@/shared/canvas/geometry";

type ViewportState = {
  viewport: Viewport;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (point: Point, factor: number) => void;
};

export const useViewportStore = create<ViewportState>((set) => ({
  viewport: { offsetX: 0, offsetY: 0, zoom: 1 },
  panBy: (dx, dy) => set((s) => ({ viewport: panBy(s.viewport, dx, dy) })),
  zoomAt: (point, factor) => set((s) => ({ viewport: zoomAt(s.viewport, point, factor) })),
}));