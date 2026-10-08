import { worldToScreen, type Viewport } from "@/shared/canvas";
import styles from "./CollaborationOverlay.module.css";
import { useCollaborationStore } from "../model/collaborationStore";
import { MousePointer2 } from "lucide-react";

export function CollaborationOverlay({ viewport }: { viewport: Viewport }) {
  const cursors = useCollaborationStore((state) => state.cursors);

  return (
    <div className={styles.root} aria-hidden="true">
      {cursors.map((cursor) => {
        const point = worldToScreen(cursor.point, viewport);

        return (
          <div
            key={cursor.clientId}
            className={styles.cursor}
            style={{ transform: `translate3d(${point.x}px, ${point.y}px, 0)` }}
          >
            <MousePointer2
              className={styles.pointer}
              size={18}
              strokeWidth={2}
              color={cursor.color}
              fill={cursor.color}
            />

            <span
              className={styles.label}
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
