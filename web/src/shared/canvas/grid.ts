import type { Viewport } from "./viewport";

const GRID_SIZE = 20;
const MAJOR_GRID_MULTIPLIER = 5;

const GRID_COLOR = "rgba(0, 0, 0, 0.06)";
const MAJOR_GRID_COLOR = "rgba(0, 0, 0, 0.1)";

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
): void {
  const { offsetX, offsetY, zoom } = viewport;

  const cellSize = GRID_SIZE * zoom;
  const majorCellSize = cellSize * MAJOR_GRID_MULTIPLIER;

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.save();

  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;

  const startX = ((offsetX % cellSize) + cellSize) % cellSize;
  const startY = ((offsetY % cellSize) + cellSize) % cellSize;

  ctx.beginPath();

  for (let x = startX; x <= width; x += cellSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let y = startY; y <= height; y += cellSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();

  ctx.strokeStyle = MAJOR_GRID_COLOR;

  const majorStartX =
    ((offsetX % majorCellSize) + majorCellSize) % majorCellSize;

  const majorStartY =
    ((offsetY % majorCellSize) + majorCellSize) % majorCellSize;

  ctx.beginPath();

  for (let x = majorStartX; x <= width; x += majorCellSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let y = majorStartY; y <= height; y += majorCellSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();

  ctx.restore();
}