import { describe, expect, it } from "vitest";
import type { Scene, SceneElement } from "../model/types";
import { getBounds } from "./bounds";
import {  hitTestElement, hitTestScene } from "./hitTest";

const TOL = 6;
const rect = (id: string, z: number, x = 0): SceneElement => ({
  id,
  z,
  type: "rectangle",
  x,
  y: 0,
  width: 100,
  height: 50,
});

describe("hitTestElement", () => {
  it("hits a rectangle outline but not its interior", () => {
    const r = rect("r", 1);
    expect(hitTestElement(r, { x: 50, y: 0 }, TOL)).toBe(true);
    expect(hitTestElement(r, { x: 50, y: -4 }, TOL)).toBe(true);
    expect(hitTestElement(r, { x: 50, y: 25 }, TOL)).toBe(false);
    expect(hitTestElement(r, { x: 50, y: -20 }, TOL)).toBe(false);
  });

  it("hits a thin rectangle anywhere along it", () => {
    const thin: SceneElement = {
      id: "t",
      z: 1,
      type: "rectangle",
      x: 0,
      y: 0,
      width: 200,
      height: 4,
    };
    expect(hitTestElement(thin, { x: 100, y: 2 }, TOL)).toBe(true);
  });

  it("hits an ellipse outline but not its center", () => {
    const e: SceneElement = {
      id: "e",
      z: 1,
      type: "ellipse",
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    };
    expect(hitTestElement(e, { x: 100, y: 25 }, TOL)).toBe(true);
    expect(hitTestElement(e, { x: 50, y: 25 }, TOL)).toBe(false);
  });

  it("hits an arrow near the line and not beyond its ends", () => {
    const a: SceneElement = {
      id: "a",
      z: 1,
      type: "arrow",
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 },
    };
    expect(hitTestElement(a, { x: 50, y: 4 }, TOL)).toBe(true);
    expect(hitTestElement(a, { x: 50, y: 10 }, TOL)).toBe(false);
    expect(hitTestElement(a, { x: 120, y: 0 }, TOL)).toBe(false);
  });

  it("hits a free-draw stroke using absolute point positions", () => {
    const s: SceneElement = {
      id: "s",
      z: 1,
      type: "free-draw",
      x: 10,
      y: 10,
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
      ],
    };
    expect(hitTestElement(s, { x: 30, y: 12 }, TOL)).toBe(true);
    expect(hitTestElement(s, { x: 30, y: 30 }, TOL)).toBe(false);
  });
});

describe("hitTestScene", () => {
  it("returns the topmost element", () => {
    const scene: Scene = { elements: [rect("below", 1), rect("above", 2)] };
    expect(hitTestScene(scene, { x: 50, y: 0 }, TOL)?.id).toBe("above");
  });

  it("returns null when nothing is hit", () => {
    const scene: Scene = { elements: [rect("a", 1)] };
    expect(hitTestScene(scene, { x: 500, y: 500 }, TOL)).toBeNull();
  });
});


describe("getBounds", () => {
  it("normalizes a rectangle with negative size", () => {
    const r: SceneElement = {
      id: "r",
      z: 1,
      type: "rectangle",
      x: 100,
      y: 50,
      width: -40,
      height: -20,
    };
    expect(getBounds(r)).toEqual({ x: 60, y: 30, width: 40, height: 20 });
  });

  it("handles a reversed arrow", () => {
    const a: SceneElement = {
      id: "a",
      z: 1,
      type: "arrow",
      start: { x: 50, y: 40 },
      end: { x: 10, y: 10 },
    };
    expect(getBounds(a)).toEqual({ x: 10, y: 10, width: 40, height: 30 });
  });

  it("offsets free-draw points by the element position", () => {
    const s: SceneElement = {
      id: "s",
      z: 1,
      type: "free-draw",
      x: 10,
      y: 20,
      points: [
        { x: 0, y: 0 },
        { x: 30, y: 10 },
      ],
    };
    expect(getBounds(s)).toEqual({ x: 10, y: 20, width: 30, height: 10 });
  });
});
