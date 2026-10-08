import { BoardCanvas } from "@/widgets/board-canvas";
import { ControlsHint } from "@/widgets/control-hint";
import { Toolbar } from "@/widgets/toolbar";
import styles from "./BoardPage.module.css";
import { useCollaboration } from "@/features/collaboration";
import { sceneApi } from "@/entities/scene";
import { ZoomControl } from "@/features/pan-zoom/ui/ZoomControl";

export function BoardPage() {
  useCollaboration(sceneApi.doc);
  return (
    <div className={styles.root}>
      <BoardCanvas />
      <ZoomControl />
      <Toolbar />
      <ControlsHint />
    </div>
  );
}
