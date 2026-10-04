import type { Viewport } from "@/shared/canvas";
import type { Scene } from "../model/types";
import type { NewElement } from "../model/sceneDoc";
import { drawElement } from "./drawElement";

export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  viewport: Viewport,
  draft?: NewElement | null,
): void {
  ctx.save();
  ctx.translate(viewport.offsetX, viewport.offsetY);
  ctx.scale(viewport.zoom, viewport.zoom);
  for (const element of scene.elements) drawElement(ctx, element);
  if (draft) {
    ctx.save();
    ctx.setLineDash([6 / viewport.zoom, 4 / viewport.zoom]);
    drawElement(ctx, draft);
    ctx.restore();
  }
  ctx.restore();
}