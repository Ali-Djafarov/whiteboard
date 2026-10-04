import {
  clampZoom,
  screenToWorld,
  stepZoomToward,
  type Point,
  type Viewport,
  type ZoomTarget,
} from "@/shared/canvas";

export const ZOOM_TAU_MS = 90;
const MAX_FRAME_MS = 50;

type Deps = {
  getViewport: () => Viewport;
  setViewport: (viewport: Viewport) => void;
  requestFrame?: (callback: (time: number) => void) => number;
  cancelFrame?: (id: number) => void;
  now?: () => number;
  tauMs?: number;
};

export function createZoomAnimator({
  getViewport,
  setViewport,
  requestFrame = (callback) => requestAnimationFrame(callback),
  cancelFrame = (id) => cancelAnimationFrame(id),
  now = () => performance.now(),
  tauMs = ZOOM_TAU_MS,
}: Deps) {
  let target: ZoomTarget | null = null;
  let frame = 0;
  let last = 0;

  const tick = (time: number) => {
    frame = 0;
    if (!target) return;

    const dt = Math.min(Math.max(time - last, 0), MAX_FRAME_MS);
    last = time;

    const step = stepZoomToward(getViewport(), target, dt, tauMs);
    setViewport(step.viewport);

    if (step.done) {
      target = null;
      return;
    }
    frame = requestFrame(tick);
  };

  return {
    zoomAt(anchor: Point, factor: number): void {
      const current = getViewport();
      target = {
        zoom: clampZoom((target?.zoom ?? current.zoom) * factor),
        anchor,
        world: screenToWorld(anchor, current),
      };
      if (!frame) {
        last = now();
        frame = requestFrame(tick);
      }
    },

    stop(): void {
      if (frame) cancelFrame(frame);
      frame = 0;
      target = null;
    },
  };
}
