import { describe, expect, it } from "vitest";
import {
  MAX_ZOOM,
  pinchTo,
  screenToWorld,
  worldToScreen,
  type Viewport,
} from "./viewport";

describe("pinchTo", () => {
  const viewport: Viewport = { offsetX: 30, offsetY: -10, zoom: 1.5 };
  const from = { x: 200, y: 150 };
  const to = { x: 260, y: 120 };

  it("puts the world point from under the old center under the new one", () => {
    const world = screenToWorld(from, viewport);
    const next = pinchTo(viewport, from, to, 2);
    const after = worldToScreen(world, next);

    expect(next.zoom).toBeCloseTo(3, 6);
    expect(after.x).toBeCloseTo(to.x, 6);
    expect(after.y).toBeCloseTo(to.y, 6);
  });

  it("is a pure pan when the factor is 1", () => {
    const next = pinchTo(viewport, from, to, 1);

    expect(next.zoom).toBe(1.5);
    expect(next.offsetX).toBeCloseTo(viewport.offsetX + 60, 6);
    expect(next.offsetY).toBeCloseTo(viewport.offsetY - 30, 6);
  });

  it("clamps the zoom but keeps the anchor in place", () => {
    const world = screenToWorld(from, viewport);
    const next = pinchTo(viewport, from, to, 1e6);
    const after = worldToScreen(world, next);

    expect(next.zoom).toBe(MAX_ZOOM);
    expect(after.x).toBeCloseTo(to.x, 6);
  });
});
