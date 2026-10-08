import { Minus, Plus } from "lucide-react";

import { useViewportStore } from "../model/viewportStore";

import styles from "./ZoomControl.module.css";

const ZOOM_FACTOR = 1.2;

function getViewportCenter(): { x: number; y: number } {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

export function ZoomControl() {
  const viewport = useViewportStore((state) => state.viewport);
  const zoomAt = useViewportStore((state) => state.zoomAt);

  const zoomPercent = Math.round(viewport.zoom * 100);

  const zoomIn = () => {
    zoomAt(getViewportCenter(), ZOOM_FACTOR);
  };

  const zoomOut = () => {
    zoomAt(getViewportCenter(), 1 / ZOOM_FACTOR);
  };

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.button}
        onClick={zoomOut}
        aria-label="Zoom out"
      >
        <Minus size={16} />
      </button>

      <span className={styles.value}>{zoomPercent}%</span>

      <button
        type="button"
        className={styles.button}
        onClick={zoomIn}
        aria-label="Zoom in"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
