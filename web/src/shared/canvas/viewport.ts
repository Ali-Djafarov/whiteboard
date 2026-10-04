import type { Point } from "./geometry";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;
const ZOOM_EPSILON = 0.001;

export type ZoomTarget = {
  zoom: number;
  anchor: Point;
  world: Point;
};

export type Viewport = {
  offsetX: number;
  offsetY: number;
  zoom: number;
};

export function stepZoomToward(
  viewport: Viewport,
  target: ZoomTarget,
  dtMs: number,
  tauMs: number,
): { viewport: Viewport; done: boolean } {
  const ratio = target.zoom / viewport.zoom;
  const done = Math.abs(Math.log(ratio)) < ZOOM_EPSILON;
  const k = 1 - Math.exp(-dtMs / tauMs);
  const zoom = done ? target.zoom : viewport.zoom * Math.pow(ratio, k);

  return {
    viewport: {
      zoom,
      offsetX: target.anchor.x - target.world.x * zoom,
      offsetY: target.anchor.y - target.world.y * zoom,
    },
    done,
  };
}

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function panBy(viewport: Viewport, dx: number, dy: number): Viewport {
  return {
    ...viewport,
    offsetX: viewport.offsetX + dx,
    offsetY: viewport.offsetY + dy,
  };
}

export function zoomAt(
  viewport: Viewport,
  screenPoint: Point,
  factor: number,
): Viewport {
  const zoom = clampZoom(viewport.zoom * factor);
  const world = screenToWorld(screenPoint, viewport);
  return {
    zoom,
    offsetX: screenPoint.x - world.x * zoom,
    offsetY: screenPoint.y - world.y * zoom,
  };
}

export function screenToWorld(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.offsetX) / viewport.zoom,
    y: (point.y - viewport.offsetY) / viewport.zoom,
  };
}

export function worldToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: point.x * viewport.zoom + viewport.offsetX,
    y: point.y * viewport.zoom + viewport.offsetY,
  };
}
