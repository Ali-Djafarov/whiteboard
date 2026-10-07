import { drawGrid, type Rect, type Viewport } from "@/shared/canvas";
import type { Scene } from "../model/types";
import type { ElementPatch, NewElement } from "../model/sceneDoc";
import { drawElement } from "./drawElement";
import {
  drawArrowHandles,
  drawHandles,
  drawMarquee,
  drawSelection,
} from "./drawSelection";
import { applyPatch } from "./patch";
import { getSelectionBounds } from "./bounds";

export type RenderOverlay = {
  draft?: NewElement | null;
  selectedIds?: readonly string[];
  marquee?: Rect | null;
  preview?: Readonly<Record<string, ElementPatch>>;
  isGridVisible?: boolean;
  hiddenId?: string | null;
};

export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  viewport: Viewport,
  overlay: RenderOverlay = {},
): void {
  const {
    draft,
    selectedIds,
    marquee,
    preview,
    hiddenId,
    isGridVisible = true,
  } = overlay;
  const elements =
    preview && Object.keys(preview).length > 0
      ? scene.elements.map((element) => {
          const patch = preview[element.id];
          return patch ? applyPatch(element, patch) : element;
        })
      : scene.elements;

  const visible = hiddenId
    ? elements.filter((element) => element.id !== hiddenId)
    : elements;

  ctx.save();

  if (isGridVisible) drawGrid(ctx, viewport);

  ctx.translate(viewport.offsetX, viewport.offsetY);
  ctx.scale(viewport.zoom, viewport.zoom);

  for (const element of visible) drawElement(ctx, element);

  if (draft) {
    ctx.save();
    ctx.setLineDash([6 / viewport.zoom, 4 / viewport.zoom]);
    drawElement(ctx, draft);
    ctx.restore();
  }

  if (selectedIds && selectedIds.length > 0) {
    const selected = new Set(selectedIds);
    const selectedElements = elements.filter((element) =>
      selected.has(element.id),
    );
    const [only] = selectedElements;

    if (selectedElements.length === 1 && only?.type === "arrow") {
      drawArrowHandles(ctx, only, viewport.zoom);
    } else {
      drawSelection(ctx, selectedElements, viewport.zoom);
      const groupBounds = getSelectionBounds(selectedElements);
      if (groupBounds) drawHandles(ctx, groupBounds, viewport.zoom);
    }
  }

  if (marquee) drawMarquee(ctx, marquee, viewport.zoom);

  ctx.restore();
}
