import { useCallback, useRef } from "react";
import { Canvas } from "@/shared/canvas/Canvas";
import { renderScene } from "@/entities/scene/lib/renderScene";
import { usePanZoom, useViewportStore } from "@/features/pan-zoom";
import { sceneApi, useSceneStore } from "@/entities/scene";
import { screenToWorld } from "@/shared/canvas/viewport";
import { getLocalPoint } from "@/shared/canvas/pointer";

export function BoardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewport = useViewportStore((s) => s.viewport);
  const scene = useSceneStore((s) => s.scene);
  const pan = usePanZoom(containerRef);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => renderScene(ctx, scene, viewport),
    [scene, viewport],
  );

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const world = screenToWorld(
      getLocalPoint(e, el),
      useViewportStore.getState().viewport,
    );
    sceneApi.add({
      type: "rectangle",
      x: world.x - 50,
      y: world.y - 30,
      width: 100,
      height: 60,
    });
  };

  return (
    <div
      ref={containerRef}
      {...pan}
      onDoubleClick={onDoubleClick}
      style={{ height: "100%", touchAction: "none" }}
    >
      <Canvas draw={draw} />
    </div>
  );
}
