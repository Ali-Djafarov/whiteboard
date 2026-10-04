import { beforeEach, describe, expect, it } from "vitest";
import type { Scene } from "@/entities/scene";
import { useToolStore } from "../model/toolStore";
import { createSelectTool } from "./selectTool";

const scene: Scene = {
  elements: [
    { id: "a", z: 1, type: "rectangle", x: 0, y: 0, width: 100, height: 50 },
    { id: "b", z: 2, type: "rectangle", x: 200, y: 0, width: 100, height: 50 },
  ],
};

const at = (x: number, y: number, shiftKey = false, zoom = 1) => ({
  point: { x, y },
  zoom,
  shiftKey,
});

const selected = () => useToolStore.getState().selectedIds;

describe("selectTool", () => {
  beforeEach(() => {
    useToolStore.setState({ selectedIds: [], marquee: null });
  });

  it("selects the element under the cursor and replaces the previous selection", () => {
    const tool = createSelectTool(() => scene);

    tool.onPointerDown(at(50, 0));
    tool.onPointerUp(at(50, 0));
    expect(selected()).toEqual(["a"]);

    tool.onPointerDown(at(250, 0));
    tool.onPointerUp(at(250, 0));
    expect(selected()).toEqual(["b"]);
  });

  it("toggles elements with shift", () => {
    const tool = createSelectTool(() => scene);

    tool.onPointerDown(at(50, 0));
    tool.onPointerUp(at(50, 0));
    tool.onPointerDown(at(250, 0, true));
    tool.onPointerUp(at(250, 0, true));
    expect(selected()).toEqual(["a", "b"]);

    tool.onPointerDown(at(50, 0, true));
    tool.onPointerUp(at(50, 0, true));
    expect(selected()).toEqual(["b"]);
  });

  it("clears the selection when clicking empty space", () => {
    const tool = createSelectTool(() => scene);
    useToolStore.setState({ selectedIds: ["a"] });

    tool.onPointerDown(at(500, 500));
    tool.onPointerUp(at(500, 500));

    expect(selected()).toEqual([]);
  });

  it("selects fully enclosed elements with a marquee and clears the overlay on release", () => {
    const tool = createSelectTool(() => scene);

    tool.onPointerDown(at(-10, -10));
    tool.onPointerMove(at(110, 60));
    expect(selected()).toEqual(["a"]);
    expect(useToolStore.getState().marquee).not.toBeNull();

    tool.onPointerUp(at(110, 60));
    expect(useToolStore.getState().marquee).toBeNull();
    expect(selected()).toEqual(["a"]);
  });

  it("does not select partially covered elements", () => {
    const tool = createSelectTool(() => scene);

    tool.onPointerDown(at(-10, -10));
    tool.onPointerMove(at(50, 60));

    expect(selected()).toEqual([]);
  });

  it("keeps the previous selection when the marquee starts with shift", () => {
    const tool = createSelectTool(() => scene);
    useToolStore.setState({ selectedIds: ["b"] });

    tool.onPointerDown(at(-10, -10, true));
    tool.onPointerMove(at(110, 60, true));

    expect(selected()).toEqual(["b", "a"]);
  });

  it("cancel restores the selection from before the marquee", () => {
    const tool = createSelectTool(() => scene);
    useToolStore.setState({ selectedIds: ["b"] });

    tool.onPointerDown(at(-10, -10, true));
    tool.onPointerMove(at(110, 60, true));

    expect(tool.cancel()).toBe(true);
    expect(selected()).toEqual(["b"]);
    expect(useToolStore.getState().marquee).toBeNull();
  });

  it("cancel reports false when nothing is in progress", () => {
    expect(createSelectTool(() => scene).cancel()).toBe(false);
  });
});
