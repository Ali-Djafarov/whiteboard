import { useEffect, useRef } from "react";


type Size = { width: number; height: number };
type CanvasProps = {
  draw: (ctx: CanvasRenderingContext2D, size: Size) => void;
};

export function Canvas({ draw }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  const sizeRef = useRef<Size>({ width: 0, height: 0 });
  const frameRef = useRef(0);
  const scheduleRef = useRef<() => void>(() => {});

  useEffect(() => {
    drawRef.current = draw;
    scheduleRef.current();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const render = () => {
      frameRef.current = 0;
      const { width, height } = sizeRef.current;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawRef.current(ctx, { width, height });
    };

    scheduleRef.current = () => {
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      sizeRef.current = { width, height };
      scheduleRef.current();
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
