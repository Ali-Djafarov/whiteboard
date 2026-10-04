import type { Rect, Viewport } from "@/shared/canvas";
import type { Scene } from "../model/types";
import type { NewElement } from "../model/sceneDoc";
import { drawElement } from "./drawElement";
import { drawMarquee, drawSelection } from "./drawSelection";

export type RenderOverlay = {
  draft?: NewElement | null;
  selectedIds?: readonly string[];
  marquee?: Rect | null;
};

export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  viewport: Viewport,
  overlay: RenderOverlay = {},
): void {
  const { draft, selectedIds, marquee } = overlay;

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

  if (selectedIds && selectedIds.length > 0) {
    const selected = new Set(selectedIds);
    drawSelection(
      ctx,
      scene.elements.filter((e) => selected.has(e.id)),
      viewport.zoom,
    );
  }

  if (marquee) drawMarquee(ctx, marquee, viewport.zoom);

  ctx.restore();
}
