import type { Point } from "./geometry";

export function getLocalPoint(
  e: { clientX: number; clientY: number },
  el: HTMLElement,
): Point {
  const rect = el.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}