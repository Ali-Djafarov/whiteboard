import type { Viewport } from "@/shared/canvas/viewport";
import type { Scene } from "../model/types";
import { drawElement } from "./drawElement";

export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  viewport: Viewport,
): void {
  ctx.save();
  ctx.translate(viewport.offsetX, viewport.offsetY);
  ctx.scale(viewport.zoom, viewport.zoom);
  for (const element of scene.elements) drawElement(ctx, element);
  ctx.restore();
}
