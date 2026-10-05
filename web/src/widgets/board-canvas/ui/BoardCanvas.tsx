import { useCallback, useRef } from "react";
import { Canvas } from "@/shared/canvas";
import { renderScene } from "@/entities/scene/lib/renderScene";
import { usePanZoom, useViewportStore } from "@/features/pan-zoom";
import { useSceneStore } from "@/entities/scene";
import styles from "./BoardCanvas.module.css";

import { useToolHotkeys, useToolPointer, useToolStore } from "@/features/tools";
import { useGridStore } from "@/features/grid";

const getViewport = () => useViewportStore.getState().viewport;

export function BoardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewport = useViewportStore((s) => s.viewport);
  const scene = useSceneStore((s) => s.scene);
  const draft = useToolStore((s) => s.draft);
  const activeTool = useToolStore((s) => s.activeTool);
  const selectedIds = useToolStore((s) => s.selectedIds);
  const marquee = useToolStore((s) => s.marquee);
  const isGridVisible = useGridStore((s) => s.isVisible);

  const pan = usePanZoom(containerRef);
  const tool = useToolPointer(containerRef, getViewport);
  useToolHotkeys();

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) =>
      renderScene(
        ctx,
        scene,
        viewport,
        { draft, selectedIds, marquee },
        isGridVisible,
      ),
    [scene, viewport, draft, selectedIds, marquee, isGridVisible],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (!pan.onPointerDown(e)) tool.onPointerDown(e);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!pan.onPointerMove(e)) tool.onPointerMove(e);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!pan.onPointerUp(e)) tool.onPointerUp(e);
  };
  const onPointerCancel = (e: React.PointerEvent<HTMLElement>) => {
    if (!pan.onPointerCancel(e)) tool.onPointerCancel();
  };

  return (
    <div
      ref={containerRef}
      className={[
        styles.root,
        activeTool !== "select" && styles.drawing,
        tool.isMoveTarget && styles.move,
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <Canvas draw={draw} />
    </div>
  );
}
