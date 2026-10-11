import type { Point } from "@/shared/canvas";

type Pinch = { center: Point; distance: number };

export type PinchStep = { from: Point; to: Point; factor: number };

const measure = (a: Point, b: Point): Pinch => ({
  center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
  distance: Math.hypot(a.x - b.x, a.y - b.y),
});

export function createTouchTracker() {
  const pointers = new Map<number, Point>();
  let pinch: Pinch | null = null;
  let locked = false;

  const readPinch = (): Pinch | null => {
    const [a, b] = pointers.values();
    return a && b ? measure(a, b) : null;
  };

  return {
    down(id: number, point: Point, isPrimary: boolean): boolean {
      if (isPrimary) {
        pointers.clear();
        pinch = null;
        locked = false;
      }
      pointers.set(id, point);
      if (pointers.size >= 2) {
        locked = true;
        pinch = readPinch();
      }
      return locked;
    },

    move(id: number, point: Point): PinchStep | null {
      if (!pointers.has(id)) return null;
      pointers.set(id, point);
      if (!pinch) return null;

      const next = readPinch();
      if (!next) return null;

      const previous = pinch;
      pinch = next;
      if (previous.distance === 0 || next.distance === 0) return null;

      return {
        from: previous.center,
        to: next.center,
        factor: next.distance / previous.distance,
      };
    },

    up(id: number): boolean {
      const wasLocked = locked;
      if (pointers.delete(id)) {
        pinch = readPinch();
        if (pointers.size === 0) locked = false;
      }
      return wasLocked;
    },

    get isLocked(): boolean {
      return locked;
    },

    get isPinching(): boolean {
      return pinch !== null;
    },

    reset(): void {
      pointers.clear();
      pinch = null;
      locked = false;
    },
  };
}
