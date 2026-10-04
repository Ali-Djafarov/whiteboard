import { beforeEach, describe, expect, it, vi } from "vitest";
import { useToolStore } from "../model/toolStore";
import { createShapeTool } from "./shapeTool";

const at = (x: number, y: number, zoom = 1) => ({
  point: { x, y },
  zoom,
  shiftKey: false,
});

describe("shapeTool", () => {
  const add = vi.fn();

  beforeEach(() => {
    add.mockClear();
    useToolStore.setState({ draft: null });
  });

  it("shows a draft while dragging and commits it on release", () => {
    const tool = createShapeTool("rectangle", add);

    expect(tool.onPointerDown(at(10, 10))).toBe(true);
    tool.onPointerMove(at(110, 60));
    expect(useToolStore.getState().draft).toMatchObject({
      type: "rectangle",
      x: 10,
      y: 10,
      width: 100,
      height: 50,
    });

    tool.onPointerUp(at(110, 60));
    expect(useToolStore.getState().draft).toBeNull();
    expect(add).toHaveBeenCalledWith({
      type: "rectangle",
      x: 10,
      y: 10,
      width: 100,
      height: 50,
    });
  });

  it("commits a normalized shape when dragged up and to the left", () => {
    const tool = createShapeTool("rectangle", add);

    tool.onPointerDown(at(110, 60));
    tool.onPointerUp(at(10, 10));

    expect(add).toHaveBeenCalledWith({
      type: "rectangle",
      x: 10,
      y: 10,
      width: 100,
      height: 50,
    });
  });

  it("creates ellipses with the ellipse tool", () => {
    const tool = createShapeTool("ellipse", add);

    tool.onPointerDown(at(0, 0));
    tool.onPointerUp(at(40, 20));

    expect(add).toHaveBeenCalledWith({
      type: "ellipse",
      x: 0,
      y: 0,
      width: 40,
      height: 20,
    });
  });

  it("ignores a click without dragging", () => {
    const tool = createShapeTool("rectangle", add);

    tool.onPointerDown(at(10, 10));
    tool.onPointerUp(at(11, 11));

    expect(add).not.toHaveBeenCalled();
  });

  it("measures the minimum size in screen pixels", () => {
    const tool = createShapeTool("rectangle", add);

    tool.onPointerDown(at(10, 10, 8));
    tool.onPointerUp(at(11, 11, 8)); // 1 единица мира * 8 = 8 пикселей

    expect(add).toHaveBeenCalledTimes(1);
  });

  it("cancel drops the draft and the following release commits nothing", () => {
    const tool = createShapeTool("rectangle", add);

    tool.onPointerDown(at(10, 10));
    tool.cancel();
    tool.onPointerUp(at(200, 200));

    expect(useToolStore.getState().draft).toBeNull();
    expect(add).not.toHaveBeenCalled();
  });

  it("ignores movement while idle", () => {
    const tool = createShapeTool("rectangle", add);

    tool.onPointerMove(at(50, 50));

    expect(useToolStore.getState().draft).toBeNull();
  });
});
