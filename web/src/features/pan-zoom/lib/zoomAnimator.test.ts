import { describe, expect, it } from "vitest";
import { MAX_ZOOM, type Viewport } from "@/shared/canvas";
import { createZoomAnimator } from "./zoomAnimator";

function setup() {
  let viewport: Viewport = { offsetX: 0, offsetY: 0, zoom: 1 };
  const callbacks = new Map<number, (time: number) => void>();
  let nextId = 1;
  let time = 0;

  const animator = createZoomAnimator({
    getViewport: () => viewport,
    setViewport: (next) => {
      viewport = next;
    },
    requestFrame: (callback) => {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    },
    cancelFrame: (id) => {
      callbacks.delete(id);
    },
    now: () => time,
    tauMs: 90,
  });

  const frame = (dt = 16) => {
    time += dt;
    const pending = [...callbacks.values()];
    callbacks.clear();
    for (const callback of pending) callback(time);
  };

  const runToEnd = () => {
    for (let i = 0; i < 500 && callbacks.size > 0; i++) frame();
  };

  return {
    animator,
    frame,
    runToEnd,
    pending: () => callbacks.size,
    zoom: () => viewport.zoom,
  };
}

const anchor = { x: 100, y: 100 };

describe("zoomAnimator", () => {
  it("does not change the viewport synchronously", () => {
    const { animator, pending, zoom } = setup();

    animator.zoomAt(anchor, 2);

    expect(zoom()).toBe(1);
    expect(pending()).toBe(1);
  });

  it("animates to the target and then stops scheduling frames", () => {
    const { animator, frame, runToEnd, pending, zoom } = setup();

    animator.zoomAt(anchor, 2);
    frame();
    expect(zoom()).toBeGreaterThan(1);
    expect(zoom()).toBeLessThan(2);

    runToEnd();
    expect(zoom()).toBe(2);
    expect(pending()).toBe(0);
  });

  it("accumulates repeated zooms into one target", () => {
    const { animator, runToEnd, zoom } = setup();

    animator.zoomAt(anchor, 2);
    animator.zoomAt(anchor, 2);
    runToEnd();

    expect(zoom()).toBe(4);
  });

  it("stop cancels the animation and keeps the current viewport", () => {
    const { animator, frame, pending, zoom } = setup();

    animator.zoomAt(anchor, 2);
    frame();
    const stopped = zoom();
    animator.stop();
    frame();

    expect(pending()).toBe(0);
    expect(zoom()).toBe(stopped);
  });

  it("never goes past the maximum zoom", () => {
    const { animator, runToEnd, zoom } = setup();

    animator.zoomAt(anchor, 1000);
    runToEnd();

    expect(zoom()).toBe(MAX_ZOOM);
  });
});
