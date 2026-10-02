import type { Scene } from "@/entities/scene/model/types";

export function renderScene(ctx: CanvasRenderingContext2D, scene: Scene): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const element of scene.elements) {
    switch (element.type) {
      case "rectangle":
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        break;

      case "ellipse":
        ctx.beginPath();

        ctx.ellipse(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width / 2,
          element.height / 2,
          0,
          0,
          Math.PI * 2,
        );

        ctx.stroke();
        break;
    }
  }
}
