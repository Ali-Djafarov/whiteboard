import { useEffect, useRef } from "react";

import { renderScene } from "./render";

import type { Scene } from "@/entities/scene/model/types";

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
  ],
};

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    renderScene(ctx, scene);
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
}