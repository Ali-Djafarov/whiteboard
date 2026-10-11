import { describe, expect, it } from "vitest";
import { createTouchTracker } from "./touchTracker";

const p = (x: number, y: number) => ({ x, y });

describe("touchTracker", () => {
  it("does not lock on a single finger", () => {
    const t = createTouchTracker();
    expect(t.down(1, p(0, 0), true)).toBe(false);
    expect(t.move(1, p(10, 10))).toBeNull();
    expect(t.up(1)).toBe(false);
  });

  it("locks when the second finger lands", () => {
    const t = createTouchTracker();
    t.down(1, p(0, 0), true);

    expect(t.down(2, p(100, 0), false)).toBe(true);
    expect(t.isLocked).toBe(true);
    expect(t.isPinching).toBe(true);
  });

  it("reports the zoom factor and the movement of the center", () => {
    const t = createTouchTracker();
    t.down(1, p(0, 0), true);
    t.down(2, p(100, 0), false);

    expect(t.move(2, p(200, 0))).toEqual({
      from: p(50, 0),
      to: p(100, 0),
      factor: 2,
    });
  });

  it("reports a pure pan when both fingers move by the same amount", () => {
    const t = createTouchTracker();
    t.down(1, p(0, 0), true);
    t.down(2, p(100, 0), false);

    const first = t.move(1, p(10, 0));
    const second = t.move(2, p(110, 0));

    expect(first && second && first.factor * second.factor).toBeCloseTo(1, 10);
    expect(second?.to).toEqual(p(60, 0));
  });

  it("keeps swallowing the remaining finger after one lifts", () => {
    const t = createTouchTracker();
    t.down(1, p(0, 0), true);
    t.down(2, p(100, 0), false);

    expect(t.up(1)).toBe(true);
    expect(t.isLocked).toBe(true);
    expect(t.move(2, p(120, 0))).toBeNull();
    expect(t.up(2)).toBe(true);
    expect(t.isLocked).toBe(false);
  });

  it("starts a fresh gesture on the next primary touch", () => {
    const t = createTouchTracker();
    t.down(1, p(0, 0), true);
    t.down(2, p(100, 0), false);
    t.up(1);
    t.up(2);

    expect(t.down(3, p(0, 0), true)).toBe(false);
  });

  it("recovers when pointerup events were lost", () => {
    const t = createTouchTracker();
    t.down(1, p(0, 0), true);
    t.down(2, p(100, 0), false);

    expect(t.down(9, p(5, 5), true)).toBe(false);
    expect(t.isLocked).toBe(false);
  });

  it("re-measures when one of three fingers lifts, so the view does not jump", () => {
    const t = createTouchTracker();
    t.down(1, p(0, 0), true);
    t.down(2, p(100, 0), false);
    t.down(3, p(200, 0), false);
    t.up(1);

    const step = t.move(2, p(100, 0));

    expect(step?.factor).toBe(1);
    expect(step?.from).toEqual(step?.to);
  });

  it("ignores a third finger for the measurement", () => {
    const t = createTouchTracker();
    t.down(1, p(0, 0), true);
    t.down(2, p(100, 0), false);
    t.down(3, p(500, 500), false);

    expect(t.move(3, p(900, 900))?.factor).toBe(1);
  });

  it("returns no step while the fingers touch the same point", () => {
    const t = createTouchTracker();
    t.down(1, p(5, 5), true);
    t.down(2, p(5, 5), false);

    expect(t.move(2, p(5, 5))).toBeNull();
    expect(t.move(2, p(5, 15))).toBeNull(); // это измерение становится новой точкой отсчёта
    expect(t.move(2, p(5, 25))?.factor).toBeCloseTo(2, 10);
  });
});
