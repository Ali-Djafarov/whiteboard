import { useCallback, useRef } from "react";
import { Canvas } from "@/shared/canvas/Canvas";
import type { Scene } from "@/entities/scene/model/types";
import { renderScene } from "@/entities/scene/lib/renderScene";
import { usePanZoom, useViewportStore } from "@/features/pan-zoom";

const scene: Scene = {
  elements: [
    {
      id: "rect-1",
      type: "rectangle",
      x: 100,
      y: 100,
      width: 200,
      height: 100,
    },
    {
      id: "ellipse-1",
      type: "ellipse",
      x: 400,
      y: 100,
      width: 150,
      height: 100,
    },
    {
      id: "rect-neg",
      type: "rectangle",
      x: 300,
      y: 350,
      width: -150,
      height: -80,
    },
    {
      id: "ellipse-neg",
      type: "ellipse",
      x: 600,
      y: 350,
      width: -120,
      height: -90,
    },
    { id: "circle", type: "ellipse", x: 100, y: 400, width: 100, height: 100 },
    { id: "thin", type: "rectangle", x: 450, y: 250, width: 200, height: 4 },
  ],
};

export function BoardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewport = useViewportStore((s) => s.viewport);
  usePanZoom(containerRef);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => renderScene(ctx, scene, viewport),
    [viewport],
  );
  return (
    <div ref={containerRef} style={{ height: "100%", touchAction: "none" }}>
      <Canvas draw={draw} />
    </div>
  );
}
